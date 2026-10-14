import React, { useEffect, useRef } from 'react';
import { links } from '../links.js';
import { cx } from '../ui.js';
import boost from '../assets/wa-menu/boost.svg';
import buy from '../assets/wa-menu/buy.svg';
import creditScore from '../assets/wa-menu/credit-score.svg';
import deposit from '../assets/wa-menu/deposit.svg';
import gift from '../assets/wa-menu/gift.svg';
import help from '../assets/wa-menu/help.svg';
import history from '../assets/wa-menu/history.svg';
import invite from '../assets/wa-menu/invite.svg';
import leaderboard from '../assets/wa-menu/leaderboard.svg';
import pay from '../assets/wa-menu/pay.svg';
import payments from '../assets/wa-menu/payments.svg';
import rewards from '../assets/wa-menu/rewards.svg';
import sell from '../assets/wa-menu/sell.svg';
import sendMoney from '../assets/wa-menu/send-money.svg';
import swap from '../assets/wa-menu/swap.svg';
import withdraw from '../assets/wa-menu/withdraw.svg';

// Icons are 40px Figma exports drawn at their natural size (the gift is smaller, so it is offset into place).
// Destinations inside the web app use a hash; everything else opens the live Mybitstore app or site
const GROUPS = [
  ['Buy & sell crypto', [['Deposit', deposit, '#deposit'], ['Buy crypto', buy, '#buy/btc'], ['Sell crypto', sell, '#sell/btc'], ['Withdraw', withdraw, '#withdraw']]],
  ['Trade', [['Swap', swap, links.trade], ['Gift cards', gift, '#gift-cards', 'object-[3.33px_2.08px]'], ['Pay', pay, links.pay]]],
  ['Finance', [['Send money', sendMoney, links.trade], ['Credit score', creditScore, links.creditScore], ['Payments', payments, '#payments'], ['History', history, '#activity']]],
  ['Events', [['Rewards', rewards, links.login], ['Invite', invite, '#referral'], ['Leaderboard', leaderboard, links.login], ['Boost rank', boost, links.login]]],
  ['Services', [['Help centre', help, links.support]]],
];

const MENU_WIDTH = 465;
// Roughly how tall the menu is with every group showing; used to keep it inside the viewport
const MENU_HEIGHT = 740;
const GUTTER = 16;

// Where to float the menu so it stays on screen: below the button that opened it by default,
// or beside it with `side: 'left'` (Quick actions → More) when there is room on that side
export function menuPosition(trigger, side = 'below') {
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(MENU_WIDTH, window.innerWidth - GUTTER * 2);
  if (side === 'left' && rect.left - 8 - width >= GUTTER) {
    const top = Math.max(GUTTER, Math.min(rect.top, window.innerHeight - GUTTER - MENU_HEIGHT));
    return { left: rect.left - 8 - width, top, width, maxHeight: window.innerHeight - top - GUTTER };
  }
  const left = Math.min(Math.max(rect.right - width, GUTTER), window.innerWidth - GUTTER - width);
  const below = window.innerHeight - rect.bottom - 8 - GUTTER;
  // Too little room underneath (e.g. the More button low on the page): use the full viewport height
  const top = below >= 360 ? rect.bottom + 8 : GUTTER;
  return { left, top, width, maxHeight: window.innerHeight - top - GUTTER };
}

export default function AppsMenu({ position, trigger, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus({ preventScroll: true });
    const onPointer = (e) => !ref.current.contains(e.target) && !trigger.contains(e.target) && onClose();
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      onClose();
      trigger.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, { passive: true });
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose);
      window.removeEventListener('resize', onClose);
    };
  }, [trigger, onClose]);

  // Arrow keys walk through the shortcuts in reading order
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const items = [...ref.current.querySelectorAll('a')];
    const at = items.indexOf(document.activeElement);
    items[at < 0 ? (step > 0 ? 0 : items.length - 1) : (at + step + items.length) % items.length].focus();
  };

  return (
    <div
      ref={ref}
      role="menu"
      tabIndex={-1}
      aria-label="All shortcuts"
      onKeyDown={onKeyDown}
      style={position}
      className="fixed z-[60] animate-[pop-in_0.15s_ease-out] overflow-y-auto rounded-[20px] border border-wa-line bg-wa-inset pb-4 pt-5 shadow-(--wa-shadow) outline-none"
    >
      {GROUPS.map(([title, items], i) => (
        <div key={title} role="group" aria-label={title} className={i ? 'mt-2.5 border-t border-wa-line pt-2.5' : undefined}>
          <h2 className="px-5 text-xl font-bold leading-8 tracking-[-0.2px] text-wa-muted max-sm:text-lg">{title}</h2>
          <div className="mt-2 grid grid-cols-4 gap-x-1 px-3">
            {items.map(([label, icon, href, iconClass]) => (
              <a
                key={label}
                role="menuitem"
                href={href}
                onClick={onClose}
                className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center text-base leading-[1.2] text-wa-text transition-colors duration-150 hover:bg-wa-pill max-sm:text-[13px]"
              >
                <img src={icon} alt="" className={cx('size-10 object-none', iconClass)} />
                <span className="whitespace-nowrap">{label}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
