import React from 'react';
import { links } from '../links.js';
import { items as shared } from '../components/Security.jsx';
import { securityCopy } from './copy.js';

const items = shared.map((it, i) => ({ ...it, ...securityCopy[i] }));
import ThemedImg from '../components/ThemedImg.jsx';
import { cx } from '../ui.js';
import { useSpotlight } from './motion.js';
import { ArrowRight, Heading, Rise, SpotCard, container } from './ui.jsx';

// Concentric rings pulsing out from a shield, with the escrow check the app shows on big P2P trades
function ShieldVisual() {
  return (
    <div aria-hidden="true" className="relative grid h-[340px] place-items-center max-sm:h-[260px]">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="absolute size-[150px] animate-[v3-pulse_4.8s_ease-out_infinite] rounded-full border border-v3-accent/40" style={{ animationDelay: `${i * 1.2}s` }} />
      ))}
      <span className="absolute size-[260px] rounded-full border border-dashed border-v3-line animate-[v3-orbit_40s_linear_infinite]">
        <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-v3-mint shadow-[0_0_16px_var(--v3-mint)]" />
      </span>
      <span className="glass-strong relative grid size-[120px] place-items-center rounded-[34px]">
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="url(#v3-shield)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="v3-shield" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5b8bff" /><stop offset="1" stopColor="#47e5bc" /></linearGradient>
          </defs>
          <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m8.8 12.2 2.3 2.3 4.4-4.6" />
        </svg>
      </span>
      <div className="glass-strong absolute bottom-2 left-1/2 w-[300px] -translate-x-1/2 rounded-2xl p-4 animate-[v3-float_6s_ease-in-out_infinite] max-sm:w-[260px]">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-v3-ink">
          <span className="size-2 rounded-full bg-v3-mint shadow-[0_0_10px_var(--v3-mint)]" />
          Extra checks turned on
        </p>
        <p className="mt-1.5 text-[12px] leading-[1.5] text-v3-muted">This trade needs one more check because it’s a large amount with a new trading partner.</p>
      </div>
    </div>
  );
}

export default function TrustBento() {
  const spot = useSpotlight();
  return (
    <section id="security" className="relative py-32 max-sm:py-20">
      <div className={container} ref={spot}>
        <Heading eyebrow="Security" parts={['Your money and data,', { serif: 'kept safe.' }]} lead="Here’s how we protect your account and every trade you make." />
        <div className="mt-16 grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <Rise zoom className="col-span-2 row-span-2 max-sm:col-span-1">
            <SpotCard className="flex h-full flex-col justify-between gap-6 p-8 max-sm:p-6">
              <ShieldVisual />
              <div>
                <h3 className="font-inter-tight text-[30px] font-semibold leading-tight tracking-[-0.02em] text-v3-ink">{items[1].title}</h3>
                <p className="mt-2 max-w-[440px] text-[15px] leading-6 text-v3-muted">{items[1].copy}</p>
              </div>
            </SpotCard>
          </Rise>
          {items.filter((_, i) => i !== 1).map((it, i) => (
            <Rise key={it.title} zoom delay={100 + i * 90} className={cx(i === 2 && 'col-span-2 max-sm:col-span-1')}>
              <SpotCard as={it.href ? 'a' : 'div'} href={it.href} className="flex h-full min-h-[250px] flex-col gap-6 p-7">
                <span className="glass grid size-14 place-items-center rounded-2xl transition-transform duration-500 ease-(--ease-soft) group-hover/spot:-translate-y-1 group-hover/spot:rotate-[-6deg]">
                  <ThemedImg dark={it.icon} light={it.iconLight} width="28" height="28" />
                </span>
                <div>
                  <h3 className="font-inter-tight text-[22px] font-semibold leading-tight text-v3-ink">{it.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-v3-muted">{it.copy}</p>
                  {it.href && <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-v3-accent">Read our policy<ArrowRight size={15} className="transition-transform duration-300 group-hover/spot:translate-x-1" /></span>}
                </div>
              </SpotCard>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
