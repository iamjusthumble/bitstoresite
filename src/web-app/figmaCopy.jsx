import React, { useEffect, useState } from 'react';
import { cx } from '../ui.js';

// Copy-to-Figma for the design team: puts what is on screen on the clipboard as editable Figma layers,
// ready to paste into any Figma file. It relies on Figma's capture script, loaded in app/index.html.

const SHORTCUT = 'Alt + Shift + F';

// An open dialog is what the visitor is looking at, so it is copied on its own; otherwise the whole page is
export function copyToFigma() {
  const capture = window.figma?.captureForDesign;
  if (!capture) return false;
  // The copy buttons are tooling, not design, so they sit out of the capture
  const tools = [...document.querySelectorAll('[data-figma-tool]')];
  tools.forEach((el) => { el.hidden = true; });
  const restore = () => tools.forEach((el) => { el.hidden = false; });
  Promise.resolve(capture({ selector: document.querySelector('dialog[open]') ? 'dialog[open]' : 'body' })).finally(restore);
  return true;
}

// The shortcut works everywhere, including over an open dialog
export function useFigmaShortcut() {
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyF') {
        e.preventDefault();
        copyToFigma();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}

export function FigmaCopyButton({ className, children = 'Copy to Figma' }) {
  // The script loads async and can be blocked; without it the button says so instead of doing nothing
  const [missing, setMissing] = useState(false);
  return (
    <button
      type="button"
      data-figma-tool
      onClick={() => setMissing(!copyToFigma())}
      title={`Copy this screen as Figma layers, then paste it into Figma (${SHORTCUT})`}
      className={cx('shrink-0 rounded-full border border-wa-line px-2.5 py-0.5 text-xs font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:border-tab-active hover:text-wa-text', className)}
    >
      {missing ? 'Figma script not loaded' : children}
    </button>
  );
}
