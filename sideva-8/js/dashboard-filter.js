// ============================================================
//  SI-DEVA — Filter Dashboard Real-Time v8 (Fixed)
//  File: js/dashboard-filter.js
//
//  PATCH: Tidak lagi menyisipkan elemen baru di atas dashboard.
//  Seluruh logika filter diarahkan ke elemen dash-bottom
//  yang sudah ada di index.html (dash-bot-filter-*, dbs-*, dll.)
// ============================================================

(function () {
  'use strict';

  // ── Mapping ID ke elemen dash-bottom yang sudah ada di HTML ──
  const ID = {
    BIDANG   : 'dash-bot-filter-bidang',
    REKENING : 'dash-bot-filter-rekening',
    COUNT    : 'dash-bot-count',
    PAKET    : 'dbs-paket',
    PAGU     : 'dbs-pagu',
    KONTRAK  : 'dbs-kontrak',
    RINCIAN  : 'dbs-rincian',
    SERAPAN  : 'dbs-serapan',
    EFISIENSI: 'dbs-efisiensi',
    CHART    : 'chart-dash-pagu-kontrak',
  };

  // ── Format rupiah ─────────────────────────────────────────
  const fRp = v => 'Rp ' + Number(v || 0).toLocaleString('id-ID');

  // ── Data terfilter berdasarkan nilai select dash-bottom ───
  function _filteredPaket() {
    const bidang   = (document.getElementById(ID.BIDANG)   || {}).value || '';
    const rekening = (document.getElementById(ID.REKENING) || {}).value || '';
    return state.paket.data.filter(p => {
      const okB = !bidang   || (p.bidang       || '') === bidang;
      const okR = !rekening || (p.kodeRekening || '').startsWith(rekening);
      return okB && okR;
    });
  }

  // ── Isi opsi dropdown di dash-bottom ─────────────────────
  function _populateDropdowns() {
    const selB = document.getElementById(ID.BIDANG);
    const selR = document.getElementById(ID.REKENING);
    if (!selB || !selR) return;

    const bSet = new Set(), rSet = new Set();
    state.paket.data.forEach(p => {
      if (p.bidang)       bSet.add(p.bidang);
      if (p.kodeRekening) rSet.add(p.kodeRekening);
    });

    const curB = selB.value;
    selB.innerHTML = '<option value="">— Semua Bidang —</option>' +
      [...bSet].sort().map(b =>
        `<option value="${b}"${b === curB ? ' selected' : ''}>${b}</option>`
      ).join('');

    const curR = selR.value;
    selR.innerHTML = '<option value="">— Semua Rekening —</option>' +
      [...rSet].sort().map(r =>
        `<option value="${r}"${r === curR ? ' selected' : ''}>${r}</option>`
      ).join('');
  }

  // ── Update stat cards di dash-bottom ─────────────────────
  function _updateCards(pakets) {
    const totalPagu = pakets.reduce((s, p) => s + (Number(p.paguAnggaran) || 0), 0);
    const totalNego = pakets.reduce((s, p) =>
      s + (typeof _hitungNilaiPenetapan === 'function' ? _hitungNilaiPenetapan(p.rup) : 0), 0);
    const rupSet    = new Set(pakets.map(p => String(p.rup)));
    const rincData  = state.rincian.data.filter(r => rupSet.has(String(r.rup)));
    const totalRinc = rincData.reduce((s, r) => s + (Number(r.jumlah) || 0), 0);
    const efisiensi = totalPagu - totalNego;
    const pct       = totalPagu > 0 ? (totalNego / totalPagu * 100) : 0;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText(ID.PAKET,     pakets.length);
    setText(ID.PAGU,      fRp(totalPagu));
    setText(ID.KONTRAK,   fRp(totalNego));
    setText(ID.RINCIAN,   fRp(totalRinc));
    setText(ID.EFISIENSI, (efisiensi >= 0 ? '+' : '') + fRp(efisiensi));
    setText(ID.SERAPAN,   pct.toFixed(1) + '%');

    const sep = document.getElementById(ID.SERAPAN);
    if (sep) sep.style.color = pct > 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : pct > 0 ? '#22c55e' : '#6b7280';

    const ef = document.getElementById(ID.EFISIENSI);
    if (ef) ef.style.color = efisiensi >= 0 ? '#22c55e' : '#ef4444';
  }

  // ── Update chart di dash-bottom (canvas chart-dash-pagu-kontrak) ─
  let _dfChart = null;
  function _updateChart(pakets) {
    const canvas = document.getElementById(ID.CHART);
    if (!canvas || typeof Chart === 'undefined') return;

    const bidMap = {};
    pakets.forEach(p => {
      const b = p.bidang || 'Lainnya';
      if (!bidMap[b]) bidMap[b] = { pagu: 0, nego: 0 };
      bidMap[b].pagu += Number(p.paguAnggaran) || 0;
      bidMap[b].nego += (typeof _hitungNilaiPenetapan === 'function')
        ? _hitungNilaiPenetapan(p.rup)
        : state.harga.data
            .filter(h => String(h.rup) === String(p.rup))
            .reduce((s, h) => s + (Number(h.negoFinal) > 0
              ? Number(h.negoFinal) * Number(h.qty || 1)
              : Number(h.totalHarga) || 0), 0);
    });

    const labels = Object.keys(bidMap);
    const pagu   = labels.map(b => bidMap[b].pagu);
    const nego   = labels.map(b => bidMap[b].nego);

    const _existingDf = Chart.getChart(canvas);
    if (_existingDf) { try { _existingDf.destroy(); } catch(e){} }
    if (_dfChart) { try { _dfChart.destroy(); } catch(e){} _dfChart = null; }
    _dfChart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Pagu Anggaran', data: pagu, backgroundColor: '#6366f180', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 },
          { label: 'Nilai Kontrak', data: nego, backgroundColor: '#22c55e80', borderColor: '#22c55e', borderWidth: 1, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: 'var(--text1)', font: { size: 11 } } },
          tooltip: {
            callbacks: { label: ctx => `${ctx.dataset.label}: ${fRp(ctx.parsed.y)}` },
          },
        },
        scales: {
          x: { ticks: { color: 'var(--text2)', font: { size: 10 } }, grid: { display: false } },
          y: {
            ticks: { color: 'var(--text2)', callback: v => 'Rp ' + (v / 1e6).toFixed(0) + 'jt' },
            grid: { color: 'var(--border)' },
          },
        },
      },
    });
  }

  // ── Refresh semua komponen dash-bottom ────────────────────
  function _refresh() {
    _populateDropdowns();
    const pakets = _filteredPaket();
    _updateCards(pakets);
    _updateChart(pakets);

    const cnt = document.getElementById(ID.COUNT);
    if (cnt) cnt.textContent = pakets.length + ' paket';
  }

  // ── Pasang event listener ke select yang sudah ada di HTML ─
  function _bindListeners() {
    const selB = document.getElementById(ID.BIDANG);
    const selR = document.getElementById(ID.REKENING);

    if (selB && !selB.dataset.dfBound) {
      selB.addEventListener('change', _refresh);
      selB.dataset.dfBound = '1';
    }
    if (selR && !selR.dataset.dfBound) {
      selR.addEventListener('change', _refresh);
      selR.dataset.dfBound = '1';
    }

    // Override fungsi reset agar sinkron
    window.resetDashBottomFilters = function () {
      if (selB) selB.value = '';
      if (selR) selR.value = '';
      _refresh();
    };
  }

  // ── Ekspos fungsi global agar HTML/JS lain bisa memanggil ─
  // CATATAN: renderDashBottom TIDAK di-override — biarkan dashboard.js
  // yang asli menangani pengisian deadline di dash-bottom-section.
  window.applyDashboardFilters = _refresh;
  window.resetDashboardFilters = function () {
    const selB = document.getElementById(ID.BIDANG);
    const selR = document.getElementById(ID.REKENING);
    if (selB) selB.value = '';
    if (selR) selR.value = '';
    _refresh();
  };

  // ── Init ──────────────────────────────────────────────────
  function _init() {
    _bindListeners();
    _refresh();
  }

  window.addEventListener('sideva:page-changed', (e) => {
    if (e?.detail?.page !== 'dashboard') return;
    setTimeout(_init, 400);
  });

  window.addEventListener('sb-ready', function (e) {
    if (e.detail?.loggedIn) setTimeout(_init, 1000);
  });

})();
