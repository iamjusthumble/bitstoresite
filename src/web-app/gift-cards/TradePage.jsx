import React, { useState } from 'react';
import { links } from '../../links.js';
import { cx } from '../../ui.js';
import { FieldError, Modal, NoticeDialog, Radio, Row, bigOutline, bigPrimary, cancelBtn, choice, dangerBtn, field } from '../flow.jsx';
import { Alert, Check, Clipboard, Close, Info, Upload } from '../icons.jsx';
import { usePaymentAccounts } from '../paymentAccounts.jsx';
import { card, cardTitle } from '../parts.jsx';
import { CARD_TYPES, COUNTRIES, LIMITS, REASONS, brandById, face, gcHref, ghs, ghsRate, maskCode, usdt } from './catalog.js';
import { freshDraft } from './Sell.jsx';
import { TRADE_STATUS, decidedAt, lastAt, payoutLabel, useDraft, useGhsBalance, useNotify, useTrades } from './store.js';
import { CardArt, PhotoSlot, PreviewTools, StatusPill, dateTime, timeLeft, toast, toolBtn } from './ui.jsx';

const HOUR = 3600000;

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast('Trade ID copied');
  } catch {
    toast('Couldn’t copy. Select the text instead.');
  }
};

export default function TradePage({ id }) {
  const [trades, setTrades] = useTrades();
  const [accounts] = usePaymentAccounts();
  const [, setDraft] = useDraft();
  const [, setBalance] = useGhsBalance();
  const notify = useNotify();
  const [dialog, setDialog] = useState(null);
  const [reupload, setReupload] = useState(null);
  const trade = trades.find((t) => t.id === id);

  if (!trade) {
    return (
      <section className="grid place-items-center rounded-2xl border border-wa-line bg-wa-card px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold leading-8 text-wa-text">We can’t find that trade</h2>
        <p className="mt-2 text-base leading-6 text-wa-muted">It may have been made on another device.</p>
        <a href={gcHref('mine', 'sold')} className={cx(bigPrimary, 'mt-8')}>My gift cards</a>
      </section>
    );
  }

  const brand = brandById[trade.brand];
  const st = TRADE_STATUS[trade.status];
  const method = payoutLabel(trade.payout, accounts);
  const sym = COUNTRIES[trade.country].symbol;
  const now = Date.now();
  const decided = decidedAt(trade);
  const disputeOpen = ['rejected', 'paid'].includes(trade.status) && ['rejected', 'partial'].includes(trade.decision) && !trade.dispute && decided && now - decided < LIMITS.disputeHours * HOUR;
  const needsInfoLeft = trade.status === 'needs-info' ? lastAt(trade, 'needs-info') + LIMITS.needsInfoHours * HOUR - now : 0;
  const paid = trade.actual ?? (trade.status === 'paid' ? trade.expected : null);
  const href = gcHref('trade', trade.id);

  const set = (patch, status) =>
    setTrades((list) => list.map((t) => (t.id !== id ? t : { ...t, ...patch, ...(status ? { status, history: [...t.history, { status, at: Date.now() }] } : {}) })));

  // Preview only: play the review team
  const decide = (kind) => {
    const name = brand.name;
    if (kind === 'review') set({}, 'review');
    if (kind === 'extended') set({}, 'extended');
    if (kind === 'approve') {
      set({ decision: 'approved', actual: trade.expected, cards: trade.cards.map((c) => ({ ...c, result: { status: 'approved' } })) }, 'approved');
    }
    if (kind === 'partial') {
      const lower = Math.max(1, Math.round(trade.value / 2));
      const actual = Math.round((trade.expected - (trade.value - lower) * trade.rate) * 100) / 100;
      // The payout that follows tells the seller it was partly approved
      set({ decision: 'partial', actual, cards: trade.cards.map((c, i) => ({ ...c, result: i === 0 ? { status: 'partial', value: lower, reason: 'value', note: `Card value was ${sym}${lower}, not ${sym}${trade.value}` } : { status: 'approved' } })) }, 'partial');
    }
    if (kind === 'reject') {
      set({ decision: 'rejected', actual: 0, cards: trade.cards.map((c) => ({ ...c, result: { status: 'rejected', reason: 'redeemed', note: 'The balance on this card is $0.' } })) }, 'rejected');
      notify(['Your ', `${name} card`, ' couldn’t be accepted. Tap to see why.'], href);
    }
    if (kind === 'info') {
      set({ request: trade.type === 'physical' ? 'The code on card 1 isn’t readable. Upload a clearer photo of the back, with the code area fully scratched.' : 'Upload a screenshot of the email or app where you got this code.' }, 'needs-info');
      notify(['We need a clearer photo for your ', `${name} trade`, '.'], href);
    }
    if (kind === 'uphold' || kind === 'decline') {
      const extra = Math.round((trade.expected - (trade.actual || 0)) * 100) / 100;
      if (kind === 'uphold') {
        if (trade.payout.method === 'wallet') setBalance((b) => b + extra);
        set({ actual: trade.expected, decision: 'approved', dispute: { ...trade.dispute, outcome: 'upheld', extra }, cards: trade.cards.map((c) => ({ ...c, result: { status: 'approved' } })) }, 'paid');
      } else {
        set({ dispute: { ...trade.dispute, outcome: 'declined', why: 'We checked with the brand: the card had already been used before it was submitted.' } }, trade.decision === 'rejected' ? 'rejected' : 'paid');
      }
      notify(['We’ve reviewed your dispute on trade ', trade.id, '.'], href);
    }
  };

  const cancel = () => {
    set({}, 'cancelled');
    setDialog(null);
    toast('Trade cancelled');
  };

  const sellAgain = () => {
    setDraft(freshDraft(brand, { country: trade.country, type: trade.type, receipt: trade.receipt, value: trade.value, qty: 1 }));
    window.location.hash = gcHref('sell', brand.id);
  };

  const sendReupload = () => {
    set({ reuploaded: true, request: null }, 'review');
    setReupload(null);
    toast('Sent. Your trade is back in review');
  };

  const header = {
    'needs-info': `We need a clearer photo or a receipt. Upload within ${timeLeft(needsInfoLeft)}.`,
    approved: `Approved. Sending ${ghs(trade.actual ?? trade.expected)} to ${method}.`,
    paid: `Paid ${trade.payout.method === 'usdt' && trade.usdtAmount ? usdt((trade.usdtAmount * (paid ?? 0)) / trade.expected) : ghs(paid ?? 0)} to ${method}.${trade.decision === 'partial' && trade.dispute?.outcome !== 'upheld' ? ' Some cards were approved at a lower value. See why below.' : ''}`,
  }[trade.status] || st.line;

  // Submitted → In review → Decision → Paid, with whatever actually happened
  const decisionStatus = ['approved', 'partial', 'rejected', 'needs-info', 'expired', 'cancelled'].find((s) => trade.history.some((h) => h.status === s));
  const steps = [
    { name: 'Submitted', at: lastAt(trade, 'submitted') },
    trade.status === 'cancelled' ? { name: 'Cancelled', at: lastAt(trade, 'cancelled') } : { name: trade.history.some((h) => h.status === 'extended') ? 'In review · extra checks' : 'In review', at: trade.history.find((h) => h.status === 'review' || h.status === 'extended')?.at },
    ...(trade.status === 'cancelled' ? [] : [
      { name: decisionStatus && decisionStatus !== 'cancelled' ? TRADE_STATUS[decisionStatus].label : 'Decision', at: decisionStatus ? lastAt(trade, decisionStatus) : null },
      ...(trade.dispute ? [{ name: trade.dispute.outcome ? `Dispute ${trade.dispute.outcome}` : 'Disputed', at: trade.dispute.at }] : []),
      { name: trade.decision === 'rejected' && trade.dispute?.outcome !== 'upheld' ? 'No payout' : 'Paid', at: lastAt(trade, 'paid') ?? (trade.status === 'rejected' && !trade.dispute ? decided : null), muted: trade.decision === 'rejected' && trade.dispute?.outcome !== 'upheld' },
    ]),
  ];
  // What happened, in the order it happened (a dispute can follow a payout); what's still to come stays last
  steps.sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity));
  const current = steps.reduce((acc, s, i) => (s.at ? i : acc), 0);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_320px] max-lg:grid-cols-[minmax(0,1fr)]">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <section className={card} aria-live="polite">
          <div className="flex items-start gap-4">
            <CardArt brand={brand} className="w-24 shrink-0" radius="rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-2xl font-semibold leading-8 tracking-[-0.3px] text-wa-text">{brand.name} {face(trade.country, trade.value)} × {trade.qty}</h2>
                <StatusPill tone={st.tone}>{st.label}</StatusPill>
              </div>
              <p className="mt-1 text-[15px] leading-6 text-wa-text">{header}</p>
              <button type="button" onClick={() => copy(trade.id)} className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm leading-5 text-wa-muted hover:text-wa-accent">{trade.id}<Clipboard size={14} /><span className="sr-only">Copy trade ID</span></button>
            </div>
          </div>

          <ol className="mt-6 grid gap-0 border-t border-wa-line pt-5" aria-label="Trade timeline">
            {steps.map((s, i) => (
              <li key={s.name + i} className="relative flex gap-4 pb-5 last:pb-0">
                {i < steps.length - 1 && <span className={cx('absolute left-[11px] top-6 h-[calc(100%-20px)] w-0.5', i < current ? 'bg-tab-active' : 'bg-wa-line')} />}
                <span className={cx('relative grid size-6 shrink-0 place-items-center rounded-full', s.at ? (i === current ? 'bg-tab-active text-white ring-4 ring-tab-active/20' : s.muted ? 'bg-wa-pill text-wa-muted' : 'bg-tab-active text-white') : 'border-2 border-wa-line bg-wa-card')}>
                  {s.at && <Check size={14} />}
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                  <span className={cx('text-[15px] font-semibold leading-6', s.at ? 'text-wa-text' : 'text-wa-muted')}>{s.name}</span>
                  <span className="text-sm leading-5 text-wa-muted tabular-nums">{s.at ? dateTime(s.at) : i === current + 1 ? 'Next' : ''}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {trade.status === 'needs-info' && (
          <section className={cx(card, 'border-down/50')} aria-labelledby="wa-gc-needs">
            <h3 id="wa-gc-needs" className={cardTitle}>What we need</h3>
            <p className="mt-2 text-[15px] leading-6 text-wa-text">{trade.request}</p>
            <p className="mt-1 text-sm leading-5 text-wa-muted">Upload within {timeLeft(needsInfoLeft)}, or the trade expires and you’ll need to start again.</p>
            <div className="mt-5 max-w-[480px]">
              <PhotoSlot id="wa-gc-reupload" label={trade.type === 'physical' ? 'Clearer photo' : 'Screenshot'} value={reupload} onChange={setReupload} required />
            </div>
            <button type="button" disabled={!reupload?.data || reupload.failed || Boolean(reupload.uploading)} onClick={sendReupload} className={cx(bigPrimary, 'mt-5 disabled:pointer-events-none disabled:opacity-50')}>Send to reviewer</button>
          </section>
        )}

        <section className={card} aria-labelledby="wa-gc-cards">
          <h3 id="wa-gc-cards" className={cardTitle}>Your {trade.qty === 1 ? 'card' : 'cards'}</h3>
          <p className="mt-1 text-sm leading-5 text-wa-muted">{COUNTRIES[trade.country].name} · {CARD_TYPES[trade.type]}{trade.receipt === 'with' ? ' · with receipt' : ''}</p>
          <ul className="mt-4 grid gap-3">
            {trade.cards.map((c, i) => {
              const r = c.result;
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-wa-line p-3">
                  {c.thumb ? <img src={c.thumb} alt={`Card ${i + 1}`} className="aspect-[5/3] w-24 shrink-0 rounded-lg object-cover" /> : <CardArt brand={brand} className="w-24 shrink-0" radius="rounded-lg" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-5 text-wa-text">Card {i + 1} · {sym}{c.value}</p>
                    <p className="mt-1 font-mono text-sm leading-5 text-wa-muted">{c.code ? maskCode(c.code) : 'Photo submitted'}</p>
                  </div>
                  {r ? (
                    <StatusPill tone={r.status === 'approved' ? 'good' : r.status === 'partial' ? 'accent' : 'danger'}>
                      {r.status === 'approved' ? 'Approved' : r.status === 'partial' ? `Approved at ${sym}${r.value}` : 'Rejected'}
                    </StatusPill>
                  ) : (
                    <span className="text-sm leading-5 text-wa-muted">{trade.status === 'cancelled' ? 'Not reviewed' : 'Waiting for review'}</span>
                  )}
                </li>
              );
            })}
          </ul>

          {trade.cards.some((c) => c.result?.reason) && (
            <div className="mt-4 rounded-2xl bg-wa-pill/45 p-4" role="note">
              <p className="text-[15px] font-semibold leading-6 text-wa-text">Why</p>
              <ul className="mt-2 grid gap-2 text-sm leading-5 text-wa-muted">
                {trade.cards.map((c, i) => c.result?.reason && (
                  <li key={c.id}><span className="font-semibold text-wa-text">Card {i + 1}: {REASONS[c.result.reason]}.</span> {c.result.note}</li>
                ))}
              </ul>
            </div>
          )}

          {trade.dispute && (
            <div className={cx('mt-4 rounded-2xl p-4 text-sm leading-5', trade.dispute.outcome === 'upheld' ? 'bg-up/10' : 'bg-tab-active/8')}>
              <p className="text-[15px] font-semibold leading-6 text-wa-text">
                {trade.dispute.outcome === 'upheld' ? `Dispute upheld: we sent the extra ${ghs(trade.dispute.extra)}` : trade.dispute.outcome === 'declined' ? 'Dispute declined' : 'Dispute in progress'}
              </p>
              <p className="mt-1 text-wa-muted">{trade.dispute.outcome === 'declined' ? trade.dispute.why : trade.dispute.outcome ? 'Thanks for your patience.' : `You said: “${trade.dispute.reasonText}”. We’ll reply within 48 hours.`}</p>
            </div>
          )}
          {trade.note && <p className="mt-4 text-sm leading-5 text-wa-muted">Your note: <span className="text-wa-text">{trade.note}</span></p>}
        </section>

        <PreviewTools title="Preview: play the reviewer">
          <button type="button" className={toolBtn} disabled={trade.status !== 'submitted'} onClick={() => decide('review')}>Start review</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'review'} onClick={() => decide('extended')}>Extended review</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'review'} onClick={() => decide('approve')}>Approve</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'review'} onClick={() => decide('partial')}>Partially approve</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'review'} onClick={() => decide('info')}>Ask for info</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'review'} onClick={() => decide('reject')}>Reject</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'disputed'} onClick={() => decide('uphold')}>Uphold dispute</button>
          <button type="button" className={toolBtn} disabled={trade.status !== 'disputed'} onClick={() => decide('decline')}>Decline dispute</button>
        </PreviewTools>
      </div>

      <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-gc-trade-pay">
        <h3 id="wa-gc-trade-pay" className={cardTitle}>Payout</h3>
        {paid != null && trade.decision ? (
          <>
            <p className="mt-4 text-sm leading-5 text-wa-muted">{lastAt(trade, 'paid') || trade.decision === 'rejected' ? 'Paid' : 'Approved'}</p>
            <p className="text-[34px] font-semibold leading-10 tracking-[-0.6px] text-wa-text tabular-nums">{ghs(paid)}</p>
            {paid !== trade.expected && <p className="mt-1 text-sm leading-5 text-wa-muted tabular-nums">of {ghs(trade.expected)} expected</p>}
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-5 text-wa-muted">{trade.status === 'cancelled' || trade.status === 'expired' ? 'Would have been' : 'Expected'}</p>
            <p className={cx('text-[34px] font-semibold leading-10 tracking-[-0.6px] tabular-nums', ['cancelled', 'expired'].includes(trade.status) ? 'text-wa-muted line-through' : 'text-wa-text')}>{ghs(trade.expected)}</p>
          </>
        )}
        <dl className="mt-5 grid gap-2 border-t border-wa-line pt-4">
          <Row label="Rate (locked)">{ghsRate(trade.rate)}/{sym}</Row>
          <Row label="Paid to">{method}</Row>
          {trade.payout.method === 'usdt' && trade.usdtAmount && <Row label="In USDT">≈ {usdt(trade.usdtAmount)}</Row>}
          <Row label="Submitted">{dateTime(trade.history[0].at)}</Row>
        </dl>

        <div className="mt-6 grid gap-2">
          {trade.status === 'needs-info' && <button type="button" onClick={() => document.getElementById('wa-gc-needs')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className={cx(bigPrimary, 'w-full')}><Upload size={18} />Upload again</button>}
          {disputeOpen && <button type="button" onClick={() => setDialog('dispute')} className={cx(bigPrimary, 'w-full')}>Dispute this decision</button>}
          {trade.status === 'submitted' && <button type="button" onClick={() => setDialog('cancel')} className={cx(bigOutline, 'w-full')}>Cancel trade</button>}
          <button type="button" onClick={sellAgain} className={cx(trade.status === 'paid' && !disputeOpen ? bigPrimary : bigOutline, 'w-full')}>Sell again</button>
          <a href={links.support} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center rounded-full text-[15px] font-bold leading-6 text-wa-muted hover:bg-wa-pill hover:text-wa-text">Get help with {trade.id}</a>
        </div>
        {disputeOpen && <p className="mt-2 text-center text-xs leading-4 text-wa-muted">You can dispute for {timeLeft(decided + LIMITS.disputeHours * HOUR - now)} more.</p>}
      </aside>

      {dialog === 'cancel' && (
        <NoticeDialog
          id="wa-gc-cancel"
          icon={Alert}
          title="Cancel this trade?"
          onClose={() => setDialog(null)}
          actions={[
            <button key="k" type="button" onClick={() => setDialog(null)} className={cancelBtn}>Keep it</button>,
            <button key="c" type="button" onClick={cancel} className={dangerBtn}>Cancel trade</button>,
          ]}
        >
          Your {brand.name} card won’t be reviewed or paid for. You can sell it again later.
        </NoticeDialog>
      )}
      {dialog === 'dispute' && (
        <DisputeSheet
          onClose={() => setDialog(null)}
          onSubmit={(d) => {
            set({ dispute: { ...d, at: Date.now() } }, 'disputed');
            setDialog(null);
            toast('Dispute sent');
          }}
        />
      )}
    </div>
  );
}

