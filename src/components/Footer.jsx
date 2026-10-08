import React from 'react';
import { links } from '../links.js';
import storeBadges from '../assets/store-badges.png';
import socials from '../assets/socials.svg';
import { VERSIONS, useVersion } from '../version.js';
import { Logo } from './Header.jsx';
import { cx } from '../ui.js';

const primaryColumns = [
  {
    title: 'Product',
    items: [
      ['Buy & Sell Crypto', links.trade],
      ['Merchant Crypto Business Suite', links.merchant],
      ['Crypto Compliance and Tax Assistant', links.taxAssistance],
      ['Pay', links.pay],
      ['Gift Cards', links.giftCardsPage],
      ['Send Money', links.trade],
      ['Credit Score', links.creditScore],
      ['Token Launch & Vesting Manager', links.tokenLaunch],
      ['White-Label Crypto API', links.apis],
    ],
  },
  {
    title: 'Businesses',
    items: [
      ['OTC & Bulk Trade Desk', links.bulkTrade],
      ['Mybitstore Business', links.merchant],
      ['Payments', links.pay],
      ['Assets/ Token Listings', links.tokenLaunch],
      ['Sign in to LENS', links.lensLogin],
    ],
  },
  {
    title: 'Developers',
    items: [
      ['Developer Platform', links.apis],
      ['API Docs', links.apis],
      ['Wallet APIs (Server &\nEmbedded Wallets)', links.apis],
      ['Compliance, KYB/ KYC', links.compliance],
      ['Onramp & OTramp', links.apis],
      ['Trade API', links.apis],
      ['Data & Prices API', links.apis],
      ['Webhooks & Notifications', links.apis],
      ['Integrations', links.apis],
    ],
  },
];

const secondaryColumns = [
  {
    title: 'Company',
    items: [
      ['About', links.about],
      ['Careers', links.careers],
      ['Become Referrer', links.referAndEarn],
      ['Customer Reviews', links.customerReview],
      ['Press Kit', links.pressKit],
    ],
  },
  {
    title: 'Resources',
    items: [
      ['Fees & Rates', links.fees],
      ['Help Center', links.support],
      ['Support FAQs', links.support],
      ['Pricing', links.fees],
      ['Learn & Earn', links.learnAndEarn],
      ['Contact Us', links.support],
    ],
  },
  {
    title: 'Legal',
    items: [
      ['User Terms', links.terms],
      ['Privacy Policy', links.privacy],
      ['Referral Terms', links.referralTerms],
      ['KYC & AML Policy', links.aml],
      ['Risk Policy', links.risks],
      ['Refund Policy', links.refund],
    ],
  },
];

function FooterColumns({ columns, className = '' }) {
  return (
    <div className={cx('flex w-[893px] max-w-full justify-between max-sm:flex-col max-sm:gap-8', className)}>
      {columns.map((col) => (
        <div className="flex w-[240px] flex-col gap-5 leading-[1.2]" key={col.title}>
          <strong className="text-base font-normal text-brand">{col.title}</strong>
          {col.items.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="whitespace-pre-line font-nunito text-sm font-semibold text-[#6f7794] transition-colors duration-150 hover:text-[#aab2cf] light:text-black light:hover:text-brand"
            >
              {label}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

// App store badges sliced from one exported image; each half is a link
export function StoreBadges() {
  return (
    <div className="relative grid h-9 w-[268px] grid-cols-[126px_20px_122px] overflow-hidden">
      <img src={storeBadges} alt="" className="absolute left-[-0.26%] top-[-100%] h-[200%] w-[100.52%] max-w-none" />
      <a href={links.googlePlay} aria-label="Get it on Google Play" className="relative col-start-1 row-start-1" />
      <a href={links.appStore} aria-label="Download on the App Store" className="relative col-start-3 row-start-1" />
    </div>
  );
}

function VersionSwitch() {
  const { version, setVersion } = useVersion();
  return (
    <div className="flex items-center gap-3 font-nunito text-sm font-semibold text-[#6f7794]" role="radiogroup" aria-label="Site version">
      <span>Site version</span>
      <div className="flex gap-0.5 rounded-full border border-tab-border bg-tab-bg p-[3px]">
        {VERSIONS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={version === v}
            onClick={() => setVersion(v)}
            className={cx(
              'min-w-11 rounded-full px-3 py-[5px] font-euclid text-[13px] font-medium leading-[18px] transition-[background-color,color] duration-200',
              version === v ? 'bg-tab-active text-white' : 'text-tab-text hover:text-title',
            )}
          >
            V{v}
          </button>
        ))}
      </div>
    </div>
  );
}

// The version switch only applies to the home page layouts
export default function Footer({ showVersionSwitch = true }) {
  return (
    <footer className="bg-navy px-[92px] py-20 text-white light:bg-[#f7f7fc] light:text-black max-lg:px-8 max-lg:py-16 max-sm:px-5 max-sm:py-14">
      <div className="reveal mx-auto flex max-w-[1256px] justify-between gap-10 max-lg:flex-col">
        <div className="flex flex-col gap-[21px]">
          <Logo />
          <p className="flex gap-2 text-base leading-[1.2]"><span>Build.</span><span>Trade.</span><span>Move Value</span></p>
          <StoreBadges />
        </div>
        <FooterColumns columns={primaryColumns} />
      </div>
      <div className="mx-auto flex max-w-[1256px] justify-end max-lg:justify-start">
        <FooterColumns columns={secondaryColumns} className="mt-10 border-t border-[#03163e] pt-10" />
      </div>
      <div className="mx-auto mt-10 flex max-w-[1256px] items-center justify-between gap-6 border-t border-[#03163e] pt-[54px] max-sm:flex-col max-sm:items-start max-sm:pt-8">
        <p className="font-nunito text-xl font-semibold leading-[1.2] text-[#6f7794] max-sm:text-base">© 2026 Mybitstore, Inc. All rights reserved.</p>
        {showVersionSwitch && <VersionSwitch />}
        <div className="relative grid h-3.5 w-[146px] grid-cols-4">
          <img src={socials} alt="" width="146" height="14" className="absolute inset-0" />
          <a href={links.facebook} aria-label="Facebook" className="relative" />
          <span aria-hidden="true" />
          <a href={links.twitter} aria-label="Twitter" className="relative" />
          <a href={links.instagram} aria-label="Instagram" className="relative" />
        </div>
      </div>
    </footer>
  );
}
