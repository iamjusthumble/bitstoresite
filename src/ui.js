// Shared Tailwind class sets. Variants are complete strings (never merged), so any
// component can combine them with cx() without conflicting utilities.

export const cx = (...parts) => parts.filter(Boolean).join(' ');

const btnBase =
  'group/btn inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border font-euclid text-base leading-[normal] transition-[background-color,border-color,transform] duration-200';

export const btn = {
  primary: cx(btnBase, 'h-10 min-w-[119.58px] border-transparent bg-brand-strong px-4 text-white hover:bg-brand-hover'),
  primaryTall: cx(btnBase, 'h-11 min-w-[119.58px] border-transparent bg-brand-strong px-4 text-white hover:bg-brand-hover'),
  outline: cx(btnBase, 'border-brand px-[15px] py-[9px] text-brand hover:bg-brand/12'),
  heroPrimary: cx(btnBase, 'h-[60px] border-transparent bg-brand-strong px-4 text-lg font-medium text-white hover:bg-brand-hover max-sm:h-[52px] max-sm:text-base'),
  heroOutline: cx(
    btnBase,
    'h-[60px] border-white bg-transparent px-4 text-lg font-medium text-white hover:bg-white/8 aria-expanded:bg-white/8 max-sm:h-[52px] max-sm:text-base',
    'light:border-black light:text-black light:hover:bg-black/5 light:aria-expanded:bg-black/5',
  ),
};

// Arrow icons inside buttons nudge right on hover
export const btnArrow = 'transition-transform duration-200 group-hover/btn:translate-x-[3px]';

export const section = {
  base: 'relative py-24 bg-page max-sm:py-[72px]',
  alt: 'relative py-24 bg-page-alt max-sm:py-[72px]',
};

export const text = {
  eyebrow: 'text-sm font-semibold leading-[21px] text-eyebrow',
  h2: 'max-w-[1124px] text-[52px] font-semibold leading-[54.6px] tracking-[-1.456px] text-shadow-[0_4px_4px_rgba(0,0,0,0.25)] light:text-shadow-none max-sm:text-4xl max-sm:leading-[1.1] max-sm:tracking-[-1px]',
  lead: 'mt-4 max-w-[743px] text-lg leading-[27.9px] text-text-lead max-sm:text-base max-sm:leading-[1.6]',
  leadLg: 'mt-3.5 max-w-[834px] font-nunito text-2xl leading-[1.2] text-text-muted max-sm:text-lg',
  inlineLink: 'font-inter font-medium text-eyebrow underline underline-offset-3',
};
