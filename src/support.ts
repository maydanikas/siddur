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

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function readTimestamp(key: string): number | null {
  try {
    const raw = storage()?.getItem(key);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function writeTimestamp(key: string, value: number): void {
  try {
    storage()?.setItem(key, String(value));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Remember first launch so the monthly ask can wait a month. */
function rememberFirstSeen(now: number): number | null {
  const existing = readTimestamp(SUPPORT_FIRST_SEEN_KEY);
  if (existing !== null) return existing;
  writeTimestamp(SUPPORT_FIRST_SEEN_KEY, now);
  return readTimestamp(SUPPORT_FIRST_SEEN_KEY) ?? now;
}

/** Moment the current monthly ask becomes due (first month, or a month after the last quieting). */
export function supportDueAt(now = Date.now()): number | null {
  const firstSeen = rememberFirstSeen(now);
  if (firstSeen === null) return null;
  const lastQuiet = readTimestamp(SUPPORT_SNOOZE_KEY);
  if (lastQuiet === null) return firstSeen + SUPPORT_CYCLE_MS;
  return lastQuiet + SUPPORT_CYCLE_MS;
}

export function isSupportAskDue(now = Date.now()): boolean {
  const dueAt = supportDueAt(now);
  if (dueAt === null) return false;
  return now >= dueAt;
}

/** True when the phone already allows notifications (no new prompt). */
export function canUseSupportNotification(): boolean {
  try {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * In-app envelope only when the monthly ask is due and the phone cannot show
 * a shade notification. If permission is granted, the shade notification is used instead.
 */
export function shouldShowSupportEnvelope(now = Date.now()): boolean {
  return isSupportAskDue(now) && !canUseSupportNotification();
}

/** True once per due window when shade notifications are allowed. */
export function shouldNotifySupport(now = Date.now()): boolean {
  if (!isSupportAskDue(now)) return false;
  if (!canUseSupportNotification()) return false;
  const dueAt = supportDueAt(now);
  if (dueAt === null) return false;
  const lastNotified = readTimestamp(SUPPORT_NOTIFIED_KEY);
  if (lastNotified === null) return true;
  return lastNotified < dueAt;
}

/** Call on donate, envelope dismiss (X), or after the shade notification was shown. */
export function snoozeSupportAsk(now = Date.now()): void {
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
 * One system notification per monthly ask when permission is already granted.
 * Never prompts. A successful show quiets the ask for another month.
 * Without permission the in-app envelope is used instead.
 */
export async function maybeNotifySupport(notice: SupportNotice, now = Date.now()): Promise<boolean> {
  if (!shouldNotifySupport(now)) return false;

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
    snoozeSupportAsk(now);
    return true;
  } catch {
    return false;
  }
}
