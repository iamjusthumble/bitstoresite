import React, { useId } from 'react';

export default function Sparkline({ points, up, width = 120, height = 40 }) {
  const gradientId = useId();
  if (!points || points.length < 2) return <span className="inline-block rounded-md bg-placeholder" style={{ width, height }} />;

  const min = Math.min(...points);
  const max = Math.max(...points);
  // A floor of 1% of the price keeps near-flat series (stablecoins) from looking volatile
  const floor = (Math.abs(max + min) / 2) * 0.01;
  const range = Math.max(max - min, floor) || 1;
  const offset = (range - (max - min)) / 2;
  const pad = 2;
  const coords = points.map((p, i) => [
    (i / (points.length - 1)) * width,
    pad + (1 - (p - min + offset) / range) * (height - pad * 2),
  ]);
  const line = coords.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
  const area = line + ` L${width} ${height} L0 ${height} Z`;
  const color = up ? 'var(--up)' : 'var(--down)';

  return (
    <svg className="block" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="revealed:animate-[fade_1s_ease-out_1s_backwards]" d={area} fill={`url(#${gradientId})`} />
      <path className="[stroke-dasharray:1] revealed:animate-[draw_1.4s_ease-out_0.35s_backwards]" pathLength="1" d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
