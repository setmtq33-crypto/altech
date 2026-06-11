// ============================================================
// SI-DEVA — Supabase Database Layer v8.1 (nama_opd patch)
// ============================================================

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

window.TABLE_MAP = {
  paket: 'paket', rincian: 'rincian', harga: 'harga', penyedia: 'penyedia',
  bidang: 'bidang', opd: 'opd', rekening: 'rekening', ppk: 'ppk',
  pejabatPengadaan: 'pejabat_pengadaan', ecatalog: 'ecatalog'
};

window.FIELD_MAP = {
  paket: {
    to: r => ({ no_paket: r.noPaket, opd: r.opd, rup: r.rup, nama_paket: r.namaPaket, program: r.program, kegiatan: r.kegiatan, sub_kegiatan: r.subKegiatan, masa_kerja: r.masaKerja, durasi: r.durasi||null, tanggal_pesanan: r.tanggalPesanan||null, tanggal_selesai: r.tanggalSelesai||null, pagu_anggaran: r.paguAnggaran||null, kode_rekening: r.kodeRekening, bidang: r.bidang, kepala_bidang: r.kepalaBidang, nip: r.nip, tanggal_dpp: r.tanggalDPP||null, output: r.output, opd_id: r.opd_id || r.opdId || null }),
    from: r => ({ id: r.id, noPaket: r.no_paket, opd: r.opd, rup: r.rup, namaPaket: r.nama_paket, program: r.program, kegiatan: r.kegiatan, subKegiatan: r.sub_kegiatan, masaKerja: r.masa_kerja, durasi: r.durasi, tanggalPesanan: r.tanggal_pesanan, tanggalSelesai: r.tanggal_selesai, paguAnggaran: r.pagu_anggaran, kodeRekening: r.kode_rekening, bidang: r.bidang, kepalaBidang: r.kepala_bidang, nip: r.nip, tanggalDPP: r.tanggal_dpp, output: r.output, opd_id: r.opd_id, opdId: r.opd_id }),
  },
  rincian: {
    to: r => ({ no: r.no, rup: r.rup, user_input: r.user, item_barang: r.itemBarang, vol: r.vol||null, satuan: r.satuan, harga_satuan: r.hargaSatuan||null, jumlah: r.jumlah||null, opd_id: r.opd_id || r.opdId || null }),
    from: r => ({ id: r.id, no: r.no, rup: r.rup, user: r.user_input, itemBarang: r.item_barang, vol: r.vol, satuan: r.satuan, hargaSatuan: r.harga_satuan, jumlah: r.jumlah, tanggalInput: r.tanggal_input, opd_id: r.opd_id, opdId: r.opd_id }),
  },
  harga: {
    to: r => ({ rup: r.rup, hps: r.hps||null, nama_paket: r.namaPaket, nama_item: r.namaItem, nama_produk: r.namaProduk, nama_penyedia: r.namaPenyedia, link_katalog: r.linkKatalog, qty: r.qty||null, satuan: r.satuan, harga_tayang: r.hargaTayang||null, status_pajak: r.statusPajak, dpp: r.dpp||null, ppn: r.ppn||null, ongkir: r.ongkir||null, total_harga: r.totalHarga||null, pdn: r.pdn, umkm: r.umkm, lokasi: r.lokasi, status_katalog: r.statusKatalog, nego_final: r.negoFinal||null, opd_id: r.opd_id || r.opdId || null, parent_rincian_id: r.parentRincianId||null, pembanding_ke: r.pembandingKe||null }),
    from: r => ({ id: r.id, rup: r.rup, hps: r.hps, namaPaket: r.nama_paket, namaItem: r.nama_item, namaProduk: r.nama_produk, namaPenyedia: r.nama_penyedia, linkKatalog: r.link_katalog, qty: r.qty, satuan: r.satuan, hargaTayang: r.harga_tayang, statusPajak: r.status_pajak, dpp: r.dpp, ppn: r.ppn, ongkir: r.ongkir, totalHarga: r.total_harga, pdn: r.pdn, umkm: r.umkm, lokasi: r.lokasi, statusKatalog: r.status_katalog, negoFinal: r.nego_final, opd_id: r.opd_id, opdId: r.opd_id, parentRincianId: r.parent_rincian_id||null, pembandingKe: r.pembanding_ke||null }),
  },
  penyedia: {
    to: r => ({ no: r.no, nama_penyedia: r.namaPenyedia, alamat: r.alamat, bentuk_usaha: r.bentukUsaha, status: r.status, tipe: r.tipe, link_toko: r.linkToko, opd_id: r.opd_id || r.opdId || null }),
    from: r => ({ id: r.id, no: r.no, namaPenyedia: r.nama_penyedia, alamat: r.alamat, bentukUsaha: r.bentuk_usaha, status: r.status, tipe: r.tipe, linkToko: r.link_toko, opd_id: r.opd_id, opdId: r.opd_id }),
  },
  bidang: { to: r => ({ nama_bidang: r.namaBidang, kode_surat: r.kodeSurat, kepala_bidang: r.kepalaBidang, nip: r.nip, opd_id: r.opd_id || r.opdId || null }), from: r => ({ id: r.id, namaBidang: r.nama_bidang, kodeSurat: r.kode_surat, kepalaBidang: r.kepala_bidang, nip: r.nip, opd_id: r.opd_id, opdId: r.opd_id }) },
  opd: { to: r => ({ nama_opd: r.namaOpd }), from: r => ({ id: r.id, nama: r.nama_opd, namaOpd: r.nama_opd }) },
  rekening: { to: r => ({ kode_rekening: r.kodeRekening, link_ecatalog: r.linkKatalog || r.linkEcatalog, opd_id: r.opd_id || r.opdId || null }), from: r => ({ id: r.id, kodeRekening: r.kode_rekening, linkEcatalog: r.link_ecatalog, linkKatalog: r.link_ecatalog, opd_id: r.opd_id, opdId: r.opd_id }) },
  ppk: { to: r => ({ nama_ppk: r.namaPPK || r.nama, nip: r.nip, jabatan: r.jabatan, scan_ttd: r.scanTTD || r.ttd || null, lebar_ttd: r.lebarTTD || r.ttdSizeW || null, tinggi_ttd: r.tinggiTTD || r.ttdSizeH || null, cap_stempel: r.capStempel || r.cap || null, lebar_cap: r.lebarCap || r.capSizeW || null, tinggi_cap: r.tinggiCap || r.capSizeH || null, opd_id: r.opd_id || r.opdId || null }), from: r => ({ id: r.id, nama: r.nama_ppk, namaPPK: r.nama_ppk, nip: r.nip, jabatan: r.jabatan, ttd: r.scan_ttd, cap: r.cap_stempel, ttdSizeW: r.lebar_ttd, ttdSizeH: r.tinggi_ttd, capSizeW: r.lebar_cap, capSizeH: r.tinggi_cap, opd_id: r.opd_id, opdId: r.opd_id }) },
  pejabatPengadaan: { to: r => ({ nama_pejabat: r.namaPejabat || r.nama, nip: r.nip, jabatan: r.jabatan, opd_id: r.opd_id || r.opdId || null }), from: r => ({ id: r.id, nama: r.nama_pejabat, namaPejabat: r.nama_pejabat, nip: r.nip, jabatan: r.jabatan, opd_id: r.opd_id, opdId: r.opd_id }) },
  ecatalog: { to: r => ({ jenis_belanja: r.jenisBelanja || r.jenisBlanja, link_ecatalog: r.linkEcatalog, opd_id: r.opd_id || r.opdId || null }), from: r => ({ id: r.id, jenisBelanja: r.jenis_belanja, linkEcatalog: r.link_ecatalog, opd_id: r.opd_id, opdId: r.opd_id }) },
};

