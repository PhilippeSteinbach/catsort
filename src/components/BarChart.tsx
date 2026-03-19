import type { Bar } from '../types';

interface BarChartProps {
  bars: Bar[];
}

const BAR_COLORS: Record<Bar['state'], string> = {
  default: '#3a4a6b',
  comparing: '#63b3ed',
  swapping: '#fc8181',
  sorted: '#68d391',
  pivot: '#f6e05e',
};

const BAR_GLOW: Record<Bar['state'], string> = {
  default: 'none',
  comparing: '0 0 6px rgba(99,179,237,0.9)',
  swapping: '0 0 6px rgba(252,129,129,0.9)',
  sorted: 'none',
  pivot: '0 0 6px rgba(246,224,94,0.9)',
};

export function BarChart({ bars }: BarChartProps) {
  return (
    <div className="flex items-end justify-center w-full h-full gap-px px-2">
      {bars.map((bar, idx) => (
        <div
          key={idx}
          className="flex-1 min-w-0 rounded-t-sm transition-all duration-[50ms] ease-linear"
          style={{
            height: `${bar.value}%`,
            backgroundColor: BAR_COLORS[bar.state],
            boxShadow: BAR_GLOW[bar.state],
          }}
        />
      ))}
    </div>
  );
}
