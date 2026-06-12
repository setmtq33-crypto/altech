// ============================================================
//  SI-DEVA — Multi-OPD Admin Management v8 (Final - Gabungan Terbaik)
// ============================================================

async function sbGetAllUsersWithEmail() {
    if (typeof sbFetch === 'undefined') {
        console.error("Fungsi 'sbFetch' tidak ditemukan.");
        return [];
    }

    // Daftar tebakan nama tabel user yang paling sering digunakan di aplikasi Indonesia
    const listTabelUser = ['user', 'akun', 'data_user', 'tb_user', 'user_profile', 'm_user'];

    // Sistem akan otomatis mencoba satu per satu sampai ketemu yang benar
    for (const namaTabel of listTabelUser) {
        try {
            const data = await sbFetch(`/rest/v1/${namaTabel}?select=*`, 'GET');
            
            // Jika berhasil dan mengembalikan data berupa array/list
            if (data && Array.isArray(data)) {
                console.log(`%c[SI-DEVA] Sukses! Tabel user ditemukan: public.${namaTabel}`, "color: #22c55e; font-weight: bold;");
                return data;
            }
        } catch (e) {
            // Jika error 404, sistem otomatis abaikan dan coba nama tabel berikutnya
        }
    }

    console.error("[SI-DEVA] Semua tebakan nama tabel user gagal. Halaman diamankan agar tidak crash.");
    return [];
}



// ========== INJEK CSS ==========
(function injectOpdAdminStyle() {
  if (document.getElementById('multi-opd-admin-style')) return;
  const s = document.createElement('style');
  s.id = 'multi-opd-admin-style';
  s.textContent = `
    #page-opd-management { padding: 20px; }
    .opd-mgmt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .opd-mgmt-title { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .opd-mgmt-section { margin-bottom: 32px; }
    .opd-mgmt-section-title { font-size: 14px; font-weight: 700; color: var(--gold, #c9a84c); margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
    .opd-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .opd-card { background: var(--surface, #1a1a1a); border: 1px solid var(--border, #2a2a2a); border-radius: 12px; padding: 16px; transition: all 0.2s; }
    .opd-card:hover { border-color: var(--gold, #c9a84c); box-shadow: 0 4px 12px rgba(201,168,76,0.1); }
    .opd-card-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--text, #fff); }
    .opd-card-kode { font-size: 12px; color: var(--gold, #c9a84c); font-weight: 600; margin-bottom: 4px; }
    .opd-card-id { font-size: 11px; color: var(--text3, #888); font-family: monospace; margin-bottom: 6px; }
    .opd-card-meta { font-size: 11px; color: var(--text2, #aaa); margin-bottom: 10px; }
    .opd-card-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .opd-status-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-bottom: 8px; }
    .opd-status-aktif { background: rgba(74,222,128,0.15); color: var(--green, #22c55e); }
    .opd-status-nonaktif { background: rgba(148,163,184,0.12); color: var(--text3, #888); }
    .user-opd-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .user-opd-table thead th { background: var(--surface2, #222); padding: 10px; text-align: left; font-weight: 600; border-bottom: 2px solid var(--border, #2a2a2a); font-size: 11px; text-transform: uppercase; color: var(--text3, #888); }
    .user-opd-table tbody td { padding: 10px; border-bottom: 1px solid var(--border, #2a2a2a); }
    .user-opd-table tbody tr:hover { background: var(--surface2, #222); }
    .opd-badge-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .opd-badge-item { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.3); border-radius: 6px; font-size: 11px; color: var(--gold, #c9a84c); }
    .opd-badge-item .remove-btn { cursor: pointer; margin-left: 2px; opacity: 0.6; transition: opacity 0.2s; }
    .opd-badge-item .remove-btn:hover { opacity: 1; }
    .empty-state { text-align: center; padding: 40px 20px; color: var(--text3, #888); }
    .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
    .opd-cfg-modal-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; padding: 16px; }
    .opd-cfg-modal { background: var(--surface, #1a1a1a); border: 1px solid var(--border, #2a2a2a); border-radius: 14px; padding: 0; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
    .opd-cfg-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border, #2a2a2a); position: sticky; top: 0; background: var(--surface, #1a1a1a); z-index: 1; }
    .opd-cfg-modal-title { font-size: 16px; font-weight: 700; }
    .opd-cfg-modal-close { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--border2, #333); background: var(--surface2, #222); color: var(--text2, #aaa); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .opd-cfg-modal-close:hover { background: var(--surface3, #2a2a2a); color: var(--text, #fff); }
    .opd-cfg-modal-body { padding: 20px 24px; }
    .opd-cfg-section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--gold, #c9a84c); margin-bottom: 12px; margin-top: 20px; padding-bottom: 6px; border-bottom: 1px solid var(--border, #2a2a2a); }
    .opd-cfg-section-label:first-child { margin-top: 0; }
    .opd-cfg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 480px) { .opd-cfg-grid-2 { grid-template-columns: 1fr; } }
    .opd-cfg-field { margin-bottom: 12px; }
    .opd-cfg-label { display: block; font-size: 12px; font-weight: 600; color: var(--text2, #aaa); margin-bottom: 5px; }
    .opd-cfg-input, .opd-cfg-textarea, .opd-cfg-select { width: 100%; padding: 8px 11px; border-radius: 7px; border: 1px solid var(--border2, #333); background: var(--surface2, #222); color: var(--text, #fff); font-size: 13px; box-sizing: border-box; }
    .opd-cfg-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border2, #333); background: var(--surface2, #222); }
    .opd-cfg-toggle-label { font-size: 13px; font-weight: 600; }
    .opd-cfg-toggle-desc { font-size: 11px; color: var(--text3, #888); margin-top: 2px; }
    .opd-cfg-toggle { position: relative; width: 42px; height: 24px; cursor: pointer; flex-shrink: 0; }
    .opd-cfg-toggle input { opacity: 0; width: 0; height: 0; }
    .opd-cfg-toggle-slider { position: absolute; inset: 0; background: var(--border2, #333); border-radius: 24px; transition: background 0.2s; }
    .opd-cfg-toggle-slider:before { position: absolute; content: ''; height: 18px; width: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
    .opd-cfg-toggle input:checked + .opd-cfg-toggle-slider { background: var(--green, #22c55e); }
    .opd-cfg-toggle input:checked + .opd-cfg-toggle-slider:before { transform: translateX(18px); }
    .admin-scope-banner { display: flex; align-items: center; gap: 8px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: var(--gold, #c9a84c); margin-bottom: 20px; }
  `;
  document.head.appendChild(s);
})();

