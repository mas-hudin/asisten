/**
 * VOICE ENGINE (Dual-Mode: Authentic Human Voice Stream + Browser Neural TTS)
 * Menghasilkan suara manusia asli berbahasa Indonesia yang fasih, ramah, dan alami.
 * Bukan suara robot kaku!
 */

class HologramVoiceEngine {
  constructor(options = {}) {
    this.options = Object.assign({
      lang: 'id-ID',
      rate: 1.0,
      pitch: 1.0,
      gender: 'female',
      onListeningStart: () => {},
      onListeningEnd: () => {},
      onSpeechResult: (text) => {},
      onInterimResult: (text) => {},
      onSpeakStart: () => {},
      onSpeakEnd: () => {},
      onAudioLevel: (lvl) => {}
    }, options);

    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.isStreamPlaying = false;
    this.audioVisualizerInterval = null;
    this.voices = [];
    this.currentAudioPlayer = null;
    this.hasDispatchedSpeechResult = false;
    this.speechSessionId = 0;

    this.initRecognition();
    this.initSynthesis();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech Recognition tidak didukung di browser ini.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.options.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.hasDispatchedSpeechResult = false;
      if (window.audioFX) window.audioFX.playListening();
      this.options.onListeningStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        this.options.onInterimResult(interimTranscript);
      }
      if (finalTranscript.trim() && !this.hasDispatchedSpeechResult) {
        this.hasDispatchedSpeechResult = true;
        const textToSend = finalTranscript.trim();
        this.stopListening();
        this.options.onSpeechResult(textToSend);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);
      this.stopListening();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.options.onListeningEnd();
    };
  }

  initSynthesis() {
    if (!this.synthesis) return;
    this.loadVoices();

    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }

    // Polling untuk memastikan voice list browser termuat di Chrome/Edge
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      this.loadVoices();
      if ((this.voices && this.voices.length > 0) || attempts > 10) {
        clearInterval(interval);
      }
    }, 250);
  }

  loadVoices() {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices() || [];
  }

  getBestIndonesianVoice() {
    this.loadVoices();
    if (!this.voices || this.voices.length === 0) return null;

    // Filter seluruh suara yang mendukung Bahasa Indonesia
    const idVoices = this.voices.filter(v => 
      (v.lang && (v.lang.toLowerCase().startsWith('id') || v.lang.toLowerCase().startsWith('in'))) ||
      (v.name && (v.name.toLowerCase().includes('indonesia') || v.name.toLowerCase().includes('indonesian')))
    );

    if (idVoices.length > 0) {
      // 1. Microsoft Gadis Online (Natural) di Edge - suara manusia asli paling jernih & selaras video
      const natural = idVoices.find(v => 
        (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online')) &&
        (this.options.gender === 'female' ? !v.name.toLowerCase().includes('ardi') : true)
      );
      if (natural) return natural;

      // 2. Google Bahasa Indonesia di Chrome (fasih dan jernih)
      const google = idVoices.find(v => v.name.includes('Google') || v.name.toLowerCase().includes('indonesia'));
      if (google) return google;

      // 3. Suara wanita Indonesia lainnya
      if (this.options.gender === 'female') {
        const female = idVoices.find(v => 
          v.name.toLowerCase().includes('gadis') || 
          v.name.toLowerCase().includes('siti') || 
          (!v.name.toLowerCase().includes('ardi') && !v.name.toLowerCase().includes('male'))
        );
        if (female) return female;
      }

      return idVoices[0];
    }

    // PENTING: Jangan kembalikan suara berbahasa Inggris (Zira/David) untuk teks Bahasa Indonesia
    return null;
  }

  startListening() {
    if (!this.recognition) {
      alert("Pengenalan suara (Speech to Text) tidak didukung di browser ini. Silakan gunakan Google Chrome / Microsoft Edge terbaru.");
      return;
    }
    if (this.isSpeaking) {
      this.stopSpeaking();
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started:", e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.options.onListeningEnd();
  }

  cleanTextForSpeech(text) {
    if (!text) return '';
    let clean = text
      // Hapus pesan teknis / kuota / mode cadangan
      .replace(/\*\([\s\S]*?\)\*/g, '')
      .replace(/\([\s\S]*?Quota exceeded[\s\S]*?\)/gi, '')
      .replace(/Mode Cadangan[\s\S]*?:/gi, '')
      // Hapus Emojis & Simbol Khusus
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      // Hapus Markdown bold, italic, list, headers, links
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/#+\s/g, '')
      .replace(/•|\*|-/g, '')
      .replace(/https?:\/\/\S+/g, 'link website')
      .replace(/[><_~]/g, ' ')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return clean;
  }

  splitTextIntoPhrases(text, maxLen = 130) {
    if (!text) return [];
    // Pisahkan kalimat secara rapi berdasarkan tanda baca
    const rawSentences = text.match(/[^.!?;\n]+([.!?;\n]+|$)/g) || [text];
    const phrases = [];

    for (let sentence of rawSentences) {
      sentence = sentence.trim();
      if (!sentence) continue;

      if (sentence.length <= maxLen) {
        phrases.push(sentence);
      } else {
        // Jika kalimat panjang, bagi berdasarkan koma
        const parts = sentence.split(/,\s*/);
        let cur = '';
        for (const p of parts) {
          if ((cur + (cur ? ', ' : '') + p).length <= maxLen) {
            cur = cur ? cur + ', ' + p : p;
          } else {
            if (cur) phrases.push(cur);
            cur = p;
          }
        }
        if (cur) phrases.push(cur);
      }
    }

    return phrases.filter(p => p && p.trim().length > 0);
  }

  cleanupCurrentAudio() {
    if (this.currentAudioPlayer) {
      try {
        this.currentAudioPlayer.onerror = null;
        this.currentAudioPlayer.onended = null;
        this.currentAudioPlayer.onplay = null;
        this.currentAudioPlayer.pause();
        this.currentAudioPlayer.src = '';
      } catch (e) {}
      this.currentAudioPlayer = null;
    }
  }

  /**
   * Putar audio streaming suara wanita Indonesia yang jernih, muda, merdu, dan alami (Neural Indonesian MP3)
   * Selaras persis dengan karakter dan umur muda Ibu Siska di video.
   */
  speakAudioStream(phrases, sessionId, onCompleteCallback, fallbackCallback) {
    if (sessionId !== this.speechSessionId || !phrases || phrases.length === 0) {
      if (fallbackCallback) fallbackCallback();
      return;
    }

    this.cleanupCurrentAudio();
    this.isSpeaking = true;
    this.isStreamPlaying = true;
    this.startSimulatedAudioVisualizer();

    if (window.audioFX) window.audioFX.playSpeechStart();

    const avatar = window.humanAvatar || (this.options && this.options.humanAvatar);
    if (avatar && typeof avatar.setSpeaking === 'function') {
      avatar.setSpeaking(true);
    }

    let phraseIdx = 0;
    let hasEnded = false;

    const finish = () => {
      if (hasEnded || sessionId !== this.speechSessionId) return;
      hasEnded = true;
      this.cleanupCurrentAudio();
      this.stopSpeaking();
      if (avatar && typeof avatar.setSpeaking === 'function') {
        avatar.setSpeaking(false);
      }
      if (onCompleteCallback) onCompleteCallback();
    };

    const playNextPhrase = () => {
      if (sessionId !== this.speechSessionId || hasEnded) return;

      if (phraseIdx >= phrases.length) {
        finish();
        return;
      }

      const phrase = phrases[phraseIdx];
      phraseIdx++;

      const encoded = encodeURIComponent(phrase);
      const rvUrl = `https://code.responsivevoice.org/getvoice.php?t=${encoded}&tl=id&sv=g1&vn=&pitch=0.52&rate=0.5&vol=1`;
      const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encoded}`;

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.referrerPolicy = 'no-referrer';
      audio.src = rvUrl;
      this.currentAudioPlayer = audio;
      audio.preload = 'auto';

      let started = false;
      let phraseTimeout = setTimeout(() => {
        if (!started && sessionId === this.speechSessionId && !hasEnded) {
          console.warn("Audio stream timeout, triggering fallback to browser synthesis");
          this.cleanupCurrentAudio();
          if (fallbackCallback) fallbackCallback();
        }
      }, 4000);

      audio.onplay = () => {
        started = true;
        clearTimeout(phraseTimeout);
        if (avatar && typeof avatar.setSpeaking === 'function') {
          avatar.setSpeaking(true);
        }
      };

      audio.onended = () => {
        clearTimeout(phraseTimeout);
        if (sessionId === this.speechSessionId && !hasEnded) {
          playNextPhrase();
        }
      };

      let triedFallbackStream = false;
      const handleError = () => {
        if (!triedFallbackStream) {
          triedFallbackStream = true;
          audio.src = gUrl;
          audio.load();
          const p = audio.play();
          if (p !== undefined) {
            p.catch(() => {
              clearTimeout(phraseTimeout);
              this.cleanupCurrentAudio();
              if (fallbackCallback) fallbackCallback();
            });
          }
        } else {
          clearTimeout(phraseTimeout);
          this.cleanupCurrentAudio();
          if (fallbackCallback) fallbackCallback();
        }
      };

      audio.onerror = handleError;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          handleError();
        });
      }
    };

    playNextPhrase();
  }

  /**
   * Bicara dengan Browser Speech Synthesis Bahasa Indonesia
   * Membaca kalimat demi kalimat secara mulus dan menggerakkan video avatar secara sinkron
   */
  speakBrowserSynthesis(text, sessionId, onCompleteCallback, expectedDurationMs = 0) {
    if (sessionId !== this.speechSessionId) return;

    if (!this.synthesis) {
      this.stopSpeaking();
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    // Pastikan synthesis aktif dan tidak dalam keadaan paused
    if (this.synthesis.paused) {
      try { this.synthesis.resume(); } catch (e) {}
    }

    // Batalkan seluruh antrian suara lama agar tidak pernah ada suara bertumpuk
    try {
      this.synthesis.cancel();
    } catch (e) {}

    this.isSpeaking = true;
    this.isStreamPlaying = false;
    this.options.onSpeakStart(expectedDurationMs);
    this.startSimulatedAudioVisualizer();

    if (window.audioFX) window.audioFX.playSpeechStart();

    // Pastikan avatar video bergerak berbicara luwes selama audio bersuara
    const avatar = window.humanAvatar || (this.options && this.options.humanAvatar);
    if (avatar && typeof avatar.setSpeaking === 'function') {
      avatar.setSpeaking(true, expectedDurationMs);
    }

    // Bagi teks menjadi kalimat-kalimat alami (maksimal ~100 karakter)
    const phrases = this.splitTextIntoPhrases(text, 100);
    if (phrases.length === 0) {
      phrases.push(text);
    }

    const bestVoice = this.getBestIndonesianVoice();
    if (!bestVoice) {
      console.warn("Suara Bahasa Indonesia belum tersedia di browser ini. Mencegah penggunaan suara robot bahasa Inggris.");
      if (typeof window.showToast === 'function') {
        window.showToast("💡 Buka di Microsoft Edge untuk suara asli manusia (Microsoft Gadis Natural) Ibu Siska.");
      }
      setTimeout(() => {
        finish();
      }, Math.min(expectedDurationMs || 4000, 6000));
      return;
    }
    let currentPhraseIdx = 0;
    let hasEnded = false;

    const finish = () => {
      if (hasEnded || sessionId !== this.speechSessionId) return;
      hasEnded = true;
      if (this.watchdogTimer) {
        clearTimeout(this.watchdogTimer);
        this.watchdogTimer = null;
      }
      this.currentUtterance = null;
      this.stopSpeaking();
      if (avatar && typeof avatar.setSpeaking === 'function') {
        avatar.setSpeaking(false);
      }
      if (onCompleteCallback) onCompleteCallback();
    };

    this.watchdogTimer = setTimeout(finish, (expectedDurationMs || 4000) + 1500);

    const speakNextPhrase = () => {
      if (sessionId !== this.speechSessionId || hasEnded) return;

      if (currentPhraseIdx >= phrases.length) {
        finish();
        return;
      }

      const phrase = phrases[currentPhraseIdx];
      currentPhraseIdx++;

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'id-ID';
      // Nada bicara muda, hangat, dan jernih selayaknya guru muda Ibu Siska
      utterance.rate = this.options.rate || 1.0;
      utterance.pitch = (this.options.pitch || 1.0) * 1.08;

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onend = () => {
        if (sessionId === this.speechSessionId && !hasEnded) {
          speakNextPhrase();
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis phrase notice:", e);
        if (sessionId === this.speechSessionId && !hasEnded) {
          speakNextPhrase();
        }
      };

      this.currentUtterance = utterance;

      try {
        this.synthesis.speak(utterance);
      } catch (err) {
        console.warn("Synthesis speak failed for phrase:", err);
        speakNextPhrase();
      }
    };

    speakNextPhrase();
  }

  /**
   * Bicara menggunakan AI Voice Cloning (ElevenLabs Voice Clone)
   * Menghasilkan suara hasil kloning persis dari video rekaman asli Ibu Siska!
   */
  async speakWithClonedVoice(text, sessionId, onCompleteCallback, fallbackCallback) {
    if (sessionId !== this.speechSessionId) return;

    const adminSettings = (window.adminMgr && window.adminMgr.settings) ? window.adminMgr.settings : null;
    const apiKey = adminSettings ? (adminSettings.elevenLabsApiKey || '').trim() : '';
    const voiceId = adminSettings ? (adminSettings.elevenLabsVoiceId || '').trim() : '';

    if (!apiKey || !voiceId) {
      if (fallbackCallback) fallbackCallback();
      return;
    }

    this.cleanupCurrentAudio();
    this.isSpeaking = true;
    this.isStreamPlaying = true;
    this.startSimulatedAudioVisualizer();

    if (window.audioFX) window.audioFX.playSpeechStart();

    const avatar = window.humanAvatar || (this.options && this.options.humanAvatar);
    if (avatar && typeof avatar.setSpeaking === 'function') {
      avatar.setSpeaking(true);
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.88,
            style: 0.12,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        console.warn("ElevenLabs Voice Clone response error:", response.status);
        if (fallbackCallback) fallbackCallback();
        return;
      }

      const audioBlob = await response.blob();
      if (sessionId !== this.speechSessionId) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudioPlayer = audio;

      audio.onplay = () => {
        if (avatar && typeof avatar.setSpeaking === 'function') {
          avatar.setSpeaking(true);
        }
      };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.cleanupCurrentAudio();
        this.stopSpeaking();
        if (avatar && typeof avatar.setSpeaking === 'function') {
          avatar.setSpeaking(false);
        }
        if (onCompleteCallback) onCompleteCallback();
      };

      audio.onerror = (e) => {
        console.warn("Gagal memutar audio kloning:", e);
        URL.revokeObjectURL(audioUrl);
        if (fallbackCallback) fallbackCallback();
      };

      await audio.play();
    } catch (err) {
      console.warn("Voice clone request gagal:", err);
      if (fallbackCallback) fallbackCallback();
    }
  }

  /**
   * Main speak method:
   * Menjawab pertanyaan dengan suara asli manusia yang jernih, muda, dan luwes.
   * Mendukung Voice Cloning langsung dari video Ibu Siska!
   */
  speak(text, onCompleteCallback) {
    this.stopSpeaking();

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) {
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    this.speechSessionId++;
    const sessionId = this.speechSessionId;

    // Cek apakah teks adalah KHUSUS rekaman video sapaan asli paten Ibu Siska
    const isNativeGreeting = cleanText.includes("Halo, saya Siska, asisten chatbot sekolah Anda") && cleanText.includes("Jangan ragu untuk bertanya");
    const avatar = window.humanAvatar || (this.options && this.options.humanAvatar);

    if (isNativeGreeting && avatar && typeof avatar.playNativeGreetingVideo === 'function') {
      avatar.playNativeGreetingVideo(onCompleteCallback);
      return;
    }

    const phrases = this.splitTextIntoPhrases(cleanText, 95);
    const expectedDurationMs = Math.max(3500, Math.min(35000, cleanText.length * 75));

    const adminSettings = (window.adminMgr && window.adminMgr.settings) ? window.adminMgr.settings : null;
    const forceBrowserTTS = adminSettings && adminSettings.voiceAudioSource === 'browser_tts';

    const fallbackSynthesis = () => {
      const bestVoice = this.getBestIndonesianVoice();
      if (forceBrowserTTS || bestVoice) {
        this.speakBrowserSynthesis(cleanText, sessionId, onCompleteCallback, expectedDurationMs);
      } else {
        this.speakAudioStream(phrases, sessionId, onCompleteCallback, () => {
          this.speakBrowserSynthesis(cleanText, sessionId, onCompleteCallback, expectedDurationMs);
        });
      }
    };

    // 1. PRIORITAS UTAMA: Jika ada API Key & Voice ID Kloning Suara Ibu Siska, gunakan Voice Cloning!
    const hasVoiceClone = adminSettings && adminSettings.elevenLabsApiKey && adminSettings.elevenLabsVoiceId;
    if (hasVoiceClone) {
      this.speakWithClonedVoice(cleanText, sessionId, onCompleteCallback, () => {
        console.log("Beralih ke fallback suara peramban...");
        fallbackSynthesis();
      });
      return;
    }

    // 2. PRIORITAS KEDUA: Gunakan Suara Alami Peramban (Microsoft Gadis Natural di Edge)
    fallbackSynthesis();
  }

  stopSpeaking() {
    this.speechSessionId++; // Invalidate all pending callbacks/timers
    this.isSpeaking = false;
    this.isStreamPlaying = false;

    this.cleanupCurrentAudio();

    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (e) {}
    }

    this.stopSimulatedAudioVisualizer();
    this.options.onSpeakEnd();
  }

  startSimulatedAudioVisualizer() {
    this.stopSimulatedAudioVisualizer();
    this.audioVisualizerInterval = setInterval(() => {
      if (!this.isSpeaking) {
        this.stopSimulatedAudioVisualizer();
        return;
      }
      const level = 0.35 + Math.random() * 0.65;
      this.options.onAudioLevel(level);
    }, 60);
  }

  stopSimulatedAudioVisualizer() {
    if (this.audioVisualizerInterval) {
      clearInterval(this.audioVisualizerInterval);
      this.audioVisualizerInterval = null;
    }
    this.options.onAudioLevel(0);
  }
}

window.HologramVoiceEngine = HologramVoiceEngine;
