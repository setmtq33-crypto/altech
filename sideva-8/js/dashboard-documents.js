// ============================================================
//  SI-DEVA — Dokumen Pengadaan (EV_AT, EV_HP, FormSpek, dll)
//  Dipisahkan dari dashboard.js untuk maintenance
// ============================================================

// ── Helper: getActiveDocConfig, getDocOrg, getDefaultDocNumber sudah ada di dashboard.js
//    Namun agar file ini mandiri, kita gunakan yang sudah ada di global.
//    Pastikan fungsi-fungsi tersebut sudah didefinisikan sebelum file ini di-load.

// ============================================================
//  PRINT MARGIN SETTINGS (per-form)
// ============================================================
if (!window.PRINT_MARGIN_DEFAULTS) window.PRINT_MARGIN_DEFAULTS = {
  evat:     { top: 20, right: 20, bottom: 20, left: 25 },
  evhp:     { top: 18, right: 20, bottom: 20, left: 25 },
  formspek: { top: 18, right: 20, bottom: 20, left: 25 },
  formdpp:  { top: 18, right: 20, bottom: 20, left: 25 },
  nodis:    { top: 18, right: 20, bottom: 20, left: 25 },
  riviu:    { top: 18, right: 20, bottom: 20, left: 25 },
  penetapan:{ top: 18, right: 20, bottom: 20, left: 25 },
  idkb:     { top: 18, right: 20, bottom: 20, left: 25 },
  bahpe:    { top: 18, right: 20, bottom: 20, left: 25 }
};
var PRINT_MARGIN_DEFAULTS = window.PRINT_MARGIN_DEFAULTS;

function getPrintMargins(key){
  const def = PRINT_MARGIN_DEFAULTS[key] || { top:18, right:20, bottom:18, left:20 };
  try {
    const raw = localStorage.getItem('printMargin_' + key);
    if (!raw) return def;
    const v = JSON.parse(raw);
    return {
      top:    Number.isFinite(+v.top)    ? +v.top    : def.top,
      right:  Number.isFinite(+v.right)  ? +v.right  : def.right,
      bottom: Number.isFinite(+v.bottom) ? +v.bottom : def.bottom,
      left:   Number.isFinite(+v.left)   ? +v.left   : def.left
    };
  } catch(e){ return def; }
}

function buildPageRule(key){
  const m = getPrintMargins(key);
  return `@page { size: A4; margin: ${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm; }
  @media print {
    .doc-nomor-edit { display: none !important; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    img { page-break-inside: avoid; max-width: 100%; }
    h1,h2,h3,h4 { page-break-after: avoid; }
    p { orphans: 3; widows: 3; }
    .section-block { page-break-inside: avoid; }
    tbody tr { page-break-inside: avoid; }
    table { page-break-inside: auto; }
  }`;
}

function openMarginDialog(key, label){
  const cur = getPrintMargins(key);
  const def = PRINT_MARGIN_DEFAULTS[key];
  const old = document.getElementById('margin-dialog'); if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.id = 'margin-dialog';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:"Plus Jakarta Sans",system-ui,sans-serif;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:22px 24px;width:360px;max-width:92vw;box-shadow:0 20px 60px rgba(0,0,0,.25);">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px;color:#111;">⚙️ Pengaturan Margin Cetak</div>
      <div style="font-size:12px;color:#666;margin-bottom:14px;">${label} — satuan milimeter (mm), kertas A4</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <label style="font-size:12px;color:#333;">Atas (top)
          <input id="mg-top" type="number" min="0" max="60" step="1" value="${cur.top}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
        <label style="font-size:12px;color:#333;">Bawah (bottom)
          <input id="mg-bottom" type="number" min="0" max="60" step="1" value="${cur.bottom}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
        <label style="font-size:12px;color:#333;">Kiri (left)
          <input id="mg-left" type="number" min="0" max="60" step="1" value="${cur.left}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
        <label style="font-size:12px;color:#333;">Kanan (right)
          <input id="mg-right" type="number" min="0" max="60" step="1" value="${cur.right}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap;">
        <button id="mg-reset" style="padding:8px 12px;border:1px solid #d0d7de;background:#fff;border-radius:6px;font-size:13px;cursor:pointer;">Reset Default</button>
        <button id="mg-cancel" style="padding:8px 12px;border:1px solid #d0d7de;background:#fff;border-radius:6px;font-size:13px;cursor:pointer;">Batal</button>
        <button id="mg-save" style="padding:8px 14px;border:0;background:#2563eb;color:#fff;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;">Simpan</button>
      </div>
      <div style="font-size:11px;color:#888;margin-top:10px;">Tip: kurangi margin atas/bawah untuk mengurangi area kosong saat cetak.</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
  document.getElementById('mg-cancel').onclick = ()=> overlay.remove();
  document.getElementById('mg-reset').onclick = ()=> {
    document.getElementById('mg-top').value    = def.top;
    document.getElementById('mg-right').value  = def.right;
    document.getElementById('mg-bottom').value = def.bottom;
    document.getElementById('mg-left').value   = def.left;
  };
  document.getElementById('mg-save').onclick = ()=> {
    const v = {
      top:    +document.getElementById('mg-top').value    || 0,
      right:  +document.getElementById('mg-right').value  || 0,
      bottom: +document.getElementById('mg-bottom').value || 0,
      left:   +document.getElementById('mg-left').value   || 0
    };
    localStorage.setItem('printMargin_' + key, JSON.stringify(v));
    overlay.remove();
    if (typeof toast === 'function') toast('Margin tersimpan untuk ' + label, 'success');
  };
}

// ── Helper: Dispatch print event untuk notifikasi Telegram ────
function _notifyPrintDocument(docName, docType = 'Dokumen') {
  window.dispatchEvent(new CustomEvent('sideva:print-document', {
    detail: { docName, docType }
  }));
}

// ── PRINT CURRENT DOC (tombol PDF di topbar) ──────────────────────────────────
function printCurrentDoc() {
  const btn  = document.getElementById('topbar-print-btn');
  const slug = btn ? btn.getAttribute('data-slug') : currentPage;
  
  const docNameMap = {
    evat:      'Evaluasi Administrasi',
    evhp:      'Evaluasi Harga',
    bahpe:     'Berita Acara Hasil Pengadaan',
    formspek:  'Spesifikasi Teknis',
    formdpp:   'Dokumen Persiapan Pengadaan',
    nodis:     'Nota Dinas',
    riviu:     'Riviu Dokumen',
    penetapan: 'Penetapan Cara Pengadaan',
    idkb:      'Identifikasi Kebutuhan',
  };
  
  const printFnMap = {
    evat:      printEvat,
    evhp:      printEvhp,
    bahpe:     printBahpe,
  };
  if (printFnMap[slug]) {
    _notifyPrintDocument(docNameMap[slug] || slug, 'Print');
    printFnMap[slug]();
  } else if (['formspek','formdpp','nodis','riviu','penetapan','idkb'].includes(slug)) {
    _notifyPrintDocument(docNameMap[slug] || slug, 'Export PDF');
    saveToPDF(slug);
  } else {
    toast('Pilih dokumen terlebih dahulu', 'error');
  }
}

// ── SAVE TO PDF (universal) ──────────────────────────────────────────────────
if (!window._PDF_META) window._PDF_META = {
  evat:      { title: 'BA_Evaluasi_Penyedia_E-Purchasing' },
  evhp:      { title: 'BA_Evaluasi_Harga_Penawaran' },
  formspek:  { title: 'Spesifikasi_Teknis' },
  formdpp:   { title: 'Formulir_DPP' },
  nodis:     { title: 'Nota_Dinas_Pengajuan_Belanja' },
  riviu:     { title: 'BA_Riviu_DPP_E-Purchasing' },
  penetapan: { title: 'Formulir_Penetapan_BJ' },
  idkb:      { title: 'Identifikasi_Kebutuhan_BJ' },
  bahpe:     { title: 'BA_Hasil_Penetapan_E-Purchasing' },
  sppbj:     { title: 'Surat_Perintah_Pengadaan_BJ' },
};
var _PDF_META = window._PDF_META;

