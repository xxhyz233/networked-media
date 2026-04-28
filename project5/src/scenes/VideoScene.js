import * as THREE from 'three';
import gsap from 'gsap';
import { AudioManager } from '../utils/AudioManager.js';

// Video Scene: 360 degree interactive video playback with hotspots (only Three.js scene)

export class VideoScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager || null;
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.sphere = null;
    this.hotspotMeshes = [];
    this.sceneData = null;
    this.videoElement = null;
    this.videoTexture = null;
    this.yaw = 0;
    this.pitch = 0;
    this.backwardInterval = null;
    this.audioManager = null;
  }

  async init() {
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;overflow:hidden;background:#000;';
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 0);
    this.camera.up.set(0, 1, 0);
    
    this.scene = new THREE.Scene();
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);
    
    const material = new THREE.MeshBasicMaterial();
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
    
    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
    
    // Debug UI (commented out)
    // const debugUI = document.createElement('div');
    // debugUI.style.cssText = 'position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:15px;font-family:monospace;font-size:12px;border:1px solid #0f0;max-width:300px;';
    // debugUI.innerHTML = `
    //   <div>Playback Rate (W/S or slider):</div>
    //   <input type="range" id="playback-slider" min="-10" max="10" step="0.1" value="0" style="width:200px;">
    //   <div id="playback-value">0.0x (paused)</div>
    //   <div style="margin-top:10px;border-top:1px solid #0f0;padding-top:10px;">
    //     <div>Video Status:</div>
    //     <div id="video-status">Loading...</div>
    //     <div id="video-duration" style="font-size:11px;margin-top:5px;">Duration: --:--</div>
    //     <div id="video-current" style="font-size:11px;">Current: --:--</div>
    //     <div id="video-buffered" style="font-size:11px;">Buffered: 0%</div>
    //   </div>
    // `;
    // document.body.appendChild(debugUI);

    const slider = { value: 0 }; // stub (debug UI off)
    const valueDisplay = { textContent: '' }; // stub
    
    try {
      const response = await fetch('/api/scenes?id=video');
      this.sceneData = await response.json();
      this.setupVideo(this.sceneData.videoPath);
    } catch (error) {
      console.error('Failed to load video scene:', error);
    }
    
    // slider.addEventListener (debug UI off — slider is a stub)
    
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    this.renderer.domElement.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      this.yaw -= deltaX * 0.005;
      this.pitch += deltaY * 0.005;
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
      
      const euler = new THREE.Euler(this.pitch, -this.yaw, 0, 'YXZ');
      this.camera.quaternion.setFromEuler(euler);
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    this.renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W') {
        this.videoElement.play();
        this.videoElement.playbackRate = 1.0;
        clearInterval(this.backwardInterval);
        slider.value = 1.0;
        valueDisplay.textContent = '1.0x (forward)';
        // Start footstep sounds and fade in ambient
        if (this.audioManager) {
          this.audioManager.playFootsteps(true);
          this.audioManager.fadeInAmbient(0.25);
        }
      } else if (e.key === 's' || e.key === 'S') {
        this.videoElement.pause();
        this.videoElement.playbackRate = 0;
        clearInterval(this.backwardInterval);
        this.backwardInterval = setInterval(() => {
          if (this.videoElement.currentTime > 0) {
            this.videoElement.currentTime = Math.max(0, this.videoElement.currentTime - 0.016);
          }
        }, 16);
        slider.value = -1.0;
        valueDisplay.textContent = '-1.0x (backward)';
        // Start footstep sounds and fade in ambient
        if (this.audioManager) {
          this.audioManager.playFootsteps(true);
          this.audioManager.fadeInAmbient(0.25);
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if ((e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S')) {
        this.videoElement.pause();
        this.videoElement.playbackRate = 0;
        clearInterval(this.backwardInterval);
        slider.value = 0;
        valueDisplay.textContent = '0.0x (paused)';
        // Stop footstep sounds and fade out ambient
        if (this.audioManager) {
          this.audioManager.playFootsteps(false);
          this.audioManager.fadeOutAmbient(0.25);
        }
      }
    });
    
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Initialize audio system
    this.audioManager = new AudioManager();
    await this.audioManager.init('video');
    this.audioManager.playAmbient('/audio/ambience_01.mp3');
    
    this.animate();
  }

  setupVideo(videoPath) {
    this.videoElement = document.createElement('video');
    this.videoElement.src = videoPath;
    this.videoElement.crossOrigin = 'anonymous';
    this.videoElement.preload = 'auto';
    
    this.videoElement.addEventListener('error', (e) => {
      console.error('Video error:', e);
    });

    this.videoElement.addEventListener('ended', () => {
      // Lock to last frame — prevent any replay
      this.videoElement.pause();
      this.videoElement.currentTime = this.videoElement.duration;

      // Fade to white over 1.5s, then transition to text scene
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;z-index:9999;pointer-events:none;';
      document.body.appendChild(overlay);

      gsap.to(overlay, {
        opacity: 1,
        duration: 1.5,
        ease: 'power1.inOut',
        onComplete: () => {
          if (this.sceneManager) {
            this.sceneManager.transitionTo('text').catch(console.error);
          }
        },
      });
    });
    
    this.videoTexture = new THREE.VideoTexture(this.videoElement);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.flipY = true;
    
    this.sphere.material.map = this.videoTexture;
    this.sphere.material.needsUpdate = true;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createHotspots() {
    // For each hotspot in sceneData:
    // - Create 3D sphere mesh at (x, y, z) coordinates
    // - Store hotspot metadata on mesh.userData
    // - Add mesh to Three.js scene
    // - Project to 2D screen space for UI labels
  }

  updateHotspotPositions() {
    // Project all 3D hotspot meshes to 2D screen coordinates
    // Show labels only when hotspot is in front of camera
    // Update label CSS positioning
  }

  handleHotspotClick(hotspotId) {
    // Find hotspot by ID
    // Get linked scene ID
    // Trigger transition
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  isVideoComplete() {
    // Check if video has finished playing
  }

  cleanup() {
    clearInterval(this.backwardInterval);
    
    // Clean up audio system
    if (this.audioManager) {
      this.audioManager.cleanup();
      this.audioManager = null;
    }
    
    if (this.videoElement) {
      this.videoElement.pause();
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
    if (this.sphere) {
      this.sphere.geometry.dispose();
      this.sphere.material.dispose();
    }
  }
}
