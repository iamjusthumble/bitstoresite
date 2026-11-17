import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { COINS } from '../marketData.js';
import phone from '../assets/hero-phone-v2.png';
import phoneLight from '../assets/hero-phone-v2-light.png';
import lines from '../assets/hero-lines-v2.png';
import qrIcon from '../assets/qrcode-icon.svg';
import qrIconLight from '../assets/qrcode-icon-light.svg';
import { QrCard } from '../components/Hero.jsx';
import ThemedImg from '../components/ThemedImg.jsx';
import { cx } from '../ui.js';
import { useMedia, usePointerParallax, useProgress } from '../v3/motion.js';
import { PrimaryButton, SecondaryButton as GhostButton, Words, display } from './ui.jsx';

export const HERO_DELAY = 150;
const heroDelay = HERO_DELAY;

const coinBy = Object.fromEntries(COINS.map((c) => [c.id, c]));

// Coins riding a slow ring around the phone; each counter-rotates to stay upright
function Orbit() {
  const ids = ['bitcoin', 'ethereum', 'tether', 'usd-coin', 'tron', 'litecoin'];
  return (
    <div aria-hidden="true" className="absolute left-1/2 top-1/2 aspect-square w-[min(620px,100%)] -translate-x-1/2 -translate-y-1/2 max-lg:w-[480px] max-sm:w-[min(350px,calc(100vw-40px))]">
      <div className="absolute inset-0 rounded-full border border-dashed border-v4-line" />
      <div className="absolute inset-[70px] rounded-full border border-v4-line opacity-60" />
      <div className="absolute inset-0 animate-[v3-orbit_60s_linear_infinite]">
        {ids.map((id, i) => {
          const a = (i / ids.length) * Math.PI * 2;
          return (
            <span key={id} className="absolute size-11 max-sm:size-8" style={{ left: `calc(50% + ${Math.cos(a) * 50}% - 22px)`, top: `calc(50% + ${Math.sin(a) * 50}% - 22px)` }}>
              <span className="grid size-full bg-v4-card shadow-[inset_0_0_0_1px_var(--v4-line-2)] animate-[v3-counter_60s_linear_infinite] place-items-center rounded-full">
                <img src={coinBy[id].icon} alt="" className="size-6 max-sm:size-4" />
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// On a phone the QR code is no use, so the button goes straight to that phone's app store
const storeLink = () => (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? links.appStore : links.googlePlay);

function DownloadQr({ className }) {
  const [open, setOpen] = useState(false);
  const touch = useMedia('(max-width: 640px)');
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
    <div ref={ref} className={cx('relative', className)}>
      <GhostButton
        className="w-full"
        aria-expanded={touch ? undefined : open}
        onClick={() => (touch ? window.location.assign(storeLink()) : setOpen((o) => !o))}
      >
        <ThemedImg dark={qrIcon} light={qrIconLight} width="20" height="20" className="max-sm:hidden" />
        Get the app
      </GhostButton>
      <div
        role="dialog"
        aria-label="Download the Mybitstore app"
        className={cx(
          'bg-v4-card shadow-[inset_0_0_0_1px_var(--v4-line-2),var(--v4-shadow)] absolute bottom-[calc(100%+12px)] left-0 z-10 flex w-[188px] flex-col items-center gap-3 rounded-[24px] p-5 transition-[opacity,translate,scale] duration-300 ease-v4',
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-2 scale-95 opacity-0',
        )}
      >
        <QrCard />
        <p className="text-center text-[13px] leading-5 text-v4-soft">Scan to download</p>
      </div>
    </div>
  );
}

export default function HeroV4() {
  const ref = useProgress('pin');
  const pointer = usePointerParallax();

  return (
    <section ref={ref} id="hero" className="relative h-[125svh] max-lg:h-auto" aria-label="Mybitstore">
      <div ref={pointer} className="sticky top-0 h-svh min-h-[680px] overflow-hidden p-0 max-lg:relative max-lg:h-auto max-lg:min-h-0">
        {/* The stage: insets into a rounded card and steps back as the page scrolls on */}
        <div
          className="absolute inset-0 overflow-hidden max-lg:relative bg-[radial-gradient(120%_80%_at_70%_0%,color-mix(in_srgb,var(--v4-accent)_22%,var(--v4-bg))_0%,var(--v4-bg)_60%)]"
          style={{
            clipPath: 'inset(calc(var(--p, 0) * 2.4vw) calc(var(--p, 0) * 2.4vw) calc(var(--p, 0) * 2.4vw) calc(var(--p, 0) * 2.4vw) round calc(var(--p, 0) * 48px))',
            transform: 'scale(calc(1 - var(--p, 0) * 0.04))',
          }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                        <div className="absolute right-[-10%] top-[10%] h-[70vh] w-[50vw] animate-[v3-aurora_22s_ease-in-out_infinite_alternate-reverse] rounded-full blur-[100px]" style={{ background: 'radial-gradient(closest-side, var(--v4-glow), transparent)' }} />
                        <img
              src={lines}
              alt=""
              className="absolute bottom-[-10%] left-1/2 w-[max(120%,1500px)] max-w-none [mask-image:linear-gradient(180deg,transparent,#000_35%)] opacity-50 mix-blend-screen light:opacity-25 light:mix-blend-multiply light:invert"
              style={{ transform: 'translate3d(-50%, calc(var(--p, 0) * 120px + var(--py, 0) * -10px), 0) scale(calc(1 + var(--p, 0) * 0.15))' }}
            />
            {/* Fine grid, faded towards the edges */}
            <div
              className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_80%)]"
              style={{ backgroundImage: 'linear-gradient(var(--v4-line) 1px, transparent 1px), linear-gradient(90deg, var(--v4-line) 1px, transparent 1px)', backgroundSize: '72px 72px', backgroundPosition: 'center top' }}
            />
          </div>

          <div className="relative mx-auto flex h-full max-w-[1280px] items-center gap-10 px-8 pt-20 lg:gap-16 xl:gap-24 max-lg:flex-col max-lg:justify-center max-lg:gap-10 max-lg:px-6 max-lg:pb-12 max-lg:pt-32 max-sm:gap-6 max-sm:px-5 max-sm:pb-8 max-sm:pt-24">
            <div
              className="relative z-2 flex max-w-[600px] shrink-0 flex-col gap-7 lg:w-[46%] xl:w-[600px]"
              style={{ opacity: 'calc(1 - var(--p, 0) * 1.6)', transform: 'translate3d(0, calc(var(--p, 0) * -70px), 0)' }}
            >
              <Words
                as="h1"
                parts={['The easy, secure way', { dim: 'to use crypto.' }]}
                delay={heroDelay + 80}
                play
                step={70}
                className={cx(display, 'text-[72px] leading-[0.98] max-xl:text-[60px] max-sm:text-[40px] max-sm:leading-[1.04]')}
              />
              <p className="max-w-[540px] text-[19px] leading-[1.6] text-v4-muted max-sm:text-[16px]" style={{ animation: `v4-fade-up 1.2s var(--ease-v4) ${heroDelay + 500}ms backwards` }}>
                Buy, sell, and send Bitcoin and other digital currencies in one trusted app, built for individuals, businesses, and governments.
              </p>
              <div className="grid w-fit grid-cols-2 gap-3 max-sm:w-full" style={{ animation: `v4-fade-up 1.2s var(--ease-v4) ${heroDelay + 650}ms backwards` }}>
                <PrimaryButton href={links.signup} className="w-full">Sign up</PrimaryButton>
                <DownloadQr className="w-full" />
              </div>
            </div>

            {/* The app, with live prices floating around it */}
            <div
              className="relative h-[620px] min-w-0 flex-1 max-lg:h-[480px] max-lg:w-full max-lg:flex-none max-sm:h-[460px]"
              style={{ transform: 'translate3d(0, calc(var(--p, 0) * -40px), 0) scale(calc(1 + var(--p, 0) * 0.08))' }}
            >
              <div className="absolute inset-0" style={{ animation: `v4-fade-up 1.6s var(--ease-v4) ${heroDelay + 300}ms backwards` }}>
                <div className="absolute left-1/2 top-1/2 size-[480px] max-sm:size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--v4-glow),transparent)] blur-2xl" />
                <Orbit />
                <div className="absolute left-1/2 top-1/2 h-[640px] w-[427px] max-lg:h-[460px] max-lg:w-[307px] max-sm:h-[430px] max-sm:w-[287px]" style={{ transform: 'translate3d(calc(-50% + var(--px, 0) * -8px), calc(-50% + var(--py, 0) * -6px), 0)' }}>
                  <ThemedImg dark={phone} light={phoneLight} className="size-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)] light:drop-shadow-[0_40px_60px_rgba(30,50,120,0.25)]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
