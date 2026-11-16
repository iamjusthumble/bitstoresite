import React from 'react';
import buyer from '../assets/people/buyer.jpg';
import merchant from '../assets/people/merchant.jpg';
import developer from '../assets/people/developer.jpg';
import { cx } from '../ui.js';
import { useProgress } from '../v3/motion.js';

const WORDS = 'Whether you’re buying your first Bitcoin, accepting crypto payments, or building an app, Mybitstore has the tools you need.'.split(' ');
const BRAND = WORDS.indexOf('Mybitstore');

// Small photos set inside the sentence, each after the phrase it shows. They open up as the words reach them.
const PHOTOS = {
  [WORDS.indexOf('Bitcoin,')]: { src: buyer, pos: '50% 40%' },
  [WORDS.indexOf('payments,')]: { src: merchant, pos: '45% 35%' },
  [WORDS.indexOf('app,')]: { src: developer, pos: '70% 40%' },
};

// A pinned statement whose words fill in one by one as you scroll. Behind it, a dot field and a blue
// light that swells with the scroll; inside it, photos of the people each phrase is about.
export default function StatementV4() {
  const ref = useProgress('pin');
  const n = WORDS.length;
  // Each word fills over its own slice of the scroll, with a short overlap so it reads as a sweep
  const lit = (i) => `clamp(0, calc(var(--p, 0) * ${n + 4} - ${i + 1}), 1)`;

  return (
    <section ref={ref} className="relative h-[220svh]" aria-label={WORDS.join(' ')}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        {/* Dot field, fading out toward the edges */}
        <div
          aria-hidden="true"
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_50%,#000_10%,transparent_75%)]"
          style={{ backgroundImage: 'radial-gradient(var(--v4-line-2) 1.2px, transparent 1.2px)', backgroundSize: '26px 26px', backgroundPosition: 'center' }}
        />
        {/* The light grows and brightens as you read */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-[80vmin] rounded-full"
          style={{
            background: 'radial-gradient(closest-side, var(--v4-glow), transparent)',
            transform: 'translate(-50%, -50%) scale(calc(0.55 + var(--p, 0) * 0.8))',
            opacity: 'calc(0.4 + var(--p, 0) * 0.9)',
          }}
        />

        <p aria-hidden="true" className="relative mx-auto w-full max-w-[1100px] px-8 text-center font-v4 text-[56px] font-semibold leading-[1.12] tracking-[-0.035em] max-lg:px-6 max-lg:text-[44px] max-sm:px-5 max-sm:text-[30px]">
          {WORDS.map((w, i) => (
            <React.Fragment key={i}>
              <span className="relative inline-block">
                <span className="text-v4-ink/[0.14]">{w}</span>
                {/* The brand name lights up in Mybitstore blue */}
                <span className={cx('absolute left-0 top-0', i === BRAND ? 'text-v4-accent-ink' : 'text-v4-ink')} style={{ opacity: lit(i) }}>{w}</span>
              </span>
              {PHOTOS[i] && (
                <>
                  {' '}
                  <span
                    className="relative inline-block h-[0.82em] w-[1.55em] overflow-hidden rounded-full align-[-0.06em] shadow-[0_0_0_2px_var(--v4-bg)]"
                    style={{ opacity: `calc(0.25 + ${lit(i)} * 0.75)`, transform: `scale(calc(0.7 + ${lit(i)} * 0.3))` }}
                  >
                    <img src={PHOTOS[i].src} alt="" className="size-full object-cover" style={{ objectPosition: PHOTOS[i].pos, filter: `grayscale(calc(1 - ${lit(i)}))` }} />
                  </span>
                </>
              )}
              {i < WORDS.length - 1 && ' '}
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
