import React from 'react';
import { links } from '../links.js';
import arrowRight from '../assets/arrow-right.svg';
import check from '../assets/lens-check.svg';
import activity from '../assets/lens-activity.svg';
import activityActive from '../assets/lens-activity-active.svg';
import activityActiveLight from '../assets/lens-activity-active-light.svg';
import search from '../assets/lens-search.svg';
import searchActive from '../assets/lens-search-active.svg';
import searchActiveLight from '../assets/lens-search-active-light.svg';
import searchField from '../assets/lens-search-field.svg';
import report from '../assets/lens-report.svg';
import reportActive from '../assets/lens-report-active.svg';
import reportActiveLight from '../assets/lens-report-active-light.svg';
import reportItem from '../assets/lens-report-item.svg';
import userCheck from '../assets/lens-usercheck.svg';
import ringTrack from '../assets/lens-ring-track.svg';
import ringTrackLight from '../assets/lens-ring-track-light.svg';
import ringProgress from '../assets/lens-ring-progress.svg';
import ThemedImg from './ThemedImg.jsx';
import ThinkingOrb from './ThinkingOrb.jsx';
import SectionHead from './Section.jsx';
import { btn, btnArrow, cx } from '../ui.js';

const NAV = [
  { id: 'monitoring', label: 'Transaction Monitoring', icon: activity, active: activityActive, activeLight: activityActiveLight },
  { id: 'forensics', label: 'Forensic Investigations', icon: search, active: searchActive, activeLight: searchActiveLight },
  { id: 'reporting', label: 'Regulatory Reporting', icon: report, active: reportActive, activeLight: reportActiveLight },
  { id: 'kyb', label: 'KYB Verification', icon: userCheck },
];

// Illustrative heat map: 0 = low, 1 = medium, 2 = high, 3 = critical
const HEAT = [
  0, 1, 0, 2, 0, 1, 3, 0,
  1, 0, 2, 0, 1, 0, 1, 2,
  0, 2, 1, 3, 0, 1, 0, 1,
  2, 0, 1, 0, 2, 3, 1, 0,
  0, 1, 0, 1, 0, 2, 0, 1,
];
const HEAT_COLORS = ['bg-[#1d5c55]', 'bg-[#c06a28]', 'bg-[#d14b55]', 'bg-[#ff5a5f]'];

// Mock dashboard surfaces
const panel = 'rounded-[14px] border border-white/9 bg-[#121829] p-4 light:border-[#ececf1] light:bg-white';
const panelHead = 'flex items-start justify-between gap-3';
const panelTitle = 'block text-sm font-semibold leading-[21px]';
const panelSub = 'mt-[3px] block text-xs leading-[18px] text-[#9aa3bd]';
const muted = 'text-[#9aa3bd]';
const lensBtn = 'rounded-lg bg-brand px-3 py-[7px] text-xs font-semibold leading-[18px] whitespace-nowrap';
const rise = 'revealed:animate-[rise_0.6s_var(--ease-soft)_backwards]';
const delay = (ms) => ({ animationDelay: `${ms}ms` });

const TREND = { up: 'text-[#34d399]', down: 'text-[#f87171]', flat: 'text-[#9aa3bd]' };
const PILL = {
  active: 'bg-[rgba(52,211,153,0.12)] text-[#34d399]',
  under: 'bg-[rgba(251,146,60,0.14)] text-[#fb923c]',
  pending: 'bg-white/6 text-[#9aa3bd]',
  closed: 'bg-white/6 text-[#9aa3bd]',
  low: 'bg-white/6 text-[#9aa3bd]',
  critical: 'bg-[rgba(248,113,113,0.14)] text-[#f87171]',
  high: 'bg-[rgba(251,146,60,0.14)] text-[#fb923c]',
  medium: 'bg-[rgba(96,165,250,0.14)] text-[#60a5fa]',
};
function Pill({ kind, children }) {
  return (
    <b className={cx('inline-block h-[22.5px] whitespace-nowrap rounded-full px-2 py-[3px] font-inter text-[11px] font-medium leading-[16.5px]', PILL[kind])}>
      {children}
    </b>
  );
}

