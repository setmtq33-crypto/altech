// ============================================================
//  SI-DEVA — Manajemen User v8
//  Fitur: Admin OPD tambah user (role terbatas) + akses OPD otomatis
//         Admin biasa tidak melihat super_admin
// ============================================================

// ========== HELPER: Ambil OPD milik user yang login ==========
let _cachedMyOpdId = null;

// Tambahkan ini di bagian atas file (misal setelah baris 7)
async function sbInviteUser(email, password, role, displayName) {
  // Menggunakan sbFetch yang sudah ada di kode Anda untuk mendaftarkan user
  // Sesuaikan endpoint '/auth/v1/signup' dengan konfigurasi API Anda
  return await sbFetch('/auth/v1/signup', 'POST', {
    email: email,
    password: password,
    data: { 
      role: role, 
      display_name: displayName 
    }
  });
}

async function _getMyOpdId() {
  if (_cachedMyOpdId !== null) return _cachedMyOpdId;
  try {
    const currentUser = getCurrentUser();
    const myId = currentUser?.id || currentUser?.user_id;
    if (!myId) return null;
    const rows = await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${myId}&select=opd_id`, 'GET');
    if (!rows || rows.length === 0) return null;
    _cachedMyOpdId = rows[0].opd_id; // asumsi admin hanya punya 1 OPD
    return _cachedMyOpdId;
  } catch(e) {
    console.warn('_getMyOpdId error:', e);
    return null;
  }
}

// Cek apakah admin biasa (non-super) boleh menambah user
async function _canAdminAddUser() {
  if (isSuperAdmin()) return true;
  const opdId = await _getMyOpdId();
  return !!opdId;
}

// ========== RENDER HALAMAN UTAMA ==========
async function renderManajemenUser() {
  const el = document.getElementById('um-content');
  if (!el) return;

  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) {
    el.innerHTML = '<div class="empty-state">🔒 Silakan login</div>';
    return;
  }
  if (typeof isAdmin !== 'function' || !isAdmin()) {
    el.innerHTML = '<div class="empty-state">🚫 Akses ditolak</div>';
    return;
  }

  el.innerHTML = '<div style="padding:30px;text-align:center;">⏳ Memuat...</div>';

  try {
    const isSuper = (typeof isSuperAdmin === 'function' && isSuperAdmin());
    let users = [];

    if (isSuper) {
      // Super admin: semua user
      users = await sbFetch('/rest/v1/user_roles?select=*&order=created_at.desc', 'GET');
    } else {
      // Admin biasa: ambil user yang memiliki akses ke OPD yang sama
      const myOpdId = await _getMyOpdId();
      if (!myOpdId) {
        users = [];
      } else {
        const accessRows = await sbFetch(`/rest/v1/user_opd_access?opd_id=eq.${myOpdId}&select=user_id`, 'GET');
        const userIds = [...new Set((accessRows || []).map(r => r.user_id))];
        if (userIds.length === 0) {
          users = [];
        } else {
          const userFilter = userIds.map(id => `user_id.eq.${id}`).join(',');
          users = await sbFetch(`/rest/v1/user_roles?or=(${userFilter})&order=created_at.desc`, 'GET');
        }
      }
    }

    users = users || [];
    
    // Sembunyikan akun super_admin dari admin biasa (non-super)
    if (!isSuper) {
      users = users.filter(u => u.role !== 'super_admin');
    }

    window._umUsers = users;
    await _renderUserTable(el, users, isSuper);
  } catch (err) {
    console.error(err);
    el.innerHTML = `<div class="empty-state">⚠️ Error: ${err.message}</div>`;
  }
}

async function _renderUserTable(el, users, isSuper) {
  const canAdd = await _canAdminAddUser();
  const showAddButton = isSuper || canAdd;

  if (!users.length) {
    el.innerHTML = `
      <div class="um-header">
        <div class="um-title">👥 Manajemen User</div>
        ${showAddButton ? '<button class="btn btn-primary btn-sm" onclick="openAddUserModal()">➕ Tambah User</button>' : ''}
      </div>
      <div class="empty-state">👤 Belum ada user${isSuper ? ' terdaftar' : ' di OPD Anda'}</div>
    `;
    return;
  }

  const roleClass = (r) => {
    if (r === 'super_admin') return 'um-badge-superadmin';
    if (r === 'admin') return 'um-badge-admin';
    if (r === 'operator') return 'um-badge-operator';
    return 'um-badge-viewer';
  };

  let html = `
    <div class="um-header">
      <div class="um-title">👥 Manajemen User (${users.length})</div>
      ${showAddButton ? '<button class="btn btn-primary btn-sm" onclick="openAddUserModal()">➕ Tambah User</button>' : (isSuper ? '' : '<span style="font-size:12px;color:var(--text3);">👑 Admin OPD: hanya melihat user di OPD Anda</span>')}
    </div>
    <div class="card"><div class="table-wrap"><table class="user-opd-table">
      <thead><tr><th>#</th><th>User</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead>
      <tbody>
  `;

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const displayName = u.display_name || u.email?.split('@')[0] || u.user_id?.slice(0,8) || '-';
    const email = u.email || '-';
    const role = u.role || 'viewer';
    const userId = u.user_id || u.id;
    
    // Admin biasa tidak bisa mengelola user dengan role admin atau super_admin
    const canManage = isSuper || (role !== 'admin' && role !== 'super_admin');
    const actionBtns = canManage ? `
      <button class="btn btn-secondary btn-sm" onclick="openEditUserModal('${userId}', '${escapeHtml(displayName)}', '${escapeHtml(email)}', '${role}')">✏️ Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteUserConfirm('${userId}', '${escapeHtml(displayName)}')">🗑️ Hapus</button>
    ` : '<span class="text-muted">—</span>';
    
    html += `<tr>
      <td>${i+1}</td>
      <td><strong>${escapeHtml(displayName)}</strong><br><small style="color:var(--text3)">${userId?.slice(0,12)}…</small></td>
      <td>${escapeHtml(email)}</td>
      <td><span class="um-badge-role ${roleClass(role)}">${role}</span></td>
      <td>${actionBtns}</td>
    </tr>`;
  }

  html += `</tbody></table></div></div>`;
  el.innerHTML = html;
}

// ========== TAMBAH USER (dengan akses OPD otomatis untuk admin biasa) ==========
window.openAddUserModal = function() {
  const isSuper = isSuperAdmin();
  if (!isSuper && !_cachedMyOpdId) {
    toast('Anda tidak memiliki OPD yang dapat dikelola', 'error');
    return;
  }

  let roleOptions = '';
  if (isSuper) {
    roleOptions = `
      <option value="viewer">Viewer (hanya lihat)</option>
      <option value="operator">Operator (input/edit)</option>
      <option value="admin">Admin (kelola data OPD sendiri)</option>
      <option value="super_admin">Super Admin (penuh)</option>
    `;
  } else {
    roleOptions = `
      <option value="viewer">Viewer (hanya lihat)</option>
      <option value="operator">Operator (input/edit)</option>
    `;
  }

  const modal = document.createElement('div');
  modal.id = 'modal-add-user';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:var(--surface);border-radius:12px;padding:28px;width:100%;max-width:400px;">
      <div style="font-size:16px;font-weight:700;margin-bottom:20px;">➕ Tambah User Baru</div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Email *</label>
        <input type="email" id="add-user-email" class="form-control" placeholder="user@example.com">
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Password *</label>
        <input type="password" id="add-user-password" class="form-control" placeholder="Minimal 6 karakter">
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Role *</label>
        <select id="add-user-role" class="form-control">
          ${roleOptions}
        </select>
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Nama Tampilan (opsional)</label>
        <input type="text" id="add-user-display" class="form-control" placeholder="Nama user">
      </div>
      <div id="add-user-err" style="color:#ef4444;font-size:12px;margin-bottom:10px;display:none;"></div>
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="btn btn-primary" style="flex:1;" onclick="submitAddUser()">✅ Simpan</button>
        <button class="btn btn-secondary" onclick="this.closest('#modal-add-user').remove()">Batal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('add-user-email')?.focus();
};

window.submitAddUser = async function() {
  const email = document.getElementById('add-user-email')?.value.trim();
  const password = document.getElementById('add-user-password')?.value;
  const role = document.getElementById('add-user-role')?.value;
  const displayName = document.getElementById('add-user-display')?.value.trim();
  const errEl = document.getElementById('add-user-err');
  
  if (!email || !password) {
    errEl.textContent = 'Email dan password wajib diisi';
    errEl.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password minimal 6 karakter';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const btn = document.querySelector('#modal-add-user .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Memproses...'; }

  try {
    // Memanggil fungsi helper yang ditambahkan di atas
    const result = await sbInviteUser(email, password, role, displayName);
    const newUserId = result.user?.id || result.id;
    if (!newUserId) throw new Error('Gagal mendapatkan ID user baru');

    const isSuper = isSuperAdmin();
    if (!isSuper) {
      const myOpdId = await _getMyOpdId();
      if (myOpdId) {
        await sbFetch('/rest/v1/user_opd_access', 'POST', {
          user_id: newUserId,
          opd_id: myOpdId,
          created_at: new Date().toISOString()
        }, { 'Prefer': 'resolution=ignore,return=minimal' });
      }
    }

    try {
      if (typeof logAudit === 'function') {
        const myOpdId = isSuper ? null : await _getMyOpdId();
        logAudit('user_added', { role, opd_id: myOpdId, email }, newUserId, email);
      }
    } catch(e) {}

    toast('User berhasil ditambahkan!', 'success');
    document.getElementById('modal-add-user')?.remove();
    renderManajemenUser();
    
  } catch (err) {
    console.error(err);
    if (errEl) {
      errEl.textContent = err.message || 'Gagal menambah user';
      errEl.style.display = 'block';
    }
    if (btn) { 
      btn.disabled = false; 
      btn.textContent = '✅ Simpan'; 
    }
  }
};

// ========== EDIT USER (hanya super admin) ==========
window.openEditUserModal = function(userId, displayName, email, currentRole) {
  if (!isSuperAdmin()) {
    toast('Hanya Super Admin yang dapat mengedit user', 'error');
    return;
  }
  const modal = document.createElement('div');
  modal.id = 'modal-edit-user';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:var(--surface);border-radius:12px;padding:28px;width:100%;max-width:400px;">
      <div style="font-size:16px;font-weight:700;margin-bottom:20px;">✏️ Edit User</div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Email</label>
        <input type="email" id="edit-user-email" class="form-control" value="${escapeHtml(email)}" readonly disabled style="background:var(--surface3);">
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Nama Tampilan</label>
        <input type="text" id="edit-user-display" class="form-control" value="${escapeHtml(displayName)}">
      </div>
      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:12px;color:var(--text3);margin-bottom:4px;">Role</label>
        <select id="edit-user-role" class="form-control">
          <option value="viewer" ${currentRole === 'viewer' ? 'selected' : ''}>Viewer</option>
          <option value="operator" ${currentRole === 'operator' ? 'selected' : ''}>Operator</option>
          <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="super_admin" ${currentRole === 'super_admin' ? 'selected' : ''}>Super Admin</option>
        </select>
      </div>
      <div id="edit-user-err" style="color:#ef4444;font-size:12px;margin-bottom:10px;display:none;"></div>
      <div style="display:flex;gap:10px;margin-top:20px;">
        <button class="btn btn-primary" style="flex:1;" onclick="submitEditUser('${userId}')">💾 Simpan</button>
        <button class="btn btn-secondary" onclick="this.closest('#modal-edit-user').remove()">Batal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.submitEditUser = async function(userId) {
  const newRole = document.getElementById('edit-user-role')?.value;
  const newDisplay = document.getElementById('edit-user-display')?.value.trim();
  const errEl = document.getElementById('edit-user-err');
  errEl.style.display = 'none';
  try {
    const payload = { role: newRole };
    if (newDisplay) payload.display_name = newDisplay;
    await sbFetch(`/rest/v1/user_roles?user_id=eq.${userId}`, 'PATCH', payload);
    toast('User berhasil diperbarui', 'success');
    document.getElementById('modal-edit-user')?.remove();
    renderManajemenUser();
    _cachedMyOpdId = null;
  } catch(e) {
    errEl.textContent = 'Gagal: ' + e.message;
    errEl.style.display = 'block';
  }
};

// ========== HAPUS USER ==========
function deleteUserConfirm(userId, displayName) {
  if (!isSuperAdmin()) {
    toast('Hanya Super Admin yang dapat menghapus user', 'error');
    return;
  }
  if (!confirm(`⚠️ Yakin hapus user "${displayName}"? Tindakan ini tidak bisa dibatalkan.`)) return;
  deleteUser(userId, displayName);
}

async function deleteUser(userId, displayName) {
  try {
    await sbFetch(`/rest/v1/user_roles?user_id=eq.${userId}`, 'DELETE');
    await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}`, 'DELETE');
    toast(`User ${displayName} berhasil dihapus`, 'success');
    renderManajemenUser();
    _cachedMyOpdId = null;
  } catch (err) {
    console.error(err);
    toast('Gagal hapus user: ' + err.message, 'error');
  }
}

