// ============================================================
// UTILITY GUARD - SI-DEVA V6
// Memastikan fungsi dasar tersedia sebelum modul lain dijalankan
// ============================================================

(function() {
  'use strict';

  // ── PASTIKAN FUNGSI TOAST TERSEDIA ────────────────────────
  if (typeof window.toast !== 'function') {
    window.toast = function(message, type = 'info') {
      console.log(`[${type.toUpperCase()}] ${message}`);
      // Buat elemen toast sederhana jika diperlukan
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    };
  }

  // ── PASTIKAN FUNGSI SHOWPAGE TERSEDIA ──────────────────────
  if (typeof window.showPage !== 'function') {
    window.showPage = function(pageName) {
      console.warn(`showPage('${pageName}') dipanggil sebelum definisi lengkap. Coba lagi nanti.`);
      // Simpan permintaan untuk dieksekusi setelah DOM siap
      if (!window._pendingShowPage) window._pendingShowPage = [];
      window._pendingShowPage.push(pageName);
    };
  }

  // ── PASTIKAN OBJEK STATE DAN MASTERSTATE ───────────────────
  if (typeof window.state === 'undefined') {
    window.state = {
      paket: { data: [], filtered: [], page: 1, perPage: 10, sortCol: 'createdAt', sortDir: 'asc' },
      rincian: { data: [], filtered: [], page: 1, perPage: 10, sortCol: 'no', sortDir: 'asc' },
      harga: { data: [], filtered: [], page: 1, perPage: 10, sortCol: 'rup', sortDir: 'asc' },
      penyedia: { data: [], filtered: [], page: 1, perPage: 10, sortCol: 'namaPenyedia', sortDir: 'asc' }
    };
  }
  if (typeof window.masterState === 'undefined') {
    window.masterState = {
      bidang: [], opd: [], rekening: [], ppk: [], pejabatPengadaan: [], ecatalog: []
    };
  }

  // ── PASTIKAN FUNGSI-FUNGSI CRITICAL LAINNYA ────────────────
  const safeFunctions = [
    'renderAll', 'updateBadges', 'populateDropdowns', 'filterPaket',
    'filterRincian', 'filterHarga', 'filterPenyedia', 'applyDashboardFilters'
  ];
  safeFunctions.forEach(fn => {
    if (typeof window[fn] !== 'function') {
      window[fn] = function() {
        console.warn(`Fungsi ${fn}() belum terdefinisi. Dipanggil terlalu dini.`);
      };
    }
  });

  // ── HAPUS PENDING SHOWPAGE SETELAH DOM SIAP ────────────────
  document.addEventListener('DOMContentLoaded', function() {
    if (window._pendingShowPage && window._pendingShowPage.length) {
      window._pendingShowPage.forEach(page => {
        if (typeof window.showPage === 'function') window.showPage(page);
        else console.error('showPage masih belum tersedia');
      });
      delete window._pendingShowPage;
    }
  });

  console.log('✅ Utility guard aktif - fungsi dasar siap');
})();

// Fungsi global untuk menghitung nilai kontrak pemenang per RUP
window._hitungNilaiKontrakRUP = function(rup) {
    if (!window.state || !window.state.harga) return 0;
    const hargaForRup = window.state.harga.data.filter(h => String(h.rup) === String(rup));
    if (!hargaForRup.length) return 0;
    const totals = {};
    hargaForRup.forEach(h => {
        if (!h.namaPenyedia) return;
        const nilai = (Number(h.negoFinal) > 0 ? Number(h.negoFinal) : (Number(h.hargaTayang) || 0)) * (Number(h.qty) || 1);
        totals[h.namaPenyedia] = (totals[h.namaPenyedia] || 0) + nilai;
    });
    const entries = Object.entries(totals).filter(e => e[1] > 0);
    if (!entries.length) return 0;
    const pemenang = entries.reduce((a, b) => a[1] <= b[1] ? a : b)[0];
    return totals[pemenang] || 0;
};

// Override fmtRp dan escapeHtml jika belum ada
if (typeof window.fmtRp !== 'function') {
    window.fmtRp = function(value) {
        if (!value && value !== 0) return '-';
        return 'Rp ' + Number(value).toLocaleString('id-ID');
    };
}
if (typeof window.escapeHtml !== 'function') {
    window.escapeHtml = function(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    };
}














