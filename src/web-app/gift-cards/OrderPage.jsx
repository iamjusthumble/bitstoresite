import React, { useState } from 'react';
import { links } from '../../links.js';
import { cx } from '../../ui.js';
import { Modal, Row, bigOutline, bigPrimary } from '../flow.jsx';
import { Alert, Check, Clipboard, Clock, ExternalLink, Eye, Gift, Info, Share } from '../icons.jsx';
import { accountLabel, maskNumber, usePaymentAccounts } from '../paymentAccounts.jsx';
import { card, cardTitle } from '../parts.jsx';
import { brandById, buyPrice, face, gcHref, ghs, groupCode } from './catalog.js';
import { ORDER_STATUS, codeGroups, orderStatus, useGhsBalance, useNotify, useOrders } from './store.js';
import { CardArt, PreviewTools, StatusPill, dateTime, toast, toolBtn } from './ui.jsx';

const copy = async (text, message) => {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast('Couldn’t copy. Select the text instead.');
  }
};

export function payLabel(pay, accounts) {
  if (pay.kind === 'wallet') return 'GHS wallet';
  if (pay.kind === 'usdt') return 'USDT';
  const a = accounts.find((x) => x.id === pay.accountId);
  return a ? `${accountLabel(a)} · ${maskNumber(a.number)}` : 'Mobile money';
}

