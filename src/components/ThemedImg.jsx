import React from 'react';

// Renders both theme variants of a decorative image; CSS shows the one matching data-theme.
// Using CSS (not state) keeps every instance in sync with the header toggle and avoids a flash.
export default function ThemedImg({ dark, light, className, ...props }) {
  const cls = (variant) => (className ? className + ' ' : '') + variant;
  return (
    <>
      <img src={dark} alt="" className={cls('only-dark')} {...props} />
      <img src={light} alt="" className={cls('only-light')} {...props} />
    </>
  );
}
