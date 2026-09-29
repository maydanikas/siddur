export const SUPPORT_SNOOZE_KEY = 'shacharis_support_hint_at';
export const SUPPORT_FIRST_SEEN_KEY = 'shacharis_first_seen_at';
export const SUPPORT_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;

/** Public Ko-fi page for supporters outside the Netherlands (PayPal payouts). */
export const SUPPORT_DONATE_URL = 'https://ko-fi.com/shacharis';

/** Rabobank payment request for supporters in the Netherlands. */
export const SUPPORT_DONATE_NL_URL =
  'https://betaalverzoek.rabobank.nl/betaalverzoek/?id=VdQP_8iHT2K_x-YXF5Z7Lg';

/** Canonical URL encoded in the About-page QR (install / share the PWA). */
export const APP_SHARE_URL = 'https://shacharis.app';

function readTimestamp(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function writeTimestamp(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Remember first launch so the envelope can wait a month before the first ask. */
function rememberFirstSeen(now: number): number | null {
  const existing = readTimestamp(SUPPORT_FIRST_SEEN_KEY);
  if (existing !== null) return existing;
  writeTimestamp(SUPPORT_FIRST_SEEN_KEY, now);
  return readTimestamp(SUPPORT_FIRST_SEEN_KEY) ?? now;
}

export function shouldShowSupportEnvelope(now = Date.now()): boolean {
  const firstSeen = rememberFirstSeen(now);
  if (firstSeen === null) return false;
  if (now - firstSeen < SUPPORT_CYCLE_MS) return false;

  const lastHint = readTimestamp(SUPPORT_SNOOZE_KEY);
  if (lastHint === null) return true;
  return now - lastHint >= SUPPORT_CYCLE_MS;
}

export function snoozeSupportEnvelope(now = Date.now()): void {
  writeTimestamp(SUPPORT_SNOOZE_KEY, now);
}
