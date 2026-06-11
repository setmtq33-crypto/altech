// ============================================================
//  SI-DEVA v6 — Router Ultimate (Fix Navigasi & Modal)
//  - Tidak memblokir navigasi meskipun sb-ready belum terjadi
//  - Menjaga window.currentPage selalu sinkron
//  - Fallback ke konten inline jika fetch gagal
// ============================================================

(function() {
  'use strict';

  const pages = {
    dashboard:      { file: 'pages/dashboard.html',      title: 'Dashboard', render: 'renderDashboard' },
    paket:          { file: 'pages/paket.html',          title: 'Data Paket', render: 'renderPaket' },
    rincian:        { file: 'pages/rincian.html',        title: 'Rincian Belanja', render: 'filterRincian' },
    harga:          { file: 'pages/harga.html',          title: 'Survey Harga', render: 'filterHarga' },
    penyedia:       { file: 'pages/penyedia.html',       title: 'Data Penyedia', render: 'filterPenyedia' },
    master:         { file: 'pages/master.html',         title: 'Data Master', render: 'renderMaster' },
    ecatalog:       { file: 'pages/ecatalog.html',       title: 'E-Catalog', render: 'renderEcatalog' },
    laporan:        { file: 'pages/laporan.html',        title: 'Laporan Realisasi', render: 'renderLaporan' },
    'rekap-bidang': { file: 'pages/rekap-bidang.html',   title: 'Rekap per Bidang', render: 'renderRekapBidang' },
    'manajemen-user': { file: 'pages/manajemen-user.html', title: 'Manajemen User', render: 'renderManajemenUser' },
    'manajemen-akses': { file: 'pages/manajemen-akses.html', title: 'Manajemen Akses', render: 'maLoadRoles' },
    'opd-management': { file: 'pages/opd-management.html', title: 'Manajemen OPD', render: 'renderOpdManagement' },
    backup:         { file: 'pages/backup.html',         title: 'Backup & Restore', render: null },
    pengaturan:     { file: 'pages/pengaturan.html',     title: 'Pengaturan Instansi', render: 'renderPengaturanPage' },
    evat:           { file: 'pages/evat.html',           title: 'EV_AT', render: null },
    evhp:           { file: 'pages/evhp.html',           title: 'EV_HP', render: null },
    formspek:       { file: 'pages/formspek.html',       title: 'Form Spek', render: null },
    formdpp:        { file: 'pages/formdpp.html',        title: 'Form DPP', render: null },
    nodis:          { file: 'pages/nodis.html',          title: 'Nodis', render: null },
    riviu:          { file: 'pages/riviu.html',          title: 'Riviu', render: null },
    penetapan:      { file: 'pages/penetapan.html',      title: 'Penetapan', render: null },
    idkb:           { file: 'pages/idkb.html',           title: 'IDKB', render: null },
    bahpe:          { file: 'pages/bahpe.html',          title: 'BAHPE', render: null },
    sppbj:          { file: 'pages/sppbj.html',          title: 'SPPBJ', render: null },
    'audit-log':    { file: 'pages/audit-log.html',      title: 'Audit Log', render: 'renderAuditLog' },
    import:         { file: 'pages/import.html',         title: 'Import Data', render: null },
    help:           { file: 'pages/help.html',           title: 'Bantuan', render: 'renderHelpContent' },
    'error-log':    { file: 'pages/error-log.html',      title: 'Error Log', render: 'renderErrorLog' }
  };

  let _loading = false;

  // Override showPage global (satu-satunya)
  window.showPage = async function(pageName) {
    if (!pages[pageName]) {
      console.error(`Halaman "${pageName}" tidak dikenal`);
      return;
    }

    if (_loading) {
      console.log('Masih loading, abaikan');
      return;
    }

    _loading = true;
    const page = pages[pageName];

    try {
      console.log(`📄 Memuat halaman: ${pageName} dari ${page.file}`);
      let response;
      let html;
      try {
        response = await fetch(page.file);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        html = await response.text();
      } catch (fetchErr) {
        console.warn(`Gagal fetch ${page.file}, gunakan fallback inline:`, fetchErr.message);
        // Fallback: ambil konten inline dari index.html
        const inlinePage = document.getElementById(`page-${pageName}`);
        if (inlinePage && inlinePage.innerHTML) {
          html = inlinePage.outerHTML;
        } else {
          throw new Error(`File ${page.file} tidak ditemukan dan tidak ada fallback inline untuk #page-${pageName}`);
        }
      }

      // Suntikkan ke container
      const container = document.getElementById('page-content');
      if (!container) throw new Error('Container #page-content tidak ditemukan');
      container.innerHTML = html;

      // Update title & breadcrumb
      const titleEl = document.getElementById('topbar-title');
      const bcEl = document.getElementById('topbar-breadcrumb-cur');
      if (titleEl) titleEl.textContent = page.title;
      if (bcEl) bcEl.textContent = page.title;

      // Update active class di sidebar
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        const onclick = btn.getAttribute('onclick') || '';
        if (onclick.includes(`'${pageName}'`) || onclick.includes(`"${pageName}"`)) {
          btn.classList.add('active');
        }
      });

      // === KRUSIAL: Sinkronkan window.currentPage ===
      window.currentPage = pageName;

      window.dispatchEvent(new CustomEvent('sideva:page-changed', {
        detail: { page: pageName, title: page.title }
      }));

      // Panggil fungsi render / inisialisasi setelah DOM stabil
      setTimeout(() => {
        try {
          if (page.render && typeof window[page.render] === 'function') {
            console.log(`🎨 Memanggil ${page.render} untuk halaman ${pageName}`);
            if (pageName === 'rekap-bidang') {
              window[page.render]('rekap-bidang-content');
            } else {
              window[page.render]();
            }
          } else if (page.render) {
            console.warn(`Fungsi ${page.render} tidak ditemukan untuk halaman ${pageName}`);
          }

          // Inisialisasi tambahan untuk halaman tertentu
          if (pageName === 'rincian') {
            const rupSel = document.getElementById('filter-rupdd-rincian');
            if (rupSel && window.state && window.state.paket && window.state.paket.data) {
              const cur = rupSel.value;
              rupSel.innerHTML = '<option value="">— Pilih RUP + Paket —</option>';
              window.state.paket.data.forEach(p => {
                rupSel.innerHTML += `<option value="${p.rup}">${p.rup} - ${(p.namaPaket || '').slice(0,40)}</option>`;
              });
              rupSel.value = cur;
            }
            if (typeof window.validasiKelengkapanPembanding === 'function') {
              setTimeout(window.validasiKelengkapanPembanding, 200);
            }
          }

          if (pageName === 'harga') {
            const rupSel = document.getElementById('filter-rupdd-harga');
            if (rupSel && window.state && window.state.paket && window.state.paket.data) {
              const cur = rupSel.value;
              rupSel.innerHTML = '<option value="">— Pilih RUP + Paket —</option>';
              window.state.paket.data.forEach(p => {
                rupSel.innerHTML += `<option value="${p.rup}">${p.rup} - ${(p.namaPaket || '').slice(0,40)}</option>`;
              });
              rupSel.value = cur;
            }
          }

          // Populate dropdowns umum (bidang, rekening, dll)
          if (typeof window.populateDropdowns === 'function' && !['rincian', 'harga'].includes(pageName)) {
            window.populateDropdowns();
          }

          // Update badge counts
          if (typeof window.updateBadges === 'function') window.updateBadges();

        } catch (initErr) {
          console.error(`Error in initPage for ${pageName}:`, initErr);
        }
      }, 60);

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error(`Gagal memuat halaman ${pageName}:`, err);
      const container = document.getElementById('page-content');
      if (container) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><div class="empty-title">Gagal memuat halaman</div><div class="empty-sub">${err.message}</div></div>`;
      }
    } finally {
      _loading = false;
    }
  };

  // Muat dashboard pertama kali saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.showPage('dashboard'));
  } else {
    window.showPage('dashboard');
  }

  console.log('✅ Router v6 (final) loaded – navigasi langsung tersedia');
})();
