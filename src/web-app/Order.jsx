import React, { useEffect, useRef, useState } from 'react';
import { formatPrice, useMarketData } from '../marketData.js';
import cardIcon from '../assets/wa-buy/card.svg';
import mtnLogo from '../assets/wa-buy/mtn.png';
import successArt from '../assets/wa-buy/success.svg';
import { cx } from '../ui.js';
import { HOLDINGS, ORDER_FEE_RATE, PAYMENT_METHODS } from './demoData.js';
import { useStored } from './format.jsx';
import { Alert, Book, Check, ChevronDown, Clipboard, Close, Plus, SwapVertical, Trash } from './icons.jsx';
import { NETWORKS, networkLabel, networksFor } from './networks.js';
import { TokenSwitcher, WALLETS, card, cardTitle, skeleton, tokenHref, tradeHref } from './parts.jsx';

const QUICK_AMOUNTS = [50, 100, 250, 500];
const SELL_SHARES = [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, 'Max']];
const STEPS = [['details', 'Details'], ['review', 'Review'], ['done', 'Done']];

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
    doneTitle: 'Crypto Purchased Successfully',
    doneText: 'Your purchase has been processed successfully',
    again: 'Buy more',
  },
  sell: {
    amount: 'How much do you want to sell?',
    method: 'Where should we send your money?',
    otherUse: 'Set up for buying only',
    review: 'Review sale',
    reviewTitle: 'Review your sale',
    confirm: 'Confirm and sell',
    doneTitle: 'Crypto Sold Successfully',
    doneText: 'Your sale has been processed successfully',
    again: 'Sell more',
  },
};

// The border colour is passed separately so an error can swap it (class sets here don't merge)
const field = 'rounded-2xl border bg-wa-inset transition-colors duration-150';
const fieldBorder = (error) => (error ? 'border-down' : 'border-wa-line focus-within:border-tab-active');
const chip =
  'inline-flex h-9 items-center gap-2 rounded-full bg-wa-pill px-4 text-sm font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:bg-wa-pill-hover hover:text-wa-text disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-tab-active aria-pressed:text-white aria-expanded:bg-wa-pill-hover aria-expanded:text-wa-text';
const unitToggle =
  'inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-wa-pill px-4 text-sm font-bold leading-5 text-wa-text transition-colors duration-150 hover:bg-wa-pill-hover disabled:opacity-50';
const bigBtn = 'inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-bold leading-6 transition-colors duration-150';
const bigPrimary = cx(bigBtn, 'bg-tab-active text-white hover:bg-brand-strong');
const bigOutline = cx(bigBtn, 'border border-wa-text/70 text-wa-text hover:bg-wa-text/10');
const choice =
  'flex gap-3 rounded-2xl border border-wa-line p-4 transition-colors duration-150 has-checked:border-tab-active has-checked:bg-tab-active/10 has-focus-visible:outline-2 has-focus-visible:outline-tab-active';
const methodRow = 'flex w-full items-start gap-3 rounded-xl border border-wa-line p-4 text-left transition-colors duration-150';
const sideTab =
  'grid h-9 flex-1 place-items-center rounded-lg text-[15px] font-semibold leading-6 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-[current=page]:bg-wa-inset aria-[current=page]:text-wa-text aria-[current=page]:shadow-[0_1px_2px_rgba(10,16,36,0.16)]';

const shorten = (address) => (address.length > 18 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address);
const cents = (value) => Math.round(value * 100) / 100;

