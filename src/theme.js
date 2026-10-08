import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';
const THEME_COLORS = { light: '#ffffff', dark: '#000b1e' };

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

// The design is dark-first, so dark is the default until a visitor picks a theme
const DEFAULT_THEME = 'dark';

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
}

// The inline script in index.html sets the initial theme before paint; this keeps it in sync
export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || readStored() || DEFAULT_THEME);

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage can be unavailable (private mode); the theme still applies for this visit
      }
      return next;
    });
    window.setTimeout(() => root.classList.remove('theme-transition'), 350);
  }, []);

  return [theme, toggle];
}
