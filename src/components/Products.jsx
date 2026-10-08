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
import Tabs from './Tabs.jsx';
import SectionHead from './Section.jsx';
import { cx, section } from '../ui.js';

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
      className="relative block shrink-0 overflow-hidden"
      style={{ width: art.w, height: art.h, transform: art.rotate ? `rotate(${art.rotate}deg)` : undefined }}
    >
      <img src={img} alt="" style={imgStyle} loading="lazy" className={cx('size-full max-w-none object-cover', art.flip && '-scale-x-100')} />
    </span>
  );
  // Rotated art sits in a fixed frame so the rotation doesn't shift the card layout
  return art.frame ? <span className="flex items-center justify-center" style={{ width: art.frame[0], height: art.frame[1] }}>{box}</span> : box;
}

export default function Products() {
  const [group, setGroup] = useState('Individuals');

  return (
    <section className={section.alt} id="products">
      <div className="site-container">
        <SectionHead
          eyebrow="Products"
          eyebrowClass="mb-3.5 v2:hidden"
          title="Built for everyone who moves value."
          lead="Whether you are trading, running a business, or building a product, Mybitstore gives you the rails."
          leadClass="mt-3.5 max-w-[834px] font-nunito text-2xl leading-[1.2] text-text-muted max-sm:text-lg max-sm:leading-[1.6]"
        >
          <Tabs tabs={Object.keys(groups)} active={group} onChange={setGroup} label="Product audience" fill className="w-[261px] light:bg-[#f6f7ff] max-sm:w-full" />
        </SectionHead>
        <div className="reveal">
          <div className="grid animate-[fade-in_0.35s_ease] grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1" role="tabpanel" aria-label={group} key={group}>
            {groups[group].map((p, i) => (
              <a
                key={p.name}
                href={p.href}
                style={{ animationDelay: `${100 + i * 80}ms` }}
                className="group/card flex min-h-[414px] flex-col items-center justify-between overflow-hidden rounded-[20px] border border-card-border bg-card px-[15px] py-7 transition-[border-color,translate,box-shadow] duration-200 hover:-translate-y-[3px] hover:border-eyebrow hover:shadow-[var(--shadow)] max-sm:min-h-[360px] revealed:animate-[rise_0.7s_var(--ease-soft)_backwards]"
              >
                <span className="flex flex-1 items-center justify-center transition-[translate] duration-500 ease-soft group-hover/card:-translate-y-2">
                  <ProductArt img={p.img} art={p.art} />
                </span>
                <span className="flex w-full flex-col gap-3.5">
                  <span className="flex items-start justify-between gap-2">
                    <h3 className="max-w-[249px] text-[30px] font-semibold leading-none tracking-[-0.27px] text-title">{p.name}</h3>
                    <img src={arrowUpRight} alt="" width="16" height="16" className="shrink-0 transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
                  </span>
                  <p className="min-h-[69px] text-base leading-[21px] text-text-muted">{p.copy}</p>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
