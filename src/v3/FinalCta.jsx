import React from 'react';
import { links } from '../links.js';
import { cx } from '../ui.js';
import { useProgress } from './motion.js';
import { GhostButton, PrimaryButton, Words, display } from './ui.jsx';

// The closing panel has no edges: it fades in from the page and settles into the footer's colour,
// so the two read as one surface. The glow swells as the section arrives.
export default function FinalCta() {
  const ref = useProgress('enter');
  return (
    <section className="relative pt-8">
      <div
        ref={ref}
        className="relative isolate overflow-hidden bg-[linear-gradient(180deg,transparent_0%,var(--v3-bg-2)_55%)] px-8 pb-40 pt-36 text-center max-sm:px-5 max-sm:pb-28 max-sm:pt-24"
      >
        {/* The glow sits high and fades out well before the footer */}
        <div aria-hidden="true" className="absolute inset-0 -z-1 [mask-image:linear-gradient(180deg,transparent,#000_25%,#000_50%,transparent_92%)]" style={{ opacity: 'calc(0.35 + var(--p, 0) * 0.65)', scale: 'calc(0.9 + var(--p, 0) * 0.1)' }}>
          <div className="absolute left-1/2 top-[42%] h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 animate-[v3-aurora_16s_ease-in-out_infinite_alternate] rounded-full opacity-80 blur-[100px] light:opacity-60" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-1), var(--v3-aurora-2) 55%, transparent)' }} />
          <div className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_50%_40%,#000,transparent_65%)]" style={{ backgroundImage: 'linear-gradient(var(--v3-grid) 1px, transparent 1px), linear-gradient(90deg, var(--v3-grid) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        </div>
        <Words parts={['Ready to', { serif: 'get started?' }]} className={cx(display, 'mx-auto text-[96px] leading-[0.98] max-lg:text-[72px] max-sm:text-[46px]')} />
        <p className="mx-auto mt-6 max-w-[560px] text-lg leading-[1.6] text-v3-muted max-sm:text-base">Trade, pay, and manage your crypto in one place. Signing up takes just a few minutes.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton href={links.signup}>Sign Up</PrimaryButton>
          <GhostButton href={links.login}>Log in</GhostButton>
        </div>
      </div>
    </section>
  );
}
