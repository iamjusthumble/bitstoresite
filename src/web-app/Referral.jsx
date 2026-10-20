import React, { useEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import qrIcon from '../assets/wa-referral/qrcode.svg';
import telegramIcon from '../assets/wa-referral/telegram.svg';
import whatsappIcon from '../assets/wa-referral/whatsapp.svg';
import { cx } from '../ui.js';
import { useProfile } from './account.js';
import { REFERRAL_CODE, REFERRAL_MIN_WITHDRAWAL, SAMPLE_REFERRALS } from './demoData.js';
import { FieldError, MethodChoice, Modal, NoticeDialog, QrCode, cancelBtn, chip, field, fieldBorder, pillTab, primaryBtn } from './flow.jsx';
import { useStored } from './format.jsx';
import { Check, Clipboard, Clock, Dollar, Mail, Plus, Share, Users, Wallet } from './icons.jsx';
import { accountLabel, canUse, maskNumber, usePaymentAccounts } from './paymentAccounts.jsx';
import { card, cardTitle } from './parts.jsx';

// Refer & earn (Figma 379:105014 and its states), reworked at the user's invitation: one currency throughout, figures
// worked out from the transactions so they always agree, a working withdrawal to a saved payout account, a list of
// invited friends, and share buttons that open real share targets. Everything is sample data kept in this browser.

// The sign-up page with the code attached; `ref` is the assumed parameter name until the backend confirms it
export const referralLink = (code) => `${links.signup}?ref=${encodeURIComponent(code)}`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usd = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const day = (iso) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
const today = () => new Date().toISOString().slice(0, 10);

const FRIEND_STATUS = {
  active: { label: 'Rewarded', tone: 'bg-up/15 text-up' },
  joined: { label: 'Signed up', tone: 'bg-tab-active/15 text-wa-accent' },
  invited: { label: 'Invited', tone: 'bg-wa-pill text-wa-muted' },
};
const TX_STATUS = {
  completed: { label: 'Completed', tone: 'bg-up/15 text-up' },
  pending: { label: 'Processing', tone: 'bg-[#ff9500]/15 text-[#c27100] dark:text-[#ff9500]' },
};

const Chip = ({ tone, children }) => <span className={cx('inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-4', tone)}>{children}</span>;

// White Figma icons used as masks so they take the text colour in either theme
const MaskIcon = ({ src }) => <span aria-hidden="true" className="size-6 shrink-0 bg-current" style={{ maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")`, maskSize: 'contain', WebkitMaskSize: 'contain' }} />;

const XLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// A short confirmation pill at the bottom of the screen ("Link copied", "Invitation sent")
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(0);
  const show = (text) => {
    clearTimeout(timer.current);
    setToast({ text, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2400);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex justify-center px-4">
      {toast && (
        <span key={toast.key} className="inline-flex animate-[pop-in_0.2s_ease-out] items-center gap-2 rounded-full bg-[#1f9d6a] px-4 py-2 text-sm font-semibold leading-5 text-white shadow-(--wa-shadow)">
          <Check size={16} />
          {toast.text}
        </span>
      )}
    </div>
  );
  return [show, node];
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyField({ id, label, value, what, onCopied, mono }) {
  const [copied, setCopied] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const inputRef = useRef(null);
  const copy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      setBlocked(false);
      onCopied(`${what} copied`);
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Clipboard blocked: select the text so it can be copied by hand
      setBlocked(true);
      inputRef.current.select();
    }
  };
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium leading-5 text-wa-muted">{label}</label>
      <div className="mt-2 flex gap-3 max-sm:flex-col">
        <input ref={inputRef} id={id} readOnly value={value} onFocus={(e) => e.target.select()} className={cx(field, 'h-[50px] min-w-0 flex-1 border-wa-line px-5 text-base leading-6 text-wa-text outline-none focus:border-tab-active', mono && 'font-semibold tracking-[0.04em]')} />
        <button type="button" onClick={copy} className="inline-flex h-11 w-[118px] shrink-0 items-center justify-center gap-2 self-center rounded-xl bg-tab-active text-base font-semibold leading-5 text-white transition-colors duration-150 hover:bg-brand-strong max-sm:w-full">
          {copied ? <Check size={20} /> : <Clipboard size={20} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {blocked && <p className="mt-2 text-xs leading-4 text-wa-muted">Your browser blocked copying. The text is selected: press Ctrl or ⌘ + C.</p>}
    </div>
  );
}

const shareChip = 'inline-flex h-11 items-center gap-1.5 rounded-full bg-tab-active/20 px-3.5 text-[15px] font-semibold leading-5 text-wa-text transition-colors duration-150 hover:bg-tab-active/30';

function InviteDialog({ friends, ownEmail, onClose, onSend }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) return setError('Enter a valid email address, like name@example.com.');
    if (value === ownEmail.toLowerCase()) return setError('That’s your own email. Enter a friend’s address.');
    if (friends.some((f) => f.name.toLowerCase() === value)) return setError('You’ve already invited this person.');
    onSend(value);
  };
  return (
    <Modal labelledBy="wa-ref-invite" onClose={onClose} className="max-w-[550px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-ref-invite" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">Send Invitation</h3>
        <p className="mt-1 text-sm leading-5 text-wa-muted">We’ll email your friend your referral link.</p>
        <label htmlFor="wa-ref-email" className="mt-5 block text-sm font-medium leading-5 text-wa-muted">Email</label>
        <div className={cx(field, fieldBorder(error), 'mt-2 flex h-[50px] items-center px-3.5')}>
          <input id="wa-ref-email" type="email" autoFocus value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Enter email" autoComplete="off" aria-invalid={Boolean(error)} className="min-w-0 flex-1 bg-transparent text-sm font-medium leading-5 text-wa-text outline-none placeholder:font-normal placeholder:text-wa-muted" />
        </div>
        <FieldError>{error}</FieldError>
        <div className="mt-8 grid grid-cols-2 gap-3.5">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Send Invitation</button>
        </div>
        <p className="mt-3 text-xs leading-4 text-wa-muted">Preview: no email is sent yet. Your friend is added to your list as invited.</p>
      </form>
    </Modal>
  );
}

