import React, { useState } from 'react';
import bot from '../assets/ai-bot.png';
import { features as shared } from '../components/AiFeatures.jsx';
import { aiCopy } from './copy.js';
import ThinkingOrb from '../components/ThinkingOrb.jsx';
import { cx } from '../ui.js';
import { useMedia, useProgress } from './motion.js';
import { Eyebrow, Rise, Words, display } from './ui.jsx';

const features = shared.map((f, i) => ({ ...f, ...aiCopy[i] }));
const TITLE = ['An AI assistant that', { serif: 'helps you trade.' }];
const LEAD = 'Ask questions, find trading ideas, and understand your results, all inside the Mybitstore app.';
// The first 30% of the scroll zooms the device in; the rest is split between the three features
const ZOOM = 0.3;
const span = (1 - ZOOM) / features.length;

function DeviceBar() {
  return (
    <div className="flex items-center gap-3 border-b border-v3-line px-6 py-4">
      <span className="flex gap-1.5">
        <i className="size-2.5 rounded-full bg-[#ff5f57]" />
        <i className="size-2.5 rounded-full bg-[#febc2e]" />
        <i className="size-2.5 rounded-full bg-[#28c840]" />
      </span>
      <span className="ml-2 flex items-center gap-2 text-[13px] font-medium text-v3-soft">
        <span className="relative size-6 overflow-hidden rounded-full bg-[linear-gradient(137deg,#2f60e0_9%,#401282_49%,#030e53_85%)]"><img src={bot} alt="" className="size-full object-cover" /></span>
        Mybitstore AI
      </span>
      <span className="ml-auto"><ThinkingOrb state="listening" size={20} tint="#5b8bff" /></span>
    </div>
  );
}

function Visual({ index }) {
  const { Visual: V } = features[index];
  return (
    // `is-visible` lets the shared visuals play their entrance each time a feature comes up
    <div key={index} className="is-visible grid animate-[v3-word_0.8s_var(--ease-soft)] place-items-center">
      <div className="scale-[1.18] max-sm:scale-[0.82]"><V /></div>
    </div>
  );
}

export default function AiZoom() {
  const wide = useMedia('(min-width: 1024px)');
  const [active, setActive] = useState(0);
  const ref = useProgress(wide ? 'pin' : 'through', (p) => {
    const i = Math.min(features.length - 1, Math.max(0, Math.floor((p - ZOOM) / span)));
    setActive((cur) => (cur === i ? cur : i));
  });

  if (!wide) {
    return (
      <section id="ai" className="relative py-24 max-sm:py-20">
        <div className="flex flex-col items-start gap-5 px-6 max-sm:px-5">
          <Eyebrow>Mybitstore AI</Eyebrow>
          <Words parts={TITLE} className={cx(display, 'text-[48px] leading-[1.04] max-sm:text-[36px]')} />
          <p className="max-w-[520px] text-base leading-[1.6] text-v3-muted">{LEAD}</p>
        </div>
        <div className="mt-12 flex flex-col gap-6 px-5">
          {features.map((f, i) => (
            <Rise key={f.tab} zoom className="glass-strong overflow-hidden rounded-[28px]">
              <div className="p-6">
                <h3 className="font-inter-tight text-2xl font-semibold text-v3-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-v3-muted">{f.copy}</p>
              </div>
              <div className="flex justify-center overflow-hidden pb-6"><Visual index={i} /></div>
            </Rise>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="ai" ref={ref} className="relative h-[340svh]" style={{ '--z': `clamp(0, calc(var(--p, 0) / ${ZOOM}), 1)` }}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden">
        <div aria-hidden="true" className="absolute left-1/2 top-[55%] h-[70vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-1), var(--v3-aurora-2) 60%, transparent)', opacity: 'calc(0.35 + var(--z) * 0.5)' }} />

        {/* Title: steps back and fades as the device comes forward */}
        <div
          className="absolute inset-x-0 top-[12svh] z-1 mx-auto flex w-full max-w-[1280px] flex-col items-start gap-5 px-8"
          style={{ opacity: 'calc(1 - var(--z) * 1.4)', transform: 'translate3d(0, calc(var(--z) * -60px), 0) scale(calc(1 - var(--z) * 0.08))' }}
        >
          <Eyebrow>Mybitstore AI</Eyebrow>
          <Words parts={TITLE} className={cx(display, 'text-[64px] leading-[1.02]')} />
          <p className="max-w-[560px] text-lg leading-[1.6] text-v3-muted">{LEAD}</p>
        </div>

        {/* The device zooms from small and low to full size */}
        <div
          className="glass-strong relative z-2 flex h-[min(640px,78svh)] w-[min(1216px,calc(100vw-64px))] flex-col overflow-hidden"
          style={{
            borderRadius: 'calc(48px - var(--z) * 16px)',
            transform: 'translate3d(0, calc((1 - var(--z)) * 36svh), 0) scale(calc(0.5 + var(--z) * 0.5))',
          }}
        >
          <DeviceBar />
          <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)]">
            <ol className="flex flex-col justify-center gap-2 border-r border-v3-line p-6">
              {features.map((f, i) => (
                <li key={f.tab} className={cx('rounded-2xl p-5 transition-[background-color,opacity] duration-500', active === i ? 'bg-v3-glass-2 opacity-100' : 'opacity-50')}>
                  <p className="flex items-center gap-3 font-inter-tight text-[20px] font-semibold text-v3-ink">
                    {f.title}
                  </p>
                  <div className={cx('grid transition-[grid-template-rows] duration-500 ease-(--ease-soft)', active === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <p className="overflow-hidden pt-2 text-[14px] leading-[1.6] text-v3-muted">{f.copy}</p>
                  </div>
                  {/* Fills as you scroll through this feature */}
                  <span className="mt-4 block h-[2px] overflow-hidden rounded-full bg-v3-line">
                    <span className="block h-full origin-left bg-[linear-gradient(90deg,var(--v3-accent),var(--v3-mint))]" style={{ transform: `scaleX(clamp(0, calc((var(--p, 0) - ${ZOOM + i * span}) / ${span}), 1))` }} />
                  </span>
                </li>
              ))}
            </ol>
            <div className="relative grid place-items-center overflow-hidden">
              <div aria-hidden="true" className="absolute inset-0 [mask-image:radial-gradient(closest-side,#000,transparent)]" style={{ backgroundImage: 'radial-gradient(var(--v3-line) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
              <Visual index={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
