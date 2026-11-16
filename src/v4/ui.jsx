import React from 'react';
import { cx } from '../ui.js';
import { useInView, useMagnetic } from '../v3/motion.js';

// Pieces shared by the V4 sections. One accent colour (the Mybitstore blue); everything else is ink on neutral.

export const container = 'mx-auto w-full max-w-[1200px] px-8 max-lg:px-6 max-sm:px-5';
export const display = 'font-v4 font-semibold tracking-[-0.035em] text-v4-ink';
export const section = 'relative py-32 max-lg:py-24 max-sm:py-20';

export const ArrowRight = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const ArrowUpRight = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
  </svg>
);
export const Check = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);
export const Chevron = ({ open, size = 12, className }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cx('transition-transform duration-500 ease-v4', open && 'rotate-180', className)}>
    <path d="m3 4.5 3 3 3-3" />
  </svg>
);

// A title whose words slide up out of a mask, one after another.
// `parts` mixes plain strings and { dim: '…' } segments, which are set in Mybitstore blue.
// A '\n' part forces a line break at that point.
export function Words({ parts, as: Tag = 'h2', className, delay = 0, step = 45, play }) {
  const [ref, seen] = useInView();
  const on = play ?? seen;
  let n = 0;
  const words = parts.flatMap((part) => {
    if (part === '\n') return [{ br: true, i: -1 }];
    const dim = typeof part === 'object';
    return (dim ? part.dim : part).split(/\s+/).filter(Boolean).map((w) => ({ w, dim, i: n++ }));
  });
  return (
    <Tag ref={ref} className={className} aria-label={parts.filter((p) => p !== '\n').map((p) => (typeof p === 'object' ? p.dim : p)).join(' ')}>
      {words.map(({ w, dim, i, br }, k) => (br ? <br key={`br${k}`} /> : (
        <React.Fragment key={i}>
          {/* Room below for descenders, taken back with a negative margin so the line height is unchanged */}
          <span aria-hidden="true" className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-top">
            <span
              className={cx('inline-block', dim && 'text-v4-accent-ink')}
              style={on ? { animation: `v4-up 1.1s var(--ease-v4) ${delay + i * step}ms backwards` } : { transform: 'translate3d(0, 105%, 0)' }}
            >
              {w}
            </span>
          </span>
          {i < n - 1 && !words[k + 1]?.br && ' '}
        </React.Fragment>
      )))}
    </Tag>
  );
}

// Fades and lifts its children once in view
export function Rise({ children, className, delay = 0, as: Tag = 'div', ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={cx('transition-[opacity,translate] duration-[1200ms] ease-v4', !inView && 'translate-y-6 opacity-0', className)}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const pill = 'group/b relative inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[15px] font-medium leading-none transition-[background-color,box-shadow,color,translate] duration-300 ease-v4';

// The main call to action: solid brand blue; the arrow slides on hover and the button leans toward the pointer
export function PrimaryButton({ href, children, className, onClick }) {
  const ref = useMagnetic(0.12);
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      type={href ? undefined : 'button'}
      className={cx(pill, 'bg-v4-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_24px_-10px_var(--v4-glow)] hover:bg-brand-strong', className)}
    >
      {children}
      <span className="relative -mr-1 grid size-4 overflow-hidden">
        <ArrowRight className="col-start-1 row-start-1 transition-transform duration-500 ease-v4 group-hover/b:translate-x-[150%]" />
        <ArrowRight className="col-start-1 row-start-1 -translate-x-[150%] transition-transform duration-500 ease-v4 group-hover/b:translate-x-0" />
      </span>
    </Tag>
  );
}

export function SecondaryButton({ href, children, className, onClick, ...rest }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      type={href ? undefined : 'button'}
      className={cx(pill, 'text-v4-ink shadow-[inset_0_0_0_1px_var(--v4-line-2)] hover:bg-v4-raise', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Section heading: title and an optional lead. Left-aligned unless `center` is set.
export function Heading({ parts, lead, className, children, size = 'lg', center }) {
  return (
    <div className={cx('flex flex-col gap-6', center && 'items-center text-center', className)}>
      <Words
        parts={parts}
        className={cx(display, center ? 'mx-auto max-w-[980px]' : 'max-w-[820px]', size === 'lg' ? 'text-[60px] leading-[1.02] max-lg:text-[48px] max-sm:text-[36px] max-sm:leading-[1.06]' : 'text-[44px] leading-[1.05] max-sm:text-[32px]')}
      />
      {lead && (
        <Rise delay={150} as="p" className={cx('max-w-[560px] text-[18px] leading-[1.6] text-v4-muted max-sm:text-base', center && 'mx-auto')}>
          {lead}
        </Rise>
      )}
      {children}
    </div>
  );
}

// A flat card whose hairline brightens under the pointer (needs useSpotlight on an ancestor)
export function Card({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag data-spot className={cx('group/card v4-card relative overflow-hidden rounded-[24px] transition-[box-shadow,background-color] duration-500 hover:bg-v4-raise/40', className)} {...rest}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          padding: 1,
          background: 'radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), var(--v4-line-2), transparent 70%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {children}
    </Tag>
  );
}
