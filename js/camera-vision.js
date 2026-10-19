/**
 * CAMERA & AI VISION INTERACTION ENGINE (Tatap Muka & Deteksi Wajah AI)
 * Mengaktifkan interaksi tatap muka melalui kamera webcam:
 * - Mengakses webcam pengguna dengan izin browser
 * - Menampilkan scanner HUD futuristik dengan pelacak wajah (Target Box)
 * - Menggerakkan tatapan & kepala robot mengikuti posisi wajah pengguna secara real-time
 * - Fitur interaksi penglihatan: Robot dapat melihat dan menyapa orang di depannya
 */

class RobotCameraVision {
  constructor(options = {}) {
    this.options = Object.assign({
      videoElementId: 'camera-feed-video',
      overlayCanvasId: 'camera-hud-canvas',
      containerId: 'camera-vision-pip',
      onFaceMove: (x, y) => {}, // x, y dari -1 sampai 1
      onUserDetected: () => {}
    }, options);

    this.video = document.getElementById(this.options.videoElementId);
    this.canvas = document.getElementById(this.options.overlayCanvasId);
    this.container = document.getElementById(this.options.containerId);
    this.stream = null;
    this.isActive = false;

    // Tracking variables
    this.processCanvas = document.createElement('canvas');
    this.processCanvas.width = 96;
    this.processCanvas.height = 72;
    this.processCtx = this.processCanvas.getContext('2d', { willReadFrequently: true });

    this.prevFrame = null;
    this.targetPos = { x: 0, y: 0 };
    this.currentPos = { x: 0, y: 0 };
    this.isUserInFrame = false;
    this.hasGreeted = false;
    this.animId = null;
  }

  async startCamera() {
    if (this.isActive) return true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Browser Anda tidak mendukung akses kamera. Gunakan Google Chrome atau Microsoft Edge.");
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      this.isActive = true;
      if (this.container) {
        this.container.classList.add('active');
        this.container.style.display = 'block';
      }

      this.startTrackingLoop();
      return true;
    } catch (err) {
      console.warn("Gagal mengakses kamera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        alert("Izin kamera ditolak. Silakan izinkan akses kamera di peramban Anda untuk mengaktifkan tatap muka langsung.");
      } else {
        alert("Kamera tidak ditemukan atau sedang digunakan oleh aplikasi lain.");
      }
      return false;
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isActive = false;
    if (this.container) {
      this.container.classList.remove('active');
      this.container.style.display = 'none';
    }
    this.prevFrame = null;
    this.targetPos = { x: 0, y: 0 };
    if (this.options.onFaceMove) {
      this.options.onFaceMove(0, 0);
    }
  }

  toggle() {
    if (this.isActive) {
      this.stopCamera();
      return false;
    } else {
      return this.startCamera();
    }
  }

