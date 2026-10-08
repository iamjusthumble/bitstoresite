import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { COINS, formatChange, formatPrice, useMarketData } from '../marketData.js';
import Sparkline from './Sparkline.jsx';
import Tabs from './Tabs.jsx';

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
  return <span className={flash ? 'price-flash is-' + flash : undefined}>{formatPrice(price)}</span>;
}

export default function Markets() {
  const { status, coins } = useMarketData();
  const [tab, setTab] = useState('All');
  const rows = rowsFor(tab, coins);

  return (
    <section className="section section-alt markets" id="markets">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Markets</span>
          <h2>Trade the assets you know.</h2>
          <p className="lead">Buy, sell, and swap leading cryptocurrencies and stablecoins with competitive fees and instant execution.</p>
          <Tabs tabs={tabs} active={tab} onChange={setTab} label="Filter assets" className="tabs-markets" />
        </div>

        <div className="market-table reveal" role="table" aria-busy={status === 'loading'}>
          <div className="market-row market-row-head" role="row">
            <span role="columnheader" className="col-rank">#</span>
            <span role="columnheader">Asset</span>
            <span role="columnheader">Price</span>
            <span role="columnheader">24h change</span>
            <span role="columnheader" className="col-chart">Last 24h</span>
            <span role="columnheader" className="col-action"><span className="sr-only">Trade</span></span>
          </div>
          {rows.map((meta, i) => {
            const coin = coins[meta.id];
            const up = coin ? coin.change >= 0 : true;
            return (
              <div className="market-row" role="row" key={meta.id}>
                <span role="cell" className="col-rank">{i + 1}</span>
                <span role="cell" className="market-asset">
                  <img src={meta.icon} alt="" width="35" height="35" />
                  <span>
                    <strong>{meta.name}</strong>
                    <small>{meta.symbol}</small>
                  </span>
                </span>
                <span role="cell" className="market-price">{coin ? <LivePrice price={coin.price} /> : <span className="skeleton" />}</span>
                <span role="cell">
                  {coin ? <span className={'change-pill ' + (up ? 'up' : 'down')}>{formatChange(coin.change)}</span> : <span className="skeleton short" />}
                </span>
                <span role="cell" className="col-chart"><Sparkline points={coin?.spark} up={up} /></span>
                <span role="cell" className="col-action">
                  <a className="trade-btn" href={links.trade} aria-label={'Trade ' + meta.name}>Trade</a>
                </span>
              </div>
            );
          })}
        </div>
        {status === 'error' && <p className="market-note">Live prices are unavailable right now.</p>}
      </div>
    </section>
  );
}
