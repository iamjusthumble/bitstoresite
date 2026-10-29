import React, { useEffect, useRef, useState } from 'react';
import { COINS, formatPrice, useMarketData } from '../marketData.js';
import successArt from '../assets/wa-buy/success.svg';
import failMark from '../assets/wa-swap/fail-mark.svg';
import failSpark from '../assets/wa-swap/fail-spark.svg';
import failSparkRing from '../assets/wa-swap/fail-spark-ring.svg';
import processingIcon from '../assets/wa-swap/processing.svg';
import stepDone from '../assets/wa-swap/step-done.svg';
import stepPending from '../assets/wa-swap/step-pending.svg';
import stepSpin from '../assets/wa-swap/step-spin.svg';
import stepSpinActive from '../assets/wa-swap/step-spin-active.svg';
import { cx } from '../ui.js';
import { HOLDINGS, ORDER_FEE_RATE, SAMPLE_FIAT_USD } from './demoData.js';
import { CoinChoice, FieldError, Modal, Row, bigOutline, bigPrimary, cents, formatQty, sideTab } from './flow.jsx';
import { useStored } from './format.jsx';
import { GHS_PER_USD, ghs } from './gift-cards/catalog.js';
import { useGhsBalance } from './gift-cards/store.js';
import { Check, ChevronUpDown, Plus, SwapArrows, Wallet } from './icons.jsx';
import { ProviderLogo, TypeTag, accountLabel, canUse, maskNumber, usePaymentAccounts } from './paymentAccounts.jsx';
import { card, cardTitle, coinById } from './parts.jsx';

// Swap (Figma 435:136656–435:145026): turn fiat dollars or crypto into USDT or cedis.
// #swap is the Fiat tab and #swap/crypto the Crypto tab; Confirm, Processing and the result open as dialogs over the form.
// Nothing is converted: the fiat balance and cedi wallet are sample figures kept in this browser.

export const swapHref = (way = 'fiat') => (way === 'crypto' ? '#swap/crypto' : '#swap');

const TARGETS = {
  usdt: { name: 'USDT', tag: '(TRC20)', title: 'Stable Digital Dollar', note: 'Best for holding value', symbol: '$', network: 'TRC20 Network' },
  ghs: { name: 'GHS', tag: '(Cedi Balance)', title: 'Local Currency', note: 'Withdraw instantly to MoMo', symbol: '¢', network: 'Cedi Balance' },
};

const LOCK_SECONDS = 30;
const STEPS = ['Aggregating Assets', 'Executing Conversion', 'Finalizing Conversion'];
const HELD = COINS.filter((c) => HOLDINGS.some((h) => h.id === c.id && h.value > 0));
const heldValue = (coin) => HOLDINGS.find((h) => h.id === coin.id)?.value || 0;

const money = (v) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

// The $ and ¢ discs from the Figma
const CurrencyDisc = ({ symbol, size = 28 }) => (
  <span className="grid shrink-0 place-items-center rounded-full bg-[#cdd7ff] font-black leading-none text-[#2f60e0]" style={{ width: size, height: size, fontSize: size * 0.6 }} aria-hidden="true">{symbol}</span>
);

const Tick = ({ on }) => (
  <span className={cx('grid size-6 shrink-0 place-items-center rounded-full', on ? 'bg-[#2f60e0] text-white' : 'border border-wa-line bg-wa-pill text-wa-muted')}><Check size={14} /></span>
);

