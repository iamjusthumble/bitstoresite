import React, { useState } from 'react';
import { COINS, formatPrice, useMarketData } from '../marketData.js';
import Sparkline from '../components/Sparkline.jsx';
import { cx } from '../ui.js';
import AreaChart from './AreaChart.jsx';
import { ACTIVITIES, BALANCE, HOLDINGS, PERIOD_NAMES, balanceSeries } from './demoData.js';
import { Money, useStored } from './format.jsx';
import { Change, CoinLabel, PeriodSelect, card, cardTitle, coinById, pillPrimary, pillQuiet, seeAll, skeleton, tokenHref, tradeHref } from './parts.jsx';
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Deposit, Eye, EyeOff, More, Star, Trade, Withdraw } from './icons.jsx';

function BalanceCard({ hidden, onToggleHidden }) {
  const [period, setPeriod] = useState('All time');
  // One timestamp for the whole visit keeps the curve still between renders
  const [now] = useState(() => Date.now());
  const series = balanceSeries(period, now);

  return (
    <section className={cx(card, 'min-w-0 flex-1')} aria-labelledby="wa-balance">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h2 id="wa-balance" className="text-base leading-6 text-wa-text">Total balance</h2>
            <button
              type="button"
              onClick={onToggleHidden}
              aria-pressed={hidden}
              aria-label="Hide balances"
              className="grid size-7 place-items-center rounded-full text-wa-muted hover:bg-wa-pill hover:text-wa-text"
            >
              {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <p className="text-[64px] font-bold leading-[1.05] tracking-[-2px] text-wa-text max-sm:text-[40px] max-sm:tracking-[-1.2px]">
              <Money value={BALANCE} hidden={hidden} />
            </p>
            <p className="flex items-center gap-2">
              <Change value={series.change} className="text-xl leading-7" />
              <span className="text-sm leading-5 text-wa-muted">{period === 'All time' ? 'all time' : `this ${period.toLowerCase()}`}</span>
            </p>
          </div>
        </div>
        <PeriodSelect options={PERIOD_NAMES} value={period} onChange={setPeriod} />
      </div>
      <AreaChart key={period} series={series} hidden={hidden} />
    </section>
  );
}

const quickAction =
  'flex h-[50px] items-center gap-3 rounded-full bg-wa-pill pl-5 pr-4 text-base font-semibold leading-6 text-wa-muted transition-colors duration-150 hover:bg-wa-pill-hover hover:text-wa-text';

function QuickActions({ onMore }) {
  const actions = [
    [Deposit, 'Deposit', '#deposit'],
    [Trade, 'Buy & sell', '#buy/btc'],
    [Withdraw, 'Withdraw', '#withdraw'],
  ];
  return (
    <section className={cx(card, 'w-[320px] shrink-0 max-md:w-full')} aria-labelledby="wa-actions">
      <h2 id="wa-actions" className={cardTitle}>Quick actions</h2>
      <div className="mt-5 grid gap-2.5 max-md:grid-cols-2 max-sm:grid-cols-1">
        {actions.map(([Icon, label, href]) => (
          <a key={label} href={href} className={quickAction}>
            <Icon />
            <span className="flex-1">{label}</span>
            <ChevronRight size={16} />
          </a>
        ))}
        <button
          type="button"
          aria-haspopup="menu"
          onClick={(e) => onMore(e.currentTarget, 'left')}
          className="flex h-[50px] items-center justify-center gap-2.5 rounded-full border border-tab-active text-base font-bold leading-6 text-wa-accent transition-colors duration-150 hover:bg-tab-active/12"
        >
          <More />
          More
        </button>
      </div>
    </section>
  );
}

function Assets({ hidden }) {
  return (
    <section className={card} aria-labelledby="wa-assets">
      <div className="flex items-center justify-between gap-4">
        <h2 id="wa-assets" className={cardTitle}>My assets</h2>
        <a href="#assets" className={seeAll}>See all <ChevronRight size={14} /></a>
      </div>
      <div className="mt-6" role="table" aria-labelledby="wa-assets">
        <div role="row" className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_168px] gap-3 font-inter text-xs font-medium leading-4 text-wa-muted max-sm:grid-cols-[minmax(0,1fr)_auto]">
          <span role="columnheader">Name</span>
          <span role="columnheader" className="max-sm:text-right">Balance</span>
          <span role="columnheader" className="sr-only">Actions</span>
        </div>
        {HOLDINGS.slice(0, 3).map(({ id, value }) => {
          const coin = coinById[id];
          return (
            <div key={id} role="row" className="mt-4 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_168px] items-center gap-3 max-sm:grid-cols-[minmax(0,1fr)_auto]">
              <span role="cell"><a href={tokenHref(coin)} className="block rounded-lg hover:opacity-80"><CoinLabel coin={coin} /></a></span>
              <span role="cell" className="font-inter text-[15px] font-semibold leading-6 text-wa-text max-sm:text-right"><Money value={value} hidden={hidden} /></span>
              <span role="cell" className="flex gap-2 max-sm:col-span-2">
                <a href={tradeHref(coin)} className={cx(pillPrimary, 'flex-1')} aria-label={`Buy ${coin.name}`}>Buy</a>
                <a href={tradeHref(coin, 'sell')} className={cx(pillQuiet, 'flex-1')} aria-label={`Sell ${coin.name}`}>Sell</a>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const amountFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8, signDisplay: 'always' });

function Activities({ hidden }) {
  return (
    <section className={card} aria-labelledby="wa-activity">
      <div className="flex items-center justify-between gap-4">
        <h2 id="wa-activity" className={cardTitle}>Recent activity</h2>
        <a href="#activity" className={seeAll}>See all <ChevronRight size={14} /></a>
      </div>
      <ul className="mt-6 grid gap-6">
        {ACTIVITIES.map((item) => {
          const incoming = item.amount > 0;
          const done = item.status === 'Completed';
          return (
            <li key={item.id} className="flex items-center gap-4">
              <span className={cx('grid size-10 shrink-0 place-items-center rounded-[10px]', incoming ? 'bg-tab-active/15 text-wa-accent' : 'bg-[#a23bb8]/20 text-[#d77bea] light:text-[#8a2a9e]')}>
                {incoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-6 text-wa-text">{item.type}</span>
                <span className={cx('flex items-center gap-1.5 text-sm font-semibold leading-5', done ? 'text-up' : 'text-wa-warn')}>
                  <span className={cx('size-1.5 rounded-full bg-current', !done && 'animate-[heat_1.6s_ease-in-out_infinite]')} />
                  {item.status}
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[15px] font-semibold leading-6 text-wa-text tabular-nums">
                  {hidden ? '••••' : amountFormat.format(item.amount).replace('-', '−')} {item.symbol}
                </span>
                <span className="block text-sm font-semibold leading-5 text-wa-muted tabular-nums">{hidden ? '••••••' : formatPrice(item.usd)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const TOKEN_TABS = ['All', 'Favourites', 'Gainers', 'Losers', 'Popular'];
const PREVIEW_ROWS = 5;

function tokenRows(tab, coins, favourites) {
  const loaded = COINS.filter((c) => coins[c.id]);
  if (tab === 'Favourites') return COINS.filter((c) => favourites.includes(c.id));
  if (tab === 'Gainers') return loaded.filter((c) => coins[c.id].change > 0).sort((a, b) => coins[b.id].change - coins[a.id].change);
  if (tab === 'Losers') return loaded.filter((c) => coins[c.id].change < 0).sort((a, b) => coins[a.id].change - coins[b.id].change);
  if (tab === 'Popular') return loaded.sort((a, b) => coins[b.id].volume - coins[a.id].volume);
  return COINS;
}

const EMPTY = {
  Favourites: 'No favourites yet. Star a token to keep it here.',
  Gainers: 'No tokens are up over the last 24 hours.',
  Losers: 'No tokens are down over the last 24 hours.',
};

function TopTokens() {
  const { status, coins } = useMarketData();
  const [tab, setTab] = useState('All');
  const [favourites, setFavourites] = useStored('wa-favourites', []);
  const [expanded, setExpanded] = useState(false);

  const needsPrices = tab !== 'All' && tab !== 'Favourites';
  const matches = tokenRows(tab, coins, favourites);
  const rows = expanded ? matches : matches.slice(0, PREVIEW_ROWS);
  const loading = status === 'loading' && needsPrices;

  const toggleFavourite = (id) => setFavourites((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  // Left and right arrows move between tabs, as in a native tab list
  const onTabKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = TOKEN_TABS[(TOKEN_TABS.indexOf(tab) + step + TOKEN_TABS.length) % TOKEN_TABS.length];
    setTab(next);
    document.getElementById(`wa-tab-${next}`)?.focus();
  };

  return (
    <section className={card} aria-labelledby="wa-tokens">
      <div className="flex items-center justify-between gap-4">
        <h2 id="wa-tokens" className={cardTitle}>Top tokens</h2>
        {matches.length > PREVIEW_ROWS && (
          <button type="button" className={seeAll} aria-expanded={expanded} onClick={() => setExpanded((x) => !x)}>
            {expanded ? 'Show less' : 'See all'} <ChevronRight size={14} className={cx('transition-transform duration-200', expanded && '-rotate-90')} />
          </button>
        )}
      </div>

      <div role="tablist" aria-label="Filter tokens" onKeyDown={onTabKey} className="scrollbar-none mt-5 flex gap-1 overflow-x-auto rounded-[14px] bg-wa-pill p-1.5">
        {TOKEN_TABS.map((name) => (
          <button
            key={name}
            id={`wa-tab-${name}`}
            type="button"
            role="tab"
            aria-selected={tab === name}
            aria-controls="wa-token-panel"
            tabIndex={tab === name ? 0 : -1}
            onClick={() => setTab(name)}
            className="h-[38px] min-w-fit flex-1 whitespace-nowrap rounded-[10px] px-4 text-sm leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-selected:bg-wa-inset aria-selected:font-semibold aria-selected:text-wa-text aria-selected:shadow-[0_1px_2px_rgba(10,16,36,0.12)]"
          >
            {name}
          </button>
        ))}
      </div>

      <div id="wa-token-panel" role="tabpanel" aria-labelledby={`wa-tab-${tab}`} aria-busy={loading} className="mt-3">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="flex h-20 items-center gap-4">
              <span className="size-10 rounded-full bg-placeholder" />
              <span className={cx(skeleton, 'w-28')} />
              <span className={cx(skeleton, 'ml-auto w-20')} />
            </div>
          ))}

        {!loading &&
          rows.map((meta) => {
            const coin = coins[meta.id];
            const up = coin ? coin.change >= 0 : true;
            const starred = favourites.includes(meta.id);
            return (
              <div
                key={meta.id}
                className="relative -mx-3 grid h-20 grid-cols-[32px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 transition-colors duration-150 hover:bg-wa-pill/50 max-md:grid-cols-[32px_minmax(0,1fr)_auto_auto] max-sm:grid-cols-[32px_minmax(0,1fr)_auto]"
              >
                <button
                  type="button"
                  aria-pressed={starred}
                  aria-label={`Favourite ${meta.name}`}
                  onClick={() => toggleFavourite(meta.id)}
                  className={cx('relative z-10 grid size-8 place-items-center rounded-full hover:bg-wa-pill', starred ? 'text-[#f5b331] *:fill-current' : 'text-wa-muted hover:text-wa-text')}
                >
                  <Star size={18} />
                </button>
                {/* The link stretches over the whole row; the star and Trade button sit above it */}
                <a href={tokenHref(meta)} className="rounded-lg after:absolute after:inset-0 after:rounded-2xl" aria-label={`${meta.name} details`}>
                  <CoinLabel coin={meta} />
                </a>
                <span className="justify-self-center max-md:hidden"><Sparkline points={coin?.spark} up={up} width={96} height={36} /></span>
                <span className="text-right font-inter">
                  {coin ? (
                    <>
                      <span className="block text-[15px] font-semibold leading-6 text-wa-text tabular-nums">{formatPrice(coin.price)}</span>
                      <Change value={coin.change} className="justify-end text-sm leading-5" />
                    </>
                  ) : status === 'error' ? (
                    <span className="text-sm text-wa-muted">—</span>
                  ) : (
                    <span className={cx(skeleton, 'w-20')} />
                  )}
                </span>
                <a href={tradeHref(meta)} className={cx(pillQuiet, 'relative z-10 ml-6 max-sm:hidden')} aria-label={`Trade ${meta.name}`}>Trade</a>
              </div>
            );
          })}

        {!loading && !rows.length && (
          <p className="px-4 py-10 text-center text-[15px] leading-6 text-wa-muted">
            {status === 'error' && needsPrices ? 'Live prices are unavailable right now.' : EMPTY[tab]}
          </p>
        )}
        {status === 'error' && rows.length > 0 && <p className="mt-2 text-center text-[13px] leading-5 text-wa-muted">Live prices are unavailable right now.</p>}
      </div>
    </section>
  );
}

export default function Home({ onOpenMenu }) {
  const [hidden, setHidden] = useStored('wa-hide-balances', false);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div className="flex gap-4 max-md:flex-col">
        <BalanceCard hidden={hidden} onToggleHidden={() => setHidden((h) => !h)} />
        <QuickActions onMore={onOpenMenu} />
      </div>
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4 max-xl:grid-cols-[minmax(0,1fr)]">
        <Assets hidden={hidden} />
        <Activities hidden={hidden} />
      </div>
      <TopTokens />
    </div>
  );
}