// ========== INJECT MENU SIDEBAR ==========
function _injectNavUser() {
  if (document.getElementById('nav-manajemen-user')) return;
  if (typeof isAdmin !== 'function' || !isAdmin()) return;
  const anchor = document.querySelector('.nav-item[onclick*="pengaturan"]') || document.querySelector('.nav-item[onclick*="backup"]');
  const li = document.createElement('div');
  li.id = 'nav-manajemen-user';
  li.className = 'nav-item admin-only';
  li.setAttribute('onclick', "showPage('manajemen-user')");
  li.innerHTML = '<span class="nav-icon">👥</span><span class="nav-label">Manajemen User</span>';
  if (anchor) anchor.before(li);
  if (!document.getElementById('page-manajemen-user')) {
    const p = document.createElement('div');
    p.id = 'page-manajemen-user';
    p.className = 'page';
    p.innerHTML = '<div id="um-content"></div>';
    const anyPage = document.querySelector('.page');
    if (anyPage) anyPage.parentNode.appendChild(p);
  }
}

// ========== EVENT LISTENERS ==========
window.addEventListener('sideva:page-changed', (e) => {
  if (e?.detail?.page === 'manajemen-user') renderManajemenUser();
});
window.addEventListener('sb-ready', () => setTimeout(_injectNavUser, 700));
setTimeout(() => { if (typeof isAdmin === 'function' && isAdmin()) _injectNavUser(); }, 1500);

// ========== UTILITIES ==========
function escapeHtml(s) {
  return String(s || '').replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
