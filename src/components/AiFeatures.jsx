import React, { useState } from 'react';
import bot from '../assets/ai-bot.png';
import user from '../assets/ai-user.jpg';
import gridline from '../assets/chart-gridline.svg';
import chartPath from '../assets/chart-path.svg';
import chartDot from '../assets/chart-dot.svg';
import info from '../assets/ai-info.svg';
import Tabs from './Tabs.jsx';
import ThinkingOrb from './ThinkingOrb.jsx';
import { useVersion } from '../version.js';
import SectionHead from './Section.jsx';
import { cx, section } from '../ui.js';

const bubble = 'flex flex-col gap-[10.56px] rounded-[10.56px] p-[10.56px]';

function ChatVisual() {
  return (
    <div className="relative h-[262px] w-[369.5px] shrink-0 text-[10.56px] leading-[1.2]">
      <div className="absolute left-[147.81px] top-0 flex items-start gap-[11.6px] revealed:animate-[rise_0.5s_var(--ease-soft)_0.15s_backwards]">
        <div className={cx(bubble, 'w-[178.43px] rounded-tr-none bg-brand text-white')}>
          <p>Check my balance</p>
          <time className="text-[#878585] light:text-white">01: 00 PM</time>
        </div>
        <img className="size-[31.67px] shrink-0 rounded-full bg-white object-cover" src={user} alt="" width="32" height="32" />
      </div>
      <div className="absolute left-0 top-[78.13px] flex items-start gap-[12.67px]">
        <span className="relative size-[31.67px] shrink-0 overflow-hidden rounded-full border-[0.317px] border-brand bg-[linear-gradient(137deg,#2f60e0_9%,#401282_49%,#030e53_85%)] revealed:animate-[pop_0.4s_var(--ease-soft)_0.5s_backwards]">
          <img src={bot} alt="" className="absolute -left-[0.91px] -top-[1.5px] size-[32.86px] max-w-none object-cover" />
        </span>
        <span className="pointer-events-none absolute left-[44.34px] top-0 flex rounded-[0_10.56px_10.56px_10.56px] bg-navy px-2.5 py-[7px] opacity-0 light:bg-white revealed:animate-[typing_1.5s_ease-out_0.55s]">
          <ThinkingOrb state="composing" size={20} tint="#2f60e0" />
        </span>
        <div className={cx(bubble, 'w-[253.39px] rounded-tl-none bg-navy text-white light:bg-white light:text-[#1e1f20] revealed:animate-[rise_0.6s_var(--ease-soft)_2s_backwards]')}>
          <p>
            Here's your current wallet balance:<br /><br />
            • BTC: 0.0342 ($1,456.80)<br />
            • ETH: 1.234 ($2,890.50)<br />
            • USDT: 5,000.00<br /><br />
            Total Portfolio Value: $9,347.30<br /><br />
            Your balance increased by 12.3% this week.<br /><br />
            Great job! 🎉
          </p>
          <time className="text-[#878585]">01: 00 PM</time>
        </div>
      </div>
    </div>
  );
}

const chartPop = 'revealed:animate-[pop_0.45s_var(--ease-soft)_1.3s_backwards]';

