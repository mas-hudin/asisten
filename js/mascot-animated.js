/**
 * ANIMATED ROBOT MASCOT ENGINE (Live Puppet & Procedural Lip-Sync)
 * Menghidupkan gambar maskot robot modern menjadi avatar yang hidup layaknya manusia:
 * - Bibir & mulut bergerak (Lip-sync dinamis mengikuti suara saat menjawab)
 * - Mata visor berkedip secara natural setiap beberapa detik
 * - Nafas & gerakan kepala luwes (Head nodding & breathing) saat berbicara
 * - Mengikuti kursor mouse penanya secara interaktif
 * - Gelombang aura neon & cincin HUD hologram reaktif terhadap audio
 */

class AnimatedRobotMascot {
  constructor(containerId, imageSrc = 'assets/robot_modern.jpg') {
    this.container = document.getElementById(containerId);
    this.imageSrc = imageSrc;
    this.canvas = null;
    this.ctx = null;
    this.image = null;
    this.isLoaded = false;
    this.displaySize = 320;

    // States
    this.state = 'idle'; // 'idle', 'listening', 'thinking', 'speaking'
    this.isSpeaking = false;
    this.audioLevel = 0;
    this.time = 0;

    // Animation Parameters
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.blinkProgress = 0; // 0 (open) to 1 (closed)

    // Mouse & Head Physics
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.headOffset = { x: 0, y: 0, rot: 0 };
    this.faceTracking = { x: 0, y: 0, active: false };

    // Lip sync & speech oscillation
    this.mouthOpen = 0;
    this.targetMouthOpen = 0;
    this.speechOscillator = 0;

    // Soundwave ripples
    this.ripples = [];

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.setupDOM();
    this.loadImage();
    this.bindEvents();
    this.startLoop();
  }

