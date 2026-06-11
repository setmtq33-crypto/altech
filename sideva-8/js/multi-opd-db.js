// SI-DEVA — Multi-OPD Database Layer v8.1
window._currentOpdId = null;
window._userOpdList = [];
window._currentOpdName = null;
const _origDbGetAll = window.dbGetAll;
const _origDbPut = window.dbPut;

async function loadUserOpdAccess() {
  if (!_session?.user?.id) return false;
  if (isSuperAdmin()) {
    const allOpds = await _origDbGetAll('opd');
    window._userOpdList = allOpds.map(o => ({ id: o.id, namaOpd: o.namaOpd }));
  } else {
    const namaOpd = window._userOpdName;
    if (namaOpd) {
      window._userOpdList = [{ id: 'single', namaOpd: namaOpd }];
      window._currentOpdName = namaOpd;
    }
  }
  return true;
}

window.dbGetAll = async function(store) {
  const tbl = TABLE_MAP[store] || store;
  const fmap = FIELD_MAP[store];
  const opdTables = ['paket','rincian','harga','penyedia','bidang','rekening','ppk','pejabatPengadaan','ecatalog'];
  let query = `/rest/v1/${tbl}?select=*&order=id.asc`;
  if (opdTables.includes(store) &&!isSuperAdmin() && window._userOpdName) {
    query += `&opd=eq.${encodeURIComponent(window._userOpdName)}`;
  }
  const rows = await sbFetch(query, 'GET');
  return fmap? rows.map(fmap.from) : rows;
};

window.dbPut = async function(store, data) {
  const row = {...data };
  const opdTables = ['paket','rincian','harga','penyedia','bidang','rekening','ppk','pejabatPengadaan','ecatalog'];
  if (opdTables.includes(store) &&!isSuperAdmin() && window._userOpdName) {
    row.opd = window._userOpdName;
  }
  return _origDbPut.call(this, store, row);
};

window.loadAllData = async function() {
  await loadUserOpdAccess();
  const [paket, rincian, harga, penyedia] = await Promise.all([dbGetAll('paket'), dbGetAll('rincian'), dbGetAll('harga'), dbGetAll('penyedia')]);
  if (typeof state!== 'undefined') {
    state.paket.data = paket; state.paket.filtered = [...paket];
    state.rincian.data = rincian; state.rincian.filtered = [...rincian];
  }
};
console.log('✅ Multi-OPD layer loaded');