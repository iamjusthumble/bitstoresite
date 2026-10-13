import React, { useCallback, useState } from 'react';
import { formatPrice } from '../marketData.js';

// Dollar amount with the cents toned down, or dots when balances are hidden
export function Money({ value, hidden = false }) {
  if (hidden) return <span aria-label="Hidden">••••••</span>;
  const [whole, cents] = formatPrice(value).split('.');
  return (
    <span className="tabular-nums">
      {whole}
      <span className="text-wa-muted">.{cents}</span>
    </span>
  );
}

// useState that remembers its value in localStorage (falls back to memory if storage is blocked)
export function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });
  const update = useCallback(
    (next) =>
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage can be unavailable (private mode); the value still applies for this visit
        }
        return resolved;
      }),
    [key],
  );
  return [value, update];
}
