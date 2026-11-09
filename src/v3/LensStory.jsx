import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { LensWindow, rows as shared } from '../components/Lens.jsx';
import { lensCopy } from './copy.js';

const rows = shared.map((r) => ({ ...r, ...lensCopy[r.module] }));
import { cx } from '../ui.js';
import { useMedia, useProgress } from './motion.js';
import { Check, Heading, PrimaryButton } from './ui.jsx';

// Which text block is crossing the middle of the screen
function useActiveBlock(count) {
  const refs = useRef([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-48% 0px -48% 0px' },
    );
    refs.current.slice(0, count).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [count]);
  return [refs, active];
}

export default function LensStory() {
  const wide = useMedia('(min-width: 1024px)');
  const band = useProgress('enter');
  const [refs, active] = useActiveBlock(rows.length);

  return (
    <section id="lens" className="relative py-10">
      {/* The band opens out to full width as it arrives */}
      <div
        ref={band}
        className="relative overflow-clip bg-[linear-gradient(180deg,#060b1d,#0a1330_50%,#060b1d)] py-32 text-white light:bg-[linear-gradient(180deg,#e9eefc,#dfe6fb_50%,#e9eefc)] light:text-v3-ink max-sm:py-20"
        style={{ clipPath: 'inset(0 calc((1 - var(--p, 0)) * 5vw) round calc((1 - var(--p, 0)) * 56px))' }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_500px_at_15%_0%,rgba(47,96,224,0.35),transparent_70%),radial-gradient(600px_600px_at_90%_85%,rgba(40,210,190,0.14),transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(180deg,transparent,#000_20%,#000_80%,transparent)]" style={{ backgroundImage: 'linear-gradient(var(--v3-grid) 1px, transparent 1px), linear-gradient(90deg, var(--v3-grid) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative mx-auto max-w-[1280px] px-8 max-lg:px-6 max-sm:px-5">
          <Heading
            eyebrow="LENS by Mybitstore"
            parts={['Keep your crypto business', { serif: 'safe and compliant.' }]}
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
                  <span className="font-serif text-[20px] italic text-v3-accent">{r.title}</span>
                  <h3 className="font-inter-tight text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] max-sm:text-[30px]">{r.heading}</h3>
                  <p className="max-w-[460px] text-[17px] leading-[1.6] text-v3-muted">{r.copy}</p>
                  <ul className="grid gap-3">
                    {r.points.map((p) => (
                      <li key={p} className="flex max-w-[440px] items-start gap-3 text-[15px] leading-6 text-v3-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-v3-mint/15 text-v3-mint"><Check size={12} /></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  {!wide && <div className="mt-4 flex justify-center overflow-hidden"><LensWindow module={r.module} title={r.title}><r.View /></LensWindow></div>}
                </div>
              ))}
              <PrimaryButton href={links.support} className="mt-4">Talk to our team</PrimaryButton>
            </div>

            {wide && (
              <div className="relative">
                <div className="sticky top-[calc(50svh-260px)] h-[520px]">
                  <div aria-hidden="true" className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(91,139,255,0.35),transparent)] blur-2xl" />
                  {rows.map((r, i) => (
                    <div
                      key={r.module}
                      className={cx(
                        'absolute inset-0 transition-[opacity,translate,scale,filter] duration-700 ease-(--ease-soft)',
                        active === i ? 'translate-y-0 scale-100 opacity-100' : cx('pointer-events-none opacity-0 blur-[6px]', i < active ? '-translate-y-10 scale-95' : 'translate-y-10 scale-95'),
                      )}
                    >
                      <div className="rounded-[28px] glass p-3">
                        <LensWindow module={r.module} title={r.title}><r.View /></LensWindow>
                      </div>
                    </div>
                  ))}
                  {/* Step dots */}
                  <div className="absolute -right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2 max-xl:hidden">
                    {rows.map((r, i) => <span key={r.module} className={cx('w-1.5 rounded-full transition-[height,background-color] duration-500', active === i ? 'h-8 bg-v3-accent' : 'h-1.5 bg-v3-line')} />)}
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
