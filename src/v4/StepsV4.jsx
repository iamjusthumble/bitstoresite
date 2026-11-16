import React, { useEffect, useState } from 'react';
import { links } from '../links.js';
import btc from '../assets/coin-btc.svg';
import logo from '../assets/logo.svg';
import { cx } from '../ui.js';
import { reducedMotion, useInView } from '../v3/motion.js';
import { steps as STEPS } from '../v3/copy.js';
import { Check, Heading, PrimaryButton, Rise, container, section } from './ui.jsx';

const STEP_MS = 4800;

// The app screens are drawn in the app's own light palette, whatever the site theme
const ink = 'text-[#0a0c12]';
const muted = 'text-[#6b7280]';
const field = 'flex h-11 items-center rounded-xl border border-[#e5e7eb] bg-white px-3.5 text-[13px]';

function ScreenTitle({ title, sub }) {
  return (
    <div>
      <p className={cx('text-[19px] font-semibold tracking-[-0.02em]', ink)}>{title}</p>
      <p className={cx('mt-1 text-[12px] leading-4', muted)}>{sub}</p>
    </div>
  );
}

// 1. Sign up: the email types itself in
function SignUp() {
  return (
    <div className="flex h-full flex-col gap-5">
      <ScreenTitle title="Create your account" sub="It only takes a few minutes." />
      <div className="flex flex-col gap-2.5">
        <span className={cx(muted, 'text-[11px] font-medium')}>Email address</span>
        <span className={cx(field, ink, 'border-[#2f60e0] shadow-[0_0_0_3px_rgba(47,96,224,0.15)]')}>
          <span className="inline-block max-w-0 overflow-hidden whitespace-nowrap animate-[v4-type_1.6s_steps(16)_0.4s_forwards]">ama@example.com</span>
          <span className="ml-px h-4 w-px animate-[v4-blink_1s_steps(1)_infinite] bg-[#2f60e0]" />
        </span>
        <span className={cx(muted, 'mt-1 text-[11px] font-medium')}>Password</span>
        <span className={cx(field, ink, 'tracking-[0.3em]')}>••••••••••</span>
      </div>
      <span className="grid h-11 place-items-center rounded-xl bg-[#2f60e0] text-[13px] font-semibold text-white">Continue</span>
      <div className={cx(muted, 'flex items-center gap-3 text-[11px]')}><span className="h-px flex-1 bg-[#e5e7eb]" />or<span className="h-px flex-1 bg-[#e5e7eb]" /></div>
      <div className="grid grid-cols-2 gap-2">
        {['Google', 'Apple'].map((n) => <span key={n} className={cx(field, ink, 'justify-center font-medium')}>{n}</span>)}
      </div>
      <p className={cx(muted, 'mt-auto text-center text-[11px]')}>We’ll send a link to confirm your email.</p>
    </div>
  );
}

// 2. Two-factor: the six-digit code fills in, then turns on
function TwoFactor() {
  const code = '483920';
  return (
    <div className="flex h-full flex-col gap-6">
      <ScreenTitle title="Two-factor authentication" sub="Enter the 6-digit code from your authenticator app." />
      <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#eef3ff] text-[#2f60e0]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2.5" width="10" height="15" rx="2" /><path d="M8.5 14.5h3M10 6.5v3l2 1" /></svg>
        </span>
        <span>
          <span className={cx('block text-[13px] font-semibold', ink)}>Authenticator app</span>
          <span className={cx('block text-[11px]', muted)}>A new code every 30 seconds</span>
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {code.split('').map((d, i) => (
          <span key={i} className={cx('grid h-12 place-items-center rounded-xl border border-[#e5e7eb] bg-white text-[18px] font-semibold', ink)}>
            <span className="animate-[v4-pop_400ms_cubic-bezier(0.16,1,0.3,1)_backwards]" style={{ animationDelay: `${400 + i * 220}ms` }}>{d}</span>
          </span>
        ))}
      </div>
      <div className="flex animate-[v4-fade-up_600ms_cubic-bezier(0.16,1,0.3,1)_2s_backwards] items-center gap-3 rounded-xl bg-[#ecfdf3] p-3.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0f9f6e] text-white"><Check size={14} /></span>
        <span>
          <span className={cx('block text-[13px] font-semibold', ink)}>Two-factor is on</span>
          <span className={cx('block text-[11px]', muted)}>Your account has an extra layer of security.</span>
        </span>
      </div>
    </div>
  );
}

