import React, { useLayoutEffect, useRef, useState } from 'react';
import { ProductArt, groups } from '../components/Products.jsx';
import { productCopy } from '../v3/copy.js';
import merchantPay from '../assets/people/merchant-pay.jpg';
import apple from '../assets/gift-cards/apple.webp';
import amazon from '../assets/gift-cards/amazon.webp';
import steam from '../assets/gift-cards/steam.webp';
import playstation from '../assets/gift-cards/playstation.webp';
import netflix from '../assets/gift-cards/netflix.webp';
import spotify from '../assets/gift-cards/spotify.webp';
import { cx } from '../ui.js';
import { useSpotlight } from '../v3/motion.js';
import { ArrowUpRight, Card, Heading, Rise, container, section } from './ui.jsx';

// Two audiences, one layout: the lead product on a large visual card, the other three stacked beside it
const SETS = [
  { key: 'Individuals', label: 'For you' },
  { key: 'Businesses', label: 'For business', photo: merchantPay, pos: '60% 50%' },
].map((s) => ({ ...s, items: groups[s.key].map((p) => ({ ...p, copy: productCopy[p.name] ?? p.copy })) }));
// Merchant Business Suite leads for businesses
SETS[1].items = [SETS[1].items[1], SETS[1].items[0], ...SETS[1].items.slice(2)];

function Toggle({ value, onChange }) {
  const box = useRef(null);
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    const el = box.current?.querySelector('[data-on="true"]');
    if (el) setRect({ x: el.offsetLeft, w: el.offsetWidth });
  }, [value]);
  return (
    <div ref={box} role="tablist" aria-label="Who the products are for" className="relative flex gap-1 rounded-full bg-v4-card p-1 shadow-[inset_0_0_0_1px_var(--v4-line-2)]">
      {rect && <span aria-hidden="true" className="absolute inset-y-1 rounded-full bg-v4-ink transition-[left,width] duration-500 ease-v4" style={{ left: rect.x, width: rect.w }} />}
      {SETS.map((s, i) => (
        <button
          key={s.key}
          type="button"
          role="tab"
          aria-selected={value === i}
          data-on={value === i}
          onClick={() => onChange(i)}
          className={cx('relative h-10 rounded-full px-5 text-[14px] font-medium transition-colors duration-500', value === i ? 'text-v4-bg' : 'text-v4-muted hover:text-v4-ink')}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// Real gift cards in a tilted wall, each floating on its own beat; hovering lifts the wall a little
const CARDS = [amazon, apple, steam, spotify, playstation, netflix];
function GiftFan() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-1 overflow-hidden bg-[radial-gradient(110%_80%_at_20%_0%,#4b79f2_0%,#2f60e0_45%,#1c3fb0_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(255,255,255,0.22),transparent)]" />
      <div className="absolute left-1/2 top-[38%] grid w-[520px] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] grid-cols-3 gap-4 transition-transform duration-[1200ms] ease-v4 group-hover/f:-translate-y-[54%] max-sm:top-[30%] max-sm:w-[300px] max-sm:gap-2.5">
        {CARDS.map((src, i) => (
          <span key={src} className="block animate-[v4-float_7s_ease-in-out_infinite]" style={{ animationDelay: `${-i * 1.1}s`, marginTop: i % 3 === 1 ? 28 : 0 }}>
            <img src={src} alt="" className="aspect-[1080/648] w-full rounded-[12px] object-cover shadow-[0_18px_40px_-14px_rgba(5,10,50,0.6)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

// The lead product: a picture of exactly what it is, with the details over a soft shade
function Feature({ set, p }) {
  return (
    <a href={p.href} className="group/f relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden rounded-[28px] p-8 text-white max-lg:min-h-[460px] max-sm:min-h-[400px] max-sm:p-6">
      {set.photo ? (
        <img src={set.photo} alt="" className="absolute inset-0 -z-1 size-full object-cover transition-transform duration-[1400ms] ease-v4 group-hover/f:scale-[1.04]" style={{ objectPosition: set.pos }} />
      ) : (
        <GiftFan />
      )}
      <div className="absolute inset-0 -z-1 bg-[linear-gradient(180deg,transparent_45%,rgba(5,8,20,0.8))]" />
      <div className="flex items-end justify-between gap-6">
        <div className="max-w-[420px]">
          <h3 className="font-v4 text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] max-sm:text-[28px]">{p.name}</h3>
          <p className="mt-3 text-[16px] leading-[1.55] text-white/80">{p.copy}</p>
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-[#0a0c12] transition-[background-color,color,rotate] duration-500 ease-v4 group-hover/f:rotate-45 group-hover/f:bg-v4-accent group-hover/f:text-white">
          <ArrowUpRight size={18} />
        </span>
      </div>
    </a>
  );
}

// A smaller product: words on the left, its 3D illustration on the right
function Item({ p }) {
  return (
    <Card as="a" href={p.href} className="flex w-full items-center gap-5 p-6 max-sm:p-5">
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 font-v4 text-[20px] font-semibold tracking-[-0.02em] text-v4-ink">
          {p.name}
          <ArrowUpRight size={14} className="text-v4-faint transition-[translate,color] duration-500 ease-v4 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-v4-accent-ink" />
        </h3>
        <p className="mt-2 text-[14px] leading-[1.6] text-v4-muted">{p.copy}</p>
      </div>
      <span aria-hidden="true" className="relative h-[104px] w-[120px] shrink-0 max-sm:hidden">
        {/* The art keeps its own size, so it is scaled down from the middle of this slot */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.5] transition-transform duration-700 ease-v4 group-hover/card:scale-[0.56]"><ProductArt img={p.img} art={p.art} /></span>
      </span>
    </Card>
  );
}

export default function ProductsV4() {
  const [index, setIndex] = useState(0);
  const spot = useSpotlight();
  const set = SETS[index];
  const [lead, ...rest] = set.items;

  return (
    <section id="products" className={section}>
      <div className={container} ref={spot}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Heading size="md" parts={['Tools for you and', { dim: 'your business.' }]} />
          <Rise delay={150}><Toggle value={index} onChange={setIndex} /></Rise>
        </div>

        {/* A new key replays the entrance, so switching audiences reads as a fresh set */}
        <Rise className="mt-12">
          <div key={set.key} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 max-lg:grid-cols-[minmax(0,1fr)]">
            <div className="animate-[v4-fade-up_800ms_cubic-bezier(0.16,1,0.3,1)_backwards]"><Feature set={set} p={lead} /></div>
            <div className="flex flex-col gap-4">
              {rest.map((p, i) => (
                <div key={p.name} className="flex flex-1 animate-[v4-fade-up_800ms_cubic-bezier(0.16,1,0.3,1)_backwards]" style={{ animationDelay: `${80 + i * 80}ms` }}>
                  <Item p={p} />
                </div>
              ))}
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}
