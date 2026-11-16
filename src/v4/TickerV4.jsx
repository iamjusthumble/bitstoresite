import React from 'react';
import { COINS, formatChange, formatPrice, useMarketData } from '../marketData.js';
import { cx } from '../ui.js';

// Live prices gliding past between two hairlines, edge-faded; hovering pauses it
export default function TickerV4() {
  const { coins } = useMarketData();
  const row = COINS.map((meta) => {
    const c = coins[meta.id];
    const up = c ? c.change >= 0 : true;
    return (
      <li key={meta.id} className="flex shrink-0 items-center gap-2.5 pr-12">
        <img src={meta.icon} alt="" width="22" height="22" className="size-[22px] opacity-90" />
        <span className="text-[15px] font-medium text-v4-ink">{meta.symbol}</span>
        <span className="text-[15px] text-v4-muted tabular-nums">{c ? formatPrice(c.price) : '—'}</span>
        {c && <span className={cx('text-[13px] font-medium tabular-nums', up ? 'text-up' : 'text-down')}>{up ? '▲' : '▼'} {formatChange(c.change).replace(/^[+-]/, '')}</span>}
        <span aria-hidden="true" className="ml-10 h-3 w-px bg-v4-line-2" />
      </li>
    );
  });
  return (
    <section aria-label="Live prices" className="relative z-1 border-y border-v4-line py-5">
      <div className="group/t overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <ul className="flex w-max animate-[v4-marquee_60s_linear_infinite] group-hover/t:[animation-play-state:paused]">
          {row}
          {row.map((li) => React.cloneElement(li, { key: `${li.key}-b`, 'aria-hidden': true }))}
        </ul>
      </div>
    </section>
  );
}
