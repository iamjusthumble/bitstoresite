import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { links } from '../links.js';
import { COINS, formatChange, formatPrice, useMarketData } from '../marketData.js';
import { cx } from '../ui.js';
import { reducedMotion, useInView } from './motion.js';
import { Heading, PrimaryButton, Rise, container } from './ui.jsx';

const TABS = ['All', 'Stablecoins', 'Top gainers'];
const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 });
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function rowsFor(tab, coins) {
  if (tab === 'Stablecoins') return COINS.filter((c) => c.stable);
  if (tab === 'Top gainers') return COINS.filter((c) => coins[c.id]).sort((a, b) => coins[b.id].change - coins[a.id].change).slice(0, 4);
  return COINS;
}

// A live price that glides to its new value. A new `key` (another coin) jumps straight there instead,
// since counting from one coin's price to another's would show numbers that mean nothing.
function useTween(value, key, ms = 700) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const lastKey = useRef(key);
  useEffect(() => {
    if (value == null) return undefined;
    const start = from.current ?? value;
    const switched = lastKey.current !== key;
    lastKey.current = key;
    if (switched || start === value || reducedMotion()) {
      from.current = value;
      setShown(value);
      return undefined;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 4);
      const v = start + (value - start) * e;
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, key, ms]);
  return shown;
}

// Points for a series, scaled into a w × h box
function scale(points, w, h, pad) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  // A floor of 1% of the price keeps near-flat series (stablecoins) from looking volatile
  const floor = (Math.abs(max + min) / 2) * 0.01;
  const range = Math.max(max - min, floor) || 1;
  const off = (range - (max - min)) / 2;
  return points.map((p, i) => [(i / (points.length - 1)) * w, pad + (1 - (p - min + off) / range) * (h - pad * 2)]);
}

