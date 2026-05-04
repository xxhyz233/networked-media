import * as Tone from 'tone';

export class TextScene {
  constructor() {
    this._clockInterval = null;
    this._blinkTimeout = null;
    this._player = null;
    this._lofiChain = null;
  }

  async init() {
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;background:#f5f5f5;';

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    // Prompt text
    const prompt = document.createElement('div');
    prompt.style.cssText = `
      font-family: 'Courier New', Courier, monospace;
      font-size: clamp(18px, 2.4vw, 32px);
      color: #1a1a1a;
      letter-spacing: 0.18em;
      opacity: 0;
      transition: opacity 1.2s ease;
    `;

    const updateText = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      
      prompt.innerHTML = `HBD. <span class="date-highlight">04.28</span>  ${hh}:${mm}:${ss}`;
    };

    updateText();
    this._clockInterval = setInterval(updateText, 1000);

    wrapper.appendChild(prompt);
    document.body.appendChild(wrapper);

    // Fade in after first paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        prompt.style.opacity = '1';
      });
    });

    // Random-interval blink on the date span
    const scheduleNextBlink = () => {
      const delay = 800 + Math.random() * 3200; // 0.8s – 4s between blinks
      this._blinkTimeout = setTimeout(() => {
        const dateEl = document.querySelector('.date-highlight');
        if (!dateEl) return;
        // Toggle to inverted style
        dateEl.style.backgroundColor = '#f5f5f5';
        dateEl.style.color = '#1500ff';
        dateEl.style.outline = '1px solid #1500ff';
        // Restore after a short random flash duration
        const flashDuration = 80 + Math.random() * 200; // 80–280ms
        setTimeout(() => {
          const el = document.querySelector('.date-highlight');
          if (!el) return;
          el.style.backgroundColor = '';
          el.style.color = '';
          el.style.outline = '';
        }, flashDuration);
        scheduleNextBlink();
      }, delay);
    };
    scheduleNextBlink();

    // ── Lofi audio ────────────────────────────────────────────────────────────
    // Try to start immediately (context already unlocked if coming from a prior
    // scene). If the context is still suspended, fall back to a one-time gesture
    // listener so direct loads of this scene also work.
    this._startAudio().catch(() => {});
    const startOnGesture = () => {
      document.removeEventListener('click', startOnGesture);
      document.removeEventListener('keydown', startOnGesture);
      if (!this._player) this._startAudio().catch(() => {});
    };
    document.addEventListener('click', startOnGesture);
    document.addEventListener('keydown', startOnGesture);
  }

  async _startAudio() {
    try {
      // AudioWorkletNode (BitCrusher) requires the context to be running first.
      // Resume before constructing any nodes.
      await Tone.start();

      const vol = new Tone.Volume(-6).toDestination();
      const lpf = new Tone.Filter(600, 'lowpass', -24).connect(vol);
      const crusher = new Tone.BitCrusher(8).connect(lpf);
      const vibrato = new Tone.Vibrato({ frequency: 3.5, depth: 0.04, type: 'sine' }).connect(crusher);

      this._player = new Tone.Player({
        url: '/audio/Nizikawa.mp3',
        loop: true,
        onload: () => this._player.start(),
      }).connect(vibrato);

      this._lofiChain = { vol, lpf, crusher, vibrato };
    } catch (e) {
      console.error('TextScene audio error:', e);
    }
  }

  cleanup() {
    if (this._clockInterval) {
      clearInterval(this._clockInterval);
      this._clockInterval = null;
    }
    if (this._blinkTimeout) {
      clearTimeout(this._blinkTimeout);
      this._blinkTimeout = null;
    }
    if (this._player) {
      this._player.stop();
      this._player.dispose();
      this._player = null;
    }
    if (this._lofiChain) {
      Object.values(this._lofiChain).forEach(n => n.dispose());
      this._lofiChain = null;
    }
  }
}