// ========== STATE ==========
let _opdMgmtLoading = false;
let _cachedOpdList = null;
let _cachedOpdListTime = 0;
let _cachedOpdConfigs = new Map();
let _cachedUsersWithAccess = null;
const CACHE_TTL = 60000;

// ========== HELPER ==========
function _getCurrentUserId() {
  const u = getCurrentUser();
  return u?.id || u?.user_id || u?.sub || u?.uid || null;
}
function _getUserId(u) {
  if (!u || typeof u !== 'object') return null;
  return u?.user_id || u?.id || u?.sub || u?.uid || null;
}
function _esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ========== AMBIL SEMUA OPD (CACHED) ==========
async function _getAllOpdList(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _cachedOpdList && (now - _cachedOpdListTime) < CACHE_TTL) {
    return _cachedOpdList;
  }
  try {
    const rows = await sbFetch('/rest/v1/opd?select=id,nama_opd&order=nama_opd.asc', 'GET');
    _cachedOpdList = rows.map(r => ({ id: r.id, namaOpd: r.nama_opd }));
    _cachedOpdListTime = now;
    return _cachedOpdList;
  } catch(e) {
    console.error('_getAllOpdList error', e);
    return _cachedOpdList || [];
  }
}

// ========== AMBIL KONFIGURASI SEMUA OPD ==========
async function _loadAllOpdConfigs(forceRefresh = false) {
  if (!forceRefresh && _cachedOpdConfigs.size > 0) return _cachedOpdConfigs;
  try {
    const rows = await sbFetch('/rest/v1/opd_config?select=opd_id,data', 'GET');
    _cachedOpdConfigs.clear();
    for (const row of rows || []) {
      _cachedOpdConfigs.set(row.opd_id, row.data || {});
    }
  } catch(e) {
    console.error('_loadAllOpdConfigs error', e);
  }
  return _cachedOpdConfigs;
}

