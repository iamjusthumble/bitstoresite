import React from 'react';
import { cx } from '../ui.js';
import { useInView, useMagnetic } from './motion.js';

// Pieces shared by the V3 sections

export const container = 'mx-auto w-full max-w-[1280px] px-8 max-lg:px-6 max-sm:px-5';
export const display = 'font-inter-tight font-semibold tracking-[-0.035em] text-v3-ink';
export const serif = 'font-serif font-normal italic tracking-[-0.01em]';

export const ArrowUpRight = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
  </svg>
);
export const ArrowRight = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" />
  </svg>
);
export const Check = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);

// A heading that rises in word by word when it scrolls into view.
// `parts` mixes plain text and { serif: '…' } segments for the italic accent words.
export function Words({ parts, as: Tag = 'h2', className, delay = 0, step = 55 }) {
  const [ref, inView] = useInView();
  let i = 0;
  const words = parts.flatMap((part) => {
    const accent = typeof part === 'object';
    const text = accent ? part.serif : part;
    return text.split(/\s+/).filter(Boolean).map((w) => ({ w, accent, i: i++ }));
  });
  return (
    <Tag ref={ref} className={className} aria-label={parts.map((p) => (typeof p === 'object' ? p.serif : p)).join(' ')}>
      {/* The space sits between the clipping wrappers; inside an inline-block it would collapse */}
      {words.map(({ w, accent, i: n }) => (
        <React.Fragment key={n}>
          {/* Italic letters (like the g's tail) swing left and hang low, so accent words get extra room that the clip won't cut */}
          <span aria-hidden="true" className={cx('-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top', accent && '-ml-[0.2em] -mb-[0.35em] pb-[0.35em] pl-[0.2em]')}>
            <span
              className={cx('inline-block will-change-transform', accent && cx(serif, 'text-aurora -mb-[0.35em] -ml-[0.2em] pb-[0.35em] pl-[0.2em] pr-[0.06em]'))}
              style={inView ? { animation: `v3-word 1s var(--ease-soft) ${delay + n * step}ms backwards` } : { opacity: 0 }}
            >
              {w}
            </span>
          </span>
          {n < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
}

// Small glass label above a section title
export function Eyebrow({ children, className }) {
  return (
    <span className={cx('glass inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium leading-5 text-v3-soft', className)}>
      <span className="relative grid size-2 place-items-center">
        <span className="absolute size-2 rounded-full bg-v3-mint animate-[v3-pulse_2.4s_ease-out_infinite]" />
        <span className="size-1.5 rounded-full bg-v3-mint" />
      </span>
      {children}
    </span>
  );
}

// Fades and lifts its children once in view; `zoom` starts them slightly smaller
export function Rise({ children, className, delay = 0, zoom, as: Tag = 'div', ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={cx('transition-[opacity,translate,scale,filter] duration-[1100ms] ease-(--ease-soft)', !inView && cx('translate-y-8 opacity-0 blur-[6px]', zoom && 'scale-[0.94]'), className)}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const pill = 'group/b relative inline-flex h-[52px] items-center gap-3 overflow-hidden rounded-full text-[15px] font-semibold leading-none transition-[translate,box-shadow,background-color] duration-300 ease-(--ease-soft) max-sm:h-12';

// The main call to action: an aurora pill with a white arrow disc, a sheen on hover and a slight pull to the pointer
export function PrimaryButton({ href, children, className, onClick }) {
  const ref = useMagnetic(0.18);
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      type={href ? undefined : 'button'}
      className={cx(
        pill,
        'bg-brand pl-6 pr-1.5 text-white shadow-[0_10px_40px_-10px_rgba(47,96,224,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_16px_50px_-10px_rgba(47,96,224,0.95),inset_0_1px_0_rgba(255,255,255,0.3)]',
        className,
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.35),transparent_70%)] transition-transform duration-700 ease-(--ease-soft) group-hover/b:translate-x-full" />
      <span className="relative">{children}</span>
      <span className="relative grid size-10 place-items-center rounded-full bg-white text-brand transition-transform duration-300 ease-(--ease-soft) group-hover/b:rotate-[-45deg] max-sm:size-9">
        <ArrowRight size={17} />
      </span>
    </Tag>
  );
}

export function GhostButton({ href, children, className, onClick, ...rest }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      type={href ? undefined : 'button'}
      className={cx(pill, 'glass px-6 text-v3-ink hover:bg-v3-glass-2', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Section heading block: eyebrow, word-by-word title, lead
export function Heading({ eyebrow, parts, lead, center, className, children, size = 'lg' }) {
  return (
    <div className={cx('flex flex-col gap-5', center && 'items-center text-center', className)}>
      {eyebrow && <Rise><Eyebrow>{eyebrow}</Eyebrow></Rise>}
      <Words
        parts={parts}
        className={cx(display, size === 'lg' ? 'text-[64px] leading-[1.02] max-lg:text-[52px] max-sm:text-[38px] max-sm:leading-[1.06]' : 'text-[48px] leading-[1.05] max-sm:text-[34px]', center ? 'max-w-[960px]' : 'max-w-[880px]')}
      />
      {lead && (
        <Rise delay={200} as="p" className={cx('max-w-[620px] text-lg leading-[1.6] text-v3-muted max-sm:text-base', center && 'mx-auto')}>
          {lead}
        </Rise>
      )}
      {children}
    </div>
  );
}

// A glass card that glows where the pointer is (needs useSpotlight on an ancestor)
export function SpotCard({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag data-spot className={cx('group/spot glass relative overflow-hidden rounded-[28px]', className)} {...rest}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgba(110,140,255,0.18), transparent 60%)' }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          padding: 1,
          background: 'radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(140,160,255,0.75), transparent 70%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      {children}
    </Tag>
  );
}
