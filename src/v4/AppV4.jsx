import React from 'react';
import hand from '../assets/app-hand.png';
import screen from '../assets/app-screen.png';
import screenLight from '../assets/app-screen-light.png';
import { QrCard } from '../components/Hero.jsx';
import { StoreBadges } from '../components/Footer.jsx';
import ThemedImg from '../components/ThemedImg.jsx';
import { usePointerParallax, useProgress } from '../v3/motion.js';
import { Heading, Rise, container, section } from './ui.jsx';

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

// One wide panel: the pitch and the download options on the left, and the hand-held phone rising out of
// the panel's bottom edge on the right. The phone lifts as the section scrolls past and leans toward the pointer.
export default function AppV4() {
  const ref = useProgress('through');
  const pointer = usePointerParallax();
  return (
    <section id="download" ref={ref} className={section}>
      <div className={container}>
        <Rise className="relative isolate grid min-h-[640px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-[32px] bg-v4-card shadow-[inset_0_0_0_1px_var(--v4-line)] max-lg:grid-cols-[minmax(0,1fr)]">
          {/* A soft light under the phone, rising with the scroll */}
          <div aria-hidden="true" className="absolute bottom-[-30%] right-[-5%] -z-1 size-[720px] rounded-full max-lg:left-1/2 max-lg:right-auto max-lg:-translate-x-1/2" style={{ background: 'radial-gradient(closest-side, var(--v4-glow), transparent)', scale: 'calc(0.8 + var(--p, 0) * 0.35)' }} />

          <div className="flex flex-col justify-center gap-10 p-16 max-lg:p-10 max-sm:p-6 max-sm:pb-2">
            <Heading size="md" parts={['Your crypto,', '\n', { dim: 'in your pocket.' }]} lead="Buy, sell, and track your crypto from your phone, with live prices and insights in one place." />
            <Rise delay={200} className="flex items-center gap-5 border-t border-v4-line pt-8 max-sm:flex-col max-sm:items-start">
              <div className="shrink-0 rounded-2xl bg-white p-1.5 shadow-[inset_0_0_0_1px_var(--v4-line-2)]"><div className="h-[104px] w-[100px] overflow-hidden"><div className="origin-top-left scale-[0.76]"><QrCard /></div></div></div>
              <div className="flex flex-col gap-3">
                <p className="text-[14px] leading-snug text-v4-muted">Scan with your phone camera,<br />or get it from your app store.</p>
                <StoreBadges />
              </div>
            </Rise>
          </div>

          <div ref={pointer} className="relative h-full min-h-[560px] max-lg:min-h-[520px] max-sm:min-h-[380px]" role="img" aria-label="A hand holding a phone with the Mybitstore app open">
            <div
              className="absolute bottom-0 left-1/2 max-sm:[zoom:0.6]"
              style={{ transform: 'translate3d(calc(-50% + var(--px, 0) * -8px), calc((0.55 - var(--p, 0)) * 80px + 70px), 0) rotate(calc(var(--px, 0) * 1.2deg))', transformOrigin: '50% 100%' }}
            >
              <HandPhone />
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}
