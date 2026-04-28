import * as Tone from 'tone';

// TypingKeySynth: Rich 4-layer percussive key-click system.
// Layers: sub-bass punch · mid-range click · filtered noise burst · harmonic bell shimmer.
// variation (0-3) cycles through different pitch sets as the scene progresses.
// intensity (0-1) scales the sub-bass weight — grows louder in Phase 2.

export class TypingKeySynth {
  constructor(masterGain) {
    this.masterGain = masterGain;
    this.isDisposed = false;

    // ── Layer 1: Sub-bass punch ───────────────────────────────────────────────
    // Very low sine — adds physical weight to each keypress
    this.subSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack:  0.002,
        decay:   0.06,
        sustain: 0,
        release: 0.04,
      },
      volume: -22,
    }).connect(this.masterGain);

    // ── Layer 2: Mid-range click (main character) ────────────────────────────
    // Triangle gives a rounder click than sine, less scratchy than square
    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack:  0.001,
        decay:   0.05,
        sustain: 0,
        release: 0.025,
      },
      volume: -14,
    }).connect(this.masterGain);

    // ── Layer 3: Filtered noise burst (texture + high-freq click body) ───────
    this.noiseEnv = new Tone.AmplitudeEnvelope({
      attack:  0.001,
      decay:   0.04,
      sustain: 0,
      release: 0.01,
    });
    this.noise = new Tone.Noise('white');
    this.noiseFilter = new Tone.Filter({
      frequency: 4800,
      type: 'bandpass',
      Q: 3,
    });
    this.noiseVol = new Tone.Volume(-18);

    this.noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseVol);
    this.noiseVol.connect(this.noiseEnv);
    this.noiseEnv.connect(this.masterGain);

    // ── Layer 4: Harmonic bell shimmer (two detuned high sines) ─────────────
    // Subtle — gives each hit a slightly musical quality
    this.bellEnv = new Tone.AmplitudeEnvelope({
      attack:  0.003,
      decay:   0.12,
      sustain: 0,
      release: 0.06,
    });
    this.bellOsc1 = new Tone.Oscillator({ type: 'sine', frequency: 988  }); // B5
    this.bellOsc2 = new Tone.Oscillator({ type: 'sine', frequency: 1319, detune: 8 }); // E6
    this.bellGain = new Tone.Gain(Tone.dbToGain(-24));

    this.bellOsc1.connect(this.bellGain);
    this.bellOsc2.connect(this.bellGain);
    this.bellGain.connect(this.bellEnv);
    this.bellEnv.connect(this.masterGain);

    // Start continuous sources
    try {
      this.noise.start();
      this.bellOsc1.start();
      this.bellOsc2.start();
    } catch (e) {}
  }

  // Trigger a rich multi-layer key-click.
  // variation: 0-3 — cycles through pitch sets (evolves as scene progresses)
  // intensity: 0-1 — scales sub-bass weight (grows louder in Phase 2)
  trigger(variation = 0, intensity = 0.4) {
    if (this.isDisposed) return;
    try {
      const now = Tone.now();

      // ── Sub-bass: low fundamental ─────────────────────────────────────────
      const subNotes = ['A1', 'B1', 'C2', 'D2'];
      const subNote  = subNotes[Math.floor(Math.random() * subNotes.length)];
      const subVel   = 0.5 + intensity * 0.5; // 0.5 at start → 1.0 at end
      this.subSynth.triggerAttackRelease(subNote, '32n', now, subVel);

      // ── Mid click: 4 pitch sets cycling with scene progress ─────────────
      const pitchSets = [
        ['A5', 'B5', 'C6', 'D6', 'E6'],  // set 0: bright / crisp
        ['G4', 'A4', 'B4', 'C5', 'D5'],  // set 1: mid / warm
        ['E5', 'F5', 'G5', 'A5', 'B5'],  // set 2: mid-high / full
        ['C4', 'D4', 'E4', 'F4', 'G4'],  // set 3: low / heavy (late Phase 2)
      ];
      const pitchSet = pitchSets[variation % 4];
      const midNote  = pitchSet[Math.floor(Math.random() * pitchSet.length)];
      this.clickSynth.triggerAttackRelease(midNote, '48n', now, 0.75 + Math.random() * 0.2);

      // ── Noise burst ───────────────────────────────────────────────────────
      // Frequency drifts slightly with variation for texture variety
      this.noiseFilter.frequency.setValueAtTime(3800 + variation * 300, now);
      this.noiseEnv.triggerAttackRelease('32n', now);

      // ── Bell shimmer ─────────────────────────────────────────────────────
      // Slightly randomised frequencies keep rapid bursts from blurring together
      const b1Freq = 988  + (Math.random() - 0.5) * 50;
      const b2Freq = 1319 + (Math.random() - 0.5) * 70;
      this.bellOsc1.frequency.setValueAtTime(b1Freq, now);
      this.bellOsc2.frequency.setValueAtTime(b2Freq, now);
      this.bellEnv.triggerAttackRelease('64n', now, 0.25 + Math.random() * 0.35);
    } catch (e) {
      // Audio context not yet running — silently ignore
    }
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;
    try {
      this.noise.stop();
      this.noise.dispose();
      this.noiseFilter.dispose();
      this.noiseVol.dispose();
      this.noiseEnv.dispose();
      this.bellOsc1.stop();  this.bellOsc1.dispose();
      this.bellOsc2.stop();  this.bellOsc2.dispose();
      this.bellEnv.dispose();
      this.bellGain.dispose();
      this.subSynth.dispose();
      this.clickSynth.dispose();
    } catch (e) { /* already disposed */ }
  }
}
