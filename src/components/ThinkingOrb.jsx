import React, { useEffect, useRef } from 'react';
import { MODE_DRAWS } from '../vendor/thinking-orbs/engine/registry';
import { resolvePreset } from '../vendor/thinking-orbs/presets';
import { cx } from '../ui.js';

const isDark = () => document.documentElement.dataset.theme !== 'light';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * React port of the thinking-orbs Vue component: a dotted, depth-shaded orb drawn on a 2D canvas.
 * `size` must be one of the engine's tuned presets (64 or 20). `tint` washes the monochrome ink
 * with a brand colour while keeping its depth shading.
 */
export default function ThinkingOrb({ state = 'working', size = 20, tint, speed = 1, className, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const { mode, speed: baseSpeed, opts } = resolvePreset(state, size);
    const draw = MODE_DRAWS[mode];
    let dark = isDark();

    // Tinting: draw the monochrome orb offscreen, colour it with the 'color' blend (keeps each dot's
    // luminance, so depth shading survives), then mask back to the orb's own alpha.
    const ink = tint ? document.createElement('canvas') : null;
    const inkCtx = ink?.getContext('2d');
    if (ink) {
      ink.width = canvas.width;
      ink.height = canvas.height;
    }

    const frame = (t) => {
      const target = inkCtx || ctx;
      target.setTransform(dpr, 0, 0, dpr, 0, 0);
      target.clearRect(0, 0, size, size);
      draw(target, size, t, dark, opts);
      if (!ink) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(ink, 0, 0);
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(ink, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    };
    const now = () => (performance.now() / 1000) * baseSpeed * speed;

    let raf = 0;
    let visible = false;
    const loop = () => {
      frame(now());
      raf = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (reducedMotion()) return frame(0.6);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      else frame(now());
    };

    // Run only while on screen and the tab is visible; repaint when the site theme flips
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      dark = isDark();
      sync();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    document.addEventListener('visibilitychange', sync);
    frame(now());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [state, size, tint, speed]);

  return (
    <canvas
      ref={ref}
      className={cx('block shrink-0', className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