function MonitoringView() {
  const stats = [
    ['Transactions', '12,480', '+8.2%', 'up'],
    ['High-risk alerts', '24', '-3', 'down'],
    ['Suspicious wallets', '7', '+2', 'up'],
    ['Investigations', '3', '0', 'flat'],
  ];
  return (
    <>
      <div className="grid grid-cols-4 gap-2.5">
        {stats.map(([label, value, delta, dir], i) => (
          <div
            key={label}
            style={delay(300 + i * 80)}
            className={cx('flex flex-col gap-1 rounded-xl border border-white/9 bg-[#121829] px-3.5 py-3 light:border-[#ececf1] light:bg-white', rise)}
          >
            <span className={cx('whitespace-nowrap text-[11px] leading-[16.5px]', muted)}>{label}</span>
            <strong className="text-[22px] font-semibold leading-[33px]">{value}</strong>
            <em className={cx('text-[11px] font-semibold not-italic leading-[16.5px]', TREND[dir])}>
              {delta} <small className={cx('text-[9.17px] font-normal', muted)}>vs 24h</small>
            </em>
          </div>
        ))}
      </div>
      <div className={panel}>
        <div className={panelHead}>
          <div>
            <strong className={cx(panelTitle, 'flex items-center whitespace-nowrap')}>
              Risk heat map
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase leading-none tracking-[0.4px] text-up">
                <ThinkingOrb state="searching" size={20} tint="#0f9f6e" />Live
              </span>
            </strong>
            <span className={panelSub}>Real-time transaction risk</span>
          </div>
          <div className="flex gap-1">
            {['Geography', 'Risk graph', 'Velocity'].map((chip) => (
              <span
                key={chip}
                className={cx(
                  'block whitespace-nowrap rounded-[7px] px-[9px] py-[5px] text-[11px] leading-[16.5px]',
                  chip === 'Risk graph' ? 'bg-eyebrow text-white' : 'bg-white/5 text-[#9aa3bd] light:bg-[#f3f4f8] light:text-[#6f7794]',
                )}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3.5 grid grid-cols-8 auto-rows-[26.79px] gap-1.5">
          {HEAT.map((level, i) => (
            <i
              key={i}
              className={cx('block animate-[heat_5s_ease-in-out_infinite] rounded-md', HEAT_COLORS[level])}
              style={{ animationDelay: `${((i * 7) % 11) * -0.45}s` }}
            />
          ))}
        </div>
        <div className={cx('flex gap-4 pt-3 text-[11px] leading-[16.5px]', muted)}>
          {['Low', 'Medium', 'High', 'Critical'].map((label, i) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <i className={cx('block size-2.5 rounded-[3px]', HEAT_COLORS[i])} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function ForensicsView() {
  const cases = [
    ['FC-0341', 'Financial fraud', 'Active', 'High'],
    ['FC-0340', 'Data breach', 'Under review', 'Critical'],
    ['FC-0339', 'Sanctions exposure', 'Active', 'Medium'],
    ['FC-0338', 'Mixer interaction', 'Pending', 'High'],
    ['FC-0337', 'Unusual velocity', 'Closed', 'Low'],
  ];
  const tr = 'grid grid-cols-[88.75px_144.22px_110.94px_88.77px] items-center gap-2.5 px-1 py-[11px]';
  return (
    <div className={panel}>
      <div className="flex h-9 gap-2.5">
        <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border border-white/9 bg-[#0d1222] px-3 py-2 text-xs leading-[18px] text-[#6f7794] light:border-[#ececf1] light:bg-[#f8f8f8]">
          <img src={searchField} alt="" width="14" height="14" /> Search cases by ID, client, or investigator
        </span>
        <span className={cx(lensBtn, 'text-white')}>+ New case</span>
      </div>
      <div className="pt-3">
        <div className={cx(tr, 'text-[11px] font-semibold uppercase leading-[16.5px] tracking-[0.44px]', muted, rise)} style={delay(300)}>
          <span>Case ID</span><span>Type</span><span>Status</span><span>Severity</span>
        </div>
        {cases.map(([id, type, status, severity], i) => (
          <div key={id} className={cx(tr, 'border-t border-white/9 text-xs leading-[18px] light:border-[#ececf1]', rise)} style={delay(370 + i * 70)}>
            <span className="font-inter font-medium text-accent-blue light:text-tab-active">{id}</span>
            <span>{type}</span>
            <span><Pill kind={status.split(' ')[0].toLowerCase()}>{status}</Pill></span>
            <span><Pill kind={severity.toLowerCase()}>{severity}</Pill></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportingView() {
  const upcoming = [
    ['Monthly transaction report', 'Due in 5 days'],
    ['Suspicious activity report (SAR)', 'Due in 12 days'],
    ['Quarterly AML review', 'Due in 26 days'],
  ];
  return (
    <div className="grid grid-cols-[184px_306.67px] grid-rows-[301px] gap-3.5">
      <div className={panel}>
        <strong className={panelTitle}>Monthly compliance</strong>
        <div className="relative mx-auto mt-4 size-[127px]">
          <ThemedImg dark={ringTrack} light={ringTrackLight} width="127" height="127" className="absolute left-0 top-0 size-[127px] max-w-none" />
          <img
            src={ringProgress}
            alt=""
            className="absolute left-[3.63%] top-0 h-[127px] w-[96.37%] max-w-none revealed:animate-[ring-in_1.4s_var(--ease-soft)_0.4s_backwards]"
          />
          <span className={cx('absolute inset-0 flex flex-col items-center justify-center text-[10px] uppercase leading-[15px] tracking-[0.8px]', muted)}>
            <b className="font-inter-tight text-[28px] font-semibold normal-case leading-[42px] tracking-[-0.56px] text-accent-blue light:text-tab-active">82%</b>
            complete
          </span>
        </div>
        <dl className="grid gap-2 pt-[18px] text-xs leading-[18px]">
          {[['Completed', 9], ['Pending', 2], ['Due this month', 3]].map(([k, v]) => (
            <div key={k} className={cx('flex justify-between', muted)}>
              <dt>{k}</dt>
              <dd className="font-semibold text-white light:text-black">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={panel}>
        <div className={panelHead}>
          <div>
            <strong className={panelTitle}>Upcoming reports</strong>
            <span className={panelSub}>Due within the next 30 days</span>
          </div>
          <span className={cx(lensBtn, 'mt-[3px] block text-[#9aa3bd] light:bg-[#eef3ff] light:text-tab-active')}>Schedule report</span>
        </div>
        <ul className="grid gap-2 pt-3.5">
          {upcoming.map(([name, due], i) => (
            <li
              key={name}
              style={delay(400 + i * 90)}
              className={cx('flex items-center gap-2.5 rounded-[10px] border border-white/9 bg-[#0d1222] p-3 text-xs leading-[18px] light:border-[#ececf1] light:bg-[#f8f8f8]', rise)}
            >
              <img src={reportItem} alt="" width="16" height="16" className="shrink-0" />
              <span className="min-w-0 flex-1">{name}</span>
              <em className="whitespace-nowrap text-[11px] not-italic leading-[16.5px] text-[#fb923c]">{due}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LensWindow({ module, title, children }) {
  return (
    <div
      aria-hidden="true"
      className="reveal h-[450px] w-[576px] shrink-0 overflow-hidden rounded-xl bg-[rgba(27,35,85,0.7)] py-[25.86px] pl-[25.86px] [--reveal-delay:140ms] light:bg-transparent max-lg:w-full max-lg:max-w-[576px] max-lg:self-center max-sm:[zoom:0.62]"
    >
      <div className="h-[482px] overflow-hidden rounded-[20px_0_20px_20px] border border-white/10 bg-[#0d1222] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(47,96,224,0.08)] light:border-[#ececf1] light:bg-[#f8f8f8] light:text-black light:shadow-[0_20px_48px_-24px_rgba(10,16,36,0.25)]">
        <div className="flex h-10 items-center gap-[7px] border-b border-white/9 bg-[#0a0f1d] px-4 light:border-[#ececf1] light:bg-white">
          <i className="size-2.5 rounded-[5px] bg-[#f02225]" />
          <i className="size-2.5 rounded-[5px] bg-[#252c42] light:bg-[#dfe2ea]" />
          <i className="size-2.5 rounded-[5px] bg-[#43dfaa]" />
          <span className="whitespace-nowrap pl-2.5 text-xs leading-[18px] text-[#9aa3bd] light:text-[#6f7794]">LENS · {title}</span>
        </div>
        <div className="grid min-h-[440px] grid-cols-[188px_540.67px]">
          <nav className="flex flex-col gap-0.5 border-r border-white/9 bg-[#0a0f1d] px-2.5 py-4 light:border-[#ececf1] light:bg-white">
            <span className="px-2 pb-3 font-inter-tight text-[15px] font-bold leading-[22.5px] tracking-[2.1px] text-white light:text-black">LENS</span>
            {NAV.map((item) => {
              const active = item.id === module;
              return (
                <span
                  key={item.id}
                  className={cx(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-[9px] text-[10px] leading-[18px]',
                    active ? 'bg-brand/16 text-accent-blue light:bg-tab-active/10 light:text-tab-active' : 'text-[#9aa3bd] light:text-[#6f7794]',
                  )}
                >
                  {active && item.active
                    ? <ThemedImg dark={item.active} light={item.activeLight} width="15" height="15" />
                    : <img src={item.icon} alt="" width="15" height="15" />}
                  {item.label}
                </span>
              );
            })}
          </nav>
          <div className="flex flex-col gap-3.5 p-[18px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

const rows = [
  {
    module: 'monitoring',
    title: 'Transaction Monitoring',
    heading: 'See risk the moment it moves.',
    copy: 'Monitor transactions in real time, detect risk, and manage alerts from one dashboard.',
    points: ['Real-time risk heat map by geography, risk graph, and velocity', 'Wallet checks and watchlists', 'High-risk alerts and suspicious wallet tracking'],
    View: MonitoringView,
  },
  {
    module: 'forensics',
    title: 'Forensic Investigations',
    heading: 'Investigate with evidence, not guesswork.',
    copy: 'Open cases on suspicious activity, assign investigators, and manage evidence through to resolution.',
    points: ['Case management with status and severity', 'Assign a lead investigator to every case', 'Search and filter by client, type, or investigator'],
    View: ForensicsView,
    reverse: true,
  },
  {
    module: 'reporting',
    title: 'Regulatory Reporting',
    heading: 'Never miss a filing deadline.',
    copy: 'Prepare and manage regulatory reports and SARs, and track every deadline on a shared filing calendar.',
    points: ['Monthly compliance progress at a glance', 'SAR management and report scheduling', 'Filing calendar for reports due in the next 30 days'],
    View: ReportingView,
  },
];

export default function Lens() {
  return (
    <section className="relative overflow-hidden bg-navy py-24 text-white light:bg-[#f7f7fc] light:text-black max-sm:py-[72px]" id="lens">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_557px_at_50%_0%,rgba(47,96,224,0.28),transparent_70%),radial-gradient(400px_619px_at_90%_80%,rgba(15,159,110,0.1),transparent_70%)] light:bg-[radial-gradient(560px_557px_at_50%_0%,rgba(58,110,244,0.28),transparent_70%)]"
      />
      <div className="site-container relative">
        <SectionHead
          className="mb-[60px]"
          eyebrow="LENS by Mybitstore"
          eyebrowClass="mb-3.5 v2:hidden"
          title="Compliance intelligence for crypto businesses."
          titleClass="text-white light:text-black v2:max-w-[946px]"
          lead="Monitor transactions, investigate suspicious activity, and stay on top of regulatory reporting."
          leadClass="mt-3.5 max-w-[804px] font-nunito text-2xl leading-[1.2] text-[#c2c4cc] light:text-[#717792] max-sm:text-lg max-sm:leading-[1.6]"
        >
          <a
            href={links.lensLogin}
            className="group/signin mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(143,176,255,0.3)] bg-brand/10 px-[18px] py-[9px] text-[15px] text-[#9aa3bd] transition-[border-color,background-color] duration-200 hover:border-[rgba(143,176,255,0.6)] hover:bg-brand/18 light:border-[#d5def5] light:bg-white light:text-[#2a3350] light:hover:border-brand/50 light:hover:bg-[#eef3ff] v2:hidden"
          >
            Already a LENS customer? <strong className="font-semibold text-accent-blue light:text-tab-active">Sign in to LENS</strong>
            <img src={arrowRight} alt="" width="16" height="16" className="transition-transform duration-200 group-hover/signin:translate-x-[3px]" />
          </a>
        </SectionHead>
        <div className="flex flex-col gap-[60px]">
          {rows.map(({ module, title, heading, copy, points, View, reverse }, i) => (
            <div
              key={module}
              className={cx(
                'flex items-center justify-between gap-12 max-xl:gap-8 max-lg:flex-col max-lg:items-stretch',
                reverse ? 'flex-row-reverse v2:lg:flex-row' : 'v2:lg:flex-row-reverse',
              )}
            >
              <div className="reveal flex w-[576px] flex-col items-start gap-5 max-xl:w-auto max-xl:flex-1 max-lg:w-full">
                <h3 className={cx('text-[30px] font-semibold leading-[34.5px] tracking-[-0.6px] max-sm:text-[26px] max-sm:leading-[1.2]', i === 0 ? 'max-w-[305px]' : 'max-w-[576px]')}>
                  {heading}
                </h3>
                <p className="text-base leading-6 text-[#9aa3bd] light:text-[#717792]">{copy}</p>
                <ul className="grid gap-3">
                  {points.map((p) => (
                    <li key={p} className="flex max-w-[380px] items-start gap-2.5 text-[15px] leading-[22.5px] text-[#d5daea] light:text-[#717792]">
                      <img src={check} alt="" width="16" height="16" className="mt-[3px] shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a className={btn.heroPrimary} href={links.support}>
                  Talk To Our Team
                  <img src={arrowRight} alt="" width="22" height="22" className={btnArrow} />
                </a>
              </div>
              <LensWindow module={module} title={title}><View /></LensWindow>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