const qrBtn = 'inline-flex h-11 items-center justify-center gap-2 rounded-full px-3 text-[15px] font-semibold leading-5 transition-colors duration-150';

function QrDialog({ link, code, onClose }) {
  const canShare = typeof navigator.share === 'function';
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      await navigator.share({ title: 'Join me on Mybitstore', text: `Sign up with my referral code ${code}`, url: link });
    } catch {
      // Closing the share sheet is not an error worth showing
    }
  };
  return (
    <Modal labelledBy="wa-ref-qr" onClose={onClose} className="max-w-[380px]">
      <div className="text-center">
        <h3 id="wa-ref-qr" className="text-base font-semibold leading-6 text-wa-muted">Scan QR Code</h3>
        <div className="mt-4"><QrCode value={link} label="QR code for your referral link" size={168} /></div>
        <p className="mt-4 flex items-baseline justify-center gap-2 text-sm leading-5 text-wa-muted">
          Referral Code:
          <span className="text-xl font-bold tracking-[0.03em] text-wa-text">{code}</span>
        </p>
      </div>
      <div className={cx('mt-6 grid gap-3', canShare && 'grid-cols-2')}>
        {canShare && (
          <button type="button" onClick={share} className={cx(qrBtn, 'border border-wa-line text-wa-text hover:bg-wa-pill')}>
            <Share size={18} />
            Share Link
          </button>
        )}
        {/* The page's toast sits behind the dialog, so the button confirms the copy itself */}
        <button type="button" onClick={async () => { if (await copyText(code)) { setCopied(true); setTimeout(() => setCopied(false), 2000); } }} className={cx(qrBtn, 'bg-tab-active text-white hover:bg-brand-strong')}>
          {copied ? <Check size={18} /> : <Clipboard size={18} />}
          <span aria-live="polite">{copied ? 'Code copied' : 'Copy Code'}</span>
        </button>
      </div>
    </Modal>
  );
}

