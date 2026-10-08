import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer, { StoreBadges } from '../components/Footer.jsx';
import { FaqSection } from '../components/Faq.jsx';
import SectionHead from '../components/Section.jsx';
import { DownloadButton, QrCard } from '../components/Hero.jsx';
import { links } from '../links.js';
import { useReveal } from '../reveal.js';
import { btn, btnArrow, cx, section, text } from '../ui.js';
import { PREVIEW_TESTIMONIALS, TESTIMONIALS } from './testimonials.js';
import logo from '../assets/logo.svg';
import arrowRight from '../assets/arrow-right.svg';
import coinBtc from '../assets/coin-btc.svg';
import coinUsdt from '../assets/coin-usdt.svg';
import coinEth from '../assets/coin-eth.svg';

// Copy follows the Mybitstore customer-journey guide. Brands, ranges, stock and payout
// options depend on the customer's country, so the phone screens are labelled illustrative.

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const Icon = {
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  cart: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></svg>,
  mail: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>,
  wallet: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4h-12A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /><path d="M21 9h-5a3 3 0 0 0 0 6h5V9Z" /><circle cx="16" cy="12" r=".6" fill="currentColor" /></svg>,
  bank: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="m3 9 9-5 9 5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" /></svg>,
  grid: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><path d="m14.5 17 2 2 3.5-4" /></svg>,
  history: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" /><path d="M3 4v4h4M12 8v4.5l3 2" /></svg>,
  camera: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4V8Z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} strokeWidth="2.4"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>,
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14" /></svg>,
  eye: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
};

const CATEGORIES = ['All', 'Shopping', 'Gaming', 'Entertainment', 'Software', 'Payment Cards', 'Travel'];
// Popular searches the app suggests, each mapped to the category it lives under
const POPULAR = [['Xbox', 'Gaming'], ['Google Play', 'Software'], ['PlayStation', 'Gaming'], ['Apple', 'Software'], ['Steam', 'Gaming'], ['Netflix', 'Entertainment']];
const SAMPLE_CARDS = [
  { name: 'Shopping card', cat: 'Shopping', range: '$5 – $100', tone: 'blue' },
  { name: 'Gaming card', cat: 'Gaming', range: '$10 – $100', tone: 'violet' },
  { name: 'Streaming card', cat: 'Entertainment', range: '$15 – $60', tone: 'rose' },
  { name: 'App store card', cat: 'Software', range: '$10 – $50', tone: 'teal' },
  { name: 'Travel card', cat: 'Travel', range: '$25 – $100', tone: 'amber' },
  { name: 'Prepaid card', cat: 'Payment Cards', range: '$1 – $100', tone: 'blue' },
];

// Card art gradients
const TONE = {
  blue: 'bg-[linear-gradient(135deg,#4a7cff,#1d44b8)]',
  violet: 'bg-[linear-gradient(135deg,#8b6cff,#3b1d9e)]',
  teal: 'bg-[linear-gradient(135deg,#22c3b0,#0b5f73)]',
  rose: 'bg-[linear-gradient(135deg,#ff6f91,#a3245a)]',
  amber: 'bg-[linear-gradient(135deg,#ffb547,#d2591f)]',
};
const rise = (s = '0.6s') => `revealed:animate-[rise_${s}_var(--ease-soft)_backwards]`;
const stagger = (i, base = 0, step = 50) => ({ animationDelay: `${base + i * step}ms` });

/* ---------- Hero ---------- */

const CARD_SIZE = {
  hero: { card: 'h-[214px] w-[340px] rounded-[22px] px-[22px] py-5', chip: 'h-8 w-[42px]' },
  phone: { card: 'h-[170px] w-full rounded-[18px] px-[18px] py-4', chip: 'h-[26px] w-[34px]' },
};

