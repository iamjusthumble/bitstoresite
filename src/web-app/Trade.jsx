import React, { useState } from 'react';
import { COINS, formatPrice, useMarketData } from '../marketData.js';
import Sparkline from '../components/Sparkline.jsx';
import { cx } from '../ui.js';
import { BALANCE, HOLDINGS, P2P_BALANCE, balanceSeries } from './demoData.js';
import { Money, useStored } from './format.jsx';
import { Change, CoinLabel, card, cardTitle, coinById, pillPrimary, skeleton, tokenHref, tradeHref } from './parts.jsx';

const tokenGrid =
  'grid grid-cols-[minmax(0,1.4fr)_80px_minmax(0,1fr)_minmax(0,1fr)_70px] items-center gap-4 max-md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_70px] max-sm:grid-cols-[minmax(0,1fr)_auto_70px] max-sm:gap-3';

function Tokens() {
  const { status, coins } = useMarketData();

  return (
    <section className={cx(card, 'min-w-0')} aria-labelledby="wa-trade-tokens">
      <h2 id="wa-trade-tokens" className="sr-only">Tokens</h2>
      <div role="table" aria-labelledby="wa-trade-tokens">
        <div role="row" className={cx(tokenGrid, 'py-3 text-xs font-medium leading-4 text-wa-muted')}>
          {/* Lines up with the token names, past the 32px icon */}
          <span role="columnheader" className="pl-11">Name</span>
          {/* sr-only text sits inside the cell: an absolutely placed header would drop out of the grid */}
          <span role="columnheader" className="max-md:hidden"><span className="sr-only">Last 24 hours</span></span>
          <span role="columnheader" className="max-sm:text-right">Last Price</span>
          <span role="columnheader" className="max-sm:hidden">24h Chg%</span>
          <span role="columnheader"><span className="sr-only">Action</span></span>
        </div>
        {COINS.map((meta) => {
          const coin = coins[meta.id];
          return (
            <div key={meta.id} role="row" className={cx(tokenGrid, 'relative -mx-3 h-[71px] rounded-2xl px-3 transition-colors duration-150 hover:bg-wa-pill/50')}>
              <span role="cell" className="min-w-0">
                {/* The link stretches over the whole row; the Trade button sits above it */}
                <a href={tokenHref(meta)} className="block rounded-lg after:absolute after:inset-0 after:rounded-2xl" aria-label={`${meta.name} details`}>
                  <CoinLabel coin={meta} size={32} />
                </a>
              </span>
              <span role="cell" className="max-md:hidden"><Sparkline points={coin?.spark} up={coin ? coin.change >= 0 : true} width={80} height={36} /></span>
              {coin ? (
                // One stacked cell on phones, two columns from there up
                <span className="contents max-sm:block max-sm:text-right">
                  <span role="cell" className="block text-[15px] font-semibold leading-6 tracking-[-0.075px] text-wa-text"><Money value={coin.price} /></span>
                  <span role="cell" className="block"><Change value={coin.change} className="text-sm leading-6 max-sm:justify-end max-sm:leading-5" /></span>
                </span>
              ) : (
                <span role="cell" className="col-span-2 max-sm:col-span-1 max-sm:text-right">
                  {status === 'error' ? <span className="text-sm text-wa-muted">—</span> : <span className={cx(skeleton, 'w-20')} />}
                </span>
              )}
              <span role="cell" className="relative z-10">
                <a href={tradeHref(meta)} className={cx(pillPrimary, 'w-full')} aria-label={`Trade ${meta.name}`}>Trade</a>
              </span>
            </div>
          );
        })}
      </div>
      {status === 'error' && <p className="mt-2 text-center text-[13px] leading-5 text-wa-muted">Live prices are unavailable right now.</p>}
    </section>
  );
}

