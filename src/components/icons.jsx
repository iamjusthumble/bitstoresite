import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const ArrowUpRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M7 17 17 7M8 7h9v9" /></svg>
);

export const Check = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);

export const Plus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M12 5v14M5 12h14" /></svg>
);

export const ShieldCheck = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M12 3 5 6v5.5c0 4.3 3 8.2 7 9.5 4-1.3 7-5.2 7-9.5V6l-7-3Z" /><path d="m9 12 2 2 4-4" />
  </svg>
);

export const Lock = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 14.5v2.5" />
  </svg>
);

export const Receipt = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
);

export const UserCheck = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="10" cy="8" r="3.5" /><path d="M3.5 20c.8-3.5 3.4-5.5 6.5-5.5 1.4 0 2.6.3 3.6 1" /><path d="m15 18 2 2 4-4" />
  </svg>
);

export const Menu = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);

export const Close = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);

export const Sun = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
    <circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);

export const Moon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
);
