// ============================================================
//  SI-DEVA — Manajemen User v8.1 (Lengkap)
//  Fitur: CRUD User, Auto-sync user_roles, & Penugasan OPD
// ============================================================

let _cachedMyOpdId = null;

// HELPER: Ambil OPD milik user yang login
async function _getMyOpdId() {
  if (_cachedMyOpdId !== null) return _cachedMyOpdId;
  try {
    const currentUser = getCurrentUser();
    const myId = currentUser?.id || currentUser?.user_id;
    if (!myId) return null;
    const rows = await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${myId}&select=opd_id`, 'GET');
    if (!rows || rows.length === 0) return null;
    _cachedMyOpdId = rows[0].opd_id;
    return _cachedMyOpdId;
  } catch(e) {
    console.warn('_getMyOpdId error:', e);
    return null;
  }
}

// HELPER: Fungsi pendaftaran user ke Supabase Auth
async function sbInviteUser(email, password, role, displayName) {
  return await sbFetch('/auth/v1/signup', 'POST', {
    email: email,
    password: password,
    data: { role, display_name: displayName }
  });
}

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
      users = await sbFetch('/rest/v1/user_roles?select=*&order=created_at.desc', 'GET');
    } else {
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
    if (!isSuper) users = users.filter(u => u.role !== 'super_admin');

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

  const roleClass = (r) => {
    if (r === 'super_admin') return 'um-badge-superadmin';
    if (r === 'admin') return 'um-badge-admin';
    if (r === 'operator') return 'um-badge-operator';
    return 'um-badge-viewer';
  };

  let html = `
    <div class="um-header">
      <div class="um-title">👥 Manajemen User (${users.length})</div>
      ${showAddButton ? '<button class="btn btn-primary btn-sm" onclick="openAddUserModal()">➕ Tambah User</button>' : ''}
    </div>
    <div class="card"><div class="table-wrap"><table class="user-opd-table">
      <thead><tr><th>#</th><th>User</th><th>Email</th><th>Role</th><th>Aksi</th></tr></thead>
      <tbody>
  `;

  users.forEach((u, i) => {
    const displayName = u.display_name || u.email?.split('@')[0] || '-';
    const email = u.email || '-';
    const role = u.role || 'viewer';
    const userId = u.user_id || u.id;
    
    const canManage = isSuper || (role !== 'admin' && role !== 'super_admin');
    const actionBtns = canManage ? `
      <button class="btn btn-secondary btn-sm" onclick="openEditUserModal('${userId}', '${escapeHtml(displayName)}', '${escapeHtml(email)}', '${role}')">✏️ Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteUserConfirm('${userId}', '${escapeHtml(displayName)}')">🗑️ Hapus</button>
    ` : '<span class="text-muted">—</span>';
    
    html += `<tr>
      <td>${i+1}</td>
      <td><strong>${escapeHtml(displayName)}</strong><br><small style="color:var(--text3)">${userId?.slice(0,8)}</small></td>
      <td>${escapeHtml(email)}</td>
      <td><span class="um-badge-role ${roleClass(role)}">${role}</span></td>
      <td>${actionBtns}</td>
    </tr>`;
  });

  html += `</tbody></table></div></div>`;
  el.innerHTML = html;
}

// ========== TAMBAH USER ==========
window.openAddUserModal = function() {
  const isSuper = isSuperAdmin();
  let roleOptions = isSuper ? `
    <option value="viewer">Viewer</option>
    <option value="operator">Operator</option>
    <option value="admin">Admin</option>
    <option value="super_admin">Super Admin</option>
  ` : `
    <option value="viewer">Viewer</option>
    <option value="operator">Operator</option>
  `;

  const modal = document.createElement('div');
  modal.id = 'modal-add-user';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = `
    <div style="background:var(--surface);border-radius:12px;padding:28px;width:100%;max-width:400px;">
      <div style="font-weight:700;margin-bottom:20px;">➕ Tambah User Baru</div>
      <input type="email" id="add-user-email" class="form-control" placeholder="Email" style="margin-bottom:10px;">
      <input type="password" id="add-user-password" class="form-control" placeholder="Password (min 6 karakter)" style="margin-bottom:10px;">
      <select id="add-user-role" class="form-control" style="margin-bottom:10px;">${roleOptions}</select>
      <input type="text" id="add-user-display" class="form-control" placeholder="Nama Tampilan" style="margin-bottom:10px;">
      <div id="add-user-err" style="color:#ef4444;font-size:12px;margin-bottom:10px;display:none;"></div>
      <div style="display:flex;gap:10px;margin-top:10px;">
        <button class="btn btn-primary" style="flex:1;" onclick="submitAddUser()">✅ Simpan</button>
        <button class="btn btn-secondary" onclick="this.closest('#modal-add-user').remove()">Batal</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.submitAddUser = async function() {
  const email = document.getElementById('add-user-email')?.value.trim();
  const password = document.getElementById('add-user-password')?.value;
  const role = document.getElementById('add-user-role')?.value;
  const displayName = document.getElementById('add-user-display')?.value.trim();
  const errEl = document.getElementById('add-user-err');
  const btn = document.querySelector('#modal-add-user .btn-primary');

  try {
    if (btn) btn.disabled = true;
    const result = await sbInviteUser(email, password, role, displayName);
    const newUserId = result.user?.id || result.id;

    // WAJIB: Masukkan ke user_roles agar muncul di tabel
    await sbFetch('/rest/v1/user_roles', 'POST', {
      user_id: newUserId,
      email: email,
      role: role,
      display_name: displayName || email.split('@')[0]
    });

    // Otomatis OPD jika Admin OPD yang menambah
    if (!isSuperAdmin()) {
      const myOpdId = await _getMyOpdId();
      if (myOpdId) {
        await sbFetch('/rest/v1/user_opd_access', 'POST', { user_id: newUserId, opd_id: myOpdId });
      }
    }

    toast('User berhasil ditambahkan!', 'success');
    document.getElementById('modal-add-user')?.remove();
    renderManajemenUser();
  } catch (err) {
    if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
    if (btn) btn.disabled = false;
  }
};

// ========== EDIT AKSES OPD ==========
window.openEditUserModal = async function(userId, name, email, role) {
  try {
    const opds = await sbFetch('/rest/v1/opd?select=id,nama_opd&order=nama_opd', 'GET');
    const currentAccess = await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}&select=opd_id`, 'GET');
    const currentOpdId = currentAccess?.[0]?.opd_id;

    const modal = document.createElement('div');
    modal.id = 'modal-edit-user';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:var(--surface);border-radius:12px;padding:28px;width:100%;max-width:400px;">
        <div style="font-weight:700;margin-bottom:15px;">✏️ Edit Akses OPD</div>
        <div style="font-size:13px;margin-bottom:15px;">User: <strong>${name}</strong></div>
        <select id="edit-user-opd" class="form-control">
          <option value="">-- Tanpa OPD --</option>
          ${opds.map(o => `<option value="${o.id}" ${o.id == currentOpdId ? 'selected' : ''}>${o.nama_opd}</option>`).join('')}
        </select>
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button class="btn btn-primary" style="flex:1;" onclick="submitEditUser('${userId}')">💾 Simpan</button>
          <button class="btn btn-secondary" onclick="this.closest('#modal-edit-user').remove()">Batal</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } catch(e) { toast('Gagal memuat data OPD', 'error'); }
};

window.submitEditUser = async function(userId) {
  const opdId = document.getElementById('edit-user-opd').value;
  try {
    await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}`, 'DELETE');
    if (opdId) {
      await sbFetch('/rest/v1/user_opd_access', 'POST', { user_id: userId, opd_id: opdId });
    }
    toast('Akses OPD diperbarui', 'success');
    document.getElementById('modal-edit-user').remove();
    renderManajemenUser();
  } catch(e) { toast('Gagal update akses', 'error'); }
};

// ========== HAPUS USER ==========
window.deleteUserConfirm = async function(userId, name) {
  if (!confirm(`Hapus user ${name}? Ini juga akan menghapus akses OPD-nya.`)) return;
  try {
    await sbFetch(`/rest/v1/user_roles?user_id=eq.${userId}`, 'DELETE');
    await sbFetch(`/rest/v1/user_opd_access?user_id=eq.${userId}`, 'DELETE');
    toast('User berhasil dihapus dari daftar manajemen', 'success');
    renderManajemenUser();
  } catch(e) { toast('Gagal menghapus user', 'error'); }
};
