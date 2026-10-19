import React, { useId, useRef, useState } from 'react';
import { links } from '../links.js';
import defaultAvatar from '../assets/wa-avatar.jpg';
import { cx } from '../ui.js';
import { countryList, useAlerts, useDeletionRequest, useProfile, useSecurity, useVerification } from './account.js';
import { FieldError, Modal, NoticeDialog, QrCode, cancelBtn, dangerBtn, field, fieldBorder, pillTab, primaryBtn } from './flow.jsx';
import { Check, ChevronRight, ChevronUpDown, Clipboard, Eye, EyeOff, IdCard, Info, Mail, Phone, Shield, Trash, Upload } from './icons.jsx';
import { card } from './parts.jsx';
import { checkCode, newSecret, otpauthUri, spacedSecret } from './totp.js';

// Settings (Figma 379:113346 and its states). Sections are pill tabs, as on Payment methods, at #settings/<tab>.
// Nothing reaches a server yet: changes are kept in this browser and each flow says so where it matters.

export const SETTINGS_TABS = [
  ['profile', 'Profile'],
  ['security', 'Security'],
  ['verification', 'Verification'],
  ['notifications', 'Notifications'],
];
// Reached from Security; shown as a tab only while open, as in the Figma
const DELETE_TAB = ['delete-account', 'Delete Account'];

// Ghana numbers: ten digits starting with 0
const PHONE_PATTERN = /^0\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const labelClass = 'text-sm font-medium leading-5 text-wa-muted';
const panel = cx(card, 'rounded-[20px] p-[21px]');
const panelTitle = 'text-xl leading-6 tracking-[-0.14px] text-wa-text';
const inputClass = 'min-w-0 flex-1 bg-transparent text-sm font-medium leading-5 text-wa-text outline-none placeholder:font-normal placeholder:text-wa-muted';
const smallBtn = 'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold leading-6 tracking-[-0.15px] transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50';

function SectionHead({ title, children }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-wa-line pb-4">
      <h2 className="text-[26px] font-semibold leading-8 tracking-[-0.14px] text-wa-text max-sm:text-[22px]">{title}</h2>
      {children}
    </div>
  );
}

function TextField({ id, label, error, hint, className, children, ...input }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className={cx(field, fieldBorder(error), 'mt-2 flex h-[50px] items-center gap-2 px-3.5')}>
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={hint ? `${id}-hint` : undefined} className={inputClass} {...input} />
        {children}
      </div>
      {error ? <FieldError>{error}</FieldError> : hint && <p id={`${id}-hint`} className="mt-1.5 text-xs leading-4 text-wa-muted">{hint}</p>}
    </div>
  );
}

