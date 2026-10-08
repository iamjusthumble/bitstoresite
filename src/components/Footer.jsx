import React from 'react';
import { links } from '../links.js';
import logo from '../assets/logo.svg';
import storeBadges from '../assets/store-badges.png';
import socials from '../assets/socials.svg';
import { VERSIONS, useVersion } from '../version.js';

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

function FooterColumns({ columns }) {
  return (
    <div className="footer-columns">
      {columns.map((col) => (
        <div className="footer-col" key={col.title}>
          <strong>{col.title}</strong>
          {col.items.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </div>
      ))}
    </div>
  );
}

function VersionSwitch() {
  const { version, setVersion } = useVersion();
  return (
    <div className="version-switch" role="radiogroup" aria-label="Site version">
      <span>Site version</span>
      <div className="version-switch-options">
        {VERSIONS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={version === v}
            className={version === v ? 'is-active' : ''}
            onClick={() => setVersion(v)}
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
    <footer className="footer">
      <div className="footer-top reveal">
        <div className="footer-brand">
          <a className="logo" href="/#top" aria-label="Mybitstore home">
            <img src={logo} alt="" width="36" height="36" />
            <span>Mybitstore</span>
          </a>
          <p className="footer-tagline"><span>Build.</span><span>Trade.</span><span>Move Value</span></p>
          <div className="store-badges">
            <img src={storeBadges} alt="" />
            <a href={links.googlePlay} aria-label="Get it on Google Play" />
            <a href={links.appStore} aria-label="Download on the App Store" />
          </div>
        </div>
        <FooterColumns columns={primaryColumns} />
      </div>
      <div className="footer-secondary">
        <FooterColumns columns={secondaryColumns} />
      </div>
      <div className="footer-bottom">
        <p>© 2026 Mybitstore, Inc. All rights reserved.</p>
        {showVersionSwitch && <VersionSwitch />}
        <div className="socials">
          <img src={socials} alt="" width="146" height="14" />
          <a href={links.facebook} aria-label="Facebook" />
          <span aria-hidden="true" />
          <a href={links.twitter} aria-label="Twitter" />
          <a href={links.instagram} aria-label="Instagram" />
        </div>
      </div>
    </footer>
  );
}
