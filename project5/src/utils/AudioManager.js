import * as Tone from 'tone';
import { FootstepSynth } from './synths/FootstepSynth.js';
import { ProgressiveSynth } from './synths/ProgressiveSynth.js';
import { TypingKeySynth } from './synths/TypingKeySynth.js';
import { TypingAmbientSynth } from './synths/TypingAmbientSynth.js';
import { TypingAccentSynth } from './synths/TypingAccentSynth.js';

// AudioManager: Central audio system handling all three sound layers
// - Footsteps (glitchy synth)
// - Ambient (looped field recording)
// - Progressive synth (evolves with video progress)

export class AudioManager {
  constructor() {
    this.masterGain = null;
    this.audioContext = null;
    this.footstepSynth = null;
    this.progressiveSynth = null;
    this.typingKeySynth    = null;
    this.typingAmbientSynth = null;
    this.typingAccentSynth  = null;
    this.ambientPlayer = null;
    this.isInitialized = false;
    this.sceneType = null;
    this.contextStarted = false;
    this.startContextOnGesture = null;
    // Throttle key-click triggers so rapid auto-gen batches stay below ~30/sec
    this._lastClickTime = 0;
  }

  async ensureContextStarted() {
    // Ensure audio context is started (deferred until user gesture)
    if (this.contextStarted) return;
    
    try {
      // Tone.start() must be called after a user gesture
      await Tone.start();
      this.contextStarted = true;
      console.log('✓ Audio context started');
      
      // Now that context is running, start ambient if it's queued
      if (this.ambientPlayer && this.ambientPlayer.state !== 'started') {
        console.log('Starting queued ambient player...');
        this.ambientPlayer.start();
        console.log('✓ Ambient playback started from context resume');
      }
    } catch (error) {
      console.error('Failed to start audio context:', error);
    }
  }

  // Fire-and-forget version for event handlers
  fireContextStart() {
    if (!this.contextStarted) {
      this.ensureContextStarted().catch(err => console.error('Context start error:', err));
    }
  }

  async init(sceneType = 'default') {
    try {
      // Don't start context here - wait for user gesture
      this.audioContext = Tone.getContext();
      this.isInitialized = true;
      this.sceneType = sceneType;

      // Create master gain for volume control
      this.masterGain = new Tone.Gain(0.8).toDestination();

      // Add optional compressor to master bus for dynamic control
      this.compressor = new Tone.Compressor(-30, 3);
      this.compressor.connect(this.masterGain);

      // Create reverb for hollow/spacious footstep effect
      this.reverb = new Tone.Reverb({
        decay: 3.5,    // 3.5 seconds of reverb tail (hollow effect)
        preDelay: 0.01 // 10ms pre-delay
      });
      this.reverb.connect(this.compressor);

      // Initialize synths based on scene type
      if (sceneType === 'video') {
        this.footstepSynth = new FootstepSynth(this.compressor, this.reverb);
        // Progressive synth disabled - using field recording only
        // this.progressiveSynth = new ProgressiveSynth(this.compressor);
        // this.progressiveSynth.start();
      } else if (sceneType === 'typing') {
        // Typing scene: mechanical key-click synth + evolving ambient drone + accent synth
        this.typingKeySynth    = new TypingKeySynth(this.compressor);
        this.typingAmbientSynth = new TypingAmbientSynth(this.compressor);
        this.typingAccentSynth  = new TypingAccentSynth(this.compressor);
      } else {
        // Other scenes: minimal setup
        this.footstepSynth = new FootstepSynth(this.compressor, this.reverb);
      }

      console.log(`AudioManager initialized for scene: ${sceneType}`);
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
    }
  }

  async playAmbient(filePath) {
    try {
      if (!this.isInitialized) {
        console.warn('AudioManager not initialized, cannot play ambient');
        return;
      }

      console.log('Creating ambient player for:', filePath);
      
      this.ambientIsPlaying = false; // Track ambient state
      this.ambientFadeTimeout = null; // Track pending fade operations
      
      // Create player but do NOT start it automatically
      this.ambientPlayer = new Tone.Player({
        url: filePath,
        loop: true,
        onload: () => {
          console.log('✓ Ambient file loaded and ready to fade in');
        },
        onerror: (err) => {
          console.error('✗ Failed to load ambient file:', err);
        }
      });

      this.ambientPlayer.connect(this.compressor);
      this.ambientPlayer.volume.value = -Infinity; // Start silent
      
      console.log('Ambient player queued and connected');
    } catch (error) {
      console.error('Failed to queue ambient track:', error);
    }
  }

