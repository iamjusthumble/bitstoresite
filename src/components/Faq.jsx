import React from 'react';
import { links } from '../links.js';
import plus from '../assets/faq-plus.svg';
import plusLight from '../assets/faq-plus-light.svg';
import ThemedImg from './ThemedImg.jsx';
import SectionHead from './Section.jsx';
import { section, text } from '../ui.js';

const faqs = [
  {
    q: 'How do I create an account?',
    a: 'Sign up with your email address, verify it, and turn on two-factor authentication for extra security. It only takes a few minutes.',
  },
  {
    q: 'How can I fund my wallet?',
    a: 'Deposit crypto from another wallet, or buy with a card, bank transfer, or P2P from verified sellers.',
  },
  {
    q: 'What can businesses do with Mybitstore?',
    a: 'Accept Bitcoin, Ethereum, and stablecoins with the Merchant Business Suite and convert instantly to your local currency. You also get OTC and bulk trading, compliance and tax tools, and token launch services.',
  },
  {
    q: 'Can I trade gift cards?',
    a: 'Yes. Trade gift cards quickly and securely, with great rates in Ghana and Nigeria.',
  },
  {
    q: 'How does the affiliate program work?',
    a: 'Share your link and earn 10% commission when people you refer trade on Mybitstore, with real-time payouts.',
  },
];

// Shared by the home page and the gift cards page
export function FaqSection({ eyebrow, title, lead, items, alt = false }) {
  return (
    <section className={alt ? section.alt : section.base}>
      <div className="mx-auto w-full max-w-[1200px] px-6 max-sm:px-5">
        <SectionHead
          className="mb-0 pb-8"
          eyebrow={eyebrow}
          eyebrowClass="mb-[18px]"
          title={title}
          lead={lead}
          leadClass="mt-[18px] max-w-[743px] text-lg leading-[27.9px] text-text-muted light:text-[#5d6781] max-sm:text-base max-sm:leading-[1.6]"
        />
        <div className="reveal border-t border-card-border light:border-[#e4e8f1]">
          {items.map(({ q, a }) => (
            <details key={q} className="group/faq border-b border-card-border light:border-[#e4e8f1]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold leading-[27px] text-title light:text-[#0a1024] max-sm:text-base [&::-webkit-details-marker]:hidden">
                {q}
                <ThemedImg className="shrink-0 transition-transform duration-[250ms] group-open/faq:rotate-45" dark={plus} light={plusLight} width="18" height="18" />
              </summary>
              <p className="max-w-[620px] pb-6 text-base leading-6 text-text-muted light:text-[#5d6781] group-open/faq:animate-[rise_0.35s_var(--ease-soft)]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Faq() {
  return (
    <FaqSection
      eyebrow="FAQ"
      title="Questions, answered."
      lead={<>Can't find what you need? Visit our <a className={text.inlineLink} href={links.support}>Help Center</a>.</>}
      items={faqs}
    />
  );
}
