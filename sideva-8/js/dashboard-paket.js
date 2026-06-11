// ============================================================
//  SI-DEVA — Data Paket Module
//  Dipisahkan dari dashboard.js
// ============================================================

// ── Filter Paket ──────────────────────────────────────────────
function filterPaket() {
  const q      = document.getElementById('search-paket').value.toLowerCase();
  const rupF   = document.getElementById('filter-rup-paket')?.value || '';
  const bidang = document.getElementById('filter-bidang-paket').value;
  const rek    = document.getElementById('filter-rek-paket').value;
  const tahun  = document.getElementById('filter-tahun-paket')?.value || '';
  state.paket.filtered = state.paket.data.filter(p => {
    const matchQ = !q || (p.namaPaket||'').toLowerCase().includes(q) || String(p.rup||'').includes(q) || (p.opd||'').toLowerCase().includes(q);
    const matchRup = !rupF || String(p.rup) === String(rupF);
    const matchB = !bidang || p.bidang === bidang;
    const matchR = !rek || p.kodeRekening === rek;
    const matchT = !tahun || (p.tanggalPesanan && new Date(p.tanggalPesanan).getFullYear() === parseInt(tahun));
    return matchQ && matchRup && matchB && matchR && matchT;
  });
  state.paket.page = 1;
  renderPaket();
}

// ── Render Paket ──────────────────────────────────────────────
function renderPaket() {
  const s = state.paket;
  const sorted = sortArr(s.filtered, s.sortCol, s.sortDir);
  const total = sorted.length;
  const pages = Math.ceil(total / s.perPage) || 1;
  s.page = Math.min(s.page, pages);
  const slice = sorted.slice((s.page-1)*s.perPage, s.page*s.perPage);

  const tbody = document.getElementById('tbody-paket');
  if (slice.length === 0) {
    tbody.innerHTML = `<td><td colspan="10"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Tidak ada data</div><div class="empty-sub">Tambah paket baru atau ubah filter pencarian</div></div></td></tr>`;
  } else {
    tbody.innerHTML = slice.map((p, i) => {
      const now = new Date();
      const selesai = p.tanggalSelesai ? new Date(p.tanggalSelesai) : null;
      let status = '<span class="badge badge-blue">Berlangsung</span>';
      if (selesai && selesai < now) status = '<span class="badge badge-green">Selesai</span>';
      if (!p.tanggalSelesai) status = '<span class="badge badge-yellow">Menunggu</span>';
      return `<tr>
        <td class="td-mono">${(s.page-1)*s.perPage + i + 1}</td>
        <td style="max-width:200px"><div class="truncate" title="${p.namaPaket}">${p.namaPaket||'-'}</div><div style="font-size:11px;color:var(--text3)">${p.opd ? strTrunc(p.opd,30) : ''}</div></td>
        <td class="td-mono">${p.rup||'-'}</td>
        <td>${bidangBadge(p.bidang)}</td>
        <td class="td-mono" style="text-align:right">${fmtRp(p.paguAnggaran)}</td>
        <td><span style="font-size:12px">${p.durasi||'-'} ${p.masaKerja||''}</span></td>
        <td style="font-size:12px">${fmtDate(p.tanggalPesanan)}</td>
        <td style="font-size:12px">${fmtDate(p.tanggalSelesai)}</td>
        <td>${status}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="editRecord('paket',${p.id})" title="Edit">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteRecord('paket',${p.id},'${(p.namaPaket||'').replace(/'/g,"\\'")}')" title="Hapus">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }
  document.getElementById('info-paket').textContent = `Menampilkan ${slice.length} dari ${total} data`;
  renderPagination('paket', s.page, pages);
}

// ── Goto Page untuk paket ────────────────────────────────────
function gotoPaketPage(page) {
  state.paket.page = page;
  renderPaket();
}

// ── Sort Table untuk paket (dipanggil dari HTML) ─────────────
function sortPaket(col) {
  const s = state.paket;
  if (s.sortCol === col) s.sortDir = s.sortDir === 'asc' ? 'desc' : 'asc';
  else { s.sortCol = col; s.sortDir = 'asc'; }
  s.page = 1;
  filterPaket();
}

// ── Override sortTable untuk paket (jika perlu) ──────────────
// Fungsi sortTable global akan tetap ada, tapi kita arahkan ke sini.

console.log('✅ dashboard-paket.js loaded');