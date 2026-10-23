import { useEffect } from 'react';

const SELECTOR = '.reveal, .reveal-scope';

// Fades `.reveal` elements up as they scroll into view, and replays the entrance whenever they come
// back into view in either direction. `.reveal-scope` elements are tracked the same way but never
// hidden; they only gate their children's entrance animations (e.g. the hero).
// Content is only hidden once this has run (the `js-reveal` class), so it stays visible without JS
// and with reduced motion.
export function useReveal(key) {
  useEffect(() => {
    // Keep everything visible for reduced motion and for Figma captures (?capture or a #figma… capture hash)
    const capturing = /capture/i.test(window.location.search) || /figma/i.test(window.location.hash);
    if (capturing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.documentElement;

    // Show once a meaningful slice is on screen...
    const enter = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-visible')),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    // ...but only reset once it has fully left, so edges of the viewport never flicker
    const exit = new IntersectionObserver(
      (entries) => entries.forEach((e) => !e.isIntersecting && e.target.classList.remove('is-visible')),
      { threshold: 0 },
    );

    const els = document.querySelectorAll(SELECTOR);
    els.forEach((el) => {
      // Anything already on screen at load shows immediately instead of animating from hidden
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) el.classList.add('is-visible');
      enter.observe(el);
      exit.observe(el);
    });
    root.classList.add('js-reveal');
    return () => {
      enter.disconnect();
      exit.disconnect();
    };
  }, [key]);
}

// For a Figma capture: show every scroll-revealed section in its final state, with no entrance animation
// half-way through. Returns a function that puts the reveals back as they were.
export function showAllForCapture() {
  const root = document.documentElement;
  const hadReveal = root.classList.contains('js-reveal');
  const visible = [...document.querySelectorAll('.is-visible')];
  // No fades: sections must be fully shown the moment the capture reads them
  const still = document.createElement('style');
  still.textContent = '*, *::before, *::after { transition: none !important; }';
  document.head.append(still);
  root.classList.remove('js-reveal');
  visible.forEach((el) => el.classList.remove('is-visible'));
  void root.offsetHeight;
  return () => {
    if (hadReveal) root.classList.add('js-reveal');
    visible.forEach((el) => el.classList.add('is-visible'));
    void root.offsetHeight;
    still.remove();
  };
}
