// Sample account for the web app preview. No account backend is connected yet, so the balance,
// holdings and activity below are placeholders taken from the Figma design. Token prices are live.

// USD value held per coin in the wallet (ids match COINS in marketData.js)
export const HOLDINGS = [
  { id: 'bitcoin', value: 236.88 },
  { id: 'litecoin', value: 144.19 },
  { id: 'ethereum', value: 444.15 },
  { id: 'tether', value: 908.02 },
];

// The total is the wallet's holdings plus the P2P balance, so every figure on screen adds up
export const WALLET_BALANCE = HOLDINGS.reduce((sum, h) => sum + h.value, 0);
export const P2P_BALANCE = 1467.56;
export const BALANCE = Math.round((WALLET_BALANCE + P2P_BALANCE) * 100) / 100;

export const ACTIVITIES = [
  { id: 1, type: 'Deposit', status: 'Completed', amount: 3.32899, symbol: 'ETH', usd: 10288.96 },
  { id: 2, type: 'Withdrawal', status: 'Pending', amount: -1.32899, symbol: 'ETH', usd: 4109.96 },
  { id: 3, type: 'Deposit', status: 'Completed', amount: 0.3289, symbol: 'BTC', usd: 20844.46 },
];

// Starting list of saved payment accounts (see paymentAccounts.jsx), following the Figma rows (provider, account type and the
// placeholder name "Ken Socials"). The numbers are made up; added, edited and deleted accounts are kept in this browser.
export const SAMPLE_PAYMENT_ACCOUNTS = [
  { id: 'pm-1', provider: 'mtn', number: '0232023202', holder: 'Ken Socials', type: 'sell' },
  { id: 'pm-2', provider: 'telecel', number: '0201234567', holder: 'Ken Socials', type: 'buy' },
  { id: 'pm-3', provider: 'at', number: '0271234567', holder: 'Ken Socials', type: 'both' },
  { id: 'pm-4', provider: 'mtn', number: '0241234567', holder: 'Ken Socials', type: 'sell' },
  { id: 'pm-5', provider: 'at', number: '0261234567', holder: 'Ken Socials', type: 'both' },
  { id: 'pm-6', provider: 'mtn', number: '0551234567', holder: 'Ken Socials', type: 'sell' },
  { id: 'pm-7', provider: 'telecel', number: '0501234567', holder: 'Ken Socials', type: 'buy' },
  { id: 'pm-8', provider: 'at', number: '0571234567', holder: 'Ken Socials', type: 'both' },
];

// Sample deposit addresses, one per network. Each is malformed on purpose (wrong characters, no valid checksum)
// so a wallet rejects it: nothing real is behind this preview, and nobody should be able to send funds to one.
export const DEPOSIT_ADDRESSES = {
  bitcoin: 'bc1qreffisyihy8973hd8y9ss8dyihabd8ad8ytshgusucucg',
  ethereum: '0xsampleaddresspreviewonly00000000000000000',
  tron: 'TsampleAddressPreviewOnly0000000000',
  litecoin: 'ltc1qsampleaddresspreviewonlyio0000000000000',
  'bitcoin-cash': 'bitcoincash:qsampleaddresspreviewonlyio00000000000000',
};

// Placeholder fee from the Figma preview (1.00 USD on a 100 USD purchase), not the real fee schedule.
// Added to a purchase and taken out of a sale.
export const ORDER_FEE_RATE = 0.01;

const DAY = 86400000;

// Each period ends at the current balance; `start` sets the change shown beside it
const PERIODS = {
  'All time': { span: 150 * DAY, points: 41, start: 1724.01, waves: 1.75, phase: -0.6, amp: 0.2, tick: { month: 'short' } },
  Week: { span: 7 * DAY, points: 29, start: 3068.4, waves: 2.5, phase: 0.4, amp: 0.02, tick: { weekday: 'short' }, time: true },
  Month: { span: 30 * DAY, points: 31, start: 2874.15, waves: 2, phase: 1.1, amp: 0.05, tick: { month: 'short', day: 'numeric' } },
  Year: { span: 365 * DAY, points: 49, start: 1980.5, waves: 3, phase: -0.2, amp: 0.16, tick: { month: 'short' } },
};

