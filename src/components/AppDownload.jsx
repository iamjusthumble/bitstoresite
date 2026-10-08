import React from 'react';
import glow from '../assets/glow-ellipse.svg';
import glowLight from '../assets/glow-ellipse-light.svg';
import hand from '../assets/app-hand.png';
import screen from '../assets/app-screen.png';
import screenLight from '../assets/app-screen-light.png';
import btc from '../assets/coin-btc-large.svg';
import { QrCard } from './Hero.jsx';
import ThemedImg from './ThemedImg.jsx';
import { cx } from '../ui.js';

const floatCard = 'rounded-[10px] bg-[rgba(24,27,46,0.7)] leading-[1.2] whitespace-nowrap [transform:rotate(10.4deg)] light:bg-white/80 light:text-black';
const floatSlot = 'absolute flex items-center justify-center animate-[bob_6s_ease-in-out_infinite]';
const appCopy = 'font-nunito text-2xl leading-[1.2] text-[#c2c4cc] light:text-black max-sm:text-lg';

export default function AppDownload() {
  return (
    <section
      id="download"
      className="relative h-[717px] overflow-hidden bg-navy text-white light:bg-[#f7f7fc] light:text-black max-lg:h-auto max-lg:px-5 max-lg:pb-0 max-lg:pt-[72px]"
    >
      <ThemedImg
        dark={glow}
        light={glowLight}
        width="1765"
        height="441"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[569px] h-[441px] w-[1765px] max-w-none -translate-x-1/2 animate-[breathe_9s_ease-in-out_infinite] max-lg:-bottom-[140px] max-lg:top-auto"
      />
      <div className="reveal absolute left-[calc(50%-604px)] top-[120.22px] flex w-[605px] flex-col gap-[35px] max-xl:left-8 max-lg:relative max-lg:left-auto max-lg:top-auto max-lg:mx-auto max-lg:w-full max-lg:max-w-[605px]">
        <div className="flex flex-col gap-[11px]">
          <h2 className="text-[60px] font-normal leading-[1.06] tracking-[-3px] text-shadow-[0_4px_4px_rgba(0,0,0,0.25)] light:text-shadow-none max-sm:text-[42px] max-sm:tracking-[-1.8px]">
            Trade Crypto with<br /><span className="text-[#2d64bc]">Confidence</span>
          </h2>
          <p className={appCopy}>Get insights, tools, and trades - all in the Mybitstore app</p>
        </div>
        <div className="flex flex-col gap-[17px]">
          <QrCard />
          <p className={appCopy}>Scan the QR Code to Download</p>
        </div>
      </div>

      <div
        role="img"
        aria-label="Hand holding a phone running the Mybitstore app"
        className="reveal absolute left-[calc(50%+82px)] top-0 h-[717px] w-[638px] overflow-hidden [--reveal-delay:160ms] max-xl:-right-10 max-xl:left-auto max-lg:relative max-lg:left-auto max-lg:right-auto max-lg:mx-auto max-lg:mt-8 max-sm:[zoom:0.53]"
      >
        <div className="absolute left-[31px] top-[74px] flex h-[769.6px] w-[607px] items-center justify-center">
          <img src={hand} alt="" loading="lazy" className="h-[690px] w-[484.5px] max-w-none [transform:rotate(10.97deg)]" />
        </div>
        {/* The screen export is rectangular; this rotated rounded box clips it to the phone's display */}
        <div className="absolute left-[122.3px] top-[90.25px] flex h-[477.8px] w-[289.5px] items-center justify-center">
          <div className="flex h-[446.31px] w-[208.36px] shrink-0 items-center justify-center overflow-hidden rounded-[25.06px] [transform:rotate(10.97deg)]">
            <ThemedImg dark={screen} light={screenLight} loading="lazy" className="h-[478px] w-[289.5px] max-w-none shrink-0 [transform:rotate(-10.97deg)]" />
          </div>
        </div>
        <div className={cx(floatSlot, 'left-[318.3px] top-[187.25px] h-[79.53px] w-[166.35px]')}>
          <p className={cx(floatCard, 'flex h-[51.55px] w-[159.67px] items-center justify-center text-[22.82px]')}>$4,614.90</p>
        </div>
        <div className={cx(floatSlot, 'left-0 top-[359px] h-[103.82px] w-[249.2px]')} style={{ animationDelay: '-3s' }}>
          <div className={cx(floatCard, 'flex items-center gap-0.5 px-[15px] py-2.5')}>
            <div className="flex w-[116.36px] items-center gap-[11.48px]">
              <img src={btc} alt="" width="30.6" height="30.6" />
              <div className="flex flex-col">
                <strong className="text-[17.85px] font-normal">BTC</strong>
                <span className="text-[15.3px] text-[#878585]">Bitcoin</span>
              </div>
            </div>
            <div className="flex w-[93.39px] flex-col items-end">
              <strong className="text-[17.85px] font-normal">28,798.00</strong>
              <span className="text-[15.3px] text-[#878585]">$28,788.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
