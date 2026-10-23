import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { links } from '../links.js';
import { COINS } from '../marketData.js';
import { useTheme } from '../theme.js';
import logo from '../assets/logo.svg';
import avatar from '../assets/wa-avatar.jpg';
import { Close, Menu, Moon, Sun } from '../components/icons.jsx';
import { cx } from '../ui.js';
import AppsMenu, { menuPosition } from './AppsMenu.jsx';
import Assets from './Assets.jsx';
import Home from './Home.jsx';
import Deposit from './Deposit.jsx';
import Order from './Order.jsx';
import Payments from './Payments.jsx';
import Referral from './Referral.jsx';
import NotificationsView, { NotificationsBell, useUnreadCount } from './Notifications.jsx';
import SettingsView, { SETTINGS_TABS } from './Settings.jsx';
import { fullName, useProfile } from './account.js';
import Withdraw from './Withdraw.jsx';
import GiftCards, { gcNested, gcParent, gcTitle } from './gift-cards/GiftCards.jsx';
import { useGiftCardTicker } from './gift-cards/store.js';
import Token from './Token.jsx';
import TradeView from './Trade.jsx';
import { FigmaCopyButton, useFigmaShortcut } from './figmaCopy.jsx';
import { useStored } from './format.jsx';
import { ArrowLeft, Bell, Card, Gift, Grid, Home as HomeIcon, Search, Settings, Sidebar, Trade, Users, Wallet } from './icons.jsx';
import { coinBySymbol, tokenHref } from './parts.jsx';

const NAV = [
  ['home', 'Home', HomeIcon],
  ['assets', 'My assets', Wallet],
  ['trade', 'Buy & sell', Trade],
  ['payments', 'Payment methods', Card],
  ['gift-cards', 'Gift cards', Gift],
  ['referral', 'Referral', Users],
  ['notifications', 'Notifications', Bell],
  ['settings', 'Settings', Settings],
];
const TITLES = { ...Object.fromEntries(NAV.map(([id, label]) => [id, label])), trade: 'Buy & sell', activity: 'Activity', referral: 'Referrals', deposit: 'Deposit', withdraw: 'Withdraw' };

// Routes live in the URL hash: #home, #assets, … #token/eth for a coin's details, and #buy/eth or #sell/eth for
// the order page, which takes a step (#buy/eth/review, #buy/eth/done) or, when buying, a wallet (#buy/eth/external).
// Deposits are #deposit (with crypto) or #deposit/fiat, and withdrawals #withdraw (to a wallet), #withdraw/user
// or #withdraw/fiat, each followed by a step in the same way. #payments/add opens the add-account form, and #settings/<section> picks a Settings tab.
// Gift cards live under #gift-cards (see gift-cards/GiftCards.jsx for its own routes)
function readRoute() {
  const [id, symbol, side] = window.location.hash.slice(1).split('/');
  if (id === 'gift-cards') return { id, gc: window.location.hash.slice(1).split('/').slice(1).filter(Boolean) };
  if (id === 'token' && coinBySymbol[symbol]) return { id, coin: coinBySymbol[symbol], side: side === 'sell' ? 'sell' : 'buy' };
  if ((id === 'buy' || id === 'sell') && coinBySymbol[symbol]) {
    return { id: 'order', side: id, coin: coinBySymbol[symbol], step: ['review', 'done'].includes(side) ? side : 'details', wallet: ['external', 'mybitstore'].includes(side) ? side : undefined };
  }
  if (id === 'deposit') return { id, way: symbol === 'fiat' ? 'fiat' : 'crypto', step: side || 'details' };
  if (id === 'payments') return { id, adding: symbol === 'add' };
  if (id === 'settings') return { id, tab: [...SETTINGS_TABS.map(([key]) => key), 'delete-account'].includes(symbol) ? symbol : 'profile' };
  if (id === 'withdraw') return { id, way: ['user', 'fiat'].includes(symbol) ? symbol : 'wallet', step: side || 'details' };
  return { id: TITLES[id] ? id : 'home' };
}

// True once the visitor has moved between views, so Back can return to where they were
let hasHistory = false;

