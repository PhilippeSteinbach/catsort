import { useRef, useState, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
      setContainerHeight(entries[0].contentRect.height);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Maximum emoji width: nearly the full column width.
  const colWidth = containerWidth / Math.max(1, bars.length);
  const maxByCol = Math.max(4, colWidth * 0.96);

  // Normalize bar heights against the actual maximum value so bars never overflow.
  const maxBarValue = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div ref={containerRef} className="flex items-end justify-center w-full h-full gap-0 pb-1">
      {bars.map((bar, idx) => {
        const catCount = Math.max(1, bar.value);
        const face = CAT_FACE[bar.state];

        // Pixel height this bar occupies (normalized against max value).
        const heightPct = (bar.value / maxBarValue) * 100;
        const barHeightPx = (bar.value / maxBarValue) * containerHeight;

        // Compact overlap stack from bottom to top (same visual density for every pair).
        const overlapRatio = 0.46;
        const stackEm = 1 + (catCount - 1) * overlapRatio;
        const emojiPx = Math.min(maxByCol, Math.max(4, barHeightPx / stackEm));
        const stepPx = emojiPx * overlapRatio;

        return (
          <div
            key={idx}
            title={`value: ${bar.value}`}
            className="relative flex-1 min-w-0 overflow-visible rounded-t-sm"
            style={{
              height: `${heightPct}%`,
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
                  position: 'absolute',
                  bottom: `${k * stepPx}px`,
                  left: 0,
                  right: 0,
                  fontSize: `${emojiPx}px`,
                  lineHeight: 0.82,
                  display: 'block',
                  textAlign: 'center',
                  userSelect: 'none',
                  filter: `hue-rotate(${bar.colorIdx * 30}deg)`,
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
