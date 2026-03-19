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
   * Play a short beep whose pitch corresponds to the bar value.
   * @param value  Bar value (0..maxValue range)
   * @param maxValue  Maximum bar value in the array
   */
  const playTone = useCallback(
    (value: number, maxValue: number) => {
      try {
        const ctx = getCtx();
        const minFreq = 120;
        const maxFreq = 1200;
        const frequency =
          minFreq + ((value / maxValue) * (maxFreq - minFreq));

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.00001,
          ctx.currentTime + 0.15
        );

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
      } catch {
        // Silently ignore audio errors (e.g., autoplay policy)
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
