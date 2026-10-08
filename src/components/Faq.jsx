import React from 'react';
import { links } from '../links.js';
import plus from '../assets/faq-plus.svg';
import plusLight from '../assets/faq-plus-light.svg';
import ThemedImg from './ThemedImg.jsx';

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

export default function Faq() {
  return (
    <section className="section faq">
      <div className="container faq-inner">
        <div className="section-head reveal">
          <span className="eyebrow">FAQ</span>
          <h2>Questions, answered.</h2>
          <p className="lead">
            Can't find what you need? Visit our <a className="inline-link" href={links.support}>Help Center</a>.
          </p>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <ThemedImg className="faq-icon" dark={plus} light={plusLight} width="18" height="18" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
