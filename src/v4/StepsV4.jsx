import React from 'react';
import { links } from '../links.js';
import btc from '../assets/coin-btc.svg';
import logo from '../assets/logo.svg';
import { cx } from '../ui.js';
import { useInView } from '../v3/motion.js';
import { steps as STEPS } from './copy.js';
import { Check, Heading, PrimaryButton, Rise, container, section } from './ui.jsx';


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

// Four steps side by side. Each has its own phone rising out of a soft blue panel, showing that step in the app;
// the phones rise one after another when the section comes into view, and lift a little on hover.
export default function StepsV4() {
  const [ref, inView] = useInView({ threshold: 0.2 });
  return (
    <section className={section}>
      <div className={container}>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Heading size="md" parts={['Get started in', '\n', { dim: 'four simple steps.' }]} />
          <Rise delay={150}><PrimaryButton href={links.signup}>Create your account</PrimaryButton></Rise>
        </div>
        <ol ref={ref} className="scrollbar-none mt-10 grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:-mx-5 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-5 max-sm:overflow-x-auto max-sm:px-5 max-sm:pb-2">
          {STEPS.map(([title, copy], i) => (
            <li key={title} className="group/st flex flex-col overflow-hidden rounded-[28px] bg-v4-bg-2 max-sm:w-[82vw] max-sm:shrink-0 max-sm:snap-start">
              <div className="flex flex-col gap-2.5 p-6 pb-5">
                <span className="text-[13px] font-medium text-v4-accent-ink">Step {i + 1}</span>
                <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-v4-ink">{title}</h3>
                <p className="min-h-[72px] text-[14px] leading-[1.6] text-v4-muted max-xl:min-h-0">{copy}</p>
              </div>
              <div className="relative mt-auto h-[360px] overflow-hidden bg-[radial-gradient(90%_70%_at_50%_100%,#4b79f2_0%,#2f60e0_55%,#1f45bf_100%)]">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.25),transparent)]" />
                <div
                  className={cx('absolute left-1/2 top-9 origin-top transition-[translate,opacity] duration-[1200ms] ease-v4 group-hover/st:-translate-y-2', inView ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0')}
                  style={{ transitionDelay: inView ? `${i * 140}ms` : '0ms', transform: 'translateX(-50%) scale(0.82)' }}
                >
                  {/* Mounting the screen once in view starts its animation as the phone arrives */}
                  {inView ? <Phone step={i} /> : <div className="h-[560px] w-[290px]" />}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
