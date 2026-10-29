import React, { useEffect, useMemo, useState } from 'react';
import { cx } from '../../ui.js';
import { Modal, bigPrimary, chip, field, sideTab } from '../flow.jsx';
import { ChevronRight, Search, Shield } from '../icons.jsx';
import { cardTitle } from '../parts.jsx';
import { CATEGORIES, COUNTRIES, brandById, bestRate, buyBrandsIn, categoryName, countryPaused, face, fromPrice, gcHref, ghs, ghsRate, sellBrandsIn, sellRate } from './catalog.js';
import { CountryButton, CountryGate, Flag } from './country.jsx';
import { freshDraft } from './Sell.jsx';
import { TRADE_STATUS, cartCount, orderStatus, useCart, useCountry, useDraft, useOrders, useTab, useTrades } from './store.js';
import { CardArt, StatusPill, timeAgo, toast } from './ui.jsx';

// Whole cedis read faster on a tile: "GH₵ 126"
export const ghsShort = (v) => (Number.isInteger(Math.round(v * 100) / 100) ? `GH₵ ${new Intl.NumberFormat('en-US').format(v)}` : ghs(v));

export const CartIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </svg>
);

export function CartButton() {
  const [items] = useCart();
  const count = cartCount(items);
  return (
    <a href={gcHref('checkout')} aria-label={`Cart, ${count} ${count === 1 ? 'card' : 'cards'}`} className="relative grid size-11 shrink-0 place-items-center rounded-full text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text">
      <CartIcon />
      {count > 0 && <span key={count} className="absolute right-0 top-0 grid h-5 min-w-5 animate-[gc-pop_0.2s_ease-out] place-items-center rounded-full bg-tab-active px-1 text-[11px] font-bold leading-none text-white tabular-nums">{count}</span>}
    </a>
  );
}

export function HubBar({ tab }) {
  const [orders] = useOrders();
  // A dot when a bought code hasn't been looked at yet
  const unseen = orders.some((o) => o.items.some((i) => !i.gift && orderStatus(o, i) === 'delivered' && i.codes.some((c) => !c.revealed)));
  return (
    <div className="flex items-center justify-between gap-3">
      <nav aria-label="Buy or sell gift cards" className="flex w-[240px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:flex-1">
        <a href={gcHref('buy')} aria-current={tab === 'buy' ? 'page' : undefined} className={sideTab}>Buy</a>
        <a href={gcHref('sell')} aria-current={tab === 'sell' ? 'page' : undefined} className={sideTab}>Sell</a>
      </nav>
      <div className="flex items-center gap-1">
        <CountryButton mode={tab} short className="mr-1" />
        <a href={gcHref('mine')} className="relative inline-flex h-11 items-center rounded-full px-4 text-[15px] font-semibold leading-6 text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text">
          My cards
          {unseen && <span className="absolute right-2 top-2.5 size-2 rounded-full bg-tab-active"><span className="sr-only"> (new code)</span></span>}
        </a>
        <CartButton />
      </div>
    </div>
  );
}

export default function Hub({ tab: asked }) {
  const [stored, setStored] = useTab();
  const tab = asked || stored;
  useEffect(() => {
    if (asked && asked !== stored) setStored(asked);
  }, [asked]); // eslint-disable-line react-hooks/exhaustive-deps

  const [country] = useCountry();

  return (
    <>
      <HubBar tab={tab} />
      <div key={`${tab}-${country}`} className="grid animate-[fade_0.15s_ease-out] grid-cols-[minmax(0,1fr)] gap-10 max-sm:gap-8">
        {!country ? <CountryGate mode={tab} /> : tab === 'sell' ? <SellTab country={country} /> : <BuyTab country={country} />}
      </div>
    </>
  );
}

/* ——— Buy ——— */

function BrandTile({ brand, country }) {
  if (brand.paused) {
    return (
      <div aria-label={`${brand.name}, paused`} title={brand.paused}>
        <CardArt brand={brand} dim radius="rounded-2xl">
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-bold leading-5 text-white">Paused</span>
        </CardArt>
        <p className="mt-3 text-base font-semibold leading-6 text-wa-muted">{brand.name}</p>
        <p className="text-sm leading-5 text-wa-muted">Back soon</p>
      </div>
    );
  }
  return (
    <a href={gcHref('buy', brand.id)} className="group block rounded-2xl">
      <CardArt brand={brand} radius="rounded-2xl" className="transition-[translate,box-shadow] duration-300 ease-(--ease-soft) group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]" />
      <p className="mt-3 text-base font-semibold leading-6 text-wa-text">{brand.name}</p>
      <p className="text-sm leading-5 text-wa-muted tabular-nums">From {ghsShort(fromPrice(brand, country))}</p>
    </a>
  );
}

