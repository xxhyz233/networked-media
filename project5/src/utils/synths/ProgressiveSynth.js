import * as Tone from 'tone';

// ProgressiveSynth: Polyphonic synth that evolves as video progresses
// Pitch rises, density increases, and volume grows from 0 to 1 progress

export class ProgressiveSynth {
  constructor(masterGain) {
    this.masterGain = masterGain;
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.1, release: 0.2 },
    }).connect(this.masterGain);

    this.progress = 0;
    this.lastNoteTime = 0;
    this.nextNoteDueTime = 0;
    this.isPlaying = false;
    this.noteScheduleId = null;
    this.baseVolume = 0.15; // Max volume for this synth
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // Set initial volume to 0
    this.synth.volume.value = -Infinity;
    
    // Schedule regular note generation
    this.scheduleNotes();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    if (this.noteScheduleId) {
      clearInterval(this.noteScheduleId);
    }
    
    try {
      this.synth.triggerRelease();
    } catch (e) {
      // Already released
    }
  }

  scheduleNotes() {
    this.noteScheduleId = setInterval(() => {
      if (!this.isPlaying || this.progress >= 1) return;
      
      const now = Tone.now();
      if (now >= this.nextNoteDueTime) {
        this.playProgressiveNote();
      }
    }, 100); // Check every 100ms
  }

  playProgressiveNote() {
    // Map progress (0-1) to:
    // - Pitch: C2 (36) → G4 (67) - rising over time
    // - Volume: 0 → baseVolume
    // - Density: 1 note/sec → 8 notes/sec

    try {
      // Only play if progress has actually started
      if (this.progress < 0.01) return;
      
      const progress = Math.min(this.progress, 1);
      
      // Volume: ramp from -Infinity to baseVolume
      const targetVolume = progress * this.baseVolume - (1 - progress) * 40;
      this.synth.volume.rampTo(Tone.gainToDb(progress), 0.5);

      // Pitch: C2 (36) to G4 (67)
      const minMidi = 36; // C2
      const maxMidi = 67; // G4
      const currentMidi = minMidi + progress * (maxMidi - minMidi);
      const note = Tone.Midi(Math.round(currentMidi)).toNote();

      // Density: 1 to 8 notes per second
      const minDensity = 1;
      const maxDensity = 8;
      const density = minDensity + progress * (maxDensity - minDensity);
      const noteInterval = 1000 / density; // ms between notes

      // Add slight randomization to pitch (±2 semitones)
      const pitchVariation = (Math.random() - 0.5) * 4; // -2 to +2 semitones
      const midiWithVariation = currentMidi + pitchVariation;
      const noteWithVariation = Tone.Midi(Math.round(midiWithVariation)).toNote();

      // Play note
      this.synth.triggerAttackRelease(noteWithVariation, '8n');

      // Schedule next note
      this.nextNoteDueTime = Tone.now() + noteInterval / 1000;
    } catch (e) {
      // Context may not be started yet, silently fail and retry on next interval
    }
  }

  update(progress) {
    // Called each animation frame with video progress (0-1)
    this.progress = Math.min(progress, 1);

    // Update volume smoothly
    const targetVolume = this.progress < 0.05 ? -Infinity : Tone.gainToDb(this.progress);
    this.synth.volume.value = targetVolume;
  }

  dispose() {
    this.stop();
    try {
      this.synth.dispose();
    } catch (e) {
      // Already disposed
    }
  }
}
