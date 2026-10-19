/**
 * MAIN APP CONTROLLER
 * Menghubungkan Real Human Video Avatar, 3D Hologram, Voice Engine, Gemini AI, dan Admin CMS
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Core DOM Elements
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const micBtnMain = document.getElementById('mic-btn-main');
  const voiceInputBtn = document.getElementById('voice-input-btn');
  const statusPillText = document.getElementById('status-pill-text');
  const hologramStageCard = document.getElementById('hologram-stage-card');
  const audioEqualizer = document.getElementById('audio-equalizer');
  const transcriptToast = document.getElementById('voice-transcript-toast');
  const transcriptText = document.getElementById('transcript-text');

  // Top Bar elements
  const adminOpenBtn = document.getElementById('admin-open-btn');
  const toggleVoiceMuteBtn = document.getElementById('toggle-voice-mute');
  const toggleSoundFxBtn = document.getElementById('toggle-sound-fx');
  const toggleViewModeBtn = document.getElementById('toggle-view-mode');
  const toggleFocusModeBtn = document.getElementById('toggle-focus-mode');
  const focusBtnText = document.getElementById('focus-btn-text');
  const mainContainer = document.getElementById('main-container');
  const viewModeText = document.getElementById('view-mode-text');
  const schoolNameDisplay = document.getElementById('school-name-display');
  const schoolSubDisplay = document.getElementById('school-sub-display');
  const robotNameDisplay = document.getElementById('robot-name-display');
  const robotSubDisplay = document.getElementById('robot-sub-display');
  const aiModelBadge = document.getElementById('ai-model-badge');

  // Modals & Dialogs
  const pinModal = document.getElementById('pin-modal');
  const pinInput = document.getElementById('pin-input');
  const pinSubmitBtn = document.getElementById('pin-submit-btn');
  const pinCancelBtn = document.getElementById('pin-cancel-btn');
  const adminModal = document.getElementById('admin-modal');
  const closeAdminModalBtn = document.getElementById('close-admin-modal');

  // State Variables
  let isVoiceMuted = false;
  let isSoundFxMuted = false;
  let isHandsFreeMode = false;
  let isFocusMode = false;
  let avatarMode = 'mascot'; // 'mascot', '3d', 'human'
  let currentSpeakingText = '';
  let isProcessingUserSend = false;

  let humanAvatar = null;
  let avatar3D = null;
  let animatedMascot = null;
  let voiceEngine = null;
  let aiEngine = null;
  let adminMgr = null;
  let cameraVision = null;

  // =========================================================================
  // HELPER FUNCTIONS (DEFINED FIRST TO AVOID TDZ ERRORS)
  // =========================================================================

  // Toast Notification
  function showToast(msg) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>${msg}</span>`;
    toast.style.display = 'flex';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // Set Robot Status Indicator & Animations
  function setRobotState(state) {
    if (avatar3D && typeof avatar3D.setState === 'function') {
      avatar3D.setState(state);
    }
    if (animatedMascot && typeof animatedMascot.setState === 'function') {
      animatedMascot.setState(state);
    }
    if (humanAvatar) {
      if (state === 'thinking' && typeof humanAvatar.setThinking === 'function') {
        humanAvatar.setThinking(true);
      } else if (state !== 'speaking' && typeof humanAvatar.setThinking === 'function') {
        humanAvatar.setThinking(false);
      }
    }

    if (hologramStageCard) {
      hologramStageCard.classList.remove('state-listening', 'state-thinking', 'state-speaking');
      if (state !== 'idle') {
        hologramStageCard.classList.add(`state-${state}`);
      }
    }

    if (statusPillText) {
      if (state === 'listening') {
        statusPillText.textContent = 'MENDENGARKAN...';
      } else if (state === 'thinking') {
        statusPillText.textContent = 'MEMPROSES JAWABAN...';
      } else if (state === 'speaking') {
        statusPillText.textContent = 'BERBICARA...';
      } else {
        statusPillText.textContent = 'STANDBY & SIAP';
      }
    }
  }

  function setEqualizerActive(active) {
    if (!audioEqualizer) return;
    if (active) {
      audioEqualizer.classList.add('active');
    } else {
      audioEqualizer.classList.remove('active');
    }
  }

  function updateMicButtonUI(listening) {
    if (micBtnMain) {
      if (listening) micBtnMain.classList.add('listening');
      else micBtnMain.classList.remove('listening');
    }
    if (voiceInputBtn) {
      if (listening) voiceInputBtn.classList.add('listening');
      else voiceInputBtn.classList.remove('listening');
    }
  }

  function showTranscriptToast(text) {
    if (transcriptText) transcriptText.textContent = text;
    if (transcriptToast) transcriptToast.style.display = 'inline-flex';
  }

  function hideTranscriptToast() {
    if (transcriptToast) transcriptToast.style.display = 'none';
  }

  // Update UI with Current Settings & School Data
  function updateSchoolHeaderInfo() {
    if (!adminMgr || !adminMgr.schoolData) return;
    const data = adminMgr.schoolData;
    if (data.profile) {
      if (schoolNameDisplay) schoolNameDisplay.textContent = data.profile.name || "SMP NEGERI 1 MIRIT";
      if (schoolSubDisplay) schoolSubDisplay.textContent = `Akreditasi ${data.profile.accreditation || 'A'} • NPSN: ${data.profile.npsn || '20330335'}`;
    }
  }

  function applySettingsToUI() {
    if (!adminMgr || !adminMgr.settings) return;
    const s = adminMgr.settings;
    if (robotNameDisplay) robotNameDisplay.textContent = s.robotName || "ROBOT AI SPENSA";
    if (robotSubDisplay) robotSubDisplay.textContent = s.robotTitle || "Asisten Hologram AI Modern SMP Negeri 1 Mirit";

    if (humanAvatar && typeof humanAvatar.updateProfileLabels === 'function') {
      humanAvatar.updateProfileLabels(s.robotName || "ROBOT AI SPENSA", s.robotTitle || "Asisten Hologram AI Modern SMP Negeri 1 Mirit");
    }

    const humanView = document.getElementById('human-avatar-view');
    const canvas = document.getElementById('three-canvas-container');
    const mascot2D = document.getElementById('mascot-2d-view');
    const viewModeText = document.getElementById('view-mode-text');

    if (s.avatarHumanMode === 'mascot' || avatarMode === 'mascot') {
      avatarMode = 'mascot';
      if (humanView) humanView.style.display = 'none';
      if (canvas) canvas.style.display = 'none';
      if (mascot2D) {
        mascot2D.style.display = 'flex';
        if (animatedMascot && typeof animatedMascot.resizeCanvas === 'function') {
          setTimeout(() => animatedMascot.resizeCanvas(), 60);
        }
      }
      if (viewModeText) viewModeText.textContent = 'Avatar: Maskot AI (Live)';
    } else if (s.avatarHumanMode === 'video' || s.avatarHumanMode === 'photo') {
      avatarMode = 'human';
      if (humanView) humanView.style.display = 'flex';
      if (canvas) canvas.style.display = 'none';
      if (mascot2D) mascot2D.style.display = 'none';
      if (viewModeText) viewModeText.textContent = 'Avatar: Video Manusia';
    } else {
      // Default: Robot 3D Hologram Modern
      avatarMode = '3d';
      if (humanView) humanView.style.display = 'none';
      if (canvas) {
        canvas.style.display = 'block';
        if (avatar3D && typeof avatar3D.onResize === 'function') {
          setTimeout(() => avatar3D.onResize(), 100);
        }
      }
      if (mascot2D) mascot2D.style.display = 'none';
      if (viewModeText) viewModeText.textContent = 'Avatar: Robot 3D Hologram';
    }

    if (aiModelBadge) {
      aiModelBadge.textContent = 'ONLINE & SIAP';
    }

    if (voiceEngine && voiceEngine.options) {
      voiceEngine.options.gender = s.voiceGender || 'female';
      voiceEngine.options.rate = parseFloat(s.voiceRate) || 1.0;
      voiceEngine.options.pitch = parseFloat(s.voicePitch) || 1.0;
    }

    const voiceModeText = document.getElementById('voice-mode-text');
    if (voiceModeText) {
      voiceModeText.textContent = isVoiceMuted ? 'Suara: Hening' : 'Suara: AI Aktif';
    }
  }

  function showLiveSubtitle(text) {
    const subBox = document.getElementById('live-subtitle-box');
    const subText = document.getElementById('subtitle-text');
    if (subBox && subText && text) {
      const clean = text.replace(/[*#_`]/g, '').trim();
      subText.textContent = clean.slice(0, 220) + (clean.length > 220 ? '...' : '');
      subBox.classList.remove('hidden');
    }
  }

  function hideLiveSubtitle() {
    const subBox = document.getElementById('live-subtitle-box');
    if (subBox) subBox.classList.add('hidden');
  }

  // Markdown Simple Parser
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/# (.*?)\n/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^\* (.*?)$/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

    html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/g, '<ul>$1</ul>');
    html = html.split('\n\n').map(p => {
      if (p.startsWith('<h3>') || p.startsWith('<ul>')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  }

  // Add Message to Chat UI
  function appendMessage(sender, text) {
    if (!chatMessages) return;
    const msgRow = document.createElement('div');
    msgRow.className = `message-row ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;

    const formattedContent = formatMarkdown(text);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sender === 'user') {
      msgRow.innerHTML = `
        <div class="msg-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="msg-content-wrapper">
          <div class="msg-sender-name">Anda • ${timeStr}</div>
          <div class="msg-bubble">${formattedContent}</div>
        </div>
      `;
    } else {
      const botName = (adminMgr && adminMgr.settings && adminMgr.settings.robotName) ? adminMgr.settings.robotName : 'ROBOT AI SPENSA';
      msgRow.innerHTML = `
        <div class="msg-avatar">
          <img src="assets/robot_modern.jpg" alt="${botName}" style="object-position: center;" onerror="this.src='assets/mascot.jpg'">
        </div>
        <div class="msg-content-wrapper">
          <div class="msg-sender-name">${botName} • ${timeStr}</div>
          <div class="msg-bubble">${formattedContent}</div>
          <div class="msg-actions-bar">
            <button class="msg-action-btn btn-speak-msg" title="Dengarkan Suara">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              <span>Dengarkan</span>
            </button>
            <button class="msg-action-btn btn-copy-msg" title="Salin Jawaban">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Salin</span>
            </button>
          </div>
        </div>
      `;

      const speakBtn = msgRow.querySelector('.btn-speak-msg');
      if (speakBtn) {
        speakBtn.onclick = () => {
          if (!voiceEngine) return;
          if (voiceEngine.isSpeaking) {
            voiceEngine.stopSpeaking();
            if (humanAvatar && typeof humanAvatar.setSpeaking === 'function') {
              humanAvatar.setSpeaking(false);
            }
            hideLiveSubtitle();
            speakBtn.querySelector('span').textContent = 'Dengarkan';
          } else {
            speakBtn.querySelector('span').textContent = 'Berhenti';
            currentSpeakingText = text;
            const approxDuration = Math.max(3500, Math.min(25000, text.length * 72));
            if (humanAvatar && typeof humanAvatar.setSpeaking === 'function') {
              humanAvatar.setSpeaking(true, approxDuration);
            }
            showLiveSubtitle(text);
            voiceEngine.speak(text, () => {
              speakBtn.querySelector('span').textContent = 'Dengarkan';
              hideLiveSubtitle();
              if (humanAvatar && typeof humanAvatar.setSpeaking === 'function') {
                humanAvatar.setSpeaking(false);
              }
            });
          }
        };
      }

      const copyBtn = msgRow.querySelector('.btn-copy-msg');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(text).then(() => {
            copyBtn.querySelector('span').textContent = 'Tersalin!';
            setTimeout(() => { copyBtn.querySelector('span').textContent = 'Salin'; }, 2000);
          });
        };
      }
    }

    chatMessages.appendChild(msgRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (sender === 'user' && window.audioFX) {
      window.audioFX.playSend();
    } else if (sender === 'ai' && window.audioFX) {
      window.audioFX.playReceive();
    }
  }

  // Show Typing Indicator
  function showTypingIndicator() {
    if (!chatMessages) return;
    const typingRow = document.createElement('div');
    typingRow.id = 'typing-indicator-row';
    typingRow.className = 'message-row ai-msg';
    typingRow.innerHTML = `
      <div class="msg-avatar">
        <img src="assets/robot_modern.jpg" alt="Robot AI" style="object-position: center;" onerror="this.src='assets/mascot.jpg'">
      </div>
      <div class="typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatMessages.appendChild(typingRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTypingIndicator() {
    const row = document.getElementById('typing-indicator-row');
    if (row) row.remove();
  }

  // Handle User Message Sending
  async function handleUserSend(text) {
    if (isProcessingUserSend) return;
    const query = (text || (chatInput ? chatInput.value : '')).trim();
    if (!query) return;

    isProcessingUserSend = true;
    if (chatInput) chatInput.value = '';
    appendMessage('user', query);

    if (voiceEngine) {
      voiceEngine.stopSpeaking();
    }

    // Deteksi jika pertanyaan adalah salam
    const trimmedQuery = query.trim().toLowerCase();
    const isGreetingQuery = /^(halo|hallo|hai|hi|hey|assalamualaikum|selamat (pagi|siang|sore|malam))[.!? ]*$/i.test(trimmedQuery);

    if (isGreetingQuery) {
      setRobotState('thinking');
      showTypingIndicator();

      setTimeout(() => {
        hideTypingIndicator();
        const greetingResponse = (adminMgr && adminMgr.settings && adminMgr.settings.welcomeGreeting)
          ? adminMgr.settings.welcomeGreeting
          : DEFAULT_SETTINGS.welcomeGreeting;
        appendMessage('ai', greetingResponse);
        currentSpeakingText = greetingResponse;
        showLiveSubtitle(greetingResponse);

        if (!isVoiceMuted && voiceEngine) {
          setRobotState('speaking');
          setEqualizerActive(true);
          voiceEngine.speak(greetingResponse, () => {
            setRobotState('idle');
            setEqualizerActive(false);
            hideLiveSubtitle();
          });
        } else {
          setRobotState('idle');
          setTimeout(() => {
            hideLiveSubtitle();
          }, 3500);
        }
        isProcessingUserSend = false;
      }, 400);
      return;
    }

    setRobotState('thinking');
    showTypingIndicator();

    try {
      // Ambil tangkapan gambar kamera webcam secara real-time jika kamera AI Vision sedang aktif
      let cameraSnapshot = null;
      if (cameraVision && cameraVision.isActive && typeof cameraVision.captureSnapshotBase64 === 'function') {
        try {
          cameraSnapshot = cameraVision.captureSnapshotBase64();
        } catch (eSnap) {
          console.warn("Gagal mengambil snapshot kamera:", eSnap);
        }
      }

      let response = '';
      if (!aiEngine && typeof GeminiSchoolAI !== 'undefined') {
        try {
          aiEngine = new GeminiSchoolAI(
            () => adminMgr ? adminMgr.schoolData : DEFAULT_SCHOOL_DATA,
            () => adminMgr ? adminMgr.settings : DEFAULT_SETTINGS
          );
          window.aiEngine = aiEngine;
        } catch (eInit) {
          console.warn("Auto-recovery init aiEngine error:", eInit);
        }
      }

      if (aiEngine) {
        response = await aiEngine.sendMessage(query, cameraSnapshot);
      } else {
        response = "Halo! Saya ROBOT AI SPENSA siap membantu menjawab seputar informasi sekolah dan bertatap muka langsung dengan Anda.";
      }
      hideTypingIndicator();
      appendMessage('ai', response);

      const approxDuration = Math.max(3500, Math.min(25000, response.length * 72));

      if (!isVoiceMuted && voiceEngine) {
        currentSpeakingText = response;
        showLiveSubtitle(response);
        setRobotState('speaking');
        setEqualizerActive(true);

        voiceEngine.speak(response, () => {
          setRobotState('idle');
          setEqualizerActive(false);
          hideLiveSubtitle();
        });
      } else {
        showLiveSubtitle(response);
        setTimeout(() => {
          hideLiveSubtitle();
        }, approxDuration);
        setRobotState('idle');
      }
    } catch (error) {
      hideTypingIndicator();
      appendMessage('ai', `Maaf, terjadi kendala saat memproses jawaban: ${error.message}`);
      setRobotState('idle');
    } finally {
      isProcessingUserSend = false;
    }
  }

  function toggleVoiceInput() {
    if (!voiceEngine) return;
    if (voiceEngine.isListening) {
      voiceEngine.stopListening();
    } else {
      voiceEngine.startListening();
    }
  }

  function showInitialGreeting() {
    const greeting = (adminMgr && adminMgr.settings && adminMgr.settings.welcomeGreeting) 
      ? adminMgr.settings.welcomeGreeting 
      : DEFAULT_SETTINGS.welcomeGreeting;
    setTimeout(() => {
      appendMessage('ai', greeting);
      if (!isVoiceMuted && adminMgr && adminMgr.settings && adminMgr.settings.voiceEnabled && voiceEngine) {
        currentSpeakingText = greeting;
        voiceEngine.speak(greeting);
      }
    }, 400);
  }

  // =========================================================================
  // 2. INITIALIZE ENGINES SAFELY
  // =========================================================================

  try {
    adminMgr = new SchoolAdminManager({
      onDataUpdated: (newData) => {
        updateSchoolHeaderInfo();
        showToast("Data sekolah berhasil diperbarui!");
      },
      onSettingsUpdated: (newSettings) => {
        applySettingsToUI();
        showToast("Pengaturan AI berhasil diperbarui!");
      }
    });
  } catch (e) {
    console.warn("SchoolAdminManager init error:", e);
  }

  try {
    aiEngine = new GeminiSchoolAI(
      () => adminMgr ? adminMgr.schoolData : DEFAULT_SCHOOL_DATA,
      () => adminMgr ? adminMgr.settings : DEFAULT_SETTINGS
    );
  } catch (e) {
    console.warn("GeminiSchoolAI init error:", e);
  }

  try {
    humanAvatar = new HumanTalkingAvatar('human-avatar-view');
  } catch (e) {
    console.warn("HumanTalkingAvatar init error:", e);
  }

  try {
    avatar3D = new HologramAvatar3D('three-canvas-container');
  } catch (e) {
    console.warn("Avatar 3D fallback:", e);
  }

  try {
    if (typeof AnimatedRobotMascot !== 'undefined') {
      animatedMascot = new AnimatedRobotMascot('mascot-2d-view', 'assets/robot_modern.jpg');
    }
  } catch (e) {
    console.warn("AnimatedRobotMascot init error:", e);
  }

  try {
    voiceEngine = new HologramVoiceEngine({
      lang: 'id-ID',
      humanAvatar: humanAvatar,
      rate: (adminMgr && adminMgr.settings && adminMgr.settings.voiceRate) || 1.0,
      pitch: (adminMgr && adminMgr.settings && adminMgr.settings.voicePitch) || 1.0,
      gender: (adminMgr && adminMgr.settings && adminMgr.settings.voiceGender) || 'female',
      onListeningStart: () => {
        setRobotState('listening');
        updateMicButtonUI(true);
        showTranscriptToast("Mendengarkan suara Anda...");
      },
      onListeningEnd: () => {
        setRobotState('idle');
        updateMicButtonUI(false);
        hideTranscriptToast();
      },
      onInterimResult: (text) => {
        showTranscriptToast(`"${text}"`);
      },
      onSpeechResult: (text) => {
        hideTranscriptToast();
        if (text) {
          handleUserSend(text);
        }
      },
      onSpeakStart: (approxDuration) => {
        setRobotState('speaking');
        setEqualizerActive(true);
        if (animatedMascot && typeof animatedMascot.setSpeaking === 'function') {
          animatedMascot.setSpeaking(true);
        }
        showLiveSubtitle(currentSpeakingText);
      },
      onSpeakEnd: () => {
        setRobotState('idle');
        setEqualizerActive(false);
        if (animatedMascot && typeof animatedMascot.setSpeaking === 'function') {
          animatedMascot.setSpeaking(false);
        }
        hideLiveSubtitle();
        if (isHandsFreeMode && !isVoiceMuted && voiceEngine) {
          setTimeout(() => {
            if (voiceEngine && !voiceEngine.isListening && !voiceEngine.isSpeaking) {
              voiceEngine.startListening();
            }
          }, 500);
        }
      },
      onAudioLevel: (lvl) => {
        if (avatar3D && typeof avatar3D.setAudioLevel === 'function') {
          avatar3D.setAudioLevel(lvl);
        }
        if (animatedMascot && typeof animatedMascot.setAudioLevel === 'function') {
          animatedMascot.setAudioLevel(lvl);
        }
      }
    });
  } catch (e) {
    console.warn("HologramVoiceEngine init error:", e);
  }

  try {
    if (typeof RobotCameraVision !== 'undefined') {
      cameraVision = new RobotCameraVision({
        videoElementId: 'camera-feed-video',
        overlayCanvasId: 'camera-hud-canvas',
        containerId: 'camera-vision-pip',
        onFaceMove: (x, y) => {
          if (animatedMascot && typeof animatedMascot.setFaceTracking === 'function') {
            animatedMascot.setFaceTracking(x, y);
          }
          if (avatar3D && typeof avatar3D.setMousePosition === 'function') {
            avatar3D.targetRotationY = x * 0.4;
            avatar3D.targetRotationX = y * 0.3;
          }
        },
        onUserDetected: () => {
          showToast("Kamera AI mendeteksi wajah penanya!");
          const pipStatus = document.getElementById('pip-status-info');
          if (pipStatus) pipStatus.textContent = 'WAJAH TERKUNCI • BERHADAPAN';

          if (!isVoiceMuted && voiceEngine && !voiceEngine.isSpeaking && !voiceEngine.isListening) {
            const welcomeCamera = "Halo! Sensor kamera saya telah mendeteksi kehadiran Anda di depan layar. Senang bisa bertatap muka langsung! Ada yang bisa saya bantu seputar SMP Negeri 1 Mirit?";
            appendMessage('ai', welcomeCamera);
            currentSpeakingText = welcomeCamera;
            showLiveSubtitle(welcomeCamera);
            setRobotState('speaking');
            setEqualizerActive(true);
            voiceEngine.speak(welcomeCamera, () => {
              setRobotState('idle');
              setEqualizerActive(false);
              hideLiveSubtitle();
            });
          }
        }
      });
    }
  } catch (e) {
    console.warn("RobotCameraVision init error:", e);
  }

  // Ekspor referensi global ke window agar selalu dapat diakses secara aman
  window.adminMgr = adminMgr;
  window.aiEngine = aiEngine;
  window.humanAvatar = humanAvatar;
  window.avatar3D = avatar3D;
  window.animatedMascot = animatedMascot;
  window.voiceEngine = voiceEngine;
  window.cameraVision = cameraVision;

  // =========================================================================
  // 3. ATTACH ALL EVENT LISTENERS WITH SAFE NULL CHECKS
  // =========================================================================

  // Send button & Enter key
  if (sendBtn) {
    sendBtn.addEventListener('click', () => handleUserSend());
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUserSend();
      }
    });
  }

  // Mic Buttons
  if (micBtnMain) {
    micBtnMain.addEventListener('click', toggleVoiceInput);
  }
  if (voiceInputBtn) {
    voiceInputBtn.addEventListener('click', toggleVoiceInput);
  }

  // Hands-free Toggle
  const toggleHandsfreeBtn = document.getElementById('toggle-handsfree-btn');
  const handsfreeText = document.getElementById('handsfree-text');
  if (toggleHandsfreeBtn) {
    toggleHandsfreeBtn.addEventListener('click', () => {
      isHandsFreeMode = !isHandsFreeMode;
      if (isHandsFreeMode) {
        toggleHandsfreeBtn.classList.remove('btn-glass');
        toggleHandsfreeBtn.classList.add('btn-cyan');
        if (handsfreeText) handsfreeText.textContent = "Auto-Talk: ON";
        showToast("Auto-Talk Aktif: Robot otomatis mendengarkan setelah menjawab!");
        if (voiceEngine && !voiceEngine.isListening && !voiceEngine.isSpeaking) {
          voiceEngine.startListening();
        }
      } else {
        toggleHandsfreeBtn.classList.remove('btn-cyan');
        toggleHandsfreeBtn.classList.add('btn-glass');
        if (handsfreeText) handsfreeText.textContent = "Auto-Talk: OFF";
        showToast("Auto-Talk Dimatikan");
      }
    });
  }

  // Suggestion Chips
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        handleUserSend(prompt);
      }
    });
  });

  // Toggle Voice Mute
  if (toggleVoiceMuteBtn) {
    toggleVoiceMuteBtn.addEventListener('click', () => {
      isVoiceMuted = !isVoiceMuted;
      if (isVoiceMuted) {
        if (voiceEngine) voiceEngine.stopSpeaking();
        toggleVoiceMuteBtn.classList.add('muted');
        toggleVoiceMuteBtn.title = "Suara Manusia: Nonaktif (Klik untuk aktifkan)";
        toggleVoiceMuteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
        showToast("Suara manusia dinonaktifkan");
      } else {
        toggleVoiceMuteBtn.classList.remove('muted');
        toggleVoiceMuteBtn.title = "Suara Manusia: Aktif (Klik untuk nonaktifkan)";
        toggleVoiceMuteBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
        showToast("Suara manusia diaktifkan");
      }
    });
  }

  // Toggle Sound FX
  if (toggleSoundFxBtn) {
    toggleSoundFxBtn.addEventListener('click', () => {
      isSoundFxMuted = !isSoundFxMuted;
      if (window.audioFX) window.audioFX.enabled = !isSoundFxMuted;
      if (isSoundFxMuted) {
        toggleSoundFxBtn.title = "Efek Suara Sci-Fi: Nonaktif";
        toggleSoundFxBtn.style.opacity = '0.5';
        showToast("Efek suara dinonaktifkan");
      } else {
        toggleSoundFxBtn.title = "Efek Suara Sci-Fi: Aktif";
        toggleSoundFxBtn.style.opacity = '1';
        if (window.audioFX) window.audioFX.playBeep();
        showToast("Efek suara diaktifkan");
      }
    });
  }

  // Toggle Focus Mode (Fullscreen Avatar)
  if (toggleFocusModeBtn) {
    toggleFocusModeBtn.addEventListener('click', () => {
      isFocusMode = !isFocusMode;
      if (isFocusMode) {
        if (mainContainer) mainContainer.classList.add('focus-avatar-mode');
        toggleFocusModeBtn.classList.remove('btn-glass');
        toggleFocusModeBtn.classList.add('btn-cyan');
        if (focusBtnText) focusBtnText.textContent = "Tampilkan Chat";
        showToast("Mode Layar Penuh: Kotak chat disembunyikan");
      } else {
        if (mainContainer) mainContainer.classList.remove('focus-avatar-mode');
        toggleFocusModeBtn.classList.remove('btn-cyan');
        toggleFocusModeBtn.classList.add('btn-glass');
        if (focusBtnText) focusBtnText.textContent = "Fokus Avatar";
        showToast("Mode Normal: Kotak chat ditampilkan");
      }
    });
  }

  // Toggle Avatar (Robot 3D Hologram <-> Maskot Robot Modern Live)
  if (toggleViewModeBtn) {
    toggleViewModeBtn.addEventListener('click', () => {
      const humanView = document.getElementById('human-avatar-view');
      const canvas = document.getElementById('three-canvas-container');
      const mascot2D = document.getElementById('mascot-2d-view');

      if (avatarMode === '3d') {
        avatarMode = 'mascot';
        if (humanView) humanView.style.display = 'none';
        if (canvas) canvas.style.display = 'none';
        if (mascot2D) {
          mascot2D.style.display = 'flex';
          if (animatedMascot && typeof animatedMascot.resizeCanvas === 'function') {
            setTimeout(() => animatedMascot.resizeCanvas(), 50);
          }
        }
        if (viewModeText) viewModeText.textContent = 'Avatar: Maskot AI (Live)';
        showToast("Beralih ke Maskot Robot AI (Bibir & Wajah Bergerak)");
      } else {
        avatarMode = '3d';
        if (humanView) humanView.style.display = 'none';
        if (canvas) {
          canvas.style.display = 'block';
          if (avatar3D && typeof avatar3D.onResize === 'function') avatar3D.onResize();
        }
        if (mascot2D) mascot2D.style.display = 'none';
        if (viewModeText) viewModeText.textContent = 'Avatar: Robot 3D Hologram';
        showToast("Beralih ke Tampilan Robot 3D Hologram Modern");
      }
    });
  }

  // Tombol Status Suara: AI Aktif / Hening
  const toggleVoiceModeBtn = document.getElementById('toggle-voice-mode-btn');
  const voiceModeText = document.getElementById('voice-mode-text');
  if (toggleVoiceModeBtn) {
    toggleVoiceModeBtn.addEventListener('click', () => {
      isVoiceMuted = !isVoiceMuted;
      if (isVoiceMuted) {
        if (voiceEngine) voiceEngine.stopSpeaking();
        toggleVoiceModeBtn.classList.remove('btn-cyan');
        toggleVoiceModeBtn.classList.add('btn-glass');
        if (voiceModeText) voiceModeText.textContent = "Suara: Hening";
        showToast("Suara jawaban dinonaktifkan (mode hening)");
      } else {
        toggleVoiceModeBtn.classList.remove('btn-glass');
        toggleVoiceModeBtn.classList.add('btn-cyan');
        const activeVoiceLabel = "Suara: AI Aktif";
        if (voiceModeText) voiceModeText.textContent = activeVoiceLabel;
        showToast("Suara jawaban aktif (Robot AI bersuara membaca jawaban)");
      }
    });
  }

  // Kamera AI Tatap Muka Toggle
  const toggleCameraBtn = document.getElementById('toggle-camera-btn');
  const cameraBtnText = document.getElementById('camera-btn-text');
  const pipCloseBtn = document.getElementById('pip-close-btn');

  async function handleToggleCamera() {
    if (!cameraVision) {
      showToast("Modul kamera sedang disiapkan...");
      return;
    }
    if (cameraVision.isActive) {
      cameraVision.stopCamera();
      if (toggleCameraBtn) {
        toggleCameraBtn.classList.remove('active', 'btn-cyan');
        toggleCameraBtn.classList.add('btn-glass');
      }
      if (cameraBtnText) cameraBtnText.textContent = "Kamera AI: Tatap Muka";
      showToast("Kamera AI dinonaktifkan");
    } else {
      if (toggleCameraBtn) {
        toggleCameraBtn.classList.add('active', 'btn-cyan');
        toggleCameraBtn.classList.remove('btn-glass');
      }
      if (cameraBtnText) cameraBtnText.textContent = "Kamera: AKTIF (Live)";
      showToast("Mengakses kamera untuk tatap muka...");
      const started = await cameraVision.startCamera();
      if (!started) {
        if (toggleCameraBtn) {
          toggleCameraBtn.classList.remove('active', 'btn-cyan');
          toggleCameraBtn.classList.add('btn-glass');
        }
        if (cameraBtnText) cameraBtnText.textContent = "Kamera AI: Tatap Muka";
      } else {
        showToast("Kamera aktif! Robot AI kini memandang wajah Anda secara berhadapan.");
      }
    }
  }

  if (toggleCameraBtn) {
    toggleCameraBtn.addEventListener('click', handleToggleCamera);
  }
  if (pipCloseBtn) {
    pipCloseBtn.addEventListener('click', () => {
      if (cameraVision && cameraVision.isActive) {
        handleToggleCamera();
      }
    });
  }

  // Clear Chat History
  const clearChatBtn = document.getElementById('clear-chat-btn');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (chatMessages) chatMessages.innerHTML = '';
      if (aiEngine) aiEngine.conversationHistory = [];
      showInitialGreeting();
      showToast("Riwayat obrolan dibersihkan");
    });
  }

  // =========================================================================
  // 4. ADMIN PANEL LOGIC & DIALOGS
  // =========================================================================

  if (adminOpenBtn) {
    adminOpenBtn.addEventListener('click', () => {
      if (!adminMgr) return;
      if (adminMgr.isAuthenticated) {
        openAdminDashboard();
      } else {
        if (pinInput) pinInput.value = '';
        if (pinModal) pinModal.classList.add('active');
        if (pinInput) pinInput.focus();
      }
    });
  }

  if (pinSubmitBtn) {
    pinSubmitBtn.addEventListener('click', () => {
      if (!adminMgr || !pinInput) return;
      if (adminMgr.authenticate(pinInput.value)) {
        if (pinModal) pinModal.classList.remove('active');
        openAdminDashboard();
      } else {
        alert("PIN Keamanan Salah! (Default: admin123)");
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && pinSubmitBtn) pinSubmitBtn.click();
    });
  }

  if (pinCancelBtn) {
    pinCancelBtn.addEventListener('click', () => {
      if (pinModal) pinModal.classList.remove('active');
    });
  }

  if (closeAdminModalBtn) {
    closeAdminModalBtn.addEventListener('click', () => {
      if (adminModal) adminModal.classList.remove('active');
    });
  }

  function openAdminDashboard() {
    populateAdminForms();
    if (adminModal) adminModal.classList.add('active');
  }

  // Admin Tabs Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = document.getElementById(`tab-${target}`);
      if (pane) pane.classList.add('active');

      if (target === 'embed') {
        renderEmbedSnippets();
      }
    });
  });

  // Populate Admin Forms from Current Data
  function populateAdminForms() {
    if (!adminMgr) return;
    const data = adminMgr.schoolData || {};
    const s = adminMgr.settings || {};
    const prof = data.profile || {};
    const ppdb = data.ppdb || {};
    const ac = data.academic || {};

    // 1. Profil Form
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('adm-school-name', prof.name);
    setVal('adm-motto', prof.motto);
    setVal('adm-npsn', prof.npsn);
    setVal('adm-accreditation', prof.accreditation);
    setVal('adm-principal', prof.principal);
    setVal('adm-vision', prof.vision);
    setVal('adm-mission', (prof.mission || []).join('\n'));
    setVal('adm-address', prof.address);
    setVal('adm-phone', prof.phone);
    setVal('adm-whatsapp', prof.whatsapp);
    setVal('adm-email', prof.email);
    setVal('adm-website', prof.website);
    setVal('adm-operating-hours', prof.operatingHours);

    // 2. PPDB Form
    setVal('adm-ppdb-status', ppdb.status || 'DIBUKA');
    setVal('adm-ppdb-wave', ppdb.currentWave);
    setVal('adm-ppdb-period', ppdb.registrationPeriod);
    setVal('adm-ppdb-link', ppdb.registrationLink);
    setVal('adm-ppdb-contact', ppdb.contactPerson);
    setVal('adm-cost-reg', ppdb.costs?.registrationFee);
    setVal('adm-cost-dsp', ppdb.costs?.dsp);
    setVal('adm-cost-spp', ppdb.costs?.spp);
    setVal('adm-cost-uniform', ppdb.costs?.uniform);
    setVal('adm-ppdb-requirements', (ppdb.requirements || []).join('\n'));
    setVal('adm-ppdb-flow', (ppdb.flow || []).join('\n'));

    // 3. Akademik
    setVal('adm-curriculum', ac.curriculum);
    setVal('adm-facilities', (ac.facilities || []).join('\n'));
    setVal('adm-extracurriculars', (ac.extracurriculars || []).join('\n'));

    // 4. Guru, FAQ, Pengumuman
    renderTeachersList();
    renderFaqList();
    renderAnnouncementsList();

    // 5. Pengaturan AI
    setVal('adm-robot-name', s.robotName);
    setVal('adm-robot-title', s.robotTitle);
    setVal('adm-gemini-key', s.geminiApiKey);
    setVal('adm-gemini-model', s.geminiModel || 'gemini-2.0-flash');
    setVal('adm-voice-gender', s.voiceGender || 'female');
    setVal('adm-voice-source', s.voiceAudioSource || 'native_video');
    setVal('adm-human-avatar-mode', s.avatarHumanMode || 'video');
    setVal('adm-avatar-video-url', s.avatarVideoUrl || 'assets/gemini_generated_video_45dea1c5.mp4');
    setVal('adm-elevenlabs-key', s.elevenLabsApiKey || '');
    setVal('adm-elevenlabs-voice-id', s.elevenLabsVoiceId || '');
    setVal('adm-did-key', s.didApiKey);
    setVal('adm-welcome-greeting', s.welcomeGreeting);
    setVal('adm-system-prompt', s.systemPrompt);

    renderEmbedSnippets();
  }

  // Render Dynamic FAQ list
  function renderFaqList() {
    const container = document.getElementById('adm-faq-container');
    if (!container || !adminMgr) return;
    container.innerHTML = '';
    const faqs = adminMgr.schoolData.faqs || [];

    faqs.forEach((faq, idx) => {
      const card = document.createElement('div');
      card.className = 'dynamic-item-card';
      card.innerHTML = `
        <div class="dynamic-item-content">
          <strong style="color: var(--neon-cyan); font-size: 0.88rem;">Tanya: ${faq.q}</strong>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">Jawab: ${faq.a}</p>
        </div>
        <button class="btn-delete-item" data-idx="${idx}" title="Hapus FAQ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      const delBtn = card.querySelector('.btn-delete-item');
      if (delBtn) {
        delBtn.onclick = () => {
          adminMgr.schoolData.faqs.splice(idx, 1);
          adminMgr.saveSchoolData(adminMgr.schoolData);
          renderFaqList();
        };
      }
      container.appendChild(card);
    });
  }

  // Add FAQ
  const btnAddFaq = document.getElementById('btn-add-faq');
  if (btnAddFaq) {
    btnAddFaq.addEventListener('click', () => {
      const qInput = document.getElementById('new-faq-q');
      const aInput = document.getElementById('new-faq-a');
      if (!qInput || !aInput || !qInput.value.trim() || !aInput.value.trim()) {
        alert("Harap isi pertanyaan dan jawaban!");
        return;
      }
      if (!adminMgr.schoolData.faqs) adminMgr.schoolData.faqs = [];
      adminMgr.schoolData.faqs.push({ q: qInput.value.trim(), a: aInput.value.trim() });
      adminMgr.saveSchoolData(adminMgr.schoolData);
      qInput.value = '';
      aInput.value = '';
      renderFaqList();
    });
  }

  // Render Dynamic Teachers List
  function renderTeachersList() {
    const container = document.getElementById('adm-teachers-container');
    if (!container || !adminMgr) return;
    container.innerHTML = '';
    const teachers = adminMgr.schoolData.teachers || [];

    teachers.forEach((t, idx) => {
      const card = document.createElement('div');
      card.className = 'dynamic-item-card';
      card.innerHTML = `
        <div class="dynamic-item-content">
          <strong style="color: var(--text-main); font-size: 0.88rem;">${t.name}</strong>
          <p style="color: var(--neon-cyan); font-size: 0.78rem;">${t.role} • Mapel: ${t.subject}</p>
          <span style="color: var(--text-dim); font-size: 0.74rem;">Kontak: ${t.contact}</span>
        </div>
        <button class="btn-delete-item" data-idx="${idx}" title="Hapus Guru">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      const delBtn = card.querySelector('.btn-delete-item');
      if (delBtn) {
        delBtn.onclick = () => {
          adminMgr.schoolData.teachers.splice(idx, 1);
          adminMgr.saveSchoolData(adminMgr.schoolData);
          renderTeachersList();
        };
      }
      container.appendChild(card);
    });
  }

  // Add Teacher
  const btnAddTeacher = document.getElementById('btn-add-teacher');
  if (btnAddTeacher) {
    btnAddTeacher.addEventListener('click', () => {
      const nameEl = document.getElementById('new-teacher-name');
      const roleEl = document.getElementById('new-teacher-role');
      const subEl = document.getElementById('new-teacher-subject');
      const contactEl = document.getElementById('new-teacher-contact');

      const name = nameEl ? nameEl.value.trim() : '';
      const role = roleEl ? roleEl.value.trim() : '';
      const subject = subEl ? subEl.value.trim() : '';
      const contact = contactEl ? contactEl.value.trim() : '';

      if (!name) {
        alert("Harap masukkan nama guru/staf!");
        return;
      }
      if (!adminMgr.schoolData.teachers) adminMgr.schoolData.teachers = [];
      adminMgr.schoolData.teachers.push({ name, role, subject, contact });
      adminMgr.saveSchoolData(adminMgr.schoolData);

      if (nameEl) nameEl.value = '';
      if (roleEl) roleEl.value = '';
      if (subEl) subEl.value = '';
      if (contactEl) contactEl.value = '';
      renderTeachersList();
    });
  }

  // Render Announcements
  function renderAnnouncementsList() {
    const container = document.getElementById('adm-announcements-container');
    if (!container || !adminMgr) return;
    container.innerHTML = '';
    const items = adminMgr.schoolData.announcements || [];

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'dynamic-item-card';
      card.innerHTML = `
        <div class="dynamic-item-content">
          <strong style="color: var(--neon-cyan); font-size: 0.88rem;">${item.title}</strong>
          <span style="color: var(--text-dim); font-size: 0.74rem; margin-left: 8px;">(${item.date})</span>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">${item.content}</p>
        </div>
        <button class="btn-delete-item" data-idx="${idx}" title="Hapus Pengumuman">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      const delBtn = card.querySelector('.btn-delete-item');
      if (delBtn) {
        delBtn.onclick = () => {
          adminMgr.schoolData.announcements.splice(idx, 1);
          adminMgr.saveSchoolData(adminMgr.schoolData);
          renderAnnouncementsList();
        };
      }
      container.appendChild(card);
    });
  }

  // Add Announcement
  const btnAddAnn = document.getElementById('btn-add-announcement');
  if (btnAddAnn) {
    btnAddAnn.addEventListener('click', () => {
      const titleEl = document.getElementById('new-ann-title');
      const dateEl = document.getElementById('new-ann-date');
      const contentEl = document.getElementById('new-ann-content');

      const title = titleEl ? titleEl.value.trim() : '';
      const date = (dateEl && dateEl.value.trim()) ? dateEl.value.trim() : new Date().toLocaleDateString('id-ID');
      const content = contentEl ? contentEl.value.trim() : '';

      if (!title || !content) {
        alert("Harap isi judul dan konten pengumuman!");
        return;
      }
      if (!adminMgr.schoolData.announcements) adminMgr.schoolData.announcements = [];
      adminMgr.schoolData.announcements.unshift({ id: `ANN-${Date.now()}`, title, date, content });
      adminMgr.saveSchoolData(adminMgr.schoolData);

      if (titleEl) titleEl.value = '';
      if (contentEl) contentEl.value = '';
      renderAnnouncementsList();
    });
  }

  // Save All Changes (Main Form)
  const btnSaveAdmin = document.getElementById('btn-save-admin-data');
  if (btnSaveAdmin) {
    btnSaveAdmin.addEventListener('click', () => {
      if (!adminMgr) return;
      const d = adminMgr.schoolData;
      const s = adminMgr.settings;

      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      // Profil
      d.profile.name = getVal('adm-school-name');
      d.profile.motto = getVal('adm-motto');
      d.profile.npsn = getVal('adm-npsn');
      d.profile.accreditation = getVal('adm-accreditation');
      d.profile.principal = getVal('adm-principal');
      d.profile.vision = getVal('adm-vision');
      d.profile.mission = getVal('adm-mission').split('\n').map(l => l.trim()).filter(Boolean);
      d.profile.address = getVal('adm-address');
      d.profile.phone = getVal('adm-phone');
      d.profile.whatsapp = getVal('adm-whatsapp');
      d.profile.email = getVal('adm-email');
      d.profile.website = getVal('adm-website');
      d.profile.operatingHours = getVal('adm-operating-hours');

      // PPDB
      d.ppdb.status = getVal('adm-ppdb-status') || 'DIBUKA';
      d.ppdb.currentWave = getVal('adm-ppdb-wave');
      d.ppdb.registrationPeriod = getVal('adm-ppdb-period');
      d.ppdb.registrationLink = getVal('adm-ppdb-link');
      d.ppdb.contactPerson = getVal('adm-ppdb-contact');
      if (!d.ppdb.costs) d.ppdb.costs = {};
      d.ppdb.costs.registrationFee = getVal('adm-cost-reg');
      d.ppdb.costs.dsp = getVal('adm-cost-dsp');
      d.ppdb.costs.spp = getVal('adm-cost-spp');
      d.ppdb.costs.uniform = getVal('adm-cost-uniform');
      d.ppdb.requirements = getVal('adm-ppdb-requirements').split('\n').map(l => l.trim()).filter(Boolean);
      d.ppdb.flow = getVal('adm-ppdb-flow').split('\n').map(l => l.trim()).filter(Boolean);

      // Akademik
      d.academic.curriculum = getVal('adm-curriculum');
      d.academic.facilities = getVal('adm-facilities').split('\n').map(l => l.trim()).filter(Boolean);
      d.academic.extracurriculars = getVal('adm-extracurriculars').split('\n').map(l => l.trim()).filter(Boolean);

      // Settings
      s.robotName = getVal('adm-robot-name');
      s.robotTitle = getVal('adm-robot-title');
      s.geminiApiKey = getVal('adm-gemini-key');
      s.geminiModel = getVal('adm-gemini-model') || 'gemini-2.0-flash';
      s.voiceGender = getVal('adm-voice-gender') || 'female';
      s.voiceAudioSource = getVal('adm-voice-source') || 'native_video';
      s.avatarHumanMode = getVal('adm-human-avatar-mode') || 'video';
      s.avatarVideoUrl = getVal('adm-avatar-video-url') || 'assets/gemini_generated_video_45dea1c5.mp4';
      s.elevenLabsApiKey = getVal('adm-elevenlabs-key');
      s.elevenLabsVoiceId = getVal('adm-elevenlabs-voice-id');
      s.didApiKey = getVal('adm-did-key');
      s.welcomeGreeting = getVal('adm-welcome-greeting');
      s.systemPrompt = getVal('adm-system-prompt');

      adminMgr.saveSchoolData(d);
      adminMgr.saveSettings(s);
    });
  }

  // Test Gemini Connection
  const btnTestGemini = document.getElementById('btn-test-gemini');
  if (btnTestGemini) {
    btnTestGemini.addEventListener('click', async () => {
      if (!adminMgr) return;
      const keyEl = document.getElementById('adm-gemini-key');
      const modelEl = document.getElementById('adm-gemini-model');
      const testResult = document.getElementById('gemini-test-result');

      const key = keyEl ? keyEl.value.trim() : '';
      const model = modelEl ? modelEl.value : 'gemini-2.0-flash';

      if (testResult) testResult.innerHTML = '<span style="color: var(--neon-cyan);">Menghubungi Google Gemini API...</span>';
      const res = await adminMgr.testGeminiConnection(key, model);
      if (testResult) {
        if (res.success) {
          testResult.innerHTML = `<span style="color: var(--neon-emerald); font-weight: bold;">✔ ${res.message}</span>`;
          if (res.workingModel && modelEl) {
            const optExists = Array.from(modelEl.options).some(o => o.value === res.workingModel);
            if (!optExists) {
              const newOpt = document.createElement('option');
              newOpt.value = res.workingModel;
              newOpt.textContent = `${res.workingModel} (Aktif & Teruji)`;
              modelEl.appendChild(newOpt);
            }
            modelEl.value = res.workingModel;
            adminMgr.settings.geminiModel = res.workingModel;
            adminMgr.settings.geminiApiKey = key;
            adminMgr.saveSettings(adminMgr.settings);
          }
        } else {
          testResult.innerHTML = `<span style="color: var(--neon-rose); font-weight: bold;">✖ ${res.message}</span>`;
        }
      }
    });
  }

  // Ekstrak & Unduh Sampel Suara Ibu Siska dari Video (.wav)
  function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    let interleaved;
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      interleaved = new Float32Array(left.length + right.length);
      for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
        interleaved[dst] = left[src];
        interleaved[dst + 1] = right[src];
      }
    } else {
      interleaved = buffer.getChannelData(0);
    }
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataByteCount = interleaved.length * bytesPerSample;
    const wavBuffer = new ArrayBuffer(44 + dataByteCount);
    const view = new DataView(wavBuffer);
    function writeString(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataByteCount, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataByteCount, true);
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/wav' });
  }

  // Preview Play Sound & Direct Download Handlers
  let previewAudioPlayer = null;
  const btnPlayVoiceSample = document.getElementById('btn-play-voice-sample');
  if (btnPlayVoiceSample) {
    btnPlayVoiceSample.addEventListener('click', () => {
      if (previewAudioPlayer && !previewAudioPlayer.paused) {
        previewAudioPlayer.pause();
        previewAudioPlayer.currentTime = 0;
        btnPlayVoiceSample.textContent = '▶️ Putar Suara Asli';
        return;
      }
      if (!previewAudioPlayer) {
        previewAudioPlayer = new Audio('assets/siska_suara_asli.mp3');
        previewAudioPlayer.onended = () => {
          btnPlayVoiceSample.textContent = '▶️ Putar Suara Asli';
        };
      }
      previewAudioPlayer.play().then(() => {
        btnPlayVoiceSample.textContent = '⏹️ Hentikan Suara';
        showToast("Memutar rekaman suara asli Ibu Siska...");
      }).catch((err) => {
        console.warn("Gagal memutar audio:", err);
      });
    });
  }

  const btnDlWav = document.getElementById('btn-download-voice-wav');
  if (btnDlWav) {
    btnDlWav.addEventListener('click', () => {
      showToast("Mengunduh siska_suara_asli.wav...");
    });
  }

  const btnDlMp3 = document.getElementById('btn-download-voice-mp3');
  if (btnDlMp3) {
    btnDlMp3.addEventListener('click', () => {
      showToast("Mengunduh siska_suara_asli.mp3...");
    });
  }

  // Website Embed Snippet
  function renderEmbedSnippets() {
    if (typeof EmbedHelper === 'undefined') return;
    const customInput = document.getElementById('embed-custom-domain');
    let targetBase = customInput ? customInput.value.trim().replace(/\/+$/, '') : '';
    let targetUrl = targetBase ? `${targetBase}/widget.html` : '';
    
    // Jika masih kosong atau default pada file:/// gunakan URL https online contoh
    if (!targetUrl || targetUrl.includes('file:///')) {
      targetUrl = 'https://smpn1mirit.sch.id/ai/widget.html';
    }

    const snippetCode = EmbedHelper.getFloatingButtonCode(targetUrl);
    const snippetIframe = EmbedHelper.getIframeCode(targetUrl);
    const box1 = document.getElementById('embed-snippet-floating');
    const box2 = document.getElementById('embed-snippet-iframe');

    if (box1) box1.textContent = snippetCode;
    if (box2) box2.textContent = snippetIframe;
  }

  const customDomainInput = document.getElementById('embed-custom-domain');
  if (customDomainInput) {
    customDomainInput.addEventListener('input', renderEmbedSnippets);
  }

  const btnCopyFloat = document.getElementById('btn-copy-embed-float');
  if (btnCopyFloat) {
    btnCopyFloat.addEventListener('click', () => {
      const box = document.getElementById('embed-snippet-floating');
      if (box) {
        navigator.clipboard.writeText(box.textContent).then(() => showToast("Kode Widget Berhasil Disalin!"));
      }
    });
  }

  const btnCopyIframe = document.getElementById('btn-copy-embed-iframe');
  if (btnCopyIframe) {
    btnCopyIframe.addEventListener('click', () => {
      const box = document.getElementById('embed-snippet-iframe');
      if (box) {
        navigator.clipboard.writeText(box.textContent).then(() => showToast("Kode Iframe Berhasil Disalin!"));
      }
    });
  }

  // Export JSON Database
  const btnExport = document.getElementById('btn-export-json');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (adminMgr) adminMgr.exportDatabaseJSON();
    });
  }

  // Import JSON Database
  const btnImport = document.getElementById('btn-import-json');
  const importFileInput = document.getElementById('import-file-input');
  if (btnImport && importFileInput) {
    btnImport.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!adminMgr) return;
        const res = adminMgr.importDatabaseJSON(event.target.result);
        if (res.success) {
          populateAdminForms();
          showToast("Database sekolah berhasil diimpor!");
        } else {
          alert("Gagal mengimpor file JSON: " + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset to Default
  const btnReset = document.getElementById('btn-reset-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (!adminMgr) return;
      if (confirm("Apakah Anda yakin ingin mereset seluruh data sekolah ke data contoh standar?")) {
        adminMgr.resetToDefault();
        populateAdminForms();
        showToast("Data sekolah direset ke default.");
      }
    });
  }

  // Change Admin PIN
  const btnChangePin = document.getElementById('btn-change-pin');
  if (btnChangePin) {
    btnChangePin.addEventListener('click', () => {
      if (!adminMgr) return;
      const oldPin = prompt("Masukkan PIN Keamanan Lama:");
      if (!oldPin) return;
      const newPin = prompt("Masukkan PIN Baru (minimal 4 karakter/angka):");
      if (!newPin || newPin.length < 4) {
        alert("PIN baru harus minimal 4 karakter!");
        return;
      }
      if (adminMgr.changePin(oldPin, newPin)) {
        alert("PIN Keamanan berhasil diubah!");
      } else {
        alert("Gagal mengubah PIN: PIN lama tidak cocok.");
      }
    });
  }

  // =========================================================================
  // 5. INITIAL RENDER
  // =========================================================================
  updateSchoolHeaderInfo();
  applySettingsToUI();
  showInitialGreeting();

  // Play startup sound on first user interaction
  document.body.addEventListener('click', () => {
    if (window.audioFX && !window.hasPlayedStartup) {
      window.hasPlayedStartup = true;
      window.audioFX.playHologramStartup();
    }
  }, { once: true });
});