function formatQty(value, coin) {
  const digits = coin.stable ? 2 : value >= 1 ? 6 : 8;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value)} ${coin.symbol}`;
}

function Stepper({ current }) {
  const at = STEPS.findIndex(([key]) => key === current);
  return (
    <ol className="flex items-center gap-3 max-sm:gap-2" aria-label="Progress">
      {STEPS.map(([key, label], i) => (
        <li key={key} aria-current={i === at ? 'step' : undefined} className="flex items-center gap-3 max-sm:gap-2">
          {i > 0 && <span className={cx('h-px w-10 max-sm:w-5', i <= at ? 'bg-tab-active' : 'bg-wa-line')} />}
          <span
            className={cx(
              'grid size-7 place-items-center rounded-full text-[13px] font-bold leading-none',
              i < at && 'bg-tab-active/15 text-wa-accent',
              i === at && 'bg-tab-active text-white',
              i > at && 'border border-wa-line text-wa-muted',
            )}
          >
            {i < at ? <Check size={14} /> : i + 1}
          </span>
          <span className={cx('text-sm font-semibold leading-5', i === at ? 'text-wa-text' : 'text-wa-muted', i !== at && 'max-sm:sr-only')}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

function Section({ number, title, hint, children }) {
  return (
    <section className={card} aria-labelledby={`wa-order-s${number}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-wa-pill text-xs font-bold leading-none text-wa-muted">{number}</span>
        <div className="min-w-0">
          <h3 id={`wa-order-s${number}`} className={cardTitle}>{title}</h3>
          {hint && <p className="mt-0.5 text-sm leading-5 text-wa-muted">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

const FieldError = ({ children }) => (children ? <p className="mt-2 text-sm leading-5 text-down">{children}</p> : null);

// Saved addresses live in this browser only; there is no account backend yet
function AddressBook({ entries, networks, onPick, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const ids = networks.map((n) => n.id);
  const rows = entries.filter((e) => ids.includes(e.network));

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

  return (
    <div ref={ref} className="relative">
      <button type="button" className={chip} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Book size={16} />
        Address book
      </button>
      {open && (
        <div role="dialog" aria-label="Address book" className="absolute left-0 top-[calc(100%+6px)] z-20 w-[340px] max-w-[calc(100vw-64px)] animate-[pop-in_0.15s_ease-out] rounded-xl border border-wa-line bg-wa-inset p-1.5 shadow-(--wa-shadow)">
          {rows.map((entry) => (
            <div key={entry.address} className="flex items-center gap-1 rounded-lg hover:bg-wa-pill">
              <button
                type="button"
                className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left"
                onClick={() => {
                  onPick(entry);
                  setOpen(false);
                }}
              >
                <span className="block truncate text-[15px] font-semibold leading-5 text-wa-text">{entry.label}</span>
                <span className="block truncate font-mono text-xs leading-5 text-wa-muted">{shorten(entry.address)} · {NETWORKS[entry.network].name}</span>
              </button>
              <button type="button" aria-label={`Remove ${entry.label}`} onClick={() => onRemove(entry.address)} className="mr-1 grid size-8 shrink-0 place-items-center rounded-full text-wa-muted hover:bg-wa-pill-hover hover:text-down">
                <Trash size={16} />
              </button>
            </div>
          ))}
          {!rows.length && <p className="px-3 py-3 text-sm leading-5 text-wa-muted">No saved addresses yet. Tick “Save to address book” below to keep this one for next time.</p>}
        </div>
      )}
    </div>
  );
}

function MethodIcon({ id }) {
  // Crop and sizes follow the Figma: a 28px disc with the logo zoomed to fill it
  if (id === 'mtn') {
    return (
      <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-white">
        <img src={mtnLogo} alt="" className="absolute left-[-41.67%] top-[-1.56%] h-[103.12%] w-[183.33%] max-w-none" />
      </span>
    );
  }
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e7edf7]">
      <img src={cardIcon} alt="" width="16" height="16" />
    </span>
  );
}

const Radio = ({ checked }) => (
  <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', checked ? 'border-tab-active bg-tab-active text-white' : 'border-wa-line text-transparent')}>
    <Check size={12} />
  </span>
);

function Row({ label, children, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cx('shrink-0 text-sm leading-6', strong ? 'font-semibold text-wa-text' : 'text-wa-muted')}>{label}</dt>
      <dd className={cx('min-w-0 text-right tabular-nums text-wa-text', strong ? 'text-[22px] font-semibold leading-7' : 'text-sm font-semibold leading-6')}>{children}</dd>
    </div>
  );
}

const dash = <span className="font-normal text-wa-muted">—</span>;

