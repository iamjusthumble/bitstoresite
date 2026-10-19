import React, { useEffect, useMemo, useState } from 'react';
import { COINS, formatPrice, useMarketData } from '../marketData.js';
import successArt from '../assets/wa-buy/success.svg';
import { cx } from '../ui.js';
import { DEPOSIT_ADDRESSES, ORDER_FEE_RATE } from './demoData.js';
import { AddressEntry, AmountEntry, CoinChoice, MethodChoice, Modal, NetworkChoice, QrCode, Radio, Row, Section, bigOutline, bigPrimary, chip, choice, dash, formatQty, shorten, sideTab, useAddressEntry, useAmountEntry } from './flow.jsx';
import { accountLabel, maskNumber, usePaymentAccounts } from './paymentAccounts.jsx';
import { Alert, Check, Clipboard, Deposit as DepositIcon } from './icons.jsx';
import { networkLabel } from './networks.js';
import { card, cardTitle, coinById } from './parts.jsx';

const QUICK_AMOUNTS = [50, 100, 250, 500];

// What a crypto deposit can be earmarked for
const PURPOSES = [
  { id: 'spot', name: 'Spot', text: 'Deposit your crypto at any time, for any purpose.' },
  { id: 'p2p', name: 'P2P', text: 'This deposit can only be used for P2P trading.' },
  { id: 'convert', name: 'Convert', text: 'The crypto you deposit can be converted.' },
  { id: 'auto-sell', name: 'Automatic sell', text: 'Every coin you deposit is sold automatically and credited to your selected payment method.' },
];

// Wording and URL steps that differ between the two ways to deposit
const WAYS = {
  crypto: {
    tab: 'With crypto',
    intro: 'Send crypto you already hold to your Mybitstore deposit address.',
    steps: ['details', 'address'],
  },
  fiat: {
    tab: 'With fiat',
    intro: 'Pay with a saved payment account and have the crypto sent to your wallet address.',
    steps: ['details', 'review', 'done'],
  },
};

// #deposit for crypto, #deposit/fiat for fiat, each optionally followed by a step
export const depositHref = (way = 'crypto', step) => `#deposit${way === 'crypto' && !step ? '' : '/' + way}${step ? '/' + step : ''}`;

