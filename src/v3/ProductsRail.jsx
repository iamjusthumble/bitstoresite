import React, { useLayoutEffect, useRef, useState } from 'react';
import { ProductArt, groups } from '../components/Products.jsx';
import { productCopy } from './copy.js';
import { cx } from '../ui.js';
import { useMedia, useProgress, useSpotlight } from './motion.js';
import { ArrowUpRight, Eyebrow, SpotCard, Words, display } from './ui.jsx';

const PRODUCTS = Object.entries(groups).flatMap(([group, list]) => list.map((p) => ({ ...p, group, copy: productCopy[p.name] ?? p.copy })));

function ProductCard({ p, i }) {
  return (
    <SpotCard
      as="a"
      href={p.href}
      className="flex h-[min(560px,68svh)] w-[400px] shrink-0 flex-col justify-between p-7 transition-[translate] duration-500 ease-(--ease-soft) hover:-translate-y-2 max-lg:h-[480px] max-lg:w-[78vw] max-lg:max-w-[360px] max-lg:snap-start"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-v3-line px-3 py-1 text-[12px] font-medium text-v3-muted">{p.group}</span>
      </div>
      {/* The art drifts against the scroll for a little depth */}
      <div className="relative flex flex-1 items-center justify-center">
        <span aria-hidden="true" className="absolute size-[220px] rounded-full bg-[radial-gradient(closest-side,rgba(91,139,255,0.35),transparent)] blur-xl transition-transform duration-700 ease-(--ease-soft) group-hover/spot:scale-125" />
        <span className="relative scale-[0.85] transition-transform duration-700 ease-(--ease-soft) group-hover/spot:scale-[0.95] group-hover/spot:rotate-[-4deg]" style={{ translate: `calc(var(--p, 0) * ${-30 - i * 6}px) 0` }}>
          <ProductArt img={p.img} art={p.art} />
        </span>
      </div>
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-inter-tight text-[28px] font-semibold leading-[1.05] tracking-[-0.025em] text-v3-ink">{p.name}</h3>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-v3-line text-v3-ink transition-[background-color,rotate,color] duration-300 group-hover/spot:rotate-45 group-hover/spot:bg-v3-ink group-hover/spot:text-v3-bg">
            <ArrowUpRight size={16} />
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-6 text-v3-muted">{p.copy}</p>
      </div>
    </SpotCard>
  );
}

// Pinned while the cards slide across; the scroll distance matches the track's overflow
export default function ProductsRail() {
  const wide = useMedia('(min-width: 1024px)');
  // Re-registers when the layout switches between pinned and swipe
  const ref = useProgress(wide ? 'pin' : 'through');
  const track = useRef(null);
  const [travel, setTravel] = useState(0);
  const spot = useSpotlight();

  useLayoutEffect(() => {
    if (!wide) return undefined;
    const measure = () => setTravel(Math.max(0, track.current.scrollWidth - window.innerWidth + 64));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [wide]);

  const intro = (
    <div className="flex w-[440px] shrink-0 flex-col justify-center gap-6 pr-8 max-lg:w-full max-lg:pr-0">
      <Eyebrow>Products</Eyebrow>
      <Words parts={['Tools for you and', { serif: 'your business.' }]} className={cx(display, 'text-[60px] leading-[1.02] max-sm:text-[38px]')} />
    </div>
  );

  if (!wide) {
    return (
      <section id="products" className="relative py-24 max-sm:py-20" ref={spot}>
        <div className="px-6 max-sm:px-5">{intro}</div>
        <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 max-sm:px-5">
          {PRODUCTS.map((p, i) => <ProductCard key={p.name} p={p} i={i} />)}
        </div>
      </section>
    );
  }

  return (
    <section id="products" ref={ref} className="relative" style={{ height: `calc(100svh + ${travel}px)` }}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden" ref={spot}>
        <div aria-hidden="true" className="absolute right-[-10%] top-1/2 size-[60vw] -translate-y-1/2 rounded-full blur-[120px]" style={{ background: 'radial-gradient(closest-side, var(--v3-aurora-2), transparent)', opacity: 0.5 }} />
        <div ref={track} className="relative flex items-center gap-6 pl-[max(32px,calc((100vw-1280px)/2+32px))] will-change-transform" style={{ transform: `translate3d(calc(var(--p, 0) * ${-travel}px), 0, 0)` }}>
          {intro}
          {PRODUCTS.map((p, i) => <ProductCard key={p.name} p={p} i={i} />)}
          <div className="w-8 shrink-0" />
        </div>
      </div>
    </section>
  );
}
