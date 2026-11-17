import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { useTheme } from '../theme.js';
import logo from '../assets/logo.svg';
import { menus as shared } from '../components/Header.jsx';
import { cx } from '../ui.js';
import { stopScroll } from '../v3/motion.js';
import { ArrowUpRight, Chevron } from './ui.jsx';

// One plain line under each menu item, so people know where a link goes before they click
const NOTES = {
  'Buy & Sell Crypto': 'Bitcoin, Ethereum and stablecoins at live prices',
  'Gift Cards': 'Buy gift cards, or sell yours for cash',
  'Credit Score': 'Better rates and rewards as you trade',
  'Refer & Earn': 'Earn 10% commission when friends trade',
  'Learn & Earn': 'Short lessons that pay you in Bitcoin',
  'Merchant Business Suite': 'Accept crypto, receive local currency',
  'OTC & Bulk Trade Desk': 'Large-volume trades, handled for you',
  'Compliance & Tax': 'Tax reports that meet the rules',
  'Token Launch': 'Create and manage your own token',
  Lens: 'Spot, investigate and report risky transactions',
  About: 'Who we are and what we build',
  'Customer Reviews': 'What our customers say',
  'Press Kit': 'Logos and brand assets',
  'Contact Us': 'Get help from our team',
  'Open roles': 'Join the team building Mybitstore',
};

// Line icons, one per item, drawn on a 20px grid
const ICONS = {
  'Buy & Sell Crypto': <path d="M4 7h11l-3-3M16 13H5l3 3" />,
  'Gift Cards': <><rect x="3" y="7" width="14" height="10" rx="2" /><path d="M3 10.5h14M10 7v10M10 7c-1-2.6-4.6-2.6-4.2-.4C6 8 10 7 10 7Zm0 0c1-2.6 4.6-2.6 4.2-.4C14 8 10 7 10 7Z" /></>,
  'Credit Score': <><path d="M3.5 14a6.5 6.5 0 1 1 13 0" /><path d="m10 14 3-4" /></>,
  'Refer & Earn': <><circle cx="7.5" cy="7" r="2.75" /><path d="M2.5 16c.6-2.6 2.6-4 5-4s4.4 1.4 5 4M14 6.5v5M11.5 9h5" /></>,
  'Learn & Earn': <><path d="M10 4 2.5 7.5 10 11l7.5-3.5L10 4Z" /><path d="M5.5 9.2V13c1.2 1.3 2.7 2 4.5 2s3.3-.7 4.5-2V9.2" /></>,
  'Merchant Business Suite': <><path d="M3.5 8h13l-1-4h-11l-1 4Z" /><path d="M4.5 8v8h11V8M8.5 16v-4h3v4" /></>,
  'OTC & Bulk Trade Desk': <><rect x="3" y="11" width="3" height="5" rx="0.8" /><rect x="8.5" y="7" width="3" height="9" rx="0.8" /><rect x="14" y="4" width="3" height="12" rx="0.8" /></>,
  'Compliance & Tax': <><path d="M6 3.5h6l3 3v10H6v-13Z" /><path d="M12 3.5v3h3M8.5 11l1.5 1.5 3-3" /></>,
  'Token Launch': <><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5v7M7.5 9 10 6.5 12.5 9" /></>,
  Lens: <><circle cx="9" cy="9" r="5" /><path d="m13 13 3.5 3.5M7 9l1.5 1.5L11 8" /></>,
  About: <><circle cx="10" cy="10" r="6.5" /><path d="M10 9v4.5M10 6.6v.1" /></>,
  'Customer Reviews': <path d="m10 3.5 1.9 4 4.3.5-3.2 3 .9 4.3L10 13.1l-3.9 2.2.9-4.3-3.2-3 4.3-.5 1.9-4Z" />,
  'Press Kit': <><rect x="3.5" y="4.5" width="13" height="11" rx="2" /><path d="m3.5 13 4-3.5 3 2.5 2-1.5 4 3" /><circle cx="13" cy="8" r="1.2" /></>,
  'Contact Us': <path d="M4 5.5h12v8H8l-4 3v-11Z" />,
  'Open roles': <><rect x="3" y="6.5" width="14" height="9.5" rx="2" /><path d="M7.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 12.5 5v1.5M3 10.5h14" /></>,
};

