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

function MonitoringView() {
  const stats = [
    ['Transactions', '12,480', '+8.2%', 'up'],
    ['High-risk alerts', '24', '-3', 'down'],
    ['Suspicious wallets', '7', '+2', 'up'],
    ['Investigations', '3', '0', 'flat'],
  ];
  return (
    <>
      <div className="lens-stats">
        {stats.map(([label, value, delta, dir]) => (
          <div className="lens-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <em className={'is-' + dir}>{delta} <small>vs 24h</small></em>
          </div>
        ))}
      </div>
      <div className="lens-panel">
        <div className="lens-panel-head">
          <div>
            <strong>Risk heat map <span className="lens-live"><ThinkingOrb state="searching" size={20} tint="#0f9f6e" />Live</span></strong>
            <span>Real-time transaction risk</span>
          </div>
          <div className="lens-chips">
            <span>Geography</span>
            <span className="is-active">Risk graph</span>
            <span>Velocity</span>
          </div>
        </div>
        <div className="lens-heat">
          {HEAT.map((level, i) => <i key={i} className={'heat-' + level} style={{ '--k': (i * 7) % 11 }} />)}
        </div>
        <div className="lens-legend">
          <span><i className="heat-0" />Low</span>
          <span><i className="heat-1" />Medium</span>
          <span><i className="heat-2" />High</span>
          <span><i className="heat-3" />Critical</span>
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
  return (
    <div className="lens-panel">
      <div className="lens-toolbar">
        <span className="lens-search"><img src={searchField} alt="" width="14" height="14" /> Search cases by ID, client, or investigator</span>
        <span className="lens-btn">+ New case</span>
      </div>
      <div className="lens-table">
        <div className="lens-tr lens-th">
          <span>Case ID</span><span>Type</span><span>Status</span><span>Severity</span>
        </div>
        {cases.map(([id, type, status, severity]) => (
          <div className="lens-tr" key={id}>
            <span className="lens-id">{id}</span>
            <span>{type}</span>
            <span><b className={'pill status-' + status.split(' ')[0].toLowerCase()}>{status}</b></span>
            <span><b className={'pill sev-' + severity.toLowerCase()}>{severity}</b></span>
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
    <div className="lens-report">
      <div className="lens-panel">
        <strong className="lens-panel-title">Monthly compliance</strong>
        <div className="lens-ring">
          <ThemedImg dark={ringTrack} light={ringTrackLight} width="127" height="127" />
          <img className="lens-ring-progress" src={ringProgress} alt="" />
          <span><b>82%</b>complete</span>
        </div>
        <dl>
          <div><dt>Completed</dt><dd>9</dd></div>
          <div><dt>Pending</dt><dd>2</dd></div>
          <div><dt>Due this month</dt><dd>3</dd></div>
        </dl>
      </div>
      <div className="lens-panel">
        <div className="lens-panel-head">
          <div>
            <strong>Upcoming reports</strong>
            <span>Due within the next 30 days</span>
          </div>
          <span className="lens-btn lens-btn-muted">Schedule report</span>
        </div>
        <ul className="lens-upcoming">
          {upcoming.map(([name, due]) => (
            <li key={name}><img src={reportItem} alt="" width="16" height="16" /><span>{name}</span><em>{due}</em></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LensWindow({ module, title, children }) {
  return (
    <div className="lens-frame reveal" aria-hidden="true">
      <div className="lens-window">
        <div className="lens-window-bar">
          <i className="dot-red" /><i /><i className="dot-green" />
          <span>LENS · {title}</span>
        </div>
        <div className="lens-app">
          <nav className="lens-nav">
            <span className="lens-nav-brand">LENS</span>
            {NAV.map((item) => (
              <span key={item.id} className={item.id === module ? 'is-active' : ''}>
                {item.id === module && item.active
                  ? <ThemedImg dark={item.active} light={item.activeLight} width="15" height="15" />
                  : <img src={item.icon} alt="" width="15" height="15" />}
                {item.label}
              </span>
            ))}
          </nav>
          <div className="lens-main">{children}</div>
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
    <section className="section lens" id="lens">
      <div className="lens-glow" aria-hidden="true" />
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">LENS by Mybitstore</span>
          <h2>Compliance intelligence for crypto businesses.</h2>
          <p className="lead lead-lg">Monitor transactions, investigate suspicious activity, and stay on top of regulatory reporting.</p>
          <a className="lens-signin" href={links.lensLogin}>
            Already a LENS customer? <strong>Sign in to LENS</strong>
            <img src={arrowRight} alt="" width="16" height="16" />
          </a>
        </div>
        <div className="lens-rows">
          {rows.map(({ module, title, heading, copy, points, View, reverse }) => (
            <div className={'lens-row' + (reverse ? ' is-reversed' : '')} key={module}>
              <div className="lens-copy reveal">
                <h3>{heading}</h3>
                <p>{copy}</p>
                <ul>
                  {points.map((p) => (
                    <li key={p}><img src={check} alt="" width="16" height="16" />{p}</li>
                  ))}
                </ul>
                <a className="btn btn-hero btn-hero-primary" href={links.support}>
                  Talk To Our Team
                  <img src={arrowRight} alt="" width="22" height="22" />
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
