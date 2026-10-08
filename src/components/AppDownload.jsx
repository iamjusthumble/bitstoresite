import React from 'react';
import glow from '../assets/glow-ellipse.svg';
import glowLight from '../assets/glow-ellipse-light.svg';
import hand from '../assets/app-hand.png';
import screen from '../assets/app-screen.png';
import screenLight from '../assets/app-screen-light.png';
import btc from '../assets/coin-btc-large.svg';
import { QrCard } from './Hero.jsx';
import ThemedImg from './ThemedImg.jsx';

export default function AppDownload() {
  return (
    <section className="app-download" id="download">
      <ThemedImg className="app-glow" dark={glow} light={glowLight} width="1765" height="441" aria-hidden="true" />
      <div className="app-copy reveal">
        <div className="app-text">
          <h2>Trade Crypto with<br /><span>Confidence</span></h2>
          <p>Get insights, tools, and trades - all in the Mybitstore app</p>
        </div>
        <div className="app-qr">
          <QrCard size="lg" />
          <p>Scan the QR Code to Download</p>
        </div>
      </div>

      <div className="app-art reveal" role="img" aria-label="Hand holding a phone running the Mybitstore app">
        <div className="app-hand"><img src={hand} alt="" loading="lazy" /></div>
        {/* The screen export is rectangular; this rotated rounded box clips it to the phone's display */}
        <div className="app-screen">
          <div className="app-screen-clip"><ThemedImg dark={screen} light={screenLight} loading="lazy" /></div>
        </div>
        <div className="app-float app-balance"><p>$4,614.90</p></div>
        <div className="app-float app-btc">
          <div className="app-btc-row">
            <div className="app-btc-coin">
              <img src={btc} alt="" width="30.6" height="30.6" />
              <div>
                <strong>BTC</strong>
                <span>Bitcoin</span>
              </div>
            </div>
            <div className="app-btc-price">
              <strong>28,798.00</strong>
              <span>$28,788.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
