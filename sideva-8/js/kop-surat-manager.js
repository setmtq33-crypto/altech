// ============================================================
//  SI-DEVA — Kop Surat & Logo Manager v8.1 (Fixed Clean)
// ============================================================

const STORAGE_BUCKET = 'sideva-assets';

// ================== HELPERS ==================
async function _getOpdId() {

  if (window._currentOpdId) return window._currentOpdId;

  try {

    const session =

      JSON.parse(localStorage.getItem('sideva_session_v3') || '{}');

    const user = session.user || {};

    const candidates = [

      user.opd_id,

      user.opdId,

      user.user_metadata?.opd_id,

      user.user_metadata?.opdId,

      user.app_metadata?.opd_id,

      user.app_metadata?.opdId,

      localStorage.getItem('sideva_current_opd_id'),

      localStorage.getItem('currentOpdId')

    ];

    for (const v of candidates) {

      if (v) {

        window._currentOpdId = v;

        return v;

      }

    }

    const email = user.email;

    if (!email || typeof sbFetch !== 'function') {

      return null;

    }

    const roleRows = await sbFetch(

      `/rest/v1/user_roles?email=eq.${encodeURIComponent(email)}&select=*`,

      'GET'

    );

    const roleRow = roleRows?.[0];

    const userId =

      roleRow?.user_id ||

      user.id;

    if (!userId) {

      return null;

    }

    const accessRows = await sbFetch(

      `/rest/v1/user_opd_access?user_id=eq.${encodeURIComponent(userId)}&select=*`,

      'GET'

    );

    const access = accessRows?.[0];

    const opdId =

      access?.opd_id ||

      access?.opdId ||

      access?.id_opd;

    if (opdId) {

      window._currentOpdId = opdId;

      localStorage.setItem('sideva_current_opd_id', opdId);

      return opdId;

    }

    return null;

  } catch (err) {

    console.error(err);

    return null;

  }

}

async function _getAccessToken() {
  const session = JSON.parse(localStorage.getItem('sideva_session_v3') || '{}');
  return session.access_token || null;
}

