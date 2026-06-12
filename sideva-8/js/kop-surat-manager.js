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
  const opdId = await _getOpdId();
  if (!opdId) return toast('Pilih OPD terlebih dahulu', 'error');

  try {
    const ext = file.name.split('.').pop();
    const path = `kop/kop_${opdId}.${ext}`;
    const publicUrl = await _uploadToStorage(file, path);

    // --- PERBAIKAN DI SINI ---
    const currentCfg = await getOpdConfig(opdId) || {};
    const updatedCfg = { ...currentCfg, _kopSuratImg: publicUrl };
    await saveOpdConfig(opdId, updatedCfg);
    // -------------------------

    localStorage.setItem('sideva_kop_surat_img', publicUrl);
    await refreshKopPreviewArea();
    toast('✅ Kop surat berhasil diupload!', 'success');
  } catch(err) {
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

    // --- PERBAIKAN DI SINI ---
    const currentCfg = await getOpdConfig(opdId) || {};
    const updatedCfg = { ...currentCfg, _logoInstansi: publicUrl };
    await saveOpdConfig(opdId, updatedCfg);
    // -------------------------

    localStorage.setItem('sideva_logo_instansi', publicUrl);
    toast('✅ Logo berhasil diupload!', 'success');
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

  try {
    // Gunakan await untuk mendapatkan string HTML dari fungsi async kopSurat
    const htmlKop = await window.kopSurat();
    area.innerHTML = htmlKop;
  } catch (err) {
    console.error("Gagal merender pratinjau kop:", err);
    area.innerHTML = `<div style="color:red; padding:10px; border:1px dashed red;">
      Gagal memuat pratinjau. Silakan coba unggah ulang atau hubungi admin.
    </div>`;
  }

  const lbl = document.getElementById('kop-preview-label-text');
  if (lbl) {
    let hasImg = false;
    
    try {
      // 1. Cek cache lokal
      const localImg = localStorage.getItem('sideva_kop_surat_img');
      
      // 2. Cek ke database (Supabase)
      let dbImg = null;
      if (typeof getOpdConfig === 'function') {
        const opdId = await _getOpdId();
        if (opdId) {
          const cfg = await getOpdConfig(opdId);
          dbImg = cfg?._kopSuratImg;
        }
      }

      hasImg = !!(localImg || dbImg);
    } catch (e) {
      console.warn("Gagal memeriksa status gambar kop:", e);
      hasImg = !!localStorage.getItem('sideva_kop_surat_img');
    }

    // Update label status di UI agar user tahu mode mana yang aktif
    lbl.textContent = hasImg 
      ? '✅ Menggunakan gambar kop surat' 
      : '📝 Menggunakan teks fallback (Belum ada gambar)';
    
    // Opsional: Tambahkan styling warna pada label
    lbl.style.color = hasImg ? '#4ade80' : '#fbbf24';
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

// ============================================================
// FIX: AUTOMATIC WATCHDOG INITIALIZER FOR KOP SURAT
// ============================================================
function cekDanAktifkanKopSurat() {
    // Deteksi apakah form Pengaturan Instansi sedang terbuka di layar
    const inputNamaInstansi = document.getElementById('nama_instansi') || document.querySelector('input[placeholder*="Badan Perencanaan"]');
    
    // Jika form ada di layar dan belum pernah diaktifkan fiturnya
    if (inputNamaInstansi && !window.kopSuratAktif) {
        console.log("[SI-DEVA] Form Pengaturan Instansi terdeteksi. Mengaktifkan Live Preview...");
        
        // Memanggil fungsi UTAMA asli milik Anda yang ada di baris atas file ini
        if (typeof window.initKopSuratSystem === 'function') {
            window.initKopSuratSystem();
        }
        
        window.kopSuratAktif = true; // Kunci agar tidak terjadi inisialisasi ganda
    }
    
    // Jika pengguna pindah ke menu lain, buka kembali kuncinya
    if (!inputNamaInstansi) {
        window.kopSuratAktif = false;
    }
}

// Lakukan pemindaian otomatis setiap 500 milidetik
setInterval(cekDanAktifkanKopSurat, 500);

// ================== LIVE PREVIEW SYNC ==================
function sinkronkanInputKePreview() {
  const fields = {
    'nama_instansi': 'namaInstansi',
    'alamat_instansi': 'alamat', // Sesuaikan ID input di HTML Anda
    'telepon_instansi': 'telepon'
  };

  Object.keys(fields).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        // Update temporary config
        if (!window.appConfig) window.appConfig = {};
        window.appConfig[fields[id]] = e.target.value;
        
        // Render ulang area pratinjau (hanya jika sedang pakai teks fallback)
        window.refreshKopPreviewArea();
      });
    }
  });
}

// Panggil fungsi ini saat inisialisasi
window.addEventListener('DOMContentLoaded', sinkronkanInputKePreview);