// ========== AMBIL SEMUA USER + AKSES (BATCH) ==========
async function _getAllUsersWithAccessBatch(forceRefresh = false) {
  if (!forceRefresh && _cachedUsersWithAccess) return _cachedUsersWithAccess;
  try {
    const users = await sbGetAllUsersWithEmail();
    const validUsers = (users || []).filter(u => _getUserId(u) !== null);
    if (validUsers.length === 0) {
      _cachedUsersWithAccess = { users: [], userAccessMap: new Map() };
      return _cachedUsersWithAccess;
    }
    const userIds = validUsers.map(u => _getUserId(u));
    const userFilter = userIds.map(id => `user_id.eq.${id}`).join(',');
    const accessRows = await sbFetch(`/rest/v1/user_opd_access?or=(${userFilter})&select=user_id,opd_id`, 'GET');
    const opdIds = [...new Set((accessRows || []).map(r => r.opd_id).filter(Boolean))];
    let opdMap = new Map();
    if (opdIds.length) {
      const orFilter = opdIds.map(id => `id.eq.${id}`).join(',');
      const opds = await sbFetch(`/rest/v1/opd?or=(${orFilter})&select=id,nama_opd`, 'GET');
      opdMap = new Map(opds.map(o => [o.id, o.nama_opd]));
    }
    const userAccessMap = new Map();
    for (const user of validUsers) userAccessMap.set(_getUserId(user), []);
    for (const row of accessRows || []) {
      const userId = row.user_id;
      const opdId = row.opd_id;
      const namaOpd = opdMap.get(opdId);
      if (userId && opdId && namaOpd) {
        const arr = userAccessMap.get(userId) || [];
        arr.push({ id: opdId, namaOpd });
        userAccessMap.set(userId, arr);
      }
    }
    _cachedUsersWithAccess = { users: validUsers, userAccessMap };
    return _cachedUsersWithAccess;
  } catch(e) {
    console.error('_getAllUsersWithAccessBatch error', e);
    return { users: [], userAccessMap: new Map() };
  }
}

// ========== RENDER HALAMAN ==========
let _opdMgmtRendering = false;

async function renderOpdManagement() {
  if (_opdMgmtRendering) return;      // cegah panggil ulang kalau masih proses
  _opdMgmtRendering = true;

  const el = document.getElementById('page-opd-management');
  if (!el) { _opdMgmtRendering = false; return; }
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) { el.innerHTML = '<div class="empty-state">🔒 Silakan login</div>'; _opdMgmtRendering = false; return; }
  if (typeof isSuperAdmin !== 'function' || !isSuperAdmin()) { el.innerHTML = '<div class="empty-state">🚫 Akses ditolak</div>'; _opdMgmtRendering = false; return; }

  el.innerHTML = '<div style="text-align:center;padding:40px;">⏳ Memuat...</div>';
  try {
    const opdList = await _getAllOpdList(true);     // true = ambil data terbaru
    await _loadAllOpdConfigs(true);
    const { users, userAccessMap } = await _getAllUsersWithAccessBatch(true);
    _renderOpdMgmtContent(el, opdList, users, userAccessMap);
  } catch(e) {
    el.innerHTML = `<div class="empty-state">⚠️ Gagal: ${e.message}</div>`;
  } finally {
    _opdMgmtRendering = false;
  }
}

