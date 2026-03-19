import type { Bar } from '../types';

interface BarChartProps {
  bars: Bar[];
}

/** Cat emoji for each bar state */
const CAT_FACE: Record<Bar['state'], string> = {
  default:   '🐱', // neutral cat
  comparing: '😸', // grinning cat
  swapping:  '🙀', // shocked/swapping cat
  sorted:    '😻', // heart-eyes cat
  pivot:     '😼', // smirking pivot cat
};

/** Glow colour behind the active emoji column */
const COL_BG: Record<Bar['state'], string> = {
  default:   'transparent',
  comparing: 'rgba(99,179,237,0.12)',
  swapping:  'rgba(252,129,129,0.15)',
  sorted:    'rgba(104,211,145,0.10)',
  pivot:     'rgba(246,224,94,0.13)',
};

const COL_SHADOW: Record<Bar['state'], string> = {
  default:   'none',
  comparing: '0 0 8px rgba(99,179,237,0.7)',
  swapping:  '0 0 8px rgba(252,129,129,0.8)',
  sorted:    'none',
  pivot:     '0 0 8px rgba(246,224,94,0.8)',
};

export function BarChart({ bars }: BarChartProps) {
  // Derive a font-size for the emoji that keeps cats visible regardless of array size
  // 150 bars → ~4px column, 10 bars → ~60px column. Cap emoji at 18px, min 7px.
  const emojiPx = Math.min(18, Math.max(7, Math.floor(600 / bars.length)));

  return (
    <div className="flex items-end justify-center w-full h-full gap-px px-1 pb-1">
      {bars.map((bar, idx) => {
        const catCount = Math.max(1, Math.round(bar.value / 5));
        const face = CAT_FACE[bar.state];

        return (
          <div
            key={idx}
            title={`value: ${bar.value}`}
            className="flex flex-col-reverse items-center flex-1 min-w-0 overflow-hidden rounded-t-sm"
            style={{
              height: `${bar.value}%`,
              backgroundColor: COL_BG[bar.state],
              boxShadow: COL_SHADOW[bar.state],
              transition: 'height 60ms linear, background-color 60ms ease',
            }}
          >
            {Array.from({ length: catCount }, (_, k) => (
              <span
                key={k}
                aria-hidden="true"
                style={{
                  fontSize: `${emojiPx}px`,
                  lineHeight: 1,
                  display: 'block',
                  userSelect: 'none',
                }}
              >
                {face}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
