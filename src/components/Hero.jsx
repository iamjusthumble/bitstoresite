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
import linesV2 from '../assets/hero-lines-v2.png';
import phoneV2 from '../assets/hero-phone-v2.png';
import phoneV2Light from '../assets/hero-phone-v2-light.png';

export function QrCard({ size = 'md' }) {
  return (
    <div className={'qr-box qr-' + size}>
      <img className="qr-image" src={qrCode} alt="QR code to download the Mybitstore app" />
      <span className="qr-logo"><img src={qrLogo} alt="" width="36" height="36" /></span>
    </div>
  );
}

export function DownloadButton() {
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
    <div className="download-wrap" ref={ref}>
      {open && (
        <div className="qr-popover" role="dialog" aria-label="Download the Mybitstore app">
          <QrCard />
          <p>Scan QR Code to Download</p>
        </div>
      )}
      <button
        type="button"
        className="btn btn-hero btn-hero-outline"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <ThemedImg dark={qrIcon} light={qrIconLight} width="22" height="22" />
        Download App
      </button>
    </div>
  );
}

function HeroActions() {
  return (
    <div className="hero-actions">
      <a className="btn btn-hero btn-hero-primary" href={links.signup}>
        Sign Up
        <img src={arrowRight} alt="" width="22" height="22" />
      </a>
      <DownloadButton />
    </div>
  );
}

const HEADLINE = <>Crypto infrastructure, <span>built</span> for everyone.</>;
const LEAD = 'A trusted crypto and digital value infrastructure powering secure transactions for individuals, businesses, and governments.';

// Version 2: centred copy with the app rising from the bottom edge
function HeroV2() {
  return (
    <section className="hero hero-v2 reveal-scope">
      <div className="hero-bg" aria-hidden="true">
        <ThemedImg dark={linesV2} light={linesLight} />
      </div>
      <div className="hero-v2-inner">
        <div className="hero-text">
          <h1>{HEADLINE}</h1>
          <p>{LEAD}</p>
        </div>
        <HeroActions />
        <div className="hero-v2-phone" aria-hidden="true">
          <ThemedImg dark={phoneV2} light={phoneV2Light} />
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  const { version } = useVersion();
  if (version === '2') return <HeroV2 />;
  return (
    <section className="hero reveal-scope">
      <div className="hero-bg" aria-hidden="true">
        <ThemedImg dark={lines} light={linesLight} />
      </div>
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-text">
            <h1>{HEADLINE}</h1>
            <p>{LEAD}</p>
          </div>
          <HeroActions />
        </div>
      </div>
      <div className="hero-art only-dark" aria-hidden="true">
        <img src={phoneCoins} alt="" />
      </div>
      <div className="hero-art-light only-light" aria-hidden="true">
        <img src={phoneLight} alt="" />
      </div>
    </section>
  );
}
