import React, { useCallback, useEffect, useState } from 'react';
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

// useState that remembers its value in localStorage (falls back to memory if storage is blocked).
// Every component using the same key stays in step, so a change made in one view shows everywhere at once.
const storeListeners = new Map();

export function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    if (!storeListeners.has(key)) storeListeners.set(key, new Set());
    const listeners = storeListeners.get(key);
    listeners.add(setValue);
    return () => listeners.delete(setValue);
  }, [key]);

  const update = useCallback(
    (next) =>
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage can be unavailable (private mode); the value still applies for this visit
        }
        // Tell the other components on this key, after this render
        queueMicrotask(() => storeListeners.get(key)?.forEach((set) => set !== setValue && set(resolved)));
        return resolved;
      }),
    [key],
  );
  return [value, update];
}
