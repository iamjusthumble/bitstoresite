import React, { useEffect, useRef, useState } from 'react';
import { formatPrice, useMarketData } from '../marketData.js';
import { cx } from '../ui.js';
import AreaChart from './AreaChart.jsx';
import { HOLDINGS } from './demoData.js';
import { Money, useStored } from './format.jsx';
import { ChevronDown, ChevronRight, Star } from './icons.jsx';
import { Change, TokenSwitcher, WALLETS, card, cardTitle, pillPrimary, skeleton, tradeHref } from './parts.jsx';
import { RANGES, useTokenAbout, useTokenChart } from './tokenData.js';

const panel = 'rounded-xl border border-wa-line bg-wa-pill/45 p-6 max-sm:p-4';
const segment =
  'h-8 flex-1 rounded-lg px-3 text-[15px] font-semibold leading-6 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-selected:bg-wa-inset aria-selected:text-wa-text aria-selected:shadow-[0_1px_2px_rgba(10,16,36,0.16)] aria-pressed:bg-wa-inset aria-pressed:text-wa-text aria-pressed:shadow-[0_1px_2px_rgba(10,16,36,0.16)]';

const wholeDollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Stat({ label, children, className }) {
  return (
    <div className={cx('min-w-0', className)}>
      <dt className="text-sm font-semibold leading-5 text-wa-muted">{label}</dt>
      <dd className="mt-3 truncate text-2xl font-semibold leading-8 text-wa-text tabular-nums max-sm:mt-1.5 max-sm:text-[15px] max-sm:leading-6">{children}</dd>
    </div>
  );
}

function About({ coin }) {
  const [about] = useTokenAbout(coin.id);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const text = useRef(null);

  // Only offer "View more" when the clamped text is actually cut off
  useEffect(() => {
    const el = text.current;
    if (!el || expanded) return undefined;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [about, expanded]);

  if (about.status === 'error' || (about.status === 'ready' && !about.data.length)) return null;

  return (
    <section className={panel} aria-labelledby="wa-about">
      <h2 id="wa-about" className={cardTitle}>About {coin.name}</h2>
      {about.status === 'loading' ? (
        <div className="mt-5 grid gap-3" aria-busy="true">
          <span className={cx(skeleton, 'w-full')} />
          <span className={cx(skeleton, 'w-full')} />
          <span className={cx(skeleton, 'w-2/3')} />
        </div>
      ) : (
        <>
          <div id="wa-about-text" ref={text} className={cx('mt-4 text-[15px] leading-[1.55] text-wa-muted', expanded ? 'grid gap-3' : 'line-clamp-4')}>
            {expanded ? about.data.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>) : about.data.join(' ')}
          </div>
          {(overflows || expanded) && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="wa-about-text"
              onClick={() => setExpanded((x) => !x)}
              className="mt-3 inline-flex items-center gap-2 rounded-md text-[15px] font-bold leading-6 text-wa-accent hover:underline"
            >
              {expanded ? 'View less' : 'View more'}
              <ChevronDown size={14} className={cx('transition-transform duration-200', expanded && 'rotate-180')} />
            </button>
          )}
        </>
      )}
    </section>
  );
}

function TradePanel({ coin, initialSide }) {
  const [side, setSide] = useState(initialSide);
  const tabs = [['buy', 'Buy'], ['sell', 'Sell']];
  const held = HOLDINGS.find((h) => h.id === coin.id)?.value || 0;

  const onKey = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = side === 'buy' ? 'sell' : 'buy';
    setSide(next);
    document.getElementById(`wa-side-${next}`)?.focus();
  };

  return (
    <section className={cx(card, 'w-[372px] shrink-0 self-start max-lg:w-full')} aria-label={`Trade ${coin.name}`}>
      <div role="tablist" aria-label="Buy or sell" onKeyDown={onKey} className="flex gap-1 rounded-xl bg-wa-pill p-1">
        {tabs.map(([key, label]) => (
          <button key={key} id={`wa-side-${key}`} type="button" role="tab" aria-selected={side === key} aria-controls="wa-side-panel" tabIndex={side === key ? 0 : -1} onClick={() => setSide(key)} className={segment}>
            {label}
          </button>
        ))}
      </div>
      <div id="wa-side-panel" role="tabpanel" aria-labelledby={`wa-side-${side}`}>
        {side === 'buy' ? (
          <>
            <h2 className="mt-6 text-base font-semibold leading-6 text-wa-muted">Choose where your crypto goes</h2>
            <div className="mt-3 grid gap-3">
              {WALLETS.map((wallet) => (
                <a
                  key={wallet.key}
                  href={tradeHref(coin, side, wallet.key)}
                  className="flex min-h-20 items-center gap-3 rounded-2xl border border-wa-line bg-wa-pill/45 p-3 transition-colors duration-150 hover:border-tab-active hover:bg-wa-pill"
                >
                  <span className={cx('grid size-10 shrink-0 place-items-center rounded-[9px]', wallet.tint)}>
                    <img src={wallet.icon} alt="" width="24" height="24" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium leading-5 text-wa-text">{wallet.name}</span>
                    <span className="mt-1 block text-sm leading-[1.2] text-wa-muted">{wallet.buy}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-wa-muted" />
                </a>
              ))}
            </div>
          </>
        ) : (
          // Selling has no wallet to pick: it comes straight out of the balance
          <>
            <h2 className="mt-6 text-base font-semibold leading-6 text-wa-muted">Sell from your balance</h2>
            <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-dashed border-wa-line px-4 py-3 text-sm leading-5 text-wa-muted">
              Available balance
              <span className="text-base font-semibold leading-6 text-wa-text tabular-nums">{formatPrice(held)}</span>
            </p>
            <a href={tradeHref(coin, 'sell')} className={cx(pillPrimary, 'mt-4 w-full')}>Sell {coin.symbol}</a>
          </>
        )}
      </div>
    </section>
  );
}

