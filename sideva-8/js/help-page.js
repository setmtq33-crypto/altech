// ============================================================
//  SI-DEVA — Halaman Bantuan (Help) v8
//  Menambahkan panduan pengguna di dalam aplikasi
// ============================================================

(function() {
  'use strict';

  // Fungsi untuk membuat halaman Help jika belum ada
  function ensureHelpPage() {
    if (document.getElementById('page-help')) return;

    const mainContent = document.querySelector('.content');
    if (!mainContent) return;

    const helpPage = document.createElement('div');
    helpPage.id = 'page-help';
    helpPage.className = 'page';
    helpPage.innerHTML = `
      <div class="hero-dashboard" style="margin-bottom:24px; padding:20px 28px;">
        <div class="hero-badge">📖 SI-DEVA</div>
        <div class="hero-title">Panduan Pengguna</div>
        <div class="hero-subtitle">Sistem Informasi Digital Evaluasi Verifikasi Administrasi E-Purchasing — Lengkap & Praktis</div>
      </div>
      <div id="help-content-container"></div>
    `;
    mainContent.appendChild(helpPage);
  }

  // Fungsi untuk menambahkan menu Help di sidebar
  function addHelpMenu() {
    if (document.getElementById('nav-help')) return;

    const sidebarNav = document.querySelector('.sidebar-nav');
    if (!sidebarNav) return;

    // Cari elemen terakhir dari grup "Tools" atau sebelum "Admin"
    let targetAnchor = null;
    const navItems = sidebarNav.querySelectorAll('.nav-item, .nav-section-label');
    
    for (let i = 0; i < navItems.length; i++) {
      const el = navItems[i];
      if (el.classList && el.classList.contains('nav-item')) {
        const onclick = el.getAttribute('onclick') || '';
        if (onclick.includes('backup')) {
          targetAnchor = el;
          break;
        }
        if (onclick.includes('pengaturan')) {
          targetAnchor = el;
          break;
        }
      }
    }
    
    // Jika tidak ada anchor, cari posisi setelah "Tools" section
    if (!targetAnchor) {
      const toolsLabel = Array.from(navItems).find(el => 
        el.classList && el.classList.contains('nav-section-label') && el.textContent.trim() === 'Tools'
      );
      if (toolsLabel && toolsLabel.nextElementSibling) {
        targetAnchor = toolsLabel.nextElementSibling;
      }
    }

    const helpItem = document.createElement('button');
    helpItem.id = 'nav-help';
    helpItem.className = 'nav-item';
    helpItem.setAttribute('onclick', "showPage('help')");
    helpItem.innerHTML = '<span class="icon">📖</span> Bantuan & Panduan';

    if (targetAnchor && targetAnchor.parentNode === sidebarNav) {
      // Sisipkan setelah anchor
      targetAnchor.insertAdjacentElement('afterend', helpItem);
    } else {
      // Fallback: tambahkan di akhir sidebar-nav
      sidebarNav.appendChild(helpItem);
    }
  }

  // Fungsi untuk merender konten Help
  function renderHelpContent() {
    const container = document.getElementById('help-content-container');
    if (!container) return;

    container.innerHTML = `
      <style>
        .help-section { margin-bottom: 32px; }
        .help-section h2 { font-size: 18px; font-weight: 700; color: var(--text); border-left: 4px solid var(--gold, #c9a84c); padding-left: 12px; margin-bottom: 16px; }
        .help-section h3 { font-size: 15px; font-weight: 600; margin: 16px 0 10px; color: var(--text2); }
        .help-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .help-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; transition: all 0.2s; }
        .help-card:hover { border-color: var(--gold); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .help-card .icon { font-size: 28px; display: block; margin-bottom: 12px; }
        .help-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
        .help-card p { font-size: 12px; color: var(--text2); line-height: 1.5; }
        .help-step-list { list-style: none; padding: 0; margin: 0; }
        .help-step-list li { display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-start; }
        .help-step-number { width: 28px; height: 28px; background: var(--gold, #c9a84c); color: #1a1200; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; margin-top: 2px; }
        .help-step-content { flex: 1; }
        .help-step-content strong { font-size: 13px; }
        .help-step-content p { margin: 4px 0 0; font-size: 12px; color: var(--text2); }
        .help-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .help-table th, .help-table td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; vertical-align: top; }
        .help-table th { background: var(--surface2); font-weight: 700; }
        .badge-wa { display: inline-block; background: #25d366; color: #fff; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-right: 6px; }
        .badge-tg { display: inline-block; background: #26a5e4; color: #fff; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; margin-right: 6px; }
        @media (max-width: 640px) {
          .help-card-grid { grid-template-columns: 1fr; }
        }
      </style>

      <!-- 1. TENTANG SI-DEVA -->
      <div class="help-section">
        <h2>📌 1. Tentang SI-DEVA</h2>
        <div class="help-card-grid">
          <div class="help-card"><div class="icon">🏛️</div><h4>Multi-OPD</h4><p>Setiap dinas/instansi memiliki data sendiri. Pilih OPD di topbar untuk beralih.</p></div>
          <div class="help-card"><div class="icon">📄</div><h4>Dokumen Lengkap</h4><p>Dokumen Identifikasi Kebutuhan (IDKB), Dokumen Penetapan Cara Pengadaan (Penetapan), Nota Dinas (Nodis), Surat Perintah Pengadaan Barang dan Jasa (SPPBJ), Dokumen Persiapan Pengadaan (DPP), Dokumen Spesifikasi (Spek), Riviu Dokumen Persiapan Pengadaan (Riviu), Dokumen Evaluasi Harga Pasar (EV_HP), Dokumen Evaluasi Administrasi (EV_AT), Berita Acara Hasil Pengadaan E - Prchesing (BAHPE).</p></div>
          <div class="help-card"><div class="icon">📊</div><h4>Dashboard & Laporan</h4><p>Monitoring real-time, serapan anggaran, deadline, efisiensi.</p></div>
          <div class="help-card"><div class="icon">🔔</div><h4>Notifikasi WA/Telegram</h4><p>Kirim notifikasi otomatis saat data input atau deadline mendekat.</p></div>
        </div>
      </div>
      
      <!-- 2. PANDUAN PENGGUNAAN DASAR (BARU) -->
      <div class="help-section">
        <h2>🚀 Cara Menggunakan SI-DEVA v5 (Panduan Dasar)</h2>
        <div class="help-card-grid">
          <div class="help-card">
            <div class="icon">🔐</div>
            <h4>1. Login & Navigasi</h4>
            <p>Gunakan email dan password dari admin. Setelah login, sidebar di kiri berisi menu utama: Dashboard, Paket, Rincian Belanja, Survey Harga, Pengaturan Instansi, dll. Klik menu untuk berpindah halaman.</p>
          </div>
          <div class="help-card">
            <div class="icon">🏢</div>
            <h4>2. Memilih OPD (Instansi)</h4>
            <p>Jika Anda memiliki akses ke lebih dari satu OPD, pilih OPD yang ingin dikerjakan melalui <strong>dropdown bertuliskan 🏢 OPD di pojok kanan atas</strong>. Maka semua data, logo, dan kop surat akan berganti sesuai OPD tersebut.</p>
          </div>
          <div class="help-card">
            <div class="icon">📦</div>
            <h4>3. Mengelola Data Paket</h4>
            <p>Masuk ke menu <strong>Paket / RUP</strong>. Klik <strong>Tambah Paket</strong>, isi nomor, nama, pagu, deadline, PPK. Setelah simpan, Anda bisa tambahkan rincian belanja dengan klik tombol <strong>Rincian</strong> di tabel paket.</p>
          </div>
          <div class="help-card">
            <div class="icon">🖼️</div>
            <h4>4. Upload Logo & Kop Surat</h4>
            <p>Buka <strong>Pengaturan Instansi</strong> → bagian Logo (seret gambar) dan Kop Surat. Gambar otomatis dikompres. Logo dan kop surat akan tercetak di laporan PDF.</p>
          </div>
          <div class="help-card">
            <div class="icon">📢</div>
            <h4>5. Notifikasi Telegram/WA</h4>
            <p>Di <strong>Pengaturan Instansi → Notifikasi Telegram</strong>, isi Bot Token dan Chat ID (dari @BotFather dan @userinfobot). Aktifkan agar setiap input paket/rincian terkirim notifikasi ke grup/akun Anda.</p>
          </div>
          <div class="help-card">
            <div class="icon">💾</div>
            <h4>6. Backup & Restore Data</h4>
            <p>Menu <strong>Backup / Restore</strong> (di sidebar) untuk mendownload semua data sebagai file JSON atau mengunggah backup lama. Juga bisa ekspor CSV per tabel.</p>
          </div>
        </div>
      
        <!-- Tabel ringkasan peran -->
        <h3 style="margin-top: 20px;">📌 Peran Pengguna</h3>
        <table class="help-table">
          <thead><tr><th>Peran</th><th>Akses & Tanggung Jawab</th></tr></thead>
          <tbody>
            <tr><td><strong>Super Admin</strong></td><td>Mengelola semua OPD, user, akses, konfigurasi sistem. Bisa lihat semua data.</td></tr>
            <tr><td><strong>Admin OPD</strong></td><td>Mengelola data paket, rincian, survey harga, dan pengaturan instansi untuk OPD yang diberikan akses.</td></tr>
            <tr><td><strong>Operator/User Biasa</strong></td><td>Hanya dapat menginput data (paket, rincian, survey) tanpa bisa mengubah pengaturan sistem.</td></tr>
          </tbody>
        </table>
      
        <div style="background: rgba(201,168,76,0.1); padding: 12px; border-radius: 8px; margin-top: 16px;">
          <p><strong>💡 Tips Penting:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Setiap kali selesai mengganti OPD, <strong>refresh browser (F5)</strong> jika logo/kop surat tidak langsung berubah.</li>
            <li>Pastikan <strong>mengisi nego final</strong> pada survey harga pemenang agar dokumen EV_HP dan BAHPE terisi otomatis.</li>
            <li>Gunakan <strong>Import Data</strong> untuk mengunggah banyak data sekaligus dari file Excel/CSV (format tersedia).</li>
          </ul>
        </div>
      </div>

       <!-- 3. PANDUAN KHUSUS ADMIN & SUPER ADMIN -->
      <div class="help-section">
        <h2>👑 3. Panduan untuk Admin & Super Admin</h2>
        <div class="help-card-grid">
          <div class="help-card"><h4>👥 Manajemen User</h4><p>Menu ini hanya muncul untuk admin. Bisa menambah user baru, mengubah role (viewer/operator/admin), dan <strong>reset password</strong> melalui tombol di samping user.</p></div>
          <div class="help-card"><h4>🏢 Manajemen OPD (Super Admin)</h4><p>Tambahkan OPD baru, konfigurasi (alamat, telepon, status aktif), serta beri akses user ke OPD tertentu.</p></div>
          <div class="help-card"><h4>🛡️ Manajemen Akses (Super Admin)</h4><p>Atur permission/hak akses per role (create, read, update, delete) untuk setiap modul. Sistem sudah memiliki role default.</p></div>
          <div class="help-card"><h4>📋 Audit Log</h4><p>Lihat riwayat aktivitas user: login, ubah role, tambah/hapus data, dll. Hanya super admin yang dapat mengakses.</p></div>
        </div>
        <div class="help-card" style="margin-top:12px;">
          <h4>🔐 Cara Reset Password User (Admin)</h4>
          <ol style="margin:8px 0 0 18px; font-size:12px;">
            <li>Buka <strong>Manajemen User</strong> dari sidebar (hanya admin).</li>
            <li>Pada baris user yang ingin direset, klik tombol <strong>🔑 Reset Password</strong>.</li>
            <li>Pilih metode: <strong>Kirim link reset via email</strong> (user akan menerima email) atau <strong>Set password baru langsung</strong> (admin tentukan password).</li>
            <li>Klik Simpan. Password baru akan aktif.</li>
          </ol>
        </div>
      </div>

      <!-- 4. ALUR INPUT DATA -->
      <div class="help-section">
        <h2>📋 4. Alur Input Data</h2>
        <ul class="help-step-list">
          <li><span class="help-step-number">1</span><div class="help-step-content"><strong>Data Paket</strong><p>Isi RUP, nama paket, pagu anggaran, bidang, tanggal pesanan, dll.</p></div></li>
          <li><span class="help-step-number">2</span><div class="help-step-content"><strong>Rincian Belanja</strong><p>Tambah item barang, volume, satuan, harga satuan.</p></div></li>
          <li><span class="help-step-number">3</span><div class="help-step-content"><strong>Survey Harga</strong><p>Input minimal 2-3 penyedia dari e-katalog, lengkapi harga tayang & nego final.</p></div></li>
          <li><span class="help-step-number">4</span><div class="help-step-content"><strong>Data Master</strong><p>Isi Bidang, OPD, Kode Rekening, PPK (upload TTD & Cap), Pejabat Pengadaan.</p></div></li>
        </ul>
      </div>

      <!-- 5. PANDUAN LENGKAP DATA PAKET (UNTUK OPERATOR) -->
      <div class="help-section">
        <h2>📦 5. Panduan Lengkap Mengelola Data Paket</h2>
        <p style="margin-bottom: 12px;">Ikuti langkah-langkah di bawah ini. Setiap paket pengadaan harus didaftarkan terlebih dahulu sebelum mengisi rincian belanja dan survey harga.</p>
      
        <div class="help-card-grid">
          <div class="help-card">
            <div class="icon">1️⃣</div>
            <h4>Tambah Paket Baru</h4>
            <ol style="margin: 0 0 8px 18px; padding-left: 0;">
              <li>Klik menu <strong>Data Paket</strong> → tombol <strong>+ Tambah</strong> (warna biru).</li>
              <li>Isi form:<br>
                - <strong>RUP</strong> (nomor unik, misal: 64408812)<br>
                - <strong>Nama Paket</strong> (contoh: Belanja Alat Tulis Kantor)<br>
                - <strong>Pagu Anggaran</strong> (dalam Rupiah, tanpa titik)<br>
                - <strong>Tanggal Pesanan</strong> dan <strong>Tanggal Selesai</strong><br>
                - <strong>Bidang</strong> (pilih dari daftar, maka Kepala Bidang otomatis terisi)<br>
                - <strong>Kode Rekening</strong> (pilih dari daftar atau ketik manual)<br>
              </li>
              <li>Klik <strong>Simpan</strong>. Data langsung muncul di tabel.</li>
            </ol>
            <div class="badge-info">💡 Tip: Gunakan tombol ✨ <strong>Format Otomatis</strong> pada Program/Kegiatan untuk memisahkan kode dan nama.</div>
          </div>
      
          <div class="help-card">
            <div class="icon">2️⃣</div>
            <h4>Edit atau Hapus Paket</h4>
            <ul style="margin: 0 0 8px 18px;">
              <li><strong>Edit</strong> – klik ikon ✏️ di baris paket, ubah data, klik Simpan.</li>
              <li><strong>Hapus</strong> – klik ikon 🗑️, lalu ketika diminta, <strong>ketik HAPUS</strong> (huruf besar) untuk konfirmasi.</li>
            </ul>
            <div class="badge-warning">⚠️ Peringatan: Menghapus paket akan <strong>menghapus semua rincian belanja dan survey harga</strong> yang terkait dengan RUP tersebut. Data tidak bisa dikembalikan.</div>
          </div>
      
          <div class="help-card">
            <div class="icon">3️⃣</div>
            <h4>Cari &amp; Filter Data</h4>
            <ul style="margin: 0 0 8px 18px;">
              <li><strong>🔍 Cepat</strong> – ketik nama paket atau RUP di kotak pencarian.</li>
              <li><strong>Filter</strong> – pilih berdasarkan RUP, Bidang, atau Kode Rekening.</li>
              <li><strong>Urutkan</strong> – klik pada judul kolom (misal: “Nama Paket” atau “Pagu”).</li>
            </ul>
            <p>Filter yang aktif akan mempengaruhi data yang diekspor ke CSV.</p>
          </div>
      
          <div class="help-card">
            <div class="icon">4️⃣</div>
            <h4>Hubungan dengan Rincian &amp; Harga</h4>
            <p>Setelah paket tersimpan, Anda bisa menambahkan:</p>
            <ul>
              <li><strong>Rincian Belanja</strong> – di menu <strong>Rincian Belanja</strong>, pilih RUP yang sama, isi item barang, volume, harga.</li>
              <li><strong>Survey Harga</strong> – di menu <strong>Survey Harga</strong>, pilih RUP yang sama, isi data penyedia, harga tayang, nego final.</li>
            </ul>
            <p>Progres paket akan terlihat di <strong>Dashboard</strong> dan <strong>Laporan Realisasi</strong> (persentase berubah sesuai kelengkapan data).</p>
          </div>
        </div>
      
        <div style="margin-top: 16px; background: #e6f7e6; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #2e7d32;">
          <strong>✅ RINGKASAN ALUR KERJA:</strong>
          <ol style="margin: 8px 0 0 20px;">
            <li><strong>Tambah Paket</strong> → isi semua data wajib (RUP, nama, pagu, tanggal, bidang).</li>
            <li><strong>Tambah Rincian Belanja</strong> (barang/jasa yang akan dibeli).</li>
            <li><strong>Tambah Survey Harga</strong> (minimal 2 penyedia, lengkapi nego final).</li>
            <li>Pantau progres &amp; deadline di Dashboard.</li>
            <li>Jika ada perubahan, edit paket atau rinciannya kapan saja.</li>
          </ol>
          <p style="margin-top: 8px;">Dengan mengikuti urutan ini, semua dokumen (Dokumen Identifikasi Kebutuhan (IDKB), Dokumen Penetapan Cara Pengadaan (Penetapan), Nota Dinas (Nodis), Surat Perintah Pengadaan Barang dan Jasa (SPPBJ), Dokumen Persiapan Pengadaan (DPP), Dokumen Spesifikasi (Spek), Riviu Dokumen Persiapan Pengadaan (Riviu), Dokumen Evaluasi Harga Pasar (EV_HP), Dokumen Evaluasi Administrasi (EV_AT), Berita Acara Hasil Pengadaan E - Prchesing (BAHPE)) akan terisi otomatis dan siap dicetak.</p>
        </div>
      </div>

      <!-- 6. SYNC DATA PEMBANDING -->
      <div class="help-section">
        <h2>⚡ 6. Sync Data Pembanding (Survey Harga)</h2>
          <p>Di halaman <strong>Rincian Belanja</strong>, terdapat dua tombol untuk membuat baris survey harga secara otomatis:</p>
          <ul class="help-step-list">
            <li><span class="help-step-number">⚡</span><div class="help-step-content"><strong>Sync Massal</strong><p>Menambah slot pembanding kosong untuk <strong>SEMUA</strong> item rincian yang belum memiliki 3 pembanding. Cocok untuk pertama kali mengisi data.</p></div></li>
            <li><span class="help-step-number">🎯</span><div class="help-step-content"><strong>Sync RUP Ini</strong><p>Menambah slot pembanding hanya untuk RUP yang sedang dipilih (aktif). Gunakan jika ingin mengisi satu paket tertentu.</p></div></li>
          </ul>
          <div class="help-card"><h4>💡 Catatan</h4><p>Data yang sudah ada (baik manual maupun dari sync sebelumnya) <strong>tidak akan ditimpa</strong>. Sync hanya menambah baris yang belum lengkap.</p></div>
        </div>

      <!-- 6. DOKUMEN (URUTAN) -->
      <div class="help-section">
        <h2>📑 6. Urutan Dokumen Pengadaan</h2>
        <div class="help-card-grid">
          <div class="help-card"><span class="badge-tg">IDKB</span><h4>Identifikasi Kebutuhan</h4><p>Formulir identifikasi kebutuhan barang/jasa.</p></div>
          <div class="help-card"><span class="badge-tg">PENETAPAN</span><h4>Penetapan Cara Pengadaan</h4><p>Metode E-Purchasing & negosiasi.</p></div>
          <div class="help-card"><span class="badge-tg">NODIS</span><h4>Nota Dinas</h4><p>Pengajuan belanja ke PPK.</p></div>
          <div class="help-card"><span class="badge-tg">SPPBJ</span><h4>Surat Perintah Pengadaan</h4><p>Perintah dari PPKom ke Pejabat Pengadaan.</p></div>
          <div class="help-card"><span class="badge-tg">DPP</span><h4>Dokumen Persiapan Pengadaan</h4><p>Spesifikasi, tempat, waktu, layanan.</p></div>
          <div class="help-card"><span class="badge-tg">SPEK</span><h4>Spesifikasi Teknis</h4><p>Detail spesifikasi barang/jasa.</p></div>
          <div class="help-card"><span class="badge-tg">RIVIU</span><h4>Riviu DPP</h4><p>Berita acara reviu dokumen persiapan.</p></div>
          <div class="help-card"><span class="badge-tg">EV_HP</span><h4>Evaluasi Harga</h4><p>Perbandingan harga, negosiasi, pemenang.</p></div>
          <div class="help-card"><span class="badge-tg">EV_AT</span><h4>Evaluasi Administrasi</h4><p>Verifikasi penyedia & aspek teknis.</p></div>
          <div class="help-card"><span class="badge-tg">BAHPE</span><h4>Berita Acara Hasil Penetapan</h4><p>Penetapan pemenang.</p></div>
        </div>
        <p style="margin-top:12px; font-size:12px; color:var(--text3);">💡 <strong>Tips:</strong> Pastikan <strong>nego final</strong> diisi pada survey harga pemenang agar dokumen EV_HP dan BAHPE terisi otomatis.</p>
      </div>

      <!-- 7. TATA LETAK TTD & CAP -->
      <div class="help-section">
        <h2>✍️ 7. Mengatur Posisi Tanda Tangan & Cap</h2>
        <ul class="help-step-list">
          <li><span class="help-step-number">1</span><div class="help-step-content"><strong>Buka dokumen</strong><p>Contoh: Form Spek, DPP, SPPBJ, dll. Pilih RUP dan PPK yang sudah memiliki gambar TTD/Cap.</p></div></li>
          <li><span class="help-step-number">2</span><div class="help-step-content"><strong>Klik tombol "Tata Letak TTD"</strong><p>Tombol ini muncul setelah PPK dipilih. Akan terbuka panel pengaturan posisi.</p></div></li>
          <li><span class="help-step-number">3</span><div class="help-step-content"><strong>Drag gambar langsung di dokumen</strong><p>Atau gunakan slider pada modal untuk mengatur posisi X/Y, lebar, tinggi, rotasi, dan opacity. Perubahan terlihat real-time.</p></div></li>
          <li><span class="help-step-number">4</span><div class="help-step-content"><strong>Simpan pengaturan</strong><p>Pengaturan disimpan per dokumen (misal untuk Form Spek akan berbeda dengan DPP).</p></div></li>
        </ul>
        <p style="font-size:12px; color:var(--text3);">🎯 <strong>Tips:</strong> Gunakan gambar PNG transparan untuk cap/stempel agar tidak menutupi teks.</p>
      </div>

      <!-- 8. KEYBOARD SHORTCUT -->
      <div class="help-section">
        <h2>⌨️ 8. Pintasan Keyboard (Shortcut)</h2>
        <div class="shortcut-grid">
          <div class="shortcut-item"><span>🔍 Buka Pencarian Global</span><span class="shortcut-key">Ctrl+K / ⌘K</span></div>
          <div class="shortcut-item"><span>🎨 Ganti Tema (Gelap/Terang)</span><span class="shortcut-key">Ctrl+Shift+L</span></div>
          <div class="shortcut-item"><span>➕ Buka Modal Tambah Data</span><span class="shortcut-key">Ctrl+N</span></div>
          <div class="shortcut-item"><span>🖨️ Cetak / PDF Dokumen</span><span class="shortcut-key">Ctrl+P</span></div>
          <div class="shortcut-item"><span>❓ Buka Panduan ini</span><span class="shortcut-key">Shift+?</span></div>
        </div>
        <p class="form-hint">Klik tombol <kbd>⌨️</kbd> di topbar untuk melihat daftar lengkap shortcut.</p>
      </div>

      <!-- 9. FILTER DASHBOARD & LAPORAN -->
      <div class="help-section">
        <h2>📊 9. Filter Dashboard & Laporan</h2>
        <div class="help-card-grid">
          <div class="help-card"><h4>Dashboard</h4><p>Gunakan filter <strong>Bidang, Mata Anggaran, Penyedia, Bulan, Triwulan</strong> untuk menyaring data yang ditampilkan di grafik dan statistik.</p></div>
          <div class="help-card"><h4>Laporan Realisasi</h4><p>Filter <strong>Bidang, Status Progres, Status Pagu</strong> untuk melihat paket tertentu. Tabel dan grafik akan menyesuaikan.</p></div>
          <div class="help-card"><h4>Reset Filter</h4><p>Klik tombol <strong>🔄 Reset Filter</strong> untuk menghapus semua filter dan menampilkan semua data.</p></div>
        </div>
      </div>

      <!-- 10. EKSPOR / IMPORT / BACKUP -->
      <div class="help-section">
        <h2>💾 10. Backup & Export Data</h2>
        <table class="help-table">
          <thead><tr><th>Fitur</th><th>Cara</th></tr></thead>
          <tbody>
            <tr><td>Export CSV (per tabel)</td><td>Buka halaman (Paket/Rincian/Harga/Penyedia), klik ⬇ Ekspor CSV di topbar.</td></tr>
            <tr><td>Backup JSON (semua data)</td><td>Buka <strong>Backup / Restore</strong> → klik <strong>⬇ Download Backup JSON</strong>.</td></tr>
            <tr><td>Restore dari backup</td><td>Pilih file JSON, klik <strong>♻️ Restore Database</strong>.</td></tr>
            <tr><td>Import CSV/JSON</td><td>Buka <strong>Import Data</strong>, pilih tabel, upload file, klik import.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 11. PENGATURAN INSTANSI & KOP SURAT -->
      <div class="help-section">
        <h2>⚙️ 11. Pengaturan Instansi & Kop Surat</h2>
        <p>Buka <strong>Pengaturan Instansi</strong> untuk mengisi:</p>
        <ul style="margin-bottom:12px;">
          <li>Nama instansi, singkatan, kabupaten, alamat, telepon, website.</li>
          <li>Tahun anggaran & sumber dana.</li>
          <li>Upload gambar kop surat (PNG/JPG/WEBP, maks 5 MB) – akan tampil di semua dokumen cetak.</li>
        </ul>
      </div>

      <!-- 12. NOTIFIKASI TELEGRAM & WHATSAPP -->
      <div class="help-section">
        <h2>📬 12. Notifikasi Telegram & WhatsApp</h2>
        <div class="help-card-grid">
          <div class="help-card"><h4>Telegram</h4><p>Buka <strong>Pengaturan Instansi → Notifikasi Telegram</strong>. Isi Bot Token (dari @BotFather) dan Chat ID (dari @userinfobot). Klik "Kirim Pesan Test".</p></div>
          <div class="help-card"><h4>WhatsApp (CallMeBot)</h4><p>Simpan nomor <code>+34 644 59 39 99</code>. Kirim pesan <code>I allow callmebot to send me messages</code>. Tunggu balasan API Key. Masukkan nomor WA (format 628xxxx) dan API Key.</p></div>
        </div>
      </div>

      <!-- 13. PEMECAHAN MASALAH UMUM -->
      <div class="help-section">
        <h2>❓ 13. Pemecahan Masalah Umum</h2>
        <table class="help-table">
          <thead><tr><th style="width:35%">Masalah</th><th>Solusi</th></tr></thead>
          <tbody>
            <tr><td>Grafik tidak muncul</td><td>Refresh halaman (F5). Pastikan koneksi internet stabil.</td></tr>
            <tr><td>Submenu Dokumen tidak rapi</td><td>Hard refresh (Ctrl+Shift+R). Pastikan file sidebar-dokumen-dropdown.js terupdate.</td></tr>
            <tr><td>Error "animateCount is not defined"</td><td>Refresh ulang aplikasi. Jika masih muncul, hubungi admin.</td></tr>
            <tr><td>Gambar kop surat gagal upload</td><td>Ukuran maks 5 MB, format PNG/JPG/WEBP. Kompres jika perlu.</td></tr>
            <tr><td>Margin cetak terlalu besar/kecil</td><td>Gunakan tombol ⚙️ Margin di header dokumen, atur nilai, simpan.</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 14. TESTIMONI & SARAN PENGGUNA (Form Feedback) -->
      <div class="help-section" id="feedback-section">
        <h2>💬 14. Testimoni & Saran Pengguna</h2>
        <div class="help-card">
          <p style="margin-bottom:12px;">Kami sangat menghargai masukan Anda untuk terus menyempurnakan SI-DEVA. Silakan isi formulir di bawah ini. Terima kasih.</p>
          <form id="feedback-form" onsubmit="submitFeedback(event)">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
              <div>
                <label style="font-size:12px; font-weight:600;">Rating (1–5)</label>
                <select id="feedback-rating" class="form-control" required style="height:40px;">
                  <option value="">-- Pilih --</option>
                  <option value="5">⭐⭐⭐⭐⭐ – Sangat Puas</option>
                  <option value="4">⭐⭐⭐⭐ – Puas</option>
                  <option value="3">⭐⭐⭐ – Cukup</option>
                  <option value="2">⭐⭐ – Kurang Puas</option>
                  <option value="1">⭐ – Tidak Puas</option>
                </select>
              </div>
              <div>
                <label style="font-size:12px; font-weight:600;">OPD (otomatis)</label>
                <input type="text" id="feedback-opd" class="form-control" readonly style="background:var(--surface2);">
              </div>
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:12px; font-weight:600;">Pesan / Saran / Testimoni *</label>
              <textarea id="feedback-message" rows="4" class="form-control" placeholder="Tulis saran, kritik, atau testimoni Anda..." required></textarea>
            </div>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <button type="submit" class="btn btn-primary" id="btn-submit-feedback">📨 Kirim Feedback</button>
              <span id="feedback-status" style="font-size:12px;"></span>
            </div>
          </form>
          <div id="feedback-thanks" style="display:none; margin-top:12px; padding:10px; background:var(--green-subtle); border-radius:8px; color:var(--green);">
            ✅ Terima kasih atas feedback Anda! Tim kami akan menindaklanjuti.
          </div>
        </div>
      </div>

      <!-- 15. KONTAK DUKUNGAN -->
      <div class="help-section" style="background:var(--surface2); border-radius:12px; padding:16px; margin-top:24px;">
        <h2>📞 15. Kontak Dukungan</h2>
        <p>Jika mengalami kendala, silakan hubungi:</p>
        <ul>
          <li><strong>Admin Sistem</strong>: admin sideva-v5 0857-1888-4528 atau 0821-2120-3777</li>
          <li><strong>Grup Telegram/WhatsApp</strong>: https://chat.whatsapp.com/B5azM5EYlOC4C9Q8J8cayg?s=hd&p=i&mlu=1</li>
        </ul>
        <p style="margin-top:8px; font-size:12px;">Terima kasih telah menggunakan SI-DEVA. Semoga mempermudah pengadaan barang/jasa di lingkungan Anda.</p>
      </div>
    `;

   // Isi field OPD otomatis
    const opdField = document.getElementById('feedback-opd');
    if (opdField) {
      let opdName = 'Tidak diketahui';
      if (typeof getCurrentOpdName === 'function') {
        opdName = getCurrentOpdName();
      }
      opdField.value = opdName;
    }
  }

  // Fungsi global submit feedback
  window.submitFeedback = async function(event) {
    event.preventDefault();
    const rating = document.getElementById('feedback-rating').value;
    const message = document.getElementById('feedback-message').value.trim();
    const opdName = document.getElementById('feedback-opd').value;
    const btn = document.getElementById('btn-submit-feedback');
    const statusSpan = document.getElementById('feedback-status');

    if (!rating || !message) {
      statusSpan.textContent = '❌ Rating dan pesan wajib diisi.';
      statusSpan.style.color = 'var(--red)';
      return;
    }

    btn.disabled = true;
    btn.textContent = '⏳ Mengirim...';
    statusSpan.textContent = '';

    let userId = null, userEmail = null, opdId = null;
    if (typeof getCurrentUser === 'function') {
      const user = getCurrentUser();
      if (user) {
        userId = user.id || null;
        userEmail = user.email || null;
      }
    }
    if (typeof getCurrentOpdId === 'function') {
      opdId = getCurrentOpdId();
    }

    try {
      const session = window._session || (await supabaseClient?.auth.getSession())?.data?.session;
      const token = session?.access_token;
      const response = await fetch('/rest/v1/user_feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': token ? 'Bearer ' + token : ''
        },
        body: JSON.stringify({
          user_id: userId,
          user_email: userEmail,
          opd_id: opdId,
          opd_name: opdName,
          rating: parseInt(rating),
          feedback: message,
          created_at: new Date().toISOString()
        })
      });
      if (response.ok) {
        document.getElementById('feedback-form').reset();
        document.getElementById('feedback-thanks').style.display = 'block';
        setTimeout(() => {
          document.getElementById('feedback-thanks').style.display = 'none';
        }, 5000);
        statusSpan.textContent = '';
      } else {
        const err = await response.text();
        throw new Error(err);
      }
    } catch (err) {
      console.error(err);
      statusSpan.textContent = '❌ Gagal mengirim: ' + err.message;
      statusSpan.style.color = 'var(--red)';
    } finally {
      btn.disabled = false;
      btn.textContent = '📨 Kirim Feedback';
    }
  };

    // Inisialisasi
  function init() {
    ensureHelpPage();
    addHelpMenu();

    // Fungsi untuk memuat konten Help (panggil renderHelpContent)
    function loadHelpContent() {
        var helpPage = document.getElementById('page-help');
        if (helpPage && helpPage.classList.contains('active')) {
            if (typeof renderHelpContent === 'function') {
                renderHelpContent();
                console.log('Konten Help dimuat via init');
            } else {
                console.warn('renderHelpContent belum tersedia');
            }
        }
    }

    // Panggil sekali saat inisialisasi (jika help aktif dari awal)
    loadHelpContent();

    // Pasang event listener untuk perubahan halaman (jika ada)
    window.addEventListener('sideva:page-changed', function(e) {
        if (e.detail && e.detail.page === 'help') {
            setTimeout(loadHelpContent, 50);
        }
    });

    // Fallback: amati perubahan class pada #page-help
    var helpPageElem = document.getElementById('page-help');
    if (helpPageElem) {
        var observer = new MutationObserver(function() {
            loadHelpContent();
        });
        observer.observe(helpPageElem, { attributes: true, attributeFilter: ['class'] });
    }

    // Override showPage jika ada (agar memicu render saat beralih ke help)
    if (typeof window.showPage === 'function' && !window._helpPatched) {
        window._helpPatched = true;
        var originalShowPage = window.showPage;
        window.showPage = function(pageId) {
            originalShowPage(pageId);
            if (pageId === 'help') {
                setTimeout(loadHelpContent, 100);
            }
        };
    }

    // Ekspos fungsi ke global untuk debugging
    window.loadHelpContent = loadHelpContent;
}

// Ekspos fungsi renderHelpContent ke global (opsional, untuk debugging)
window.renderHelpContent = renderHelpContent;

// Paksa render konten ketika halaman help aktif setiap kali tombol diklik
function forceHelpRender() {
    var helpPage = document.getElementById('page-help');
    if (helpPage && helpPage.classList.contains('active')) {
        renderHelpContent();
    }
}

// Override showPage global jika ada, atau pasang observer yang lebih agresif
if (typeof window.showPage === 'function') {
    var originalShowPage = window.showPage;
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        if (pageId === 'help') {
            setTimeout(forceHelpRender, 50);
        }
    };
} else {
    // Jika showPage tidak ada, gunakan MutationObserver yang lebih kuat
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                var hp = document.getElementById('page-help');
                if (hp && hp.classList.contains('active')) {
                    renderHelpContent();
                }
            }
        });
    });
    var targetNode = document.getElementById('page-help');
    if (targetNode) observer.observe(targetNode, { attributes: true });
    // Panggil sekali untuk berjaga-jaga
    setTimeout(forceHelpRender, 200);
}
  
 
})();  // <-- Pastikan ada dua kurung tutup: })();   
      
      
      
      
    
