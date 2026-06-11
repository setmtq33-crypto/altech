// ============================================================
// SI-DEVA — Auth UI & Role Management v8.2 (Fixed Logout)
// ============================================================
(function injectAuthStyle(){ 
  const s=document.createElement('style'); 
  s.id='sideva-auth-style'; 
  s.textContent=`.hidden{display:none!important}.admin-only{display:none!important}button.admin-only.sideva-admin-show,.nav-item.admin-only.sideva-admin-show{display:flex!important;width:100%}body.sideva-auth-locked{overflow:hidden!important}body.sideva-auth-locked .app{visibility:hidden!important;pointer-events:none!important}#auth-overlay{position:fixed!important;inset:0!important;z-index:999999!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:16px!important;background:linear-gradient(135deg,rgba(15,23,42,.96),rgba(17,24,39,.94))!important;box-sizing:border-box!important}#auth-box{box-shadow:0 24px 80px rgba(0,0,0,.45)!important;border:1px solid rgba(255,255,255,.12)!important}#role-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}.role-super_admin{background:rgba(168,85,247,.15);color:#a855f7;border:1px solid rgba(168,85,247,.3)}.role-admin_opd{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3)}.role-admin{background:rgba(251,191,36,.15);color:#fbbf24;border:1px solid rgba(251,191,36,.3)}.role-operator{background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.3)}.role-viewer{background:rgba(148,163,184,.15);color:#94a3b8;border:1px solid rgba(148,163,184,.3)}`;
  document.head.appendChild(s); 
})();

function showAuthOverlay(){ 
  document.body.classList.add('sideva-auth-locked');
  const o=document.getElementById('auth-overlay'); 
  if(o) o.remove(); 
  const d=document.createElement('div'); 
  d.id='auth-overlay'; 
  d.innerHTML=`<div id="auth-box" style="background:#1a1a1a;padding:40px;border-radius:16px;width:380px"><h2>📋 SI-DEVA</h2><p>Masuk</p><input id="ai-email" class="auth-input" type="email" placeholder="Email" style="width:100%;padding:10px;margin-bottom:12px"><input id="ai-password" class="auth-input" type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px"><div id="ai-error" style="color:#f87171;font-size:12px;min-height:18px"></div><button onclick="doAuthLogin()" style="width:100%;padding:10px;background:#c9a227;border:none;border-radius:8px;font-weight:600">Masuk</button></div>`; 
  document.body.appendChild(d); 
}

function hideAuthOverlay(){
  document.body.classList.remove('sideva-auth-locked');
  document.getElementById('auth-overlay')?.remove();
}

async function doAuthLogin(){ 
  const e=document.getElementById('ai-email')?.value.trim(); 
  const p=document.getElementById('ai-password')?.value; 
  const err=document.getElementById('ai-error'); 
  if(!e||!p){err.textContent='Isi email & password';return} 
  err.textContent='Memuat...'; 
  try{ 
    await sbLogin(e,p); 
    hideAuthOverlay(); 
    await loadAllData(); 
    if(typeof _startPolling === 'function') _startPolling(); 
    applyRoleUI(); 
    if(typeof renderAll==='function') renderAll(); 
    if(typeof toast === 'function') toast(`☁️ Selamat datang! ${getRole()}${window._userOpdName?' - '+window._userOpdName:''}`,'success'); 
  }catch(er){ 
    err.textContent='Login gagal: '+er.message; 
  } 
}

function applyRoleUI(){ 
  const role=getRole(); 
  const isSuper=isSuperAdmin(); 
  const isAdminRole=isAdmin(); 
  _updateRoleBadge(role); 
  document.querySelectorAll('.admin-only').forEach(el=>el.classList.remove('sideva-admin-show')); 
  if(isSuper){ 
    document.querySelectorAll('.admin-only').forEach(el=>el.classList.add('sideva-admin-show')); 
  } else if(isAdminRole){ 
    document.querySelectorAll('.admin-only').forEach(el=>{ 
      if(!['nav-manajemen-opd','nav-audit-log'].includes(el.id)) el.classList.add('sideva-admin-show'); 
    }); 
  } 
}

function _updateRoleBadge(role){ 
  document.getElementById('role-badge')?.remove(); 
  document.getElementById('opd-name-badge')?.remove(); 
  const b=document.createElement('span'); 
  b.id='role-badge'; 
  const l={super_admin:'🔱 Super Admin',admin_opd:'🏢 Admin OPD',admin:'👑 Admin',operator:'✏️ Operator',viewer:'👁️ Viewer'}; 
  b.textContent=l[role]||role; 
  b.className=`role-badge role-${role}`; 
  const f=document.querySelector('.sidebar-footer'); 
  if(f){ 
    f.prepend(b); 
    if(role==='admin_opd'&&window._userOpdName){ 
      const o=document.createElement('span'); 
      o.id='opd-name-badge'; 
      o.textContent='🏢 '+window._userOpdName; 
      o.style.cssText='margin-left:6px;padding:2px 8px;border-radius:12px;font-size:10px;background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.25)'; 
      f.prepend(o); 
    } 
  } 
}

function injectAuthPanel(){ 
  const m=document.getElementById('sync-panel-mount'); 
  if(!m) return; 
  if(!isLoggedIn()){ 
    m.innerHTML=`<button onclick="showAuthOverlay()">🔐 Masuk</button>`; 
    return; 
  } 
  const r=getRole(); 
  const u=getCurrentUser(); 
  m.innerHTML=`<div><span>☁️ ${u?.email||''}</span> <span class="role-${r}">${r}</span></div><button onclick="loadAllData().then(()=>renderAll())">🔄 Refresh</button> <button onclick="doCloudLogout()">Keluar</button>`; 
}

function _clearSupabaseStorage(){
  localStorage.removeItem('sideva_session_v3');
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      sessionStorage.removeItem(key);
    }
  });
}

function _withTimeout(promise, ms){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timeout')), ms))
  ]);
}

async function doCloudLogout(){
  const btn = document.getElementById('logout-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Keluar...';
  }

  try {
    if(typeof _stopPolling === 'function') _stopPolling();
    showAuthOverlay();

    if (typeof sbLogout === 'function') {
      await _withTimeout(sbLogout(), 4000);
    }

    if(window._supa?.auth?.signOut){
      try {
        await _withTimeout(window._supa.auth.signOut({ scope: 'global' }), 4000);
      } catch(_) {}
    }

    _clearSupabaseStorage();

    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const name = cookies[i].split("=")[0].trim();
        if (!name || (!name.startsWith('sb-') && !name.includes('supabase'))) continue;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    }

    window._userData = null;
    window._userRole = null;

    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.replace(cleanUrl + '?loggedout=' + Date.now());
    
  } catch(e){
    console.error('Logout error:', e);
    _clearSupabaseStorage();
    window.location.replace(window.location.pathname + '?loggedout=' + Date.now());
  }
}
window.doCloudLogout = doCloudLogout;

// Listeners
window.addEventListener('sb-ready', e => { 
  if(e.detail.loggedIn){ 
    applyRoleUI(); 
  } else { 
    showAuthOverlay(); 
  } 
});

window.addEventListener('sideva:page-changed', e => { 
  if(e?.detail?.page==='backup') setTimeout(()=>injectAuthPanel(),50); 
});
