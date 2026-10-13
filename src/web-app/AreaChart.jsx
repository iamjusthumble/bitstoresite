import React, { useId, useMemo, useRef, useState } from 'react';
import { formatPrice } from '../marketData.js';
import { cx } from '../ui.js';
import { Money } from './format.jsx';

const W = 1000;
const H = 200;

// Catmull-Rom spline through the points, written as cubic Béziers
function smoothPath(pts) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]];
    d += ' C' + c.map((n) => n.toFixed(1)).join(' ');
  }
  return d;
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

const straightPath = (pts) => pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');

// Area chart of a dollar value over time. Hover, touch or use the arrow keys to read a point.
// `smooth` rounds the line for sparse series; dense market data reads better with straight segments.
export default function AreaChart({ series, hidden = false, smooth = true, label = 'Balance history' }) {
  const gradientId = useId();
  const plot = useRef(null);
  const [active, setActive] = useState(null);
  const { points, ticks, showTime } = series;

  const { line, area, coords } = useMemo(() => {
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1;
    const xy = points.map((p, i) => [(i / (points.length - 1)) * W, 14 + (1 - (p.value - min) / range) * (H - 58)]);
    const path = smooth ? smoothPath(xy) : straightPath(xy);
    return { line: path, area: `${path} L${W} ${H} L0 ${H} Z`, coords: xy };
  }, [points, smooth]);

  const last = points.length - 1;
  const index = active === null ? null : Math.min(active, last);
  const point = index === null ? null : points[index];
  const left = index === null ? 0 : (coords[index][0] / W) * 100;
  const top = index === null ? 0 : (coords[index][1] / H) * 100;

  const onPointer = (e) => {
    const rect = plot.current.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setActive(Math.round(fraction * last));
  };
  const onKey = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step) {
      e.preventDefault();
      setActive((i) => Math.min(last, Math.max(0, (i === null ? last : i) + step)));
    } else if (e.key === 'Escape') setActive(null);
  };

  return (
    <div className="mt-6">
      <div
        ref={plot}
        role="group"
        tabIndex={0}
        aria-label={`${label}. Use the left and right arrow keys to read values.`}
        className="relative h-[200px] cursor-crosshair touch-pan-y rounded-lg max-sm:h-[160px]"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={() => setActive(null)}
        onFocus={() => setActive((i) => (i === null ? last : i))}
        onBlur={() => setActive(null)}
        onKeyDown={onKey}
      >
        <svg className="block size-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--tab-active)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--tab-active)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke="var(--tab-active)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-px bg-wa-line" />

        {point && (
          <>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-wa-muted/40" style={{ left: `${left}%` }} />
            <div
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-wa-card bg-tab-active"
              style={{ left: `${left}%`, top: `${top}%` }}
            />
            <div
              className={cx(
                'pointer-events-none absolute z-10 min-w-[150px] rounded-xl border border-wa-line bg-wa-inset px-3 py-2.5 shadow-(--wa-shadow)',
                left > 60 ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3',
              )}
              style={{ left: `${left}%`, top: `clamp(0px, calc(${top}% - 8px), calc(100% - 72px))` }}
            >
              <p className="flex justify-between gap-4 font-inter text-[11px] leading-4 text-wa-muted">
                <span>{dateFormat.format(point.time)}</span>
                {showTime && <span>{timeFormat.format(point.time)}</span>}
              </p>
              <p className="mt-1 text-xl font-bold leading-7 text-wa-text"><Money value={point.value} hidden={hidden} /></p>
            </div>
          </>
        )}
      </div>

      <div className="relative mt-2 h-4 font-inter text-[11px] leading-4 text-wa-muted" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick.at} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${tick.at * 100}%` }}>{tick.label}</span>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {point ? `${dateFormat.format(point.time)}: ${hidden ? 'hidden' : formatPrice(point.value)}` : ''}
      </p>
    </div>
  );
}
