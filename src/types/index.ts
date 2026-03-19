export type BarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';

export interface Bar {
  value: number;
  state: BarState;
}

export type AlgorithmId =
  | 'bubble'
  | 'selection'
  | 'insertion'
  | 'merge'
  | 'quick';

export interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  description: string;
}

export interface SortStats {
  comparisons: number;
  swaps: number;
  timeElapsed: number;
  status: 'idle' | 'sorting' | 'paused' | 'finished';
}

export interface SortStep {
  bars: Bar[];
  comparisons: number;
  swaps: number;
}