export const PERIOD_NAMES = Object.keys(PERIODS);

const TICK_POSITIONS = [0.1, 0.3, 0.5, 0.7, 0.9];

// A smooth, repeatable curve from `start` to the balance (no randomness, so it never jumps on re-render)
export function balanceSeries(period, now = Date.now()) {
  const p = PERIODS[period];
  const points = Array.from({ length: p.points }, (_, i) => {
    const t = i / (p.points - 1);
    const trend = p.start + (BALANCE - p.start) * t;
    const wave = Math.sin(t * Math.PI * 2 * p.waves + p.phase) * Math.sin(t * Math.PI) ** 0.7;
    return { time: now - p.span * (1 - t), value: Math.round((trend + wave * BALANCE * p.amp) * 100) / 100 };
  });
  points[points.length - 1].value = BALANCE;
  const format = new Intl.DateTimeFormat('en-US', p.tick);
  return {
    points,
    showTime: Boolean(p.time),
    change: ((BALANCE - points[0].value) / points[0].value) * 100,
    ticks: TICK_POSITIONS.map((at) => ({ at, label: format.format(now - p.span * (1 - at)) })),
  };
}

// Bar chart on My assets: one bar per day (or month), ending on the current balance
const BAR_PERIODS = {
  'Last 7 days': { bars: 7, step: DAY, label: { weekday: 'short' }, every: 1, waves: 1.6, phase: 0.9 },
  'Last 30 days': { bars: 30, step: DAY, label: { day: 'numeric' }, every: 5, waves: 3.2, phase: 2.1 },
  'Last 12 months': { bars: 12, step: 30.4 * DAY, label: { month: 'short' }, every: 1, waves: 2.2, phase: 0.2 },
};

export const BAR_PERIOD_NAMES = Object.keys(BAR_PERIODS);

export function balanceBars(period, now = Date.now()) {
  const p = BAR_PERIODS[period];
  const format = new Intl.DateTimeFormat('en-US', p.label);
  // One extra leading value so the first bar can also be compared with the day before it
  const values = Array.from({ length: p.bars + 1 }, (_, i) => {
    const t = i / p.bars;
    const wave = Math.sin(t * Math.PI * 2 * p.waves + p.phase) * 0.5 + Math.sin(t * Math.PI * 5.3 + p.phase * 2) * 0.2;
    return Math.round(BALANCE * (0.62 + 0.3 * wave * (1 - t * 0.6) + 0.38 * t ** 1.5) * 100) / 100;
  });
  values[p.bars] = BALANCE;
  return values.slice(1).map((value, i) => {
    const time = now - (p.bars - 1 - i) * p.step;
    return { time, value, up: value >= values[i], label: (p.bars - 1 - i) % p.every === 0 ? format.format(time) : '' };
  });
}

// Sample profile and settings for the Settings page. The name matches the sample payment holder used before;
// the email is a placeholder. All of it lives in this browser until there is an account backend.
export const SAMPLE_PROFILE = {
  firstName: 'Johnathan',
  lastName: 'Doe',
  email: 'johnathan.doe@example.com',
  avatar: null,
  country: 'GH',
  city: '',
  state: '',
  street: '',
  zip: '',
};

// As in the Figma: the authenticator is on, email and text-message codes are off
export const SAMPLE_SECURITY = { authenticator: true, authenticatorSecret: null, email: false, phone: false, phoneNumber: '' };

// As in the Figma: withdrawal and trade alerts on, incoming funds and login alerts off
export const SAMPLE_ALERTS = { incoming: false, withdrawal: true, trades: true, login: false };

export const SAMPLE_VERIFICATION = { email: 'verified', phone: 'none', identity: 'none', document: null };
