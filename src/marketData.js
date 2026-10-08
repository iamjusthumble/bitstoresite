import { useEffect, useState } from 'react';
import btc from './assets/coin-btc.svg';
import eth from './assets/coin-eth.svg';
import usdt from './assets/coin-usdt.svg';
import usdc from './assets/coin-usdc.svg';
import trx from './assets/coin-trx.svg';
import ltc from './assets/coin-ltc.svg';
import bch from './assets/coin-bch.svg';

// Coins supported in the Mybitstore app
export const COINS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: btc },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: eth },
  { id: 'tether', name: 'Tether', symbol: 'USDT', icon: usdt, stable: true },
  { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', icon: usdc, stable: true },
  { id: 'tron', name: 'Tron', symbol: 'TRX', icon: trx },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', icon: ltc },
  { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH', icon: bch },
];

const URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=true&price_change_percentage=24h&ids=' +
  COINS.map((c) => c.id).join(',');
const REFRESH_MS = 60000;

// One shared poller so every component on the page reuses the same request
let state = { status: 'loading', coins: {} };
const listeners = new Set();
let timer = null;

function setState(next) {
  state = next;
  listeners.forEach((fn) => fn(state));
}

function load() {
  fetch(URL)
    .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
    .then((rows) => {
      const coins = {};
      for (const row of rows) {
        coins[row.id] = {
          price: row.current_price,
          change: row.price_change_percentage_24h,
          image: row.image,
          // Last 24 hourly points, matching the 24h change shown next to the chart
          spark: (row.sparkline_in_7d?.price || []).slice(-24),
        };
      }
      setState({ status: 'ready', coins });
    })
    // Keep the last good data if a refresh fails
    .catch(() => state.status !== 'ready' && setState({ status: 'error', coins: {} }));
}

export function useMarketData() {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    if (!timer) {
      load();
      timer = setInterval(load, REFRESH_MS);
    }
    return () => {
      listeners.delete(setSnapshot);
      if (!listeners.size) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return snapshot;
}

export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

export function formatChange(value) {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}
