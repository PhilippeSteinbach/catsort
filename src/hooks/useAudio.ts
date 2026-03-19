import { useRef, useCallback } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Synthesise a short cat-meow sound.
   * The pitch scales with the bar value so higher bars produce higher-pitched meows.
   *
   * @param value     Bar value
   * @param maxValue  Maximum bar value in the current array
   */
  const playTone = useCallback(
    (value: number, maxValue: number) => {
      try {
        const ctx = getCtx();
        const t = ctx.currentTime;

        // Map value → base frequency (200 Hz – 900 Hz)
        const minF = 200;
        const maxF = 900;
        const baseFreq = minF + (value / maxValue) * (maxF - minF);

        // --- Main oscillator (sawtooth for cat-like timbre) ---
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';

        // Meow pitch contour: swoop up then back down
        osc.frequency.setValueAtTime(baseFreq * 0.7, t);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.35, t + 0.06);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, t + 0.22);

        // --- Formant-like bandpass filter (gives nasal "mew" quality) ---
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq * 2.2, t);
        filter.frequency.linearRampToValueAtTime(baseFreq * 1.6, t + 0.22);
        filter.Q.value = 3.5;

        // --- Amplitude envelope ---
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.03);   // attack
        gain.gain.setValueAtTime(0.18, t + 0.10);             // sustain
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24); // release

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      } catch {
        // Silently ignore audio errors (e.g., autoplay policy restrictions)
      }
    },
    [getCtx]
  );

  const close = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
  }, []);

  return { playTone, close };
}
