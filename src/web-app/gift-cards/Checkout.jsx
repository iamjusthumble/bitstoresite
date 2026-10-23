import React, { useEffect, useState } from 'react';
import { useMarketData } from '../../marketData.js';
import { cx } from '../../ui.js';
import { HOLDINGS } from '../demoData.js';
import { FieldError, Modal, Radio, Row, bigOutline, bigPrimary, choice, field, fieldBorder } from '../flow.jsx';
import { Alert, Close, Plus, Wallet } from '../icons.jsx';
import { ProviderLogo, accountLabel, canUse, maskNumber, usePaymentAccounts } from '../paymentAccounts.jsx';
import { card, cardTitle } from '../parts.jsx';
import usdtIcon from '../../assets/coin-usdt.svg';
import { BUY_SERVICE_FEE, GHS_PER_USD, LIMITS, brandById, buyPrice, face, gcHref, ghs, stockFor, usdt } from './catalog.js';
import { itemPrice, makeCodes, newId, useBuyNow, useCanTrade, useCart, useGhsBalance, useOnline, useOrders } from './store.js';
import { CardArt, MobileBar, PayOptions, QtyStepper, VerifyDialog, dateTime, toast } from './ui.jsx';

// Sample promo codes (PRD: promos are an assumption)
const PROMOS = { WELCOME5: { off: 0.05, cap: 50 }, GIFT10: { expired: true } };

const unavailable = (item) => Boolean(brandById[item.brand].paused) || stockFor(brandById[item.brand], item.country, item.value) < item.qty;

