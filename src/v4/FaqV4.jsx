import React, { useState } from 'react';
import { faqs } from './copy.js';
import { cx } from '../ui.js';
import { Heading, Rise, container, section } from './ui.jsx';

// Questions on hairlines; the answer opens smoothly and the plus turns into a minus
export default function FaqV4() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className={section}>
      <div className={container}>
        <Heading center parts={['Frequently asked', { dim: 'questions.' }]} />
        <ul className="mx-auto mt-10 max-w-[800px] border-t border-v4-line max-sm:mt-8">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <Rise as="li" key={f.q} delay={i * 60} className="border-b border-v4-line">
                <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="group/q flex w-full items-center justify-between gap-6 py-7 text-left max-sm:py-6">
                  <span className={cx('font-v4 text-[19px] font-medium tracking-[-0.015em] transition-colors duration-300 max-sm:text-[17px]', on ? 'text-v4-ink' : 'text-v4-soft group-hover/q:text-v4-ink')}>{f.q}</span>
                  <span aria-hidden="true" className="relative grid size-5 shrink-0 place-items-center text-v4-muted">
                    <span className="absolute h-px w-3.5 bg-current" />
                    <span className={cx('absolute h-3.5 w-px bg-current transition-[rotate,opacity] duration-500 ease-v4', on && 'rotate-90 opacity-0')} />
                  </span>
                </button>
                <div className={cx('grid transition-[grid-template-rows] duration-700 ease-v4', on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <p className={cx('overflow-hidden pr-12 text-[16px] leading-[1.7] text-v4-muted transition-[opacity,translate] duration-700 ease-v4 max-sm:pr-0', on ? 'translate-y-0 pb-7 opacity-100' : '-translate-y-2 opacity-0')}>{f.a}</p>
                </div>
              </Rise>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
