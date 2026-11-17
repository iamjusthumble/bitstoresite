import React from 'react';
import lines from '../assets/hero-lines-v2.png';
import { useSmoothScroll } from '../v3/motion.js';
import AiV4 from './AiV4.jsx';
import AppV4 from './AppV4.jsx';
import CtaV4 from './CtaV4.jsx';
import FaqV4 from './FaqV4.jsx';
import FooterV4 from './FooterV4.jsx';
import HeroV4 from './HeroV4.jsx';
import LensV4 from './LensV4.jsx';
import MarketsV4 from './MarketsV4.jsx';
import NavV4 from './NavV4.jsx';
import { ProductsForBusiness, ProductsForYou } from './ProductsV4.jsx';
import SecurityV4 from './SecurityV4.jsx';
import StatementV4 from './StatementV4.jsx';
import StepsV4 from './StepsV4.jsx';
import TickerV4 from './TickerV4.jsx';

// Version 4: V3's structure and scroll motion, refined. Neutral surfaces, the Mybitstore blue as the only accent,
// no labels above titles, and slower, softer easing throughout. Shares V3's motion engine and wording.
export default function SiteV4() {
  useSmoothScroll();
  return (
    <div id="top" className="relative isolate min-h-screen bg-v4-bg font-v4 text-v4-ink antialiased selection:bg-v4-accent/25">
      {/* Reading progress: one hairline of brand blue along the top */}
      <span aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-v4-accent" style={{ transform: 'scaleX(var(--sp, 0))' }} />
      {/* The hero's flowing lines, carried quietly behind the whole page. They drift slowly as you scroll. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-1 overflow-hidden">
        <img
          src={lines}
          alt=""
          className="absolute left-1/2 top-1/2 w-[max(140%,1600px)] max-w-none opacity-25 mix-blend-screen light:opacity-[0.12] light:mix-blend-multiply light:invert max-sm:w-[1100px]"
          style={{ transform: 'translate3d(-50%, calc(-50% + var(--sp, 0) * -160px), 0) rotate(calc(var(--sp, 0) * 8deg))' }}
        />
      </div>
      <NavV4 />
      <main>
        <HeroV4 />
        <TickerV4 />
        <MarketsV4 />
        <StatementV4 />
        {/* The story runs audience by audience: tools for you and the AI assistant, then tools for business and Lens */}
        <ProductsForYou />
        <AiV4 />
        <ProductsForBusiness />
        <LensV4 />
        <SecurityV4 />
        <StepsV4 />
        <AppV4 />
        <FaqV4 />
        <CtaV4 />
      </main>
      <FooterV4 />
    </div>
  );
}
