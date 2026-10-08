import React from 'react';
import { cx } from '../ui.js';

// Renders both theme variants of a decorative image; the light:/dark: variants show the one
// matching data-theme. Using CSS (not state) keeps every instance in sync with the header
// toggle and avoids a flash on load.
export default function ThemedImg({ dark, light, className, ...props }) {
  return (
    <>
      <img src={dark} alt="" className={cx(className, 'light:hidden!')} {...props} />
      <img src={light} alt="" className={cx(className, 'dark:hidden!')} {...props} />
    </>
  );
}
