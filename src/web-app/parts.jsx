import React, { useEffect, useRef, useState } from 'react';
import { COINS, formatChange } from '../marketData.js';
import walletExternal from '../assets/wa-menu/wallet-external.svg';
import walletMybitstore from '../assets/wa-menu/wallet-mybitstore.svg';
import { cx } from '../ui.js';
import { Caret, ChevronDown } from './icons.jsx';

// Class sets and small pieces shared by the web app's views

export const card = 'rounded-2xl border border-wa-line bg-wa-card p-6 max-sm:p-4';
export const cardTitle = 'text-xl font-semibold leading-7 tracking-[-0.2px] text-wa-text';
export const seeAll = 'inline-flex items-center gap-1.5 rounded-md text-[15px] font-bold leading-6 tracking-[-0.15px] text-wa-accent hover:underline';
const pillBtn = 'inline-flex h-10 items-center justify-center rounded-full px-5 text-[15px] font-bold leading-6 tracking-[-0.15px] transition-colors duration-150';
export const pillPrimary = cx(pillBtn, 'bg-tab-active text-white hover:bg-brand-strong');
export const pillOutline = cx(pillBtn, 'border border-wa-text/70 text-wa-text hover:bg-wa-text/10');
export const pillQuiet = cx(pillBtn, 'bg-wa-pill text-wa-muted hover:bg-wa-pill-hover hover:text-wa-text');
export const skeleton =
  'inline-block h-3 rounded-md bg-[linear-gradient(90deg,var(--placeholder),var(--placeholder-2),var(--placeholder))] bg-size-[200%_100%] animate-[shimmer_1.2s_linear_infinite]';

export const coinById = Object.fromEntries(COINS.map((c) => [c.id, c]));

export const coinBySymbol = Object.fromEntries(COINS.map((c) => [c.symbol.toLowerCase(), c]));

export const tokenHref = (coin, side) => `#token/${coin.symbol.toLowerCase()}${side ? '/' + side : ''}`;

// The order page: #buy/eth or #sell/eth, optionally followed by a step (review, done) or, when buying, a wallet (external, mybitstore)
export const tradeHref = (coin, side = 'buy', part) => `#${side}/${coin.symbol.toLowerCase()}${part ? '/' + part : ''}`;

// The two places crypto can be bought into. Selling needs no wallet choice: it comes out of the balance
export const WALLETS = [
  { key: 'external', name: 'External Wallet', icon: walletExternal, tint: 'bg-tab-active/15', buy: 'Buy crypto into an external wallet' },
  { key: 'mybitstore', name: 'Mybitstore wallet', icon: walletMybitstore, tint: 'bg-[#467777]/30', buy: 'Buy crypto into Mybitstore wallet' },
];

export function Change({ value, className }) {
  const up = value >= 0;
  return (
    <span className={cx('inline-flex items-center gap-1.5 font-inter font-medium tabular-nums', up ? 'text-up' : 'text-down', className)}>
      <Caret down={!up} />
      <span className="sr-only">{up ? 'Up' : 'Down'}</span>
      {formatChange(value).replace(/^[+-]/, '')}
    </span>
  );
}

export function CoinLabel({ coin, size = 40 }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <img src={coin.icon} alt="" width={size} height={size} className="shrink-0" style={{ width: size, height: size }} />
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-5 text-wa-text">{coin.symbol}</span>
        <span className="block truncate text-sm leading-[18px] text-wa-muted">{coin.name}</span>
      </span>
    </span>
  );
}

// Period picker for the balance charts: a button that opens a short list of ranges
export function PeriodSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Arrow keys move between the options once the list is open
  const onListKey = (e) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll('button')];
    items[(items.indexOf(document.activeElement) + step + items.length) % items.length].focus();
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-wa-line pl-3.5 pr-3 font-inter text-[13px] font-medium leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-expanded:text-wa-text"
      >
        {value}
        <ChevronDown size={14} className={cx('transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Balance period"
          onKeyDown={onListKey}
          className="absolute right-0 top-[calc(100%+6px)] z-20 w-40 animate-[pop-in_0.15s_ease-out] rounded-xl border border-wa-line bg-wa-inset p-1 shadow-(--wa-shadow)"
        >
          {options.map((name) => (
            <button
              key={name}
              type="button"
              role="menuitemradio"
              aria-checked={name === value}
              autoFocus={name === value}
              onClick={() => {
                onChange(name);
                setOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left font-inter text-[13px] leading-5 text-wa-muted hover:bg-wa-pill hover:text-wa-text aria-checked:bg-wa-pill aria-checked:font-medium aria-checked:text-wa-text"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// The chevron beside a token's name: jump straight to the same page for another token
export function TokenSwitcher({ current, href = tokenHref }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onListKey = (e) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const items = [...e.currentTarget.querySelectorAll('a')];
    items[(items.indexOf(document.activeElement) + step + items.length) % items.length].focus();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Switch token"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid h-7 w-10 place-items-center rounded-lg border border-wa-line text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text aria-expanded:bg-wa-pill aria-expanded:text-wa-text"
      >
        <ChevronDown size={16} className={cx('transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Tokens"
          onKeyDown={onListKey}
          className="absolute left-0 top-[calc(100%+6px)] z-20 w-56 animate-[pop-in_0.15s_ease-out] rounded-xl border border-wa-line bg-wa-inset p-1 shadow-(--wa-shadow)"
        >
          {COINS.map((coin) => (
            <a
              key={coin.id}
              role="menuitemradio"
              aria-checked={coin.id === current.id}
              href={href(coin)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[15px] font-semibold leading-5 text-wa-text hover:bg-wa-pill aria-checked:bg-wa-pill"
            >
              <img src={coin.icon} alt="" width="24" height="24" className="size-6" />
              {coin.name}
              <span className="ml-auto text-sm font-normal text-wa-muted">{coin.symbol}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
