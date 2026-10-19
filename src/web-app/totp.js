// Time-based one-time codes (RFC 6238), the kind Google Authenticator shows: 6 digits, 30-second steps, SHA-1.
// Used to check the code typed while setting up the authenticator. With no backend yet, the secret stays in this browser.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function newSecret(length = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % 32]).join('');
}

function base32ToBytes(secret) {
  let bits = '';
  for (const char of secret.replace(/=+$/, '').toUpperCase()) bits += ALPHABET.indexOf(char).toString(2).padStart(5, '0');
  return new Uint8Array(bits.match(/.{8}/g).map((byte) => parseInt(byte, 2)));
}

async function codeAt(secret, step) {
  const key = await crypto.subtle.importKey('raw', base32ToBytes(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const counter = new ArrayBuffer(8);
  new DataView(counter).setUint32(4, step);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, counter));
  const offset = mac[mac.length - 1] & 0xf;
  const value = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(value % 1e6).padStart(6, '0');
}

// Accepts the current code and the ones either side of it, to allow for a slow typist or a clock that drifts
export async function checkCode(secret, code, now = Date.now()) {
  const step = Math.floor(now / 30000);
  const codes = await Promise.all([step - 1, step, step + 1].map((s) => codeAt(secret, s)));
  return codes.includes(code);
}

export const otpauthUri = (secret, account) =>
  `otpauth://totp/${encodeURIComponent(`Mybitstore:${account}`)}?secret=${secret}&issuer=Mybitstore&algorithm=SHA1&digits=6&period=30`;

// Groups of four are easier to type into an authenticator app
export const spacedSecret = (secret) => secret.match(/.{1,4}/g).join(' ');
