export const SUPPORT_SNOOZE_KEY = 'shacharis_support_hint_at';
export const SUPPORT_FIRST_SEEN_KEY = 'shacharis_first_seen_at';
export const SUPPORT_NOTIFIED_KEY = 'shacharis_support_notified_at';
export const SUPPORT_CYCLE_MS = 30 * 24 * 60 * 60 * 1000;
export const SUPPORT_TAG = 'shacharis-support';

/** Public Ko-fi page for supporters outside the Netherlands (PayPal payouts). */
export const SUPPORT_DONATE_URL = 'https://ko-fi.com/shacharis';

/** Rabobank payment request for supporters in the Netherlands. */
export const SUPPORT_DONATE_NL_URL =
  'https://betaalverzoek.rabobank.nl/betaalverzoek/?id=VdQP_8iHT2K_x-YXF5Z7Lg';

/** Canonical URL encoded in the About-page QR (install / share the PWA). */
export const APP_SHARE_URL = 'https://shacharis.app';

export type SupportNotice = { title: string; body: string; lang: string };

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

/** Moment the current monthly ask becomes due (first month, or a month after donate). */
export function supportDueAt(now = Date.now()): number | null {
  const firstSeen = rememberFirstSeen(now);
  if (firstSeen === null) return null;
  const lastDonate = readTimestamp(SUPPORT_SNOOZE_KEY);
  if (lastDonate === null) return firstSeen + SUPPORT_CYCLE_MS;
  return lastDonate + SUPPORT_CYCLE_MS;
}

export function shouldShowSupportEnvelope(now = Date.now()): boolean {
  const dueAt = supportDueAt(now);
  if (dueAt === null) return false;
  return now >= dueAt;
}

/** True once per due window, until the reader donates and the next month begins. */
export function shouldNotifySupport(now = Date.now()): boolean {
  if (!shouldShowSupportEnvelope(now)) return false;
  const dueAt = supportDueAt(now);
  if (dueAt === null) return false;
  const lastNotified = readTimestamp(SUPPORT_NOTIFIED_KEY);
  if (lastNotified === null) return true;
  return lastNotified < dueAt;
}

/** Call on donate or envelope dismiss (X). Opening About alone must not snooze. */
export function snoozeSupportEnvelope(now = Date.now()): void {
  writeTimestamp(SUPPORT_SNOOZE_KEY, now);
}

export function markSupportNotified(now = Date.now()): void {
  writeTimestamp(SUPPORT_NOTIFIED_KEY, now);
}

async function supportRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.getRegistration()) ?? null;
  } catch {
    return null;
  }
}

/**
 * One system notification per monthly ask, only if the phone already allowed
 * notifications (usually via the morning-prayer reminder). Never prompts.
 */
export async function maybeNotifySupport(notice: SupportNotice, now = Date.now()): Promise<boolean> {
  if (!shouldNotifySupport(now)) return false;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;

  const options = {
    body: notice.body,
    icon: '/icon-192.png',
    badge: '/icon-badge.png',
    tag: SUPPORT_TAG,
    lang: notice.lang,
    data: { url: '/about' },
    vibrate: [180, 80, 180],
    renotify: true,
  } as NotificationOptions;

  try {
    const reg = await supportRegistration();
    if (reg) await reg.showNotification(notice.title, options);
    else new Notification(notice.title, options);
    markSupportNotified(now);
    return true;
  } catch {
    return false;
  }
}
