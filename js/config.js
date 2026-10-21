/**
 * CONFIG & DEFAULT SCHOOL KNOWLEDGE BASE
 * Otomatis di-update secara online dari Panel Admin Sekolah
 */

const STORAGE_KEYS = {
  SCHOOL_DATA: 'hologram_school_data_v1',
  APP_SETTINGS: 'hologram_ai_settings_v1',
  CHAT_HISTORY: 'hologram_chat_history_v1',
  ADMIN_PIN: 'hologram_admin_pin_v1',
  GITHUB_TOKEN: 'hologram_github_token_v1',
  GITHUB_REPO: 'hologram_github_repo_v1'
};

const DEFAULT_SCHOOL_DATA = {
  "profile": {
    "address": "Jl. raya Mirit, Kec. Mirit, Kab. Kebumen, Jawa Tengah 54394",
    "principal": "HAJI PARYANTO, S.Pd.",
    "website": "https://smpn1mirit.sch.id",
    "motto": "Berakhlak Mulia, Unggul dalam Prestasi, Terampil dan Berwawasan Lingkungan",
    "welcomeSpeech": "Selamat datang di portal informasi dan asisten cerdas SMP NEGERI 1 MIRIT, Kabupaten Kebumen. Kami berkomitmen menyelenggarakan pendidikan bermutu, ramah anak, dan membina generasi berprestasi berlandaskan profil pelajar Pancasila.",
    "operatingHours": "Senin - Kamis: 07.00 - 14.00 WIB | Jum'at : 07.00 - 11.00 dan Sabtu: 07.30 - 12.30 WIB",
    "name": "SMP NEGERI 1 MIRIT",
    "accreditation": "A (Unggul)",
    "whatsapp": "0812-2550-1980",
    "vision": "Terwujudnya peserta didik yang beriman, bertakwa, berakhlak mulia, berprestasi tinggi, berwawasan global, dan peduli lingkungan hidup.",
    "phone": "(0287) 6651-020",
    "mission": [
      "Menyelenggarakan proses pembelajaran yang inovatif, kreatif, dan berbasis teknologi pembelajaran modern.",
      "Menumbuhkembangkan keimanan, ketakwaan, serta budi pekerti luhur seluruh warga sekolah.",
      "Meningkatkan prestasi akademik dan non-akademik siswa di tingkat kabupaten, provinsi, hingga nasional.",
      "Menciptakan lingkungan sekolah yang asri, bersih, hijau, sehat, dan ramah anak."
    ],
    "email": "info@smpn1mirit.sch.id",
    "npsn": "20330335"
  },
  "ppdb": {
    "costs": {
      "uniform": "Sesuai kebutuhan koperasi sekolah",
      "registrationFee": "GRATIS",
      "spp": "GRATIS",
      "dsp": "BEBAS BIAYA"
    },
    "registrationPeriod": "15 Mei 2026 - 30 Juni 2026",
    "flow": [
      "Langkah 1: Kunjungi portal https://ppdb.smpn1mirit.sch.id.",
      "Langkah 2: Isi data diri dan berkas persyaratan."
    ],
    "contactPerson": "Ibu mugiarti, S.Pd. (0857-4782-8390)",
    "registrationLink": "https://ppdb.smpn1mirit.sch.id",
    "status": "DITUTUP",
    "requirements": [
      "Mengisi formulir pendaftaran PPDB online atau langsung ke loket sekolah.",
      "Fotokopi Surat Keterangan Lulus (SKL) atau Ijazah SD/MI.",
      "Fotokopi Akta Kelahiran dan Kartu Keluarga (KK)."
    ],
    "currentWave": "Penerimaan Peserta Didik Baru (PPDB) Daring"
  },
  "academic": {
    "facilities": [
      "Laboratorium Komputer ber-AC dengan akses internet WiFi",
      "Laboratorium IPA / Sains terpadu",
      "Perpustakaan Ramah Anak"
    ],
    "curriculum": "Kurikulum Merdeka Mandiri Berubah",
    "extracurriculars": [
      "Pramuka Inti",
      "Palang Merah Remaja (PMR)",
      "Paskibra Sekolah"
    ]
  },
  "teachers": [
    {
      "name": "HAJI PARYANTO, S.Pd.",
      "role": "Kepala Sekolah",
      "subject": "Manajemen Sekolah",
      "contact": "kepsek@smpn1mirit.sch.id"
    },
    {
      "name": "Ibu Siska, S.Pd.",
      "role": "Duta Virtual & Guru Bahasa",
      "subject": "Bahasa Indonesia & Literasi",
      "contact": "siska@smpn1mirit.sch.id"
    },
    {
      "name": "Budi Santoso, S.Pd.",
      "role": "Wakasek Kurikulum",
      "subject": "Matematika",
      "contact": "kurikulum@smpn1mirit.sch.id"
    },
    {
      "name": "Agus Prasetyo, S.Kom.",
      "role": "Kepala Lab Komputer",
      "subject": "Informatika / TIK",
      "contact": "it@smpn1mirit.sch.id"
    },
    {
      "name": "Tri Wahyuni, S.Pd.",
      "role": "Ketua PPDB & Guru BK",
      "subject": "Bimbingan & Konseling",
      "contact": "bk@smpn1mirit.sch.id"
    }
  ],
  "faqs": [
    {
      "q": "Kapan pendaftaran siswa baru (PPDB) SMP Negeri 1 Mirit dibuka?",
      "a": "Pendaftaran PPDB Tahun Ajaran 2026/2027 dibuka mulai 15 Mei hingga 30 Juni 2026 melalui portal online https://ppdb.smpn1mirit.sch.id atau langsung ke sekolah."
    },
    {
      "q": "Berapa biaya pendaftaran dan iuran SPP di SMPN 1 Mirit?",
      "a": "Pendaftaran di SMP Negeri 1 Mirit GRATIS tanpa dipungut biaya apa pun, dan bebas SPP bulanan karena dibiayai dana BOS pemerintah."
    },
    {
      "q": "Apa saja jalur pendaftaran PPDB yang tersedia?",
      "a": "Tersedia 4 jalur: Jalur Zonasi (55%), Jalur Prestasi (20%), Jalur Afirmasi KIP/PIP (20%), dan Jalur Perpindahan Tugas Orang Tua (5%)."
    },
    {
      "q": "Apa saja fasilitas unggulan di SMP Negeri 1 Mirit?",
      "a": "Sekolah kami dilengkapi Laboratorium Komputer modern, Laboratorium IPA, Perpustakaan Lengkap, Lapangan Olahraga Luas, Mushola, Ruang Seni Musik, dan Taman Adiwiyata yang asri."
    },
    {
      "q": "Di mana alamat SMP Negeri 1 Mirit dan nomor kontaknya?",
      "a": "Alamat kami di Jl. Pasar Senggol Mirit, Kecamatan Mirit, Kabupaten Kebumen, Jawa Tengah. Telepon (0287) 6651-020 atau WhatsApp di 0812-2550-1980."
    }
  ],
  "announcements": [
    {
      "id": "ANN-01",
      "date": "17 Oktober 2026",
      "title": "Sosialisasi Penerimaan Siswa Baru (PPDB) 2026/2027",
      "content": "Posko layanan informasi PPDB SMP Negeri 1 Mirit siap melayani konsultasi orang tua dan calon siswa baru setiap hari kerja pukul 08.00 - 14.00 WIB."
    },
    {
      "id": "ANN-02",
      "date": "12 Oktober 2026",
      "title": "Prestasi Siswa SMP Negeri 1 Mirit di Lomba Kebumen",
      "content": "Selamat kepada tim pramuka dan sains siswa SMPN 1 Mirit yang berhasil meraih juara dalam ajang kreativitas pelajar tingkat Kabupaten Kebumen."
    }
  ]
};