function saveToPDF(slug) {
  const areaId = slug + '-print-area';
  const printArea = document.getElementById(areaId);
  if (!printArea) { toast('Pilih No RUP terlebih dahulu', 'error'); return; }

  const meta     = _PDF_META[slug] || { title: slug };
  const instansi = (appConfig.singkatan || 'SIDEVA').replace(/\s+/g,'_');
  const tgl      = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${meta.title}_${instansi}_${tgl}`;

  const hint = `<div id="pdf-hint-bar" style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#16a34a;color:#fff;font-family:system-ui;font-size:13px;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 -2px 16px rgba(0,0,0,.25);">
      <span>💡 <strong>Simpan sebagai PDF:</strong> Di dialog cetak pilih <em>Destination → Save as PDF</em> ${isMac ? '— atau tekan <strong>⌘P</strong>' : '— atau tekan <strong>Ctrl+P</strong>'}</span>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button onclick="window.print()" style="background:#fff;color:#16a34a;border:none;border-radius:6px;padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ Cetak / Simpan PDF</button>
        <button onclick="document.getElementById('pdf-hint-bar').remove()" style="background:rgba(255,255,255,.25);color:#fff;border:none;border-radius:6px;padding:7px 10px;font-size:12px;cursor:pointer;">✕</button>
      </div>
    </div>`;

  const sharedCss = `
    ${buildPageRule(slug)}
    @media screen {
      body { max-width:210mm; margin:0 auto; padding:20mm 20mm 80px; background:#f0f0f0; }
      body > *:not(#pdf-hint-bar) { background:#fff; }
    }
    @media print { #pdf-hint-bar { display:none !important; } }
    * { box-sizing:border-box; color:#000 !important; }
    body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.5; }
    table { border-collapse:collapse; width:100%; }
    thead { display:table-header-group; }
    tfoot { display:table-footer-group; }
    tbody tr { page-break-inside:auto; }
    th, td { border:1px solid #000; word-wrap:break-word; }
    p { margin:4px 0; orphans:3; widows:3; }
    .section-block { page-break-inside:auto; }
    [id$="-print-area"] { padding:0!important; max-width:100%!important; width:100%!important; margin:0!important; box-shadow:none!important; border-radius:0!important; background:#fff!important; line-height:1.45; }
    img { max-width:100%; height:auto; display:block; }
    table { table-layout:fixed; width:100%!important; }
    table.data-tbl th:first-child, table.data-tbl td:first-child, th.no-col, td.no-col { width:34px!important; text-align:center!important; vertical-align:middle!important; white-space:nowrap; padding-left:4px!important; padding-right:4px!important; }
    thead th { text-align:center!important; vertical-align:middle!important; }
    .num, td.num { text-align:right!important; white-space:nowrap; }
    td > table { border:0!important; }
    .doc-nomor-edit { display:none!important; }`;

  const win = window.open('', '_blank');
  if (!win) { toast('Popup diblokir browser. Izinkan popup untuk halaman ini.', 'error'); return; }
  win.document.write(`<!DOCTYPE html>
    <html><head>
      <title>${filename}</title>
      <style>${sharedCss}</style>
    </head>
    <body>${printArea.innerHTML}${hint}</body>
    </html>`);
  win.document.close();
  win.focus();
}

// ============================================================
//  GENERIC DOCUMENT ZOOM PREVIEW
// ============================================================
(function() {
  const _docZoomState = {};
  const MIN = 50, MAX = 150;

  function _applyDocZoom(slug) {
    const pct = _docZoomState[slug] || 100;
    const area    = document.getElementById(slug + '-print-area');
    const label   = document.getElementById(slug + '-zoom-label');
    const wrapper = document.getElementById(slug + '-content');
    if (!area) return;
    const scale = pct / 100;
    area.style.transform       = 'scale(' + scale + ')';
    area.style.transformOrigin = 'top center';
    if (wrapper) wrapper.style.minHeight = Math.round(area.scrollHeight * scale + 24) + 'px';
    if (label)   label.textContent = pct + '%';
  }

  window.docZoom = function(slug, delta) {
    _docZoomState[slug] = Math.min(MAX, Math.max(MIN, (_docZoomState[slug] || 100) + delta));
    _applyDocZoom(slug);
  };

  window.docZoomReset = function(slug) {
    _docZoomState[slug] = 100;
    _applyDocZoom(slug);
  };

  // Wrap setiap load*Data untuk menerapkan zoom setelah render
  const _loaders = [
    'loadBahpeData','loadEvatData','loadEvhpData','loadFormSpekData',
    'loadFormDppData','loadNodisData','loadRiviuData',
    'loadPenetapanData','loadIdkbData','loadSppbjData'
  ];
  const _slugMap = {
    loadBahpeData:'bahpe', loadEvatData:'evat', loadEvhpData:'evhp',
    loadFormSpekData:'formspek', loadFormDppData:'formdpp',
    loadNodisData:'nodis', loadRiviuData:'riviu',
    loadPenetapanData:'penetapan', loadIdkbData:'idkb',
    loadSppbjData:'sppbj'
  };
  _loaders.forEach(function(fn) {
    const orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function() {
      orig.apply(this, arguments);
      setTimeout(function() { _applyDocZoom(_slugMap[fn]); }, 50);
    };
  });

  // Legacy aliases untuk BAHPE
  window.bahpeZoom      = function(d) { window.docZoom('bahpe', d); };
  window.bahpeZoomReset = function()  { window.docZoomReset('bahpe'); };
})();


// ============================================================
//  KOP SURAT (override jika perlu)
// ============================================================
// Fungsi kopSurat sudah ada di dashboard.js, tidak perlu dipindah.
// Tapi jika di dashboard.js asli ada, biarkan saja.


// ============================================================
//  EV_AT FUNCTIONS - Evaluasi Administrasi Teknis
// ============================================================

function populateEvatRupSelect() {
  const select = document.getElementById('evat-rup-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Pilih No RUP --</option>';
  state.paket.data.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.rup;
    opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
    select.appendChild(opt);
  });
  populateEvhpRupSelect(); // sync
}


function populateEvatPejabatSelect() {
  const select = document.getElementById('evat-pejabat-select');
  if (!select) return;
  const cur = select.value;
  select.innerHTML = '<option value="">-- Pilih Pejabat Pengadaan --</option>';
  masterState.pejabatPengadaan.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nama;
    select.appendChild(opt);
  });
  select.value = cur;
}

function loadEvatData() {
  const rup = document.getElementById('evat-rup-select').value;
  const pejabatId = document.getElementById('evat-pejabat-select').value;
  const content = document.getElementById('evat-content');
  
  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih nomor RUP di atas untuk menampilkan data evaluasi administrasi dan teknis</div>
      </div>`;
    return;
  }

  // Get pejabat pengadaan yang dipilih (dari master atau default)
  let pejabatPengadaan = { nama: '<span style="color:#c05050;font-style:italic;">⚠ Belum dipilih — tambahkan di Data Master</span>', nip: '-' };
  if (pejabatId) {
    const found = masterState.pejabatPengadaan.find(p => String(p.id) === String(pejabatId));
    if (found) pejabatPengadaan = found;
  }

  // Get paket data for this RUP
  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // Get penyedia data from harga table for this RUP
  const hargaForRup = state.harga.data.filter(h => String(h.rup) === String(rup));
  const penyediaNames = [...new Set(hargaForRup.map(h => h.namaPenyedia).filter(Boolean))];
  
  // If no penyedia found, get from penyedia master (take first 2)
  let penyediaList = penyediaNames.length > 0 ? penyediaNames : state.penyedia.data.slice(0, 3).map(p => p.namaPenyedia);
  penyediaList = penyediaList.slice(0, 3); // Max 3 penyedia
  // Pastikan selalu ada 3 kolom penyedia (pad dengan placeholder jika kurang)
  while (penyediaList.length < 2) {
    penyediaList.push('PENYEDIA ' + (penyediaList.length + 1));
  }

  // Ambil tanggal dari tanggalPesanan paket, fallback ke hari ini
  const tglSrc = paket.tanggalPesanan ? paket.tanggalPesanan : '';
  // Parse tanggal secara lokal (YYYY-MM-DD) agar tidak terjadi offset zona waktu
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }
  const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const satuanAngka = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas','Dua Belas','Tiga Belas','Empat Belas','Lima Belas','Enam Belas','Tujuh Belas','Delapan Belas','Sembilan Belas','Dua Puluh','Dua Puluh Satu','Dua Puluh Dua','Dua Puluh Tiga','Dua Puluh Empat','Dua Puluh Lima','Dua Puluh Enam','Dua Puluh Tujuh','Dua Puluh Delapan','Dua Puluh Sembilan','Tiga Puluh','Tiga Puluh Satu'];
  // Terbilang untuk tahun (mendukung 2020-2099)
  function terbilangTahun(y) {
    const ratusan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan'];
    const ribuan  = Math.floor(y / 1000);
    const sisa    = y % 1000;
    const r       = Math.floor(sisa / 100);
    const puluhan = sisa % 100;
    let result = (ribuan === 1 ? 'Seribu' : ratusan[ribuan] + ' Ribu');
    if (r > 0) result += ' ' + ratusan[r] + ' Ratus';
    if (puluhan > 0) result += ' ' + (puluhan < satuanAngka.length ? satuanAngka[puluhan] : '');
    return result.trim();
  }
  const tglAngka  = tglDate.getDate();          // 1-31
  const bulanIdx  = tglDate.getMonth();          // 0-11
  const tahunNum  = tglDate.getFullYear();
  const hariText      = namaHari[tglDate.getDay()];
  const bulanText     = namaBulan[bulanIdx];
  const tanggalTerb   = satuanAngka[tglAngka] || String(tglAngka);
  const tahunTerb     = terbilangTahun(tahunNum);
  const tanggalPanjang = `${tanggalTerb} Bulan ${bulanText} Tahun ${tahunTerb}`;
  const now = tglDate; // gunakan tanggal pesanan sebagai referensi nomor dokumen
  const docCfg = getActiveDocConfig();
  const docInstansi = docCfg.namaInstansi || 'Instansi Pemerintah';
  const docKabupaten = docCfg.kabupaten || 'Kabupaten Kapuas Hulu';
  const docSingkatan = docCfg.singkatan || 'SIDEVA';
  const savedNomorEvat = String(paket.nomorEvat || '');
  const nomorEvatDefault = `PP/${paket.rup || '...'}/BAHEV-AT/${docSingkatan}/${tahunNum}`;
  const nomorEvat = savedNomorEvat && !(docSingkatan !== 'BAPPERIDA' && savedNomorEvat.includes('/BAPPERIDA/'))
    ? savedNomorEvat
    : nomorEvatDefault;

  // Aspek penilaian evaluasi administrasi teknis
  const aspekPenilaian = [
    { no: 1, aspek: 'NIB/OSS; NPWP', nilai: 'Ada' },
    { no: 2, aspek: 'KBLI', nilai: 'Ada' },
    { no: 3, aspek: 'Tidak sedang dikenakan Sanksi Daftar Hitam', nilai: 'Ya' },
    { no: 4, aspek: 'Status Penyedia Terdaftar aktif di katalog elektronik LKPP', nilai: 'Aktif' },
    { no: 5, aspek: 'Jenis Penyedia UMKM', nilai: 'Ya' },
    { no: 6, aspek: 'Alamat penyedia di Kab. Kapuas Hulu', nilai: 'Ya' },
    { no: 7, aspek: 'Barang di Etalase minimal menampilkan (Nama produk, harga, no. KBKI, satuan produk, berat produk dan dimensi produk)', nilai: 'Ya' },
    { no: 8, aspek: 'Jenis Produk PDN', nilai: 'Ya' },
    { no: 9, aspek: 'Menjamin ketersediaan Barang dan/atau Jasa yang sesuai dengan spesifikasi', nilai: 'Tersedia dan Spesifikasi Sesuai Kebutuhan' },
    { no: 10, aspek: 'Jaminan Bebas Cacat Mutu dan Garansi purna jual', nilai: 'Ya' },
    { no: 11, aspek: 'Memastikan kesesuaian informasi Barang dan/atau Jasa Produk yang diunggah pada Katalog Elektronik sesuai', nilai: 'Ya' },
    { no: 12, aspek: 'Penyedia bersedia memberikan layanan tambahan yang diperjanjikan seperti instalasi, testing, asuransi dan pelatihan (apabila ada).', nilai: 'Ya' },
    { no: 13, aspek: 'Layanan jasa pengiriman disiapkan oleh Penyedia', nilai: 'Ya' },
  ];

  // Build the document HTML
  content.innerHTML = `
    <div id="evat-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">
      
      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL DOKUMEN -->
      <div class="section-block" style="text-align:center;margin-bottom:20px;">
        <div style="font-size:14pt;font-weight:bold;text-decoration:underline;color:#000;">BERITA ACARA HASIL EVALUASI PENYEDIA E-PURCHASING</div>
        <div style="font-size:12pt;color:#000;">Nomor : ${nomorEvat} <button onclick="openNomorDialog(this)" data-slug="evat" data-rup="${paket.rup}" data-field="nomorEvat" data-cur="${nomorEvat}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- PARAGRAF PEMBUKA -->
      <p style="text-align:justify;margin-bottom:16px;color:#000;">
        Pada Hari ini ${hariText} Tanggal ${tanggalPanjang} yang bertandatangan dibawah ini selaku Pejabat Pengadaan pada ${docInstansi} ${docKabupaten} telah melaksanakan verifikasi penyedia jasa melalui E-Purchasing, dengan hasil sebagai berikut :
      </p>

      <!-- A. DATA UMUM -->
      <div style="margin-bottom:16px;">
        <div style="font-weight:bold;margin-bottom:8px;color:#000;">A.&nbsp;&nbsp;&nbsp;DATA UMUM</div>
        <table style="margin-left:24px;font-size:13px;color:#000;border-collapse:collapse;">
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;width:180px;color:#000;border:none;">Kode RUP</td><td style="padding:2px 8px;vertical-align:top;width:16px;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.rup || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nama Paket</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.namaPaket || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Pagu</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${fmtRp(paket.paguAnggaran)}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Mata Anggaran Belanja</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.kodeRekening || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Metode</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">E - Purchasing dengan Negosiasi Harga</td></tr>
        </table>
      </div>

      <!-- B. EVALUASI ADMINISTRASI DAN TEKNIS -->
      <div style="margin-bottom:16px;">
        <div style="font-weight:bold;margin-bottom:8px;color:#000;">B.&nbsp;&nbsp;&nbsp;EVALUASI ADMINISTRASI DAN TEKNIS</div>
        <p style="margin-left:24px;margin-bottom:12px;color:#000;">Verifikasi Penyedia Jasa (Berdasarkan Syarat dan Ketentuan Katalog Elektronik Versi 6)</p>
        
        <table style="width:100%;border-collapse:collapse;font-size:11pt;table-layout:fixed;color:#000;">
          <colgroup>
            <col style="width:36px;">
            <col style="width:auto;">
            ${penyediaList.map(() => '<col style="width:110px;">').join('')}
            <col style="width:46px;">
          </colgroup>
          <thead style="display:table-header-group;">
            <tr>
              <th class="no-col" style="border:1px solid #000;padding:8px;text-align:center;vertical-align:middle;color:#000;background:#fff;" rowspan="2">No</th>
              <th style="border:1px solid #000;padding:8px;text-align:center;vertical-align:middle;color:#000;background:#fff;" rowspan="2">Aspek penilaian</th>
              <th style="border:1px solid #000;padding:8px;text-align:center;color:#000;background:#fff;" colspan="${penyediaList.length}">Nama Penyedia</th>
              <th style="border:1px solid #000;padding:8px;text-align:center;vertical-align:middle;color:#000;background:#fff;" rowspan="2">Ket</th>
            </tr>
            <tr>
              ${penyediaList.map(name => `<th style="border:1px solid #000;padding:6px 4px;text-align:center;font-weight:bold;color:#000;background:#fff;word-wrap:break-word;white-space:normal;font-size:10pt;">${name.toUpperCase()}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${aspekPenilaian.map(item => `
              <tr style="page-break-inside:avoid;">
                <td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:top;color:#000;">${item.no}</td>
                <td style="border:1px solid #000;padding:6px;vertical-align:top;color:#000;">${item.aspek}</td>
                ${penyediaList.map(() => `<td style="border:1px solid #000;padding:6px;text-align:center;vertical-align:top;color:#000;">${item.nilai}</td>`).join('')}
                <td style="border:1px solid #000;padding:6px;color:#000;"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- PARAGRAF PENUTUP -->
      <p style="text-align:justify;margin:20px 0;color:#000;">
        Dari beberapa penyedia produk pada E-Katalog lokal Kabupaten Kapuas Hulu yang produknya sesuai dengan kebutuhan dan spesifikasi pada paket pekerjaan tersebut pilih untuk pembanding sebanyak ${penyediaList.length} penyedia serta dari hasil verifikasi dan evaluasi memenuhi persyaratan Administrasi dan Teknis.
      </p>

      <p style="text-align:justify;margin-bottom:24px;color:#000;">
        Demikian Berita Acara Pemilihan Calon Penyedia ini dibuat untuk dapat digunakan sebagaimana mestinya.
      </p>

      <!-- TTD -->
      <div class="section-block" style="display:flex;justify-content:flex-end;margin-top:40px;">
        <div style="text-align:left;width:320px;color:#000;">
          <div style="color:#000;">${docInstansi}</div>
          <div style="font-weight:bold;margin-bottom:60px;color:#000;">Pejabat Pengadaan</div>
          <div style="font-weight:bold;text-decoration:underline;color:#000;">${pejabatPengadaan.nama || '<span style="color:#c05050;font-style:italic;">⚠ Pilih Pejabat Pengadaan</span>'}</div>
          <div style="color:#000;">${pejabatPengadaan.nip || 'NIP. 198711182015021003'}</div>
        </div>
      </div>
    </div>
  `;
}


// ============================================================
//  PRINT MARGIN SETTINGS (per-form, disimpan di localStorage)
// ============================================================
if (!window.PRINT_MARGIN_DEFAULTS) window.PRINT_MARGIN_DEFAULTS = {
  evat:     { top: 20, right: 20, bottom: 20, left: 25 },
  evhp:     { top: 18, right: 20, bottom: 20, left: 25 },
  formspek: { top: 18, right: 20, bottom: 20, left: 25 },
  formdpp:  { top: 18, right: 20, bottom: 20, left: 25 },
  nodis:    { top: 18, right: 20, bottom: 20, left: 25 },
  riviu:    { top: 18, right: 20, bottom: 20, left: 25 },
  penetapan:{ top: 18, right: 20, bottom: 20, left: 25 },
  idkb:     { top: 18, right: 20, bottom: 20, left: 25 },
  bahpe:    { top: 18, right: 20, bottom: 20, left: 25 }
};
var PRINT_MARGIN_DEFAULTS = window.PRINT_MARGIN_DEFAULTS;
function getPrintMargins(key){
  const def = PRINT_MARGIN_DEFAULTS[key] || { top:18, right:20, bottom:18, left:20 };
  try {
    const raw = localStorage.getItem('printMargin_' + key);
    if (!raw) return def;
    const v = JSON.parse(raw);
    return {
      top:    Number.isFinite(+v.top)    ? +v.top    : def.top,
      right:  Number.isFinite(+v.right)  ? +v.right  : def.right,
      bottom: Number.isFinite(+v.bottom) ? +v.bottom : def.bottom,
      left:   Number.isFinite(+v.left)   ? +v.left   : def.left
    };
  } catch(e){ return def; }
}
function buildPageRule(key){
  const m = getPrintMargins(key);
  return `@page { size: A4; margin: ${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm; }
  @media print {
    .doc-nomor-edit { display: none !important; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    img { page-break-inside: avoid; max-width: 100%; }
    h1,h2,h3,h4 { page-break-after: avoid; }
    p { orphans: 3; widows: 3; }
    .section-block { page-break-inside: avoid; }
    tbody tr { page-break-inside: avoid; }
    table { page-break-inside: auto; }
  }`;
}
function openMarginDialog(key, label){
  const cur = getPrintMargins(key);
  const def = PRINT_MARGIN_DEFAULTS[key];
  // Hapus dialog lama bila ada
  const old = document.getElementById('margin-dialog'); if (old) old.remove();
  const overlay = document.createElement('div');
  overlay.id = 'margin-dialog';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:"Plus Jakarta Sans",system-ui,sans-serif;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:22px 24px;width:360px;max-width:92vw;box-shadow:0 20px 60px rgba(0,0,0,.25);">
      <div style="font-size:16px;font-weight:700;margin-bottom:4px;color:#111;">⚙️ Pengaturan Margin Cetak</div>
      <div style="font-size:12px;color:#666;margin-bottom:14px;">${label} — satuan milimeter (mm), kertas A4</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <label style="font-size:12px;color:#333;">Atas (top)
          <input id="mg-top" type="number" min="0" max="60" step="1" value="${cur.top}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
        <label style="font-size:12px;color:#333;">Bawah (bottom)
          <input id="mg-bottom" type="number" min="0" max="60" step="1" value="${cur.bottom}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
        <label style="font-size:12px;color:#333;">Kiri (left)
          <input id="mg-left" type="number" min="0" max="60" step="1" value="${cur.left}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
        <label style="font-size:12px;color:#333;">Kanan (right)
          <input id="mg-right" type="number" min="0" max="60" step="1" value="${cur.right}" style="width:100%;margin-top:4px;padding:8px;border:1px solid #d0d7de;border-radius:6px;font-size:13px;">
        </label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap;">
        <button id="mg-reset" style="padding:8px 12px;border:1px solid #d0d7de;background:#fff;border-radius:6px;font-size:13px;cursor:pointer;">Reset Default</button>
        <button id="mg-cancel" style="padding:8px 12px;border:1px solid #d0d7de;background:#fff;border-radius:6px;font-size:13px;cursor:pointer;">Batal</button>
        <button id="mg-save" style="padding:8px 14px;border:0;background:#2563eb;color:#fff;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;">Simpan</button>
      </div>
      <div style="font-size:11px;color:#888;margin-top:10px;">Tip: kurangi margin atas/bawah untuk mengurangi area kosong saat cetak.</div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });
  document.getElementById('mg-cancel').onclick = ()=> overlay.remove();
  document.getElementById('mg-reset').onclick = ()=> {
    document.getElementById('mg-top').value    = def.top;
    document.getElementById('mg-right').value  = def.right;
    document.getElementById('mg-bottom').value = def.bottom;
    document.getElementById('mg-left').value   = def.left;
  };
  document.getElementById('mg-save').onclick = ()=> {
    const v = {
      top:    +document.getElementById('mg-top').value    || 0,
      right:  +document.getElementById('mg-right').value  || 0,
      bottom: +document.getElementById('mg-bottom').value || 0,
      left:   +document.getElementById('mg-left').value   || 0
    };
    localStorage.setItem('printMargin_' + key, JSON.stringify(v));
    overlay.remove();
    if (typeof toast === 'function') toast('Margin tersimpan untuk ' + label, 'success');
  };
}

// ── Helper: Dispatch print event untuk notifikasi Telegram ────
function _notifyPrintDocument(docName, docType = 'Dokumen') {
  window.dispatchEvent(new CustomEvent('sideva:print-document', {
    detail: { docName, docType }
  }));
}

// ── PRINT CURRENT DOC (tombol PDF di topbar) ──────────────────────────────────
function printCurrentDoc() {
  const btn  = document.getElementById('topbar-print-btn');
  const slug = btn ? btn.getAttribute('data-slug') : currentPage;
  
  const docNameMap = {
    evat:      'Evaluasi Administrasi',
    evhp:      'Evaluasi Harga',
    bahpe:     'Berita Acara Hasil Pengadaan',
    formspek:  'Spesifikasi Teknis',
    formdpp:   'Dokumen Persiapan Pengadaan',
    nodis:     'Nota Dinas',
    riviu:     'Riviu Dokumen',
    penetapan: 'Penetapan Cara Pengadaan',
    idkb:      'Identifikasi Kebutuhan',
  };
  
  const printFnMap = {
    evat:      printEvat,
    evhp:      printEvhp,
    bahpe:     printBahpe,
  };
  if (printFnMap[slug]) {
    _notifyPrintDocument(docNameMap[slug] || slug, 'Print');
    printFnMap[slug]();
  } else if (['formspek','formdpp','nodis','riviu','penetapan','idkb'].includes(slug)) {
    _notifyPrintDocument(docNameMap[slug] || slug, 'Export PDF');
    saveToPDF(slug);
  } else {
    toast('Pilih dokumen terlebih dahulu', 'error');
  }
}

// ── SAVE TO PDF (universal) ──────────────────────────────────────────────────
if (!window._PDF_META) window._PDF_META = {
  evat:      { title: 'BA_Evaluasi_Penyedia_E-Purchasing' },
  evhp:      { title: 'BA_Evaluasi_Harga_Penawaran' },
  formspek:  { title: 'Spesifikasi_Teknis' },
  formdpp:   { title: 'Formulir_DPP' },
  nodis:     { title: 'Nota_Dinas_Pengajuan_Belanja' },
  riviu:     { title: 'BA_Riviu_DPP_E-Purchasing' },
  penetapan: { title: 'Formulir_Penetapan_BJ' },
  idkb:      { title: 'Identifikasi_Kebutuhan_BJ' },
  bahpe:     { title: 'BA_Hasil_Penetapan_E-Purchasing' },
  sppbj:     { title: 'Surat_Perintah_Pengadaan_BJ' },
};
var _PDF_META = window._PDF_META;

function saveToPDF(slug) {
  const areaId = slug + '-print-area';
  const printArea = document.getElementById(areaId);
  if (!printArea) { toast('Pilih No RUP terlebih dahulu', 'error'); return; }

  const meta     = _PDF_META[slug] || { title: slug };
  const instansi = (appConfig.singkatan || 'SIDEVA').replace(/\s+/g,'_');
  const tgl      = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${meta.title}_${instansi}_${tgl}`;

  const hint = `<div id="pdf-hint-bar" style="
      position:fixed;bottom:0;left:0;right:0;z-index:99999;
      background:#16a34a;color:#fff;
      font-family:system-ui,-apple-system,sans-serif;font-size:13px;
      padding:10px 20px;display:flex;align-items:center;
      justify-content:space-between;gap:16px;
      box-shadow:0 -2px 16px rgba(0,0,0,.25);
    ">
      <span>
        💡 <strong>Simpan sebagai PDF:</strong>
        Di dialog cetak pilih <em>Destination → Save as PDF</em>
        ${isMac ? '— atau tekan <strong>⌘P</strong>' : '— atau tekan <strong>Ctrl+P</strong>'}
      </span>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button onclick="window.print()"
          style="background:#fff;color:#16a34a;border:none;border-radius:6px;
                 padding:7px 16px;font-size:13px;font-weight:700;cursor:pointer;">
          🖨️ Cetak / Simpan PDF
        </button>
        <button onclick="document.getElementById('pdf-hint-bar').remove()"
          style="background:rgba(255,255,255,.25);color:#fff;border:none;
                 border-radius:6px;padding:7px 10px;font-size:12px;cursor:pointer;">
          ✕
        </button>
      </div>
    </div>`;

  const sharedCss = `
    ${buildPageRule(slug)}
    @media screen {
      body { max-width:210mm; margin:0 auto; padding:20mm 20mm 80px; background:#f0f0f0; }
      body > *:not(#pdf-hint-bar) { background:#fff; }
    }
    @media print { #pdf-hint-bar { display:none !important; } }
    * { box-sizing:border-box; color:#000 !important; }
    body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt;
           color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.5; }
    table { border-collapse:collapse; width:100%; }
    thead { display:table-header-group; }
    tfoot { display:table-footer-group; }
    tbody tr { page-break-inside:auto; }
    th, td { border:1px solid #000; word-wrap:break-word; }
    p { margin:4px 0; orphans:3; widows:3; }
    .section-block { page-break-inside:auto; }
    [id$="-print-area"] { padding:0!important; max-width:100%!important; width:100%!important;
      margin:0!important; box-shadow:none!important; border-radius:0!important;
      background:#fff!important; line-height:1.45; }
    img { max-width:100%; height:auto; display:block; }
    table { table-layout:fixed; width:100%!important; }
    table.data-tbl th:first-child, table.data-tbl td:first-child,
    th.no-col, td.no-col { width:34px!important; text-align:center!important;
      vertical-align:middle!important; white-space:nowrap;
      padding-left:4px!important; padding-right:4px!important; }
    thead th { text-align:center!important; vertical-align:middle!important; }
    .num, td.num { text-align:right!important; white-space:nowrap; }
    td > table { border:0!important; }
    .doc-nomor-edit { display:none!important; }`;

  const win = window.open('', '_blank');
  if (!win) { toast('Popup diblokir browser. Izinkan popup untuk halaman ini.', 'error'); return; }
  win.document.write(`<!DOCTYPE html>
    <html><head>
      <title>${filename}</title>
      <style>${sharedCss}</style>
    </head>
    <body>${printArea.innerHTML}${hint}</body>
    </html>`);
  win.document.close();
  win.focus();
}
// ─────────────────────────────────────────────────────────────────────────────

function printEvat() {
  const printArea = document.getElementById('evat-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Berita Acara Hasil Evaluasi Penyedia E-Purchasing</title>
      <style>
        ${buildPageRule('evat')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          color: #000;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* Semua teks hitam */
        * { color: #000 !important; }
        /* Tabel: header ulang di setiap halaman */
        table {
          border-collapse: collapse;
          width: 100%;
          table-layout: fixed;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        tbody tr {
          page-break-inside: auto;
        }
        th, td {
          border: 1px solid #000;
          word-wrap: break-word;
        }
        p { margin: 4px 0; orphans: 3; widows: 3; }
        /* Paragraf dan section jangan terpotong sembarangan */
        .section-block { page-break-inside: auto; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>
      ${printArea.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

// ============================================================
//  EV_HP FUNCTIONS - Evaluasi Harga Penawaran E-Purchasing
// ============================================================
function populateEvhpRupSelect() {
  const select = document.getElementById('evhp-rup-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- Pilih No RUP --</option>';
  state.paket.data.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.rup;
    opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
    select.appendChild(opt);
  });
}

function populateEvhpPejabatSelect() {
  const select = document.getElementById('evhp-pejabat-select');
  if (!select) return;
  const cur = select.value;
  select.innerHTML = '<option value="">-- Pilih Pejabat Pengadaan --</option>';
  masterState.pejabatPengadaan.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nama;
    select.appendChild(opt);
  });
  select.value = cur;
}

function evhpNormalizeText(s) {
  return (s || '').toLowerCase()
    .replace(/[/\\.,;:'"()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function evhpMatchScore(a, b) {
  const na = evhpNormalizeText(a);
  const nb = evhpNormalizeText(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;

  const wa = new Set(na.split(' ').filter(Boolean));
  const wb = new Set(nb.split(' ').filter(Boolean));
  let common = 0;
  wa.forEach(w => { if (wb.has(w)) common++; });
  const union = wa.size + wb.size - common;
  return union > 0 ? common / union : 0;
}

function buildEvhpEvaluation({ hargaForRup, rincianForRup, penyediaList }) {
  const rincianItems = rincianForRup.length > 0
    ? rincianForRup.map(r => ({
        label: r.itemBarang || '-',
        hps: r.hargaSatuan || 0,
        vol: r.vol || 0,
        satuan: r.satuan || '',
      }))
    : [];
  const hargaItems = [...new Set(hargaForRup.map(h => h.namaItem).filter(Boolean))];
  const itemLabels = rincianItems.length > 0 ? rincianItems.map(r => r.label) : hargaItems;
  const filledItemLabels = itemLabels.filter(Boolean);
  const itemCountRequired = filledItemLabels.length;

  function getHargaRec(item, penyedia, occIdx = 0) {
    const candidates = hargaForRup.filter(h => h.namaPenyedia === penyedia);
    if (!candidates.length) return null;

    const exactMatches = candidates.filter(h => h.namaItem === item);
    if (exactMatches.length > 0) {
      return exactMatches[occIdx] || exactMatches[exactMatches.length - 1];
    }

    const fuzzyNameMatches = [];
    for (const h of candidates) {
      const s = evhpMatchScore(h.namaItem, item);
      if (s >= 0.75) fuzzyNameMatches.push({ h, s });
    }
    if (fuzzyNameMatches.length > 0) {
      fuzzyNameMatches.sort((a, b) => b.s - a.s);
      return (fuzzyNameMatches[occIdx] || fuzzyNameMatches[fuzzyNameMatches.length - 1]).h;
    }

    const fuzzyProdMatches = [];
    for (const h of candidates) {
      const s = evhpMatchScore(h.namaProduk, item);
      if (s >= 0.75) fuzzyProdMatches.push({ h, s });
    }
    if (fuzzyProdMatches.length > 0) {
      fuzzyProdMatches.sort((a, b) => b.s - a.s);
      return (fuzzyProdMatches[occIdx] || fuzzyProdMatches[fuzzyProdMatches.length - 1]).h;
    }
    return null;
  }

  function getHargaNego(item, penyedia, occIdx = 0) {
    const h = getHargaRec(item, penyedia, occIdx);
    if (!h) return null;
    return (Number(h.negoFinal) > 0) ? Number(h.negoFinal) : (h.hargaTayang || null);
  }

  const evaluasiPenyedia = penyediaList.map(penyedia => {
    const occ = {};
    let total = 0;
    let pricedCount = 0;
    let itemCount = 0;

    filledItemLabels.forEach(item => {
      const occIdx = occ[item] || 0;
      occ[item] = occIdx + 1;
      const h = getHargaRec(item, penyedia, occIdx);
      const harga = h ? ((Number(h.negoFinal) > 0) ? Number(h.negoFinal) : (h.hargaTayang || 0)) : 0;
      if (h && harga > 0) {
        pricedCount += 1;
        total += harga * (h.qty || 1);
      }
    });

    const rankOcc = {};
    itemCount = filledItemLabels.filter(item => {
      const occIdx = rankOcc[item] || 0;
      rankOcc[item] = occIdx + 1;
      const hNego = getHargaNego(item, penyedia, occIdx);
      if (hNego === null || hNego <= 0) return false;
      const allNego = penyediaList.map(pp => getHargaNego(item, pp, occIdx)).filter(v => v !== null && v > 0);
      return allNego.length > 0 && hNego === Math.min(...allNego);
    }).length;

    return {
      nama: penyedia,
      itemCount,
      pricedCount,
      complete: pricedCount >= itemCountRequired,
      total,
    };
  });

  const penyediaRank = evaluasiPenyedia
    .slice()
    .sort((a, b) => Number(b.complete) - Number(a.complete) || a.total - b.total || b.itemCount - a.itemCount);

  return {
    rincianItems,
    itemLabels,
    totalRows: itemLabels.length,
    getHargaRec,
    getHargaNego,
    evaluasiPenyedia,
    totalPerPenyedia: evaluasiPenyedia.map(p => p.total),
    penyediaRank,
  };
}

function loadEvhpData() {
  const rup      = document.getElementById('evhp-rup-select').value;
  const pejabatId = document.getElementById('evhp-pejabat-select').value;
  const content  = document.getElementById('evhp-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📑</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih nomor RUP untuk menampilkan evaluasi harga penawaran</div>
      </div>`;
    return;
  }

  // Pejabat pengadaan
  let pejabatPengadaan = { nama: '<span style="color:#c05050;font-style:italic;">⚠ Belum dipilih — tambahkan di Data Master</span>', nip: '-' };
  if (pejabatId) {
    const found = masterState.pejabatPengadaan.find(p => String(p.id) === String(pejabatId));
    if (found) pejabatPengadaan = found;
  }

  // Data paket
  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // Data harga untuk RUP ini
  const hargaForRup = state.harga.data.filter(h => String(h.rup) === String(rup));

  // Daftar nama penyedia unik (max 2)
  const allPenyediaNames = [...new Set(hargaForRup.map(h => h.namaPenyedia).filter(Boolean))];
  let penyediaList = allPenyediaNames.length > 0 ? allPenyediaNames.slice(0, 3) : state.penyedia.data.slice(0, 3).map(p => p.namaPenyedia);
  while (penyediaList.length < 2) penyediaList.push('PENYEDIA ' + (penyediaList.length + 1));

  // Data rincian untuk RUP ini
  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));

  // Tanggal
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }
  const namaHari   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const namaBulan  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const satuanAngka = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas','Dua Belas','Tiga Belas','Empat Belas','Lima Belas','Enam Belas','Tujuh Belas','Delapan Belas','Sembilan Belas','Dua Puluh','Dua Puluh Satu','Dua Puluh Dua','Dua Puluh Tiga','Dua Puluh Empat','Dua Puluh Lima','Dua Puluh Enam','Dua Puluh Tujuh','Dua Puluh Delapan','Dua Puluh Sembilan','Tiga Puluh','Tiga Puluh Satu'];
  function terbilangTahun(y) {
    const ratusan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan'];
    const ribuan = Math.floor(y / 1000);
    const sisa   = y % 1000;
    const r      = Math.floor(sisa / 100);
    const puluhan = sisa % 100;
    let result = (ribuan === 1 ? 'Seribu' : ratusan[ribuan] + ' Ribu');
    if (r > 0) result += ' ' + ratusan[r] + ' Ratus';
    if (puluhan > 0) result += ' ' + (puluhan < satuanAngka.length ? satuanAngka[puluhan] : '');
    return result.trim();
  }
  const hariText      = namaHari[tglDate.getDay()];
  const tglAngka      = tglDate.getDate();
  const bulanText     = namaBulan[tglDate.getMonth()];
  const tahunNum      = tglDate.getFullYear();
  const tanggalTerb   = satuanAngka[tglAngka] || String(tglAngka);
  const tahunTerb     = terbilangTahun(tahunNum);
  const tanggalPanjang = `${tanggalTerb} Bulan ${bulanText} Tahun ${tahunTerb}`;
  const docCfg = getActiveDocConfig();
  const docInstansi = docCfg.namaInstansi || 'Instansi Pemerintah';
  const docKabupaten = docCfg.kabupaten || 'Kabupaten Kapuas Hulu';
  const docSingkatan = docCfg.singkatan || 'SIDEVA';
  const savedNomorEvhp = String(paket.nomorEvhp || '');
  const nomorEvhpDefault = `PP/${paket.rup || '...'}/BAHEV-HP/${docSingkatan}/${tahunNum}`;
  const nomorEvhp = savedNomorEvhp && !(docSingkatan !== 'BAPPERIDA' && savedNomorEvhp.includes('/BAPPERIDA/'))
    ? savedNomorEvhp
    : nomorEvhpDefault;

  const evhpEval = buildEvhpEvaluation({ hargaForRup, rincianForRup, penyediaList });
  const {
    rincianItems,
    itemLabels,
    totalRows,
    getHargaRec,
    getHargaNego,
    totalPerPenyedia,
    penyediaRank,
  } = evhpEval;

  // ── B. Tabel Evaluasi Pembanding Harga ──
  // Kolom: No | Nama Item Barang & Spek Minimal | HPS | [penyedia1..N] | Terendah | Terpilih
  // PENTING: Kolom harga per penyedia & terendah menggunakan harga NEGO FINAL (jika ada),
  //          fallback ke harga tayang jika nego belum diisi.
  const thStyle   = `border:1px solid #000;padding:6px 4px;text-align:center;vertical-align:middle;color:#000;background:#fff;font-size:10pt;word-wrap:break-word;white-space:normal;`;
  const tdStyle   = `border:1px solid #000;padding:5px 4px;vertical-align:top;color:#000;font-size:10pt;`;
  const tdCStyle  = `border:1px solid #000;padding:5px 4px;text-align:center;vertical-align:top;color:#000;font-size:10pt;`;
  const tdRStyle  = `border:1px solid #000;padding:5px 4px;text-align:right;vertical-align:top;color:#000;font-size:10pt;`;

  // Total HPS dari rincian
  const totalHPS = rincianItems.reduce((s, r) => s + (r.hps * r.vol), 0) ||
                   paket.paguAnggaran || 0;

  // Baris tabel evaluasi — harga per penyedia = negoFinal (atau hargaTayang jika belum nego)
  let rowsEval = '';
  const hasHarga   = hargaForRup.length > 0;
  const hasRincian = rincianForRup.length > 0;
  const hideSec    = (hide) => hide ? 'style="display:none"' : '';
  const _evalOcc = {}; // track occurrence index per item label
  for (let i = 0; i < totalRows; i++) {
    const item  = itemLabels[i] || '';
    const occIdx = item ? (_evalOcc[item] || 0) : 0;
    if (item) _evalOcc[item] = occIdx + 1;
    const rItem = rincianItems[i];
    const hpsVal = rItem ? (rItem.hps || 0) : (item ? (() => {
      // Cari HPS dari harga data, gunakan fuzzy match agar konsisten
      let bestH = null, bestS = 0;
      for (const h of hargaForRup) {
        const s = evhpMatchScore(h.namaItem, item);
        if (s > bestS) { bestS = s; bestH = h; }
      }
      return (bestH && bestS >= 0.75) ? (bestH.hps || paket.paguAnggaran || 0) : (paket.paguAnggaran || 0);
    })() : 0);

    // Harga penawaran per penyedia (negoFinal jika ada, fallback hargaTayang)
    const hargaPenyedia = penyediaList.map(p => getHargaNego(item, p, occIdx));
    const validHarga    = hargaPenyedia.filter(h => h !== null && h > 0);
    const minHarga      = validHarga.length > 0 ? Math.min(...validHarga) : null;
    const penyediaTerpilih = minHarga !== null
      ? penyediaList[hargaPenyedia.indexOf(minHarga)]
      : '';

    rowsEval += `<tr>
      <td style="${tdCStyle}">${item ? (i + 1) : ''}</td>
      <td style="${tdStyle}">${item}</td>
      <td style="${tdRStyle}">${hpsVal ? 'Rp ' + hpsVal.toLocaleString('id-ID') : (item ? 'Rp -' : '')}</td>
      ${hargaPenyedia.map(h => `<td style="${tdRStyle}">${h !== null ? 'Rp ' + h.toLocaleString('id-ID') : (item ? 'Rp -' : '')}</td>`).join('')}
      <td style="${tdRStyle}">${minHarga !== null ? 'Rp ' + minHarga.toLocaleString('id-ID') : (item ? 'Rp -' : '')}</td>
      <td style="${tdStyle}word-wrap:break-word;white-space:normal;">${penyediaTerpilih}</td>
    </tr>`;
  }

  const rowsRank = penyediaRank.map((p, i) => `<tr>
    <td style="${tdCStyle}">${i + 1}</td>
    <td style="${tdStyle}">${p.nama}</td>
    <td style="${tdCStyle}">${p.itemCount}</td>
    <td style="${tdRStyle}">${p.total ? 'Rp ' + p.total.toLocaleString('id-ID') : 'Rp -'}</td>
    <td style="${tdStyle}">${i === 0 ? 'Dilanjutkan' : 'Tidak dilanjutkan'}</td>
  </tr>`).join('');

  // Penyedia terpilih (rank 1)
  const penyediaTerpilihFinal = penyediaRank.length > 0 ? penyediaRank[0].nama : '-';

  // ── D. Negosiasi Harga Satuan ──
  // Menampilkan: Harga Tayang (sebelum nego) → Nego Final → Selisih → Efisiensi
  let rowsNego = '';
  const _negoOcc = {}; // track occurrence index per item label
  for (let i = 0; i < itemLabels.length; i++) {
    const item  = itemLabels[i] || '';
    const occIdx = item ? (_negoOcc[item] || 0) : 0;
    if (item) _negoOcc[item] = occIdx + 1;
    const h = item ? getHargaRec(item, penyediaTerpilihFinal, occIdx) : null;
    const hargaAwal  = h ? (h.hargaTayang || null) : null;
    const negoFinal  = h ? ((Number(h.negoFinal) > 0) ? Number(h.negoFinal) : h.hargaTayang) : null;
    const selisih    = (hargaAwal !== null && negoFinal !== null) ? (negoFinal - hargaAwal) : null;
    const efisiensi  = (hargaAwal && selisih !== null && hargaAwal !== 0)
      ? ((Math.abs(selisih) / hargaAwal) * 100).toFixed(2)
      : null;

    rowsNego += `<tr>
      <td style="${tdCStyle}">${item ? (i + 1) : ''}</td>
      <td style="${tdStyle}">${item}</td>
      <td style="${tdRStyle}">${hargaAwal !== null ? 'Rp ' + hargaAwal.toLocaleString('id-ID') : (item ? 'Rp -' : '')}</td>
      <td style="${tdRStyle}">${negoFinal !== null ? 'Rp ' + negoFinal.toLocaleString('id-ID') : (item ? 'Rp -' : '')}</td>
      <td style="${tdRStyle}">${selisih !== null ? (selisih > 0 ? '+' : '') + 'Rp ' + selisih.toLocaleString('id-ID') : (item ? 'Rp -' : '')}</td>
      <td style="${tdCStyle}">${efisiensi !== null ? efisiensi + '%' : (item ? '-' : '')}</td>
      <td style="${tdStyle}">${item ? (selisih !== null && selisih <= 0 ? 'Disepakati' : 'Disepakati') : ''}</td>
    </tr>`;
  }

  // ── Data Tabel C & D (untuk manipulasi dinamis) ─────────────
  // dataTabelC: satu baris per penyedia di Tabel C Peringkatan Harga Terendah
  //   .kolomTerendah = total harga hasil nego penyedia tersebut (kolom "Total Harga Hasil Nego")
  const dataTabelC = penyediaRank.map((p, idx) => ({
    rank:          idx + 1,
    nama:          p.nama,
    itemCount:     p.itemCount,
    kolomTerendah: p.total,          // nilai kolom Total Harga Hasil Nego baris ini
    tindakLanjut:  idx === 0 ? 'Dilanjutkan' : 'Tidak dilanjutkan'
  }));

  // dataTabelD: satu entri per item di Tabel D Negosiasi Harga Satuan
  //   .length = total jumlah item yang dinegosiasi
  const _dataDOcc = {};
  const dataTabelD = itemLabels.filter(Boolean).map((item, i) => {
    const occIdx = _dataDOcc[item] || 0;
    _dataDOcc[item] = occIdx + 1;
    const h      = getHargaRec(item, penyediaTerpilihFinal, occIdx);
    const hAwal  = h ? (h.hargaTayang || null) : null;
    const hNego  = h ? (Number(h.negoFinal) > 0 ? Number(h.negoFinal) : h.hargaTayang) : null;
    const selisih = (hAwal !== null && hNego !== null) ? (hNego - hAwal) : null;
    return { no: i + 1, item, hargaAwal: hAwal, negoFinal: hNego, selisih };
  });

  // ── E. Rekap Perbandingan Nilai ──
  // totalHargaTayang = total harga tayang (sebelum nego) penyedia terpilih × qty
  const totalHargaTayang = hargaForRup
    .filter(h => h.namaPenyedia === penyediaTerpilihFinal)
    .reduce((s, h) => s + (h.hargaTayang || 0) * (h.qty || 1), 0);
  // totalNego = total nilai nego final × qty penyedia terpilih
  const totalNego = hargaForRup
    .filter(h => h.namaPenyedia === penyediaTerpilihFinal)
    .reduce((s, h) => s + ((Number(h.negoFinal) > 0 ? Number(h.negoFinal) : (h.hargaTayang || 0)) * (h.qty || 1)), 0);
  const effisiensiHPS = paket.paguAnggaran
    ? (((paket.paguAnggaran - totalNego) / paket.paguAnggaran) * 100).toFixed(1)
    : '0';
  const penghematanHPS = (paket.paguAnggaran || 0) - totalNego;
  const penghematanNego = totalHargaTayang - totalNego;
  const pctNego = totalHargaTayang ? (((totalHargaTayang - totalNego) / totalHargaTayang) * 100).toFixed(1) : '0';

  // ── Build HTML Document ──
  const colWidthPenyedia = Math.floor(90 / (penyediaList.length + 2)); // rough distribution
  content.innerHTML = `
    <div id="evhp-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:960px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div class="section-block" style="text-align:center;margin-bottom:18px;">
        <div style="font-size:14pt;font-weight:bold;text-decoration:underline;color:#000;">BERITA ACARA HASIL EVALUASI HARGA PENAWARAN E-PURCHASING</div>
        <div style="font-size:12pt;color:#000;">Nomor : ${nomorEvhp} <button onclick="openNomorDialog(this)" data-slug="evhp" data-rup="${paket.rup}" data-field="nomorEvhp" data-cur="${nomorEvhp}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- PARAGRAF PEMBUKA -->
      <p style="text-align:justify;margin-bottom:14px;color:#000;">
        Pada Hari ini ${hariText} Tanggal ${tanggalPanjang} yang bertandatangan dibawah ini selaku Pejabat Pengadaan pada ${docInstansi} ${docKabupaten} telah melaksanakan verifikasi penyedia jasa melalui E-Purchasing, dengan hasil sebagai berikut :
      </p>

      <!-- A. DATA UMUM -->
      <div style="margin-bottom:14px;">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">A.&nbsp;&nbsp;&nbsp;DATA UMUM</div>
        <table style="margin-left:24px;font-size:12pt;color:#000;border-collapse:collapse;">
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;width:180px;color:#000;border:none;">Kode RUP</td><td style="padding:2px 8px;vertical-align:top;width:16px;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.rup || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nama Paket</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.namaPaket || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Pagu</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${fmtRp(paket.paguAnggaran)}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Mata Anggaran Belanja</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.kodeRekening || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Metode</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">E - Purchasing dengan Negosiasi Harga</td></tr>
        </table>
      </div>

      <!-- B. EVALUASI PEMBANDING HARGA SURVEY DENGAN METODE NILAI TERENDAH -->
      <div ${hideSec(!hasHarga)} style="margin-bottom:14px;">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">B.&nbsp;&nbsp;&nbsp;EVALUASI PEMBANDING HARGA SURVEY DENGAN METODE NILAI TERENDAH</div>
        <table style="width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed;color:#000;">
          <colgroup>
            <col style="width:32px;">
            <col style="width:auto;">
            <col style="width:72px;">
            ${penyediaList.map(() => '<col style="width:80px;">').join('')}
            <col style="width:70px;">
            <col style="width:80px;">
          </colgroup>
          <thead style="display:table-header-group;">
            <tr>
              <th class="no-col" style="${thStyle}" rowspan="2">No</th>
              <th style="${thStyle}" rowspan="2">Nama Item Barang dan Spek Minimal</th>
              <th style="${thStyle}" rowspan="2">Harga Satuan HPS</th>
              ${penyediaList.map(p => `<th style="${thStyle}" rowspan="2">${p.toUpperCase()}</th>`).join('')}
              <th style="${thStyle}" rowspan="2">Terendah</th>
              <th style="${thStyle}" rowspan="2">Terpilih</th>
            </tr>
            <tr></tr>
          </thead>
          <tbody>
            ${rowsEval}
          </tbody>
        </table>
        <p style="text-align:justify;margin-top:10px;color:#000;font-size:12px;">
          Dari beberapa penyedia yang mencantumkan harga masing-masing produk pada E-Katalog lokal Kabupaten Kapuas Hulu yang produknya sesuai dengan kebutuhan dan spesifikasi pada paket pekerjaan tersebut sebanyak ${penyediaList.length} penyedia. Hasil tangkap layar harga satuan tayang masing-masing penyedia terlampir pada lampiran Dokumen Persiapan Pengadaan (DPP)
        </p>
      </div>

      <!-- C. PERINGKATAN HARGA TERENDAH -->
      <div ${hideSec(!hasHarga)} style="margin-bottom:14px;">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">C.&nbsp;&nbsp;&nbsp;PERINGKATAN HARGA TERENDAH</div>
        <table style="width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed;color:#000;">
          <colgroup>
            <col style="width:48px;">
            <col style="width:auto;">
            <col style="width:90px;">
            <col style="width:110px;">
            <col style="width:100px;">
          </colgroup>
          <thead>
            <tr>
              <th style="${thStyle}">Rank</th>
              <th style="${thStyle}">Nama Penyedia</th>
              <th style="${thStyle}">Item Terendah</th>
              <th style="${thStyle}">Total Harga Hasil Nego</th>
              <th style="${thStyle}">Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>${rowsRank}</tbody>
        </table>
        <p style="text-align:justify;margin-top:10px;color:#000;font-size:12px;">
          Dari hasil verifikasi calon penyedia yang memiliki item pekerjaan/sub kategori produk lengkap sesuai kebutuhan pekerjaan, memiliki kualifikasi usaha yang sesuai, memenuhi persyaratan administrasi dan teknis, serta total harga hasil negosiasi terendah adalah :
        </p>
        <p style="font-weight:bold;margin-left:24px;color:#000;font-size:12px;">${penyediaTerpilihFinal}</p>
        <p style="text-align:justify;margin-top:6px;color:#000;font-size:12px;">
          Dengan total harga hasil negosiasi terendah sebesar <strong>${fmtRp(dataTabelC[0]?.kolomTerendah || 0)}</strong>.
        </p>
      </div>

      <!-- D. NEGOSIASI HARGA SATUAN -->
      <div ${hideSec(!hasHarga)} style="margin-bottom:14px;">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">D.&nbsp;&nbsp;&nbsp;NEGOSIASI HARGA SATUAN</div>
        <table style="width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed;color:#000;">
          <colgroup>
            <col style="width:32px;">
            <col style="width:auto;">
            <col style="width:84px;">
            <col style="width:84px;">
            <col style="width:80px;">
            <col style="width:70px;">
            <col style="width:80px;">
          </colgroup>
          <thead style="display:table-header-group;">
            <tr>
              <th class="no-col" style="${thStyle}">No</th>
              <th style="${thStyle}">Nama Item Barang dan Spek Minimal</th>
              <th style="${thStyle}">Harga Awal Penyedia</th>
              <th style="${thStyle}">Harga Hasil Negosiasi</th>
              <th style="${thStyle}">Selisih</th>
              <th style="${thStyle}">% Efisiensi</th>
              <th style="${thStyle}">Keterangan</th>
            </tr>
          </thead>
          <tbody>${rowsNego}</tbody>
        </table>
        <p style="text-align:justify;margin-top:10px;color:#000;font-size:12px;">
          Proses negosiasi harga satuan dilakukan terhadap <strong>${dataTabelD.length}</strong> item pekerjaan bersama penyedia terpilih. Seluruh item telah disepakati harganya sesuai ketentuan yang berlaku.
        </p>
      </div>

      <!-- E. REKAP PERBANDINGAN NILAI -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">E.&nbsp;&nbsp;&nbsp;REKAP PERBANDINGAN NILAI</div>
        <table style="width:auto;min-width:auto;border-collapse:collapse;font-size:10pt;color:#000;">
          <colgroup><col style="width:32px;"><col style="width:auto;"><col style="width:130px;"></colgroup>
          <thead>
            <tr>
              <th class="no-col" style="${thStyle}">No</th>
              <th style="${thStyle}">Uraian</th>
              <th style="${thStyle}">Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="${tdCStyle}">1</td><td style="${tdStyle}">Total HPS</td><td style="${tdRStyle}">${fmtRp(paket.paguAnggaran)}</td></tr>
            <tr><td style="${tdCStyle}">2</td><td style="${tdStyle}">Total Harga Tayang Penyedia Terpilih</td><td style="${tdRStyle}">${fmtRp(totalHargaTayang)}</td></tr>
            <tr><td style="${tdCStyle}">3</td><td style="${tdStyle}">Total Hasil Negosiasi</td><td style="${tdRStyle}">${fmtRp(totalNego)}</td></tr>
            <tr><td style="${tdCStyle}">4</td><td style="${tdStyle}">Efisiensi terhadap HPS</td><td style="${tdRStyle}">${fmtRp(penghematanHPS)}</td></tr>
            <tr><td style="${tdCStyle}">5</td><td style="${tdStyle}">% Efisiensi terhadap HPS</td><td style="${tdRStyle}">${effisiensiHPS}%</td></tr>
            <tr><td style="${tdCStyle}">6</td><td style="${tdStyle}">Penghematan dari Negosiasi</td><td style="${tdRStyle}">${fmtRp(penghematanNego)}</td></tr>
            <tr><td style="${tdCStyle}">7</td><td style="${tdStyle}">% Penghematan Negosiasi</td><td style="${tdRStyle}">${pctNego}%</td></tr>
          </tbody>
        </table>
      </div>

      <!-- F. ANALISIS KEWAJARAN HARGA -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">F.&nbsp;&nbsp;&nbsp;ANALISIS KEWAJARAN HARGA</div>
        <table style="width:auto;min-width:auto;border-collapse:collapse;font-size:10pt;color:#000;">
          <colgroup><col style="width:32px;"><col style="width:auto;"><col style="width:80px;"></colgroup>
          <thead>
            <tr>
              <th class="no-col" style="${thStyle}">No</th>
              <th style="${thStyle}">Aspek</th>
              <th style="${thStyle}">Hasil</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="${tdCStyle}">1</td><td style="${tdStyle}">Harga di bawah atau sama dengan HPS</td><td style="${tdCStyle}">Ya</td></tr>
            <tr><td style="${tdCStyle}">2</td><td style="${tdStyle}">Spesifikasi sesuai kebutuhan</td><td style="${tdCStyle}">Ya</td></tr>
            <tr><td style="${tdCStyle}">3</td><td style="${tdStyle}">Penyedia memiliki item lengkap</td><td style="${tdCStyle}">Ya</td></tr>
            <tr><td style="${tdCStyle}">4</td><td style="${tdStyle}">Harga masih dapat dinegosiasikan</td><td style="${tdCStyle}">Ya</td></tr>
            <tr><td style="${tdCStyle}">5</td><td style="${tdStyle}">Harga final dinilai wajar</td><td style="${tdCStyle}">Ya</td></tr>
          </tbody>
        </table>
        <div style="margin-top:8px;font-size:11pt;color:#000;">
          <strong>Catatan Analisis:</strong>
          <ul style="margin:4px 0 0 20px;padding:0;color:#000;">
            <li>Seluruh harga satuan setelah negosiasi berada di bawah atau sama dengan HPS;</li>
            <li>Spesifikasi barang yang ditawarkan sesuai dengan kebutuhan pengguna;</li>
            <li>Penyedia mampu menyediakan seluruh item yang dibutuhkan;</li>
            <li>Dengan demikian, harga akhir dinilai wajar dan layak untuk ditetapkan.</li>
          </ul>
        </div>
      </div>

      <!-- G. JUSTIFIKASI PEMILIHAN PENYEDIA -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">G.&nbsp;&nbsp;&nbsp;JUSTIFIKASI PEMILIHAN PENYEDIA</div>
        <table style="width:100%;border-collapse:collapse;font-size:10pt;table-layout:fixed;color:#000;">
          <colgroup><col style="width:32px;"><col style="width:160px;"><col style="width:auto;"></colgroup>
          <thead>
            <tr>
              <th class="no-col" style="${thStyle}">No</th>
              <th style="${thStyle}">Kriteria</th>
              <th style="${thStyle}">Penjelasan</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="${tdCStyle}">1</td><td style="${tdStyle}">Harga Hasil Negosiasi Terendah</td><td style="${tdStyle}">Penyedia menawarkan total harga hasil negosiasi terendah untuk item yang dievaluasi.</td></tr>
            <tr><td style="${tdCStyle}">2</td><td style="${tdStyle}">Kesesuaian Spesifikasi</td><td style="${tdStyle}">Seluruh spesifikasi ${paket.namaPaket ? paket.namaPaket.toLowerCase().replace(/belanja /i,'') : 'barang/jasa'} sesuai kebutuhan.</td></tr>
            <tr><td style="${tdCStyle}">3</td><td style="${tdStyle}">Kelengkapan Item</td><td style="${tdStyle}">Penyedia dapat menyediakan seluruh item dalam satu paket.</td></tr>
            <tr><td style="${tdCStyle}">4</td><td style="${tdStyle}">Hasil Negosiasi</td><td style="${tdStyle}">Penyedia sepakat dengan harga negosiasi seperti yang tertera pada tabel D</td></tr>
            <tr><td style="${tdCStyle}">5</td><td style="${tdStyle}">Reputasi/Kinerja Penyedia</td><td style="${tdStyle}">Penyedia aktif di e-Katalog dan memiliki kinerja yang baik.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- H. KESIMPULAN DAN REKOMENDASI -->
      <div style="margin-bottom:20px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:8px;color:#000;">H.&nbsp;&nbsp;&nbsp;KESIMPULAN DAN REKOMENDASI</div>
        <p style="text-align:justify;color:#000;font-size:12px;margin-bottom:10px;">
          Berdasarkan hasil evaluasi pembanding harga dari beberapa penyedia pada e-Katalog serta hasil negosiasi harga satuan, diperoleh bahwa penyedia <strong>${penyediaTerpilihFinal}</strong> menawarkan harga yang paling kompetitif dengan total nilai setelah negosiasi sebesar ${fmtRp(totalNego)}. Harga tersebut berada di bawah/sama dengan HPS dan dinilai wajar serta memenuhi seluruh spesifikasi teknis yang dipersyaratkan. Oleh karena itu, penyedia tersebut direkomendasikan untuk ditetapkan sebagai pelaksana pekerjaan.
        </p>
        <p style="text-align:justify;color:#000;font-size:12px;margin-bottom:10px;">
          Selanjutnya apabila disetujui oleh PPK dan/atau Kepala Satuan Kerja, Kami selaku Pejabat Pengadaan akan segera memproses transaksi pembelian pada sistem E-Katalog.
        </p>
        <p style="text-align:justify;color:#000;font-size:12px;">
          Demikian Berita Acara Pemilihan Calon Penyedia ini dibuat untuk dapat digunakan sebagaimana mestinya.
        </p>
      </div>

      <!-- TTD -->
      <div class="section-block" style="display:flex;justify-content:flex-end;margin-top:40px;">
        <div style="text-align:left;width:320px;color:#000;">
          <div style="color:#000;">${docInstansi}</div>
          <div style="font-weight:bold;margin-bottom:60px;color:#000;">Pejabat Pengadaan</div>
          <div style="font-weight:bold;text-decoration:underline;color:#000;">${pejabatPengadaan.nama || '<span style="color:#c05050;font-style:italic;">⚠ Pilih Pejabat Pengadaan</span>'}</div>
          <div style="color:#000;">${pejabatPengadaan.nip || 'NIP. 198711182015021003'}</div>
        </div>
      </div>
    </div>
  `;
}

function printEvhp() {
  const printArea = document.getElementById('evhp-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Berita Acara Hasil Evaluasi Harga Penawaran E-Purchasing</title>
      <style>
        ${buildPageRule('evhp')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        table { border-collapse:collapse; width:100%; table-layout:fixed; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { border:1px solid #000; word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        ul { margin:4px 0 0 20px; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

// ============================================================
//  FORM SPEK FUNCTIONS - Spesifikasi Teknis Paket E-Purchasing
// ============================================================
function populateFormSpekSelects() {
  // RUP select
  const rupSel = document.getElementById('formspek-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">-- Pilih No RUP --</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  // PPK select
  const ppkSel = document.getElementById('formspek-pejabat-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">-- Pilih PPK --</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || p.namaPejabat || JSON.stringify(p);
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
}

function loadFormSpekData() {
  const rup = document.getElementById('formspek-rup-select').value;
  const ppkId = document.getElementById('formspek-pejabat-select').value;
  const content = document.getElementById('formspek-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧷</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih nomor RUP di atas untuk menampilkan Spesifikasi Teknis Paket E-Purchasing</div>
      </div>`;
    return;
  }

  // Cari paket
  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // PPK / PPKom
  let ppk = { nama: 'NAMA PPK', nip: 'NIP. -', ttd: '', cap: '', ttdSizeW:120, ttdSizeH:55, capSizeW:80, capSizeH:80 };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama || found.namaPPK || '-', nip: found.nip || found.nipPPK || '-', ttd: found.ttd||'', cap: found.cap||'', ttdSizeW: found.ttdSizeW||120, ttdSizeH: found.ttdSizeH||55, capSizeW: found.capSizeW||80, capSizeH: found.capSizeH||80 };
  }
  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));

  // Data harga untuk mendapatkan link katalog & qty terjual
  const hargaForRup = state.harga.data.filter(h => String(h.rup) === String(rup));

  // Penyedia terpilih (negoFinal terkecil)
  let penyediaTerpilih = '';
  let linkEkatalog = '';
  let tanggalAkses = '';
  if (hargaForRup.length > 0) {
    // Cari penyedia dengan total harga negosiasi terendah
    const totalPerPenyedia = {};
    hargaForRup.forEach(h => {
      if (!h.namaPenyedia) return;
      totalPerPenyedia[h.namaPenyedia] = (totalPerPenyedia[h.namaPenyedia] || 0) + (Number(h.negoFinal) > 0 ? Number(h.negoFinal) : (Number(h.hargaTayang) || 0)) * (Number(h.qty) || 1);
    });
    const sorted = Object.entries(totalPerPenyedia).sort((a, b) => a[1] - b[1]);
    if (sorted.length > 0) penyediaTerpilih = sorted[0][0];
    // Link katalog dari harga penyedia terpilih
    const linkItem = hargaForRup.find(h => h.namaPenyedia === penyediaTerpilih && h.linkKatalog);
    if (linkItem) linkEkatalog = linkItem.linkKatalog;
    if (!linkEkatalog) {
      const anyLink = hargaForRup.find(h => h.linkKatalog);
      if (anyLink) linkEkatalog = anyLink.linkKatalog;
    }
  }

  // Prioritas: Link dari Referensi E-Catalog (cocokkan Jenis Belanja = kodeRekening paket)
  if (paket.kodeRekening && masterState.ecatalog && masterState.ecatalog.length > 0) {
    const ecMatch = masterState.ecatalog.find(ec =>
      ec.jenisBelanja && ec.jenisBelanja.trim() === paket.kodeRekening.trim()
    );
    if (ecMatch && ecMatch.linkEcatalog) {
      linkEkatalog = ecMatch.linkEcatalog;
    }
  }

  // Tanggal (dari tanggalPesanan paket)
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const docOrg = getDocOrg(paket);
  const nomorFormspekDefault = `SPEK/${paket.rup || '...'}/${docOrg.singkatan}/${tglDate.getFullYear()}`;
  const nomorFormspek = getDefaultDocNumber(paket.nomorFormspek, nomorFormspekDefault, docOrg.singkatan);

  // Durasi / waktu pengiriman
  const durasi = paket.durasi ? `${paket.durasi} ${paket.masaKerja || 'Hari Kalender'}` : '3 Hari Kalender';

  // Tempat pengiriman mengikuti OPD aktif/config OPD.
  const tempatPengiriman = docOrg.tempatPengiriman;

  // Tingkat layanan (standar)
  const tingkatLayanan = `Penyedia wajib memenuhi tingkat layanan meliputi ketepatan waktu, kesesuaian spesifikasi, kualitas hasil, ketepatan jumlah, responsivitas, pengemasan dan pengiriman, jaminan/garansi, fleksibilitas layanan, kepatuhan administratif, serta standar keamanan dan kepatuhan. Penyedia juga wajib menindaklanjuti setiap ketidaksesuaian melalui perbaikan atau penggantian tanpa biaya tambahan sesuai ketentuan yang disepakati serta bertanggung jawab penuh atas pengadaan.`;

  // Bangun baris item rincian
  const EMPTY_ROWS = 0; // tidak ada baris kosong padding
  let itemRows = '';
  const hasRincian = rincianForRup.length > 0;
  const hasHarga   = hargaForRup.length > 0;
  const hideSec    = (hide) => hide ? 'style="display:none"' : '';
  if (rincianForRup.length > 0) {
    rincianForRup.forEach(r => {
      // Cari spesifikasi produk dari harga
      const hargaItem = hargaForRup.find(h => h.namaItem === r.itemBarang || h.namaProduk === r.itemBarang);
      const spek = hargaItem ? (hargaItem.namaProduk ? `Spesifikasi : ${hargaItem.namaProduk}` : '') : '';
      const qty = r.vol || '';
      const satuan = r.satuan || '';
      const hargaSatuan = r.hargaSatuan ? Number(r.hargaSatuan).toLocaleString('id-ID', {minimumFractionDigits:2}) : '';
      itemRows += `
        <tr>
          <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;color:#000;">${r.itemBarang || ''}<br><span style="font-size:10px;">${spek}</span></td>
          <td style="border:1px solid #000;padding:5px 7px;text-align:center;vertical-align:top;color:#000;">${qty}</td>
          <td style="border:1px solid #000;padding:5px 7px;text-align:center;vertical-align:top;color:#000;">${satuan}</td>
          <td style="border:1px solid #000;padding:5px 7px;text-align:right;vertical-align:top;color:#000;">${hargaSatuan}</td>
        </tr>`;
    });
    // Tidak ada baris kosong padding
  } else {
    // Tidak ada data — tidak tampilkan baris kosong
  }

  // Build HTML dokumen
  content.innerHTML = `
    <div id="formspek-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div style="text-align:center;margin-bottom:18px;">
        <div style="font-size:14pt;font-weight:bold;text-decoration:underline;color:#000;letter-spacing:0.5px;">SPESIFIKASI TEKNIS PAKET E-PURCHASING</div>
        <div style="font-size:12pt;color:#000;">Nomor : ${nomorFormspek} <button onclick="openNomorDialog(this)" data-slug="formspek" data-rup="${paket.rup}" data-field="nomorFormspek" data-cur="${nomorFormspek}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- HEADER INFO PAKET -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:16px;" class="section-block">
        <colgroup><col style="width:160px;"><col style="width:12px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Perangkat Daerah</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${docOrg.namaInstansi}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Program</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${fmtText(paket.program)}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Kegiatan</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${fmtText(paket.kegiatan)}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Sub Kegiatan</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${fmtText(paket.subKegiatan)}</td>
          </tr>
        </tbody>
      </table>

      <!-- RUP + PAKET INFO -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:16px;" class="section-block">
        <colgroup><col style="width:160px;"><col style="width:12px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">RUP</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${paket.rup || '-'}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Nama Paket Pengadaan</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${paket.namaPaket || '-'}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Pagu</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${fmtRp(paket.paguAnggaran)}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Mata Anggaran Belanja</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${paket.kodeRekening || '-'}</td>
          </tr>
          <tr>
            <td style="padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;">Sumber Dana</td>
            <td style="padding:3px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:3px 0;vertical-align:top;color:#000;border:none;">${docOrg.sumberDana} ${docOrg.kabupaten} TA ${tglDate.getFullYear()}</td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL SPESIFIKASI UTAMA -->
      <table ${hideSec(!hasRincian)} style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;" class="section-block">
        <colgroup>
          <col style="width:32px;">
          <col style="width:150px;">
          <col style="width:auto;">
          <col style="width:80px;">
        </colgroup>
        <thead>
          <tr>
            <th class="no-col" style="border:1px solid #000;padding:7px;text-align:center;background:#fff;color:#000;font-weight:bold;">No</th>
            <th style="border:1px solid #000;padding:7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Elemen Spesifikasi</th>
            <th style="border:1px solid #000;padding:7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Uraian Spesifikasi</th>
            <th style="border:1px solid #000;padding:7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Ket</th>
          </tr>
        </thead>
        <tbody>
          <!-- BARIS 1: Jenis, Spesifikasi, Kuantitas, Satuan dan Harga -->
          <tr>
            <td style="border:1px solid #000;padding:7px;text-align:center;vertical-align:top;color:#000;">1.</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;font-weight:bold;">Jenis, Spesifikasi, Kuantitas, Satuan dan Harga</td>
            <td style="border:1px solid #000;padding:0;vertical-align:top;color:#000;">
              <!-- Sub-tabel item barang -->
              <table style="width:100%;border-collapse:collapse;font-size:10pt;color:#000;">
                <colgroup>
                  <col style="width:auto;">
                  <col style="width:60px;">
                  <col style="width:60px;">
                  <col style="width:90px;">
                </colgroup>
                <thead>
                  <tr>
                    <th style="border-bottom:1px solid #000;border-right:1px solid #000;padding:5px 7px;text-align:center;color:#000;font-weight:bold;background:#fff;">Nama Barang dan Spesifikasi</th>
                    <th style="border-bottom:1px solid #000;border-right:1px solid #000;padding:5px 7px;text-align:center;color:#000;font-weight:bold;background:#fff;">Qty</th>
                    <th style="border-bottom:1px solid #000;border-right:1px solid #000;padding:5px 7px;text-align:center;color:#000;font-weight:bold;background:#fff;">Satuan</th>
                    <th style="border-bottom:1px solid #000;padding:5px 7px;text-align:center;color:#000;font-weight:bold;background:#fff;">Harga Satuan (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;"></td>
          </tr>

          <!-- BARIS 2: Tempat -->
          <tr>
            <td style="border:1px solid #000;padding:7px;text-align:center;vertical-align:top;color:#000;">2.</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;font-weight:bold;">Tempat</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;">${tempatPengiriman}</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;"></td>
          </tr>

          <!-- BARIS 3: Waktu -->
          <tr>
            <td style="border:1px solid #000;padding:7px;text-align:center;vertical-align:top;color:#000;">3.</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;font-weight:bold;">Waktu</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;">${durasi}</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;"></td>
          </tr>

          <!-- BARIS 4: Tingkat Layanan -->
          <tr>
            <td style="border:1px solid #000;padding:7px;text-align:center;vertical-align:top;color:#000;">4.</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;font-weight:bold;">Tingkat Layanan</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;text-align:justify;color:#000;">${tingkatLayanan}</td>
            <td style="border:1px solid #000;padding:7px;vertical-align:top;color:#000;"></td>
          </tr>
        </tbody>
      </table>

      <!-- LINK E-CATALOG -->
      <div style="margin-top:10px;margin-bottom:6px;color:#000;" class="section-block">
        <div style="color:#0000EE;font-weight:bold;margin-bottom:4px;">Link E-Catalog:</div>
        ${linkEkatalog
          ? `<div style="margin-bottom:4px;"><a href="${linkEkatalog}" style="color:#0000EE;word-break:break-all;">${linkEkatalog}</a></div>`
          : `<div style="color:#888;font-style:italic;">Link katalog belum tersedia. Tambahkan melalui data Survey Harga.</div>`
        }
        <div style="color:#000;">Di akses tanggal,&nbsp;&nbsp;&nbsp;${tglFormatted}</div>
      </div>

      <!-- TTD PPKom -->
      <div class="section-block" style="display:flex;justify-content:flex-end;margin-top:36px;">
        <div style="text-align:left;width:320px;color:#000;">
          <div style="color:#000;">Putussibau, &nbsp;${tglFormatted}</div>
          <div style="color:#000;">Di tetapkan oleh :</div>
          <div style="font-weight:bold;margin-bottom:4px;color:#000;">Pejabat Pembuat Komitmen (PPKom)</div>
          <div style="color:#000;">${docOrg.namaInstansi}</div>
          ${(()=>{
              const mode = (window._ttdMode && window._ttdMode['formspek']) || {ttd:false, cap:false};
              const showTtd = mode.ttd && ppk.ttd;
              const showCap = mode.cap && ppk.cap;
              const L = (window._ttdLayout && window._ttdLayout['formspek']) || {};
              const T = L.ttd || {x:0,y:0,w:120,h:55,r:0,o:100};
              const C = L.cap || {x:80,y:-20,w:80,h:80,r:0,o:85};
              // Container SELALU 70px (sama dengan placeholder kosong) — gambar mengambang di atas (wrap in front)
              return `<div style="position:relative;height:70px;margin-top:4px;background:transparent;overflow:visible;">
                ${showTtd ? `<img id="doc-ttd-img-formspek" src="${ppk.ttd}"
                  style="position:absolute;left:0;top:0;width:${T.w}px;height:${T.h}px;object-fit:contain;
                  background:transparent;
                  transform:translate(${T.x}px,${T.y}px) rotate(${T.r}deg);opacity:${T.o/100};
                  cursor:grab;user-select:none;z-index:2;"
                  draggable="false"
                  title="Drag untuk pindah posisi TTD">` : ''}
                ${showCap ? `<img id="doc-cap-img-formspek" src="${ppk.cap}"
                  style="position:absolute;left:0;top:0;width:${C.w}px;height:${C.h}px;object-fit:contain;
                  background:transparent;
                  transform:translate(${C.x}px,${C.y}px) rotate(${C.r}deg);opacity:${C.o/100};
                  cursor:grab;user-select:none;z-index:3;"
                  draggable="false"
                  title="Drag untuk pindah posisi Cap">` : ''}
              </div>`;
            })()}
          <div style="font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
          <div style="color:#000;">${ppk.nip}</div>
        </div>
      </div>

    </div>
  `;
  // Pasang drag handler setelah render
  setTimeout(() => {
    makeDraggableTtd('doc-ttd-img-formspek', 'formspek', 'ttd');
    makeDraggableTtd('doc-cap-img-formspek', 'formspek', 'cap');
  }, 50);
}

// ============================================================
//  RIVIU — Berita Acara Reviu DPP E-Purchasing
// ============================================================

function populateRiviuSelects() {
  // RUP select
  const rupSel = document.getElementById('riviu-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">-- Pilih No RUP --</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  // PPK select
  const ppkSel = document.getElementById('riviu-ppk-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">-- Pilih PPK --</option>';
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan.filter(p => p.jabatan && p.jabatan.toUpperCase().includes('PPK'))];
    masterState.ppk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
  // Pejabat Pengadaan select
  const pejSel = document.getElementById('riviu-pejabat-select');
  if (pejSel) {
    const cur = pejSel.value;
    pejSel.innerHTML = '<option value="">-- Pilih Pejabat Pengadaan --</option>';
    masterState.pejabatPengadaan.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || '-';
      pejSel.appendChild(opt);
    });
    pejSel.value = cur;
  }
}

function loadRiviuData() {
  const rup = document.getElementById('riviu-rup-select').value;
  const ppkId = document.getElementById('riviu-ppk-select').value;
  const pejId = document.getElementById('riviu-pejabat-select').value;
  const content = document.getElementById('riviu-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih PPK, Pejabat Pengadaan, dan No RUP untuk menampilkan Berita Acara Reviu DPP</div>
      </div>`;
    return;
  }

  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // PPK
  let ppk = { nama: 'NAMA PPK', nip: '-', jabatan: 'PA/KPA/PPK', ttd: '', cap: '', ttdSizeW:120, ttdSizeH:55, capSizeW:80, capSizeH:80 };
  if (ppkId) {
    const found = masterState.ppk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama||found.namaPPK||'-', nip: found.nip||found.nipPPK||'-', jabatan: found.jabatan||'PA/KPA/PPK', ttd: found.ttd||'', cap: found.cap||'', ttdSizeW: found.ttdSizeW||120, ttdSizeH: found.ttdSizeH||55, capSizeW: found.capSizeW||80, capSizeH: found.capSizeH||80 };
  }

  // Pejabat Pengadaan
  let pejabat = { nama: 'NAMA PEJABAT PENGADAAN', nip: '-', jabatan: 'Pejabat Pengadaan' };
  if (pejId) {
    const found = masterState.pejabatPengadaan.find(p => String(p.id) === String(pejId));
    if (found) pejabat = { nama: found.nama || '-', nip: found.nip || '-', jabatan: found.jabatan || 'Pejabat Pengadaan' };
  }

  // Tanggal
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const tahun = tglDate.getFullYear();
  const docOrg = getDocOrg(paket);

  // Nomor BAR
  const nomorBarDefault = `BAR-DPP/${paket.rup}/${docOrg.singkatan}/${tahun}`;
  const nomorBar = getDefaultDocNumber(paket.nomorBar, nomorBarDefault, docOrg.singkatan);

  // Harga survey
  const hargaForRup = state.harga.data.filter(h => String(h.rup) === String(rup));
  let sumberHarga = 'bersumber dari penyedia dalam epuchasing katalog v.6';
  if (hargaForRup.length > 0 && hargaForRup[0].namaPenyedia) {
    sumberHarga = `bersumber dari penyedia dalam epuchasing katalog v.6`;
  }

  // Build HTML dokumen Riviu
  content.innerHTML = `
    <div id="riviu-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div style="text-align:center;margin-bottom:6px;" class="section-block">
        <div style="font-size:12pt;font-weight:bold;text-decoration:underline;color:#000;letter-spacing:0.3px;">BERITA ACARA REVIU DOKUMEN PERSIAPAN PENGADAAN <em>E-PURCHASING</em></div>
        <div style="font-size:12pt;color:#000;">Nomor : ${nomorBar} <button onclick="openNomorDialog(this)" data-slug="riviu" data-rup="${paket.rup}" data-field="nomorBar" data-cur="${nomorBar}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- HEADER INFO PAKET -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin:14px 0 16px;" class="section-block">
        <colgroup><col style="width:155px;"><col style="width:10px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Perangkat Daerah</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${docOrg.namaInstansi}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Program</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${fmtText(paket.program)}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Kegiatan</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${fmtText(paket.kegiatan)}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Sub Kegiatan</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${fmtText(paket.subKegiatan)}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">RUP</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${paket.rup || '-'}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Nama Paket Pengadaan</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${paket.namaPaket || '-'}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Pagu</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${fmtRp(paket.paguAnggaran)}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Mata Anggaran Belanja</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${paket.kodeRekening || '-'}</td></tr>
          <tr><td style="padding:2px 6px 2px 0;border:none;color:#000;">Sumber Dana</td><td style="padding:2px 4px;border:none;color:#000;">:</td><td style="padding:2px 0;border:none;color:#000;">${docOrg.sumberDana} ${docOrg.kabupaten} TA ${tahun}</td></tr>
        </tbody>
      </table>

      <!-- TABEL 1: Evaluasi Spesifikasi Teknis -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;table-layout:fixed;border:1px solid #000;" class="section-block">
        <colgroup>
          <col style="width:42px;">
          <col style="width:auto;">
          <col style="width:42px;">
          <col style="width:42%;">
        </colgroup>
        <thead>
          <tr>
            <td colspan="4" style="border:none;padding:3px 0 4px;font-weight:bold;color:#000;">1&nbsp;&nbsp;&nbsp;Kertas Kerja Evaluasi Spesifikasi Teknis</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">KEGIATAN</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan spesifikasi teknis telah dituangkan dengan lengkap sehingga peserta memahami dan mampu menyusun penawaran dengan baik.</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Spesifikasi teknis telah dituangkan dengan lengkap sesuai <em>Formulir Penetapan Penyedia Barang/Jasa E-Purchasing</em></td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Memastikan spesifikasi teknis telah dijabarkan dengan :<br>
              <span style="display:inline-block;width:18px;text-align:right;">a</span>&nbsp;Kesesuaian spesifikasi teknis dengan kebutuhan<br>
              <span style="display:inline-block;width:18px;text-align:right;">b</span>&nbsp;Karakteristik antara lain ukuran, dimensi, bentuk, bahan, warna, komposisi<br>
              <span style="display:inline-block;width:18px;text-align:right;">c</span>&nbsp;Kinerja : ketahanan, efisiensi, batas pemakaian, dst<br>
              <span style="display:inline-block;width:18px;text-align:right;">d</span>&nbsp;Standar yang digunakan : SNI, JIS, ASTM, ISO, dst<br>
              <span style="display:inline-block;width:18px;text-align:right;">e</span>&nbsp;Validitas : standar yang digunakan sudah tepat dan sesuai (SNI berlaku dan valid)<br>
              <span style="display:inline-block;width:18px;text-align:right;">f</span>&nbsp;Pengepakan dan cara pengiriman disesuaikan dengan sifat dan/atau jenis barang<br>
              <span style="display:inline-block;width:18px;text-align:right;">g</span>&nbsp;Mencantumkan macam, jenis, kapasitas dan jumlah peralatan
            </td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Spesifikasi teknis telah dijabarkan dengan :<br>
              <span style="display:inline-block;width:18px;text-align:right;">a</span>&nbsp;Spesifikasi teknis telah diuraikan sesuai<br>
              <span style="display:inline-block;width:18px;text-align:right;">b</span>&nbsp;Ukuran/Dimensi telah diuraikan sesuai kebutuhan<br>
              <span style="display:inline-block;width:18px;text-align:right;">c</span>&nbsp;Kinerja barang telah sesuai<br>
              <span style="display:inline-block;width:18px;text-align:right;">d</span>&nbsp;ISO tidak dipersyaratkan<br>
              <span style="display:inline-block;width:18px;text-align:right;">e</span>&nbsp;SNI tidak dipersyaratkan<br>
              <span style="display:inline-block;width:18px;text-align:right;">f</span>&nbsp;Pengepakan dan cara pengiriman sesuai <em>Dokumen Penetapan Kebutuhan Barang dan Jasa</em><br>
              <span style="display:inline-block;width:18px;text-align:right;">g</span>&nbsp;tidak dipersyaratkan
            </td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Hal lain yang relevan dan perlu dilakukan reviu terkait spesifikasi teknis</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">Tidak ada</td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL 2: Evaluasi Referensi Harga -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;table-layout:fixed;" class="section-block">
        <colgroup>
          <col style="width:42px;">
          <col style="width:auto;">
          <col style="width:42px;">
          <col style="width:42%;">
        </colgroup>
        <thead>
          <tr>
            <td colspan="4" style="border:none;padding:3px 0 4px;font-weight:bold;color:#000;">2&nbsp;&nbsp;&nbsp;Kertas Kerja Evaluasi terhadap Pengumpulan Referensi Harga</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">KEGIATAN</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan PPK telah mengumpulkan referensi harga yang cukup dan memadai sehingga dapat menjadi dasar penentuan harga.</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">PA/KPA selaku PPK telah mengumpulkan referensi survey harga di e-katalog</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan harga yang digunakan PPK relevan dengan harga pasar, kontrak sejenis yang pernah dilakukan, atau sumber lainnya.</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Daftar harga yang digunakan adalah ${sumberHarga}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Hal lain yang relevan dan perlu dilakukan reviu terkait referensi harga</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">tidak ada</td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL 3: Evaluasi Rancangan Kontrak -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;table-layout:fixed;" class="section-block">
        <colgroup>
          <col style="width:42px;">
          <col style="width:auto;">
          <col style="width:42px;">
          <col style="width:42%;">
        </colgroup>
        <thead>
          <tr>
            <td colspan="4" style="border:none;padding:3px 0 4px;font-weight:bold;color:#000;">3&nbsp;&nbsp;&nbsp;Kertas Kerja Evaluasi terhadap Rancangan Kontrak (Surat Pesanan dan/atau Surat Perjanjian Kerja)</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">KEGIATAN</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Memastikan Surat Pesanan/SPK telah dituangkan secara lengkap dan benar terkait dengan :<br>
              <span style="display:inline-block;width:18px;text-align:right;">a</span>&nbsp;Paket pengadaan<br>
              <span style="display:inline-block;width:18px;text-align:right;">b</span>&nbsp;Sumber dana<br>
              <span style="display:inline-block;width:18px;text-align:right;">c</span>&nbsp;Nilai kontrak termasuk pajak<br>
              <span style="display:inline-block;width:18px;text-align:right;">d</span>&nbsp;Jenis Kontrak<br>
              <span style="display:inline-block;width:18px;text-align:right;">e</span>&nbsp;Waktu pelaksanaan
            </td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Surat Pesanan/SPK telah dituangkan secara lengkap dan benar yang memuat :<br>
              <span style="display:inline-block;width:18px;text-align:right;">a</span>&nbsp;telah sesuai dengan rancangan SP<br>
              <span style="display:inline-block;width:18px;text-align:right;">b</span>&nbsp;telah sesuai dengan rancangan SP<br>
              <span style="display:inline-block;width:18px;text-align:right;">c</span>&nbsp;belum ditetapkan<br>
              <span style="display:inline-block;width:18px;text-align:right;">d</span>&nbsp;telah sesuai dengan rancangan SP<br>
              <span style="display:inline-block;width:18px;text-align:right;">e</span>&nbsp;telah sesuai dengan rancangan SP
            </td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan Syarat-Syarat Umum Kontrak dan Syarat-Syarat Khusus Kontrak</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">telah sesuai dengan rancangan SP</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan jenis kontrak dalam SPK sudah sesuai dengan dokumen persiapan lainnya</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">telah sesuai dengan rancangan SP</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">4</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Hal lain yang relevan dan perlu dilakukan reviu terkait rancangan kontrak</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">4</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">tidak ada</td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL 4: Evaluasi Rencana Metode Pemilihan Penyedia -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;table-layout:fixed;" class="section-block">
        <colgroup>
          <col style="width:42px;">
          <col style="width:auto;">
          <col style="width:42px;">
          <col style="width:42%;">
        </colgroup>
        <thead>
          <tr>
            <td colspan="4" style="border:none;padding:3px 0 4px;font-weight:bold;color:#000;">4&nbsp;&nbsp;&nbsp;Kertas Kerja Evaluasi terhadap Rencana Metode Pemilihan Penyedia</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">KEGIATAN</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan PPK telah menentukan metode pemilihan penyedia</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">Telah ditetapkan</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Memastikan kesesuaian metode pemilihan penyedia yang dipilih PPK dengan ketentuan :<br>
              <span style="display:inline-block;width:18px;text-align:right;">a</span>&nbsp;Negosiasi harga dilakukan terhadap harga satuan produk dengan mempertimbangkan kualitas, kuantitas produk, ongkos kirim, biaya instalasi, mobilisasi, SMKK, dan ketersediaan produk<br>
              <span style="display:inline-block;width:18px;text-align:right;">b</span>&nbsp;<em>Mini kompetisi</em> dilakukan terhadap 2 (dua) atau lebih penyedia katalog elektronik yang memiliki produk yang sama atau produk dengan spesifikasi sejenis yang dibutuhkan oleh PPK/PP dengan tujuan mendapatkan harga terbaik; atau<br>
              <span style="display:inline-block;width:18px;text-align:right;">c</span>&nbsp;<em>Competitive Catalogue</em> memuat data dan informasi yang ditawarkan oleh Penyedia Katalog Elektronik dalam lingkup pekerjaan konstruksi berupa komponen dasar konstruksi yang kemudian dikompetisikan melalui sistem.
            </td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Telah memastikan metode yang dipilih :<br>
              <span style="display:inline-block;width:18px;text-align:right;">a</span>&nbsp;Metode Negosiasi Harga sesuai Formulir Penetapan Penyedia Barang/Jasa E-Purchasing<br>
              <span style="display:inline-block;width:18px;text-align:right;">b</span>&nbsp;-<br>
              <span style="display:inline-block;width:18px;text-align:right;">c</span>&nbsp;-
            </td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Hal lain yang relevan dan perlu dilakukan reviu terkait metode pemilihan penyedia</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">tidak ada</td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL 5: Evaluasi Ketersediaan Produk di Katalog Elektronik -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:16px;table-layout:fixed;" class="section-block">
        <colgroup>
          <col style="width:42px;">
          <col style="width:auto;">
          <col style="width:42px;">
          <col style="width:42%;">
        </colgroup>
        <thead>
          <tr>
            <td colspan="4" style="border:none;padding:3px 0 4px;font-weight:bold;color:#000;">5&nbsp;&nbsp;&nbsp;Kertas Kerja Evaluasi terhadap Ketersediaan Produk di Katalog Elektronik</td>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">KEGIATAN</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;white-space:nowrap;">NO.</th>
            <th style="border:1px solid #000;padding:4px 6px;text-align:center;color:#000;font-weight:bold;">HASIL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan ketersediaan produk di katalog elektronik.</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">1</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Produk tersedia pada katalog Sektoral v.6 sesuai hasil survey harga di e-katalog</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Memastikan berapa banyak penyedia katalog yang menyediakan produk yang akan di-purchase.</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">2</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Penyedia tersedia sesuai hasil survey harga di e-katalog</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">Hal lain yang relevan dan perlu dilakukan reviu terkait dengan ketersediaan produk di katalog elektronik.</td>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">3</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">tidak ada</td>
          </tr>
        </tbody>
      </table>

      <!-- TANDA TANGAN -->
      <div class="section-block" style="display:flex;justify-content:space-between;margin-top:24px;">
        <div style="text-align:left;width:45%;color:#000;">
          <div style="color:#000;">Disusun/ditetapkan oleh :</div>
          <div style="color:#000;">PA/KPA/PPK</div>
          ${(()=>{
              const mode = (window._ttdMode && window._ttdMode['formdpp']) || {ttd:false, cap:false};
              const showTtd = mode.ttd && ppk.ttd;
              const showCap = mode.cap && ppk.cap;
              const L = (window._ttdLayout && window._ttdLayout['formdpp']) || {};
              const T = L.ttd || {x:0,y:0,w:120,h:55,r:0,o:100};
              const C = L.cap || {x:80,y:-20,w:80,h:80,r:0,o:85};
              // Container SELALU 70px — gambar mengambang di atas (wrap in front)
              return `<div style="position:relative;height:70px;margin-top:4px;background:transparent;overflow:visible;">
                ${showTtd ? `<img id="doc-ttd-img-formdpp" src="${ppk.ttd}"
                  style="position:absolute;left:0;top:0;width:${T.w}px;height:${T.h}px;object-fit:contain;
                  background:transparent;
                  transform:translate(${T.x}px,${T.y}px) rotate(${T.r}deg);opacity:${T.o/100};
                  cursor:grab;user-select:none;z-index:2;"
                  draggable="false"
                  title="Drag untuk pindah posisi TTD">` : ''}
                ${showCap ? `<img id="doc-cap-img-formdpp" src="${ppk.cap}"
                  style="position:absolute;left:0;top:0;width:${C.w}px;height:${C.h}px;object-fit:contain;
                  background:transparent;
                  transform:translate(${C.x}px,${C.y}px) rotate(${C.r}deg);opacity:${C.o/100};
                  cursor:grab;user-select:none;z-index:3;"
                  draggable="false"
                  title="Drag untuk pindah posisi Cap">` : ''}
              </div>`;
            })()}
          <div style="font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
          <div style="color:#000;">${ppk.nip !== '-' ? 'NIP. ' + ppk.nip : ''}</div>
        </div>
        <div style="text-align:left;width:45%;color:#000;">
          <div style="color:#000;">Diperiksa / Direviu</div>
          <div style="color:#000;">Pejabat Pengadaan</div>
          <div style="margin-top:60px;font-weight:bold;text-decoration:underline;color:#000;">${pejabat.nama}</div>
          <div style="color:#000;">${pejabat.nip !== '-' ? 'NIP. ' + pejabat.nip : ''}</div>
        </div>
      </div>

    </div>
  `;
}


// ============================================================
//  PENETAPAN — Formulir Penetapan Barang/Jasa E-Purchasing
// ============================================================

function populatePenetapanSelects() {
  const rupSel = document.getElementById('penetapan-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">— Pilih No RUP —</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  const ppkSel = document.getElementById('penetapan-ppk-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">— Pilih PPKom —</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
  // Populate kepala bidang dari masterState.bidang
  const bidangSel = document.getElementById('penetapan-bidang-select');
  if (bidangSel) {
    const cur = bidangSel.value;
    bidangSel.innerHTML = '<option value="">— Pilih Kepala Bidang —</option>';
    masterState.bidang.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.kepalaBidang || '-'} (${strTrunc(b.namaBidang || '', 30)})`;
      bidangSel.appendChild(opt);
    });
    bidangSel.value = cur;
  }
}

function loadPenetapanData() {
  const rup = document.getElementById('penetapan-rup-select').value;
  const ppkId = document.getElementById('penetapan-ppk-select').value;
  const bidangId = document.getElementById('penetapan-bidang-select').value;
  const content = document.getElementById('penetapan-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih PPKom, Kepala Bidang, dan No RUP untuk menampilkan Formulir Penetapan Barang/Jasa E-Purchasing</div>
      </div>`;
    return;
  }

  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // PPK
  let ppk = { nama: 'NAMA PPK', nip: '-', jabatan: 'Pejabat Pembuat Komitmen' };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama || found.namaPPK || '-', nip: found.nip || found.nipPPK || '-', jabatan: found.jabatan || 'Pejabat Pembuat Komitmen' };
  }

  // Kepala Bidang dari master bidang
  let kepBidang = { nama: '', nip: '', namaBidang: paket.bidang || '', namaJabatan: '' };
  if (bidangId) {
    const found = masterState.bidang.find(b => String(b.id) === String(bidangId));
    if (found) kepBidang = { nama: found.kepalaBidang || '', nip: found.nip || '', namaBidang: found.namaBidang || '', namaJabatan: found.kodeSurat || '' };
  } else if (paket.bidang) {
    // Auto-match dari bidang paket jika belum dipilih manual
    const auto = masterState.bidang.find(b => b.namaBidang === paket.bidang);
    if (auto) kepBidang = { nama: auto.kepalaBidang || '', nip: auto.nip || '', namaBidang: auto.namaBidang || '', namaJabatan: auto.kodeSurat || '' };
  }

  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));
  const hargaForRup   = state.harga.data.filter(h => String(h.rup) === String(rup));

  // Penetapan = awal alur (sebelum survey harga) — penyediaTerpilih belum tersedia
  // Gunakan data harga jika sudah ada (untuk menampilkan spek), tapi bukan penentu alur
  let penyediaTerpilih = '-';
  let negoFinalTotal = 0;
  let hargaTayangTotal = 0;
  if (hargaForRup.length > 0) {
    const totalPerPenyedia = {};
    hargaForRup.forEach(h => {
      if (!h.namaPenyedia) return;
      const nilaiItem = Number(h.negoFinal) > 0
        ? Number(h.negoFinal) * Number(h.qty || 1)
        : Number(h.totalHarga) || 0;
      totalPerPenyedia[h.namaPenyedia] = (totalPerPenyedia[h.namaPenyedia] || 0) + nilaiItem;
    });
    const sorted = Object.entries(totalPerPenyedia).sort((a,b) => a[1]-b[1]);
    if (sorted.length > 0) { penyediaTerpilih = sorted[0][0]; negoFinalTotal = sorted[0][1]; }
    hargaTayangTotal = hargaForRup.reduce((s, h) => s + (h.totalHarga || 0), 0);
  }

  // Tanggal
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate = tglSrc ? (() => { const p=tglSrc.split('-'); return new Date(+p[0],+p[1]-1,+p[2]); })() : new Date();
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const tahun = tglDate.getFullYear();
  const docOrg = getDocOrg(paket);
  const nomorPenetapanDefault = `PENETAPAN/${paket.rup || '...'}/${docOrg.singkatan}/${tahun}`;
  const nomorPenetapan = getDefaultDocNumber(paket.nomorPenetapan, nomorPenetapanDefault, docOrg.singkatan);

  const durasi = paket.durasi ? `${paket.durasi} ${paket.masaKerja || 'Hari Kalender'}` : '3 Hari Kalender';

  const tdL = 'border:none;padding:3px 6px 3px 0;vertical-align:top;color:#000;';
  const tdC = 'border:none;padding:3px 6px;vertical-align:top;color:#000;';
  const tdR = 'border:none;padding:3px 0;vertical-align:top;color:#000;';

  // ── Visibility flags ──
  const hasRincian = rincianForRup.length > 0;
  const hasHarga   = hargaForRup.length > 0;
  const hideSec    = (hide) => hide ? 'style="display:none"' : '';

  // Tabel A: Jenis Barang/Jasa - baris
  const TOTAL_ROWS = 0; // tidak ada baris kosong padding
  let rowsA = '';
  const dataRows = rincianForRup.length > 0 ? rincianForRup : [];
  const _penOccA = {};
  dataRows.forEach((r, i) => {
    const _keyA = r.itemBarang || '';
    const _occA = _penOccA[_keyA] || 0; _penOccA[_keyA] = _occA + 1;
    const _matchesA = hargaForRup.filter(h => h.namaItem === r.itemBarang);
    const hItem = _matchesA[_occA] || _matchesA[_matchesA.length - 1] || null;
    const spekTeks = hItem && hItem.namaProduk ? `Spesifikasi : ${hItem.namaProduk}` : '';
    rowsA += `<tr>
      <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">${i+1}.</td>
      <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">${r.itemBarang || ''}<br><span style="font-size:10px;">${spekTeks}</span></td>
      <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">${r.vol || ''}</td>
      <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">${r.satuan || ''}</td>
    </tr>`;
  });
  // tidak ada baris kosong padding

  // Tabel B: Spesifikasi Minimal - baris
  let rowsB = '';
  const _penOccB = {};
  dataRows.forEach((r, i) => {
    const _keyB = r.itemBarang || '';
    const _occB = _penOccB[_keyB] || 0; _penOccB[_keyB] = _occB + 1;
    const _matchesB = hargaForRup.filter(h => h.namaItem === r.itemBarang);
    const hItem = _matchesB[_occB] || _matchesB[_matchesB.length - 1] || null;
    const spekTeks = hItem && hItem.namaProduk ? `Spesifikasi : ${hItem.namaProduk}` : '';
    rowsB += `<tr>
      <td style="border:1px solid #000;padding:4px 6px;text-align:center;vertical-align:top;color:#000;">${i+1}.</td>
      <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">${r.itemBarang || ''}${spekTeks ? '<br><span style="font-size:10px;">'+spekTeks+'</span>' : ''}</td>
    </tr>`;
  });
  // tidak ada baris kosong padding

  const tingkatLayanan = `Penyedia wajib memenuhi tingkat layanan meliputi ketepatan waktu, kesesuaian spesifikasi, kualitas hasil, ketepatan jumlah, responsivitas, pengemasan dan pengiriman, jaminan/garansi, fleksibilitas layanan, kepatuhan administratif, serta standar keamanan dan kepatuhan. Penyedia juga wajib menindaklanjuti setiap ketidaksesuaian melalui perbaikan atau penggantian tanpa biaya tambahan sesuai ketentuan yang disepakati serta bertanggung jawab penuh atas pengadaan.`;

  content.innerHTML = `
    <div id="penetapan-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div style="text-align:center;margin-bottom:18px;" class="section-block">
        <div style="font-size:14pt;font-weight:bold;text-decoration:underline;color:#000;letter-spacing:0.5px;">FORMULIR PENETAPAN BARANG/JASA E-PURCHASING</div>
        <div style="font-size:12pt;color:#000;">Nomor : ${nomorPenetapan} <button onclick="openNomorDialog(this)" data-slug="penetapan" data-rup="${paket.rup}" data-field="nomorPenetapan" data-cur="${nomorPenetapan}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- TABEL PERUBAHAN -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:12px;" class="section-block">
        <tbody>
          <tr>
            <td style="${tdL}width:160px;">Perubahan ke</td>
            <td style="${tdC}width:12px;">:</td>
            <td style="${tdR}min-width:auto;">&nbsp;</td>
          </tr>
          <tr>
            <td style="${tdL}">Tanggal</td>
            <td style="${tdC}">:</td>
            <td style="${tdR}">${tglFormatted}</td>
          </tr>
        </tbody>
      </table>

      <!-- TABEL INFO PAKET -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:16px;border:1px solid #000;" class="section-block">
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;width:160px;vertical-align:top;color:#000;">Pemerintah Daerah</td>
            <td style="border:1px solid #000;padding:4px 6px;width:10px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${docOrg.namaInstansi}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">PA/KPA/PPK *)</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${ppk.nama}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Program</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${fmtText(paket.program)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Kegiatan</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${fmtText(paket.kegiatan)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Sub Kegiatan</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${fmtText(paket.subKegiatan)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Output</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${paket.output || '-'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Mata Anggaran</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${paket.kodeRekening || '-'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Pagu</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${paket.paguAnggaran ? Number(paket.paguAnggaran).toLocaleString('id-ID') : '-'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Jenis Pengadaan</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;"><span style="text-decoration:underline;font-weight:bold;">Pengadaan Barang</span></td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Nama Paket</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${paket.namaPaket || '-'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Masa Pelaksanaan</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${durasi}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">Sumber Dana</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">:</td>
            <td style="border:1px solid #000;padding:4px 8px;vertical-align:top;color:#000;">${docOrg.sumberDana} ${docOrg.kabupaten} TA ${tahun}</td>
          </tr>
        </tbody>
      </table>

      <!-- SEKSI A: JENIS BARANG/JASA -->
      <table ${hideSec(!hasRincian)} style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;" class="section-block">
        <thead>
          <tr>
            <th class="no-col" style="border:1px solid #000;padding:5px 8px;text-align:center;background:#d9d9d9;color:#000;font-weight:bold;width:36px;">No</th>
            <th colspan="3" style="border:1px solid #000;padding:5px 8px;text-align:left;background:#d9d9d9;color:#000;font-weight:bold;">A&nbsp;&nbsp;&nbsp;Meliputi Pengadaan Barang :</th>
          </tr>
          <tr>
            <th style="border:1px solid #000;padding:5px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;width:36px;"></th>
            <th style="border:1px solid #000;padding:5px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;">JENIS BARANG/JASA</th>
            <th style="border:1px solid #000;padding:5px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;width:80px;">QTY</th>
            <th style="border:1px solid #000;padding:5px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;width:90px;">SATUAN</th>
          </tr>
        </thead>
        <tbody>
          ${rowsA}
        </tbody>
      </table>

      <!-- SEKSI B: SPESIFIKASI MINIMAL -->
      <table ${hideSec(!hasRincian)} style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;" class="section-block">
        <thead>
          <tr>
            <th style="border:1px solid #000;padding:5px 8px;text-align:center;background:#d9d9d9;color:#000;font-weight:bold;width:36px;">B</th>
            <th style="border:1px solid #000;padding:5px 8px;text-align:left;background:#d9d9d9;color:#000;font-weight:bold;">Spesifikasi Minimal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsB}
        </tbody>
      </table>

      <!-- SEKSI C: PERSYARATAN LAIN -->
      <table ${hideSec(!hasRincian)} style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;table-layout:fixed;" class="section-block">
        <colgroup>
          <col style="width:36px;">
          <col style="width:auto;">
          <col style="width:40%;">
        </colgroup>
        <thead>
          <tr>
            <th colspan="3" style="border:1px solid #000;padding:5px 8px;text-align:left;background:#d9d9d9;color:#000;font-weight:bold;">C&nbsp;&nbsp;&nbsp;Persyaratan Lain Yang Diperlukan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">1.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Cara pengiriman</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Darat</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">2.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Cara pengangkutan</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Roda Dua/Roda Empat</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">3.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Cara pemasangan</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">-</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">4.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Cara penyimpanan</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Dibungkus Rapi</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">5.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Cara pengoperasian/penggunaan</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">-</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;vertical-align:top;color:#000;">6.</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">Kebutuhan pelatihan untuk pengoperasian/pemeliharaan Barang</td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">Tidak</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">7.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Aspek pengadaan berkelanjutan</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Ya</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">8.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Metode Pemilihan</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Sekali Proses</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;text-align:center;white-space:nowrap;color:#000;">9.</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Metode Pembayaran</td>
            <td style="border:1px solid #000;padding:4px 6px;color:#000;">Sekaligus</td>
          </tr>
        </tbody>
      </table>

      <!-- SEKSI D: PENETAPAN METODE E-PURCHASING -->
      <table ${hideSec(!hasRincian)} style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;" class="section-block">
        <thead>
          <tr>
            <th colspan="2" style="border:1px solid #000;padding:5px 8px;text-align:left;background:#d9d9d9;color:#000;font-weight:bold;">D&nbsp;&nbsp;&nbsp;PENETAPAN METODE E-PURCHASING</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;width:50%;vertical-align:top;color:#000;">1. Penetapan Metode E-Purchasing</td>
            <td style="border:1px solid #000;padding:4px 6px;width:50%;vertical-align:top;color:#000;font-weight:bold;">Negosiasi Harga</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;">2. Dasar Pemilihan Metode E-Purchasing<br><em style="font-weight:bold;">(termasuk justifikasi memilih penyedia secara berulang)</em></td>
            <td style="border:1px solid #000;padding:4px 6px;vertical-align:top;color:#000;text-align:justify;">
              Dasar memilih Metode e-purchasing dengan Negosiasi melalui Katalog Elektronik LKPP dipilih berdasarkan pertimbangan berikut :
              <table style="width:100%;border-collapse:collapse;margin-top:6px;">
                <tr>
                  <td style="border:none;padding:2px 6px 2px 0;vertical-align:top;width:22px;color:#000;text-align:right;">a)</td>
                  <td style="border:none;padding:2px 0;color:#000;text-align:justify;"><strong>Efisiensi Waktu :</strong> E-purchasing memungkinkan proses pengadaan yang lebih cepat dibandingkan metode lain, mengurangi waktu administratif dan prosedural</td>
                </tr>
                <tr>
                  <td style="border:none;padding:2px 6px 2px 0;vertical-align:top;width:22px;color:#000;text-align:right;">b)</td>
                  <td style="border:none;padding:2px 0;color:#000;text-align:justify;"><strong>Transparansi :</strong> Harga dan spesifikasi produk sudah tercantum dalam Katalog Elektronik, meningkatkan transparansi dan mengurangi risiko mark-up harga</td>
                </tr>
                <tr>
                  <td style="border:none;padding:2px 6px 2px 0;vertical-align:top;width:22px;color:#000;text-align:right;">c)</td>
                  <td style="border:none;padding:2px 0;color:#000;text-align:justify;"><strong>Kemudahan Komparasi :</strong> Katalog Elektronik memungkinkan perbandingan langsung antara berbagai produk dan penyedia, memudahkan pemilihan opsi terbaik sesuai kebutuhan dan anggaran</td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- SEKSI E: CATATAN LAINNYA -->
      <table ${hideSec(!hasRincian)} style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;" class="section-block">
        <thead>
          <tr>
            <th style="border:1px solid #000;padding:5px 8px;text-align:left;background:#d9d9d9;color:#000;font-weight:bold;">E&nbsp;&nbsp;&nbsp;CATATAN LAINNYA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:6px 8px;color:#000;text-align:justify;">${tingkatLayanan}</td>
          </tr>
        </tbody>
      </table>

      <!-- TANDA TANGAN -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-top:0;" class="section-block">
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;width:50%;vertical-align:top;color:#000;">Ditetapkan pada tanggal</td>
            <td style="border:1px solid #000;padding:5px 8px;width:50%;vertical-align:top;color:#000;">${tglFormatted}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">
              <div>Ditetapkan oleh</div>
              <div>PA/KPA/PPK</div>
              <div style="margin-top:60px;font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
              <div style="color:#000;">${ppk.nip && ppk.nip !== '-' ? 'NIP. ' + ppk.nip : ''}</div>
            </td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:left;">
              <div>Disusun oleh</div>
              <div>a.n ${kepBidang.namaJabatan || kepBidang.namaBidang || (paket.bidang || 'Bidang')}</div>
              ${kepBidang.nama
                ? `<div style="margin-top:60px;font-weight:bold;text-decoration:underline;color:#000;">${kepBidang.nama}</div>
                   <div style="color:#000;">${kepBidang.nip ? 'NIP. ' + kepBidang.nip : ''}</div>`
                : `<div style="margin-top:60px;color:#000;">&nbsp;</div>`
              }
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  `;
}

// ============================================================
//  IDKB — Formulir Identifikasi Kebutuhan Barang/Jasa
// ============================================================

function populateIdkbSelects() {
  const rupSel = document.getElementById('idkb-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">— Pilih No RUP —</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  const ppkSel = document.getElementById('idkb-ppk-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">— Pilih PPKom —</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
  const bidangSel = document.getElementById('idkb-bidang-select');
  if (bidangSel) {
    const cur = bidangSel.value;
    bidangSel.innerHTML = '<option value="">— Pilih Kepala Bidang —</option>';
    masterState.bidang.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.kepalaBidang || '-'} (${strTrunc(b.namaBidang || '', 30)})`;
      bidangSel.appendChild(opt);
    });
    bidangSel.value = cur;
  }
}

function loadIdkbData() {
  const rup      = document.getElementById('idkb-rup-select').value;
  const ppkId    = document.getElementById('idkb-ppk-select').value;
  const bidangId = document.getElementById('idkb-bidang-select').value;
  const content  = document.getElementById('idkb-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🪪</div>
        <div class="empty-title" style="font-family:'Plus Jakarta Sans',sans-serif;">Pilih No RUP</div>
        <div class="empty-sub" style="font-family:'Plus Jakarta Sans',sans-serif;">Pilih PPKom, Kepala Bidang, dan No RUP untuk menampilkan Formulir Identifikasi Kebutuhan Barang/Jasa</div>
      </div>`;
    return;
  }

  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // PPK
  let ppk = { nama: 'NAMA PPK', nip: '-', jabatan: 'PA/KPA/PPK' };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama || found.namaPPK || '-', nip: found.nip || found.nipPPK || '-', jabatan: found.jabatan || 'PA/KPA/PPK' };
  }

  // Kepala Bidang
  let kepBidang = { nama: '', nip: '', namaBidang: paket.bidang || '', namaJabatan: '' };
  if (bidangId) {
    const found = masterState.bidang.find(b => String(b.id) === String(bidangId));
    if (found) kepBidang = { nama: found.kepalaBidang || '', nip: found.nip || '', namaBidang: found.namaBidang || '', namaJabatan: found.kodeSurat || '' };
  } else if (paket.bidang) {
    const auto = masterState.bidang.find(b => b.namaBidang === paket.bidang);
    if (auto) kepBidang = { nama: auto.kepalaBidang || '', nip: auto.nip || '', namaBidang: auto.namaBidang || '', namaJabatan: auto.kodeSurat || '' };
  }

  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));
  const hargaForRup   = state.harga.data.filter(h => String(h.rup) === String(rup));

  // Penyedia terpilih (dari survey harga - penyedia dengan total negosiasi terendah)
  let penyediaList = [];
  if (hargaForRup.length > 0) {
    const allNames = [...new Set(hargaForRup.map(h => h.namaPenyedia).filter(Boolean))];
    // Ambil semua penyedia unik beserta linknya
    allNames.forEach(nama => {
      const h = hargaForRup.find(h2 => h2.namaPenyedia === nama && h2.linkKatalog);
      penyediaList.push({ nama, link: h ? h.linkKatalog : '' });
    });
  }
  // Jika tidak ada dari harga, ambil dari master penyedia
  if (penyediaList.length === 0) {
    state.penyedia.data.slice(0, 3).forEach(p => {
      penyediaList.push({ nama: p.namaPenyedia, link: p.linkToko || '' });
    });
  }

  // Tanggal — gunakan tanggalDPP jika ada, fallback ke tanggalPesanan
  const tglSrc = paket.tanggalDPP || paket.tanggalPesanan || '';
  let tglDate = tglSrc ? (() => { const p = tglSrc.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); })() : new Date();
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const tahun = tglDate.getFullYear();

  const durasi = paket.durasi ? `${paket.durasi} ${paket.masaKerja || 'Hari Kalender'}` : '3 Hari Kalender';

  const TOTAL_ROWS = 15;
  const bdS = 'border:1px solid #000;';
  const tdBase = `${bdS}padding:4px 6px;vertical-align:top;color:#000;font-size:11px;`;

  // --- Bagian A: Identifikasi jenis/tipe barang ---
  // a) Daftar barang
  let rowsAa = '';
  if (rincianForRup.length > 0) {
    rincianForRup.forEach((r, i) => {
      rowsAa += `<tr><td style="${tdBase}width:30px;text-align:center;">${i+1}.</td><td style="${tdBase}">${r.itemBarang || ''}</td></tr>`;
    });
    // tidak ada baris kosong padding
  } else {
    // tidak ada data — tidak tampilkan baris kosong
  }

  // b) Jumlah kebutuhan
  let rowsAb = '';
  if (rincianForRup.length > 0) {
    rincianForRup.forEach((r, i) => {
      rowsAb += `<tr>
        <td style="${tdBase}width:30px;text-align:center;">${i+1}.</td>
        <td style="${tdBase}">${r.itemBarang || ''}</td>
        <td style="${tdBase}width:30px;text-align:center;">=</td>
        <td style="${tdBase}width:70px;text-align:right;">${r.vol ? Number(r.vol).toLocaleString('id-ID') : ''}</td>
        <td style="${tdBase}width:70px;text-align:center;">${r.satuan || ''}</td>
      </tr>`;
    });
    // tidak ada baris kosong padding
  } else {
    // tidak ada data — tidak tampilkan baris kosong
  }

  // c) Waktu pemanfaatan
  const tglMulai = paket.tanggalPesanan ? (() => {
    const p = paket.tanggalPesanan.split('-');
    const d = new Date(+p[0], +p[1]-1, +p[2]);
    return namaBulan[d.getMonth()] + ' s.d Desember ' + d.getFullYear();
  })() : `Januari s.d Desember ${tahun}`;

  // --- Bagian B: Spesifikasi Teknis ---
  let rowsB = '';
  if (rincianForRup.length > 0) {
    rincianForRup.forEach((r, i) => {
      const hItem = hargaForRup.find(h => h.namaItem === r.itemBarang);
      const spek = hItem && hItem.namaProduk ? `Spesifikasi : ${hItem.namaProduk}` : '';
      rowsB += `<tr><td style="${tdBase}width:30px;text-align:center;">${i+1}.</td><td style="${tdBase}">${r.itemBarang || ''}${spek ? '<br><span style="font-size:10px;">'+spek+'</span>' : ''}</td></tr>`;
    });
    // tidak ada baris kosong padding
  } else {
    // tidak ada data — tidak tampilkan baris kosong
  }

  // --- Bagian C: Ketersediaan penyedia ---
  let rowsC = '';
  penyediaList.forEach((p, i) => {
    rowsC += `<tr>
      <td style="${tdBase}width:30px;text-align:center;">${i+1})</td>
      <td style="${tdBase}">${p.nama}<br>${p.link ? `<a href="${p.link}" style="color:#1f6feb;font-size:10px;">${p.link}</a>` : ''}</td>
    </tr>`;
  });
  if (penyediaList.length === 0) {
    rowsC = `<tr><td colspan="2" style="${tdBase}font-style:italic;color:#666;">Belum ada data penyedia</td></tr>`;
  }

  // Tabel F (tanda tangan)
  const tglIdkb = `22 Februari ${tahun}`; // gunakan tanggalDPP jika ada
  const tglIdkbReal = paket.tanggalDPP ? (() => {
    const p = paket.tanggalDPP.split('-');
    const d = new Date(+p[0], +p[1]-1, +p[2]);
    return `${d.getDate()} ${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
  })() : tglFormatted;
  const docOrg = getDocOrg(paket);
  const nomorIdkbDefault = `IDKB/${paket.rup || '...'}/${docOrg.singkatan}/${tahun}`;
  const nomorIdkb = getDefaultDocNumber(paket.nomorIdkb, nomorIdkbDefault, docOrg.singkatan);

  content.innerHTML = `
    <div id="idkb-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div style="text-align:center;margin-bottom:18px;" class="section-block">
        <div style="font-size:14pt;font-weight:bold;text-decoration:underline;color:#000;letter-spacing:0.5px;">FORMULIR IDENTIFIKASI KEBUTUHAN BARANG/JASA</div>
        <div style="font-size:12pt;color:#000;">Nomor : ${nomorIdkb} <button onclick="openNomorDialog(this)" data-slug="idkb" data-rup="${paket.rup}" data-field="nomorIdkb" data-cur="${nomorIdkb}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- TABEL INFO PAKET -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:16px;" class="section-block">
        <colgroup><col style="width:160px;"><col style="width:14px;"><col></colgroup>
        <tbody>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Pemerintah</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">Pemerintah ${docOrg.kabupaten}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">PA/KPA/PPK *)</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${ppk.nama}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Program</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${fmtText(paket.program)}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Kegiatan</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${fmtText(paket.kegiatan)}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Sub Kegiatan</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${fmtText(paket.subKegiatan)}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Output</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${paket.output || '-'}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Nama Paket</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${paket.namaPaket || '-'}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Pagu</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">Rp${paket.paguAnggaran ? Number(paket.paguAnggaran).toLocaleString('id-ID') : '-'}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Mata Anggaran</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${paket.kodeRekening || '-'}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Jenis Pengadaan</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;font-weight:bold;text-decoration:underline;">Pengadaan Barang</td>
          </tr>
          <tr>
            <td style="padding:2px 0;border:none;color:#000;">Sumber Dana</td>
            <td style="padding:2px 6px;border:none;color:#000;">:</td>
            <td style="padding:2px 0;border:none;color:#000;">${docOrg.sumberDana} ${docOrg.kabupatenShort} Tahun ${tahun}</td>
          </tr>
        </tbody>
      </table>

      <!-- A. IDENTIFIKASI JENIS/TIPE BARANG/JASA -->
      <div style="font-weight:bold;color:#000;margin-bottom:6px;" class="section-block">A.&nbsp;&nbsp;&nbsp;Identifikasi Jenis/Tipe Barang/Jasa</div>

      <!-- a) Identifikasi barang -->
      <div style="color:#000;margin-bottom:4px;margin-left:14px;">a)&nbsp;&nbsp;Identifikasi barang/jasa yang dibutuhkan :</div>
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;" class="section-block">
        <tbody>
          ${rowsAa}
        </tbody>
      </table>

      <!-- b) Jumlah Kebutuhan -->
      <div style="color:#000;margin-bottom:4px;margin-left:14px;">b)&nbsp;&nbsp;Jumlah Kebutuhan barang/jasa :</div>
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;" class="section-block">
        <tbody>
          ${rowsAb}
        </tbody>
      </table>

      <!-- c) Waktu Pemanfaatan -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:4px;" class="section-block">
        <tbody>
          <tr>
            <td style="padding:2px 0 2px 14px;border:none;color:#000;width:220px;">c)&nbsp;&nbsp;Waktu Pemanfaatan barang/jasa</td>
            <td style="padding:2px 6px;border:none;color:#000;width:14px;">=</td>
            <td style="padding:2px 0;border:none;color:#000;">${tglMulai}</td>
          </tr>
          <tr>
            <td style="padding:2px 0 2px 14px;border:none;color:#000;">d)&nbsp;&nbsp;Perkiraan Waktu (termasuk pengiriman)</td>
            <td style="padding:2px 6px;border:none;color:#000;">=</td>
            <td style="padding:2px 0;border:none;color:#000;">${durasi}</td>
          </tr>
          <tr>
            <td style="padding:2px 0 2px 14px;border:none;color:#000;">e)&nbsp;&nbsp;Terdapat di Katalog LKPP</td>
            <td style="padding:2px 6px;border:none;color:#000;">=</td>
            <td style="padding:2px 0;border:none;color:#000;">Katalog Lokal v.6</td>
          </tr>
          <tr>
            <td style="padding:2px 0 2px 14px;border:none;color:#000;">f)&nbsp;&nbsp;Perkiraan Biaya</td>
            <td style="padding:2px 6px;border:none;color:#000;">=</td>
            <td style="padding:2px 0;border:none;color:#000;">Rp${paket.paguAnggaran ? Number(paket.paguAnggaran).toLocaleString('id-ID') : '-'}</td>
          </tr>
        </tbody>
      </table>

      <!-- B. SPESIFIKASI TEKNIS MINIMAL -->
      <div style="font-weight:bold;color:#000;margin:12px 0 6px;" class="section-block">B.&nbsp;&nbsp;&nbsp;Spesifikasi Teknis Minimal Barang/Jasa</div>
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;" class="section-block">
        <tbody>
          ${rowsB}
        </tbody>
      </table>

      <!-- C. KETERSEDIAAN PRODUK DAN PELAKU USAHA -->
      <div style="font-weight:bold;color:#000;margin-bottom:6px;" class="section-block">C.&nbsp;&nbsp;&nbsp;Ketersediaan Produk dan Pelaku Usaha</div>
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:10px;" class="section-block">
        <tbody>
          ${rowsC}
        </tbody>
      </table>

      <!-- E. PENENTUAN PRIORITAS -->
      <div style="font-weight:bold;color:#000;margin-bottom:4px;" class="section-block">E.&nbsp;&nbsp;&nbsp;Penentuan Prioritas Barang/Jasa</div>
      <div style="color:#000;margin-bottom:14px;margin-left:20px;">Prioritas PDN, UMKM, Lokal Kapuas Hulu</div>

      <!-- F. TANDA TANGAN -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-top:4px;" class="section-block">
        <tbody>
          <tr>
            <td style="${tdBase}width:50%;">Disusun pada tanggal</td>
            <td style="${tdBase}width:50%;">${tglIdkbReal}</td>
          </tr>
          <tr>
            <td style="${tdBase}vertical-align:top;">
              <div style="color:#000;">Ditetapkan oleh,</div>
              <div style="color:#000;">PA/KPA/PPK</div>
              <div style="color:#000;">${docOrg.namaInstansi}</div>
              <div style="margin-top:60px;font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
              <div style="color:#000;">${ppk.nip && ppk.nip !== '-' ? 'NIP. ' + ppk.nip : ''}</div>
            </td>
            <td style="${tdBase}vertical-align:top;">
              <div style="color:#000;">Disusun oleh,</div>
              <div style="color:#000;">${kepBidang.namaJabatan || kepBidang.namaBidang || (paket.bidang || 'Bidang')}</div>
              <div style="margin-top:60px;font-weight:bold;text-decoration:underline;color:#000;">${kepBidang.nama || '&nbsp;'}</div>
              <div style="color:#000;">${kepBidang.nip ? 'NIP. ' + kepBidang.nip : ''}</div>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  `;
}

function printIdkb() {
  const printArea = document.getElementById('idkb-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Formulir Identifikasi Kebutuhan Barang/Jasa</title>
      <style>
        ${buildPageRule('idkb')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.5; }
        table { border-collapse:collapse; width:100%; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        a { color:#000 !important; text-decoration:none; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

function printPenetapan() {
  const printArea = document.getElementById('penetapan-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Formulir Penetapan Barang/Jasa E-Purchasing</title>
      <style>
        ${buildPageRule('penetapan')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.5; }
        table { border-collapse:collapse; width:100%; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { border:1px solid #000; word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

function printRiviu() {
  const printArea = document.getElementById('riviu-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Berita Acara Reviu DPP E-Purchasing</title>
      <style>
        ${buildPageRule('riviu')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.5; }
        table { border-collapse:collapse; width:100%; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { word-wrap:break-word; }
        p { margin:3px 0; orphans:3; widows:3; }
        em { font-style:italic; }
        .section-block { page-break-inside:auto; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

// ============================================================
//  NODIS — Nota Dinas Pengajuan Belanja
// ============================================================

function populateNodisSelects() {
  // RUP select
  const rupSel = document.getElementById('nodis-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">— Pilih No RUP —</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  // PPK select
  const ppkSel = document.getElementById('nodis-pejabat-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">— Pilih PPKom —</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
  // Kepala Bidang select
  const bidangSel = document.getElementById('nodis-bidang-select');
  if (bidangSel) {
    const cur = bidangSel.value;
    bidangSel.innerHTML = '<option value="">— Pilih Kepala Bidang —</option>';
    masterState.bidang.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.kepalaBidang || '-'} (${strTrunc(b.namaBidang || '', 30)})`;
      bidangSel.appendChild(opt);
    });
    bidangSel.value = cur;
  }
}

