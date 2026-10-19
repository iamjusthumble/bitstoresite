import React, { useEffect, useRef, useState } from 'react';
import bellBlue from '../assets/wa-notifications/bell-blue.svg';
import bellRed from '../assets/wa-notifications/bell-red.svg';
import coins from '../assets/wa-notifications/coins.svg';
import { cx } from '../ui.js';
import { pillTab } from './flow.jsx';
import { useStored } from './format.jsx';
import { Bell, Check, ChevronRight } from './icons.jsx';
import { card } from './parts.jsx';

// In-app notifications: the bell's dropdown in the top bar and the Notifications page (Figma 383:119656–383:121331).
// There is no notification service yet, so the list is sample data kept in this browser; reading and clearing stick.

// Each kind has its Figma icon disc; `filter` is the page tab it belongs to
const KINDS = {
  price: { title: 'Price Alert', icon: bellRed, tint: 'bg-[#fde6d7]', filter: 'market' },
  portfolio: { title: 'Portfolio Update', icon: coins, tint: 'bg-[#dff9e8]', filter: 'trading' },
  trade: { title: 'Trade Confirmation', icon: bellBlue, tint: 'bg-[#d8f0ff]', filter: 'trading' },
  security: { title: 'Security Alert', icon: bellBlue, tint: 'bg-[#d8f0ff]', filter: 'account' },
  account: { title: 'Account Update', icon: bellBlue, tint: 'bg-[#d8f0ff]', filter: 'account' },
};

const FILTERS = [['all', 'All'], ['market', 'Market news'], ['trading', 'Trading'], ['account', 'Account activity']];

const MIN = 60000;
const DAY = 1440 * MIN;

// `text` alternates plain and highlighted parts: [plain, strong, plain, strong, …]. Times are minutes before
// the first visit, so the list reads naturally the first time and ages from there.
function sampleNotifications(now = Date.now()) {
  return [
    { id: 'n1', kind: 'price', ago: 2, href: '#buy/btc', text: ['', 'BTC', ' has hit your target buying price of ', '$55,000', '. Act now!'] },
    { id: 'n2', kind: 'portfolio', ago: 10, href: '#assets', text: ['', 'Your portfolio', ' value has increased by ', '5%', ' in the past 24 hours. Good job!'] },
    { id: 'n3', kind: 'trade', ago: 42, href: '#assets', text: ['Your order to buy ', '0.5 BTC', ' has been executed at a price of ', '$55,000'] },
    { id: 'n4', kind: 'security', ago: 95, href: '#settings/security', text: ['A new sign-in to your account was made from ', 'Chrome on macOS', '. Not you? Change your password.'] },
    { id: 'n5', kind: 'price', ago: DAY / MIN + 4, href: '#buy/eth', text: ['', 'ETH', ' has hit your target buying price of ', '$15,000', '. Act now!'] },
    { id: 'n6', kind: 'portfolio', ago: DAY / MIN + 10, href: '#assets', text: ['', 'Your portfolio', ' value has increased by ', '3%', ' in the past 24 hours. Good job!'] },
    { id: 'n7', kind: 'trade', ago: DAY / MIN + 42, href: '#assets', text: ['Your order to sell ', '1.2 ETH', ' has been executed at a price of ', '$3,120'] },
    { id: 'n8', kind: 'account', ago: DAY / MIN + 120, href: '#payments', text: ['A new ', 'MTN MoMo', ' payment method was added to your account.'] },
  ].map(({ ago, ...n }, i) => ({ ...n, at: now - ago * MIN, read: i > 2 }));
}

export const useNotifications = () => useStored('wa-notifications', sampleNotifications());

function timeAgo(at, now) {
  const mins = Math.max(0, Math.round((now - at) / MIN));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(at);
}

// "Recently" for today, then "Yesterday", then the date
function dayLabel(at, now) {
  const start = new Date(now).setHours(0, 0, 0, 0);
  if (at >= start) return 'Recently';
  if (at >= start - DAY) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(at);
}

function Message({ text, className }) {
  return (
    <p className={cx('font-semibold text-wa-muted', className)}>
      {text.map((part, i) => (i % 2 ? <span key={i} className="text-wa-text">{part}</span> : part))}
    </p>
  );
}

const UnreadDot = () => <span className="size-2 shrink-0 rounded-full bg-tab-active"><span className="sr-only">Unread</span></span>;

function KindIcon({ kind, className }) {
  const k = KINDS[kind];
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full', k.tint, className)}>
      <img src={k.icon} alt="" width="20" height="20" />
    </span>
  );
}

// Opening a notification marks it read and goes where it points
function useOpen(setItems) {
  return (n) => setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
}

/* ——— Top-bar bell and its dropdown ——— */