// One slice per wallet holding, plus the P2P balance, so the ring adds up to the figure above it
const SLICE_COLOURS = ['#fd8965', '#ffb560', '#e5c7f7', '#fad5f4', '#c7deff'];
const SLICES = [
  ...HOLDINGS.map(({ id, value }) => ({ key: id, label: coinById[id].symbol, name: coinById[id].name, value })),
  { key: 'p2p', label: 'P2P', name: 'P2P balance', value: P2P_BALANCE },
].map((slice, i, all) => ({
  ...slice,
  colour: SLICE_COLOURS[i % SLICE_COLOURS.length],
  share: (slice.value / BALANCE) * 100,
  start: (all.slice(0, i).reduce((sum, s) => sum + s.value, 0) / BALANCE) * 100,
}));

const RING = { size: 252, radius: 96, width: 56, gap: 0.7 };

function Donut({ active, onActive, hidden }) {
  const centre = RING.size / 2;
  const shown = SLICES.find((s) => s.key === active);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[252px]">
      <svg viewBox={`0 0 ${RING.size} ${RING.size}`} className="block size-full" role="img" aria-label="Balance split by asset">
        <g transform={`rotate(-90 ${centre} ${centre})`} fill="none" strokeWidth={RING.width}>
          {SLICES.map((slice) => (
            <circle
              key={slice.key}
              cx={centre}
              cy={centre}
              r={RING.radius}
              pathLength="100"
              stroke={slice.colour}
              strokeDasharray={`${Math.max(slice.share - RING.gap, 0.2)} 100`}
              strokeDashoffset={-(slice.start + RING.gap / 2)}
              onPointerEnter={() => onActive(slice.key)}
              onPointerLeave={() => onActive(null)}
              className={cx('transition-opacity duration-150', active && active !== slice.key && 'opacity-30')}
            />
          ))}
        </g>
      </svg>
      {shown && (
        <p className="pointer-events-none absolute inset-0 grid place-content-center justify-items-center text-center" aria-hidden="true">
          <span className="text-sm font-semibold leading-5 text-wa-muted">{shown.label}</span>
          <span className="text-lg font-semibold leading-6 text-wa-text"><Money value={shown.value} hidden={hidden} /></span>
          <span className="text-xs leading-4 text-wa-muted tabular-nums">{shown.share.toFixed(1)}%</span>
        </p>
      )}
    </div>
  );
}

function AvailableBalance() {
  const [hidden] = useStored('wa-hide-balances', false);
  const [active, setActive] = useState(null);
  // One timestamp for the whole visit keeps the change figure still between renders
  const [now] = useState(() => Date.now());
  const { change } = balanceSeries('Month', now);

  return (
    <section className={cx(card, 'self-start max-lg:w-full')} aria-labelledby="wa-available">
      <h2 id="wa-available" className={cx(cardTitle, 'leading-8')}>Available balance</h2>
      <p className="mt-6 text-[40px] font-semibold leading-[48px] tracking-[-0.8px] text-wa-text">
        <Money value={BALANCE} hidden={hidden} />
      </p>
      <p className="flex items-center gap-2">
        <Change value={change} className="text-sm leading-6" />
        <span className="text-sm leading-6 text-wa-muted">this month</span>
      </p>

      <div className="mt-6">
        <Donut active={active} onActive={setActive} hidden={hidden} />
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {SLICES.map((slice) => (
          <li
            key={slice.key}
            onPointerEnter={() => setActive(slice.key)}
            onPointerLeave={() => setActive(null)}
            className={cx('flex items-center gap-2 text-xs font-medium leading-4 text-wa-muted transition-opacity duration-150', active && active !== slice.key && 'opacity-40')}
          >
            <span className="size-3 rounded-[4px]" style={{ background: slice.colour }} />
            <span aria-hidden="true">{slice.label}</span>
            <span className="sr-only">
              {slice.name}: {hidden ? '' : `${formatPrice(slice.value)}, `}{slice.share.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>

      <a
        href="#assets"
        className="mt-6 flex h-12 items-center justify-center rounded-full bg-[#efefef] px-6 text-[15px] font-bold leading-6 tracking-[-0.15px] text-[#6f767e] transition-colors duration-150 hover:bg-[#e2e4e8] hover:text-[#4d535b]"
      >
        View all assets
      </a>
    </section>
  );
}

export default function Trade() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_389px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]">
      <Tokens />
      <AvailableBalance />
    </div>
  );
}