const DEFAULT_SETTINGS = {
  "robotName": "Ibu Siska",
  "robotTitle": "Duta Virtual & Guru SMP Negeri 1 Mirit",
  "schoolNameShort": "SMP Negeri 1 Mirit",
  "aiProvider": "groq",
  "groqApiKey": "",
  "groqModel": "qwen/qwen3.8-27b",
  "geminiApiKey": "",
  "geminiModel": "gemini-2.0-flash",
  "temperature": 0.65,
  "voiceEnabled": true,
  "voicePitch": 1.1,
  "voiceRate": 1.05,
  "voiceGender": "female",
  "soundFxEnabled": true,
  "hologramColor": "#00f0ff",
  "avatarHumanMode": "video",
  "avatarVideoUrl": "assets/siska-video.mp4",
  "voiceAudioSource": "browser",
  "fishAudioApiKey": "",
  "fishAudioVoiceId": "befd70a8b79d4d40b97993682a3d38e1",
  "elevenLabsApiKey": "",
  "elevenLabsVoiceId": "",
  "didApiKey": "",
  "githubToken": "",
  "githubRepo": "mas-hudin/asisten",
  "welcomeGreeting": "Halo, saya Siska, asisten sekolah SMPN 1 MIRIT, Ada yang bisa saya bantu hari ini? Saya siap memberikan informasi seputar sekolah. Jangan ragu untuk bertanya, ya!",
  "systemPrompt": "Kamu adalah Ibu Siska,yang dibuat dan diciptakan oleh pak mashudin sebagai Duta Virtual dan Guru SMP Negeri 1 Mirit, Kabupaten Kebumen, Jawa Tengah. Kamu berkomunikasi dengan santun, ramah, hangat, jelas, dan berwawasan luas layaknya seorang guru perempuan muda yang menyapa ramah para siswa, guru, orang tua murid, dan tamu sekolah.kamu bisa apa saja dan bahasa apa saja.bahasa jawa kromo inggil."
};
