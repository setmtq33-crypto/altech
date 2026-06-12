// ============================================================
//  SI-DEVA — Manajemen User v8.2 (Lengkap & Final)
//  Fitur: CRUD User, Penugasan OPD, & Sinkronisasi Tabel
// ============================================================

let _cachedMyOpdId = null;

const USER_ROLES_TABLE = '/rest/v1/user_roles';
const USER_OPD_TABLE = '/rest/v1/user_opd_access';

function _normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function _normalizeRole(role) {
  const value = String(role || 'viewer').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ['viewer', 'operator', 'admin', 'admin_opd', 'super_admin'].includes(value) ? value : 'viewer';
}

function _getCurrentUserId() {
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  return currentUser?.id || currentUser?.user_id || currentUser?.sub || currentUser?.uid || null;
}

function _getSignupUserId(result) {
  return result?.user?.id || result?.id || result?.user_id || result?.data?.user?.id || null;
}

function _isDuplicateSignupError(err) {
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already');
}

async function _getUserRoleByEmail(email) {
  const normalizedEmail = _normalizeEmail(email);
  if (!normalizedEmail) return null;
  const rows = await sbFetch(`${USER_ROLES_TABLE}?email=eq.${encodeURIComponent(normalizedEmail)}&select=*`, 'GET');
  return rows?.[0] || null;
}

async function _getUserRoleByUserId(userId) {
  if (!userId) return null;
  const rows = await sbFetch(`${USER_ROLES_TABLE}?user_id=eq.${encodeURIComponent(userId)}&select=*`, 'GET');
  return rows?.[0] || null;
}

async function _upsertUserRoleProfile({ userId, email, role, displayName }) {
  const normalizedEmail = _normalizeEmail(email);
  const payload = {
    user_id: userId,
    email: normalizedEmail,
    role: _normalizeRole(role),
    display_name: displayName || normalizedEmail.split('@')[0]
  };

  const rows = await sbFetch(
    `${USER_ROLES_TABLE}?on_conflict=user_id`,
    'POST',
    payload,
    { Prefer: 'resolution=merge-duplicates,return=representation' }
  );

  const saved = rows?.[0] || await _getUserRoleByUserId(userId);
  if (!saved) {
    throw new Error('Profil user berhasil dikirim, tetapi tidak bisa dibaca ulang dari tabel user_roles. Periksa policy RLS SELECT/INSERT/UPSERT untuk super admin.');
  }
  return saved;
}

async function _ensureUserVisible(userId, email) {
  const row = await _getUserRoleByUserId(userId) || await _getUserRoleByEmail(email);
  if (!row) {
    throw new Error('User Auth sudah dibuat, tetapi profilnya tidak muncul di user_roles. Periksa RLS table user_roles agar super admin boleh insert dan select semua profil.');
  }
  return row;
}

/**
 * HELPER: Ambil OPD milik user yang sedang login
 */