// 3. Add funds: the ways to get money in, one picked
function AddFunds() {
  const ways = [
    ['Card', 'Visa or Mastercard', <><rect x="2.5" y="5" width="15" height="10.5" rx="2" /><path d="M2.5 8.5h15" /></>],
    ['Bank transfer', 'From your bank account', <><path d="M3 8h14L10 4 3 8Z" /><path d="M5 8v6M8.5 8v6M11.5 8v6M15 8v6M3 16h14" /></>],
    ['Verified sellers (P2P)', 'Buy directly from other users', <><circle cx="7" cy="7" r="2.5" /><circle cx="13.5" cy="8.5" r="2" /><path d="M2.5 16c.5-2.5 2.3-4 4.5-4s4 1.5 4.5 4M12 13c2 0 3.5 1.2 4 3" /></>],
    ['Deposit crypto', 'Send from another wallet', <path d="M10 3.5v9M6 9l4 4 4-4M4 16.5h12" />],
  ];
  return (
    <div className="flex h-full flex-col gap-5">
      <ScreenTitle title="Add funds" sub="Choose how you want to add money." />
      <div className="flex flex-col gap-2">
        {ways.map(([t, s, icon], i) => (
          <span
            key={t}
            className={cx('flex animate-[v4-fade-up_500ms_cubic-bezier(0.16,1,0.3,1)_backwards] items-center gap-3 rounded-xl border bg-white p-3', i === 1 ? 'border-[#2f60e0] shadow-[0_0_0_3px_rgba(47,96,224,0.12)]' : 'border-[#e5e7eb]')}
            style={{ animationDelay: `${200 + i * 110}ms` }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef3ff] text-[#2f60e0]">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
            </span>
            <span className="min-w-0">
              <span className={cx('block text-[13px] font-semibold', ink)}>{t}</span>
              <span className={cx('block text-[11px]', muted)}>{s}</span>
            </span>
            <span className={cx('ml-auto size-4 shrink-0 rounded-full', i === 1 ? 'border-[5px] border-[#2f60e0]' : 'border-2 border-[#d1d5db]')} />
          </span>
        ))}
      </div>
    </div>
  );
}

// 4. Trade: a Bitcoin purchase that goes through
function Trade() {
  return (
    <div className="flex h-full flex-col gap-5">
      <ScreenTitle title="Buy Bitcoin" sub="Pay with your Mybitstore balance." />
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
        <span className={cx(muted, 'text-[11px] font-medium')}>You pay</span>
        <p className={cx('mt-1 text-[26px] font-semibold tracking-[-0.03em]', ink)}>$250.00</p>
        <div className="mt-3 flex items-center gap-2 border-t border-[#f1f2f4] pt-3">
          <img src={btc} alt="" className="size-6" />
          <span className={cx('text-[13px] font-semibold', ink)}>Bitcoin</span>
          <span className={cx('ml-auto text-[12px]', muted)}>BTC</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-[12px]">
        {[['Fee', '$1.25'], ['Arrives', 'Instantly']].map(([k, v]) => (
          <span key={k} className="flex justify-between"><span className={muted}>{k}</span><span className={cx('font-medium', ink)}>{v}</span></span>
        ))}
      </div>
      <div className="relative mt-auto h-11">
        <span className="absolute inset-0 grid place-items-center rounded-xl bg-[#2f60e0] text-[13px] font-semibold text-white">Buy Bitcoin</span>
        {/* The button turns into the confirmation */}
        <span className="absolute inset-0 flex animate-[v4-fade_400ms_ease_1.6s_backwards] items-center justify-center gap-2 rounded-xl bg-[#0f9f6e] text-[13px] font-semibold text-white">
          <Check size={14} /> Purchase complete
        </span>
      </div>
    </div>
  );
}

const SCREENS = [SignUp, TwoFactor, AddFunds, Trade];

// A plain phone frame around the current screen
function Phone({ step }) {
  const Screen = SCREENS[step];
  return (
    <div className="relative h-[560px] w-[290px] rounded-[46px] bg-[#0a0c12] p-[9px] shadow-[0_40px_80px_-30px_rgba(5,10,40,0.6),inset_0_0_0_1px_rgba(255,255,255,0.12)] max-sm:h-[500px] max-sm:w-[260px]">
      <div className="relative h-full overflow-hidden rounded-[38px] bg-[#f7f8fa]">
        <div className="flex items-center justify-between px-6 pt-3.5 text-[11px] font-semibold text-[#0a0c12]">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2.5 h-6 w-[84px] -translate-x-1/2 rounded-full bg-[#0a0c12]" />
          <span className="flex gap-1"><i className="h-2.5 w-4 rounded-[3px] border border-[#0a0c12]" /></span>
        </div>
        <div className="flex items-center gap-2 px-5 pt-5">
          <img src={logo} alt="" className="size-5" />
          <span className={cx('text-[12px] font-semibold', ink)}>Mybitstore</span>
          <span className={cx('ml-auto text-[10px] font-medium', muted)}>Step {step + 1} of 4</span>
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-1 px-5">
          {SCREENS.map((_, i) => (
            <span key={i} className="h-[3px] overflow-hidden rounded-full bg-[#e5e7eb]">
              <span className="block h-full rounded-full bg-[#2f60e0] transition-transform duration-700 ease-v4 origin-left" style={{ transform: `scaleX(${i <= step ? 1 : 0})` }} />
            </span>
          ))}
        </div>
        {/* A new key replays each screen's own animation */}
        <div key={step} className="h-[calc(100%-82px)] animate-[v4-fade-up_600ms_cubic-bezier(0.16,1,0.3,1)] px-5 pb-6 pt-6">
          <Screen />
        </div>
      </div>
    </div>
  );
}

// A notification that drops in over the top of the phone once each step's screen has played
const TOASTS = [
  { title: 'Email confirmed', sub: 'Welcome to Mybitstore', },
  { title: 'Account protected', sub: 'Two-factor is on', },
  { title: 'Funds added', sub: 'Ready to trade', },
  { title: 'Bitcoin bought', sub: 'Now in your wallet', },
];

function Toast({ step }) {
  const t = TOASTS[step];
  return (
    <div key={step} className="absolute left-1/2 top-[18px] z-2 w-[300px] -translate-x-1/2 max-sm:w-[260px]">
      <div className="flex animate-[v4-toast_700ms_cubic-bezier(0.16,1,0.3,1)_1.9s_backwards] items-center gap-3 rounded-[20px] bg-white/95 py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-16px_rgba(5,10,50,0.55)] backdrop-blur-md">
        <span className="grid size-8 place-items-center rounded-full bg-[#0f9f6e] text-white"><Check size={14} /></span>
        <span>
          <span className="block text-[13px] font-semibold text-[#0a0c12]">{t.title}</span>
          <span className="block text-[11px] text-[#6b7280]">{t.sub}</span>
        </span>
      </div>
    </div>
  );
}

// Steps on the left that advance on their own (or on click); the phone on the right shows each one in the app
export default function StepsV4() {
  const [step, setStep] = useState(0);
  const [ref, inView] = useInView({ once: false, threshold: 0.3 });
  const auto = inView && !reducedMotion();

  useEffect(() => {
    if (!auto) return undefined;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [auto, step]);

  return (
    <section className={section}>
      <div ref={ref} className={cx(container, 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-16 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-12')}>
        <div className="flex flex-col gap-10">
          <Heading size="md" parts={['Get started in', '\n', { dim: 'four simple steps.' }]} />
          <ol className="flex flex-col border-t border-v4-line">
            {STEPS.map(([title, copy], i) => {
              const on = step === i;
              return (
                <li key={title} className="border-b border-v4-line">
                  <button type="button" aria-current={on ? 'step' : undefined} onClick={() => setStep(i)} className="group/s relative flex w-full gap-5 py-5 text-left">
                    <span className={cx('grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-medium tabular-nums transition-[background-color,color,box-shadow] duration-500', i < step ? 'bg-v4-accent text-white' : on ? 'text-v4-accent-ink shadow-[inset_0_0_0_1.5px_var(--v4-accent)]' : 'text-v4-faint shadow-[inset_0_0_0_1px_var(--v4-line-2)]')}>
                      {i < step ? <Check size={12} /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cx('block text-[19px] font-medium tracking-[-0.015em] transition-colors duration-500', on ? 'text-v4-ink' : 'text-v4-muted group-hover/s:text-v4-ink')}>{title}</span>
                      <span className={cx('grid transition-[grid-template-rows] duration-700 ease-v4', on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                        <span className={cx('overflow-hidden text-[15px] leading-[1.6] text-v4-muted transition-opacity duration-700', on ? 'opacity-100' : 'opacity-0')}>
                          <span className="block pt-2">{copy}</span>
                        </span>
                      </span>
                    </span>
                    {/* Fills while this step is showing, then the next one takes over */}
                    {on && (
                      <span aria-hidden="true" className="absolute -bottom-px left-0 z-1 h-[1.5px] w-full bg-v4-line">
                        <span key={`${step}-${auto}`} className="block h-full origin-left bg-v4-accent" style={auto ? { animation: `v4-progress ${STEP_MS}ms linear forwards` } : { transform: 'scaleX(1)' }} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <Rise className="flex">
            <PrimaryButton href={links.signup}>Create your account</PrimaryButton>
          </Rise>
        </div>

        <Rise className="relative grid h-[680px] place-items-center overflow-hidden rounded-[32px] bg-[radial-gradient(110%_80%_at_20%_0%,#4b79f2_0%,#2f60e0_45%,#1c3fb0_100%)] max-sm:h-[580px]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(255,255,255,0.25),transparent)]" />
          {/* Fine dots and two quiet rings give the panel depth */}
          <div aria-hidden="true" className="absolute inset-0 opacity-40 [mask-image:radial-gradient(closest-side,#000,transparent)]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          {[520, 760].map((d) => <span key={d} aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" style={{ width: d, height: d }} />)}
          <Phone step={step} />
          <Toast step={step} />
        </Rise>
      </div>
    </section>
  );
}
