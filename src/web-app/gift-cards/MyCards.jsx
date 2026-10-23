import React, { useState } from 'react';
import { cx } from '../../ui.js';
import { bigPrimary, chip, field, sideTab } from '../flow.jsx';
import { ChevronRight, Search } from '../icons.jsx';
import { brandById, face, gcHref, ghs } from './catalog.js';
import { ORDER_STATUS, TRADE_STATUS, orderStatus, useOrders, useTrades } from './store.js';
import { CardArt, StatusPill, dateTime } from './ui.jsx';

const PAGE = 30;

export default function MyCards({ segment }) {
  const [orders] = useOrders();
  const [trades] = useTrades();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [shown, setShown] = useState(PAGE);
  const term = query.trim().toLowerCase();

  // Bought: one row per card line in an order
  const bought = orders.flatMap((o) => o.items.map((item) => ({ o, item, status: orderStatus(o, item) })));
  const boughtRows = bought.filter((r) => (filter === 'all' || r.status === filter) && (!term || brandById[r.item.brand].name.toLowerCase().includes(term) || r.o.id.toLowerCase().includes(term)));
  const soldRows = trades.filter((t) => (filter === 'all' || t.status === filter) && (!term || brandById[t.brand].name.toLowerCase().includes(term) || t.id.toLowerCase().includes(term)));
  const rows = segment === 'sold' ? soldRows : boughtRows;

  // Only filters that have something behind them
  const filters = segment === 'sold'
    ? [...new Set(trades.map((t) => t.status))].map((s) => [s, TRADE_STATUS[s].label])
    : [...new Set(bought.map((r) => r.status))].map((s) => [s, ORDER_STATUS[s].label]);

  const empty = segment === 'sold' ? !trades.length : !orders.length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Bought or sold" className="flex w-[320px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:w-full">
          <a href={gcHref('mine')} onClick={() => setFilter('all')} aria-current={segment === 'bought' ? 'page' : undefined} className={sideTab}>Bought</a>
          <a href={gcHref('mine', 'sold')} onClick={() => setFilter('all')} aria-current={segment === 'sold' ? 'page' : undefined} className={sideTab}>Sold</a>
        </nav>
        {!empty && (
          <label className={cx(field, 'flex h-11 w-[300px] items-center gap-2.5 border-wa-line px-4 text-wa-muted focus-within:border-tab-active focus-within:text-wa-text max-sm:w-full')}>
            <Search size={18} className="shrink-0" />
            <span className="sr-only">Search by brand or ID</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search brand or ${segment === 'sold' ? 'trade' : 'order'} ID`} className="min-w-0 flex-1 bg-transparent text-[15px] text-wa-text outline-none placeholder:text-wa-muted" />
          </label>
        )}
      </div>

      {empty ? (
        <section className="grid place-items-center rounded-2xl border border-wa-line bg-wa-card px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">{segment === 'sold' ? 'You haven’t sold any cards yet' : 'No gift cards yet'}</h2>
          <a href={gcHref(segment === 'sold' ? 'sell' : 'buy', segment === 'sold' && 'new')} className={cx(bigPrimary, 'mt-8')}>{segment === 'sold' ? 'Sell a card' : 'Browse cards'}</a>
        </section>
      ) : (
        <>
          {filters.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
              <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip}>All</button>
              {filters.map(([key, label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={chip}>{label}</button>)}
            </div>
          )}

          <section className="rounded-2xl border border-wa-line bg-wa-card" aria-label={segment === 'sold' ? 'Sold cards' : 'Bought cards'}>
            {rows.length ? (
              <ul className="divide-y divide-wa-line">
                {segment === 'sold'
                  ? soldRows.slice(0, shown).map((t) => {
                      const amount = t.status === 'paid' ? t.actual ?? t.expected : t.expected;
                      return (
                        <li key={t.id}>
                          <a href={gcHref('trade', t.id)} className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wa-pill/40 max-sm:px-4">
                            <CardArt brand={brandById[t.brand]} className="w-20 shrink-0" radius="rounded-lg" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[15px] font-semibold leading-5 text-wa-text">{brandById[t.brand].name} {face(t.country, t.value)} × {t.qty}</span>
                              <span className="mt-1 block truncate text-sm leading-5 text-wa-muted"><span className="font-mono">{t.id}</span> · {dateTime(t.history[0].at)}</span>
                            </span>
                            <span className="flex flex-col items-end gap-1.5">
                              <StatusPill tone={TRADE_STATUS[t.status].tone}>{TRADE_STATUS[t.status].label}</StatusPill>
                              {['cancelled', 'expired', 'rejected'].includes(t.status) ? (
                                <span className="text-sm leading-5 text-wa-muted">No payout</span>
                              ) : (
                                <span className="text-[15px] font-semibold leading-5 text-wa-text tabular-nums">
                                  {t.status === 'paid' ? '' : <span className="text-xs font-normal text-wa-muted">Expected </span>}{ghs(amount)}
                                </span>
                              )}
                            </span>
                            <ChevronRight size={18} className="shrink-0 text-wa-muted max-sm:hidden" />
                          </a>
                        </li>
                      );
                    })
                  : boughtRows.slice(0, shown).map(({ o, item, status }) => {
                      const unseen = !item.gift && status === 'delivered' && item.codes.some((c) => !c.revealed);
                      return (
                        <li key={o.id + item.key}>
                          <a href={gcHref('order', o.id)} className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wa-pill/40 max-sm:px-4">
                            <CardArt brand={brandById[item.brand]} className="w-20 shrink-0" radius="rounded-lg" />
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 text-[15px] font-semibold leading-5 text-wa-text">
                                <span className="truncate">{brandById[item.brand].name} {face(item.country, item.value)}{item.qty > 1 ? ` × ${item.qty}` : ''}</span>
                                {unseen && <span className="rounded-full bg-tab-active px-2 py-px text-[11px] font-bold leading-4 text-white">New</span>}
                              </span>
                              <span className="mt-1 block truncate text-sm leading-5 text-wa-muted">{item.gift ? `Gift to ${item.gift.name}` : 'For you'} · {dateTime(o.at)}</span>
                            </span>
                            <StatusPill tone={ORDER_STATUS[status].tone}>{ORDER_STATUS[status].label}</StatusPill>
                            <ChevronRight size={18} className="shrink-0 text-wa-muted max-sm:hidden" />
                          </a>
                        </li>
                      );
                    })}
              </ul>
            ) : (
              <p className="px-6 py-12 text-center text-[15px] leading-6 text-wa-muted">Nothing matches. Try another search or filter.</p>
            )}
          </section>
          {rows.length > shown && (
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className="mx-auto inline-flex h-11 items-center rounded-full bg-wa-pill px-6 text-[15px] font-bold text-wa-text hover:bg-wa-pill-hover">Show more</button>
          )}
        </>
      )}
    </>
  );
}
