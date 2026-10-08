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
import SectionHead from './Section.jsx';
import { section } from '../ui.js';

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
    <section className={section.alt}>
      <div className="site-container">
        <SectionHead
          className="mb-[60px]"
          eyebrow="Security"
          title="Trust, built into every transaction."
          lead="Security and compliance are part of the product, not an afterthought."
          leadClass="mt-[18px] max-w-[743px] text-lg leading-[27.9px] text-text-muted light:text-[#5d6781] max-sm:text-base max-sm:leading-[1.6]"
        />
        <div className="reveal grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {items.map(({ icon, iconLight, title, copy, href }, i) => (
            <div
              key={title}
              style={{ animationDelay: `${100 + i * 80}ms` }}
              className="group/sec flex flex-col rounded-[20px] border border-card-border bg-card px-[15px] py-7 transition-[translate,border-color] duration-300 ease-soft hover:-translate-y-[3px] revealed:animate-[rise_0.7s_var(--ease-soft)_backwards]"
            >
              <span className="mb-[18px] grid size-11 place-items-center rounded-xl bg-[rgba(61,110,240,0.16)] transition-[scale] duration-300 ease-soft group-hover/sec:scale-108 light:bg-[#eaf0ff]">
                <ThemedImg dark={icon} light={iconLight} width="22" height="22" />
              </span>
              <h3 className="text-lg font-semibold leading-[27px] tracking-[-0.27px] text-title">{title}</h3>
              <p className="pt-2 text-[15px] leading-[22.5px] text-text-muted light:text-[#5d6781]">{copy}</p>
              {href && <a className="mt-3 text-sm font-semibold leading-[21px] text-eyebrow hover:underline hover:underline-offset-3" href={href}>Read our policy</a>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
