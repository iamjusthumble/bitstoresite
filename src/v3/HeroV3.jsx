import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { COINS, formatChange, formatPrice, useMarketData } from '../marketData.js';
import phone from '../assets/hero-phone-v2.png';
import phoneLight from '../assets/hero-phone-v2-light.png';
import lines from '../assets/hero-lines-v2.png';
import qrIcon from '../assets/qrcode-icon.svg';
import qrIconLight from '../assets/qrcode-icon-light.svg';
import { QrCard } from '../components/Hero.jsx';
import ThemedImg from '../components/ThemedImg.jsx';
import { cx } from '../ui.js';
import { heroDelay } from './intro.js';
import { usePointerParallax, useProgress } from './motion.js';
import { GhostButton, PrimaryButton, Words, display } from './ui.jsx';

const coinBy = Object.fromEntries(COINS.map((c) => [c.id, c]));

// A live price in a frosted chip, floating at its own depth
function PriceChip({ id, className, depth, delay }) {
  const { coins } = useMarketData();
  const c = coins[id];
  const meta = coinBy[id];
  const up = c ? c.change >= 0 : true;
  return (
    <div
      className={cx('absolute', className)}
      style={{ transform: `translate3d(calc(var(--px, 0) * ${depth * 18}px), calc(var(--py, 0) * ${depth * 14}px + var(--p, 0) * ${depth * -90}px), 0)` }}
    >
      <div className="animate-[v3-float_7s_ease-in-out_infinite]" style={{ animationDelay: `${delay}ms` }}>
        <div
          className="glass-strong flex items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-4"
          style={{ animation: `v3-word 1.1s var(--ease-soft) ${heroDelay + 700 + delay / 6}ms backwards` }}
        >
          <img src={meta.icon} alt="" width="34" height="34" className="size-[34px]" />
          <div className="min-w-[96px]">
            <p className="text-[12px] font-medium leading-4 text-v3-muted">{meta.symbol}/USD</p>
            <p className="font-inter-tight text-[16px] font-semibold leading-5 text-v3-ink tabular-nums">{c ? formatPrice(c.price) : '—'}</p>
          </div>
          {c && (
            <span className={cx('rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums', up ? 'bg-up/15 text-up' : 'bg-down/15 text-down')}>{formatChange(c.change)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Coins riding a slow ring around the phone; each counter-rotates to stay upright
function Orbit() {
  const ids = ['bitcoin', 'ethereum', 'tether', 'usd-coin', 'tron', 'litecoin'];
  return (
    <div aria-hidden="true" className="absolute left-1/2 top-1/2 aspect-square w-[min(620px,100%)] -translate-x-1/2 -translate-y-1/2 max-lg:w-[min(620px,100vw)] max-sm:w-[400px]">
      <div className="absolute inset-0 rounded-full border border-dashed border-v3-line" />
      <div className="absolute inset-[70px] rounded-full border border-v3-line opacity-60" />
      <div className="absolute inset-0 animate-[v3-orbit_60s_linear_infinite]">
        {ids.map((id, i) => {
          const a = (i / ids.length) * Math.PI * 2;
          return (
            <span key={id} className="absolute size-11 max-sm:size-8" style={{ left: `calc(50% + ${Math.cos(a) * 50}% - 22px)`, top: `calc(50% + ${Math.sin(a) * 50}% - 22px)` }}>
              <span className="glass grid size-full animate-[v3-counter_60s_linear_infinite] place-items-center rounded-full">
                <img src={coinBy[id].icon} alt="" className="size-6 max-sm:size-4" />
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function DownloadQr() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const key = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', off);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', off);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <GhostButton aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <ThemedImg dark={qrIcon} light={qrIconLight} width="20" height="20" />
        Download App
      </GhostButton>
      <div
        role="dialog"
        aria-label="Download the Mybitstore app"
        className={cx(
          'glass-strong absolute bottom-[calc(100%+12px)] left-0 z-10 flex w-[188px] flex-col items-center gap-3 rounded-[24px] p-5 transition-[opacity,translate,scale] duration-300 ease-(--ease-soft)',
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-2 scale-95 opacity-0',
        )}
      >
        <QrCard />
        <p className="text-center text-[13px] leading-5 text-v3-soft">Scan to download</p>
      </div>
    </div>
  );
}

export default function HeroV3() {
  const ref = useProgress('pin');
  const pointer = usePointerParallax();

  return (
    <section ref={ref} id="hero" className="relative h-[135svh]" aria-labelledby="v3-hero-title">
      <div ref={pointer} className="sticky top-0 h-svh min-h-[680px] overflow-hidden p-0">
        {/* The stage: insets into a rounded card and steps back as the page scrolls on */}
        <div
          className="absolute inset-0 overflow-hidden bg-[radial-gradient(120%_80%_at_70%_0%,#14204a_0%,#070c1e_45%,var(--v3-bg)_100%)] light:bg-[radial-gradient(120%_80%_at_70%_0%,#dfe7ff_0%,#eef2fd_45%,var(--v3-bg)_100%)]"
          style={{
            clipPath: 'inset(calc(var(--p, 0) * 2.4vw) calc(var(--p, 0) * 2.4vw) calc(var(--p, 0) * 2.4vw) calc(var(--p, 0) * 2.4vw) round calc(var(--p, 0) * 48px))',
            transform: 'scale(calc(1 - var(--p, 0) * 0.04))',
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-[10%] top-[-20%] h-[70vh] w-[60vw] animate-[v3-aurora_18s_ease-in-out_infinite_alternate] rounded-full blur-[90px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-1), transparent)' }} />
            <div className="absolute right-[-10%] top-[10%] h-[70vh] w-[50vw] animate-[v3-aurora_22s_ease-in-out_infinite_alternate-reverse] rounded-full blur-[100px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-2), transparent)' }} />
            <div className="absolute bottom-[-25%] left-[30%] h-[60vh] w-[50vw] animate-[v3-aurora_26s_ease-in-out_infinite_alternate] rounded-full blur-[100px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-3), transparent)' }} />
            <img
              src={lines}
              alt=""
              className="absolute bottom-[-10%] left-1/2 w-[max(120%,1500px)] max-w-none opacity-50 mix-blend-screen light:opacity-25 light:mix-blend-multiply light:invert"
              style={{ transform: 'translate3d(-50%, calc(var(--p, 0) * 120px + var(--py, 0) * -10px), 0) scale(calc(1 + var(--p, 0) * 0.15))' }}
            />
            {/* Fine grid, faded towards the edges */}
            <div
              className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_80%)]"
              style={{ backgroundImage: 'linear-gradient(var(--v3-grid) 1px, transparent 1px), linear-gradient(90deg, var(--v3-grid) 1px, transparent 1px)', backgroundSize: '72px 72px', backgroundPosition: 'center top' }}
            />
          </div>

          <div className="relative mx-auto flex h-full max-w-[1280px] items-center gap-10 px-8 pt-20 lg:gap-16 xl:gap-24 max-lg:flex-col max-lg:justify-center max-lg:gap-6 max-lg:px-6 max-sm:px-5 max-sm:pt-24">
            <div
              className="relative z-2 flex max-w-[600px] shrink-0 flex-col gap-7 lg:w-[46%] xl:w-[600px]"
              style={{ opacity: 'calc(1 - var(--p, 0) * 1.6)', transform: 'translate3d(0, calc(var(--p, 0) * -70px), 0)' }}
            >
              <Words
                as="h1"
                parts={['The easy, secure way to', { serif: 'use' }, 'crypto.']}
                delay={heroDelay + 80}
                step={70}
                className={cx(display, 'text-[76px] leading-[0.98] max-xl:text-[64px] max-sm:text-[44px] max-sm:leading-[1.02]')}
              />
              <p className="max-w-[540px] text-[19px] leading-[1.6] text-v3-muted max-sm:text-base" style={{ animation: `v3-word 1.1s var(--ease-soft) ${heroDelay + 500}ms backwards` }}>
                Buy, sell, and send Bitcoin and other digital currencies in one trusted app, built for individuals, businesses, and governments.
              </p>
              <div className="flex flex-wrap items-center gap-3" style={{ animation: `v3-word 1.1s var(--ease-soft) ${heroDelay + 650}ms backwards` }}>
                <PrimaryButton href={links.signup}>Sign Up</PrimaryButton>
                <DownloadQr />
              </div>
            </div>

            {/* The app, with live prices floating around it */}
            <div
              className="relative h-[620px] min-w-0 flex-1 max-lg:h-[440px] max-lg:w-full max-sm:h-[360px]"
              style={{ transform: 'translate3d(0, calc(var(--p, 0) * -40px), 0) scale(calc(1 + var(--p, 0) * 0.08))' }}
            >
              <div className="absolute inset-0" style={{ animation: `v3-word 1.4s var(--ease-soft) ${heroDelay + 300}ms backwards` }}>
                <div className="absolute left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(91,139,255,0.45),transparent)] blur-2xl light:bg-[radial-gradient(closest-side,rgba(91,139,255,0.3),transparent)]" />
                <Orbit />
                <div className="absolute left-1/2 top-1/2 h-[640px] w-[427px] max-lg:h-[480px] max-lg:w-[320px] max-sm:h-[400px] max-sm:w-[267px]" style={{ transform: 'translate3d(calc(-50% + var(--px, 0) * -8px), calc(-50% + var(--py, 0) * -6px), 0)' }}>
                  <ThemedImg dark={phone} light={phoneLight} className="size-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)] light:drop-shadow-[0_40px_60px_rgba(30,50,120,0.25)]" />
                </div>
              </div>
              <PriceChip id="bitcoin" depth={1.4} delay={0} className="left-[2%] top-[22%] max-sm:left-0 max-sm:top-[6%] max-sm:scale-[0.82]" />
              <PriceChip id="ethereum" depth={2} delay={1800} className="right-[0%] top-[44%] max-sm:right-0 max-sm:top-[46%] max-sm:scale-[0.82]" />
              <PriceChip id="tether" depth={1} delay={3400} className="bottom-[10%] left-[8%] max-sm:hidden" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