let _session = null;
let _userRole = null;
let _pollTimer = null;
window._userOpdName = null;

async function sbFetch(path, method = 'GET', body = null, extra = {}, retries = 2) {
  const token = _session?.access_token;
  const headers = { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json',...(token? { 'Authorization': 'Bearer ' + token } : {}),...extra };
  if (method === 'POST' && path.startsWith('/rest/')) headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
  else if (method!== 'GET' && path.startsWith('/rest/')) headers['Prefer'] = 'return=representation';
  let url = SUPABASE_URL + path;
  if (!path.includes('apikey=')) url += (path.includes('?')? '&' : '?') + 'apikey=' + encodeURIComponent(SUPABASE_ANON_KEY);
  const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { method, headers,...(body? { body: JSON.stringify(body) } : {}), signal: controller.signal });
    clearTimeout(timeoutId); const text = await res.text(); const json = text? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`); return json;
  } catch(err) { clearTimeout(timeoutId); if (retries > 0) { await new Promise(r => setTimeout(r, 1000)); return sbFetch(path, method, body, extra, retries - 1); } throw err; }
}

if (window._supa) {
  window._supa.auth.onAuthStateChange((event, session) => {
    console.log("Auth Event:", event);
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      // Pastikan semua data global dibersihkan saat event logout terdeteksi
      window._userData = null;
      window._userRole = null;
      window._userOpd = null;
      return;
    }
    if (session) {
      window._userData = session.user;
      // Lanjutkan logika login...
    }
  });
}


async function sbLogin(email, password) { const data = await sbFetch('/auth/v1/token?grant_type=password', 'POST', { email, password }); _session = data; localStorage.setItem('sideva_session_v3', JSON.stringify(data)); await _loadRole(); window.dispatchEvent(new CustomEvent('sideva:user-login', { detail: { user: { email } } })); return data; }
async function sbRegister(email, password) { return sbFetch('/auth/v1/signup', 'POST', { email, password }); }
async function sbLogout() {
  const session = _session;
  _session = null;
  _userRole = null;
  window._userOpdName = null;
  window._userData = null;
  window._userRole = null;
  window._userOpd = null;
  localStorage.removeItem('sideva_session_v3');
  if (_pollTimer) {
    clearInterval(_pollTimer);
    _pollTimer = null;
  }
  window.dispatchEvent(new CustomEvent('sideva:user-logout'));

  try {
    if (session?.access_token) {
      await sbFetch(
        '/auth/v1/logout',
        'POST',
        null,
        { Authorization: 'Bearer ' + session.access_token },
        0
      );
    }
  } catch(_) {}
}
async function sbRefreshToken() { if (!_session?.refresh_token) return false; try { const data = await sbFetch('/auth/v1/token?grant_type=refresh_token', 'POST', { refresh_token: _session.refresh_token }); _session = data; localStorage.setItem('sideva_session_v3', JSON.stringify(data)); return true; } catch(_) { return false; } }
async function sbRestoreSession() { const saved = localStorage.getItem('sideva_session_v3'); if (!saved) return false; try { _session = JSON.parse(saved); const ok = await sbRefreshToken(); if (!ok) { _session = null; return false; } await _loadRole(); return true; } catch(_) { return false; } }

async function _loadRole() {
  try {
    const rows = await sbFetch(`/rest/v1/user_roles?user_id=eq.${_session.user.id}&select=role,nama_opd`, 'GET');
    _userRole = rows?.[0]?.role || 'viewer';
    window._userOpdName = rows?.[0]?.nama_opd || null;
  } catch(_) { _userRole = 'viewer'; window._userOpdName = null; }
}
function getRole() { return _userRole; }
function isSuperAdmin() { return _userRole === 'super_admin'; }
function isAdmin() { return _userRole === 'admin_opd' || _userRole === 'admin' || _userRole === 'super_admin'; }
function isOperator() { return isAdmin() || _userRole === 'operator'; }
function isLoggedIn() { return!!_session; }
function getCurrentUser() { return _session?.user || null; }

async function dbGetAll(store) { const tbl = TABLE_MAP[store] || store; const fmap = FIELD_MAP[store]; const rows = await sbFetch(`/rest/v1/${tbl}?select=*&order=id.asc`, 'GET'); return fmap? rows.map(fmap.from) : rows; }
async function dbPut(store, data) { const tbl = TABLE_MAP[store] || store, fmap = FIELD_MAP[store]; if (!_session?.access_token) throw new Error('Session expired'); const payload = fmap? fmap.to(data) : {...data }; Object.keys(payload).forEach(k => { if (payload[k] === undefined) delete payload[k]; }); const rows = await sbFetch(`/rest/v1/${tbl}${data.id? '?id=eq.'+data.id : ''}`, data.id? 'PATCH' : 'POST', payload); return fmap? fmap.from(rows[0]) : rows[0]; }
async function dbDelete(store, id) { const tbl = TABLE_MAP[store] || store; await sbFetch(`/rest/v1/${tbl}?id=eq.${id}`, 'DELETE'); }
async function dbClear(store) { if (!isAdmin()) throw new Error('Only admin'); const tbl = TABLE_MAP[store] || store; await sbFetch(`/rest/v1/${tbl}?id=neq.0`, 'DELETE'); }

async function loadAllData() { if (!_session) return; const [paket, rincian, harga, penyedia, bidang, opd, rekening, ppk, pejabat, ecatalog] = await Promise.all([dbGetAll('paket'), dbGetAll('rincian'), dbGetAll('harga'), dbGetAll('penyedia'), dbGetAll('bidang'), dbGetAll('opd'), dbGetAll('rekening'), dbGetAll('ppk'), dbGetAll('pejabatPengadaan'), dbGetAll('ecatalog')]); if (typeof state!== 'undefined') { state.paket.data = paket; state.rincian.data = rincian; state.harga.data = harga; state.penyedia.data = penyedia; state.paket.filtered = [...paket]; } if (typeof masterState!== 'undefined') { masterState.bidang = bidang; masterState.opd = opd; } }
function _startPolling() { if (_pollTimer) clearInterval(_pollTimer); _pollTimer = setInterval(async () => { if (!_session) return; try { await loadAllData(); if (typeof renderAll === 'function') renderAll(); } catch(e) {} }, 60000); }
document.addEventListener('DOMContentLoaded', async () => { const ok = await sbRestoreSession(); if (ok) { await loadAllData(); _startPolling(); } window.dispatchEvent(new CustomEvent('sb-ready', { detail: { loggedIn: ok, role: _userRole } })); });
