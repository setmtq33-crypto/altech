// ============================================================
//  SI-DEVA — Multi-OPD UI Components (Safe Version)
// ============================================================

// Fungsi untuk menampilkan selector OPD di topbar (jika ada)
function renderOpdSelector() {
  // Pastikan fungsi isLoggedIn tersedia
  if (typeof isLoggedIn !== 'function' || !isLoggedIn()) return;
  
  const container = document.getElementById('opd-selector-container');
  if (!container) return;
  
  // 🔥 Hanya Super Admin yang boleh melihat dan menggunakan selector
  const isSuper = (typeof isSuperAdmin === 'function' && isSuperAdmin());
  if (!isSuper) {
    container.innerHTML = '';
    return;
  }
  
  const opdList = typeof getUserOpdList === 'function' ? getUserOpdList() : [];
  const currentOpdId = typeof getCurrentOpdId === 'function' ? getCurrentOpdId() : window._currentOpdId;
  
  if (!opdList.length) {
    container.innerHTML = '<span style="font-size:12px;opacity:0.6;">Tidak ada OPD</span>';
    return;
  }
  
  let html = '<select id="opd-selector" style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 8px;font-size:12px;min-width:180px;">';
  opdList.forEach(opd => {
    const selected = (opd.id == currentOpdId) ? 'selected' : '';
    const nama = opd.namaOpd || opd.nama || opd.id;
    html += `<option value="${opd.id}" ${selected}>${escapeHtml(nama)}</option>`;
  });
  html += '</select>';
  container.innerHTML = html;
  
  const selector = document.getElementById('opd-selector');
  if (selector) {
    // Hapus event listener lama dengan clone
    const newSelector = selector.cloneNode(true);
    selector.parentNode.replaceChild(newSelector, selector);
    newSelector.addEventListener('change', async function(e) {
      const newOpdId = e.target.value;
      if (typeof setCurrentOpd === 'function') {
        try {
          await setCurrentOpd(newOpdId);
          // Data sudah reload di dalam setCurrentOpd, dan renderAll() sudah dipanggil
          if (typeof toast === 'function') {
            toast(`Berganti ke OPD: ${newSelector.options[newSelector.selectedIndex].text}`, 'success');
          }
        } catch(err) {
          console.error('Ganti OPD error:', err);
          if (typeof toast === 'function') toast(err.message, 'error');
        }
      }
    });
  }
}

// Event listener ketika OPD berubah
if (typeof window !== 'undefined') {
  window.addEventListener('opd-changed', function() {
    renderOpdSelector();
    // Refresh halaman yang sedang aktif agar data sesuai OPD baru
    if (typeof currentPage !== 'undefined' && currentPage) {
      if (currentPage === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
      else if (currentPage === 'paket' && typeof renderPaket === 'function') renderPaket();
      else if (currentPage === 'rincian' && typeof renderRincian === 'function') renderRincian();
      else if (currentPage === 'harga' && typeof renderHarga === 'function') renderHarga();
      else if (currentPage === 'penyedia' && typeof renderPenyedia === 'function') renderPenyedia();
      else if (currentPage === 'master' && typeof renderMaster === 'function') renderMaster();
    }
  });
}

// Inisialisasi saat sb-ready
if (typeof window !== 'undefined') {
  window.addEventListener('sb-ready', function() {
    setTimeout(renderOpdSelector, 300);
  });
}

// Helper escapeHtml jika belum ada
if (typeof escapeHtml !== 'function') {
  window.escapeHtml = function(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  };
}
