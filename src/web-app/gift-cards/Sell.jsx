import React, { useEffect, useState } from 'react';
import usdtIcon from '../../assets/coin-usdt.svg';
import { cx } from '../../ui.js';
import { FieldError, Modal, Radio, Row, bigOutline, bigPrimary, chip, choice, field, fieldBorder } from '../flow.jsx';
import { Alert, Check, Clipboard, Close, Plus, Search, Shield, Wallet } from '../icons.jsx';
import { ProviderLogo, accountLabel, canUse, maskNumber, usePaymentAccounts } from '../paymentAccounts.jsx';
import { card, cardTitle } from '../parts.jsx';
import {
  CARD_TYPES, COUNTRIES, GHS_PER_USD, LIMITS, SELL_BRANDS, bandIndex, bestRate, brandById, cleanCode, countryPaused, face, gcHref, ghs, ghsRate,
  groupCode, inReviewHours, maskCode, receiptMatters, sellCountries, sellRate, usdt,
} from './catalog.js';
import { newId, submittedCodes, useCanTrade, useDraft, useNotify, useOnline, useToday, useTrades } from './store.js';
import { CardArt, Choices, CountTo, MobileBar, PayOptions, PhotoSlot, QtyStepper, Segmented, StepIndicator, VerifyDialog, readPhoto, toast } from './ui.jsx';

const STEPS = ['brand', 'details', 'cards', 'review'];
const STEP_NAMES = ['Brand', 'Card details', 'Add cards', 'Review'];

// A fresh trade for a brand, with anything known filled in (from rates, "Sell again" or the hub's quick quote)
export function freshDraft(brand, prefill = {}) {
  const countries = sellCountries(brand).filter((c) => !countryPaused(brand, c));
  return {
    brandId: brand.id,
    step: 'details',
    country: countries.length === 1 ? countries[0] : null,
    type: brand.sell.types.length === 1 ? brand.sell.types[0] : null,
    receipt: brand.sell.receipt === 'required' ? 'with' : brand.sell.receipt === 'none' ? 'without' : null,
    value: null,
    qty: 1,
    cards: [],
    receiptImg: null,
    note: '',
    payout: { method: 'wallet' },
    owned: false,
    ...prefill,
  };
}

const blankCard = () => ({ id: Math.random().toString(36).slice(2, 8), front: null, back: null, code: '', pin: '', serial: '', shot: null });

