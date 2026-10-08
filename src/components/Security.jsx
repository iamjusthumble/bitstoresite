import React from 'react';
import { links } from '../links.js';
import lock from '../assets/sec-lock.svg';
import shield from '../assets/sec-shield.svg';
import receipt from '../assets/sec-receipt.svg';
import userCheck from '../assets/sec-usercheck.svg';
import lockLight from '../assets/sec-lock-light.svg';
import shieldLight from '../assets/sec-shield-light.svg';
import receiptLight from '../assets/sec-receipt-light.svg';
import ThemedImg from './ThemedImg.jsx';

const items = [
  {
    icon: lock,
    iconLight: lockLight,
    title: 'Protected accounts',
    copy: 'Every account starts with email verification, with optional two-factor authentication for extra security.',
  },
  {
    icon: shield,
    iconLight: shieldLight,
    title: 'Escrow-backed P2P',
    copy: 'Strict escrow adds extra verification for high-value trades and new counterparties.',
  },
  {
    icon: receipt,
    iconLight: receiptLight,
    title: 'Compliance and tax tools',
    copy: 'Compliant tax reports with full audit trails, trusted by traders and SMEs across Africa and beyond.',
  },
  {
    icon: userCheck,
    iconLight: userCheck,
    title: 'KYC and AML standards',
    copy: 'Clear identity and anti-money-laundering policies keep the platform safe for everyone.',
    href: links.aml,
  },
];

export default function Security() {
  return (
    <section className="section section-alt security">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Security</span>
          <h2>Trust, built into every transaction.</h2>
          <p className="lead">Security and compliance are part of the product, not an afterthought.</p>
        </div>
        <div className="security-grid reveal reveal-stagger">
          {items.map(({ icon, iconLight, title, copy, href }) => (
            <div className="security-card" key={title}>
              <span className="security-icon"><ThemedImg dark={icon} light={iconLight} width="22" height="22" /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
              {href && <a className="security-link" href={href}>Read our policy</a>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
