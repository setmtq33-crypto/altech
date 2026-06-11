// ============================================================
//  SI-DEVA — Telegram Notification Module v8
//  File: js/telegram-notify.js
//
//  Kirim notifikasi ke admin via Telegram Bot API
//  saat operator input data Paket atau Rincian Belanja.
//
//  Pasang di index.html SETELAH supabase-db.js:
//    <script src="js/telegram-notify.js"></script>
// ============================================================

// ── Storage key untuk konfigurasi Telegram ────────────────────
if (!window.TELEGRAM_CONFIG_KEY) window.TELEGRAM_CONFIG_KEY = 'sideva_telegram_cfg';
var TELEGRAM_CONFIG_KEY = window.TELEGRAM_CONFIG_KEY;

// ── State lokal ───────────────────────────────────────────────
if (!window._tgConfig) window._tgConfig = {
  botToken:  '',
  chatId:    '',
  aktif:     false,
};
var _tgConfig = window._tgConfig;

// ── Load konfigurasi dari localStorage ───────────────────────
function tgLoadConfig() {
  try {
    const saved = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (saved) _tgConfig = { ..._tgConfig, ...JSON.parse(saved) };
  } catch(e) { /* pakai default */ }
}

// ── Simpan konfigurasi ke localStorage ───────────────────────
function tgSaveConfig(cfg) {
  _tgConfig = { ..._tgConfig, ...cfg };
  localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(_tgConfig));
}

// ── Ambil konfigurasi ─────────────────────────────────────────
function tgGetConfig() {
  return { ..._tgConfig };
}

