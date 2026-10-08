import React, { useState } from 'react';
import { links } from '../links.js';
import arrowUpRight from '../assets/arrow-up-right.svg';
import iconGiftcard from '../assets/icon-giftcard.png';
import iconRefer from '../assets/icon-refer.png';
import iconCredit from '../assets/icon-credit.png';
import iconLearn from '../assets/icon-learn.png';
import iconCompliance from '../assets/icon-compliance.png';
import iconMerchant from '../assets/icon-merchant.png';
import iconApi from '../assets/icon-api.png';
import iconToken from '../assets/icon-token.png';

// art: box size, plus the image's framing inside it as [top, left, width, height] percentages
const groups = {
  Individuals: [
    {
      name: 'Gift Cards',
      copy: 'Fast, secure gift card trading with great rates in Ghana & Nigeria.',
      href: links.giftCardsPage,
      img: iconGiftcard,
      art: { w: 207.5, h: 152.35, crop: [-28.36, -10.81, 121.95, 166.11], rotate: 14.83, frame: [239.6, 200.4] },
    },
    {
      name: 'Refer & Earn',
      copy: 'Earn 10% commission when people you refer trade. Real-time payouts.',
      href: links.affiliate,
      img: iconRefer,
      art: { w: 195.65, h: 176.39, crop: [-0.23, -0.7, 101.41, 112.48] },
    },
    {
      name: 'Credit Score',
      copy: 'Unlock better rates, lending opportunities, and VIP rewards as you trade.',
      href: links.creditScore,
      img: iconCredit,
      art: { w: 224.42, h: 178.39, crop: [-15.82, 0.03, 99.94, 131.83] },
    },
    {
      name: 'Learn & Earn',
      copy: 'Complete lessons, answer quizzes, and earn real rewards in Bitcoin.',
      href: links.learnAndEarn,
      img: iconLearn,
      art: { w: 154, h: 176, cropPx: [-19.82, -34.2, 220, 223.09] },
    },
  ],
  Businesses: [
    {
      name: 'Compliance & Tax',
      copy: 'Import, classify, and generate compliant crypto tax reports, complete with audit trails.',
      href: links.taxAssistance,
      img: iconCompliance,
      art: { w: 199, h: 199, flip: true },
    },
    {
      name: 'Merchant Business Suite',
      copy: 'Crypto in. Fiat or stable coins out. Instant conversion to your local currency.',
      href: links.merchant,
      img: iconMerchant,
      art: { w: 214, h: 214 },
    },
    {
      name: 'Crypto APIs',
      copy: 'Developer-friendly APIs to build and scale crypto products.',
      href: links.apis,
      img: iconApi,
      art: { w: 190, h: 190 },
    },
    {
      name: 'Token Launch',
      copy: 'Create token projects with transparent controls and professional infrastructure.',
      href: links.tokenLaunch,
      img: iconToken,
      art: { w: 201, h: 201 },
    },
  ],
};

function ProductArt({ img, art }) {
  let imgStyle;
  if (art.crop) {
    const [top, left, width, height] = art.crop;
    imgStyle = { position: 'absolute', top: top + '%', left: left + '%', width: width + '%', height: height + '%' };
  } else if (art.cropPx) {
    const [top, left, width, height] = art.cropPx;
    imgStyle = { position: 'absolute', top, left, width, height, objectFit: 'cover' };
  }
  const box = (
    <span
      className={'product-art' + (art.flip ? ' is-flipped' : '')}
      style={{ width: art.w, height: art.h, transform: art.rotate ? `rotate(${art.rotate}deg)` : undefined }}
    >
      <img src={img} alt="" style={imgStyle} loading="lazy" />
    </span>
  );
  // Rotated art sits in a fixed frame so the rotation doesn't shift the card layout
  return art.frame ? <span className="product-art-frame" style={{ width: art.frame[0], height: art.frame[1] }}>{box}</span> : box;
}

export default function Products() {
  const [group, setGroup] = useState('Individuals');

  return (
    <section className="section section-alt products" id="products">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Products</span>
          <h2>Built for everyone who moves value.</h2>
          <p className="lead lead-lg">Whether you are trading, running a business, or building a product, Mybitstore gives you the rails.</p>
          <div className="tabs tabs-products" role="tablist" aria-label="Product audience">
            {Object.keys(groups).map((g) => (
              <button key={g} type="button" role="tab" aria-selected={group === g} className={group === g ? 'is-active' : ''} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="reveal">
        <div className="product-grid reveal-stagger" role="tabpanel" aria-label={group} key={group}>
          {groups[group].map((p) => (
            <a className="product-card" href={p.href} key={p.name}>
              <span className="product-art-slot"><ProductArt img={p.img} art={p.art} /></span>
              <span className="product-text">
                <span className="product-title">
                  <h3>{p.name}</h3>
                  <img src={arrowUpRight} alt="" width="16" height="16" />
                </span>
                <p>{p.copy}</p>
              </span>
            </a>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
