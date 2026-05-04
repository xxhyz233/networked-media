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

    // Pre-allocate a pool of 6 synth triplets to avoid per-hit GC pressure.
    // At 3.5 hits/sec with ~450 ms duration, at most ~2 hits overlap — 6 is ample.
    this._pool = [];
    this._poolIdx = 0;
    const dest = reverb || masterGain;
    for (let i = 0; i < 6; i++) {
      const s1 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.008, decay: 0.3, sustain: 0, release: 0.1 },
      }).connect(dest);
      const s2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.012, decay: 0.25, sustain: 0, release: 0.08 },
      }).connect(dest);
      const s3 = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.003, decay: 0.12, sustain: 0, release: 0.05 },
      }).connect(dest);
      this._pool.push({ s1, s2, s3 });
    }
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
      // Grab the next pre-allocated slot from the pool (round-robin)
      const slot = this._pool[this._poolIdx % this._pool.length];
      this._poolIdx++;

      const marimbaRange1 = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
      const marimbaRange2 = ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
      const clickRange    = ['G2', 'A2', 'B2', 'C3', 'D3'];

      slot.s1.triggerAttackRelease(
        marimbaRange1[Math.floor(Math.random() * marimbaRange1.length)],
        '32n', Tone.now(), 0.85 + Math.random() * 0.15,
      );
      slot.s2.triggerAttackRelease(
        marimbaRange2[Math.floor(Math.random() * marimbaRange2.length)],
        '32n', Tone.now(), 0.6 + Math.random() * 0.2,
      );
      slot.s3.triggerAttackRelease(
        clickRange[Math.floor(Math.random() * clickRange.length)],
        '64n', Tone.now(), 0.7 + Math.random() * 0.2,
      );
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
    this._pool.forEach(slot => {
      try { slot.s1.dispose(); slot.s2.dispose(); slot.s3.dispose(); } catch (e) {}
    });
    this._pool = [];
  }
}
