import React from 'react';

// Segmented tab list shared by Markets, Products and AI sections
export default function Tabs({ tabs, active, onChange, label, className = '', idPrefix }) {
  return (
    <div className={'tabs ' + className} role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={idPrefix ? `${idPrefix}-${tab}` : undefined}
          aria-selected={active === tab}
          className={active === tab ? 'is-active' : ''}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
