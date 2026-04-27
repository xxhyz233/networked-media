import * as Tone from 'tone';

// FootstepSynth: Marimba-like footstep sound generator
// Creates woody, percussive tones that sound natural and pleasant

export class FootstepSynth {
  constructor(masterGain, reverb) {
    this.masterGain = masterGain;
    this.reverb = reverb;
    this.isPlaying = false;
    this.triggerInterval = null;
    this.lastTriggerTime = 0;
    this.noteDensity = 3.5; // triggers per second (increased from 1)
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Start triggering marimba hits
    this.triggerInterval = setInterval(() => {
      this.triggerMarimbaHit();
    }, 1000 / this.noteDensity);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    if (this.triggerInterval) {
      clearInterval(this.triggerInterval);
      this.triggerInterval = null;
    }
  }

  triggerMarimbaHit() {
    try {
      // Create first marimba-like synth (bass footstep)
      const synth1 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { 
          attack: 0.008,      // Very fast attack (realistic mallet strike)
          decay: 0.3,         // Natural decay of marimba bar
          sustain: 0,
          release: 0.1
        },
      });
      // Connect through reverb for hollow/spacious effect
      if (this.reverb) {
        synth1.connect(this.reverb);
      } else {
        synth1.connect(this.masterGain);
      }

      // Marimba pitch range (lower notes for footsteps)
      const marimbaRange1 = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
      const randomNote1 = marimbaRange1[Math.floor(Math.random() * marimbaRange1.length)];
      const velocity1 = 0.85 + Math.random() * 0.15; // 0.85 to 1.0
      
      // Play the first note
      synth1.triggerAttackRelease(randomNote1, '32n', Tone.now(), velocity1);

      // Create second marimba-like synth (higher harmony)
      const synth2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { 
          attack: 0.012,      // Slightly slower attack for layering
          decay: 0.25,        // Slightly shorter decay
          sustain: 0,
          release: 0.08
        },
      });
      // Connect through reverb for hollow/spacious effect
      if (this.reverb) {
        synth2.connect(this.reverb);
      } else {
        synth2.connect(this.masterGain);
      }

      // Higher pitch range for the harmony
      const marimbaRange2 = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
      const randomNote2 = marimbaRange2[Math.floor(Math.random() * marimbaRange2.length)];
      const velocity2 = 0.6 + Math.random() * 0.2; // 0.6 to 0.8 (quieter than bass)
      
      // Play the second note
      synth2.triggerAttackRelease(randomNote2, '32n', Tone.now(), velocity2);

      // Create third synth: Wooden click/tap sound (bright percussive)
      const synth3 = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { 
          attack: 0.003,      // Very fast attack (3ms click)
          decay: 0.12,        // Quick decay for tap sound
          sustain: 0,
          release: 0.05
        },
      });
      // Connect through reverb
      if (this.reverb) {
        synth3.connect(this.reverb);
      } else {
        synth3.connect(this.masterGain);
      }

      // Higher pitch range for the click (G5-D6 for bright tap)
      const clickRange = ['G2', 'A2', 'B2', 'C3', 'D3'];
      const randomClick = clickRange[Math.floor(Math.random() * clickRange.length)];
      const clickVelocity = 0.7 + Math.random() * 0.2; // 0.7 to 0.9

      // Play the click
      synth3.triggerAttackRelease(randomClick, '64n', Tone.now(), clickVelocity);

      // Clean up synths after they finish
      setTimeout(() => {
        try {
          synth1.dispose();
          synth2.dispose();
          synth3.dispose();
        } catch (e) {
          // Already disposed
        }
      }, 450); // ~450ms total duration
    } catch (e) {
      // Audio context may not be started yet, silently fail
    }
  }

  setDensity(density) {
    // density: 0-5 triggers per second
    this.noteDensity = Math.max(0.5, Math.min(5, density));
    
    if (this.isPlaying) {
      if (this.triggerInterval) {
        clearInterval(this.triggerInterval);
      }
      this.triggerInterval = setInterval(() => {
        this.triggerMarimbaHit();
      }, 1000 / this.noteDensity);
    }
  }

  dispose() {
    this.stop();
  }
}
