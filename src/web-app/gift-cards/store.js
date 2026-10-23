import { useEffect, useMemo, useState } from 'react';
import { useNotifications } from '../Notifications.jsx';
import { useVerification } from '../account.js';
import { useStored } from '../format.jsx';
import { LIMITS, brandById, buyPrice, cleanCode, face, ghs } from './catalog.js';

// Gift card state for the web app preview. There's no backend, so the cart, orders, trades, the sell draft and the
// cedi (GHS) wallet live in this browser, seeded with sample history. The ticker below plays the part of the
// supplier and the review team: it delivers orders, starts reviews and pays out approved trades.

const MIN = 60000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// PRD: buying and selling need Tier 1 (verified); browsing is open. The preview treats a verified email as Tier 1,
// since the sample account has no tier: swap for the real tier rule.
export const useCanTrade = () => useVerification()[0].email === 'verified';

// Each hook keeps the same key in step across every view
export const useTab = () => useStored('wa-gc-tab', 'buy');
export const useGhsBalance = () => useStored('wa-gc-ghs', 3480.5);
export const useBuyNow = () => useStored('wa-gc-buynow', null);

export function useCart() {
  const [cart, setCart] = useStored('wa-gc-cart', { items: [], savedAt: 0 });
  // The cart is kept for 7 days
  const items = cart.savedAt && Date.now() - cart.savedAt > LIMITS.cartDays * DAY ? [] : cart.items;
  const setItems = (next) => setCart((c) => ({ items: typeof next === 'function' ? next(c.items) : next, savedAt: Date.now() }));
  return [items, setItems];
}

export const cartCount = (items) => items.reduce((n, item) => n + item.qty, 0);

// Sample codes: random letters and digits in the brand's usual grouping
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomCode(length = 16, seed) {
  let out = '';
  let s = seed;
  for (let i = 0; i < length; i += 1) {
    let n;
    if (seed !== undefined) {
      s = (s * 9301 + 49297) % 233280;
      n = Math.floor((s / 233280) * ALPHABET.length);
    } else {
      n = crypto.getRandomValues(new Uint32Array(1))[0] % ALPHABET.length;
    }
    out += ALPHABET[n];
  }
  return out;
}
const CODE_LENGTH = { xbox: 25, apple: 16, 'google-play': 20, amazon: 15, steam: 15, nintendo: 16 };
const PIN_BRANDS = ['nike', 'walmart', 'target', 'starbucks'];
export const codeGroups = (brandId) => ({ xbox: [5, 5, 5, 5, 5], steam: [5, 5, 5], amazon: [4, 6, 5], 'google-play': [4, 4, 4, 4, 4] })[brandId] || [4, 4, 4, 4];

function makeCodes(item, seed) {
  return Array.from({ length: item.qty }, (_, i) => ({
    // Apple codes always start with X
    code: (item.brand === 'apple' ? 'X' : '') + randomCode((CODE_LENGTH[item.brand] || 16) - (item.brand === 'apple' ? 1 : 0), seed === undefined ? undefined : seed + i * 7),
    pin: PIN_BRANDS.includes(item.brand) ? randomCode(4, seed === undefined ? undefined : seed + 3).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) % 10)) : null,
    revealed: false,
  }));
}

