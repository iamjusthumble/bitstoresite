import React, { useEffect, useMemo, useState } from 'react';
import { cx } from '../../ui.js';
import { Modal, bigPrimary, chip, field, sideTab } from '../flow.jsx';
import { ChevronRight, Search, Shield } from '../icons.jsx';
import { cardTitle } from '../parts.jsx';
import { BUY_BRANDS, CATEGORIES, SELL_BRANDS, brandById, bestRate, categoryName, face, fromPrice, gcHref, ghs, ghsRate, sellRate } from './catalog.js';
import { freshDraft } from './Sell.jsx';
import { TRADE_STATUS, cartCount, orderStatus, useCart, useDraft, useOrders, useTab, useTrades } from './store.js';
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

  return (
    <>
      <HubBar tab={tab} />
      <div key={tab} className="grid animate-[fade_0.15s_ease-out] grid-cols-[minmax(0,1fr)] gap-10 max-sm:gap-8">{tab === 'sell' ? <SellTab /> : <BuyTab />}</div>
    </>
  );
}

/* ——— Buy ——— */

function BrandTile({ brand }) {
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
      <p className="text-sm leading-5 text-wa-muted tabular-nums">From {ghsShort(fromPrice(brand))}</p>
    </a>
  );
}

// Four across at most, so each card can be taken in at a glance
const grid = 'grid grid-cols-4 gap-x-6 gap-y-9 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-6';

