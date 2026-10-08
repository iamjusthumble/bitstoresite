import React, { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ThemedImg from '../components/ThemedImg.jsx';
import { DownloadButton, QrCard } from '../components/Hero.jsx';
import { links } from '../links.js';
import { useReveal } from '../reveal.js';
import logo from '../assets/logo.svg';
import arrowRight from '../assets/arrow-right.svg';
import storeBadges from '../assets/store-badges.png';
import plus from '../assets/faq-plus.svg';
import plusLight from '../assets/faq-plus-light.svg';
import coinBtc from '../assets/coin-btc.svg';
import coinUsdt from '../assets/coin-usdt.svg';
import coinEth from '../assets/coin-eth.svg';

// Copy follows the Mybitstore customer-journey guide. Brands, ranges, stock and payout
// options depend on the customer's country, so the phone screens are labelled illustrative.

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const Icon = {
  search: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  cart: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" /><circle cx="10" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" /></svg>,
  mail: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>,
  wallet: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4h-12A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /><path d="M21 9h-5a3 3 0 0 0 0 6h5V9Z" /><circle cx="16" cy="12" r=".6" fill="currentColor" /></svg>,
  bank: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="m3 9 9-5 9 5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" /></svg>,
  grid: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><path d="m14.5 17 2 2 3.5-4" /></svg>,
  history: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" /><path d="M3 4v4h4M12 8v4.5l3 2" /></svg>,
  camera: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4V8Z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke} strokeWidth="2.4"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>,
  plus: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14" /></svg>,
  eye: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" {...stroke}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
};

const CATEGORIES = ['All', 'Shopping', 'Gaming', 'Entertainment', 'Software', 'Payment Cards', 'Travel'];
// Popular searches the app suggests, each mapped to the category it lives under
const POPULAR = [['Xbox', 'Gaming'], ['Google Play', 'Software'], ['PlayStation', 'Gaming'], ['Apple', 'Software'], ['Steam', 'Gaming'], ['Netflix', 'Entertainment']];
const SAMPLE_CARDS = [
  { name: 'Shopping card', cat: 'Shopping', range: '$5 – $100', tone: 'blue' },
  { name: 'Gaming card', cat: 'Gaming', range: '$10 – $100', tone: 'violet' },
  { name: 'Streaming card', cat: 'Entertainment', range: '$15 – $60', tone: 'rose' },
  { name: 'App store card', cat: 'Software', range: '$10 – $50', tone: 'teal' },
  { name: 'Travel card', cat: 'Travel', range: '$25 – $100', tone: 'amber' },
  { name: 'Prepaid card', cat: 'Payment Cards', range: '$1 – $100', tone: 'blue' },
];

/* ---------- Hero ---------- */

function GiftCard({ tone, label, className = '' }) {
  return (
    <div className={`gc-card tone-${tone} ${className}`}>
      <div className="gc-card-top">
        <span className="gc-card-brand"><span className="gc-card-logo"><img src={logo} alt="" width="20" height="20" /></span>Mybitstore</span>
        <span className="gc-card-tag">{label}</span>
      </div>
      <span className="gc-card-chip" />
      <div className="gc-card-bottom">
        <span>Gift card</span>
        <span className="gc-card-dots">•••• •••• ••••</span>
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="gc-stack" aria-hidden="true">
      <div className="gc-orbit" />
      <GiftCard tone="teal" label="Entertainment" className="is-back" />
      <GiftCard tone="violet" label="Gaming" className="is-mid" />
      <GiftCard tone="blue" label="Shopping" className="is-front" />
      <div className="gc-float gc-float-pay">
        <span className="gc-coins"><img src={coinBtc} alt="" /><img src={coinUsdt} alt="" /><img src={coinEth} alt="" /></span>
        <div><strong>Pay with crypto</strong><small>or a payment account</small></div>
      </div>
      <div className="gc-float gc-float-mail">
        <span className="gc-float-icon">{Icon.mail(16)}</span>
        <div><strong>Delivered to your email</strong><small>Code saved in History</small></div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="gc-hero reveal-scope">
      <div className="gc-hero-bg" aria-hidden="true" />
      <div className="container gc-hero-inner">
        <div className="gc-hero-copy">
          <span className="gc-pill"><span className="gc-pill-dot" />Mybitstore Gift Cards</span>
          <h1>Spend crypto where you <span>already shop.</span></h1>
          <p className="gc-hero-lead">Find a popular brand, pay with crypto or a payment account, and receive your gift card by email.</p>
          <div className="hero-actions gc-hero-actions">
            <a className="btn btn-hero btn-hero-primary" href={links.trade}>
              Buy a gift card
              <img src={arrowRight} alt="" width="22" height="22" />
            </a>
            <DownloadButton />
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

const CATEGORY_ICONS = {
  Shopping: <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8ZM9 8V6.5a3 3 0 0 1 6 0V8" />,
  Gaming: <path d="M7 9h10a4 4 0 0 1 3.9 4.8l-.6 3a2.2 2.2 0 0 1-3.8 1L14.6 16H9.4l-1.9 1.8a2.2 2.2 0 0 1-3.8-1l-.6-3A4 4 0 0 1 7 9ZM8 11.5v3M6.5 13h3M15.5 12.5h.01M17.5 14h.01" />,
  Entertainment: <><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="m10.5 9.5 4 2.5-4 2.5v-5Z" /></>,
  Software: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" /></>,
  'Payment Cards': <><rect x="3" y="6" width="18" height="12" rx="2.5" /><path d="M3 10h18M7 14.5h3" /></>,
  Travel: <path d="M10.5 13.5 4 11l1.5-1.5 7 1 3.6-3.6a1.8 1.8 0 0 1 2.5 2.5L15 13l1 7-1.5 1.5-2.5-6.5-3 3v2l-1.2 1.2-1.3-3.2L3.3 17l1.2-1.2h2l3-3Z" />,
};
const CategoryIcon = ({ name, size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" {...stroke}>{CATEGORY_ICONS[name]}</svg>;
const POPULAR_TONES = ['violet', 'teal', 'blue', 'rose', 'amber', 'rose'];

// Cycles the search placeholder through the popular brands, like a live search hint
function useRotatingHint(items, ms = 2400) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), ms);
    return () => clearInterval(t);
  }, [items, ms]);
  return items[i];
}