function _renderOpdMgmtContent(el, opdList, users, userAccessMap) {
  el.innerHTML = `
    <div class="opd-mgmt-header">
      <div class="opd-mgmt-title">🏢 Manajemen OPD & Akses</div>
      <button class="btn btn-primary btn-sm" onclick="openAddOpdModal()">➕ Tambah OPD</button>
    </div>
    <div class="opd-mgmt-section">
      <div class="opd-mgmt-section-title">📋 Daftar OPD</div>
      <div class="opd-list">
        ${opdList.length === 0 ? '<div class="empty-state">📭 Belum ada OPD</div>' :
          opdList.map(opd => {
            const cfg = _cachedOpdConfigs.get(opd.id) || {};
            const statusHtml = cfg.aktif !== false ? '<span class="opd-status-badge opd-status-aktif">● Aktif</span>' : '<span class="opd-status-badge opd-status-nonaktif">● Nonaktif</span>';
            const metaParts = [];
            if (cfg.kepala_opd) metaParts.push(`👤 ${_esc(cfg.kepala_opd)}`);
            if (cfg.telepon) metaParts.push(`📞 ${_esc(cfg.telepon)}`);
            if (cfg.alamat) metaParts.push(`📍 ${_esc(cfg.alamat.substring(0,40))}${cfg.alamat.length>40?'…':''}`);
            const metaHtml = metaParts.length ? metaParts.map(p => `<div>${p}</div>`).join('') : '<span style="color:var(--text3);font-size:11px">Belum ada info. Klik ⚙️ Config</span>';
            return `
              <div class="opd-card" id="opd-card-${opd.id}">
                ${statusHtml}
                <div class="opd-card-name">${_esc(opd.namaOpd)}</div>
                <div class="opd-card-id">ID: ${opd.id}</div>
                <div class="opd-card-meta">${metaHtml}</div>
                <div class="opd-card-actions">
                  <button class="btn btn-secondary btn-sm" onclick="editOpdConfig('${opd.id}')">⚙️ Config</button>
                  <button class="btn btn-secondary btn-sm" onclick="viewOpdUsers('${opd.id}')">👥 Users</button>
                </div>
              </div>
            `;
          }).join('')
        }
      </div>
    </div>
    <div class="opd-mgmt-section">
      <div class="opd-mgmt-section-title">👥 Manajemen Akses User</div>
      <table class="user-opd-table">
        <thead><tr><th>User</th><th>Akses OPD</th><th>Aksi</th></tr></thead>
        <tbody>
          ${users.length === 0 ? '<tr><td colspan="3"><div class="empty-state">👤 Belum ada user</div></td></tr>' :
            users.map(u => {
              const userId = _getUserId(u);
              if (!userId) return '';
              const display = u.display_name || u.email?.split('@')[0] || userId.slice(0,8);
              const opds = userAccessMap.get(userId) || [];
              const badges = opds.map(opd => `<div class="opd-badge-item">${_esc(opd.namaOpd)}<span class="remove-btn" onclick="revokeUserOpdAccessBtn('${userId}','${opd.id}')">✕</span></div>`).join('');
              return `<tr>
                <td><div style="font-weight:600;">${_esc(display)}</div><div style="font-size:11px;color:var(--text3);">${_esc(u.email || '-')}</div></td>
                <td><div class="opd-badge-list">${badges || '<span style="color:var(--text3);">—</span>'}</div></td>
                <td><button class="btn btn-secondary btn-sm" onclick="manageUserOpdAccess('${userId}','${_esc(display)}')">✏️</button></td>
              </tr>`;
            }).join('')
          }
        </tbody>
      </table>
    </div>
    <div id="modal-add-opd" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);align-items:center;justify-content:center;">
      <div style="background:var(--surface);border-radius:12px;padding:28px;width:100%;max-width:400px;">
        <div style="font-size:16px;font-weight:700;margin-bottom:20px;">➕ Tambah OPD Baru</div>
        <div><label>Nama OPD *</label><input type="text" id="new-opd-name" style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--text);"></div>
        <div id="add-opd-err" style="color:#ef4444;font-size:12px;display:none;"></div>
        <div style="display:flex;gap:10px;margin-top:20px;"><button class="btn btn-primary" onclick="submitAddOpd()">✅ Buat</button><button class="btn btn-secondary" onclick="closeAddOpdModal()">Batal</button></div>
      </div>
    </div>
  `;
}

