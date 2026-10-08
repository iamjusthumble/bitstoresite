import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { COINS, formatChange, formatPrice, useMarketData } from '../marketData.js';
import Sparkline from './Sparkline.jsx';
import Tabs from './Tabs.jsx';
import SectionHead from './Section.jsx';
import { cx, section } from '../ui.js';

const tabs = ['All', 'Stablecoins', 'Top gainers'];

function rowsFor(tab, coins) {
  if (tab === 'Stablecoins') return COINS.filter((c) => c.stable);
  if (tab === 'Top gainers') {
    return COINS.filter((c) => coins[c.id])
      .sort((a, b) => coins[b.id].change - coins[a.id].change)
      .slice(0, 4);
  }
  return COINS;
}

// Briefly tints the price green or red when a live update moves it
function LivePrice({ price }) {
  const prev = useRef(price);
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    if (prev.current === price) return undefined;
    setFlash(price > prev.current ? 'up' : 'down');
    prev.current = price;
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
  }, [price]);
  const anim = { up: 'animate-[flash-up_1.2s_ease-out]', down: 'animate-[flash-down_1.2s_ease-out]' };
  return <span className={anim[flash]}>{formatPrice(price)}</span>;
}

const grid = cx(
  'grid items-center gap-4 px-6 grid-cols-[40px_minmax(0,341fr)_minmax(0,213fr)_minmax(0,192fr)_140px_96px]',
  'max-lg:grid-cols-[32px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_96px]',
  'max-sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_76px] max-sm:gap-2.5 max-sm:px-4',
);
const colRank = 'text-sm leading-[21px] text-text-lead max-sm:hidden';
const colChange = 'max-sm:justify-self-end';
const colChart = 'max-lg:hidden';
const colAction = 'justify-self-end max-sm:hidden';
const skeleton =
  'inline-block h-3 rounded-md bg-[linear-gradient(90deg,var(--placeholder),var(--placeholder-2),var(--placeholder))] bg-size-[200%_100%] animate-[shimmer_1.2s_linear_infinite]';

export default function Markets() {
  const { status, coins } = useMarketData();
  const [tab, setTab] = useState('All');
  const rows = rowsFor(tab, coins);

  return (
    <section className={section.alt} id="markets">
      <div className="site-container">
        <SectionHead
          eyebrow="Markets"
          eyebrowClass="mb-5 v2:hidden"
          title="Trade the assets you know."
          lead="Buy, sell, and swap leading cryptocurrencies and stablecoins with competitive fees and instant execution."
        >
          <Tabs tabs={tabs} active={tab} onChange={setTab} label="Filter assets" fill className="w-[360px] max-sm:w-full" />
        </SectionHead>

        <div className="reveal overflow-hidden rounded-[30px] border border-table-border bg-table-bg max-sm:rounded-[20px]" role="table" aria-busy={status === 'loading'}>
          <div
            className={cx(grid, 'min-h-12 bg-table-head font-inter text-[13px] font-medium leading-[19.5px] text-text-lead light:text-[#0a1024]')}
            role="row"
          >
            <span role="columnheader" className={colRank}>#</span>
            <span role="columnheader">Asset</span>
            <span role="columnheader">Price</span>
            <span role="columnheader" className={colChange}>24h change</span>
            <span role="columnheader" className={colChart}>Last 24h</span>
            <span role="columnheader" className={colAction}><span className="sr-only">Trade</span></span>
          </div>
          {rows.map((meta, i) => {
            const coin = coins[meta.id];
            const up = coin ? coin.change >= 0 : true;
            return (
              <div
                key={meta.id}
                role="row"
                className={cx(grid, 'min-h-[72px] border-t border-row-border revealed:animate-[rise_0.6s_var(--ease-soft)_backwards]')}
                style={{ animationDelay: `${(i + 2) * 60}ms` }}
              >
                <span role="cell" className={colRank}>{i + 1}</span>
                <span role="cell" className="flex min-w-0 items-center gap-3">
                  <img src={meta.icon} alt="" width="35" height="35" className="size-[35px] shrink-0" />
                  <span>
                    <strong className="block text-[15px] font-semibold leading-[18.75px] text-title-strong">{meta.name}</strong>
                    <small className="mt-0.5 block text-[13px] leading-[19.5px] text-text-lead">{meta.symbol}</small>
                  </span>
                </span>
                <span role="cell" className="font-inter text-[15px] font-medium leading-[22.5px] text-title-strong tabular-nums">
                  {coin ? <LivePrice price={coin.price} /> : <span className={cx(skeleton, 'w-[84px]')} />}
                </span>
                <span role="cell" className={colChange}>
                  {coin ? (
                    <span
                      className={cx(
                        'inline-block min-w-[66px] rounded-lg px-2 py-[3px] text-center text-[13px] font-semibold leading-[19.5px] tabular-nums',
                        up ? 'bg-up-bg text-up' : 'bg-down-bg text-down',
                      )}
                    >
                      {formatChange(coin.change)}
                    </span>
                  ) : (
                    <span className={cx(skeleton, 'w-12')} />
                  )}
                </span>
                <span role="cell" className={colChart}><Sparkline points={coin?.spark} up={up} /></span>
                <span role="cell" className={colAction}>
                  <a
                    className="inline-flex h-[38px] items-center rounded-full border border-trade-border px-4 text-sm font-semibold leading-[21px] text-title-strong transition-[background-color,border-color] duration-200 hover:border-brand hover:bg-brand/12 light:bg-white"
                    href={links.trade}
                    aria-label={'Trade ' + meta.name}
                  >
                    Trade
                  </a>
                </span>
              </div>
            );
          })}
        </div>
        {status === 'error' && <p className="mt-4 text-center text-[13px] text-text-lead">Live prices are unavailable right now.</p>}
      </div>
    </section>
  );
}
