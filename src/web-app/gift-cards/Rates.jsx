import React, { useEffect, useState } from 'react';
import { cx } from '../../ui.js';
import { bigPrimary, field } from '../flow.jsx';
import { Clock } from '../icons.jsx';
import { card, cardTitle } from '../parts.jsx';
import { CARD_TYPES, COUNTRIES, SELL_BRANDS, brandById, countryPaused, gcHref, ghs, ghsRate, receiptMatters, sellCountries, sellRate } from './catalog.js';
import { freshDraft } from './Sell.jsx';
import { useDraft } from './store.js';
import { CardArt, Choices, QtyStepper } from './ui.jsx';

// GC11: today's sell rates for a brand, with a calculator that hands off to the sell flow
export default function Rates({ brandId }) {
  const brand = brandById[brandId || 'apple'];
  const s = brand.sell;
  const live = sellCountries(brand).filter((c) => !countryPaused(brand, c));
  const [country, setCountry] = useState(live[0] || sellCountries(brand)[0]);
  const [type, setType] = useState(s.types[0]);
  const [receipt, setReceipt] = useState(s.receipt === 'required' ? 'with' : 'without');
  const [value, setValue] = useState(String(s.values ? s.values[Math.min(2, s.values.length - 1)] : 100));
  const [qty, setQty] = useState(1);
  const [updated, setUpdated] = useState(Date.now());
  const [, setDraft] = useDraft();

  // Rates refresh every minute
  useEffect(() => {
    const t = setInterval(() => setUpdated(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const sym = COUNTRIES[country].symbol;
  const notBuying = s.notBuying || countryPaused(brand, country);
  const rows = s.types.flatMap((t) => (receiptMatters(brand) ? [['with', 'with receipt'], ['without', 'without receipt']] : [[s.receipt === 'required' ? 'with' : 'without', s.receipt === 'required' ? 'receipt required' : '']]).map(([r, label]) => ({ type: t, receipt: r, label })));
  const n = Number(value) || 0;
  const valueOk = s.bands.some(([lo, hi]) => n >= lo && n <= hi) && (!s.values || s.values.includes(n));
  const rate = valueOk ? sellRate(brand, { country, type, receipt, value: n }) : 0;

  const sell = () => {
    setDraft(freshDraft(brand, { country, type, receipt, value: valueOk ? n : null, qty }));
    window.location.hash = gcHref('sell', brand.id);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">Today’s rates</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm leading-5 text-wa-muted"><Clock size={16} />Updated {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(updated)} · cedis paid per unit of card value</p>
      </div>

      <nav aria-label="Card brand" className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {SELL_BRANDS.map((b) => (
          <a key={b.id} href={gcHref('rates', b.id)} aria-current={b.id === brand.id ? 'page' : undefined} className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-wa-line py-1.5 pl-1.5 pr-4 text-[15px] font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-[current=page]:border-tab-active aria-[current=page]:bg-tab-active/12 aria-[current=page]:text-wa-text">
            <CardArt brand={b} className="w-12" radius="rounded-full" shadow="" />
            {b.name}
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]">
        <section className={card} aria-labelledby="wa-gc-rate-table">
          <div className="flex items-center gap-4">
            <CardArt brand={brand} className="w-24 shrink-0" radius="rounded-lg" />
            <h3 id="wa-gc-rate-table" className={cardTitle}>{brand.name}</h3>
          </div>
          {sellCountries(brand).length > 1 && (
            <Choices className="mt-5" label="Country" options={sellCountries(brand).map((c) => [c, COUNTRIES[c].name])} value={country} onChange={setCountry} />
          )}
          {notBuying ? (
            <p className="mt-6 rounded-2xl border border-dashed border-wa-line px-6 py-10 text-center text-[15px] leading-6 text-wa-muted">Not buying right now{countryPaused(brand, country) ? ` for ${COUNTRIES[country].name} cards` : ''}.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th scope="col" className="pb-3 pr-4 text-sm font-semibold leading-5 text-wa-muted">Card</th>
                    {s.bands.map(([lo, hi]) => <th key={lo} scope="col" className="pb-3 pl-4 text-right text-sm font-semibold leading-5 text-wa-muted tabular-nums">{sym}{lo}–{sym}{hi}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.type + r.receipt}>
                      <th scope="row" className="border-t border-wa-line py-3.5 pr-4 text-[15px] font-semibold leading-5 text-wa-text">{CARD_TYPES[r.type]}{r.label && <span className="block text-sm font-normal text-wa-muted">{r.label}</span>}</th>
                      {s.bands.map(([lo]) => (
                        <td key={lo} className="border-t border-wa-line py-3.5 pl-4 text-right text-[15px] font-semibold leading-5 text-wa-text tabular-nums">{ghsRate(sellRate(brand, { country, type: r.type, receipt: r.receipt, value: lo }))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.rules?.length > 0 && (
            <ul className="mt-6 grid gap-1.5 text-sm leading-5 text-wa-muted">
              {s.rules.map((r) => <li key={r}>· {r}</li>)}
            </ul>
          )}
        </section>

        <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-gc-calc">
          <h3 id="wa-gc-calc" className={cardTitle}>Calculator</h3>
          <div className="mt-5 grid gap-4">
            {s.types.length > 1 && <Choices label="Card type" options={s.types.map((t) => [t, CARD_TYPES[t]])} value={type} onChange={setType} />}
            {receiptMatters(brand) && <Choices label="Receipt" options={[['with', 'With receipt'], ['without', 'Without']]} value={receipt} onChange={setReceipt} />}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <label className="min-w-0">
                <span className="text-sm font-semibold leading-5 text-wa-text">Card value</span>
                <span className={cx(field, 'mt-2 flex h-12 items-center gap-1 border-wa-line px-4 focus-within:border-tab-active')}>
                  <span className="text-wa-muted" aria-hidden="true">{sym}</span>
                  <input value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" className="min-w-0 flex-1 bg-transparent text-base font-semibold text-wa-text outline-none tabular-nums" />
                </span>
              </label>
              <QtyStepper value={qty} max={10} onChange={setQty} size="sm" />
            </div>
          </div>
          <p className="mt-5 text-sm leading-5 text-wa-muted">You’d get</p>
          <p className="text-[34px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">{notBuying ? '—' : ghs(n * qty * rate)}</p>
          <p className="mt-1 text-sm leading-5 text-wa-muted tabular-nums">
            {notBuying ? 'Not buying right now' : valueOk ? `${sym}${n} × ${qty} × ${rate.toFixed(2)}` : s.values ? `We buy ${s.values.map((v) => sym + v).join(', ')} cards` : `Enter ${sym}${s.bands[0][0]} to ${sym}${s.bands[s.bands.length - 1][1]}`}
          </p>
          <button type="button" disabled={notBuying} onClick={sell} className={cx(bigPrimary, 'mt-6 w-full disabled:pointer-events-none disabled:opacity-50')}>Sell this card</button>
        </aside>
      </div>
    </>
  );
}
