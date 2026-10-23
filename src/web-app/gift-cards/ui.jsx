import React, { useEffect, useRef, useState } from 'react';
import { cx } from '../../ui.js';
import { NoticeDialog, primaryBtn, cancelBtn } from '../flow.jsx';
import { Alert, Check, Close, Info, Shield, Upload } from '../icons.jsx';
import { face } from './catalog.js';
import { useOnline, useToasts } from './store.js';

export { toast } from './store.js';

// Pieces shared by the gift card screens

// The brand's real card face. White cards get a hairline so they don't melt into a light page.
export function CardArt({ brand, className, value, country, dim, sheen, style, radius = 'rounded-xl', shadow = 'shadow-[0_1px_2px_rgba(0,0,0,0.25)]', children }) {
  return (
    <span style={style} className={cx('relative block aspect-[5/3] overflow-hidden bg-wa-pill', radius, shadow, className)}>
      <img src={brand.art} alt="" loading="lazy" draggable="false" className={cx('absolute inset-0 size-full object-cover', dim && 'opacity-40 grayscale')} />
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/8" />
      {sheen && <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-[gc-sheen_5s_ease-in-out_infinite] bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.28),transparent)]" />}
      {value != null && (
        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-bold leading-5 text-white tabular-nums backdrop-blur-sm">{face(country, value)}</span>
      )}
      {children}
    </span>
  );
}