// ── Format angka Rupiah ───────────────────────────────────────
function _rupiah(num) {
  if (!num && num !== 0) return '-';
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

// ── Validasi Chat ID ──────────────────────────────────────────
// Mendeteksi apakah Chat ID kemungkinan adalah ID bot itu sendiri
// Bot token formatnya: <botId>:<secret>, jadi botId = angka sebelum ':'
function _isChatIdMiripBotId(botToken, chatId) {
  if (!botToken || !chatId) return false;
  const botIdPart = botToken.split(':')[0];
  return String(chatId).trim() === String(botIdPart).trim();
}

// ── Terjemahkan error Telegram ke pesan ramah ────────────────
function _terjemahkanError(description) {
  if (!description) return 'Terjadi kesalahan tidak diketahui.';

  const desc = description.toLowerCase();

  if (desc.includes("can't send messages to the bot") || desc.includes('forbidden')) {
    return [
      '❌ <b>Chat ID salah atau bot belum disapa.</b>',
      '',
      '<b>Kemungkinan penyebab:</b>',
      '1. Chat ID yang dimasukkan adalah ID bot itu sendiri (bukan ID akun Anda).',
      '2. Anda belum pernah mengirim pesan ke bot ini.',
      '',
      '<b>Cara memperbaiki:</b>',
      '• Buka Telegram → cari <b>@userinfobot</b> → kirim /start → salin ID yang muncul.',
      '• Pastikan Anda sudah kirim /start ke bot Anda di Telegram.',
      '• Tempel Chat ID tersebut di kolom "Chat ID Admin".',
    ].join('\n');
  }

  if (desc.includes('chat not found')) {
    return [
      '❌ <b>Chat tidak ditemukan.</b>',
      '',
      'Chat ID yang dimasukkan tidak valid atau tidak dikenali oleh bot.',
      '',
      '<b>Cara memperbaiki:</b>',
      '• Buka Telegram → cari <b>@userinfobot</b> → kirim /start → salin ID yang muncul.',
      '• Pastikan tidak ada spasi atau karakter tambahan pada Chat ID.',
    ].join('\n');
  }

  if (desc.includes('unauthorized') || desc.includes('token')) {
    return [
      '❌ <b>Bot Token tidak valid.</b>',
      '',
      'Token bot salah atau sudah kadaluarsa.',
      '',
      '<b>Cara memperbaiki:</b>',
      '• Buka Telegram → cari <b>@BotFather</b> → /mybots → pilih bot → API Token.',
      '• Salin token terbaru dan tempelkan di kolom Bot Token.',
    ].join('\n');
  }

  if (desc.includes('blocked')) {
    return [
      '❌ <b>Bot diblokir oleh pengguna.</b>',
      '',
      'Akun Telegram Anda memblokir bot ini.',
      '',
      '<b>Cara memperbaiki:</b>',
      '• Buka Telegram → cari bot Anda → klik "Unblock" / "Buka blokir".',
    ].join('\n');
  }

  return `❌ <b>Gagal:</b> ${description}`;
}

// ── Kirim pesan ke Telegram ───────────────────────────────────
async function tgSendMessage(text) {
  const { botToken, chatId, aktif } = _tgConfig;
  if (!aktif || !botToken || !chatId) return false;

  // Peringatan dini jika Chat ID terlihat seperti Bot ID
  if (_isChatIdMiripBotId(botToken, chatId)) {
    console.warn('[SIDEVA Telegram] Peringatan: Chat ID tampaknya sama dengan ID bot. Bot tidak bisa mengirim pesan ke dirinya sendiri. Gunakan Chat ID akun Telegram Anda dari @userinfobot.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    chatId,
        text:       text,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn('[SIDEVA Telegram] Gagal kirim:', data.description);
      return false;
    }
    return true;
  } catch(err) {
    console.warn('[SIDEVA Telegram] Error:', err.message);
    return false;
  }
}

// ── Notifikasi: Data Paket baru / diperbarui ──────────────────
async function tgNotifPaket(data, jenis = 'baru') {
  const operator = (typeof getCurrentUser === 'function')
    ? (getCurrentUser()?.email || 'Operator') : 'Operator';
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const label = jenis === 'baru' ? '➕ <b>DATA PAKET BARU</b>' : '✏️ <b>DATA PAKET DIPERBARUI</b>';

  const pesan = [
    `${label}`,
    ``,
    `📋 <b>Nama Paket:</b> ${data.namaPaket || '-'}`,
    `🔢 <b>No. Paket:</b> ${data.noPaket || '-'}`,
    `📌 <b>RUP:</b> ${data.rup || '-'}`,
    `🏛️ <b>OPD:</b> ${data.opd || '-'}`,
    `📁 <b>Bidang:</b> ${data.bidang || '-'}`,
    `💰 <b>Pagu Anggaran:</b> ${_rupiah(data.paguAnggaran)}`,
    `⏱️ <b>Masa Kerja:</b> ${data.masaKerja || '-'}`,
    ``,
    `👤 <b>Diinput oleh:</b> ${operator}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Notifikasi: Rincian Belanja baru / diperbarui ─────────────
async function tgNotifRincian(data, jenis = 'baru') {
  const operator = (typeof getCurrentUser === 'function')
    ? (getCurrentUser()?.email || 'Operator') : 'Operator';
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const label = jenis === 'baru' ? '➕ <b>RINCIAN BELANJA BARU</b>' : '✏️ <b>RINCIAN BELANJA DIPERBARUI</b>';

  const pesan = [
    `${label}`,
    ``,
    `📦 <b>Item Barang:</b> ${data.itemBarang || '-'}`,
    `🔢 <b>RUP Terkait:</b> ${data.rup || '-'}`,
    `📏 <b>Volume:</b> ${data.vol ? `${data.vol} ${data.satuan || ''}` : '-'}`,
    `💵 <b>Harga Satuan:</b> ${_rupiah(data.hargaSatuan)}`,
    `💰 <b>Jumlah:</b> ${_rupiah(data.jumlah)}`,
    ``,
    `👤 <b>Diinput oleh:</b> ${operator}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Test koneksi Telegram ─────────────────────────────────────
async function tgTestKoneksi(botToken, chatId) {

  // Validasi input kosong
  if (!botToken || !botToken.trim()) {
    return { ok: false, desc: '❌ <b>Bot Token belum diisi.</b>\n\nDapatkan token dari @BotFather di Telegram.' };
  }
  if (!chatId || !chatId.trim()) {
    return { ok: false, desc: '❌ <b>Chat ID Admin belum diisi.</b>\n\nDapatkan Chat ID Anda dari @userinfobot di Telegram.' };
  }

  // Validasi format token (harus mengandung ':')
  if (!botToken.includes(':')) {
    return { ok: false, desc: '❌ <b>Format Bot Token tidak valid.</b>\n\nToken harus dalam format: <code>123456789:ABCdef...</code>\nDapatkan token dari @BotFather.' };
  }

  // Peringatan dini: Chat ID = Bot ID
  if (_isChatIdMiripBotId(botToken, chatId)) {
    return {
      ok: false,
      desc: [
        '❌ <b>Chat ID tidak valid — terdeteksi sebagai ID bot itu sendiri.</b>',
        '',
        'Bot tidak bisa mengirim pesan ke dirinya sendiri.',
        '',
        '<b>Cara mendapatkan Chat ID yang benar:</b>',
        '1. Buka Telegram → cari <b>@userinfobot</b>',
        '2. Kirim /start',
        '3. Salin angka ID yang muncul',
        '4. Tempelkan di kolom "Chat ID Admin"',
        '',
        'Pastikan juga Anda sudah kirim /start ke bot Anda.',
      ].join('\n'),
    };
  }

  const pesan = [
    `✅ <b>Koneksi Telegram SI-DEVA Berhasil!</b>`,
    ``,
    `Bot ini telah terhubung dengan sistem SI-DEVA.`,
    `Notifikasi akan dikirim ke chat ini setiap kali`,
    `operator menginput data Paket atau Rincian Belanja.`,
    ``,
    `<i>— Test notifikasi SI-DEVA</i>`,
  ].join('\n');

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: pesan, parse_mode: 'HTML' }),
    });
    const data = await res.json();

    if (!data.ok) {
      return { ok: false, desc: _terjemahkanError(data.description) };
    }

    return { ok: true, desc: '✅ <b>Pesan test berhasil dikirim!</b>\nCek Telegram Anda.' };
  } catch(err) {
    return { ok: false, desc: `❌ <b>Gagal terhubung ke Telegram.</b>\n\nPastikan koneksi internet aktif.\nDetail: ${err.message}` };
  }
}

