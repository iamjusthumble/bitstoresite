import React, { useEffect, useState } from 'react';
import { COINS, formatPrice, useMarketData } from '../marketData.js';
import successArt from '../assets/wa-buy/success.svg';
import { cx } from '../ui.js';
import { HOLDINGS, ORDER_FEE_RATE, PAYMENT_METHODS } from './demoData.js';
import { AddressEntry, AmountEntry, CoinChoice, FieldError, MethodChoice, Modal, Row, Section, bigOutline, bigPrimary, cents, chip, dash, field, fieldBorder, formatQty, shorten, sideTab, useAddressEntry, useAmountEntry } from './flow.jsx';
import { Alert, Clipboard, Withdraw as WithdrawIcon } from './icons.jsx';
import { networkLabel } from './networks.js';
import { card, cardTitle, coinById } from './parts.jsx';

const SHARES = [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, 'Max']];
const STEPS = ['details', 'review', 'done'];

// Wording that differs between the three places a withdrawal can go
const WAYS = {
  wallet: {
    tab: 'External wallet',
    type: 'External wallet',
    intro: 'Send crypto to any external wallet address.',
    receives: 'The wallet receives about',
  },
  user: {
    tab: 'Mybitstore user',
    type: 'Internal transfer',
    intro: 'Transfer crypto to another Mybitstore user.',
    receives: 'They receive about',
  },
  fiat: {
    tab: 'Fiat',
    type: 'Fiat withdrawal',
    intro: 'Cash out crypto to your bank, mobile money or card.',
    receives: 'You receive about',
  },
};

// #withdraw for an external wallet, #withdraw/user and #withdraw/fiat for the others, each optionally followed by a step
export const withdrawHref = (way = 'wallet', step) => `#withdraw${way === 'wallet' && !step ? '' : '/' + way}${step ? '/' + step : ''}`;

// Only coins with a balance can be withdrawn
const HELD = COINS.filter((coin) => HOLDINGS.some((h) => h.id === coin.id && h.value > 0));
const heldValue = (coin) => HOLDINGS.find((h) => h.id === coin.id)?.value || 0;

// One field takes any way of naming a Mybitstore user; what was typed decides which it is.
// These are format checks only: nothing here confirms the user exists.
function readRecipient(raw, networks) {
  const value = raw.trim();
  if (!value) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email';
  if (/^\+?[\d\s()-]+$/.test(value)) return value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 15 ? 'Phone number' : null;
  if (networks.some((n) => n.test.test(value))) return 'Address';
  if (/^@?[a-zA-Z0-9_.]{3,30}$/.test(value)) return 'Username';
  return null;
}

