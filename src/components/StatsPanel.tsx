import { useState } from 'react';
import type { SortStats, AlgorithmId } from '../types';

const ALGO_NAMES: Record<AlgorithmId, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
  merge: 'Merge Sort',
  quick: 'Quick Sort',
};

const STATUS_COLORS: Record<SortStats['status'], string> = {
  idle: 'text-slate-400',
  sorting: 'text-cyan-400',
  paused: 'text-yellow-400',
  finished: 'text-green-400',
};

const STATUS_LABELS: Record<SortStats['status'], string> = {
  idle: 'Idle',
  sorting: 'Sorting...',
  paused: 'Paused',
  finished: 'Finished ✓',
};

const ALGO_CAT_EXPLAIN: Record<AlgorithmId, string> = {
  bubble:
    'Meow-meow! Bubble Sort is like a cat patrol that walks from left to right and checks every neighboring pair. If the left cat is larger than the right one, they instantly swap spots with a little paw-scoot. After one full patrol, the largest cat has bubbled all the way to the end and can safely nap there because no one will move it again. Then the patrol starts again, but each new round needs to check a little less at the end because that zone is already sorted. This continues until a full pass happens with no swaps at all. At that point, every cat is in ascending order and the line is perfectly calm.',
  selection:
    'Mrrp! Selection Sort works like choosing who should sit in each seat from left to right. At position 0, a scout-cat looks through the entire unsorted group and finds the smallest cat anywhere in the line. That smallest cat is swapped into the front seat. Next, the scout starts from position 1 and again searches the remaining unsorted part for the smallest cat there. Each round locks exactly one more cat into its final position. The already placed left side never changes again, while the right side keeps shrinking. It is very systematic, easy to reason about, and always produces a clean final order.',
  insertion:
    'Meow! Insertion Sort builds order the same way cats would line up politely one at a time. Start with the first cat as a tiny sorted block. Take the next cat and compare it with cats to its left; while a larger cat is found, that larger cat slides one step to the right. The moving cat keeps stepping left until it reaches the exact slot where every cat on the left is smaller and every cat on the right is larger. Then the next unsorted cat does the same. The sorted region on the left grows continuously, and by the end the entire line is sorted without ever losing the relative order of equal cats.',
  merge:
    'Prrr... Merge Sort uses divide-and-conquer cat magic. First, the full cat line is split into two halves, then each half is split again, and this continues until every mini-group has only one cat. A single-cat group is already sorted by definition. Then the algorithm merges neighboring groups back together: at each merge step it compares only the front cat of each group and takes the smaller one first. This guarantees the merged result stays sorted. The merge process repeats level by level until all groups combine into one fully sorted line. It is predictable, stable, and especially strong for larger arrays.',
  quick:
    'Hiss-meow! Quick Sort chooses one pivot cat and partitions the line around it. Every cat smaller than the pivot moves to the left side, and every cat larger than the pivot moves to the right side. After partitioning, the pivot is already in its final correct position. Then the same partition process runs recursively on the left and right sub-lines until each part is tiny and naturally sorted. Quick Sort is often very fast in practice because partitioning is efficient and it reduces big problems into smaller ones quickly. With a good pivot strategy, it tends to feel snappy even on bigger cat crowds.',
};

interface StatsProps {
  stats: SortStats;
  algorithm: AlgorithmId;
}

export function StatsPanel({ stats, algorithm }: StatsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timeStr =
    stats.timeElapsed < 1000
      ? `${stats.timeElapsed} ms`
      : `${(stats.timeElapsed / 1000).toFixed(2)} s`;

  const explainText = ALGO_CAT_EXPLAIN[algorithm];
  const isLongText = explainText.length > 220;

  return (
    <div className="bg-[#141824] border border-[#2d3748] rounded-xl p-4 w-[180px] max-w-[180px] overflow-hidden self-stretch h-full flex flex-col gap-3 min-h-0">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
        Statistics
      </h2>

      <div>
        <p className="text-xs text-slate-500">Algorithm</p>
        <p className="text-sm font-semibold text-blue-300 mt-0.5">
          {ALGO_NAMES[algorithm]}
        </p>
      </div>

      <Stat label="Comparisons" value={stats.comparisons.toLocaleString()} />
      <Stat label="Swaps" value={stats.swaps.toLocaleString()} />
      <Stat label="Time Elapsed" value={timeStr} />

      <div>
        <p className="text-xs text-slate-500">Status</p>
        <p
          className={`text-sm font-semibold mt-0.5 ${STATUS_COLORS[stats.status]}`}
        >
          {STATUS_LABELS[stats.status]}
        </p>
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-[#2d3748] space-y-1.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Legend
        </p>
        <LegendItem color="#3a4a6b" label="Default" />
        <LegendItem color="#63b3ed" label="Comparing" />
        <LegendItem color="#fc8181" label="Swapping" />
        <LegendItem color="#f6e05e" label="Pivot" />
        <LegendItem color="#68d391" label="Sorted" />
      </div>

      <div className="pt-2 border-t border-[#2d3748] flex flex-col flex-1 min-h-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Cat Explain
        </p>
        <p
          className="mt-1.5 text-xs text-slate-300 leading-relaxed break-words overflow-hidden flex-1"
        >
          {explainText}
        </p>
        {isLongText && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 self-start"
          >
            Read more...
          </button>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#2d3748] bg-[#141824] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-sm font-semibold text-white">How this algorithm purrs 🐾</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{explainText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-mono font-semibold text-slate-200 mt-0.5">
        {value}
      </p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-sm flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
