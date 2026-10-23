// Gift card catalogue for the web app preview (PRD "Mybitstore Gift Cards: Buy and Sell", GC screens).
// Everything here stands in for server-driven data: brands, countries, denominations, stock, buy prices and
// sell rates are sample values until the supplier API and the admin console exist.
// Card art is the brands' real gift card faces (fetched from Bitrefill's product CDN); swap for the supplier's art at launch.

export const gcHref = (...parts) => `#gift-cards${parts.filter(Boolean).map((p) => `/${p}`).join('')}`;

const art = import.meta.glob('../../assets/gift-cards/*.webp', { eager: true, import: 'default' });
const artFor = (id) => art[`../../assets/gift-cards/${id}.webp`];

export const CATEGORIES = [
  ['all', 'All'],
  ['shopping', 'Shopping'],
  ['gaming', 'Gaming'],
  ['entertainment', 'Entertainment'],
  ['food', 'Food'],
  ['travel', 'Travel'],
  ['apps', 'App stores'],
];

export const COUNTRIES = {
  US: { name: 'United States', short: 'US', currency: 'USD', symbol: '$' },
  UK: { name: 'United Kingdom', short: 'UK', currency: 'GBP', symbol: '£' },
  CA: { name: 'Canada', short: 'Canada', currency: 'CAD', symbol: 'C$' },
  AU: { name: 'Australia', short: 'Australia', currency: 'AUD', symbol: 'A$' },
  EU: { name: 'Euro area', short: 'Euro', currency: 'EUR', symbol: '€' },
};

// Sample exchange: what one unit of card currency costs in cedis when buying (margin included, no separate fee),
// and the market rate used to convert payouts to USDT
export const BUY_RATES = { USD: 12.6, GBP: 16.1, CAD: 9.2, AUD: 8.3, EUR: 13.7 };
export const GHS_PER_USD = 11.95;

// PRD open question 3: the default is margin only, so there is no service fee line. Set a value to show one.
export const BUY_SERVICE_FEE = 0;

export const LIMITS = {
  maxCartItems: 10,
  maxBuyQty: 5,
  maxSellQty: 10,
  maxOpenTrades: 5,
  dailyBuy: 10000,
  dailySell: 30000,
  newSellerCap: 3000,
  newSellerTrades: 3,
  draftHours: 24,
  cartDays: 7,
  needsInfoHours: 24,
  disputeHours: 72,
  rateLockMinutes: 30,
};

// Review hours (Africa/Accra is UTC+0 all year)
export const REVIEW_HOURS = [8, 22];
export const inReviewHours = (now = new Date()) => now.getUTCHours() >= REVIEW_HOURS[0] && now.getUTCHours() < REVIEW_HOURS[1];

// Brands that scammers ask victims to pay with: buying them as a gift shows a warning first
const SCAM_RISK = ['apple', 'google-play', 'steam', 'amazon'];

const steps = (...list) => list;