async function _getMyOpdId() {
  if (_cachedMyOpdId !== null) return _cachedMyOpdId;
  try {
    const myId = _getCurrentUserId();
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

/**
 * HELPER: Fungsi pendaftaran user ke Supabase Auth
 */
async function sbInviteUser(email, password, role, displayName) {
  const normalizedEmail = _normalizeEmail(email);
  return await sbFetch('/auth/v1/signup', 'POST', {
    email: normalizedEmail,
    password: password,
    data: { role: _normalizeRole(role), display_name: displayName || normalizedEmail.split('@')[0] }
  });
}

/**
 * Cek apakah user memiliki izin untuk menambah user baru
 */
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
      // Super admin melihat semua user dari tabel user_roles
      users = await sbFetch(`${USER_ROLES_TABLE}?select=*&order=created_at.desc`, 'GET');
    } else {
      // Admin OPD hanya melihat user yang memiliki akses ke OPD yang sama
      const myOpdId = await _getMyOpdId();
      if (!myOpdId) {
        users = [];
      } else {
        const accessRows = await sbFetch(`${USER_OPD_TABLE}?opd_id=eq.${myOpdId}&select=user_id`, 'GET');
        const userIds = [...new Set((accessRows || []).map(r => r.user_id))];
        if (userIds.length === 0) {
          users = [];
        } else {
          const userFilter = userIds.map(id => `user_id.eq.${id}`).join(',');
          users = await sbFetch(`${USER_ROLES_TABLE}?or=(${userFilter})&order=created_at.desc`, 'GET');
        }
      }
    }

    users = users || [];
    // Sembunyikan role super_admin dari admin biasa
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

  const roleClass = (r) => {
    if (r === 'super_admin') return 'um-badge-superadmin';
    if (r === 'admin' || r === 'admin_opd') return 'um-badge-admin';
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
    const role = _normalizeRole(u.role);
    const userId = u.user_id || u.id;
    
    // Cegah admin biasa mengedit sesama admin atau super admin
    const canManage = isSuper || !['admin', 'admin_opd', 'super_admin'].includes(role);
    const actionBtns = canManage ? `
      <button class="btn btn-secondary btn-sm" data-um-action="edit" data-user-id="${attr(userId)}" data-name="${attr(displayName)}" data-email="${attr(email)}" data-role="${attr(role)}">✏️ Edit</button>
      ${typeof openResetPwModal === 'function' ? `<button class="btn btn-secondary btn-sm" data-um-action="reset" data-user-id="${attr(userId)}" data-email="${attr(email)}" title="Reset Password">🔑</button>` : ''}
      <button class="btn btn-danger btn-sm" data-um-action="delete" data-user-id="${attr(userId)}" data-name="${attr(displayName)}">🗑️ Hapus</button>
    ` : '<span class="text-muted">-</span>';
    
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
  el.querySelectorAll('[data-um-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.umAction;
      if (action === 'edit') openEditUserModal(btn.dataset.userId, btn.dataset.name, btn.dataset.email, btn.dataset.role);
      if (action === 'reset' && typeof openResetPwModal === 'function') openResetPwModal(btn.dataset.userId, btn.dataset.email);
      if (action === 'delete') deleteUserConfirm(btn.dataset.userId, btn.dataset.name);
    });
  });
}

// ========== FITUR: TAMBAH USER ==========

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
  const email = _normalizeEmail(document.getElementById('add-user-email')?.value);
  const password = document.getElementById('add-user-password')?.value;
  const role = _normalizeRole(document.getElementById('add-user-role')?.value);
  const displayName = document.getElementById('add-user-display')?.value.trim();
  const errEl = document.getElementById('add-user-err');
  const btn = document.querySelector('#modal-add-user .btn-primary');

  if (!email || !password) {
    if (errEl) { errEl.textContent = 'Email dan password wajib diisi'; errEl.style.display = 'block'; }
    return;
  }
  if (password.length < 6) {
    if (errEl) { errEl.textContent = 'Password minimal 6 karakter'; errEl.style.display = 'block'; }
    return;
  }

  try {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Memproses...'; }

    let result;
    let newUserId;
    try {
      result = await sbInviteUser(email, password, role, displayName);
      newUserId = _getSignupUserId(result);
    } catch (signupErr) {
      if (!_isDuplicateSignupError(signupErr)) throw signupErr;

      const existingProfile = await _getUserRoleByEmail(email);
      if (!existingProfile?.user_id) {
        throw new Error('Email sudah terdaftar di Auth, tetapi belum ada profil di user_roles. Buat/repair profil dari Supabase Dashboard karena Auth ID tidak bisa dibaca dari browser.');
      }
      newUserId = existingProfile.user_id;
    }

    if (!newUserId) throw new Error('Akun Auth dibuat, tetapi Supabase tidak mengembalikan ID user baru');

    await _upsertUserRoleProfile({ userId: newUserId, email, role, displayName });

    if (!isSuperAdmin()) {
      const myOpdId = await _getMyOpdId();
      if (myOpdId) {
        await sbFetch(`${USER_OPD_TABLE}?on_conflict=user_id,opd_id`, 'POST', {
          user_id: newUserId, 
          opd_id: myOpdId 
        }, { Prefer: 'resolution=merge-duplicates,return=representation' });
      }
    }

    await _ensureUserVisible(newUserId, email);

    toast('User berhasil ditambahkan!', 'success');
    document.getElementById('modal-add-user')?.remove();
    renderManajemenUser(); // Refresh tabel

  } catch (err) {
    console.error('Submit error:', err);
    if (errEl) {
      errEl.textContent = err.message || 'Terjadi kesalahan saat menyimpan';
      errEl.style.display = 'block';
    }
    if (btn) { btn.disabled = false; btn.textContent = '✅ Simpan'; }
  }
};

