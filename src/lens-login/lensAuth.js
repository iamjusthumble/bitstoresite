// Integration point for the LENS authentication API.
// Set VITE_LENS_SIGN_IN_URL (and optionally VITE_LENS_APP_URL) in a .env file once the endpoint is known.
const SIGN_IN_URL = import.meta.env.VITE_LENS_SIGN_IN_URL;
const APP_URL = import.meta.env.VITE_LENS_APP_URL;

export async function signIn({ email, password }) {
  if (!SIGN_IN_URL) {
    throw new Error('Sign-in isn’t connected yet. Please try again later.');
  }

  const res = await fetch(SIGN_IN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('That email and password don’t match. Check them and try again.');
  }
  if (!res.ok) {
    throw new Error('We couldn’t sign you in right now. Please try again in a moment.');
  }

  const data = await res.json().catch(() => ({}));
  window.location.assign(data.redirectUrl || APP_URL || '/');
}
