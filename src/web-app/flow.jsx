import qrcode from 'qrcode-generator';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatPrice } from '../marketData.js';
import { cx } from '../ui.js';
import { FigmaCopyButton } from './figmaCopy.jsx';
import { useStored } from './format.jsx';
import { Book, Check, ChevronDown, Clipboard, Close, Plus, Search, SwapVertical, Trash } from './icons.jsx';
import { NETWORKS, networkLabel, networksFor } from './networks.js';
import { ProviderLogo, accountLabel, canUse, maskNumber, typeById } from './paymentAccounts.jsx';
import { card, cardTitle, skeleton } from './parts.jsx';

// Class sets, fields and dialogs shared by the money flows: buy, sell and deposit

// The border colour is passed separately so an error can swap it (class sets here don't merge)
export const field = 'rounded-2xl border bg-wa-inset transition-colors duration-150';
export const fieldBorder = (error) => (error ? 'border-down' : 'border-wa-line focus-within:border-tab-active');
export const chip =
  'inline-flex h-9 items-center gap-2 rounded-full bg-wa-pill px-4 text-sm font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:bg-wa-pill-hover hover:text-wa-text disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-tab-active aria-pressed:text-white aria-expanded:bg-wa-pill-hover aria-expanded:text-wa-text';
export const unitToggle =
  'inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-wa-pill px-4 text-sm font-bold leading-5 text-wa-text transition-colors duration-150 hover:bg-wa-pill-hover disabled:opacity-50';
const bigBtn = 'inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-bold leading-6 transition-colors duration-150';
export const bigPrimary = cx(bigBtn, 'bg-tab-active text-white hover:bg-brand-strong');
export const bigOutline = cx(bigBtn, 'border border-wa-text/70 text-wa-text hover:bg-wa-text/10');
export const choice =
  'flex gap-3 rounded-2xl border border-wa-line p-4 transition-colors duration-150 has-checked:border-tab-active has-checked:bg-tab-active/10 has-focus-visible:outline-2 has-focus-visible:outline-tab-active';
export const sideTab =
  'grid h-9 flex-1 place-items-center rounded-lg text-[15px] font-semibold leading-6 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-[current=page]:bg-wa-inset aria-[current=page]:text-wa-text aria-[current=page]:shadow-[0_1px_2px_rgba(10,16,36,0.16)]';

export const shorten = (address) => (address.length > 18 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address);
export const cents = (value) => Math.round(value * 100) / 100;

export function formatQty(value, coin) {
  const digits = coin.stable ? 2 : value >= 1 ? 6 : 8;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value)} ${coin.symbol}`;
}

export function Section({ number, title, hint, children }) {
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

export const FieldError = ({ children }) => (children ? <p className="mt-2 text-sm leading-5 text-down">{children}</p> : null);

// Saved addresses live in this browser only; there is no account backend yet
export function AddressBook({ entries, networks, onPick, onRemove }) {
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

export const Radio = ({ checked }) => (
  <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', checked ? 'border-tab-active bg-tab-active text-white' : 'border-wa-line text-transparent')}>
    <Check size={12} />
  </span>
);

export function Row({ label, children, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={cx('shrink-0 text-sm leading-6', strong ? 'font-semibold text-wa-text' : 'text-wa-muted')}>{label}</dt>
      <dd className={cx('min-w-0 text-right tabular-nums text-wa-text', strong ? 'text-[22px] font-semibold leading-7' : 'text-sm font-semibold leading-6')}>{children}</dd>
    </div>
  );
}

export const dash = <span className="font-normal text-wa-muted">—</span>;

// Review and Done sit in a native dialog over the form: it traps focus and makes the page behind inert
export function Modal({ labelledBy, onClose, className, children }) {
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
        {/* The page behind a dialog is inert, so the dialog carries its own copy button */}
        <FigmaCopyButton className="absolute right-14 top-5.5 max-sm:hidden">Copy</FigmaCopyButton>
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text">
          <Close size={20} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

export function QrCode({ value, label, size = 176 }) {
  const { count, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let row = 0; row < n; row += 1) for (let col = 0; col < n; col += 1) if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
    return { count: n, path: d };
  }, [value]);
  // Always dark on white, whatever the theme, so cameras can read it
  return (
    <svg viewBox={`-2 -2 ${count + 4} ${count + 4}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges" className="mx-auto block rounded-2xl bg-white">
      <path d={path} fill="#0a1024" />
    </svg>
  );
}

