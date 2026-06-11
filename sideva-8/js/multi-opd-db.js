// ============================================================
//  SI-DEVA — Multi-OPD Database Layer v8
// ============================================================

window._currentOpdId = null;
window._userOpdList = [];
let _opdConfig = {};

const _origDbGetAll = window.dbGetAll;
const _origDbPut = window.dbPut;

// ========== FUNGSI GETTER ==========
function getCurrentOpdId() { return window._currentOpdId; }
function getCurrentOpdName() {
  if (!window._currentOpdId) return 'Semua OPD';
  const opd = window._userOpdList.find(o => o.id === window._currentOpdId);
  return opd?.namaOpd || opd?.nama || window._currentOpdId;
}
function getUserOpdList() { return window._userOpdList; }

// ========== LOAD USER OPD ACCESS ==========
async function loadUserOpdAccess() {
  if (!_session?.user?.id) return false;
  try {
    if (isSuperAdmin()) {
      const allOpds = await _origDbGetAll('opd');
      window._userOpdList = allOpds.map(o => ({ id: o.id, namaOpd: o.namaOpd || o.nama_opd }));
    } else {
      const rows = await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${_session.user.id}&select=opd_id`, 'GET');
      const opdIds = rows?.map(r => r.opd_id) || [];
      if (opdIds.length) {
        const orFilter = opdIds.map(id => `id.eq.${id}`).join(',');
        const opds = await sbFetch(`/rest/v1/opd?or=(${orFilter})&select=id,nama_opd`, 'GET');
        window._userOpdList = (opds || []).map(o => ({ id: o.id, namaOpd: o.nama_opd }));
      } else {
        window._userOpdList = [];
      }
    }
    if (window._userOpdList.length && !window._currentOpdId) {
      const saved = localStorage.getItem('sideva_current_opd_id');
      if (saved && window._userOpdList.find(o => o.id === saved)) window._currentOpdId = saved;
      else window._currentOpdId = window._userOpdList[0].id;
      localStorage.setItem('sideva_current_opd_id', window._currentOpdId);
    }
    return true;
  } catch(err) { console.error(err); return false; }
}

// ========== LOAD OPD CONFIG (harus didefinisikan SEBELUM setCurrentOpd) ==========
async function loadOpdConfig(opdId) {
  try {
    const rows = await sbFetch(`/rest/v1/opd_config?opd_id=eq.${opdId}&select=data`, 'GET');
    const cfg = rows?.[0]?.data || null;
    if (cfg) {
      _opdConfig[opdId] = cfg;
      localStorage.setItem(`sideva_opd_config_${opdId}`, JSON.stringify(cfg));
      // 🔥 Kunci: timpa gambar global dengan gambar OPD
      if (cfg._kopSuratImg) {
        localStorage.setItem('sideva_kop_surat_img', cfg._kopSuratImg);
        console.log('✅ Kop surat dimuat untuk OPD', opdId);
      }
    }
  } catch(err) { console.warn('loadOpdConfig error:', err); }
}

async function saveOpdConfig(opdId, config) {
  if (!isAdmin()) throw new Error('Hanya admin yang bisa mengubah config OPD');
  try {
    const existing = await sbFetch(`/rest/v1/opd_config?opd_id=eq.${opdId}&select=id`, 'GET');
    if (existing && existing.length > 0) {
      await sbFetch(`/rest/v1/opd_config?opd_id=eq.${opdId}`, 'PATCH', { data: config, updated_at: new Date().toISOString() }, { 'Prefer': 'return=minimal' });
    } else {
      await sbFetch('/rest/v1/opd_config', 'POST', { opd_id: opdId, data: config, updated_at: new Date().toISOString() }, { 'Prefer': 'resolution=merge-duplicates,return=minimal' });
    }
    _opdConfig[opdId] = config;
    localStorage.setItem(`sideva_opd_config_${opdId}`, JSON.stringify(config));
    return true;
  } catch(err) { console.error('saveOpdConfig error:', err); throw err; }
}

// ========== SET CURRENT OPD ==========
async function setCurrentOpd(opdId) {
  if (!isSuperAdmin() && !window._userOpdList.find(o => o.id === opdId)) throw new Error('Tidak punya akses ke OPD ini');
  window._currentOpdId = opdId;
  localStorage.setItem('sideva_current_opd_id', opdId);
  await loadOpdConfig(opdId);
  await loadAllDataFiltered();
  
  const opdCfg = _opdConfig[opdId] || {};
  if (typeof appConfig !== 'undefined') {
    appConfig.namaInstansi = getCurrentOpdName();
    if (opdCfg.singkatan) appConfig.singkatan = opdCfg.singkatan;
    if (opdCfg.alamat) appConfig.alamat = opdCfg.alamat;
    if (opdCfg.telepon) appConfig.telepon = opdCfg.telepon;
    if (opdCfg.website) appConfig.website = opdCfg.website;
    localStorage.setItem('sideva_config', JSON.stringify(appConfig));
  }
  
  if (typeof updateSidebarOpdName === 'function') updateSidebarOpdName();
  if (typeof applyAppConfig === 'function') applyAppConfig();
  if (typeof refreshKopPreviewArea === 'function') refreshKopPreviewArea();
  if (typeof _fillPengaturanForm === 'function') _fillPengaturanForm();
  if (typeof renderAll === 'function') renderAll();
  if (typeof renderDashboard === 'function' && window.currentPage === 'dashboard') renderDashboard();
  
  window.dispatchEvent(new CustomEvent('opd-changed', { detail: { opdId, opdName: getCurrentOpdName(), opdList: window._userOpdList } }));
  return true;
}

// ========== OVERRIDE dbGetAll ==========
window.dbGetAll = async function(store) {
  const tbl = TABLE_MAP[store] || store;
  const fmap = FIELD_MAP[store];
  const opdFilteredTables = ['paket','rincian','harga','penyedia','bidang','rekening','ppk','pejabatPengadaan','ecatalog'];
  try {
    let query = `/rest/v1/${tbl}?select=*&order=id.asc`;
    if (opdFilteredTables.includes(store) && window._currentOpdId) {
      query += `&opd_id=eq.${window._currentOpdId}`;
    }
    const rows = await sbFetch(query, 'GET');
    return fmap ? rows.map(fmap.from) : rows;
  } catch(err) {
    console.error(`dbGetAll(${store}) error:`, err);
    return [];
  }
};

// ========== OVERRIDE dbPut ==========
window.dbPut = async function(store, data) {
  const row = { ...data };
  const opdFilteredTables = ['paket','rincian','harga','penyedia','bidang','rekening','ppk','pejabatPengadaan','ecatalog'];
  if (opdFilteredTables.includes(store) && window._currentOpdId) {
    row.opd_id = window._currentOpdId;
  }
  const result = await _origDbPut.call(this, store, row);
  if (store === 'opd') {
    try {
      const freshOpds = await sbFetch('/rest/v1/opd?select=id,nama_opd&order=id.asc', 'GET');
      if (typeof masterState !== 'undefined') masterState.opd = freshOpds.map(o => ({ id: o.id, namaOpd: o.nama_opd, nama: o.nama_opd }));
      if (isSuperAdmin()) {
        window._userOpdList = freshOpds.map(o => ({ id: o.id, namaOpd: o.nama_opd }));
      }
      window.dispatchEvent(new CustomEvent('opd-changed'));
    } catch(e) { console.warn('Refresh OPD list gagal:', e); }
  }
  return result;
};

// ========== LOAD ALL DATA WITH FILTER ==========
async function loadAllDataFiltered() {
  if (!_session) return;
  const [paket, rincian, harga, penyedia, bidang, opd, rekening, ppk, pejabat, ecatalog] = await Promise.all([
    dbGetAll('paket'), dbGetAll('rincian'), dbGetAll('harga'), dbGetAll('penyedia'),
    dbGetAll('bidang'), dbGetAll('opd'), dbGetAll('rekening'), dbGetAll('ppk'),
    dbGetAll('pejabatPengadaan'), dbGetAll('ecatalog')
  ]);
  if (typeof state !== 'undefined') {
    state.paket.data = paket; state.paket.filtered = [...paket];
    state.rincian.data = rincian; state.rincian.filtered = [...rincian];
    state.harga.data = harga; state.harga.filtered = [...harga];
    state.penyedia.data = penyedia; state.penyedia.filtered = [...penyedia];
  }
  if (typeof masterState !== 'undefined') {
    masterState.bidang = bidang; masterState.opd = opd;
    masterState.rekening = rekening; masterState.ppk = ppk;
    masterState.pejabatPengadaan = pejabat; masterState.ecatalog = ecatalog;
  }
  return true;
}

// ========== LOAD ALL DATA (override) ==========
window.loadAllData = async function() {
  await loadUserOpdAccess();
  return loadAllDataFiltered();
};

// ========== GRANT/REVOKE OPD ACCESS ==========
async function grantUserOpdAccess(userId, opdId) {
  if (!isSuperAdmin()) throw new Error('Hanya Super Admin');
  await sbFetch('/rest/v1/user_opd_access', 'POST', { user_id: userId, opd_id: opdId, created_at: new Date().toISOString() }, { 'Prefer': 'resolution=ignore,return=minimal' });
}
async function revokeUserOpdAccess(userId, opdId) {
  if (!isSuperAdmin()) throw new Error('Hanya Super Admin');
  await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}&opd_id=eq.${opdId}`, 'DELETE', null, { 'Prefer': 'count=none' });
}
async function getUserOpdAccessList(userId) {
  if (!isSuperAdmin()) throw new Error('Hanya Super Admin');
  const rows = await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}&select=opd_id`, 'GET');
  const opdIds = rows?.map(r => r.opd_id) || [];
  if (!opdIds.length) return [];
  const orFilter = opdIds.map(id => `id.eq.${id}`).join(',');
  const opds = await sbFetch(`/rest/v1/opd?or=(${orFilter})&select=id,nama_opd`, 'GET');
  return (opds || []).map(opd => ({ id: opd.id, namaOpd: opd.nama_opd }));
}

// ========== INIT ==========
window.addEventListener('sb-ready', async (e) => {
  if (e.detail.loggedIn) {
    await loadUserOpdAccess();
    window.dispatchEvent(new CustomEvent('opd-changed'));
  }
});
console.log('✅ Multi-OPD layer loaded');
