import React, { useId, useState } from 'react';
import { links } from '../links.js';
import { useTheme } from '../theme.js';
import ThemedImg from '../components/ThemedImg.jsx';
import { cx } from '../ui.js';
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

export function LensMark({ size = 32, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
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

const RISK_FILL = ['fill-[#8fb0ff] opacity-85', 'fill-[#fb923c]', 'fill-[#ff5a5f]'];
const RISK_PULSE = ['', 'text-[#fb923c]', 'text-[#ff5a5f]'];
const RISK_DOT = [
  'bg-[#34d399] shadow-[0_0_0_4px_rgba(52,211,153,0.18)]',
  'bg-[#fb923c] shadow-[0_0_0_4px_rgba(251,146,60,0.18)]',
  'bg-[#ff5a5f] shadow-[0_0_0_4px_rgba(255,90,95,0.18)]',
];
const CHIPS = [
  { risk: 2, title: 'High-risk wallet flagged', note: 'bc1q…7x9f · Risk score 92', pos: '-left-[6%] top-[14%] max-lg:left-0', delay: '0s' },
  { risk: 1, title: 'Case FC-0342 opened', note: 'Assigned to compliance team', pos: '-right-[8%] top-[46%] max-lg:right-0', delay: '-2.3s' },
  { risk: 0, title: 'SAR filed on time', note: 'Filing calendar up to date', pos: 'bottom-[6%] left-[2%]', delay: '-4.6s' },
];

function LensVisual() {
  return (
    <div className="relative mx-auto aspect-square w-[min(100%,460px)]" aria-hidden="true">
      <div className="absolute inset-[4%] animate-[spin-slow_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,rgba(61,110,240,0)_0deg,rgba(61,110,240,0)_290deg,rgba(61,110,240,0.32)_358deg,rgba(143,176,255,0.6)_360deg)]" />
      <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 520 520">
        <defs>
          <radialGradient id="ll-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0.65" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="ll-mask"><rect width="520" height="520" fill="url(#ll-fade)" /></mask>
        </defs>
        <g className="fill-none stroke-[rgba(143,176,255,0.14)] stroke-1">
          <circle cx="260" cy="260" r="250" />
          <circle cx="260" cy="260" r="190" />
          <circle cx="260" cy="260" r="120" />
        </g>
        <circle
          className="origin-[260px_260px] animate-[spin-slow_60s_linear_infinite] fill-none stroke-[rgba(143,176,255,0.35)] stroke-[1.2] [stroke-dasharray:2_10]"
          cx="260" cy="260" r="222"
        />
        <g mask="url(#ll-mask)">
          {EDGES.map(([a, b]) => {
            const hot = NODES[a][2] === 2 || NODES[b][2] === 2;
            return (
              <line
                key={a + '-' + b}
                className={hot ? 'animate-[ll-flow_1.6s_linear_infinite] stroke-[rgba(255,90,95,0.45)] stroke-1 [stroke-dasharray:4_4]' : 'stroke-[rgba(143,176,255,0.22)] stroke-1'}
                x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
              />
            );
          })}
          {NODES.map(([x, y, risk], i) => (
            <g key={i}>
              {risk > 0 && (
                <circle
                  className={cx('origin-center animate-[ll-pulse_2.4s_ease-out_infinite] fill-none stroke-current stroke-[1.5] [transform-box:fill-box]', RISK_PULSE[risk])}
                  style={{ animationDelay: (i % 5) * 0.6 + 's' }}
                  cx={x} cy={y} r="7"
                />
              )}
              <circle className={RISK_FILL[risk]} cx={x} cy={y} r={risk ? 6 : 4.5} />
            </g>
          ))}
        </g>
      </svg>
      <div className="absolute left-1/2 top-1/2 grid size-[84px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[rgba(143,176,255,0.35)] bg-[radial-gradient(circle_at_35%_30%,#4a7cff,#1b3fae_60%,#0c1f5c)] text-white shadow-[0_0_0_10px_rgba(61,110,240,0.12),0_0_60px_rgba(61,110,240,0.55)]">
        <LensMark size={44} className="animate-[ll-iris_8s_ease-in-out_infinite]" />
      </div>

      {CHIPS.map(({ risk, title, note, pos, delay }) => (
        <div
          key={title}
          style={{ animationDelay: delay }}
          className={cx(
            'absolute z-1 flex animate-[float_7s_ease-in-out_infinite] items-center gap-2.5 whitespace-nowrap rounded-[14px] border border-white/10 bg-[rgba(13,21,41,0.9)] py-2.5 pl-3 pr-3.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-[12px]',
            pos,
          )}
        >
          <span className={cx('size-2.5 shrink-0 rounded-full', RISK_DOT[risk])} />
          <div>
            <strong className="block text-[13px] font-semibold leading-[1.3]">{title}</strong>
            <small className="text-[11.5px] text-[#9aa3bd]">{note}</small>
          </div>
        </div>
      ))}
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

const inputClass = (error) =>
  cx(
    'h-[52px] w-full rounded-[14px] border bg-ll-field-bg pl-3.5 pr-12 text-[15px] text-ll-text shadow-[var(--ll-field-shadow)] transition-[border-color,box-shadow] duration-200 placeholder:text-ll-placeholder focus:outline-none disabled:opacity-60',
    error
      ? 'border-ll-error focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ll-error)_16%,transparent)]'
      : 'border-ll-field-border hover:border-[color-mix(in_srgb,var(--ll-field-border),var(--ll-muted)_30%)] focus:border-ll-link focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ll-link)_18%,transparent)]',
  );
const link = 'text-sm font-medium leading-[21px] text-ll-link hover:underline hover:underline-offset-3';

function Field({ id, label, error, aside, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium leading-[21px] text-ll-label">{label}</label>
        {aside}
      </div>
      <div className="relative flex items-center">
        {children}
      </div>
      {error && <p className="mt-2 text-[13px] leading-[19.5px] text-ll-error" id={id + '-error'}>{error}</p>}
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
    <div className="grid min-h-dvh grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] bg-[var(--bg)] max-md:grid-cols-1">
      {/* Showcase: always dark so the lens reads as the product's signature */}
      <aside className="relative isolate my-3 ml-3 flex flex-col justify-between gap-8 overflow-hidden rounded-[28px] bg-[#050b1a] px-11 pb-11 pt-9 text-white dark:shadow-[inset_0_0_0_1px_rgba(143,176,255,0.12)] max-lg:p-8 max-md:hidden">
        <div className="absolute inset-0 -z-1 bg-[radial-gradient(520px_420px_at_50%_42%,rgba(47,96,224,0.34),transparent_70%),radial-gradient(360px_300px_at_85%_90%,rgba(15,159,110,0.14),transparent_70%),radial-gradient(300px_260px_at_8%_8%,rgba(111,76,255,0.18),transparent_70%)] after:absolute after:inset-0 after:bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] after:bg-size-[44px_44px] after:content-[''] after:[mask-image:radial-gradient(circle_at_50%_42%,#000_0%,transparent_65%)]" />
        <a className="inline-flex w-fit items-center gap-2.5" href="/" aria-label="Mybitstore home">
          <img src={logo} alt="" width="28" height="28" />
          <span className="font-euclid text-lg font-bold tracking-[-0.02em]">Mybitstore</span>
        </a>
        <LensVisual />
        <div>
          <h2 className="text-[clamp(30px,3vw,40px)] font-semibold leading-[1.08] tracking-[-0.03em]">
            Compliance intelligence,<br />
            <span className="bg-[linear-gradient(90deg,#8fb0ff,#c4b5fd)] bg-clip-text text-transparent">in focus.</span>
          </h2>
          <p className="mt-3.5 max-w-[460px] text-[15px] leading-[1.55] text-[#9aa3bd]">Monitor transactions, investigate suspicious activity, and stay ahead of regulatory reporting from one workspace.</p>
          <ul className="mt-[22px] flex flex-wrap gap-2">
            {['Transaction Monitoring', 'Forensic Investigations', 'Regulatory Reporting'].map((m) => (
              <li key={m} className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[13px] text-[#d5daea]">{m}</li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col px-10 py-7 max-md:bg-[radial-gradient(420px_320px_at_50%_0%,color-mix(in_srgb,var(--color-brand)_14%,transparent),transparent_70%)] max-md:p-5">
        <div className="flex items-center justify-between gap-4">
          <a className="inline-flex items-center gap-2 text-sm font-medium leading-[21px] text-ll-muted transition-colors duration-200 hover:text-ll-text" href="/#lens">
            <ThemedImg dark={arrowLeftDark} light={arrowLeft} width="16" height="16" /> Back to Mybitstore
          </a>
          <button
            className="inline-flex size-[38px] items-center justify-center rounded-full border border-ll-field-border bg-ll-field-bg text-[var(--ink-2)] hover:text-[var(--ink)]"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <img src={theme === 'dark' ? sun : moon} alt="" width="18" height="18" />
          </button>
        </div>

        <div className="m-auto w-full max-w-[400px] py-12 max-md:py-10">
          <div className="flex items-center gap-3">
            <span className="grid size-[52px] place-items-center rounded-2xl bg-[radial-gradient(circle_at_30%_25%,#4a7cff,#3460dc_32%,#1d44b8_65%,#10246e)] text-white shadow-[0_10px_24px_-6px_rgba(47,96,224,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <LensMark size={30} />
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-ll-field-border bg-ll-badge-bg px-3 py-1.5 text-[13px] font-medium leading-[19.5px] text-ll-muted">
              <b className="font-inter-tight text-[13px] font-bold tracking-[1.82px] text-ll-link dark:font-euclid dark:font-normal">LENS</b> Compliance Suite
            </span>
          </div>
          <h1 className="pt-7 text-4xl font-normal leading-[39.6px] tracking-[-1.08px] text-ll-text max-xs:text-[30px]">Sign in to LENS</h1>
          <p className="pt-2.5 text-base leading-6 text-ll-muted">Welcome back. Enter your details to open your compliance workspace.</p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {formError && <div className="rounded-xl border border-ll-error/35 bg-ll-error/10 px-3.5 py-3 text-sm leading-[1.45] text-ll-error" role="alert">{formError}</div>}

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
                className={inputClass(visibleError('email'))}
              />
            </Field>

            <Field
              id={passwordId}
              label="Password"
              error={visibleError('password')}
              aside={<a className={link} href={links.support}>Forgot password?</a>}
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
                className={inputClass(visibleError('password'))}
              />
              <button
                type="button"
                className="absolute right-1.5 grid size-10 place-items-center rounded-[10px] text-[#717792] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--ll-muted)_12%,transparent)]"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff /> : <img src={eye} alt="" width="18" height="18" />}
              </button>
            </Field>

            {/* Light: flat brand button, dimmed until the form is touched. Dark: gradient with glow, shine and arrow. */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={cx(
                'group/submit relative mt-2 inline-flex h-[54px] items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-tab-active text-base font-medium text-white transition-[transform,translate,box-shadow,opacity,background-color] duration-200 enabled:hover:bg-[#0a5bcc] disabled:cursor-progress disabled:opacity-85',
                'dark:rounded-[14px] dark:bg-[linear-gradient(172deg,#3d6ef0,#2348c4_60%,#1a379e)] dark:font-inter dark:font-semibold dark:shadow-[0_12px_28px_-12px_rgba(47,96,224,0.8),inset_0_1px_0_rgba(255,255,255,0.18)]',
                'dark:enabled:hover:-translate-y-px dark:enabled:hover:shadow-[0_16px_32px_-12px_rgba(47,96,224,0.9),inset_0_1px_0_rgba(255,255,255,0.18)]',
                "dark:after:absolute dark:after:inset-0 dark:after:-translate-x-full dark:after:bg-[linear-gradient(110deg,transparent_33%,rgba(255,255,255,0.22)_50%,transparent_67%)] dark:after:transition-transform dark:after:duration-700 dark:after:content-[''] dark:enabled:hover:after:translate-x-full",
                pristine && 'opacity-60 dark:opacity-100',
              )}
            >
              {loading ? (
                <><span className="size-[18px] animate-[spin-slow_0.8s_linear_infinite] rounded-full border-2 border-white/35 border-t-white" /> Signing in…</>
              ) : (
                <>Sign in to LENS <img className="hidden transition-transform duration-200 group-hover/submit:translate-x-0.5 dark:block" src={arrowRight} alt="" width="16" height="16" /></>
              )}
            </button>
          </form>

          <p className="pt-7 text-center text-sm leading-[21px] text-ll-muted">
            New to LENS? <a className={link} href={links.support}>Talk to our team</a>
          </p>
        </div>
      </main>
    </div>
  );
}