// Outlined pill tabs (the Payment methods filters and the Settings sections): pressed buttons or current-page links
export const pillTab =
  'inline-flex h-10 items-center rounded-full border-2 border-transparent px-6 text-sm font-semibold leading-6 tracking-[-0.14px] text-wa-muted transition-colors duration-150 hover:text-wa-text aria-pressed:border-tab-active aria-pressed:text-wa-text aria-[current=page]:border-tab-active aria-[current=page]:text-wa-text max-sm:px-4';

// Buttons used side by side at the foot of dialogs (Cancel, then the action)
export const formBtn = 'inline-flex h-[50px] items-center justify-center gap-2 rounded-full px-3 text-base font-semibold leading-6 transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50';
export const cancelBtn = cx(formBtn, 'border border-wa-line text-wa-text hover:bg-wa-pill');
export const primaryBtn = cx(formBtn, 'bg-tab-active text-white hover:bg-brand-strong');
export const dangerBtn = cx(formBtn, 'bg-[#da5151] text-white hover:bg-[#c43f3f]');

// A short centred dialog: an icon in a tinted disc, a title, a line or two, then its buttons.
// `tone` tints the disc: danger (red), brand (blue) or good (green)
const TONES = { danger: 'bg-[rgba(241,176,176,0.3)] text-down', brand: 'bg-tab-active/15 text-wa-accent', good: 'bg-up/15 text-up' };

export function NoticeDialog({ id, icon: Icon, tone = 'danger', title, children, onClose, actions }) {
  return (
    <Modal labelledBy={id} onClose={onClose} className="max-w-[380px]">
      <div className="text-center">
        <span className={cx('mx-auto grid size-[50px] place-items-center rounded-full', TONES[tone])}>
          <Icon size={24} />
        </span>
        <h3 id={id} className="mx-auto mt-5 max-w-[280px] text-2xl font-bold leading-7 text-wa-text">{title}</h3>
        <div className="mx-auto mt-2.5 max-w-[280px] text-base leading-5 text-wa-muted">{children}</div>
      </div>
      <div className={cx('mt-6 grid gap-3.5', actions.length > 1 && 'grid-cols-2')}>{actions}</div>
    </Modal>
  );
}

// Where the crypto goes: the network, the address, and the address book that remembers them.
// `required` is false while the flow doesn't need an address, so nothing is reported as missing.
export function useAddressEntry(coin, required, attempted) {
  const networks = networksFor(coin);
  const [networkId, setNetworkId] = useState(null);
  const [address, setAddress] = useState('');
  const [addressTouched, setAddressTouched] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [save, setSave] = useState(false);
  const [label, setLabel] = useState('');
  const [book, setBook] = useStored('wa-address-book', []);

  // A coin with one network needs no choice
  const network = networks.find((n) => n.id === networkId) || (networks.length === 1 ? networks[0] : undefined);
  const addressOk = Boolean(network) && network.test.test(address);
  const inBook = book.some((e) => e.address === address);
  const errors = {
    network: !required || network ? '' : 'Choose the network your wallet uses.',
    address: !required ? '' : !address ? 'Enter the wallet address to send to.' : addressOk || !network ? '' : `That doesn’t look like a ${network.name} address. Check it and try again.`,
  };
  const showAddressError = (attempted || addressTouched) && errors.address && (attempted || address);

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

  // Once the order is confirmed: keep the address if asked to
  const commit = () => {
    if (required && save && !inBook) setBook((list) => [...list, { address, network: network.id, label: label.trim() || `My ${coin.symbol} wallet` }]);
  };

  const reset = () => {
    setAddress('');
    setAddressTouched(false);
    setSave(false);
    setLabel('');
  };

  return { networks, network, setNetworkId, address, setAddress, setAddressTouched, addressOk, pasteBlocked, paste, save, setSave, label, setLabel, book, setBook, inBook, errors, showAddressError, commit, reset };
}

