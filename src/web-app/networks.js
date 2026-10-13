// Networks a coin can be sent on, with a format check for addresses on each.
// The checks catch typos and wrong-network pastes; they do not prove an address exists.
const BASE58 = '[1-9A-HJ-NP-Za-km-z]';

export const NETWORKS = {
  bitcoin: { name: 'Bitcoin', test: new RegExp(`^(bc1[a-z0-9]{25,62}|[13]${BASE58}{25,34})$`) },
  ethereum: { name: 'Ethereum', tag: 'ERC-20', test: /^0x[a-fA-F0-9]{40}$/ },
  tron: { name: 'Tron', tag: 'TRC-20', test: new RegExp(`^T${BASE58}{33}$`) },
  litecoin: { name: 'Litecoin', test: new RegExp(`^(ltc1[a-z0-9]{25,62}|[LM3]${BASE58}{26,33})$`) },
  'bitcoin-cash': { name: 'Bitcoin Cash', test: new RegExp(`^((bitcoincash:)?[qp][a-z0-9]{41}|[13]${BASE58}{25,34})$`) },
};

// Keyed by coin id (see COINS in marketData.js). Stablecoins exist on more than one network,
// so the buyer has to pick: sending on the wrong one loses the funds.
const COIN_NETWORKS = {
  tether: ['tron', 'ethereum'],
  'usd-coin': ['ethereum', 'tron'],
};

export const networksFor = (coin) => (COIN_NETWORKS[coin.id] || [coin.id]).map((id) => ({ id, ...NETWORKS[id] }));

export const networkLabel = (network) => (network.tag ? `${network.name} (${network.tag})` : network.name);