export const newId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${randomCode(3)}`;

export const itemPrice = (item) => buyPrice(item.country, item.value) * item.qty;
export const itemTitle = (item) => `${brandById[item.brand].name} ${item.country} ${face(item.country, item.value)}`;

// Sample history, dated relative to the first visit so it reads naturally
function sampleOrders(now) {
  const o1 = { key: 's1', brand: 'netflix', country: 'US', value: 25, qty: 1, gift: null };
  const o2 = { key: 's2', brand: 'playstation', country: 'US', value: 50, qty: 1, gift: { name: 'Ama', contact: 'ama@example.com', message: 'Happy birthday! Enjoy the new game.', when: 'now' } };
  return [
    { id: 'GC-7KQ2M', at: now - 3 * DAY, readyAt: now - 3 * DAY + 4000, items: [{ ...o1, codes: makeCodes(o1, 11) }], pay: { kind: 'wallet' }, subtotal: itemPrice(o1), fee: 0, discount: 0, total: itemPrice(o1), notified: true },
    { id: 'GC-3HV9D', at: now - 9 * DAY, readyAt: now - 9 * DAY + 5000, items: [{ ...o2, codes: makeCodes(o2, 29).map((c) => ({ ...c, revealed: true })) }], pay: { kind: 'momo', accountId: 'pm-3' }, subtotal: itemPrice(o2), fee: 0, discount: 0, total: itemPrice(o2), notified: true, giftOpenedAt: now - 9 * DAY + 2 * HOUR },
  ];
}

const card = (value, extra) => ({ id: randomCode(6), value, ...extra });
function sampleTrades(now) {
  const step = (status, ago) => ({ status, at: now - ago });
  return [
    {
      id: 'TR-48KDP', brand: 'steam', country: 'US', type: 'ecode', receipt: 'without', value: 100, qty: 1, rate: 10.37, expected: 1037,
      cards: [card(100, { code: 'G7K2PQX9M4T8RZ5' })], payout: { method: 'wallet' }, note: '', status: 'review',
      history: [step('submitted', 9 * MIN), step('review', 6 * MIN)],
    },
    {
      id: 'TR-21VMA', brand: 'apple', country: 'US', type: 'ecode', receipt: 'without', value: 50, qty: 2, rate: 10.43, expected: 1043,
      cards: [card(50, { code: 'X4K9P2M7Q8T3Z6RN', result: { status: 'approved' } }), card(50, { code: 'XH2M8Q4P9K7T3N5W', result: { status: 'partial', value: 25, reason: 'value', note: 'Card value was $25, not $50' } })],
      payout: { method: 'wallet' }, note: 'Cards from my brother in the US', status: 'paid', decision: 'partial', actual: 782.25,
      history: [step('submitted', 2 * DAY + 40 * MIN), step('review', 2 * DAY + 31 * MIN), step('partial', 2 * DAY + 12 * MIN), step('paid', 2 * DAY + 11 * MIN)],
    },
    {
      id: 'TR-90QTB', brand: 'google-play', country: 'US', type: 'physical', receipt: 'without', value: 25, qty: 1, rate: 9.31, expected: 232.75,
      cards: [card(25, { result: { status: 'rejected', reason: 'redeemed', note: 'The balance on this card is $0.' } })], payout: { method: 'wallet' }, note: '', status: 'rejected', decision: 'rejected',
      history: [step('submitted', 20 * HOUR), step('review', 19 * HOUR + 50 * MIN), step('rejected', 19 * HOUR + 30 * MIN)],
    },
    {
      id: 'TR-15ZRE', brand: 'amazon', country: 'US', type: 'physical', receipt: 'with', value: 100, qty: 1, rate: 10.82, expected: 1082,
      cards: [card(100, { result: { status: 'approved' } })], payout: { method: 'momo', accountId: 'pm-1' }, note: '', status: 'paid', decision: 'approved', actual: 1082,
      history: [step('submitted', 6 * DAY), step('review', 6 * DAY - 7 * MIN), step('approved', 6 * DAY - 18 * MIN), step('paid', 6 * DAY - 19 * MIN)],
    },
  ];
}

// The sample is built once per page load, so every hook seeds the same history
let seeds;
const seed = () => (seeds ||= { orders: sampleOrders(Date.now()), trades: sampleTrades(Date.now()) });

export const useOrders = () => useStored('wa-gc-orders', seed().orders);
export const useTrades = () => useStored('wa-gc-trades', seed().trades);

export function useDraft() {
  const [draft, setDraft] = useStored('wa-gc-draft', null);
  // A draft is kept for 24 hours
  const live = draft && Date.now() - draft.savedAt < LIMITS.draftHours * HOUR ? draft : null;
  const save = (next) => setDraft((d) => {
    const resolved = typeof next === 'function' ? next(d) : next;
    return resolved ? { ...resolved, savedAt: Date.now() } : null;
  });
  return [live, save];
}

/* ——— Statuses ——— */

// An order's state comes from its timestamps, so it is right even after the tab was closed
export function orderStatus(order, item, now = Date.now()) {
  if (order.failed) return 'failed';
  if (now < order.readyAt) return 'processing';
  if (item?.gift) return item.gift.when !== 'now' && new Date(item.gift.when).getTime() > now ? 'scheduled' : 'gift-sent';
  return 'delivered';
}

export const ORDER_STATUS = {
  processing: { label: 'Processing', tone: 'warn' },
  delivered: { label: 'Delivered', tone: 'good' },
  scheduled: { label: 'Gift scheduled', tone: 'accent' },
  'gift-sent': { label: 'Gift sent', tone: 'good' },
  failed: { label: 'Refunded', tone: 'muted' },
};

export const TRADE_STATUS = {
  submitted: { label: 'Submitted', tone: 'warn', line: 'We’ve received your trade. Review starts shortly.' },
  review: { label: 'In review', tone: 'warn', line: 'A reviewer is checking your card.' },
  extended: { label: 'Extended review', tone: 'warn', line: 'This trade needs extra checks. This can take up to 24 hours.' },
  'needs-info': { label: 'Needs info', tone: 'danger', line: 'We need a clearer photo or a receipt.' },
  approved: { label: 'Approved', tone: 'good', line: 'Approved. Sending your payout now.' },
  partial: { label: 'Partially approved', tone: 'accent', line: 'Some cards were approved at a lower value. See why below.' },
  paid: { label: 'Paid', tone: 'good', line: 'Your payout has been sent.' },
  rejected: { label: 'Rejected', tone: 'danger', line: 'We couldn’t accept this card. See why below.' },
  cancelled: { label: 'Cancelled', tone: 'muted', line: 'You cancelled this trade.' },
  expired: { label: 'Expired', tone: 'muted', line: 'No reply to our request in time. Start a new trade.' },
  disputed: { label: 'Disputed', tone: 'accent', line: 'We’re looking at your dispute. We’ll reply within 48 hours.' },
};

export const OPEN_TRADE = ['submitted', 'review', 'extended', 'needs-info', 'approved', 'partial', 'disputed'];
export const lastAt = (trade, status) => [...trade.history].reverse().find((h) => h.status === status)?.at;
export const decidedAt = (trade) => lastAt(trade, trade.decision) ?? lastAt(trade, 'rejected');

/* ——— Notifications ——— */

export function useNotify() {
  const [, setNotes] = useNotifications();
  return (text, href) => setNotes((list) => [{ id: `gc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind: 'giftcard', at: Date.now(), read: false, href, text }, ...list]);
}

