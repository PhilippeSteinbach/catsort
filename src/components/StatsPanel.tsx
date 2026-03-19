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

interface StatsProps {
  stats: SortStats;
  algorithm: AlgorithmId;
}

export function StatsPanel({ stats, algorithm }: StatsProps) {
  const timeStr =
    stats.timeElapsed < 1000
      ? `${stats.timeElapsed} ms`
      : `${(stats.timeElapsed / 1000).toFixed(2)} s`;

  return (
    <div className="bg-[#141824] border border-[#2d3748] rounded-xl p-4 space-y-3 min-w-[180px]">
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