// V4 menus: Lens sign-in and Token Launch left out, and the compliance suite is simply "Lens"
const HIDDEN = ['Sign in to LENS', 'Token Launch'];
const RENAME = { 'LENS Compliance Suite': 'Lens' };
const MENUS = shared.map((m) => ({
  ...m,
  items: m.items.filter(([label]) => !HIDDEN.includes(label)).map(([label, ...rest]) => [RENAME[label] ?? label, ...rest]),
}));

function ThemeSwitch() {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="relative grid size-9 place-items-center rounded-full text-v4-muted transition-colors duration-300 hover:bg-v4-raise hover:text-v4-ink"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className={cx('absolute transition-[rotate,opacity,scale] duration-700 ease-v4', dark ? 'rotate-0 opacity-100' : 'rotate-90 scale-50 opacity-0')}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className={cx('absolute transition-[rotate,opacity,scale] duration-700 ease-v4', dark ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 opacity-100')}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}

function Item({ label, href, external, badge, onClick, tabbable }) {
  return (
    <a
      href={href}
      onClick={onClick}
      tabIndex={tabbable ? 0 : -1}
      className="group/i flex items-start gap-3.5 rounded-xl p-3 transition-colors duration-300 hover:bg-v4-raise"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] text-v4-soft shadow-[inset_0_0_0_1px_var(--v4-line-2)] transition-colors duration-300 group-hover/i:text-v4-accent-ink">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[label]}</svg>
      </span>
      <span className="min-w-0 pt-px">
        <span className="flex items-center gap-2 text-[14px] font-medium leading-5 text-v4-ink">
          {label}
          {badge && <span className="rounded-full bg-v4-accent/12 px-1.5 py-px text-[10.5px] font-semibold uppercase tracking-[0.04em] text-v4-accent-ink">{badge}</span>}
          {external && <ArrowUpRight size={12} className="text-v4-faint" />}
        </span>
        <span className="mt-0.5 block text-[13px] leading-[1.45] text-v4-muted">{NOTES[label]}</span>
      </span>
    </a>
  );
}

// One panel serves every menu: it glides under the hovered trigger and resizes to fit,
// while the old content slides out one way and the new one slides in from the other.
function Dropdown({ active, prev, anchor, onEnter, onLeave, onPick }) {
  const panes = useRef([]);
  const [sizes, setSizes] = useState([]);
  const [vw, setVw] = useState(() => window.innerWidth);

  useLayoutEffect(() => {
    const measure = () => {
      setSizes(panes.current.map((el) => (el ? { w: el.offsetWidth, h: el.offsetHeight } : { w: 0, h: 0 })));
      setVw(window.innerWidth);
    };
    measure();
    // Web fonts can land after the first measure and change the heights
    const ro = new ResizeObserver(measure);
    panes.current.forEach((el) => el && ro.observe(el));
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const open = active != null;
  const index = open ? active : prev;
  const size = sizes[index] ?? { w: 0, h: 0 };
  // Centre under the trigger, but keep 16px clear of the window edges
  const center = anchor ?? vw / 2;
  const left = Math.min(Math.max(16, center - size.w / 2), vw - size.w - 16);
  const caret = Math.min(Math.max(24, center - left), size.w - 24);
  const first = open && prev == null;

  return (
    <div
      className={cx(
        'absolute left-0 top-full pt-2',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      style={{ transform: `translate3d(${left}px, 0, 0)`, transition: first || !open ? 'none' : 'transform 520ms var(--ease-v4)' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className={cx('origin-top transition-[opacity,scale,translate] duration-300 ease-v4', open ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-[0.98] opacity-0')}
        style={{ transformOrigin: `${caret}px 0` }}
      >
        {/* Caret pointing at the open trigger */}
        <span
          aria-hidden="true"
          className="absolute top-[3px] z-1 size-3 rotate-45 rounded-tl-[3px] bg-v4-card shadow-[inset_1px_1px_0_var(--v4-line-2)]"
          style={{ left: caret - 6, transition: first ? 'none' : 'left 520ms var(--ease-v4)' }}
        />
        <div
          className="relative overflow-hidden rounded-2xl bg-v4-card shadow-[inset_0_0_0_1px_var(--v4-line-2),var(--v4-shadow)]"
          style={{ width: size.w, height: size.h, transition: first ? 'none' : 'width 520ms var(--ease-v4), height 520ms var(--ease-v4)' }}
        >
          {MENUS.map((m, i) => {
            const shown = i === index;
            return (
              <div
                key={m.label}
                ref={(el) => { panes.current[i] = el; }}
                aria-hidden={!(open && shown)}
                className={cx(
                  'absolute left-0 top-0 grid gap-1 p-2.5',
                  m.items.length > 3 ? 'w-[580px] grid-cols-2' : 'w-[320px] grid-cols-1',
                  shown ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                style={{
                  transition: 'opacity 300ms var(--ease-v4), transform 520ms var(--ease-v4)',
                  transform: shown ? 'translate3d(0,0,0)' : `translate3d(${i < (index ?? 0) ? -40 : 40}px,0,0)`,
                }}
              >
                {m.items.map(([label, href, external, badge]) => (
                  <Item key={label} label={label} href={href} external={external} badge={badge} onClick={onPick} tabbable={open && shown} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  const [section, setSection] = useState(0);
  return (
    <div className={cx('fixed inset-x-0 bottom-0 top-16 z-40 lg:hidden', open ? 'visible' : 'invisible')} aria-hidden={!open}>
      <div className={cx('absolute inset-0 bg-v4-bg transition-opacity duration-500 ease-v4', open ? 'opacity-100' : 'opacity-0')} />
      <nav aria-label="Menu" data-lenis-prevent className="relative flex h-full flex-col overflow-y-auto px-5 pb-8 pt-2">
        {MENUS.map((m, i) => {
          const on = section === i;
          return (
            <div
              key={m.label}
              className={cx('border-b border-v4-line transition-[opacity,translate] duration-700 ease-v4', open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0')}
              style={{ transitionDelay: open ? `${60 + i * 50}ms` : '0ms' }}
            >
              <button type="button" aria-expanded={on} onClick={() => setSection(on ? -1 : i)} className="flex w-full items-center justify-between py-5 text-[20px] font-medium tracking-[-0.01em] text-v4-ink">
                {m.label}
                <Chevron open={on} size={14} className="text-v4-muted" />
              </button>
              <div className={cx('grid transition-[grid-template-rows] duration-500 ease-v4', on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <ul className="overflow-hidden">
                  {m.items.map(([label, href, external, badge]) => (
                    <li key={label}>
                      <Item label={label} href={href} external={external} badge={badge} onClick={onClose} tabbable={open && on} />
                    </li>
                  ))}
                  <li className="h-3" />
                </ul>
              </div>
            </div>
          );
        })}
        <a
          href="#markets"
          onClick={onClose}
          className={cx('border-b border-v4-line py-5 text-[20px] font-medium tracking-[-0.01em] text-v4-ink transition-[opacity,translate] duration-700 ease-v4', open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0')}
          style={{ transitionDelay: open ? `${60 + MENUS.length * 50}ms` : '0ms' }}
        >
          Markets
        </a>
        <div className={cx('mt-auto grid grid-cols-2 gap-3 pt-8 transition-opacity duration-700 ease-v4', open ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: open ? '300ms' : '0ms' }}>
          <a href={links.login} className="grid h-12 place-items-center rounded-full text-[15px] font-medium text-v4-ink shadow-[inset_0_0_0_1px_var(--v4-line-2)]">Log in</a>
          <a href={links.signup} className="grid h-12 place-items-center rounded-full bg-v4-accent text-[15px] font-medium text-white">Sign up</a>
        </div>
      </nav>
    </div>
  );
}

// A full-width bar: clear over the hero, frosted with a hairline once the page moves
export default function NavV4() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const [prev, setPrev] = useState(null);
  const [anchor, setAnchor] = useState(null);
  const [mobile, setMobile] = useState(false);
  const timer = useRef(0);
  const triggers = useRef([]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    stopScroll(mobile);
    const key = (e) => {
      if (e.key !== 'Escape') return;
      setMobile(false);
      setActive(null);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [mobile]);

  const openMenu = (i) => {
    clearTimeout(timer.current);
    const r = triggers.current[i]?.getBoundingClientRect();
    if (r) setAnchor(r.left + r.width / 2);
    setActive((cur) => {
      setPrev(cur);
      return i;
    });
  };
  const keep = () => clearTimeout(timer.current);
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setActive((cur) => {
        setPrev(cur);
        return null;
      });
    }, 160);
  };
  // After it closes, the next open should appear in place rather than glide from the last spot
  useEffect(() => {
    if (active != null) return undefined;
    const t = setTimeout(() => setPrev(null), 320);
    return () => clearTimeout(t);
  }, [active]);

  const solid = scrolled || mobile || active != null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          aria-hidden="true"
          className={cx(
            'absolute inset-0 bg-v4-bg/80 shadow-[inset_0_-1px_0_var(--v4-line)] backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-500 ease-v4',
            solid ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div className="relative mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-8 max-lg:px-6 max-sm:px-5">
          <a href="#top" aria-label="Mybitstore home" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="" width="28" height="28" />
            <span className="font-v4 text-[18px] font-semibold tracking-[-0.02em] text-v4-ink">Mybitstore</span>
          </a>

          <nav aria-label="Main" className="absolute left-1/2 flex -translate-x-1/2 items-center max-lg:hidden" onMouseLeave={closeSoon}>
            {MENUS.map((m, i) => (
              <button
                key={m.label}
                ref={(el) => { triggers.current[i] = el; }}
                type="button"
                aria-expanded={active === i}
                onMouseEnter={() => openMenu(i)}
                onFocus={() => openMenu(i)}
                onClick={() => (active === i ? closeSoon() : openMenu(i))}
                className={cx('inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-medium transition-colors duration-300', active === i ? 'text-v4-ink' : 'text-v4-muted hover:text-v4-ink')}
              >
                {m.label}
                <Chevron open={active === i} className="opacity-70" />
              </button>
            ))}
            <a href="#markets" onMouseEnter={closeSoon} className="inline-flex h-9 items-center rounded-full px-3.5 text-[14px] font-medium text-v4-muted transition-colors duration-300 hover:text-v4-ink">Markets</a>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeSwitch />
            <a href={links.login} className="inline-flex h-9 items-center rounded-full px-3.5 text-[14px] font-medium text-v4-muted transition-colors duration-300 hover:text-v4-ink max-sm:hidden">Log in</a>
            <a href={links.signup} className="ml-1 inline-flex h-9 items-center rounded-full bg-v4-accent px-4 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-brand-strong max-sm:hidden">Sign up</a>
            <button
              type="button"
              aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile}
              onClick={() => setMobile((m) => !m)}
              className="relative grid size-9 place-items-center rounded-full lg:hidden"
            >
              <span className={cx('absolute h-[1.5px] w-[18px] rounded bg-v4-ink transition-transform duration-500 ease-v4', mobile ? 'rotate-45' : '-translate-y-[3.5px]')} />
              <span className={cx('absolute h-[1.5px] w-[18px] rounded bg-v4-ink transition-transform duration-500 ease-v4', mobile ? '-rotate-45' : 'translate-y-[3.5px]')} />
            </button>
          </div>
        </div>
        <div className="max-lg:hidden">
          <Dropdown active={active} prev={prev} anchor={anchor} onEnter={keep} onLeave={closeSoon} onPick={() => setActive(null)} />
        </div>
      </header>
      <MobileMenu open={mobile} onClose={() => setMobile(false)} />
    </>
  );
}