// ── Notifikasi: User Login ───────────────────────────────────
async function tgNotifLogin(user) {
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const pesan = [
    `✅ <b>USER LOGIN</b>`,
    ``,
    `👤 <b>Email:</b> ${user?.email || '-'}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Notifikasi: User Logout ──────────────────────────────────
async function tgNotifLogout(user) {
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const pesan = [
    `🚪 <b>USER LOGOUT</b>`,
    ``,
    `👤 <b>Email:</b> ${user?.email || '-'}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Notifikasi: Print Dokumen ────────────────────────────────
async function tgNotifPrintDok(docName, docType) {
  const operator = (typeof getCurrentUser === 'function')
    ? (getCurrentUser()?.email || 'Operator') : 'Operator';
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const pesan = [
    `🖨️ <b>PRINT DOKUMEN</b>`,
    ``,
    `📄 <b>Dokumen:</b> ${docName || '-'}`,
    `📋 <b>Tipe:</b> ${docType || '-'}`,
    `👤 <b>Diakses oleh:</b> ${operator}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Notifikasi: Buka Laporan Realisasi ───────────────────────
async function tgNotifLaporanRealisasi(info) {
  const operator = (typeof getCurrentUser === 'function')
    ? (getCurrentUser()?.email || 'Operator') : 'Operator';
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const pesan = [
    `📊 <b>BUKA LAPORAN REALISASI</b>`,
    ``,
    `📌 <b>Info:</b> ${info || 'Laporan Realisasi'}`,
    `👤 <b>Diakses oleh:</b> ${operator}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Notifikasi: Rekap Bidang ─────────────────────────────────
async function tgNotifRekapBidang(bidang) {
  const operator = (typeof getCurrentUser === 'function')
    ? (getCurrentUser()?.email || 'Operator') : 'Operator';
  const waktu = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const pesan = [
    `📈 <b>BUKA REKAP BIDANG</b>`,
    ``,
    `🏢 <b>Bidang:</b> ${bidang || 'All'}`,
    `👤 <b>Diakses oleh:</b> ${operator}`,
    `🕐 <b>Waktu:</b> ${waktu}`,
    ``,
    `<i>— Notifikasi otomatis SI-DEVA</i>`,
  ].join('\n');

  return tgSendMessage(pesan);
}

// ── Hook untuk login/logout ──────────────────────────────────
function _tgHookAuth() {
  // Hook ke event login
  window.addEventListener('sideva:user-login', (e) => {
    const user = e?.detail?.user;
    if (user && _tgConfig.aktif) tgNotifLogin(user);
  });

  // Hook ke event logout
  window.addEventListener('sideva:user-logout', (e) => {
    const user = e?.detail?.user;
    if (user && _tgConfig.aktif) tgNotifLogout(user);
  });

  // Hook ke print dokumen
  window.addEventListener('sideva:print-document', (e) => {
    const { docName, docType } = e?.detail || {};
    if (_tgConfig.aktif) tgNotifPrintDok(docName, docType);
  });

  // Hook ke laporan realisasi
  window.addEventListener('sideva:open-laporan-realisasi', (e) => {
    const info = e?.detail?.info || 'Laporan Realisasi';
    if (_tgConfig.aktif) tgNotifLaporanRealisasi(info);
  });

  // Hook ke rekap bidang
  window.addEventListener('sideva:open-rekap-bidang', (e) => {
    const bidang = e?.detail?.bidang || 'All';
    if (_tgConfig.aktif) tgNotifRekapBidang(bidang);
  });
}

// ── Hook ke dbPut untuk paket dan rincian ────────────────────
function _tgHookDbPut() {
  const _origDbPut = window.dbPut;
  if (typeof _origDbPut !== 'function') return;
  window.dbPut = async function(store, data) {
    let result;
    try {
      result = await _origDbPut.apply(this, arguments);
    } catch(err) {
      throw err;
    }
    const isNew = !data.id;
    try {
      if (!_tgConfig.aktif) return result;
      if (store === 'paket' && isNew) tgNotifPaket(result||data, 'baru');
      if (store === 'paket' && !isNew) tgNotifPaket(result||data, 'update');
      if (store === 'rincian' && isNew) tgNotifRincian(result||data, 'baru');
      if (store === 'rincian' && !isNew) tgNotifRincian(result||data, 'update');
    } catch(_) {}
    return result;
  };
}

// ── Init: load config & hook saat app siap ──────────────────
if (!window._tgInitRegistered) {
  window._tgInitRegistered = true;
  document.addEventListener('DOMContentLoaded', () => {
    tgLoadConfig();
    _tgHookAuth();
  });
  // Hook dbPut saat supabase-db siap
  window.addEventListener('sb-ready', () => {
    _tgHookDbPut();
  });
}
