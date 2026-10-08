import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import lines from '../assets/hero-lines.png';
import linesLight from '../assets/hero-lines-light.jpg';
import phoneCoins from '../assets/hero-phone-coins.png';
import phoneLight from '../assets/hero-phone-light.png';
import arrowRight from '../assets/arrow-right.svg';
import qrIcon from '../assets/qrcode-icon.svg';
import qrIconLight from '../assets/qrcode-icon-light.svg';
import qrCode from '../assets/qr-code.png';
import qrLogo from '../assets/qr-logo.svg';
import ThemedImg from './ThemedImg.jsx';
import { useVersion } from '../version.js';
import { btn, btnArrow, cx } from '../ui.js';
import linesV2 from '../assets/hero-lines-v2.png';
import phoneV2 from '../assets/hero-phone-v2.png';
import phoneV2Light from '../assets/hero-phone-v2-light.png';

export function QrCard() {
  return (
    <div className="relative flex h-[137px] w-[132px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white">
      <img className="size-[146px] max-w-none shrink-0 rounded-[30px] object-cover" src={qrCode} alt="QR code to download the Mybitstore app" />
      <span className="absolute left-[47px] top-[42px] rounded-[30px] bg-white p-1"><img src={qrLogo} alt="" width="36" height="36" /></span>
    </div>
  );
}

// `tight` sits the popover flush on the button (used by the centred V2 hero)
export function DownloadButton({ tight = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div
          role="dialog"
          aria-label="Download the Mybitstore app"
          className={cx(
            'absolute left-0 z-5 flex w-[190px] animate-[pop-in_0.18s_ease-out] flex-col items-center gap-3 rounded-[20px] bg-[rgba(24,27,46,0.7)] px-5 py-[21px] backdrop-blur-[14px]',
            tight ? 'bottom-full' : 'bottom-[calc(100%+6px)]',
          )}
        >
          <QrCard />
          <p className="w-[132px] text-center text-sm leading-[1.2] text-white">Scan QR Code to Download</p>
        </div>
      )}
      <button type="button" className={btn.heroOutline} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <ThemedImg dark={qrIcon} light={qrIconLight} width="22" height="22" />
        Download App
      </button>
    </div>
  );
}


function HeroActions({ centered = false }) {
  return (
    <div className={cx('flex items-center gap-[17px] max-sm:flex-wrap', centered && 'justify-center', 'revealed:animate-[rise_0.9s_var(--ease-soft)_0.35s_backwards]')}>
      <a className={cx(btn.heroPrimary, centered && 'w-[190px]')} href={links.signup}>
        Sign Up
        <img src={arrowRight} alt="" width="22" height="22" className={btnArrow} />
      </a>
      <DownloadButton tight={centered} />
    </div>
  );
}

const HEADLINE = <>Crypto infrastructure, <span className="text-tab-active">built</span> for everyone.</>;
const LEAD = 'A trusted crypto and digital value infrastructure powering secure transactions for individuals, businesses, and governments.';

const heroSection = cx(
  'reveal-scope relative overflow-hidden text-white light:text-black',
  'bg-[radial-gradient(ellipse_980px_560px_at_55%_-8%,#2d3f7b_0%,#242f57_50%,var(--color-hero)_100%)]',
  'light:bg-[radial-gradient(ellipse_900px_430px_at_calc(50%_+_70px)_-51px,#8fa9ff_0%,#bfcdff_50%,#eff1ff_100%)]',
);
const heroBg = 'pointer-events-none absolute left-1/2 top-0 w-[max(100%,1440px)] -translate-x-1/2 light:h-[898px] light:mix-blend-hard-light';
const heroBgImg = 'size-full max-w-none origin-[60%_40%] animate-[drift_26s_ease-in-out_infinite_alternate]';
const h1 =
  'text-[72px] font-semibold tracking-[-5px] text-shadow-[0_4px_4px_rgba(0,0,0,0.25)] light:text-shadow-none max-sm:text-[46px] max-sm:leading-[1.12] max-sm:tracking-[-2px] revealed:animate-[rise_0.9s_var(--ease-soft)_0.05s_backwards]';
const lead =
  'text-2xl leading-[1.2] text-[#c2c4cc] light:text-[#717792] max-sm:text-lg revealed:animate-[rise_0.9s_var(--ease-soft)_0.2s_backwards]';
