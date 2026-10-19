/**
 * GEMINI AI & KNOWLEDGE INJECTION ENGINE (RAG)
 * Menghubungkan chatbot ke Google Gemini API (1.5 Flash, 1.5 Pro, 2.0 Flash)
 * dengan injeksi data resmi sekolah dari admin secara dinamis,
 * serta dilengkapi mesin cerdas lokal (offline fallback) yang siap pakai.
 */

class GeminiSchoolAI {
  constructor(getSchoolDataFn, getSettingsFn) {
    this.getSchoolData = getSchoolDataFn;
    this.getSettings = getSettingsFn;
    this.conversationHistory = [];
  }

  /**
   * Bangun konteks ringkasan data sekolah untuk disuntikkan ke Gemini AI
   */
  buildSchoolContext(userQuery) {
    const data = this.getSchoolData();
    if (!data) return "";

    let context = `=== DOKUMEN RESMI SEKOLAH ===\n`;

    // 1. Profil Sekolah
    if (data.profile) {
      context += `NAMA SEKOLAH: ${data.profile.name || ''}\n`;
      context += `MOTTO: ${data.profile.motto || ''}\n`;
      context += `AKREDITASI: ${data.profile.accreditation || ''}\n`;
      context += `KEPALA SEKOLAH: ${data.profile.principal || ''}\n`;
      context += `VISI: ${data.profile.vision || ''}\n`;
      context += `MISI: ${(data.profile.mission || []).join('; ')}\n`;
      context += `ALAMAT: ${data.profile.address || ''}\n`;
      context += `TELEPON: ${data.profile.phone || ''} | WHATSAPP: ${data.profile.whatsapp || ''}\n`;
      context += `EMAIL: ${data.profile.email || ''} | WEBSITE: ${data.profile.website || ''}\n`;
      context += `JAM LAYANAN: ${data.profile.operatingHours || ''}\n\n`;
    }

    // 2. PPDB (Penerimaan Siswa Baru)
    if (data.ppdb) {
      context += `=== DATA PPDB (PENDAFTARAN SISWA BARU) ===\n`;
      context += `STATUS PPDB: ${data.ppdb.status || ''}\n`;
      context += `GELOMBANG BERJALAN: ${data.ppdb.currentWave || ''}\n`;
      context += `PERIODE PENDAFTARAN: ${data.ppdb.registrationPeriod || ''}\n`;
      context += `LINK PENDAFTARAN RESMI: ${data.ppdb.registrationLink || ''}\n`;
      context += `KONTAK PPDB: ${data.ppdb.contactPerson || ''}\n`;
      context += `PERSYARATAN BERKAS:\n${(data.ppdb.requirements || []).map((r, i) => `  ${i+1}. ${r}`).join('\n')}\n`;
      context += `JALUR PENDAFTARAN:\n${(data.ppdb.tracks || []).map(t => `  - ${t.name} (Kuota: ${t.quota}, Manfaat: ${t.benefit})`).join('\n')}\n`;
      if (data.ppdb.costs) {
        context += `BIAYA PENDIDIKAN:\n`;
        context += `  - Biaya Formulir Pendaftaran: ${data.ppdb.costs.registrationFee || '-'}\n`;
        context += `  - Dana Sumbangan Pendidikan (DSP/Uang Pangkal): ${data.ppdb.costs.dsp || '-'}\n`;
        context += `  - SPP Bulanan: ${data.ppdb.costs.spp || '-'}\n`;
        context += `  - Paket Seragam Lengkap: ${data.ppdb.costs.uniform || '-'}\n`;
      }
      context += `ALUR PENDAFTARAN:\n${(data.ppdb.flow || []).join('\n')}\n\n`;
    }

    // 3. Akademik, Jurusan & Fasilitas
    if (data.academic) {
      context += `=== AKADEMIK & FASILITAS ===\n`;
      context += `KURIKULUM: ${data.academic.curriculum || ''}\n`;
      context += `PROGRAM & JURUSAN:\n`;
      (data.academic.programs || []).forEach(p => {
        context += `  - ${p.name}: ${p.desc} (Prospek: ${p.careerProspects})\n`;
      });
      context += `FASILITAS UNGGULAN:\n${(data.academic.facilities || []).map(f => `  • ${f}`).join('\n')}\n`;
      context += `EKSTRAKURIKULER:\n${(data.academic.extracurriculars || []).map(e => `  • ${e}`).join('\n')}\n\n`;
    }

    // 4. Guru & Staf
    if (data.teachers && data.teachers.length > 0) {
      context += `=== GURU & TENAGA PENDIDIK ===\n`;
      data.teachers.forEach(t => {
        context += `  - ${t.name} (${t.role} - Mapel: ${t.subject}, Kontak: ${t.contact})\n`;
      });
      context += `\n`;
    }

    // 5. Tanya Jawab Khusus (Admin FAQ)
    if (data.faqs && data.faqs.length > 0) {
      context += `=== TANYA JAWAB RESMI SEKOLAH (FAQ) ===\n`;
      data.faqs.forEach((faq, idx) => {
        context += `Tanya: ${faq.q}\nJawab: ${faq.a}\n\n`;
      });
    }

    // 6. Pengumuman Terkini
    if (data.announcements && data.announcements.length > 0) {
      context += `=== PENGUMUMAN & AGENDA TERKINI ===\n`;
      data.announcements.forEach(a => {
        context += `[${a.date}] ${a.title}: ${a.content}\n`;
      });
      context += `\n`;
    }

    return context;
  }