function useRoute() {
  const [route, setRoute] = useState(readRoute);
  const current = useRef(route);
  useEffect(() => {
    const onHash = () => {
      hasHistory = true;
      const prev = current.current;
      const next = readRoute();
      current.current = next;
      setRoute(next);
      // Review and Done open as dialogs over the form, so the page behind keeps its place
      const sameForm = prev.id === next.id && ((next.id === 'order' && prev.side === next.side && prev.coin === next.coin) || (['deposit', 'withdraw'].includes(next.id) && prev.way === next.way));
      if (!sameForm || (prev.step === 'done' && next.step === 'details')) window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

const roundBtn =
  'grid size-12 shrink-0 place-items-center rounded-full border border-wa-line text-wa-muted transition-colors duration-150 hover:bg-wa-pill hover:text-wa-text aria-expanded:bg-wa-pill aria-expanded:text-wa-text max-sm:size-10';

function ThemeSwitch({ compact }) {
  const [theme, toggle] = useTheme();
  const option = (name, Icon) => (
    <button
      type="button"
      role="radio"
      aria-checked={theme === name}
      aria-label={`${name === 'light' ? 'Light' : 'Dark'} theme`}
      onClick={() => theme !== name && toggle()}
      className={cx(
        'grid h-8 flex-1 place-items-center rounded-lg text-wa-muted transition-colors duration-150 hover:text-wa-text aria-checked:bg-wa-inset aria-checked:text-wa-text aria-checked:shadow-[0_1px_2px_rgba(10,16,36,0.16)]',
        compact && 'lg:aria-checked:hidden',
      )}
    >
      <Icon size={20} />
    </button>
  );
  return (
    <div role="radiogroup" aria-label="Theme" className="flex gap-1 rounded-xl bg-wa-pill p-1">
      {option('light', Sun)}
      {option('dark', Moon)}
    </div>
  );
}

function SideMenu({ view, collapsed, onCollapse, open, onClose }) {
  const unread = useUnreadCount();
  return (
    <aside
      className={cx(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-wa-line bg-wa-side px-6 pb-6 pt-6 transition-[width,translate,visibility] duration-200',
        collapsed ? 'lg:w-[88px] lg:px-4' : 'lg:w-[280px]',
        'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-[280px]',
        open ? 'max-lg:translate-x-0' : 'max-lg:invisible max-lg:-translate-x-full',
      )}
    >
      <div className={cx('flex h-12 items-center justify-between', collapsed && 'lg:flex-col lg:h-auto lg:gap-4')}>
        <a href="/" aria-label="Mybitstore website" className="rounded-full">
          <img src={logo} alt="" width="40" height="40" className="size-10" />
        </a>
        <button
          type="button"
          onClick={onCollapse}
          aria-pressed={collapsed}
          aria-label="Collapse sidebar"
          className="grid size-9 place-items-center rounded-lg text-wa-muted hover:bg-wa-pill hover:text-wa-text max-lg:hidden"
        >
          <Sidebar size={20} />
        </button>
        <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-9 place-items-center rounded-lg text-wa-muted hover:bg-wa-pill hover:text-wa-text lg:hidden">
          <Close size={20} />
        </button>
      </div>

      <nav aria-label="Web app" className="mt-6 grid gap-2 overflow-y-auto">
        {NAV.map(([id, label, Icon]) => {
          const active = view === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? label : undefined}
              className={cx(
                'flex h-12 items-center gap-4 rounded-full px-4 text-base font-semibold leading-6 tracking-[-0.075px] transition-colors duration-150',
                active ? 'bg-wa-pill text-wa-text' : 'text-wa-muted hover:bg-wa-pill/60 hover:text-wa-text',
                collapsed && 'lg:justify-center lg:px-0',
              )}
            >
              <span className="relative shrink-0">
                <Icon />
                {id === 'notifications' && unread > 0 && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-wa-side bg-tab-active" />}
              </span>
              <span className={cx('truncate', collapsed && 'lg:sr-only')}>{label}{id === 'notifications' && unread > 0 && <span className="sr-only"> ({unread} unread)</span>}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <ThemeSwitch compact={collapsed} />
      </div>
    </aside>
  );
}

// Type a name or symbol to jump to that token's page
function TokenSearch({ inputRef }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const term = query.trim().toLowerCase();
  // Names or symbols that start with the term come first, then anything that contains it
  const rank = (c) => (c.symbol.toLowerCase().startsWith(term) || c.name.toLowerCase().startsWith(term) ? 0 : 1);
  const results = term
    ? COINS.filter((c) => c.name.toLowerCase().includes(term) || c.symbol.toLowerCase().includes(term)).sort((a, b) => rank(a) - rank(b))
    : [];
  const showList = open && Boolean(term);

  const reset = () => {
    setQuery('');
    setOpen(false);
    setActive(0);
  };
  const go = (coin) => {
    window.location.hash = tokenHref(coin);
    reset();
    inputRef.current?.blur();
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active]);
    } else if (e.key === 'Escape') {
      reset();
    }
  };

  return (
    <div className="relative w-[320px] max-md:w-[220px] max-sm:order-last max-sm:w-full">
      <label className="flex h-12 items-center gap-2.5 rounded-full border border-wa-line px-4 text-wa-muted transition-colors duration-150 focus-within:border-tab-active focus-within:text-wa-text max-sm:h-11">
        <Search size={20} className="shrink-0" />
        <span className="sr-only">Search tokens</span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Search tokens"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-base leading-6 text-wa-text outline-none placeholder:text-wa-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button type="button" aria-label="Clear search" className="grid size-6 place-items-center rounded-full hover:bg-wa-pill" onMouseDown={(e) => e.preventDefault()} onClick={reset}>
            <Close size={14} />
          </button>
        ) : (
          <kbd className="rounded-md border border-wa-line px-1.5 font-inter text-[11px] leading-5 max-sm:hidden">/</kbd>
        )}
      </label>
      {showList && (
        <ul id={listId} role="listbox" aria-label="Tokens" className="absolute inset-x-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-wa-line bg-wa-inset p-1.5 shadow-(--wa-shadow)">
          {results.map((coin, i) => (
            <li
              key={coin.id}
              id={`${listId}-${coin.id}`}
              role="option"
              aria-selected={i === active}
              // Keep focus in the input so the click lands before the list closes
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(coin)}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-semibold leading-5 text-wa-text aria-selected:bg-wa-pill"
            >
              <img src={coin.icon} alt="" width="28" height="28" className="size-7" />
              {coin.name}
              <span className="ml-auto text-sm font-normal text-wa-muted">{coin.symbol}</span>
            </li>
          ))}
          {!results.length && <li className="px-3 py-3 text-sm leading-5 text-wa-muted">No tokens match “{query.trim()}”.</li>}
        </ul>
      )}
    </div>
  );
}

// Sections that have no design yet point people to the live app instead of a dead end
function ComingSoon({ view }) {
  const Icon = NAV.find(([id]) => id === view)?.[2] || Wallet;
  return (
    <section className="grid place-items-center rounded-2xl border border-wa-line bg-wa-card px-6 py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-wa-pill text-wa-accent"><Icon size={28} /></span>
      <h2 className="mt-6 text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">{TITLES[view]} is coming to the web app</h2>
      <p className="mt-2 max-w-[440px] text-base leading-6 text-wa-muted">This section isn’t available here yet. You can use it today in the Mybitstore app.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="#home" className="inline-flex h-11 items-center rounded-full bg-wa-pill px-6 text-[15px] font-bold leading-6 text-wa-text hover:bg-wa-pill-hover">Back to home</a>
        <a href={view === 'gift-cards' ? links.giftCardsPage : links.login} className="inline-flex h-11 items-center rounded-full bg-tab-active px-6 text-[15px] font-bold leading-6 text-white hover:bg-brand-strong">
          {view === 'gift-cards' ? 'Explore gift cards' : 'Open Mybitstore'}
        </a>
      </div>
    </section>
  );
}

// Delivers gift card orders and moves trades along wherever the visitor is in the app
function GiftCardTicker() {
  useGiftCardTicker();
  return null;
}

export default function WebApp() {
  const route = useRoute();
  const view = route.id;
  const [collapsed, setCollapsed] = useStored('wa-sidebar-collapsed', false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // The shortcuts menu opens below the grid icon, or to the left of Quick actions → More
  const [menu, setMenu] = useState(null);
  const searchRef = useRef(null);
  const [profile] = useProfile();
  // Token, buy, deposit and withdraw pages are reached from another view, so they show Back instead of a title
  const nested = ['token', 'order', 'deposit', 'withdraw'].includes(view) || (view === 'gift-cards' && gcNested(route.gc));
  const title = view === 'token' ? route.coin.name : view === 'order' ? `${route.side === 'buy' ? 'Buy' : 'Sell'} ${route.coin.name}` : view === 'gift-cards' ? gcTitle(route.gc) : TITLES[view];

  useFigmaShortcut();

  const closeMenu = useCallback(() => setMenu(null), []);
  const toggleMenu = useCallback((trigger, side) => setMenu((current) => (current?.trigger === trigger ? null : { trigger, position: menuPosition(trigger, side) })), []);

  useEffect(() => {
    document.title = `${title} · Mybitstore web app`;
  }, [title]);

  // "/" jumps to search, as in most dashboards; Escape closes the mobile drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Back returns to wherever the visitor came from; a page opened directly falls back to its parent
  const goBack = () => {
    if (hasHistory) window.history.back();
    else window.location.hash = view === 'order' ? 'trade' : view === 'gift-cards' ? gcParent(route.gc) : 'home';
  };

  return (
    <div className="flex min-h-screen bg-wa-bg font-nunito text-wa-text">
      {/* A token page keeps Home highlighted: it is reached from, and returns to, the dashboard */}
      <SideMenu view={['token', 'deposit', 'withdraw'].includes(view) ? 'home' : view === 'order' ? 'trade' : view} collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {drawerOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 bg-black/55 lg:hidden" onClick={() => setDrawerOpen(false)} />}

      <div className="mx-auto min-w-0 max-w-[1280px] flex-1 px-10 pb-10 max-lg:px-6 max-sm:px-4">
        <header className="flex flex-wrap items-center gap-3 py-6 max-sm:py-4">
          <button type="button" className={cx(roundBtn, 'lg:hidden')} aria-label="Open menu" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="mr-auto flex min-w-0 items-center gap-3">
            {nested ? (
              <>
                <button type="button" onClick={goBack} className="-ml-2 inline-flex h-10 items-center gap-3 rounded-full px-2 pr-4 text-base font-semibold leading-6 text-wa-text hover:bg-wa-pill">
                  <ArrowLeft />
                  Back
                </button>
                <h1 className="sr-only">{title}</h1>
              </>
            ) : (
              <h1 className="truncate text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">{title}</h1>
            )}
            {view !== 'token' && (
              <span className="shrink-0 rounded-full border border-wa-line px-2.5 py-0.5 text-xs font-semibold leading-5 text-wa-muted max-sm:hidden" title="Balances and activity are sample data. Token prices are live.">
                Preview · sample data
              </span>
            )}
            <FigmaCopyButton className="max-sm:hidden" />
          </div>
          <TokenSearch inputRef={searchRef} />
          <NotificationsBell className={roundBtn} />
          <button type="button" className={roundBtn} aria-label="All shortcuts" aria-haspopup="menu" aria-expanded={Boolean(menu)} onClick={(e) => toggleMenu(e.currentTarget)}>
            <Grid size={22} />
          </button>
          <a href="#settings/profile" aria-label={`Account settings for ${fullName(profile)}`} title={fullName(profile)} className="shrink-0 rounded-full">
            <img src={profile.avatar || avatar} alt="" width="48" height="48" className="size-12 rounded-full object-cover max-sm:size-10" />
          </a>
        </header>

        <main>
          {view === 'home' && <Home onOpenMenu={toggleMenu} />}
          {view === 'token' && <Token coin={route.coin} side={route.side} />}
          {view === 'assets' && <Assets />}
          {view === 'trade' && <TradeView />}
          {view === 'deposit' && <Deposit way={route.way} step={route.step} />}
          {view === 'withdraw' && <Withdraw way={route.way} step={route.step} />}
          {view === 'payments' && <Payments adding={route.adding} />}
          {view === 'notifications' && <NotificationsView />}
          {view === 'referral' && <Referral />}
          {view === 'gift-cards' && <GiftCards parts={route.gc} />}
          {view === 'settings' && <SettingsView tab={route.tab} />}
          {view === 'order' && <Order key={`${route.side}-${route.coin.id}`} coin={route.coin} side={route.side} step={route.step} initialWallet={route.wallet} />}
          {!['home', 'token', 'assets', 'trade', 'order', 'deposit', 'withdraw', 'payments', 'settings', 'notifications', 'referral', 'gift-cards'].includes(view) && <ComingSoon view={view} />}
        </main>
      </div>

      {menu && <AppsMenu position={menu.position} trigger={menu.trigger} onClose={closeMenu} />}
      <GiftCardTicker />
    </div>
  );
}