  startTrackingLoop() {
    const loop = () => {
      if (!this.isActive) return;
      this.detectFacePosition();
      this.drawHUD();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  /**
   * Deteksi posisi wajah / pergerakan orang di depan kamera
   * Menggunakan analisis centroid kontras & gerakan optik real-time 60 FPS
   */
  detectFacePosition() {
    if (!this.video || this.video.readyState < 2) return;

    const w = this.processCanvas.width;
    const h = this.processCanvas.height;
    this.processCtx.drawImage(this.video, 0, 0, w, h);

    const frame = this.processCtx.getImageData(0, 0, w, h);
    const data = frame.data;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    // Deteksi kombinasi: pergerakan + deteksi warna kulit/kontras wajah
    for (let y = 10; y < h - 10; y += 2) {
      for (let x = 10; x < w - 10; x += 2) {
        const idx = (y * w + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Deteksi skin-tone / kecerahan wajah
        const isFaceTone = (r > 60 && g > 40 && b > 20 && (r - g) > 8 && (r - b) > 8);
        let weight = isFaceTone ? 1.5 : 0;

        if (this.prevFrame) {
          const pr = this.prevFrame.data[idx];
          const pg = this.prevFrame.data[idx + 1];
          const pb = this.prevFrame.data[idx + 2];
          const diff = Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
          if (diff > 35) {
            weight += (diff / 255) * 3.0;
          }
        }

        if (weight > 0) {
          // Flip horizontal karena kamera bertindak sebagai cermin
          const mirroredX = w - 1 - x;
          weightedX += mirroredX * weight;
          weightedY += y * weight;
          totalWeight += weight;
        }
      }
    }

    this.prevFrame = frame;

    if (totalWeight > 80) {
      this.isUserInFrame = true;
      const normX = ((weightedX / totalWeight) / w) * 2 - 1; // -1 (kiri) sampai 1 (kanan)
      const normY = ((weightedY / totalWeight) / h) * 2 - 1; // -1 (atas) sampai 1 (bawah)

      // Clamp
      this.targetPos.x = Math.max(-0.85, Math.min(0.85, normX));
      this.targetPos.y = Math.max(-0.7, Math.min(0.7, normY));

      if (!this.hasGreeted) {
        this.hasGreeted = true;
        if (typeof this.options.onUserDetected === 'function') {
          this.options.onUserDetected();
        }
      }
    } else {
      this.isUserInFrame = false;
      this.targetPos.x *= 0.95;
      this.targetPos.y *= 0.95;
    }

    // Smooth lerp
    this.currentPos.x += (this.targetPos.x - this.currentPos.x) * 0.12;
    this.currentPos.y += (this.targetPos.y - this.currentPos.y) * 0.12;

    // Teruskan posisi tatap muka ke avatar robot!
    if (typeof this.options.onFaceMove === 'function') {
      this.options.onFaceMove(this.currentPos.x, this.currentPos.y);
    }
  }

  /**
   * Gambar HUD Cyber Vision Scanner di atas video kamera
   */
  drawHUD() {
    if (!this.canvas || !this.video) return;
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    const normX = (this.currentPos.x + 1) / 2;
    const normY = (this.currentPos.y + 1) / 2;
    const faceX = normX * w;
    const faceY = normY * h;

    const boxW = w * 0.38;
    const boxH = h * 0.48;
    const bx = faceX - boxW / 2;
    const by = faceY - boxH / 2;

    ctx.save();

    // 1. Target Face Tracking Box
    const color = this.isUserInFrame ? '#00f0ff' : '#64748b';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    // Corner brackets
    const cLen = 14;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(bx, by + cLen);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + cLen, by);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(bx + boxW - cLen, by);
    ctx.lineTo(bx + boxW, by);
    ctx.lineTo(bx + boxW, by + cLen);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(bx, by + boxH - cLen);
    ctx.lineTo(bx, by + boxH);
    ctx.lineTo(bx + cLen, by + boxH);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(bx + boxW - cLen, by + boxH);
    ctx.lineTo(bx + boxW, by + boxH);
    ctx.lineTo(bx + boxW, by + boxH - cLen);
    ctx.stroke();

    // Target Crosshair Center
    ctx.beginPath();
    ctx.arc(faceX, faceY, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Scanline bar moving down
    const scanY = (Date.now() / 15) % h;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(w, scanY);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Status Text
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(this.isUserInFrame ? 'LOCKED: USER FACE DETECTED' : 'SEARCHING FOR USER...', 8, h - 8);

    ctx.restore();
  }

  /**
   * Ambil snapshot gambar dari webcam sebagai Base64 (untuk dianalisis oleh Gemini AI Vision)
   */
  captureSnapshotBase64() {
    if (!this.isActive || !this.video) return null;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = 640;
    snapCanvas.height = 480;
    const snapCtx = snapCanvas.getContext('2d');
    // Mirror agar gambar sesuai perspektif alami
    snapCtx.translate(snapCanvas.width, 0);
    snapCtx.scale(-1, 1);
    snapCtx.drawImage(this.video, 0, 0, snapCanvas.width, snapCanvas.height);
    const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);
    return dataUrl.split(',')[1]; // Murni Base64
  }
}

window.RobotCameraVision = RobotCameraVision;