  setupDOM() {
    this.container.classList.add('mascot-animated-container');

    // Reuse existing canvas or create one
    let canvas = this.container.querySelector('canvas#mascot-animated-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'mascot-animated-canvas';
      canvas.id = 'mascot-animated-canvas';
      this.container.insertBefore(canvas, this.container.firstChild);
    }
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
  }

  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const size = Math.max(260, Math.min(rect.width || 320, rect.height || 320, 360));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    // Reset matrix transform before applying scale
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.displaySize = size;
  }

  loadImage() {
    this.image = new Image();
    // PENTING: JANGAN gunakan crossOrigin = 'anonymous' agar tidak diblokir CORS pada protokol file:///
    this.image.onload = () => {
      this.isLoaded = true;
      // Sembunyikan gambar cadangan static img jika canvas sudah siap
      const fallbackImg = this.container.querySelector('.mascot-2d-img');
      if (fallbackImg) fallbackImg.style.display = 'none';
      if (this.canvas) this.canvas.style.display = 'block';
    };
    this.image.onerror = (e) => {
      console.warn("Gagal memuat robot_modern.jpg, mencoba mascot.jpg:", e);
      if (this.imageSrc !== 'assets/mascot.jpg') {
        this.imageSrc = 'assets/mascot.jpg';
        this.image.src = this.imageSrc;
      }
    };

    this.image.src = this.imageSrc;

    // Periksa apakah gambar sudah ada di cache browser
    if (this.image.complete && this.image.naturalWidth > 0) {
      this.isLoaded = true;
      const fallbackImg = this.container.querySelector('.mascot-2d-img');
      if (fallbackImg) fallbackImg.style.display = 'none';
      if (this.canvas) this.canvas.style.display = 'block';
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      this.mouse.targetX = Math.max(-1, Math.min(1, dx));
      this.mouse.targetY = Math.max(-1, Math.min(1, dy));
    });

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });
  }

  setState(newState) {
    this.state = newState;
    if (newState === 'speaking') {
      this.isSpeaking = true;
    } else if (newState !== 'speaking') {
      this.isSpeaking = false;
      this.targetMouthOpen = 0;
    }
  }

  setSpeaking(speaking) {
    this.isSpeaking = !!speaking;
    if (this.isSpeaking) {
      this.state = 'speaking';
    } else if (this.state === 'speaking') {
      this.state = 'idle';
      this.targetMouthOpen = 0;
    }
  }

  setAudioLevel(level) {
    this.audioLevel = Math.max(0, Math.min(1, level));
  }

  /**
   * Set target face tracking coordinates from camera vision (-1 to 1)
   */
  setFaceTracking(x, y) {
    if (x === null || y === null || typeof x === 'undefined') {
      this.faceTracking.active = false;
    } else {
      this.faceTracking.active = true;
      this.faceTracking.x = Math.max(-1, Math.min(1, x));
      this.faceTracking.y = Math.max(-1, Math.min(1, y));
    }
  }

  startLoop() {
    const loop = () => {
      try {
        this.update();
        this.render();
      } catch (e) {
        console.error("Animasi robot error:", e);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    this.time += 0.035;

    // Target looking coordinates (prioritize camera face tracking when active)
    let lookX = this.mouse.targetX;
    let lookY = this.mouse.targetY;
    if (this.faceTracking && this.faceTracking.active) {
      lookX = this.faceTracking.x;
      lookY = this.faceTracking.y;
    }

    // Smooth spring tracking for looking direction
    this.mouse.x += (lookX - this.mouse.x) * 0.085;
    this.mouse.y += (lookY - this.mouse.y) * 0.085;

    // 1. Natural Human Breathing (Vertical wave + subtle tilt)
    const breathOffset = Math.sin(this.time * 1.8) * 4.0;
    const idleSway = Math.sin(this.time * 1.2) * 0.018;

    // 2. Head nodding gesture when speaking (like an empathetic human speaker)
    let speakNod = 0;
    let speakPitch = 0;
    if (this.isSpeaking) {
      speakNod = Math.sin(this.time * 7.5) * 3.5 + (this.audioLevel * 4.0);
      speakPitch = Math.sin(this.time * 5.0) * 0.03;
    } else if (this.state === 'thinking') {
      speakPitch = -0.045; // Sedikit mendongak saat berpikir
    } else if (this.state === 'listening') {
      speakPitch = 0.035; // Sedikit mencondongkan badan saat menyimak
    }

    this.headOffset.x = this.mouse.x * 7;
    this.headOffset.y = breathOffset + speakNod + (this.mouse.y * 6);
    this.headOffset.rot = idleSway + speakPitch + (this.mouse.x * 0.035);

    // 3. Eyelid Blinking Logic (Human frequency: every 3.5 - 5 seconds)
    this.blinkTimer += 0.016;
    if (!this.isBlinking && this.blinkTimer > 3.6 + Math.sin(this.time) * 1.0) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += 0.18;
      if (this.blinkProgress >= 1.0) {
        this.blinkProgress = 1.0;
        this.isBlinking = false;
      }
    } else if (this.blinkProgress > 0) {
      this.blinkProgress -= 0.18;
      if (this.blinkProgress < 0) this.blinkProgress = 0;
    }

    // 4. Talking Mouth Animation (Lip-Sync Realtime)
    if (this.isSpeaking) {
      this.speechOscillator += 0.45;
      const vowelPulse = (Math.sin(this.speechOscillator) * 0.5 + 0.5) * 
                         (Math.sin(this.speechOscillator * 1.8) * 0.35 + 0.65);
      const amp = Math.max(vowelPulse * 0.75, this.audioLevel * 1.35);
      this.targetMouthOpen = Math.min(1.0, Math.max(0.18, amp));

      // Emit ripple rings on speaking
      if (Math.random() < 0.28) {
        this.ripples.push({ radius: 0.47, opacity: 0.85, speed: 0.009 });
      }
    } else {
      this.targetMouthOpen = 0;
    }

    this.mouthOpen += (this.targetMouthOpen - this.mouthOpen) * 0.3;

    // Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += r.speed;
      r.opacity -= 0.022;
      if (r.opacity <= 0 || r.radius > 0.66) {
        this.ripples.splice(i, 1);
      }
    }
  }

  render() {
    if (!this.ctx || !this.isLoaded) return;
    const S = this.displaySize;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, S, S);

    const cx = S / 2;
    const cy = S / 2;
    const radius = S * 0.46;

    // 1. Color State
    let stateColor = '#00f0ff';
    let stateGlow = 'rgba(0, 240, 255, 0.5)';
    if (this.state === 'listening') {
      stateColor = '#10b981';
      stateGlow = 'rgba(16, 185, 129, 0.55)';
    } else if (this.state === 'thinking') {
      stateColor = '#a855f7';
      stateGlow = 'rgba(168, 85, 247, 0.55)';
    }

    // Soundwave ripples radiating outward
    for (const rip of this.ripples) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, S * rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = stateColor;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = Math.max(0, rip.opacity);
      ctx.shadowColor = stateColor;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Circular Clipping Mask for the Robot Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // 3. Render Robot Base Image with Head Breathing & Sway Physics
    ctx.save();
    ctx.translate(cx + this.headOffset.x, cy + this.headOffset.y);
    ctx.rotate(this.headOffset.rot);

    // Scale breathing
    const scaleBreath = 1 + Math.sin(this.time * 1.8) * 0.014;
    ctx.scale(scaleBreath, scaleBreath);

    const imgW = S * 1.08;
    const imgH = S * 1.08;
    ctx.drawImage(this.image, -imgW / 2, -imgH / 2, imgW, imgH);

    // 4. Render Talking Mouth (Dynamic Lip-Sync Overlay)
    this.renderTalkingMouth(ctx, imgW, imgH);

    // 5. Render Eyelid Blinking (Visor Eyes Eyelids)
    this.renderVisorBlink(ctx, imgW, imgH, stateColor);

    ctx.restore(); // Restore head transform
    ctx.restore(); // Restore circular clip

    // 6. Draw Cyber Holographic Frame / HUD Rings around the avatar
    this.renderHUDFrame(ctx, cx, cy, radius, stateColor, stateGlow);
  }

  /**
   * Renders the dynamic articulating mouth for speech lip-sync
   */
  renderTalkingMouth(ctx, imgW, imgH) {
    if (this.mouthOpen < 0.02) return;

    // Mouth position calibrated on 1024x1024 front-facing robot portrait:
    // Center X = 0, Center Y = approx imgH * 0.142 (Y: 658 of 1024)
    const mouthCenterX = 0;
    const mouthCenterY = imgH * 0.142;
    const mouthHalfWidth = imgW * 0.055; // ~56px width
    const openH = this.mouthOpen * (imgH * 0.034); // Opens up to ~35px

    ctx.save();

    // Subtle shadow / jaw shading
    ctx.fillStyle = 'rgba(7, 10, 24, 0.9)';
    ctx.beginPath();
    ctx.ellipse(mouthCenterX, mouthCenterY + openH * 0.25, mouthHalfWidth * 0.95, openH * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth interior depth (dark with soft cyber inner blue tint)
    const innerGrad = ctx.createRadialGradient(
      mouthCenterX, mouthCenterY, 1,
      mouthCenterX, mouthCenterY, mouthHalfWidth
    );
    innerGrad.addColorStop(0, '#020617');
    innerGrad.addColorStop(0.7, '#071026');
    innerGrad.addColorStop(1, '#0e244d');

    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.ellipse(mouthCenterX, mouthCenterY + openH * 0.15, mouthHalfWidth * 0.85, Math.max(1.5, openH * 0.72), 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper Teeth / Cyber Accent Line
    if (this.mouthOpen > 0.22) {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.beginPath();
      ctx.ellipse(mouthCenterX, mouthCenterY - openH * 0.18, mouthHalfWidth * 0.58, openH * 0.22, 0, 0, Math.PI);
      ctx.fill();
    }

    // Upper Lip (Humanoid Silver/Cyan Cybernetic Lip)
    ctx.beginPath();
    ctx.moveTo(mouthCenterX - mouthHalfWidth, mouthCenterY);
    ctx.quadraticCurveTo(mouthCenterX, mouthCenterY - openH * 0.35 - 1.5, mouthCenterX + mouthHalfWidth, mouthCenterY);
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Lower Lip (Dynamic Jaw Displacement)
    ctx.beginPath();
    ctx.moveTo(mouthCenterX - mouthHalfWidth, mouthCenterY);
    ctx.quadraticCurveTo(mouthCenterX, mouthCenterY + openH * 0.85 + 2.2, mouthCenterX + mouthHalfWidth, mouthCenterY);
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Subtle cyan voice glow inside the mouth when speaking
    if (this.isSpeaking) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 9;
      ctx.fillStyle = `rgba(0, 240, 255, ${this.mouthOpen * 0.45})`;
      ctx.beginPath();
      ctx.ellipse(mouthCenterX, mouthCenterY, mouthHalfWidth * 0.45, openH * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders natural visor eye blinking over the robot visor eyes
   */
  renderVisorBlink(ctx, imgW, imgH, stateColor) {
    const visorY = -imgH * 0.07;
    const visorW = imgW * 0.42;
    const visorH = imgH * 0.082;

    // Scanline laser across the visor when eyes are open
    if (this.blinkProgress < 0.2) {
      ctx.save();
      const sweep = ((this.time * 1.5) % 3.0) - 1.5;
      const scanX = sweep * visorW;
      const scanGrad = ctx.createLinearGradient(scanX - 25, visorY, scanX + 25, visorY);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, stateColor);
      scanGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = scanGrad;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(-visorW / 2, visorY - visorH / 2, visorW, visorH);
      ctx.restore();
    }

    // Eyelid blink sweep
    if (this.blinkProgress > 0.05) {
      ctx.save();
      const closeAmount = this.blinkProgress * (visorH * 0.55);

      // Dark metallic cyber eyelids closing from top and bottom
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      // Top lid
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(-visorW / 2, visorY - visorH / 2, visorW, closeAmount, 4);
        ctx.roundRect(-visorW / 2, visorY + visorH / 2 - closeAmount, visorW, closeAmount, 4);
      } else {
        ctx.rect(-visorW / 2, visorY - visorH / 2, visorW, closeAmount);
        ctx.rect(-visorW / 2, visorY + visorH / 2 - closeAmount, visorW, closeAmount);
      }
      ctx.fill();

      // Cyan eyelid rim
      ctx.strokeStyle = stateColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }
  }

  /**
   * Renders glowing holographic border rings, rotation ticks, and status glow
   */
  renderHUDFrame(ctx, cx, cy, radius, stateColor, stateGlow) {
    ctx.save();

    // 1. Glowing Cyber Border
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = stateColor;
    ctx.lineWidth = 3.0;
    ctx.shadowColor = stateGlow;
    ctx.shadowBlur = 24;
    ctx.stroke();

    // 2. Inner fine glowing ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 3. Rotating HUD Ticks around the border
    const tickCount = 36;
    const rot = this.time * 0.4;
    ctx.strokeStyle = stateColor;
    ctx.lineWidth = 2.0;

    for (let i = 0; i < tickCount; i++) {
      const angle = rot + (i * (Math.PI * 2 / tickCount));
      const isMajor = i % 4 === 0;
      const len = isMajor ? 9 : 4;
      const r1 = radius + 2;
      const r2 = radius + 2 + len;

      const x1 = cx + Math.cos(angle) * r1;
      const y1 = cy + Math.sin(angle) * r1;
      const x2 = cx + Math.cos(angle) * r2;
      const y2 = cy + Math.sin(angle) * r2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // 4. Equalizer Waveform Arcs when speaking
    if (this.isSpeaking) {
      const arcCount = 4;
      ctx.lineWidth = 3;
      for (let j = 0; j < arcCount; j++) {
        const startA = (this.time * 2.5) + (j * Math.PI / 2);
        const arcLen = 0.3 + (this.audioLevel * 0.45);
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 15 + (j * 2), startA, startA + arcLen);
        ctx.strokeStyle = stateColor;
        ctx.shadowColor = stateColor;
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

window.AnimatedRobotMascot = AnimatedRobotMascot;