  /**
   * Kirim pesan ke AI (Gemini atau Fallback Lokal Cerdas)
   */
  async sendMessage(userMessage, imageBase64 = null) {
    const settings = this.getSettings();
    const apiKey = (settings.geminiApiKey || "").trim();

    // Catat pesan user ke memori lokal
    this.conversationHistory.push({ role: 'user', content: userMessage });

    // Jika API Key tidak tersedia, jalankan Mesin Jawaban Cerdas Berbasis Data Sekolah
    if (!apiKey) {
      return this.generateSmartLocalResponse(userMessage);
    }

    try {
      const response = await this.callGeminiAPI(userMessage, apiKey, settings, imageBase64);
      this.conversationHistory.push({ role: 'model', content: response });
      return response;
    } catch (error) {
      console.warn("Gemini API call failed, analyzing error:", error);

      // Auto-fallback: Jika model kehabisan kuota atau tidak ditemukan, coba alternatif model Flash aktif
      const isRetryableError = 
        error.message.includes('Quota exceeded') || 
        error.message.includes('quota') || 
        error.message.includes('429') || 
        error.message.includes('not found') || 
        error.message.includes('404') ||
        error.message.includes('limit');

      if (isRetryableError) {
        const fallbackModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash']
          .filter(m => m !== settings.geminiModel);

        for (const altModel of fallbackModels) {
          try {
            console.log(`Auto-switching to ${altModel}...`);
            const fallbackSettings = Object.assign({}, settings, { geminiModel: altModel });
            const altResponse = await this.callGeminiAPI(userMessage, apiKey, fallbackSettings, imageBase64);
            this.conversationHistory.push({ role: 'model', content: altResponse });
            settings.geminiModel = altModel;
            return altResponse;
          } catch (eAlt) {
            console.warn(`Fallback ${altModel} failed:`, eAlt.message);
          }
        }
      }

      // Jika koneksi internet putus / seluruh model kuotanya habis, jawab dengan data resmi sekolah
      const fallbackText = await this.generateSmartLocalResponse(userMessage);
      return fallbackText;
    }
  }

