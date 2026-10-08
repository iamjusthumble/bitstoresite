import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { useTheme } from '../theme.js';
import logo from '../assets/logo.svg';
import chevron from '../assets/chevron.svg';
import chevronLight from '../assets/chevron-light.svg';
import sun from '../assets/sun.svg';
import moon from '../assets/moon.svg';
import { Close, Menu } from './icons.jsx';
import ThemedImg from './ThemedImg.jsx';
import { btn, cx } from '../ui.js';

const menus = [
  {
    label: 'Individuals',
    items: [
      ['Buy & Sell Crypto', links.trade],
      ['Gift Cards', links.giftCardsPage, false, 'New'],
      ['Credit Score', links.creditScore],
      ['Refer & Earn', links.affiliate],
      ['Learn & Earn', links.learnAndEarn],
    ],
  },
  {
    label: 'Businesses',
    items: [
      ['Merchant Business Suite', links.merchant],
      ['OTC & Bulk Trade Desk', links.bulkTrade],
      ['Compliance & Tax', links.taxAssistance],
      ['Token Launch', links.tokenLaunch],
      ['LENS Compliance Suite', '/#lens'],
      ['Sign in to LENS', links.lensLogin, true],
    ],
  },
  {
    label: 'Company',
    items: [
      ['About', links.about],
      ['Customer Reviews', links.customerReview],
      ['Press Kit', links.pressKit],
      ['Contact Us', links.support],
    ],
  },
  {
    label: 'Careers',
    items: [['Open roles', links.careers]],
  },
];

export function Logo({ className = '' }) {
  return (
    <a className={cx('inline-flex shrink-0 items-center gap-2.5', className)} href="/#top" aria-label="Mybitstore home">
      <img src={logo} alt="" width="36" height="36" className="max-sm:size-[30px]" />
      <span className="font-nunito text-2xl font-semibold leading-[1.2] text-brand max-sm:text-xl">Mybitstore</span>
    </a>
  );
}

const menuLink =
  'block rounded-lg px-3 py-2.5 font-nunito text-sm transition-[background-color,color] duration-150 hover:bg-white/5 light:hover:bg-[#f5f7fb]';

function NavMenu({ menu, open, onToggle, onClose }) {
  return (
    <div className="group/item relative" data-open={open}>
      <button
        type="button"
        className="inline-flex items-center gap-[5px] py-1.5 font-nunito text-sm leading-[1.2] text-white light:text-[#0f121e] max-lg:w-full max-lg:justify-between max-lg:border-b max-lg:border-[#1e2740] max-lg:py-4 max-lg:text-[17px] light:max-lg:border-[#e4e8f1]"
        aria-expanded={open}
        onClick={onToggle}
      >
        {menu.label}
        <ThemedImg dark={chevron} light={chevronLight} width="7.8" height="4.4" className="transition-transform duration-200 group-data-[open=true]/item:rotate-180" />
      </button>
      <div
        className={cx(
          'absolute -left-3.5 top-[calc(100%+18px)] hidden min-w-[230px] rounded-[14px] border border-[#1e2740] bg-[#0d1529] p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)]',
          'before:absolute before:inset-x-0 before:-top-5 before:h-5 before:content-[""]',
          'group-data-[open=true]/item:block lg:group-hover/item:block',
          'light:border-[#e4e8f1] light:bg-white light:shadow-[0_24px_48px_-16px_rgba(10,16,36,0.18)]',
          'max-lg:static max-lg:min-w-0 max-lg:border-0 max-lg:bg-transparent max-lg:px-0 max-lg:pb-3 max-lg:pt-1 max-lg:shadow-none max-lg:before:hidden light:max-lg:bg-transparent light:max-lg:shadow-none',
        )}
      >
        {menu.items.map(([label, href, highlight, tag]) => (
          <a
            key={label}
            href={href}
            onClick={onClose}
            className={cx(
              menuLink,
              highlight
                ? 'mt-1 rounded-t-none border-t border-[#1e2740] font-semibold text-accent-blue light:border-[#e4e8f1] light:text-tab-active'
                : 'text-[#c3c9da] hover:text-white light:text-[#2a3350] light:hover:text-[#0a1024]',
            )}
          >
            {label}
            {tag && <span className="ml-2 rounded-full bg-up/18 px-[7px] py-0.5 align-[1px] text-[11px] font-semibold text-up">{tag}</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const ref = useRef(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpenMenu(null);
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <header
      ref={ref}
      data-open={mobileOpen}
      className="group/header sticky top-0 z-50 h-20 border-b border-header-border bg-navy light:border-[#e5e5e5] light:bg-[#fffefe]"
    >
      <div className="mx-auto flex h-full max-w-[1309px] items-center justify-between px-4">
        <div className="flex items-center gap-[58px] max-lg:gap-6">
          <Logo />
          <nav
            aria-label="Main navigation"
            className={cx(
              'flex items-center gap-6',
              'max-lg:fixed max-lg:inset-x-0 max-lg:top-20 max-lg:hidden max-lg:max-h-[calc(100vh-80px)] max-lg:flex-col max-lg:items-stretch max-lg:gap-0 max-lg:overflow-y-auto max-lg:border-b max-lg:border-header-border max-lg:bg-navy max-lg:px-5 max-lg:pb-6 max-lg:pt-3',
              'max-lg:group-data-[open=true]/header:flex light:max-lg:border-[#e5e5e5] light:max-lg:bg-[#fffefe]',
            )}
          >
            {menus.map((menu) => (
              <NavMenu
                key={menu.label}
                menu={menu}
                open={openMenu === menu.label}
                onToggle={() => setOpenMenu((m) => (m === menu.label ? null : menu.label))}
                onClose={closeAll}
              />
            ))}
            <div className="hidden max-lg:mt-5 max-lg:grid max-lg:grid-cols-2 max-lg:gap-3">
              <a className={cx(btn.outline, 'h-11')} href={links.login}>Log In</a>
              <a className={btn.primaryTall} href={links.signup}>Sign Up</a>
            </div>
          </nav>
        </div>
        <div className="flex w-[257px] items-center justify-between max-lg:w-auto max-lg:gap-3">
          <button
            className="grid size-8 place-items-center rounded-full hover:bg-white/8 light:hover:bg-[#0f121e]/6"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <img src={theme === 'dark' ? sun : moon} alt="" width="24" height="24" />
          </button>
          <div className="flex items-center gap-[17px] max-lg:hidden">
            <a className={btn.outline} href={links.login}>Log In</a>
            <a className={btn.primary} href={links.signup}>Sign Up</a>
          </div>
          <button
            className="hidden p-1.5 text-white light:text-[#0f121e] max-lg:inline-flex"
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