const PILL_TONES = {
  good: 'bg-up/15 text-up',
  warn: 'bg-wa-warn/15 text-wa-warn',
  danger: 'bg-down/15 text-down',
  accent: 'bg-tab-active/15 text-wa-accent',
  muted: 'bg-wa-pill text-wa-muted',
};
export function StatusPill({ tone = 'muted', children, className }) {
  return (
    <span className={cx('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold leading-5', PILL_TONES[tone], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function QtyStepper({ value, min = 1, max, onChange, label = 'Quantity', size = 'md' }) {
  const btn = cx('grid place-items-center rounded-full text-wa-text transition-colors duration-150 hover:bg-wa-pill-hover disabled:opacity-35 disabled:hover:bg-transparent', size === 'sm' ? 'size-8 text-lg' : 'size-11 text-2xl');
  return (
    <div role="group" aria-label={label} className={cx('inline-flex items-center rounded-full border border-wa-line bg-wa-inset', size === 'sm' ? 'p-0.5' : 'p-1')}>
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Fewer (${label.toLowerCase()})`}>−</button>
      <output aria-live="polite" className={cx('text-center font-semibold tabular-nums text-wa-text', size === 'sm' ? 'w-7 text-sm' : 'w-12 text-lg')}>{value}</output>
      <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`More (${label.toLowerCase()})`}>+</button>
    </div>
  );
}

// Options in a row of pills: one can be on at a time
export function Choices({ label, options, value, onChange, disabled, render, className, layout = 'flex flex-wrap gap-2' }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx(layout, className)}>
      {options.map((opt) => {
        const [key, text] = Array.isArray(opt) ? opt : [opt, opt];
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled?.(key)}
            onClick={() => onChange(key)}
            className={cx(
              'min-w-[64px] rounded-xl border px-4 py-2.5 text-left text-[15px] font-semibold leading-5 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45',
              on ? 'border-tab-active bg-tab-active/12 text-wa-text' : 'border-wa-line text-wa-muted hover:border-wa-muted/60 hover:text-wa-text',
            )}
          >
            {render ? render(key, on) : text}
          </button>
        );
      })}
    </div>
  );
}

// A two-way switch in the style of the page tabs
export function Segmented({ label, options, value, onChange, className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex gap-1 rounded-xl bg-wa-pill p-1', className)}>
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className="grid h-10 flex-1 place-items-center rounded-lg px-3 text-[15px] font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text aria-checked:bg-wa-inset aria-checked:text-wa-text aria-checked:shadow-[0_1px_2px_rgba(10,16,36,0.16)]"
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Toaster() {
  const [list, dismiss] = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] max-lg:bottom-24 flex flex-col items-center gap-2 px-4">
      {list.map((t) => (
        <div key={t.id} className="pointer-events-auto flex animate-[pop-in_0.2s_ease-out] items-center gap-3 rounded-full bg-wa-text py-2.5 pl-5 pr-2.5 text-sm font-semibold leading-5 text-wa-bg shadow-(--wa-shadow)">
          <Check size={16} />
          {t.message}
          {t.action ? (
            <button type="button" onClick={() => { t.action.run(); dismiss(t.id); }} className="rounded-full px-3 py-1 font-bold text-wa-accent hover:bg-wa-bg/10 light:text-[#8fb0ff]">{t.action.label}</button>
          ) : (
            <span className="w-1.5" />
          )}
        </div>
      ))}
    </div>
  );
}

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <p role="status" className="flex items-center gap-3 rounded-2xl border border-wa-warn/40 bg-wa-warn/10 px-4 py-3 text-sm leading-5 text-wa-text">
      <Alert size={20} className="shrink-0 text-wa-warn" />
      You’re offline. You can keep browsing, but buying and selling are paused until you’re back online.
    </p>
  );
}

export function VerifyDialog({ action = 'buy', onClose }) {
  return (
    <NoticeDialog
      id="wa-gc-verify"
      icon={Shield}
      tone="brand"
      title={`Verify to ${action}`}
      onClose={onClose}
      actions={[
        <button key="c" type="button" onClick={onClose} className={cancelBtn}>Not now</button>,
        <a key="v" href="#settings/verification" className={primaryBtn}>Verify now</a>,
      ]}
    >
      Buying and selling gift cards needs a verified account. It takes a few minutes and keeps your money safe.
    </NoticeDialog>
  );
}

// Only for the preview: lets a demo play the supplier or the reviewer. Never part of the real app.
export function PreviewTools({ title = 'Preview tools', children }) {
  return (
    <details className="group rounded-2xl border border-dashed border-wa-line px-5 py-4 text-sm leading-5 text-wa-muted">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-wa-muted hover:text-wa-text">
        <Info size={18} />
        {title}
        <span className="font-normal">· not part of the real app</span>
      </summary>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </details>
  );
}
export const toolBtn = 'inline-flex h-9 items-center rounded-full border border-wa-line px-4 text-sm font-semibold leading-5 text-wa-text transition-colors duration-150 hover:bg-wa-pill disabled:opacity-40';

export function Callout({ tone = 'warn', icon: Icon = Alert, title, children, className }) {
  const tones = { warn: 'border-wa-warn/40 bg-wa-warn/10 [&>svg]:text-wa-warn', danger: 'border-down/40 bg-down/10 [&>svg]:text-down', info: 'border-tab-active/35 bg-tab-active/8 [&>svg]:text-wa-accent', good: 'border-up/40 bg-up/10 [&>svg]:text-up' };
  return (
    <div className={cx('flex gap-3 rounded-2xl border p-4 text-sm leading-5 text-wa-text', tones[tone], className)}>
      <Icon size={20} className="shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}
        <div className={cx(title && 'mt-1', 'text-wa-text/85')}>{children}</div>
      </div>
    </div>
  );
}

// On phones and tablets the summary column drops below the form, so the amount and the main action
// stay in reach in a bar along the bottom of the screen
export function MobileBar({ label, amount, action, onAction, disabled, href }) {
  const btn = 'inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-tab-active px-6 text-base font-bold leading-6 text-white hover:bg-brand-strong disabled:pointer-events-none disabled:opacity-50';
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-wa-line bg-wa-card/95 px-4 py-3 shadow-(--wa-shadow) backdrop-blur-md lg:hidden">
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-4 text-wa-muted">{label}</p>
        <p className="truncate text-lg font-semibold leading-6 text-wa-text tabular-nums">{amount}</p>
      </div>
      {href ? <a href={href} className={btn}>{action}</a> : <button type="button" disabled={disabled} onClick={onAction} className={btn}>{action}</button>}
    </div>
  );
}

// "Step 2 of 4" with the steps named, for the sell flow
export function StepIndicator({ steps, current }) {
  return (
    <nav aria-label="Sell steps">
      <p className="text-sm font-semibold leading-5 text-wa-muted">Step {current + 1} of {steps.length}<span className="sm:hidden"> · {steps[current]}</span></p>
      <ol className="mt-2 flex gap-2">
        {steps.map((name, i) => (
          <li key={name} className="min-w-0 flex-1" aria-current={i === current ? 'step' : undefined}>
            <span className={cx('block h-1.5 rounded-full transition-colors duration-300', i <= current ? 'bg-tab-active' : 'bg-wa-pill')} />
            <span className={cx('mt-1.5 block truncate text-xs font-semibold leading-4 max-sm:hidden', i === current ? 'text-wa-text' : 'text-wa-muted')}>{name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// A number that eases to its new value (200 ms), as the payout does when the card details change
export function CountTo({ value, format }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      from.current = value;
      return undefined;
    }
    let frame;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / 200);
      const v = a + (value - a) * (1 - (1 - k) ** 3);
      setShown(v);
      from.current = v;
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return format(shown);
}

export function timeAgo(at, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - at) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  const days = Math.round(mins / 1440);
  return days === 1 ? 'Yesterday' : days < 7 ? `${days} days ago` : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(at);
}

export const dateTime = (at) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(at);

export function timeLeft(ms) {
  const mins = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(mins / 60);
  return h ? `${h} h ${mins % 60} min` : `${mins} min`;
}

/* ——— Photos ——— */

// Reads a photo, scales it down (it's kept in this browser) and scores its sharpness:
// the variance of a Laplacian over a small grey copy. Low variance means few edges, so a blurry shot.
export async function readPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 720 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.72);

    const w = 160;
    const h = Math.max(1, Math.round((img.height / img.width) * w));
    const small = document.createElement('canvas');
    small.width = w;
    small.height = h;
    const sctx = small.getContext('2d');
    sctx.drawImage(img, 0, 0, w, h);
    const px = sctx.getImageData(0, 0, w, h).data;
    const grey = new Float32Array(w * h);
    for (let i = 0; i < w * h; i += 1) grey[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
    let sum = 0;
    let sq = 0;
    let n = 0;
    for (let y = 1; y < h - 1; y += 1) {
      for (let x = 1; x < w - 1; x += 1) {
        const i = y * w + x;
        const lap = grey[i - 1] + grey[i + 1] + grey[i - w] + grey[i + w] - 4 * grey[i];
        sum += lap;
        sq += lap * lap;
        n += 1;
      }
    }
    const variance = n ? sq / n - (sum / n) ** 2 : 0;
    return { data, small: Math.max(img.width, img.height) < 400, blurry: variance < 60 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// One photo slot: drop, choose or (on phones) take a photo; shows upload progress, then the thumbnail
export function PhotoSlot({ id, label, hint, value, onChange, required, error, compact }) {
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const [warning, setWarning] = useState('');
  const [progress, setProgress] = useState(null);
  const online = useOnline();
  // A slot still marked as uploading with no upload running here was cut off by a reload
  const failed = value?.failed || (value?.uploading && progress == null);

  const take = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setWarning('Choose a photo (JPG, PNG or HEIC).');
      return;
    }
    setWarning('');
    try {
      const photo = await readPhoto(file);
      if (photo.small) setWarning('This photo is too small to read. Retake it closer to the card.');
      else if (photo.blurry) setWarning('This photo looks blurry. Retake it so the code is readable.');
      upload(photo.data);
    } catch {
      setWarning('We couldn’t read that file. Try another photo.');
    }
  };

  // The preview has nowhere to upload to, so the progress is simulated; offline uploads fail and can be retried
  const upload = (data) => {
    setProgress(0);
    onChange({ data, uploading: Date.now() });
    const start = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - start) / 900);
      setProgress(k);
      if (k < 1) requestAnimationFrame(step);
      else {
        setProgress(null);
        onChange(navigator.onLine ? { data } : { data, failed: true });
      }
    };
    requestAnimationFrame(step);
  };

  const describe = value?.data ? (failed ? 'upload failed' : progress != null ? 'uploading' : 'added') : 'missing';

  return (
    <div>
      <p className="mb-2 flex items-baseline justify-between gap-2 text-sm font-semibold leading-5 text-wa-text">
        <span id={`${id}-label`}>{label}{!required && <span className="font-normal text-wa-muted"> · optional</span>}</span>
        <span className="sr-only">, {describe}</span>
      </p>
      {value?.data ? (
        <div className={cx('relative overflow-hidden rounded-2xl border bg-wa-inset', failed || error ? 'border-down' : 'border-wa-line')}>
          <img src={value.data} alt={`${label} photo`} className={cx('w-full object-cover', compact ? 'aspect-[16/10]' : 'aspect-[16/9]')} />
          {progress != null && (
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
              <span className="block h-full bg-tab-active transition-[width] duration-75" style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
          )}
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" onClick={() => input.current.click()} className="rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold leading-4 text-white backdrop-blur-sm hover:bg-black/80">Retake</button>
            <button type="button" aria-label={`Remove ${label} photo`} onClick={() => { onChange(null); setWarning(''); }} className="grid size-7 place-items-center rounded-full bg-black/65 text-white backdrop-blur-sm hover:bg-black/80"><Close size={14} /></button>
          </div>
          {failed && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-down/90 px-3 py-2 text-xs font-semibold leading-4 text-white">
              Upload failed.
              <button type="button" disabled={!online} onClick={() => upload(value.data)} className="rounded-full bg-white/20 px-3 py-1 font-bold hover:bg-white/30 disabled:opacity-50">Try again</button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current.click()}
          aria-describedby={`${id}-label`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
          className={cx('grid w-full place-items-center gap-3 rounded-2xl border-2 border-dashed text-center transition-colors duration-150 hover:border-tab-active hover:bg-tab-active/5', compact ? 'aspect-[16/10]' : 'aspect-[16/9]', drag ? 'border-tab-active bg-tab-active/8' : error ? 'border-down/70' : 'border-wa-line')}
        >
          <span className="grid justify-items-center gap-2">
            <span className="grid size-11 place-items-center rounded-full bg-tab-active/12 text-wa-accent"><Upload size={20} /></span>
            <span className="text-[15px] font-semibold leading-5 text-wa-text">Add photo</span>
          </span>
        </button>
      )}
      {/* capture opens the camera on phones; on a computer it is an ordinary file picker */}
      <input ref={input} id={id} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} onChange={(e) => { take(e.target.files[0]); e.target.value = ''; }} />
      {warning && <p className="mt-2 flex gap-1.5 text-sm leading-5 text-wa-warn"><Alert size={16} className="mt-0.5 shrink-0" />{warning}</p>}
      {error && !warning && <p className="mt-2 text-sm leading-5 text-down">{error}</p>}
    </div>
  );
}

/* ——— Quiet building blocks for the simplified screens ——— */

// A form group: a short label above its control, no box or hint line
export function Group({ label, aside, children, className }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold leading-5 text-wa-muted">{label}</p>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

// Pay or payout choices as one quiet list. Mobile money is a single row; its accounts are picked from a menu
// once it's chosen, so several saved numbers don't crowd the screen.
// `value` is { kind, accountId }; options are { id, label, detail, icon, disabled, note }.
export function PayOptions({ label, options, accounts = [], value, onChange, renderAccount }) {
  return (
    <div role="radiogroup" aria-label={label} className="divide-y divide-wa-line overflow-hidden rounded-2xl border border-wa-line">
      {options.map((o) => {
        const on = value?.kind === o.id;
        return (
          <div key={o.id} className={cx('transition-colors duration-150', on && 'bg-tab-active/8')}>
            <label className={cx('flex items-center gap-4 px-5 py-4', o.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-wa-pill/40')}>
              <input type="radio" name={label} className="sr-only" disabled={o.disabled} checked={on} onChange={() => onChange({ kind: o.id, accountId: o.id === 'momo' ? value?.accountId || accounts[0]?.id : undefined })} />
              {o.icon}
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-5 text-wa-text">{o.label}</span>
                {o.detail && <span className="mt-0.5 block truncate text-sm leading-5 text-wa-muted tabular-nums">{o.detail}</span>}
              </span>
              {o.note}
              <span className={cx('grid size-5 shrink-0 place-items-center rounded-full border', on ? 'border-tab-active bg-tab-active text-white' : 'border-wa-line text-transparent')}><Check size={12} /></span>
            </label>
            {on && o.id === 'momo' && accounts.length > 1 && (
              <div className="px-5 pb-4 pl-[68px]">
                <label className="sr-only" htmlFor={`${label}-account`}>Mobile money account</label>
                <select id={`${label}-account`} value={value.accountId} onChange={(e) => onChange({ kind: 'momo', accountId: e.target.value })} className="h-11 w-full rounded-xl border border-wa-line bg-wa-inset px-3 text-[15px] font-semibold text-wa-text outline-none focus:border-tab-active">
                  {accounts.map((a) => <option key={a.id} value={a.id}>{renderAccount(a)}</option>)}
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
