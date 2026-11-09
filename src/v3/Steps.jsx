import React from 'react';
import { links } from '../links.js';
import { useProgress } from './motion.js';
import { Heading, PrimaryButton, Rise, container } from './ui.jsx';
import { steps as STEPS } from './copy.js';

// The line between the steps draws itself as you scroll, and each node lights up as the line reaches it
export default function Steps() {
  const ref = useProgress('enter');
  const reach = (i) => `clamp(0, calc((var(--p, 0) - ${0.15 + i * 0.22}) * 12), 1)`;

  return (
    <section className="relative py-32 max-sm:py-20">
      <div className={container}>
        <Heading eyebrow="Get started" parts={['Get started in', { serif: 'four simple steps.' }]} />
        <div ref={ref} className="relative mt-20 max-lg:mt-14">
          {/* Desktop: a horizontal path through the four nodes */}
          <svg aria-hidden="true" className="absolute left-[28px] top-[27px] h-[2px] w-[calc(75%+18px)] overflow-visible max-lg:hidden" preserveAspectRatio="none" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" stroke="var(--v3-line)" strokeWidth="2" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1="1" x2="100" y2="1" stroke="url(#v3-steps)" strokeWidth="2" pathLength="1" strokeDasharray="1" vectorEffect="non-scaling-stroke" style={{ strokeDashoffset: 'calc(1 - clamp(0, (var(--p, 0) - 0.15) * 1.6, 1))' }} />
            <defs>
              <linearGradient id="v3-steps" x1="0" x2="1"><stop stopColor="#5b8bff" /><stop offset="0.6" stopColor="#9b7bff" /><stop offset="1" stopColor="#47e5bc" /></linearGradient>
            </defs>
          </svg>
          {/* Phones and tablets: the same path, running down */}
          <span aria-hidden="true" className="absolute bottom-8 left-[27px] top-8 w-[2px] overflow-hidden rounded-full bg-v3-line lg:hidden">
            <span className="block h-full origin-top bg-[linear-gradient(180deg,#5b8bff,#9b7bff,#47e5bc)]" style={{ transform: 'scaleY(clamp(0, calc((var(--p, 0) - 0.1) * 1.4), 1))' }} />
          </span>
          <ol className="relative grid grid-cols-4 gap-6 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-8">
            {STEPS.map(([title, copy], i) => (
              <li key={title} className="flex flex-col items-start gap-6 max-lg:flex-row">
                <span className="relative grid size-14 shrink-0 place-items-center rounded-full border border-v3-line bg-v3-bg font-inter-tight text-[17px] font-semibold text-v3-muted">
                  <span className="absolute inset-0 rounded-full bg-brand shadow-[0_0_30px_rgba(47,96,224,0.6)]" style={{ opacity: reach(i), transform: `scale(calc(0.6 + ${reach(i)} * 0.4))` }} />
                  <span className="relative" style={{ color: `color-mix(in srgb, white calc(${reach(i)} * 100%), var(--v3-muted))` }}>{i + 1}</span>
                </span>
                <Rise delay={i * 120} className="glass w-full flex-1 rounded-[24px] p-6 max-lg:p-5">
                  <h3 className="font-inter-tight text-[20px] font-semibold text-v3-ink">{title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-v3-muted">{copy}</p>
                </Rise>
              </li>
            ))}
          </ol>
        </div>
        <Rise className="mt-14 flex">
          <PrimaryButton href={links.signup}>Create your account</PrimaryButton>
        </Rise>
      </div>
    </section>
  );
}
