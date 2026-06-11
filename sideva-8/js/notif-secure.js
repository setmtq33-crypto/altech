// ============================================
// NOTIFIKASI SECURE – Simpan Token ke Supabase
// ============================================

// Simpan pengaturan Telegram ke Supabase
window.saveTelegramToSupabase = async function() {
  const botToken = document.getElementById('tg-botToken').value;
  const chatId = document.getElementById('tg-chatId').value;
  
  if (!botToken || !chatId) {
    alert('Isi Bot Token dan Chat ID terlebih dahulu');
    return;
  }
  
  // Ambil konfigurasi yang sudah ada
  let existing = window.appConfig || {};
  existing.telegram_bot_token = botToken;
  existing.telegram_chat_id = chatId;
  
  try {
    await sbSaveConfig(existing);
    alert('✅ Pengaturan Telegram berhasil disimpan ke cloud (aman)');
    // Refresh tampilan
    loadAppConfig();
  } catch(err) {
    alert('❌ Gagal menyimpan: ' + err.message);
  }
};

// Simpan pengaturan WhatsApp ke Supabase
window.saveWAToSupabase = async function() {
  const phone = document.getElementById('wa-phone').value;
  const apikey = document.getElementById('wa-apikey').value;
  
  if (!phone || !apikey) {
    alert('Isi nomor WhatsApp dan API Key terlebih dahulu');
    return;
  }
  
  let existing = window.appConfig || {};
  existing.wa_phone = phone;
  existing.wa_apikey = apikey;
  
  try {
    await sbSaveConfig(existing);
    alert('✅ Pengaturan WhatsApp berhasil disimpan ke cloud (aman)');
    loadAppConfig();
  } catch(err) {
    alert('❌ Gagal menyimpan: ' + err.message);
  }
};

// Fungsi untuk memuat token dari Supabase ke global appConfig
// (sudah otomatis dilakukan oleh loadAppConfig, tapi kita panggil ulang)
window.loadNotifTokens = async function() {
  await loadAppConfig();
  // Isi nilai ke form jika ada
  const tgToken = document.getElementById('tg-botToken');
  const tgChat = document.getElementById('tg-chatId');
  const waPhone = document.getElementById('wa-phone');
  const waKey = document.getElementById('wa-apikey');
  
  if (tgToken && window.appConfig.telegram_bot_token) tgToken.value = window.appConfig.telegram_bot_token;
  if (tgChat && window.appConfig.telegram_chat_id) tgChat.value = window.appConfig.telegram_chat_id;
  if (waPhone && window.appConfig.wa_phone) waPhone.value = window.appConfig.wa_phone;
  if (waKey && window.appConfig.wa_apikey) waKey.value = window.appConfig.wa_apikey;
};