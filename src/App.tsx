import { useSorter } from './hooks/useSorter';
import { BarChart } from './components/BarChart';
import { Controls } from './components/Controls';
import { StatsPanel } from './components/StatsPanel';

export default function App() {
  const {
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
  } = useSorter(60);

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1e2330]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Cat <span className="text-cyan-400">Sort</span> 🐱
          </h1>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">
          Interactive Sorting Algorithm Visualizer – Meow Edition
        </p>
      </header>

      {/* Main content */}
      <main className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Controls */}
        <Controls
          algorithm={algorithm}
          arraySize={arraySize}
          speed={speed}
          status={stats.status}
          onAlgorithm={setAlgorithm}
          onArraySize={setArraySize}
          onSpeed={setSpeed}
          onShuffle={shuffle}
          onReset={reset}
          onSort={sort}
          onPause={pause}
          onResume={resume}
        />

        {/* Chart area */}
        <div className="flex-1 bg-[#141824] border border-[#2d3748] rounded-xl overflow-hidden p-2">
          <BarChart bars={bars} />
        </div>

        {/* Stats */}
        <StatsPanel stats={stats} algorithm={algorithm} />
      </main>
    </div>
  );
}
