import React from 'react';
import { links } from '../links.js';
import logo from '../assets/logo.svg';
import { StoreBadges, primaryColumns, secondaryColumns } from '../components/Footer.jsx';
import { VERSIONS, useVersion } from '../version.js';
import { cx } from '../ui.js';
import { scrollToTarget } from '../v3/motion.js';
import { container } from './ui.jsx';

// Same links as the other versions; LENS sign-in is left out here as in V3
const COLUMNS = [...primaryColumns, ...secondaryColumns].map((c) => ({ ...c, items: c.items.filter(([label]) => label !== 'Sign in to LENS') }));

const SOCIALS = [
  ['X', links.twitter, <path key="x" d="M4 4l16 16M20 4 4 20" />],
  ['Instagram', links.instagram, <g key="ig"><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><path d="M16.8 7.2v.1" /></g>],
  ['Facebook', links.facebook, <path key="fb" d="M14 8.5h2V5h-2.5C11 5 10 6.6 10 9v2H8v3.4h2V20h3.4v-5.6h2.3l.5-3.4h-2.8V9.3c0-.5.3-.8.6-.8Z" />],
];

function VersionSwitch() {
  const { version, setVersion } = useVersion();
  return (
    <div className="flex items-center gap-3 text-[13px] text-v4-muted" role="radiogroup" aria-label="Site version">
      <span>Site version</span>
      <div className="flex gap-0.5 rounded-full p-[3px] shadow-[inset_0_0_0_1px_var(--v4-line-2)]">
        {VERSIONS.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={version === v}
            onClick={() => setVersion(v)}
            className={cx('min-w-10 rounded-full px-2.5 py-1 text-[12px] font-medium leading-4 transition-colors duration-300', version === v ? 'bg-v4-ink text-v4-bg' : 'text-v4-muted hover:text-v4-ink')}
          >
            V{v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FooterV4() {
  return (
    <footer className="bg-v4-bg-2 pb-10 pt-24 text-v4-ink max-sm:pt-16">
      <div className={container}>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] gap-16 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-14">
          <div className="flex flex-col items-start gap-6">
            <a href="#top" aria-label="Mybitstore home" className="flex items-center gap-2.5">
              <img src={logo} alt="" width="28" height="28" />
              <span className="font-v4 text-[18px] font-semibold tracking-[-0.02em]">Mybitstore</span>
            </a>
            <p className="text-[15px] leading-6 text-v4-muted">Build. Trade. Move value.</p>
            <StoreBadges />
          </div>
          <nav aria-label="Footer" className="grid grid-cols-3 gap-x-8 gap-y-12 max-sm:grid-cols-2">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] font-medium text-v4-ink">{col.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.items.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="text-[14px] leading-5 text-v4-muted transition-colors duration-300 hover:text-v4-ink">{label.replace('\n', ' ')}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex items-center justify-between gap-6 border-t border-v4-line pt-8 max-lg:flex-col max-lg:items-start">
          <p className="text-[13px] text-v4-muted">© 2026 Mybitstore, Inc. All rights reserved.</p>
          <VersionSwitch />
          <div className="flex items-center gap-1">
            {SOCIALS.map(([name, href, icon]) => (
              <a key={name} href={href} aria-label={name} className="grid size-9 place-items-center rounded-full text-v4-muted transition-colors duration-300 hover:bg-v4-raise hover:text-v4-ink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
              </a>
            ))}
            <button type="button" onClick={() => scrollToTarget(0)} aria-label="Back to top" className="ml-2 grid size-9 place-items-center rounded-full text-v4-muted shadow-[inset_0_0_0_1px_var(--v4-line-2)] transition-colors duration-300 hover:text-v4-ink">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" /></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