export const payoutLabel = (payout, accounts) => {
  if (payout.method === 'usdt') return 'your USDT wallet';
  if (payout.method === 'momo') {
    const account = accounts.find((a) => a.id === payout.accountId);
    return account ? `MoMo ${account.number.slice(-4)}` : 'mobile money';
  }
  return 'your GHS wallet';
};

/* ——— The preview's stand-in for the supplier and the review team ——— */

// Events already acted on, so a repeated effect (React's development double-run) can't notify or pay twice
const handled = new Set();
const once = (key) => (handled.has(key) ? false : (handled.add(key), true));

export function useGiftCardTicker() {
  const [orders, setOrders] = useOrders();
  const [trades, setTrades] = useTrades();
  const [, setBalance] = useGhsBalance();
  const notify = useNotify();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Delivered orders: tell the buyer once
  useEffect(() => {
    const ready = orders.filter((o) => !o.notified && !o.failed && now >= o.readyAt && once(`ready-${o.id}`));
    if (!ready.length) return;
    setOrders((list) => list.map((o) => (ready.some((r) => r.id === o.id) ? { ...o, notified: true } : o)));
    ready.forEach((o) => {
      const item = o.items[0];
      const brand = brandById[item.brand].name;
      if (item.gift && item.gift.when === 'now') notify(['', item.gift.name, ' received your ', `${brand} gift card`, '.'], `#gift-cards/order/${o.id}`);
      else if (!item.gift) {
        const count = o.items.reduce((n, it) => n + (it.gift ? 0 : it.qty), 0);
        notify(count > 1 ? ['Your ', `${count} gift cards`, ' are ready to use.'] : ['Your ', `${brand} ${face(item.country, item.value)}`, ' card is ready to use.'], `#gift-cards/order/${o.id}`);
      }
    });
  }, [orders, now]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trades: review starts by itself; Needs info expires; approved trades are paid out
  useEffect(() => {
    const changes = [];
    for (const t of trades) {
      const since = t.history[t.history.length - 1].at;
      if (t.status === 'submitted' && now - since > 20000) changes.push([t, 'review']);
      else if (t.status === 'extended' && now - since > 30000) changes.push([t, 'review']);
      else if (t.status === 'needs-info' && now - since > LIMITS.needsInfoHours * HOUR) changes.push([t, 'expired']);
      else if ((t.status === 'approved' || t.status === 'partial') && now - since > 4000) changes.push([t, 'paid']);
    }
    const fresh = changes.filter(([t, next]) => once(`${t.id}-${t.history.length}-${next}`));
    if (!fresh.length) return;
    changes.splice(0, changes.length, ...fresh);
    setTrades((list) => list.map((t) => {
      const change = changes.find(([c]) => c.id === t.id);
      return change ? { ...t, status: change[1], history: [...t.history, { status: change[1], at: Date.now() }] } : t;
    }));
    for (const [t, next] of changes) {
      const brand = brandById[t.brand].name;
      const href = `#gift-cards/trade/${t.id}`;
      if (next === 'paid') {
        const amount = t.actual ?? t.expected;
        if (t.payout.method === 'wallet') setBalance((b) => b + amount);
        notify(t.decision === 'partial' ? ['You were paid ', ghs(amount), ' for your ', brand, ' trade. Tap to see why it was less.'] : ['', ghs(amount), ' sent for your ', `${brand} card`, '.'], href);
      }
      if (next === 'expired') notify(['Your ', `${brand} trade`, ' expired because we didn’t get the info we asked for.'], href);
    }
  }, [trades, now]); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ——— Toasts ——— */

const toastListeners = new Set();
export function toast(message, action) {
  const t = { id: Math.random(), message, action };
  toastListeners.forEach((fn) => fn(t));
}
export function useToasts() {
  const [list, setList] = useState([]);
  useEffect(() => {
    const add = (t) => {
      setList((l) => [...l.slice(-2), t]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), t.action ? 4000 : 2600);
    };
    toastListeners.add(add);
    return () => toastListeners.delete(add);
  }, []);
  return [list, (id) => setList((l) => l.filter((x) => x.id !== id))];
}

/* ——— Online status (GF-G) ——— */

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

// What's been sold or bought today, for the daily limits
export function useToday() {
  const [orders] = useOrders();
  const [trades] = useTrades();
  return useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0);
    return {
      bought: orders.filter((o) => o.at >= start && !o.failed).reduce((s, o) => s + o.total, 0),
      sold: trades.filter((t) => t.history[0].at >= start && !['cancelled', 'rejected', 'expired'].includes(t.status)).reduce((s, t) => s + t.expected, 0),
      open: trades.filter((t) => ['submitted', 'review', 'extended', 'needs-info'].includes(t.status)).length,
      completed: trades.filter((t) => t.status === 'paid').length,
    };
  }, [orders, trades]);
}

// Codes ever submitted, to catch a card being sold twice
export const submittedCodes = (trades) => new Set(trades.filter((t) => t.status !== 'cancelled').flatMap((t) => t.cards.map((c) => c.code && cleanCode(c.code)).filter(Boolean)));

export { makeCodes };