function WithdrawDialog({ available, accounts, onClose, onDone }) {
  const payouts = accounts.filter((a) => canUse(a, 'sell'));
  const [amount, setAmount] = useState(available >= REFERRAL_MIN_WITHDRAWAL ? String(available) : '');
  const [methodId, setMethodId] = useState(payouts.length === 1 ? payouts[0].id : null);
  const [attempted, setAttempted] = useState(false);
  const value = Number.parseFloat(amount) || 0;
  const errors = {
    amount: !value ? 'Enter an amount.' : value < REFERRAL_MIN_WITHDRAWAL ? `The minimum withdrawal is ${usd(REFERRAL_MIN_WITHDRAWAL)}.` : value > available ? `You can withdraw up to ${usd(available)}.` : '',
    method: payouts.some((a) => a.id === methodId) ? '' : 'Choose where to receive your money.',
  };

  const submit = (e) => {
    e.preventDefault();
    setAttempted(true);
    if (errors.amount) return document.getElementById('wa-ref-amount').focus();
    if (errors.method) return document.getElementById('wa-order-method')?.focus();
    onDone(Math.round(value * 100) / 100, payouts.find((a) => a.id === methodId));
  };

  return (
    <Modal labelledBy="wa-ref-withdraw" onClose={onClose} className="max-w-[600px]">
      <form onSubmit={submit} noValidate>
        <h3 id="wa-ref-withdraw" className="pr-20 text-xl font-semibold leading-8 tracking-[-0.2px] text-wa-text">Withdraw rewards</h3>
        <p className="mt-1 text-sm leading-5 text-wa-muted">Available: <span className="font-semibold text-wa-text tabular-nums">{usd(available)}</span></p>

        <label htmlFor="wa-ref-amount" className="mt-5 block text-sm font-medium leading-5 text-wa-muted">Amount</label>
        <div className={cx(field, fieldBorder(attempted && errors.amount), 'mt-2 flex h-16 items-center gap-2 pl-4 pr-2')}>
          <span className="text-2xl font-semibold leading-8 text-wa-muted" aria-hidden="true">$</span>
          <input
            id="wa-ref-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1'))}
            inputMode="decimal"
            placeholder="0.00"
            autoComplete="off"
            aria-invalid={Boolean(attempted && errors.amount)}
            className="min-w-0 flex-1 bg-transparent text-2xl font-semibold leading-8 text-wa-text tabular-nums outline-none placeholder:text-wa-muted/50"
          />
          <button type="button" onClick={() => setAmount(String(available))} className={chip}>Max</button>
        </div>
        {attempted && errors.amount ? <FieldError>{errors.amount}</FieldError> : <p className="mt-2 text-xs leading-4 text-wa-muted">Minimum {usd(REFERRAL_MIN_WITHDRAWAL)}.</p>}

        <p className="mb-2 mt-6 text-sm font-medium leading-5 text-wa-muted">Send to</p>
        <MethodChoice accounts={accounts} use="sell" methodId={methodId} onPick={setMethodId} error={attempted && errors.method} />

        <div className="mt-8 grid grid-cols-2 gap-3.5">
          <button type="button" onClick={onClose} className={cancelBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Withdraw {value >= REFERRAL_MIN_WITHDRAWAL && value <= available ? usd(value) : ''}</button>
        </div>
      </form>
    </Modal>
  );
}

function Stat({ icon: Icon, tint, value, label, note }) {
  return (
    <div className={cx(card, 'rounded-[20px] p-5')}>
      <span className={cx('grid size-9 place-items-center rounded-full', tint)}><Icon size={18} /></span>
      <p className="mt-4 text-[28px] font-semibold leading-9 tracking-[-0.4px] text-wa-text tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm leading-5 text-wa-muted">{label}</p>
      {note && <p className="mt-1 text-xs leading-4 text-wa-muted">{note}</p>}
    </div>
  );
}

const STEPS = [
  ['Share your link or code', 'Send it by message, email or QR code.'],
  ['Your friend joins Mybitstore', 'They sign up with your link, or enter your code when they register.'],
  ['You earn rewards', `Rewards show here and can be withdrawn to your payment account from ${usd(REFERRAL_MIN_WITHDRAWAL)}.`],
];

export default function Referral() {
  const [profile] = useProfile();
  const [accounts] = usePaymentAccounts();
  const [data, setData] = useStored('wa-referrals', SAMPLE_REFERRALS);
  const [tab, setTab] = useState('transactions');
  // null, 'invite', 'qr', 'withdraw' or { done: transaction }
  const [dialog, setDialog] = useState(null);
  const [toast, toastNode] = useToast();
  const close = () => setDialog(null);

  const code = REFERRAL_CODE;
  const link = referralLink(code);
  const message = `Join me on Mybitstore to buy and sell crypto. Sign up with my link: ${link} (referral code ${code})`;
  const shares = [
    ['Telegram', `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Join me on Mybitstore. Referral code ${code}`)}`, <MaskIcon key="i" src={telegramIcon} />],
    ['WhatsApp', `https://wa.me/?text=${encodeURIComponent(message)}`, <MaskIcon key="i" src={whatsappIcon} />],
    ['X', `https://x.com/intent/post?text=${encodeURIComponent(`Join me on Mybitstore. Referral code ${code}`)}&url=${encodeURIComponent(link)}`, <XLogo key="i" />],
    ['Email', `mailto:?subject=${encodeURIComponent('Join me on Mybitstore')}&body=${encodeURIComponent(message)}`, <Mail key="i" size={22} />],
  ];

  // Every figure comes from the lists below, so they always agree
  const { friends, transactions } = data;
  const earned = transactions.filter((t) => t.type === 'reward').reduce((s, t) => s + t.amount, 0);
  const withdrawn = transactions.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const available = Math.round((earned - withdrawn) * 100) / 100;
  const pending = friends.filter((f) => f.status === 'joined').reduce((s, f) => s + f.reward, 0);
  const joined = friends.filter((f) => f.status !== 'invited').length;
  const invited = friends.length - joined;
  const canWithdraw = available >= REFERRAL_MIN_WITHDRAWAL;

  const invite = (email) => {
    setData((d) => ({ ...d, friends: [{ id: `f-${Date.now()}`, name: email, at: today(), status: 'invited', reward: 0 }, ...d.friends] }));
    close();
    setTab('friends');
    toast('Invitation sent');
  };

  const withdraw = (amount, account) => {
    const tx = { id: `t-${Date.now()}`, at: today(), type: 'withdrawal', amount, account: account.id, method: `${accountLabel(account)} · ${maskNumber(account.number)}`, status: 'pending' };
    setData((d) => ({ ...d, transactions: [tx, ...d.transactions] }));
    setTab('transactions');
    setDialog({ done: tx });
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold leading-7 tracking-[-0.2px] text-wa-text">Refer &amp; Earn Rewards</h2>
          <p className="mt-0.5 text-sm leading-5 text-wa-muted">Refer your friends to Mybitstore and be rewarded.</p>
        </div>
        <button type="button" onClick={() => setDialog('invite')} className="inline-flex h-11 items-center gap-2 rounded-full bg-tab-active px-5 text-[15px] font-bold leading-6 text-white transition-colors duration-150 hover:bg-brand-strong">
          <Plus size={20} />
          Invite Now
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <Stat icon={Users} tint="bg-tab-active/15 text-wa-accent" value={joined} label="Friends joined" note={invited ? `${invited} more invited` : null} />
        <Stat icon={Dollar} tint="bg-up/15 text-up" value={usd(earned)} label="Total earned" />
        <Stat icon={Clock} tint="bg-[#ff9500]/15 text-[#c27100] dark:text-[#ff9500]" value={usd(pending)} label="Pending rewards" note="From friends who’ve signed up but aren’t rewarded yet" />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={cx(card, 'rounded-[20px]')} aria-labelledby="wa-ref-link">
          <h2 id="wa-ref-link" className={cardTitle}>Your Referral Link &amp; Code</h2>
          <div className="mt-5 grid gap-5">
            <CopyField id="wa-ref-link-field" label="Invitation Link" value={link} what="Link" onCopied={toast} />
            <CopyField id="wa-ref-code-field" label="Referral Code" value={code} what="Code" onCopied={toast} mono />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-sm font-medium leading-5 text-wa-muted">Share Link Through:</span>
            <div className="flex flex-wrap gap-3">
              {shares.map(([name, href, icon]) => (
                <a key={name} href={href} target={name === 'Email' ? undefined : '_blank'} rel="noopener noreferrer" className={shareChip}>
                  {icon}
                  {name}
                </a>
              ))}
              <button type="button" onClick={() => setDialog('qr')} className={shareChip}>
                <MaskIcon src={qrIcon} />
                QR Code
              </button>
            </div>
          </div>
        </section>

        <section className={cx(card, 'rounded-[20px]')} aria-labelledby="wa-ref-how">
          <h2 id="wa-ref-how" className={cardTitle}>How it works</h2>
          <ol className="mt-5 grid gap-5">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tab-active/15 text-sm font-bold leading-none text-wa-accent">{i + 1}</span>
                <span>
                  <span className="block text-[15px] font-semibold leading-5 text-wa-text">{title}</span>
                  <span className="mt-1 block text-sm leading-5 text-wa-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <a href={links.referAndEarn} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex text-sm font-bold leading-5 text-wa-accent hover:underline">Read the programme terms</a>
        </section>
      </div>

      <section className={cx(card, 'rounded-[20px]')} aria-labelledby="wa-ref-earnings">
        <h2 id="wa-ref-earnings" className={cardTitle}>Earnings &amp; Transactions</h2>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-wa-line bg-wa-pill/60 px-5 py-4">
          <div className="flex items-center gap-4">
            <span className="grid size-10 place-items-center rounded-full bg-tab-active/15 text-wa-accent"><Wallet size={22} /></span>
            <div>
              <p className="text-sm leading-5 text-wa-muted">Available to withdraw</p>
              <p className="text-[28px] font-semibold leading-9 tracking-[-0.4px] text-wa-text tabular-nums">{usd(available)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 max-sm:w-full max-sm:items-stretch">
            <button type="button" disabled={!canWithdraw} onClick={() => setDialog('withdraw')} className="inline-flex h-11 items-center justify-center rounded-full border border-tab-active px-10 text-[15px] font-bold leading-6 text-wa-accent transition-colors duration-150 hover:bg-tab-active hover:text-white disabled:pointer-events-none disabled:opacity-45">
              Withdraw
            </button>
            <p className="text-xs leading-4 text-wa-muted">
              {canWithdraw ? `Minimum withdrawal amount is ${usd(REFERRAL_MIN_WITHDRAWAL)}` : `You can withdraw once you have ${usd(REFERRAL_MIN_WITHDRAWAL)}`}
            </p>
          </div>
        </div>

        <div role="group" aria-label="Show" className="mt-5 flex flex-wrap">
          <button type="button" aria-pressed={tab === 'transactions'} onClick={() => setTab('transactions')} className={pillTab}>Transactions ({transactions.length})</button>
          <button type="button" aria-pressed={tab === 'friends'} onClick={() => setTab('friends')} className={pillTab}>Friends ({friends.length})</button>
        </div>

        {tab === 'transactions' ? (
          transactions.length ? (
            <table className="mt-3 w-full text-left text-sm leading-5 max-md:block">
              <thead className="text-xs font-semibold uppercase tracking-[0.04em] text-wa-muted max-md:sr-only">
                <tr>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Details</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="max-md:block">
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-wa-line max-md:grid max-md:grid-cols-[1fr_auto] max-md:gap-x-3 max-md:gap-y-1 max-md:py-3.5">
                    <td className="py-3.5 pr-4 text-wa-muted max-md:order-3 max-md:p-0">{day(t.at)}</td>
                    <td className="py-3.5 pr-4 font-semibold text-wa-text max-md:order-1 max-md:p-0">{t.type === 'reward' ? 'Referral reward' : 'Withdrawal'}</td>
                    <td className="py-3.5 pr-4 text-wa-muted max-md:order-5 max-md:col-span-2 max-md:p-0">{t.type === 'reward' ? `From ${t.friend}` : `To ${t.method}`}</td>
                    <td className="py-3.5 pr-4 max-md:order-4 max-md:justify-self-end max-md:p-0"><Chip tone={TX_STATUS[t.status].tone}>{TX_STATUS[t.status].label}</Chip></td>
                    <td className={cx('py-3.5 text-right font-semibold tabular-nums max-md:order-2 max-md:p-0', t.type === 'reward' ? 'text-up' : 'text-wa-text')}>{t.type === 'reward' ? '+' : '−'}{usd(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-10 text-center text-sm leading-5 text-wa-muted">No transactions yet. Rewards appear here once friends join.</p>
          )
        ) : (
          <ul className="mt-3">
            {friends.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-wa-line py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wa-pill text-sm font-bold uppercase leading-none text-wa-muted">{f.name[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold leading-5 text-wa-text">{f.name}</span>
                  <span className="block text-xs leading-4 text-wa-muted">{f.status === 'invited' ? 'Invited' : 'Joined'} {day(f.at)}</span>
                </span>
                {f.status !== 'invited' && <span className={cx('text-sm font-semibold tabular-nums', f.status === 'active' ? 'text-up' : 'text-wa-muted')}>{f.status === 'active' ? '+' : ''}{usd(f.reward)}{f.status === 'joined' ? ' pending' : ''}</span>}
                <Chip tone={FRIEND_STATUS[f.status].tone}>{FRIEND_STATUS[f.status].label}</Chip>
              </li>
            ))}
          </ul>
        )}
      </section>

      {dialog === 'invite' && <InviteDialog friends={friends} ownEmail={profile.email} onClose={close} onSend={invite} />}
      {dialog === 'qr' && <QrDialog link={link} code={code} onClose={close} />}
      {dialog === 'withdraw' && <WithdrawDialog available={available} accounts={accounts} onClose={close} onDone={withdraw} />}
      {dialog?.done && (
        <NoticeDialog id="wa-ref-done" icon={Check} tone="good" title="Withdrawal requested" onClose={close} actions={[<button key="ok" type="button" onClick={close} className={primaryBtn}>Done</button>]}>
          <p>{usd(dialog.done.amount)} is on its way to {dialog.done.method}. It shows as processing until it arrives.</p>
          <p className="mt-3 text-xs leading-4">Preview: no money was moved.</p>
        </NoticeDialog>
      )}
      {toastNode}
    </div>
  );
}
