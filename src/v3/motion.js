import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

// The V3 motion engine. One requestAnimationFrame loop drives everything: Lenis smooths the scroll,
// then every registered element gets its scroll progress written to a CSS variable (`--p`, 0 → 1).
// Styles do the rest with calc(), so React never re-renders on scroll.

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const tracked = new Set();
let lenis = null;
let running = false;
let lastY = -1;
let lastW = 0;
let lastH = 0;

// How far through its scroll range an element is, by mode:
//   through – from its top entering at the bottom to its bottom leaving at the top
//   enter   – from its top at the bottom of the screen to its top at 25% from the top
//   exit    – from its top at the top of the screen to its bottom at the top (a hero scrolling away)
//   pin     – a tall section with a sticky child: 0 when it reaches the top, 1 when its end does
function measure(el, mode, vh) {
  const r = el.getBoundingClientRect();
  if (mode === 'enter') return clamp((vh - r.top) / (vh * 0.75));
  if (mode === 'exit') return clamp(-r.top / Math.max(1, r.height));
  if (mode === 'pin') return clamp(-r.top / Math.max(1, r.height - vh));
  return clamp((vh - r.top) / (vh + r.height));
}

function frame(time) {
  lenis?.raf(time);
  const y = window.scrollY;
  const w = window.innerWidth;
  const vh = window.innerHeight;
  if (y !== lastY || w !== lastW || vh !== lastH) {
    lastY = y;
    lastW = w;
    lastH = vh;
    const root = document.documentElement;
    const max = root.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : '0');
    root.style.setProperty('--sy', `${y}px`);
    for (const t of tracked) {
      const p = measure(t.el, t.mode, vh);
      if (p !== t.p) {
        t.p = p;
        t.el.style.setProperty('--p', p.toFixed(4));
        t.onChange?.(p);
      }
    }
  }
  if (running) requestAnimationFrame(frame);
}

// Smooth scrolling for the whole page while V3 is mounted. Anchor links glide to their target.
export function useSmoothScroll() {
  useEffect(() => {
    if (!reducedMotion()) {
      lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -88 }, autoRaf: false });
      window.__v3lenis = lenis;
    }
    running = true;
    lastY = -1;
    requestAnimationFrame(frame);
    return () => {
      running = false;
      lenis?.destroy();
      lenis = null;
      window.__v3lenis = null;
    };
  }, []);
}

export const scrollToTarget = (target) => {
  if (lenis) lenis.scrollTo(target, { offset: -88 });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'smooth' });
};
export const stopScroll = (stop) => (stop ? lenis?.stop() : lenis?.start());

// Writes --p on the element as it scrolls. `onChange` gets the raw value for JS-driven state.
export function useProgress(mode = 'through', onChange) {
  const ref = useRef(null);
  const cb = useRef(onChange);
  cb.current = onChange;
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const t = { el, mode, p: -1, onChange: (p) => cb.current?.(p) };
    tracked.add(t);
    lastY = -1;
    return () => tracked.delete(t);
  }, [mode]);
  return ref;
}

// True once the element has come into view (or every time, with `once: false`)
export function useInView({ once = true, margin = '0px 0px -12% 0px', threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        if (once) io.disconnect();
      } else if (!once) setInView(false);
    }, { rootMargin: margin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin, threshold]);
  return [ref, inView];
}

// Cards that light up under the pointer: sets --mx/--my (px) on whichever `[data-spot]` is hovered
export function useSpotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const move = (e) => {
      const card = e.target.closest?.('[data-spot]');
      if (!card || !root.contains(card)) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    root.addEventListener('pointermove', move);
    return () => root.removeEventListener('pointermove', move);
  }, []);
  return ref;
}

// Layers that drift with the pointer: sets --px/--py (-1 → 1) on the element, eased
export function usePointerParallax() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return undefined;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.setProperty('--px', x.toFixed(3));
      el.style.setProperty('--py', y.toFixed(3));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

// Buttons that lean towards the pointer a little
export function useMagnetic(strength = 0.25) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * strength}px ${(e.clientY - r.top - r.height / 2) * strength}px`;
    };
    const leave = () => {
      el.style.translate = '0 0';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);
  return ref;
}

export function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}
