import { useEffect, useState } from 'react';

const API = 'https://api.coingecko.com/api/v3/coins/';
const FRESH_MS = 5 * 60000;
const MAX_POINTS = 160;

// Chart ranges offered on the token page; `days` is what CoinGecko's market_chart expects
export const RANGES = [
  { key: '1D', label: 'past day', days: 1, tick: { hour: 'numeric' }, showTime: true },
  { key: '1W', label: 'past week', days: 7, tick: { weekday: 'short' }, showTime: true },
  { key: '1M', label: 'past month', days: 30, tick: { month: 'short', day: 'numeric' } },
  { key: '1Y', label: 'past year', days: 365, tick: { month: 'short' } },
];

const cache = new Map();

// Fetches JSON once per key and reuses it for a few minutes, so switching tokens and ranges is instant
function useRemote(key, url, parse) {
  const [state, setState] = useState({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < FRESH_MS) {
      setState(hit.state);
      return undefined;
    }
    let live = true;
    setState({ status: 'loading' });
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((json) => {
        const next = { status: 'ready', data: parse(json) };
        cache.set(key, { at: Date.now(), state: next });
        if (live) setState(next);
      })
      .catch(() => live && setState({ status: 'error' }));
    return () => {
      live = false;
    };
  }, [key, attempt]);

  return [state, () => setAttempt((n) => n + 1)];
}

const TICK_POSITIONS = [0.1, 0.3, 0.5, 0.7, 0.9];

// Price history for one coin and range, thinned to a drawable number of points
export function useTokenChart(id, range) {
  return useRemote(`chart:${id}:${range.key}`, `${API}${id}/market_chart?vs_currency=usd&days=${range.days}`, (json) => {
    const prices = json.prices || [];
    const stride = Math.max(1, Math.ceil(prices.length / MAX_POINTS));
    // Walk back from the newest price so the latest value is always kept
    const points = [];
    for (let i = prices.length - 1; i >= 0; i -= stride) points.unshift({ time: prices[i][0], value: prices[i][1] });
    if (points.length < 2) throw new Error('No price history');
    const format = new Intl.DateTimeFormat('en-US', range.tick);
    return {
      points,
      showTime: Boolean(range.showTime),
      change: ((points[points.length - 1].value - points[0].value) / points[0].value) * 100,
      ticks: TICK_POSITIONS.map((at) => ({ at, label: format.format(points[Math.round(at * (points.length - 1))].time) })),
    };
  });
}

function plainText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').split(/\n\s*\n|\r\n\s*\r\n/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

// The coin's description, as paragraphs of plain text
export function useTokenAbout(id) {
  return useRemote(
    `about:${id}`,
    `${API}${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
    (json) => plainText(json.description?.en || ''),
  );
}
