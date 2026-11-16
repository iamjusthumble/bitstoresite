import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { LensWindow, rows as shared } from '../components/Lens.jsx';
import { lensCopy } from '../v3/copy.js';

const rows = shared.map((r) => ({ ...r, ...lensCopy[r.module] }));
import { cx } from '../ui.js';
import { useMedia, useProgress } from '../v3/motion.js';
import { Check, Heading, PrimaryButton } from './ui.jsx';

// Which text block is closest to the middle of the screen, rechecked on every scroll frame
function useActiveBlock(count) {
  const refs = useRef([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let dist = Infinity;
      refs.current.slice(0, count).forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [count]);
  return [refs, active];
}

export default function LensV4() {
  const wide = useMedia('(min-width: 1024px)');
  const band = useProgress('enter');
  const [refs, active] = useActiveBlock(rows.length);

  return (
    <section id="lens" className="relative py-10">
      {/* The band opens out to full width as it arrives */}
      <div
        ref={band}
        className="relative overflow-clip bg-v4-bg-2 py-36 text-v4-ink shadow-[inset_0_1px_0_var(--v4-line),inset_0_-1px_0_var(--v4-line)] max-lg:py-28 max-sm:py-20"
        style={{ clipPath: 'inset(0 calc((1 - var(--p, 0)) * 4vw) round calc((1 - var(--p, 0)) * 40px))' }}
      >

        <div className="relative mx-auto max-w-[1200px] px-8 max-lg:px-6 max-sm:px-5">
          <Heading
            center
            parts={['Keep your crypto business', { dim: 'safe and compliant.' }]}
            lead="LENS helps crypto businesses spot suspicious transactions, investigate them, and file the reports regulators require."
          />

          <div className="mt-20 grid grid-cols-[minmax(0,1fr)_600px] gap-16 max-xl:grid-cols-[minmax(0,1fr)_560px] max-xl:gap-10 max-lg:mt-14 max-lg:grid-cols-[minmax(0,1fr)]">
            <div>
              {rows.map((r, i) => (
                <div
                  key={r.module}
                  ref={(el) => { refs.current[i] = el; }}
                  data-i={i}
                  className={cx('flex flex-col justify-center gap-5 transition-opacity duration-500 lg:min-h-[78svh]', wide && active !== i && 'opacity-35', !wide && 'mb-16')}
                >
                  <span className="text-[14px] font-medium text-v4-accent-ink">{r.title}</span>
                  <h3 className="font-v4 text-[38px] font-semibold leading-[1.08] tracking-[-0.035em] max-sm:text-[28px]">{r.heading}</h3>
                  <p className="max-w-[460px] text-[17px] leading-[1.6] text-v4-muted">{r.copy}</p>
                  <ul className="grid gap-3">
                    {r.points.map((p) => (
                      <li key={p} className="flex max-w-[440px] items-start gap-3 text-[15px] leading-6 text-v4-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-v4-accent-ink shadow-[inset_0_0_0_1px_var(--v4-line-2)]"><Check size={11} /></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  {!wide && <div className="mt-4 flex justify-center overflow-hidden"><LensWindow module={r.module} title={r.title}><r.View /></LensWindow></div>}
                  {/* The button follows the last feature directly, so there is no gap above it */}
                  {i === rows.length - 1 && <PrimaryButton href={links.support} className="mt-4 self-start">Talk to our team</PrimaryButton>}
                </div>
              ))}
            </div>

            {wide && (
              <div className="relative">
                <div className="sticky top-[calc(50svh-260px)] h-[520px]">
                  {rows.map((r, i) => (
                    <div
                      key={r.module}
                      className={cx(
                        'absolute inset-0 transition-[opacity,translate,scale,filter] duration-[900ms] ease-v4',
                        active === i ? 'translate-y-0 scale-100 opacity-100' : cx('pointer-events-none opacity-0', i < active ? '-translate-y-6 scale-[0.97]' : 'translate-y-6 scale-[0.97]'),
                      )}
                    >
                      <div className="rounded-[24px] bg-v4-card p-2.5 shadow-[inset_0_0_0_1px_var(--v4-line),var(--v4-shadow)]">
                        <LensWindow module={r.module} title={r.title}><r.View /></LensWindow>
                      </div>
                    </div>
                  ))}
                  {/* Step dots */}
                  <div className="absolute -right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2 max-xl:hidden">
                    {rows.map((r, i) => <span key={r.module} className={cx('w-1.5 rounded-full transition-[height,background-color] duration-500', active === i ? 'h-8 bg-v4-accent' : 'h-1.5 bg-v4-line-2')} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
