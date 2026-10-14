import React, { useEffect, useState } from 'react';
import { formatPrice, useMarketData } from '../marketData.js';
import successArt from '../assets/wa-buy/success.svg';
import { cx } from '../ui.js';
import { HOLDINGS, ORDER_FEE_RATE, PAYMENT_METHODS } from './demoData.js';
import { AddressEntry, AmountEntry, FieldError, MethodIcon, Modal, Radio, Row, Section, bigOutline, bigPrimary, cents, chip, choice, dash, field, fieldBorder, formatQty, shorten, sideTab, useAddressEntry, useAmountEntry } from './flow.jsx';
import { Alert, ChevronDown, Plus } from './icons.jsx';
import { networkLabel } from './networks.js';
import { TokenSwitcher, WALLETS, card, cardTitle, skeleton, tokenHref, tradeHref } from './parts.jsx';

const QUICK_AMOUNTS = [50, 100, 250, 500];
const SELL_SHARES = [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, 'Max']];

// Wording that differs between the two sides of the page
const COPY = {
  buy: {
    wallet: 'Where should it go?',
    amount: 'How much do you want to buy?',
    method: 'How would you like to pay?',
    otherUse: 'Set up for selling only',
    review: 'Review purchase',
    reviewTitle: 'Review your purchase',
    confirm: 'Confirm and buy',
    doneTitle: 'Purchase complete',
    doneText: 'Your purchase has been processed.',
    again: 'Buy more',
  },
  sell: {
    amount: 'How much do you want to sell?',
    method: 'Where should we send your money?',
    otherUse: 'Set up for buying only',
    review: 'Review sale',
    reviewTitle: 'Review your sale',
    confirm: 'Confirm and sell',
    doneTitle: 'Sale complete',
    doneText: 'Your sale has been processed.',
    again: 'Sell more',
  },
};

const methodRow = 'flex w-full items-start gap-3 rounded-xl border border-wa-line p-4 text-left transition-colors duration-150';

