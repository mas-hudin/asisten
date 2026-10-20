# 🤖 AURA - Robot Hologram AI Sekolah Cerdas (Smart School Assistant)

Aplikasi Web Robot Hologram AI Interaktif Masa Depan untuk Website Sekolah yang dapat **diajak bicara dengan suara manusia secara alami**, **memberikan informasi resmi sekolah yang dikelola langsung oleh admin**, serta **ditenagai oleh Google Gemini AI** (1.5 Flash, 1.5 Pro, 2.0 Flash) dan mesin pengetahuan cerdas.

---

## 🌟 Fitur Utama

1. **Avatar Hologram 3D Interaktif (Three.js)**
   - Animasi partikel hologram 3D, cincin orbit bercahaya, dan efek pemindai cahaya biru neon (*cyber cyan* & *purple glow*).
   - Robot berkedip secara periodik, menatap dan merespons gerakan kursor mouse.
   - Reaksi status dinamis:
     - 🔵 **STANDBY**: Mengambang halus dengan napas cahaya lembut.
     - 🟢 **MENDENGARKAN (Listening)**: Inti berubah hijau zamrud saat pengguna berbicara.
     - 🟣 **BERPIKIR (Thinking)**: Pusaran partikel ungu saat AI menganalisis data sekolah.
     - 🌊 **BERBICARA (Speaking)**: Pulsa gelombang suara dan equalizer bar aktif bergerak seirama suara.
   - Pilihan beralih ke mode 2D Avatar Maskot beresolusi tinggi dengan sekali klik.

2. **Interaksi Suara Alami Manusia (Voice Engine 2-Way)**
   - **Speech-to-Text (Mendengar)**: Bicara langsung lewat mikrofon dalam Bahasa Indonesia (`id-ID`) dengan transkripsi teks langsung di layar.
   - **Text-to-Speech (Berbicara)**: Robot menjawab langsung dengan suara alami Bahasa Indonesia (pilihan suara perempuan/laki-laki, pengatur intonasi & kecepatan).
   - Efek suara sci-fi sintetis futuristik (Web Audio API) tanpa perlu download file mp3.

3. **Integrasi Google Gemini AI & Injeksi Data Sekolah (RAG)**
   - Terhubung langsung dengan Google Gemini API (`gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`).
   - **Injeksi Pengetahuan Otomatis (RAG)**: Setiap pertanyaan pengguna akan dicocokkan dengan data resmi sekolah yang diinput admin, lalu disuntikkan ke prompt sistem Gemini sehingga jawaban selalu akurat dan faktual.
   - **Mode Cerdas Cadangan (Offline Ready)**: Tetap dapat menjawab pertanyaan seputar PPDB, biaya, syarat, jurusan, fasilitas, kontak, dll secara fasih bahkan sebelum memasukkan Gemini API Key!

4. **Panel Kelola Data Sekolah (Admin CMS)**
   - Akses aman dengan **PIN Keamanan** (Default: `admin123`, dapat diubah).
   - Tab Pengelolaan Lengkap:
     - 🏫 **Profil Sekolah**: Nama sekolah, NPSN, akreditasi, visi & misi, kontak, alamat, jam operasional.
     - 📝 **PPDB & Biaya**: Status pendaftaran, gelombang, periode, link online, syarat berkas, rincian biaya (DSP, SPP, pendaftaran, seragam), beasiswa, dan alur pendaftaran.
     - 🎓 **Kurikulum & Fasilitas**: Program peminatan/jurusan, fasilitas unggulan, daftar ekstrakurikuler.
     - 👨‍🏫 **Guru & Staf**: Tambah/edit/hapus pengajar, mata pelajaran, dan kontak konsultasi.
     - ❓ **Tanya Jawab Kustom (FAQ)**: Tambah pertanyaan dan jawaban resmi sekolah dengan bebas.
     - 📢 **Pengumuman & Agenda**: Berita terkini dan agenda penting sekolah.
     - ⚙️ **Pengaturan AI**: Ganti nama robot, atur API Key Gemini, uji koneksi API langsung, pilih model Gemini, atur karakter suara, dan ubah prompt sistem kepribadian robot.
     - 💾 **Backup & Restore**: Ekspor seluruh data sekolah ke file `.json` dan impor kembali kapan saja.