// Review and Done sit in a native dialog over the order form: it traps focus and makes the page behind inert
function Modal({ labelledBy, onClose, className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      // Escape asks to close; the route decides, so the dialog and the URL can't disagree
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Only the backdrop reports the dialog itself as the target
      onClick={(e) => e.target === ref.current && onClose()}
      className={cx(
        'm-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] animate-[pop-in_0.2s_ease-out] overflow-y-auto rounded-2xl border border-wa-line bg-wa-card text-wa-text shadow-(--wa-shadow) outline-none backdrop:animate-[fade_0.2s_ease-out] backdrop:bg-[#000b1e]/70 backdrop:backdrop-blur-[2px]',
        className,
      )}
    >
      <div className="relative p-8 max-sm:p-5">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text">
          <Close size={20} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

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
  const networks = networksFor(coin);
  const usable = PAYMENT_METHODS.filter((m) => m.use === side);
  const href = (part) => tradeHref(coin, side, part);

  const [walletKey, setWalletKey] = useState(initialWallet || 'mybitstore');
  const [networkId, setNetworkId] = useState(networks.length === 1 ? networks[0].id : null);
  const [address, setAddress] = useState('');
  const [addressTouched, setAddressTouched] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [save, setSave] = useState(false);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState('usd');
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState(usable.length === 1 ? usable[0].id : null);
  const [picking, setPicking] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [book, setBook] = useStored('wa-address-book', []);

  // Only a purchase has a destination to choose; a sale comes straight out of the balance
  const wallet = buying ? WALLETS.find((w) => w.key === walletKey) : null;
  // Buying to an outside wallet needs an address
  const needsAddress = buying && walletKey === 'external';
  // Sections are numbered as shown, and a sale has no wallet step
  const sectionNo = (n) => (buying ? n : n - 1);

  const price = coins[coin.id]?.price;
  const network = networks.find((n) => n.id === networkId);
  const method = PAYMENT_METHODS.find((m) => m.id === methodId);
  const entered = Number.parseFloat(amount) || 0;
  const usd = mode === 'usd' ? entered : entered * (price || 0);
  const qty = mode === 'coin' ? entered : price ? entered / price : 0;
  const fee = usd * ORDER_FEE_RATE;
  // The fee is added to a purchase and taken out of a sale
  const total = buying ? usd + fee : usd - fee;
  const held = HOLDINGS.find((h) => h.id === coin.id)?.value || 0;
  const addressOk = Boolean(network) && network.test.test(address);
  const inBook = book.some((e) => e.address === address);

  const amountError = () => {
    if (!buying && !held) return `You don’t have any ${coin.symbol} to sell.`;
    if (!(entered > 0)) return `Enter an amount to ${side}.`;
    if (!price) return 'Live prices are unavailable right now, so we can’t quote this order.';
    if (!buying && cents(usd) > held) return `You have ${formatPrice(held)} of ${coin.symbol} available to sell.`;
    return '';
  };
  const errors = {
    network: !needsAddress || network ? '' : 'Choose the network your wallet uses.',
    address: !needsAddress ? '' : !address ? 'Enter the wallet address to send to.' : addressOk || !network ? '' : `That doesn’t look like a ${network.name} address. Check it and try again.`,
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

  const onAmount = (raw) => setAmount(raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'));

  const setUsd = (value) => {
    setMode('usd');
    setAmount(value.toFixed(2));
  };

  // Switch between typing dollars and typing the coin amount, keeping the same value
  const flipMode = () => {
    if (entered && price) setAmount(mode === 'usd' ? String(Number((entered / price).toFixed(8))) : (entered * price).toFixed(2));
    setMode(mode === 'usd' ? 'coin' : 'usd');
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.replace(/\s/g, ''));
      setAddressTouched(true);
      setPasteBlocked(false);
    } catch {
      setPasteBlocked(true);
      document.getElementById('wa-order-address')?.focus();
    }
  };

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
    if (needsAddress && save && !inBook) setBook((list) => [...list, { address, network: network.id, label: label.trim() || `My ${coin.symbol} wallet` }]);
    setReceipt({ qty, total, wallet, method, address: needsAddress ? address : '', network: needsAddress ? network : null });
    setAddress('');
    setAddressTouched(false);
    setAmount('');
    setSave(false);
    setLabel('');
    setAttempted(false);
    // Replace, so Back from the receipt can't land on a stale review screen
    window.location.replace(href('done'));
  };

  const showAddressError = (attempted || addressTouched) && errors.address && (attempted || address);
  const rate = price ? `1 ${coin.symbol} = ${formatPrice(price)}` : null;
  const quoted = entered > 0 && Boolean(price);
  const methodName = method ? `${method.name} ${method.kind}` : '';

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
        <Stepper current={view} />
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
                  {networks.length > 1 && (
                    <fieldset className="mb-5">
                      <legend className="text-sm font-semibold leading-5 text-wa-text">Network</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {networks.map((n, i) => (
                          <label key={n.id} className="cursor-pointer rounded-full border border-wa-line px-4 py-2 text-sm font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text has-checked:border-tab-active has-checked:bg-tab-active/12 has-checked:text-wa-text has-focus-visible:outline-2 has-focus-visible:outline-tab-active">
                            <input type="radio" name="wa-order-network" id={i === 0 ? 'wa-order-network' : undefined} className="sr-only" checked={networkId === n.id} onChange={() => setNetworkId(n.id)} />
                            {networkLabel(n)}
                          </label>
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-5 text-wa-muted">It must match the network of the receiving wallet. {coin.symbol} sent on the wrong network can’t be recovered.</p>
                      {attempted && <FieldError>{errors.network}</FieldError>}
                    </fieldset>
                  )}

                  <label htmlFor="wa-order-address" className="text-sm font-semibold leading-5 text-wa-text">
                    Wallet address{network && networks.length === 1 && <span className="font-normal text-wa-muted"> · {networkLabel(network)} network</span>}
                  </label>
                  <div className={cx(field, fieldBorder(showAddressError), 'mt-2 flex h-14 items-center gap-2 pl-4 pr-2')}>
                    <input
                      id="wa-order-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value.replace(/\s/g, ''))}
                      onBlur={() => setAddressTouched(true)}
                      placeholder={`Paste or type your ${network ? network.name : coin.symbol} address`}
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-invalid={Boolean(showAddressError)}
                      aria-describedby="wa-order-address-note"
                      className="min-w-0 flex-1 bg-transparent font-mono text-[15px] leading-6 text-wa-text outline-none placeholder:font-nunito placeholder:text-wa-muted"
                    />
                    {address ? (
                      <button type="button" className={chip} onClick={() => setAddress('')}>Clear</button>
                    ) : (
                      <button type="button" className={chip} onClick={paste}><Clipboard size={16} />Paste</button>
                    )}
                  </div>
                  <div id="wa-order-address-note">
                    {showAddressError ? (
                      <FieldError>{errors.address}</FieldError>
                    ) : addressOk ? (
                      <p className="mt-2 flex items-center gap-1.5 text-sm leading-5 text-up"><Check size={16} />Valid {network.name} address format</p>
                    ) : (
                      pasteBlocked && <p className="mt-2 text-sm leading-5 text-wa-muted">Your browser blocked the paste. Click the field and press Ctrl or ⌘ + V instead.</p>
                    )}
                    </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <AddressBook
                      entries={book}
                      networks={networks}
                      onPick={(entry) => {
                        setNetworkId(entry.network);
                        setAddress(entry.address);
                      }}
                      onRemove={(remove) => setBook((list) => list.filter((e) => e.address !== remove))}
                    />
                    {addressOk && !inBook && (
                      <label className="flex cursor-pointer items-center gap-2 text-sm leading-5 text-wa-text">
                        <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-4 accent-tab-active" />
                        Save to address book
                      </label>
                    )}
                    {addressOk && !inBook && save && (
                      <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder={`Name it, e.g. My ${coin.symbol} wallet`}
                        aria-label="Name for this address"
                        maxLength={40}
                        className="h-9 min-w-0 flex-1 rounded-full border border-wa-line bg-transparent px-4 text-sm leading-5 text-wa-text outline-none placeholder:text-wa-muted focus:border-tab-active"
                      />
                    )}
                  </div>
                </div>
              )}
            </Section>
          )}

          <Section number={sectionNo(2)} title={copy.amount}>
            <div className={cx(field, fieldBorder(attempted && errors.amount), 'flex h-[88px] items-center gap-3 px-5 max-sm:px-4')}>
              {mode === 'usd' && <span className="text-[40px] font-semibold leading-[48px] text-wa-muted max-sm:text-[32px]" aria-hidden="true">$</span>}
              <input
                id="wa-order-amount"
                value={amount}
                onChange={(e) => onAmount(e.target.value)}
                inputMode="decimal"
                placeholder={mode === 'usd' ? '0.00' : '0'}
                autoComplete="off"
                aria-label={mode === 'usd' ? 'Amount in US dollars' : `Amount in ${coin.symbol}`}
                aria-invalid={Boolean(attempted && errors.amount)}
                className="min-w-0 flex-1 bg-transparent text-[40px] font-semibold leading-[48px] tracking-[-0.8px] text-wa-text tabular-nums outline-none placeholder:text-wa-muted/50 max-sm:text-[32px]"
              />
              <button type="button" onClick={flipMode} disabled={!price} aria-label={`Enter the amount in ${mode === 'usd' ? coin.symbol : 'US dollars'} instead`} className={unitToggle}>
                {mode === 'usd' ? 'USD' : coin.symbol}
                <SwapVertical size={16} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <p className="text-sm leading-5 text-wa-muted tabular-nums" aria-live="polite">
                {quoted ? (
                  <>≈ {mode === 'usd' ? formatQty(qty, coin) : formatPrice(usd)}</>
                ) : rate ? rate : status === 'error' ? 'Live prices are unavailable right now.' : <span className={cx(skeleton, 'w-32')} />}
              </p>
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
            </div>
            {attempted && <FieldError>{errors.amount}</FieldError>}
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
            <Row label={buying ? 'Amount buying' : 'Value'}>{formatPrice(usd)}</Row>
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
            <Row label={buying ? 'Paid with' : 'Paid to'}>{receipt.method.name} {receipt.method.kind}</Row>
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
