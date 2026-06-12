// ============================================================
//  SI-DEVA — Kop Surat & Logo Manager v8.1 (Fixed Clean)
// ============================================================

const STORAGE_BUCKET = 'sideva-assets';

// ================== HELPERS ==================
async function _getOpdId() {
  let id = window._currentOpdId || localStorage.getItem('sideva_current_opd_id');

  if (!id) {
    const sessionStr = localStorage.getItem('sideva_session_v3');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      id = session.user?.user_metadata?.opd_id || session.user?.opd_id;
    }
  }

  return id || null;
}

async function _getAccessToken() {
  const session = JSON.parse(localStorage.getItem('sideva_session_v3') || '{}');
  return session.access_token || null;
}

async function _uploadToStorage(file, path) {
  const token = await _getAccessToken();

  if (!token) throw new Error('Belum login');

  const url = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: file,
  });

  const text = await res.text();

  // (Opsional) log untuk debugging
  console.log("upload status", res.status, "body", text);

  if (!res.ok) {
    throw new Error(`Upload gagal: ${res.status} - ${text}`);
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

window.kopSurat = async function () {
  const opdId = await _getOpdId();
  if (!opdId) return _fallbackKop();

  // Coba ambil dari Supabase dulu
  let kopUrl = null;
  try {
    const cfg = await getOpdConfig(opdId);
    kopUrl = cfg?._kopSuratImg ?? null;
  } catch (e) {
    // ignore, fallback localStorage
  }

  // Fallback localStorage
  if (!kopUrl) kopUrl = localStorage.getItem('sideva_kop_surat_img');

  if (kopUrl) {
    return `<div style="margin-bottom:16px;text-align:center;">
      <img src="${kopUrl}" style="max-width:100%; max-height:180px; object-fit:contain; border-bottom:3px double #000; padding-bottom:8px;">
    </div>`;
  }

  return _fallbackKop();
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
  if (!file) return toast('Belum ada file yang dipilih', 'error');
  if (!file.type?.startsWith('image/')) return toast('File harus gambar!', 'error');

  const opdId = await _getOpdId();
  if (!opdId) return toast('Pilih OPD terlebih dahulu', 'error');

  try {
    const name = file.name || '';
    const extRaw = name.includes('.') ? name.split('.').pop() : 'png';
    const ext = (extRaw || 'png').toLowerCase();

    const path = `kop/kop_${opdId}.${ext}`;
    const publicUrl = await _uploadToStorage(file, path);

    const currentCfg = await getOpdConfig(opdId).catch(() => ({})) || {};
    const updatedCfg = { ...currentCfg, _kopSuratImg: publicUrl };
    await saveOpdConfig(opdId, updatedCfg);

    localStorage.setItem('sideva_kop_surat_img', publicUrl);

    await window.refreshKopPreviewArea();
    toast('✅ Kop surat berhasil diupload!', 'success');
  } catch (err) {
    toast('Gagal upload kop: ' + (err?.message || String(err)), 'error');
  }
};

window.processLogo = async function (file) {
  if (!file) return toast('Belum ada file yang dipilih', 'error');
  if (!file.type?.startsWith('image/')) return toast('File harus gambar!', 'error');

  const opdId = await _getOpdId();
  if (!opdId) return toast('Pilih OPD terlebih dahulu', 'error');

  try {
    const name = file.name || '';
    const extRaw = name.includes('.') ? name.split('.').pop() : 'png';
    const ext = (extRaw || 'png').toLowerCase();

    const path = `logo/logo_${opdId}.${ext}`;
    const publicUrl = await _uploadToStorage(file, path);

    const currentCfg = await getOpdConfig(opdId).catch(() => ({})) || {};
    const updatedCfg = { ...currentCfg, _logoInstansi: publicUrl };
    await saveOpdConfig(opdId, updatedCfg);

    localStorage.setItem('sideva_logo_instansi', publicUrl);
    toast('✅ Logo berhasil diupload!', 'success');

    const preview = document.getElementById('logo-img-preview');
    if (preview) preview.src = publicUrl;
  } catch (err) {
    toast('Gagal upload logo: ' + (err?.message || String(err)), 'error');
  }
};

// ================== PREVIEW REFRESH ==================
window.refreshKopPreviewArea = async function () {
  const area = document.getElementById('kop-preview-area');
  if (!area) return;

  // Render HTML kop
  try {
    const htmlKop = await window.kopSurat();
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
  setTimeout(() => window.refreshKopPreviewArea(), 800);
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
      window.refreshKopPreviewArea();
    });
  });
}

// Jalankan saat DOM siap
function bootKopSystem() {
  window.initKopSuratSystem();
  sinkronkanInputKePreview();
  // satu refresh lagi untuk aman
  setTimeout(() => window.refreshKopPreviewArea(), 300);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootKopSystem);
} else {
  bootKopSystem();
}
