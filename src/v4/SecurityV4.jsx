import React from 'react';
import { links } from '../links.js';
import { items as shared } from '../components/Security.jsx';
import { securityCopy } from '../v3/copy.js';

const items = shared.map((it, i) => ({ ...it, ...securityCopy[i] }));
import ThemedImg from '../components/ThemedImg.jsx';
import { cx } from '../ui.js';
import { useProgress, useSpotlight } from '../v3/motion.js';
import photo from '../assets/people/secure.jpg';
import { ArrowRight, Heading, Rise, Card, container, section } from './ui.jsx';

// A person checking a trade on their phone
function ShieldVisual() {
  const ref = useProgress('through');
  return (
    <div ref={ref} aria-hidden="true" className="relative h-[340px] overflow-hidden rounded-[18px] max-sm:h-[280px]">
      {/* The photo drifts slowly against the scroll */}
      <img src={photo} alt="" loading="lazy" className="absolute inset-x-0 top-[-12%] h-[124%] w-full object-cover object-[50%_40%]" style={{ transform: 'translate3d(0, calc((var(--p, 0) - 0.5) * -40px), 0)' }} />
      <span className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-v4-card text-v4-accent-ink shadow-[var(--v4-shadow)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m8.8 12.2 2.3 2.3 4.4-4.6" />
        </svg>
      </span>
    </div>
  );
}

export default function SecurityV4() {
  const spot = useSpotlight();
  return (
    <section id="security" className={section}>
      <div className={container} ref={spot}>
        <Heading center parts={['Your money and data,', { dim: 'kept safe.' }]} lead="Here’s how we protect your account and every trade you make." />
        <div className="mt-16 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <Rise className="col-span-2 row-span-2 max-sm:col-span-1">
            <Card className="flex h-full flex-col justify-between gap-6 p-8 max-sm:p-6">
              <ShieldVisual />
              <div>
                <h3 className="font-v4 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-v4-ink">{items[1].title}</h3>
                <p className="mt-2 max-w-[440px] text-[15px] leading-6 text-v4-muted">{items[1].copy}</p>
              </div>
            </Card>
          </Rise>
          {items.filter((_, i) => i !== 1).map((it, i) => (
            <Rise key={it.title} delay={100 + i * 90} className={cx(i === 2 && 'col-span-2 max-sm:col-span-1')}>
              <Card as={it.href ? 'a' : 'div'} href={it.href} className="flex h-full min-h-[250px] flex-col gap-6 p-7">
                <span className="grid size-12 place-items-center rounded-[14px] shadow-[inset_0_0_0_1px_var(--v4-line-2)] transition-transform duration-700 ease-v4 group-hover/card:-translate-y-1">
                  <ThemedImg dark={it.icon} light={it.iconLight} width="24" height="24" />
                </span>
                <div>
                  <h3 className="font-v4 text-[21px] font-semibold leading-tight tracking-[-0.02em] text-v4-ink">{it.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-v4-muted">{it.copy}</p>
                  {it.href && <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-v4-accent-ink">Read our policy<ArrowRight size={15} className="transition-transform duration-300 group-hover/card:translate-x-1" /></span>}
                </div>
              </Card>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