function BuyTab() {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const results = BUY_BRANDS.filter((b) => (category === 'all' || b.category === category) && (!term || b.name.toLowerCase().includes(term) || categoryName[b.category].toLowerCase().includes(term)))
    .sort((a, b) => Number(Boolean(a.paused)) - Number(Boolean(b.paused)));
  const fan = ['netflix', 'playstation', 'apple'].map((id) => brandById[id]);

  return (
    <>
      <section className="relative flex items-center gap-10 pt-2" aria-labelledby="wa-gc-buy-hero">
        <div className="min-w-0 flex-1">
          <h2 id="wa-gc-buy-hero" className="text-[36px] font-semibold leading-[44px] tracking-[-0.8px] text-wa-text max-sm:text-[28px] max-sm:leading-9">Gift cards,<br />paid in cedis.</h2>
          <label className={cx(field, 'mt-7 flex h-14 max-w-[480px] items-center gap-3 border-wa-line px-5 text-wa-muted focus-within:border-tab-active focus-within:text-wa-text')}>
            <Search size={20} className="shrink-0" />
            <span className="sr-only">Search brands</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brands" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base leading-6 text-wa-text outline-none placeholder:text-wa-muted" />
          </label>
        </div>
        <div aria-hidden="true" className="relative h-[200px] w-[380px] shrink-0 max-lg:hidden">
          {fan.map((b, i) => (
            <span key={b.id} className="absolute animate-[gc-deal_0.7s_var(--ease-soft)_backwards]" style={{ left: i * 64, top: 24 - i * 12, rotate: `${-10 + i * 8}deg`, animationDelay: `${i * 90}ms` }}>
              <CardArt brand={b} sheen={i === 2} className="w-[220px]" radius="rounded-2xl" shadow="shadow-[0_24px_48px_-18px_rgba(0,0,0,0.6)]" />
            </span>
          ))}
        </div>
      </section>

      <div>
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Categories">
          {CATEGORIES.map(([key, name]) => (
            <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)} className={cx(chip, 'shrink-0')}>{name}</button>
          ))}
        </div>
        <div className="mt-8">
          {results.length ? (
            <div className={grid}>{results.map((b) => <BrandTile key={b.id} brand={b} />)}</div>
          ) : (
            <p className="py-16 text-center text-base leading-6 text-wa-muted">No brands match “{query.trim()}”.</p>
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

function QuickQuote() {
  const brands = SELL_BRANDS.filter((b) => !b.sell.notBuying);
  const [brandId, setBrandId] = useState('apple');
  const [value, setValue] = useState('100');
  const [, setDraft] = useDraft();
  const brand = brandById[brandId];
  const n = Number(value) || 0;
  const rate = sellRate(brand, { country: 'US', type: brand.sell.types[0], receipt: brand.sell.receipt === 'required' ? 'with' : 'without', value: n || undefined });
  const start = () => {
    // Only carry the value over when it's one the brand buys
    const ok = n && (brand.sell.values ? brand.sell.values.includes(n) : n >= brand.sell.range[0] && n <= brand.sell.range[1]);
    setDraft(freshDraft(brand, { country: 'US', value: ok ? n : null }));
    window.location.hash = gcHref('sell', brandId);
  };
  return (
    <div className="rounded-3xl border border-wa-line bg-wa-card p-6">
      <div className="flex items-center gap-3">
        <CardArt brand={brand} className="w-16 shrink-0" radius="rounded-lg" />
        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_96px] gap-2">
          <label className="sr-only" htmlFor="wa-gc-qq-brand">Card brand</label>
          <select id="wa-gc-qq-brand" value={brandId} onChange={(e) => setBrandId(e.target.value)} className={cx(field, 'h-11 min-w-0 border-wa-line px-3 text-[15px] font-semibold text-wa-text outline-none focus:border-tab-active')}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <label className={cx(field, 'flex h-11 items-center gap-1 border-wa-line px-3 focus-within:border-tab-active')}>
            <span className="text-wa-muted" aria-hidden="true">$</span>
            <span className="sr-only">Card value in US dollars</span>
            <input value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-wa-text outline-none tabular-nums" />
          </label>
        </div>
      </div>
      <p className="mt-6 text-sm leading-5 text-wa-muted">You’d get about</p>
      <p className="text-[34px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">{ghs(n * rate)}</p>
      <p className="mt-1 text-sm leading-5 text-wa-muted tabular-nums">{ghsRate(rate)} per $1</p>
      <button type="button" onClick={start} className={cx(bigPrimary, 'mt-6 w-full')}>Sell this card</button>
    </div>
  );
}

function SellTab() {
  const [draft, setDraft] = useDraft();
  const [trades] = useTrades();
  const [rules, setRules] = useState(false);
  const active = trades.filter((t) => ['submitted', 'review', 'extended', 'needs-info', 'approved', 'partial', 'disputed'].includes(t.status)).slice(0, 3);
  const topRates = useMemo(() => SELL_BRANDS.filter((b) => !b.sell.notBuying).map((b) => ({ brand: b, rate: bestRate(b, 'US') })).sort((a, b) => b.rate - a.rate).slice(0, 4), []);

  const discard = () => {
    const saved = draft;
    setDraft(null);
    toast('Draft discarded', { label: 'Undo', run: () => setDraft(saved) });
  };

  return (
    <>
      <section className="grid grid-cols-[minmax(0,1fr)_400px] items-center gap-12 pt-2 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-8" aria-labelledby="wa-gc-sell-hero">
        <div>
          <h2 id="wa-gc-sell-hero" className="text-[36px] font-semibold leading-[44px] tracking-[-0.8px] text-wa-text max-sm:text-[28px] max-sm:leading-9">Turn gift cards<br />into cash.</h2>
          <p className="mt-3 text-base leading-6 text-wa-muted">Cedis or USDT. Most trades reviewed in minutes.</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={gcHref('sell', 'new')} className={bigPrimary}>Start selling</a>
            <button type="button" onClick={() => setRules(true)} className="text-[15px] font-semibold leading-6 text-wa-muted hover:text-wa-text">Selling rules</button>
          </div>
        </div>
        <QuickQuote />
      </section>

      {draft && brandById[draft.brandId] && (
        <a href={gcHref('sell', draft.brandId, draft.step === 'details' ? null : draft.step)} className="flex items-center gap-4 rounded-2xl bg-tab-active/10 p-4 transition-colors duration-150 hover:bg-tab-active/15">
          <CardArt brand={brandById[draft.brandId]} className="w-14 shrink-0" radius="rounded-lg" />
          <span className="min-w-0 flex-1 text-[15px] font-semibold leading-5 text-wa-text">Continue your {brandById[draft.brandId].name} trade</span>
          <button type="button" onClick={(e) => { e.preventDefault(); discard(); }} className="rounded-full px-3 py-1.5 text-sm font-semibold text-wa-muted hover:bg-wa-pill hover:text-wa-text">Discard</button>
          <ChevronRight size={18} className="shrink-0 text-wa-accent" />
        </a>
      )}

      <div className={cx('grid gap-10', active.length > 0 && 'grid-cols-2 max-lg:grid-cols-[minmax(0,1fr)]')}>
        {active.length > 0 && (
          <section aria-labelledby="wa-gc-active">
            <ListHead id="wa-gc-active" title="In progress" href={gcHref('mine', 'sold')} link="All trades" />
            <ul className="mt-2 divide-y divide-wa-line">
              {active.map((t) => (
                <li key={t.id}>
                  <a href={gcHref('trade', t.id)} className="flex items-center gap-4 py-4 transition-opacity duration-150 hover:opacity-80">
                    <CardArt brand={brandById[t.brand]} className="w-16 shrink-0" radius="rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold leading-5 text-wa-text">{brandById[t.brand].name} {face(t.country, t.value)}{t.qty > 1 ? ` × ${t.qty}` : ''}</span>
                      <span className="mt-0.5 block text-sm leading-5 text-wa-muted tabular-nums">{ghs(t.expected)} · {timeAgo(t.history[0].at)}</span>
                    </span>
                    <StatusPill tone={TRADE_STATUS[t.status].tone}>{TRADE_STATUS[t.status].label}</StatusPill>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section aria-labelledby="wa-gc-today">
          <ListHead id="wa-gc-today" title="Today’s best rates" href={gcHref('rates')} link="All rates" />
          {active.length > 0 ? (
            <ul className="mt-2 divide-y divide-wa-line">
              {topRates.map(({ brand, rate }) => (
                <li key={brand.id}>
                  <a href={gcHref('rates', brand.id)} className="flex items-center gap-4 py-4 transition-opacity duration-150 hover:opacity-80">
                    <CardArt brand={brand} className="w-16 shrink-0" radius="rounded-lg" />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-5 text-wa-text">{brand.name}</span>
                    <span className="text-[15px] font-semibold leading-5 text-wa-text tabular-nums">{ghsRate(rate)}<span className="font-normal text-wa-muted">/$</span></span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-5 grid grid-cols-4 gap-6 max-xl:grid-cols-2">
              {topRates.map(({ brand, rate }) => (
                <li key={brand.id}>
                  <a href={gcHref('rates', brand.id)} className="group block">
                    <CardArt brand={brand} radius="rounded-2xl" className="transition-transform duration-300 group-hover:-translate-y-1" />
                    <p className="mt-3 text-base font-semibold leading-6 text-wa-text">{brand.name}</p>
                    <p className="text-sm leading-5 text-wa-muted tabular-nums">{ghsRate(rate)} per $1</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {rules && <RulesDialog onClose={() => setRules(false)} />}
    </>
  );
}

function ListHead({ id, title, href, link }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-lg font-semibold leading-7 text-wa-text">{title}</h2>
      <a href={href} className="inline-flex items-center gap-1 text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text">{link}<ChevronRight size={16} /></a>
    </div>
  );
}
