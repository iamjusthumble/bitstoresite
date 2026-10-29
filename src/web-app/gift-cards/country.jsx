import React, { useState } from 'react';
import { cx } from '../../ui.js';
import { Modal } from '../flow.jsx';
import { Check, ChevronDown, Globe } from '../icons.jsx';
import { COUNTRIES, COUNTRY_IDS, buyBrandsIn, sellBrandsIn } from './catalog.js';
import { useCountry } from './store.js';

// Gift cards are country-locked, so the customer says where they are before seeing any cards.
// The choice is shared by Buy and Sell and kept in this browser.

export const Flag = ({ country, className }) => (
  <span aria-hidden="true" className={cx('inline-block leading-none', className)}>{COUNTRIES[country].flag}</span>
);

const countLine = (country, mode) => {
  if (mode === 'sell') {
    const n = sellBrandsIn(country).filter((b) => !b.sell.notBuying).length;
    return n ? `We buy ${n} ${n === 1 ? 'brand' : 'brands'}` : 'Not buying here yet';
  }
  const n = buyBrandsIn(country).filter((b) => !b.paused).length;
  return `${n} ${n === 1 ? 'card' : 'cards'} to buy`;
};

function CountryList({ mode, value, onPick }) {
  return (
    <ul className="grid grid-cols-2 gap-3 max-sm:grid-cols-[minmax(0,1fr)]" role="radiogroup" aria-label="Country">
      {COUNTRY_IDS.map((c) => {
        const on = value === c;
        return (
          <li key={c}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(c)}
              className={cx(
                'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors duration-150',
                on ? 'border-tab-active bg-tab-active/10' : 'border-wa-line hover:border-wa-muted/60 hover:bg-wa-pill/40',
              )}
            >
              <Flag country={c} className="text-[32px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold leading-6 text-wa-text">{COUNTRIES[c].name}</span>
                <span className="block text-sm leading-5 text-wa-muted">{countLine(c, mode)} · {COUNTRIES[c].currency}</span>
              </span>
              {on && <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tab-active text-white"><Check size={14} /></span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const COPY = {
  buy: ['Which country are you in?', 'Gift cards only work in the country they’re issued for. We’ll show the cards you can use there.'],
  sell: ['Which country is your card from?', 'We’ll show the cards we’re buying from there and today’s rates.'],
};

// Shown in place of the catalogue until a country is picked
export function CountryGate({ mode = 'buy' }) {
  const [country, setCountry] = useCountry();
  const [title, line] = COPY[mode];
  return (
    <section aria-labelledby="wa-gc-where" className="mx-auto w-full max-w-[720px] animate-[fade_0.2s_ease-out] py-6 max-sm:py-2">
      <span className="grid size-14 place-items-center rounded-2xl bg-tab-active/12 text-wa-accent"><Globe size={28} /></span>
      <h2 id="wa-gc-where" className="mt-6 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text max-sm:text-[26px] max-sm:leading-8">{title}</h2>
      <p className="mt-2 max-w-[520px] text-base leading-6 text-wa-muted">{line}</p>
      <div className="mt-8">
        <CountryList mode={mode} value={country} onPick={setCountry} />
      </div>
      <p className="mt-6 text-sm leading-5 text-wa-muted">You can change this any time.</p>
    </section>
  );
}

export function CountryDialog({ mode = 'buy', onClose, onPicked }) {
  const [country, setCountry] = useCountry();
  const [title, line] = COPY[mode];
  return (
    <Modal labelledBy="wa-gc-country-dialog" onClose={onClose} className="max-w-[560px]">
      <h3 id="wa-gc-country-dialog" className="pr-10 text-2xl font-semibold leading-8 text-wa-text">{title}</h3>
      <p className="mt-2 text-[15px] leading-6 text-wa-muted">{line}</p>
      <div className="mt-6">
        <CountryList
          mode={mode}
          value={country}
          onPick={(c) => {
            setCountry(c);
            onPicked?.(c);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}

// "🇺🇸 United States ⌄": the current country, opening the picker
export function CountryButton({ mode = 'buy', onPicked, className, short }) {
  const [country] = useCountry();
  const [open, setOpen] = useState(false);
  if (!country) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Country: ${COUNTRIES[country].name}. Change`}
        className={cx('inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-wa-line pl-3 pr-3.5 text-[15px] font-semibold leading-6 text-wa-text transition-colors duration-150 hover:bg-wa-pill', className)}
      >
        <Flag country={country} className="text-xl" />
        <span className={cx(short && 'max-sm:hidden')}>{short ? COUNTRIES[country].short : COUNTRIES[country].name}</span>
        <ChevronDown size={16} className="text-wa-muted" />
      </button>
      {open && <CountryDialog mode={mode} onClose={() => setOpen(false)} onPicked={onPicked} />}
    </>
  );
}