5. **Integrasi ke Website Sekolah (Embed Widget & Iframe)**
   - Menyediakan generator kode widget instan.
   - Dapat dipasang pada website sekolah berbasis **WordPress, Blogger, Web HTML biasa, Laravel, PHP, cPanel**, dll dengan mudah.
   - File pendukung `widget.html` siap disematkan sebagai floating popup chatbot.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dibuat menggunakan standar web modern murni (HTML5, Vanilla CSS3, Vanilla ES6 JavaScript). Anda **tidak perlu menginstal Node.js atau server khusus** untuk menjalankannya secara lokal!

### Cara 1: Langsung Buka di Browser
1. Buka folder `c:\Users\user\Documents\HOLOGRAM AI` di File Explorer Anda.
2. Klik ganda (double click) file **`index.html`**.
3. Halaman akan terbuka langsung di browser Google Chrome, Microsoft Edge, atau browser modern lainnya.

### Cara 2: Memasang di Server Web / Hosting Sekolah
1. Unggah seluruh isi folder `HOLOGRAM AI` ke cPanel, Apache, Nginx, Vercel, Netlify, atau GitHub Pages sekolah Anda.
2. Buka URL domain sekolah Anda (misalnya `https://ai.sekolah.sch.id`).

---

## 🔐 Panduan Masuk ke Panel Admin Sekolah

1. Klik tombol **"Panel Admin Sekolah"** di pojok kanan atas layar.
2. Masukkan PIN keamanan:
   ```
   admin123
   ```
3. Tekan tombol **Masuk**.
4. Anda dapat memperbarui seluruh data sekolah, mengganti nama robot, menguji API Key Gemini, dan mengunduh cadangan data (JSON).

---

## 🌐 Cara Memasang Robot AI di Website Sekolah

Di Panel Admin pada tab **"8. Pasang di Website"**, Anda dapat langsung menyalin kode berikut:

### Opsi A: Tombol Melayang (Floating Widget) di Pojok Kanan Bawah
Tempelkan kode ini sebelum tag penutup `</body>` di template website sekolah Anda:
```html
<script>
(function() {
  var btn = document.createElement('div');
  btn.id = 'school-ai-launcher';
  btn.innerHTML = '<div style="position:fixed;bottom:25px;right:25px;width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg, #00f0ff, #8b5cf6);box-shadow:0 0 25px rgba(0,240,255,0.6);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:999999;transition:all 0.3s ease;"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path><rect x="4" y="6" width="16" height="12" rx="2"></rect><circle cx="9" cy="12" r="1.5"></circle><circle cx="15" cy="12" r="1.5"></circle><path d="M10 16h4"></path></svg></div>';
  
  var frame = document.createElement('iframe');
  frame.src = 'https://domain-sekolah-anda.sch.id/widget.html';
  frame.style.cssText = 'position:fixed;bottom:105px;right:25px;width:420px;height:620px;max-width:92vw;max-height:85vh;border:none;border-radius:24px;box-shadow:0 15px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,240,255,0.3);z-index:999998;display:none;transition:all 0.3s ease;';
  frame.allow = 'microphone;';

  document.body.appendChild(btn);
  document.body.appendChild(frame);

  var isOpen = false;
  btn.onclick = function() {
    isOpen = !isOpen;
    frame.style.display = isOpen ? 'block' : 'none';
  };
})();
</script>
```

---

## 📁 Struktur File Proyek

```text
HOLOGRAM AI/
├── index.html           # Halaman utama Portal Hologram AI Sekolah + Admin CMS
├── widget.html          # Widget chatbot compact siap disematkan di web sekolah
├── README.md            # Dokumentasi panduan lengkap
├── assets/
│   └── mascot.jpg       # Gambar maskot robot AI hologram resolusi tinggi
├── css/
│   ├── styles.css       # Desain cyber futuristik, glassmorphism & layout chat
│   ├── hologram.css     # Efek khusus panggung hologram 3D, scanlines & visualizer
│   └── admin.css        # Antarmuka panel admin dashboard & dialog PIN
└── js/
    ├── config.js        # Konfigurasi & database sekolah awal (default data)
    ├── audio.js         # Generator efek suara sci-fi sintetis (Web Audio API)
    ├── hologram-3d.js   # Mesin grafis avatar hologram 3D interaktif (Three.js)
    ├── voice.js         # Mesin suara 2 arah (Speech Recognition & Speech Synthesis)
    ├── gemini.js        # Klien Google Gemini AI & injeksi konteks data sekolah (RAG)
    ├── admin.js         # Pengontrol CRUD data sekolah, backup/restore JSON
    ├── embed-widget.js  # Generator skrip integrasi website sekolah
    └── app.js           # Pengontrol utama alur aplikasi dan interaksi pengguna
```
