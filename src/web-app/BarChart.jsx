import React, { useState } from 'react';
import { formatPrice } from '../marketData.js';
import { cx } from '../ui.js';
import { Money } from './format.jsx';

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Bar chart of a dollar value per day or month, drawn from a zero baseline so heights compare honestly.
// Green bars rose on the bar before them, blue bars fell. Hover, touch or use the arrow keys to read one.
export default function BarChart({ bars, hidden = false, label = 'Balance history' }) {
  const [active, setActive] = useState(null);
  const max = Math.max(...bars.map((b) => b.value));
  const last = bars.length - 1;
  const index = active === null ? null : Math.min(active, last);
  const bar = index === null ? null : bars[index];

  const onKey = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step) {
      e.preventDefault();
      setActive((i) => Math.min(last, Math.max(0, (i === null ? last : i) + step)));
    } else if (e.key === 'Escape') setActive(null);
  };

  return (
    <div className="mt-6">
      <div
        role="group"
        tabIndex={0}
        aria-label={`${label}. Use the left and right arrow keys to read values.`}
        className="relative flex h-[250px] rounded-lg border-b border-wa-line max-sm:h-[190px]"
        onPointerLeave={() => setActive(null)}
        onFocus={() => setActive((i) => (i === null ? last : i))}
        onBlur={() => setActive(null)}
        onKeyDown={onKey}
      >
        {bars.map((item, i) => (
          <div key={item.time} className="relative h-full min-w-0 flex-1" onPointerEnter={() => setActive(i)} onPointerDown={() => setActive(i)}>
            <span className="absolute inset-y-0 left-1/2 w-px bg-wa-line" />
            <span
              className={cx(
                'absolute bottom-0 left-1/2 w-[72%] max-w-[58px] origin-bottom -translate-x-1/2 rounded-t-[3px] transition-opacity duration-150 animate-[fill-bar-up_0.5s_var(--ease-soft)_backwards]',
                item.up ? 'bg-[#b5e4ca] light:bg-[#5fc391]' : 'bg-tab-active',
                index !== null && index !== i && 'opacity-60',
              )}
              style={{ height: `${(item.value / max) * 92}%`, animationDelay: `${Math.min(i * 25, 400)}ms` }}
            />
          </div>
        ))}

        {bar && (
          <div
            className={cx(
              'pointer-events-none absolute z-10 min-w-[140px] rounded-xl border border-wa-line bg-wa-inset px-3 py-2.5 shadow-(--wa-shadow)',
              index > last / 2 ? '-translate-x-[calc(100%+10px)]' : 'translate-x-2.5',
            )}
            style={{ left: `${((index + 0.5) / bars.length) * 100}%`, bottom: `min(${(bar.value / max) * 92}% - 20px, 100% - 76px)` }}
          >
            <p className="font-inter text-[11px] leading-4 text-wa-muted">{dateFormat.format(bar.time)}</p>
            <p className="mt-1 text-xl font-bold leading-7 text-wa-text"><Money value={bar.value} hidden={hidden} /></p>
          </div>
        )}
      </div>

      <div className="mt-2 flex font-inter text-[11px] leading-4 text-wa-muted" aria-hidden="true">
        {bars.map((item) => (
          <span key={item.time} className="min-w-0 flex-1 whitespace-nowrap text-center">{item.label}</span>
        ))}
      </div>

      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs leading-4 text-wa-muted">
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-[3px] bg-[#b5e4ca] light:bg-[#5fc391]" />Up on the previous bar</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-[3px] bg-tab-active" />Down on the previous bar</span>
      </p>

      <p className="sr-only" aria-live="polite">
        {bar ? `${dateFormat.format(bar.time)}: ${hidden ? 'hidden' : formatPrice(bar.value)}, ${bar.up ? 'up' : 'down'} on the previous bar` : ''}
      </p>
    </div>
  );
}
