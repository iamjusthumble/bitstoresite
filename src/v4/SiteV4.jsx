import React from 'react';
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
import ProductsV4 from './ProductsV4.jsx';
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
      <NavV4 />
      <main>
        <HeroV4 />
        <TickerV4 />
        <MarketsV4 />
        <StatementV4 />
        <ProductsV4 />
        <AiV4 />
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