export default function OrderPage({ id }) {
  const [orders, setOrders] = useOrders();
  const [accounts] = usePaymentAccounts();
  const [, setBalance] = useGhsBalance();
  const notify = useNotify();
  const [confirming, setConfirming] = useState(null);
  const [dialog, setDialog] = useState(null);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <section className="grid place-items-center rounded-2xl border border-wa-line bg-wa-card px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold leading-8 text-wa-text">We can’t find that order</h2>
        <p className="mt-2 text-base leading-6 text-wa-muted">It may have been made on another device.</p>
        <a href={gcHref('mine')} className={cx(bigPrimary, 'mt-8')}>My gift cards</a>
      </section>
    );
  }

  const first = order.items[0];
  const status = orderStatus(order, first);
  const paidWith = payLabel(order.pay, accounts);

  const reveal = (itemKey, index) => {
    setOrders((list) => list.map((o) => (o.id !== id ? o : { ...o, items: o.items.map((it) => (it.key !== itemKey ? it : { ...it, codes: it.codes.map((c, i) => (i === index ? { ...c, revealed: true } : c)) })) })));
    setConfirming(null);
  };

  // Preview only: play the supplier failing, which refunds the payment
  const fail = () => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, failed: true, notified: true } : o)));
    if (order.pay.kind === 'wallet') setBalance((b) => b + order.total);
    notify(['We couldn’t get your ', `${brandById[first.brand].name} card`, '. ', ghs(order.total), ` is back in your ${order.pay.kind === 'wallet' ? 'GHS wallet' : paidWith}.`], gcHref('order', id));
  };
  const deliverNow = () => setOrders((list) => list.map((o) => (o.id === id ? { ...o, readyAt: Date.now() } : o)));

  const header = {
    processing: { tone: 'warn', icon: Clock, title: 'Preparing your card', text: 'Usually under 5 minutes. We’ll notify you.' },
    delivered: { tone: 'good', icon: Check, title: order.items.length > 1 || first.qty > 1 ? 'Your gift cards are ready' : 'Your gift card is ready', text: 'Reveal a code when you’re ready to use it.' },
    'gift-sent': { tone: 'good', icon: Gift, title: `Gift sent to ${first.gift?.name}`, text: `Sent to ${first.gift?.contact}.` },
    scheduled: { tone: 'accent', icon: Clock, title: `Scheduled for ${first.gift && first.gift.when !== 'now' ? dateTime(new Date(first.gift.when)) : ''}`, text: `${first.gift?.name} gets it at ${first.gift?.contact} on that date.` },
    failed: { tone: 'danger', icon: Alert, title: 'We couldn’t get your card', text: `You’ve been refunded ${ghs(order.total)} to your ${order.pay.kind === 'wallet' ? 'GHS wallet' : paidWith}.` },
  }[status];
  const tints = { good: 'bg-up/15 text-up', warn: 'bg-wa-warn/15 text-wa-warn', accent: 'bg-tab-active/15 text-wa-accent', danger: 'bg-down/15 text-down' };
  const Icon = header.icon;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-5 max-xl:grid-cols-[minmax(0,1fr)_320px] max-lg:grid-cols-[minmax(0,1fr)]">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <section className="flex items-center gap-4 py-2" aria-live="polite">
          <span className={cx('grid size-12 shrink-0 place-items-center rounded-full', tints[header.tone])}><Icon size={24} /></span>
          <div className="min-w-0">
            <h2 className="text-[28px] font-semibold leading-9 tracking-[-0.5px] text-wa-text max-sm:text-2xl max-sm:leading-8">{header.title}</h2>
            <p className="mt-0.5 text-[15px] leading-6 text-wa-muted">{header.text}</p>
            {status === 'gift-sent' && order.giftOpenedAt && <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold leading-5 text-up"><Eye size={16} />{first.gift.name} opened your gift</p>}
          </div>
        </section>

        {order.items.map((item) => {
          const brand = brandById[item.brand];
          const st = orderStatus(order, item);
          return (
            <section key={item.key} className={card} aria-label={`${brand.name} ${face(item.country, item.value)}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className={cardTitle}>{brand.name} {face(item.country, item.value)}{item.qty > 1 && <span className="font-normal text-wa-muted"> × {item.qty}</span>}</h3>
                <StatusPill tone={ORDER_STATUS[st].tone}>{ORDER_STATUS[st].label}</StatusPill>
              </div>
              {item.gift && (
                <div className="mt-3 rounded-2xl bg-wa-pill/45 px-4 py-3 text-sm leading-5 text-wa-muted">
                  Gift to <span className="font-semibold text-wa-text">{item.gift.name}</span> · {item.gift.contact}
                  {item.gift.message && <p className="mt-1 italic text-wa-text/80">“{item.gift.message}”</p>}
                </div>
              )}
              <ul className="mt-5 grid gap-5">
                {item.codes.map((c, i) => (
                  <li key={i}>
                    {st === 'processing' ? (
                      <ProcessingCard brand={brand} />
                    ) : st === 'failed' ? (
                      <CardArt brand={brand} dim className="w-[300px] max-sm:w-full" />
                    ) : (
                      <CodeCard brand={brand} item={item} code={c} index={i} onReveal={() => setConfirming({ key: item.key, index: i })} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {status !== 'failed' && (
          <div className="flex flex-wrap gap-3">
            {[...new Set(order.items.map((i) => i.brand))].map((id) => (
              <button key={id} type="button" onClick={() => setDialog({ redeem: id })} className={bigOutline}>How to redeem {brandById[id].name}</button>
            ))}
          </div>
        )}

        <PreviewTools title="Preview: play the supplier">
          <button type="button" className={toolBtn} disabled={status !== 'processing'} onClick={deliverNow}>Deliver now</button>
          <button type="button" className={toolBtn} disabled={status === 'failed' || order.items.some((it) => it.codes.some((c) => c.revealed))} onClick={fail}>Supplier fails (refund)</button>
        </PreviewTools>
      </div>

      <aside className={cx(card, 'sticky top-6 max-lg:static')} aria-labelledby="wa-gc-order-sum">
        <h3 id="wa-gc-order-sum" className={cardTitle}>Order details</h3>
        <dl className="mt-5 grid gap-2">
          <Row label="Order ID">
            <button type="button" onClick={() => copy(order.id, 'Order ID copied')} className="inline-flex items-center gap-1.5 font-mono hover:text-wa-accent">{order.id}<Clipboard size={14} /></button>
          </Row>
          <Row label="Date">{dateTime(order.at)}</Row>
          <Row label="Paid with">{paidWith}</Row>
          <div className="mt-3 border-t border-wa-line pt-4"><Row label={status === 'failed' ? 'Refunded' : 'Total paid'} strong>{ghs(order.total)}</Row></div>
        </dl>
        <div className="mt-6 grid gap-2">
          {!first.gift && status === 'delivered' && (
            <button type="button" onClick={() => setDialog('share')} className={cx(bigPrimary, 'w-full')}><Share size={18} />Send as a gift</button>
          )}
          <button type="button" onClick={() => setDialog('receipt')} className={cx(bigOutline, 'w-full')}>View receipt</button>
          <a href={links.support} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-bold leading-6 text-wa-muted hover:bg-wa-pill hover:text-wa-text">Get help with {order.id}</a>
        </div>
      </aside>

      {confirming && (
        <Modal labelledBy="wa-gc-reveal" onClose={() => setConfirming(null)} className="max-w-[420px]">
          <span className="grid size-[50px] place-items-center rounded-full bg-wa-warn/15 text-wa-warn"><Eye size={24} /></span>
          <h3 id="wa-gc-reveal" className="mt-5 pr-8 text-2xl font-bold leading-7 text-wa-text">Reveal the code?</h3>
          <p className="mt-2 text-base leading-6 text-wa-muted">Once you reveal the code, this purchase can’t be refunded. Make sure no one is looking at your screen.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setConfirming(null)} className={bigOutline}>Not yet</button>
            <button type="button" autoFocus onClick={() => reveal(confirming.key, confirming.index)} className={bigPrimary}>Reveal code</button>
          </div>
        </Modal>
      )}

      {dialog === 'share' && <ShareDialog order={order} onClose={() => setDialog(null)} />}
      {dialog?.redeem && (
        <Modal labelledBy="wa-gc-redeem" onClose={() => setDialog(null)} className="max-w-[440px]">
          <h3 id="wa-gc-redeem" className="pr-10 text-xl font-semibold leading-7 text-wa-text">How to redeem {brandById[dialog.redeem].name}</h3>
          <ol className="mt-6 grid gap-4 text-[15px] leading-6 text-wa-text">
            {brandById[dialog.redeem].redeem.map((step, i) => (
              <li key={step} className="flex gap-3"><span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-wa-pill text-xs font-bold text-wa-muted">{i + 1}</span>{step}</li>
            ))}
          </ol>
          <a href={brandById[dialog.redeem].redeemUrl} target="_blank" rel="noreferrer" className={cx(bigPrimary, 'mt-6 w-full')}>Open {brandById[dialog.redeem].name}<ExternalLink size={18} /></a>
        </Modal>
      )}
      {dialog === 'receipt' && <Receipt order={order} status={status} paidWith={paidWith} onClose={() => setDialog(null)} />}
    </div>
  );
}

function ProcessingCard({ brand }) {
  return (
    <div className="flex items-center gap-5 max-sm:flex-col max-sm:items-start" role="status">
      <CardArt brand={brand} dim className="w-[300px] shrink-0 max-sm:w-full">
        <span className="absolute inset-0 animate-[shimmer_1.4s_linear_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] bg-size-[200%_100%]" />
      </CardArt>
      <p className="text-[15px] leading-6 text-wa-muted">Getting your code from {brand.name}…</p>
    </div>
  );
}

// The card flips over to show its code once revealed
function CodeCard({ brand, item, code, index, onReveal }) {
  const grouped = groupCode(code.code, codeGroups(brand.id));
  const spoken = code.code.split('').join(' ');
  return (
    <div className="flex items-center gap-6 max-md:flex-col max-md:items-start">
      <div className="w-[300px] shrink-0 [perspective:1200px] max-sm:w-full">
        <div className={cx('relative aspect-[5/3] transition-transform duration-300 [transform-style:preserve-3d]', code.revealed && '[transform:rotateY(180deg)]')}>
          <CardArt brand={brand} value={item.value} country={item.country} className="absolute inset-0 [backface-visibility:hidden]" radius="rounded-2xl" shadow="shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]" />
          <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-[linear-gradient(135deg,#131c44,#0a1224)] p-4 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="flex items-center justify-between text-xs font-semibold leading-4 text-white/70">{brand.name}<span>{face(item.country, item.value)}</span></span>
            <span className="font-mono text-lg font-semibold leading-7 tracking-[1px] break-all">{code.revealed ? grouped : ''}</span>
            {code.pin ? <span className="font-mono text-xs leading-4 text-white/70">PIN {code.revealed ? code.pin : '••••'}</span> : <span className="text-xs leading-4 text-white/50">Card {index + 1} of {item.qty}</span>}
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {item.qty > 1 && <p className="text-sm leading-5 text-wa-muted">Code {index + 1} of {item.qty}</p>}
        {code.revealed ? (
          <>
            <p className="mt-1 break-all font-mono text-xl font-semibold leading-8 tracking-[0.5px] text-wa-text" aria-hidden="true">{grouped}</p>
            <p className="sr-only">Code: {spoken}</p>
            {code.pin && <p className="mt-1 font-mono text-[15px] leading-6 text-wa-text">PIN {code.pin}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" aria-label="Copy gift card code" onClick={() => copy(code.code, 'Code copied')} className="inline-flex h-10 items-center gap-2 rounded-full bg-tab-active px-5 text-[15px] font-bold leading-6 text-white hover:bg-brand-strong"><Clipboard size={16} />Copy code</button>
              {code.pin && <button type="button" onClick={() => copy(code.pin, 'PIN copied')} className="inline-flex h-10 items-center rounded-full bg-wa-pill px-5 text-[15px] font-bold leading-6 text-wa-text hover:bg-wa-pill-hover">Copy PIN</button>}
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 font-mono text-xl font-semibold leading-8 tracking-[2px] text-wa-muted" aria-label="Hidden">••••-••••-••••</p>
            <button type="button" onClick={onReveal} className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-tab-active px-5 text-[15px] font-bold leading-6 text-white hover:bg-brand-strong"><Eye size={18} />Reveal code</button>
          </>
        )}
      </div>
    </div>
  );
}

// "Send as a gift" for a card bought for yourself: shares a secure link, never the raw code
function ShareDialog({ order, onClose }) {
  const link = `https://www.mybitstore.com/g/${order.id.toLowerCase()}${order.at.toString(36).slice(-4)}`;
  const item = order.items[0];
  const share = async () => {
    try {
      await navigator.share({ title: `${brandById[item.brand].name} gift card`, text: 'A gift card for you', url: link });
    } catch {
      copy(link, 'Gift link copied');
    }
  };
  return (
    <Modal labelledBy="wa-gc-share" onClose={onClose} className="max-w-[460px]">
      <h3 id="wa-gc-share" className={cx(cardTitle, 'pr-10')}>Send as a gift</h3>
      <p className="mt-2 text-[15px] leading-6 text-wa-muted">Share a secure link. The person opens it and confirms with a one-time code, so the gift card code itself is never sent in a message.</p>
      <CardArt brand={brandById[item.brand]} value={item.value} country={item.country} className="mt-5" />
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-wa-line bg-wa-inset py-2 pl-4 pr-2">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-wa-text">{link}</span>
        <button type="button" onClick={() => copy(link, 'Gift link copied')} className="inline-flex h-9 items-center gap-2 rounded-full bg-wa-pill px-4 text-sm font-bold text-wa-text hover:bg-wa-pill-hover"><Clipboard size={16} />Copy</button>
      </div>
      <p className="mt-3 flex gap-2 text-xs leading-4 text-wa-muted"><Info size={14} className="shrink-0" />Preview: the link is a sample and doesn’t open a gift yet.</p>
      <button type="button" onClick={share} className={cx(bigPrimary, 'mt-6 w-full')}><Share size={18} />Share link</button>
    </Modal>
  );
}

function Receipt({ order, status, paidWith, onClose }) {
  return (
    <Modal labelledBy="wa-gc-receipt" onClose={onClose} className="max-w-[480px]">
      <h3 id="wa-gc-receipt" className={cx(cardTitle, 'pr-10')}>Receipt</h3>
      <p className="mt-1 text-sm leading-5 text-wa-muted">{dateTime(order.at)} · <span className="font-mono">{order.id}</span></p>
      <ul className="mt-5 grid gap-3 border-b border-wa-line pb-5">
        {order.items.map((i) => (
          <li key={i.key} className="flex items-center gap-3">
            <CardArt brand={brandById[i.brand]} className="w-14 shrink-0" radius="rounded-md" />
            <span className="min-w-0 flex-1 text-[15px] font-semibold leading-5 text-wa-text">{brandById[i.brand].name} {face(i.country, i.value)} × {i.qty}<span className="block text-sm font-normal text-wa-muted">{i.gift ? `Gift to ${i.gift.name}` : 'For you'}</span></span>
            <span className="text-[15px] font-semibold text-wa-text tabular-nums">{ghs(buyPrice(i.country, i.value) * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-5 grid gap-2">
        <Row label="Subtotal">{ghs(order.subtotal)}</Row>
        {order.fee > 0 && <Row label="Service fee">{ghs(order.fee)}</Row>}
        {order.discount > 0 && <Row label={`Discount${order.promo ? ` (${order.promo})` : ''}`}>−{ghs(order.discount)}</Row>}
        <Row label="Paid with">{paidWith}</Row>
        <Row label="Status">{ORDER_STATUS[status].label}</Row>
        <div className="mt-3 border-t border-wa-line pt-4"><Row label="Total" strong>{ghs(order.total)}</Row></div>
      </dl>
      <button type="button" onClick={() => window.print()} className={cx(bigOutline, 'mt-6 w-full')}>Print</button>
    </Modal>
  );
}
