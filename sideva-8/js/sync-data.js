/**
 * sync-data.js — SI-DEVA v8
 * ============================
 * WAJIB ditambahkan di index.html SETELAH rekap-bidang.js:
 *   <script src="js/sync-data.js"></script>
 *
 * Panel status dan tombol Sync Massal akan LANGSUNG tampil
 * saat halaman Rincian Belanja dibuka — tidak perlu input data baru dulu.
 *
 * v3.1 — Tambahan: Sync Per RUP (syncByRup)
 *   Tombol "🎯 Sync RUP Ini" hanya sync item milik RUP yang sedang aktif/dipilih.
 */

'use strict';

var SYNC_CFG = { n: 3 };

function _normTxt(v) {
  return String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function _isManualHargaByItem(h, rec) {
  if (!h || !rec) return false;
  if (String(h.rup || '') !== String(rec.rup || '')) return false;
  if (!h.namaItem) return false;
  if (String(h.parentRincianId || '').trim() !== '') return false;
  return _normTxt(h.namaItem) === _normTxt(rec.itemBarang);
}

// ============================================================
// DETEKSI RUP AKTIF dari halaman
// Prioritas: dropdown resmi SI-DEVA → state global → fallback DOM
// Kembalikan string RUP (hanya angka) atau null jika tidak terpilih.
// ============================================================
function _getActiveRup() {
  // Helper: ambil hanya bagian RUP dari value yang mungkin berformat
  // "64408812 — Nama Paket" atau murni "64408812"
  function _extractRup(raw) {
    var s = String(raw || '').trim();
    if (!s || s === '' || s === '0') return null;
    // Jika mengandung " — " atau " - ", ambil bagian sebelumnya saja
    var parts = s.split(/\s+[—–-]\s+/);
    var rup = parts[0].trim();
    // Tolak nilai kosong / placeholder
    if (!rup || rup === '0' || rup === 'semua' || rup === 'all' ||
        rup === 'null' || rup === 'undefined') return null;
    return rup;
  }

  // 1. PRIORITAS UTAMA — dropdown resmi SI-DEVA di halaman Rincian Belanja
  var ddRincian = document.getElementById('filter-rupdd-rincian');
  if (ddRincian && ddRincian.value) {
    var rup1 = _extractRup(ddRincian.value);
    if (rup1) return rup1;
  }

  // 2. Input teks "Cari No RUP…" di halaman Rincian (bisa juga digunakan)
  var inputRup = document.getElementById('filter-rup-rincian');
  if (inputRup && inputRup.value) {
    var rup2 = _extractRup(inputRup.value);
    if (rup2) return rup2;
  }

  // 3. Fallback — elemen lain yang mungkin ada di versi SI-DEVA lain
  var selectors = ['#sel-rup', '#filter-rup', '#input-rup', '#rup-filter',
                   '#select-rup', '#combo-rup', '#dd-rup', 'select[name="rup"]'];
  for (var i = 0; i < selectors.length; i++) {
    var el = document.querySelector(selectors[i]);
    if (el && el.value) {
      var rup3 = _extractRup(el.value);
      if (rup3) return rup3;
    }
  }

  // 4. State global
  if (typeof state !== 'undefined') {
    var candidates = [
      state.activeRup, state.selectedRup, state.currentRup,
      state.filter && state.filter.rup,
      state.rincian && state.rincian.filter && state.rincian.filter.rup,
    ];
    for (var j = 0; j < candidates.length; j++) {
      var rup4 = _extractRup(candidates[j]);
      if (rup4) return rup4;
    }
  }

  // 5. Baris tabel yang aktif/terpilih
  var activeRow = document.querySelector('#tbody-rincian tr.active, #tbody-rincian tr.selected');
  if (activeRow) {
    var rupCell = activeRow.querySelector('[data-rup]');
    if (rupCell) {
      var rup5 = _extractRup(rupCell.getAttribute('data-rup'));
      if (rup5) return rup5;
    }
  }

  // 6. Label/badge RUP aktif
  var rupLabel = document.querySelector('[data-active-rup], #lbl-rup-aktif, .rup-aktif');
  if (rupLabel) {
    var txt = (rupLabel.getAttribute('data-active-rup') || rupLabel.textContent || '').trim();
    if (txt && txt !== '-') return txt;
  }

  return null;
}

// ============================================================
// NAMA PAKET untuk RUP tertentu (untuk ditampilkan di modal)
// ============================================================
function _getNamaPaket(rup) {
  if (!rup) return '';
  var paket = (state && state.paket && state.paket.data || []).find(function(p) {
    return String(p.rup) === String(rup);
  });
  return paket ? (paket.namaPaket || '') : '';
}

// ============================================================
// AUTO-SYNC: dipanggil dari pengajuan.js → saveRincian() (input BARU saja)
// Hanya membuat baris pembanding yang belum ada — tidak menimpa data lama.
// ============================================================
async function autoSyncHargaPembanding(rincianId, rec, isEdit) {
  if (isEdit) {
    return { skipped: true, created: 0, updated: 0 };
  }

  var n = SYNC_CFG.n;
  var allHarga = (state.harga && state.harga.data) ? state.harga.data : [];
  var hasManual = allHarga.some(function(h) {
    return _isManualHargaByItem(h, rec);
  });
  if (hasManual) {
    return { skipped: true, created: 0, updated: 0 };
  }

  var existing = allHarga.filter(function(h) {
    return String(h.parentRincianId) === String(rincianId);
  });
  var paket = (state.paket.data || []).find(function(p) {
    return String(p.rup) === String(rec.rup);
  });
  var tasks = [];
  var created = 0;

  for (var ke = 1; ke <= n; ke++) {
    var found = existing.find(function(h) { return Number(h.pembandingKe) === ke; });
    if (found) continue;

    tasks.push(dbPut('harga', {
      rup: rec.rup,
      namaPaket:       paket ? (paket.namaPaket || '') : '',
      hps:             paket ? (paket.paguAnggaran || null) : null,
      namaItem:        rec.itemBarang,
      namaProduk:      '',
      namaPenyedia:    '',
      qty:             rec.vol,
      satuan:          rec.satuan || '',
      hargaTayang:     null, dpp: null, ppn: null, ongkir: null, totalHarga: null,
      statusPajak:     'Tidak Kena Pajak',
      statusKatalog:   'Aktif',
      negoFinal:       null, pdn: 'Ya', umkm: 'Ya', lokasi: '',
      parentRincianId: String(rincianId),
      pembandingKe:    ke,
    }));
    created++;
  }

  if (tasks.length) {
    try { await Promise.all(tasks); }
    catch (e) {
      console.error('[SyncData] autoSync error:', e);
      throw e;
    }
  }

  return { skipped: false, created: created, updated: 0 };
}

// ============================================================
// AUTO-DELETE: dipanggil dari pengajuan.js → deleteRecord()
// ============================================================
async function autoDeleteHargaPembanding(rincianId, rec) {
  var all = await dbGetAll('harga');
  var terkait = all.filter(function(h) {
    return String(h.parentRincianId) === String(rincianId);
  });
  if (rec && rec.rup && rec.itemBarang) {
    var linkedByItem = all.filter(function(h) {
      return String(h.rup || '') === String(rec.rup || '') &&
             _normTxt(h.namaItem) === _normTxt(rec.itemBarang);
    });
    if (linkedByItem.length) {
      var map = {};
      terkait.concat(linkedByItem).forEach(function(h) {
        if (h && h.id) map[h.id] = h;
      });
      terkait = Object.keys(map).map(function(id) { return map[id]; });
    }
  }
  if (!terkait.length) return;
  try { await Promise.all(terkait.map(function(h) { return dbDelete('harga', h.id); })); }
  catch (e) { console.error('[SyncData] autoDelete error:', e); }
}

// ============================================================
// VALIDASI & RENDER PANEL STATUS
// ============================================================
function validasiKelengkapanPembanding() {
  var n          = SYNC_CFG.n;
  var rincianArr = (state && state.rincian && state.rincian.data) ? state.rincian.data : [];
  var hargaArr   = (state && state.harga   && state.harga.data)   ? state.harga.data   : [];
  var activeRup  = _getActiveRup();

  var sudah = 0, belum = 0;
  rincianArr.forEach(function(r) {
    if (!r.id) return;
    var manualAda = hargaArr.some(function(h) { return _isManualHargaByItem(h, r); });
    if (manualAda) return;
    var jml = hargaArr.filter(function(h) {
      return String(h.parentRincianId) === String(r.id);
    }).length;
    if (jml >= n) { sudah++; }
    else { belum++; }
  });

  // Hitung juga stat khusus RUP aktif (jika ada)
  var rupSudah = 0, rupBelum = 0;
  if (activeRup) {
    rincianArr.forEach(function(r) {
      if (!r.id) return;
      if (String(r.rup || '') !== String(activeRup)) return;
      var manualAda = hargaArr.some(function(h) { return _isManualHargaByItem(h, r); });
      if (manualAda) return;
      var jml = hargaArr.filter(function(h) {
        return String(h.parentRincianId) === String(r.id);
      }).length;
      if (jml >= n) { rupSudah++; }
      else { rupBelum++; }
    });
  }

  _svpRender(sudah + belum, sudah, belum, activeRup, rupSudah, rupBelum);
}

// ============================================================
// SYNC ULANG MASSAL (semua RUP)
// ============================================================
async function syncUlangMassal() {
  _smpShow('massal', null, null);
  _smpLog('Memuat data dari Supabase…', 5, '#3b82f6');

  var allR, allH;
  try {
    var res = await Promise.all([dbGetAll('rincian'), dbGetAll('harga')]);
    allR = res[0]; allH = res[1];
  } catch (e) {
    _smpLog('Gagal memuat data: ' + (e.message || e), 100, '#ef4444');
    _smpDone(false); return;
  }

  await _runSyncLoop(allR, allH, null);
}

// ============================================================
// SYNC PER RUP — hanya item milik no RUP yang dipilih/aktif
// ============================================================
async function syncByRup(rupValue) {
  var rup = rupValue || _getActiveRup();
  if (!rup) {
    alert('Tidak ada RUP yang dipilih.\nSilakan pilih atau filter RUP terlebih dahulu.');
    return;
  }

  var namaPaket = _getNamaPaket(rup);
  _smpShow('rup', rup, namaPaket);
  _smpLog('Memuat data RUP ' + rup + ' dari Supabase…', 5, '#7c3aed');

  var allR, allH;
  try {
    var res = await Promise.all([dbGetAll('rincian'), dbGetAll('harga')]);
    allR = res[0].filter(function(r) { return String(r.rup || '') === String(rup); });
    allH = res[1];
  } catch (e) {
    _smpLog('Gagal memuat data: ' + (e.message || e), 100, '#ef4444');
    _smpDone(false); return;
  }

  if (!allR.length) {
    _smpLog('Tidak ada item rincian untuk RUP ' + rup, 100, '#f59e0b');
    _smpDone(true, 0, 0, 0); return;
  }

  await _runSyncLoop(allR, allH, rup);
}

// ============================================================
// LOOP SYNC INTI — dipakai oleh syncUlangMassal & syncByRup
// ============================================================
async function _runSyncLoop(allR, allH, filterRup) {
  var total = allR.length, n = SYNC_CFG.n;
  var dibuat = 0, lewat = 0, gagal = 0;
  var warnaBiru   = filterRup ? '#7c3aed' : '#3b82f6';
  var warnaHijau  = '#10b981';
  var warnaError  = '#ef4444';

  for (var i = 0; i < total; i++) {
    var r   = allR[i];
    var pct = Math.round(10 + (i / total) * 85);
    var nm  = (r.itemBarang || '').slice(0, 32);

    var manualAda = allH.some(function(h) { return _isManualHargaByItem(h, r); });
    if (manualAda) continue;

    var exst = allH.filter(function(h) { return String(h.parentRincianId) === String(r.id); });

    if (exst.length >= n) {
      lewat++;
      _smpLog('[' + (i + 1) + '/' + total + '] Dilewati (sudah lengkap): ' + nm, pct, warnaHijau);
      continue;
    }

    var paket = (state.paket.data || []).find(function(p) { return String(p.rup) === String(r.rup); });
    var tasks = [];
    for (var ke = 1; ke <= n; ke++) {
      var ada = exst.find(function(h) { return Number(h.pembandingKe) === ke; });
      if (ada) continue;
      tasks.push(dbPut('harga', {
        rup: r.rup,
        namaPaket:       paket ? (paket.namaPaket || '') : '',
        hps:             paket ? (paket.paguAnggaran || null) : null,
        namaItem:        r.itemBarang, namaProduk: '', namaPenyedia: '',
        qty:             r.vol, satuan: r.satuan || '',
        hargaTayang: null, dpp: null, ppn: null, ongkir: null, totalHarga: null,
        statusPajak: 'Tidak Kena Pajak', statusKatalog: 'Aktif',
        negoFinal: null, pdn: 'Ya', umkm: 'Ya', lokasi: '',
        parentRincianId: String(r.id),
        pembandingKe:    ke,
      }));
    }

    try {
      await Promise.all(tasks);
      dibuat += tasks.length;
      _smpLog('[' + (i + 1) + '/' + total + '] Dibuat ' + tasks.length + ' pembanding: ' + nm, pct, warnaBiru);
    } catch (e) {
      gagal++;
      _smpLog('[' + (i + 1) + '/' + total + '] Gagal: ' + nm + ' — ' + (e.message || e), pct, warnaError);
    }
    if (tasks.length) await new Promise(function(res) { setTimeout(res, 100); });
  }

  _smpLog('Menyegarkan data…', 97, warnaBiru);
  try {
    state.harga.data     = await dbGetAll('harga');
    state.harga.filtered = state.harga.data.slice();
    if (typeof filterHarga === 'function') filterHarga();
  } catch (_) {}

  _smpLog('Selesai!', 100, warnaHijau);
  _smpDone(true, dibuat, lewat, gagal);
  setTimeout(function() {
    if (typeof validasiKelengkapanPembanding === 'function') validasiKelengkapanPembanding();
  }, 400);
}

// ============================================================
// INJEKSI TOMBOL KE HEADER RINCIAN
// Tombol 1: ⚡ Sync Massal  (semua RUP)
// Tombol 2: 🎯 Sync RUP Ini (hanya RUP aktif)
// ============================================================
function _injectBtn() {
  var pg = document.getElementById('page-rincian');
  if (!pg) return;
  var hdr = pg.querySelector('.table-header');
  if (!hdr) return;

  // --- Tombol Sync Massal ---
  if (!document.getElementById('btn-sync-massal-rincian')) {
    var btnMassal = document.createElement('button');
    btnMassal.id        = 'btn-sync-massal-rincian';
    btnMassal.title     = 'Tambah slot pembanding kosong untuk SEMUA RUP yang belum punya 3 pembanding';
    btnMassal.innerHTML = '⚡ Sync Massal';
    btnMassal.onclick   = function() { syncUlangMassal(); };

    var titleEl = hdr.querySelector('.table-header-title');
    if (titleEl && titleEl.nextSibling) {
      hdr.insertBefore(btnMassal, titleEl.nextSibling);
    } else {
      hdr.appendChild(btnMassal);
    }
  }

  // --- Tombol Sync RUP Ini ---
  if (!document.getElementById('btn-sync-rup-ini')) {
    var btnRup = document.createElement('button');
    btnRup.id        = 'btn-sync-rup-ini';
    btnRup.title     = 'Sync pembanding hanya untuk RUP yang sedang aktif/dipilih';
    btnRup.innerHTML = '🎯 Sync RUP Ini';
    btnRup.onclick   = function() { syncByRup(null); };

    var afterMassal = document.getElementById('btn-sync-massal-rincian');
    if (afterMassal && afterMassal.nextSibling) {
      hdr.insertBefore(btnRup, afterMassal.nextSibling);
    } else {
      hdr.appendChild(btnRup);
    }
  }

  // Update state tombol Sync RUP setiap kali inject dipanggil
  _updateBtnRupState();
}

// Perbarui tampilan tombol Sync RUP Ini berdasarkan ada/tidaknya RUP aktif
function _updateBtnRupState() {
  var btn = document.getElementById('btn-sync-rup-ini');
  if (!btn) return;
  var rup = _getActiveRup();
  if (rup) {
    btn.disabled = false;
    btn.classList.remove('disabled');
    btn.title = 'Sync pembanding untuk RUP: ' + rup;
    btn.innerHTML = '🎯 Sync RUP ' + rup;
  } else {
    btn.disabled = false; // tetap bisa diklik, akan tampil alert
    btn.classList.add('disabled');
    btn.title = 'Pilih RUP terlebih dahulu untuk menggunakan fitur ini';
    btn.innerHTML = '🎯 Sync RUP Ini';
  }
}

// ============================================================
// AUTO-TRIGGER PANEL VIA MutationObserver pada tbody-rincian
// ============================================================
function _setupObserver() {
  var tbody = document.getElementById('tbody-rincian');
  if (!tbody) return;

  var debounce = null;
  var obs = new MutationObserver(function() {
    var pg = document.getElementById('page-rincian');
    if (!pg || !pg.classList.contains('active')) return;
    clearTimeout(debounce);
    debounce = setTimeout(function() {
      _injectBtn();
      _updateBtnRupState();
      validasiKelengkapanPembanding();
    }, 250);
  });
  obs.observe(tbody, { childList: true });
}

// Pantau perubahan dropdown RUP agar tombol & panel ikut update
function _setupRupChangeListener() {
  // ID resmi SI-DEVA di halaman Rincian Belanja
  var rupSelectors = [
    '#filter-rupdd-rincian',  // dropdown "Pilih RUP + Paket" — UTAMA
    '#filter-rup-rincian',    // input teks "Cari No RUP…"
    '#sel-rup', '#filter-rup', '#input-rup', '#rup-filter', 'select[name="rup"]'
  ];
  rupSelectors.forEach(function(sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    var evtName = (el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evtName, function() {
      _updateBtnRupState();
      validasiKelengkapanPembanding();
    });
  });
}

// ============================================================
// LISTENER EVENT NAVIGASI sideva:page-changed
// ============================================================
window.addEventListener('sideva:page-changed', function(e) {
  if (!e.detail || e.detail.page !== 'rincian') return;
  setTimeout(function() {
    _injectBtn();
    _setupRupChangeListener();
    validasiKelengkapanPembanding();
  }, 400);
});

// ============================================================
// INIT SAAT SCRIPT DIMUAT
// ============================================================
(function _boot() {
  function _setup() {
    _injectBtn();
    _setupObserver();
    _setupRupChangeListener();
    var pg = document.getElementById('page-rincian');
    if (pg && pg.classList.contains('active')) {
      setTimeout(validasiKelengkapanPembanding, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(_setup, 600); });
  } else {
    setTimeout(_setup, 600);
  }
})();

// ============================================================
// INJECT STYLES
// ============================================================
(function _css() {
  if (document.getElementById('sync-data-css')) return;
  var s = document.createElement('style');
  s.id = 'sync-data-css';
  s.textContent = [
    /* tombol toolbar — Sync Massal */
    '#btn-sync-massal-rincian{display:inline-flex;align-items:center;gap:5px;',
    'background:#f0f9ff;color:#0369a1;border:1px solid #7dd3fc;border-radius:6px;',
    'padding:5px 12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;',
    'flex-shrink:0;margin-left:10px;transition:all .15s;}',
    '#btn-sync-massal-rincian:hover{background:#e0f2fe;border-color:#38bdf8;}',
    /* tombol toolbar — Sync RUP Ini */
    '#btn-sync-rup-ini{display:inline-flex;align-items:center;gap:5px;',
    'background:#faf5ff;color:#6d28d9;border:1px solid #c4b5fd;border-radius:6px;',
    'padding:5px 12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;',
    'flex-shrink:0;margin-left:6px;transition:all .15s;max-width:220px;overflow:hidden;',
    'text-overflow:ellipsis;}',
    '#btn-sync-rup-ini:hover{background:#ede9fe;border-color:#a78bfa;}',
    '#btn-sync-rup-ini.disabled{background:#f5f5f5;color:#9ca3af;border-color:#e5e7eb;',
    'font-style:italic;}',
    '#btn-sync-rup-ini.disabled:hover{background:#f5f5f5;border-color:#e5e7eb;}',
    /* panel status */
    '#svp{position:fixed;bottom:20px;right:20px;z-index:9999;background:#fff;',
    'border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,.14);',
    'padding:14px 16px;min-width:255px;max-width:340px;font-family:sans-serif;font-size:13px;}',
    '#svp .svp-head{font-weight:700;font-size:13px;margin-bottom:10px;display:flex;',
    'align-items:center;justify-content:space-between;}',
    '#svp .svp-x{cursor:pointer;color:#a0aec0;font-size:18px;line-height:1;padding:0 2px;}',
    '#svp .svp-x:hover{color:#e53e3e;}',
    '#svp .svp-row{display:flex;align-items:center;justify-content:space-between;',
    'padding:5px 0;border-bottom:1px solid #f0f0f0;color:#4a5568;min-width:0;}',
    '#svp .svp-row:last-of-type{border-bottom:none;}',
    '#svp .svp-n{font-weight:700;font-size:15px;}',
    '#svp .svp-n.ok{color:#10b981;} #svp .svp-n.err{color:#e53e3e;}',
    '#svp .svp-lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px;}',
    '#svp .svp-sub{color:#9ca3af;font-size:11px;white-space:nowrap;margin-left:6px;}',
    '#svp .svp-divider{border:none;border-top:2px dashed #e9d5ff;margin:8px 0 6px;}',
    '#svp .svp-rup-badge{display:inline-block;background:#ede9fe;color:#6d28d9;',
    'border-radius:4px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:4px;}',
    '#svp .svp-ok{color:#10b981;font-weight:600;text-align:center;padding:5px 0 2px;}',
    '#svp .svp-btn{display:block;margin-top:8px;background:#3b82f6;color:#fff;border:none;',
    'border-radius:6px;padding:7px 10px;cursor:pointer;width:100%;font-size:12px;font-weight:600;}',
    '#svp .svp-btn:hover{background:#2563eb;}',
    '#svp .svp-btn2{display:block;margin-top:5px;background:#f9fafb;color:#374151;',
    'border:1px solid #d1d5db;border-radius:6px;padding:7px 10px;cursor:pointer;',
    'width:100%;font-size:12px;font-weight:600;}',
    '#svp .svp-btn2:hover{background:#eff6ff;color:#1d4ed8;border-color:#93c5fd;}',
    '#svp .svp-btn3{display:block;margin-top:5px;background:#faf5ff;color:#6d28d9;',
    'border:1px solid #c4b5fd;border-radius:6px;padding:7px 10px;cursor:pointer;',
    'width:100%;font-size:12px;font-weight:600;}',
    '#svp .svp-btn3:hover{background:#ede9fe;border-color:#a78bfa;}',
    /* modal sync massal / rup */
    '#smp-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;',
    'display:flex;align-items:center;justify-content:center;}',
    '#smp-bx{background:#fff;border-radius:14px;padding:26px 28px;',
    'width:min(490px,92vw);box-shadow:0 8px 40px rgba(0,0,0,.22);font-family:sans-serif;}',
    '#smp-bx h3{margin:0 0 5px;font-size:17px;color:#1e3a5f;font-weight:700;}',
    '#smp-bx h3.rup-mode{color:#4c1d95;}',
    '#smp-bx .sb-sub{margin:0 0 18px;font-size:12.5px;color:#6b7280;line-height:1.5;}',
    '#smp-bx .sb-rup-info{display:inline-block;background:#ede9fe;color:#5b21b6;',
    'border-radius:5px;padding:3px 10px;font-size:12px;font-weight:700;',
    'margin-bottom:14px;border:1px solid #ddd6fe;}',
    '.sb-track{background:#f1f5f9;border-radius:999px;height:10px;overflow:hidden;margin-bottom:10px;}',
    '.sb-fill{height:100%;border-radius:999px;transition:width .3s,background .3s;}',
    '.sb-log{font-size:12px;color:#374151;min-height:38px;background:#f8fafc;',
    'border-radius:6px;padding:7px 10px;margin-bottom:16px;word-break:break-all;line-height:1.5;}',
    '.sb-cards{display:none;gap:10px;margin-bottom:18px;}',
    '.sb-cards.show{display:flex;}',
    '.sb-card{flex:1;border-radius:8px;padding:10px;text-align:center;border:1px solid #e5e7eb;}',
    '.sb-card .cv{font-size:26px;font-weight:800;line-height:1;}',
    '.sb-card .cl{font-size:11px;color:#6b7280;margin-top:3px;}',
    '.sb-card.blue{background:#eff6ff;border-color:#bfdbfe;}.sb-card.blue .cv{color:#2563eb;}',
    '.sb-card.purple{background:#faf5ff;border-color:#ddd6fe;}.sb-card.purple .cv{color:#7c3aed;}',
    '.sb-card.green{background:#f0fdf4;border-color:#bbf7d0;}.sb-card.green .cv{color:#16a34a;}',
    '.sb-card.red{background:#fef2f2;border-color:#fecaca;}.sb-card.red .cv{color:#dc2626;}',
    '.sb-foot{display:flex;gap:10px;justify-content:flex-end;}',
    '.sb-cancel{background:#f9fafb;color:#374151;border:1px solid #d1d5db;border-radius:7px;',
    'padding:9px 20px;font-size:14px;font-weight:600;cursor:pointer;}',
    '.sb-cancel:hover{background:#f3f4f6;}',
    '.sb-done{display:none;background:#3b82f6;color:#fff;border:none;border-radius:7px;',
    'padding:9px 20px;font-size:14px;font-weight:600;cursor:pointer;}',
    '.sb-done.rup-mode{background:#7c3aed;}',
    '.sb-done:hover{background:#2563eb;} .sb-done.rup-mode:hover{background:#6d28d9;}',
  ].join('');
  document.head.appendChild(s);
})();

// ============================================================
// UI HELPERS: PANEL STATUS
// ============================================================
function _svpRender(total, sudah, belum, activeRup, rupSudah, rupBelum) {
  var el = document.getElementById('svp');
  if (!el) {
    el = document.createElement('div');
    el.id = 'svp';
    document.body.appendChild(el);
  }

  var rupSection = '';
  if (activeRup) {
    var namaPaket = _getNamaPaket(activeRup);
    var rupLabel  = namaPaket
      ? (namaPaket.slice(0, 28) + (namaPaket.length > 28 ? '…' : ''))
      : ('RUP ' + activeRup);
    rupSection =
      '<hr class="svp-divider">' +
      '<div class="svp-row" style="flex-direction:column;align-items:flex-start;gap:3px;">' +
        '<span style="font-weight:600;font-size:11px;color:#6d28d9;">RUP Aktif</span>' +
        '<span class="svp-rup-badge" title="' + activeRup + '">' + activeRup + '</span>' +
        (namaPaket ? '<span style="font-size:11px;color:#6b7280;word-break:break-word;">' + rupLabel + '</span>' : '') +
      '</div>' +
      '<div class="svp-row"><span>Sudah (RUP ini)</span><span class="svp-n ok">' + rupSudah + '</span></div>' +
      '<div class="svp-row"><span>Belum (RUP ini)</span><span class="svp-n ' + (rupBelum > 0 ? 'err' : 'ok') + '">' + rupBelum + '</span></div>' +
      (rupBelum > 0
        ? '<button class="svp-btn3" onclick="syncByRup(null)">🎯 Sync RUP Ini Sekarang</button>'
        : '<div class="svp-ok">✓ RUP ini sudah lengkap</div>');
  }

  el.innerHTML =
    '<div class="svp-head">' +
      '<span>📋 Status Survey Harga</span>' +
      '<span class="svp-x" onclick="document.getElementById(\'svp\').style.display=\'none\'" title="Tutup">×</span>' +
    '</div>' +
    '<div class="svp-row"><span>Total Item Rincian</span><span class="svp-n">' + total + '</span></div>' +
    '<div class="svp-row"><span>Sudah ada pembanding</span><span class="svp-n ok">' + sudah + '</span></div>' +
    '<div class="svp-row"><span>Belum ada pembanding</span><span class="svp-n ' + (belum > 0 ? 'err' : 'ok') + '">' + belum + '</span></div>' +
    rupSection +
    '<button class="svp-btn" onclick="validasiKelengkapanPembanding()">🔄 Cek Ulang</button>' +
    (belum > 0 ? '<button class="svp-btn2" onclick="syncUlangMassal()">⚡ Sync Massal Sekarang</button>' : '');

  el.style.display = 'block';
}

// ============================================================
// UI HELPERS: MODAL PROGRESS SYNC
// mode: 'massal' | 'rup'
// ============================================================
function _smpShow(mode, rup, namaPaket) {
  var old = document.getElementById('smp-ov');
  if (old) old.remove();

  var isRup     = mode === 'rup';
  var titleText = isRup ? '🎯 Sync Per RUP' : '⚡ Sync Ulang Massal';
  var subText   = isRup
    ? 'Menambah slot Survey Harga hanya untuk item milik RUP yang dipilih.<br><strong>Data yang sudah ada tidak diubah/ditimpa.</strong>'
    : 'Menambah baris Survey Harga hanya untuk rincian yang belum punya 3 pembanding.<br><strong>Rincian yang sudah punya pembanding tidak diubah/ditimpa.</strong>';
  var rupInfo   = isRup && rup
    ? '<div class="sb-rup-info">RUP: ' + rup + (namaPaket ? ' — ' + namaPaket.slice(0, 40) : '') + '</div>'
    : '';
  var cardColor = isRup ? 'purple' : 'blue';

  var ov = document.createElement('div');
  ov.id = 'smp-ov';
  ov.innerHTML =
    '<div id="smp-bx">' +
      '<h3 class="' + (isRup ? 'rup-mode' : '') + '">' + titleText + '</h3>' +
      '<p class="sb-sub">' + subText + '</p>' +
      rupInfo +
      '<div class="sb-track"><div class="sb-fill" id="sb-fill" style="width:0%;background:' + (isRup ? '#7c3aed' : '#3b82f6') + '"></div></div>' +
      '<div class="sb-log" id="sb-log">Memulai proses…</div>' +
      '<div class="sb-cards" id="sb-cards">' +
        '<div class="sb-card ' + cardColor + '"><div class="cv" id="sb-d">0</div><div class="cl">Pembanding Dibuat</div></div>' +
        '<div class="sb-card green"><div class="cv" id="sb-l">0</div><div class="cl">Sudah Lengkap</div></div>' +
        '<div class="sb-card red"><div class="cv" id="sb-g">0</div><div class="cl">Gagal</div></div>' +
      '</div>' +
      '<div class="sb-foot">' +
        '<button class="sb-cancel" id="sb-cancel" onclick="document.getElementById(\'smp-ov\').remove()">Tutup</button>' +
        '<button class="sb-done ' + (isRup ? 'rup-mode' : '') + '" id="sb-done" onclick="document.getElementById(\'smp-ov\').remove()">✓ Selesai</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(ov);
}

function _smpLog(msg, pct, warna) {
  var f = document.getElementById('sb-fill');
  var l = document.getElementById('sb-log');
  if (f) { f.style.width = pct + '%'; f.style.background = warna; }
  if (l) l.textContent = msg;
}

function _smpDone(ok, dibuat, lewat, gagal) {
  var c     = document.getElementById('sb-cancel');
  var d     = document.getElementById('sb-done');
  var cards = document.getElementById('sb-cards');
  if (c) c.style.display = 'none';
  if (d) d.style.display = 'inline-block';
  if (ok && cards) {
    var el1 = document.getElementById('sb-d');
    var el2 = document.getElementById('sb-l');
    var el3 = document.getElementById('sb-g');
    if (el1) el1.textContent = dibuat || 0;
    if (el2) el2.textContent = lewat  || 0;
    if (el3) el3.textContent = gagal  || 0;
    cards.classList.add('show');
  }
}
