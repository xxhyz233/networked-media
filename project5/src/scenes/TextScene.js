// Text Scene: Animated "HBD" text display

import * as Tone from 'tone';
import { AudioManager } from '../utils/AudioManager.js';

export class TextScene {
  constructor() {
    this.container = null;
    this.textElement = null;
    this.animationTime = 0;
    this.animationDuration = 4000; // 4 seconds
    this.isPlaying = false;
    this.audioManager = null;
    this.celebratorySynth = null;
  }

  async init() {
    this.container = document.createElement('div');
    this.container.style.cssText = 'width:100%;height:100%;background:#000;display:flex;justify-content:center;align-items:center;';
    this.textElement = document.createElement('div');
    this.textElement.textContent = 'HBD';
    this.textElement.style.cssText = 'font-size:120px;color:#ff00ff;font-weight:bold;text-shadow:0 0 20px #ff00ff;animation:pulse 2s ease-in-out infinite;';
    this.container.appendChild(this.textElement);
    document.body.innerHTML = '';
    document.body.appendChild(this.container);
    const style = document.createElement('style');
    style.innerHTML = '@keyframes pulse { 0%, 100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.2); opacity:0.8; } }';
    document.head.appendChild(style);
    
    // Initialize audio system with celebratory synth
    this.audioManager = new AudioManager();
    await this.audioManager.init('text');
    
    // Ensure context is started then create synth
    await this.audioManager.ensureContextStarted();
    this.playCelebratorySynth();
  }
  
  playCelebratorySynth() {
    try {
      // Create a simple celebratory synth melody
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.2 },
      }).toDestination();
      
      // Simple ascending melody: G4 → B4 → D5 → G5
      const notes = ['G4', 'B4', 'D5', 'G5'];
      const now = Tone.now();
      
      notes.forEach((note, index) => {
        synth.triggerAttackRelease(note, '8n', now + index * 0.3);
      });
      
      // Loop the melody every 1.5 seconds
      const loopInterval = setInterval(() => {
        const loopNow = Tone.now();
        notes.forEach((note, index) => {
          synth.triggerAttackRelease(note, '8n', loopNow + index * 0.3);
        });
      }, 1500);
      
      this.celebratorySynth = { synth, loopInterval };
    } catch (error) {
      console.error('Error creating celebratory synth:', error);
    }
  }

  createTextElement() {
    // Create div with "HBD" text
    // Style with large font, centered, glowing effect
    // Add to DOM
  }

  animate(deltaTime) {
    // Update animation progress (0 to 1)
    // Apply CSS transform updates:
    //   - Scale in
    //   - Rotation
    //   - Opacity effects
    // Update animation time
  }

  isAnimationComplete() {
    // Return true when animation duration elapsed
  }

  cleanup() {
    if (this.celebratorySynth) {
      clearInterval(this.celebratorySynth.loopInterval);
      try {
        this.celebratorySynth.synth.dispose();
      } catch (e) {
        // Already disposed
      }
      this.celebratorySynth = null;
    }
    
    if (this.audioManager) {
      this.audioManager.cleanup();
      this.audioManager = null;
    }
    
    if (this.container) {
      this.container.remove();
    }
  }
}