function TradeVisual() {
  return (
    <div className="relative h-[269px] w-[366px] shrink-0 overflow-hidden rounded-[25.86px] bg-black font-inter light:bg-transparent">
      <div className="absolute inset-x-0 -top-[0.28px] bottom-0 overflow-hidden rounded-[15.75px] bg-navy light:bg-white">
        {[14.43, 60.54, 105.29, 151.4, 196.16].map((top) => (
          <img key={top} className="absolute -left-[7.17px] h-[0.79px] w-[307.08px] max-w-none" src={gridline} alt="" style={{ top }} />
        ))}
        <div className="absolute -left-[40.94px] -top-[56.69px] flex h-[366.13px] w-[389.59px] items-center justify-center revealed:animate-[wipe_1.6s_var(--ease-soft)_0.2s_backwards]">
          <img src={chartPath} alt="" className="h-[247.38px] w-[357.33px] max-w-none object-fill [transform:rotate(20.46deg)_scaleY(0.99)_skewX(7.66deg)]" />
        </div>
        <div className={cx('absolute left-[calc(25%+7.67px)] top-[50.43px] flex h-[40.36px] w-[102.36px] flex-col items-center justify-center gap-[1.6px] rounded-[9.45px] bg-[#161a2c] font-euclid text-white shadow-[0_1.6px_7px_rgba(0,0,0,0.1)] light:bg-white light:text-[#1e1f20]', chartPop)}>
          <span className="text-[7.87px] leading-[12.6px]">Mon, Jan 26, 2026, 10:30</span>
          <strong className="text-[9.45px] font-normal leading-[12.6px]">$37,134.60</strong>
        </div>
        <img className={cx('absolute left-[calc(58.33%+7.03px)] top-[93.94px]', chartPop)} src={chartDot} alt="" width="11" height="11" />
      </div>
      <div className="absolute bottom-[12.32px] left-1/2 flex w-[276.37px] -translate-x-1/2 gap-[25.2px] rounded-[12.6px] bg-[#111629] p-[3.15px] light:bg-[#f4f4f4]">
        {['24H', '1 W', '1 M', '1 Y', 'All'].map((r, i) => (
          <span
            key={r}
            className={cx(
              'rounded-[15.75px] px-[7.87px] py-[4.72px] text-[9.45px]',
              i === 0 ? 'bg-navy text-white light:bg-white light:text-[#1e1f20]' : 'text-[#6f7794]',
            )}
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnalysisVisual() {
  return (
    <div className="relative h-[218px] w-[368px] shrink-0 text-white light:text-[#1e1f20]">
      <div className="absolute left-0 top-0 flex h-[81px] w-[357.18px] flex-col gap-[6.1px] rounded-[8.7px] border-[0.435px] border-[#289f7c] bg-[rgba(40,159,124,0.1)] px-[10.45px] py-[8.7px] revealed:animate-[rise_0.6s_var(--ease-soft)_0.1s_backwards]">
        <p className="text-[12.19px] leading-[1.2]">AI Confidence Score</p>
        <div className="flex max-w-[283.93px] items-center gap-[6.1px]">
          <i className="relative h-[4.36px] flex-1 overflow-hidden rounded-[87px] bg-[#ccc6c6] after:absolute after:inset-y-0 after:left-0 after:right-[7%] after:origin-left after:rounded-[87px] after:bg-[#289f7c] after:content-[''] revealed:after:animate-[fill-bar_1.2s_var(--ease-soft)_0.5s_backwards]" />
          <span className="text-[10.45px] text-[#289f7c]">98%</span>
        </div>
        <small className="max-w-[283.93px] text-[10.45px] leading-[1.2] text-[#878585]">Based on market analysis, price trends, and your trading history</small>
      </div>
      <div className="absolute left-[6.65px] top-[109.9px] flex h-[94.22px] w-[356.75px] flex-col justify-center gap-[8.7px] rounded-[8.7px] border-[0.435px] border-[#ff9500] bg-[rgba(255,149,0,0.1)] px-[10.45px] py-[8.7px] [transform:rotate(-4.61deg)_skewX(1.71deg)] revealed:animate-[rise_0.6s_var(--ease-soft)_0.35s_backwards]">
        <div className="flex max-w-[283.93px] items-start gap-[7.84px]">
          <span className="grid size-[26.13px] shrink-0 place-items-center rounded-[87px] bg-[#ffe0bb]"><img src={info} alt="" width="21" height="21" /></span>
          <div>
            <p className="text-[12.19px] leading-[1.2]">Strict Escrow Active</p>
            <small className="block text-[10.45px] leading-[1.2]">Your current P2P transaction requires additional verification due to high value and new counterparty.</small>
          </div>
        </div>
        <div className="flex gap-[8.7px] px-[29.6px]">
          {['Transaction Value: $1,250', 'New Trader'].map((t) => (
            <span key={t} className="whitespace-nowrap rounded-[87px] bg-[#ffe0bb] p-[6.1px] text-[8.71px] leading-none text-[#ee8200]">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    tab: 'Intelligent Chats',
    title: 'Intelligent Chat',
    copy: 'Ask anything about your account or crypto and get clear, relevant answers instantly, personalised to your goals and experience.',
    Visual: ChatVisual,
  },
  {
    tab: 'Smart Trade',
    title: 'Smart Trade',
    copy: 'AI analyses market trends, price movements, and risk signals to surface smarter opportunities that match your trading style.',
    Visual: TradeVisual,
  },
  {
    tab: 'Deep Analysis',
    title: 'Ai Deep Analysis',
    copy: 'Turn trading history and performance metrics into simple, actionable insights that help you refine your strategy over time.',
    Visual: AnalysisVisual,
  },
];

function FeatureCopy({ feature }) {
  return (
    <div className="flex w-[434px] flex-col gap-5 max-lg:w-full max-lg:max-w-[520px] max-lg:text-center">
      <h3 className="font-nunito text-[32px] font-bold leading-[1.2] text-ai-title">{feature.title}</h3>
      <p className="text-[15px] leading-[22.5px] text-text-soft">{feature.copy}</p>
    </div>
  );
}

const body = 'mx-auto flex max-w-[1030px] animate-[fade-in_0.35s_ease] items-center justify-between gap-12 max-lg:flex-col max-lg:gap-8';
const visual =
  'flex h-[350px] w-[520px] shrink-0 items-center justify-center overflow-hidden rounded-[30px] bg-ai-panel p-[26.58px] light:rounded-[53.165px] max-sm:[zoom:0.62]';
const TITLE = 'An AI co-pilot for every trade.';
const LEAD = 'Intelligent chat, smarter trades, and in-depth analytics, built right into the app.';

// Version 2: every feature shown at once, in alternating rows
function AiFeaturesV2() {
  return (
    <section className={section.alt} id="ai">
      <div className="site-container">
        <SectionHead className="mb-[60px]" title={TITLE} lead={LEAD} />
        <div className="flex flex-col gap-[60px]">
          {features.map((feature, i) => {
            const { Visual } = feature;
            return (
              <div className="reveal" key={feature.tab}>
                <div className={cx(body, i % 2 && 'lg:flex-row-reverse')}>
                  <div className={visual} aria-hidden="true"><Visual /></div>
                  <FeatureCopy feature={feature} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function AiFeatures() {
  const { version } = useVersion();
  return version === '2' ? <AiFeaturesV2 /> : <AiFeaturesTabs />;
}

function AiFeaturesTabs() {
  const [active, setActive] = useState(features[0].tab);
  const current = features.find((f) => f.tab === active);
  const { Visual } = current;

  return (
    <section className={section.alt} id="ai">
      <div className="site-container">
        <SectionHead
          eyebrow={<><ThinkingOrb state="solving" size={20} tint="#3d6ef0" />Mybitstore AI</>}
          eyebrowClass="mb-5 inline-flex items-center gap-2"
          title={TITLE}
          lead={LEAD}
        >
          <Tabs tabs={features.map((f) => f.tab)} active={active} onChange={setActive} label="Mybitstore AI features" idPrefix="ai-tab" />
        </SectionHead>
        <div className="reveal">
          <div className={body} role="tabpanel" aria-labelledby={'ai-tab-' + active} key={active}>
            <div className={visual} aria-hidden="true"><Visual /></div>
            <FeatureCopy feature={current} />
          </div>
        </div>
      </div>
    </section>
  );
}
