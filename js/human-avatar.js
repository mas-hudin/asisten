/**
 * REAL HUMAN TALKING AVATAR ENGINE (IBU SISKA - SMPN 1 MIRIT)
 * Mengelola avatar video manusia hidup yang luwes dan alami:
 * - Mode Video Nyata: Memainkan video asli Ibu Siska saat berbicara dengan sinkronisasi suara
 * - Posisi Idle Anggun: Berdiri tenang dan tersenyum ramah siap menyapa pengunjung
 * - Transisi Halus: Saat selesai menjawab, kembali anggun ke pose siap tanpa terhenti kaku
 * - Indikator Responsif: Status badge (SIAP, MEMPROSES, BERBICARA) & Equalizer Waveform
 */

class HumanTalkingAvatar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isSpeaking = false;
    this.isThinking = false;
    this.audioLevel = 0;
    this.animFrameId = null;
    this.avatarMode = 'video'; // 'video' (default utama), 'photo', 'did'
    this.defaultVideoSrc = 'assets/gemini_generated_video_45dea1c5.mp4';
    this.currentVideoSrc = this.defaultVideoSrc;

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.stage = document.getElementById('human-full-stage');
    if (!this.stage) {
      this.renderDOM();
    } else {
      this.bindElements();
    }
    this.startAnimationLoop();
  }

  bindElements() {
    this.stage = document.getElementById('human-full-stage');
    this.fullBody = document.getElementById('human-full-body');
    this.basePhoto = document.getElementById('human-base-photo');
    this.liveVideo = document.getElementById('human-live-video');
    this.didVideo = document.getElementById('did-live-video');
    this.bgAura = document.getElementById('human-bg-aura');
    this.ambientLight = document.getElementById('human-ambient-light');
    this.voiceBadge = document.getElementById('human-voice-eq-badge');
    this.statusBadge = document.getElementById('human-status-badge');
    this.nameDisplay = document.getElementById('human-name-display');
    this.titleDisplay = document.getElementById('human-title-display');

    if (this.liveVideo) {
      this.setupVideoEvents();
    }

    if (this.stage) {
      this.stage.onclick = () => {
        if (!this.isSpeaking) {
          this.playNativeGreetingVideo();
        }
      };
    }
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="human-full-stage" id="human-full-stage">
        <!-- Ambient Glowing Aura -->
        <div class="human-bg-aura" id="human-bg-aura"></div>

        <!-- Full Body Human Frame -->
        <div class="human-full-body" id="human-full-body">
          <!-- 1. Foto Resmi Guru (Cadangan jika video tidak didukung) -->
          <img src="assets/siska.png" alt="Ibu Siska SMPN 1 Mirit" class="human-base-photo" id="human-base-photo" style="display: none;">

          <!-- 2. Video Manusia Hidup (Real Human Video Avatar dari Folder Assets) -->
          <video 
            class="human-live-video" 
            id="human-live-video" 
            src="${this.defaultVideoSrc}"
            loop 
            muted 
            playsinline 
            preload="auto"
            style="display: block;"
          >
            <source src="${this.defaultVideoSrc}" type="video/mp4">
            <source src="assets/siska-video.mp4" type="video/mp4">
          </video>

          <!-- 3. D-ID WebRTC Live AI Video Stream (Opsional) -->
          <video class="did-live-video" id="did-live-video" autoplay playsinline style="display: none;"></video>

          <!-- Ambient Voice Glow on Speech -->
          <div class="human-ambient-light" id="human-ambient-light"></div>
        </div>

        <!-- Human Caption Tag at Bottom of Stage -->
        <div class="human-caption-tag" id="human-caption-tag">
          <h3 id="human-name-display">Ibu Siska</h3>
          <p id="human-title-display">Duta Virtual & Guru SMP Negeri 1 Mirit</p>
        </div>

        <!-- Voice Equalizer Badge on Top Right -->
        <div class="human-voice-eq-badge" id="human-voice-eq-badge">
          <span class="eq-dot"></span>
          <div class="mini-eq-bars">
            <span></span><span></span><span></span><span></span>
          </div>
          <span id="human-status-badge">SIAP</span>
        </div>
      </div>
    `;

    this.bindElements();
  }

  setupVideoEvents() {
    const video = this.liveVideo;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;

    const onReady = () => {
      video.style.display = 'block';
      if (this.basePhoto) this.basePhoto.style.display = 'none';
      if (this.stage) this.stage.classList.add('video-loaded');
      if (!this.isSpeaking && video.paused) {
        try {
          video.currentTime = 0.05;
        } catch (e) {}
      }
    };

    video.addEventListener('loadedmetadata', onReady, { once: true });
    video.addEventListener('canplay', () => {
      video.style.display = 'block';
      if (this.basePhoto) this.basePhoto.style.display = 'none';
    }, { once: true });

    video.addEventListener('error', (err) => {
      console.warn("Video avatar gagal dimuat, mencoba cadangan siska-video.mp4:", err);
      if (video.src && !video.src.includes('siska-video.mp4')) {
        video.src = 'assets/siska-video.mp4';
        video.load();
      } else {
        video.style.display = 'none';
        if (this.basePhoto) this.basePhoto.style.display = 'block';
      }
    });

    if (video.readyState >= 2) {
      onReady();
    }
  }

  /**
   * Set status saat AI sedang berpikir / memproses jawaban
   */
  setThinking(thinking) {
    this.isThinking = thinking;
    if (this.statusBadge && !this.isSpeaking) {
      this.statusBadge.textContent = thinking ? 'MEMPROSES...' : 'SIAP';
    }
    if (this.bgAura) {
      if (thinking) {
        this.bgAura.classList.add('thinking');
      } else {
        this.bgAura.classList.remove('thinking');
      }
    }
  }

  /**
   * Kontrol status saat berbicara
   * Ketika berbicara, video diputar secara luwes & hidup persis manusia!
   * @param {boolean} speaking Status apakah sedang berbicara
   * @param {number} [durationMs=0] Durasi minimal video bergerak aktif (ms)
   */
  setSpeaking(speaking, durationMs = 0) {
    this.isSpeaking = speaking;
    if (speaking) this.isThinking = false;

    if (this.speakingWatchdogTimer) {
      clearTimeout(this.speakingWatchdogTimer);
      this.speakingWatchdogTimer = null;
    }

    // Stage Speaking Class
    if (this.stage) {
      if (speaking) {
        this.stage.classList.add('speaking');
      } else {
        this.stage.classList.remove('speaking');
      }
    }

    // Status Badge
    if (this.voiceBadge) {
      if (speaking) {
        this.voiceBadge.classList.add('active');
      } else {
        this.voiceBadge.classList.remove('active');
      }
    }
    if (this.statusBadge) {
      this.statusBadge.textContent = speaking ? 'BERBICARA' : 'SIAP';
    }

    // Background Aura
    if (this.bgAura) {
      if (speaking) {
        this.bgAura.classList.add('active');
        this.bgAura.classList.remove('thinking');
      } else {
        this.bgAura.classList.remove('active');
      }
    }

    // Video Playback Control: Putar video manusia hidup dengan luwes
    if (this.liveVideo && this.avatarMode === 'video') {
      if (speaking) {
        this.liveVideo.muted = true;
        this.liveVideo.loop = true;
        const playPromise = this.liveVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay notice, retrying muted:", err);
            this.liveVideo.muted = true;
            this.liveVideo.play().catch(() => {});
          });
        }

        // Jika ada durasi waktu bicara, jaga agar video tetap berbicara
        if (durationMs > 0) {
          this.speakingWatchdogTimer = setTimeout(() => {
            if (this.isSpeaking) {
              this.setSpeaking(false);
            }
          }, durationMs);
        }
      } else {
        // Berhenti berbicara: pause video & kembalikan secara halus ke frame awal (pose senyum ramah)
        this.liveVideo.pause();
        try {
          this.liveVideo.currentTime = 0.05;
        } catch (e) {}
      }
    }
  }

  /**
   * Putar video asli Ibu Siska lengkap dengan SUARA ASLI manusia dari video di folder assets!
   * Ini langsung membuktikan video berbicara luwes persis manusia di depan pengguna.
   */
  playNativeGreetingVideo(onEndedCallback) {
    if (!this.liveVideo) {
      if (typeof onEndedCallback === 'function') onEndedCallback();
      return;
    }
    this.avatarMode = 'video';
    this.setAvatarMode('video');

    this.isSpeaking = true;
    this.isThinking = false;

    if (this.speakingWatchdogTimer) {
      clearTimeout(this.speakingWatchdogTimer);
      this.speakingWatchdogTimer = null;
    }

    if (this.stage) this.stage.classList.add('speaking');
    if (this.voiceBadge) this.voiceBadge.classList.add('active');
    if (this.statusBadge) this.statusBadge.textContent = 'SUARA ASLI';
    if (this.bgAura) this.bgAura.classList.add('active');

    // Hapus listener lama jika masih aktif
    if (this._onNativeVideoEnd) {
      this.liveVideo.removeEventListener('ended', this._onNativeVideoEnd);
      this._onNativeVideoEnd = null;
    }

    // Unmute agar suara asli Ibu Siska di video terdengar
    this.liveVideo.muted = false;
    try {
      this.liveVideo.currentTime = 0;
    } catch (e) {}
    this.liveVideo.loop = false;

    const cleanup = () => {
      this.liveVideo.removeEventListener('ended', cleanup);
      this._onNativeVideoEnd = null;
      this.liveVideo.muted = true;
      this.liveVideo.loop = true;
      this.setSpeaking(false);
      if (typeof onEndedCallback === 'function') onEndedCallback();
    };
    this._onNativeVideoEnd = cleanup;

    this.liveVideo.addEventListener('ended', cleanup, { once: true });

    const playPromise = this.liveVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Pemutaran dengan suara dicegah oleh browser, beralih ke muted:", err);
        this.liveVideo.muted = true;
        this.liveVideo.play().catch(() => {});
      });
    }
  }

  setAudioLevel(level) {
    this.audioLevel = Math.max(0, Math.min(1, level));
  }

  /**
   * Atur mode tampilan avatar:
   * @param {'photo'|'video'|'did'} mode
   * @param {string} [videoSrc] URL / path file video MP4
   */
  setAvatarMode(mode, videoSrc = '') {
    this.avatarMode = mode || 'video';
    const targetSrc = videoSrc || this.defaultVideoSrc;
    this.currentVideoSrc = targetSrc;

    if (this.basePhoto) this.basePhoto.style.display = 'none';
    if (this.liveVideo) this.liveVideo.style.display = 'none';
    if (this.didVideo) this.didVideo.style.display = 'none';

    if (this.avatarMode === 'video' && this.liveVideo) {
      if (this.liveVideo.getAttribute('src') !== targetSrc) {
        this.liveVideo.src = targetSrc;
        this.liveVideo.load();
      }
      this.liveVideo.style.display = 'block';
      if (this.basePhoto) this.basePhoto.style.display = 'none';
    } else if (this.avatarMode === 'did' && this.didVideo) {
      this.didVideo.style.display = 'block';
    } else {
      // Photo mode
      if (this.basePhoto) this.basePhoto.style.display = 'block';
    }
  }

  /**
   * Perbarui label nama & jabatan pada kartu avatar
   */
  updateProfileLabels(name, title) {
    if (this.nameDisplay && name) this.nameDisplay.textContent = name;
    if (this.titleDisplay && title) this.titleDisplay.textContent = title;
  }

  startAnimationLoop() {
    const loop = (timestamp) => {
      this.update(timestamp);
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  update(timestamp) {
    // Efek cahaya dan aura dinamis mengikuti intensitas vokal
    if (this.ambientLight) {
      if (this.isSpeaking) {
        const glow = 0.3 + (this.audioLevel * 0.7);
        this.ambientLight.style.opacity = glow.toString();
      } else {
        this.ambientLight.style.opacity = '0';
      }
    }

    if (this.bgAura && this.isSpeaking) {
      const pulseScale = 1.05 + (this.audioLevel * 0.12);
      this.bgAura.style.transform = `translateX(-50%) scale(${pulseScale})`;
    }
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}

window.HumanTalkingAvatar = HumanTalkingAvatar;
