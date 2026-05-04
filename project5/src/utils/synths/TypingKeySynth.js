import * as Tone from 'tone';

// TypingKeySynth: Rich 4-layer percussive key-click system.
// Layers: sub-bass punch · mid-range click · filtered noise burst · harmonic bell shimmer.
// variation (0-3) cycles through different pitch sets as the scene progresses.
// intensity (0-1) scales the sub-bass weight — grows louder in Phase 2.

export class TypingKeySynth {
  constructor(masterGain) {
    this.masterGain = masterGain;
    this.isDisposed = false;

    // ── Stereo panner — position set per-hit for spatial column placement ────
    this.panner = new Tone.Panner(0).connect(this.masterGain);

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
    }).connect(this.panner);

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
    }).connect(this.panner);

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
    this.noiseEnv.connect(this.panner);

    // ── Layer 4: Harmonic bell shimmer (two detuned high sines) ─────────────
    // Subtle — gives each hit a slightly musical quality.
    // Routed through a short reverb so the shimmer hangs without muddying clicks.
    this.bellReverb = new Tone.Reverb({ decay: 0.4, preDelay: 0.005 });
    this.bellReverb.connect(this.panner);

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
    this.bellEnv.connect(this.bellReverb);

    // Start continuous sources
    try {
      this.noise.start();
      this.bellOsc1.start();
      this.bellOsc2.start();
    } catch (e) {}
  }

  // Trigger a rich multi-layer key-click.
  // variation (0-3): pitch set — cycles with scene progress
  // intensity (0-1): sub-bass weight — grows louder in Phase 2
  // pan (-1..1):     stereo position — maps to column index
  // colorClass:      keyword CSS class — adjusts timbre per token type
  trigger(variation = 0, intensity = 0.4, pan = 0, colorClass = null) {
    if (this.isDisposed) return;
    try {
      const now = Tone.now();

      // ── Stereo position ───────────────────────────────────────────────────
      this.panner.pan.value = Math.max(-1, Math.min(1, pan));

      // ── Per-token timbre ─────────────────────────────────────────────────
      // Keyword class drives sub weight and bell brightness so code structure
      // is audible: errors feel heavy, imports feel crisp, types shimmer.
      let subDb     = -22;
      let bellGainDb = -24;
      let noiseFreq  = 3800 + variation * 300;
      if (colorClass === 'kw-red') {       // null / throw / Error / late — heavy
        subDb      = -18;
        bellGainDb = -34;
      } else if (colorClass === 'kw-gray') { // import / class / const — crisp
        subDb      = -26;
        bellGainDb = -20;
        noiseFreq  = 5200;
      } else if (colorClass === 'kw-blue') { // if / return / try / catch — punchy
        subDb      = -20;
      } else if (colorClass === 'kw-yellow') { // void / Widget / setState — shimmer
        bellGainDb = -20;
      }
      this.subSynth.volume.value   = subDb;
      this.bellGain.gain.value     = Tone.dbToGain(bellGainDb);

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
      this.noiseFilter.frequency.setValueAtTime(noiseFreq, now);
      this.noiseEnv.triggerAttackRelease('32n', now);

      // ── Bell shimmer (via short reverb) ──────────────────────────────────
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
      this.bellReverb.dispose();
      this.subSynth.dispose();
      this.clickSynth.dispose();
      this.panner.dispose();
    } catch (e) { /* already disposed */ }
  }
}
