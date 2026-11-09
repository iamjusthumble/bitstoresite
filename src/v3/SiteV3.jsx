import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.svg';
import Footer from '../components/Footer.jsx';
import AiZoom from './AiZoom.jsx';
import AppV3 from './AppV3.jsx';
import FaqV3 from './FaqV3.jsx';
import FinalCta from './FinalCta.jsx';
import HeroV3 from './HeroV3.jsx';
import LensStory from './LensStory.jsx';
import MarketsV3 from './MarketsV3.jsx';
import NavV3 from './NavV3.jsx';
import ProductsRail from './ProductsRail.jsx';
import Statement from './Statement.jsx';
import Steps from './Steps.jsx';
import Ticker from './Ticker.jsx';
import TrustBento from './TrustBento.jsx';
import { INTRO_MS, introPlays, markIntroSeen } from './intro.js';
import { scrollToTarget, stopScroll, useSmoothScroll } from './motion.js';

// A curtain with the logo that lifts away on the first visit of a session
function Intro() {
  const [show, setShow] = useState(introPlays);
  useEffect(() => {
    if (!show) return undefined;
    markIntroSeen();
    stopScroll(true);
    const t = setTimeout(() => {
      setShow(false);
      stopScroll(false);
    }, INTRO_MS + 700);
    return () => clearTimeout(t);
  }, [show]);
  if (!show) return null;
  return (
    <div aria-hidden="true" className="fixed inset-0 z-[100] grid place-items-center bg-v3-bg" style={{ animation: `v3-curtain 0.8s cubic-bezier(0.7,0,0.2,1) ${INTRO_MS - 300}ms forwards` }}>
      <div className="flex flex-col items-center gap-5 animate-[v3-logo-in_1.1s_var(--ease-soft)_backwards]">
        <img src={logo} alt="" width="64" height="64" />
      </div>
      <span className="absolute bottom-12 h-px w-40 overflow-hidden bg-v3-line">
        <span className="block h-full origin-left bg-[linear-gradient(90deg,var(--v3-accent),var(--v3-mint))] animate-[fill-bar_1.1s_var(--ease-soft)_backwards]" />
      </span>
    </div>
  );
}

// A soft field of colour behind the whole page, so the glass always has something to frost
function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-1 overflow-hidden">
      <div className="absolute -left-[20%] top-[20%] size-[70vmax] animate-[v3-aurora_30s_ease-in-out_infinite_alternate] rounded-full opacity-35 blur-[120px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-1), transparent)' }} />
      <div className="absolute -right-[25%] top-[40%] size-[60vmax] animate-[v3-aurora_36s_ease-in-out_infinite_alternate-reverse] rounded-full opacity-30 blur-[120px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-2), transparent)' }} />
      {/* Film grain keeps the gradients from banding */}
      <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}

function ToTop() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => scrollToTarget(0)}
      className="glass-strong fixed bottom-6 right-6 z-40 grid size-12 place-items-center rounded-full text-v3-ink transition-[opacity,translate,scale] duration-500 hover:scale-105 max-sm:bottom-4 max-sm:right-4"
      style={{ opacity: 'clamp(0, calc(var(--sp, 0) * 8 - 0.6), 1)', translate: '0 calc((1 - clamp(0, calc(var(--sp, 0) * 8 - 0.6), 1)) * 20px)' }}
    >
      {/* Ring fills with your progress down the page */}
      <svg width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r="22" fill="none" stroke="var(--v3-accent)" strokeWidth="1.5" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 'calc(1 - var(--sp, 0))' }} />
      </svg>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14.5v-11M4.5 8 9 3.5 13.5 8" /></svg>
    </button>
  );
}

export default function SiteV3() {
  useSmoothScroll();
  return (
    <div id="top" className="relative isolate min-h-screen bg-v3-bg font-euclid text-v3-ink antialiased selection:bg-v3-accent/30">
      <Intro />
      <Backdrop />
      <span aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[linear-gradient(90deg,#2f60e0,#8a5cff,#47e5bc)]" style={{ transform: 'scaleX(var(--sp, 0))' }} />
      <NavV3 />
      <main>
        <HeroV3 />
        <Ticker />
        <MarketsV3 />
        <Statement />
        <ProductsRail />
        <AiZoom />
        <LensStory />
        <TrustBento />
        <Steps />
        <AppV3 />
        <FaqV3 />
        <FinalCta />
      </main>
      <Footer />
      <ToTop />
    </div>
  );
}
