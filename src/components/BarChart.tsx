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
  const colWidth = containerWidth / bars.length;
  const maxByCol = Math.max(4, colWidth * 0.96);

  return (
    <div ref={containerRef} className="flex items-end justify-center w-full h-full gap-0 pb-1">
      {bars.map((bar, idx) => {
        const catCount = Math.max(1, Math.round(bar.value / 5));
        const face = CAT_FACE[bar.state];

        // Effective stacked height in em units (first cat: 0.82em, each extra: 0.46em due to overlap).
        const stackedEm = 0.82 + (catCount - 1) * 0.46;
        // Pixel height this bar occupies.
        const barHeightPx = (bar.value / 100) * containerHeight;
        // Size cats so the stack fills the bar, but never wider than the column.
        const emojiPx = Math.min(maxByCol, Math.max(4, barHeightPx / stackedEm));

        return (
          <div
            key={idx}
            title={`value: ${bar.value}`}
            className="flex flex-col-reverse items-center flex-1 min-w-0 overflow-visible rounded-t-sm"
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
                  lineHeight: 0.82,
                  marginTop: k === 0 ? 0 : '-0.36em',
                  display: 'block',
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
