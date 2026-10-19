/**
 * 3D HOLOGRAM AVATAR ENGINE (Three.js)
 * Membuat visualisasi hologram robot 3D interaktif yang hidup,
 * berotasi, berkedip, mengikuti gerakan kursor, dan bereaksi terhadap suara percakapan.
 */

class HologramAvatar3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = 'idle'; // 'idle', 'listening', 'thinking', 'speaking'
    this.audioLevel = 0;
    this.time = 0;
    this.isBlinking = false;
    this.blinkTimer = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isInitialized = false;

    if (this.container) {
      this.init();
    }
  }

  init() {
    if (typeof THREE === 'undefined') {
      console.warn("Three.js not loaded, fallback to CSS hologram.");
      return;
    }

    try {
      const width = this.container.clientWidth || 380;
      const height = this.container.clientHeight || 380;

      // 1. Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 7.5);

      // 2. Renderer
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      // 3. Create Hologram Group
      this.hologramGroup = new THREE.Group();
      this.scene.add(this.hologramGroup);

      // Build 3D Hologram Objects
      this.buildPedestal();
      this.buildRobotHead();
      this.buildParticleCloud();
      this.buildHologramRings();
      this.buildScanRings();

      // Mouse tracking
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('resize', () => this.onResize());

      this.isInitialized = true;
      this.animate();
    } catch (e) {
      console.error("Three.js initialization failed:", e);
    }
  }

  buildPedestal() {
    // Emitter Base Ring at bottom
    const baseGeo = new THREE.RingGeometry(1.6, 2.2, 32);
    const baseMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.rotation.x = Math.PI / 2;
    baseMesh.position.y = -2.6;
    this.hologramGroup.add(baseMesh);
    this.baseMesh = baseMesh;

    // Small inner emitter disc
    const innerGeo = new THREE.CircleGeometry(0.9, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.4
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.rotation.x = Math.PI / 2;
    innerMesh.position.y = -2.59;
    this.hologramGroup.add(innerMesh);
  }

  buildRobotHead() {
    this.headGroup = new THREE.Group();

    // Outer Hologram Sphere (Wireframe Cyber Aura)
    const sphereGeo = new THREE.IcosahedronGeometry(1.4, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    this.outerSphere = new THREE.Mesh(sphereGeo, sphereMat);
    this.headGroup.add(this.outerSphere);

    // Inner Glowing Energy Core
    const coreGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.innerCore = new THREE.Mesh(coreGeo, coreMat);
    this.headGroup.add(this.innerCore);

    // Center Bright AI Nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(0.4, 0);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });
    this.nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    this.headGroup.add(this.nucleus);

    // Futuristic Eyes (Cyber Visor Lights)
    this.eyeGroup = new THREE.Group();
    const eyeGeo = new THREE.PlaneGeometry(0.32, 0.12);
    this.eyeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    const leftEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    leftEye.position.set(-0.45, 0.2, 1.15);
    this.eyeGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, this.eyeMat);
    rightEye.position.set(0.45, 0.2, 1.15);
    this.eyeGroup.add(rightEye);

    // Eye brows / HUD markers
    const browGeo = new THREE.PlaneGeometry(0.38, 0.03);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.45, 0.35, 1.15);
    this.eyeGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.45, 0.35, 1.15);
    this.eyeGroup.add(rightBrow);

    // Mouth / Audio Soundwave Indicator (dynamic scaling)
    const mouthGeo = new THREE.PlaneGeometry(0.5, 0.06);
    this.mouthMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.mouthMesh = new THREE.Mesh(mouthGeo, this.mouthMat);
    this.mouthMesh.position.set(0, -0.3, 1.15);
    this.headGroup.add(this.mouthMesh);

    this.headGroup.add(this.eyeGroup);
    this.hologramGroup.add(this.headGroup);
  }

  buildParticleCloud() {
    const particleCount = 420;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Cylinder / cone shaped upward spiral
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2.2;
      const y = (Math.random() - 0.5) * 5.2;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // Cyan to purple gradient particles
      if (Math.random() > 0.4) {
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.94;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.66;
        colors[i * 3 + 1] = 0.33;
        colors[i * 3 + 2] = 0.97;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, pMaterial);
    this.hologramGroup.add(this.particles);
  }

  buildHologramRings() {
    this.rings = [];
    const ringRadii = [1.8, 2.1, 2.4];
    ringRadii.forEach((r, idx) => {
      const geo = new THREE.RingGeometry(r, r + 0.04, 48);
      const mat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0xa855f7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45 - idx * 0.1
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2 + (idx * 0.15);
      ring.position.y = -0.5 + idx * 0.4;
      this.hologramGroup.add(ring);
      this.rings.push({ mesh: ring, speed: (idx % 2 === 0 ? 1 : -1) * (0.01 + idx * 0.005) });
    });
  }

  buildScanRings() {
    const geo = new THREE.TorusGeometry(1.7, 0.02, 8, 36);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });
    this.scanRing = new THREE.Mesh(geo, mat);
    this.scanRing.rotation.x = Math.PI / 2;
    this.hologramGroup.add(this.scanRing);
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    this.mouse.targetX = (x / rect.width) * 0.8;
    this.mouse.targetY = -(y / rect.height) * 0.8;
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 380;
    const height = this.container.clientHeight || 380;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setState(newState) {
    this.state = newState;
    if (!this.outerSphere) return;

    if (newState === 'listening') {
      this.outerSphere.material.color.setHex(0x10b981); // Emerald Green / Cyan
      this.eyeMat.color.setHex(0x10b981);
    } else if (newState === 'thinking') {
      this.outerSphere.material.color.setHex(0xa855f7); // Cyber Magenta
      this.eyeMat.color.setHex(0xa855f7);
    } else if (newState === 'speaking') {
      this.outerSphere.material.color.setHex(0x00f0ff); // Electric Cyan
      this.eyeMat.color.setHex(0x38bdf8);
    } else {
      this.outerSphere.material.color.setHex(0x00f0ff);
      this.eyeMat.color.setHex(0x00f0ff);
    }
  }

  setAudioLevel(level) {
    this.audioLevel = Math.max(0, Math.min(1, level));
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.time += 0.025;

    // Smooth head tracking to mouse
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    if (this.headGroup) {
      // Floating vertical bobbing
      const floatY = Math.sin(this.time * 1.5) * 0.12;
      this.headGroup.position.y = floatY;

      // Rotate towards mouse + idle rotation
      this.headGroup.rotation.y = this.mouse.x * 0.6 + Math.sin(this.time * 0.4) * 0.1;
      this.headGroup.rotation.x = -this.mouse.y * 0.4 + Math.cos(this.time * 0.6) * 0.05;

      // Rotate outer sphere and nucleus
      this.outerSphere.rotation.y += 0.006;
      this.innerCore.rotation.x -= 0.008;
      this.nucleus.rotation.x += 0.02;
      this.nucleus.rotation.y += 0.03;

      // State specific animations
      if (this.state === 'speaking') {
        const pulse = Math.sin(this.time * 18) * 0.15 + (this.audioLevel * 0.25);
        this.outerSphere.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        this.nucleus.scale.set(1 + pulse * 2, 1 + pulse * 2, 1 + pulse * 2);

        // Soundwave mouth expansion
        if (this.mouthMesh) {
          const mouthOpen = 0.06 + Math.abs(Math.sin(this.time * 20)) * 0.22 + (this.audioLevel * 0.2);
          this.mouthMesh.scale.set(1 + this.audioLevel * 0.4, mouthOpen / 0.06, 1);
        }
      } else if (this.state === 'listening') {
        const pulse = Math.sin(this.time * 8) * 0.08;
        this.outerSphere.scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        if (this.mouthMesh) this.mouthMesh.scale.set(1, 1, 1);
      } else if (this.state === 'thinking') {
        this.outerSphere.rotation.y += 0.04;
        this.innerCore.rotation.y -= 0.05;
        this.outerSphere.scale.set(1, 1, 1);
        if (this.mouthMesh) this.mouthMesh.scale.set(0.6, 1, 1);
      } else {
        // Idle
        this.outerSphere.scale.set(1, 1, 1);
        if (this.mouthMesh) this.mouthMesh.scale.set(1, 1, 1);
      }

      // Blinking eyes logic
      this.blinkTimer += 0.016;
      if (this.blinkTimer > 3.8) {
        this.isBlinking = true;
        this.eyeGroup.scale.y = 0.1; // closed
        if (this.blinkTimer > 4.0) {
          this.eyeGroup.scale.y = 1.0; // reopen
          this.blinkTimer = Math.random() * 1.5; // randomize next blink
          this.isBlinking = false;
        }
      }
    }

    // Upward scanning ring
    if (this.scanRing) {
      this.scanRing.position.y = -2.4 + ((this.time * 1.2) % 4.8);
      this.scanRing.material.opacity = Math.sin(((this.scanRing.position.y + 2.4) / 4.8) * Math.PI) * 0.7;
    }

    // Rotating orbital rings
    if (this.rings) {
      const speedMultiplier = this.state === 'thinking' ? 3.5 : (this.state === 'speaking' ? 2.0 : 1.0);
      this.rings.forEach(r => {
        r.mesh.rotation.z += r.speed * speedMultiplier;
      });
    }

    // Particles slow upward drift
    if (this.particles) {
      this.particles.rotation.y += 0.002;
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.012;
        if (positions[i] > 2.8) {
          positions[i] = -2.6;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.HologramAvatar3D = HologramAvatar3D;
