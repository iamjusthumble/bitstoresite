import React from 'react';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const icon = (children) =>
  function Icon({ size = 24, className }) {
    return <svg width={size} height={size} className={className} {...base}>{children}</svg>;
  };

export const Home = icon(<><path d="M4 10.2 12 3.5l8 6.7V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8.8Z" /><path d="M12 17v-3" /></>);
export const Wallet = icon(<><path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h10.5a2 2 0 0 1 2 2v1" /><path d="M3.5 8.5v8A2.5 2.5 0 0 0 6 19h12.5a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2.5 2.5 0 0 1-2.5-2.5V6A2.5 2.5 0 0 1 6 3.5h9" /><path d="M16.5 14h.01" /></>);
export const Trade = icon(<><circle cx="8.5" cy="15.5" r="5" /><path d="M8.5 13.5v4M6.9 15.5h3.2" /><path d="M13 4.2a5 5 0 0 1 6.8 6.8" /><path d="m20.5 14.5-1 2.5-2.5-1" /><path d="m3.5 9.5 1-2.5 2.5 1" /></>);
export const Card = icon(<><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18M7 14.5h3" /></>);
export const Gift = icon(<><rect x="3.5" y="9" width="17" height="11" rx="2" /><path d="M3.5 13h17M12 9v11" /><path d="M12 9c-1.2-3.4-5-4-5-1.6C7 9 9.5 9 12 9Zm0 0c1.2-3.4 5-4 5-1.6C17 9 14.5 9 12 9Z" /></>);
export const Users = icon(<><circle cx="7" cy="7.5" r="2.5" /><circle cx="17" cy="7.5" r="2.5" /><path d="M2.5 19c.4-3 2.2-4.8 4.5-4.8S11.1 16 11.5 19M12.5 19c.4-3 2.2-4.8 4.5-4.8S21.1 16 21.5 19" /></>);
export const Bell = icon(<><path d="M6 10a6 6 0 0 1 12 0c0 3.5 1 5 2 6.5H4c1-1.5 2-3 2-6.5Z" /><path d="M10 19.5a2 2 0 0 0 4 0M12 4V2.8" /></>);
export const Settings = icon(<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.6a7 7 0 0 0 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" /></>);
export const Sidebar = icon(<><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M9.5 5v14" /></>);
export const Search = icon(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>);
export const Grid = icon(<><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></>);
export const Eye = icon(<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>);
export const EyeOff = icon(<><path d="M4 4l16 16" /><path d="M9.9 5.8A8.5 8.5 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15 15 0 0 1-2.9 3.6M6.2 7.7A15 15 0 0 0 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.5-.8" /><path d="M10 10.1a2.8 2.8 0 0 0 3.9 3.9" /></>);
export const ChevronRight = icon(<path d="m9 5 7 7-7 7" />);
export const ChevronDown = icon(<path d="m5 9 7 7 7-7" />);
export const Deposit = icon(<><circle cx="11" cy="13" r="7.5" /><path d="M11 9.5v7M13 11.2c-.3-.7-1-1.1-2-1.1-1.2 0-2 .6-2 1.5 0 2 4 .9 4 2.9 0 .9-.8 1.5-2 1.5-1 0-1.8-.5-2.1-1.2" /><path d="M21 3l-4 4M17 4v3h3" /></>);
export const Withdraw = icon(<><circle cx="11" cy="13" r="7.5" /><path d="M11 9.5v7M13 11.2c-.3-.7-1-1.1-2-1.1-1.2 0-2 .6-2 1.5 0 2 4 .9 4 2.9 0 .9-.8 1.5-2 1.5-1 0-1.8-.5-2.1-1.2" /><path d="M17 7l4-4M18 3h3v3" /></>);
export const More = icon(<><circle cx="12" cy="12" r="9" /><path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2" /></>);
export const ArrowLeft = icon(<path d="M20 12H4M10 6l-6 6 6 6" />);
export const Refresh = icon(<><path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5M4 13a8 8 0 0 0 14.3 4.3L20 15.5" /><path d="M4 4.5v4h4M20 19.5v-4h-4" /></>);
export const Dollar = icon(<path d="M12 3v18M16.5 7.5C15.8 6 14.2 5.2 12 5.2c-2.6 0-4.3 1.3-4.3 3.3 0 4.5 9 2 9 6.7 0 2.1-1.8 3.5-4.7 3.5-2.4 0-4.2-1-4.9-2.7" />);
export const ArrowUpRight = icon(<path d="M7 17 17 7M8.5 7H17v8.5" />);
export const ArrowDownLeft = icon(<path d="M17 7 7 17M15.5 17H7V8.5" />);
export const Star = icon(<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />);
export const Check = icon(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const Clipboard = icon(<><rect x="6" y="5" width="12" height="16" rx="2" /><path d="M9.5 5V4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1M9.5 11h5M9.5 15h3" /></>);
export const Book = icon(<><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5v-15Z" /><path d="M5 20.5A2.5 2.5 0 0 0 7.5 21H19v-3M9.5 8h5.5" /></>);
export const Alert = icon(<><path d="M12 4 2.8 19.5h18.4L12 4Z" /><path d="M12 10v4.5M12 17h.01" /></>);
export const SwapVertical = icon(<path d="M8 4v16m0 0-3.5-3.5M8 20l3.5-3.5M16 20V4m0 0-3.5 3.5M16 4l3.5 3.5" />);
export const Plus = icon(<path d="M12 5v14M5 12h14" />);
export const Close = icon(<path d="M6 6l12 12M18 6 6 18" />);
export const Trash = icon(<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12M10 11v5.5M14 11v5.5" />);
export const ExternalLink = icon(<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />);

// Solid triangle used beside percentage changes
export const Caret = ({ down = false, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d={down ? 'M6 9.5 1.5 3.5h9L6 9.5Z' : 'M6 2.5l4.5 6h-9L6 2.5Z'} />
  </svg>
);
