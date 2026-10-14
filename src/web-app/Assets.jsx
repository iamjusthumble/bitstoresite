import React, { useState } from 'react';
import { COINS, refreshMarketData, useMarketData } from '../marketData.js';
import Sparkline from '../components/Sparkline.jsx';
import { cx } from '../ui.js';
import BarChart from './BarChart.jsx';
import { BALANCE, BAR_PERIOD_NAMES, HOLDINGS, P2P_BALANCE, WALLET_BALANCE, balanceBars } from './demoData.js';
import { Money, useStored } from './format.jsx';
import { ArrowUpRight, Dollar, Eye, EyeOff, Refresh } from './icons.jsx';
import { Change, CoinLabel, PeriodSelect, card, cardTitle, coinById, pillOutline, pillPrimary, skeleton, tokenHref, tradeHref } from './parts.jsx';

function BalanceCard({ hidden, onToggleHidden }) {
  const [period, setPeriod] = useState(BAR_PERIOD_NAMES[0]);
  // One timestamp for the whole visit keeps the bars still between renders
  const [now] = useState(() => Date.now());

  return (
    <section className={card} aria-labelledby="wa-total">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h2 id="wa-total" className="text-base leading-6 text-wa-text">Total balance</h2>
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
          <p className="mt-1 text-[56px] font-semibold leading-[1.1] tracking-[-1.5px] text-wa-text max-sm:text-[40px] max-sm:tracking-[-1px]">
            <Money value={BALANCE} hidden={hidden} />
          </p>
        </div>
        <PeriodSelect options={BAR_PERIOD_NAMES} value={period} onChange={setPeriod} />
      </div>
      <BarChart key={period} bars={balanceBars(period, now)} hidden={hidden} label={`Total balance, ${period.toLowerCase()}`} />
    </section>
  );
}

// The supported token with the biggest 24-hour gain (stablecoins left out: they are not meant to move)
function BestToBuy() {
  const { status, coins } = useMarketData();
  const [spinning, setSpinning] = useState(false);
  const ranked = COINS.filter((c) => !c.stable && coins[c.id]).sort((a, b) => coins[b.id].change - coins[a.id].change);
  const coin = ranked[0];
  const live = coin && coins[coin.id];

  const refresh = () => {
    refreshMarketData();
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 900);
  };

  return (
    <section className={cx(card, 'flex flex-col')} aria-labelledby="wa-best">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="wa-best" className={cardTitle}>Top gainer</h2>
          <p className="mt-0.5 text-sm leading-5 text-wa-muted">Biggest 24h gain right now</p>
        </div>
        <button type="button" onClick={refresh} aria-label="Refresh prices" className="grid size-9 place-items-center rounded-[10px] border border-wa-line text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text">
          <Refresh size={18} className={cx(spinning && 'animate-[spin-slow_0.9s_linear]')} />
        </button>
      </div>

      {live ? (
        <>
          <p className="mt-6 text-[44px] font-semibold leading-[1.1] tracking-[-1px] text-wa-text max-sm:text-4xl" aria-live="polite"><Money value={live.price} /></p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={tokenHref(coin)} className="inline-flex items-center gap-2 rounded-md text-base font-semibold leading-6 text-wa-text hover:underline">
              <img src={coin.icon} alt="" width="24" height="24" className="size-6" />
              {coin.name} <span className="font-normal text-wa-muted">{coin.symbol}</span>
            </a>
            <Change value={live.change} className="text-sm leading-6" />
          </p>
          <div className="mt-6 flex-1 *:h-auto *:w-full" aria-hidden="true">
            <Sparkline points={live.spark} up={live.change >= 0} width={340} height={110} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <a href={tradeHref(coin)} className={pillPrimary}>Buy</a>
            <a href={tradeHref(coin, 'sell')} className={pillOutline}>Sell</a>
          </div>
        </>
      ) : status === 'error' ? (
        <p className="grid flex-1 place-items-center py-16 text-center text-[15px] leading-6 text-wa-muted">Live prices are unavailable right now.</p>
      ) : (
        <div className="mt-6 grid gap-4" aria-busy="true">
          <span className={cx(skeleton, 'h-10 w-48')} />
          <span className={cx(skeleton, 'w-40')} />
          <span className={cx(skeleton, 'h-[110px] w-full')} />
        </div>
      )}
    </section>
  );
}