// Four across at most, so each card can be taken in at a glance
const grid = 'grid grid-cols-4 gap-x-6 gap-y-9 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-6';

function BuyTab({ country }) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const available = buyBrandsIn(country);
  const results = available.filter((b) => (category === 'all' || b.category === category) && (!term || b.name.toLowerCase().includes(term) || categoryName[b.category].toLowerCase().includes(term)))
    .sort((a, b) => Number(Boolean(a.paused)) - Number(Boolean(b.paused)));
  const categories = CATEGORIES.filter(([key]) => key === 'all' || available.some((b) => b.category === key));

  return (
    <>
      <section className="flex items-end justify-between gap-x-10 gap-y-6 pt-2 max-lg:flex-col max-lg:items-stretch" aria-labelledby="wa-gc-buy-hero">
        <div className="min-w-0">
          <h2 id="wa-gc-buy-hero" className="text-[36px] font-semibold leading-[44px] tracking-[-0.8px] text-wa-text max-sm:text-[28px] max-sm:leading-9">Gift cards, paid in cedis.</h2>
          <p className="mt-3 flex items-center gap-2 text-base leading-6 text-wa-muted"><Flag country={country} className="text-lg" />{available.length} cards for {COUNTRIES[country].name}</p>
        </div>
        <label className={cx(field, 'flex h-14 w-[420px] shrink-0 items-center gap-3 border-wa-line px-5 text-wa-muted focus-within:border-tab-active focus-within:text-wa-text max-lg:w-full')}>
          <Search size={20} className="shrink-0" />
          <span className="sr-only">Search brands</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brands" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base leading-6 text-wa-text outline-none placeholder:text-wa-muted" />
        </label>
      </section>

      <div>
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Categories">
          {categories.map(([key, name]) => (
            <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)} className={cx(chip, 'shrink-0')}>{name}</button>
          ))}
        </div>
        <div className="mt-8">
          {results.length ? (
            <div className={grid}>{results.map((b) => <BrandTile key={b.id} brand={b} country={country} />)}</div>
          ) : (
            <p className="py-16 text-center text-base leading-6 text-wa-muted">{term ? `No ${COUNTRIES[country].name} cards match “${query.trim()}”.` : `No ${categoryName[category].toLowerCase()} cards for ${COUNTRIES[country].name} yet.`}</p>
          )}
        </div>
      </div>
    </>
  );
}

/* ——— Sell ——— */

export function RulesDialog({ onClose }) {
  return (
    <Modal labelledBy="wa-gc-rules" onClose={onClose} className="max-w-[480px]">
      <h3 id="wa-gc-rules" className={cx(cardTitle, 'pr-10')}>Selling rules</h3>
      <ul className="mt-6 grid gap-4 text-[15px] leading-6 text-wa-text">
        {['Choose the exact brand, country and value', 'Unused cards only', 'Clear photo, full code visible', 'Rate locks when you submit', 'Payouts go only to accounts in your name'].map((t) => (
          <li key={t} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-tab-active" />{t}</li>
        ))}
      </ul>
      <p className="mt-6 flex gap-3 rounded-2xl bg-wa-warn/10 p-4 text-sm leading-5 text-wa-text">
        <Shield size={20} className="shrink-0 text-wa-warn" />
        No real business asks to be paid in gift cards. If someone did, it’s a scam.
      </p>
      <button type="button" onClick={onClose} className={cx(bigPrimary, 'mt-6 w-full')}>Got it</button>
    </Modal>
  );
}

// Brands buying cards from a country right now
const buyingIn = (country) => sellBrandsIn(country).filter((b) => !b.sell.notBuying && !countryPaused(b, country));

