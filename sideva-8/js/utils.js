// ============================================
// UTILITIES - SI-DEVA V6
// ============================================

// ============================================
// SHOW PAGE - CLASSIC ROUTER (SINGLE SOURCE OF TRUTH)
// ============================================


// Escape HTML untuk mencegah XSS
window.escapeHtml = function(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
};

// Format Rupiah (pakai jika belum ada)
window.fmtRp = function(value) {
  if (!value && value !== 0) return '-';
  return 'Rp ' + Number(value).toLocaleString('id-ID');
};

// ============================================
// LOADING SPINNER HELPER (ditambahkan)
// ============================================
window.showLoading = function(show, text = 'Memuat...') {
  let overlay = document.getElementById('global-loading-overlay');
  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-loading-overlay';
      overlay.className = 'spinner-overlay';
      overlay.innerHTML = '<div class="spinner"></div><div class="loading-text">' + text + '</div>';
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = 'flex';
      var textEl = overlay.querySelector('.loading-text');
      if (textEl) textEl.textContent = text;
    }
  } else {
    if (overlay) overlay.style.display = 'none';
  }
};