// Saved payment accounts open in their own dialog; accounts set up for the other side are listed but can't be picked
function MethodPicker({ side, selected, otherUse, onPick, onClose }) {
  return (
    <Modal labelledBy="wa-order-methods" onClose={onClose} className="max-w-[550px]">
      <h3 id="wa-order-methods" className={cx(cardTitle, 'pr-10')}>Payment methods</h3>

      <a href="#payments" className="mt-5 flex items-center gap-3 rounded-2xl border border-wa-line bg-wa-pill/45 p-4 transition-colors duration-150 hover:border-tab-active hover:bg-wa-pill">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tab-active text-white"><Plus size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium leading-5 text-wa-text">Add new account</span>
          <span className="mt-1 block text-sm leading-[1.2] text-wa-muted">Add a new buy or sell payment account</span>
        </span>
      </a>

      <h4 className="mt-6 text-base font-bold leading-6 text-wa-text">Saved accounts</h4>
      <ul className="mt-3 grid gap-3">
        {PAYMENT_METHODS.map((m) => {
          const enabled = m.use === side;
          return (
            <li key={m.id}>
              <button
                type="button"
                disabled={!enabled}
                aria-pressed={selected === m.id}
                onClick={() => onPick(m.id)}
                className={cx(methodRow, enabled ? 'hover:bg-wa-pill/50 aria-pressed:border-tab-active aria-pressed:bg-tab-active/10' : 'cursor-not-allowed opacity-55')}
              >
                <MethodIcon id={m.id} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-5 text-wa-text">{m.name} <span className="font-normal text-wa-muted">{m.kind}</span></span>
                  <span className="mt-1 block truncate text-sm leading-5 text-wa-muted">{m.holder}</span>
                  <span className="block truncate text-sm leading-5 text-wa-muted tabular-nums">{enabled ? m.detail : otherUse}</span>
                </span>
                <span className="shrink-0 rounded-lg bg-tab-active/12 px-2.5 py-1 text-xs font-semibold capitalize leading-4 text-wa-accent">{m.use}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

export default function Order({ coin, side, step, initialWallet }) {
  const { status, coins } = useMarketData();
  const buying = side === 'buy';
  const copy = COPY[side];
  const usable = PAYMENT_METHODS.filter((m) => m.use === side);
  const href = (part) => tradeHref(coin, side, part);

  const [walletKey, setWalletKey] = useState(initialWallet || 'mybitstore');
  const [attempted, setAttempted] = useState(false);
  const [methodId, setMethodId] = useState(usable.length === 1 ? usable[0].id : null);
  const [picking, setPicking] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Only a purchase has a destination to choose; a sale comes straight out of the balance
  const wallet = buying ? WALLETS.find((w) => w.key === walletKey) : null;
  // Buying to an outside wallet needs an address
  const needsAddress = buying && walletKey === 'external';
  // Sections are numbered as shown, and a sale has no wallet step
  const sectionNo = (n) => (buying ? n : n - 1);

  const price = coins[coin.id]?.price;
  const method = PAYMENT_METHODS.find((m) => m.id === methodId);
  const entry = useAddressEntry(coin, needsAddress, attempted);
  const { network, address, addressOk } = entry;
  const amt = useAmountEntry(price);
  const { mode, entered, usd, qty, quoted, setUsd } = amt;
  const fee = usd * ORDER_FEE_RATE;
  // The fee is added to a purchase and taken out of a sale
  const total = buying ? usd + fee : usd - fee;
  const held = HOLDINGS.find((h) => h.id === coin.id)?.value || 0;

  const amountError = () => {
    if (!buying && !held) return `You don’t have any ${coin.symbol} to sell.`;
    if (!(entered > 0)) return `Enter an amount to ${side}.`;
    if (!price) return 'Live prices are unavailable right now, so we can’t quote this order.';
    if (!buying && cents(usd) > held) return `You have ${formatPrice(held)} of ${coin.symbol} available to sell.`;
    return '';
  };
  const errors = {
    ...entry.errors,
    amount: amountError(),
    method: method ? '' : buying ? 'Choose how you’ll pay.' : 'Choose where to receive your money.',
  };
  const valid = !Object.values(errors).some(Boolean);
  // A finished order shows its receipt even while the URL catches up
  const view = receipt && step !== 'details' ? 'done' : step;

  // Closing either dialog lands back on the form. Replace, so Back can't reopen a dialog that was dismissed
  const closeModal = () => window.location.replace(href());

  // Review and Done only make sense with a filled form, so a reload or deep link starts over
  useEffect(() => {
    if ((step === 'review' && !valid && !receipt) || (step === 'done' && !receipt)) window.location.replace(tradeHref(coin, side));
  }, [step, valid, receipt, coin, side]);

  const review = () => {
    setAttempted(true);
    setReceipt(null);
    if (valid) {
      window.location.hash = href('review');
      return;
    }
    const first = ['network', 'address', 'amount', 'method'].find((key) => errors[key]);
    document.getElementById(`wa-order-${first}`)?.focus();
  };

  const confirm = () => {
    entry.commit();
    setReceipt({ qty, total, wallet, method, address: needsAddress ? address : '', network: needsAddress ? network : null });
    entry.reset();
    amt.reset();
    setAttempted(false);
    // Replace, so Back from the receipt can't land on a stale review screen
    window.location.replace(href('done'));
  };

  const rate = price ? `1 ${coin.symbol} = ${formatPrice(price)}` : null;
  const methodName = method ? method.label : '';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <img src={coin.icon} alt="" width="40" height="40" className="size-10 shrink-0" />
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">{buying ? 'Buy' : 'Sell'} {coin.name}</h2>
              <TokenSwitcher current={coin} href={(c) => tradeHref(c, side)} />
            </div>
            <a href={tokenHref(coin)} className="rounded-md text-sm leading-5 text-wa-muted hover:text-wa-text hover:underline">View {coin.symbol} price and details</a>
          </div>
        </div>
      </div>

      <nav aria-label="Buy or sell" className="-mb-2 flex w-[260px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:w-full">
        <a href={tradeHref(coin, 'buy')} aria-current={buying ? 'page' : undefined} className={sideTab}>Buy</a>
        <a href={tradeHref(coin, 'sell')} aria-current={buying ? undefined : 'page'} className={sideTab}>Sell</a>
      </nav>

      {/* The form stays on the page; Review and Done open over it */}
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {buying && (
            <Section number={1} title={copy.wallet}>
              <div role="radiogroup" aria-label="Wallet" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 max-md:grid-cols-[minmax(0,1fr)]">
                {WALLETS.map((w) => (
                  <label key={w.key} className={cx(choice, 'cursor-pointer items-center hover:bg-wa-pill/50')}>
                    <input type="radio" name="wa-order-wallet" className="sr-only" checked={walletKey === w.key} onChange={() => setWalletKey(w.key)} />
                    <span className={cx('grid size-10 shrink-0 place-items-center rounded-[9px]', w.tint)}>
                      <img src={w.icon} alt="" width="24" height="24" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium leading-5 text-wa-text">{w.name}</span>
                      <span className="mt-1 block text-sm leading-[1.2] text-wa-muted">{w.buy}</span>
                    </span>
                    <Radio checked={walletKey === w.key} />
                  </label>
                ))}
              </div>

              {needsAddress && (
                <div className="mt-5 border-t border-wa-line pt-5">
                  <AddressEntry coin={coin} entry={entry} attempted={attempted} />
                </div>
              )}
            </Section>
          )}

          <Section number={sectionNo(2)} title={copy.amount}>
            <AmountEntry coin={coin} entry={amt} error={attempted && errors.amount} rate={rate} status={status}>
              {buying ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
                  {QUICK_AMOUNTS.map((value) => (
                    <button key={value} type="button" aria-pressed={mode === 'usd' && entered === value} onClick={() => setUsd(value)} className={chip}>${value}</button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Share of your balance">
                  {SELL_SHARES.map(([share, name]) => (
                    <button key={name} type="button" disabled={!held} aria-pressed={mode === 'usd' && held > 0 && entered === cents(held * share)} onClick={() => setUsd(cents(held * share))} className={chip}>{name}</button>
                  ))}
                </div>
              )}
            </AmountEntry>
            {!buying && (
              <p className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-dashed border-wa-line px-4 py-3 text-sm leading-5 text-wa-muted">
                Available balance
                <span className="text-base font-semibold leading-6 text-wa-text tabular-nums">
                  {formatPrice(held)}
                  {price && held > 0 && <span className="font-normal text-wa-muted"> · {formatQty(held / price, coin)}</span>}
                </span>
              </p>
            )}
          </Section>

          <Section number={sectionNo(3)} title={copy.method}>
            <button
              type="button"
              id="wa-order-method"
              aria-haspopup="dialog"
              aria-invalid={Boolean(attempted && errors.method)}
              onClick={() => setPicking(true)}
              className={cx(field, fieldBorder(attempted && errors.method), 'flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left hover:border-tab-active')}
            >
              {method ? (
                <>
                  <MethodIcon id={method.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-5 text-wa-text">{method.name} <span className="font-normal text-wa-muted">{method.kind}</span></span>
                    <span className="mt-0.5 block truncate text-sm leading-5 text-wa-muted tabular-nums">{method.holder} · {method.detail}</span>
                  </span>
                </>
              ) : (
                <span className="min-w-0 flex-1 text-[15px] leading-6 text-wa-muted">Select payment method</span>
              )}
              <span className="shrink-0 text-sm font-semibold leading-5 text-wa-accent">{method ? 'Change' : 'Choose'}</span>
              <ChevronDown size={16} className="shrink-0 text-wa-muted" />
            </button>
            {attempted && <FieldError>{errors.method}</FieldError>}
          </Section>
        </div>

        <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-order-summary">
          <h3 id="wa-order-summary" className={cardTitle}>Order summary</h3>
          <p className="mt-6 text-sm leading-5 text-wa-muted">{buying ? 'You get about' : 'You receive about'}</p>
          <p className="mt-1 break-words text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">
            {quoted ? (buying ? formatQty(qty, coin) : formatPrice(total)) : <span className="text-wa-muted">{buying ? `0 ${coin.symbol}` : formatPrice(0)}</span>}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm leading-5 text-wa-muted tabular-nums">
            {rate ? (
              <>
                <span className="size-1.5 rounded-full bg-up" />
                {rate} · live
              </>
            ) : status === 'error' ? 'Live price unavailable' : <span className={cx(skeleton, 'w-36')} />}
          </p>

          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            {buying ? <Row label="Amount">{usd > 0 ? formatPrice(usd) : dash}</Row> : <Row label="Selling">{quoted ? formatQty(qty, coin) : dash}</Row>}
            {!buying && <Row label="Value">{usd > 0 ? formatPrice(usd) : dash}</Row>}
            <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{usd > 0 ? formatPrice(fee) : dash}</Row>
            {buying && <Row label="To">{wallet.name}</Row>}
            {needsAddress && <Row label="Network">{network ? networkLabel(network) : dash}</Row>}
            {needsAddress && <Row label="Address">{addressOk ? <span className="font-mono" title={address}>{shorten(address)}</span> : dash}</Row>}
            <Row label={buying ? 'Pay with' : 'Paid to'}>{methodName || dash}</Row>
            <div className="mt-3 border-t border-wa-line pt-4">
              <Row label={buying ? 'Total to pay' : 'You receive'} strong>{formatPrice(usd > 0 ? total : 0)}</Row>
            </div>
          </dl>

          <button type="button" onClick={review} className={cx(bigPrimary, 'mt-6 w-full')}>{copy.review}</button>
        </aside>
      </div>

      {picking && (
        <MethodPicker
          side={side}
          selected={methodId}
          otherUse={copy.otherUse}
          onPick={(id) => {
            setMethodId(id);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      )}

      {view === 'review' && valid && (
        <Modal labelledBy="wa-order-review" onClose={closeModal} className="max-w-[640px]">
          <h3 id="wa-order-review" className={cx(cardTitle, 'pr-10')}>{copy.reviewTitle}</h3>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 rounded-2xl bg-wa-pill/45 p-5">
            <div>
              <p className="text-sm leading-5 text-wa-muted">{buying ? 'You pay' : 'You sell'}</p>
              <p className="mt-1 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">{buying ? formatPrice(total) : formatQty(qty, coin)}</p>
            </div>
            <div className="text-right max-sm:text-left">
              <p className="text-sm leading-5 text-wa-muted">{buying ? 'You get about' : 'You receive about'}</p>
              <p className="mt-1 flex items-center gap-2 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">
                {buying && <img src={coin.icon} alt="" width="28" height="28" className="size-7" />}
                {buying ? formatQty(qty, coin) : formatPrice(total)}
              </p>
            </div>
          </div>

          {needsAddress && (
            <div className="mt-6">
              <p className="text-sm leading-5 text-wa-muted">Sending to · {networkLabel(network)} network</p>
              {/* The ends are what people compare, so they stay bright while the middle is toned down */}
              <p className="mt-1 break-all font-mono text-lg leading-7 text-wa-muted max-sm:text-base">
                <span className="font-semibold text-wa-text">{address.slice(0, 6)}</span>
                {address.slice(6, -6)}
                <span className="font-semibold text-wa-text">{address.slice(-6)}</span>
              </p>
            </div>
          )}

          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            <Row label="Coin">{coin.name}</Row>
            {buying && <Row label="To">{wallet.name}</Row>}
            <Row label={buying ? 'Amount' : 'Value'}>{formatPrice(usd)}</Row>
            <Row label="Exchange rate">{rate}</Row>
            <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{formatPrice(fee)}</Row>
            <Row label={buying ? 'Pay with' : 'Paid to'}>{methodName} · {method.detail}</Row>
          </dl>

          {needsAddress ? (
            <p className="mt-6 flex gap-3 rounded-2xl border border-wa-warn/40 bg-wa-warn/10 p-4 text-sm leading-5 text-wa-text">
              <Alert size={20} className="shrink-0 text-wa-warn" />
              <span>Check the address and network carefully. Crypto sent to the wrong address can’t be recovered. The {coin.symbol} amount is an estimate at the current rate.</span>
            </p>
          ) : (
            <p className="mt-6 text-sm leading-5 text-wa-muted">The amount you {buying ? 'get' : 'receive'} is an estimate at the current rate.</p>
          )}

          <div className="mt-8 flex gap-3 max-sm:flex-col-reverse">
            <button type="button" onClick={closeModal} className={cx(bigOutline, 'sm:flex-1')}>Edit details</button>
            <button type="button" onClick={confirm} className={cx(bigPrimary, 'sm:flex-[2]')}>{copy.confirm}</button>
          </div>
        </Modal>
      )}

      {view === 'done' && receipt && (
        <Modal labelledBy="wa-order-done" onClose={closeModal} className="max-w-[520px] text-center">
          <img src={successArt} alt="" width="119" height="117" className="mx-auto animate-[pop_0.4s_ease-out]" />
          <h3 id="wa-order-done" className="mt-5 text-xl font-bold leading-7 text-wa-text">{copy.doneTitle}</h3>
          <p className="mt-2 text-base leading-6 text-wa-muted">{copy.doneText}</p>

          <dl className="mt-6 grid gap-2 rounded-2xl bg-wa-pill/45 p-5 text-left">
            <Row label={buying ? 'Bought' : 'Sold'}>{formatQty(receipt.qty, coin)}</Row>
            {receipt.wallet && <Row label="To">{receipt.wallet.name}</Row>}
            {receipt.address && <Row label="Address"><span className="font-mono" title={receipt.address}>{shorten(receipt.address)}</span></Row>}
            {receipt.network && <Row label="Network">{networkLabel(receipt.network)}</Row>}
            <Row label={buying ? 'Paid with' : 'Paid to'}>{receipt.method.label}</Row>
            <Row label={buying ? 'Total paid' : 'You receive'}>{formatPrice(receipt.total)}</Row>
          </dl>
          <p className="mt-3 text-xs leading-4 text-wa-muted">Preview only: no payment was taken and no crypto was moved.</p>

          <div className="mt-6 flex gap-3 max-sm:flex-col">
            <button type="button" onClick={closeModal} className={cx(bigOutline, 'sm:flex-1')}>{copy.again} {coin.symbol}</button>
            <a href={tokenHref(coin)} className={cx(bigPrimary, 'sm:flex-1')}>Done</a>
          </div>
        </Modal>
      )}
    </div>
  );
}