const assetGrid = 'grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)_176px] items-center gap-4 max-md:grid-cols-[minmax(0,1fr)_auto]';

function AllAssets({ hidden }) {
  return (
    <section className={card} aria-labelledby="wa-all-assets">
      <h2 id="wa-all-assets" className={cardTitle}>All assets</h2>
      <div className="mt-5" role="table" aria-labelledby="wa-all-assets">
        <div role="row" className={cx(assetGrid, 'font-inter text-xs font-medium leading-4 text-wa-muted')}>
          <span role="columnheader">Name</span>
          <span role="columnheader" className="max-md:text-right">Balance</span>
          <span role="columnheader" className="max-md:hidden">Share of wallet</span>
          <span role="columnheader" className="sr-only">Actions</span>
        </div>
        {HOLDINGS.map(({ id, value }) => {
          const coin = coinById[id];
          const share = (value / WALLET_BALANCE) * 100;
          return (
            <div key={id} role="row" className={cx(assetGrid, 'mt-4 border-t border-wa-line pt-4')}>
              <span role="cell"><a href={tokenHref(coin)} className="block rounded-lg hover:opacity-80"><CoinLabel coin={coin} /></a></span>
              <span role="cell" className="font-inter text-[15px] font-semibold leading-6 text-wa-text max-md:text-right"><Money value={value} hidden={hidden} /></span>
              <span role="cell" className="flex items-center gap-3 max-md:hidden">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-wa-pill">
                  <span className="block h-full rounded-full bg-tab-active" style={{ width: `${share}%` }} />
                </span>
                <span className="w-11 text-right font-inter text-[13px] leading-5 text-wa-muted tabular-nums">{share.toFixed(1)}%</span>
              </span>
              <span role="cell" className="flex gap-2 max-md:col-span-2">
                <a href={tradeHref(coin)} className={cx(pillPrimary, 'flex-1')} aria-label={`Buy ${coin.name}`}>Buy</a>
                <a href={tradeHref(coin, 'sell')} className={cx(pillOutline, 'flex-1')} aria-label={`Sell ${coin.name}`}>Sell</a>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Summary({ hidden }) {
  const rows = [
    { label: 'Total wallet balance', value: WALLET_BALANCE, Icon: Dollar, tint: 'bg-[#d8f0ff] text-tab-active' },
    { label: 'Total P2P balance', value: P2P_BALANCE, Icon: ArrowUpRight, tint: 'bg-[#dff9e8] text-[#1f9d55]' },
  ];
  return (
    <section className={cx(card, 'flex flex-col')} aria-labelledby="wa-summary">
      <h2 id="wa-summary" className={cardTitle}>Summary</h2>
      <p className="mt-6 text-[44px] font-semibold leading-[1.1] tracking-[-1px] text-wa-text max-sm:text-4xl"><Money value={BALANCE} hidden={hidden} /></p>
      <dl className="mb-auto mt-5 grid gap-6">
        {rows.map(({ label, value, Icon, tint }) => (
          <div key={label} className="flex items-center gap-4">
            <span className={cx('grid size-12 shrink-0 place-items-center rounded-full', tint)}><Icon size={22} /></span>
            <div className="flex flex-col-reverse">
              <dt className="text-sm leading-5 text-wa-muted">{label}</dt>
              <dd className="text-xl font-semibold leading-7 text-wa-text"><Money value={value} hidden={hidden} /></dd>
            </div>
          </div>
        ))}
      </dl>
      <a href="#withdraw" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-wa-text text-base font-bold leading-6 text-wa-bg transition-opacity duration-150 hover:opacity-85">
        Withdraw
      </a>
    </section>
  );
}

const columns = 'grid grid-cols-[minmax(0,1fr)_380px] gap-4 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]';

export default function Assets() {
  const [hidden, setHidden] = useStored('wa-hide-balances', false);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div className={columns}>
        <BalanceCard hidden={hidden} onToggleHidden={() => setHidden((h) => !h)} />
        <BestToBuy />
      </div>
      <div className={columns}>
        <AllAssets hidden={hidden} />
        <Summary hidden={hidden} />
      </div>
    </div>
  );
}