  fadeInAmbient(duration = 1.0) {
    if (!this.ambientPlayer) {
      console.warn('Ambient player not initialized');
      return;
    }

    try {
      // Cancel any pending fade-out
      if (this.ambientFadeTimeout) {
        clearTimeout(this.ambientFadeTimeout);
        this.ambientFadeTimeout = null;
      }

      if (!this.ambientIsPlaying) {
        try {
          console.log('Starting ambient playback with fade in...');
          // Ensure player is in a clean state
          if (this.ambientPlayer.state === 'started') {
            this.ambientPlayer.stop();
          }
          this.ambientPlayer.start();
          this.ambientIsPlaying = true;
        } catch (err) {
          console.warn('Could not start ambient player:', err.message);
          this.ambientIsPlaying = false;
          return;
        }
      }
      
      // Fade from silent to -16 dB
      this.ambientPlayer.volume.rampTo(-16, duration);
      console.log(`✓ Ambient fading in over ${duration}s`);
    } catch (err) {
      console.error('Error fading in ambient:', err);
    }
  }

  fadeOutAmbient(duration = 1.0) {
    if (!this.ambientPlayer || !this.ambientIsPlaying) {
      return; // Silently fail if not playing
    }

    try {
      // Cancel any pending fade-out timeout
      if (this.ambientFadeTimeout) {
        clearTimeout(this.ambientFadeTimeout);
      }

      // Fade to silent
      this.ambientPlayer.volume.rampTo(-Infinity, duration);
      console.log(`✓ Ambient fading out over ${duration}s`);
      
      // Stop playback after fade completes
      this.ambientFadeTimeout = setTimeout(() => {
        try {
          if (this.ambientPlayer && this.ambientIsPlaying) {
            this.ambientPlayer.stop();
            this.ambientIsPlaying = false;
            console.log('Ambient stopped after fade out');
          }
        } catch (e) {
          // Already stopped or disposed
        }
      }, duration * 1000 + 50); // Add 50ms buffer
    } catch (err) {
      console.error('Error fading out ambient:', err);
    }
  }

  playFootsteps(isPlaying) {
    if (!this.footstepSynth) {
      console.warn('Footstep synth not initialized');
      return;
    }

    console.log('playFootsteps called:', isPlaying);
    
    // Start context in background on first interaction
    this.fireContextStart();

    if (isPlaying) {
      console.log('Starting footsteps');
      this.footstepSynth.start();
    } else {
      console.log('Stopping footsteps');
      this.footstepSynth.stop();
    }
  }

  updateProgressiveSynth(progress) {
    // progress: 0-1 (video currentTime / duration)
    if (!this.progressiveSynth) return;
    this.progressiveSynth.update(progress);
  }

  // Trigger a rich multi-layer key-click, rate-limited to ~30/sec max.
  // variation (0-3): pitch set — caller should pass Math.floor(progress*4)
  // intensity (0-1): sub-bass weight — caller should pass scene progress
  triggerKeyClick(variation = 0, intensity = 0.4) {
    if (!this.typingKeySynth || !this.contextStarted) return;
    const now = performance.now();
    if (now - this._lastClickTime < 33) return; // ≈30 Hz ceiling
    this._lastClickTime = now;
    this.typingKeySynth.trigger(variation, intensity);
  }

  // Fire a melodic accent (0 = rise, 1 = resolve, 2 = float).
  // Intended for phase transitions and word-count milestones.
  triggerTypingAccent(type = 0) {
    if (!this.typingAccentSynth || !this.contextStarted) return;
    this.typingAccentSynth.triggerAccent(type);
  }

  // Drive the ambient drone; call whenever scene progress changes. progress: 0→1
  updateTypingProgress(progress) {
    if (!this.typingAmbientSynth) return;
    this.typingAmbientSynth.update(progress);
  }

  setMasterVolume(volume) {
    // volume: 0-1
    if (this.masterGain) {
      this.masterGain.gain.rampTo(volume, 0.1);
    }
  }

  cleanup() {
    try {
      if (this.footstepSynth) {
        this.footstepSynth.dispose();
        this.footstepSynth = null;
      }

      if (this.progressiveSynth) {
        this.progressiveSynth.dispose();
        this.progressiveSynth = null;
      }

      if (this.typingKeySynth) {
        this.typingKeySynth.dispose();
        this.typingKeySynth = null;
      }

      if (this.typingAmbientSynth) {
        this.typingAmbientSynth.dispose();
        this.typingAmbientSynth = null;
      }

      if (this.typingAccentSynth) {
        this.typingAccentSynth.dispose();
        this.typingAccentSynth = null;
      }

      if (this.ambientPlayer) {
        this.ambientPlayer.stop();
        this.ambientPlayer.dispose();
        this.ambientPlayer = null;
      }

      if (this.compressor) {
        this.compressor.dispose();
        this.compressor = null;
      }

      if (this.reverb) {
        this.reverb.dispose();
        this.reverb = null;
      }

      if (this.masterGain) {
        this.masterGain.dispose();
        this.masterGain = null;
      }

      this.isInitialized = false;
      console.log('AudioManager cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  async dispose() {
    this.cleanup();
  }
}
