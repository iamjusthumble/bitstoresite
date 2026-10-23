import React from 'react';
import BuyBrand from './BuyBrand.jsx';
import Checkout from './Checkout.jsx';
import Hub from './Hub.jsx';
import MyCards from './MyCards.jsx';
import OrderPage from './OrderPage.jsx';
import Rates from './Rates.jsx';
import Sell from './Sell.jsx';
import TradePage from './TradePage.jsx';
import { brandById, gcHref } from './catalog.js';
import { OfflineBanner, Toaster } from './ui.jsx';

// Gift cards in the web app (PRD GC01–GC11). Routes follow the PRD's deep links under #gift-cards:
//   #gift-cards[/buy|/sell]           GC01 hub, on the last tab used or the one named
//   #gift-cards/buy/<brand>           GC02 brand detail
//   #gift-cards/checkout[/now]        GC03 cart, or a single "Buy now" item
//   #gift-cards/order/<id>            GC04 order and codes
//   #gift-cards/sell/new              GC05 choose a brand to sell
//   #gift-cards/sell/<brand>[/cards|/review]   GC06–GC08
//   #gift-cards/trade/<id>            GC09 trade detail
//   #gift-cards/mine[/sold]           GC10 my gift cards
//   #gift-cards/rates[/<brand>]       GC11 rates

// Hub tabs have the page title; everything deeper shows Back
export const gcNested = (parts) => parts.length > 0 && !(parts.length === 1 && ['buy', 'sell'].includes(parts[0]));

export function gcTitle(parts) {
  const [a, b] = parts;
  if (a === 'buy' && brandById[b]) return `${brandById[b].name} gift card`;
  if (a === 'checkout') return 'Checkout';
  if (a === 'order') return 'Gift card order';
  if (a === 'sell' && b) return 'Sell a gift card';
  if (a === 'trade') return 'Trade details';
  if (a === 'mine') return 'My gift cards';
  if (a === 'rates') return 'Gift card rates';
  return 'Gift cards';
}

// Where Back goes when the page was opened directly
export function gcParent(parts) {
  const [a] = parts;
  if (a === 'order' || a === 'trade') return gcHref('mine', a === 'trade' && 'sold');
  if (a === 'sell' || a === 'rates') return gcHref('sell');
  return gcHref('buy');
}

export default function GiftCards({ parts }) {
  const [a, b, c] = parts;
  let page;
  if (a === 'buy' && brandById[b]?.buy) page = <BuyBrand key={b} brand={brandById[b]} />;
  else if (a === 'checkout') page = <Checkout now={b === 'now'} />;
  else if (a === 'order') page = <OrderPage id={b} />;
  else if (a === 'sell' && (b === 'new' || brandById[b]?.sell)) page = <Sell brandId={b === 'new' ? null : b} step={b === 'new' ? 'brand' : c === 'cards' ? 'cards' : c === 'review' ? 'review' : 'details'} />;
  else if (a === 'trade') page = <TradePage id={b} />;
  else if (a === 'mine') page = <MyCards segment={b === 'sold' ? 'sold' : 'bought'} />;
  else if (a === 'rates') page = <Rates key={b || 'apple'} brandId={brandById[b]?.sell ? b : null} />;
  else page = <Hub tab={a === 'buy' || a === 'sell' ? a : null} />;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <OfflineBanner />
      {page}
      <Toaster />
    </div>
  );
}