export default function Deposit({ way, step }) {
  const { status, coins } = useMarketData();
  const fiat = way === 'fiat';
  const href = (part) => depositHref(way, part);

  const [coinId, setCoinId] = useState(COINS[0].id);
  const [purposeId, setPurposeId] = useState(PURPOSES[0].id);
  const [accounts] = usePaymentAccounts();
  const [methodId, setMethodId] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  const coin = coinById[coinId];
  const purpose = PURPOSES.find((p) => p.id === purposeId);
  const price = coins[coin.id]?.price;
  const entry = useAddressEntry(coin, fiat, attempted);
  const { network, address, addressOk } = entry;
  const amt = useAmountEntry(price);
  const { mode, entered, usd, qty, quoted, setUsd } = amt;
  const method = accounts.find((m) => m.id === methodId);
  const fee = usd * ORDER_FEE_RATE;
  const total = usd + fee;
  const depositAddress = network ? DEPOSIT_ADDRESSES[network.id] : '';

  const amountError = () => {
    if (!(entered > 0)) return 'Enter an amount to deposit.';
    if (!price) return 'Live prices are unavailable right now, so we can’t quote this deposit.';
    return '';
  };
  const errors = fiat
    ? { ...entry.errors, amount: amountError(), method: method ? '' : 'Choose how you’ll pay.' }
    : { network: network ? '' : 'Choose the network you’re sending on.' };
  const valid = !Object.values(errors).some(Boolean);
  // A finished deposit shows its receipt even while the URL catches up
  const view = receipt && step !== 'details' ? 'done' : step;

  // Closing a dialog lands back on the form. Replace, so Back can't reopen a dialog that was dismissed
  const closeModal = () => window.location.replace(href());

  // The dialogs only make sense with a filled form, so a reload or deep link starts over
  useEffect(() => {
    const known = WAYS[way].steps.includes(step);
    if (!known || (step === 'done' && !receipt) || (['review', 'address'].includes(step) && !valid && !receipt)) window.location.replace(depositHref(way));
  }, [way, step, valid, receipt]);

  const pickCoin = (id) => {
    setCoinId(id);
    // An address or network belongs to the coin it was entered for
    entry.setNetworkId(null);
    entry.reset();
  };

  const proceed = () => {
    setAttempted(true);
    setReceipt(null);
    setCopied(false);
    if (valid) {
      window.location.hash = href(fiat ? 'review' : 'address');
      return;
    }
    const first = ['network', 'address', 'amount', 'method'].find((key) => errors[key]);
    document.getElementById(`wa-order-${first}`)?.focus();
  };

  const confirm = () => {
    entry.commit();
    setReceipt({ coin, qty, total, method, address, network });
    entry.reset();
    amt.reset();
    setAttempted(false);
    // Replace, so Back from the receipt can't land on a stale review screen
    window.location.replace(href('done'));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  // The system share sheet where there is one; otherwise the address is copied
  const share = () => (navigator.share ? navigator.share({ title: `${coin.name} deposit address`, text: depositAddress }).catch(() => {}) : copy());

  const rate = price ? `1 ${coin.symbol} = ${formatPrice(price)}` : null;
  const methodName = method ? accountLabel(method) : '';

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><DepositIcon size={22} /></span>
          <div>
            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">Deposit crypto</h2>
            <p className="text-sm leading-5 text-wa-muted">{WAYS[way].intro}</p>
          </div>
        </div>
      </div>

      <nav aria-label="How to deposit" className="-mb-2 flex w-[300px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:w-full">
        {Object.entries(WAYS).map(([key, { tab }]) => (
          <a key={key} href={depositHref(key)} aria-current={way === key ? 'page' : undefined} className={sideTab}>{tab}</a>
        ))}
      </nav>

      {/* The form stays on the page; the address, Review and Done open over it */}
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {!fiat && (
            <Section number={1} title="What is this deposit for?">
              <div role="radiogroup" aria-label="Purpose of deposit" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 max-md:grid-cols-[minmax(0,1fr)]">
                {PURPOSES.map((p) => (
                  <label key={p.id} className={cx(choice, 'cursor-pointer items-start hover:bg-wa-pill/50')}>
                    <input type="radio" name="wa-deposit-purpose" className="sr-only" checked={purposeId === p.id} onChange={() => setPurposeId(p.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium leading-5 text-wa-text">{p.name}</span>
                      <span className="mt-1 block text-sm leading-[1.2] text-wa-muted">{p.text}</span>
                    </span>
                    <Radio checked={purposeId === p.id} />
                  </label>
                ))}
              </div>
            </Section>
          )}

          <Section number={fiat ? 1 : 2} title={fiat ? 'Which coin do you want?' : 'Which coin are you depositing?'}>
            <CoinChoice coins={COINS} coinId={coinId} onPick={pickCoin} />
            {/* With fiat the network is asked for beside the address it has to match */}
            {!fiat && <NetworkChoice coin={coin} entry={entry} error={attempted && errors.network} from className="mt-5 border-t border-wa-line pt-5" />}
          </Section>

          {fiat && (
            <>
              <Section number={2} title="Where should we send it?">
                <AddressEntry coin={coin} entry={entry} attempted={attempted} />
              </Section>

              <Section number={3} title="How much do you want to deposit?">
                <AmountEntry coin={coin} entry={amt} error={attempted && errors.amount} rate={rate} status={status}>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
                    {QUICK_AMOUNTS.map((value) => (
                      <button key={value} type="button" aria-pressed={mode === 'usd' && entered === value} onClick={() => setUsd(value)} className={chip}>${value}</button>
                    ))}
                  </div>
                </AmountEntry>
              </Section>

              <Section number={4} title="How would you like to pay?">
                {/* A deposit is paid for like a purchase, so it takes the accounts set up for buying */}
                <MethodChoice accounts={accounts} use="buy" methodId={methodId} onPick={setMethodId} error={attempted && errors.method} />
              </Section>
            </>
          )}
        </div>

        <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-deposit-summary">
          <h3 id="wa-deposit-summary" className={cardTitle}>Deposit summary</h3>
          {fiat ? (
            <>
              <p className="mt-6 text-sm leading-5 text-wa-muted">You get about</p>
              <p className="mt-1 break-words text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">
                {quoted ? formatQty(qty, coin) : <span className="text-wa-muted">0 {coin.symbol}</span>}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm leading-5 text-wa-muted tabular-nums">
                {rate ? (
                  <>
                    <span className="size-1.5 rounded-full bg-up" />
                    {rate} · live
                  </>
                ) : status === 'error' ? 'Live price unavailable' : dash}
              </p>
            </>
          ) : (
            <p className="mt-6 flex items-center gap-3">
              <img src={coin.icon} alt="" width="40" height="40" className="size-10 shrink-0" />
              <span>
                <span className="block text-xl font-semibold leading-7 text-wa-text">{coin.name}</span>
                <span className="block text-sm leading-5 text-wa-muted">{purpose.name} deposit</span>
              </span>
            </p>
          )}

          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            {!fiat && <Row label="Purpose">{purpose.name}</Row>}
            <Row label="Coin">{coin.name}</Row>
            <Row label="Network">{network ? networkLabel(network) : dash}</Row>
            {fiat && (
              <>
                <Row label="Address">{addressOk ? <span className="font-mono" title={address}>{shorten(address)}</span> : dash}</Row>
                <Row label="Amount">{usd > 0 ? formatPrice(usd) : dash}</Row>
                <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{usd > 0 ? formatPrice(fee) : dash}</Row>
                <Row label="Pay with">{methodName || dash}</Row>
                <div className="mt-3 border-t border-wa-line pt-4">
                  <Row label="Total to pay" strong>{formatPrice(usd > 0 ? total : 0)}</Row>
                </div>
              </>
            )}
          </dl>

          <button type="button" onClick={proceed} className={cx(bigPrimary, 'mt-6 w-full')}>{fiat ? 'Review deposit' : 'Show deposit address'}</button>
        </aside>
      </div>

      {!fiat && view === 'address' && valid && (
        <Modal labelledBy="wa-deposit-address" onClose={closeModal} className="max-w-[520px]">
          <h3 id="wa-deposit-address" className={cx(cardTitle, 'pr-10')}>Deposit {coin.name}</h3>
          <p className="mt-5 flex items-center justify-center gap-3">
            <img src={coin.icon} alt="" width="40" height="40" className="size-10" />
            <span>
              <span className="block text-base font-semibold leading-5 text-wa-text">{coin.symbol}</span>
              <span className="block text-sm leading-5 text-wa-muted">{networkLabel(network)} network · {purpose.name}</span>
            </span>
          </p>
          <p className="mx-auto mt-4 max-w-[360px] text-center text-sm leading-5 text-wa-muted">Send your {coin.symbol} to the address below, or scan the QR code with the wallet you’re sending from.</p>

          <div className="mt-5"><QrCode value={depositAddress} label="QR code for the deposit address" /></div>

          <p className="mt-6 text-sm font-semibold leading-5 text-wa-text">{networkLabel(network)} deposit address</p>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-wa-line bg-wa-inset py-2 pl-4 pr-2">
            <span className="min-w-0 flex-1 break-all font-mono text-[15px] leading-6 text-wa-text">{depositAddress}</span>
            <button type="button" className={chip} onClick={copy}>
              {copied ? <Check size={16} /> : <Clipboard size={16} />}
              <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="mt-4 flex gap-3 rounded-2xl border border-wa-warn/40 bg-wa-warn/10 p-4 text-sm leading-5 text-wa-text">
            <Alert size={20} className="shrink-0 text-wa-warn" />
            <span>Preview only: this is a sample address, so don’t send funds to it. On a live account, send only {coin.symbol} on the {network.name} network; anything else can’t be recovered.</span>
          </p>

          <div className="mt-6 flex gap-3 max-sm:flex-col">
            <button type="button" onClick={share} className={cx(bigOutline, 'sm:flex-1')}>Share address</button>
            <a href="#home" className={cx(bigPrimary, 'sm:flex-1')}>Done</a>
          </div>
        </Modal>
      )}

      {fiat && view === 'review' && valid && (
        <Modal labelledBy="wa-deposit-review" onClose={closeModal} className="max-w-[640px]">
          <h3 id="wa-deposit-review" className={cx(cardTitle, 'pr-10')}>Review your deposit</h3>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 rounded-2xl bg-wa-pill/45 p-5">
            <div>
              <p className="text-sm leading-5 text-wa-muted">You pay</p>
              <p className="mt-1 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">{formatPrice(total)}</p>
            </div>
            <div className="text-right max-sm:text-left">
              <p className="text-sm leading-5 text-wa-muted">You receive about</p>
              <p className="mt-1 flex items-center gap-2 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">
                <img src={coin.icon} alt="" width="28" height="28" className="size-7" />
                {formatQty(qty, coin)}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm leading-5 text-wa-muted">Wallet address · {networkLabel(network)} network</p>
            {/* The ends are what people compare, so they stay bright while the middle is toned down */}
            <p className="mt-1 break-all font-mono text-lg leading-7 text-wa-muted max-sm:text-base">
              <span className="font-semibold text-wa-text">{address.slice(0, 6)}</span>
              {address.slice(6, -6)}
              <span className="font-semibold text-wa-text">{address.slice(-6)}</span>
            </p>
          </div>

          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            <Row label="Coin">{coin.name}</Row>
            <Row label="Amount">{formatPrice(usd)}</Row>
            <Row label="Exchange rate">{rate}</Row>
            <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{formatPrice(fee)}</Row>
            <Row label="Payment method">{methodName} · {maskNumber(method.number)}</Row>
          </dl>

          <p className="mt-6 flex gap-3 rounded-2xl border border-wa-warn/40 bg-wa-warn/10 p-4 text-sm leading-5 text-wa-text">
            <Alert size={20} className="shrink-0 text-wa-warn" />
            <span>Check the address and network carefully. Crypto sent to the wrong address can’t be recovered. The {coin.symbol} amount is an estimate at the current rate.</span>
          </p>

          <div className="mt-8 flex gap-3 max-sm:flex-col-reverse">
            <button type="button" onClick={closeModal} className={cx(bigOutline, 'sm:flex-1')}>Back</button>
            <button type="button" onClick={confirm} className={cx(bigPrimary, 'sm:flex-[2]')}>Confirm deposit</button>
          </div>
        </Modal>
      )}

      {fiat && view === 'done' && receipt && (
        <Modal labelledBy="wa-deposit-done" onClose={closeModal} className="max-w-[520px] text-center">
          <img src={successArt} alt="" width="119" height="117" className="mx-auto animate-[pop_0.4s_ease-out]" />
          <h3 id="wa-deposit-done" className="mt-5 text-xl font-bold leading-7 text-wa-text">Request initiated</h3>
          <p className="mt-2 text-base leading-6 text-wa-muted">Your request has been submitted. Once your payment is approved and confirmed, the crypto will be sent to the wallet address you provided. Please check your payment method to complete the approval.</p>

          <dl className="mt-6 grid gap-2 rounded-2xl bg-wa-pill/45 p-5 text-left">
            <Row label="You receive about">{formatQty(receipt.qty, receipt.coin)}</Row>
            <Row label="Address"><span className="font-mono" title={receipt.address}>{shorten(receipt.address)}</span></Row>
            <Row label="Network">{networkLabel(receipt.network)}</Row>
            <Row label="Payment method">{accountLabel(receipt.method)}</Row>
            <Row label="Total to pay">{formatPrice(receipt.total)}</Row>
          </dl>
          <p className="mt-3 text-xs leading-4 text-wa-muted">Preview only: no payment was taken and no crypto was moved.</p>

          <a href="#home" className={cx(bigPrimary, 'mt-6 w-full')}>Done</a>
        </Modal>
      )}
    </div>
  );
}
