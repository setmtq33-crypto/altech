// ============================================================
// SI-DEVA — Branding Patch v8 (UI/UX Clean)
// Ganti file lama branding-patch.js dengan ini
// ============================================================

// ============================================================
// FIX: HARD REFRESH LOGOUT BUSTER (ANTI-TRAP URL)
// ============================================================
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Cek apakah ada token aktif Supabase di dalam localStorage
    const hasActiveSession = Object.keys(localStorage).some(key => 
        key.startsWith('sb-') && key.endsWith('-auth-token')
    );

    // Jika user punya sesi login aktif tetapi di URL-nya terdeteksi jebakan '?loggedout'
    if (hasActiveSession && urlParams.has('loggedout')) {
        console.warn("[SI-DEVA Auth] Sesi aktif ditemukan. Membersihkan jebakan URL '?loggedout'...");
        
        // Hapus parameter 'loggedout' dari memori URL
        urlParams.delete('loggedout');
        
        // Susun kembali URL yang bersih
        const newSearch = urlParams.toString();
        const cleanUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
        
        // Ubah URL di Address Bar secara instan tanpa memicu reload/logout
        window.history.replaceState({}, document.title, cleanUrl);
    }
})();
// ============================================================






(function _applyBranding() {
  const style = document.createElement('style');
  style.textContent = `
    #sidebar-instansi-name {
      font-size: 11px; color: var(--text3); text-align:center;
      padding: 0 12px 8px; line-height:1.4; letter-spacing:.2px;
      border-bottom:1px solid var(--border); margin-bottom:6px;
    }
    #sideva-fullname-hero {
      font-size:13px; color:var(--text3); font-style:italic;
      margin:4px 0 10px; letter-spacing:.3px;
    }
    #sideva-copyright-bar {
      text-align:center; font-size:10.5px; color:var(--text3);
      padding:10px 14px; border-top:1px solid var(--border);
      line-height:1.5;
    }
    #sideva-copyright-bar strong { color:var(--gold); font-weight:700; }
  `;
  document.head.appendChild(style);

  function inject() {
    // 1. Nama instansi
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !document.getElementById('sidebar-instansi-name')) {
      const nameDiv = document.createElement('div');
      nameDiv.id = 'sidebar-instansi-name';
      sidebar.insertBefore(nameDiv, sidebar.querySelector('.sidebar-nav'));
    }

    // 2. Copyright bar (versi konsisten v7)
    if (sidebar && !document.getElementById('sideva-copyright-bar')) {
      const copy = document.createElement('div');
      copy.id = 'sideva-copyright-bar';
      copy.innerHTML = `
        <div style="display:flex;justify-content:center;gap:10px;margin-bottom:4px;opacity:.8">
          <span>📄</span><span>🔒</span><span>⚙️</span>
        </div>
        <strong>SI-DEVA v7</strong><br>
        Created by <strong>Alam Satria, S.Kep., Ners., M.A.P</strong><br>
        <span style="font-size:9px">© 2026 Hak Cipta Dilindungi</span>
      `;
      sidebar.appendChild(copy);
    }

    // 3. Subtitle hero
    const heroSub = document.getElementById('hero-subtitle');
    if (heroSub && !document.getElementById('sideva-fullname-hero')) {
      const full = document.createElement('div');
      full.id = 'sideva-fullname-hero';
      full.textContent = 'Sistem Informasi Digital Evaluasi Verifikasi Administrasi';
      heroSub.before(full);
    }

    // 4. Update data instansi
    const cfg = (()=>{ try{return JSON.parse(localStorage.getItem('sideva_config')||'{}')}catch{return{}} })();
    const nameDiv = document.getElementById('sidebar-instansi-name');
    if (nameDiv) {
      nameDiv.textContent = cfg.namaInstansi ? (cfg.namaInstansi + (cfg.kabupaten ? '\n'+cfg.kabupaten : '')) : (cfg.singkatan || 'Instansi Pemerintah');
    }
    const footer = document.getElementById('footer-instansi');
    if (footer) {
      const label = cfg.singkatan ? cfg.singkatan + (cfg.kabupaten ? ' '+cfg.kabupaten : '') : 'Instansi Pemerintah';
      footer.textContent = `SI-DEVA v7 · ${label} · © 2026 Alam Satria`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else { inject(); }
  
  window.addEventListener('sb-ready', ()=> setTimeout(inject, 600));
})();