// ========== FITUR: EDIT AKSES OPD ==========

window.openEditUserModal = async function(userId, name, email, role) {
  try {
    // Ambil daftar semua OPD untuk dropdown
    const opds = await sbFetch('/rest/v1/opd?select=id,nama_opd&order=nama_opd', 'GET');
    // Ambil akses OPD user saat ini
    const currentAccess = await sbFetch(`${USER_OPD_TABLE}?user_id=eq.${userId}&select=opd_id`, 'GET');
    const currentOpdId = currentAccess?.[0]?.opd_id;

    const modal = document.createElement('div');
    modal.id = 'modal-edit-user';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:var(--surface);border-radius:12px;padding:28px;width:100%;max-width:400px;">
        <div style="font-weight:700;margin-bottom:15px;">✏️ Edit Akses OPD</div>
        <div style="font-size:13px;margin-bottom:15px;">User: <strong>${name}</strong></div>
        <select id="edit-user-opd" class="form-control">
          <option value="">-- Tanpa OPD / Cabut Akses --</option>
          ${opds.map(o => `<option value="${o.id}" ${o.id == currentOpdId ? 'selected' : ''}>${o.nama_opd}</option>`).join('')}
        </select>
        <div style="display:flex;gap:10px;margin-top:20px;">
          <button class="btn btn-primary" style="flex:1;" onclick="submitEditUser('${userId}')">💾 Simpan Perubahan</button>
          <button class="btn btn-secondary" onclick="this.closest('#modal-edit-user').remove()">Batal</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } catch(e) {
    toast('Gagal memuat data OPD', 'error');
  }
};

window.submitEditUser = async function(userId) {
  const opdId = document.getElementById('edit-user-opd').value;
  try {
    // Hapus akses lama terlebih dahulu
    await sbFetch(`${USER_OPD_TABLE}?user_id=eq.${userId}`, 'DELETE');
    
    // Jika OPD dipilih, masukkan data akses baru
    if (opdId) {
      await sbFetch(`${USER_OPD_TABLE}?on_conflict=user_id,opd_id`, 'POST', {
        user_id: userId, 
        opd_id: opdId 
      }, { Prefer: 'resolution=merge-duplicates,return=representation' });
    }
    
    toast('Akses OPD berhasil diperbarui', 'success');
    document.getElementById('modal-edit-user').remove();
    renderManajemenUser(); // Refresh tabel
  } catch(e) {
    toast('Gagal mengupdate akses OPD', 'error');
  }
};

// ========== FITUR: HAPUS USER ==========

window.deleteUserConfirm = async function(userId, name) {
  if (!confirm(`Hapus user "${name}"?\nTindakan ini akan menghapus akses dan perannya dari daftar manajemen.`)) return;
  
  try {
    // Hapus dari tabel user_roles dan user_opd_access
    await sbFetch(`${USER_ROLES_TABLE}?user_id=eq.${userId}`, 'DELETE');
    await sbFetch(`${USER_OPD_TABLE}?user_id=eq.${userId}`, 'DELETE');
    
    toast('User berhasil dihapus dari daftar', 'success');
    renderManajemenUser();
  } catch(e) {
    console.error('Delete error:', e);
    toast('Gagal menghapus user', 'error');
  }
};