// Coins that live on more than one network ask which one; `from` words the hint for a deposit coming in
export function NetworkChoice({ coin, entry, error, from, className }) {
  const { networks, network, setNetworkId } = entry;
  if (networks.length < 2) return null;
  return (
    <fieldset className={className}>
      <legend className="text-sm font-semibold leading-5 text-wa-text">Network</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {networks.map((n, i) => (
          <label key={n.id} className="cursor-pointer rounded-full border border-wa-line px-4 py-2 text-sm font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text has-checked:border-tab-active has-checked:bg-tab-active/12 has-checked:text-wa-text has-focus-visible:outline-2 has-focus-visible:outline-tab-active">
            <input type="radio" name="wa-order-network" id={i === 0 ? 'wa-order-network' : undefined} className="sr-only" checked={network?.id === n.id} onChange={() => setNetworkId(n.id)} />
            {networkLabel(n)}
          </label>
        ))}
      </div>
      <p className="mt-2 text-sm leading-5 text-wa-muted">It must match the network of the {from ? 'sending' : 'receiving'} wallet. {coin.symbol} sent on the wrong network can’t be recovered.</p>
      <FieldError>{error}</FieldError>
    </fieldset>
  );
}

export function AddressEntry({ coin, entry, attempted }) {
  const { networks, network, setNetworkId, address, setAddress, setAddressTouched, addressOk, pasteBlocked, paste, save, setSave, label, setLabel, book, setBook, inBook, errors, showAddressError } = entry;
  return (
    <>
      <NetworkChoice coin={coin} entry={entry} error={attempted && errors.network} className="mb-5" />

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
    </>
  );
}

// An amount typed in dollars or in the coin itself; `price` converts between the two
export function useAmountEntry(price) {
  const [mode, setMode] = useState('usd');
  const [amount, setAmount] = useState('');
  const entered = Number.parseFloat(amount) || 0;
  const usd = mode === 'usd' ? entered : entered * (price || 0);
  const qty = mode === 'coin' ? entered : price ? entered / price : 0;
  const quoted = entered > 0 && Boolean(price);

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

  return { mode, amount, entered, usd, qty, quoted, price, onAmount, setUsd, flipMode, reset: () => setAmount('') };
}

// The children are the quick-fill buttons shown beside the conversion hint
export function AmountEntry({ coin, entry, error, rate, status, children }) {
  const { mode, amount, usd, qty, quoted, price, onAmount, flipMode } = entry;
  return (
    <>
      <div className={cx(field, fieldBorder(error), 'flex h-[88px] items-center gap-3 px-5 max-sm:px-4')}>
        {mode === 'usd' && <span className="text-[40px] font-semibold leading-[48px] text-wa-muted max-sm:text-[32px]" aria-hidden="true">$</span>}
        <input
          id="wa-order-amount"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          inputMode="decimal"
          placeholder={mode === 'usd' ? '0.00' : '0'}
          autoComplete="off"
          aria-label={mode === 'usd' ? 'Amount in US dollars' : `Amount in ${coin.symbol}`}
          aria-invalid={Boolean(error)}
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
        {children}
      </div>
      <FieldError>{error}</FieldError>
    </>
  );
}

