import * as Tone from 'tone';

// TypingAmbientSynth: Low evolving drone that grows more apparent toward the end
// of the typing scene. Starts near-silent, opens up in volume and texture as
// progress approaches 1.
//
// Signal path:
//   osc1 (saw 40 Hz) ──┐
//   osc2 (saw 40 Hz  ──┤─→ droneGain → lpFilter → vol → masterGain
//   osc3 (sin 80 Hz) ──┘
//   noise (pink)     ──→ noiseVol ────────────────────────^
//   lfo              ──→ modulates lpFilter.frequency

export class TypingAmbientSynth {
  constructor(masterGain) {
    this.masterGain = masterGain;
    this.isDisposed = false;
    this.isStarted  = false;

    // Master volume for the whole ambient layer — starts completely silent
    this.vol = new Tone.Volume(-Infinity).connect(this.masterGain);

    // Low-pass filter: starts very closed (80 Hz) and opens upward with progress
    this.filter = new Tone.Filter({
      frequency: 80,
      type:      'lowpass',
      rolloff:   -24,
      Q:         0.8,
    }).connect(this.vol);

    // Three detuned oscillators for thickness: sub, slight detune, octave
    this.osc1 = new Tone.Oscillator({ type: 'sawtooth', frequency: 40,  detune:  0   }).connect(this.filter);
    this.osc2 = new Tone.Oscillator({ type: 'sawtooth', frequency: 40,  detune:  7   }).connect(this.filter);
    this.osc3 = new Tone.Oscillator({ type: 'sine',     frequency: 80,  detune:  1   }).connect(this.filter);

    // Drone mix gain (-6 dB so three oscs together are reasonable)
    // We control overall level via this.vol, but trim the raw osc mix here
    this.droneGain = new Tone.Gain(Tone.dbToGain(-6));
    // Rewire oscs through droneGain → filter
    this.osc1.disconnect(); this.osc2.disconnect(); this.osc3.disconnect();
    this.osc1.connect(this.droneGain);
    this.osc2.connect(this.droneGain);
    this.osc3.connect(this.droneGain);
    this.droneGain.connect(this.filter);

    // Pink noise layer — fades in from the second half of the scene
    this.noiseVol = new Tone.Volume(-Infinity).connect(this.filter);
    this.noise    = new Tone.Noise('pink').connect(this.noiseVol);

    // Very slow LFO (0.05 Hz ≈ one cycle every 20 s) for gentle filter shimmer
    this.lfo = new Tone.LFO({ frequency: 0.05, min: -10, max: 10 });
    this.lfo.connect(this.filter.frequency);

    // Second LFO on osc2 detune — slight ±15 cent wobble creates beating between oscs
    this.lfo2 = new Tone.LFO({ frequency: 0.07, min: -15, max: 15 });
    this.lfo2.connect(this.osc2.detune);

    // Heartbeat pulse — low thump that fades in at p=0.3 and accelerates to p=1
    this._hbVol   = new Tone.Volume(-Infinity).connect(this.filter);
    this._hbSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.22, sustain: 0, release: 0.08 },
      volume: -3,
    }).connect(this._hbVol);
    this._hbTimer    = null;
    this._hbProgress = 0;
    this._hbStarted  = false;
  }

  start() {
    if (this.isStarted || this.isDisposed) return;
    this.isStarted = true;
    try {
      this.osc1.start();
      this.osc2.start();
      this.osc3.start();
      this.noise.start();
      this.lfo.start();
      this.lfo2.start();
    } catch (e) { /* context may not be running yet — update() will retry */ }
  }

  // Low sine thump — rate accelerates from 0.6 Hz → 1.4 Hz as progress grows
  _tickHeartbeat() {
    if (this.isDisposed) return;
    try {
      this._hbSynth.triggerAttackRelease('A1', '64n', Tone.now(), 0.8);
    } catch (e) {}
    const hz = 0.6 + this._hbProgress * 0.8; // 0.6 → 1.4 Hz
    this._hbTimer = setTimeout(() => this._tickHeartbeat(), 1000 / hz);
  }

  // Call this whenever scene progress changes. progress: 0 → 1
  // 0   = completely silent
  // 0.5 = just barely audible
  // 1.0 = full presence (~−22 dB)
  update(progress) {
    if (this.isDisposed) return;
    if (!this.isStarted) this.start();

    const p = Math.max(0, Math.min(1, progress));

    // ── Volume ───────────────────────────────────────────────────────────────
    // Ease-in power curve: silent until ~0.25, then ramps meaningfully
    const eased   = Math.pow(p, 2.0);
    const dbMin   = -Infinity;
    const dbMax   = -22;
    // Avoid -Infinity in rampTo (Tone.js dislikes it after context starts)
    const targetDb = p < 0.02 ? -80 : dbMax + (0 - dbMax) * (1 - eased);
    try {
      this.vol.volume.rampTo(targetDb, 2.0);
    } catch (e) {}

    // ── Filter sweep ─────────────────────────────────────────────────────────
    // Opens from 80 Hz at p=0 → 700 Hz at p=1
    const freqTarget = 80 + (700 - 80) * p;
    try {
      this.filter.frequency.rampTo(freqTarget, 3.0);
    } catch (e) {}

    // ── Noise layer ───────────────────────────────────────────────────────────
    // Only fades in after p = 0.5; at p=1 it sits at -30 dB relative to drone
    const noiseP  = Math.max(0, (p - 0.5) / 0.5);   // 0 → 1 over second half
    const noiseDb = noiseP < 0.01 ? -80 : -38 + noiseP * 14; // -38 dB → -24 dB
    try {
      this.noiseVol.volume.rampTo(noiseDb, 2.5);
    } catch (e) {}

    // ── Root frequency drift: 40 Hz → 55 Hz — gives the drone a tonal arc ──
    const rootFreq = 40 + 15 * p;
    try {
      this.osc1.frequency.rampTo(rootFreq,      8.0);
      this.osc2.frequency.rampTo(rootFreq,      8.0);
      this.osc3.frequency.rampTo(rootFreq * 2,  8.0);
    } catch (e) {}

    // ── LFO speed: quickens very slightly with progress ─────────────────────
    const lfoFreq = 0.04 + p * 0.08; // 0.04 Hz → 0.12 Hz
    try {
      this.lfo.frequency.rampTo(lfoFreq, 4.0);
    } catch (e) {}

    // ── Heartbeat: fades in from p=0.3, accelerates toward end ──────────────
    this._hbProgress = p;
    const hbP  = Math.max(0, (p - 0.3) / 0.7);  // 0 → 1 over the second 70%
    const hbDb = hbP < 0.01 ? -80 : -42 + hbP * 16; // -42 dB → -26 dB
    try { this._hbVol.volume.rampTo(hbDb, 2.0); } catch (e) {}
    if (!this._hbStarted && p >= 0.3) {
      this._hbStarted = true;
      this._tickHeartbeat();
    }
  }

  // Smoothly ramp everything to silence over `duration` seconds (default 2 s).
  // Safe to call even if the synth was never fully audible.
  fadeOut(duration = 2.0) {
    if (this.isDisposed) return;
    try {
      this.vol.volume.rampTo(-80, duration);
      this.noiseVol.volume.rampTo(-80, duration);
      this._hbVol.volume.rampTo(-80, duration);
    } catch (e) {}
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;
    clearTimeout(this._hbTimer);
    try {
      this.lfo.stop();        this.lfo.dispose();
      this.lfo2.stop();       this.lfo2.dispose();
      this.osc1.stop();       this.osc1.dispose();
      this.osc2.stop();       this.osc2.dispose();
      this.osc3.stop();       this.osc3.dispose();
      this.noise.stop();      this.noise.dispose();
      this.noiseVol.dispose();
      this.droneGain.dispose();
      this.filter.dispose();
      this.vol.dispose();
      this._hbSynth.dispose();
      this._hbVol.dispose();
    } catch (e) { /* already disposed */ }
  }
}
