import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { useTheme } from '../theme.js';
import logo from '../assets/logo.svg';
import { menus as shared } from '../components/Header.jsx';

// V3 leaves LENS sign-in out of the menus
const menus = shared.map((m) => ({ ...m, items: m.items.filter(([label]) => label !== 'Sign in to LENS') }));
import { cx } from '../ui.js';
import { stopScroll } from './motion.js';
import { ArrowUpRight } from './ui.jsx';

const Chevron = ({ open }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className={cx('transition-transform duration-300', open && 'rotate-180')}>
    <path d="m3 4.5 3 3 3-3" />
  </svg>
);

function ThemeSwitch() {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full text-v3-soft transition-colors duration-200 hover:bg-v3-glass-2 hover:text-v3-ink"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className={cx('absolute transition-[rotate,opacity,scale] duration-500 ease-(--ease-soft)', dark ? 'rotate-0 opacity-100' : 'rotate-90 scale-50 opacity-0')}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className={cx('absolute transition-[rotate,opacity,scale] duration-500 ease-(--ease-soft)', dark ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 opacity-100')}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}

function Menu({ menu, open, onOpen, onClose }) {
  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => (open ? onClose() : onOpen())}
        className={cx('inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-colors duration-200', open ? 'bg-v3-glass-2 text-v3-ink' : 'text-v3-soft hover:text-v3-ink')}
      >
        {menu.label}
        <Chevron open={open} />
      </button>
      <div
        className={cx(
          'absolute left-1/2 top-full w-[300px] -translate-x-1/2 pt-3 transition-[opacity,translate,scale] duration-300 ease-(--ease-soft)',
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.97] opacity-0',
        )}
      >
        <ul className="rounded-[22px] border border-v3-line bg-v3-bg/95 p-2 shadow-[var(--v3-glass-edge),var(--v3-glass-shadow)] backdrop-blur-[40px] backdrop-saturate-[180%]">
          {menu.items.map(([label, href, external, badge], i) => (
            <li key={label} style={{ transitionDelay: open ? `${40 + i * 30}ms` : '0ms' }} className={cx('transition-[opacity,translate] duration-300 ease-(--ease-soft)', open ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0')}>
              <a
                href={href}
                onClick={onClose}
                className="group/i flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[14px] text-v3-soft transition-colors duration-200 hover:bg-v3-glass-2 hover:text-v3-ink"
              >
                <span className="flex items-center gap-2">
                  {label}
                  {badge && <span className="rounded-full bg-v3-mint/15 px-2 py-0.5 text-[11px] font-semibold text-v3-mint">{badge}</span>}
                </span>
                <ArrowUpRight size={14} className={cx('transition-[opacity,translate] duration-200', external ? 'opacity-70' : 'opacity-0 group-hover/i:translate-x-0.5 group-hover/i:-translate-y-0.5 group-hover/i:opacity-70')} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose }) {
  const [section, setSection] = useState(null);
  return (
    <div
      className={cx('fixed inset-0 z-40 lg:hidden', open ? 'visible' : 'invisible')}
      aria-hidden={!open}
    >
      <div
        className={cx('absolute inset-0 bg-v3-bg/70 backdrop-blur-2xl transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <nav
        aria-label="Menu"
        data-lenis-prevent
        className={cx('absolute inset-x-3 top-[84px] max-h-[calc(100svh-100px)] overflow-y-auto rounded-[28px] glass-strong p-3 transition-[opacity,translate,scale] duration-500 ease-(--ease-soft)', open ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 scale-[0.98] opacity-0')}
      >
        {menus.map((m, i) => (
          <div key={m.label} className={cx('border-b border-v3-line last:border-0 transition-[opacity,translate] duration-500 ease-(--ease-soft)', open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0')} style={{ transitionDelay: open ? `${80 + i * 60}ms` : '0ms' }}>
            <button type="button" aria-expanded={section === m.label} onClick={() => setSection(section === m.label ? null : m.label)} className="flex w-full items-center justify-between px-4 py-4 text-[18px] font-medium text-v3-ink">
              {m.label}
              <Chevron open={section === m.label} />
            </button>
            <div className={cx('grid transition-[grid-template-rows] duration-400 ease-(--ease-soft)', section === m.label ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <ul className="overflow-hidden">
                {m.items.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} onClick={onClose} className="block rounded-2xl px-4 py-2.5 text-[15px] text-v3-muted hover:bg-v3-glass-2 hover:text-v3-ink">{label}</a>
                  </li>
                ))}
                <li className="h-3" />
              </ul>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2 p-2 pt-4">
          <a href={links.login} className="grid h-12 place-items-center rounded-full border border-v3-line text-[15px] font-semibold text-v3-ink">Log in</a>
          <a href={links.signup} className="grid h-12 place-items-center rounded-full bg-brand text-[15px] font-semibold text-white">Sign up</a>
        </div>
      </nav>
    </div>
  );
}

// Transparent and full width over the hero; once the page moves it docks into a floating glass pill
export default function NavV3() {
  const [docked, setDocked] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef(0);

  useEffect(() => {
    const on = () => setDocked(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    stopScroll(mobile);
    const key = (e) => e.key === 'Escape' && (setMobile(false), setOpenMenu(null));
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [mobile]);

  const open = (label) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const close = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
        <div
          className={cx(
            'pointer-events-auto relative isolate flex w-full items-center justify-between gap-6 rounded-full border transition-[max-width,padding,border-color,box-shadow,translate] duration-700 ease-(--ease-soft)',
            docked
              ? 'max-w-[1120px] translate-y-1 border-v3-line py-2 pl-5 pr-2 shadow-[var(--v3-glass-edge),0_20px_60px_-20px_rgba(0,0,0,0.6)]'
              : 'max-w-[1340px] border-transparent py-4 pl-6 pr-4',
          )}
        >
          {/* The pill's frosted glass lives on its own layer: a blur on the pill itself would stop the dropdowns inside it from blurring the page */}
          <span
            aria-hidden="true"
            className={cx(
              'absolute inset-0 -z-1 rounded-full bg-v3-glass-2 backdrop-blur-[24px] backdrop-saturate-[180%] transition-opacity duration-700 ease-(--ease-soft)',
              docked ? 'opacity-100' : 'opacity-0',
            )}
          />
          <a href="#top" aria-label="Mybitstore home" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="" width="32" height="32" className="transition-transform duration-700 ease-(--ease-soft) hover:rotate-[-12deg]" />
            <span className="font-inter-tight text-[19px] font-semibold tracking-[-0.02em] text-v3-ink">Mybitstore</span>
          </a>
          <nav aria-label="Main" className="flex items-center gap-0.5 max-lg:hidden">
            {menus.map((m) => (
              <Menu key={m.label} menu={m} open={openMenu === m.label} onOpen={() => open(m.label)} onClose={close} />
            ))}
            <a href="#markets" className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium text-v3-soft transition-colors hover:text-v3-ink">Markets</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeSwitch />
            <a href={links.login} className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium text-v3-soft transition-colors hover:text-v3-ink max-sm:hidden">Log in</a>
            <a
              href={links.signup}
              className="group/s inline-flex h-10 items-center gap-2 rounded-full bg-v3-ink pl-4 pr-1 text-[14px] font-semibold text-v3-bg transition-transform duration-300 hover:scale-[1.03] max-sm:hidden"
            >
              Sign up
              <span className="grid size-8 place-items-center rounded-full bg-brand text-white transition-transform duration-300 group-hover/s:rotate-45">
                <ArrowUpRight size={14} />
              </span>
            </a>
            <button
              type="button"
              aria-label={mobile ? 'Close menu' : 'Open menu'}
              aria-expanded={mobile}
              onClick={() => setMobile((m) => !m)}
              className="relative grid size-10 place-items-center rounded-full bg-v3-glass-2 lg:hidden"
            >
              <span className={cx('absolute h-[1.5px] w-4 rounded bg-v3-ink transition-transform duration-300', mobile ? 'rotate-45' : '-translate-y-[4px]')} />
              <span className={cx('absolute h-[1.5px] w-4 rounded bg-v3-ink transition-transform duration-300', mobile ? '-rotate-45' : 'translate-y-[4px]')} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={mobile} onClose={() => setMobile(false)} />
    </>
  );
}