// A searchable coin picker: the list can grow long, so it opens from one field instead of laying every coin out.
// `detail` swaps the coin's name for something more useful, such as the balance held.
export function CoinChoice({ coins, coinId, onPick, detail = (coin) => coin.name }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const selected = coins.find((c) => c.id === coinId);
  const term = query.trim().toLowerCase();
  const matches = term ? coins.filter((c) => c.symbol.toLowerCase().includes(term) || c.name.toLowerCase().includes(term)) : coins;

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', onClick);
    return () => document.removeEventListener('pointerdown', onClick);
  }, [open]);

  const toggle = () => {
    setQuery('');
    // Start on the current coin so Enter keeps it
    setActive(Math.max(coins.findIndex((c) => c.id === coinId), 0));
    setOpen((o) => !o);
  };

  const pick = (coin) => {
    onPick(coin.id);
    setOpen(false);
    ref.current.querySelector('button').focus();
  };

  // The search box keeps focus; arrows move the highlight through the list below it
  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      ref.current.querySelector('button').focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (matches.length) setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length);
    } else if (e.key === 'Enter' && matches[active]) {
      e.preventDefault();
      pick(matches[active]);
    }
  };

  useEffect(() => {
    if (open) ref.current.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  return (
    <div ref={ref} className="relative">
      <button type="button" id="wa-order-coin" aria-haspopup="listbox" aria-expanded={open} onClick={toggle} className={cx(field, 'flex h-16 w-full items-center gap-3 px-4 text-left hover:border-tab-active', open ? 'border-tab-active' : 'border-wa-line')}>
        {selected ? (
          <>
            <img src={selected.icon} alt="" width="32" height="32" className="size-8 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold leading-5 text-wa-text">{selected.symbol}</span>
              <span className="block truncate text-sm leading-5 text-wa-muted tabular-nums">{detail(selected)}</span>
            </span>
          </>
        ) : (
          <span className="min-w-0 flex-1 text-[15px] leading-6 text-wa-muted">Select a coin</span>
        )}
        <ChevronDown size={18} className={cx('shrink-0 text-wa-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 animate-[pop-in_0.15s_ease-out] rounded-2xl border border-wa-line bg-wa-inset p-1.5 shadow-(--wa-shadow)">
          <label className="flex h-11 items-center gap-2.5 rounded-xl border border-wa-line px-3 text-wa-muted focus-within:border-tab-active focus-within:text-wa-text">
            <Search size={18} className="shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
              placeholder="Search coins"
              role="combobox"
              aria-expanded="true"
              aria-controls="wa-order-coin-list"
              aria-label="Search coins"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-[15px] leading-6 text-wa-text outline-none placeholder:text-wa-muted"
            />
          </label>
          <ul id="wa-order-coin-list" role="listbox" aria-label="Coins" className="mt-1.5 max-h-[280px] overflow-y-auto">
            {matches.map((c, i) => (
              <li
                key={c.id}
                role="option"
                aria-selected={i === active}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(c)}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 aria-selected:bg-wa-pill"
              >
                <img src={c.icon} alt="" width="32" height="32" className="size-8 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold leading-5 text-wa-text">{c.symbol}</span>
                  <span className="block truncate text-sm leading-5 text-wa-muted tabular-nums">{detail(c)}</span>
                </span>
                {c.id === coinId && <Check size={18} className="shrink-0 text-wa-accent" />}
              </li>
            ))}
            {!matches.length && <li className="px-3 py-3 text-sm leading-5 text-wa-muted">No coin matches “{query.trim()}”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

// Saved payment accounts as cards: only those set up for `use`, the side being paid (buy) or paid out (sell)
export function MethodChoice({ accounts, use, methodId, onPick, error }) {
  const usable = accounts.filter((m) => canUse(m, use));
  return (
    <>
      {usable.length ? (
        <div role="radiogroup" aria-label="Payment account" className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 max-md:grid-cols-[minmax(0,1fr)]">
          {usable.map((m, i) => (
            <label key={m.id} className={cx(choice, 'cursor-pointer items-start hover:bg-wa-pill/50')}>
              <input type="radio" name="wa-order-method" id={i === 0 ? 'wa-order-method' : undefined} className="sr-only" checked={methodId === m.id} onChange={() => onPick(m.id)} />
              <ProviderLogo id={m.provider} />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-5 text-wa-text">{accountLabel(m)} <span className="font-normal text-wa-muted">{typeById[m.type].tag}</span></span>
                <span className="mt-1 block truncate text-sm leading-5 text-wa-muted">{m.holder}</span>
                <span className="block truncate text-sm leading-5 text-wa-muted tabular-nums">{maskNumber(m.number)}</span>
              </span>
              <Radio checked={methodId === m.id} />
            </label>
          ))}
        </div>
      ) : (
        <p id="wa-order-method" tabIndex={-1} className="rounded-2xl border border-dashed border-wa-line px-4 py-5 text-sm leading-5 text-wa-muted">
          You have no account set up for {use === 'buy' ? 'paying' : 'receiving money'} yet.
        </p>
      )}
      <FieldError>{error}</FieldError>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <a href="#payments/add" className="inline-flex items-center gap-2 rounded-md text-[15px] font-bold leading-6 text-wa-accent hover:underline">
          <Plus size={16} />
          Add a payment account
        </a>
        <a href="#payments" className="inline-flex items-center rounded-md text-[15px] font-bold leading-6 text-wa-muted hover:text-wa-text hover:underline">Manage accounts</a>
      </div>
    </>
  );
}
