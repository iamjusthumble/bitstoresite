import React, { useId, useState } from 'react';
import { links } from '../links.js';
import { useTheme } from '../theme.js';
import ThemedImg from '../components/ThemedImg.jsx';
import logo from '../assets/logo.svg';
import arrowLeft from '../assets/ll-arrow-left.svg';
import arrowLeftDark from '../assets/ll-arrow-left-dark.svg';
import arrowRight from '../assets/ll-arrow-right.svg';
import eye from '../assets/ll-eye.svg';
import moon from '../assets/ll-moon.svg';
import sun from '../assets/ll-sun.svg';
import { signIn } from './lensAuth.js';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};
// Shown while the password is revealed (no Figma asset for this state)
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}><path d="M3 3l18 18M10.6 5.6A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.9M6.4 6.9C3.9 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);

// Camera-aperture mark: each hexagon side is extended until it meets the outer ring
function apertureBlades(cx, cy, inner, outer) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + inner * Math.cos(a), cy + inner * Math.sin(a)];
  });
  return pts.map((p, i) => {
    const q = pts[(i + 1) % 6];
    const d = [q[0] - p[0], q[1] - p[1]];
    const f = [p[0] - cx, p[1] - cy];
    const a = d[0] ** 2 + d[1] ** 2;
    const b = 2 * (f[0] * d[0] + f[1] * d[1]);
    const c = f[0] ** 2 + f[1] ** 2 - outer ** 2;
    const t = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    return `M${p[0].toFixed(2)} ${p[1].toFixed(2)}L${(p[0] + t * d[0]).toFixed(2)} ${(p[1] + t * d[1]).toFixed(2)}`;
  });
}
const BLADES = apertureBlades(16, 16, 5.2, 12);

export function LensMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.8" />
      {BLADES.map((d) => <path key={d} d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />)}
    </svg>
  );
}

// Illustrative transaction graph inside the lens: [x, y, risk] where 0 = low, 1 = medium, 2 = high
const NODES = [
  [260, 150, 0], [350, 190, 0], [380, 280, 1], [330, 360, 0], [240, 380, 2],
  [160, 320, 0], [150, 220, 1], [200, 160, 0], [300, 260, 0], [220, 270, 0],
  [410, 210, 0], [110, 270, 0], [290, 430, 0], [430, 330, 2],
];
const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 8], [8, 2],
  [8, 9], [9, 5], [9, 4], [1, 10], [6, 11], [3, 12], [2, 13], [8, 3], [9, 7],
];