// ========== KELOLA AKSES USER ==========
window.manageUserOpdAccess = async function(userId, email) {
  if (!isSuperAdmin()) { toast('Hanya Super Admin', 'error'); return; }
  const opdList = await _getAllOpdList(false);
  const userAccess = (await _getAllUsersWithAccessBatch(false)).userAccessMap.get(userId) || [];
  const accessIds = new Set(userAccess.map(o => String(o.id)));
  let html = `<div>Pilih OPD untuk <strong>${_esc(email)}</strong></div>`;
  opdList.forEach(opd => {
    html += `<label style="display:flex;align-items:center;gap:6px;margin:6px 0;"><input type="checkbox" value="${opd.id}" ${accessIds.has(String(opd.id)) ? 'checked' : ''}> ${_esc(opd.namaOpd)}</label>`;
  });
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `<div style="background:var(--surface);border-radius:12px;padding:28px;max-width:400px;width:100%;">${html}<div style="margin-top:20px;"><button class="btn btn-primary" onclick="submitUserOpdAccess('${userId}','${_esc(email)}',this)">💾 Simpan</button> <button class="btn btn-secondary" onclick="this.closest('div').parentElement.remove()">Batal</button></div></div>`;
  document.body.appendChild(modal);
};

window.submitUserOpdAccess = async function(userId, email, btn) {
  let modalDiv = btn.closest('div');
  while (modalDiv && modalDiv !== document.body && !modalDiv.parentElement?.style?.position === 'fixed') modalDiv = modalDiv.parentElement;
  const checkboxes = modalDiv.querySelectorAll('input[type="checkbox"]');
  const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
  try {
    await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}`, 'DELETE', null, {'Prefer':'count=none'});
    for (const opdId of selected) {
      await sbFetch(`/rest/v1/user_opd_access`, 'POST', { user_id: userId, opd_id: opdId, created_at: new Date().toISOString() }, {'Prefer':'resolution=merge-duplicates,return=minimal'});
    }
    toast(`Akses ${email} diperbarui`, 'success');
    modalDiv.remove();
    _cachedUsersWithAccess = null;
    renderOpdManagement();
  } catch(e) { toast('Gagal: '+e.message, 'error'); }
};

window.revokeUserOpdAccessBtn = async function(userId, opdId) {
  if (!confirm('Cabut akses?')) return;
  await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}&opd_id=eq.${opdId}`, 'DELETE', null, {'Prefer':'count=none'});
  toast('Akses dicabut','success');
  _cachedUsersWithAccess = null;
  renderOpdManagement();
};

// ========== TAMBAH OPD ==========
window.openAddOpdModal = function() { const m = document.getElementById('modal-add-opd'); if(m) m.style.display = 'flex'; };
window.closeAddOpdModal = function() { const m = document.getElementById('modal-add-opd'); if(m) m.style.display = 'none'; };
window.submitAddOpd = async function() {
  const name = document.getElementById('new-opd-name')?.value.trim();
  if (!name) { document.getElementById('add-opd-err').textContent = 'Nama wajib diisi'; document.getElementById('add-opd-err').style.display = 'block'; return; }
  try {
    await dbPut('opd', { namaOpd: name });
    toast('OPD ditambahkan','success');
    closeAddOpdModal();
    _cachedOpdList = null;
    _cachedUsersWithAccess = null;
    renderOpdManagement();
  } catch(e) { document.getElementById('add-opd-err').textContent = e.message; document.getElementById('add-opd-err').style.display = 'block'; }
};

