import React from 'react';
import { links } from '../links.js';
import { cx } from '../ui.js';
import { useProgress } from '../v3/motion.js';
import photo from '../assets/people/cta.jpg';
import { PrimaryButton, Rise, SecondaryButton, Words, container, display } from './ui.jsx';

// The closing call to action. It has no edges: the page fades into the footer's colour behind it,
// and a soft light rises as the section arrives.
export default function CtaV4() {
  const ref = useProgress('enter');
  return (
    <section ref={ref} className="relative isolate overflow-x-clip bg-[linear-gradient(180deg,var(--v4-bg)_0%,var(--v4-bg-2)_70%)] pb-32 pt-32 max-sm:pb-20 max-sm:pt-20">
      <div className={container}>
        {/* A person on one side, the invitation on the other */}
        <Rise className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] overflow-hidden rounded-[32px] bg-v4-card shadow-[inset_0_0_0_1px_var(--v4-line)] max-lg:grid-cols-[minmax(0,1fr)]">
          <div className="flex flex-col justify-center gap-8 p-16 max-lg:p-10 max-sm:p-6">
            <Words parts={['Ready to', '\n', { dim: 'get started?' }]} className={cx(display, 'text-[64px] leading-[1] max-lg:text-[52px] max-sm:text-[38px]')} />
            <p className="max-w-[440px] text-[18px] leading-[1.6] text-v4-muted max-sm:text-base">
              Trade, pay, and manage your crypto in one place. Signing up takes just a few minutes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton href={links.signup}>Create your account</PrimaryButton>
              <SecondaryButton href={links.login}>Log in</SecondaryButton>
            </div>
          </div>
          <div className="relative min-h-[460px] overflow-hidden max-lg:min-h-[340px] max-sm:min-h-[280px]">
            <img
              src={photo}
              alt="A smiling woman holding her phone"
              loading="lazy"
              className="absolute inset-0 size-full object-cover object-[50%_30%]"
              style={{ transform: 'scale(calc(1.12 - var(--p, 0) * 0.12))' }}
            />
          </div>
        </Rise>
      </div>
    </section>
  );
}