// `buy`: countries with denominations (chips), an optional custom range and stock by value (absent = plenty).
// `sell`: countries with a base rate (GH₵ per unit), card types, receipt rule, values and brand rules.
const BRANDS_RAW = [
  {
    id: 'netflix', name: 'Netflix', category: 'entertainment', featured: true,
    about: 'Pay for any Netflix plan without a card. The balance is used for your monthly membership.',
    redeemUrl: 'https://www.netflix.com/redeem',
    redeem: steps('Go to netflix.com/redeem.', 'Sign in, or create an account.', 'Enter the code and select Redeem.'),
    buy: { US: { denoms: [25, 30, 50, 100] }, UK: { denoms: [15, 25, 50] } },
  },
  {
    id: 'spotify', name: 'Spotify', category: 'entertainment', featured: true,
    about: 'Spotify Premium without a card: ad-free music and podcasts, offline listening.',
    redeemUrl: 'https://www.spotify.com/redeem',
    redeem: steps('Go to spotify.com/redeem.', 'Log in to your Spotify account.', 'Enter the code and select Redeem.'),
    buy: { US: { denoms: [10, 30, 60, 99] } },
  },
  {
    id: 'playstation', name: 'PlayStation', category: 'gaming', featured: true, slow: true,
    about: 'Add funds to your PlayStation wallet for games, add-ons and PlayStation Plus.',
    redeemUrl: 'https://store.playstation.com/',
    redeem: steps('Sign in on store.playstation.com or open PlayStation Store on your console.', 'Open your profile menu and choose Redeem codes.', 'Enter the code and confirm.'),
    buy: { US: { denoms: [10, 25, 50, 100], stock: { 100: 6 } } },
  },
  {
    id: 'xbox', name: 'Xbox', category: 'gaming', featured: true,
    about: 'Buy games, add-ons and Game Pass on Xbox and Windows.',
    redeemUrl: 'https://redeem.microsoft.com',
    redeem: steps('Go to redeem.microsoft.com.', 'Sign in with your Microsoft account.', 'Enter the 25-character code and select Next.'),
    buy: { US: { denoms: [15, 25, 50, 100], stock: { 100: 0 } }, UK: { denoms: [10, 25, 50] } },
  },
  {
    id: 'apple', name: 'Apple', category: 'apps', featured: true, pin: false,
    about: 'One card for apps, games, iCloud+, Apple Music and more from the App Store and Apple.',
    redeemUrl: 'https://apps.apple.com/redeem',
    redeem: steps('Open the App Store and tap your photo.', 'Tap Redeem Gift Card or Code.', 'Enter the code manually or use the camera.'),
    buy: { US: { denoms: [10, 25, 50, 100], custom: [10, 500] }, UK: { denoms: [10, 25, 50, 100] } },
    sell: {
      countries: { US: 11.2, UK: 14.2, CA: { rate: 8.1, paused: true } },
      types: ['physical', 'ecode'], receipt: 'none', values: [25, 50, 100, 200, 500], bands: [[25, 99], [100, 500]],
      code: { label: 'Apple code', pattern: /^X[A-Z0-9]{15}$/, groups: [4, 4, 4, 4], hint: '16 characters starting with X' },
      back: true, median: 9,
      rules: ['Card must be unused and not activated on any account', 'Scratch the code area fully and gently', 'Physical cards need a clear photo of the back with the code', 'Cards bought less than 12 hours ago are reviewed longer'],
    },
  },
  {
    id: 'google-play', name: 'Google Play', category: 'apps', featured: true,
    about: 'Apps, games, books and subscriptions on Google Play.',
    redeemUrl: 'https://play.google.com/redeem',
    redeem: steps('Go to play.google.com/redeem, or open the Play Store app.', 'Sign in with your Google account.', 'Enter the code and select Redeem.'),
    buy: { US: { denoms: [10, 25, 50, 100] } },
    sell: {
      countries: { US: 9.6 },
      types: ['physical', 'ecode'], receipt: 'none', values: [25, 50, 100, 200], bands: [[25, 99], [100, 200]],
      code: { label: 'Google Play code', pattern: /^[A-Z0-9]{16}([A-Z0-9]{4})?$/, groups: [4, 4, 4, 4, 4], hint: '16 or 20 letters and numbers' },
      back: true, median: 14,
      rules: ['Card must be unused', 'Photo must show the full code and the card value', 'US cards only'],
    },
  },
  {
    id: 'amazon', name: 'Amazon', category: 'shopping', featured: true,
    about: 'Shop millions of items on Amazon. The balance never expires.',
    redeemUrl: 'https://www.amazon.com/redeem',
    redeem: steps('Go to amazon.com/redeem.', 'Sign in to your Amazon account.', 'Enter the claim code and select Apply to your balance.'),
    buy: { US: { denoms: [25, 50, 100], custom: [5, 500] }, UK: { denoms: [10, 25, 50, 100] } },
    sell: {
      countries: { US: 10.4, UK: 13.1, CA: 7.4 },
      types: ['physical', 'ecode'], receipt: 'optional', values: [25, 50, 100, 200, 500], bands: [[25, 99], [100, 500]],
      code: { label: 'Claim code', pattern: /^[A-Z0-9]{14,15}$/, groups: [4, 6, 5], hint: '14 or 15 letters and numbers' },
      back: true, median: 12,
      rules: ['Card must be unused', 'A store receipt gets a better rate', 'Receipt must show the store name and date', 'Cards bought less than 24 hours ago are reviewed longer'],
    },
  },
  {
    id: 'steam', name: 'Steam', category: 'gaming', featured: true,
    about: 'Add funds to your Steam Wallet for games, software and hardware on Steam.',
    redeemUrl: 'https://store.steampowered.com/account/redeemwalletcode',
    redeem: steps('Go to store.steampowered.com/account/redeemwalletcode.', 'Sign in to Steam.', 'Enter the code and select Continue.'),
    buy: { US: { denoms: [20, 50, 100] } },
    sell: {
      countries: { US: 10.8, UK: 13.6, EU: 11.9 },
      types: ['physical', 'ecode'], receipt: 'none', range: [20, 500], bands: [[20, 99], [100, 500]],
      code: { label: 'Steam code', pattern: /^[A-Z0-9]{15}$/, groups: [5, 5, 5], hint: '15 letters and numbers' },
      median: 8,
      rules: ['Card must be unused', 'Make sure all 15 characters are readable', 'Wallet codes only, not game keys'],
    },
  },
  {
    id: 'uber', name: 'Uber', category: 'travel',
    about: 'Pay for Uber rides and Uber Eats orders in the US.',
    redeemUrl: 'https://www.uber.com/us/en/gift-cards/',
    redeem: steps('Open the Uber app and go to Wallet.', 'Tap Add Payment Method, then Gift Card.', 'Enter the code and tap Add.'),
    buy: { US: { denoms: [25, 50, 100] } },
  },
  {
    id: 'uber-eats', name: 'Uber Eats', category: 'food',
    about: 'Food delivery from local restaurants in the US.',
    redeemUrl: 'https://www.uber.com/us/en/gift-cards/',
    redeem: steps('Open the Uber Eats app and go to Wallet.', 'Tap Add Payment Method, then Gift Card.', 'Enter the code and tap Add.'),
    buy: { US: { denoms: [25, 50, 100] } },
  },
  {
    id: 'airbnb', name: 'Airbnb', category: 'travel',
    about: 'Stays and experiences anywhere Airbnb operates.',
    redeemUrl: 'https://www.airbnb.com/giftcards',
    redeem: steps('Sign in on airbnb.com and open Account.', 'Go to Payments, then Gift credit.', 'Select Add gift card and enter the code.'),
    buy: { US: { denoms: [50, 100, 200] } },
  },
  {
    id: 'nike', name: 'Nike', category: 'shopping',
    about: 'Shoes, clothing and gear on nike.com and in the Nike app.',
    redeemUrl: 'https://www.nike.com/gift-cards',
    redeem: steps('Shop on nike.com or in the Nike app (US).', 'At checkout choose Gift Card.', 'Enter the card number and PIN.'),
    buy: { US: { denoms: [25, 50, 100] } },
  },
  {
    id: 'roblox', name: 'Roblox', category: 'gaming', featured: true,
    about: 'Get Robux or a Roblox Premium subscription.',
    redeemUrl: 'https://www.roblox.com/redeem',
    redeem: steps('Go to roblox.com/redeem.', 'Log in to your Roblox account.', 'Enter the PIN and select Redeem.'),
    buy: { US: { denoms: [10, 25, 50] } },
  },
  {
    id: 'nintendo', name: 'Nintendo', category: 'gaming',
    about: 'Games and add-ons on the Nintendo eShop.',
    redeemUrl: 'https://ec.nintendo.com/redeem',
    redeem: steps('Go to ec.nintendo.com/redeem.', 'Sign in with your Nintendo Account.', 'Enter the 16-character code.'),
    buy: { US: { denoms: [20, 35, 50] } },
  },
  {
    id: 'fortnite', name: 'Fortnite', category: 'gaming',
    about: 'V-Bucks for outfits, emotes and the Battle Pass.',
    redeemUrl: 'https://www.fortnite.com/vbuckscard',
    redeem: steps('Go to fortnite.com/vbuckscard.', 'Sign in to your Epic Games account.', 'Enter the code and confirm.'),
    buy: { US: { denoms: [10, 25, 50] } },
  },
  {
    id: 'starbucks', name: 'Starbucks', category: 'food',
    about: 'Coffee and food at Starbucks in the US.',
    redeemUrl: 'https://www.starbucks.com/card',
    redeem: steps('Open the Starbucks app or starbucks.com.', 'Go to Cards and choose Add a card.', 'Enter the card number and security code.'),
    buy: { US: { denoms: [10, 25, 50] } },
  },
  {
    id: 'twitch', name: 'Twitch', category: 'entertainment',
    about: 'Subscribe to channels and cheer with Bits on Twitch.',
    redeemUrl: 'https://www.twitch.tv/redeem',
    redeem: steps('Go to twitch.tv/redeem.', 'Log in to Twitch.', 'Enter the code and select Redeem.'),
    buy: { US: { denoms: [25, 50, 100] } },
  },
  {
    id: 'walmart', name: 'Walmart', category: 'shopping',
    about: 'Shop at walmart.com and Walmart stores in the US.',
    redeemUrl: 'https://www.walmart.com/account/giftcards',
    redeem: steps('Sign in on walmart.com.', 'Go to Account, then Gift cards.', 'Add the card number and PIN.'),
    buy: { US: { denoms: [25, 50, 100] } },
    sell: {
      countries: { US: 9.9 },
      types: ['physical'], receipt: 'required', values: [50, 100, 200, 500], bands: [[50, 99], [100, 500]],
      back: true, median: 18,
      rules: ['Physical cards only', 'A store receipt is required', 'Scratch the PIN area fully', 'Photo must show the card number and PIN'],
    },
  },
  {
    id: 'target', name: 'Target', category: 'shopping',
    about: 'Shop at target.com and Target stores in the US.',
    redeemUrl: 'https://www.target.com/gift-cards',
    redeem: steps('Shop on target.com or in the Target app.', 'At checkout choose Gift card.', 'Enter the card number and access number.'),
    buy: { US: { denoms: [25, 50, 100] } },
  },
  {
    id: 'hulu', name: 'Hulu', category: 'entertainment',
    paused: 'Our supplier is restocking Hulu cards. Check back soon.',
    about: 'Stream TV and movies on Hulu in the US.',
    buy: { US: { denoms: [25, 50] } },
  },
  {
    id: 'razer-gold', name: 'Razer Gold', category: 'gaming',
    sell: {
      countries: { US: 10.9 },
      types: ['ecode'], receipt: 'none', values: [10, 20, 50, 100, 200], bands: [[10, 49], [50, 200]],
      code: { label: 'PIN', pattern: /^[A-Z0-9]{14}$/, groups: [5, 5, 4], hint: '14 letters and numbers' }, serial: true,
      median: 7,
      rules: ['E-codes only', 'Include the serial number and the PIN', 'Global or US cards only'],
    },
  },
  {
    id: 'sephora', name: 'Sephora', category: 'shopping',
    sell: {
      countries: { US: 9.2 },
      types: ['physical'], receipt: 'required', values: [25, 50, 100, 200], bands: [[25, 99], [100, 200]],
      back: true, median: 25,
      rules: ['Physical cards only', 'A store receipt is required', 'Scratch the PIN area fully'],
    },
  },
  {
    id: 'nordstrom', name: 'Nordstrom', category: 'shopping',
    sell: {
      notBuying: true,
      countries: { US: 8.8 },
      types: ['physical'], receipt: 'required', values: [50, 100, 200], bands: [[50, 200]],
      rules: ['Physical cards only', 'A store receipt is required'],
    },
  },
  {
    id: 'ebay', name: 'eBay', category: 'shopping',
    sell: {
      countries: { US: 9.4 },
      types: ['physical', 'ecode'], receipt: 'none', values: [25, 50, 100, 200], bands: [[25, 99], [100, 200]],
      code: { label: 'Redemption code', pattern: /^[A-Z0-9]{13}$/, groups: [4, 4, 5], hint: '13 letters and numbers' },
      back: true, median: 16,
      rules: ['Card must be unused', 'Photo must show the full redemption code'],
    },
  },
  {
    id: 'mastercard', name: 'Mastercard prepaid', category: 'shopping',
    sell: {
      countries: { US: 10.1 },
      types: ['physical'], receipt: 'required', values: [50, 100, 200, 500], bands: [[50, 99], [100, 500]],
      back: true, median: 22,
      rules: ['Physical cards only', 'A purchase receipt is required', 'Card must be activated and unused', 'Photo must show the card number; cover nothing'],
    },
  },
];

