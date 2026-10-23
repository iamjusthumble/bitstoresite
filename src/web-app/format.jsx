import React, { useCallback, useEffect, useRef, useState } from 'react';
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
// The latest value per key is kept in memory and written straight away, so a view opened right after a change
// (say, a new trade's page) already sees it.
const storeListeners = new Map();
const storeValues = new Map();

function readStored(key, initial) {
  if (storeValues.has(key)) return storeValues.get(key);
  let value = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) value = JSON.parse(raw);
  } catch {
    // Unreadable storage: start from the initial value
  }
  storeValues.set(key, value);
  return value;
}

export function useStored(key, initial) {
  const [value, setValue] = useState(() => readStored(key, initial));
  const first = useRef(initial);

  useEffect(() => {
    if (!storeListeners.has(key)) storeListeners.set(key, new Set());
    const listeners = storeListeners.get(key);
    listeners.add(setValue);
    // Catch up with a change made between the first render and now
    setValue(readStored(key, first.current));
    return () => listeners.delete(setValue);
  }, [key]);

  const update = useCallback(
    (next) => {
      const current = readStored(key, first.current);
      const resolved = typeof next === 'function' ? next(current) : next;
      storeValues.set(key, resolved);
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage can be unavailable (private mode, or full); the value still applies for this visit
      }
      storeListeners.get(key)?.forEach((set) => set(resolved));
      // A component whose effect hasn't run yet still gets the new value
      setValue(resolved);
    },
    [key],
  );
  return [value, update];
}