// A one-row calculator across the page: brand, value, what you'd get, and a way straight into the sale
function QuickQuote({ country }) {
  const brands = buyingIn(country);
  const [brandId, setBrandId] = useState(brands.some((b) => b.id === 'apple') ? 'apple' : brands[0].id);
  const [value, setValue] = useState('100');
  const [, setDraft] = useDraft();
  const brand = brandById[brandId];
  const n = Number(value) || 0;
  const sym = COUNTRIES[country].symbol;
  const rate = sellRate(brand, { country, type: brand.sell.types[0], receipt: brand.sell.receipt === 'required' ? 'with' : 'without', value: n || undefined });
  const start = () => {
    // Only carry the value over when it's one the brand buys
    const ok = n && (brand.sell.values ? brand.sell.values.includes(n) : n >= brand.sell.range[0] && n <= brand.sell.range[1]);
    setDraft(freshDraft(brand, { country, value: ok ? n : null }));
    window.location.hash = gcHref('sell', brandId);
  };
  return (
    <section aria-labelledby="wa-gc-qq" className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-8 rounded-3xl border border-wa-line bg-wa-card p-6 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-6 max-sm:p-5">
      <div className="flex min-w-0 items-center gap-5">
        <CardArt brand={brand} className="w-[120px] shrink-0 max-sm:hidden" radius="rounded-xl" />
        <div className="min-w-0 flex-1">
          <h3 id="wa-gc-qq" className="text-sm font-semibold leading-5 text-wa-muted">Check what your card is worth</h3>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_140px] gap-3 max-sm:grid-cols-[minmax(0,1fr)_110px]">
            <label className="sr-only" htmlFor="wa-gc-qq-brand">Card brand</label>
            <select id="wa-gc-qq-brand" value={brandId} onChange={(e) => setBrandId(e.target.value)} className={cx(field, 'h-12 min-w-0 border-wa-line px-4 text-base font-semibold text-wa-text outline-none focus:border-tab-active')}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <label className={cx(field, 'flex h-12 items-center gap-1.5 border-wa-line px-4 focus-within:border-tab-active')}>
              <span className="text-wa-muted" aria-hidden="true">{sym}</span>
              <span className="sr-only">Card value in {COUNTRIES[country].currency}</span>
              <input value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" className="min-w-0 flex-1 bg-transparent text-base font-semibold text-wa-text outline-none tabular-nums" />
            </label>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8 border-l border-wa-line pl-8 max-lg:border-l-0 max-lg:border-t max-lg:pl-0 max-lg:pt-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-4">
        <div className="min-w-[200px]">
          <p className="text-sm leading-5 text-wa-muted">You’d get about</p>
          <p className="text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">{ghs(n * rate)}</p>
          <p className="text-sm leading-5 text-wa-muted tabular-nums">{ghsRate(rate)} per {sym}1</p>
        </div>
        <button type="button" onClick={start} className={cx(bigPrimary, 'shrink-0 px-8')}>Sell this card</button>
      </div>
    </section>
  );
}