export const BRANDS = BRANDS_RAW.map((b) => ({ ...b, art: artFor(b.id), scamRisk: SCAM_RISK.includes(b.id) }));
export const brandById = Object.fromEntries(BRANDS.map((b) => [b.id, b]));
export const BUY_BRANDS = BRANDS.filter((b) => b.buy);
export const SELL_BRANDS = BRANDS.filter((b) => b.sell).sort((a, b) => a.name.localeCompare(b.name));
export const categoryName = Object.fromEntries(CATEGORIES);

// Money

const ghsFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const ghs = (value) => `GH₵ ${ghsFormat.format(Math.round((value || 0) * 100) / 100)}`;
export const ghsRate = (value) => `GH₵ ${value.toFixed(2)}`;
export const usdt = (value) => `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} USDT`;

// Face value in the card's own currency: "$50", "£25", "C$100"
export const face = (country, value) => `${COUNTRIES[country].symbol}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}`;

// Buying

export const buyPrice = (country, value) => Math.round(value * BUY_RATES[COUNTRIES[country].currency] * 100) / 100;

export function buyCountries(brand) {
  return Object.keys(brand.buy || {});
}

// Smallest price across countries, for "From GH₵ …"
export function fromPrice(brand) {
  return Math.min(...buyCountries(brand).map((c) => buyPrice(c, Math.min(...brand.buy[c].denoms, ...(brand.buy[c].custom ? [brand.buy[c].custom[0]] : [])))));
}