export default function Swap({ way }) {
  const crypto = way === 'crypto';
  const { coins, status } = useMarketData();
  const [accounts] = usePaymentAccounts();
  const payouts = accounts.filter((a) => canUse(a, 'sell'));
  const [fiat, setFiat] = useStored('wa-fiat-usd', SAMPLE_FIAT_USD);
  const [, setGhs] = useGhsBalance();

  const [coinId, setCoinId] = useState(null);
  const [amount, setAmount] = useState('');
  const [target, setTarget] = useState(null);
  const [dest, setDest] = useState('wallet'); // GHS wallet, or a mobile money account id
  const [attempted, setAttempted] = useState(false);
  const [dialog, setDialog] = useState(null); // methods | confirm | processing | done | failed
  const [failNext, setFailNext] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const inputRef = useRef(null);

  const coin = coinId ? coinById[coinId] : null;
  const available = crypto ? (coin ? heldValue(coin) : 0) : fiat;
  const usd = Number.parseFloat(amount) || 0;
  const fee = cents(usd * ORDER_FEE_RATE);
  const net = usd - fee;
  const usdtPrice = coins.tether?.price || 1;
  const receive = target === 'usdt' ? net / usdtPrice : target === 'ghs' ? net * GHS_PER_USD : 0;
  const receiveText = target === 'usdt' ? `${money(receive)} USDT` : target === 'ghs' ? ghs(receive) : '';
  const account = payouts.find((a) => a.id === dest);
  // A coin can't be swapped into itself
  const usdtBlocked = crypto && coin?.id === 'tether';

  // Switching tabs starts a fresh form
  useEffect(() => {
    setCoinId(null);
    setAmount('');
    setTarget(null);
    setAttempted(false);
  }, [way]);
  useEffect(() => {
    if (usdtBlocked && target === 'usdt') setTarget(null);
  }, [usdtBlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  const errors = {
    coin: crypto && !coin ? 'Choose the coin to swap.' : '',
    amount: !usd ? 'Enter an amount to swap.' : usd > available ? `You have ${money(available)} USD available.` : usd < 1 ? 'The smallest swap is 1.00 USD.' : '',
    target: target ? '' : 'Choose what to convert to.',
    dest: target === 'ghs' && dest !== 'wallet' && !account ? 'Choose where to receive your cedis.' : '',
  };
  const valid = !Object.values(errors).some(Boolean);

  const onAmount = (raw) => setAmount(raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').replace(/^(\d*\.\d{0,2}).*$/, '$1'));

  const review = () => {
    setAttempted(true);
    if (!valid) {
      const first = ['coin', 'amount', 'target', 'dest'].find((k) => errors[k]);
      document.getElementById(`wa-swap-${first}`)?.focus();
      return;
    }
    setDialog('confirm');
  };

  const convert = () => {
    setDialog('processing');
  };

  // Once processing ends: record the result. A failure moves nothing.
  const finish = () => {
    const ok = !failNext && navigator.onLine;
    setFailNext(false);
    if (!ok) {
      setDialog('failed');
      return;
    }
    if (!crypto) setFiat((f) => cents(f - usd));
    if (target === 'ghs' && dest === 'wallet') setGhs((b) => b + receive);
    setReceipt({ target, receiveText, usd, fee, at: Date.now(), to: target === 'ghs' ? (account ? `${accountLabel(account)} · ${maskNumber(account.number)}` : 'GHS wallet') : 'USDT wallet' });
    setDialog('done');
  };

  const closeDone = () => {
    setDialog(null);
    setAmount('');
    setAttempted(false);
  };

  const rate = target === 'usdt' ? `1 USD = ${(1 / usdtPrice).toFixed(4)} USDT` : target === 'ghs' ? `1 USD = GH₵ ${GHS_PER_USD.toFixed(2)}` : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><SwapArrows size={22} /></span>
        <div>
          <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">Swap</h2>
          <p className="text-sm leading-5 text-wa-muted">{crypto ? 'Convert crypto you hold into USDT or cedis.' : 'Convert your fiat balance into USDT or cedis.'}</p>
        </div>
      </div>

      <nav aria-label="Swap from" className="-mb-2 flex w-[320px] gap-1 rounded-xl bg-wa-pill p-1 max-sm:w-full">
        <a href={swapHref('fiat')} aria-current={!crypto ? 'page' : undefined} className={sideTab}>Fiat</a>
        <a href={swapHref('crypto')} aria-current={crypto ? 'page' : undefined} className={sideTab}>Crypto</a>
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_340px] max-lg:grid-cols-[minmax(0,1fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <section className={card} aria-label="Amount">
            {crypto && (
              <div className="mb-4" id="wa-swap-coin" tabIndex={-1}>
                <p className="mb-2 text-sm font-semibold leading-5 text-wa-muted">Select coin to swap</p>
                <CoinChoice coins={HELD} coinId={coinId} onPick={setCoinId} detail={(c) => `${c.name} · ${formatPrice(heldValue(c))} available`} />
                <FieldError>{attempted && errors.coin}</FieldError>
              </div>
            )}
            {/* The amount sits big in the middle, as in the Figma; a click anywhere on the panel focuses it */}
            <div onClick={() => inputRef.current?.focus()} className={cx('flex cursor-text flex-col items-center gap-2.5 rounded-2xl border px-5 pb-4 pt-10 transition-colors duration-150 max-sm:px-3', attempted && errors.amount ? 'border-down' : 'border-wa-line focus-within:border-tab-active')}>
              <label className="flex items-end justify-center gap-1 pb-6">
                <span className="sr-only">Amount in US dollars</span>
                <input
                  id="wa-swap-amount"
                  ref={inputRef}
                  value={amount}
                  onChange={(e) => onAmount(e.target.value)}
                  // Reads as money once you're done typing: 100 → 100.00
                  onBlur={() => usd > 0 && setAmount(usd.toFixed(2))}
                  inputMode="decimal"
                  placeholder="0.00"
                  autoComplete="off"
                  aria-invalid={Boolean(attempted && errors.amount)}
                  style={{ width: `${Math.max(4, (amount || '0.00').length) + 0.4}ch` }}
                  className="min-w-0 max-w-full bg-transparent text-right text-[50px] font-medium leading-[52px] tracking-[-3px] text-wa-text tabular-nums outline-none placeholder:text-wa-muted/50 max-sm:text-[40px]"
                />
                <span className="pb-1.5 text-xl font-bold leading-6 text-wa-text">USD</span>
              </label>
              <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-wa-line bg-wa-pill/45 px-4 py-2.5">
                <span className="text-sm leading-5 text-wa-muted"><span className="max-sm:hidden">{crypto ? 'Available balance:' : 'Available fiat balance:'}</span><span className="sm:hidden">Available:</span></span>
                <span className="flex items-center gap-3">
                  <span className="text-base font-semibold leading-5 text-wa-text tabular-nums">{crypto && !coin ? '—' : `${money(available)} USD`}</span>
                  <button type="button" disabled={!available} onClick={(e) => { e.stopPropagation(); setAmount(money(available).replace(/,/g, '')); }} className="rounded-full bg-tab-active/12 px-2.5 py-0.5 text-xs font-bold leading-5 text-wa-accent hover:bg-tab-active/20 disabled:opacity-40">Max</button>
                </span>
              </div>
            </div>
            <FieldError>{attempted && errors.amount}</FieldError>
          </section>

          <section className={cx(card, 'bg-wa-pill/30')} aria-labelledby="wa-swap-to">
            <h3 id="wa-swap-to" className="text-base font-semibold leading-6 text-wa-muted">Convert to</h3>
            <div id="wa-swap-target" tabIndex={-1} role="radiogroup" aria-label="Convert to" className="mt-3 grid gap-2">
              {Object.entries(TARGETS).map(([key, t]) => {
                const on = target === key;
                const off = key === 'usdt' && usdtBlocked;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={off}
                    onClick={() => setTarget(key)}
                    className={cx('flex items-start gap-2.5 rounded-xl border p-4 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45', on ? 'border-tab-active bg-tab-active/10' : 'border-wa-line bg-wa-card hover:border-wa-muted/50')}
                  >
                    <CurrencyDisc symbol={t.symbol} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold leading-5 text-wa-text">{t.name} <span className="text-wa-muted">{t.tag}</span></span>
                      <span className="mt-0.5 block text-sm font-semibold leading-5 text-wa-text">{t.title}</span>
                      <span className="block text-xs font-semibold leading-4 text-wa-muted">{off ? 'You’re already swapping USDT' : t.note}</span>
                    </span>
                    <Tick on={on} />
                  </button>
                );
              })}
            </div>
            <FieldError>{attempted && errors.target}</FieldError>
          </section>

          {/* Cedis need a home: the GHS wallet, or straight out to a mobile money account */}
          {target === 'ghs' && (
            <section className="animate-[fade-in_0.2s_ease-out]" aria-labelledby="wa-swap-dest-label">
              <p id="wa-swap-dest-label" className="mb-2 text-sm font-medium leading-5 text-wa-muted">Withdraw to</p>
              <button id="wa-swap-dest" type="button" onClick={() => setDialog('methods')} aria-haspopup="dialog" className="flex h-[60px] w-full items-center gap-3 rounded-2xl border border-wa-line bg-wa-card px-4 text-left transition-colors duration-150 hover:border-tab-active">
                {account ? <ProviderLogo id={account.provider} size={24} /> : <span className="grid size-6 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><Wallet size={14} /></span>}
                <span className="min-w-0 flex-1 truncate text-lg font-bold leading-6 text-wa-text">{account ? accountLabel(account) : 'GHS wallet'}{account && <span className="ml-2 text-sm font-normal text-wa-muted">{maskNumber(account.number)}</span>}</span>
                <ChevronUpDown size={18} className="shrink-0 text-wa-muted" />
              </button>
              <FieldError>{attempted && errors.dest}</FieldError>
            </section>
          )}
        </div>

        <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-swap-summary">
          <h3 id="wa-swap-summary" className={cardTitle}>Swap summary</h3>
          <p className="mt-6 text-sm leading-5 text-wa-muted">You receive about</p>
          <p className="mt-1 break-words text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums" aria-live="polite">
            {usd > 0 && target ? receiveText : <span className="text-wa-muted">0.00</span>}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm leading-5 text-wa-muted tabular-nums">
            {rate ? <><span className="size-1.5 rounded-full bg-up" />{rate}</> : status === 'error' ? 'Live price unavailable' : 'Pick what to convert to'}
          </p>
          <dl className="mt-6 grid gap-2 border-t border-wa-line pt-5">
            <Row label="From">{crypto ? coin?.name || '—' : 'Fiat balance'}</Row>
            <Row label="Amount">{usd ? `${money(usd)} USD` : '—'}</Row>
            <Row label={`Fee (${ORDER_FEE_RATE * 100}%)`}>{usd ? `${money(fee)} USD` : '—'}</Row>
            {target === 'ghs' && <Row label="Receive to">{account ? accountLabel(account) : 'GHS wallet'}</Row>}
          </dl>
          <button type="button" onClick={review} className={cx(bigPrimary, 'mt-6 w-full')}>Continue</button>
        </aside>
      </div>

      {/* Preview only: lets a demo show the failure screen */}
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-dashed border-wa-line px-4 py-2 text-xs font-semibold leading-4 text-wa-muted">
        <input type="checkbox" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} className="size-3.5 accent-tab-active" />
        Preview: make the next swap fail
      </label>

      {dialog === 'methods' && (
        <DestinationPicker
          accounts={accounts}
          selected={dest}
          onPick={(id) => { setDest(id); setDialog(null); }}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'confirm' && (
        <Confirm
          crypto={crypto}
          coin={coin}
          usd={usd}
          fee={fee}
          receiveText={receiveText}
          rate={rate}
          to={target === 'ghs' ? (account ? `${accountLabel(account)} · ${maskNumber(account.number)}` : 'GHS wallet') : 'USDT wallet (TRC20)'}
          onBack={() => setDialog(null)}
          onConvert={convert}
        />
      )}
      {dialog === 'processing' && <Processing onDone={finish} />}
      {dialog === 'done' && receipt && <Done receipt={receipt} onClose={closeDone} />}
      {dialog === 'failed' && <Failed onClose={() => setDialog(null)} onRetry={() => setDialog('confirm')} />}
    </div>
  );
}

/* ——— Dialogs ——— */

// Where cedis go: the GHS wallet or a saved payout account (Figma "Payment methods")
function DestinationPicker({ accounts, selected, onPick, onClose }) {
  const row = 'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-150';
  return (
    <Modal labelledBy="wa-swap-methods" onClose={onClose} className="max-w-[550px]">
      <h3 id="wa-swap-methods" className={cx(cardTitle, 'pr-10')}>Payment methods</h3>
      <a href="#payments/add" className="mt-5 flex items-center gap-3 rounded-2xl border border-wa-line bg-wa-pill/45 p-4 transition-colors duration-150 hover:border-tab-active hover:bg-wa-pill">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tab-active text-white"><Plus size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium leading-5 text-wa-text">Add new account</span>
          <span className="mt-1 block text-sm leading-[1.2] text-wa-muted">Add a new buy or sell payment account</span>
        </span>
      </a>
      <button type="button" onClick={() => onPick('wallet')} aria-pressed={selected === 'wallet'} className={cx(row, 'mt-3', selected === 'wallet' ? 'border-tab-active bg-tab-active/10' : 'border-wa-line hover:bg-wa-pill/50')}>
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><Wallet size={16} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-5 text-wa-text">GHS wallet</span>
          <span className="mt-1 block text-sm leading-5 text-wa-muted">Keep the cedis in your Mybitstore balance</span>
        </span>
      </button>
      <h4 className="mt-6 text-base font-bold leading-6 text-wa-text">Saved accounts</h4>
      {accounts.length ? (
        <ul className="mt-3 grid gap-3">
          {accounts.map((m) => {
            const enabled = canUse(m, 'sell');
            return (
              <li key={m.id}>
                <button type="button" disabled={!enabled} aria-pressed={selected === m.id} onClick={() => onPick(m.id)} className={cx(row, !enabled ? 'cursor-not-allowed border-wa-line opacity-55' : selected === m.id ? 'border-tab-active bg-tab-active/10' : 'border-wa-line hover:bg-wa-pill/50')}>
                  <ProviderLogo id={m.provider} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-5 text-wa-text">{accountLabel(m)}</span>
                    <span className="mt-1 block truncate text-sm leading-5 text-wa-muted">{m.holder}</span>
                    <span className="block truncate text-sm leading-5 text-wa-muted tabular-nums">{enabled ? maskNumber(m.number) : 'Set up for buying only'}</span>
                  </span>
                  <TypeTag id={m.type} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3 grid place-items-center rounded-2xl border border-dashed border-wa-line px-6 py-10 text-center">
          <Wallet size={32} className="text-wa-muted" />
          <p className="mt-3 text-sm leading-5 text-wa-muted">No payment method yet</p>
        </div>
      )}
    </Modal>
  );
}

function Confirm({ crypto, coin, usd, fee, receiveText, rate, to, onBack, onConvert }) {
  const [left, setLeft] = useState(LOCK_SECONDS);
  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const expired = left <= 0;
  return (
    <Modal labelledBy="wa-swap-confirm" onClose={onBack} className="max-w-[550px]">
      <h3 id="wa-swap-confirm" className={cx(cardTitle, 'pr-10')}>Swap confirmation</h3>
      <div className="mt-5 text-center">
        <p className="text-sm leading-5 text-wa-muted">You receive</p>
        <p className="mt-0.5 text-[32px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">{receiveText}</p>
      </div>
      <dl className="mt-5 grid gap-1 rounded-2xl bg-wa-pill/45 p-4">
        <Row label={crypto ? 'Coin' : 'From'}>{crypto ? coin.name : 'Fiat balance'}</Row>
        <Row label="Amount">{money(usd)} USD</Row>
        <Row label="Exchange rate">{rate}</Row>
        <Row label="Conversion fee">{money(fee)} USD</Row>
        <Row label="Receive to">{to}</Row>
      </dl>
      <div className={cx('mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-sm leading-5', expired ? 'border-wa-warn/60 bg-wa-warn/10' : 'border-wa-line')} role="timer" aria-live="off">
        <span className="text-wa-muted">{expired ? 'Rate expired' : 'Rate locked for:'}</span>
        {expired ? (
          <button type="button" onClick={() => setLeft(LOCK_SECONDS)} className="font-bold text-wa-accent hover:underline">Refresh rate</button>
        ) : (
          <span className={cx('font-semibold tabular-nums', left <= 5 ? 'text-down' : 'text-wa-text')}>{left} sec</span>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={onBack} className={bigOutline}>Back</button>
        <button type="button" disabled={expired} onClick={onConvert} className={cx(bigPrimary, 'disabled:pointer-events-none disabled:opacity-50')}>Convert</button>
      </div>
    </Modal>
  );
}

// Three steps with a progress bar; the soft blue and green glows come from the Figma
function Processing({ onDone }) {
  const [progress, setProgress] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const start = performance.now();
    let frame;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 3600);
      setProgress(p);
      if (p < 1) frame = requestAnimationFrame(tick);
      else setTimeout(() => done.current(), 450);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const stepAt = Math.min(STEPS.length, Math.floor(progress * STEPS.length + 0.001));
  const pct = Math.round(progress * 100);
  return (
    <Modal labelledBy="wa-swap-processing" className="max-w-[550px]">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -left-[72px] top-[97px] size-[113px] rounded-full bg-[rgba(79,157,255,0.3)] blur-[35px]" />
        <span className="absolute -right-[60px] bottom-[60px] size-[113px] rounded-full bg-[rgba(98,163,144,0.3)] blur-[35px]" />
      </span>
      <div className="relative text-center" role="status">
        <span className="mx-auto grid h-[105px] w-[107px] place-items-center rounded-full bg-[rgba(40,159,124,0.1)]">
          <span className="grid h-[75px] w-[77px] place-items-center rounded-full bg-[rgba(40,159,124,0.1)]">
            <span className="grid size-[49px] place-items-center rounded-full bg-[rgba(40,159,124,0.1)]">
              <img src={processingIcon} alt="" width="22" height="22" className="animate-[spin-slow_1.4s_linear_infinite]" />
            </span>
          </span>
        </span>
        <h3 id="wa-swap-processing" className="mt-[18px] text-2xl font-semibold leading-[21px] text-wa-text">Processing conversion</h3>
        <p className="mt-2 text-sm leading-[21px] text-wa-text">This may take a few seconds…</p>
      </div>
      <ol className="relative mt-8 grid gap-2.5">
        {STEPS.map((name, i) => {
          const complete = i < stepAt;
          const active = i === stepAt;
          return (
            <li key={name} className={cx('flex h-[50px] items-center gap-3.5 rounded-2xl border px-[15px] transition-colors duration-300', complete ? 'border-[#289f7c] bg-[rgba(40,159,124,0.1)]' : 'border-wa-line bg-wa-pill/45')}>
              <img src={complete ? stepDone : stepPending} alt="" width="24" height="24" />
              <span className="flex-1 text-sm font-semibold leading-5 tracking-[-0.15px] text-wa-text">{name}<span className="sr-only">{complete ? ', done' : active ? ', in progress' : ', waiting'}</span></span>
              {!complete && (
                <span className="grid size-6 place-items-center">
                  <img src={active ? stepSpinActive : stepSpin} alt="" width="18" height="20" className={active ? 'animate-[spin-slow_1.2s_linear_infinite]' : undefined} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="relative mt-5">
        <div className="h-1 overflow-hidden rounded-full bg-wa-line">
          <div className="h-full rounded-full bg-[#289f7c] transition-[width] duration-100" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-center text-[10px] leading-5 tracking-[-0.15px] text-wa-text tabular-nums">{pct}% Complete</p>
      </div>
    </Modal>
  );
}

function Done({ receipt, onClose }) {
  const t = TARGETS[receipt.target];
  return (
    <Modal labelledBy="wa-swap-done" onClose={onClose} className="max-w-[550px]">
      <div className="text-center">
        <img src={successArt} alt="" width="119" height="117" className="mx-auto animate-[pop_0.4s_ease-out]" />
        <h3 id="wa-swap-done" className="mt-5 text-xl font-medium leading-6 text-wa-text">Conversion successful</h3>
        <p className="mt-1.5 text-sm leading-5 text-wa-muted">Your assets have been swapped successfully</p>
      </div>
      <div className="mt-6 rounded-2xl border border-wa-line bg-wa-pill/45 px-4 py-5">
        <div className="text-center">
          <p className="text-sm leading-5 text-wa-muted">Amount received</p>
          <p className="mt-2 text-[32px] font-bold leading-10 text-up tabular-nums">{receipt.receiveText}</p>
          <p className="text-sm leading-5 text-wa-muted">{t.network}</p>
        </div>
        <dl className="mt-4 grid gap-2 border-t border-wa-line pt-4">
          <Row label="Original value">{formatPrice(receipt.usd)}</Row>
          <Row label="Conversion fee"><span className="text-down">{formatPrice(receipt.fee)}</span></Row>
          <Row label="Received in">{receipt.to}</Row>
        </dl>
        <dl className="mt-3 border-t border-wa-line pt-3">
          <Row label="Timestamp">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(receipt.at)}</Row>
        </dl>
      </div>
      <p className="mt-3 text-center text-xs leading-4 text-wa-muted">Preview only: nothing was converted.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={onClose} className={bigOutline}>Done</button>
        <a href="#assets" className={bigPrimary}>View in wallet</a>
      </div>
    </Modal>
  );
}

// The red mark with its scattered crosses, placed as in the Figma (Group 14026)
function Failed({ onClose, onRetry }) {
  const sparks = [[96, 54], [111, 83], [66, 108], [54, 0], [4, 12], [0, 100]];
  return (
    <Modal labelledBy="wa-swap-failed" onClose={onClose} className="max-w-[550px]">
      <div className="text-center">
        <span className="relative mx-auto block h-[113px] w-[116px]" aria-hidden="true">
          <span className="absolute left-[9.5px] top-[18px] size-[90px] overflow-hidden rounded-full bg-[linear-gradient(246deg,rgb(188,20,23)_16%,rgba(244,214,214,0.15)_86%)]">
            <img src={failMark} alt="" width="80" height="80" className="absolute left-[5px] top-[5px]" />
            <img src={failSparkRing} alt="" width="6" height="6" className="absolute left-[2px] top-[45px]" />
          </span>
          {sparks.map(([x, y]) => <img key={`${x}-${y}`} src={failSpark} alt="" width="5" height="5" className="absolute" style={{ left: x, top: y }} />)}
        </span>
        <h3 id="wa-swap-failed" className="mt-5 text-xl font-medium leading-6 text-wa-text">Conversion failed</h3>
        <p className="mx-auto mt-2 max-w-[288px] text-sm leading-5 text-wa-muted">We couldn’t complete your conversion this time. Nothing was taken from your balance. Please try again.</p>
      </div>
      <div className="mt-[30px] grid grid-cols-2 gap-3.5">
        <button type="button" onClick={onClose} className={bigOutline}>Done</button>
        <button type="button" onClick={onRetry} className={bigPrimary}>Try again</button>
      </div>
    </Modal>
  );
}