// A smooth curve through the points; the same command count for every coin, so CSS can morph between them
function curve(xy) {
  let d = `M${xy[0][0].toFixed(2)} ${xy[0][1].toFixed(2)}`;
  for (let i = 1; i < xy.length; i += 1) {
    const [x0, y0] = xy[i - 1];
    const [x1, y1] = xy[i];
    const mx = (x0 + (x1 - x0) / 2).toFixed(2);
    d += ` C${mx} ${y0.toFixed(2)} ${mx} ${y1.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}

const W = 600;
const H = 220;

// The featured coin's last 24 hours. Draws itself in once, then morphs smoothly between coins.
// Hovering shows the price at that hour.
function Chart({ points, up }) {
  const id = useId();
  const [ref, inView] = useInView();
  const [hover, setHover] = useState(null);
  const ready = points && points.length > 1;
  const xy = ready ? scale(points, W, H, 16) : null;
  const d = xy ? curve(xy) : null;
  const color = up ? 'var(--up)' : 'var(--down)';
  const last = xy?.[xy.length - 1];
  const morph = `d 900ms ${EASE}, stroke 600ms ease, fill 600ms ease`;

  const move = (e) => {
    if (!xy) return;
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left) / r.width) * (xy.length - 1));
    setHover(Math.max(0, Math.min(xy.length - 1, i)));
  };
  const at = hover != null && xy ? xy[hover] : null;

  return (
    <div ref={ref} className="relative h-[220px] max-sm:h-[170px]" onPointerMove={move} onPointerLeave={() => setHover(null)}>
      {!ready ? (
        <div className="size-full animate-pulse rounded-2xl bg-v3-glass" />
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={color} stopOpacity="0.2" style={{ transition: 'stop-color 600ms ease' }} />
                <stop offset="1" stopColor={color} stopOpacity="0" style={{ transition: 'stop-color 600ms ease' }} />
              </linearGradient>
            </defs>
            <path
              style={{ d: `path("${d} L${W} ${H} L0 ${H} Z")`, transition: `${morph}, opacity 1.2s ease 0.5s` }}
              fill={`url(#${id}f)`}
              opacity={inView ? 1 : 0}
            />
            <path
              style={{ d: `path("${d}")`, transition: `${morph}, stroke-dashoffset 1.6s ${EASE}`, strokeDashoffset: inView ? 0 : 1 }}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength="1"
              strokeDasharray="1"
            />
          </svg>
          {/* The latest point, with a soft pulse */}
          <span
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%`, background: color, opacity: inView && !at ? 1 : 0, transition: `top 900ms ${EASE}, background-color 600ms ease, opacity 400ms ease 1.2s` }}
          >
            <span className="absolute inset-0 animate-[v3-pulse_2.4s_ease-out_infinite] rounded-full" style={{ background: color }} />
          </span>
          {at && (
            <>
              <span className="pointer-events-none absolute inset-y-0 w-px bg-v3-line" style={{ left: `${(at[0] / W) * 100}%` }} />
              <span className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-v3-bg" style={{ left: `${(at[0] / W) * 100}%`, top: `${(at[1] / H) * 100}%`, background: color }} />
              <span
                className="glass-strong pointer-events-none absolute -top-2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl px-3 py-1.5 text-center"
                style={{ left: `clamp(60px, ${(at[0] / W) * 100}%, calc(100% - 60px))` }}
              >
                <span className="block text-[13px] font-semibold text-v3-ink tabular-nums">{formatPrice(points[hover])}</span>
                <span className="block text-[11px] text-v3-muted">{hover === points.length - 1 ? 'Now' : `${points.length - 1 - hover}h ago`}</span>
              </span>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Featured({ meta, coin }) {
  const up = coin ? coin.change >= 0 : true;
  const price = useTween(coin?.price ?? null, meta.id);
  const stats = [
    ['24h high', coin && formatPrice(coin.high)],
    ['24h low', coin && formatPrice(coin.low)],
    ['Traded in 24h', coin && compact.format(coin.volume)],
    ['Total market value', coin && compact.format(coin.marketCap)],
  ];
  return (
    <div className="glass flex h-full flex-col rounded-[32px] p-8 max-sm:p-5">
      <div className="flex items-center justify-between gap-4">
        {/* The header crossfades when the coin changes */}
        <div key={meta.id} className="flex animate-[v3-fade-up_600ms_cubic-bezier(0.22,1,0.36,1)] items-center gap-3.5">
          <img src={meta.icon} alt="" width="44" height="44" className="size-11" />
          <div>
            <p className="font-inter-tight text-[19px] font-semibold leading-6 text-v3-ink">{meta.name}</p>
            <p className="text-[13px] leading-5 text-v3-muted">{meta.symbol}</p>
          </div>
        </div>
        {coin && (
          <span className={cx('rounded-full px-2.5 py-1 text-[13px] font-semibold tabular-nums transition-colors duration-500', up ? 'bg-up/12 text-up' : 'bg-down/12 text-down')}>
            {formatChange(coin.change)}
          </span>
        )}
      </div>

      <p key={meta.id} className="mt-7 animate-[v3-fade-up_600ms_cubic-bezier(0.22,1,0.36,1)] font-inter-tight text-[48px] font-semibold leading-none tracking-[-0.03em] text-v3-ink tabular-nums max-sm:text-[36px]">
        {price != null ? formatPrice(price) : '—'}
      </p>

      <div className="mt-8 flex-1">
        <Chart points={coin?.spark} up={up} />
      </div>

      <dl className="mt-8 grid grid-cols-4 gap-4 max-sm:grid-cols-2 max-sm:gap-y-5">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[12px] leading-4 text-v3-muted">{k}</dt>
            <dd key={`${meta.id}-${v}`} className="mt-1.5 animate-[v3-fade-up_500ms_cubic-bezier(0.22,1,0.36,1)] text-[15px] font-semibold text-v3-ink tabular-nums">{v || '—'}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 border-t border-v3-line pt-6">
        <PrimaryButton href={links.trade}>Trade {meta.name}</PrimaryButton>
      </div>
    </div>
  );
}

// A thin trend line, no fill, for the list
function MiniLine({ points, up }) {
  if (!points || points.length < 2) return <span className="block h-7 w-20 rounded-md bg-v3-glass" />;
  const d = curve(scale(points, 80, 28, 3));
  return (
    <svg width="80" height="28" viewBox="0 0 80 28" aria-hidden="true" className="block">
      <path d={d} fill="none" stroke={up ? 'var(--up)' : 'var(--down)'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// A pill that slides under whichever option is active
function useSlider(activeKey, deps = []) {
  const box = useRef(null);
  const [rect, setRect] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = box.current?.querySelector('[data-active="true"]');
      if (el) setRect({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
      else setRect(null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [activeKey, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return [box, rect];
}

function Tabs({ tab, setTab }) {
  const [box, rect] = useSlider(tab);
  return (
    <div ref={box} role="tablist" aria-label="Filter assets" className="glass relative flex gap-1 rounded-full p-1">
      {rect && <span aria-hidden="true" className="absolute rounded-full bg-v3-ink" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, transition: `left 500ms ${EASE}, width 500ms ${EASE}` }} />}
      {TABS.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={tab === t}
          data-active={tab === t}
          onClick={() => setTab(t)}
          className={cx('relative h-10 rounded-full px-5 text-sm font-semibold transition-colors duration-500', tab === t ? 'text-v3-bg' : 'text-v3-muted hover:text-v3-ink')}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function CoinList({ rows, coins, picked, onPick, status, tab }) {
  const [box, rect] = useSlider(picked, [tab, rows.length]);
  return (
    <div className="glass flex h-full flex-col rounded-[32px] p-3">
      {status === 'error' && <p className="px-5 py-10 text-center text-sm text-v3-muted">Prices are unavailable right now. Try again in a minute.</p>}
      {/* Every row takes the height it has under "All", so a shorter filter leaves space below instead of stretching the rows */}
      <ul ref={box} className="relative flex flex-1 flex-col max-lg:min-h-[calc(var(--rows)*72px)]" style={{ '--rows': COINS.length }} aria-busy={status === 'loading'}>
        {rect && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 rounded-[20px] bg-v3-glass-2 shadow-[inset_0_0_0_1px_var(--v3-line)]"
            style={{ top: rect.y, height: rect.h, transition: `top 600ms ${EASE}, height 600ms ${EASE}` }}
          />
        )}
        {rows.map((m, i) => {
          const c = coins[m.id];
          const up = c ? c.change >= 0 : true;
          const on = m.id === picked;
          return (
            <li key={`${tab}-${m.id}`} data-active={on} className="relative flex animate-[v3-fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_backwards]" style={{ height: `${100 / COINS.length}%`, animationDelay: `${i * 45}ms` }}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onPick(m.id)}
                className="group/row grid h-full w-full grid-cols-[minmax(0,1fr)_auto_80px] items-center gap-4 rounded-[20px] px-5 py-3 text-left max-sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <span className="flex min-w-0 items-center gap-3.5">
                  <img src={m.icon} alt="" width="36" height="36" className="size-9 transition-transform duration-500 group-hover/row:scale-110" style={{ transitionTimingFunction: EASE }} />
                  <span className="min-w-0">
                    <span className={cx('block truncate text-[15px] font-semibold transition-colors duration-300', on ? 'text-v3-ink' : 'text-v3-soft group-hover/row:text-v3-ink')}>{m.name}</span>
                    <span className="block text-[12px] text-v3-muted">{m.symbol}</span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-[15px] font-semibold text-v3-ink tabular-nums">{c ? formatPrice(c.price) : '—'}</span>
                  <span className={cx('block text-[12px] font-medium tabular-nums', up ? 'text-up' : 'text-down')}>{c ? formatChange(c.change) : ''}</span>
                </span>
                <span className="justify-self-end opacity-80 transition-opacity duration-300 group-hover/row:opacity-100 max-sm:hidden"><MiniLine points={c?.spark} up={up} /></span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function MarketsV3() {
  const { status, coins } = useMarketData();
  const [tab, setTab] = useState('All');
  const [picked, setPicked] = useState('bitcoin');
  const rows = rowsFor(tab, coins);
  const meta = COINS.find((c) => c.id === picked);

  // A filter that hides the featured coin moves the selection to the first one shown
  useEffect(() => {
    if (rows.length && !rows.some((r) => r.id === picked)) setPicked(rows[0].id);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id="markets" className="relative py-32 max-sm:py-20">
      <div className={container}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Heading eyebrow="Live prices" parts={['Buy and sell popular', { serif: 'cryptocurrencies.' }]} lead="Trade Bitcoin, Ethereum, and stablecoins (digital currencies that hold a steady value of about $1) at live prices, with competitive fees and instant trades." />
          <Rise delay={250}><Tabs tab={tab} setTab={setTab} /></Rise>
        </div>

        {/* The featured card matches the list's height, which stays the same for every filter */}
        <div className="mt-14 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-stretch gap-6 max-lg:grid-cols-[minmax(0,1fr)]">
          <Rise zoom className="h-full"><Featured meta={meta} coin={coins[picked]} /></Rise>
          <Rise zoom delay={120} className="h-full">
            <CoinList rows={rows} coins={coins} picked={picked} onPick={setPicked} status={status} tab={tab} />
          </Rise>
        </div>
      </div>
    </section>
  );
}