// Units left at a value: Infinity when the supplier reports plenty
export const stockFor = (brand, country, value) => brand.buy?.[country]?.stock?.[value] ?? Infinity;

// Selling

export const CARD_TYPES = { physical: 'Physical card', ecode: 'E-code' };

export const sellCountries = (brand) => Object.keys(brand.sell.countries);
const countryEntry = (brand, country) => {
  const entry = brand.sell.countries[country];
  return typeof entry === 'number' ? { rate: entry } : entry;
};
export const countryPaused = (brand, country) => Boolean(countryEntry(brand, country)?.paused);

// Receipt changes the rate only for brands where it's optional; where it's required the base rate already assumes one
export const receiptMatters = (brand) => brand.sell.receipt === 'optional';

// Which value band a face value falls in, or -1 when it isn't bought
export const bandIndex = (brand, value) => brand.sell.bands.findIndex(([lo, hi]) => value >= lo && value <= hi);

// GH₵ per unit for a full configuration (brand × country × type × receipt × band). Sample multipliers:
// e-codes and small values pay a little less, a receipt pays a little more.
export function sellRate(brand, { country, type, receipt, value }) {
  const entry = countryEntry(brand, country);
  if (!entry) return 0;
  let rate = entry.rate;
  if (type === 'ecode') rate *= 0.96;
  if (receiptMatters(brand)) rate *= receipt === 'with' ? 1.04 : 0.97;
  const band = value ? bandIndex(brand, value) : brand.sell.bands.length - 1;
  if (band === 0 && brand.sell.bands.length > 1) rate *= 0.97;
  return Math.round(rate * 100) / 100;
}

