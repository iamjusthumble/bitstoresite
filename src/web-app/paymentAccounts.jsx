import React from 'react';
import atLogo from '../assets/wa-payments/at-money.png';
import bothIcon from '../assets/wa-payments/both.svg';
import buyIcon from '../assets/wa-payments/buy.svg';
import mtnLogo from '../assets/wa-payments/mtn-momo.png';
import sellIcon from '../assets/wa-payments/sell.svg';
import telecelLogo from '../assets/wa-payments/telecel-cash.png';
import { cx } from '../ui.js';
import { SAMPLE_PAYMENT_ACCOUNTS } from './demoData.js';
import { useStored } from './format.jsx';

// The saved payment accounts, shared by the Payment methods page and the buy, sell, deposit and withdraw flows.
// There is no account backend yet, so the list lives in this browser, starting from sample accounts.

export const PROVIDERS = [
  { id: 'mtn', name: 'MTN MoMo', short: 'MTN', logo: mtnLogo },
  { id: 'at', name: 'AT Money', short: 'AT', logo: atLogo },
  { id: 'telecel', name: 'Telecel Cash', short: 'Telecel', logo: telecelLogo },
];

// `buy` pays for purchases, `sell` receives money from sales and withdrawals, `both` does either
export const ACCOUNT_TYPES = [
  { id: 'buy', name: 'Buy account', tag: 'Buy', summary: 'Buy Accounts', icon: buyIcon, tint: 'bg-[#d0b5e4]' },
  { id: 'sell', name: 'Sell account', tag: 'Sell', summary: 'Sell Accounts', icon: sellIcon, tint: 'bg-[#b5e4ca]' },
  { id: 'both', name: 'Buy/ Sell account', tag: 'Buy/Sell', summary: 'Buy/Sell Accounts', icon: bothIcon, tint: 'bg-[#9bb6ff]' },
];

export const providerById = Object.fromEntries(PROVIDERS.map((p) => [p.id, p]));
export const typeById = Object.fromEntries(ACCOUNT_TYPES.map((t) => [t.id, t]));

export const usePaymentAccounts = () => useStored('wa-payment-accounts', SAMPLE_PAYMENT_ACCOUNTS);

// Whether an account can be used to pay (`buy`) or to be paid (`sell`)
export const canUse = (account, side) => account.type === 'both' || account.type === side;

export const accountLabel = (account) => providerById[account.provider].name;

// Enough of the number to recognise it in a summary
export const maskNumber = (number) => `${number.slice(0, 3)} ••• ${number.slice(-4)}`;

// Each logo is cropped to fill its disc the way the Figma crops it
export function ProviderLogo({ id, size = 28 }) {
  const { logo } = providerById[id];
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full bg-white" style={{ width: size, height: size }}>
      {id === 'mtn' && <img src={logo} alt="" className="absolute inset-0 size-full object-cover" />}
      {id === 'at' && <img src={logo} alt="" className="absolute left-1/2 top-1/2 size-[144%] max-w-none -translate-1/2 object-cover" />}
      {id === 'telecel' && (
        <span className="absolute left-[calc(50%+0.5px)] top-1/2 h-[112.7%] w-[117.9%] -translate-1/2 overflow-hidden">
          <img src={logo} alt="" className="absolute left-[-22.61%] top-[-22.73%] h-[140.91%] w-[243.74%] max-w-none" />
        </span>
      )}
    </span>
  );
}

export const TypeTag = ({ id }) => (
  <span className={cx('inline-flex w-[54px] shrink-0 justify-center rounded-full py-[5px] font-inter text-[10px] font-medium leading-4 text-black', typeById[id].tint)}>{typeById[id].tag}</span>
);