function loadNodisData() {
  const rup = document.getElementById('nodis-rup-select').value;
  const ppkId = document.getElementById('nodis-pejabat-select').value;
  const bidangId = document.getElementById('nodis-bidang-select').value;
  const content = document.getElementById('nodis-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📬</div>
        <div class="empty-title" style="font-family:'Plus Jakarta Sans',sans-serif;">Pilih No RUP</div>
        <div class="empty-sub" style="font-family:'Plus Jakarta Sans',sans-serif;">Pilih PPKom, Kepala Bidang, dan No RUP untuk menampilkan Nota Dinas Pengajuan Belanja</div>
      </div>`;
    return;
  }

  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // PPK / PPKom
  let ppk = { nama: 'NAMA PPK', nip: 'NIP. -' };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama || found.namaPPK || '-', nip: found.nip || found.nipPPK || '-' };
  }

  // Kepala Bidang
  let kepBidang = { nama: '', nip: '', namaBidang: paket.bidang || '', namaJabatan: '' };
  if (bidangId) {
    const found = masterState.bidang.find(b => String(b.id) === String(bidangId));
    if (found) kepBidang = { nama: found.kepalaBidang || '', nip: found.nip || '', namaBidang: found.namaBidang || '', namaJabatan: found.kodeSurat || '' };
  } else if (paket.bidang) {
    const auto = masterState.bidang.find(b => b.namaBidang === paket.bidang);
    if (auto) kepBidang = { nama: auto.kepalaBidang || '', nip: auto.nip || '', namaBidang: auto.namaBidang || '', namaJabatan: auto.kodeSurat || '' };
  }

  // Data rincian (item barang) untuk RUP ini
  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));
  const hargaForRup = state.harga.data.filter(h => String(h.rup) === String(rup));

  // Tanggal (dari tanggalPesanan paket)
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const docOrg = getDocOrg(paket);

  // Nomor nodis dari RUP atau paket
  const nomorNodisDefault = `NODIS/${paket.rup}/${docOrg.singkatan}/${tglDate.getFullYear()}`;
  const nomorNodis = getDefaultDocNumber(paket.nomorNodis, nomorNodisDefault, docOrg.singkatan);

  // Kepala bidang
  const kepalaBidang = paket.kepalaBidang || '-';
  const nipKepalaBidang = paket.nip || '-';
  const bidang = paket.bidang || 'Bidang Perencanaan Pengendalian dan Evaluasi Daerah';

  // Hitung total pagu
  const totalPagu = paket.paguAnggaran ? Number(paket.paguAnggaran) : 0;

  // Bangun baris item rincian untuk tabel nodis
  const TOTAL_ROWS = 0; // tidak ada baris kosong padding
  let itemRows = '';
  const numRincian = rincianForRup.length;
  const hasRincian = numRincian > 0;
  const hasHarga   = hargaForRup.length > 0;
  const hideSec    = (hide) => hide ? 'style="display:none"' : '';

  if (numRincian > 0) {
    rincianForRup.forEach((r, idx) => {
      const hargaItem = hargaForRup.find(h => h.namaItem === r.itemBarang || h.namaProduk === r.itemBarang);
      const spek = hargaItem && hargaItem.namaProduk ? hargaItem.namaProduk : (r.spesifikasi || '');
      const qty = r.vol || '';
      const satuan = r.satuan || '';
      const hargaSatuan = r.hargaSatuan ? Number(r.hargaSatuan) : 0;
      const jumlah = qty && hargaSatuan ? qty * hargaSatuan : 0;
      const hargaSatuanFmt = hargaSatuan ? `Rp${Number(hargaSatuan).toLocaleString('id-ID')}` : '';
      const jumlahFmt = jumlah ? `Rp${jumlah.toLocaleString('id-ID')}` : '';
      itemRows += `
        <tr>
          <td style="border:1px solid #000;padding:6px 8px;text-align:center;vertical-align:top;color:#000;">${idx + 1}</td>
          <td style="border:1px solid #000;padding:6px 8px;vertical-align:top;color:#000;">
            ${r.itemBarang || ''}${spek ? `<br><span style="font-size:10px;color:#333;">Spesifikasi : ${spek}</span>` : ''}
          </td>
          <td style="border:1px solid #000;padding:6px 8px;text-align:center;vertical-align:top;color:#000;">${qty}</td>
          <td style="border:1px solid #000;padding:6px 8px;text-align:center;vertical-align:top;color:#000;">${satuan}</td>
          <td style="border:1px solid #000;padding:6px 8px;text-align:right;vertical-align:top;color:#000;">${hargaSatuanFmt}</td>
          <td style="border:1px solid #000;padding:6px 8px;text-align:right;vertical-align:top;color:#000;">${jumlahFmt}</td>
        </tr>`;
    });
    // Tidak ada baris kosong padding
  } else {
    // Tidak ada data — tidak tampilkan baris kosong
  }

  // Build HTML dokumen Nodis
  content.innerHTML = `
    <div id="nodis-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.6;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- HEADER NOTA DINAS -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:18px;" class="section-block">
        <colgroup><col style="width:80px;"><col style="width:10px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Yth.</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">Pejabat Pembuat Komitmen (PPK)</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Dari</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">${bidang}</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Tanggal</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">${tglFormatted}</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Nomor</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">${nomorNodis} <button onclick="openNomorDialog(this)" data-slug="nodis" data-rup="${paket.rup}" data-field="nomorNodis" data-cur="${nomorNodis}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Sifat</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">Biasa</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Lampiran</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">1 (satu) lampiran</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Perihal</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">Biasa</td>
          </tr>
        </tbody>
      </table>

      <!-- KALIMAT PEMBUKA -->
      <p style="margin:0 0 14px 0;color:#000;text-align:justify;">Terlampir disampaikan pengajuan dengan rincian sebagian berikut :</p>

      <!-- TABEL INFO PAKET -->
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;margin-bottom:0;border:1px solid #000;" class="section-block">
        <colgroup><col style="width:28px;"><col style="width:160px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">1.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">Nama Program</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">${fmtText(paket.program)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">2.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">Nama Kegiatan</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">${fmtText(paket.kegiatan)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">3.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">Nama Sub Kegiatan</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">${fmtText(paket.subKegiatan)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">4.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">Nama Paket</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">${paket.namaPaket || '-'}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">5.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">Pagu Anggaran</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">${fmtRp(paket.paguAnggaran)}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">6.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">Kode Rekening Belanja</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;">${paket.kodeRekening || '-'}</td>
          </tr>
          <tr ${hideSec(!hasRincian)}>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;text-align:center;">7.</td>
            <td style="border:1px solid #000;padding:5px 8px;vertical-align:top;color:#000;" colspan="2">Rincian Belanja :
              <!-- SUB TABEL RINCIAN BELANJA -->
              <table style="width:100%;border-collapse:collapse;font-size:10pt;color:#000;margin-top:8px;">
                <colgroup>
                  <col style="width:42px;">
                  <col style="width:auto;">
                  <col style="width:55px;">
                  <col style="width:65px;">
                  <col style="width:95px;">
                  <col style="width:110px;">
                </colgroup>
                <thead>
                  <tr>
                    <th class="no-col" style="border:1px solid #000;padding:6px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;white-space:nowrap;">No</th>
                    <th style="border:1px solid #000;padding:6px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;">Item Barang dan Spek Minimal</th>
                    <th style="border:1px solid #000;padding:6px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;">Qty</th>
                    <th style="border:1px solid #000;padding:6px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;">Satuan</th>
                    <th style="border:1px solid #000;padding:6px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;">Harga Satuan (Rp)</th>
                    <th style="border:1px solid #000;padding:6px 8px;text-align:center;background:#fff;color:#000;font-weight:bold;">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- KALIMAT PENUTUP -->
      <p style="margin:20px 0 0 0;color:#000;text-align:justify;">Demikian disampaikan untuk dapat dipergunakan sebagaimana mestinya.</p>

      <!-- TANDA TANGAN -->
      <div class="section-block" style="display:flex;justify-content:space-between;margin-top:32px;align-items:flex-end;">
        <div style="text-align:left;width:45%;color:#000;display:flex;flex-direction:column;">
            <div>
              <div style="color:#000;">Mengetahui,</div>
              <div style="color:#000;">Pejabat Pembuat Komitmen (PPKom)</div>
            <div style="color:#000;">${docOrg.namaInstansi}</div>
          </div>
          <div style="margin-top:60px;">
            <div style="font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
            <div style="color:#000;">${ppk.nip && ppk.nip !== 'NIP. -' ? (ppk.nip.startsWith('NIP') ? ppk.nip : 'NIP. ' + ppk.nip) : ''}</div>
          </div>
        </div>
        <div style="text-align:left;width:45%;color:#000;display:flex;flex-direction:column;">
          <div>
            <div style="color:#000;">a.n &nbsp;&nbsp;${kepBidang.namaBidang || bidang}</div>
            <div style="margin-top:8px;color:#000;">${kepBidang.namaJabatan || 'Kepala Bidang'}</div>
          </div>
          <div style="margin-top:60px;">
            <div style="font-weight:bold;text-decoration:underline;color:#000;">${kepBidang.nama || kepalaBidang}</div>
            <div style="color:#000;">${(kepBidang.nip || nipKepalaBidang) !== '-' ? ((kepBidang.nip || nipKepalaBidang).startsWith('NIP') ? (kepBidang.nip || nipKepalaBidang) : 'NIP. ' + (kepBidang.nip || nipKepalaBidang)) : ''}</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ============================================================
//  SPPBJ — Surat Perintah Pengadaan Barang/Jasa
// ============================================================

function populateSppbjSelects() {
  // RUP select
  const rupSel = document.getElementById('sppbj-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">— Pilih No RUP —</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  // PPKom select
  const ppkSel = document.getElementById('sppbj-ppk-select') || document.getElementById('sppbj-pejabat-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">— Pilih PPKom —</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }

  if (rupSel?.value) setTimeout(loadSppbjData, 0);
}

if (typeof _sppbjRenderTimer === 'undefined') var _sppbjRenderTimer = null;
function scheduleLoadSppbjData() {
  clearTimeout(_sppbjRenderTimer);
  _sppbjRenderTimer = setTimeout(loadSppbjData, 30);
}

function loadSppbjData() {
  const rupEl = document.getElementById('sppbj-rup-select');
  const ppkEl = document.getElementById('sppbj-ppk-select') || document.getElementById('sppbj-pejabat-select');
  const content = document.getElementById('sppbj-content');
  if (!rupEl || !content) return;

  const rup   = rupEl.value;
  const ppkId = ppkEl ? ppkEl.value : '';

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📨</div>
        <div class="empty-title" style="font-family:'Plus Jakarta Sans',sans-serif;">Pilih No RUP</div>
        <div class="empty-sub" style="font-family:'Plus Jakarta Sans',sans-serif;">Pilih PPKom dan No RUP untuk menampilkan Surat Perintah Pengadaan Barang/Jasa</div>
      </div>`;
    return;
  }

  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  // PPKom
  let ppk = { nama: 'NAMA PPKom', nip: 'NIP. -', ttd: '', cap: '', ttdSizeW:120, ttdSizeH:55, capSizeW:80, capSizeH:80 };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama || found.namaPPK || '-', nip: found.nip || found.nipPPK || '-', ttd: found.ttd||'', cap: found.cap||'', ttdSizeW: found.ttdSizeW||120, ttdSizeH: found.ttdSizeH||55, capSizeW: found.capSizeW||80, capSizeH: found.capSizeH||80 };
  }

  // Tanggal
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const docOrg = getDocOrg(paket);
  const tahun = paket.tahunAnggaran || docOrg.tahunAnggaran || tglDate.getFullYear();
  const namaInstansi = docOrg.namaInstansi;
  const singkatan    = docOrg.singkatan;
  const kabupaten    = docOrg.kabupaten;
  const kotaKab      = docOrg.kabupatenShort || 'Putussibau';

  // Nomor surat
  const nomorSppbjDefault = `${paket.rup || '...'}/${singkatan}/${tglDate.getFullYear()}`;
  const nomorSppbj = getDefaultDocNumber(paket.nomorSppbj, nomorSppbjDefault, singkatan);

  // TTD/Cap
  const mode = (window._ttdMode && window._ttdMode['sppbj']) || {ttd:false, cap:false};
  const showTtd = mode.ttd && ppk.ttd;
  const showCap = mode.cap && ppk.cap;
  const L = (window._ttdLayout && window._ttdLayout['sppbj']) || {};
  const T = L.ttd || {x:0,y:0,w:120,h:55,r:0,o:100};
  const C = L.cap || {x:80,y:-20,w:80,h:80,r:0,o:85};

  content.innerHTML = `
    <div id="sppbj-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.6;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- HEADER SURAT -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:18px;" class="section-block">
        <colgroup><col style="width:90px;"><col style="width:10px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Nomor</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">${nomorSppbj} <button onclick="openNomorDialog(this)" data-slug="sppbj" data-rup="${paket.rup}" data-field="nomorSppbj" data-cur="${nomorSppbj}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Sifat</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">Biasa</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Lampiran</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">1 (satu) rangkap</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Perihal</td>
            <td style="padding:2px 6px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;font-weight:bold;">Perintah Pengadaan Barang &amp; Jasa</td>
          </tr>
        </tbody>
      </table>

      <!-- TUJUAN SURAT -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:18px;" class="section-block">
        <colgroup><col style="width:90px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;">Yth.</td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">Pejabat Pengadaan pada ${namaInstansi}</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;"></td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">di -</td>
          </tr>
          <tr>
            <td style="padding:2px 6px 2px 0;vertical-align:top;color:#000;border:none;"></td>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;"><span style="text-decoration:underline;">${kotaKab}</span></td>
          </tr>
        </tbody>
      </table>

      <!-- ISI SURAT -->
      <p style="margin:0 0 12px 0;color:#000;text-align:justify;">Sehubungan dengan akan dilaksanakannya kegiatan pengadaan barang/jasa di lingkungan ${namaInstansi} ${kabupaten} Tahun Anggaran ${tahun} melalui E-Purchasing, maka dengan ini disampaikan untuk segera melakukan proses kegiatan dimaksud sebagai dasar pelaksanaan dan berikut lampiran:</p>

      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:12px;" class="section-block">
        <colgroup><col style="width:30px;"><col style="width:auto;"></colgroup>
        <tbody>
          <tr>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">1.</td>
            <td style="padding:2px 0 2px 8px;vertical-align:top;color:#000;border:none;">Spesifikasi Teknis Barang/Jasa;</td>
          </tr>
          <tr>
            <td style="padding:2px 0;vertical-align:top;color:#000;border:none;">2.</td>
            <td style="padding:2px 0 2px 8px;vertical-align:top;color:#000;border:none;">Dokumen Persiapan Pengadaan Barang/Jasa.</td>
          </tr>
        </tbody>
      </table>

      <p style="margin:0 0 12px 0;color:#000;text-align:justify;">Dalam melakukan proses kegiatan tersebut harus berpedoman pada peraturan perundang-undangan yang berlaku dengan tetap memperhatikan batasan waktu yang tersedia.</p>

      <p style="margin:0 0 20px 0;color:#000;text-align:justify;">Demikian disampaikan untuk dapat dipergunakan sebagaimana mestinya.</p>

      <!-- TANDA TANGAN -->
      <div class="section-block" style="display:flex;justify-content:flex-end;margin-top:8px;">
        <div style="text-align:left;width:320px;color:#000;">
          <div style="color:#000;">${kotaKab}, &nbsp;${tglFormatted}</div>
          <div style="font-weight:bold;color:#000;">Pejabat Pembuat Komitmen (PPKom)</div>
          <div style="color:#000;">${namaInstansi}</div>
          <div style="position:relative;height:70px;margin-top:4px;background:transparent;overflow:visible;">
            ${showTtd ? `<img id="doc-ttd-img-sppbj" src="${ppk.ttd}"
              style="position:absolute;left:0;top:0;width:${T.w}px;height:${T.h}px;object-fit:contain;
              background:transparent;
              transform:translate(${T.x}px,${T.y}px) rotate(${T.r}deg);opacity:${T.o/100};
              cursor:grab;user-select:none;z-index:2;"
              draggable="false"
              title="Drag untuk pindah posisi TTD">` : ''}
            ${showCap ? `<img id="doc-cap-img-sppbj" src="${ppk.cap}"
              style="position:absolute;left:0;top:0;width:${C.w}px;height:${C.h}px;object-fit:contain;
              background:transparent;
              transform:translate(${C.x}px,${C.y}px) rotate(${C.r}deg);opacity:${C.o/100};
              cursor:grab;user-select:none;z-index:3;"
              draggable="false"
              title="Drag untuk pindah posisi Cap">` : ''}
          </div>
          <div style="font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
          <div style="color:#000;">${ppk.nip && ppk.nip !== 'NIP. -' ? (ppk.nip.startsWith('NIP') ? ppk.nip : 'NIP. ' + ppk.nip) : ''}</div>
        </div>
      </div>

    </div>
  `;
  // Pasang drag handler setelah render
  setTimeout(() => {
    makeDraggableTtd('doc-ttd-img-sppbj', 'sppbj', 'ttd');
    makeDraggableTtd('doc-cap-img-sppbj', 'sppbj', 'cap');
  }, 50);
}

function printSppbj() {
  const printArea = document.getElementById('sppbj-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Surat Perintah Pengadaan Barang/Jasa</title>
      <style>
        ${buildPageRule('sppbj')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.6; }
        table { border-collapse:collapse; width:100%; table-layout:fixed; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        [id$="-print-area"] { padding:0!important; max-width:100%!important; width:100%!important; margin:0!important; box-shadow:none!important; border-radius:0!important; background:#fff!important; line-height:1.45; }
        img { max-width:100%; height:auto; display:block; }
        .doc-nomor-edit { display:none!important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>`);
  printWindow.document.close();
  setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
}

function printNodis() {
  const printArea = document.getElementById('nodis-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nota Dinas Pengajuan Belanja</title>
      <style>
        ${buildPageRule('nodis')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.6; }
        table { border-collapse:collapse; width:100%; table-layout:fixed; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { border:1px solid #000; word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

function printFormSpek() {
  const printArea = document.getElementById('formspek-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spesifikasi Teknis Paket E-Purchasing</title>
      <style>
        ${buildPageRule('formspek')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        table { border-collapse:collapse; width:100%; table-layout:fixed; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { border:1px solid #000; word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        a { color:#0000EE !important; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}


// ============================================================
//  FORM DPP FUNCTIONS - Dokumen Persiapan Pengadaan E-Purchasing
// ============================================================
function populateFormDppSelects() {
  const rupSel = document.getElementById('formdpp-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">-- Pilih No RUP --</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }
  const ppkSel = document.getElementById('formdpp-pejabat-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">-- Pilih PPK --</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
}

function loadFormDppData() {
  const rup     = document.getElementById('formdpp-rup-select').value;
  const ppkId   = document.getElementById('formdpp-pejabat-select').value;
  const content = document.getElementById('formdpp-content');

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧮</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih nomor RUP di atas untuk menampilkan Dokumen Persiapan Pengadaan (DPP)</div>
      </div>`;
    return;
  }

  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data tidak ditemukan</div></div>`;
    return;
  }

  let ppk = { nama: 'NAMA PPK', nip: '-', jabatan: 'PA/KPA/PPK', ttd: '', cap: '', ttdSizeW:120, ttdSizeH:55, capSizeW:80, capSizeH:80 };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found  = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama||found.namaPPK||'-', nip: found.nip||found.nipPPK||'-', jabatan: found.jabatan||'PA/KPA/PPK', ttd: found.ttd||'', cap: found.cap||'', ttdSizeW: found.ttdSizeW||120, ttdSizeH: found.ttdSizeH||55, capSizeW: found.capSizeW||80, capSizeH: found.capSizeH||80 };
  }

  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));
  const hargaForRup   = state.harga.data.filter(h => String(h.rup) === String(rup));

  // Tanggal dari tanggalDPP, fallback tanggalPesanan
  const tglSrc = paket.tanggalDPP || paket.tanggalPesanan || '';
  let tglDate;
  if (tglSrc) {
    const parts = tglSrc.split('-');
    tglDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    tglDate = new Date();
  }

  // Tanggal selesai
  const tglSelesaiSrc = paket.tanggalSelesai || '';
  let tglSelesaiFormatted = '';
  const namaBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  if (tglSelesaiSrc) {
    const p2 = tglSelesaiSrc.split('-');
    const d2 = new Date(Number(p2[0]), Number(p2[1]) - 1, Number(p2[2]));
    tglSelesaiFormatted = `${d2.getDate()} ${namaBulan[d2.getMonth()]} ${d2.getFullYear()}`;
  }

  const tglFormatted = `${tglDate.getDate()} ${namaBulan[tglDate.getMonth()]} ${tglDate.getFullYear()}`;
  const tahun = tglDate.getFullYear();
  const docOrg = getDocOrg(paket);
  const noDPPDefault = paket.rup ? `DPP/${paket.rup}/${docOrg.singkatan}/${tahun}` : `DPP/-/${docOrg.singkatan}/${tahun}`;
  const noDPP = getDefaultDocNumber(paket.nomorFormdpp, noDPPDefault, docOrg.singkatan);
  const durasi = paket.durasi ? `${paket.durasi} ${paket.masaKerja || 'Hari Kalender'}` : '3 Hari Kalender';
  const waktuSpek = tglSelesaiFormatted || durasi;

  // Baris tabel item
  const MIN_ROWS = 0; // tidak ada baris kosong padding
  let itemRows = '';
  let rowNum = 1;
  const hasRincian = rincianForRup.length > 0;
  const hasHarga   = hargaForRup.length > 0;
  const hideSec    = (hide) => hide ? 'style="display:none"' : '';
  if (rincianForRup.length > 0) {
    rincianForRup.forEach(r => {
      const hargaItem = hargaForRup.find(h => h.namaItem === r.itemBarang || h.namaProduk === r.itemBarang);
      const spek      = hargaItem && hargaItem.namaProduk ? `<br><span style="font-size:10px;">Spesifikasi : ${hargaItem.namaProduk}</span>` : '';
      const qty       = r.vol || '';
      const satuan    = r.satuan || '';
      const hargaSat  = r.hargaSatuan ? Number(r.hargaSatuan).toLocaleString('id-ID', {minimumFractionDigits:2}) : '';
      itemRows += `<tr>
        <td style="border:1px solid #000;padding:5px 7px;text-align:center;vertical-align:top;color:#000;">${rowNum++}.</td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;color:#000;">${r.itemBarang || ''}${spek}</td>
        <td style="border:1px solid #000;padding:5px 7px;text-align:center;vertical-align:top;color:#000;">${qty}</td>
        <td style="border:1px solid #000;padding:5px 7px;text-align:center;vertical-align:top;color:#000;">${satuan}</td>
        <td style="border:1px solid #000;padding:5px 7px;text-align:right;vertical-align:top;color:#000;">${hargaSat}</td>
      </tr>`;
    });
    // Tidak ada baris kosong padding
  } else {
    // Tidak ada data — tidak tampilkan baris kosong
  }

  const tdL = 'padding:3px 6px 3px 0;vertical-align:top;color:#000;border:none;width:170px;';
  const tdC = 'padding:3px 8px;vertical-align:top;color:#000;border:none;width:10px;';
  const tdR = 'padding:3px 0;vertical-align:top;color:#000;border:none;';

  content.innerHTML = `
    <div id="formdpp-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.6;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div style="text-align:center;margin-bottom:18px;" class="section-block">
        <div style="font-size:12pt;font-weight:bold;text-decoration:underline;color:#000;letter-spacing:0.3px;">DOKUMEN PERSIAPAN PENGADAAN (DPP) <em>E - PURCHASING</em></div>
        <div style="font-size:12pt;color:#000;">Nomor : ${noDPP} <button onclick="openNomorDialog(this)" data-slug="formdpp" data-rup="${paket.rup}" data-field="nomorFormdpp" data-cur="${noDPP}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- HEADER INFO -->
      <table style="width:100%;border-collapse:collapse;font-size:12pt;color:#000;margin-bottom:18px;" class="section-block">
        <colgroup><col style="width:170px;"><col style="width:12px;"><col></colgroup>
        <tbody>
          <tr><td style="${tdL}">Tanggal</td><td style="${tdC}">:</td><td style="${tdR}">${tglFormatted}</td></tr>
          <tr><td style="${tdL}">Perangkat Daerah</td><td style="${tdC}">:</td><td style="${tdR}">${docOrg.namaInstansi}</td></tr>
          <tr><td style="${tdL}">Program</td><td style="${tdC}">:</td><td style="${tdR}">${fmtText(paket.program)}</td></tr>
          <tr><td style="${tdL}">Kegiatan</td><td style="${tdC}">:</td><td style="${tdR}">${fmtText(paket.kegiatan)}</td></tr>
          <tr><td style="${tdL}">Sub Kegiatan</td><td style="${tdC}">:</td><td style="${tdR}">${fmtText(paket.subKegiatan)}</td></tr>
          <tr><td style="${tdL}">RUP</td><td style="${tdC}">:</td><td style="${tdR}">${paket.rup || '-'}</td></tr>
          <tr><td style="${tdL}">Nama Paket Pengadaan</td><td style="${tdC}">:</td><td style="${tdR}">${paket.namaPaket || '-'}</td></tr>
          <tr><td style="${tdL}">Pagu Dana</td><td style="${tdC}">:</td><td style="${tdR}">${fmtRp(paket.paguAnggaran)}</td></tr>
          <tr><td style="${tdL}">Mata Anggaran Belanja</td><td style="${tdC}">:</td><td style="${tdR}">${paket.kodeRekening || '-'}</td></tr>
          <tr><td style="${tdL}">Sumber Dana</td><td style="${tdC}">:</td><td style="${tdR}">${docOrg.sumberDana} ${docOrg.kabupaten} TA ${tahun}</td></tr>
        </tbody>
      </table>

      <!-- I. SPESIFIKASI TEKNIS -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">I.&nbsp;&nbsp;&nbsp;Spesifikasi Teknis</div>
        <p style="text-align:justify;color:#000;margin:0 0 8px 20px;">Penyusunan spesifikasi teknis telah menguraikan hal-hal sebagai berikut antara lain :</p>
        <ol style="margin:0 0 10px 36px;padding:0;color:#000;">
          <li style="margin-bottom:3px;">Kesesuaian spesifikasi teknis dengan kebutuhan;</li>
          <li style="margin-bottom:3px;">Karakteristik : ukuran, dimensi, bentuk, bahan, warna, komposisi, dan lain-lain;</li>
          <li style="margin-bottom:3px;">Kinerja : ketahanan, efisiensi, batas pemakaian, dan lain-lain;</li>
          <li style="margin-bottom:3px;">Standar yang digunakan: SNI, JIS, ASTM, ISO, dan lain-lain;</li>
          <li style="margin-bottom:3px;">Validitas standar yang digunakan;</li>
          <li style="margin-bottom:3px;">Pengepakan dan cara pengiriman;</li>
          <li style="margin-bottom:3px;">Macam, jenis, kapasitas dan jumlah peralatan;</li>
          <li style="margin-bottom:3px;">Aspek layanan meliputi waktu penyelesaian, ketepatan pengiriman, dan responsivitas penyedia;</li>
          <li style="margin-bottom:3px;">Output atau hasil pekerjaan sesuai volume dan kualitas yang dipersyaratkan;</li>
          <li style="margin-bottom:3px;">Higienitas dan keamanan (khusus pengadaan makan minum);</li>
          <li style="margin-bottom:3px;">Kompatibilitas teknis (khusus bahan komputer);</li>
          <li style="margin-bottom:3px;">Ketentuan garansi atau penggantian atas ketidaksesuaian barang/jasa.</li>
        </ol>
        <p style="text-align:justify;color:#000;margin:0 0 10px 20px;">Spesifikasi teknis paket pengadaan/pekerjaan adalah sebagai berikut :</p>

        <!-- a. Tabel Item -->
        <div ${hideSec(!hasRincian)} style="margin-bottom:14px;margin-left:20px;" class="section-block">
      <div style="color:#000;margin-bottom:6px;">a.&nbsp;&nbsp;&nbsp;Spesifikasi Jenis, Mutu Barang/Bahan/Material, Jumlah, Satuan dan Harga</div>
      <table style="width:100%;border-collapse:collapse;font-size:11pt;color:#000;">
            <colgroup><col style="width:34px;"><col><col style="width:60px;"><col style="width:64px;"><col style="width:90px;"></colgroup>
            <thead>
              <tr>
                <th class="no-col" style="border:1px solid #000;padding:6px 7px;text-align:center;background:#fff;color:#000;font-weight:bold;">No</th>
                <th style="border:1px solid #000;padding:6px 7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Nama/Jenis Barang Spesifikasi Mutu/Bahan/Matrial</th>
                <th style="border:1px solid #000;padding:6px 7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Qty</th>
                <th style="border:1px solid #000;padding:6px 7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Satuan</th>
                <th style="border:1px solid #000;padding:6px 7px;text-align:center;background:#fff;color:#000;font-weight:bold;">Harga Satuan</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </div>

        <!-- b. Justifikasi Merek -->
        <div style="margin-bottom:10px;margin-left:20px;" class="section-block">
          <div style="color:#000;margin-bottom:4px;">b.&nbsp;&nbsp;&nbsp;Justifikasi Teknis Dalam Penggunaan Merek (Jika ada)</div>
          <p style="color:#000;margin:0 0 0 28px;">Tidak menggunakan merk tertentu</p>
        </div>

        <!-- c. Spesifikasi Waktu -->
        <div style="margin-bottom:10px;margin-left:20px;" class="section-block">
          <div style="color:#000;margin-bottom:4px;">c.&nbsp;&nbsp;&nbsp;Spesifikasi Waktu</div>
          <p style="text-align:justify;color:#000;margin:0 0 0 28px;">
            Pelaksanaan pekerjaan mulai dari di terbitkannya surat pesanan sampai dengan tanggal,
            <strong>${waktuSpek}</strong>
          </p>
        </div>

        <!-- d. Spesifikasi Tempat -->
        <div style="margin-bottom:10px;margin-left:20px;" class="section-block">
          <div style="color:#000;margin-bottom:4px;">d.&nbsp;&nbsp;&nbsp;Spesifikasi Tempat</div>
          <p style="text-align:justify;color:#000;margin:0 0 4px 28px;">Pengiriman sampai ke lokasi yaitu ${docOrg.tempatPengiriman}</p>
          <p style="color:#000;margin:0 0 2px 28px;">Lokasi pengantaran: Langsung ke tempat/lokasi tujuan</p>
          <p style="color:#000;margin:0 0 0 28px;">Jarak dan akses lokasi diperhitungkan oleh penyedia tanpa biaya tambahan di luar harga satuan e-Katalog.</p>
        </div>

        <!-- e. Spesifikasi Layanan -->
        <div style="margin-bottom:14px;margin-left:20px;" class="section-block">
          <div style="color:#000;margin-bottom:4px;">e.&nbsp;&nbsp;&nbsp;Spesifikasi Layanan</div>
          <p style="text-align:justify;color:#000;margin:0 0 0 28px;">Penyedia wajib memenuhi tingkat layanan meliputi ketepatan waktu, kesesuaian spesifikasi, kualitas hasil, ketepatan jumlah, responsivitas, pengemasan dan pengiriman, jaminan/garansi, fleksibilitas layanan, kepatuhan administratif, serta standar keamanan dan kepatuhan. Penyedia juga wajib menindaklanjuti setiap ketidaksesuaian melalui perbaikan atau penggantian tanpa biaya tambahan sesuai ketentuan yang disepakati serta bertanggung jawab penuh atas pengadaan.</p>
        </div>
      </div>

      <!-- II. PRIORITAS PRODUK DALAM NEGERI -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">II.&nbsp;&nbsp;&nbsp;Prioritas Penggunaan Produk Dalam Negeri</div>
        <p style="text-align:justify;color:#000;margin:0 0 8px 20px;">Berdasarkan Pasal 66 ayat (1) dan (2) Peraturan Presiden Nomor 46 Tahun 2025 tentang Perubahan Kedua Atas Peraturan Presiden Nomor 16 Tahun 2018 Tentang Pengadaan Barang/Jasa Pemerintah, maka PPK/PP yang akan melakukan e-Purchasing memilih barang/jasa pada Katalog Elektronik dengan urutan/prioritas sebagai berikut:</p>
        <ol style="margin:0 0 0 36px;padding:0;color:#000;">
          <li style="margin-bottom:6px;text-align:justify;">Apabila barang/jasa yang dibutuhkan pada Katalog Elektronik terdapat produk dalam negeri yang memiliki jumlah nilai TKDN dan nilai BMP minimal 40% (empat puluh persen) maka PPK/PP memilih produk dalam negeri dengan nilai TKDN paling sedikit 25% (dua puluh lima persen);</li>
          <li style="margin-bottom:6px;text-align:justify;">Dalam hal kondisi pada angka 1 di atas tidak dapat dipenuhi, maka PPK/PP dapat memilih produk dalam negeri dengan nilai TKDN kurang dari 25% (dua puluh lima persen);</li>
          <li style="margin-bottom:6px;text-align:justify;">Dalam hal kondisi pada angka 1 dan 2 di atas tidak dapat dipenuhi, maka PPK/PP dapat memilih produk dengan label PDN namun belum mempunyai nilai TKDN;</li>
          <li style="margin-bottom:6px;text-align:justify;">Dalam hal kondisi pada angka 1, 2, dan 3 di atas tidak dapat dipenuhi, maka PPK/PP dapat memilih produk impor; dan</li>
          <li style="margin-bottom:6px;text-align:justify;">Dalam hal kondisi pada angka 1, 2, 3, dan 4 di atas tidak dapat dipenuhi, maka PPK/PP dapat menggunakan metode lain selain <em>e-Purchasing</em> Katalog sesuai ketentuan peraturan perundang-undangan.</li>
        </ol>
      </div>

      <!-- III. PRIORITAS PENYEDIA UMKM/KOPERASI -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">III.&nbsp;&nbsp;&nbsp;Prioritas Penggunaan Produk dari Penyedia dengan Kualifikasi Usaha Kecil serta Koperasi</div>
        <p style="text-align:justify;color:#000;margin:0 0 8px 20px;">Berdasarkan Pasal 65 ayat (3) dan (4) Peraturan Presiden Nomor 46 Tahun 2025 tentang Perubahan Kedua Atas Peraturan Presiden Nomor 16 Tahun 2018 Tentang Pengadaan Barang/Jasa Pemerintah, maka PPK/PP yang akan melakukan <em>e-Purchasing</em> Katalog memilih barang/jasa pada Katalog Elektronik dengan urutan/prioritas sebagai berikut:</p>
        <ol style="margin:0 0 0 36px;padding:0;color:#000;">
          <li style="margin-bottom:6px;text-align:justify;">Apabila nilai paket pengadaan barang/jasa dengan nilai pagu anggaran sampai dengan Rp. 15.000.000.000,00 (lima belas miliar rupiah) maka PPK/PP memilih Penyedia dengan Kualifikasi Usaha Kecil atau Koperasi untuk barang/jasa yang dibutuhkan yang tersedia pada Katalog Elektronik;</li>
          <li style="margin-bottom:6px;text-align:justify;">Dalam hal kondisi pada angka 1 di atas tidak dapat dipenuhi maka PPK/PP dapat memilih Penyedia Katalog Elektronik dengan Kualifikasi Usaha Non Kecil.</li>
        </ol>
      </div>

      <!-- IV. PENGUMPULAN REFERENSI HARGA -->
      <div style="margin-bottom:14px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">IV.&nbsp;&nbsp;&nbsp;Pengumpulan Referensi Harga</div>
        <p style="text-align:justify;color:#000;margin:0 0 8px 20px;">PPK/PP mempersiapkan referensi harga yang berfungsi sebagai referensi untuk melakukan Negosiasi Harga. Pengumpulan referensi harga dilakukan dengan memperhatikan hal-hal sebagai berikut:</p>
        <ol style="margin:0 0 0 36px;padding:0;color:#000;">
          <li style="margin-bottom:8px;text-align:justify;">
            Referensi harga disusun dengan sumber data sebagai berikut:
            <ol style="margin:6px 0 0 20px;padding:0;list-style-type:lower-alpha;color:#000;">
              <li style="margin-bottom:4px;text-align:justify;">Mencari produk dengan harga terbaik yang tercantum pada Katalog Elektronik sesuai dengan spesifikasi teknis yang dibutuhkan dengan memperhatikan ketentuan terkait Prioritas Penggunaan Produk Dalam Negeri dan Prioritas Penggunaan Produk dari Penyedia dengan Kualifikasi Usaha Kecil serta Koperasi;</li>
              <li style="margin-bottom:4px;text-align:justify;">Mencari harga pembanding produk sejenis di luar aplikasi Katalog Elektronik (apabila ada);</li>
              <li style="margin-bottom:4px;text-align:justify;">Informasi biaya/harga satuan yang dipublikasikan secara resmi oleh Kementerian/Lembaga/ Pemerintah Daerah (apabila ada); dan</li>
              <li style="margin-bottom:4px;text-align:justify;">Dokumen lainnya yang dapat dipertanggungjawabkan (apabila ada).</li>
            </ol>
          </li>
          <li style="margin-bottom:8px;text-align:justify;">Selain referensi harga, PPK/PP juga dapat mempersiapkan kebutuhan terkait layanan teknis pendukung dari barang/jasa untuk dijadikan referensi dalam melakukan negosiasi dengan Penyedia apabila diperlukan. Layanan teknis pendukung adalah layanan yang dapat diberikan Penyedia untuk mendukung penggunaan dari barang/jasa yang akan dibeli. Negosiasi layanan teknis pendukung tidak digunakan untuk menegosiasi teknis barang seperti mengubah/menambah spesifikasi barang/jasa yang telah tayang pada Katalog Elektronik.</li>
          <li style="margin-bottom:4px;text-align:justify;">Pengumpulan referensi harga tidak diperlukan jika harga produk yang tayang pada aplikasi Katalog Elektronik berupa <em>fixed price</em> atau harga tidak bisa dinegosiasi.</li>
        </ol>
      </div>

      <!-- V. RANCANGAN KONTRAK -->
      <div style="margin-bottom:12px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">V.&nbsp;&nbsp;&nbsp;Rancangan Kontrak</div>
        <p style="text-align:justify;color:#000;margin:0 0 0 20px;">Rancangan Kontrak menggunakan Surat Pesanan sesuai yang tertuang di aplikasi <strong><em>E-purchasing.</em></strong></p>
      </div>

      <!-- VI. RENCANA METODE PEMILIHAN PENYEDIA -->
      <div style="margin-bottom:12px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">VI.&nbsp;&nbsp;&nbsp;Rencana Metode Pemilihan Penyedia</div>
        <p style="color:#000;margin:0 0 0 20px;">Rencana metode pemilihan penyedia Katalog Elektronik menggunakan: <strong>Negosiasi Harga;</strong></p>
      </div>

      <!-- VII. PENUTUP -->
      <div style="margin-bottom:20px;" class="section-block">
        <div style="font-weight:bold;color:#000;margin-bottom:6px;">VII.&nbsp;&nbsp;&nbsp;Penutup</div>
        <p style="text-align:justify;color:#000;margin:0 0 0 20px;">Demikian Dokumen Persiapan e-Purchasing dibuat untuk dapat diketahui bersama sebagai acuan bagi pelaksanaan proses pengadaan barang/jasa bagi pihak terkait dan dibuat untuk digunakan sebagaimana mestinya.</p>
      </div>

      <!-- TTD PPKom -->
      <div class="section-block" style="display:flex;justify-content:flex-end;margin-top:40px;">
        <div style="text-align:left;width:320px;color:#000;">
          <div style="color:#000;">Putussibau, &nbsp;${tglFormatted}</div>
          <div style="color:#000;">Di tetapkan oleh :</div>
          <div style="font-weight:bold;margin-bottom:4px;color:#000;">Pejabat Pembuat Komitmen (PPKom)</div>
          <div style="color:#000;">${docOrg.namaInstansi}</div>
          ${(()=>{
              const mode = (window._ttdMode && window._ttdMode['formdpp']) || {ttd:false, cap:false};
              const showTtd = mode.ttd && ppk.ttd;
              const showCap = mode.cap && ppk.cap;
              const L = (window._ttdLayout && window._ttdLayout['formdpp']) || {};
              const T = L.ttd || {x:0,y:0,w:120,h:55,r:0,o:100};
              const C = L.cap || {x:80,y:-20,w:80,h:80,r:0,o:85};
              return `<div style="position:relative;height:70px;margin-top:4px;background:transparent;overflow:visible;">
                ${showTtd ? `<img id="doc-ttd-img-formdpp" src="${ppk.ttd}"
                  style="position:absolute;left:0;top:0;width:${T.w}px;height:${T.h}px;object-fit:contain;
                  background:transparent;
                  transform:translate(${T.x}px,${T.y}px) rotate(${T.r}deg);opacity:${T.o/100};
                  cursor:grab;user-select:none;z-index:2;"
                  draggable="false"
                  title="Drag untuk pindah posisi TTD">` : ''}
                ${showCap ? `<img id="doc-cap-img-formdpp" src="${ppk.cap}"
                  style="position:absolute;left:0;top:0;width:${C.w}px;height:${C.h}px;object-fit:contain;
                  background:transparent;
                  transform:translate(${C.x}px,${C.y}px) rotate(${C.r}deg);opacity:${C.o/100};
                  cursor:grab;user-select:none;z-index:3;"
                  draggable="false"
                  title="Drag untuk pindah posisi Cap">` : ''}
              </div>`;
            })()}
          <div style="font-weight:bold;text-decoration:underline;color:#000;">${ppk.nama}</div>
          <div style="color:#000;">${ppk.nip !== '-' ? 'NIP. ' + ppk.nip : ''}</div>
        </div>
      </div>

    </div>
  `;
  // Pasang drag handler setelah render
  setTimeout(() => {
    makeDraggableTtd('doc-ttd-img-formdpp', 'formdpp', 'ttd');
    makeDraggableTtd('doc-cap-img-formdpp', 'formdpp', 'cap');
  }, 50);
}

function printFormDpp() {
  const printArea = document.getElementById('formdpp-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dokumen Persiapan Pengadaan (DPP) E-Purchasing</title>
      <style>
        ${buildPageRule('formdpp')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.6; }
        table { border-collapse:collapse; width:100%; table-layout:fixed; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { border:1px solid #000; word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        ol { margin:4px 0; }
        li { margin-bottom:3px; }
        .section-block { page-break-inside:auto; }
        /* ── A4 layout overrides — rapikan hasil print ── */
        [id$="-print-area"] {
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          background: #fff !important;
          line-height: 1.45;
        }
        img { max-width: 100%; height: auto; display: block; }
        table { table-layout: fixed; width: 100% !important; }
        /* Kolom "No" tabel data – sempit, center, rapat */
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width: 34px !important;
          text-align: center !important;
          vertical-align: middle !important;
          white-space: nowrap;
          padding-left: 4px !important;
          padding-right: 4px !important;
        }
        /* Header tabel selalu center */
        thead th { text-align: center !important; vertical-align: middle !important; }
        /* Hindari kolom mata uang/angka wrap aneh */
        .num, td.num { text-align: right !important; white-space: nowrap; }
        /* Sub-tabel jangan dobel border */
        td > table { border: 0 !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

// ============================================================
//  BAHPE — Berita Acara Hasil Penetapan E-Purchasing
// ============================================================

function populateBahpeSelects() {
  // PPKom
  const ppkSel = document.getElementById('bahpe-ppk-select');
  if (ppkSel) {
    const cur = ppkSel.value;
    ppkSel.innerHTML = '<option value="">— Pilih PPKom —</option>';
    const allPpk = masterState.ppk.length > 0 ? masterState.ppk : masterState.pejabatPengadaan;
    allPpk.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama || p.namaPPK || '-';
      ppkSel.appendChild(opt);
    });
    ppkSel.value = cur;
  }
  // Pejabat Pengadaan
  const pejSel = document.getElementById('bahpe-pejabat-select');
  if (pejSel) {
    const cur = pejSel.value;
    pejSel.innerHTML = '<option value="">— Pilih Pejabat Pengadaan —</option>';
    masterState.pejabatPengadaan.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.nama;
      pejSel.appendChild(opt);
    });
    pejSel.value = cur;
  }
  // RUP
  const rupSel = document.getElementById('bahpe-rup-select');
  if (rupSel) {
    const cur = rupSel.value;
    rupSel.innerHTML = '<option value="">— Pilih No RUP —</option>';
    state.paket.data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.rup;
      opt.textContent = `${p.rup} - ${strTrunc(p.namaPaket, 40)}`;
      rupSel.appendChild(opt);
    });
    rupSel.value = cur;
  }

  if (rupSel?.value) setTimeout(loadBahpeData, 0);
}

if (typeof _bahpeRenderTimer === 'undefined') var _bahpeRenderTimer = null;
function scheduleLoadBahpeData() {
  clearTimeout(_bahpeRenderTimer);
  _bahpeRenderTimer = setTimeout(loadBahpeData, 30);
}

function loadBahpeData() {
  const rupEl   = document.getElementById('bahpe-rup-select');
  const ppkEl   = document.getElementById('bahpe-ppk-select');
  const pejEl   = document.getElementById('bahpe-pejabat-select');
  const content = document.getElementById('bahpe-content');
  if (!rupEl || !content) return;

  const rup     = rupEl.value;
  const ppkId   = ppkEl ? ppkEl.value : '';
  const pejId   = pejEl ? pejEl.value : '';

  if (!rup) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">Pilih No RUP</div>
        <div class="empty-sub">Pilih PPKom, Pejabat Pengadaan, dan No RUP untuk menampilkan Berita Acara Hasil Penetapan E-Purchasing</div>
      </div>`;
    return;
  }

  // PPKom
  let ppk = { nama: 'NAMA PPK', nip: '-' };
  if (ppkId) {
    const allPpk = [...masterState.ppk, ...masterState.pejabatPengadaan];
    const found  = allPpk.find(p => String(p.id) === String(ppkId));
    if (found) ppk = { nama: found.nama || found.namaPPK || '-', nip: found.nip || found.nipPPK || '-' };
  }

  // Pejabat Pengadaan
  let pejabat = { nama: '<span style="color:#c05050;font-style:italic;">⚠ Belum dipilih — tambahkan di Data Master</span>', nip: '-' };
  if (pejId) {
    const found = masterState.pejabatPengadaan.find(p => String(p.id) === String(pejId));
    if (found) pejabat = found;
  }

  // Data paket
  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) {
    content.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Data paket tidak ditemukan</div></div>`;
    return;
  }

  const hargaForRup   = state.harga.data.filter(h => String(h.rup) === String(rup));
  const rincianForRup = state.rincian.data.filter(r => String(r.rup) === String(rup));


  // ── Helper: tentukan pemenang konsisten dengan EV_HP ──
  // Prioritas: (1) paling banyak item harga terendah, (2) total nilai terendah
  function _determineWinner(hargaAll, rincianAll) {
    if (!hargaAll.length) return { penyedia: '-', total: 0 };
    const penyedias = [...new Set(hargaAll.map(h => h.namaPenyedia).filter(Boolean))];
    // Total nilai per penyedia
    const totals = {};
    penyedias.forEach(p => {
      totals[p] = hargaAll.filter(h => h.namaPenyedia === p).reduce((s, h) => {
        const v = (Number(h.negoFinal) > 0 ? Number(h.negoFinal) : (Number(h.hargaTayang) || 0)) * (Number(h.qty) || 1);
        return s + v;
      }, 0);
    });
    // Item list (dari rincian jika ada, fallback ke urutan harga)
    const itemList = rincianAll.length > 0
      ? rincianAll.map(r => r.itemBarang)
      : [...new Set(hargaAll.map(h => h.namaItem).filter(Boolean))];
    // Hitung kemenangan per penyedia (per item position, dengan occurrence index)
    const wins = {};
    const _occ = {};
    itemList.forEach(item => {
      const occ = _occ[item] || 0;
      _occ[item] = occ + 1;
      const prices = {};
      penyedias.forEach(p => {
        const matches = hargaAll.filter(h => h.namaPenyedia === p && h.namaItem === item);
        const rec = matches[occ] || matches[matches.length - 1];
        if (rec) {
          const v = Number(rec.negoFinal) > 0 ? Number(rec.negoFinal) : (Number(rec.hargaTayang) || 0);
          if (v > 0) prices[p] = v;
        }
      });
      if (Object.keys(prices).length > 0) {
        const minVal = Math.min(...Object.values(prices));
        Object.keys(prices).forEach(p => { if (prices[p] === minVal) wins[p] = (wins[p] || 0) + 1; });
      }
    });
    const sorted = penyedias.slice().sort((a, b) => {
      const tA = totals[a] || 0, tB = totals[b] || 0;
      if (tA !== tB) return tA - tB;
      const wA = wins[a] || 0, wB = wins[b] || 0;
      return wB - wA;
    });
    const winner = sorted[0] || '-';
    return { penyedia: winner, total: totals[winner] || 0 };
  }
  // Tentukan penyedia terpilih — konsisten dengan algoritma EV_HP
  let penyediaTerpilih = '-';
  let negoFinalTotal = 0;
  if (hargaForRup.length > 0) {
    const _w = _determineWinner(hargaForRup, rincianForRup);
    penyediaTerpilih = _w.penyedia;
    negoFinalTotal   = _w.total;
  }

  // Tanggal dari tanggalPesanan paket
  const tglSrc = paket.tanggalPesanan || '';
  let tglDate = tglSrc
    ? (() => { const p = tglSrc.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); })()
    : new Date();
  const namaHari   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const namaBulan  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const satuanAngka = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas','Dua Belas','Tiga Belas','Empat Belas','Lima Belas','Enam Belas','Tujuh Belas','Delapan Belas','Sembilan Belas','Dua Puluh','Dua Puluh Satu','Dua Puluh Dua','Dua Puluh Tiga','Dua Puluh Empat','Dua Puluh Lima','Dua Puluh Enam','Dua Puluh Tujuh','Dua Puluh Delapan','Dua Puluh Sembilan','Tiga Puluh','Tiga Puluh Satu'];
  function terbilangTahunBahpe(y) {
    const ratusan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan'];
    const ribuan  = Math.floor(y / 1000);
    const sisa    = y % 1000;
    const r       = Math.floor(sisa / 100);
    const puluhan = sisa % 100;
    let result = (ribuan === 1 ? 'Seribu' : ratusan[ribuan] + ' Ribu');
    if (r > 0) result += ' ' + ratusan[r] + ' Ratus';
    if (puluhan > 0) result += ' ' + (puluhan < satuanAngka.length ? satuanAngka[puluhan] : '');
    return result.trim();
  }
  const tglAngka     = tglDate.getDate();
  const hariText     = namaHari[tglDate.getDay()];
  const bulanText    = namaBulan[tglDate.getMonth()];
  const tahunNum     = tglDate.getFullYear();
  const tanggalTerb  = satuanAngka[tglAngka] || String(tglAngka);
  const tahunTerb    = terbilangTahunBahpe(tahunNum);
  const docOrg = getDocOrg(paket);
  const nomorBahpeDefault = `PP/${paket.rup || '...'}/BAHPE/${docOrg.singkatan}/${tahunNum}`;
  const nomorBahpe = getDefaultDocNumber(paket.nomorBahpe, nomorBahpeDefault, docOrg.singkatan);
  const tanggalPanjang = `${tanggalTerb} Bulan ${bulanText} Tahun ${tahunTerb}`;
  const tglFormatted = `${tglAngka} ${namaBulan[tglDate.getMonth()]} ${tahunNum}`;

  // Visibility flags
  const hasRincian = rincianForRup.length > 0;
  const hasHarga   = hargaForRup.length > 0;
  const hideSec    = (hide) => hide ? 'style="display:none"' : '';
  const fmtNum = v => v > 0 ? Number(v).toLocaleString('id-ID', { minimumFractionDigits: 2 }) : '-';

  // Baris tabel penetapan (kolom: No | Nama Barang/Spek | Vol | Satuan | Harga Sat HPS | Harga Nego | Jumlah Nego)
  let itemRows = '';
  let totalNegoAkumulasi = 0;

  if (rincianForRup.length > 0) {
    const _bahpeOcc = {};
    rincianForRup.forEach((r, i) => {
      const _key = r.itemBarang || '';
      const _occIdx = _bahpeOcc[_key] || 0;
      _bahpeOcc[_key] = _occIdx + 1;
      // occurrence-aware: ambil record ke-N untuk item yang sama
      const _exactWinner = hargaForRup.filter(h =>
        h.namaPenyedia === penyediaTerpilih &&
        (h.namaItem === r.itemBarang || h.namaProduk === r.itemBarang)
      );
      const _exactAll = hargaForRup.filter(h =>
        h.namaItem === r.itemBarang || h.namaProduk === r.itemBarang
      );
      const hItem = (_exactWinner.length > 0
        ? (_exactWinner[_occIdx] || _exactWinner[_exactWinner.length - 1])
        : (_exactAll.length > 0 ? (_exactAll[_occIdx] || _exactAll[_exactAll.length - 1]) : null));

      const vol     = Number(r.vol) || 0;
      const satuan  = r.satuan || '';
      const hpsVal  = Number(r.hargaSatuan) || 0;
      const negoVal = hItem ? (Number(hItem.negoFinal) || Number(hItem.hargaTayang) || hpsVal) : hpsVal;
      const jumlah  = negoVal * vol;
      totalNegoAkumulasi += jumlah;

      // Stacked: Baris 1 = nama barang (bold), Baris 2 = badge PRODUK TAYANG + namaProduk
      const _npBahpe = (hItem && (hItem.namaProduk||'').trim() && hItem.namaProduk !== r.itemBarang)
        ? hItem.namaProduk.trim() : '';
      const _npBadge = _npBahpe
        ? `<div style="margin-top:3px;display:flex;align-items:baseline;gap:4px;flex-wrap:wrap;">` +
          `<span style="display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:7.5pt;font-weight:700;` +
          `text-transform:uppercase;padding:1px 4px;border-radius:3px;white-space:nowrap;line-height:1.5;">PRODUK TAYANG</span>` +
          `<span style="font-style:italic;font-size:9pt;color:#374151;">${_npBahpe}</span></div>`
        : '';

      itemRows += `<tr style="page-break-inside:avoid;">
        <td style="border:1px solid #000;padding:5px 4px;text-align:center;vertical-align:top;color:#000;white-space:nowrap;">${i + 1}.</td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;color:#000;">
          <div style="font-weight:700;color:#000;">${r.itemBarang || '-'}</div>${_npBadge}
        </td>
        <td style="border:1px solid #000;padding:5px 4px;text-align:center;vertical-align:top;color:#000;white-space:nowrap;">${vol || '-'}</td>
        <td style="border:1px solid #000;padding:5px 5px;text-align:center;vertical-align:top;color:#000;">${satuan}</td>
        <td style="border:1px solid #000;padding:5px 6px;text-align:right;vertical-align:top;color:#000;">${fmtNum(hpsVal)}</td>
        <td style="border:1px solid #000;padding:5px 6px;text-align:right;vertical-align:top;color:#000;">${fmtNum(negoVal)}</td>
        <td style="border:1px solid #000;padding:5px 6px;text-align:right;vertical-align:top;color:#000;">${fmtNum(jumlah)}</td>
      </tr>`;
    });
  } else if (hasHarga) {
    const hargaTerpilih = hargaForRup.filter(h => h.namaPenyedia === penyediaTerpilih);
    hargaTerpilih.forEach((h, i) => {
      const negoVal = Number(h.negoFinal) || Number(h.hargaTayang) || 0;
      const qtyVal  = Number(h.qty) || 1;
      totalNegoAkumulasi += negoVal * qtyVal;
      itemRows += `<tr style="page-break-inside:avoid;">
        <td style="border:1px solid #000;padding:5px 4px;text-align:center;vertical-align:top;color:#000;white-space:nowrap;">${i + 1}.</td>
        <td style="border:1px solid #000;padding:5px 7px;vertical-align:top;color:#000;">${h.namaItem || h.namaProduk || '-'}</td>
        <td style="border:1px solid #000;padding:5px 4px;text-align:center;vertical-align:top;color:#000;white-space:nowrap;">${qtyVal > 1 ? qtyVal : '-'}</td>
        <td style="border:1px solid #000;padding:5px 5px;text-align:center;vertical-align:top;color:#000;">${h.satuan || '-'}</td>
        <td style="border:1px solid #000;padding:5px 6px;text-align:right;vertical-align:top;color:#000;">${fmtNum(Number(h.hargaTayang) || 0)}</td>
        <td style="border:1px solid #000;padding:5px 6px;text-align:right;vertical-align:top;color:#000;">${fmtNum(negoVal)}</td>
        <td style="border:1px solid #000;padding:5px 6px;text-align:right;vertical-align:top;color:#000;">${fmtNum(negoVal * qtyVal)}</td>
      </tr>`;
    });
  }

  const paguNum = Number(paket.paguAnggaran) || 0;
  // Hitung nilaiNego dengan formula IDENTIK EV_HP: (negoFinal || hargaTayang) × qty
  // Ini menjamin BAHPE selalu konsisten dengan "Total Hasil Negosiasi" di EV_HP
  const nilaiNego = hargaForRup
    .filter(h => h.namaPenyedia === penyediaTerpilih)
    .reduce((s, h) => s + ((Number(h.negoFinal) > 0 ? Number(h.negoFinal) : (Number(h.hargaTayang) || 0)) * (Number(h.qty) || 1)), 0);
  const efisiensi = paguNum > 0 && nilaiNego > 0 ? paguNum - nilaiNego : 0;

  // Cari data lengkap penyedia terpilih dari store penyedia
  const penyediaRec = state.penyedia.data.find(p => p.namaPenyedia === penyediaTerpilih);
  const pBentuk = penyediaRec ? (penyediaRec.bentukUsaha || '-') : '-';
  const pTipe   = penyediaRec ? (penyediaRec.tipe        || '-') : '-';
  const pStatus = penyediaRec ? (penyediaRec.status      || '-') : '-';
  const pAlamat = penyediaRec ? (penyediaRec.alamat      || '-') : '-';


  // ── Validasi sinkronisasi pemenang ──
  // Bandingkan: (A) algo baru (EV_HP style) vs (B) algo lama (total terendah saja)
  // Cek juga kelengkapan data negoFinal pemenang terpilih
  function _buildSinkronBanner(hargaAll, rincianAll, pemenangBaru) {
    // Algo lama: total negoFinal×qty (fallback totalHarga)
    const totalsLama = {};
    hargaAll.forEach(h => {
      if (!h.namaPenyedia) return;
      const v = Number(h.negoFinal) > 0
        ? Number(h.negoFinal) * Number(h.qty || 1)
        : Number(h.totalHarga) || 0;
      totalsLama[h.namaPenyedia] = (totalsLama[h.namaPenyedia] || 0) + v;
    });
    const sortedLama = Object.entries(totalsLama).sort((a, b) => a[1] - b[1]);
    const pemenangLama = sortedLama.length > 0 ? sortedLama[0][0] : '-';

    // Cek kelengkapan negoFinal untuk pemenang terpilih
    const recsWinner = hargaAll.filter(h => h.namaPenyedia === pemenangBaru);
    const missingNego = recsWinner.filter(h => !(Number(h.negoFinal) > 0));
    const totalItems  = recsWinner.length;
    const filledItems = totalItems - missingNego.length;

    // Tentukan status
    let status, icon, bg, border, msg;
    if (missingNego.length > 0) {
      status = 'warning';
      icon   = '⚠️';
      bg     = '#fffbeb'; border = '#f59e0b';
      msg    = `<strong>${missingNego.length} dari ${totalItems} item</strong> belum memiliki data negoFinal untuk <strong>${pemenangBaru}</strong>. Dokumen mungkin tidak akurat — isi terlebih dahulu harga negosiasi di Survey Harga.`;
    } else if (pemenangLama !== pemenangBaru) {
      status = 'changed';
      icon   = '🔄';
      bg     = '#eff6ff'; border = '#3b82f6';
      msg    = `Pemenang berhasil dikoreksi: <strong style="color:#dc2626;">${pemenangLama}</strong> → <strong style="color:#16a34a;">${pemenangBaru}</strong>. Data negosiasi lengkap dan valid.`;
    } else {
      status = 'ok';
      icon   = '✅';
      bg     = '#f0fdf4'; border = '#22c55e';
      msg    = `Pemenang <strong>${pemenangBaru}</strong> sinkron dengan EV_HP. Semua data negosiasi lengkap (${filledItems}/${totalItems} item).`;
    }

    return `<div class="no-print" style="
      background:${bg};border:1.5px solid ${border};border-radius:8px;
      padding:10px 14px;margin-bottom:12px;font-family:'Plus Jakarta Sans',sans-serif;
      font-size:11pt;color:#1f2937;display:flex;align-items:flex-start;gap:10px;
      box-shadow:0 1px 4px rgba(0,0,0,0.07);">
      <span style="font-size:16px;margin-top:1px;">${icon}</span>
      <div>
        <div style="font-weight:700;margin-bottom:2px;">Validasi Sinkronisasi EV_HP</div>
        <div style="font-size:10.5pt;">${msg}</div>
      </div>
    </div>`;
  }
  const _sinkronBannerBahpe = _buildSinkronBanner(hargaForRup, rincianForRup, penyediaTerpilih);

  content.innerHTML = `
    ${_sinkronBannerBahpe}
    <div id="bahpe-print-area" style="background:#fff;color:#000;padding:24px 28px;width:100%;max-width:900px;min-width:auto;margin:0 auto;font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;box-sizing:border-box;">

      <!-- KOP SURAT -->
      ${kopSurat()}

      <!-- JUDUL -->
      <div class="section-block" style="text-align:center;margin-bottom:20px;">
        <div style="font-size:14pt;font-weight:bold;text-decoration:underline;color:#000;">BERITA ACARA HASIL PENETAPAN E-PURCHASING</div>
        <div style="font-size:12pt;color:#000;margin-top:4px;">Nomor : ${nomorBahpe} <button onclick="openNomorDialog(this)" data-slug="bahpe" data-rup="${paket.rup}" data-field="nomorBahpe" data-cur="${nomorBahpe}" title="Edit nomor dokumen" class="doc-nomor-edit" style="background:none;border:none;cursor:pointer;font-size:12px;padding:0 2px;opacity:0.5;vertical-align:middle;line-height:1;">✏️</button></div>
      </div>

      <!-- PEMBUKA -->
      <p style="text-align:justify;margin-bottom:16px;color:#000;line-height:1.6;">
        Pada Hari ini ${hariText} Tanggal ${tanggalPanjang} yang bertandatangan di bawah ini selaku Pejabat Pengadaan pada ${docOrg.namaInstansi} ${docOrg.kabupaten} telah melaksanakan Penetapan Penyedia melalui E-Purchasing, dengan hasil sebagai berikut :
      </p>

      <!-- A. DATA UMUM -->
      <div style="margin-bottom:16px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">A.&nbsp;&nbsp;&nbsp;DATA UMUM</div>
        <table style="margin-left:24px;font-size:12pt;color:#000;border-collapse:collapse;">
          <colgroup><col style="width:190px;"><col style="width:16px;"><col></colgroup>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Kode RUP</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.rup || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nama Paket</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.namaPaket || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Pagu Anggaran</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${fmtRp(paket.paguAnggaran)}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Mata Anggaran Belanja</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">${paket.kodeRekening || '-'}</td></tr>
          <tr><td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Metode Pengadaan</td><td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td><td style="padding:2px 0;color:#000;border:none;">E-Purchasing dengan Negosiasi Harga</td></tr>
        </table>
      </div>

      <!-- B. TABEL PENETAPAN -->
      <div style="margin-bottom:16px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">B.&nbsp;&nbsp;&nbsp;HASIL PENETAPAN PENYEDIA</div>
        <div ${hideSec(!hasRincian && !hasHarga)}>
          <table style="width:100%;border-collapse:collapse;font-size:12pt;font-family:'Times New Roman',Times,serif;table-layout:fixed;color:#000;">
            <colgroup>
              <col style="width:38px;">
              <col>
              <col style="width:42px;">
              <col style="width:62px;">
              <col style="width:108px;">
              <col style="width:105px;">
              <col style="width:112px;">
            </colgroup>
            <thead style="display:table-header-group;">
              <tr style="background:#fff;">
                <th style="border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;white-space:nowrap;overflow:hidden;">No</th>
                <th style="border:1px solid #000;padding:4px 5px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;overflow:hidden;">Nama Barang/Jasa</th>
                <th style="border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;overflow:hidden;">Vol</th>
                <th style="border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;overflow:hidden;">Satuan</th>
                <th style="border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;overflow:hidden;">Harga Satuan HPS (Rp)</th>
                <th style="border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;overflow:hidden;">Harga Nego (Rp)</th>
                <th style="border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;color:#000;font-size:10pt;font-weight:bold;overflow:hidden;">Jumlah Nego (Rp)</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows || '<tr><td colspan="7" style="border:1px solid #000;padding:8px;text-align:center;color:#000;font-size:12pt;">— Tidak ada data item —</td></tr>'}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="border:1px solid #000;padding:5px 8px;text-align:right;font-weight:bold;color:#000;font-size:12pt;">Total Nilai Nego</td>
                <td style="border:1px solid #000;padding:5px 8px;text-align:right;font-weight:bold;color:#000;font-size:12pt;">${fmtNum(nilaiNego)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div ${hideSec(hasRincian || hasHarga)} style="margin-left:24px;color:#888;font-style:italic;">Belum ada data item dan harga untuk RUP ini.</div>
      </div>

      <!-- C. REKAP NILAI -->
      <div style="margin-bottom:16px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">C.&nbsp;&nbsp;&nbsp;REKAP NILAI</div>
        <table style="margin-left:24px;font-size:12pt;font-family:'Times New Roman',Times,serif;color:#000;border-collapse:collapse;">
          <colgroup><col style="width:200px;"><col style="width:16px;"><col></colgroup>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nilai Pagu Anggaran</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${fmtRp(paguNum)}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nilai Hasil Negosiasi</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${nilaiNego > 0 ? fmtRp(nilaiNego) : '-'}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Efisiensi</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${efisiensi > 0 ? fmtRp(efisiensi) : '-'}</td>
          </tr>
        </table>
      </div>

      <!-- D. KESIMPULAN -->
      <div style="margin-bottom:20px;" class="section-block">
        <div style="font-weight:bold;margin-bottom:6px;color:#000;">D.&nbsp;&nbsp;&nbsp;KESIMPULAN</div>
        <p style="text-align:justify;margin-left:24px;margin-bottom:8px;color:#000;">
          Berdasarkan hasil evaluasi dan negosiasi harga yang telah dilaksanakan, maka ditetapkan Penyedia yang memenuhi persyaratan dan memberikan penawaran terbaik adalah :
        </p>
        <table style="margin-left:24px;font-size:12pt;font-family:'Times New Roman',Times,serif;color:#000;border-collapse:collapse;">
          <colgroup><col style="width:190px;"><col style="width:16px;"><col></colgroup>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nama Penyedia</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;font-weight:bold;color:#000;border:none;">${penyediaTerpilih}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Bentuk Usaha</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${pBentuk}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Tipe Usaha</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${pTipe}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Status Usaha</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${pStatus}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Alamat</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;color:#000;border:none;">${pAlamat}</td>
          </tr>
          <tr>
            <td style="padding:2px 8px 2px 0;vertical-align:top;color:#000;border:none;">Nilai Penetapan</td>
            <td style="padding:2px 8px;vertical-align:top;color:#000;border:none;">:</td>
            <td style="padding:2px 0;font-weight:bold;color:#000;border:none;">${nilaiNego > 0 ? fmtRp(nilaiNego) : '-'}</td>
          </tr>
        </table>
      </div>

      <p style="text-align:justify;margin-bottom:28px;color:#000;">
        Demikian Berita Acara Hasil Penetapan E-Purchasing ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
      </p>

      <!-- TTD — gunakan tabel agar nama & NIP sejajar kiri-kanan -->
      <table class="section-block" style="width:100%;margin-top:36px;border-collapse:collapse;font-size:12pt;font-family:'Times New Roman',Times,serif;color:#000;">
        <colgroup><col style="width:48%;"><col style="width:4%;"><col style="width:48%;"></colgroup>
        <tbody>
          <tr>
            <td style="border:none;vertical-align:top;color:#000;">&nbsp;</td>
            <td style="border:none;"></td>
            <td style="border:none;vertical-align:top;color:#000;">Putussibau, ${tglFormatted}</td>
          </tr>
          <tr>
            <td style="border:none;vertical-align:top;color:#000;font-weight:bold;">Pejabat Pembuat Komitmen (PPKom)</td>
            <td style="border:none;"></td>
            <td style="border:none;vertical-align:top;color:#000;font-weight:bold;">Pejabat Pengadaan</td>
          </tr>
          <tr>
            <td style="border:none;vertical-align:top;color:#000;">${docOrg.namaInstansi} ${docOrg.kabupaten}</td>
            <td style="border:none;"></td>
            <td style="border:none;vertical-align:top;color:#000;">${docOrg.namaInstansi} ${docOrg.kabupaten}</td>
          </tr>
          <tr style="height:64px;">
            <td style="border:none;"></td>
            <td style="border:none;"></td>
            <td style="border:none;"></td>
          </tr>
          <tr>
            <td style="border:none;vertical-align:top;color:#000;font-weight:bold;text-decoration:underline;">${ppk.nama}</td>
            <td style="border:none;"></td>
            <td style="border:none;vertical-align:top;color:#000;font-weight:bold;text-decoration:underline;">${pejabat.nama}</td>
          </tr>
          <tr>
            <td style="border:none;vertical-align:top;color:#000;">${ppk.nip && ppk.nip !== '-' ? 'NIP. ' + ppk.nip : ''}</td>
            <td style="border:none;"></td>
            <td style="border:none;vertical-align:top;color:#000;">${pejabat.nip && pejabat.nip !== '-' ? 'NIP. ' + pejabat.nip : ''}</td>
          </tr>
        </tbody>
      </table>

    </div>
  `;
}

function printBahpe() {
  const printArea = document.getElementById('bahpe-print-area');
  if (!printArea) {
    toast('Pilih No RUP terlebih dahulu', 'error');
    return;
  }
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Berita Acara Hasil Penetapan E-Purchasing</title>
      <style>
        ${buildPageRule('bahpe')}
        @media screen {
          body { max-width: 210mm; margin: 0 auto; padding: 20mm; background: #f0f0f0; }
          body > * { background: #fff; }
        }
        * { box-sizing: border-box; color: #000 !important; }
        body { margin:0; padding:0; font-family:'Times New Roman',Times,serif; font-size:12pt; color:#000; -webkit-print-color-adjust:exact; print-color-adjust:exact; line-height:1.5; }
        table { border-collapse:collapse; width:100%; table-layout:fixed; }
        thead { display:table-header-group; }
        tfoot { display:table-footer-group; }
        tbody tr { page-break-inside:auto; }
        th, td { border:1px solid #000; word-wrap:break-word; }
        p { margin:4px 0; orphans:3; widows:3; }
        .section-block { page-break-inside:auto; }
        [id$="-print-area"] {
          padding:0 !important; max-width:100% !important; width:100% !important;
          margin:0 !important; box-shadow:none !important; border-radius:0 !important;
          background:#fff !important; line-height:1.45;
        }
        img { max-width:100%; height:auto; display:block; }
        table { table-layout:fixed; width:100% !important; }
        table.data-tbl th:first-child,
        table.data-tbl td:first-child,
        th.no-col, td.no-col {
          width:34px !important; text-align:center !important;
          vertical-align:middle !important; white-space:nowrap;
          padding-left:4px !important; padding-right:4px !important;
        }
        thead th { text-align:center !important; vertical-align:middle !important; }
        .num, td.num { text-align:right !important; white-space:nowrap; }
        td > table { border:0 !important; }
        /* Page-break controls — cegah baris & section terpotong */
        tr { page-break-inside: avoid !important; }
        thead { display: table-header-group !important; }
        tfoot { display: table-footer-group !important; }
        .section-block { page-break-inside: avoid !important; }
        p { orphans:3; widows:3; }
        .doc-nomor-edit { display:none !important; }
      </style>
    </head>
    <body>${printArea.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
}

// ============================================================
//  GENERIC DOCUMENT ZOOM PREVIEW
//  Works for all documents: evat, evhp, formspek, formdpp,
//  nodis, riviu, penetapan, idkb, bahpe
// ============================================================
(function() {
  const _docZoomState = {};
  const MIN = 50, MAX = 150;

  function _applyDocZoom(slug) {
    const pct = _docZoomState[slug] || 100;
    const area    = document.getElementById(slug + '-print-area');
    const label   = document.getElementById(slug + '-zoom-label');
    const wrapper = document.getElementById(slug + '-content');
    if (!area) return;
    const scale = pct / 100;
    area.style.transform       = 'scale(' + scale + ')';
    area.style.transformOrigin = 'top center';
    if (wrapper) wrapper.style.minHeight = Math.round(area.scrollHeight * scale + 24) + 'px';
    if (label)   label.textContent = pct + '%';
  }

  window.docZoom = function(slug, delta) {
    _docZoomState[slug] = Math.min(MAX, Math.max(MIN, (_docZoomState[slug] || 100) + delta));
    _applyDocZoom(slug);
  };

  window.docZoomReset = function(slug) {
    _docZoomState[slug] = 100;
    _applyDocZoom(slug);
  };

  // Wrap every load*Data function to re-apply zoom after render
  const _loaders = [
    'loadBahpeData','loadEvatData','loadEvhpData','loadFormSpekData',
    'loadFormDppData','loadNodisData','loadRiviuData',
    'loadPenetapanData','loadIdkbData','loadSppbjData'
  ];
  const _slugMap = {
    loadBahpeData:'bahpe', loadEvatData:'evat', loadEvhpData:'evhp',
    loadFormSpekData:'formspek', loadFormDppData:'formdpp',
    loadNodisData:'nodis', loadRiviuData:'riviu',
    loadPenetapanData:'penetapan', loadIdkbData:'idkb',
    loadSppbjData:'sppbj'
  };
  _loaders.forEach(function(fn) {
    const orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function() {
      orig.apply(this, arguments);
      setTimeout(function() { _applyDocZoom(_slugMap[fn]); }, 50);
    };
  });

  // Legacy aliases kept for BAHPE buttons already in HTML
  window.bahpeZoom      = function(d) { window.docZoom('bahpe', d); };
  window.bahpeZoomReset = function()  { window.docZoomReset('bahpe'); };
})();

// ============================================================
//  LIVE CLOCK
// ============================================================
(function initClock() {
  const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  function tick() {
    const now = new Date();
    const tEl = document.getElementById('tc-time');
    const dEl = document.getElementById('tc-date');
    if (tEl) tEl.textContent = now.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    if (dEl) dEl.textContent = `${HARI[now.getDay()]}, ${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;
  }
  tick();
  setInterval(tick, 1000);
})();

// ============================================================
//  SMOOTH NUMBER COUNTER
// ============================================================
function animateCount(el, target, duration) {
  if (!el) return;
  duration = duration || 750;
  const start = performance.now();
  const from = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
  (function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased).toLocaleString('id-ID');
    if (p < 1) requestAnimationFrame(frame);
  })(start);
}

// ============================================================
//  HERO STATS UPDATE
// ============================================================
// Logika sama persis dengan diagram Top 5 Penyedia:
// per RUP, penyedia terpilih = yang memiliki total terendah (negoFinal/totalHarga)

function updateHeroStats() {
  const totalPaket = state.paket.data.length;
  const totalItem = state.rincian.data.length;
  const totalHarga = state.harga.data.length;
  const uniquePenyedia = getPenyediaTerpilih(state.harga.data).size;
  animateCount(document.getElementById('hero-total-paket'), totalPaket);
  animateCount(document.getElementById('hero-total-item'), totalItem);
  animateCount(document.getElementById('hero-total-penyedia'), uniquePenyedia);
  animateCount(document.getElementById('hero-total-harga'), totalHarga);
}

// Init v3.0 — tunggu sb-ready dari supabase-db.js
window.addEventListener('sb-ready', async (e) => {
  loadAppConfig();
  applyAppConfig();
  try {
    document.getElementById('csv-format-hint').textContent = CSV_FORMATS['paket'];
  } catch(_) {}

  if (e.detail.loggedIn) {
    // Data sudah di-load oleh supabase-db.js, cukup render
    state.paket.filtered   = [...state.paket.data];
    state.rincian.filtered = [...state.rincian.data];
    state.harga.filtered   = [...state.harga.data];
    state.penyedia.filtered = [...state.penyedia.data];
    dashboardFilteredPaket   = [...state.paket.data];
    dashboardFilteredRincian = [...state.rincian.data];
    dashboardFilteredHarga   = [...state.harga.data];
    renderAll();
    updateBadges();
    populateDropdowns();
    populateEvatRupSelect();
    populateEvatPejabatSelect();
    populateEvhpRupSelect();
    populateEvhpPejabatSelect();
    populateFormSpekSelects();
    populateFormDppSelects();
    populatePenetapanSelects();
    populateIdkbSelects();
    populateDashboardFilters();
  }
  showPage('dashboard');
});

// Fallback jika sb-ready tidak terpanggil dalam 8 detik
setTimeout(() => {
  if (!window._sbReady) {
    loadAppConfig();
    applyAppConfig();
    showPage('dashboard');
  }
}, 8000);

// ── NOMOR DOKUMEN KUSTOM ──────────────────────────────────────────────────────
if (typeof _nomorState === 'undefined') var _nomorState = {};

function openNomorDialog(btn) {
  const slug  = btn.getAttribute('data-slug');
  const rup   = btn.getAttribute('data-rup');
  const field = btn.getAttribute('data-field');
  const cur   = btn.getAttribute('data-cur');
  _nomorState = { slug, rup, field };
  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  document.getElementById('nomor-dialog-sub').textContent =
    `Dokumen : ${slug.toUpperCase()}   •   RUP : ${rup}`;
  const inp = document.getElementById('nomor-dialog-input');
  inp.value       = paket && paket[field] ? paket[field] : '';
  inp.placeholder = cur;
  document.getElementById('nomor-dialog').style.display = 'flex';
  setTimeout(() => inp.focus(), 60);
}

function closeNomorDialog() {
  document.getElementById('nomor-dialog').style.display = 'none';
  _nomorState = {};
}

async function saveNomorDialog() {
  const { slug, rup, field } = _nomorState;
  const val   = (document.getElementById('nomor-dialog-input').value || '').trim();
  const paket = state.paket.data.find(p => String(p.rup) === String(rup));
  if (!paket) { closeNomorDialog(); return; }
  if (val) paket[field] = val; else delete paket[field];
  await dbPut('paket', paket);
  state.paket.data = await dbGetAll('paket');
  closeNomorDialog();
  const R = {
    evat: loadEvatData, evhp: loadEvhpData, formspek: loadFormSpekData,
    riviu: loadRiviuData, penetapan: loadPenetapanData, idkb: loadIdkbData,
    nodis: loadNodisData, formdpp: loadFormDppData, bahpe: loadBahpeData,
    sppbj: loadSppbjData
  };
  if (R[slug]) R[slug]();
}




console.log('✅ dashboard-documents.js loaded');
