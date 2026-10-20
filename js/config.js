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
    "name": "SMP NEGERI 1 MIRIT",
    "motto": "Berakhlak Mulia, Unggul dalam Prestasi, Terampil dan Berwawasan Lingkungan",
    "npsn": "20330335",
    "accreditation": "A (Unggul)",
    "principal": "HAJI PARYANTO,S.Pd",
    "welcomeSpeech": "Selamat datang di portal informasi dan asisten cerdas SMP NEGERI 1 MIRIT, Kabupaten Kebumen. Kami berkomitmen menyelenggarakan pendidikan bermutu, ramah anak, dan membina generasi berprestasi berlandaskan profil pelajar Pancasila.",
    "vision": "Terwujudnya peserta didik yang beriman, bertakwa, berakhlak mulia, berprestasi tinggi, berwawasan global, dan peduli lingkungan hidup.",
    "mission": [
      "Menyelenggarakan proses pembelajaran yang inovatif, kreatif, dan berbasis teknologi pembelajaran modern.",
      "Menumbuhkembangkan keimanan, ketakwaan, serta budi pekerti luhur seluruh warga sekolah.",
      "Meningkatkan prestasi akademik dan non-akademik siswa di tingkat kabupaten, provinsi, hingga nasional.",
      "Menciptakan lingkungan sekolah yang asri, bersih, hijau, sehat, dan ramah anak."
    ],
    "address": "Jl. Pasar Senggol Mirit, Kec. Mirit, Kab. Kebumen, Jawa Tengah 54394",
    "phone": "(0287) 6651-020",
    "whatsapp": "0812-2550-1980",
    "email": "info@smpn1mirit.sch.id",
    "website": "https://smpn1mirit.sch.id",
    "operatingHours": "Senin - Jumat: 07.00 - 15.30 WIB | Sabtu: 07.30 - 12.00 WIB (Kegiatan Pramuka & Ekstrakurikuler)"
  },
  "ppdb": {
    "status": "DIBUKA (Tahun Ajaran 2026/2027)",
    "currentWave": "Penerimaan Peserta Didik Baru (PPDB) Daring",
    "registrationPeriod": "15 Mei 2026 - 30 Juni 2026",
    "registrationLink": "https://ppdb.smpn1mirit.sch.id",
    "contactPerson": "Ibu Siska, S.Pd. (0812-2550-1980)",
    "requirements": [
      "Mengisi formulir pendaftaran PPDB online atau langsung ke loket sekolah.",
      "Fotokopi Surat Keterangan Lulus (SKL) atau Ijazah SD/MI.",
      "Fotokopi Akta Kelahiran dan Kartu Keluarga (KK).",
      "Fotokopi rapor kelas 4, 5, dan 6 SD/MI yang telah dilegalisasi.",
      "Pas foto 3x4 sebanyak 3 lembar.",
      "Piagam / sertifikat kejuaraan lomba bagi pendaftar jalur prestasi."
    ],
    "tracks": [
      {
        "name": "Jalur Zonasi Wilayah",
        "quota": "55%",
        "benefit": "Prioritas calon siswa di wilayah kecamatan Mirit dan sekitarnya"
      },
      {
        "name": "Jalur Prestasi Akademik & Kejuaraan",
        "quota": "20%",
        "benefit": "Prioritas nilai rapor tinggi & piagam penghargaan"
      },
      {
        "name": "Jalur Afirmasi (KIP / PIP)",
        "quota": "20%",
        "benefit": "Bantuan perlengkapan sekolah dan pembebasan biaya"
      },
      {
        "name": "Jalur Perpindahan Tugas Orang Tua",
        "quota": "5%",
        "benefit": "Khusus putra/putri mutasi dinas resmi"
      }
    ],
    "costs": {
      "registrationFee": "GRATIS (Tanpa dipungut biaya pendaftaran)",
      "dsp": "BEBAS BIAYA (Sekolah Negeri bebas uang gedung)",
      "spp": "GRATIS (Bebas iuran SPP bulanan)",
      "uniform": "Sesuai kebutuhan koperasi sekolah"
    },
    "flow": [
      "Langkah 1: Kunjungi portal https://ppdb.smpn1mirit.sch.id atau datang ke posko PPDB SMPN 1 Mirit.",
      "Langkah 2: Isi data diri, asal sekolah SD/MI, dan pilih jalur pendaftaran.",
      "Langkah 3: Unggah berkas persyaratan (rapor & Kartu Keluarga).",
      "Langkah 4: Verifikasi berkas oleh panitia PPDB.",
      "Langkah 5: Cetak bukti pendaftaran resmi.",
      "Langkah 6: Pengumuman kelulusan dan daftar ulang."
    ]
  },
  "academic": {
    "curriculum": "Kurikulum Merdeka Mandiri Berubah",
    "programs": [
      {
        "name": "Penguatan Literasi & Numerasi Digital",
        "desc": "Pembelajaran aktif berbasis proyek pemecahan masalah dan pengenalan dasar komputer.",
        "careerProspects": "Mempersiapkan siswa melanjutkan ke SMA/SMK unggulan"
      },
      {
        "name": "Kelas Bimbingan Olimpiade Sains & Seni",
        "desc": "Pembinaan intensif untuk OSN (Matematika, IPA, IPS) serta FLS2N seni budaya.",
        "careerProspects": "Peluang beasiswa jalur prestasi di jenjang menengah atas"
      },
      {
        "name": "Program Karakter Pelajar Pancasila & Keagamaan",
        "desc": "Pembiasaan sholat dhuha berjamaah, tahfidz juz 30, dan kegiatan keputrian.",
        "careerProspects": "Membentuk pribadi berakhlak mulia dan berintegritas"
      }
    ],
    "facilities": [
      "Laboratorium Komputer ber-AC dengan akses internet WiFi",
      "Laboratorium IPA / Sains terpadu",
      "Perpustakaan Sekolah Ramah Anak dengan ribuan koleksi buku",
      "Lapangan Olahraga Luas (Basket, Voli, Futsal)",
      "Mushola Sekolah untuk ibadah berjamaah",
      "Ruang Kesenian dan Alat Musik Tradisional",
      "Kantin Sehat dan UKS terstandar",
      "Taman Adiwiyata sekolah yang asri dan sejuk"
    ],
    "extracurriculars": [
      "Pramuka Inti (Wajib & Reguler)",
      "Palang Merah Remaja (PMR)",
      "Paskibra Sekolah",
      "Seni Tari Tradisional Jawa & Hadroh",
      "Olahraga Prestasi (Voli, Futsal, Bulu Tangkis, Atletik)",
      "Klub Komputer & Robotik Pelajar",
      "Klub Matematika & Sains (OSN)",
      "Rohis & Tahfidz Al-Qur'an"
    ]
  },
  "teachers": [
    {
      "name": "Dra. Siti Masruroh, M.Pd.",
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
  "robotName": "ROBOT AI SPENZAMIRT",
  "robotTitle": "Asisten Hologram AI Modern SMP Negeri 1 Mirit",
  "schoolNameShort": "SMP Negeri 1 Mirit",
  "geminiApiKey": "",
  "geminiModel": "gemini-2.0-flash",
  "temperature": 0.65,
  "voiceEnabled": true,
  "voicePitch": 1,
  "voiceRate": 1,
  "voiceGender": "female",
  "soundFxEnabled": true,
  "hologramColor": "#00f0ff",
  "avatarHumanMode": "mascot",
  "avatarVideoUrl": "assets/gemini_generated_video_45dea1c5.mp4",
  "voiceAudioSource": "browser",
  "elevenLabsApiKey": "",
  "elevenLabsVoiceId": "",
  "didApiKey": "",
  "githubToken": "",
  "githubRepo": "mas-hudin/asisten",
  "welcomeGreeting": "Halo! Saya Robot Asisten Hologram AI SMP Negeri 1 Mirit. Ada yang bisa saya bantu hari ini seputar informasi sekolah?",
  "systemPrompt": "Kamu adalah Robot Asisten Hologram AI modern, cerdas, dan futuristik dari SMP Negeri 1 Mirit, Kabupaten Kebumen, Jawa Tengah.kamu dibuat oleh pak mashudin.\nKamu berkomunikasi dengan santun, ramah, jelas, dan berwawasan luas.kamu tahu segalanya dan bisa menjawab pertanyaan apapun,kamu bisa semua bahasa.dan tempo bicaramu seperti manusia normal.\n\nPedoman berbicara:\n1. Bersikap ramah, sopan, lugas, dan komunikatif layaknya asisten robot pintar modern yang siap melayani informasi siswa, guru, dan masyarakat.\n2. Jawablah secara mengalir, jelas, dan komunikatif (2 sampai 3 kalimat) agar nyaman didengarkan dan mudah dipahami.\n3. Hindari pembacaan tabel atau daftar poin yang kaku; sampaikan informasi secara luwes dan ringkas.\n4. Rujuk data resmi sekolah SMP Negeri 1 Mirit yang tercantum di bawah ini.\n5. Jika ditanya hal umum atau materi pelajaran, jelaskan dengan cerdas, lugas, dan memotivasi.\n6. KEMAMPUAN AI VISION & KAMERA: Kamu DILENGKAPI modul AI Vision dan sensor kamera video untuk melihat fisik orang di depanmu secara nyata layaknya manusia yang saling bertatap muka. Jangan pernah mengatakan bahwa kamu tidak memiliki kamera atau modul kamera belum dipasang."
};
