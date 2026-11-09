import React from 'react';
import { COINS, formatChange, formatPrice, useMarketData } from '../marketData.js';
import { cx } from '../ui.js';

// Live prices gliding past, edge-faded; hovering pauses it
export default function Ticker() {
  const { coins } = useMarketData();
  const row = COINS.map((meta) => {
    const c = coins[meta.id];
    const up = c ? c.change >= 0 : true;
    return (
      <li key={meta.id} className="flex shrink-0 items-center gap-3 pr-14">
        <img src={meta.icon} alt="" width="28" height="28" className="size-7" />
        <span className="font-inter-tight text-[17px] font-semibold text-v3-ink">{meta.symbol}</span>
        <span className="text-[16px] text-v3-soft tabular-nums">{c ? formatPrice(c.price) : '—'}</span>
        {c && <span className={cx('text-[14px] font-semibold tabular-nums', up ? 'text-up' : 'text-down')}>{up ? '▲' : '▼'} {formatChange(c.change).replace(/^[+-]/, '')}</span>}
        <span aria-hidden="true" className="ml-11 size-1 rounded-full bg-v3-line" />
      </li>
    );
  });
  return (
    <section aria-label="Live prices" className="relative z-1 py-6">
      <div className="group/t overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className="flex w-max animate-[v3-marquee_45s_linear_infinite] group-hover/t:[animation-play-state:paused]">
          {row}
          {row.map((li) => React.cloneElement(li, { key: `${li.key}-b`, 'aria-hidden': true }))}
        </ul>
      </div>
    </section>
  );
}
