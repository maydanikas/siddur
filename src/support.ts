export const SUPPORT_SNOOZE_KEY = 'shacharis_support_hint_at';
export const SUPPORT_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;

/** Set to false before release. When true, the envelope ignores localStorage and stays available. */
export const FORCE_SUPPORT_ENVELOPE = true;

/** Public Ko-fi page (PayPal payouts). */
export const SUPPORT_DONATE_URL = 'https://ko-fi.com/siddur';

/** Canonical URL encoded in the About-page QR (install / share the PWA). */
export const APP_SHARE_URL = 'https://siddur-beta.vercel.app';

export function shouldShowSupportEnvelope(): boolean {
  if (FORCE_SUPPORT_ENVELOPE) return true;
  try {
    const raw = localStorage.getItem(SUPPORT_SNOOZE_KEY);
    if (!raw) return true;
    const last = Number(raw);
    if (!Number.isFinite(last)) return true;
    return Date.now() - last >= SUPPORT_CYCLE_MS;
  } catch {
    return true;
  }
}

export function snoozeSupportEnvelope(): void {
  if (FORCE_SUPPORT_ENVELOPE) return;
  try {
    localStorage.setItem(SUPPORT_SNOOZE_KEY, String(Date.now()));
  } catch {
    /* ignore quota / private mode */
  }
}
