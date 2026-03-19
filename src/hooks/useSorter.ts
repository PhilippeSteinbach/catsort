import { useState, useRef, useCallback } from 'react';
import type { Bar, AlgorithmId, SortStats } from '../types';
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
} from '../algorithms';
import { useAudio } from './useAudio';
import { CAT_SOUNDS, DEFAULT_SOUND_ID } from '../sounds';

const ALGORITHMS: Record<AlgorithmId, (bars: Bar[]) => Generator<import('../types').SortStep>> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
};

function generateArray(size: number): Bar[] {
  return Array.from({ length: size }, () => ({
    value: Math.floor(Math.random() * (size - 1)) + 2,
    state: 'default' as const,
    colorIdx: Math.floor(Math.random() * 12),
  }));
}

export function useSorter(initialSize = 10) {
  const [bars, setBars] = useState<Bar[]>(() => generateArray(initialSize));
  const [stats, setStats] = useState<SortStats>({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0,
    status: 'idle',
  });
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('bubble');
  const [arraySize, setArraySizeState] = useState(initialSize);
  const [speed, setSpeedState] = useState(10); // 1–100
  const [audioVolume, setAudioVolumeState] = useState(25); // 0–100
  const [audioRate, setAudioRateState] = useState(100); // 50–200
  const [selectedSoundId, setSelectedSoundIdState] = useState(DEFAULT_SOUND_ID);

  const soundUrl = CAT_SOUNDS.find((s) => s.id === selectedSoundId)?.url ?? CAT_SOUNDS[0].url;

  const pauseRef = useRef(false);
  const stopRef = useRef(false);
  const speedRef = useRef(10);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playTone, setVolume, setPlaybackRate } = useAudio(soundUrl);

  // Returns how many steps to process per frame and how long to wait between frames.
  // At max speed all steps are batched (near-instant), at low speed one step per delay.
  const getStepConfig = (s: number): { delay: number; batchSize: number } => {
    if (s >= 99) return { delay: 0, batchSize: 10000 }; // near-instant
    if (s >= 90) return { delay: 0, batchSize: 200 };
    if (s >= 75) return { delay: 0, batchSize: 30 };
    if (s >= 60) return { delay: 4,  batchSize: 6 };
    return { delay: Math.max(8, Math.round(500 * Math.pow(0.945, s))), batchSize: 1 };
  };

  const shuffle = useCallback(() => {
    stopRef.current = true;
    pauseRef.current = false;
    setBars(generateArray(arraySize));
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0, status: 'idle' });
  }, [arraySize]);

  const reset = useCallback(() => {
    stopRef.current = true;
    pauseRef.current = false;
    setBars((prev) =>
      prev.map((b) => ({ ...b, state: 'default' }))
    );
    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0, status: 'idle' });
  }, []);

  const pause = useCallback(() => {
    pauseRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setStats((s) => ({ ...s, status: 'paused' }));
  }, []);

  const resume = useCallback(() => {
    pauseRef.current = false;
    startTimeRef.current = Date.now() - (stats.timeElapsed);
    timerRef.current = setInterval(() => {
      setStats((s) => ({
        ...s,
        timeElapsed: Date.now() - startTimeRef.current,
      }));
    }, 100);
    setStats((s) => ({ ...s, status: 'sorting' }));
  }, [stats.timeElapsed]);

  const sort = useCallback(async () => {
    stopRef.current = false;
    pauseRef.current = false;

    const gen = ALGORITHMS[algorithm](bars);
    const maxValue = Math.max(...bars.map((b) => b.value));

    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStats((s) => ({
        ...s,
        timeElapsed: Date.now() - startTimeRef.current,
      }));
    }, 100);

    setStats({ comparisons: 0, swaps: 0, timeElapsed: 0, status: 'sorting' });

    const iter = gen[Symbol.iterator]() as Iterator<import('../types').SortStep>;
    let latestBars = bars;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (stopRef.current) break;

      // Wait while paused
      while (pauseRef.current && !stopRef.current) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (stopRef.current) break;

      const currentSpeed = speedRef.current;
      const { delay, batchSize } = getStepConfig(currentSpeed);

      // Consume up to batchSize steps synchronously, keep only the last one
      let lastStep: import('../types').SortStep | null = null;
      let activeBar: Bar | undefined;
      let exhausted = false;

      for (let i = 0; i < batchSize; i++) {
        const result = iter.next();
        if (result.done) { exhausted = true; break; }
        lastStep = result.value;
        const ab = result.value.bars.find(
          (b) => b.state === 'swapping' || b.state === 'comparing'
        );
        if (ab) activeBar = ab;
      }

      if (lastStep) {
        latestBars = lastStep.bars;
        setBars(latestBars);
        setStats((s) => ({
          ...s,
          comparisons: lastStep.comparisons,
          swaps: lastStep.swaps,
        }));
        if (activeBar) void playTone(activeBar.value, maxValue);
      }

      if (exhausted) break;

      await new Promise((r) => setTimeout(r, delay));
    }

    if (timerRef.current) clearInterval(timerRef.current);

    if (!stopRef.current) {
      const sortedBars = latestBars.map((b) => ({ ...b, state: 'sorted' as const }));
      setBars(sortedBars);

      const finaleBars = [...sortedBars].sort((a, b) => a.value - b.value);
      for (const bar of finaleBars) {
        if (stopRef.current) break;

        const currentSpeed = speedRef.current;
        const { delay: stepDelay } = getStepConfig(currentSpeed);
        const finaleGap = currentSpeed >= 75
          ? stepDelay
          : Math.max(8, Math.round(stepDelay * 0.35));

        setBars(
          sortedBars.map((b) =>
            b === bar ? { ...b, state: 'swapping' as const } : { ...b, state: 'sorted' as const }
          )
        );

        void playTone(bar.value, maxValue);
        if (finaleGap > 0) {
          await new Promise((r) => setTimeout(r, finaleGap));
        }
      }

      setBars(sortedBars);

      if (!stopRef.current) {
        setStats((s) => ({ ...s, status: 'finished' }));
      }
    }
  }, [algorithm, bars, playTone]);

  const setArraySize = useCallback(
    (size: number) => {
      stopRef.current = true;
      setArraySizeState(size);
      setBars(generateArray(size));
      setStats({ comparisons: 0, swaps: 0, timeElapsed: 0, status: 'idle' });
    },
    []
  );

  const setSpeed = useCallback((s: number) => {
    speedRef.current = s;
    setSpeedState(s);
  }, []);

  const setAudioVolume = useCallback(
    (v: number) => {
      setAudioVolumeState(v);
      setVolume(v / 100);
    },
    [setVolume]
  );

  const setAudioRate = useCallback(
    (r: number) => {
      setAudioRateState(r);
      setPlaybackRate(r / 100);
    },
    [setPlaybackRate]
  );

  const resetSettings = useCallback(() => {
    setArraySize(10);
    speedRef.current = 10;
    setSpeedState(10);
    setAudioVolumeState(25);
    setVolume(0.25);
    setAudioRateState(100);
    setPlaybackRate(1);
    setSelectedSoundIdState(DEFAULT_SOUND_ID);
  }, [setArraySize, setVolume, setPlaybackRate]);

  return {
    bars,
    stats,
    algorithm,
    arraySize,
    speed,
    audioVolume,
    audioRate,
    selectedSoundId,
    setAlgorithm,
    setArraySize,
    setSpeed,
    setAudioVolume,
    setAudioRate,
    setSelectedSound: setSelectedSoundIdState,
    resetSettings,
    shuffle,
    reset,
    sort,
    pause,
    resume,
  };
}
