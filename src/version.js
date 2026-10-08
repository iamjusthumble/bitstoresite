import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Two layouts of the same site live side by side; the footer switch flips between them.
// `?v=1` / `?v=2` in the URL wins (handy for sharing a specific version), then the visitor's last pick.
export const VERSIONS = ['1', '2'];
const STORAGE_KEY = 'site-version';
const DEFAULT_VERSION = '2';

function initialVersion() {
  const fromUrl = new URLSearchParams(window.location.search).get('v');
  if (VERSIONS.includes(fromUrl)) return fromUrl;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (VERSIONS.includes(stored)) return stored;
  } catch {
    // Storage can be unavailable (private mode); fall back to the default
  }
  return DEFAULT_VERSION;
}

export const VersionContext = createContext({ version: DEFAULT_VERSION, setVersion: () => {} });

export function useVersionState() {
  const [version, setState] = useState(initialVersion);

  useEffect(() => {
    document.documentElement.dataset.version = version;
  }, [version]);

  const setVersion = useCallback((next) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted, but the switch still applies for this visit
    }
    // Keep a shared link in sync if it pinned a version
    const url = new URL(window.location.href);
    if (url.searchParams.has('v')) {
      url.searchParams.set('v', next);
      window.history.replaceState(null, '', url);
    }
  }, []);

  return { version, setVersion };
}

export const useVersion = () => useContext(VersionContext);
