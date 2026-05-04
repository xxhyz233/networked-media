import * as Tone from 'tone';

// TypingAccentSynth: Soft melodic accents for scene milestones and phase transitions.
// Provides tonal contrast to the mechanical click layer — more musical and resonant.
// Fired sparingly (phase transition, every ~500 words) so it never becomes noise.
//
// Signal path:
//   padOsc1 (triangle) ──┐
//   padOsc2 (sine)     ──┤─→ padGain → padEnv → reverb → masterGain
//   harmOsc (triangle) ──┘                    (dry)──^
//
// Three accent types:
//   0 = 'rise'    — ascending fifth, optimistic
//   1 = 'resolve' — descending fourth, settled
//   2 = 'float'   — suspended second, ambiguous / tense

export class TypingAccentSynth {
  constructor(masterGain) {
    this.masterGain = masterGain;
    this.isDisposed = false;

    // Small reverb to give accents space without muddying the click layer
    this.reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.01 });
    this.reverb.connect(this.masterGain);

    // Pad envelope — slower than a click, short enough to stay punchy
    this.padEnv = new Tone.AmplitudeEnvelope({
      attack:  0.01,
      decay:   0.18,
      sustain: 0.04,
      release: 0.12,
    });
    this.padEnv.connect(this.reverb);

    // Low-pass filter warms the pad so it doesn't clash with clicks
    this.filter = new Tone.Filter({
      frequency: 1400,
      type: 'lowpass',
      Q: 1.5,
    });
    this.filter.connect(this.padEnv);

    // Three oscillator voices blended through a gain stage
    this.padOsc1  = new Tone.Oscillator({ type: 'triangle', frequency: 261.6 }); // C4
    this.padOsc2  = new Tone.Oscillator({ type: 'sine',     frequency: 392.0, detune: 5 }); // G4
    this.harmOsc  = new Tone.Oscillator({ type: 'triangle', frequency: 523.2, detune: -3 }); // C5 (octave)

    this.padGain  = new Tone.Gain(Tone.dbToGain(-16));
    this.padOsc1.connect(this.padGain);
    this.padOsc2.connect(this.padGain);
    this.harmOsc.connect(this.padGain);
    this.padGain.connect(this.filter);

    // Start oscillators (they run continuously; envelope gates output)
    try {
      this.padOsc1.start();
      this.padOsc2.start();
      this.harmOsc.start();
    } catch (e) {}
  }

  // Trigger a melodic accent.
  // type: 0 = rise, 1 = resolve, 2 = float
  triggerAccent(type = 0) {
    if (this.isDisposed) return;
    try {
      const now = Tone.now();

      // Pitch pairs [fundamental, fifth/fourth/second]
      const chords = [
        { f1: 'C3',  f2: 'G3',  f3: 'C4'  }, // rise: open fifth
        { f1: 'G2',  f2: 'D3',  f3: 'G3'  }, // resolve: grounded
        { f1: 'E3',  f2: 'B3',  f3: 'F#4' }, // float: suspended, tense
      ];

      const chord = chords[type % 3];
      this.padOsc1.frequency.setValueAtTime(Tone.Frequency(chord.f1).toFrequency(), now);
      this.padOsc2.frequency.setValueAtTime(Tone.Frequency(chord.f2).toFrequency(), now);
      this.harmOsc.frequency.setValueAtTime(Tone.Frequency(chord.f3).toFrequency(), now);

      this.padEnv.triggerAttackRelease('8n', now);
    } catch (e) {}
  }

  // Trigger a sustained accent chord — intended for phase transitions.
  // Holds for durationSeconds before releasing, giving the moment harmonic space.
  triggerHeld(type = 0, durationSeconds = 2.5) {
    if (this.isDisposed) return;
    try {
      const now = Tone.now();
      const chords = [
        { f1: 'C3',  f2: 'G3',  f3: 'C4'  },
        { f1: 'G2',  f2: 'D3',  f3: 'G3'  },
        { f1: 'E3',  f2: 'B3',  f3: 'F#4' },
      ];
      const chord = chords[type % 3];
      this.padOsc1.frequency.setValueAtTime(Tone.Frequency(chord.f1).toFrequency(), now);
      this.padOsc2.frequency.setValueAtTime(Tone.Frequency(chord.f2).toFrequency(), now);
      this.harmOsc.frequency.setValueAtTime(Tone.Frequency(chord.f3).toFrequency(), now);
      this.padEnv.triggerAttack(now);
      this.padEnv.triggerRelease(now + durationSeconds);
    } catch (e) {}
  }

  dispose() {
    if (this.isDisposed) return;
    this.isDisposed = true;
    try {
      this.padOsc1.stop();  this.padOsc1.dispose();
      this.padOsc2.stop();  this.padOsc2.dispose();
      this.harmOsc.stop();  this.harmOsc.dispose();
      this.padEnv.dispose();
      this.padGain.dispose();
      this.filter.dispose();
      this.reverb.dispose();
    } catch (e) {}
  }
}
