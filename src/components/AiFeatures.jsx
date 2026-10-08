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

function ChatVisual() {
  return (
    <div className="ai-chat">
      <div className="ai-msg ai-msg-user">
        <div className="ai-bubble ai-bubble-user">
          <p>Check my balance</p>
          <time>01: 00 PM</time>
        </div>
        <img className="ai-avatar" src={user} alt="" width="32" height="32" />
      </div>
      <div className="ai-msg">
        <span className="ai-avatar ai-avatar-bot"><img src={bot} alt="" /></span>
        <span className="ai-typing"><ThinkingOrb state="composing" size={20} tint="#2f60e0" /></span>
        <div className="ai-bubble ai-bubble-bot">
          <p>
            Here's your current wallet balance:<br /><br />
            • BTC: 0.0342 ($1,456.80)<br />
            • ETH: 1.234 ($2,890.50)<br />
            • USDT: 5,000.00<br /><br />
            Total Portfolio Value: $9,347.30<br /><br />
            Your balance increased by 12.3% this week.<br /><br />
            Great job! 🎉
          </p>
          <time>01: 00 PM</time>
        </div>
      </div>
    </div>
  );
}

function TradeVisual() {
  return (
    <div className="ai-chart">
      <div className="ai-chart-plot">
        {[14.43, 60.54, 105.29, 151.4, 196.16].map((top) => (
          <img key={top} className="ai-chart-grid" src={gridline} alt="" style={{ top }} />
        ))}
        <div className="ai-chart-line">
          <img src={chartPath} alt="" />
        </div>
        <div className="ai-chart-tip">
          <span>Mon, Jan 26, 2026, 10:30</span>
          <strong>$37,134.60</strong>
        </div>
        <img className="ai-chart-dot" src={chartDot} alt="" width="11" height="11" />
      </div>
      <div className="ai-chart-range">
        <span className="is-active">24H</span>
        <span>1 W</span>
        <span>1 M</span>
        <span>1 Y</span>
        <span>All</span>
      </div>
    </div>
  );
}

function AnalysisVisual() {
  return (
    <div className="ai-analysis">
      <div className="ai-score">
        <p>AI Confidence Score</p>
        <div className="ai-score-bar"><i /><span>98%</span></div>
        <small>Based on market analysis, price trends, and your trading history</small>
      </div>
      <div className="ai-escrow">
        <div className="ai-escrow-head">
          <span className="ai-escrow-icon"><img src={info} alt="" width="21" height="21" /></span>
          <div>
            <p>Strict Escrow Active</p>
            <small>Your current P2P transaction requires additional verification due to high value and new counterparty.</small>
          </div>
        </div>
        <div className="ai-escrow-tags">
          <span>Transaction Value: $1,250</span>
          <span>New Trader</span>
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
    <div className="ai-copy">
      <h3>{feature.title}</h3>
      <p>{feature.copy}</p>
    </div>
  );
}

// Version 2: every feature shown at once, in alternating rows
function AiFeaturesV2() {
  return (
    <section className="section section-alt ai ai-v2" id="ai">
      <div className="container">
        <div className="section-head reveal">
          <h2>An AI co-pilot for every trade.</h2>
          <p className="lead">Intelligent chat, smarter trades, and in-depth analytics, built right into the app.</p>
        </div>
        <div className="ai-rows">
          {features.map((feature, i) => {
            const { Visual } = feature;
            return (
              <div className="ai-stage reveal" key={feature.tab}>
                <div className={'ai-body' + (i % 2 ? ' is-reversed' : '')}>
                  <div className="ai-visual" aria-hidden="true"><Visual /></div>
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
    <section className="section section-alt ai" id="ai">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow eyebrow-orb"><ThinkingOrb state="solving" size={20} tint="#3d6ef0" />Mybitstore AI</span>
          <h2>An AI co-pilot for every trade.</h2>
          <p className="lead">Intelligent chat, smarter trades, and in-depth analytics, built right into the app.</p>
          <Tabs tabs={features.map((f) => f.tab)} active={active} onChange={setActive} label="Mybitstore AI features" idPrefix="ai-tab" />
        </div>
        <div className="ai-stage reveal">
        <div className="ai-body" role="tabpanel" aria-labelledby={'ai-tab-' + active} key={active}>
          <div className="ai-visual" aria-hidden="true"><Visual /></div>
          <FeatureCopy feature={current} />
        </div>
        </div>
      </div>
    </section>
  );
}
