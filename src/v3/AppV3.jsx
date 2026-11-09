import React from 'react';
import { formatChange, formatPrice, useMarketData } from '../marketData.js';
import hand from '../assets/app-hand.png';
import screen from '../assets/app-screen.png';
import screenLight from '../assets/app-screen-light.png';
import btc from '../assets/coin-btc.svg';
import { QrCard } from '../components/Hero.jsx';
import { StoreBadges } from '../components/Footer.jsx';
import ThemedImg from '../components/ThemedImg.jsx';
import { cx } from '../ui.js';
import { usePointerParallax, useProgress } from './motion.js';
import { Heading, Rise, container } from './ui.jsx';

function BtcChip() {
  const { coins } = useMarketData();
  const c = coins.bitcoin;
  const up = c ? c.change >= 0 : true;
  return (
    <div className="glass-strong flex items-center gap-3 rounded-2xl py-2.5 pl-2.5 pr-4">
      <img src={btc} alt="" width="32" height="32" />
      <div>
        <p className="text-[12px] text-v3-muted">Bitcoin</p>
        <p className="font-inter-tight text-[15px] font-semibold text-v3-ink tabular-nums">{c ? formatPrice(c.price) : '—'}</p>
      </div>
      {c && <span className={cx('text-[12px] font-semibold tabular-nums', up ? 'text-up' : 'text-down')}>{formatChange(c.change)}</span>}
    </div>
  );
}

// The hand holding the phone from V2: the screen export is rectangular, so a rotated rounded box clips it
// to the phone's display. It rises gently as the section passes and leans a little toward the pointer.
function HandPhone() {
  return (
    <div className="relative h-[717px] w-[638px] [mask-image:linear-gradient(180deg,#000_78%,transparent)]">
      <div className="absolute left-[31px] top-[74px] flex h-[769.6px] w-[607px] items-center justify-center">
        <img src={hand} alt="" loading="lazy" className="h-[690px] w-[484.5px] max-w-none [transform:rotate(10.97deg)]" />
      </div>
      <div className="absolute left-[122.3px] top-[90.25px] flex h-[477.8px] w-[289.5px] items-center justify-center">
        <div className="flex h-[446.31px] w-[208.36px] shrink-0 items-center justify-center overflow-hidden rounded-[25.06px] [transform:rotate(10.97deg)]">
          <ThemedImg dark={screen} light={screenLight} loading="lazy" className="h-[478px] w-[289.5px] max-w-none shrink-0 [transform:rotate(-10.97deg)]" />
        </div>
      </div>
    </div>
  );
}

export default function AppV3() {
  const ref = useProgress('through');
  const pointer = usePointerParallax();
  return (
    <section id="download" ref={ref} className="relative overflow-hidden pt-32 max-lg:pt-24 max-sm:pt-20">
      <div className={cx(container, 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-12 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-6')}>
        <div className="flex flex-col gap-8 pb-32 max-lg:pb-0">
          <Heading eyebrow="The app" parts={['Your crypto,', { serif: 'in your pocket.' }]} lead="Buy, sell, and track your crypto from your phone, with live prices and insights in one place." />
          <Rise delay={250} className="flex flex-wrap items-center gap-6">
            <div className="glass flex items-center gap-5 rounded-[28px] p-4 pr-6 max-sm:flex-col max-sm:items-start max-sm:pr-4">
              <div className="scale-90"><QrCard /></div>
              <div className="flex flex-col gap-3">
                <p className="max-w-[160px] text-[15px] font-semibold leading-snug text-v3-ink">Scan with your phone camera to download</p>
                <StoreBadges />
              </div>
            </div>
          </Rise>
        </div>

        <div ref={pointer} className="relative flex h-[717px] justify-center self-end max-lg:mx-auto max-lg:w-full max-lg:max-w-[620px] max-sm:h-[400px]" role="img" aria-label="A hand holding a phone with the Mybitstore app open">
          <div aria-hidden="true" className="absolute left-1/2 top-[45%] size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-1), var(--v3-aurora-2) 60%, transparent)', scale: 'calc(0.75 + var(--p, 0) * 0.45)' }} />
          <div
            className="relative max-sm:[zoom:0.56]"
            style={{ transform: 'translate3d(calc(var(--px, 0) * -10px), calc((0.6 - var(--p, 0)) * 90px), 0) rotate(calc(var(--px, 0) * 1.5deg))', transformOrigin: '50% 100%' }}
          >
            <HandPhone />
          </div>
          <div aria-hidden="true" className="absolute left-[0%] top-[40%] animate-[v3-float_7s_ease-in-out_infinite] max-sm:left-0 max-sm:top-[30%] max-sm:scale-[0.82]" style={{ translate: '0 calc((0.5 - var(--p, 0)) * 140px)' }}><BtcChip /></div>
          <div aria-hidden="true" className="glass-strong absolute right-[2%] top-[22%] rounded-2xl px-5 py-3 animate-[v3-float_8s_ease-in-out_infinite] [animation-delay:-3s] max-sm:right-0 max-sm:top-[12%] max-sm:scale-[0.82]" style={{ translate: '0 calc((0.5 - var(--p, 0)) * 200px)' }}>
            <p className="text-[12px] text-v3-muted">Total balance</p>
            <p className="font-inter-tight text-[22px] font-semibold text-v3-ink tabular-nums">$4,614.90</p>
          </div>
        </div>
      </div>
    </section>
  );
}