// Pass the card's positioning (relative/absolute) in className; its decorations are absolutely placed
function GiftCard({ tone, label, size = 'hero', className = 'relative', style }) {
  return (
    <div
      style={style}
      className={cx(
        'isolate flex flex-col justify-between overflow-hidden text-white shadow-[0_30px_60px_-24px_rgba(5,10,30,0.7),inset_0_1px_0_rgba(255,255,255,0.25)]',
        "before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_at_110%_-10%,rgba(255,255,255,0.35),transparent_45%),repeating-radial-gradient(circle_at_120%_130%,rgba(255,255,255,0.09)_0_1px,transparent_1px_18px)] before:content-['']",
        "after:absolute after:inset-0 after:animate-[gc-sheen_6s_ease-in-out_infinite] after:bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.22)_50%,transparent_65%)] after:content-[''] after:[transform:translateX(-120%)]",
        TONE[tone],
        CARD_SIZE[size].card,
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <span className="inline-flex items-center gap-2 font-nunito text-[15px] font-bold">
          <span className="grid size-7 place-items-center rounded-[9px] bg-white"><img src={logo} alt="" width="20" height="20" /></span>
          Mybitstore
        </span>
        <span className="rounded-full border border-white/35 bg-white/14 px-2.5 py-1 text-[11.5px] font-medium backdrop-blur-[6px]">{label}</span>
      </div>
      <span
        className={cx(
          'rounded-[7px] bg-[linear-gradient(90deg,transparent_45%,rgba(120,80,10,0.35)_45%_55%,transparent_55%),linear-gradient(transparent_30%,rgba(120,80,10,0.3)_30%_36%,transparent_36%_64%,rgba(120,80,10,0.3)_64%_70%,transparent_70%),linear-gradient(135deg,#ffe7a3,#d9a53f)] shadow-[inset_0_0_0_1px_rgba(120,80,10,0.25)]',
          CARD_SIZE[size].chip,
        )}
      />
      <div className="flex items-end justify-between text-[11px] font-semibold uppercase tracking-[2px]">
        <span>Gift card</span>
        <span className="font-inter text-sm tracking-[1.5px] opacity-85">•••• •••• ••••</span>
      </div>
    </div>
  );
}

const float =
  'absolute z-2 flex animate-[gc-pop_0.6s_var(--ease-soft)_backwards,bob_6s_ease-in-out_infinite] items-center gap-2.5 whitespace-nowrap rounded-2xl border border-gc-line bg-gc-glass py-2.5 pl-2.5 pr-3.5 text-gc-text shadow-[0_20px_40px_-20px_rgba(5,10,30,0.6)] backdrop-blur-[14px]';
const floatTitle = 'block text-[13.5px] font-semibold leading-[1.3]';
const stackCard = 'absolute animate-[gc-deal_1s_var(--ease-soft)_backwards,bob_8s_ease-in-out_infinite]';

function HeroVisual() {
  return (
    <div className="relative h-[470px] max-lg:mx-auto max-lg:w-[560px] max-lg:max-w-full max-sm:h-[360px] max-sm:[zoom:0.68]" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 size-[470px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_80s_linear_infinite] rounded-full border border-dashed border-gc-accent/35 before:absolute before:inset-[60px] before:rounded-full before:border before:border-gc-accent/16 before:content-['']" />
      <GiftCard tone="teal" label="Entertainment" className={cx(stackCard, 'left-[190px] top-[34px] rotate-[13deg]')} style={{ animationDelay: '0.25s, -2s' }} />
      <GiftCard tone="violet" label="Gaming" className={cx(stackCard, 'left-[105px] top-[118px] -rotate-[7deg]')} style={{ animationDelay: '0.38s, -5s' }} />
      <GiftCard tone="blue" label="Shopping" className={cx(stackCard, 'left-[38px] top-[214px] rotate-[4deg]')} style={{ animationDelay: '0.5s, 0s' }} />
      <div className={cx(float, 'left-0 top-[18px]')} style={{ animationDelay: '0.9s, -1s' }}>
        <span className="flex pl-1">
          {[coinBtc, coinUsdt, coinEth].map((src) => (
            <img key={src} src={src} alt="" className="-ml-2 size-[26px] rounded-full border-2 border-gc-panel bg-gc-panel" />
          ))}
        </span>
        <div><strong className={floatTitle}>Pay with crypto</strong><small className="text-xs text-gc-muted">or a payment account</small></div>
      </div>
      <div className={cx(float, 'bottom-[26px] right-0')} style={{ animationDelay: '1.1s, -3.5s' }}>
        <span className="grid size-[34px] place-items-center rounded-[11px] bg-up/16 text-up">{Icon.mail(16)}</span>
        <div><strong className={floatTitle}>Delivered to your email</strong><small className="text-xs text-gc-muted">Code saved in History</small></div>
      </div>
    </div>
  );
}

const heroIn = 'revealed:animate-[rise_0.8s_var(--ease-soft)_backwards]';

function Hero() {
  return (
    <section className="reveal-scope relative overflow-hidden pb-[112px] pt-[88px] text-gc-text max-sm:pb-10 max-sm:pt-14">
      <div
        aria-hidden="true"
        className={cx(
          'absolute inset-0',
          '[background:radial-gradient(640px_420px_at_78%_38%,rgba(61,110,240,0.32),transparent_70%),radial-gradient(420px_320px_at_8%_0%,rgba(123,92,255,0.18),transparent_70%),radial-gradient(900px_520px_at_60%_-20%,#1f2a52,transparent_70%),var(--page)]',
          'light:[background:radial-gradient(640px_420px_at_78%_38%,rgba(143,169,255,0.55),transparent_70%),radial-gradient(420px_320px_at_8%_0%,rgba(191,205,255,0.7),transparent_70%),linear-gradient(180deg,#eff1ff,var(--page))]',
          "after:absolute after:inset-0 after:bg-[linear-gradient(rgba(143,176,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(143,176,255,0.06)_1px,transparent_1px)] after:bg-size-[56px_56px] after:content-[''] after:[mask-image:radial-gradient(circle_at_72%_40%,#000,transparent_62%)]",
          'light:after:bg-[linear-gradient(rgba(54,73,207,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(54,73,207,0.07)_1px,transparent_1px)]',
        )}
      />
      <div className="site-container relative grid grid-cols-[minmax(0,1fr)_minmax(0,560px)] items-center gap-10 max-lg:grid-cols-1 max-lg:gap-12">
        <div className="flex flex-col items-start">
          <span className={cx('inline-flex items-center gap-2 rounded-full border border-gc-accent/35 bg-gc-accent/10 px-3.5 py-[7px] text-sm font-medium text-gc-accent dark:text-accent-blue', heroIn)}>
            <span className="size-[7px] rounded-full bg-current shadow-[0_0_0_4px_color-mix(in_srgb,currentColor_22%,transparent)]" />
            Mybitstore Gift Cards
          </span>
          <h1 className={cx('mt-[22px] max-w-[620px] text-[68px] font-semibold leading-[1.02] tracking-[-3.4px] max-lg:text-[56px] max-sm:text-[42px] max-sm:tracking-[-1.8px]', heroIn)} style={{ animationDelay: '0.08s' }}>
            Buy Gift Cards. Simple, Fast,  <span className="text-tab-active">Secure.</span>
          </h1>
          <p className={cx('mt-5 max-w-[540px] font-nunito text-[21px] leading-[1.45] text-gc-muted dark:text-[#c2c4cc] max-sm:text-lg', heroIn)} style={{ animationDelay: '0.16s' }}>
            Find a popular brand, pay with crypto or a payment account, and receive your gift card by email.
          </p>
          <div className={cx('mt-[34px] flex items-center gap-[17px] max-sm:flex-wrap', heroIn)} style={{ animationDelay: '0.24s' }}>
            <a className={btn.heroPrimary} href={links.trade}>
              Buy Gift Cards
              <img src={arrowRight} alt="" width="22" height="22" className={btnArrow} />
            </a>
            <DownloadButton />
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

/* ---------- Finder: search, popular searches, categories ---------- */

const CATEGORY_ICONS = {
  Shopping: <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8ZM9 8V6.5a3 3 0 0 1 6 0V8" />,
  Gaming: <path d="M7 9h10a4 4 0 0 1 3.9 4.8l-.6 3a2.2 2.2 0 0 1-3.8 1L14.6 16H9.4l-1.9 1.8a2.2 2.2 0 0 1-3.8-1l-.6-3A4 4 0 0 1 7 9ZM8 11.5v3M6.5 13h3M15.5 12.5h.01M17.5 14h.01" />,
  Entertainment: <><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" /></>,
  Software: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" /></>,
  'Payment Cards': <><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M3 10h18M7 14.5h3" /></>,
  Travel: <path d="M10.5 13.5 4 11l1.5-1.5 7 1 3.6-3.6a1.8 1.8 0 0 1 2.5 2.5L15 13l1 7-1.5 1.5-2.5-6.5-3 3v2l-1.2 1.2-1.3-3.2L3.3 17l1.2-1.2h2l3-3Z" />,
};
const CategoryIcon = ({ name, size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...stroke}>{CATEGORY_ICONS[name]}</svg>
);
const POPULAR_TONES = ['violet', 'teal', 'blue', 'rose', 'amber', 'rose'];

// Cycles the search placeholder through the popular brands, like a live search hint
function useRotatingHint(items, ms = 2400) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), ms);
    return () => clearInterval(t);
  }, [items, ms]);
  return items[i];
}

