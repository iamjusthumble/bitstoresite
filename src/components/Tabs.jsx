import React from 'react';
import { cx } from '../ui.js';

// Segmented tab list shared by Markets, Products and AI sections.
// `fill` stretches the buttons evenly across a fixed-width list (pass the width in className).
export default function Tabs({ tabs, active, onChange, label, className = '', fill = false, idPrefix }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx('scrollbar-none mt-5 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-tab-border bg-tab-bg p-1', className)}
    >
      {tabs.map((tab) => {
        const selected = active === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            id={idPrefix ? `${idPrefix}-${tab}` : undefined}
            aria-selected={selected}
            onClick={() => onChange(tab)}
            className={cx(
              'whitespace-nowrap px-4 py-2 text-sm font-medium leading-[21px] transition-[background-color,color] duration-200',
              fill ? 'flex-1' : 'flex-none',
              selected
                ? 'rounded-md bg-tab-active text-white shadow-[0_1px_1px_rgba(10,16,36,0.06)]'
                : 'rounded-full text-tab-text hover:text-title',
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