function PasswordField(props) {
  const [shown, setShown] = useState(false);
  return (
    <TextField type={shown ? 'text' : 'password'} {...props}>
      <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide password' : 'Show password'} className="grid size-8 shrink-0 place-items-center rounded-full text-wa-muted hover:bg-wa-pill hover:text-wa-text">
        {shown ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </TextField>
  );
}

function Toggle({ checked, onChange, label, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-tab-active' : 'bg-[#c9ccd6] dark:bg-[#373c52]')}
    >
      <span className={cx('absolute top-0.5 size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(16,24,40,0.1),0_1px_2px_rgba(16,24,40,0.06)] transition-[left] duration-200', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

// A row with a title, a short description and a switch; rows are separated by rules
function ToggleRow({ id, title, text, checked, onChange }) {
  return (
    <div className="flex items-start gap-5">
      <div className="min-w-0 flex-1 tracking-[-0.14px]">
        <p id={`${id}-title`} className="text-lg leading-6 text-wa-text max-sm:text-base">{title}</p>
        <p id={`${id}-text`} className="text-xs leading-5 text-wa-muted">{text}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} describedBy={`${id}-text`} />
    </div>
  );
}

const Rule = () => <div className="h-px bg-wa-line" />;

// A tinted row that opens something (Change password, Delete account, verification steps)
// With neither `href` nor `onClick` it is a plain row with nothing to open
function ActionRow({ icon: Icon, tint, title, text, onClick, href, trailing }) {
  const Tag = href ? 'a' : onClick ? 'button' : 'div';
  const interactive = Tag !== 'div';
  return (
    <Tag
      {...(href ? { href } : onClick ? { type: 'button', onClick } : {})}
      className={cx('flex min-h-20 w-full items-center gap-3 rounded-2xl border border-wa-line bg-wa-pill/70 p-2.5 pr-3 text-left transition-colors duration-150', interactive && 'hover:border-tab-active hover:bg-wa-pill')}
    >
      <span className={cx('grid size-[45px] shrink-0 place-items-center rounded-full', tint)}><Icon size={24} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-medium leading-5 text-wa-text">{title}</span>
        <span className="mt-1 block text-sm leading-[1.2] text-wa-muted">{text}</span>
      </span>
      {trailing}
      {interactive && <ChevronRight size={20} className="shrink-0 text-wa-muted" />}
    </Tag>
  );
}

const StatusChip = ({ tone, children }) => (
  <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-4', tone === 'good' ? 'bg-up/15 text-up' : tone === 'warn' ? 'bg-[#ff9500]/15 text-[#c27100] dark:text-[#ff9500]' : 'bg-wa-pill text-wa-muted')}>
    {tone === 'good' && <Check size={12} />}
    {children}
  </span>
);

const PreviewNote = ({ children }) => <p className="mt-3 text-xs leading-4 text-wa-muted">{children}</p>;

/* ——— Profile ——— */

// Shrinks a chosen photo to a small square so it can be kept in the browser
function squareAvatar(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const side = Math.min(img.width, img.height);
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });
}

function ProfileTab() {
  const [profile, setProfile] = useProfile();
  const [draft, setDraft] = useState(profile);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const fileRef = useRef(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const set = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    setStatus('');
  };
  const errors = {
    firstName: draft.firstName.trim() ? '' : 'Enter your first name.',
    lastName: draft.lastName.trim() ? '' : 'Enter your last name.',
  };
  const show = (key) => attempted && errors[key];

  const pickAvatar = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setAvatarError('Choose an image file, such as a JPG or PNG.');
    if (file.size > 10 * 1024 * 1024) return setAvatarError('Choose an image smaller than 10 MB.');
    try {
      const avatar = await squareAvatar(file);
      setDraft((d) => ({ ...d, avatar }));
      setAvatarError('');
      setStatus('');
    } catch {
      setAvatarError('That image couldn’t be read. Try another one.');
    }
  };

  const save = (e) => {
    e.preventDefault();
    setAttempted(true);
    const first = Object.keys(errors).find((key) => errors[key]);
    if (first) return document.getElementById(`wa-set-${first}`)?.focus();
    const clean = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
    setProfile(clean);
    setDraft(clean);
    setStatus('Changes saved');
  };

  return (
    <form onSubmit={save} noValidate className="grid gap-5">
      <SectionHead title="Profile">
        <div className="flex items-center gap-3">
          <span role="status" className="flex items-center gap-1.5 text-sm font-semibold leading-5 text-up">{status && <><Check size={16} />{status}</>}</span>
          {dirty && <button type="button" onClick={() => { setDraft(profile); setAttempted(false); }} className="text-sm font-semibold leading-5 text-wa-muted hover:text-wa-text">Discard</button>}
          <button type="submit" disabled={!dirty} className={cx(smallBtn, 'bg-tab-active text-white hover:bg-brand-strong')}>Save Changes</button>
        </div>
      </SectionHead>

      <section className={panel} aria-label="Your details">
        <div className="flex flex-wrap items-center gap-3">
          <img src={draft.avatar || defaultAvatar} alt="" width="50" height="50" className="size-[50px] rounded-full object-cover" />
          <button type="button" onClick={() => fileRef.current.click()} className="inline-flex h-9 items-center gap-2 rounded-full bg-wa-pill px-4 text-xs font-semibold leading-4 text-wa-muted transition-colors duration-150 hover:bg-wa-pill-hover hover:text-wa-text">
            <Upload size={14} />
            Change avatar
          </button>
          {draft.avatar && (
            <button type="button" onClick={() => setDraft((d) => ({ ...d, avatar: null }))} className="text-xs font-semibold leading-4 text-wa-muted hover:text-down">Remove</button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={pickAvatar} />
        </div>
        <FieldError>{avatarError}</FieldError>
        <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-4 max-sm:grid-cols-1">
          <TextField id="wa-set-firstName" label="First Name" value={draft.firstName} onChange={set('firstName')} placeholder="Enter first name" autoComplete="given-name" error={show('firstName')} />
          <TextField id="wa-set-lastName" label="Last Name" value={draft.lastName} onChange={set('lastName')} placeholder="Enter last name" autoComplete="family-name" error={show('lastName')} />
        </div>
      </section>

      <section className={panel} aria-labelledby="wa-set-address">
        <h3 id="wa-set-address" className={panelTitle}>Address</h3>
        <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-4 max-sm:grid-cols-1">
          <div>
            <label htmlFor="wa-set-country" className={labelClass}>Country</label>
            <div className={cx(field, 'relative mt-2 flex h-[50px] items-center border-wa-line focus-within:border-tab-active')}>
              <select id="wa-set-country" value={draft.country} onChange={set('country')} autoComplete="country" className={cx(inputClass, 'h-full appearance-none rounded-2xl px-3.5 pr-10 dark:[color-scheme:dark]')}>
                <option value="">Select country</option>
                {countryList().map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              <ChevronUpDown size={18} className="pointer-events-none absolute right-3.5 text-wa-muted" />
            </div>
          </div>
          <TextField id="wa-set-city" label="City" value={draft.city} onChange={set('city')} placeholder="Enter name of city" autoComplete="address-level2" />
          <TextField id="wa-set-state" label="State" value={draft.state} onChange={set('state')} placeholder="Enter name of state" autoComplete="address-level1" />
          <TextField id="wa-set-street" label="Street" value={draft.street} onChange={set('street')} placeholder="Enter name of street" autoComplete="address-line1" />
          <TextField id="wa-set-zip" label="Zip Code" value={draft.zip} onChange={set('zip')} placeholder="Enter zip code" autoComplete="postal-code" maxLength={12} />
        </div>
      </section>
    </form>
  );
}

/* ——— Security ——— */

function ChangePasswordDialog({ onClose, onDone }) {
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [attempted, setAttempted] = useState(false);
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const errors = {
    current: values.current ? '' : 'Enter your current password.',
    next: values.next.length < 6 ? 'Use at least 6 characters.' : values.next === values.current ? 'Choose a password different from your current one.' : '',
    confirm: !values.confirm ? 'Enter the new password again.' : values.confirm !== values.next ? 'The passwords don’t match.' : '',
  };
  const show = (key) => attempted && errors[key];

  const submit = (e) => {
    e.preventDefault();
    setAttempted(true);
    const first = Object.keys(errors).find((key) => errors[key]);
    if (first) return document.getElementById(`wa-pw-${first}`)?.focus();
    onDone();
  };

  return (
    <Modal labelledBy="wa-pw-title" onClose={onClose} className="max-w-[550px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-pw-title" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">Change Password</h3>
        <div className="mt-4 grid gap-4">
          <PasswordField id="wa-pw-current" label="Current Password" value={values.current} onChange={set('current')} placeholder="Enter current password" autoComplete="current-password" error={show('current')} />
          <PasswordField id="wa-pw-next" label="New Password" value={values.next} onChange={set('next')} placeholder="Enter new password" autoComplete="new-password" error={show('next')} hint="Minimum 6 characters" />
          <PasswordField id="wa-pw-confirm" label="Confirm New Password" value={values.confirm} onChange={set('confirm')} placeholder="Confirm password" autoComplete="new-password" error={show('confirm')} hint="Minimum 6 characters" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3.5">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Update Password</button>
        </div>
      </form>
    </Modal>
  );
}

// Six-digit code box shared by the 2FA and phone flows
function CodeField({ id, value, onChange, error }) {
  return (
    <TextField
      id={id}
      label="Verification code"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      error={error}
      className="[&_input]:font-mono [&_input]:text-lg [&_input]:tracking-[0.4em]"
    />
  );
}

function AuthenticatorSetup({ email, onClose, onDone }) {
  const [secret] = useState(newSecret);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // The key stays visible to copy by hand
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return setError('Enter the 6-digit code from your authenticator app.');
    setChecking(true);
    const ok = await checkCode(secret, code);
    setChecking(false);
    if (!ok) return setError('That code didn’t match. Use the newest code in the app, and check your phone’s time is set automatically.');
    onDone(secret);
  };

  return (
    <Modal labelledBy="wa-2fa-app" onClose={onClose} className="max-w-[520px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-2fa-app" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">Set up Google Authenticator</h3>
        <ol className="mt-4 grid gap-5 text-sm leading-5 text-wa-muted">
          <li>
            <span className="font-semibold text-wa-text">1. Scan this QR code</span> with Google Authenticator or any authenticator app.
            <div className="mt-4"><QrCode value={otpauthUri(secret, email)} label="QR code to add Mybitstore to your authenticator app" size={168} /></div>
            <p className="mt-4 text-center">Can’t scan it? Enter this key instead:</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <code className="rounded-lg bg-wa-pill px-3 py-1.5 font-mono text-[13px] leading-5 text-wa-text">{spacedSecret(secret)}</code>
              <button type="button" onClick={copy} aria-label="Copy key" className="grid size-8 place-items-center rounded-full text-wa-muted hover:bg-wa-pill hover:text-wa-text">
                {copied ? <Check size={16} className="text-up" /> : <Clipboard size={16} />}
              </button>
            </div>
          </li>
          <li>
            <span className="font-semibold text-wa-text">2. Enter the 6-digit code</span> the app shows for Mybitstore.
            <div className="mt-3">
              <CodeField id="wa-2fa-app-code" value={code} onChange={(v) => { setCode(v); setError(''); }} error={error} />
            </div>
          </li>
        </ol>
        <div className="mt-7 grid grid-cols-2 gap-3.5">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" disabled={checking} className={primaryBtn}>{checking ? 'Checking…' : 'Turn on'}</button>
        </div>
        <PreviewNote>Preview: the key is kept in this browser only. Remove the Mybitstore entry from your app when you’re done testing.</PreviewNote>
      </form>
    </Modal>
  );
}

// Email or text-message codes: send a code, then type it back. With no backend, the code is shown on screen.
function CodeSetup({ kind, email, phoneNumber, title, onClose, onDone }) {
  const byPhone = kind === 'phone';
  const [number, setNumber] = useState(phoneNumber || '');
  const [sent, setSent] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const send = () => {
    if (byPhone && !PHONE_PATTERN.test(number)) return setError('Enter your 10-digit phone number, starting with 0.');
    setSent(String(crypto.getRandomValues(new Uint32Array(1))[0] % 1e6).padStart(6, '0'));
    setCode('');
    setError('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!sent) return send();
    if (code !== sent) return setError(code.length === 6 ? 'That code isn’t right. Check it and try again.' : 'Enter the 6-digit code.');
    onDone(number);
  };

  const target = byPhone ? number : email;
  return (
    <Modal labelledBy="wa-code-setup" onClose={onClose} className="max-w-[520px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-code-setup" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">{title}</h3>
        {byPhone && !sent ? (
          <>
            <p className="mt-2 text-sm leading-5 text-wa-muted">We’ll text a 6-digit code to this number.</p>
            <TextField id="wa-code-phone" label="Phone Number" value={number} onChange={(e) => { setNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }} inputMode="tel" autoComplete="tel-national" placeholder="0000000000" error={error} className="mt-4" />
          </>
        ) : !sent ? (
          <p className="mt-2 text-sm leading-5 text-wa-muted">We’ll send a 6-digit code to <span className="font-semibold text-wa-text">{email}</span>.</p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-5 text-wa-muted">
              Enter the code sent to <span className="font-semibold text-wa-text">{target}</span>.{' '}
              <button type="button" onClick={send} className="font-semibold text-wa-accent hover:underline">Send a new code</button>
              {byPhone && <> · <button type="button" onClick={() => setSent(null)} className="font-semibold text-wa-accent hover:underline">Change number</button></>}
            </p>
            <div className="mt-4"><CodeField id="wa-code-input" value={code} onChange={(v) => { setCode(v); setError(''); }} error={error} /></div>
            <p className="mt-3 rounded-xl border border-dashed border-wa-line px-3 py-2 text-xs leading-4 text-wa-muted">
              Preview: no {byPhone ? 'text message' : 'email'} is sent yet. Your code is <span className="font-mono font-semibold text-wa-text">{sent}</span>.
            </p>
          </>
        )}
        <div className="mt-7 grid grid-cols-2 gap-3.5">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>{sent ? 'Verify' : 'Send code'}</button>
        </div>
      </form>
    </Modal>
  );
}

const TWO_FA = [
  { key: 'authenticator', title: 'Google Authenticator (2FA)', text: 'Use the Authenticator to get verification codes for better security.' },
  { key: 'email', title: 'E-mail address verification (2FA)', text: 'Get a code sent to your email address.' },
  { key: 'phone', title: 'Phone Number', text: 'Receive a one-time code via text message.' },
];

function SecurityTab() {
  const [profile] = useProfile();
  const [security, setSecurity] = useSecurity();
  const [, setVerification] = useVerification();
  // null, 'password', 'password-done', 'setup-<key>' or 'off-<key>'
  const [dialog, setDialog] = useState(null);
  const [notice, setNotice] = useState('');
  const close = () => setDialog(null);

  const enabled = TWO_FA.filter((m) => security[m.key]).length;
  const percent = 25 + enabled * 25;
  const level = enabled === 0 ? 'low' : enabled === 3 ? 'high' : 'good';
  const message = {
    low: 'Your account security is low. Turn on two-factor authentication (2FA) to protect it.',
    good: 'Your account security is good. Enable 2FA to increase account security level.',
    high: 'Your account security is excellent. Every 2FA option is on.',
  }[level];

  const turnOn = (key, extra = {}) => {
    setSecurity((s) => ({ ...s, [key]: true, ...extra }));
    setNotice(`${TWO_FA.find((m) => m.key === key).title} turned on.`);
    close();
  };
  const turnOff = (key) => {
    setSecurity((s) => ({ ...s, [key]: false, ...(key === 'authenticator' ? { authenticatorSecret: null } : {}) }));
    setNotice(`${TWO_FA.find((m) => m.key === key).title} turned off.`);
    close();
  };
  const offMethod = dialog?.startsWith('off-') && TWO_FA.find((m) => `off-${m.key}` === dialog);

  return (
    <div className="grid gap-5">
      <SectionHead title="Security Center">
        <span className={cx('text-base font-semibold leading-6', level === 'high' ? 'text-up' : 'text-[#c27100] dark:text-[#ff9500]')}>{percent}% complete</span>
      </SectionHead>

      <p className={cx('flex items-center gap-4 rounded-[10px] border p-2.5 text-sm font-semibold leading-5', level === 'high' ? 'border-up/25 bg-up/10 text-up' : 'border-[#ff9500]/20 bg-[#ff9500]/10 text-[#c27100] dark:text-[#ff9500]')}>
        <Info size={24} className="shrink-0" />
        {message}
      </p>

      <section className={panel} aria-labelledby="wa-sec-account">
        <h3 id="wa-sec-account" className={panelTitle}>Account Security</h3>
        <div className="mt-5 grid gap-3">
          <ActionRow icon={Shield} tint="bg-[rgba(52,199,89,0.3)] text-[#1f8a3e] dark:text-[#5fd17f]" title="Change Password" text="Update your password to enhance security." onClick={() => setDialog('password')} />
          <ActionRow icon={Trash} tint="bg-[rgba(247,10,10,0.2)] text-down" title="Delete Account Permanently" text="Permanently delete your account and all data to close account." href="#settings/delete-account" />
        </div>
      </section>

      <section className={panel} aria-labelledby="wa-sec-2fa">
        <h3 id="wa-sec-2fa" className={panelTitle}>2FA (Two-Factor Authentication) options</h3>
        <div className="mt-5 grid gap-5">
          {TWO_FA.map((m, i) => (
            <React.Fragment key={m.key}>
              {i > 0 && <Rule />}
              <ToggleRow
                id={`wa-2fa-${m.key}`}
                title={m.title}
                text={m.key === 'phone' && security.phone ? `${m.text} Codes go to ${security.phoneNumber}.` : m.text}
                checked={security[m.key]}
                onChange={(on) => setDialog(`${on ? 'setup' : 'off'}-${m.key}`)}
              />
            </React.Fragment>
          ))}
        </div>
      </section>
      <p className="sr-only" role="status">{notice}</p>

      {dialog === 'password' && <ChangePasswordDialog onClose={close} onDone={() => setDialog('password-done')} />}
      {dialog === 'password-done' && (
        <NoticeDialog
          id="wa-pw-done"
          icon={Shield}
          tone="brand"
          title="Password Updated"
          onClose={close}
          actions={[<a key="login" href={links.login} className={primaryBtn}>Login Now</a>]}
        >
          <p>You have successfully updated your password. Log in now to access account</p>
          <PreviewNote>Preview: your real password wasn’t changed.</PreviewNote>
        </NoticeDialog>
      )}
      {dialog === 'setup-authenticator' && <AuthenticatorSetup email={profile.email} onClose={close} onDone={(secret) => turnOn('authenticator', { authenticatorSecret: secret })} />}
      {dialog === 'setup-email' && <CodeSetup kind="email" email={profile.email} title="Turn on email codes" onClose={close} onDone={() => turnOn('email')} />}
      {dialog === 'setup-phone' && (
        <CodeSetup
          kind="phone"
          phoneNumber={security.phoneNumber}
          title="Turn on text-message codes"
          onClose={close}
          onDone={(number) => {
            turnOn('phone', { phoneNumber: number });
            setVerification((v) => ({ ...v, phone: 'verified', phoneNumber: number }));
          }}
        />
      )}
      {offMethod && (
        <NoticeDialog
          id="wa-2fa-off"
          icon={Shield}
          title={`Turn off ${offMethod.title.replace(' (2FA)', '')}?`}
          onClose={close}
          actions={[
            <button key="cancel" type="button" onClick={close} className={cancelBtn}>Cancel</button>,
            <button key="off" type="button" onClick={() => turnOff(offMethod.key)} className={dangerBtn}>Turn off</button>,
          ]}
        >
          <p>{enabled === 1 ? 'This is your only 2FA option. Your account will be protected by your password alone.' : 'Your account will be less protected.'}</p>
        </NoticeDialog>
      )}
    </div>
  );
}

/* ——— Verification ——— */

const DOCUMENTS = [
  { id: 'ghana-card', name: 'Ghana Card', sides: 2 },
  { id: 'passport', name: 'Passport', sides: 1 },
  { id: 'licence', name: 'Driver’s licence', sides: 2 },
];

function FilePick({ id, label, file, onPick, error }) {
  return (
    <div>
      <span className={labelClass} id={`${id}-label`}>{label}</span>
      <label
        htmlFor={id}
        className={cx('mt-2 flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-3.5 py-3 transition-colors duration-150 hover:border-tab-active has-focus-visible:border-tab-active', error ? 'border-down' : 'border-wa-line')}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wa-pill text-wa-muted"><Upload size={18} /></span>
        <span className="min-w-0 flex-1 truncate text-sm leading-5 text-wa-text">{file ? file.name : <span className="text-wa-muted">Choose a photo or PDF</span>}</span>
        {file && <Check size={18} className="shrink-0 text-up" />}
        <input id={id} type="file" accept="image/*,application/pdf" className="sr-only" aria-labelledby={`${id}-label`} onChange={(e) => onPick(e.target.files[0] || null)} />
      </label>
      <FieldError>{error}</FieldError>
    </div>
  );
}

function IdentityDialog({ onClose, onDone }) {
  const [docId, setDocId] = useState('ghana-card');
  const [files, setFiles] = useState({ front: null, back: null });
  const [attempted, setAttempted] = useState(false);
  const doc = DOCUMENTS.find((d) => d.id === docId);
  const tooBig = (f) => f && f.size > 10 * 1024 * 1024;
  const errors = {
    front: !files.front ? 'Add a photo of the front.' : tooBig(files.front) ? 'Choose a file smaller than 10 MB.' : '',
    back: doc.sides < 2 ? '' : !files.back ? 'Add a photo of the back.' : tooBig(files.back) ? 'Choose a file smaller than 10 MB.' : '',
  };
  const submit = (e) => {
    e.preventDefault();
    setAttempted(true);
    if (errors.front || errors.back) return;
    onDone(doc.name);
  };

  return (
    <Modal labelledBy="wa-id-title" onClose={onClose} className="max-w-[550px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-id-title" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">Verify your identity</h3>
        <p className="mt-1 text-sm leading-5 text-wa-muted">Use a valid document in your name. Make sure all four corners are visible and the text is sharp.</p>
        <fieldset className="mt-5">
          <legend className={labelClass}>Document type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DOCUMENTS.map((d) => (
              <label key={d.id} className="cursor-pointer rounded-full border border-wa-line px-4 py-2 text-sm font-semibold leading-5 text-wa-muted transition-colors duration-150 hover:text-wa-text has-checked:border-tab-active has-checked:bg-tab-active/12 has-checked:text-wa-text has-focus-visible:outline-2 has-focus-visible:outline-tab-active">
                <input type="radio" name="wa-id-doc" className="sr-only" checked={docId === d.id} onChange={() => setDocId(d.id)} />
                {d.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 grid gap-4">
          <FilePick id="wa-id-front" label={doc.sides > 1 ? 'Front' : 'Photo page'} file={files.front} onPick={(f) => setFiles((x) => ({ ...x, front: f }))} error={attempted && errors.front} />
          {doc.sides > 1 && <FilePick id="wa-id-back" label="Back" file={files.back} onPick={(f) => setFiles((x) => ({ ...x, back: f }))} error={attempted && errors.back} />}
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3.5">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Submit</button>
        </div>
        <PreviewNote>Preview: files aren’t uploaded anywhere yet.</PreviewNote>
      </form>
    </Modal>
  );
}

function VerificationTab() {
  const [profile] = useProfile();
  const [security, setSecurity] = useSecurity();
  const [verification, setVerification] = useVerification();
  const [dialog, setDialog] = useState(null);
  const close = () => setDialog(null);
  const done = ['email', 'phone', 'identity'].filter((k) => verification[k] === 'verified').length;

  return (
    <div className="grid gap-5">
      <SectionHead title="Verification">
        <span className="text-base font-semibold leading-6 text-wa-muted">{done} of 3 verified</span>
      </SectionHead>
      <p className="text-sm leading-5 text-wa-muted">Verified details help keep your account secure and let us reach you about your trades.</p>

      <section className={panel} aria-label="Verification steps">
        <div className="grid gap-3">
          <ActionRow
            icon={Mail}
            tint="bg-tab-active/15 text-wa-accent"
            title="Email address"
            text={profile.email}
            onClick={verification.email === 'verified' ? undefined : () => setDialog('email')}
            trailing={verification.email === 'verified' ? <StatusChip tone="good">Verified</StatusChip> : <StatusChip>Verify</StatusChip>}
          />
          <ActionRow
            icon={Phone}
            tint="bg-[rgba(52,199,89,0.3)] text-[#1f8a3e] dark:text-[#5fd17f]"
            title="Phone number"
            text={verification.phone === 'verified' ? verification.phoneNumber : 'Add a phone number to receive codes and alerts by text.'}
            onClick={() => setDialog('phone')}
            trailing={verification.phone === 'verified' ? <StatusChip tone="good">Verified</StatusChip> : <StatusChip>Add</StatusChip>}
          />
          <ActionRow
            icon={IdCard}
            tint="bg-[#9bb6ff]/40 text-[#2b4fb3] dark:text-[#9bb6ff]"
            title="Identity document"
            text={verification.identity === 'review' ? `${verification.document} submitted. We’ll let you know once it’s checked.` : verification.identity === 'verified' ? verification.document : 'Upload a Ghana Card, passport or driver’s licence.'}
            onClick={verification.identity === 'none' ? () => setDialog('identity') : undefined}
            trailing={verification.identity === 'review' ? <StatusChip tone="warn">Under review</StatusChip> : verification.identity === 'verified' ? <StatusChip tone="good">Verified</StatusChip> : <StatusChip>Start</StatusChip>}
          />
        </div>
      </section>

      {dialog === 'email' && <CodeSetup kind="email" email={profile.email} title="Verify your email" onClose={close} onDone={() => { setVerification((v) => ({ ...v, email: 'verified' })); close(); }} />}
      {dialog === 'phone' && (
        <CodeSetup
          kind="phone"
          phoneNumber={verification.phoneNumber}
          title={verification.phone === 'verified' ? 'Change phone number' : 'Add your phone number'}
          onClose={close}
          onDone={(number) => {
            setVerification((v) => ({ ...v, phone: 'verified', phoneNumber: number }));
            // Text-message codes follow the verified number
            if (security.phone) setSecurity((s) => ({ ...s, phoneNumber: number }));
            close();
          }}
        />
      )}
      {dialog === 'identity' && <IdentityDialog onClose={close} onDone={(document) => { setVerification((v) => ({ ...v, identity: 'review', document })); close(); }} />}
    </div>
  );
}

/* ——— Notifications ——— */

const ALERTS = [
  { key: 'incoming', title: 'Incoming Funds', text: 'Get email or sms alerts when funds are sent to your account whether from our platform users or the blockchain.' },
  { key: 'withdrawal', title: 'Withdrawal', text: 'Get email or sms alerts when funds are sent from your account to blockchain wallets.' },
  { key: 'trades', title: 'Successful Trades', text: 'Get email or sms alerts when you successfully complete a trade on Mybitstore.' },
  { key: 'login', title: 'Login', text: 'Get email or sms alerts when an attempt is made to login to your account.' },
];

function NotificationsTab() {
  const [alerts, setAlerts] = useAlerts();
  const [notice, setNotice] = useState('');
  return (
    <div className="grid gap-5">
      <SectionHead title="Notifications" />
      <section className={panel} aria-label="Alerts">
        <div className="grid gap-4">
          {ALERTS.map((a, i) => (
            <React.Fragment key={a.key}>
              {i > 0 && <Rule />}
              <ToggleRow
                id={`wa-alert-${a.key}`}
                title={a.title}
                text={a.text}
                checked={alerts[a.key]}
                onChange={(on) => {
                  setAlerts((x) => ({ ...x, [a.key]: on }));
                  setNotice(`${a.title} alerts ${on ? 'on' : 'off'}. Saved.`);
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </section>
      <p className="sr-only" role="status">{notice}</p>
    </div>
  );
}

/* ——— Delete account ——— */

function DeleteAccountTab() {
  const [profile] = useProfile();
  const [request, setRequest] = useDeletionRequest();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState(null);
  const close = () => setDialog(null);

  const start = (e) => {
    e.preventDefault();
    const typed = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(typed)) return setError('Enter the email address on your account.');
    if (typed !== profile.email.toLowerCase()) return setError('This doesn’t match the email on your account.');
    setError('');
    setDialog('confirm');
  };

  const confirm = () => {
    setRequest({ at: Date.now() });
    setEmail('');
    setDialog('done');
  };

  return (
    <div className="grid gap-5">
      <SectionHead title="Delete account" />
      <p className="max-w-[460px] text-sm leading-6 text-wa-muted">Permanently deleting your account and all data associated with it is a manual process performed on our end.</p>

      {request ? (
        <section className={panel} aria-label="Deletion request">
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip tone="warn">Requested</StatusChip>
            <p className="min-w-0 flex-1 text-sm leading-5 text-wa-text">
              You asked to delete your account on {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(request.at)}. Our team will contact you at {profile.email}.
            </p>
          </div>
          <button type="button" onClick={() => setRequest(null)} className={cx(cancelBtn, 'mt-4 px-6')}>Cancel request</button>
        </section>
      ) : (
        <form onSubmit={start} noValidate className={panel} aria-label="Delete account">
          <TextField id="wa-del-email" label="Email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Enter your email" autoComplete="email" error={error} hint="Type the email on your account to confirm it’s you." />
          <button type="submit" className={cx(smallBtn, 'mt-4 h-11 bg-[#ff3b30] px-5 text-sm text-white hover:bg-[#e0352b]')}>
            <Trash size={20} />
            Permanently Delete Account
          </button>
        </form>
      )}

      {dialog === 'confirm' && (
        <NoticeDialog
          id="wa-del-confirm"
          icon={Trash}
          title="Delete Account Permanently?"
          onClose={close}
          actions={[
            <button key="cancel" type="button" onClick={close} autoFocus className={cancelBtn}>Cancel</button>,
            <button key="delete" type="button" onClick={confirm} className={dangerBtn}>Yes, Delete</button>,
          ]}
        >
          <p>This action is irreversible, this will delete all your data.</p>
        </NoticeDialog>
      )}
      {dialog === 'done' && (
        <NoticeDialog id="wa-del-done" icon={Check} tone="good" title="Request received" onClose={close} actions={[<button key="ok" type="button" onClick={close} className={primaryBtn}>Done</button>]}>
          <p>Our team will delete your account and its data, and email you at {profile.email} when it’s done.</p>
          <PreviewNote>Preview: no request was sent and nothing was deleted.</PreviewNote>
        </NoticeDialog>
      )}
    </div>
  );
}

const PANES = { profile: ProfileTab, security: SecurityTab, verification: VerificationTab, notifications: NotificationsTab, 'delete-account': DeleteAccountTab };

export default function Settings({ tab }) {
  const Pane = PANES[tab];
  const tabs = tab === DELETE_TAB[0] ? [...SETTINGS_TABS, DELETE_TAB] : SETTINGS_TABS;
  const navId = useId();
  return (
    <div className="grid gap-6">
      <nav aria-label="Settings sections" id={navId} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {tabs.map(([id, name]) => (
          <a key={id} href={`#settings/${id}`} aria-current={tab === id ? 'page' : undefined} className={cx(pillTab, 'shrink-0')}>
            {name}
          </a>
        ))}
      </nav>
      <div className="max-w-[880px]">
        <Pane key={tab} />
      </div>
    </div>
  );
}