async function _uploadToStorage(file, path) {

  const token = await _getAccessToken();

  if (!token) {

    throw new Error('Session login tidak ditemukan');

  }

  const formData = new FormData();

  formData.append('', file);

  const url =

    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`;

  const res = await fetch(url, {

    method: 'POST',

    headers: {

      apikey: SUPABASE_ANON_KEY,

      Authorization: `Bearer ${token}`,

      'x-upsert': 'true'

    },

    body: file

  });

  if (!res.ok) {

    const errText = await res.text();

    throw new Error(errText || `HTTP ${res.status}`);

  }

  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;

}

// ================== KOP SURAT ==================
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

window.kopSurat = function () {

  const localImg = localStorage.getItem('sideva_kop_surat_img');

  if (localImg) {
    return `<div style="margin-bottom:16px;text-align:center;">
      <img src="${localImg}?t=${Date.now()}"
           style="max-width:100%;max-height:180px;object-fit:contain;border-bottom:3px double #000;padding-bottom:8px;">
    </div>`;
  }

  const cfg = window.appConfig || {};

  const namaPem =
    ('PEMERINTAH ' + (cfg.kabupaten || '')).toUpperCase();

  const namaInst =
    (cfg.namaInstansi || 'INSTANSI PEMERINTAH').toUpperCase();

  return `<div style="margin-bottom:16px;text-align:center;border-bottom:3px double #000;padding-bottom:8px;">
    <strong style="font-size:16px;">${namaPem}</strong><br>
    <strong style="font-size:18px;">${namaInst}</strong><br>
    <span style="font-size:12px;">
      ${cfg.alamat || ''}
      ${cfg.telepon ? '• Telp. ' + cfg.telepon : ''}
    </span>
  </div>`;
};

// ================== LOGO ==================
window.getLogoUrl = async function () {
  const opdId = await _getOpdId();
  if (!opdId) return null;

  try {
    const cfg = await getOpdConfig(opdId);
    return cfg?._logoInstansi || localStorage.getItem('sideva_logo_instansi');
  } catch (e) {
    return localStorage.getItem('sideva_logo_instansi');
  }
};

// ================== UPLOAD HANDLER ==================
window.processKopFile = async function (file) {

  try {

    if (!file) {

      toast('Pilih file terlebih dahulu', 'error');

      return;

    }

    const opdId = await _getOpdId();

    if (!opdId) {

      throw new Error('OPD ID tidak ditemukan');

    }

    const ext =

      (file.name.split('.').pop() || 'png')

        .toLowerCase();

    const path =

      `kop/${opdId}/kop_${Date.now()}.${ext}`;

    const publicUrl =

      await _uploadToStorage(file, path);

    let cfg = {};

    try {

      cfg = await getOpdConfig(opdId);

    } catch (_) {}

    cfg = cfg || {};

    cfg._kopSuratImg = publicUrl;

    await saveOpdConfig(opdId, cfg);

    localStorage.setItem(

      'sideva_kop_surat_img',

      publicUrl

    );

    const preview =

      document.getElementById('kop-preview-area');

    localStorage.setItem(
      'sideva_kop_surat_img',
      publicUrl
    );

await window.refreshKopPreviewArea();

    toast('Kop surat berhasil disimpan', 'success');

  } catch (err) {

    console.error(err);

    toast(

      err.message || 'Upload gagal',

      'error'

    );

  }

};

window.processLogo = async function (file) {

  try {

    if (!file) {

      toast('Pilih file terlebih dahulu', 'error');

      return;

    }

    const opdId = await _getOpdId();

    if (!opdId) {

      throw new Error('OPD ID tidak ditemukan');

    }

    const ext =

      (file.name.split('.').pop() || 'png')

        .toLowerCase();

    const path =

      `logo/${opdId}/logo_${Date.now()}.${ext}`;

    const publicUrl =

      await _uploadToStorage(file, path);

    let cfg = {};

    try {

      cfg = await getOpdConfig(opdId);

    } catch (_) {}

    cfg = cfg || {};

    cfg._logoInstansi = publicUrl;

    await saveOpdConfig(opdId, cfg);

    localStorage.setItem(

      'sideva_logo_instansi',

      publicUrl

    );

    const img =

      document.getElementById('logo-img-preview');

    if (img) {

      img.src = publicUrl + '?t=' + Date.now();

    }

    toast('Logo berhasil disimpan', 'success');

  } catch (err) {

    console.error(err);

    toast(

      err.message || 'Upload gagal',

      'error'

    );

  }

};

// ================== PREVIEW REFRESH ==================
window.refreshKopPreviewArea = async function () {
  const area = document.getElementById('kop-preview-area');
  if (!area) return;

  // Render HTML kop
  try {
    // PERBAIKAN: pastikan hasil akhirnya string (anti kasus Promise ketarik)
    const htmlKop = window.kopSurat();
    console.log("[KOP] htmlKop typeof:", typeof htmlKop, "value:", htmlKop);

    area.innerHTML = htmlKop;
  } catch (err) {
    console.error("Gagal merender pratinjau kop:", err);
    area.innerHTML = `<div style="color:red; padding:10px; border:1px dashed red;">
      Gagal memuat pratinjau. Silakan coba unggah ulang atau hubungi admin.
    </div>`;
  }

  // Update label status
  const lbl = document.getElementById('kop-preview-label-text');
  if (!lbl) return;

  let hasImg = false;

  try {
    const localImg = localStorage.getItem('sideva_kop_surat_img');

    let dbImg = null;
    if (typeof getOpdConfig === 'function') {
      const opdId = await _getOpdId();
      if (opdId) {
        const cfg = await getOpdConfig(opdId).catch(() => ({}));
        dbImg = cfg?._kopSuratImg ?? null;
      }
    }

    hasImg = !!(localImg || dbImg);
  } catch (e) {
    hasImg = !!localStorage.getItem('sideva_kop_surat_img');
  }

  lbl.textContent = hasImg
    ? '✅ Menggunakan gambar kop surat'
    : '📝 Menggunakan teks fallback (Belum ada gambar)';

  lbl.style.color = hasImg ? '#4ade80' : '#fbbf24';
};

// ================== INIT ==================
window.initKopSuratSystem = async function () {
  await window.refreshKopPreviewArea();
  setTimeout(() => void window.refreshKopPreviewArea(), 800);
};

// ================== WATCHDOG: aktifkan saat form instansi ada ==================
function cekDanAktifkanKopSurat() {
  const inputNamaInstansi =
    document.getElementById('nama_instansi') ||
    document.querySelector('input[placeholder*="Badan Perencanaan"]');

  if (inputNamaInstansi && !window.kopSuratAktif) {
    console.log("[SI-DEVA] Form Pengaturan Instansi terdeteksi. Mengaktifkan Live Preview...");
    window.initKopSuratSystem?.();
    window.kopSuratAktif = true;
  }

  if (!inputNamaInstansi) {
    window.kopSuratAktif = false;
  }
}
setInterval(cekDanAktifkanKopSurat, 500);

// ================== LIVE PREVIEW SYNC (teks fallback) ==================
function sinkronkanInputKePreview() {
  const fields = {
    'nama_instansi': 'namaInstansi',
    'alamat_instansi': 'alamat',
    'telepon_instansi': 'telepon',
  };

  Object.keys(fields).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('input', (e) => {
      if (!window.appConfig) window.appConfig = {};
      window.appConfig[fields[id]] = e.target.value;
      void window.refreshKopPreviewArea(); // async tanpa await
    });
  });
}

// Jalankan saat DOM siap
function bootKopSystem() {
  void window.initKopSuratSystem();
  sinkronkanInputKePreview();
  // satu refresh lagi untuk aman
  setTimeout(() => void window.refreshKopPreviewArea(), 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootKopSystem);
} else {
  bootKopSystem();
}