export default function Checkout({ now }) {
  const [cart, setCart] = useCart();
  const [buyNow, setBuyNow] = useBuyNow();
  const items = now ? (buyNow ? [buyNow] : []) : cart;
  const setItems = now ? (fn) => setBuyNow((b) => (typeof fn === 'function' ? fn(b ? [b] : [])[0] || null : fn[0] || null)) : setCart;

  const [accounts] = usePaymentAccounts();
  const payAccounts = accounts.filter((a) => canUse(a, 'buy'));
  const [balance, setBalance] = useGhsBalance();
  const [, setOrders] = useOrders();
  const { coins } = useMarketData();
  const canTrade = useCanTrade();
  const online = useOnline();

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [method, setMethod] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [step, setStep] = useState(null); // confirm → paying | momo
  const [leaving, setLeaving] = useState(null);
  const [verify, setVerify] = useState(false);

  const subtotal = items.reduce((s, i) => s + itemPrice(i), 0);
  const fee = items.length ? BUY_SERVICE_FEE : 0;
  const discount = promo ? Math.min(promo.cap, subtotal * promo.off) : 0;
  const total = Math.max(0, subtotal + fee - discount);
  const usdtPrice = coins.tether?.price || 1;
  const usdtNeeded = total / GHS_PER_USD / usdtPrice;
  const usdtBalance = (HOLDINGS.find((h) => h.id === 'tether')?.value || 0) / usdtPrice;
  const blocked = items.some(unavailable);

  // Three ways to pay; mobile money is one option whose saved numbers are picked from a menu
  const walletOk = balance >= total;
  const usdtOk = usdtBalance >= usdtNeeded;
  const momoAccount = payAccounts.find((a) => a.id === method?.accountId) || payAccounts[0];
  const options = [
    { id: 'wallet', label: 'GHS wallet', detail: ghs(balance), disabled: !walletOk, note: !walletOk && <a href="#deposit/fiat" className="text-sm font-semibold text-wa-accent hover:underline">Top up</a>, icon: <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><Wallet size={18} /></span> },
    { id: 'usdt', label: 'USDT', detail: `≈ ${usdt(usdtNeeded)}`, disabled: !usdtOk, icon: <img src={usdtIcon} alt="" width="36" height="36" className="size-9 shrink-0" /> },
    ...(payAccounts.length ? [{ id: 'momo', label: 'Mobile money', detail: payAccounts.length === 1 ? `${accountLabel(payAccounts[0])} · ${maskNumber(payAccounts[0].number)}` : undefined, icon: <ProviderLogo id={momoAccount.provider} size={36} /> }] : []),
  ];
  const chosen =
    method?.kind === 'wallet' && walletOk ? { id: 'wallet', label: 'GHS wallet' }
      : method?.kind === 'usdt' && usdtOk ? { id: 'usdt', label: 'USDT' }
        : method?.kind === 'momo' && momoAccount ? { id: 'momo', label: accountLabel(momoAccount), momo: momoAccount }
          : null;
  const [promoOpen, setPromoOpen] = useState(false);

  // Default to the wallet when it covers the total
  useEffect(() => {
    if (!method && walletOk && total > 0) setMethod({ kind: 'wallet' });
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    const p = PROMOS[code];
    if (!code) return;
    if (!p) setPromoError('This code isn’t valid.');
    else if (p.expired) setPromoError('This code has expired.');
    else {
      setPromo({ code, ...p });
      setPromoError('');
      toast(`${code} applied`);
    }
  };

  const remove = (item) => {
    setLeaving(item.key);
    setTimeout(() => {
      setLeaving(null);
      setItems((list) => list.filter((i) => i.key !== item.key));
      if (!now) toast('Removed from cart', { label: 'Undo', run: () => setCart((list) => [...list, item]) });
    }, 200);
  };

  const setQty = (item, qty) => setItems((list) => list.map((i) => (i.key === item.key ? { ...i, qty } : i)));

  const pay = () => {
    if (!canTrade) return setVerify(true);
    setAttempted(true);
    if (!chosen || blocked || !items.length) {
      document.getElementById('wa-gc-pay')?.focus();
      return undefined;
    }
    setStep('confirm');
    return undefined;
  };

  const placeOrder = () => {
    const at = Date.now();
    const slow = items.some((i) => brandById[i.brand].slow);
    const order = {
      id: newId('GC'),
      at,
      readyAt: at + (slow ? 9000 : 2500),
      items: items.map((i) => ({ ...i, codes: makeCodes(i) })),
      pay: chosen.momo ? { kind: 'momo', accountId: chosen.momo.id } : { kind: chosen.id },
      subtotal,
      fee,
      discount,
      total,
      promo: promo?.code,
    };
    if (chosen.id === 'wallet') setBalance((b) => b - total);
    setOrders((list) => [order, ...list]);
    if (now) setBuyNow(null);
    else setCart([]);
    window.location.replace(gcHref('order', order.id));
  };

  const confirm = () => {
    if (chosen.momo) {
      setStep('momo');
      return;
    }
    setStep('paying');
    setTimeout(placeOrder, 1200);
  };

  // The preview has no MoMo network: the prompt is "approved" after a few seconds
  useEffect(() => {
    if (step !== 'momo') return undefined;
    const t = setTimeout(placeOrder, 6000);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!items.length) {
    return (
      <section className="grid place-items-center rounded-2xl border border-wa-line bg-wa-card px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-wa-pill text-wa-accent">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></svg>
        </span>
        <h2 className="mt-6 text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">Your cart is empty</h2>
        <p className="mt-2 max-w-[400px] text-base leading-6 text-wa-muted">Add a gift card and it will wait here for 7 days.</p>
        <a href={gcHref('buy')} className={cx(bigPrimary, 'mt-8')}>Browse gift cards</a>
      </section>
    );
  }

  const recipients = [...new Set(items.map((i) => (i.gift ? i.gift.name : 'You')))];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-12 max-xl:grid-cols-[minmax(0,1fr)_340px] max-xl:gap-8 max-lg:grid-cols-[minmax(0,1fr)] max-lg:pb-24">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
        <section aria-labelledby="wa-gc-items">
          <div className="flex items-center justify-between gap-4">
            <h2 id="wa-gc-items" className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">{now ? 'Checkout' : 'Your cart'}</h2>
            <a href={gcHref('buy')} className="inline-flex items-center gap-1.5 text-[15px] font-semibold leading-6 text-wa-muted hover:text-wa-text"><Plus size={16} />Add more</a>
          </div>
          <ul className="mt-4 divide-y divide-wa-line">
            {items.map((item) => {
              const brand = brandById[item.brand];
              const gone = unavailable(item);
              return (
                <li key={item.key} className={cx('flex items-center gap-5 py-5 transition-[opacity,translate] duration-200 max-sm:gap-3', leaving === item.key && 'translate-x-6 opacity-0')}>
                  <a href={gcHref('buy', brand.id)} className="shrink-0"><CardArt brand={brand} dim={gone} className="w-28 max-sm:w-20" radius="rounded-xl" /></a>
                  <div className="min-w-0 flex-1">
                    <p className={cx('truncate text-base font-semibold leading-6', gone ? 'text-wa-muted' : 'text-wa-text')}>{brand.name} {face(item.country, item.value)}</p>
                    <p className={cx('truncate text-sm leading-5', gone ? 'font-semibold text-down' : 'text-wa-muted')}>
                      {gone ? 'No longer available' : item.gift ? `Gift to ${item.gift.name}${item.gift.when !== 'now' ? ` · ${dateTime(new Date(item.gift.when))}` : ''}` : ghs(itemPrice(item))}
                    </p>
                  </div>
                  {!gone && <QtyStepper size="sm" value={item.qty} max={Math.min(LIMITS.maxBuyQty, stockFor(brand, item.country, item.value))} onChange={(q) => setQty(item, q)} label={`Quantity of ${brand.name}`} />}
                  <button type="button" onClick={() => remove(item)} aria-label={`Remove ${brand.name} ${face(item.country, item.value)}`} className="grid size-9 shrink-0 place-items-center rounded-full text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-down">
                    <Close size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="wa-gc-paywith">
          <h2 id="wa-gc-paywith" className="text-lg font-semibold leading-7 text-wa-text">Pay with</h2>
          <div id="wa-gc-pay" tabIndex={-1} className="mt-4">
            <PayOptions label="Pay with" options={options} accounts={payAccounts} value={method} onChange={setMethod} renderAccount={(a) => `${accountLabel(a)} · ${maskNumber(a.number)}`} />
          </div>
          {attempted && !chosen && <FieldError>Choose how to pay.</FieldError>}
        </section>
      </div>

      <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-gc-totals">
        <h3 id="wa-gc-totals" className={cardTitle}>Summary</h3>
        <dl className="mt-5 grid gap-2">
          <Row label="Subtotal">{ghs(subtotal)}</Row>
          {fee > 0 && <Row label="Service fee">{ghs(fee)}</Row>}
          {discount > 0 && <Row label={`Promo ${promo.code}`}><span className="text-up">−{ghs(discount)}</span></Row>}
          <div className="mt-3 border-t border-wa-line pt-4">
            <Row label="Total" strong>{ghs(total)}</Row>
          </div>
        </dl>
        {chosen?.id === 'usdt' && <p className="mt-2 text-sm leading-5 text-wa-muted tabular-nums">You pay ≈ {usdt(usdtNeeded)}</p>}
        {!promo && (promoOpen ? (
          <div className="mt-5">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="wa-gc-promo-code">Promo code</label>
              <input id="wa-gc-promo-code" autoFocus value={promoInput} onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }} onKeyDown={(e) => e.key === 'Enter' && applyPromo()} placeholder="Promo code" className={cx(field, fieldBorder(promoError), 'h-11 min-w-0 flex-1 px-4 text-[15px] uppercase text-wa-text outline-none placeholder:normal-case placeholder:text-wa-muted')} />
              <button type="button" onClick={applyPromo} className="h-11 rounded-full bg-wa-pill px-5 text-[15px] font-bold text-wa-text hover:bg-wa-pill-hover">Apply</button>
            </div>
            <FieldError>{promoError}</FieldError>
          </div>
        ) : (
          <button type="button" onClick={() => setPromoOpen(true)} className="mt-4 text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text">Have a promo code?</button>
        ))}
        <button type="button" disabled={!online || blocked} onClick={pay} className={cx(bigPrimary, 'mt-6 w-full disabled:pointer-events-none disabled:opacity-50')}>
          {canTrade ? `Pay ${ghs(total)}` : 'Verify to buy'}
        </button>
        <p className="mt-3 text-center text-xs leading-4 text-wa-muted">Gift cards can’t be refunded once the code is shown.</p>
      </aside>

      <MobileBar label={chosen ? `Pay with ${chosen.label}` : 'Total'} amount={ghs(total)} action={canTrade ? 'Pay' : 'Verify to buy'} onAction={pay} disabled={!online || blocked} />
      {verify && <VerifyDialog onClose={() => setVerify(false)} />}

      {step && (
        <Modal labelledBy="wa-gc-confirm" onClose={() => step === 'confirm' && setStep(null)} className="max-w-[520px]">
          {step === 'confirm' && (
            <>
              <h3 id="wa-gc-confirm" className={cx(cardTitle, 'pr-10')}>Confirm your payment</h3>
              <div className="mt-5 flex -space-x-6">
                {items.slice(0, 4).map((i, n) => (
                  <CardArt key={i.key} brand={brandById[i.brand]} className="w-28 ring-2 ring-wa-card" radius="rounded-lg" style={{ zIndex: 10 - n }} />
                ))}
              </div>
              <dl className="mt-5 grid gap-2">
                <Row label="Items">{items.reduce((n, i) => n + i.qty, 0)} · {[...new Set(items.map((i) => brandById[i.brand].name))].join(', ')}</Row>
                <Row label={recipients.length > 1 ? 'Recipients' : 'Recipient'}>{recipients.join(', ')}</Row>
                <Row label="Pay with">{chosen.label}{chosen.momo ? ` · ${maskNumber(chosen.momo.number)}` : ''}</Row>
                <Row label="Subtotal">{ghs(subtotal)}</Row>
                {fee > 0 && <Row label="Fee">{ghs(fee)}</Row>}
                {discount > 0 && <Row label="Discount">−{ghs(discount)}</Row>}
                <div className="mt-3 border-t border-wa-line pt-4"><Row label="Total" strong>{ghs(total)}</Row></div>
              </dl>
              <p className="mt-5 flex gap-3 rounded-2xl border border-wa-warn/40 bg-wa-warn/10 p-4 text-sm leading-5 text-wa-text">
                <Alert size={20} className="shrink-0 text-wa-warn" />
                Gift cards can’t be refunded once the code is shown.
              </p>
              <div className="mt-6 flex gap-3 max-sm:flex-col-reverse">
                <button type="button" onClick={() => setStep(null)} className={cx(bigOutline, 'sm:flex-1')}>Back</button>
                <button type="button" onClick={confirm} className={cx(bigPrimary, 'sm:flex-[2]')}>Pay {ghs(total)}</button>
              </div>
            </>
          )}
          {step === 'paying' && (
            <div className="py-6 text-center" role="status">
              <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-wa-pill border-t-tab-active" />
              <h3 id="wa-gc-confirm" className="mt-5 text-xl font-bold leading-7 text-wa-text">Paying {ghs(total)}…</h3>
              <p className="mt-1 text-[15px] leading-6 text-wa-muted">Don’t close this page.</p>
            </div>
          )}
          {step === 'momo' && (
            <div className="py-2 text-center" role="status">
              <span className="relative mx-auto grid size-20 place-items-center">
                <span className="absolute inset-0 animate-[gc-ring_1.6s_ease-out_infinite] rounded-full border-2 border-tab-active" />
                <ProviderLogo id={chosen.momo.provider} size={56} />
              </span>
              <h3 id="wa-gc-confirm" className="mt-5 text-2xl font-bold leading-8 text-wa-text">Approve on your phone</h3>
              <p className="mx-auto mt-2 max-w-[360px] text-[15px] leading-6 text-wa-muted">
                We sent a request for <span className="font-semibold text-wa-text">{ghs(total)}</span> to {accountLabel(chosen.momo)} {maskNumber(chosen.momo.number)}. Enter your MoMo PIN on your phone to approve it.
              </p>
              <p className="mt-4 text-xs leading-4 text-wa-muted">Preview: approves by itself in a few seconds.</p>
              <button type="button" onClick={() => setStep(null)} className={cx(bigOutline, 'mt-6 w-full')}>Cancel payment</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
