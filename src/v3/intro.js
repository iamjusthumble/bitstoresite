import { reducedMotion } from './motion.js';

// The opening curtain plays once per visit (per tab session). Decided once when the module loads,
// so the hero knows how long to wait before its own entrance.
const KEY = 'v3-intro-seen';
let seen = true;
try {
  seen = Boolean(sessionStorage.getItem(KEY)) || reducedMotion() || /capture/i.test(window.location.search);
} catch {
  seen = true;
}

export const introPlays = !seen;
export const INTRO_MS = 1500;
export const heroDelay = introPlays ? INTRO_MS - 250 : 120;
export const markIntroSeen = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // Without storage the intro simply plays again next time
  }
};