/**
 * Helper untuk mencegah XSS (Security)
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function attr(text) {
  return escapeHtml(String(text || ''));
}

// ============================================================
// FITUR TAMBAHAN: TOMBOL EDIT ROLE OTOMATIS (KECUALI SUPER ADMIN)
// ============================================================

function injekTombolEditRole() {
    // Mencari tabel user di halaman manajemen user
    const tabelBody = document.querySelector('table tbody') || document.querySelector('.user-opd-table tbody');
    if (!tabelBody) return;

    const barisUser = tabelBody.querySelectorAll('tr');
    barisUser.forEach(row => {
        const isiTeks = row.textContent || "";
        
        // PROTEKSI: Jika baris ini adalah milik super_admin, abaikan/jangan beri tombol edit role
        if (isiTeks.includes('super_admin')) {
            return;
        }

        // Cari kolom AKSI (kolom terakhir di baris tersebut)
        const kolomAksi = row.querySelector('td:last-child');
        if (!kolomAksi) return;

        // Cegah tombol ganda jika fungsi ini berjalan berulang kali
        if (kolomAksi.querySelector('.btn-edit-role-custom')) return;

        // Mengambil data user dari baris tabel untuk dikirim ke popup modal
        let userId = "";
        const idElement = row.querySelector('div[style*="font-size"], small, span');
        if (idElement) {
            userId = idElement.textContent.trim();
        }

        const namaUser = row.querySelector('td:first-child div')?.textContent.trim() || "Pengguna";
        const roleSaatIni = row.querySelector('td:nth-child(4)')?.textContent.trim().toLowerCase() || "viewer";

        // Membuat tombol baru dengan desain yang menyatu dengan tema SI-DEVA
        const btnRole = document.createElement('button');
        btnRole.className = 'btn btn-secondary btn-sm btn-edit-role-custom';
        btnRole.style.cssText = 'margin-left: 6px; border-color: var(--gold, #c9a84c); color: var(--gold, #c9a84c);';
        btnRole.innerHTML = '⚙️ Role';
        
        // Trigger modal ketika tombol diklik
        btnRole.onclick = function() {
            bukaModalUbahRole(userId, namaUser, roleSaatIni);
        };

        // Sisipkan tombol ke dalam kolom tindakan
        kolomAksi.appendChild(btnRole);
    });
}

// Fungsi untuk memunculkan jendela Pop-up / Modal pilihan role baru
function bukaModalUbahRole(userId, username, currentRole) {
    const modal = document.createElement('div');
    modal.id = 'modal-custom-role';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:16px;';
    
    modal.innerHTML = `
        <div style="background:var(--surface, #1a1a1a); border:1px solid var(--border, #2a2a2a); border-radius:12px; padding:24px; width:100%; max-width:380px; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
            <div style="font-size:16px; font-weight:700; margin-bottom:4px; color:#fff;">⚙️ Ubah Tingkat Akses</div>
            <div style="font-size:13px; color:#888; margin-bottom:20px;">User: <span style="color:var(--gold, #c9a84c); font-weight:600;">${username}</span></div>
            
            <div style="margin-bottom:24px;">
                <label style="display:block; font-size:12px; font-weight:600; color:#aaa; margin-bottom:8px;">Pilih Hak Akses Baru</label>
                <select id="select-new-role" style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid #333; background:#222; color:#fff; font-size:13px; outline:none;">
                    <option value="viewer" ${currentRole === 'viewer' ? 'selected' : ''}>Viewer (Hanya Melihat)</option>
                    <option value="editor" ${currentRole === 'editor' ? 'selected' : ''}>Editor (Bisa Input & Edit)</option>
                    <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin OPD</option>
                </select>
            </div>
            
            <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button class="btn btn-primary" id="btn-save-custom-role" style="font-size:13px;">💾 Simpan</button>
                <button class="btn btn-secondary" onclick="document.getElementById('modal-custom-role').remove()" style="font-size:13px;">Batal</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);

    // Menyimpan perubahan ke tabel user_roles Supabase
    document.getElementById('btn-save-custom-role').onclick = async function() {
        const roleBaru = document.getElementById('select-new-role').value;
        this.innerText = "⏳ Menyimpan...";
        this.disabled = true;

        try {
            if (typeof sbFetch !== 'undefined') {
                // Melakukan update data role ke Supabase
                await sbFetch(`/rest/v1/user_roles?user_id=eq.${userId}`, 'PATCH', { role: roleBaru });
                
                if (typeof toast === 'function') toast('Role berhasil diperbarui!', 'success');
                else alert('Role berhasil diperbarui!');
                
                modal.remove();
                location.reload(); // Sinkronisasi ulang tampilan layar halaman
            } else {
                throw new Error("Koneksi database (sbFetch) tidak siap.");
            }
        } catch (err) {
            alert("Gagal memperbarui role: " + err.message);
            this.innerText = "💾 Simpan";
            this.disabled = false;
        }
    };
}

// Menjalankan pemindaian otomatis agar tombol langsung disisipkan saat menu dibuka
setInterval(injekTombolEditRole, 600);