function Finder({ onPick }) {
  const hint = useRotatingHint(POPULAR.map(([name]) => name));
  return (
    <section className="gc-finder-wrap" aria-label="Find a gift card">
      <div className="container">
        <div className="gc-finder reveal">
          <button type="button" className="gc-search" onClick={() => onPick(hint, POPULAR.find(([n]) => n === hint)[1])}>
            <span className="gc-search-icon">{Icon.search(20)}</span>
            <span className="gc-search-text">
              Search gift cards like <b key={hint}>{hint}</b>
            </span>
            <span className="gc-search-btn">Search <img src={arrowRight} alt="" width="18" height="18" /></span>
          </button>

          <div className="gc-finder-grid">
            <div className="gc-finder-block">
              <div className="gc-finder-head">
                <strong>Popular searches</strong>
                <span>Brands and stock vary by country</span>
              </div>
              <div className="gc-popular">
                {POPULAR.map(([name, cat], i) => (
                  <button key={name} type="button" className="gc-pop" onClick={() => onPick(name, cat)}>
                    <span className={'gc-pop-icon tone-' + POPULAR_TONES[i]}><CategoryIcon name={cat} size={18} /></span>
                    <span className="gc-pop-text"><strong>{name}</strong><small>{cat}</small></span>
                    <span className="gc-pop-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="gc-finder-block">
              <div className="gc-finder-head"><strong>Browse by category</strong></div>
              <div className="gc-cats">
                {CATEGORIES.slice(1).map((cat) => (
                  <button key={cat} type="button" className="gc-cat" onClick={() => onPick('', cat)}>
                    <CategoryIcon name={cat} size={20} />
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Phone screens (illustrative) ---------- */

function ScreenBar({ title, right }) {
  return (
    <div className="ph-bar">
      <span className="ph-back">‹</span>
      <strong>{title}</strong>
      <span className="ph-bar-right">{right}</span>
    </div>
  );
}

function DiscoverScreen({ query, category }) {
  const rows = SAMPLE_CARDS.filter((c) => category === 'All' || c.cat === category);
  return (
    <>
      <ScreenBar title="Gift Cards" right={<span className="ph-cart">{Icon.cart(13)}<i>1</i></span>} />
      <div className="ph-tabs"><span className="is-active">Buy Card</span><span>Categories</span><em>Select Country ▾</em></div>
      <div className={'ph-search' + (query ? ' has-query' : '')}>{Icon.search(13)}<span>{query || 'Search giftcard, brands…'}</span>{query && <i className="ph-caret" />}</div>
      <div className="ph-cats">{CATEGORIES.slice(0, 5).map((c) => <span key={c} className={c === category ? 'is-active' : ''}>{c}</span>)}</div>
      <ul className="ph-list">
        {rows.map((c) => (
          <li key={c.name}>
            <span className={'ph-tile tone-' + c.tone}>{c.name[0]}</span>
            <div><strong>{c.name}</strong><small>{c.range}</small><span className="ph-tags"><b>{c.cat}</b><b className="is-stock">● In stock</b></span></div>
            <span className="ph-add">{Icon.cart(13)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function SelectScreen() {
  return (
    <>
      <ScreenBar title="Gaming card" />
      <GiftCard tone="violet" label="Gaming" className="ph-hero-card" />
      <div className="ph-row-between"><strong className="ph-h">Choose amount</strong><span className="ph-stock">● In stock</span></div>
      <div className="ph-denoms">{['$10', '$25', '$50', '$100'].map((d) => <span key={d} className={d === '$25' ? 'is-active' : ''}>{d}</span>)}</div>
      <div className="ph-row-between ph-qty"><span>Quantity</span><span className="ph-stepper"><b>−</b>1<b>+</b></span></div>
      <span className="ph-btn">{Icon.cart(14)} Add to cart</span>
    </>
  );
}

function PrepareScreen() {
  return (
    <>
      <ScreenBar title="Cart" />
      <div className="ph-panel ph-cart-item">
        <span className="ph-tile tone-violet">G</span>
        <div><strong>Gaming card</strong><small>$25.00 × 1</small></div>
        <span className="ph-amount">$25.00</span>
      </div>
      <label className="ph-label">Recipient email</label>
      <div className="ph-field is-focus">{Icon.mail(14)}<span>you@email.com</span><i className="ph-caret" /></div>
      <p className="ph-hint">Make sure this email is valid. Your gift card is delivered here.</p>
      <span className="ph-spacer" />
      <span className="ph-btn">Continue</span>
    </>
  );
}

function PayScreen() {
  return (
    <>
      <ScreenBar title="Payment method" />
      <div className="ph-option">
        <span className="ph-option-icon">{Icon.bank(16)}</span>
        <div><strong>Payment account</strong><small>Bank, mobile money, or card</small></div>
        <span className="ph-radio" />
      </div>
      <div className="ph-option is-active">
        <span className="ph-option-icon">{Icon.wallet(16)}</span>
        <div><strong>Crypto</strong><small>Pay from your Mybitstore wallet</small></div>
        <span className="ph-radio" />
      </div>
      <div className="ph-coins">
        {[['USDT', coinUsdt], ['BTC', coinBtc], ['ETH', coinEth]].map(([sym, src], i) => (
          <span key={sym} className={i === 0 ? 'is-active' : ''}><img src={src} alt="" />{sym}</span>
        ))}
      </div>
      <span className="ph-spacer" />
      <span className="ph-btn">Continue to preview</span>
    </>
  );
}

function ConfirmScreen() {
  const rows = [['Gift card', 'Gaming card'], ['Amount', '$25.00'], ['Quantity', '1'], ['Deliver to', 'you@email.com'], ['Pay with', 'USDT']];
  return (
    <>
      <ScreenBar title="Checkout preview" />
      <div className="ph-panel ph-preview">
        {rows.map(([k, v]) => <div key={k}><span>{k}</span><strong>{v}</strong></div>)}
        <div className="ph-total"><span>Total</span><strong>$25.00</strong></div>
      </div>
      <p className="ph-hint">Check the details before you confirm. Your card is sent to the email above.</p>
      <span className="ph-spacer" />
      <span className="ph-btn">Confirm purchase</span>
    </>
  );
}

function ReceiveScreen() {
  return (
    <>
      <div className="ph-success">
        <span className="ph-success-ring"><span>{Icon.check(26)}</span></span>
        <strong>Purchase confirmed</strong>
        <small>Your gift card will arrive at<br />you@email.com</small>
      </div>
      <span className="ph-section-label">History</span>
      <div className="ph-panel ph-history">
        <div className="ph-row-between"><strong>Gaming card</strong><span className="ph-done">Completed</span></div>
        <div className="ph-code"><span>••••-••••-••••</span><b>{Icon.eye(12)} Reveal code</b></div>
        <small>Redemption steps are saved with your card.</small>
      </div>
    </>
  );
}

const STEPS = [
  { key: 'discover', title: 'Discover', copy: 'Pick your country, browse categories, or search a brand like Xbox, Google Play, or Netflix.', Screen: DiscoverScreen },
  { key: 'select', title: 'Select', copy: 'See denominations or ranges and stock status, then add a card to your cart.', Screen: SelectScreen },
  { key: 'prepare', title: 'Prepare', copy: 'Review your cart and enter the email address your card should be delivered to.', Screen: PrepareScreen },
  { key: 'pay', title: 'Pay', copy: 'Use a saved payment account, a one-time method, or crypto from your wallet.', Screen: PayScreen },
  { key: 'confirm', title: 'Confirm', copy: 'Check the checkout preview with every detail in one place, then confirm.', Screen: ConfirmScreen },
  { key: 'receive', title: 'Receive', copy: 'Your card arrives by email, and History keeps the code and redemption steps.', Screen: ReceiveScreen },
];

function Walkthrough({ search }) {
  return (
    <section className="section gc-walk" id="how">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">How buying works</span>
          <h2>From brand to inbox in six steps.</h2>
          <p className="lead">Find a card, check out with the method that suits you, and keep every code in one place.</p>
        </div>
        <ol className="gc-step-grid reveal reveal-stagger">
          {STEPS.map(({ key, title, copy, Screen }, i) => (
            <li className="gc-step-card" key={key}>
              <div className="gc-mini" aria-hidden="true">
                <div className="gc-phone-screen">
                  <div className="ph-body" key={key === 'discover' ? search.query + search.category : key}>
                    <Screen query={search.query} category={search.category} />
                  </div>
                </div>
              </div>
              <div className="gc-step-info">
                <span className="gc-step-num">{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="gc-phone-note reveal">Illustrative screens. Brands, ranges, and stock vary by country.</p>
      </div>
    </section>
  );
}

/* ---------- Value, FAQ, CTA ---------- */

const VALUES = [
  { icon: Icon.grid(), title: 'Brand-first discovery', copy: 'Browse by country and category, or search the brand you already have in mind.' },
  { icon: Icon.wallet(22), title: 'Pay your way', copy: 'Check out with a saved payment account, a one-time method, or crypto from your wallet.' },
  { icon: Icon.history(), title: 'Every code, kept safe', copy: 'Cards arrive by email, and History keeps codes and redemption guidance for later.' },
];

function Values() {
  return (
    <section className="section section-alt gc-values">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Why gift cards on Mybitstore</span>
          <h2>Crypto that works in everyday places.</h2>
        </div>
        <div className="gc-value-grid reveal reveal-stagger">
          {VALUES.map((v) => (
            <div className="gc-value" key={v.title}>
              <span className="gc-value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  ['How do I receive a gift card I buy?', 'Your card is delivered to the email address you enter at checkout, so make sure it is valid. You can also find the code and redemption steps in History.'],
  ['How can I pay for a gift card?', 'Use a saved payment account, a one-time method, or crypto. You see a full checkout preview before you confirm.'],
  ['Which brands can I buy?', 'Brands, denominations, and stock depend on your country. Browse by category or search a brand like Xbox, Google Play, PlayStation, Apple, Steam, or Netflix.'],
  ['Can I buy more than one gift card at once?', 'Yes. Add cards to your cart, review everything together, and check out in one go.'],
  ['Where do I find my gift card code later?', 'Open History in the app. Your gift card purchases keep their codes and redemption steps, so you can come back to them any time.'],
];

function GiftFaq() {
  return (
    <section className="section section-alt faq">
      <div className="container faq-inner">
        <div className="section-head reveal">
          <span className="eyebrow">Gift card FAQ</span>
          <h2>Good questions, clear answers.</h2>
          <p className="lead">Need more help? Visit our <a className="inline-link" href={links.support}>Help Center</a>.</p>
        </div>
        <div className="faq-list reveal">
          {FAQS.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<ThemedImg className="faq-icon" dark={plus} light={plusLight} width="18" height="18" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="gc-cta-wrap">
      <div className="container">
        <div className="gc-cta reveal">
          <div className="gc-cta-copy">
            <h2>Your next gift card is a few taps away.</h2>
            <p>Open Gift Cards in the Mybitstore app, or scan the code to download it.</p>
            <div className="gc-cta-actions">
              <a className="btn btn-hero btn-hero-primary" href={links.trade}>Buy a gift card <img src={arrowRight} alt="" width="22" height="22" /></a>
              <div className="store-badges">
                <img src={storeBadges} alt="" />
                <a href={links.googlePlay} aria-label="Get it on Google Play" />
                <a href={links.appStore} aria-label="Download on the App Store" />
              </div>
            </div>
          </div>
          <div className="gc-cta-qr">
            <QrCard />
            <span>Scan to download</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GiftCards() {
  useReveal();
  const [search, setSearch] = useState({ query: '', category: 'All' });

  const pickSearch = (query, category) => {
    setSearch({ query, category });
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="top" className="gc">
      <Header />
      <main>
        <Hero />
        <Finder onPick={pickSearch} />
        <Walkthrough search={search} />
        <Values />
        <GiftFaq />
        <Cta />
      </main>
      <Footer showVersionSwitch={false} />
    </div>
  );
}
