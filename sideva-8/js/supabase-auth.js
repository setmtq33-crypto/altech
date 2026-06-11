// ============================================================
// SI-DEVA — Auth UI & Role Management v8.1 (PATCH nama_opd)
// ============================================================

(function injectAuthStyle() {
  const s = document.createElement('style');
  s.id = 'sideva-auth-style';
  s.textContent = `
   .hidden { display: none!important; }
   .admin-only { display: none!important; }
    button.admin-only.sideva-admin-show,
   .nav-item.admin-only.sideva-admin-show { display: flex!important; width: 100%; }
    div.admin-only.sideva-admin-show { display: block!important; }
    #role-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
   .role-super_admin { background: rgba(168,85,247,.15); color: #a855f7; border: 1px solid rgba(168,85,247,.3); }
   .role-admin_opd { background: rgba(251,191,36,.15); color: #fbbf24; border: 1px solid rgba(251,191,36,.3); }
   .role-admin { background: rgba(251,191,36,.15); color: #fbbf24; border: 1px solid rgba(251,191,36,.3); }
   .role-operator { background: rgba(96,165,250,.15); color: #60a5fa; border: 1px solid rgba(96,165,250,.3); }
   .role-viewer { background: rgba(148,163,184,.15); color: #94a3b8; border: 1px solid rgba(148,163,184,.3); }
    #opd-name-badge { display: inline-flex; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; background: rgba(74,222,128,.12); color: #4ade80; border: 1px solid rgba(74,222,128,.25); margin-left: 6px; }
  `;
  document.head.appendChild(s);
})();

function showAuthOverlay() {
  const old = document.getElementById('auth-overlay');
  if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.id = 'auth-overlay';
  overlay.innerHTML = `<div id="auth-box"><h2>📋 SI-DEVA</h2><p>Masuk untuk mengakses sistem</p><input id="ai-email" class="auth-input" type="email" placeholder="Email"><input id="ai-password" class="auth-input" type="password" placeholder="Password"><div class="auth-error" id="ai-error"></div><div class="auth-btn-row"><button class="auth-btn auth-btn-primary" onclick="doAuthLogin()">Masuk</button><button class="auth-btn auth-btn-secondary" onclick="doAuthRegister()">Daftar</button></div></div>`;
  document.body.appendChild(overlay);
}
function hideAuthOverlay() { document.getElementById('auth-overlay')?.remove(); }

async function doAuthLogin() {
  const email = document.getElementById('ai-email')?.value.trim();
  const password = document.getElementById('ai-password')?.value;
  const errEl = document.getElementById('ai-error');
  if (!email ||!password) { errEl.textContent = 'Email dan password wajib diisi.'; return; }
  errEl.textContent = 'Memuat...';
  try {
    await sbLogin(email, password);
    hideAuthOverlay();
    await loadAllData();
    _startPolling();
    applyRoleUI();
    if (typeof renderAll === 'function') renderAll();
    toast(`☁️ Selamat datang! ${getRole()}${window._userOpdName? ' - ' + window._userOpdName : ''}`, 'success');
  } catch(err) {
    errEl.textContent = 'Login gagal: ' + err.message;
  }
}
async function doAuthRegister() {
  const email = document.getElementById('ai-email')?.value.trim();
  const password = document.getElementById('ai-password')?.value;
  const errEl = document.getElementById('ai-error');
  if (!email ||!password) { errEl.textContent = 'Email dan password wajib diisi.'; return; }
  try {
    await sbRegister(email, password);
    errEl.style.color = '#4ade80';
    errEl.textContent = '✅ Akun dibuat! Silakan login.';
  } catch(err) {
    errEl.textContent = 'Gagal daftar: ' + err.message;
  }
}

function applyRoleUI() {
  const role = getRole();
  const isSuper = isSuperAdmin();
  const isAdminRole = isAdmin();
  _updateRoleBadge(role);
  const writeActions = document.querySelectorAll('button[onclick*="openAddModal"],.btn-tambah');
  writeActions.forEach(btn => { btn.style.display = isOperator()? '' : 'none'; });
  document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('sideva-admin-show'));
  if (isSuper) {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('sideva-admin-show'));
  } else if (isAdminRole) {
    document.querySelectorAll('.admin-only:not(#nav-manajemen-opd)').forEach(el => el.classList.add('sideva-admin-show'));
  }
}

function _updateRoleBadge(role) {
  document.getElementById('role-badge')?.remove();
  document.getElementById('opd-name-badge')?.remove();
  const badge = document.createElement('span');
  badge.id = 'role-badge';
  const labels = { super_admin: '🔱 Super Admin', admin_opd: '🏢 Admin OPD', admin: '👑 Admin', operator: '✏️ Operator', viewer: '👁️ Viewer' };
  badge.textContent = labels[role] || role;
  badge.className = `role-badge role-${role}`;
  const footer = document.querySelector('.sidebar-footer');
  if (footer) {
    footer.prepend(badge);
    if (role === 'admin_opd' && window._userOpdName) {
      const opdBadge = document.createElement('span');
      opdBadge.id = 'opd-name-badge';
      opdBadge.textContent = '🏢 ' + window._userOpdName;
      footer.prepend(opdBadge);
    }
  }
}

window.addEventListener('sb-ready', (e) => {
  if (e.detail.loggedIn) { applyRoleUI(); } else { showAuthOverlay(); }
});