const DISPUTE_REASONS = [['valid', 'I believe the card was valid'], ['value', 'The value was wrong'], ['other', 'Other']];

function DisputeSheet({ onClose, onSubmit }) {
  const [reason, setReason] = useState(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [attempted, setAttempted] = useState(false);
  const errors = {
    reason: reason ? '' : 'Choose a reason.',
    text: text.trim().length < 20 ? 'Tell us a bit more (at least 20 characters).' : '',
  };
  const add = (list) => {
    const next = [...list].filter((f) => f.type.startsWith('image/')).slice(0, 3 - files.length).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setFiles((cur) => [...cur, ...next].slice(0, 3));
  };
  const submit = () => {
    setAttempted(true);
    if (errors.reason || errors.text) return;
    onSubmit({ reason, reasonText: DISPUTE_REASONS.find(([k]) => k === reason)[1], text: text.trim(), evidence: files.length });
  };
  return (
    <Modal labelledBy="wa-gc-dispute" onClose={onClose} className="max-w-[560px]">
      <h3 id="wa-gc-dispute" className={cx(cardTitle, 'pr-10')}>Dispute this decision</h3>
      <p className="mt-1 text-[15px] leading-6 text-wa-muted">A support specialist will look again and reply within 48 hours. You can raise one dispute per trade.</p>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold leading-5 text-wa-text">What’s wrong?</legend>
        <div className="mt-2 grid gap-2">
          {DISPUTE_REASONS.map(([key, label]) => (
            <label key={key} className={cx(choice, 'cursor-pointer items-center py-3 hover:bg-wa-pill/50')}>
              <input type="radio" name="wa-gc-dreason" className="sr-only" checked={reason === key} onChange={() => setReason(key)} />
              <span className="flex-1 text-[15px] font-semibold leading-5 text-wa-text">{label}</span>
              <Radio checked={reason === key} />
            </label>
          ))}
        </div>
        <FieldError>{attempted && errors.reason}</FieldError>
      </fieldset>

      <label htmlFor="wa-gc-dtext" className="mt-5 flex justify-between text-sm font-semibold leading-5 text-wa-text">
        <span>Tell us what happened</span>
        <span className="font-normal text-wa-muted tabular-nums">{text.length}/1000</span>
      </label>
      <textarea id="wa-gc-dtext" rows={4} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. I bought this card yesterday and never used it. The receipt is attached." className={cx(field, attempted && errors.text ? 'border-down' : 'border-wa-line focus:border-tab-active', 'mt-2 block w-full resize-none px-4 py-3 text-[15px] leading-6 text-wa-text outline-none placeholder:text-wa-muted')} />
      <FieldError>{attempted && errors.text}</FieldError>

      <p className="mt-5 text-sm font-semibold leading-5 text-wa-text">Evidence <span className="font-normal text-wa-muted">· optional, up to 3 images</span></p>
      <div className="mt-2 flex flex-wrap gap-2">
        {files.map((f, i) => (
          <span key={f.url} className="relative">
            <img src={f.url} alt={f.name} className="size-20 rounded-xl object-cover" />
            <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-wa-text text-wa-bg"><Close size={12} /></button>
          </span>
        ))}
        {files.length < 3 && (
          <label className="grid size-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-wa-line text-wa-muted hover:border-tab-active hover:text-wa-accent">
            <Upload size={20} />
            <span className="sr-only">Add evidence</span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
          </label>
        )}
      </div>
      <p className="mt-2 flex gap-1.5 text-xs leading-4 text-wa-muted"><Info size={14} className="shrink-0" />Purchase receipts or a screenshot of the card balance help most.</p>

      <div className="mt-6 flex gap-3 max-sm:flex-col-reverse">
        <button type="button" onClick={onClose} className={cx(bigOutline, 'sm:flex-1')}>Cancel</button>
        <button type="button" onClick={submit} className={cx(bigPrimary, 'sm:flex-[2]')}>Submit dispute</button>
      </div>
    </Modal>
  );
}