const artFade = 'revealed:animate-[fade_1.4s_var(--ease-soft)_0.2s_backwards]';
const artBob = 'animate-[bob_9s_ease-in-out_infinite]';

// Version 2: centred copy with the app rising from the bottom edge
function HeroV2() {
  return (
    <section className={cx(heroSection, 'h-[711px] max-sm:h-auto')}>
      <div className={cx(heroBg, 'h-[859px]')} aria-hidden="true">
        <ThemedImg dark={linesV2} light={linesLight} className={cx(heroBgImg, 'object-cover object-[center_bottom]')} />
      </div>
      <div className="relative z-2 mx-auto flex w-full max-w-[887px] flex-col items-center gap-[35px] px-5 pt-24 text-center max-sm:gap-7 max-sm:pt-14">
        <div className="flex flex-col items-center gap-[11px]">
          <h1 className={cx(h1, 'max-w-[787px] leading-[67px]')}>{HEADLINE}</h1>
          <p className={lead}>{LEAD}</p>
        </div>
        <HeroActions centered />
        <div
          className="pointer-events-none relative h-[841px] w-[417px] shrink-0 overflow-hidden light:w-[419px] max-sm:h-[380px] max-sm:[zoom:0.75] revealed:animate-[rise_1.1s_var(--ease-soft)_0.45s_backwards]"
          aria-hidden="true"
        >
          <ThemedImg
            dark={phoneV2}
            light={phoneV2Light}
            className="absolute left-[-109.38px] top-[-57.86px] h-[945.37px] w-[630.25px] max-w-none light:left-[-109.11px] light:top-[-54.52px] light:h-[952.04px] light:w-[634.7px]"
          />
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  const { version } = useVersion();
  if (version === '2') return <HeroV2 />;
  return (
    <section className={cx(heroSection, 'h-[630px] max-lg:h-auto')}>
      <div className={cx(heroBg, 'h-[632px]')} aria-hidden="true">
        <ThemedImg dark={lines} light={linesLight} className={cx(heroBgImg, 'object-fill light:object-cover')} />
      </div>
      <div className="relative z-2 mx-auto flex h-full max-w-[1288px] items-center px-6 max-lg:flex-col max-lg:items-start max-lg:pb-0 max-lg:pt-16 max-sm:px-5">
        <div className="flex w-[665px] flex-col gap-[35px] max-lg:w-full max-lg:max-w-[665px]">
          <div className="flex flex-col gap-[11px]">
            <h1 className={cx(h1, 'leading-[94px]')}>{HEADLINE}</h1>
            <p className={lead}>{LEAD}</p>
          </div>
          <HeroActions />
        </div>
      </div>
      <div
        aria-hidden="true"
        className={cx(
          'light:hidden! pointer-events-none absolute left-[calc(50%+461.25px)] top-[43px] z-1 h-[728.3px] w-[816.5px] -translate-x-1/2 overflow-hidden',
          'max-xl:-right-[260px] max-xl:left-auto max-xl:translate-x-0',
          'max-lg:relative max-lg:left-1/2 max-lg:right-auto max-lg:top-auto max-lg:mt-2 max-lg:h-[571px] max-lg:w-[640px] max-lg:-translate-x-1/2 max-sm:[zoom:0.6]',
          artFade,
        )}
      >
        <img src={phoneCoins} alt="" className={cx('absolute left-[-27.53%] top-0 h-full w-[133.8%] max-w-none', artBob)} />
      </div>
      <div
        aria-hidden="true"
        className={cx(
          'dark:hidden! pointer-events-none absolute left-[calc(50%-188px)] top-12 z-1 h-[702px] w-[1053px]',
          'max-xl:-right-[260px] max-xl:left-auto',
          'max-lg:relative max-lg:left-1/2 max-lg:right-auto max-lg:top-auto max-lg:mt-2 max-lg:h-[507px] max-lg:w-[760px] max-lg:-translate-x-1/2 max-sm:[zoom:0.6]',
          artFade,
        )}
      >
        <img src={phoneLight} alt="" className={cx('size-full max-w-none object-cover', artBob)} />
      </div>
    </section>
  );
}