function FinderHead({ title, note }) {
  return (
    <div className="mb-3.5 flex items-baseline justify-between gap-3">
      <strong className="text-[15px] font-semibold text-gc-text">{title}</strong>
      {note && <span className="text-[12.5px] text-gc-muted max-sm:hidden">{note}</span>}
    </div>
  );
}

function Finder({ onPick }) {
  const hint = useRotatingHint(POPULAR.map(([name]) => name));
  return (
    <section className="relative z-3 -mt-10 max-sm:mt-0" aria-label="Find a gift card">
      <div className="site-container">
        <div className="reveal rounded-[28px] border border-gc-line bg-gc-glass p-7 shadow-[0_40px_80px_-40px_rgba(5,10,30,0.7)] backdrop-blur-[18px] light:shadow-[0_30px_70px_-36px_rgba(36,54,140,0.35)] max-sm:rounded-[22px] max-sm:p-4">
          <button
            type="button"
            onClick={() => onPick(hint, POPULAR.find(([n]) => n === hint)[1])}
            className="group/search flex h-16 w-full items-center gap-3.5 rounded-[18px] border border-gc-line bg-gc-panel pl-[22px] pr-2 text-left transition-[border-color,box-shadow] duration-200 hover:border-gc-accent hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--gc-accent)_14%,transparent)] max-sm:h-14 max-sm:pl-4"
          >
            <span className="inline-flex text-gc-accent dark:text-accent-blue">{Icon.search(20)}</span>
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-lg text-gc-muted max-sm:text-[15px]">
              Search gift cards like{' '}
              <b
                key={hint}
                className="inline-block animate-[gc-hint_0.5s_var(--ease-soft)] font-semibold text-gc-text after:ml-[3px] after:inline-block after:h-[1.05em] after:w-0.5 after:animate-[gc-blink_1s_steps(1)_infinite] after:bg-tab-active after:align-[-3px] after:content-['']"
              >
                {hint}
              </b>
            </span>
            <span className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-strong px-5 text-base font-medium text-white transition-colors duration-200 group-hover/search:bg-brand-hover max-sm:w-11 max-sm:justify-center max-sm:px-0 max-sm:text-[0px]">
              Search <img src={arrowRight} alt="" width="18" height="18" />
            </span>
          </button>

          <div className="mt-[26px] grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-7 max-lg:grid-cols-1">
            <div>
              <FinderHead title="Popular searches" note="Brands and stock vary by country" />
              <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-2">
                {POPULAR.map(([name, cat], i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onPick(name, cat)}
                    style={stagger(i)}
                    className={cx(
                      'group/pop relative flex items-center gap-3 rounded-2xl border border-gc-line bg-gc-panel px-3 py-2.5 text-left transition-[translate,border-color,box-shadow] duration-[250ms] ease-soft hover:-translate-y-0.5 hover:border-gc-accent/55 hover:shadow-[0_16px_30px_-20px_color-mix(in_srgb,var(--gc-accent)_70%,transparent)]',
                      rise(),
                    )}
                  >
                    <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-[250ms] ease-soft group-hover/pop:-rotate-6 group-hover/pop:scale-106', TONE[POPULAR_TONES[i]])}>
                      <CategoryIcon name={cat} size={18} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <strong className="truncate text-[15px] font-semibold leading-[1.3] text-gc-text">{name}</strong>
                      <small className="text-[12.5px] text-gc-muted">{cat}</small>
                    </span>
                    <span className="text-sm text-gc-muted opacity-0 transition-[opacity,transform,color] duration-[250ms] ease-soft [transform:translate(-4px,4px)] group-hover/pop:text-gc-accent group-hover/pop:opacity-100 group-hover/pop:[transform:none]">↗</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-l border-gc-line pl-7 max-lg:border-l-0 max-lg:border-t max-lg:pl-0 max-lg:pt-6">
              <FinderHead title="Browse by category" />
              <div className="grid grid-cols-3 gap-2.5">
                {CATEGORIES.slice(1).map((cat, i) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onPick('', cat)}
                    style={stagger(i)}
                    className={cx(
                      'group/cat flex flex-col items-start gap-2.5 rounded-2xl border border-transparent bg-gc-panel-2 px-3.5 py-3 text-left text-sm font-medium text-gc-text transition-[background-color,border-color,color] duration-200 hover:border-gc-accent/40 hover:bg-[color-mix(in_srgb,var(--gc-accent)_10%,var(--gc-panel-2))]',
                      rise(),
                    )}
                  >
                    <CategoryIcon
                      name={cat}
                      size={20}
                      className="text-gc-muted transition-[color,translate] duration-[250ms] ease-soft group-hover/cat:-translate-y-0.5 group-hover/cat:text-gc-accent dark:group-hover/cat:text-accent-blue"
                    />
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Phone screens (illustrative) ---------- */

const ph = {
  panel: 'rounded-xl border border-gc-screen-line bg-gc-screen-2 p-3',
  rowBetween: 'flex items-center justify-between gap-2.5',
  btn: 'mt-auto inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-tab-active text-[13px] font-semibold text-white shadow-[0_10px_22px_-12px_var(--color-tab-active)]',
  hint: 'text-[11px] leading-[1.45] text-gc-screen-muted',
  tile: 'grid size-[34px] shrink-0 place-items-center rounded-[10px] text-sm font-bold text-white',
  caret: 'inline-block -ml-1.5 h-3.5 w-[1.5px] animate-[gc-blink_1s_steps(1)_infinite] bg-tab-active',
  stock: 'bg-up/12 text-up',
  muted: 'text-gc-screen-muted',
};
const Spacer = () => <span className="flex-1" />;

function ScreenBar({ title, right }) {
  return (
    <div className="grid h-8 grid-cols-[28px_1fr_28px] items-center">
      <span className="grid size-[26px] place-items-center rounded-full bg-gc-screen-2 text-base leading-none text-gc-screen-muted">‹</span>
      <strong className="text-center text-sm font-semibold">{title}</strong>
      <span className="justify-self-end">{right}</span>
    </div>
  );
}

function DiscoverScreen({ query, category }) {
  const rows = SAMPLE_CARDS.filter((c) => category === 'All' || c.cat === category);
  return (
    <>
      <ScreenBar
        title="Gift Cards"
        right={
          <span className="relative grid size-7 place-items-center rounded-full bg-tab-active text-white">
            {Icon.cart(13)}
            <i className="absolute -right-[3px] -top-[3px] grid size-3.5 place-items-center rounded-full bg-white text-[9px] font-bold not-italic text-tab-active">1</i>
          </span>
        }
      />
      <div className="flex items-center gap-3.5 text-[12.5px] text-gc-screen-muted">
        <span className="relative font-semibold text-gc-screen-text after:absolute after:inset-x-0 after:-bottom-[5px] after:h-0.5 after:rounded-[2px] after:bg-tab-active after:content-['']">Buy Card</span>
        <span>Categories</span>
        <em className="ml-auto rounded-full bg-gc-screen-2 px-2 py-[3px] text-[10.5px] not-italic">Select Country ▾</em>
      </div>
      <div className={cx('flex h-9 items-center gap-2 rounded-[10px] border bg-gc-screen-2 px-3', query ? 'border-tab-active text-gc-screen-text' : 'border-gc-screen-line text-gc-screen-muted')}>
        {Icon.search(13)}
        <span className={query ? 'animate-[gc-type_0.9s_steps(14)_backwards] overflow-hidden whitespace-nowrap' : undefined}>{query || 'Search giftcard, brands…'}</span>
        {query && <i className={ph.caret} />}
      </div>
      <div className="flex gap-1.5 overflow-hidden">
        {CATEGORIES.slice(0, 5).map((c) => (
          <span
            key={c}
            className={cx('shrink-0 rounded-full px-2.5 py-1 text-[11px]', c === category ? 'bg-tab-active/18 font-semibold text-tab-active dark:text-accent-blue' : ph.muted)}
          >
            {c}
          </span>
        ))}
      </div>
      <ul className="flex flex-col overflow-hidden">
        {rows.map((c, i) => (
          <li key={c.name} style={stagger(i)} className="flex animate-[gc-screen-in_0.45s_var(--ease-soft)_backwards] items-center gap-2.5 border-b border-gc-screen-line py-[9px]">
            <span className={cx(ph.tile, TONE[c.tone])}>{c.name[0]}</span>
            <div className="flex min-w-0 flex-1 flex-col">
              <strong className="text-[12.5px] font-semibold">{c.name}</strong>
              <small className={cx('text-[11px]', ph.muted)}>{c.range}</small>
              <span className="mt-[3px] flex gap-[5px]">
                <b className="rounded bg-gc-screen-2 px-1.5 py-px text-[9.5px] font-medium text-gc-screen-muted">{c.cat}</b>
                <b className={cx('rounded px-1.5 py-px text-[9.5px] font-medium', ph.stock)}>● In stock</b>
              </span>
            </div>
            <span className="grid size-7 place-items-center rounded-lg bg-gc-screen-2 text-gc-screen-muted">{Icon.cart(13)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function SelectScreen() {
  return (
    <>
      <ScreenBar title="Gaming card" />
      <GiftCard tone="violet" label="Gaming" size="phone" />
      <div className={ph.rowBetween}>
        <strong className="text-[13px] font-semibold">Choose amount</strong>
        <span className={cx('rounded-full px-2 py-0.5 text-[10.5px] font-semibold', ph.stock)}>● In stock</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['$10', '$25', '$50', '$100'].map((d) => (
          <span
            key={d}
            className={cx(
              'grid h-[38px] place-items-center rounded-[10px] border text-[13px] font-semibold',
              d === '$25'
                ? 'border-tab-active bg-[color-mix(in_srgb,var(--color-tab-active)_14%,var(--gc-screen-2))] text-tab-active dark:text-white'
                : 'border-gc-screen-line bg-gc-screen-2',
            )}
          >
            {d}
          </span>
        ))}
      </div>
      <div className={cx(ph.rowBetween, 'rounded-[10px] bg-gc-screen-2 px-3 py-2.5 text-gc-screen-muted')}>
        <span>Quantity</span>
        <span className="inline-flex items-center gap-3 font-semibold text-gc-screen-text">
          <b className="grid size-[22px] place-items-center rounded-md bg-gc-screen font-medium">−</b>1<b className="grid size-[22px] place-items-center rounded-md bg-gc-screen font-medium">+</b>
        </span>
      </div>
      <span className={ph.btn}>{Icon.cart(14)} Add to cart</span>
    </>
  );
}

function PrepareScreen() {
  return (
    <>
      <ScreenBar title="Cart" />
      <div className={cx(ph.panel, 'flex items-center gap-2.5')}>
        <span className={cx(ph.tile, TONE.violet)}>G</span>
        <div className="flex flex-1 flex-col">
          <strong className="text-[12.5px]">Gaming card</strong>
          <small className={cx('[font-size:smaller]', ph.muted)}>$25.00 × 1</small>
        </div>
        <span className="font-semibold">$25.00</span>
      </div>
      <label className="mt-1.5 text-[11.5px] font-semibold text-gc-screen-muted">Recipient email</label>
      <div className="flex h-10 items-center gap-2 rounded-[10px] border border-tab-active bg-gc-screen-2 px-3 text-gc-screen-muted shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-tab-active)_18%,transparent)]">
        {Icon.mail(14)}<span className="text-gc-screen-text">you@email.com</span><i className={ph.caret} />
      </div>
      <p className={ph.hint}>Make sure this email is valid. Your gift card is delivered here.</p>
      <Spacer />
      <span className={ph.btn}>Continue</span>
    </>
  );
}

function PayOption({ icon, title, note, active }) {
  return (
    <div className={cx('flex items-center gap-2.5 rounded-xl border bg-gc-screen-2 p-3', active ? 'border-tab-active' : 'border-gc-screen-line')}>
      <span className={cx('grid size-8 place-items-center rounded-[10px]', active ? 'bg-tab-active/16 text-tab-active' : 'bg-gc-screen text-gc-screen-muted')}>{icon}</span>
      <div className="flex flex-1 flex-col">
        <strong className="text-[12.5px]">{title}</strong>
        <small className={cx('text-[11px]', ph.muted)}>{note}</small>
      </div>
      <span className={cx('size-4 rounded-full', active ? 'border-[5px] border-tab-active' : 'border-[1.5px] border-gc-screen-line')} />
    </div>
  );
}

function PayScreen() {
  return (
    <>
      <ScreenBar title="Payment method" />
      <PayOption icon={Icon.bank(16)} title="Payment account" note="Bank, mobile money, or card" />
      <PayOption icon={Icon.wallet(16)} title="Crypto" note="Pay from your Mybitstore wallet" active />
      <div className="flex gap-1.5">
        {[['USDT', coinUsdt], ['BTC', coinBtc], ['ETH', coinEth]].map(([sym, src], i) => (
          <span key={sym} className={cx('inline-flex items-center gap-1.5 rounded-full border py-1.5 pl-1.5 pr-2.5 text-[11.5px] font-semibold', i === 0 ? 'border-tab-active bg-tab-active/12' : 'border-gc-screen-line')}>
            <img src={src} alt="" className="size-[18px]" />{sym}
          </span>
        ))}
      </div>
      <Spacer />
      <span className={ph.btn}>Continue to preview</span>
    </>
  );
}

function ConfirmScreen() {
  const rows = [['Gift card', 'Gaming card'], ['Amount', '$25.00'], ['Quantity', '1'], ['Deliver to', 'you@email.com'], ['Pay with', 'USDT']];
  return (
    <>
      <ScreenBar title="Checkout preview" />
      <div className={cx(ph.panel, 'flex flex-col gap-[11px]')}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2.5"><span className={ph.muted}>{k}</span><strong className="font-semibold">{v}</strong></div>
        ))}
        <div className="flex justify-between gap-2.5 border-t border-dashed border-gc-screen-line pt-[11px] text-sm">
          <span className="text-gc-screen-text">Total</span><strong className="font-semibold">$25.00</strong>
        </div>
      </div>
      <p className={ph.hint}>Check the details before you confirm. Your card is sent to the email above.</p>
      <Spacer />
      <span className={ph.btn}>Confirm purchase</span>
    </>
  );
}

function ReceiveScreen() {
  return (
    <>
      <div className="flex flex-col items-center gap-1.5 pb-3 pt-[26px] text-center">
        <span className="relative grid size-[78px] place-items-center rounded-full bg-up/14 before:absolute before:-inset-2 before:animate-[gc-ring_2s_ease-out_infinite] before:rounded-full before:border-[1.5px] before:border-up/35 before:content-['']">
          <span className="grid size-[52px] animate-[gc-pop_0.5s_var(--ease-soft)_0.1s_backwards] place-items-center rounded-full bg-up text-white">{Icon.check(26)}</span>
        </span>
        <strong className="mt-2.5 text-base">Purchase confirmed</strong>
        <small className={cx('text-xs leading-[1.45]', ph.muted)}>Your gift card will arrive at<br />you@email.com</small>
      </div>
      <span className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.6px] text-gc-screen-muted">History</span>
      <div className={cx(ph.panel, 'flex animate-[gc-screen-in_0.5s_var(--ease-soft)_0.35s_backwards] flex-col gap-2.5')}>
        <div className={ph.rowBetween}>
          <strong>Gaming card</strong>
          <span className="rounded-full bg-up/14 px-2 py-0.5 text-[10.5px] text-up">Completed</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-dashed border-gc-screen-line px-2.5 py-[9px] font-inter tracking-[1px] text-gc-screen-muted">
          <span>••••-••••-••••</span>
          <b className="inline-flex items-center gap-1 font-euclid text-[11px] font-semibold tracking-[0] text-tab-active">{Icon.eye(12)} Reveal code</b>
        </div>
        <small className={cx('text-[11px]', ph.muted)}>Redemption steps are saved with your card.</small>
      </div>
    </>
  );
}

const STEPS = [
  { key: 'discover', title: 'Discover', copy: 'Pick your country, browse categories, or search a brand like Xbox, Google Play, or Netflix.', Screen: DiscoverScreen },
  { key: 'select', title: 'Select', copy: 'See denominations or ranges and stock status, then add a card to your cart.', Screen: SelectScreen },
  { key: 'prepare', title: 'Prepare', copy: 'Review your cart and enter the email address your card should be delivered to.', Screen: PrepareScreen },
  { key: 'pay', title: 'Pay', copy: 'Use a saved payment account, a one-time method, or crypto from your wallet.', Screen: PayScreen },
  { key: 'confirm', title: 'Confirm', copy: 'Check the checkout preview with every detail in one place, then confirm.', Screen: ConfirmScreen },
  { key: 'receive', title: 'Receive', copy: 'Your card arrives by email, and History keeps the code and redemption steps.', Screen: ReceiveScreen },
];

function Walkthrough({ search }) {
  return (
    <section className="relative bg-page pb-24 pt-[112px] max-sm:pb-[72px] max-sm:pt-[72px]" id="how">
      <div className="site-container">
        <SectionHead
          eyebrow="How buying works"
          title="From brand to inbox in six steps."
          lead="Find a card, check out with the method that suits you, and keep every code in one place."
        />
        <ol className="reveal grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {STEPS.map(({ key, title, copy, Screen }, i) => (
            <li
              key={key}
              style={stagger(i, 100, 80)}
              className={cx(
                'relative flex flex-col overflow-hidden rounded-[28px] border border-card-border bg-card transition-[translate,border-color,box-shadow] duration-300 ease-soft hover:-translate-y-1 hover:border-gc-accent/50 hover:shadow-[0_30px_60px_-36px_rgba(5,10,30,0.6)] light:border-[#e4e8f1] light:bg-white',
                rise('0.7s'),
              )}
            >
              {/* Top of a phone peeking out of the card, faded at the bottom */}
              <div
                aria-hidden="true"
                className="relative h-[330px] overflow-hidden px-[30px] pt-[26px] [background:radial-gradient(260px_200px_at_50%_100%,color-mix(in_srgb,var(--gc-accent)_26%,transparent),transparent_70%),var(--gc-panel-2)] [mask-image:linear-gradient(#000_78%,transparent)]"
              >
                <div className="relative flex h-[520px] flex-col overflow-hidden rounded-[34px_34px_0_0] border-8 border-b-0 border-[#10141f] bg-gc-screen pt-2.5 text-xs leading-[1.35] text-gc-screen-text shadow-[0_20px_50px_-20px_rgba(5,10,30,0.6),0_0_0_1px_rgba(255,255,255,0.08)]">
                  <div
                    key={key === 'discover' ? search.query + search.category : key}
                    className="flex min-h-0 flex-1 animate-[gc-screen-in_0.45s_var(--ease-soft)] flex-col gap-2.5 px-4 pb-[18px] pt-1"
                  >
                    <Screen query={search.query} category={search.category} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3.5 border-t border-gc-line px-6 pb-[26px] pt-[22px]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-tab-active text-sm font-semibold text-white shadow-[0_0_0_5px_color-mix(in_srgb,var(--color-tab-active)_16%,transparent)]">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold leading-[1.3] text-title">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-[22.5px] text-text-muted">{copy}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="reveal mt-6 text-center text-[13px] text-gc-muted">Illustrative screens. Brands, ranges, and stock vary by country.</p>
      </div>
    </section>
  );
}

/* ---------- Value, FAQ, CTA ---------- */

const VALUES = [
  { icon: Icon.grid(), title: 'Brand-first discovery', copy: 'Browse by country and category, or search the brand you already have in mind.' },
  { icon: Icon.wallet(22), title: 'Pay your way', copy: 'Check out with a saved payment account, a one-time method, or crypto from your wallet.' },
  { icon: Icon.history(), title: 'Every code, kept safe', copy: 'Cards arrive by email, and History keeps codes and redemption guidance for later.' },
];

function Values() {
  return (
    <section className={section.alt}>
      <div className="site-container">
        <SectionHead eyebrow="Why gift cards on Mybitstore" title="Crypto that works in everyday places." />
        <div className="reveal grid grid-cols-3 gap-6 max-lg:grid-cols-1">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              style={stagger(i, 100, 80)}
              className={cx(
                'relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-card-border bg-card px-7 py-8 transition-[translate,border-color] duration-300 ease-soft hover:-translate-y-1 hover:border-gc-accent/50',
                "after:absolute after:-right-[60px] after:-top-[60px] after:size-[180px] after:rounded-full after:bg-[radial-gradient(circle,color-mix(in_srgb,var(--gc-accent)_22%,transparent),transparent_70%)] after:opacity-0 after:transition-opacity after:duration-[400ms] after:content-[''] hover:after:opacity-100",
                rise('0.7s'),
              )}
            >
              <span className="mb-2 grid size-[52px] place-items-center rounded-2xl bg-gc-accent/16 text-accent-blue light:bg-[#eaf0ff] light:text-brand">{v.icon}</span>
              <h3 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.3px] text-title">{v.title}</h3>
              <p className="text-base leading-6 text-text-muted">{v.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials (real reviews only; see testimonials.js) ---------- */

const AVATAR_TONES = ['blue', 'violet', 'teal', 'rose', 'amber'];
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

function Stars({ rating }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={n <= rating ? 'fill-[#f5b301]' : 'fill-gc-line'}>
          <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />
        </svg>
      ))}
    </span>
  );
}

function Testimonials() {
  // Samples show while developing locally (or with ?preview=testimonials); the live build stays hidden until real reviews exist
  const preview = import.meta.env.DEV || new URLSearchParams(window.location.search).get('preview') === 'testimonials';
  const items = TESTIMONIALS.length ? TESTIMONIALS : preview ? PREVIEW_TESTIMONIALS : [];
  if (!items.length) return null;

  return (
    <section className={section.base} aria-label="Customer stories">
      <div className="site-container">
        <SectionHead eyebrow="Customer stories" title="Hear it from our customers." lead="What people say about buying gift cards on Mybitstore.">
          {!TESTIMONIALS.length && (
            <span className="mt-5 rounded-full border border-dashed border-[#ff9500]/60 bg-[#ff9500]/10 px-4 py-1.5 text-[13px] font-medium text-[#ee8200] dark:text-[#ffb547]">
              Design preview with sample content. Add real reviews in testimonials.js.
            </span>
          )}
        </SectionHead>
        <ul className="reveal grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {items.map((t, i) => (
            <li
              key={t.name + i}
              style={stagger(i, 100, 80)}
              className={cx(
                'group/quote relative flex flex-col overflow-hidden rounded-3xl border border-card-border bg-card p-7 transition-[translate,border-color,box-shadow] duration-300 ease-soft hover:-translate-y-1 hover:border-gc-accent/50 hover:shadow-[0_30px_60px_-36px_rgba(5,10,30,0.6)] light:border-[#e4e8f1] light:bg-white',
                rise('0.7s'),
              )}
            >
              <figure className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" className="fill-gc-accent/30 transition-colors duration-300 group-hover/quote:fill-gc-accent/50">
                    <path d="M9.6 6C6.5 7.3 4.5 10 4.5 13.6V18h6v-6H7.6c.2-2 1.3-3.5 3.1-4.4L9.6 6Zm9 0c-3.1 1.3-5.1 4-5.1 7.6V18h6v-6h-2.9c.2-2 1.3-3.5 3.1-4.4L18.6 6Z" />
                  </svg>
                  {t.rating && <Stars rating={t.rating} />}
                </div>
                <blockquote className="mt-5 flex-1 text-[17px] leading-[27px] text-title">“{t.quote}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-gc-line pt-5">
                  <span className={cx('grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white', TONE[AVATAR_TONES[i % AVATAR_TONES.length]])}>
                    {initials(t.name)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <strong className="truncate text-[15px] font-semibold text-title">{t.name}</strong>
                    {(t.location || t.date) && (
                      <span className="truncate text-[13px] text-text-muted">{[t.location, t.date].filter(Boolean).join(' · ')}</span>
                    )}
                  </span>
                  {t.source && (
                    <span className="shrink-0 rounded-full border border-gc-line bg-gc-panel-2 px-2.5 py-1 text-[11.5px] font-medium text-gc-muted">{t.source}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const FAQS = [
  { q: 'How do I receive a gift card I buy?', a: 'Your card is delivered to the email address you enter at checkout, so make sure it is valid. You can also find the code and redemption steps in History.' },
  { q: 'How can I pay for a gift card?', a: 'Use a saved payment account, a one-time method, or crypto. You see a full checkout preview before you confirm.' },
  { q: 'Which brands can I buy?', a: 'Brands, denominations, and stock depend on your country. Browse by category or search a brand like Xbox, Google Play, PlayStation, Apple, Steam, or Netflix.' },
  { q: 'Can I buy more than one gift card at once?', a: 'Yes. Add cards to your cart, review everything together, and check out in one go.' },
  { q: 'Where do I find my gift card code later?', a: 'Open History in the app. Your gift card purchases keep their codes and redemption steps, so you can come back to them any time.' },
];

function Cta() {
  return (
    <section className="bg-page py-24 max-sm:py-16">
      <div className="site-container">
        <div className="reveal relative flex items-center justify-between gap-10 overflow-hidden rounded-[32px] px-16 py-14 text-white [background:radial-gradient(500px_360px_at_85%_50%,rgba(143,176,255,0.35),transparent_70%),linear-gradient(120deg,#1a379e,#2f60e0_55%,#3d6ef0)] before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.06)_0_1px,transparent_1px_26px)] before:content-[''] max-lg:flex-col max-lg:items-start max-lg:px-9 max-lg:py-11 max-sm:rounded-3xl max-sm:px-[22px] max-sm:py-8">
          <div className="relative max-w-[560px]">
            <h2 className="text-[44px] font-semibold leading-[1.08] tracking-[-1.4px] max-sm:text-[34px]">Your next gift card is a few taps away.</h2>
            <p className="mt-3.5 font-nunito text-xl leading-[1.4] text-white/80">Open Gift Cards in the Mybitstore app, or scan the code to download it.</p>
            <div className="mt-[30px] flex flex-wrap items-center gap-5">
              <a
                href={links.trade}
                className="group/btn inline-flex h-[60px] items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border border-transparent bg-white px-4 font-euclid text-lg font-medium leading-[normal] text-brand-strong transition-[background-color,border-color,transform] duration-200 hover:bg-[#eef3ff] max-sm:h-[52px] max-sm:text-base"
              >
                Buy Gift Cards
                <img src={arrowRight} alt="" width="22" height="22" className={cx(btnArrow, '[filter:brightness(0)_saturate(100%)_invert(19%)_sepia(83%)_saturate(2700%)_hue-rotate(213deg)]')} />
              </a>
              <StoreBadges />
            </div>
          </div>
          <div className="relative flex flex-col items-center gap-3 rounded-3xl border border-white/25 bg-white/12 p-5 text-sm backdrop-blur-[10px]">
            <QrCard />
            <span>Scan to download</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GiftCards() {
  useReveal();
  const [search, setSearch] = useState({ query: '', category: 'All' });

  const pickSearch = (query, category) => {
    setSearch({ query, category });
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="top" className="bg-page">
      <Header />
      <main>
        <Hero />
        <Finder onPick={pickSearch} />
        <Walkthrough search={search} />
        <Values />
        <Testimonials />
        <FaqSection
          alt
          eyebrow="Gift card FAQ"
          title="Good questions, clear answers."
          lead={<>Need more help? Visit our <a className={text.inlineLink} href={links.support}>Help Center</a>.</>}
          items={FAQS}
        />
        <Cta />
      </main>
      <Footer showVersionSwitch={false} />
    </div>
  );
}