export default function Token({ coin, side }) {
  const { status, coins } = useMarketData();
  const [range, setRange] = useState(RANGES[0]);
  const [chart, retryChart] = useTokenChart(coin.id, range);
  const [favourites, setFavourites] = useStored('wa-favourites', []);
  const live = coins[coin.id];
  const starred = favourites.includes(coin.id);
  // The 24h figure arrives with the price; longer ranges come from the chart itself
  const change = chart.status === 'ready' ? chart.data.change : range.days === 1 ? live?.change : undefined;

  return (
    <div className="flex items-start gap-4 max-lg:flex-col">
      <div className={cx(card, 'grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-6 max-lg:w-full')}>
        <section aria-labelledby="wa-token">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <img src={coin.icon} alt="" width="24" height="24" className="size-6 shrink-0" />
                <h2 id="wa-token" className="text-xl font-semibold leading-8 text-wa-text">
                  {coin.name} <span className="ml-1 text-wa-muted">{coin.symbol}</span>
                </h2>
                <TokenSwitcher current={coin} />
                <button
                  type="button"
                  aria-pressed={starred}
                  aria-label={`Favourite ${coin.name}`}
                  onClick={() => setFavourites((list) => (starred ? list.filter((x) => x !== coin.id) : [...list, coin.id]))}
                  className={cx('grid size-7 place-items-center rounded-full hover:bg-wa-pill', starred ? 'text-[#f5b331] *:fill-current' : 'text-wa-muted hover:text-wa-text')}
                >
                  <Star size={18} />
                </button>
              </div>
              <p className="mt-1 text-5xl font-semibold leading-[56px] tracking-[-1px] text-wa-text max-sm:text-[40px] max-sm:leading-[48px]" aria-live="polite">
                {live ? <Money value={live.price} /> : status === 'error' ? <span className="text-wa-muted">—</span> : <span className={cx(skeleton, 'h-9 w-48 align-middle')} />}
              </p>
              <p className="mt-1 flex h-6 items-center gap-2">
                {change !== undefined && <Change value={change} className="text-sm leading-6" />}
                <span className="text-sm leading-6 text-wa-muted">{range.label}</span>
              </p>
            </div>
            <div role="group" aria-label="Chart range" className="flex w-[220px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:w-full">
              {RANGES.map((option) => (
                <button key={option.key} type="button" aria-pressed={option.key === range.key} aria-label={`Show the ${option.label}`} onClick={() => setRange(option)} className={segment}>
                  {option.key}
                </button>
              ))}
            </div>
          </div>

          {chart.status === 'ready' && <AreaChart key={`${coin.id}-${range.key}`} series={chart.data} smooth={false} label={`${coin.name} price, ${range.label}`} />}
          {chart.status === 'loading' && (
            <div className="mt-6 h-[226px] rounded-lg bg-[linear-gradient(90deg,var(--placeholder),var(--placeholder-2),var(--placeholder))] bg-size-[200%_100%] opacity-50 animate-[shimmer_1.2s_linear_infinite] max-sm:h-[186px]" aria-busy="true" aria-label="Loading price history" />
          )}
          {chart.status === 'error' && (
            <div className="mt-6 grid h-[226px] place-content-center justify-items-center gap-3 rounded-lg border border-dashed border-wa-line text-center max-sm:h-[186px]">
              <p className="text-[15px] leading-6 text-wa-muted">Price history is unavailable right now.</p>
              <button type="button" onClick={retryChart} className="inline-flex h-9 items-center rounded-full bg-wa-pill px-5 text-sm font-bold leading-5 text-wa-text hover:bg-wa-pill-hover">Try again</button>
            </div>
          )}
        </section>

        <section className={panel} aria-labelledby="wa-stats">
          <h2 id="wa-stats" className={cardTitle}>Stats</h2>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 max-sm:gap-y-4">
            <Stat label="Market cap" className="max-sm:col-span-2">{live ? wholeDollars.format(live.marketCap) : '—'}</Stat>
            <Stat label="Volume (24h)" className="max-sm:col-span-2">{live ? wholeDollars.format(live.volume) : '—'}</Stat>
            <Stat label="24h high">{live ? formatPrice(live.high) : '—'}</Stat>
            <Stat label="24h low">{live ? formatPrice(live.low) : '—'}</Stat>
          </dl>
        </section>

        <About key={coin.id} coin={coin} />
        <p className="-mt-2 text-xs leading-4 text-wa-muted">
          Prices, stats and descriptions from <a className="underline underline-offset-2 hover:text-wa-text" href="https://www.coingecko.com" target="_blank" rel="noreferrer">CoinGecko</a>.
        </p>
      </div>

      <TradePanel key={`${coin.id}-${side}`} coin={coin} initialSide={side} />
    </div>
  );
}
