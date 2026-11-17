import React from 'react';
import { ProductArt, groups } from '../components/Products.jsx';
import { productCopy } from './copy.js';
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

// Two sections, one per audience. Each leads with a large visual card and sets two smaller ones beside it.
// Learn & Earn and Crypto APIs are left out of V4.
const HIDDEN = ['Learn & Earn', 'Crypto APIs'];
const pick = (key) => groups[key].filter((p) => !HIDDEN.includes(p.name)).map((p) => ({ ...p, copy: productCopy[p.name] ?? p.copy }));
const lead = (list, name) => [list.find((p) => p.name === name), ...list.filter((p) => p.name !== name)];

const SETS = [
  {
    id: 'products',
    parts: ['Tools for', { dim: 'you.' }],
    lead: 'Buy and sell gift cards, earn from referrals, and grow your credit score as you trade.',
    items: lead(pick('Individuals'), 'Gift Cards'),
  },
  {
    id: 'business',
    parts: ['Tools for', { dim: 'your business.' }],
    lead: 'Accept crypto payments, stay on top of tax and compliance, and launch your own token.',
    items: lead(pick('Businesses'), 'Merchant Business Suite'),
    photo: merchantPay,
    pos: '60% 50%',
    flip: true,
  },
];

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
    <a href={p.href} className="group/f relative isolate flex h-full min-h-[440px] flex-col justify-end overflow-hidden rounded-[28px] p-8 text-white max-lg:min-h-[400px] max-sm:min-h-[360px] max-sm:p-6">
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

function ProductSet({ set }) {
  const spot = useSpotlight();
  const [first, ...rest] = set.items;
  return (
    <section id={set.id} className={section}>
      <div className={container} ref={spot}>
        <Heading size="md" parts={set.parts} lead={set.lead} />
        <div className={cx('mt-10 grid gap-4 max-lg:grid-cols-[minmax(0,1fr)]', set.flip ? 'grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]')}>
          {/* The businesses set mirrors the first, so the page alternates as you scroll */}
          <Rise className={cx('h-full', set.flip && 'lg:order-2')}><Feature set={set} p={first} /></Rise>
          <div className="flex flex-col gap-4">
            {rest.map((p, i) => (
              <Rise key={p.name} delay={120 + i * 100} className="flex flex-1">
                <Item p={p} />
              </Rise>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Shown apart on the page: individuals before the AI assistant, businesses before Lens
export const ProductsForYou = () => <ProductSet set={SETS[0]} />;
export const ProductsForBusiness = () => <ProductSet set={SETS[1]} />;