export default function Withdraw({ way, step }) {
  const { status, coins } = useMarketData();
  const href = (part) => withdrawHref(way, part);
  const toWallet = way === 'wallet';
  const toUser = way === 'user';
  const toFiat = way === 'fiat';
  const payouts = PAYMENT_METHODS.filter((m) => m.use === 'sell');

  const [coinId, setCoinId] = useState((HELD[0] || COINS[0]).id);
  const [recipient, setRecipient] = useState('');
  // With a single payout account there is nothing to choose
  const [methodId, setMethodId] = useState(payouts.length === 1 ? payouts[0].id : null);
  const [attempted, setAttempted] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const coin = coinById[coinId];
  const price = coins[coin.id]?.price;
  const held = heldValue(coin);
  const entry = useAddressEntry(coin, toWallet, attempted);
  const { network, address, addressOk } = entry;
  const amt = useAmountEntry(price);
  const { mode, entered, usd, qty, quoted, setUsd } = amt;
  const method = PAYMENT_METHODS.find((m) => m.id === methodId);
  const recipientKind = readRecipient(recipient, entry.networks);
  // The fee comes out of the amount withdrawn, so Max never asks for more than the balance
  const fee = usd * ORDER_FEE_RATE;
  const net = usd - fee;
  const netQty = qty * (1 - ORDER_FEE_RATE);

  const amountError = () => {
    if (!held) return `You don’t have any ${coin.symbol} to withdraw.`;
    if (!(entered > 0)) return 'Enter an amount to withdraw.';
    if (!price) return 'Live prices are unavailable right now, so we can’t quote this withdrawal.';
    if (cents(usd) > held) return `You have ${formatPrice(held)} of ${coin.symbol} available to withdraw.`;
    return '';
  };
  const errors = {
    ...(toWallet ? entry.errors : {}),
    recipient: !toUser || recipientKind ? '' : recipient.trim() ? 'That doesn’t look like a username, email, phone number or Mybitstore address.' : 'Enter who you’re sending to.',
    amount: amountError(),
    method: !toFiat || method ? '' : 'Choose where to receive your money.',
  };
  const valid = !Object.values(errors).some(Boolean);
  // A finished withdrawal shows its receipt even while the URL catches up
  const view = receipt && step !== 'details' ? 'done' : step;

  // Closing a dialog lands back on the form. Replace, so Back can't reopen a dialog that was dismissed
  const closeModal = () => window.location.replace(href());

  // Review and Done only make sense with a filled form, so a reload or deep link starts over
  useEffect(() => {
    const known = STEPS.includes(step);
    if (!known || (step === 'done' && !receipt) || (step === 'review' && !valid && !receipt)) window.location.replace(withdrawHref(way));
  }, [way, step, valid, receipt]);

  const pickCoin = (id) => {
    setCoinId(id);
    // An address or network belongs to the coin it was entered for
    entry.setNetworkId(null);
    entry.reset();
  };

  const pasteRecipient = async () => {
    try {
      setRecipient((await navigator.clipboard.readText()).trim());
    } catch {
      document.getElementById('wa-order-recipient')?.focus();
    }
  };

  const review = () => {
    setAttempted(true);
    setReceipt(null);
    if (valid) {
      window.location.hash = href('review');
      return;
    }
    const first = ['network', 'address', 'recipient', 'amount', 'method'].find((key) => errors[key]);
    document.getElementById(`wa-order-${first}`)?.focus();
  };

  const confirm = () => {
    entry.commit();
    setReceipt({ way, coin, qty, usd, net, netQty, method, address, network, recipient: recipient.trim() });
    entry.reset();
    amt.reset();
    setRecipient('');
    setAttempted(false);
    // Replace, so Back from the receipt can't land on a stale review screen
    window.location.replace(href('done'));
  };

  const rate = price ? `1 ${coin.symbol} = ${formatPrice(price)}` : null;
  const methodName = method ? method.label : '';
  const showRecipientError = attempted && errors.recipient;
  const receives = toFiat ? formatPrice(net) : formatQty(netQty, coin);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><WithdrawIcon size={22} /></span>
          <div>
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">Withdraw crypto</h2>
            <p className="text-sm leading-5 text-wa-muted">{WAYS[way].intro}</p>
          </div>
        </div>
      </div>

      <nav aria-label="Where to withdraw" className="-mb-2 flex w-[460px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:w-full">
        {Object.entries(WAYS).map(([key, { tab }]) => (
          <a key={key} href={withdrawHref(key)} aria-current={way === key ? 'page' : undefined} className={sideTab}>{tab}</a>
        ))}
      </nav>

      {/* The form stays on the page; Review and Done open over it */}
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <Section number={1} title="Which coin are you withdrawing?">
            {HELD.length ? (
              <CoinChoice coins={HELD} coinId={coinId} onPick={pickCoin} detail={(c) => `${c.name} · ${formatPrice(heldValue(c))} available`} />
            ) : (
              <p className="text-[15px] leading-6 text-wa-muted">You don’t hold any crypto to withdraw yet.</p>
            )}
          </Section>

          {toWallet && (
            <Section number={2} title="Where should we send it?">
              <AddressEntry coin={coin} entry={entry} attempted={attempted} />
            </Section>
          )}

          {toUser && (
            <Section number={2} title="Who are you sending to?">
              <label htmlFor="wa-order-recipient" className="text-sm font-semibold leading-5 text-wa-text">Username, email, phone number or Mybitstore address</label>
              <div className={cx(field, fieldBorder(showRecipientError), 'mt-2 flex h-14 items-center gap-2 pl-4 pr-2')}>
                <input
                  id="wa-order-recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. @ama, ama@example.com or +233 20 000 0000"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-invalid={Boolean(showRecipientError)}
                  className="min-w-0 flex-1 bg-transparent text-[15px] leading-6 text-wa-text outline-none placeholder:text-wa-muted"
                />
                {/* What was typed decides the kind, so there is nothing to pick first */}
                {recipientKind && <span className="shrink-0 rounded-lg bg-tab-active/12 px-2.5 py-1 text-xs font-semibold leading-4 text-wa-accent max-sm:hidden">{recipientKind}</span>}
                {recipient ? (
                  <button type="button" className={chip} onClick={() => setRecipient('')}>Clear</button>
                ) : (
                  <button type="button" className={chip} onClick={pasteRecipient}><Clipboard size={16} />Paste</button>
                )}
              </div>
              <FieldError>{showRecipientError}</FieldError>
            </Section>
          )}

          <Section number={toFiat ? 2 : 3} title="How much do you want to withdraw?">
            <AmountEntry coin={coin} entry={amt} error={attempted && errors.amount} rate={rate} status={status}>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Share of your balance">
                {SHARES.map(([share, name]) => (
                  <button key={name} type="button" disabled={!held} aria-pressed={mode === 'usd' && held > 0 && entered === cents(held * share)} onClick={() => setUsd(cents(held * share))} className={chip}>{name}</button>
                ))}
              </div>
            </AmountEntry>
            <p className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border border-dashed border-wa-line px-4 py-3 text-sm leading-5 text-wa-muted">
              Available balance
              <span className="text-base font-semibold leading-6 text-wa-text tabular-nums">
                {formatPrice(held)}
                {price && held > 0 && <span className="font-normal text-wa-muted"> · {formatQty(held / price, coin)}</span>}
              </span>
            </p>
          </Section>

          {toFiat && (
            <Section number={3} title="Where should we send your money?">
              <MethodChoice use="sell" methodId={methodId} onPick={setMethodId} error={attempted && errors.method} />
            </Section>
          )}
        </div>

        <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-withdraw-summary">
          <h3 id="wa-withdraw-summary" className={cardTitle}>Withdrawal summary</h3>
          <p className="mt-6 text-sm leading-5 text-wa-muted">{WAYS[way].receives}</p>
          <p className="mt-1 break-words text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">
            {quoted ? receives : <span className="text-wa-muted">{toFiat ? formatPrice(0) : `0 ${coin.symbol}`}</span>}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm leading-5 text-wa-muted tabular-nums">
            {rate ? (
              <>
                <span className="size-1.5 rounded-full bg-up" />
                {rate} · live
              </>
            ) : status === 'error' ? 'Live price unavailable' : dash}
          </p>

          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            <Row label="Coin">{coin.name}</Row>
            {toWallet && <Row label="Network">{network ? networkLabel(network) : dash}</Row>}
            {toWallet && <Row label="Address">{addressOk ? <span className="font-mono" title={address}>{shorten(address)}</span> : dash}</Row>}
            {toUser && <Row label="To">{recipientKind ? <span title={recipient.trim()}>{shorten(recipient.trim())}</span> : dash}</Row>}
            {toFiat && <Row label="Paid to">{methodName || dash}</Row>}
            <Row label="Amount">{quoted ? formatQty(qty, coin) : dash}</Row>
            <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{usd > 0 ? formatPrice(fee) : dash}</Row>
            <div className="mt-3 border-t border-wa-line pt-4">
              <Row label="Total withdrawn" strong>{formatPrice(usd > 0 ? usd : 0)}</Row>
            </div>
          </dl>

          <button type="button" onClick={review} className={cx(bigPrimary, 'mt-6 w-full')}>Review withdrawal</button>
        </aside>
      </div>

      {view === 'review' && valid && (
        <Modal labelledBy="wa-withdraw-review" onClose={closeModal} className="max-w-[640px]">
          <h3 id="wa-withdraw-review" className={cx(cardTitle, 'pr-10')}>Review your withdrawal</h3>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 rounded-2xl bg-wa-pill/45 p-5">
            <div>
              <p className="text-sm leading-5 text-wa-muted">You withdraw</p>
              <p className="mt-1 flex items-center gap-2 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">
                <img src={coin.icon} alt="" width="28" height="28" className="size-7" />
                {formatQty(qty, coin)}
              </p>
            </div>
            {/* Two coin amounts are too wide to sit side by side, so that pair wraps and stays left-aligned */}
            <div className={cx(toFiat && 'text-right max-sm:text-left')}>
              <p className="text-sm leading-5 text-wa-muted">{WAYS[way].receives}</p>
              <p className="mt-1 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">{receives}</p>
            </div>
          </div>

          {toWallet && (
            <div className="mt-6">
              <p className="text-sm leading-5 text-wa-muted">Wallet address · {networkLabel(network)} network</p>
              {/* The ends are what people compare, so they stay bright while the middle is toned down */}
              <p className="mt-1 break-all font-mono text-lg leading-7 text-wa-muted max-sm:text-base">
                <span className="font-semibold text-wa-text">{address.slice(0, 6)}</span>
                {address.slice(6, -6)}
                <span className="font-semibold text-wa-text">{address.slice(-6)}</span>
              </p>
            </div>
          )}
          {toUser && (
            <div className="mt-6">
              <p className="text-sm leading-5 text-wa-muted">Sending to · {recipientKind}</p>
              <p className="mt-1 break-all text-lg font-semibold leading-7 text-wa-text max-sm:text-base">{recipient.trim()}</p>
            </div>
          )}

          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            <Row label="Coin">{coin.name}</Row>
            <Row label="Withdrawal type">{WAYS[way].type}</Row>
            <Row label="Withdrawal amount">{formatPrice(usd)}</Row>
            <Row label="Exchange rate">{rate}</Row>
            <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{formatPrice(fee)}</Row>
            {toFiat && <Row label="Payment method">{methodName} · {method.detail}</Row>}
          </dl>

          {toFiat ? (
            <p className="mt-6 text-sm leading-5 text-wa-muted">The amount you receive is an estimate at the current rate.</p>
          ) : (
            <p className="mt-6 flex gap-3 rounded-2xl border border-wa-warn/40 bg-wa-warn/10 p-4 text-sm leading-5 text-wa-text">
              <Alert size={20} className="shrink-0 text-wa-warn" />
              <span>{toWallet ? 'Check the address and network carefully. Crypto sent to the wrong address can’t be recovered.' : 'Check who you’re sending to. A transfer to the wrong person can’t be reversed.'}</span>
            </p>
          )}

          <div className="mt-8 flex gap-3 max-sm:flex-col-reverse">
            <button type="button" onClick={closeModal} className={cx(bigOutline, 'sm:flex-1')}>Back</button>
            <button type="button" onClick={confirm} className={cx(bigPrimary, 'sm:flex-[2]')}>Confirm withdrawal</button>
          </div>
        </Modal>
      )}

      {view === 'done' && receipt && (
        <Modal labelledBy="wa-withdraw-done" onClose={closeModal} className="max-w-[520px] text-center">
          <img src={successArt} alt="" width="119" height="117" className="mx-auto animate-[pop_0.4s_ease-out]" />
          <h3 id="wa-withdraw-done" className="mt-5 text-xl font-bold leading-7 text-wa-text">Withdrawal complete</h3>
          <p className="mt-2 text-base leading-6 text-wa-muted">Your withdrawal has been processed.</p>

          <dl className="mt-6 grid gap-2 rounded-2xl bg-wa-pill/45 p-5 text-left">
            <Row label="Withdrawn">{formatQty(receipt.qty, receipt.coin)}</Row>
            <Row label="Withdrawal type">{WAYS[receipt.way].type}</Row>
            {receipt.way === 'wallet' && <Row label="Address"><span className="font-mono" title={receipt.address}>{shorten(receipt.address)}</span></Row>}
            {receipt.way === 'wallet' && <Row label="Network">{networkLabel(receipt.network)}</Row>}
            {receipt.way === 'user' && <Row label="To"><span title={receipt.recipient}>{shorten(receipt.recipient)}</span></Row>}
            {receipt.way === 'fiat' && <Row label="Paid to">{receipt.method.label}</Row>}
            <Row label={WAYS[receipt.way].receives}>{receipt.way === 'fiat' ? formatPrice(receipt.net) : formatQty(receipt.netQty, receipt.coin)}</Row>
          </dl>
          <p className="mt-3 text-xs leading-4 text-wa-muted">Preview only: nothing was withdrawn and no crypto was moved.</p>

          <a href="#home" className={cx(bigPrimary, 'mt-6 w-full')}>Done</a>
        </Modal>
      )}
    </div>
  );
}