export default function Sell({ brandId, step }) {
  const [draft, setDraft] = useDraft();
  const brand = brandId ? brandById[brandId] : null;

  // Arriving on a brand's page without a matching draft (a deep link, or a different brand) starts one
  useEffect(() => {
    if (brand && (!draft || draft.brandId !== brand.id)) {
      setDraft(freshDraft(brand));
      if (step !== 'details') window.location.replace(gcHref('sell', brand.id));
    }
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = brand ? draft && draft.brandId === brand.id : true;
  const [closing, setClosing] = useState(false);
  const index = STEPS.indexOf(step);

  if (!ready) return null;

  const update = (patch) => setDraft((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <StepIndicator steps={STEP_NAMES} current={index} />
        </div>
        <button type="button" onClick={() => (draft && brand ? setClosing(true) : (window.location.hash = gcHref('sell')))} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-wa-line px-4 text-[15px] font-semibold leading-6 text-wa-text hover:bg-wa-pill">
          <Close size={18} />Close
        </button>
      </div>

      {step === 'brand' && <ChooseBrand setDraft={setDraft} />}
      {brand && step === 'details' && <Details brand={brand} draft={draft} update={update} />}
      {brand && step === 'cards' && <AddCards brand={brand} draft={draft} update={update} />}
      {brand && step === 'review' && <Review brand={brand} draft={draft} update={update} setDraft={setDraft} />}

      {closing && (
        <Modal labelledBy="wa-gc-close" onClose={() => setClosing(false)} className="max-w-[420px]">
          <h3 id="wa-gc-close" className="pr-8 text-2xl font-bold leading-7 text-wa-text">Save this trade for later?</h3>
          <p className="mt-2 text-base leading-6 text-wa-muted">We’ll keep your {brand.name} trade for 24 hours. You can pick it up from the Sell tab.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => { setDraft(null); window.location.hash = gcHref('sell'); }} className={bigOutline}>Discard</button>
            <button type="button" autoFocus onClick={() => { toast('Draft saved'); window.location.hash = gcHref('sell'); }} className={bigPrimary}>Save draft</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ——— GC05 Choose brand ——— */

function BrandOption({ brand, onPick }) {
  const off = brand.sell.notBuying;
  const inner = (
    <>
      <CardArt brand={brand} dim={off} radius="rounded-2xl" className={off ? '' : 'transition-transform duration-300 group-hover:-translate-y-1'}>
        {off && <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-bold leading-5 text-white">Paused</span>}
      </CardArt>
      <span className={cx('mt-3 block text-base font-semibold leading-6', off ? 'text-wa-muted' : 'text-wa-text')}>{brand.name}</span>
      <span className="block text-sm leading-5 text-wa-muted tabular-nums">{off ? 'Not buying now' : `Up to ${ghsRate(bestRate(brand))}/$`}</span>
    </>
  );
  if (off) return <div aria-label={`${brand.name}, not buying now`}>{inner}</div>;
  return <button type="button" onClick={() => onPick(brand)} className="group block w-full text-left">{inner}</button>;
}

function ChooseBrand({ setDraft }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();
  const pick = (brand) => {
    setDraft(freshDraft(brand));
    window.location.hash = gcHref('sell', brand.id);
  };
  // Brands that are buying first
  const matches = SELL_BRANDS.filter((b) => b.name.toLowerCase().includes(term)).sort((a, b) => Number(Boolean(a.sell.notBuying)) - Number(Boolean(b.sell.notBuying)));

  return (
    <section aria-labelledby="wa-gc-pick">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="wa-gc-pick" className="text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text max-sm:text-[26px] max-sm:leading-8">What are you selling?</h2>
        <label className={cx(field, 'flex h-12 w-[320px] items-center gap-3 border-wa-line px-4 text-wa-muted focus-within:border-tab-active focus-within:text-wa-text max-sm:w-full')}>
          <Search size={20} className="shrink-0" />
          <span className="sr-only">Search card brands</span>
          <input type="search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brands" autoComplete="off" className="min-w-0 flex-1 bg-transparent text-base leading-6 text-wa-text outline-none placeholder:text-wa-muted" />
        </label>
      </div>
      {matches.length ? (
        <div className="mt-8 grid grid-cols-4 gap-x-6 gap-y-9 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:gap-x-4 max-sm:gap-y-6">
          {matches.map((b) => <BrandOption key={b.id} brand={b} onPick={pick} />)}
        </div>
      ) : (
        <p className="py-16 text-center text-base leading-6 text-wa-muted">We don’t buy “{query.trim()}” cards yet.</p>
      )}
    </section>
  );
}

/* ——— Payout panel, beside every step after the brand ——— */

// The rate and payout for the card as described so far
function quote(brand, draft) {
  const { country, type, receipt, value, qty } = draft;
  const complete = Boolean(country && type && receipt && value) && !countryPaused(brand, country) && bandIndex(brand, value) >= 0;
  const rate = country && !countryPaused(brand, country) ? sellRate(brand, { country, type: type || brand.sell.types[0], receipt: receipt || 'without', value: value && bandIndex(brand, value) >= 0 ? value : undefined }) : 0;
  const payout = complete ? value * qty * rate : 0;
  return { complete, rate, payout, usdtAmount: payout / GHS_PER_USD };
}

function PayoutPanel({ brand, draft, update, children, locked }) {
  const { complete, rate, payout, usdtAmount } = quote(brand, draft);
  const sym = draft.country ? COUNTRIES[draft.country].symbol : '$';
  const isUsdt = draft.payout.method === 'usdt';
  return (
    <aside className="sticky top-6 rounded-3xl border border-wa-line bg-wa-card p-7 max-lg:static max-sm:p-5" aria-labelledby="wa-gc-payout">
      <h3 id="wa-gc-payout" className="sr-only">Your payout</h3>
      <CardArt brand={brand} value={draft.value && complete ? draft.value : null} country={draft.country || 'US'} radius="rounded-2xl" className="max-lg:hidden" />
      {/* On phones the bottom bar carries the amount and the button; only the USDT switch stays here */}
      <p className="mt-5 text-sm leading-5 text-wa-muted max-lg:hidden">You’ll get</p>
      <p className="max-lg:hidden text-[34px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite" aria-atomic="true">
        {complete ? (isUsdt ? <CountTo value={usdtAmount} format={usdt} /> : <CountTo value={payout} format={ghs} />) : <span className="text-wa-muted">{isUsdt ? usdt(0) : ghs(0)}</span>}
      </p>
      <p className="mt-1 text-sm leading-5 text-wa-muted tabular-nums max-lg:hidden">{rate ? `${ghsRate(rate)} per ${sym}1${locked ? ' · locked on submit' : ''}` : draft.country ? 'Not buying these cards right now' : 'Pick a country to see the rate'}</p>

      {!locked && (
        <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-wa-pill/45 px-4 py-3 max-lg:mt-0">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold leading-5 text-wa-text">
            <img src={usdtIcon} alt="" width="24" height="24" className="size-6" />
            Get paid in USDT
          </span>
          <input type="checkbox" role="switch" checked={isUsdt} onChange={(e) => update({ payout: e.target.checked ? { method: 'usdt' } : { method: 'wallet' } })} className="peer sr-only" />
          <span aria-hidden="true" className="relative h-6 w-10 shrink-0 rounded-full bg-wa-line transition-colors duration-150 peer-checked:bg-tab-active peer-focus-visible:outline-2 peer-focus-visible:outline-tab-active after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
        </label>
      )}
      {locked ? children : <div className="max-lg:hidden">{children}</div>}
    </aside>
  );
}

const layout = 'grid grid-cols-[minmax(0,1fr)_380px] items-start gap-12 max-xl:grid-cols-[minmax(0,1fr)_340px] max-xl:gap-8 max-lg:grid-cols-[minmax(0,1fr)] max-lg:pb-24';

// The step's title, with the brand and a way back to change it
function BrandHeader({ brand, title }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold leading-5 text-wa-muted">
        {brand.name}
        <a href={gcHref('sell', 'new')} className="text-wa-accent hover:underline">Change</a>
      </p>
      <h2 className="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.5px] text-wa-text max-sm:text-2xl max-sm:leading-8">{title}</h2>
    </div>
  );
}

// A short label over its choices; no hint lines
function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-semibold leading-5 text-wa-muted">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/* ——— GC06 Card details ——— */

function Details({ brand, draft, update }) {
  const { country, type, receipt, value, qty } = draft;
  const s = brand.sell;
  const [typed, setTyped] = useState(s.range && value ? String(value) : '');
  const [attempted, setAttempted] = useState(false);
  const today = useToday();
  const online = useOnline();
  const canTrade = useCanTrade();
  const [verify, setVerify] = useState(false);
  const [rules, setRules] = useState(false);
  const { complete, payout } = quote(brand, draft);
  const paused = country && countryPaused(brand, country);
  const sym = country ? COUNTRIES[country].symbol : '$';
  const alternatives = sellCountries(brand).filter((c) => !countryPaused(brand, c));
  const valueBad = value != null && bandIndex(brand, value) < 0;

  const limitError =
    today.open >= LIMITS.maxOpenTrades ? `You have ${LIMITS.maxOpenTrades} trades in review. Wait for one to finish.`
      : complete && today.sold + payout > LIMITS.dailySell ? `This would take you over your daily limit of ${ghs(LIMITS.dailySell)}.`
        : complete && today.completed < LIMITS.newSellerTrades && payout > LIMITS.newSellerCap ? `Your first trades are limited to ${ghs(LIMITS.newSellerCap)} each.`
          : '';
  const missing = !country ? 'country' : !type ? 'type' : !receipt ? 'receipt' : !value ? 'value' : null;
  const ok = complete && !limitError && !paused;

  const next = () => {
    if (!canTrade) return setVerify(true);
    setAttempted(true);
    if (!ok) {
      document.getElementById(`wa-gc-${missing || 'value'}`)?.focus();
      return undefined;
    }
    // One slot per card; keep what's already been added
    update((d) => ({ step: 'cards', cards: Array.from({ length: d.qty }, (_, i) => d.cards[i] || blankCard()) }));
    window.location.hash = gcHref('sell', brand.id, 'cards');
    return undefined;
  };


  return (
    <div className={layout}>
      <div className="grid gap-9">
        <BrandHeader brand={brand} title="About your card" />

        <div id="wa-gc-country" tabIndex={-1}>
          <Field label="Country on the card">
            <Segmented label="Country" options={sellCountries(brand).map((c) => [c, sellCountries(brand).length > 2 ? COUNTRIES[c].short : COUNTRIES[c].name])} value={country} onChange={(c) => update({ country: c })} />
          </Field>
          {paused && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm leading-5 text-wa-muted" role="alert">
              <span className="font-semibold text-down">Not buying {COUNTRIES[country].name} cards right now.</span>
              {alternatives.map((c) => <button key={c} type="button" onClick={() => update({ country: c })} className={chip}>Switch to {COUNTRIES[c].short}</button>)}
            </div>
          )}
          {attempted && !country && <FieldError>Choose a country.</FieldError>}
        </div>

        <div id="wa-gc-type" tabIndex={-1}>
          <Field label="Card type">
            {s.types.length > 1 ? (
              <Segmented label="Card type" options={s.types.map((t) => [t, CARD_TYPES[t]])} value={type} onChange={(t) => update({ type: t })} />
            ) : (
              <p className="text-base font-semibold leading-6 text-wa-text">{CARD_TYPES[s.types[0]]} only</p>
            )}
          </Field>
          {attempted && !type && <FieldError>Choose a card type.</FieldError>}
        </div>

        {s.receipt !== 'none' && (
          <div id="wa-gc-receipt" tabIndex={-1}>
            <Field label="Receipt">
              {receiptMatters(brand) ? (
                <Segmented label="Receipt" options={[['with', 'I have it · better rate'], ['without', 'No receipt']]} value={receipt} onChange={(r) => update({ receipt: r })} />
              ) : (
                <p className="text-base font-semibold leading-6 text-wa-text">Required for this card</p>
              )}
            </Field>
            {attempted && !receipt && <FieldError>Choose one.</FieldError>}
          </div>
        )}

        <div id="wa-gc-value" tabIndex={-1}>
          <Field label="Value">
            {s.values ? (
              <Choices label="Card value" layout="grid grid-cols-5 gap-2 max-sm:grid-cols-3" options={s.values} value={value} onChange={(v) => update({ value: v })} render={(v) => <span className="block text-center text-base tabular-nums">{sym}{v}</span>} />
            ) : (
              <div className={cx(field, fieldBorder(valueBad || (attempted && !value)), 'flex h-14 max-w-[240px] items-center gap-2 px-4')}>
                <span className="text-xl font-semibold text-wa-muted" aria-hidden="true">{sym}</span>
                <input
                  aria-label="Card value"
                  value={typed}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setTyped(raw);
                    update({ value: raw ? Number(raw) : null });
                  }}
                  inputMode="numeric"
                  placeholder={`${s.range[0]}–${s.range[1]}`}
                  className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-wa-text outline-none tabular-nums placeholder:text-wa-muted/50"
                />
              </div>
            )}
          </Field>
          {valueBad && <FieldError>We don’t buy this value.</FieldError>}
          {attempted && !value && <FieldError>Choose a value.</FieldError>}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-wa-line pt-7">
          <div>
            <p className="text-base font-semibold leading-6 text-wa-text">How many cards?</p>
            <button type="button" onClick={() => setRules(true)} className="text-sm font-semibold leading-5 text-wa-accent hover:underline">Card rules</button>
          </div>
          <QtyStepper value={qty} max={LIMITS.maxSellQty} onChange={(q) => update({ qty: q })} />
        </div>
      </div>

      <PayoutPanel brand={brand} draft={draft} update={update}>
        {limitError && <p className="mt-4 flex gap-1.5 text-sm leading-5 text-down" role="alert"><Alert size={16} className="mt-0.5 shrink-0" />{limitError}</p>}
        <button type="button" disabled={!online || Boolean(limitError) || paused} onClick={next} className={cx(bigPrimary, 'mt-5 w-full disabled:pointer-events-none disabled:opacity-50')}>{canTrade ? 'Continue' : 'Verify to sell'}</button>
      </PayoutPanel>
      <MobileBar label="You’ll get" amount={draft.payout.method === 'usdt' ? usdt(payout / GHS_PER_USD) : ghs(payout)} action={canTrade ? 'Continue' : 'Verify to sell'} onAction={next} disabled={!online || Boolean(limitError) || paused} />
      {verify && <VerifyDialog action="sell" onClose={() => setVerify(false)} />}
      {rules && (
        <Modal labelledBy="wa-gc-card-rules" onClose={() => setRules(false)} className="max-w-[440px]">
          <h3 id="wa-gc-card-rules" className="pr-10 text-xl font-semibold leading-7 text-wa-text">{brand.name} card rules</h3>
          <ul className="mt-6 grid gap-4 text-[15px] leading-6 text-wa-text">
            {s.rules.map((r) => <li key={r} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-up" />{r}</li>)}
          </ul>
          <button type="button" onClick={() => setRules(false)} className={cx(bigPrimary, 'mt-6 w-full')}>Got it</button>
        </Modal>
      )}
    </div>
  );
}

/* ——— GC07 Add cards ——— */

function CodeInput({ id, label, value, onChange, groups, error, hint, maxLength }) {
  const paste = async () => {
    try {
      onChange(cleanCode(await navigator.clipboard.readText()).slice(0, maxLength));
    } catch {
      document.getElementById(id)?.focus();
    }
  };
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold leading-5 text-wa-text">{label}</label>
      <div className={cx(field, fieldBorder(error), 'mt-2 flex h-14 items-center gap-2 pl-4 pr-2')}>
        <input
          id={id}
          value={groupCode(value, groups)}
          onChange={(e) => onChange(cleanCode(e.target.value).slice(0, maxLength))}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          placeholder={hint}
          className="min-w-0 flex-1 bg-transparent font-mono text-lg uppercase tracking-[1px] text-wa-text outline-none placeholder:font-nunito placeholder:text-[15px] placeholder:normal-case placeholder:tracking-normal placeholder:text-wa-muted"
        />
        {value ? (
          <button type="button" className={chip} onClick={() => onChange('')}>Clear</button>
        ) : (
          <button type="button" className={chip} onClick={paste}><Clipboard size={16} />Paste</button>
        )}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

// A photo still uploading, or one whose upload failed or was cut off
const photoIssue = (img) => (img.failed ? 'Upload failed. Try again.' : img.uploading ? (Date.now() - img.uploading < 5000 ? 'Still uploading…' : 'Upload failed. Try again.') : '');

function cardIssues(brand, draft, c, all, seen) {
  const index = all.findIndex((o) => o.id === c.id);
  const s = brand.sell;
  const out = {};
  if (draft.type === 'physical') {
    if (!c.front?.data) out.front = 'Add a photo of the front.';
    else if (photoIssue(c.front)) out.front = photoIssue(c.front);
    if (s.back) {
      if (!c.back?.data) out.back = 'Add a photo of the back, where the code is.';
      else if (photoIssue(c.back)) out.back = photoIssue(c.back);
    }
  } else {
    if (!c.code) out.code = `Enter the ${s.code.label.toLowerCase()}.`;
    else if (!s.code.pattern.test(c.code)) out.code = `This doesn’t look like a ${brand.name} code. Check and try again.`;
    else if (all.findIndex((o) => o.code === c.code) < index) out.code = 'You’ve entered this code already.';
    else if (seen.has(c.code)) out.code = 'This card was already submitted.';
    if (s.serial && !/^[A-Z0-9]{8,14}$/.test(c.serial)) out.serial = 'Enter the serial number on the card.';
    if (c.shot && photoIssue(c.shot)) out.shot = photoIssue(c.shot);
  }
  return out;
}

function AddCards({ brand, draft, update }) {
  const s = brand.sell;
  const [trades] = useTrades();
  const [attempted, setAttempted] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const online = useOnline();
  const seen = submittedCodes(trades);
  const cards = draft.cards.length === draft.qty ? draft.cards : Array.from({ length: draft.qty }, (_, i) => draft.cards[i] || blankCard());
  const issues = cards.map((c) => cardIssues(brand, draft, c, cards, seen));
  const receiptIssue = draft.receipt === 'with' && (!draft.receiptImg?.data ? 'Add a photo of the receipt.' : photoIssue(draft.receiptImg));
  const images = [...cards.flatMap((c) => [c.front, c.back, c.shot]), draft.receiptImg].filter((x) => x?.data);
  // An upload older than a few seconds was cut off (the page reloaded); its slot offers a retry
  const uploading = images.filter((x) => x.uploading && Date.now() - x.uploading < 5000).length;
  const complete = issues.every((i) => !Object.keys(i).length) && !receiptIssue;

  // Codes and photo states are checked as they change, so the page goes straight back to Review once fixed
  const setCard = (id, patch) => update((d) => ({ cards: (d.cards.length === d.qty ? d.cards : cards).map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  // The first slot that still needs something, e.g. "Card 2 of 3"
  const next = () => {
    setAttempted(true);
    if (!complete || uploading) {
      const i = issues.findIndex((x) => Object.keys(x).length);
      document.getElementById(i >= 0 ? `wa-gc-card-${i}` : 'wa-gc-receipt-slot')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    update({ step: 'review', cards });
    window.location.hash = gcHref('sell', brand.id, 'review');
  };

  const max = s.code ? s.code.groups.reduce((a, b) => a + b, 0) : 0;
  const physical = draft.type === 'physical';

  return (
    <div className={layout}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-9">
        <div>
          <BrandHeader brand={brand} title={physical ? `Photograph your ${draft.qty === 1 ? 'card' : `${draft.qty} cards`}` : `Enter your ${draft.qty === 1 ? 'code' : `${draft.qty} codes`}`} />
          <p className="mt-2 text-[15px] leading-6 text-wa-muted">{physical ? 'Flat, well lit, code fully visible.' : s.code?.hint}</p>
        </div>

        {cards.map((c, i) => {
          const err = attempted ? issues[i] : {};
          const label = `Card ${i + 1} of ${draft.qty}`;
          const ready = !Object.keys(issues[i]).length;
          return (
            <section key={c.id} id={`wa-gc-card-${i}`} aria-label={label} className={cx(draft.qty > 1 && 'border-t border-wa-line pt-7')}>
              {draft.qty > 1 && (
                <p className="mb-4 flex items-center justify-between text-sm font-semibold leading-5 text-wa-muted">
                  Card {i + 1}
                  {ready && <span className="inline-flex items-center gap-1 text-up"><Check size={16} />Ready</span>}
                </p>
              )}
              {physical ? (
                <div className={cx('grid gap-4', s.back && 'grid-cols-2 max-md:grid-cols-[minmax(0,1fr)]')}>
                  <PhotoSlot id={`wa-gc-${c.id}-front`} label="Front" value={c.front} onChange={(v) => setCard(c.id, { front: v })} required error={err.front} compact />
                  {s.back && <PhotoSlot id={`wa-gc-${c.id}-back`} label="Back, with code" value={c.back} onChange={(v) => setCard(c.id, { back: v })} required error={err.back} compact />}
                </div>
              ) : (
                <div className="grid gap-3">
                  <CodeInput id={`wa-gc-${c.id}-code`} label={s.code.label} value={c.code} onChange={(v) => setCard(c.id, { code: v })} groups={s.code.groups} maxLength={max} hint={s.code.label} error={(attempted || c.code.length >= max) && issues[i].code} />
                  {s.serial && <CodeInput id={`wa-gc-${c.id}-serial`} label="Serial number" value={c.serial} onChange={(v) => setCard(c.id, { serial: v })} groups={[4, 4, 4, 2]} maxLength={14} hint="Serial number" error={err.serial} />}
                  {c.shot ? (
                    <PhotoSlot id={`wa-gc-${c.id}-shot`} label="Screenshot" value={c.shot} onChange={(v) => setCard(c.id, { shot: v })} compact error={err.shot} />
                  ) : (
                    <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text">
                      <Plus size={16} />Add a screenshot (optional)
                      <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) { const photo = await readPhoto(f); setCard(c.id, { shot: { data: photo.data } }); } }} />
                    </label>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {draft.receipt === 'with' && (
          <section id="wa-gc-receipt-slot" className="max-w-[480px] border-t border-wa-line pt-7">
            <PhotoSlot id="wa-gc-receipt-photo" label="Store receipt" value={draft.receiptImg} onChange={(v) => update({ receiptImg: v })} required error={attempted && receiptIssue} compact />
          </section>
        )}

        {noteOpen || draft.note ? (
          <textarea aria-label="Note to the reviewer" autoFocus={noteOpen && !draft.note} rows={2} maxLength={200} value={draft.note} onChange={(e) => update({ note: e.target.value })} placeholder="Note to the reviewer (optional)" className={cx(field, 'block w-full resize-none border-wa-line px-4 py-3 text-[15px] leading-6 text-wa-text outline-none placeholder:text-wa-muted focus:border-tab-active')} />
        ) : (
          <button type="button" onClick={() => setNoteOpen(true)} className="inline-flex w-fit items-center gap-2 text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text"><Plus size={16} />Add a note for the reviewer</button>
        )}
      </div>

      <PayoutPanel brand={brand} draft={draft} update={update}>
        <button type="button" disabled={!online || uploading > 0} onClick={next} className={cx(bigPrimary, 'mt-5 w-full disabled:pointer-events-none disabled:opacity-60')}>
          {uploading ? `Uploading ${images.length - uploading + 1} of ${images.length}…` : 'Continue'}
        </button>
      </PayoutPanel>
      <MobileBar label={uploading ? 'Uploading photos…' : `${draft.qty} ${draft.qty === 1 ? 'card' : 'cards'} · ${face(draft.country, draft.value)} each`} amount={ghs(quote(brand, draft).payout)} action="Continue" onAction={next} disabled={!online || uploading > 0} />
    </div>
  );
}

/* ——— GC08 Review and submit ——— */

function Review({ brand, draft, update, setDraft }) {
  const [accounts] = usePaymentAccounts();
  const payouts = accounts.filter((a) => canUse(a, 'sell'));
  const [trades, setTrades] = useTrades();
  const notify = useNotify();
  const online = useOnline();
  const { complete, rate, payout, usdtAmount } = quote(brand, draft);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const seen = submittedCodes(trades);
  const cardsOk = draft.cards.length === draft.qty && draft.cards.every((c) => !Object.keys(cardIssues(brand, draft, c, draft.cards, seen)).length);

  // Review needs finished cards; a reload or deep link goes back to the step that's missing
  useEffect(() => {
    if (!complete) window.location.replace(gcHref('sell', brand.id));
    else if (!cardsOk) window.location.replace(gcHref('sell', brand.id, 'cards'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const method = draft.payout.method;
  const momoAccount = payouts.find((a) => a.id === draft.payout.accountId) || payouts[0];
  const options = [
    { id: 'wallet', label: 'GHS wallet', detail: 'Instant', icon: <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><Wallet size={18} /></span> },
    { id: 'usdt', label: 'USDT', detail: `≈ ${usdt(usdtAmount)}`, icon: <img src={usdtIcon} alt="" width="36" height="36" className="size-9 shrink-0" /> },
    ...(payouts.length ? [{ id: 'momo', label: 'Mobile money', detail: payouts.length === 1 ? `${accountLabel(payouts[0])} · ${maskNumber(payouts[0].number)}` : 'Usually minutes', icon: <ProviderLogo id={momoAccount.provider} size={36} /> }] : []),
  ];
  const paidTo = method === 'momo' && momoAccount ? `${accountLabel(momoAccount)} ${momoAccount.number.slice(-4)}` : method === 'usdt' ? 'USDT' : 'GHS wallet';
  const sym = COUNTRIES[draft.country].symbol;
  const reviewNow = inReviewHours();

  const submit = () => {
    setAttempted(true);
    if (!draft.owned) {
      document.getElementById('wa-gc-owned')?.focus();
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const at = Date.now();
      const trade = {
        id: newId('TR'),
        brand: brand.id,
        country: draft.country,
        type: draft.type,
        receipt: draft.receipt,
        value: draft.value,
        qty: draft.qty,
        rate,
        expected: Math.round(payout * 100) / 100,
        usdtAmount: method === 'usdt' ? usdtAmount : undefined,
        cards: draft.cards.map((c) => ({ id: c.id, value: draft.value, code: c.code || undefined, serial: c.serial || undefined, thumb: c.back?.data || c.front?.data || c.shot?.data || null })),
        receiptImg: Boolean(draft.receiptImg),
        payout: draft.payout,
        note: draft.note.trim(),
        status: 'submitted',
        history: [{ status: 'submitted', at }],
      };
      setTrades((list) => [trade, ...list]);
      setDraft(null);
      notify(['We’re reviewing your ', `${brand.name} card`, '. We’ll tell you the moment it’s done.'], gcHref('trade', trade.id));
      window.location.replace(gcHref('trade', trade.id));
      toast('Trade submitted');
    }, 1200);
  };

  if (!complete || !cardsOk) return null;

  return (
    <div className={layout}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
        <section aria-labelledby="wa-gc-sum">
          <BrandHeader brand={brand} title="Review and submit" />
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] leading-6 text-wa-text">
            <span>{COUNTRIES[draft.country].name}</span>
            <span className="text-wa-muted">·</span>
            <span>{CARD_TYPES[draft.type]}{draft.receipt === 'with' ? ' with receipt' : ''}</span>
            <span className="text-wa-muted">·</span>
            <span className="tabular-nums">{sym}{draft.value} × {draft.qty}</span>
            <a href={gcHref('sell', brand.id)} className="ml-auto text-sm font-semibold text-wa-accent hover:underline">Edit</a>
          </div>
          <ul className="mt-5 flex flex-wrap gap-3">
            {draft.cards.map((c, i) => (
              <li key={c.id} className="w-[148px] overflow-hidden rounded-xl border border-wa-line">
                {c.back?.data || c.front?.data || c.shot?.data ? (
                  <img src={(c.back || c.front || c.shot).data} alt={`Card ${i + 1}`} className="aspect-[5/3] w-full object-cover" />
                ) : (
                  <CardArt brand={brand} radius="rounded-none" shadow="" />
                )}
                {c.code && <p className="px-3 py-2 font-mono text-xs leading-5 text-wa-muted">{maskCode(c.code)}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="wa-gc-to">
          <h2 id="wa-gc-to" className="text-lg font-semibold leading-7 text-wa-text">Pay me to</h2>
          <div className="mt-4">
            <PayOptions
              label="Receive to"
              options={options}
              accounts={payouts}
              value={{ kind: method, accountId: draft.payout.accountId }}
              onChange={(v) => update({ payout: v.kind === 'momo' ? { method: 'momo', accountId: v.accountId } : { method: v.kind } })}
              renderAccount={(a) => `${accountLabel(a)} · ${maskNumber(a.number)}`}
            />
          </div>
        </section>

        <p className="flex gap-3 text-sm leading-5 text-wa-muted">
          <Shield size={18} className="mt-px shrink-0 text-wa-warn" />
          <span>Asked to buy this card to pay someone? That’s a scam. {reviewNow ? `Review takes about ${brand.sell.median || 15} min.` : 'Review starts at 08:00.'}</span>
        </p>
      </div>

      <PayoutPanel brand={brand} draft={draft} update={update} locked>
        <dl className="mt-5 grid gap-2 border-t border-wa-line pt-4 max-lg:mt-0 max-lg:border-t-0 max-lg:pt-0">
          <Row label="Paid to">{paidTo}</Row>
        </dl>
        {/* The promise sits right by the button it unlocks */}
        <label className={cx('mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-5 text-wa-text', attempted && !draft.owned ? 'border-down' : 'border-wa-line')}>
          <input id="wa-gc-owned" type="checkbox" checked={draft.owned} onChange={(e) => update({ owned: e.target.checked })} className="mt-0.5 size-[18px] shrink-0 accent-tab-active" />
          This card is mine and unused.
        </label>
        {attempted && !draft.owned && <FieldError>Confirm the card is yours.</FieldError>}
        <button type="button" disabled={!online || submitting} onClick={submit} className={cx(bigPrimary, 'mt-5 w-full disabled:pointer-events-none disabled:opacity-60 max-lg:hidden')}>
          {submitting ? <><span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Submitting your trade…</> : 'Submit trade'}
        </button>
      </PayoutPanel>
      <MobileBar label="You’ll get" amount={method === 'usdt' ? usdt(usdtAmount) : ghs(payout)} action={submitting ? 'Submitting…' : 'Submit trade'} onAction={submit} disabled={!online || submitting} />
    </div>
  );
}

