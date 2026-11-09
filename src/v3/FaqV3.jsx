import React, { useState } from 'react';
import { links } from '../links.js';
import { faqs } from './copy.js';
import { cx } from '../ui.js';
import { Heading, Rise, container } from './ui.jsx';

export default function FaqV3() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-32 max-sm:py-20">
      <div className={cx(container, 'grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-16 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-10')}>
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Heading eyebrow="FAQ" size="md" parts={['Frequently asked', { serif: 'questions.' }]} />
        </div>
        <ul className="flex flex-col gap-3">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <Rise as="li" key={f.q} delay={i * 70}>
                <div className={cx('glass overflow-hidden rounded-[24px] transition-[background-color] duration-500', on && 'bg-v3-glass-2')}>
                  <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left max-sm:px-5 max-sm:py-5">
                    <span className="font-inter-tight text-[19px] font-semibold text-v3-ink max-sm:text-[17px]">{f.q}</span>
                    <span className={cx('relative grid size-9 shrink-0 place-items-center rounded-full border border-v3-line transition-[background-color,rotate] duration-500 ease-(--ease-soft)', on && 'rotate-45 bg-v3-ink')}>
                      <span className={cx('absolute h-[1.5px] w-3.5 rounded', on ? 'bg-v3-bg' : 'bg-v3-ink')} />
                      <span className={cx('absolute h-3.5 w-[1.5px] rounded', on ? 'bg-v3-bg' : 'bg-v3-ink')} />
                    </span>
                  </button>
                  <div className={cx('grid transition-[grid-template-rows] duration-500 ease-(--ease-soft)', on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <p className={cx('overflow-hidden px-7 text-[15px] leading-[1.7] text-v3-muted transition-opacity duration-500 max-sm:px-5', on ? 'pb-6 opacity-100' : 'opacity-0')}>{f.a}</p>
                  </div>
                </div>
              </Rise>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
