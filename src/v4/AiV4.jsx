import React, { useState } from 'react';
import bot from '../assets/ai-bot.png';
import { AnalysisVisual, features as shared } from '../components/AiFeatures.jsx';
import { aiAlert, aiCopy } from './copy.js';
import ThinkingOrb from '../components/ThinkingOrb.jsx';
import { cx } from '../ui.js';
import { useMedia, useProgress } from '../v3/motion.js';
import { Rise, Words, display } from './ui.jsx';

// The analysis preview uses V4's alert wording (no P2P)
const features = shared.map((f, i) => ({ ...f, ...aiCopy[i], ...(f.Visual === AnalysisVisual && { Visual: () => <AnalysisVisual alert={aiAlert} /> }) }));
const TITLE = ['An AI assistant that', { dim: 'helps you trade.' }];
const LEAD = 'Ask questions, find trading ideas, and understand your results, all inside the Mybitstore app.';
// The first 30% of the scroll zooms the device in; the rest is split between the three features
const ZOOM = 0.3;
const span = (1 - ZOOM) / features.length;

function DeviceBar() {
  return (
    <div className="flex items-center gap-3 border-b border-v4-line px-6 py-4">
      <span className="flex gap-1.5">
        <i className="size-2.5 rounded-full bg-v4-line-2" />
        <i className="size-2.5 rounded-full bg-v4-line-2" />
        <i className="size-2.5 rounded-full bg-v4-line-2" />
      </span>
      <span className="ml-2 flex items-center gap-2 text-[13px] font-medium text-v4-soft">
        <span className="relative size-6 overflow-hidden rounded-full bg-v4-accent"><img src={bot} alt="" className="size-full object-cover" /></span>
        Mybitstore AI
      </span>
      <span className="ml-auto"><ThinkingOrb state="listening" size={20} tint="#2f60e0" /></span>
    </div>
  );
}

function Visual({ index }) {
  const { Visual: V } = features[index];
  return (
    // `is-visible` lets the shared visuals play their entrance each time a feature comes up
    <div key={index} className="is-visible grid animate-[v4-fade-up_0.9s_var(--ease-v4)] place-items-center">
      <div className="scale-[1.18] max-sm:scale-[0.82] max-[380px]:scale-[0.7]"><V /></div>
    </div>
  );
}

export default function AiV4() {
  const wide = useMedia('(min-width: 1024px)');
  const [active, setActive] = useState(0);
  const ref = useProgress(wide ? 'pin' : 'through', (p) => {
    const i = Math.min(features.length - 1, Math.max(0, Math.floor((p - ZOOM) / span)));
    setActive((cur) => (cur === i ? cur : i));
  });

  if (!wide) {
    return (
      <section id="ai" className="relative py-14 max-sm:py-10">
        <div className="flex flex-col items-center gap-6 px-6 text-center max-sm:px-5">
          <Words parts={TITLE} className={cx(display, 'text-[48px] leading-[1.04] max-sm:text-[36px] max-sm:leading-[1.06]')} />
          <p className="max-w-[520px] text-base leading-[1.6] text-v4-muted">{LEAD}</p>
        </div>
        <div className="mt-10 flex flex-col gap-6 px-5">
          {features.map((f, i) => (
            <Rise key={f.tab} className="v4-card overflow-hidden rounded-[24px]">
              <div className="p-6">
                <h3 className="font-v4 text-2xl font-semibold text-v4-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-v4-muted">{f.copy}</p>
              </div>
              <div className="flex justify-center overflow-hidden pb-6"><Visual index={i} /></div>
            </Rise>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="ai" ref={ref} className="relative h-[240svh]" style={{ '--z': `clamp(0, calc(var(--p, 0) / ${ZOOM}), 1)` }}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden">
        <div aria-hidden="true" className="absolute left-1/2 top-[58%] h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, var(--v4-glow), transparent)', opacity: 'calc(0.2 + var(--z) * 0.8)' }} />

        {/* Title: steps back and fades as the device comes forward */}
        <div
          className="absolute inset-x-0 top-[14svh] z-1 mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-8 text-center"
          style={{ opacity: 'calc(1 - var(--z) * 1.4)', transform: 'translate3d(0, calc(var(--z) * -60px), 0) scale(calc(1 - var(--z) * 0.08))' }}
        >
          <Words parts={TITLE} className={cx(display, 'text-[60px] leading-[1.02]')} />
          <p className="max-w-[560px] text-[18px] leading-[1.6] text-v4-muted">{LEAD}</p>
        </div>

        {/* The device zooms from small and low to full size */}
        <div
          className="v4-card relative z-2 flex h-[min(640px,78svh)] w-[min(1136px,calc(100vw-64px))] flex-col overflow-hidden"
          style={{
            borderRadius: 'calc(40px - var(--z) * 16px)',
            transform: 'translate3d(0, calc((1 - var(--z)) * 36svh), 0) scale(calc(0.5 + var(--z) * 0.5))',
          }}
        >
          <DeviceBar />
          <div className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)]">
            <ol className="flex flex-col justify-center gap-2 border-r border-v4-line p-6">
              {features.map((f, i) => (
                <li key={f.tab} className={cx('rounded-2xl p-5 transition-[background-color,opacity] duration-500', active === i ? 'bg-v4-raise opacity-100' : 'opacity-50')}>
                  <p className="flex items-center gap-3 font-v4 text-[20px] font-semibold text-v4-ink">
                    {f.title}
                  </p>
                  <div className={cx('grid transition-[grid-template-rows] duration-500 ease-v4', active === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <p className="overflow-hidden pt-2 text-[14px] leading-[1.6] text-v4-muted">{f.copy}</p>
                  </div>
                  {/* Fills as you scroll through this feature */}
                  <span className="mt-4 block h-[2px] overflow-hidden rounded-full bg-v4-line">
                    <span className="block h-full origin-left bg-v4-accent" style={{ transform: `scaleX(clamp(0, calc((var(--p, 0) - ${ZOOM + i * span}) / ${span}), 1))` }} />
                  </span>
                </li>
              ))}
            </ol>
            <div className="relative grid place-items-center overflow-hidden">
                            <Visual index={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
