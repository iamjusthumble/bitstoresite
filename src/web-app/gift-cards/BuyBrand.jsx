import React, { useState } from 'react';
import { links } from '../../links.js';
import { cx } from '../../ui.js';
import { FieldError, Modal, bigOutline, bigPrimary, field, fieldBorder } from '../flow.jsx';
import { Alert, ExternalLink, Globe, Shield } from '../icons.jsx';
import { BUY_SERVICE_FEE, COUNTRIES, LIMITS, buyCountries, buyPrice, face, gcHref, ghs, stockFor } from './catalog.js';
import { useBuyNow, useCanTrade, useCart, useOnline, useToday } from './store.js';
import { ghsShort } from './Hub.jsx';
import { CardArt, Choices, Group, MobileBar, QtyStepper, Segmented, VerifyDialog, toast } from './ui.jsx';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

// Local date-time string for <input type="datetime-local">
const localInput = (ms) => {
  const d = new Date(ms);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function BuyBrand({ brand }) {
  const countries = buyCountries(brand);
  const [country, setCountry] = useState(countries[0]);
  const conf = brand.buy[country];
  const firstInStock = conf.denoms.find((v) => stockFor(brand, country, v) > 0);
  const [value, setValue] = useState(conf.denoms.includes(50) && stockFor(brand, country, 50) > 0 ? 50 : firstInStock ?? null);
  const [custom, setCustom] = useState('');
  const [qty, setQty] = useState(1);
  const [forWho, setForWho] = useState('me');
  const [gift, setGift] = useState({ name: '', contact: '', message: '', when: 'now', at: '' });
  const [attempted, setAttempted] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [cart, setCart] = useCart();
  const [, setBuyNow] = useBuyNow();
  const canTrade = useCanTrade();
  const online = useOnline();
  const today = useToday();

  const isCustom = value === 'custom';
  const amount = isCustom ? Number(custom) || 0 : value || 0;
  const stock = isCustom ? Infinity : stockFor(brand, country, value);
  const maxQty = Math.max(1, Math.min(LIMITS.maxBuyQty, stock));
  const unit = amount ? buyPrice(country, amount) : 0;
  const fee = amount ? BUY_SERVICE_FEE : 0;
  const total = unit * qty + fee;
  const sym = COUNTRIES[country].symbol;

  const pickCountry = (c) => {
    setCountry(c);
    const next = brand.buy[c];
    setValue(next.denoms.find((v) => stockFor(brand, c, v) > 0) ?? null);
    setCustom('');
    setQty(1);
  };

  const errors = {
    amount: !value ? 'Choose an amount.' : isCustom && (amount < conf.custom[0] || amount > conf.custom[1] || !Number.isInteger(amount)) ? `Enter an amount between ${sym}${conf.custom[0]} and ${sym}${conf.custom[1]}.` : '',
    name: forWho === 'gift' && !gift.name.trim() ? 'Enter the recipient’s name.' : '',
    contact: forWho === 'gift' && !(EMAIL.test(gift.contact.trim()) || PHONE.test(gift.contact.trim())) ? (gift.contact.trim() ? 'Enter a valid email or phone number.' : 'Enter an email or phone number.') : '',
    at: forWho === 'gift' && gift.when === 'later' && !(gift.at && new Date(gift.at).getTime() > Date.now()) ? 'Pick a date and time in the future.' : '',
    limit: today.bought + total > LIMITS.dailyBuy ? `This is above your daily gift card limit of ${ghs(LIMITS.dailyBuy)}.` : '',
  };
  const valid = !Object.values(errors).some(Boolean);
  const outOfStock = conf.denoms.every((v) => stockFor(brand, country, v) === 0) && !conf.custom;

  const item = () => ({
    key: `${Date.now()}`,
    brand: brand.id,
    country,
    value: amount,
    qty,
    gift: forWho === 'gift' ? { name: gift.name.trim(), contact: gift.contact.trim(), message: gift.message.trim(), when: gift.when === 'later' ? new Date(gift.at).toISOString() : 'now' } : null,
  });

  const go = (action) => {
    if (!canTrade) {
      setDialog('verify');
      return;
    }
    setAttempted(true);
    if (!valid) {
      const first = ['amount', 'name', 'contact', 'at'].find((k) => errors[k]);
      document.getElementById(`wa-gc-${first}`)?.focus();
      return;
    }
    // High-risk brands bought for someone else get a scam check first
    if (forWho === 'gift' && brand.scamRisk) {
      setDialog({ scam: action });
      return;
    }
    finish(action);
  };

  const finish = (action) => {
    setDialog(null);
    if (action === 'now') {
      setBuyNow(item());
      window.location.hash = gcHref('checkout', 'now');
      return;
    }
    if (cart.length >= LIMITS.maxCartItems) {
      toast(`Your cart is full (${LIMITS.maxCartItems} items)`);
      return;
    }
    const next = item();
    setCart((list) => {
      // The same card for yourself adds to the line already in the cart
      const same = !next.gift && list.find((i) => !i.gift && i.brand === next.brand && i.country === next.country && i.value === next.value);
      if (same) return list.map((i) => (i === same ? { ...i, qty: Math.min(LIMITS.maxBuyQty, i.qty + next.qty) } : i));
      return [...list, next];
    });
    toast('Added to cart', { label: 'View cart', run: () => { window.location.hash = gcHref('checkout'); } });
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_440px] items-start gap-12 max-xl:grid-cols-[minmax(0,1fr)_400px] max-xl:gap-8 max-lg:grid-cols-[minmax(0,1fr)] max-lg:pb-24">
      {/* The card itself, with the one thing people get wrong: the region */}
      <div className="sticky top-6 max-lg:static">
        <CardArt brand={brand} sheen value={amount || null} country={country} radius="rounded-3xl" shadow="shadow-[0_32px_64px_-28px_rgba(0,0,0,0.7)]" />
        <h2 className="mt-8 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text max-sm:mt-6 max-sm:text-[26px] max-sm:leading-8">{brand.name}</h2>
        <p className="mt-2 inline-flex items-center gap-2 text-[15px] leading-6 text-wa-muted">
          <Globe size={18} className="text-wa-accent" />
          Works on {COUNTRIES[country].name} accounts only
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold leading-5">
          <button type="button" onClick={() => setDialog('redeem')} className="text-wa-accent hover:underline">How to redeem</button>
          <a href={links.terms} target="_blank" rel="noreferrer" className="text-wa-muted hover:text-wa-text">Terms</a>
        </div>
      </div>

      <section className="rounded-3xl border border-wa-line bg-wa-card p-8 max-sm:p-5" aria-label="Choose your card">
        <div className="grid gap-8">
          {countries.length > 1 && (
            <Group label="Country">
              <Segmented label="Country" options={countries.map((c) => [c, COUNTRIES[c].name])} value={country} onChange={pickCountry} />
            </Group>
          )}

          <Group label="Amount">
            {outOfStock ? (
              <p className="text-[15px] leading-6 text-wa-muted">Out of stock right now.</p>
            ) : (
              <div id="wa-gc-amount" tabIndex={-1}>
                <Choices
                  label="Amount"
                  // Four options sit in one row; otherwise three per row
                  layout={conf.denoms.length + (conf.custom ? 1 : 0) === 4 ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-3 gap-2'}
                  options={[...conf.denoms, ...(conf.custom ? ['custom'] : [])]}
                  value={value}
                  onChange={(v) => { setValue(v); setQty(1); }}
                  disabled={(v) => v !== 'custom' && stockFor(brand, country, v) === 0}
                  render={(v) => (
                    <span className="block text-center text-base tabular-nums">{v === 'custom' ? 'Other' : face(country, v)}</span>
                  )}
                />
              </div>
            )}
            {isCustom && (
              <div className={cx(field, fieldBorder(attempted && errors.amount), 'mt-3 flex h-14 items-center gap-2 px-4')}>
                <span className="text-xl font-semibold text-wa-muted" aria-hidden="true">{sym}</span>
                <input id="wa-gc-custom" aria-label="Card value" autoFocus value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder={`${conf.custom[0]}–${conf.custom[1]}`} className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-wa-text outline-none tabular-nums placeholder:text-wa-muted/50" />
              </div>
            )}
            <FieldError>{attempted && errors.amount}</FieldError>
            {Number.isFinite(stock) && stock > 0 && stock < 10 && <p className="mt-2 text-sm font-semibold leading-5 text-wa-warn">Only {stock} left</p>}
          </Group>

          <div className="flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-stretch">
            <Group label="For" className="min-w-0 flex-1">
              <Segmented label="Who it’s for" options={[['me', 'Me'], ['gift', 'A gift']]} value={forWho} onChange={setForWho} />
            </Group>
            <Group label="Quantity">
              <QtyStepper value={qty} max={maxQty} onChange={setQty} />
            </Group>
          </div>

          {forWho === 'gift' && (
            <div className="grid animate-[fade-in_0.2s_ease-out] gap-3">
              <TextField id="wa-gc-name" label="Their name" value={gift.name} max={50} onChange={(v) => setGift({ ...gift, name: v })} error={attempted && errors.name} />
              <TextField id="wa-gc-contact" label="Email or phone" value={gift.contact} max={60} onChange={(v) => setGift({ ...gift, contact: v })} error={attempted && errors.contact} />
              <textarea aria-label="Message (optional)" rows={2} maxLength={200} value={gift.message} onChange={(e) => setGift({ ...gift, message: e.target.value })} placeholder="Add a message (optional)" className={cx(field, 'block w-full resize-none border-wa-line px-4 py-3 text-[15px] leading-6 text-wa-text outline-none placeholder:text-wa-muted focus:border-tab-active')} />
              <Segmented label="Delivery" options={[['now', 'Send now'], ['later', 'Schedule']]} value={gift.when} onChange={(w) => setGift({ ...gift, when: w, at: w === 'later' && !gift.at ? localInput(Date.now() + 86400000) : gift.at })} />
              {gift.when === 'later' && (
                <>
                  <input id="wa-gc-at" aria-label="Delivery date and time" type="datetime-local" value={gift.at} min={localInput(Date.now() + 5 * 60000)} max={localInput(Date.now() + 30 * 86400000)} onChange={(e) => setGift({ ...gift, at: e.target.value })} className={cx(field, fieldBorder(attempted && errors.at), 'h-12 w-full px-4 text-[15px] text-wa-text outline-none')} />
                  <FieldError>{attempted && errors.at}</FieldError>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-wa-line pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[15px] leading-6 text-wa-muted">Total</span>
            <span className="text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">{ghs(total)}</span>
          </div>
          {attempted && errors.limit && <p className="mt-2 flex gap-1.5 text-sm leading-5 text-down"><Alert size={16} className="mt-0.5 shrink-0" />{errors.limit}</p>}
          {canTrade ? (
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              <button type="button" disabled={!online || outOfStock} onClick={() => go('cart')} className={cx(bigOutline, 'disabled:pointer-events-none disabled:opacity-50')}>Add to cart</button>
              <button type="button" disabled={!online || outOfStock} onClick={() => go('now')} className={cx(bigPrimary, 'disabled:pointer-events-none disabled:opacity-50')}>Buy now</button>
            </div>
          ) : (
            <button type="button" onClick={() => setDialog('verify')} className={cx(bigPrimary, 'mt-6 w-full')}>Verify to buy</button>
          )}
          <p className="mt-4 text-center text-xs leading-4 text-wa-muted">No refunds once the code is shown</p>
        </div>
      </section>

      <MobileBar label={amount ? `${face(country, amount)}${qty > 1 ? ` × ${qty}` : ''}` : 'Total'} amount={ghs(total)} action={!canTrade ? 'Verify to buy' : outOfStock ? 'Out of stock' : 'Buy now'} onAction={() => (canTrade ? go('now') : setDialog('verify'))} disabled={canTrade && (!online || outOfStock)} />
      {dialog === 'verify' && <VerifyDialog onClose={() => setDialog(null)} />}
      {dialog === 'redeem' && (
        <Modal labelledBy="wa-gc-redeem" onClose={() => setDialog(null)} className="max-w-[440px]">
          <h3 id="wa-gc-redeem" className="pr-10 text-xl font-semibold leading-7 text-wa-text">How to redeem {brand.name}</h3>
          <ol className="mt-6 grid gap-4 text-[15px] leading-6 text-wa-text">
            {brand.redeem.map((step, i) => (
              <li key={step} className="flex gap-3"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-wa-pill text-xs font-bold text-wa-muted">{i + 1}</span>{step}</li>
            ))}
          </ol>
          {brand.redeemUrl && <a href={brand.redeemUrl} target="_blank" rel="noreferrer" className={cx(bigOutline, 'mt-6 w-full')}>Open {brand.name}<ExternalLink size={18} /></a>}
        </Modal>
      )}
      {dialog?.scam && (
        <Modal labelledBy="wa-gc-scam" onClose={() => setDialog(null)} className="max-w-[420px]">
          <span className="grid size-12 place-items-center rounded-full bg-wa-warn/15 text-wa-warn"><Shield size={24} /></span>
          <h3 id="wa-gc-scam" className="mt-5 pr-8 text-2xl font-bold leading-7 text-wa-text">Do you know them?</h3>
          <p className="mt-3 text-base leading-6 text-wa-muted">Never buy gift cards to pay a stranger, a romance contact or anyone posing as an official.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setDialog(null)} className={bigOutline}>Go back</button>
            <button type="button" onClick={() => finish(dialog.scam)} className={bigPrimary}>I know them</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TextField({ id, label, value, onChange, error, placeholder, max }) {
  return (
    <div>
      <input id={id} aria-label={label} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label} aria-invalid={Boolean(error)} className={cx(field, fieldBorder(error), 'block h-12 w-full px-4 text-[15px] text-wa-text outline-none placeholder:text-wa-muted')} />
      <FieldError>{error}</FieldError>
    </div>
  );
}
