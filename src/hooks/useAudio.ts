import { useRef, useCallback } from 'react';

export function useAudio(soundUrl: string) {
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const bufferRef     = useRef<AudioBuffer | null>(null);
  const soundUrlRef   = useRef<string>('');
  const volumeRef     = useRef(0.25);
  const playbackRateRef = useRef(1);

  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Decode and cache the AudioBuffer; re-fetch when the sound URL changes.
  const getBuffer = useCallback(async (): Promise<AudioBuffer | null> => {
    if (bufferRef.current && soundUrlRef.current === soundUrl) {
      return bufferRef.current;
    }
    try {
      const ctx = getCtx();
      const res = await fetch(soundUrl);
      const raw = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(raw);
      bufferRef.current = decoded;
      soundUrlRef.current = soundUrl;
      return decoded;
    } catch {
      return null;
    }
  }, [soundUrl, getCtx]);

  const playTone = useCallback(
    async (value: number, maxValue: number) => {
      try {
        const ctx    = getCtx();
        const buffer = await getBuffer();
        if (!buffer) return;

        // Map bar value → detune in cents: lowest = −1200 ct, highest = +1200 ct (2 octave range)
        const t      = maxValue > 0 ? value / maxValue : 0.5;
        const detune = -1200 + t * 2400;

        const gain = ctx.createGain();
        gain.gain.value = volumeRef.current;
        gain.connect(ctx.destination);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackRateRef.current;
        source.detune.value = detune;
        source.connect(gain);

        await new Promise<void>((resolve) => {
          source.onended = () => {
            source.disconnect();
            gain.disconnect();
            resolve();
          };
          source.start(ctx.currentTime);
        });
      } catch {
        // Silently ignore audio errors
      }
    },
    [getCtx, getBuffer]
  );

  const setVolume = useCallback((volume: number) => {
    volumeRef.current = Math.min(1, Math.max(0, volume));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = Math.min(2, Math.max(0.25, rate));
  }, []);

  const close = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    bufferRef.current  = null;
    soundUrlRef.current = '';
  }, []);

  return { playTone, setVolume, setPlaybackRate, close };
}