// The best rate a brand pays, for "Up to GH₵ …/$"
export function bestRate(brand, country) {
  const countries = country ? [country] : sellCountries(brand).filter((c) => !countryPaused(brand, c) && COUNTRIES[c].currency === 'USD');
  const rates = countries.flatMap((c) => brand.sell.types.map((type) => sellRate(brand, { country: c, type, receipt: 'with' })));
  return rates.length ? Math.max(...rates) : 0;
}

export const unitLabel = (country) => `/${COUNTRIES[country].symbol}`;

// Codes are kept as plain upper-case letters and digits; this groups them for display (Apple: XXXX XXXX XXXX XXXX)
export const cleanCode = (raw) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
export function groupCode(code, groups = [4, 4, 4, 4]) {
  const parts = [];
  let at = 0;
  for (const size of groups) {
    if (at >= code.length) break;
    parts.push(code.slice(at, at + size));
    at += size;
  }
  if (at < code.length) parts.push(code.slice(at));
  return parts.join(' ');
}
// After submission only the first 4 and last 4 characters are shown
export const maskCode = (code) => (code.length > 8 ? `${code.slice(0, 4)} •••• ${code.slice(-4)}` : '••••');

// Reason codes shown to users (fixed list from the PRD)
export const REASONS = {
  redeemed: 'Card already redeemed',
  invalid: 'Code invalid',
  unreadable: 'Code not readable',
  country: 'Wrong country',
  type: 'Wrong card type',
  value: 'Value differs from submitted',
  receiptMissing: 'Receipt missing',
  receiptUnclear: 'Receipt unclear',
  stolen: 'Card reported stolen',
  duplicate: 'Duplicate submission',
  other: 'Other',
};