function SellTab({ country }) {
  const [draft, setDraft] = useDraft();
  const [trades] = useTrades();
  const [rules, setRules] = useState(false);
  const [category, setCategory] = useState('all');
  const active = trades.filter((t) => ['submitted', 'review', 'extended', 'needs-info', 'approved', 'partial', 'disputed'].includes(t.status)).slice(0, 3);
  const buying = buyingIn(country);
  const sym = COUNTRIES[country].symbol;
  const byRate = useMemo(() => buying.map((b) => ({ brand: b, rate: bestRate(b, country) })).sort((a, b) => b.rate - a.rate), [country]); // eslint-disable-line react-hooks/exhaustive-deps
  const categories = CATEGORIES.filter(([key]) => key === 'all' || buying.some((b) => b.category === key));
  const shown = byRate.filter(({ brand }) => category === 'all' || brand.category === category);

  if (!buying.length) {
    return (
      <section className="py-10 text-center" aria-labelledby="wa-gc-none">
        <Flag country={country} className="text-5xl" />
        <h2 id="wa-gc-none" className="mt-5 text-2xl font-semibold leading-8 text-wa-text">We’re not buying {COUNTRIES[country].name} cards yet</h2>
        <p className="mt-2 text-base leading-6 text-wa-muted">Pick another country, or check back soon.</p>
        <CountryButton mode="sell" className="mt-6" />
      </section>
    );
  }

  const discard = () => {
    const saved = draft;
    setDraft(null);
    toast('Draft discarded', { label: 'Undo', run: () => setDraft(saved) });
  };
  const sell = (brand) => {
    setDraft(freshDraft(brand, { country }));
    window.location.hash = gcHref('sell', brand.id);
  };

  return (
    <>
      <section className="flex items-end justify-between gap-x-10 gap-y-6 pt-2 max-lg:flex-col max-lg:items-stretch" aria-labelledby="wa-gc-sell-hero">
        <div className="min-w-0">
          <h2 id="wa-gc-sell-hero" className="text-[36px] font-semibold leading-[44px] tracking-[-0.8px] text-wa-text max-sm:text-[28px] max-sm:leading-9">Turn gift cards into cash.</h2>
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-base leading-6 text-wa-muted max-sm:flex-col max-sm:items-start">
            <span className="inline-flex items-center gap-2"><Flag country={country} className="text-lg" />Buying {buying.length} {COUNTRIES[country].name} card {buying.length === 1 ? 'brand' : 'brands'}</span>
            <span aria-hidden="true" className="max-sm:hidden">·</span>
            <span>Paid in cedis or USDT</span>
            <span aria-hidden="true" className="max-sm:hidden">·</span>
            <span>Most trades reviewed in minutes</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-x-6 gap-y-3 max-sm:flex-col max-sm:items-stretch">
          <button type="button" onClick={() => setRules(true)} className="text-[15px] font-semibold leading-6 text-wa-muted hover:text-wa-text max-sm:order-2">Selling rules</button>
          <a href={gcHref('sell', 'new')} className={bigPrimary}>Start selling</a>
        </div>
      </section>

      <QuickQuote key={country} country={country} />

      {draft && brandById[draft.brandId] && (
        <a href={gcHref('sell', draft.brandId, draft.step === 'details' ? null : draft.step)} className="flex items-center gap-4 rounded-2xl bg-tab-active/10 p-4 transition-colors duration-150 hover:bg-tab-active/15">
          <CardArt brand={brandById[draft.brandId]} className="w-14 shrink-0" radius="rounded-lg" />
          <span className="min-w-0 flex-1 text-[15px] font-semibold leading-5 text-wa-text">Continue your {brandById[draft.brandId].name} trade</span>
          <button type="button" onClick={(e) => { e.preventDefault(); discard(); }} className="rounded-full px-3 py-1.5 text-sm font-semibold text-wa-muted hover:bg-wa-pill hover:text-wa-text">Discard</button>
          <ChevronRight size={18} className="shrink-0 text-wa-accent" />
        </a>
      )}

      {active.length > 0 && (
        <section aria-labelledby="wa-gc-active">
          <ListHead id="wa-gc-active" title="In progress" href={gcHref('mine', 'sold')} link="All trades" />
          <ul className="mt-4 grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-md:grid-cols-[minmax(0,1fr)]">
            {active.map((t) => (
              <li key={t.id}>
                <a href={gcHref('trade', t.id)} className="flex items-center gap-4 rounded-2xl border border-wa-line p-4 transition-colors duration-150 hover:bg-wa-pill/40">
                  <CardArt brand={brandById[t.brand]} className="w-16 shrink-0" radius="rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold leading-5 text-wa-text">{brandById[t.brand].name} {face(t.country, t.value)}{t.qty > 1 ? ` × ${t.qty}` : ''}</span>
                    <span className="mt-0.5 block truncate text-sm leading-5 text-wa-muted tabular-nums">{ghs(t.expected)} · {timeAgo(t.history[0].at)}</span>
                  </span>
                  <StatusPill tone={TRADE_STATUS[t.status].tone}>{TRADE_STATUS[t.status].label}</StatusPill>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="wa-gc-today">
        <ListHead id="wa-gc-today" title={`Cards we buy from ${COUNTRIES[country].name}`} href={gcHref('rates')} link="All rates" />
        {categories.length > 2 && (
          <div className="scrollbar-none -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Categories">
            {categories.map(([key, name]) => (
              <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)} className={cx(chip, 'shrink-0')}>{name}</button>
            ))}
          </div>
        )}
        <ul className="mt-6 grid grid-cols-4 gap-x-6 gap-y-9 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-6">
          {shown.map(({ brand, rate }, i) => (
            <li key={brand.id}>
              <button type="button" onClick={() => sell(brand)} className="group block w-full text-left">
                <CardArt brand={brand} radius="rounded-2xl" className="transition-[translate,box-shadow] duration-300 ease-(--ease-soft) group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
                  {i === 0 && category === 'all' && <span className="absolute left-3 top-3 rounded-full bg-up px-2.5 py-0.5 text-xs font-bold leading-5 text-white">Best rate</span>}
                </CardArt>
                <span className="mt-3 block text-base font-semibold leading-6 text-wa-text">{brand.name}</span>
                <span className="block text-sm leading-5 text-wa-muted tabular-nums">Up to {ghsRate(rate)} per {sym}1</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {rules && <RulesDialog onClose={() => setRules(false)} />}
    </>
  );
}

function ListHead({ id, title, href, link }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-lg font-semibold leading-7 text-wa-text">{title}</h2>
      <a href={href} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text">{link}<ChevronRight size={16} /></a>
    </div>
  );
}
