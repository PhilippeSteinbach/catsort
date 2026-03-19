import type { AlgorithmId, SortStats } from '../types';

interface ControlsProps {
  algorithm: AlgorithmId;
  arraySize: number;
  speed: number;
  status: SortStats['status'];
  onAlgorithm: (id: AlgorithmId) => void;
  onArraySize: (n: number) => void;
  onSpeed: (n: number) => void;
  onShuffle: () => void;
  onReset: () => void;
  onSort: () => void;
  onPause: () => void;
  onResume: () => void;
}

const ALGORITHMS: { id: AlgorithmId; label: string }[] = [
  { id: 'bubble', label: 'Bubble Sort' },
  { id: 'selection', label: 'Selection Sort' },
  { id: 'insertion', label: 'Insertion Sort' },
  { id: 'merge', label: 'Merge Sort' },
  { id: 'quick', label: 'Quick Sort' },
];

export function Controls({
  algorithm,
  arraySize,
  speed,
  status,
  onAlgorithm,
  onArraySize,
  onSpeed,
  onShuffle,
  onReset,
  onSort,
  onPause,
  onResume,
}: ControlsProps) {
  const isSorting = status === 'sorting';
  const isPaused = status === 'paused';
  const isActive = isSorting || isPaused;

  return (
    <aside className="flex flex-col gap-5 w-56 flex-shrink-0">
      {/* Algorithm selection */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Algorithm
        </h2>
        <div className="flex flex-col gap-1.5">
          {ALGORITHMS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => !isActive && onAlgorithm(algo.id)}
              disabled={isActive}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-150 ${
                algorithm === algo.id
                  ? 'bg-blue-600 text-white glow-blue'
                  : 'bg-[#1a1d2e] text-slate-300 hover:bg-[#222639] hover:text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {algo.label}
            </button>
          ))}
        </div>
      </section>

      {/* Sliders */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Settings
        </h2>
        <div className="space-y-4">
          <SliderControl
            label={`Array Size: ${arraySize}`}
            min={10}
            max={150}
            value={arraySize}
            disabled={isActive}
            onChange={onArraySize}
          />
          <SliderControl
            label={`Speed: ${speed}`}
            min={1}
            max={100}
            value={speed}
            disabled={false}
            onChange={onSpeed}
          />
        </div>
      </section>

      {/* Action buttons */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Actions
        </h2>
        <div className="flex flex-col gap-2">
          {/* Sort / Pause / Resume */}
          {!isActive ? (
            <button
              onClick={onSort}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all duration-150 glow-cyan"
            >
              ▶ Sort
            </button>
          ) : isSorting ? (
            <button
              onClick={onPause}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-yellow-600 hover:bg-yellow-500 text-white transition-all duration-150"
            >
              ⏸ Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all duration-150 glow-cyan"
            >
              ▶ Resume
            </button>
          )}

          <button
            onClick={onShuffle}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[#1a1d2e] hover:bg-[#222639] text-slate-300 hover:text-white transition-all duration-150"
          >
            🔀 Shuffle
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-[#1a1d2e] hover:bg-[#222639] text-slate-300 hover:text-white transition-all duration-150"
          >
            ↺ Reset
          </button>
        </div>
      </section>
    </aside>
  );
}

interface SliderControlProps {
  label: string;
  min: number;
  max: number;
  value: number;
  disabled: boolean;
  onChange: (n: number) => void;
}

function SliderControl({
  label,
  min,
  max,
  value,
  disabled,
  onChange,
}: SliderControlProps) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}
