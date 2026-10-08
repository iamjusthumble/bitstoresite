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

export function Logo() {
  return (
    <a className="logo" href="/#top" aria-label="Mybitstore home">
      <img src={logo} alt="" width="36" height="36" />
      <span>Mybitstore</span>
    </a>
  );
}

function NavMenu({ menu, open, onToggle, onClose }) {
  return (
    <div className={'nav-item' + (open ? ' is-open' : '')}>
      <button type="button" className="nav-trigger" aria-expanded={open} onClick={onToggle}>
        {menu.label}
        <ThemedImg dark={chevron} light={chevronLight} width="7.8" height="4.4" />
      </button>
      <div className="nav-menu">
        {menu.items.map(([label, href, highlight, tag]) => (
          <a key={label} href={href} className={highlight ? 'is-highlight' : ''} onClick={onClose}>
            {label}
            {tag && <span className="nav-tag">{tag}</span>}
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
    <header className={'header' + (mobileOpen ? ' is-open' : '')} ref={ref}>
      <div className="header-inner">
        <div className="header-left">
          <Logo />
          <nav className="nav" aria-label="Main navigation">
            {menus.map((menu) => (
              <NavMenu
                key={menu.label}
                menu={menu}
                open={openMenu === menu.label}
                onToggle={() => setOpenMenu((m) => (m === menu.label ? null : menu.label))}
                onClose={closeAll}
              />
            ))}
            <div className="nav-mobile-actions">
              <a className="btn btn-outline" href={links.login}>Log In</a>
              <a className="btn btn-primary" href={links.signup}>Sign Up</a>
            </div>
          </nav>
        </div>
        <div className="header-right">
          <button
            className="header-theme"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <img src={theme === 'dark' ? sun : moon} alt="" width="24" height="24" />
          </button>
          <div className="header-auth">
            <a className="btn btn-outline" href={links.login}>Log In</a>
            <a className="btn btn-primary" href={links.signup}>Sign Up</a>
          </div>
          <button
            className="menu-toggle"
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