function LensVisual() {
  return (
    <div className="ll-stage" aria-hidden="true">
      <div className="ll-sweep" />
      <svg className="ll-graph" viewBox="0 0 520 520">
        <defs>
          <radialGradient id="ll-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0.65" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="ll-mask"><rect width="520" height="520" fill="url(#ll-fade)" /></mask>
        </defs>
        <g className="ll-rings">
          <circle cx="260" cy="260" r="250" />
          <circle cx="260" cy="260" r="190" />
          <circle cx="260" cy="260" r="120" />
        </g>
        <circle className="ll-dash" cx="260" cy="260" r="222" />
        <g mask="url(#ll-mask)">
          {EDGES.map(([a, b]) => {
            const hot = NODES[a][2] === 2 || NODES[b][2] === 2;
            return (
              <line
                key={a + '-' + b}
                className={hot ? 'll-edge is-hot' : 'll-edge'}
                x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
              />
            );
          })}
          {NODES.map(([x, y, risk], i) => (
            <g key={i} className={'ll-node risk-' + risk} style={{ '--delay': (i % 5) * 0.6 + 's' }}>
              {risk > 0 && <circle className="ll-pulse" cx={x} cy={y} r="7" />}
              <circle cx={x} cy={y} r={risk ? 6 : 4.5} />
            </g>
          ))}
        </g>
      </svg>
      <div className="ll-core"><LensMark size={44} /></div>

      <div className="ll-chip ll-chip-1">
        <span className="ll-dot risk-2" />
        <div><strong>High-risk wallet flagged</strong><small>bc1q…7x9f · Risk score 92</small></div>
      </div>
      <div className="ll-chip ll-chip-2">
        <span className="ll-dot risk-1" />
        <div><strong>Case FC-0342 opened</strong><small>Assigned to compliance team</small></div>
      </div>
      <div className="ll-chip ll-chip-3">
        <span className="ll-dot risk-0" />
        <div><strong>SAR filed on time</strong><small>Filing calendar up to date</small></div>
      </div>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your work email.';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address, like name@company.com.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

function Field({ id, label, error, aside, children }) {
  return (
    <div className={'ll-field' + (error ? ' has-error' : '')}>
      <div className="ll-label-row">
        <label htmlFor={id}>{label}</label>
        {aside}
      </div>
      <div className="ll-input">
        {children}
      </div>
      {error && <p className="ll-error" id={id + '-error'}>{error}</p>}
    </div>
  );
}

export default function LensLogin() {
  const [theme, toggleTheme] = useTheme();
  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const uid = useId();
  const emailId = uid + 'email';
  const passwordId = uid + 'password';

  const errors = validate(values);
  const visibleError = (name) => (touched[name] ? errors[name] : undefined);

  const update = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setFormError('');
  };
  const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length) {
      document.getElementById(errors.email ? emailId : passwordId)?.focus();
      return;
    }
    setStatus('loading');
    setFormError('');
    try {
      await signIn({ email: values.email.trim(), password: values.password });
    } catch (err) {
      setFormError(err.message);
      setStatus('idle');
    }
  }

  const loading = status === 'loading';
  // The light design dims the button until the visitor starts on the form
  const pristine = !values.email && !values.password && !touched.email && !touched.password;

  return (
    <div className="ll">
      <aside className="ll-showcase">
        <div className="ll-showcase-glow" />
        <a className="ll-brand" href="/" aria-label="Mybitstore home">
          <img src={logo} alt="" width="28" height="28" />
          <span>Mybitstore</span>
        </a>
        <LensVisual />
        <div className="ll-showcase-copy">
          <h2>Compliance intelligence,<br /><span>in focus.</span></h2>
          <p>Monitor transactions, investigate suspicious activity, and stay ahead of regulatory reporting from one workspace.</p>
          <ul>
            <li>Transaction Monitoring</li>
            <li>Forensic Investigations</li>
            <li>Regulatory Reporting</li>
          </ul>
        </div>
      </aside>

      <main className="ll-panel">
        <div className="ll-topbar">
          <a className="ll-back" href="/#lens"><ThemedImg dark={arrowLeftDark} light={arrowLeft} width="16" height="16" /> Back to Mybitstore</a>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <img src={theme === 'dark' ? sun : moon} alt="" width="18" height="18" />
          </button>
        </div>

        <div className="ll-form-wrap">
          <div className="ll-identity">
            <span className="ll-mark"><LensMark size={30} /></span>
            <span className="ll-badge"><b>LENS</b> Compliance Suite</span>
          </div>
          <h1>Sign in to LENS</h1>
          <p className="ll-sub">Welcome back. Enter your details to open your compliance workspace.</p>

          <form className="ll-form" onSubmit={handleSubmit} noValidate>
            {formError && <div className="ll-alert" role="alert">{formError}</div>}

            <Field id={emailId} label="Work email" error={visibleError('email')}>
              <input
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="name@company.com"
                value={values.email}
                onChange={update}
                onBlur={blur}
                disabled={loading}
                aria-invalid={Boolean(visibleError('email'))}
                aria-describedby={visibleError('email') ? emailId + '-error' : undefined}
              />
            </Field>

            <Field
              id={passwordId}
              label="Password"
              error={visibleError('password')}
              aside={<a className="ll-link" href={links.support}>Forgot password?</a>}
            >
              <input
                id={passwordId}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={update}
                onBlur={blur}
                disabled={loading}
                aria-invalid={Boolean(visibleError('password'))}
                aria-describedby={visibleError('password') ? passwordId + '-error' : undefined}
              />
              <button
                type="button"
                className="ll-reveal"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff /> : <img src={eye} alt="" width="18" height="18" />}
              </button>
            </Field>

            <button className={'ll-submit' + (pristine ? ' is-pristine' : '')} type="submit" disabled={loading} aria-busy={loading}>
              {loading ? <><span className="ll-spinner" /> Signing in…</> : <>Sign in to LENS <img className="ll-submit-arrow" src={arrowRight} alt="" width="16" height="16" /></>}
            </button>
          </form>

          <p className="ll-request">
            New to LENS? <a className="ll-link" href={links.support}>Talk to our team</a>
          </p>
        </div>

      </main>
    </div>
  );
}