// ========== EDIT CONFIG OPD ==========
window.editOpdConfig = async function(opdId) {
  const opdList = await _getAllOpdList(false);
  const opd = opdList.find(o => o.id == opdId);
  if (!opd) return;
  await _loadAllOpdConfigs(false);
  const cfg = _cachedOpdConfigs.get(opdId) || {};
  const modal = document.createElement('div');
  modal.id = 'opd-cfg-modal';
  modal.className = 'opd-cfg-modal-overlay';
  modal.innerHTML = `
    <div class="opd-cfg-modal" onclick="event.stopPropagation()">
      <div class="opd-cfg-modal-header"><div>⚙️ Config OPD</div><button class="opd-cfg-modal-close" onclick="this.closest('#opd-cfg-modal').remove()">✕</button></div>
      <div class="opd-cfg-modal-body">
        <div class="opd-cfg-field"><label class="opd-cfg-label">Nama OPD</label><input class="opd-cfg-input" id="ocfg-nama-opd" value="${_esc(opd.namaOpd)}"></div>
        <div class="opd-cfg-grid-2"><div><label>Kode OPD</label><input class="opd-cfg-input" id="ocfg-kode-opd" value="${_esc(cfg.kode_opd || '')}"></div><div><label>Singkatan</label><input class="opd-cfg-input" id="ocfg-singkatan" value="${_esc(cfg.singkatan || '')}"></div></div>
        <div><label>Alamat</label><textarea class="opd-cfg-textarea" id="ocfg-alamat">${_esc(cfg.alamat || '')}</textarea></div>
        <div class="opd-cfg-grid-2"><div><label>Telepon</label><input class="opd-cfg-input" id="ocfg-telepon" value="${_esc(cfg.telepon || '')}"></div><div><label>Email OPD</label><input class="opd-cfg-input" id="ocfg-email-opd" value="${_esc(cfg.email_opd || '')}"></div></div>
        <div class="opd-cfg-field"><div class="opd-cfg-toggle-row"><div>Status Aktif</div><label class="opd-cfg-toggle"><input type="checkbox" id="ocfg-aktif" ${cfg.aktif !== false ? 'checked' : ''}><span class="opd-cfg-toggle-slider"></span></label></div></div>
      </div>
      <div class="opd-cfg-modal-footer" style="padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;"><button class="btn btn-primary" onclick="_submitOpdConfig('${opdId}')">💾 Simpan</button><button class="btn btn-secondary" onclick="document.getElementById('opd-cfg-modal').remove()">Batal</button></div>
    </div>
  `;
  document.body.appendChild(modal);
};

window._submitOpdConfig = async function(opdId) {
  const namaOpd = document.getElementById('ocfg-nama-opd').value.trim();
  if (!namaOpd) { toast('Nama OPD wajib diisi','error'); return; }
  await dbPut('opd', { id: opdId, namaOpd });
  const cfg = {
    kode_opd: document.getElementById('ocfg-kode-opd').value.trim(),
    singkatan: document.getElementById('ocfg-singkatan').value.trim(),
    alamat: document.getElementById('ocfg-alamat').value.trim(),
    telepon: document.getElementById('ocfg-telepon').value.trim(),
    email_opd: document.getElementById('ocfg-email-opd').value.trim(),
    aktif: document.getElementById('ocfg-aktif').checked,
    updated_at: new Date().toISOString()
  };
  await saveOpdConfig(opdId, cfg);
  toast('Config tersimpan','success');
  document.getElementById('opd-cfg-modal')?.remove();
  _cachedOpdConfigs.set(opdId, cfg);
  _cachedOpdList = null;
  renderOpdManagement();
  
  const currentActive = window.currentOpdId || localStorage.getItem('currentOpdId');
  if (String(currentActive) === String(opdId)) {
    window.dispatchEvent(new CustomEvent('opd-changed', { detail: { opdId, config: cfg } }));
  }
};

window.viewOpdUsers = async function(opdId) {
  const opdList = await _getAllOpdList(false);
  const opd = opdList.find(o => o.id == opdId);
  if (!opd) return;
  const rows = await sbFetch(`/rest/v1/user_opd_access?opd_id=eq.${opdId}&select=user_id`, 'GET');
  const userIds = rows?.map(r=>r.user_id).filter(Boolean)||[];
  alert(`OPD: ${opd.namaOpd}\nUser dengan akses:\n${userIds.length ? userIds.join('\n') : '(Tidak ada)'}`);
};

// ========== SET OPD AKTIF ==========
window.setActiveOpd = async function(opdId) {
  if (!opdId) return;
  localStorage.setItem('currentOpdId', opdId);
  window.currentOpdId = opdId;
  await _loadAllOpdConfigs(false);
  const config = _cachedOpdConfigs.get(opdId) || {};
  window.dispatchEvent(new CustomEvent('opd-changed', { detail: { opdId, config } }));
  toast(`OPD aktif berubah`, 'info');
};

// ========== INIT ==========
window.addEventListener('sideva:page-changed', (e) => {
  if (e?.detail?.page === 'opd-management') setTimeout(renderOpdManagement, 60);
});
window.addEventListener('sb-ready', () => {
  if (document.getElementById('page-opd-management')?.classList.contains('active')) renderOpdManagement();
});
