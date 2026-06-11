// ============================================================
//  SI-DEVA — Dashboard Charts (Fix duplikasi deklarasi)
// ============================================================
// Pastikan semua chart global hanya dideklarasikan sekali
if (!window.chartBidangPie) window.chartBidangPie = null;
if (!window.chartMonthlyBar) window.chartMonthlyBar = null;
if (!window.chartPenyediaBar) window.chartPenyediaBar = null;
if (!window.chartStatusDoughnut) window.chartStatusDoughnut = null;

function renderCharts(paketData, rincianData, hargaData) {
  // Hancurkan chart yang sudah ada (jika ada)
  if (window.chartBidangPie) window.chartBidangPie.destroy();
  if (window.chartMonthlyBar) window.chartMonthlyBar.destroy();
  if (window.chartPenyediaBar) window.chartPenyediaBar.destroy();
  if (window.chartStatusDoughnut) window.chartStatusDoughnut.destroy();

  // --- Chart Bidang Pie (Top 5 Bidang berdasarkan pagu) ---
  const bidangMap = {};
  paketData.forEach(p => {
    const b = p.bidang || 'Tidak Diketahui';
    if (!bidangMap[b]) bidangMap[b] = 0;
    bidangMap[b] += Number(p.paguAnggaran) || 0;
  });
  const sortedBidang = Object.entries(bidangMap).sort((a,b) => b[1] - a[1]).slice(0,5);
  const ctx1 = document.getElementById('chart-bidang-pie');
  if (ctx1 && sortedBidang.length) {
    window.chartBidangPie = new Chart(ctx1, {
      type: 'pie',
      data: { labels: sortedBidang.map(([b]) => b), datasets: [{ data: sortedBidang.map(([,v]) => v), backgroundColor: ['#3b82f6','#f59e0b','#10b981','#ef4444','#8b5cf6'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmtRp(ctx.raw)}` } } } }
    });
  }

  // --- Chart Monthly Bar (paket per bulan) ---
  const bulan = Array(12).fill(0);
  paketData.forEach(p => {
    if (p.tanggalPesanan) {
      const m = new Date(p.tanggalPesanan).getMonth();
      bulan[m]++;
    }
  });
  const ctx2 = document.getElementById('chart-monthly-bar');
  if (ctx2) {
    window.chartMonthlyBar = new Chart(ctx2, {
      type: 'bar',
      data: { labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'], datasets: [{ label: 'Jumlah Paket', data: bulan, backgroundColor: '#3b82f6' }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }

  // --- Chart Penyedia Bar (Top 5 penyedia berdasarkan nilai kontrak) ---
  const penyediaMap = {};
  const terpilihSet = new Set();
  const rupList = [...new Set(hargaData.map(h => h.rup).filter(Boolean))];
  rupList.forEach(rup => {
    const hargaRup = hargaData.filter(h => String(h.rup) === String(rup));
    if (!hargaRup.length) return;
    const totalsMap = {};
    hargaRup.forEach(h => { if (h.namaPenyedia) totalsMap[h.namaPenyedia] = (totalsMap[h.namaPenyedia] || 0) + (Number(h.negoFinal) || Number(h.hargaTayang) || 0) * (Number(h.qty) || 1); });
    const entries = Object.entries(totalsMap).filter(e => e[1] > 0);
    if (entries.length) terpilihSet.add(entries.reduce((a,b) => a[1] <= b[1] ? a : b)[0]);
  });
  terpilihSet.forEach(p => { penyediaMap[p] = 0; });
  hargaData.forEach(h => { if (terpilihSet.has(h.namaPenyedia)) penyediaMap[h.namaPenyedia] += (Number(h.negoFinal) || Number(h.hargaTayang) || 0) * (Number(h.qty) || 1); });
  const sortedPenyedia = Object.entries(penyediaMap).sort((a,b) => b[1] - a[1]).slice(0,5);
  const ctx3 = document.getElementById('chart-penyedia-bar');
  if (ctx3 && sortedPenyedia.length) {
    window.chartPenyediaBar = new Chart(ctx3, {
      type: 'bar',
      data: { labels: sortedPenyedia.map(([p]) => p), datasets: [{ label: 'Total Kontrak', data: sortedPenyedia.map(([,v]) => v), backgroundColor: '#f59e0b' }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: v => fmtRp(v) } } }, plugins: { tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtRp(ctx.raw)}` } } } }
    });
  }

  // --- Chart Status Doughnut (Status Katalog) ---
  const statusMap = { Aktif: 0, 'Turun Tayang': 0, Lainnya: 0 };
  hargaData.forEach(h => { const s = h.statusKatalog || 'Lainnya'; if (s === 'Aktif') statusMap.Aktif++; else if (s === 'Turun Tayang') statusMap['Turun Tayang']++; else statusMap.Lainnya++; });
  const ctx4 = document.getElementById('chart-status-doughnut');
  if (ctx4) {
    window.chartStatusDoughnut = new Chart(ctx4, {
      type: 'doughnut',
      data: { labels: Object.keys(statusMap), datasets: [{ data: Object.values(statusMap), backgroundColor: ['#10b981','#f97316','#6b7280'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }
}
