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
  }));
}

export function useSorter(initialSize = 60) {
  const [bars, setBars] = useState<Bar[]>(() => generateArray(initialSize));
  const [stats, setStats] = useState<SortStats>({
    comparisons: 0,
    swaps: 0,
    timeElapsed: 0,
    status: 'idle',
  });
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('bubble');
  const [arraySize, setArraySizeState] = useState(initialSize);
  const [speed, setSpeedState] = useState(50); // 1–100

  const pauseRef = useRef(false);
  const stopRef = useRef(false);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { playTone } = useAudio();

  const getDelay = (s: number) => {
    // speed 1 => ~500ms, speed 100 => ~1ms
    return Math.max(1, Math.round(500 * Math.pow(0.955, s)));
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

    for (const step of gen) {
      if (stopRef.current) break;

      // Wait while paused
      while (pauseRef.current && !stopRef.current) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (stopRef.current) break;

      setBars(step.bars);
      setStats((s) => ({
        ...s,
        comparisons: step.comparisons,
        swaps: step.swaps,
      }));

      // Play tone for the last comparing/swapping bar
      const activeBar = step.bars.find(
        (b) => b.state === 'swapping' || b.state === 'comparing'
      );
      if (activeBar) {
        playTone(activeBar.value, maxValue);
      }

      await new Promise((r) => setTimeout(r, getDelay(speed)));
    }

    if (timerRef.current) clearInterval(timerRef.current);

    if (!stopRef.current) {
      setBars((prev) => prev.map((b) => ({ ...b, state: 'sorted' })));
      setStats((s) => ({ ...s, status: 'finished' }));
    }
  }, [algorithm, bars, speed, playTone]);

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
    setSpeedState(s);
  }, []);

  return {
    bars,
    stats,
    algorithm,
    arraySize,
    speed,
    setAlgorithm,
    setArraySize,
    setSpeed,
    shuffle,
    reset,
    sort,
    pause,
    resume,
  };
}