export function NotificationsBell({ className }) {
  const [items, setItems] = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const markRead = useOpen(setItems);
  const unread = items.filter((n) => !n.read).length;
  const latest = items.slice(0, 4);
  const now = Date.now();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      ref.current.querySelector('button').focus();
    };
    // Following a link inside closes it too
    const onHash = () => setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cx(className, 'relative')}
      >
        <Bell size={22} />
        {unread > 0 && <span className="absolute right-[11px] top-[11px] size-3 rounded-full border-2 border-wa-bg bg-tab-active max-sm:right-2 max-sm:top-2" />}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Latest notifications"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-[380px] animate-[pop-in_0.15s_ease-out] overflow-hidden rounded-2xl border border-wa-line bg-wa-card shadow-(--wa-shadow) max-sm:fixed max-sm:inset-x-4 max-sm:top-[72px] max-sm:w-auto"
        >
          {latest.length ? (
            <ul>
              {latest.map((n) => (
                <li key={n.id} className="border-b border-wa-line last:border-b-0">
                  <a href={n.href} onClick={() => markRead(n)} className="flex items-center gap-4 px-4 py-4 transition-colors duration-150 hover:bg-wa-pill/60">
                    <KindIcon kind={n.kind} className="size-11" />
                    <span className="min-w-0 flex-1">
                      <span className="sr-only">{KINDS[n.kind].title}: </span>
                      <Message text={n.text} className="text-[13px] leading-[18px]" />
                      <span className="mt-1 flex items-center gap-2 text-xs leading-4 text-wa-muted">{timeAgo(n.at, now)}{!n.read && <UnreadDot />}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm leading-5 text-wa-muted">You’re all caught up. New notifications will show here.</p>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-wa-line bg-wa-pill/40 px-4 py-2.5">
            <button type="button" disabled={!unread} onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))} className="text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text disabled:opacity-40">
              Mark all as read
            </button>
            <a href="#notifications" className="inline-flex items-center gap-1 text-sm font-bold leading-5 text-wa-accent hover:underline">
              See all
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export const useUnreadCount = () => useNotifications()[0].filter((n) => !n.read).length;

/* ——— Notifications page ——— */

export default function Notifications() {
  const [items, setItems] = useNotifications();
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const markRead = useOpen(setItems);
  const now = Date.now();

  const shown = filter === 'all' ? items : items.filter((n) => KINDS[n.kind].filter === filter);
  const unreadShown = shown.filter((n) => !n.read).length;
  const groups = [];
  for (const n of shown) {
    const label = dayLabel(n.at, now);
    if (groups.at(-1)?.label !== label) groups.push({ label, items: [] });
    groups.at(-1).items.push(n);
  }

  const clear = () => {
    const ids = new Set(shown.map((n) => n.id));
    setItems((list) => list.filter((n) => !ids.has(n.id)));
    setNotice(`${ids.size} notification${ids.size === 1 ? '' : 's'} cleared.`);
  };

  return (
    <section className={cx(card, 'rounded-[20px]')} aria-label="Notifications">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Show notifications" className="flex flex-wrap">
          {FILTERS.map(([id, name]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)} className={pillTab}>{name}</button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {unreadShown > 0 && (
            <button type="button" onClick={() => setItems((list) => list.map((n) => (shown.includes(n) ? { ...n, read: true } : n)))} className="inline-flex items-center gap-1.5 text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text">
              <Check size={16} />
              Mark all as read
            </button>
          )}
          <button type="button" disabled={!shown.length} onClick={clear} className="inline-flex h-10 items-center rounded-full bg-wa-text px-10 text-[15px] font-bold leading-6 text-wa-bg transition-opacity duration-150 hover:opacity-85 disabled:opacity-40 max-sm:px-6">
            Clear all
          </button>
        </div>
      </div>

      {groups.length ? (
        groups.map((g, gi) => (
          <div key={g.label} className={cx('mt-5', gi > 0 && 'border-t border-wa-line pt-5')}>
            <h2 className="text-xs font-bold leading-4 tracking-[-0.12px] text-wa-muted">{g.label}</h2>
            <ul className="mt-2">
              {g.items.map((n) => (
                <li key={n.id} className="relative">
                  <a href={n.href} onClick={() => markRead(n)} className="flex items-center gap-4 rounded-2xl py-3.5 pr-6 transition-colors duration-150 hover:bg-wa-pill/50 max-sm:gap-3 max-sm:pr-2">
                    <KindIcon kind={n.kind} className="size-[60px] max-sm:size-11" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className={cx('text-[15px] leading-6 tracking-[-0.075px] text-wa-text', n.read ? 'font-semibold' : 'font-bold')}>{KINDS[n.kind].title}</span>
                        <span className="flex shrink-0 items-center gap-2 text-xs font-medium leading-4 text-wa-muted">{!n.read && <UnreadDot />}{timeAgo(n.at, now)}</span>
                      </span>
                      <Message text={n.text} className="mt-1 text-sm leading-5" />
                    </span>
                  </a>
                  {/* Rules start after the icon, as in the Figma */}
                  {n !== g.items.at(-1) && <span className="absolute bottom-0 left-[78px] right-0 h-px bg-wa-line max-sm:left-[56px]" />}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="grid place-items-center px-4 py-20 text-center">
          <span className="grid size-[60px] place-items-center rounded-full bg-[#d8f0ff]"><img src={bellBlue} alt="" width="20" height="20" /></span>
          <h2 className="mt-4 text-lg font-semibold leading-7 text-wa-text">You’re all caught up</h2>
          <p className="mt-1 max-w-[340px] text-sm leading-5 text-wa-muted">
            {filter === 'all' ? 'New price alerts, trade updates and account activity will show here.' : `No ${FILTERS.find(([id]) => id === filter)[1].toLowerCase()} notifications right now.`}
          </p>
        </div>
      )}
      <p className="sr-only" role="status">{notice}</p>
    </section>
  );
}
