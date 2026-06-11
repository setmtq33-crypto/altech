// ============================================================
//  SI-DEVA — Fix Submenu Dokumen (Label, Ikon, Urutan)
//  Tidak mengubah struktur HTML, hanya memodifikasi konten & urutan
// ============================================================
(function() {
  const DOKUMEN_MAP = {
    'idkb':      { label: 'Identifikasi Kebutuhan',                icon: '🪪',  badge: 'IDKB' },
    'penetapan': { label: 'Penetapan Cara Pengadaan',              icon: '✅',  badge: 'PENETAPAN' },
    'nodis':     { label: 'Nota Dinas',                            icon: '📬',  badge: 'NODIS' },
    'sppbj':     { label: 'Surat Perintah Pengadaan Barang/Jasa',  icon: '📨',  badge: 'SPPBJ' },
    'formdpp':   { label: 'Dokumen Persiapan Pengadaan',           icon: '🧮',  badge: 'DPP' },
    'formspek':  { label: 'Spesifikasi Teknis',                    icon: '🧷',  badge: 'SPEK' },
    'riviu':     { label: 'Riviu Dokumen Persiapan Pengadaan',     icon: '📝',  badge: 'RIVIU' },
    'evhp':      { label: 'Evaluasi Harga',                        icon: '📑',  badge: 'EVHP' },
    'evat':      { label: 'Evaluasi Administrasi',                 icon: '📄',  badge: 'EVAT' },
    'bahpe':     { label: 'Berita Acara Hasil Pengadaan E-Purchasing', icon: '📋',  badge: 'BAHPE' }
  };
  const ORDER = [
    'idkb', 'penetapan', 'nodis', 'sppbj', 'formdpp',
    'formspek', 'riviu', 'evhp', 'evat', 'bahpe'
  ];

  function fixMenu() {
    const container = document.getElementById('nav-group-dokumen');
    if (!container) return;

    // 1. Ubah label, ikon, dan badge setiap item
    const items = container.querySelectorAll('.nav-item');
    items.forEach(item => {
      const onclick = item.getAttribute('onclick') || '';
      const match = onclick.match(/showPage\(\s*['"]([^'"]+)['"]\s*\)/);
      if (match) {
        const pageId = match[1];
        const meta = DOKUMEN_MAP[pageId];
        if (meta) {
          // Ganti ikon
          const iconSpan = item.querySelector('.icon');
          if (iconSpan) iconSpan.textContent = meta.icon;

          // Cari elemen teks label (bisa berupa text node atau span)
          let labelNode = null;
          for (let node of item.childNodes) {
            if (node.nodeType === 3 && node.textContent.trim() !== '') {
              labelNode = node;
              break;
            }
            if (node.nodeType === 1 && node.tagName === 'SPAN' && !node.classList.contains('icon') && !node.classList.contains('nav-badge')) {
              labelNode = node;
              break;
            }
          }
          if (labelNode) {
            labelNode.textContent = meta.label;
            // Hapus badge lama jika ada
            const oldBadge = item.querySelector('.dok-kode-badge');
            if (oldBadge) oldBadge.remove();
            // Tambah badge baru
            const badgeSpan = document.createElement('span');
            badgeSpan.className = 'dok-kode-badge';
            badgeSpan.textContent = meta.badge;
            labelNode.parentNode.insertBefore(badgeSpan, labelNode.nextSibling);
          }
        }
      }
    });

    // 2. Urutkan ulang item sesuai ORDER
    const orderedItems = [];
    for (const pageId of ORDER) {
      for (let child of container.children) {
        const onclick = child.getAttribute('onclick') || '';
        if (onclick.includes(`'${pageId}'`) || onclick.includes(`"${pageId}"`)) {
          orderedItems.push(child);
          break;
        }
      }
    }
    // Pindahkan semua item yang sudah diurutkan ke container (otomatis mengubah urutan DOM)
    orderedItems.forEach(item => container.appendChild(item));
  }

  function run() {
    if (document.getElementById('nav-group-dokumen')) fixMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 500);
  setTimeout(run, 1500);
  window.addEventListener('sb-ready', () => setTimeout(run, 300));
})();
function fixMenu() {
    // Cari semua tombol nav-item yang ada onclick showPage
    const allItems = document.querySelectorAll('.sidebar-nav .nav-item');
    allItems.forEach(item => {
      const onclick = item.getAttribute('onclick') || '';
      const match = onclick.match(/showPage\(\s*['"]([^'"]+)['"]\s*\)/);
      if (match) {
        const page = match[1];
        const data = MAP[page];
        if (data) {
          // Ganti ikon
          const iconSpan = item.querySelector('.icon');
          if (iconSpan) iconSpan.textContent = data.icon;
          // Ganti teks label (cari text node atau span tanpa class)
          let targetSpan = null;
          for (let child of item.childNodes) {
            if (child.nodeType === 3 && child.textContent.trim() !== '') {
              targetSpan = child;
              break;
            }
            if (child.nodeType === 1 && child.tagName === 'SPAN' && !child.classList.contains('icon') && !child.classList.contains('nav-badge')) {
              targetSpan = child;
              break;
            }
          }
          if (targetSpan) {
            targetSpan.textContent = data.label;
            // Hapus badge lama jika ada
            const oldBadge = item.querySelector('.dok-kode-badge');
            if (oldBadge) oldBadge.remove();
            // Tambah badge baru
            const badgeSpan = document.createElement('span');
            badgeSpan.className = 'dok-kode-badge';
            badgeSpan.textContent = data.badge;
            targetSpan.parentNode.insertBefore(badgeSpan, targetSpan.nextSibling);
          }
        }
      }
    });
    // Urutkan ulang grup dokumen berdasarkan urutan yang diinginkan
    const order = ['idkb','penetapan','nodis','sppbj','formdpp','formspek','riviu','evhp','evat','bahpe'];
    const container = document.querySelector('.nav-group-items');
    if (container && container.classList.contains('open')) {
      const items = order.map(p => {
        for (let item of container.children) {
          const onclick = item.getAttribute('onclick') || '';
          if (onclick.includes(`'${p}'`) || onclick.includes(`"${p}"`)) return item;
        }
        return null;
      }).filter(v => v);
      items.forEach(item => container.appendChild(item));
    }
  }
