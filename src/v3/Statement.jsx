import React from 'react';
import { cx } from '../ui.js';
import { useProgress } from './motion.js';
import { serif } from './ui.jsx';

const WORDS = 'Whether you’re buying your first Bitcoin, accepting crypto payments, or building an app, Mybitstore has the tools you'.split(' ');

// A pinned statement whose words light up one by one as you scroll, over a grid with a growing glow
export default function Statement() {
  const ref = useProgress('pin');
  const n = WORDS.length + 1;
  // Each word brightens over its own slice of the scroll
  const lit = (i) => `clamp(0.14, calc(var(--p, 0) * ${n + 3} - ${i}), 1)`;

  return (
    <section ref={ref} className="relative h-[240svh]" aria-label="Mybitstore has the tools you need">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_50%,#000_20%,transparent_75%)]"
          style={{ backgroundImage: 'linear-gradient(var(--v3-grid) 1px, transparent 1px), linear-gradient(90deg, var(--v3-grid) 1px, transparent 1px)', backgroundSize: '64px 64px', backgroundPosition: 'center' }}
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-[70vmin] rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(closest-side, var(--v3-aurora-1), var(--v3-aurora-2) 55%, transparent)',
            transform: 'translate(-50%, -50%) scale(calc(0.5 + var(--p, 0) * 0.9))',
            opacity: 'calc(0.35 + var(--p, 0) * 0.65)',
          }}
        />
        <p className="relative mx-auto max-w-[1100px] px-8 text-center font-inter-tight text-[64px] font-semibold leading-[1.08] tracking-[-0.035em] text-v3-ink max-lg:text-[48px] max-sm:px-5 max-sm:text-[32px]">
          {WORDS.map((w, i) => (
            <span key={i} className="transition-opacity duration-150" style={{ opacity: lit(i) }}>{w} </span>
          ))}
          <span className={cx(serif, 'text-aurora')} style={{ opacity: lit(WORDS.length) }}>need.</span>
        </p>
      </div>
    </section>
  );
}
