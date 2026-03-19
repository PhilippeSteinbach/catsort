import type { Bar, SortStep } from '../types';

function clone(bars: Bar[]): Bar[] {
  return bars.map((b) => ({ ...b }));
}

// ──────────────────────────────────────────────
// Bubble Sort
// ──────────────────────────────────────────────
export function* bubbleSort(input: Bar[]): Generator<SortStep> {
  const bars = clone(input);
  const n = bars.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Mark comparing
      bars[j].state = 'comparing';
      bars[j + 1].state = 'comparing';
      comparisons++;
      yield { bars: clone(bars), comparisons, swaps };

      if (bars[j].value > bars[j + 1].value) {
        // Swap
        bars[j].state = 'swapping';
        bars[j + 1].state = 'swapping';
        swaps++;
        yield { bars: clone(bars), comparisons, swaps };
        [bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];
      }

      bars[j].state = 'default';
      bars[j + 1].state = 'default';
    }
    bars[n - i - 1].state = 'sorted';
  }
  bars[0].state = 'sorted';
  yield { bars: clone(bars), comparisons, swaps };
}

// ──────────────────────────────────────────────
// Selection Sort
// ──────────────────────────────────────────────
export function* selectionSort(input: Bar[]): Generator<SortStep> {
  const bars = clone(input);
  const n = bars.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    bars[i].state = 'pivot';

    for (let j = i + 1; j < n; j++) {
      bars[j].state = 'comparing';
      comparisons++;
      yield { bars: clone(bars), comparisons, swaps };

      if (bars[j].value < bars[minIdx].value) {
        if (minIdx !== i) bars[minIdx].state = 'default';
        minIdx = j;
        bars[minIdx].state = 'swapping';
      } else {
        bars[j].state = 'default';
      }
    }

    if (minIdx !== i) {
      [bars[i], bars[minIdx]] = [bars[minIdx], bars[i]];
      swaps++;
    }

    bars[minIdx].state = 'default';
    bars[i].state = 'sorted';
    yield { bars: clone(bars), comparisons, swaps };
  }
  bars[n - 1].state = 'sorted';
  yield { bars: clone(bars), comparisons, swaps };
}

// ──────────────────────────────────────────────
// Insertion Sort
// ──────────────────────────────────────────────
export function* insertionSort(input: Bar[]): Generator<SortStep> {
  const bars = clone(input);
  const n = bars.length;
  let comparisons = 0;
  let swaps = 0;

  bars[0].state = 'sorted';
  yield { bars: clone(bars), comparisons, swaps };

  for (let i = 1; i < n; i++) {
    bars[i].state = 'pivot';
    let j = i;

    while (j > 0) {
      bars[j - 1].state = 'comparing';
      comparisons++;
      yield { bars: clone(bars), comparisons, swaps };

      if (bars[j].value < bars[j - 1].value) {
        bars[j].state = 'swapping';
        bars[j - 1].state = 'swapping';
        swaps++;
        yield { bars: clone(bars), comparisons, swaps };
        [bars[j], bars[j - 1]] = [bars[j - 1], bars[j]];
        bars[j].state = 'sorted';
        bars[j - 1].state = 'pivot';
        j--;
      } else {
        bars[j - 1].state = 'sorted';
        break;
      }
    }
    bars[j].state = 'sorted';
    yield { bars: clone(bars), comparisons, swaps };
  }
}

// ──────────────────────────────────────────────
// Merge Sort
// ──────────────────────────────────────────────
export function* mergeSort(input: Bar[]): Generator<SortStep> {
  const bars = clone(input);
  let comparisons = 0;
  let swaps = 0;

  function* merge(
    arr: Bar[],
    left: number,
    mid: number,
    right: number
  ): Generator<SortStep> {
    const leftPart = arr.slice(left, mid + 1).map((b) => ({ ...b }));
    const rightPart = arr.slice(mid + 1, right + 1).map((b) => ({ ...b }));
    let i = 0,
      j = 0,
      k = left;

    while (i < leftPart.length && j < rightPart.length) {
      arr[k].state = 'comparing';
      comparisons++;
      yield { bars: clone(arr), comparisons, swaps };

      if (leftPart[i].value <= rightPart[j].value) {
        arr[k].value = leftPart[i].value;
        i++;
      } else {
        arr[k].value = rightPart[j].value;
        j++;
        swaps++;
      }
      arr[k].state = 'swapping';
      yield { bars: clone(arr), comparisons, swaps };
      arr[k].state = 'default';
      k++;
    }

    while (i < leftPart.length) {
      arr[k].value = leftPart[i].value;
      arr[k].state = 'swapping';
      yield { bars: clone(arr), comparisons, swaps };
      arr[k].state = 'default';
      i++;
      k++;
    }

    while (j < rightPart.length) {
      arr[k].value = rightPart[j].value;
      arr[k].state = 'swapping';
      yield { bars: clone(arr), comparisons, swaps };
      arr[k].state = 'default';
      j++;
      k++;
    }

    for (let x = left; x <= right; x++) {
      arr[x].state = 'sorted';
    }
    yield { bars: clone(arr), comparisons, swaps };
  }

  function* split(arr: Bar[], left: number, right: number): Generator<SortStep> {
    if (left >= right) {
      arr[left].state = 'sorted';
      yield { bars: clone(arr), comparisons, swaps };
      return;
    }
    const mid = Math.floor((left + right) / 2);
    yield* split(arr, left, mid);
    yield* split(arr, mid + 1, right);
    yield* merge(arr, left, mid, right);
  }

  yield* split(bars, 0, bars.length - 1);
}

// ──────────────────────────────────────────────
// Quick Sort
// ──────────────────────────────────────────────
export function* quickSort(input: Bar[]): Generator<SortStep> {
  const bars = clone(input);
  let comparisons = 0;
  let swaps = 0;

  function* partition(
    arr: Bar[],
    low: number,
    high: number
  ): Generator<SortStep, number> {
    const pivot = arr[high].value;
    arr[high].state = 'pivot';
    let i = low - 1;

    for (let j = low; j < high; j++) {
      arr[j].state = 'comparing';
      comparisons++;
      yield { bars: clone(arr), comparisons, swaps };

      if (arr[j].value <= pivot) {
        i++;
        arr[j].state = 'swapping';
        if (i !== j) {
          if (arr[i].state !== 'pivot') arr[i].state = 'swapping';
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
        }
        yield { bars: clone(arr), comparisons, swaps };
        if (arr[i].state !== 'pivot') arr[i].state = 'default';
      }
      if (arr[j].state !== 'pivot') arr[j].state = 'default';
    }

    // Place pivot
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    if (i + 1 !== high) swaps++;
    arr[i + 1].state = 'sorted';
    arr[high].state = 'default';
    yield { bars: clone(arr), comparisons, swaps };
    return i + 1;
  }

  function* qs(arr: Bar[], low: number, high: number): Generator<SortStep> {
    if (low >= high) {
      if (low === high) arr[low].state = 'sorted';
      yield { bars: clone(arr), comparisons, swaps };
      return;
    }
    const pivotIdx: number = yield* partition(arr, low, high) as unknown as Generator<SortStep, number>;
    yield* qs(arr, low, pivotIdx - 1);
    yield* qs(arr, pivotIdx + 1, high);
  }

  yield* qs(bars, 0, bars.length - 1);
}