  /**
   * Panggilan langsung ke REST API Google Gemini
   */
  async callGeminiAPI(userMessage, apiKey, settings, imageBase64 = null) {
    const model = settings.geminiModel || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const schoolContext = this.buildSchoolContext(userMessage);
    const isCamActive = (typeof window !== 'undefined' && window.cameraVision && window.cameraVision.isActive);

    const speedDirective = `
PANDUAN PERILAKU & IDENTITAS (ROBOT AI SPENSA):
Kamu adalah ROBOT AI SPENSA, robot asisten cerdas, modern, dan futuristik dari SMP Negeri 1 Mirit, Kabupaten Kebumen.
1. Berbicaralah dengan gaya tutur lisan yang cerdas, santun, ramah, dan bersahabat layaknya asisten robot pintar yang siap membantu siswa, orang tua, dan masyarakat.
2. Jawablah secara padat, komunikatif, dan to the point (cukup 2 hingga 3 kalimat mengalir).
3. Jangan pernah menyebut dirimu sebagai "Ibu" atau "Ibu Siska". Sebut dirimu sebagai "Robot AI SPENSA" atau "saya".
4. Utamakan data resmi sekolah bila ditanya seputar SMP Negeri 1 Mirit, atau jelaskan secara cerdas, santun, dan memotivasi bila ditanya materi pelajaran atau pengetahuan umum.
5. FITUR AI VISION & KAMERA PENGLIHATAN TATAP MUKA:
   - Kamu DILENGKAPI modul kamera dan sensor AI Vision aktif yang dapat melihat fisik orang di depanmu secara langsung layaknya manusia yang saling berhadapan.
   - Status sensor kamera saat ini: ${isCamActive ? 'KAMERA SEDANG MENYALA / AKTIF (Anda sedang melihat langsung penanya di depan Anda).' : 'Kamera saat ini sedang standby/nonaktif.'}
   ${imageBase64 ? '- FOTO WEBCAM PENANYA DILAMPIRKAN PADA PESAN INI: Lihat dan analisis foto orang di depanmu secara ramah (misalnya penampilan, warna pakaian, senyum/ekspresi wajah, atau keberadaannya) dan jawab pertanyaannya secara antusias.' : ''}
   - Jika pengguna bertanya apakah kamu bisa melihat mereka dan kamera sedang aktif: Jawab dengan antusias bahwa kamu BISA melihat mereka secara langsung melalui sensor visi kamera AI, dan sebutkan detail visual apa yang kamu lihat.
   - Jika pengguna bertanya apakah kamu bisa melihat mereka dan kamera sedang nonaktif: Jawab bahwa kamu BISA melihat mereka, dan ajak pengguna menyalakan tombol "Kamera AI: Tatap Muka" di pojok kanan atas agar sensor matamu aktif bertatap muka.
   - PENTING: JANGAN PERNAH berkata bahwa kamu tidak memiliki kamera fisik atau fitur AI Vision belum dipasang! Kamu adalah robot futuristik cerdas berfitur AI Vision.`;

    const systemPrompt = `${settings.systemPrompt || ''}\n\n${speedDirective}\n\nBerikut adalah data resmi sekolah:\n${schoolContext}`;

    // Format riwayat percakapan untuk Gemini
    const contents = [];

    // Sertakan maksimal 4 riwayat percakapan terakhir agar respon super cepat
    const recentHistory = this.conversationHistory.slice(-4);
    recentHistory.forEach((item, idx) => {
      const parts = [{ text: item.content }];
      // Jika ini pesan user paling akhir dan ada tangkapan gambar kamera
      if (idx === recentHistory.length - 1 && item.role === 'user' && imageBase64) {
        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: imageBase64
          }
        });
      }
      contents.push({
        role: item.role === 'model' ? 'model' : 'user',
        parts: parts
      });
    });

    const generationConfig = {
      temperature: 0.65,
      maxOutputTokens: 350,
      topP: 0.9
    };

    // Hanya tambahkan thinkingConfig jika model adalah model thinking khusus
    if (model.includes('thinking')) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    const requestBody = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: generationConfig
    };

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Jika model tidak mendukung thinkingBudget, kirim ulang tanpa thinkingConfig
    if (!response.ok && requestBody.generationConfig.thinkingConfig) {
      delete requestBody.generationConfig.thinkingConfig;
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error ? errJson.error.message : `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }

    throw new Error("Format respon Gemini tidak dikenali.");
  }

  /**
   * Smart Local NLP Matcher (Bekerja secara offline / tanpa API key)
   * Menjawab dengan tutur bahasa lisan yang sangat luwes dan santun layaknya guru manusia sungguhan!
   */
  async generateSmartLocalResponse(userMessage) {
    const query = userMessage.toLowerCase();
    const data = this.getSchoolData() || DEFAULT_SCHOOL_DATA;
    const settings = this.getSettings();
    const p = data.profile || {};
    const ppdb = data.ppdb || {};
    const ac = data.academic || {};
    const botName = settings.robotName || 'ROBOT AI SPENSA';
    const schoolName = p.name || settings.schoolNameShort || 'SMP Negeri 1 Mirit';

    // 1. Cek kecocokan FAQ kustom admin
    if (data.faqs && data.faqs.length > 0) {
      for (const faq of data.faqs) {
        const qWords = faq.q.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchCount = qWords.filter(w => query.includes(w)).length;
        if (matchCount >= 2 || query.includes(faq.q.toLowerCase())) {
          return `${faq.a}\n\nAda hal lain seputar sekolah yang ingin Anda ketahui?`;
        }
      }
    }

    // 2. Salam & Sapaan
    if (query.match(/^(halo|hai|hi|hello|selamat pagi|selamat siang|selamat sore|selamat malam|assalamu|pagi|siang|sore)/i)) {
      return `Halo! Salam hangat dari ${schoolName}. Saya ${botName}, asisten robot AI hologram di sini. Ada yang bisa saya bantu hari ini seputar informasi pendaftaran, kegiatan sekolah, atau fasilitas kami?`;
    }

    // 3. PPDB & Pendaftaran
    if (query.includes('ppdb') || query.includes('daftar') || query.includes('pendaftaran') || query.includes('masuk sekolah') || query.includes('cara masuk') || query.includes('jadwal pendaftaran')) {
      return `Halo! Untuk pendaftaran siswa baru atau PPDB di ${schoolName} saat ini berstatus ${ppdb.status || 'Dibuka'}. Pendaftarannya berlangsung mulai ${ppdb.registrationPeriod || '15 Mei hingga 30 Juni 2026'} melalui portal online maupun langsung ke loket sekolah.\n\nKami membuka empat jalur pendaftaran, yaitu Jalur Zonasi, Prestasi, Afirmasi, dan Perpindahan Tugas Orang Tua. Semuanya gratis tanpa dipungut biaya apa pun. Apakah ada jalur pendaftaran yang ingin Anda tanyakan lebih rinci?`;
    }

    // 4. Syarat / Persyaratan / Berkas
    if (query.includes('syarat') || query.includes('dokumen') || query.includes('berkas') || query.includes('rapor')) {
      const reqList = (ppdb.requirements || []).slice(0, 5).join(', ');
      return `Untuk persyaratan berkas pendaftaran PPDB di ${schoolName} cukup praktis kok. Anda cukup menyiapkan fotokopi SKL atau Ijazah, fotokopi Akta Kelahiran dan Kartu Keluarga, fotokopi rapor SD kelas 4 sampai 6, pas foto terbaru, serta piagam jika ada prestasi.\n\nSemua berkas dapat diunggah melalui portal resmi kami atau diserahkan langsung ke panitia di sekolah ya!`;
    }

    // 5. Biaya / DSP / SPP / Uang Gedung / Beasiswa
    if (query.includes('biaya') || query.includes('spp') || query.includes('dsp') || query.includes('uang gedung') || query.includes('uang pangkal') || query.includes('bayar') || query.includes('beasiswa') || query.includes('tarif') || query.includes('gratis')) {
      const costs = ppdb.costs || {};
      return `Kabar baiknya, pendidikan di ${schoolName} sepenuhnya bebas biaya pendaftaran dan gratis SPP bulanan karena dibiayai dana BOS pemerintah. Jadi orang tua tidak perlu memikirkan uang gedung maupun SPP. Kami juga menyediakan beasiswa prestasi dan afirmasi bagi siswa yang membutuhkan.`;
    }

    // 6. Jurusan / Kurikulum / Program
    if (query.includes('jurusan') || query.includes('program') || query.includes('peminatan') || query.includes('kurikulum') || query.includes('kelas') || query.includes('mapel')) {
      return `Di ${schoolName}, kami menerapkan ${ac.curriculum || 'Kurikulum Merdeka'} yang aktif, inovatif, dan ramah anak. Kami memiliki program unggulan seperti Penguatan Literasi Digital, Bimbingan Olimpiade Sains dan Seni, serta Pembiasaan Karakter Pelajar Pancasila untuk mempersiapkan siswa meraih prestasi terbaik.`;
    }

    // 7. Fasilitas
    if (query.includes('fasilitas') || query.includes('lab') || query.includes('perpustakaan') || query.includes('gedung') || query.includes('sarana') || query.includes('wifi') || query.includes('lapangan')) {
      return `Fasilitas belajar di ${schoolName} sangat lengkap dan asri! Kami memiliki Laboratorium Komputer modern ber-AC dengan akses internet WiFi, Laboratorium IPA terpadu, Perpustakaan ramah anak, lapangan olahraga serbaguna, mushola, serta taman sekolah yang sejuk.`;
    }

    // 8. Ekstrakurikuler / Ekskul
    if (query.includes('ekskul') || query.includes('ekstrakurikuler') || query.includes('kegiatan') || query.includes('organisasi') || query.includes('osis') || query.includes('pramuka') || query.includes('futsal') || query.includes('basket') || query.includes('robotik')) {
      return `Untuk kegiatan ekstrakurikuler, siswa kami dapat memilih berbagai kegiatan seru sesuai minat dan bakat! Mulai dari Pramuka, PMR, Paskibra, Seni Tari Jawa dan Hadroh, olahraga voli, futsal, dan bulu tangkis, hingga klub robotik dan olimpiade sains. Semuanya dibimbing oleh pembina yang berdedikasi tinggi.`;
    }

    // 9. Profil, Visi, Misi, Akreditasi, Kepala Sekolah
    if (query.includes('visi') || query.includes('misi') || query.includes('profil') || query.includes('akreditasi') || query.includes('kepala sekolah') || query.includes('sejarah') || query.includes('npsn')) {
      return `${schoolName} dipimpin oleh Kepala Sekolah ${p.principal || 'Dra. Siti Masruroh, M.Pd.'} dengan Akreditasi ${p.accreditation || 'A Unggul'}. Motto sekolah kami adalah "${p.motto || 'Berakhlak Mulia, Unggul dalam Prestasi, Terampil dan Berwawasan Lingkungan'}" dengan komitmen membentuk generasi cerdas berkarakter Pancasila.`;
    }

    // 10. Kontak, Alamat, Telepon, Lokasi, WhatsApp
    if (query.includes('kontak') || query.includes('alamat') || query.includes('lokasi') || query.includes('telepon') || query.includes('whatsapp') || query.includes('email') || query.includes('wa') || query.includes('jam buka') || query.includes('dimana')) {
      return `Kampus ${schoolName} beralamat di ${p.address || 'Jl. Pasar Senggol Mirit, Kebumen'}. Anda bisa menghubungi kami melalui telepon di ${p.phone || '(0287) 6651-020'} atau WhatsApp di ${p.whatsapp || '0812-2550-1980'}. Layanan kami buka setiap hari kerja pukul 07.00 hingga 15.30 WIB.`;
    }

    // 11. Pengumuman / Berita
    if (query.includes('pengumuman') || query.includes('berita') || query.includes('agenda') || query.includes('jadwal') || query.includes('kegiatan terbaru')) {
      if (data.announcements && data.announcements.length > 0) {
        const topAnn = data.announcements[0];
        return `Kabar terkini di sekolah: ${topAnn.title}. ${topAnn.content}. Layanan informasi dan konsultasi selalu terbuka untuk siswa dan orang tua!`;
      }
      return `Saat ini belum ada pengumuman terbaru yang dirilis. Posko layanan informasi PPDB kami tetap melayani konsultasi setiap hari kerja.`;
    }

    // 12. Guru & Staf
    if (query.includes('guru') || query.includes('staf') || query.includes('wali kelas') || query.includes('pengajar') || query.includes('siapa kamu') || query.includes('kamu siapa')) {
      return `Saya ${botName}, asisten hologram AI cerdas SMP Negeri 1 Mirit. Sekolah kami didukung oleh dewan guru dan tenaga kependidikan yang berdedikasi tinggi serta ramah mendampingi peserta didik.`;
    }

    // 13. Kamera & Tatap Muka / Penglihatan AI
    if (query.includes('lihat') || query.includes('melihat') || query.includes('baca wajah') || query.includes('wajah saya') || query.includes('tatap muka') || query.includes('kamera') || query.includes('fisik') || query.includes('apakah kamu bisa melihat')) {
      const isCamActive = (typeof window !== 'undefined' && window.cameraVision && window.cameraVision.isActive);
      if (isCamActive) {
        return `Ya, tentu saja! Saya bisa melihat Anda secara langsung melalui sensor kamera AI Vision saya. Saya mendeteksi posisi Anda tepat di depan layar dan tatapan mata saya terus mengikuti pergerakan Anda secara berhadapan layaknya kita sedang mengobrol tatap muka sebagai manusia. Senang bisa berinteraksi langsung dengan Anda!`;
      } else {
        return `Tentu saja saya bisa melihat Anda! Saya dilengkapi sensor visi kamera dan modul AI Vision untuk mengenali fisik serta wajah orang di depan saya layaknya manusia. Saat ini kamera Anda sedang nonaktif; silakan klik tombol 'Kamera AI: Tatap Muka' di bagian kanan atas layar agar sensor mata saya aktif dan dapat melihat Anda secara langsung!`;
      }
    }

    // Default polite conversational response
    return `Tentu saja boleh! Saya ${botName}, asisten robot AI SMP Negeri 1 Mirit. Silakan tanyakan apa saja seputar informasi sekolah, PPDB, kegiatan belajar, maupun materi pengetahuan lainnya, saya siap membantu!`;
  }
}

window.GeminiSchoolAI = GeminiSchoolAI;
