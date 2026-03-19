import type { AlgorithmId, SortStats } from '../types';
import { CAT_SOUNDS } from '../sounds';

interface ControlsProps {
  algorithm: AlgorithmId;
  arraySize: number;
  speed: number;
  audioVolume: number;
  audioRate: number;
  selectedSoundId: string;
  status: SortStats['status'];
  onAlgorithm: (id: AlgorithmId) => void;
  onArraySize: (n: number) => void;
  onSpeed: (n: number) => void;
  onAudioVolume: (n: number) => void;
  onAudioRate: (n: number) => void;
  onSelectSound: (id: string) => void;
  onResetSettings: () => void;
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
  audioVolume,
  audioRate,
  selectedSoundId,
  status,
  onAlgorithm,
  onArraySize,
  onSpeed,
  onAudioVolume,
  onAudioRate,
  onSelectSound,
  onResetSettings,
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
            min={5}
            max={150}
            value={arraySize}
            step={5}
            disabled={isActive}
            onChange={onArraySize}
          />
          <SliderControl
            label={`Speed: ${speed}`}
            min={1}
            max={100}
            value={speed}
            step={1}
            disabled={false}
            onChange={onSpeed}
          />
          <SliderControl
            label={`Meow Volume: ${audioVolume}%`}
            min={0}
            max={100}
            value={audioVolume}
            step={5}
            disabled={false}
            onChange={onAudioVolume}
          />
          <SliderControl
            label={`Meow Rate: ${(audioRate / 100).toFixed(2)}x`}
            min={50}
            max={200}
            value={audioRate}
            step={5}
            disabled={false}
            onChange={onAudioRate}
          />

          {/* Sound picker */}
          <div>
            <p className="text-xs text-slate-400 mb-1.5">Katzengeräusch</p>
            <div className="flex flex-wrap gap-1.5">
              {CAT_SOUNDS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectSound(s.id)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                    selectedSoundId === s.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-[#1a1d2e] text-slate-300 hover:bg-[#222639] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onResetSettings}
            disabled={isActive}
            className="w-full mt-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1d2e] text-slate-400 hover:bg-[#222639] hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            ↺ Reset Settings
          </button>
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
  step: number;
  disabled: boolean;
  onChange: (n: number) => void;
}

function SliderControl({
  label,
  min,
  max,
  value,
  step,
  disabled,
  onChange,
}: SliderControlProps) {
  const decrease = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const increase = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrease}
          disabled={disabled || value <= min}
          className="w-7 h-7 rounded-md bg-[#1a1d2e] text-slate-200 hover:bg-[#222639] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`${label} decrease`}
        >
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={increase}
          disabled={disabled || value >= max}
          className="w-7 h-7 rounded-md bg-[#1a1d2e] text-slate-200 hover:bg-[#222639] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={`${label} increase`}
        >
          +
        </button>
      </div>
    </div>
  );
}
