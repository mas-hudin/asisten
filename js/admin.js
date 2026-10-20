/**
 * ADMIN CMS & SCHOOL KNOWLEDGE MANAGEMENT
 * Mengelola semua data sekolah, konfigurasi Gemini AI, dan integrasi website
 */

class SchoolAdminManager {
  constructor(options = {}) {
    this.options = Object.assign({
      onDataUpdated: () => {},
      onSettingsUpdated: () => {}
    }, options);

    this.schoolData = this.loadSchoolData();
    this.settings = this.loadSettings();
    this.adminPin = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || "admin123";
    this.isAuthenticated = false;
  }

  loadSchoolData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL_DATA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile && (
          parsed.profile.name.includes("UNGGULAN") || 
          (parsed.profile.welcomeSpeech && parsed.profile.welcomeSpeech.includes("SMA")) ||
          (parsed.profile.principal && parsed.profile.principal.includes("Masruroh"))
        )) {
          parsed.profile.principal = DEFAULT_SCHOOL_DATA.profile.principal;
          if (parsed.teachers && Array.isArray(parsed.teachers)) {
            parsed.teachers.forEach(t => {
              if (t.role === "Kepala Sekolah" || (t.name && t.name.includes("Masruroh"))) {
                t.name = DEFAULT_SCHOOL_DATA.profile.principal;
              }
            });
          }
          localStorage.setItem(STORAGE_KEYS.SCHOOL_DATA, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Gagal memuat data sekolah dari storage:", e);
    }
    // Simpan default data jika belum ada ke localStorage tanpa trigger event callback
    localStorage.setItem(STORAGE_KEYS.SCHOOL_DATA, JSON.stringify(DEFAULT_SCHOOL_DATA));
    return JSON.parse(JSON.stringify(DEFAULT_SCHOOL_DATA));
  }

  saveSchoolData(data) {
    this.schoolData = data;
    localStorage.setItem(STORAGE_KEYS.SCHOOL_DATA, JSON.stringify(data));
    if (this.options && typeof this.options.onDataUpdated === 'function') {
      this.options.onDataUpdated(data);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      if (saved) {
        const parsed = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
        if (parsed.geminiModel === 'gemini-1.5-flash' || parsed.geminiModel === 'gemini-3.8-flash' || parsed.geminiModel === 'gemini-1.5-pro' || parsed.geminiModel === 'gemini-2.5-flash' || !parsed.geminiModel) {
          parsed.geminiModel = 'gemini-2.0-flash';
        }
        if (!parsed.robotName || parsed.robotName === 'Ibu Siska' || parsed.robotName.includes('Siska') || parsed.robotName === 'AURA' || parsed.robotName.includes('AURA')) {
          parsed.robotName = DEFAULT_SETTINGS.robotName;
          parsed.robotTitle = DEFAULT_SETTINGS.robotTitle;
        }
        if (!parsed.welcomeGreeting || parsed.welcomeGreeting.includes("Siska") || parsed.welcomeGreeting.includes("AURA") || parsed.welcomeGreeting.includes("SMA UNGGULAN") || parsed.welcomeGreeting.includes("Unggulan") || parsed.welcomeGreeting.includes("Senang sekali bisa berjumpa")) {
          parsed.welcomeGreeting = DEFAULT_SETTINGS.welcomeGreeting;
        }
        if (!parsed.systemPrompt || parsed.systemPrompt.includes("Ibu Siska") || parsed.systemPrompt.includes("Siska") || parsed.systemPrompt.includes("guru wanita") || !parsed.systemPrompt.includes("AI VISION")) {
          parsed.systemPrompt = DEFAULT_SETTINGS.systemPrompt;
        }
        // Pastikan visual robot modern aktif sebagai visual utama
        if (!parsed.avatarHumanMode || parsed.avatarHumanMode === 'video' || parsed.avatarHumanMode === 'photo') {
          parsed.avatarHumanMode = 'mascot';
        }
        if (!parsed.voiceAudioSource || parsed.voiceAudioSource === 'native_video' || parsed.voiceAudioSource === 'stream_tts') {
          parsed.voiceAudioSource = 'browser';
        }
        parsed.voiceEnabled = true;
        localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(parsed));
        return parsed;
      }
    } catch (e) {
      console.warn("Gagal memuat pengaturan:", e);
    }
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  saveSettings(settings) {
    this.settings = Object.assign({}, this.settings, settings);
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(this.settings));
    if (this.options && typeof this.options.onSettingsUpdated === 'function') {
      this.options.onSettingsUpdated(this.settings);
    }
  }

  authenticate(pin) {
    if (pin === this.adminPin) {
      this.isAuthenticated = true;
      return true;
    }
    return false;
  }

  changePin(oldPin, newPin) {
    if (oldPin === this.adminPin && newPin && newPin.length >= 4) {
      this.adminPin = newPin;
      localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
  }

  // Export JSON Database
  exportDatabaseJSON() {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      schoolData: this.schoolData,
      settings: {
        robotName: this.settings.robotName,
        robotTitle: this.settings.robotTitle,
        schoolNameShort: this.settings.schoolNameShort,
        geminiModel: this.settings.geminiModel,
        voiceGender: this.settings.voiceGender,
        welcomeGreeting: this.settings.welcomeGreeting,
        systemPrompt: this.settings.systemPrompt
      }
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Sekolah_AI_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Unduh File js/config.js Siap Upload ke GitHub
  exportConfigFile() {
    const safeSettings = Object.assign({}, this.settings, {
      githubToken: "",
      geminiApiKey: "",
      elevenLabsApiKey: "",
      didApiKey: ""
    });

    const content = `/**
 * CONFIG & DEFAULT SCHOOL KNOWLEDGE BASE
 * Otomatis di-generate dari Panel Admin Sekolah
 * File ini menjadi database bawaan bagi seluruh pengunjung website sekolah / GitHub.
 */

const STORAGE_KEYS = {
  SCHOOL_DATA: 'hologram_school_data_v1',
  APP_SETTINGS: 'hologram_ai_settings_v1',
  CHAT_HISTORY: 'hologram_chat_history_v1',
  ADMIN_PIN: 'hologram_admin_pin_v1'
};

const DEFAULT_SCHOOL_DATA = ${JSON.stringify(this.schoolData, null, 2)};

const DEFAULT_SETTINGS = ${JSON.stringify(safeSettings, null, 2)};
`;
    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import JSON Database
  importDatabaseJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.schoolData) {
        this.saveSchoolData(parsed.schoolData);
      }
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Reset to default sample school
  resetToDefault() {
    this.saveSchoolData(JSON.parse(JSON.stringify(DEFAULT_SCHOOL_DATA)));
    this.saveSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
  }

  // Sinkronisasi otomatis online langsung ke GitHub Repository via GitHub API
  async syncToGitHub(customData = null, customSettings = null) {
    const data = customData || this.schoolData;
    const settings = customSettings || this.settings;
    const token = (settings.githubToken || localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN) || '').trim();
    const repo = (settings.githubRepo || localStorage.getItem(STORAGE_KEYS.GITHUB_REPO) || 'mas-hudin/asisten').trim();

    if (!token) {
      return { success: false, noToken: true, message: "GitHub Token belum diisi di Panel Admin." };
    }

    try {
      const path = 'js/config.js';
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

      // 1. Ambil info file saat ini untuk dapat SHA commit
      const getRes = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      let sha = null;
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 2. Amankan settings: Hapus GitHub Token & API Key dari file yang di-commit ke repository publik
      // agar tidak diblokir oleh proteksi keamanan GitHub Push Protection (Secret Scanning).
      // Token & API Key tetap aman tersimpan di browser Admin Anda (localStorage).
      const safeSettings = Object.assign({}, settings, {
        githubToken: "",
        geminiApiKey: "",
        elevenLabsApiKey: "",
        didApiKey: ""
      });

      // 3. Susun isi file config.js baru
      const content = `/**
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

const DEFAULT_SCHOOL_DATA = ${JSON.stringify(data, null, 2)};

const DEFAULT_SETTINGS = ${JSON.stringify(safeSettings, null, 2)};
`;

      // 3. Encode base64 yang aman untuk UTF-8
      const encoded = btoa(unescape(encodeURIComponent(content)));

      const putBody = {
        message: 'Pembaruan data sekolah otomatis dari Panel Admin',
        content: encoded
      };
      if (sha) putBody.sha = sha;

      // 4. Kirim update ke GitHub API
      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(putBody)
      });

      if (putRes.ok) {
        return { success: true, message: `Berhasil! Data sekolah otomatis ter-upload ke GitHub (${repo}) dan langsung online di website sekolah!` };
      } else {
        const err = await putRes.json().catch(() => ({}));
        return { success: false, message: `Gagal memperbarui file di GitHub: ${err.message || putRes.statusText}` };
      }
    } catch (e) {
      return { success: false, message: `Koneksi ke GitHub API gagal: ${e.message}` };
    }
  }

  // Quick Test Gemini API Connection with Smart Discovery & Auto-Fallback
  async testGeminiConnection(apiKey, requestedModel) {
    if (!apiKey) return { success: false, message: "API Key masih kosong! Silakan isi API Key Anda dari Google AI Studio." };

    let availableModels = [];

    // 1. Hubungi endpoint resmi Google API untuk memvalidasi kunci dan mengambil daftar model aktif
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!listRes.ok) {
        const err = await listRes.json().catch(() => ({}));
        const errMsg = err.error ? err.error.message : `HTTP ${listRes.status}`;
        if (errMsg.toLowerCase().includes('api key not valid') || listRes.status === 400) {
          return { success: false, message: "API Key tidak valid! Pastikan Anda menyalin seluruh karakter kunci tanpa spasi dari Google AI Studio." };
        }
        return { success: false, message: `Gagal memverifikasi API Key: ${errMsg}` };
      }

      const listData = await listRes.json();
      availableModels = (listData.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
    } catch (e) {
      return { success: false, message: `Gagal menghubungi server Google Gemini: ${e.message}` };
    }

    if (availableModels.length === 0) {
      return { success: false, message: "API Key terhubung, namun akun Google AI Studio Anda tidak memiliki model aktif untuk generate content." };
    }

    // 2. Susun urutan model prioritas:
    // Prioritaskan model produksi 1.500x/hari (gemini-2.0-flash), HINDARI gemini-3.8-flash (karena batas 20x/hari)
    const priorityList = [
      requestedModel,
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ].filter(Boolean);

    // Tambahkan model Flash lain dari akun user yang belum ada di priorityList
    const flashFromAccount = availableModels.filter(m => m.includes('flash') && m !== 'gemini-3.8-flash' && !priorityList.includes(m));
    const allCandidates = [...new Set([...priorityList, ...flashFromAccount])];

    let lastErrorMessage = "";
    let isQuotaIssue = false;

    for (const model of allCandidates) {
      // Hanya tes model jika memang terdaftar di akun user
      if (!availableModels.includes(model)) continue;

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Halo, tes koneksi." }] }]
          })
        });

        if (res.ok) {
          const isRequested = model === requestedModel;
          const msg = isRequested
            ? `Koneksi Berhasil! Model aktif: ${model} (Kuota 1.500 Request/Hari Gratis dari Google AI Studio siap digunakan).`
            : `Koneksi Berhasil! Model dialihkan ke ${model} (Model resmi stabil dengan kuota 1.500 Request/Hari gratis).`;

          return {
            success: true,
            workingModel: model,
            availableModels: availableModels,
            message: msg
          };
        }

        const err = await res.json().catch(() => ({}));
        const rawErr = err.error ? err.error.message : `HTTP ${res.status}`;
        lastErrorMessage = rawErr;
        if (rawErr.toLowerCase().includes('quota') || rawErr.includes('429')) {
          isQuotaIssue = true;
        }
      } catch (e) {
        lastErrorMessage = e.message;
      }
    }

    // 3. Jika seluruh model Flash utama gagal
    if (isQuotaIssue) {
      return {
        success: false,
        message: `Kuota gratis harian Google AI Studio untuk API Key ini telah habis. Sistem secara otomatis menggunakan Mesin Cerdas Offline Data Sekolah untuk menjawab pertanyaan siswa tanpa kendala!`
      };
    }

    return {
      success: false,
      message: `Gagal menghubungkan model (${lastErrorMessage}). Silakan pilih model lain dari daftar.`
    };
  }
}

window.SchoolAdminManager = SchoolAdminManager;
