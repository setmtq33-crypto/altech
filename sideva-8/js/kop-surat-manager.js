// ============================================================
//  SI-DEVA — Kop Surat & Logo Manager v8.0 (Final Clean)
// ============================================================

const STORAGE_BUCKET = 'sideva-assets';

async function _getOpdId() {
  return window._currentOpdId || localStorage.getItem('sideva_current_opd_id') || null;
}

async function _uploadToStorage(file, path) {
  const token = await _getAccessToken();
  if (!token) throw new Error('Belum login');

  const url = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': file.type,
      'x-upsert': 'true'
    },
    body: file
  });

  if (!res.ok) throw new Error('Upload gagal: ' + res.status);
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

async function _getAccessToken() {
  const session = JSON.parse(localStorage.getItem('sideva_session_v3') || '{}');
  return session.access_token || null;
}

// ================== KOP SURAT ==================
window.kopSurat = async function() {
  const opdId = await _getOpdId();
  if (!opdId) return _fallbackKop();

  // Coba ambil dari Supabase dulu
  let kopUrl = null;
  try {
    const cfg = await getOpdConfig(opdId);
    kopUrl = cfg?._kopSuratImg;
  } catch(e) {}

  // Fallback localStorage
  if (!kopUrl) kopUrl = localStorage.getItem('sideva_kop_surat_img');

  if (kopUrl) {
    return `<div style="margin-bottom:16px;text-align:center;">
      <img src="${kopUrl}" style="max-width:100%; max-height:180px; object-fit:contain; border-bottom:3px double #000; padding-bottom:8px;">
    </div>`;
  }

  return _fallbackKop();
};

function _fallbackKop() {
  const cfg = window.appConfig || {};
  const namaPem = ('PEMERINTAH ' + (cfg.kabupaten || '')).toUpperCase();
  const namaInst = (cfg.namaInstansi || 'INSTANSI PEMERINTAH').toUpperCase();

  return `<div style="margin-bottom:16px;text-align:center;border-bottom:3px double #000;padding-bottom:8px;">
    <strong style="font-size:16px;">${namaPem}</strong><br>
    <strong style="font-size:18px;">${namaInst}</strong><br>
    <span style="font-size:12px;">${cfg.alamat || ''} ${cfg.telepon ? '• Telp. ' + cfg.telepon : ''}</span>
  </div>`;
}

// ================== LOGO ==================
window.getLogoUrl = async function() {
  const opdId = await _getOpdId();
  if (!opdId) return null;

  try {
    const cfg = await getOpdConfig(opdId);
    return cfg?._logoInstansi || localStorage.getItem('sideva_logo_instansi');
  } catch(e) {
    return localStorage.getItem('sideva_logo_instansi');
  }
};

// ================== UPLOAD HANDLER ==================
window.processKopFile = async function(file) {
  if (!file.type.startsWith('image/')) return toast('File harus gambar!', 'error');
  if (file.size > 5 * 1024 * 1024) return toast('Ukuran maksimal 5MB!', 'error');

  const opdId = await _getOpdId();
  if (!opdId) return toast('Pilih OPD terlebih dahulu', 'error');

  try {
    const ext = file.name.split('.').pop();
    const path = `kop/kop_${opdId}.${ext}`;
    const publicUrl = await _uploadToStorage(file, path);

    await saveOpdConfig(opdId, { _kopSuratImg: publicUrl });
    localStorage.setItem('sideva_kop_surat_img', publicUrl);

    await refreshKopPreviewArea();
    toast('✅ Kop surat berhasil diupload!', 'success');
  } catch(err) {
    console.error(err);
    toast('Gagal upload kop: ' + err.message, 'error');
  }
};

window.processLogo = async function(file) {
  if (!file.type.startsWith('image/')) return toast('File harus gambar!', 'error');

  const opdId = await _getOpdId();
  if (!opdId) return toast('Pilih OPD terlebih dahulu', 'error');

  try {
    const ext = file.name.split('.').pop();
    const path = `logo/logo_${opdId}.${ext}`;
    const publicUrl = await _uploadToStorage(file, path);

    await saveOpdConfig(opdId, { _logoInstansi: publicUrl });
    localStorage.setItem('sideva_logo_instansi', publicUrl);

    toast('✅ Logo berhasil diupload!', 'success');
    // Refresh preview jika ada
    const preview = document.getElementById('logo-img-preview');
    if (preview) preview.src = publicUrl;
  } catch(err) {
    toast('Gagal upload logo: ' + err.message, 'error');
  }
};

// ================== PREVIEW REFRESH ==================
window.refreshKopPreviewArea = async function() {
  const area = document.getElementById('kop-preview-area');
  if (!area) return;
  area.innerHTML = await window.kopSurat();

  const lbl = document.getElementById('kop-preview-label-text');
  if (lbl) {
    const hasImg = localStorage.getItem('sideva_kop_surat_img') || (await getOpdConfig(await _getOpdId()))?._kopSuratImg;
    lbl.textContent = hasImg ? '✅ Menggunakan gambar kop surat' : '📝 Menggunakan teks fallback';
  }
};

// ================== INIT ==================
window.initKopSuratSystem = function() {
  window.refreshKopPreviewArea();
  setTimeout(window.refreshKopPreviewArea, 800);
};

// Auto init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initKopSuratSystem);
} else {
  window.initKopSuratSystem();
}