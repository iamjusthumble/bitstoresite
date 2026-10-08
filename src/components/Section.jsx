import React from 'react';
import { cx, text } from '../ui.js';

/**
 * Centered section heading. Class props replace (not extend) their defaults so spacing
 * differences between sections stay explicit.
 */
export default function SectionHead({
  eyebrow,
  title,
  lead,
  className = 'mb-10',
  eyebrowClass = 'mb-5',
  titleClass = 'text-title',
  leadClass = text.lead,
  children,
}) {
  return (
    <div className={cx('reveal flex flex-col items-center text-center', className)}>
      {eyebrow && <span className={cx(text.eyebrow, eyebrowClass)}>{eyebrow}</span>}
      <h2 className={cx(text.h2, titleClass)}>{title}</h2>
      {lead && <p className={leadClass}>{lead}</p>}
      {children}
    </div>
  );
}
