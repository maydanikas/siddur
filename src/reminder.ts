import { REMINDER_COPY, resolveLang, type Lang } from './supportCopy';
import { VAPID_PUBLIC_KEY } from './vapidPublic';
import {
  isReminderDue,
  nextReminderTime,
  parseReminderTime,
  upcomingReminderTimes,
  type ReminderClocks,
} from './reminderSchedule';

export const REMINDER_STORAGE_KEY = 'shacharis_reminder';
export const REMINDER_INTRO_SEEN_KEY = 'shacharis_reminder_intro_seen';

const REMINDER_TAG = 'shacharis-reminder';
const SCHEDULED_DAYS = 7;

export type SavedReminder = {
  enabled: boolean;
  time: string;
  weekendTime: string;
  serverPush: boolean;
  endpoint: string;
};

const DEFAULT_WEEKDAY = '07:00';
const DEFAULT_WEEKEND = '09:00';

function clocksOf(saved: SavedReminder): ReminderClocks {
  return { weekday: saved.time, weekend: saved.weekendTime };
}

export type ReminderNotice = { title: string; body: string; lang: string };

type TimerHandle = ReturnType<typeof setTimeout>;

let timer: TimerHandle | null = null;
let armGeneration = 0;
let syncAbort: AbortController | null = null;
const listeners = new Set<() => void>();

export function subscribeReminder(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitReminder(): void {
  listeners.forEach((listener) => listener());
}

export function reminderNotice(lang: Lang | string): ReminderNotice {
  const active = resolveLang(lang);
  const copy = REMINDER_COPY[active];
  return { title: copy.notifTitle, body: copy.notifBody, lang: active };
}

export function readReminder(): SavedReminder {
  const blank = { enabled: false, time: DEFAULT_WEEKDAY, weekendTime: DEFAULT_WEEKEND, serverPush: false, endpoint: '' };
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return blank;
    const parsed = JSON.parse(raw) as Partial<SavedReminder>;
    const time = typeof parsed.time === 'string' && parseReminderTime(parsed.time) ? parsed.time : DEFAULT_WEEKDAY;
    const weekendTime = typeof parsed.weekendTime === 'string' && parseReminderTime(parsed.weekendTime)
      ? parsed.weekendTime
      : time;
    return {
      enabled: parsed.enabled === true,
      time,
      weekendTime,
      serverPush: parsed.serverPush === true,
      endpoint: typeof parsed.endpoint === 'string' && parsed.endpoint.startsWith('https://') ? parsed.endpoint : '',
    };
  } catch {
    return blank;
  }
}

export function writeReminder(value: SavedReminder): void {
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

/** True only where the browser can show a notification at a future time with the app closed. */
export function canScheduleInBackground(): boolean {
  return typeof Notification !== 'undefined' && 'showTrigger' in Notification.prototype;
}

function clearTimer(): void {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return (await navigator.serviceWorker.getRegistration()) ?? null;
  } catch {
    return null;
  }
}

/** `ready` never resolves when the browser has no service worker, so give up after a few seconds. */
async function pushRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), 4000);
      }),
    ]);
  } catch {
    return null;
  }
}

async function clearScheduled(): Promise<void> {
  const reg = await registration();
  if (!reg) return;
  try {
    const list = await reg.getNotifications({ includeTriggered: true } as NotificationOptions & {
      includeTriggered?: boolean;
    });
    list.filter((note) => (note.tag || '').startsWith(REMINDER_TAG)).forEach((note) => note.close());
  } catch {
    /* the browser has no triggered-notification list */
  }
}

function notificationOptions(notice: ReminderNotice, tag: string): NotificationOptions {
  return {
    body: notice.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    lang: notice.lang,
    data: { url: '/' },
    vibrate: [180, 80, 180],
    renotify: true,
  } as NotificationOptions;
}

async function showNow(notice: ReminderNotice): Promise<void> {
  const options = notificationOptions(notice, REMINDER_TAG);
  const reg = await registration();
  if (reg) {
    await reg.showNotification(notice.title, options);
    return;
  }
  new Notification(notice.title, options);
}

async function armBackground(clocks: ReminderClocks, notice: ReminderNotice, generation: number): Promise<boolean> {
  if (!canScheduleInBackground()) return false;
  const reg = await registration();
  const Trigger = (globalThis as { TimestampTrigger?: new (timestamp: number) => unknown }).TimestampTrigger;
  if (!reg || !Trigger) return false;
  await clearScheduled();
  if (generation !== armGeneration) return false;
  const times = upcomingReminderTimes(clocks, SCHEDULED_DAYS);
  for (let i = 0; i < times.length; i++) {
    if (generation !== armGeneration) return false;
    await reg.showNotification(notice.title, {
      ...notificationOptions(notice, `${REMINDER_TAG}-${i}`),
      showTrigger: new Trigger(times[i]),
    } as NotificationOptions);
  }
  return true;
}

function sameClocks(saved: SavedReminder, clocks: ReminderClocks): boolean {
  return saved.time === clocks.weekday && saved.weekendTime === clocks.weekend;
}

function armTimer(clocks: ReminderClocks, notice: ReminderNotice): void {
  clearTimer();
  const target = nextReminderTime(clocks);
  if (target == null) return;
  const delay = Math.max(0, target - Date.now());
  timer = setTimeout(() => {
    timer = null;
    void onTimer(clocks, target, notice);
  }, delay);
}

async function onTimer(clocks: ReminderClocks, target: number, notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!saved.enabled || !sameClocks(saved, clocks)) return;
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && isReminderDue(target, Date.now())) {
    try {
      await showNow(notice);
    } catch {
      /* the phone refused the notification */
    }
  }
  const latest = readReminder();
  if (latest.enabled) armTimer(clocksOf(latest), notice);
}

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameApplicationKey(subscription: PushSubscription): boolean {
  const current = subscription.options?.applicationServerKey;
  if (!current) return true;
  const bytes = new Uint8Array(current);
  const expected = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  if (bytes.length !== expected.length) return false;
  for (let i = 0; i < bytes.length; i++) if (bytes[i] !== expected[i]) return false;
  return true;
}

async function browserSubscription(reg: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  if (!reg.pushManager) return null;
  const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const existing = await reg.pushManager.getSubscription();
  if (existing && sameApplicationKey(existing)) return existing;
  if (existing) await existing.unsubscribe();
  return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
}

function markServerPush(on: boolean, endpoint: string): void {
  const saved = readReminder();
  if (!saved.enabled) return;
  writeReminder({ ...saved, serverPush: on, endpoint: on ? endpoint : saved.endpoint });
}

function cancelSync(): void {
  syncAbort?.abort();
  syncAbort = null;
}

async function syncServerPush(clocks: ReminderClocks, notice: ReminderNotice, updatedAt: number): Promise<string | null> {
  const reg = await pushRegistration();
  if (!reg) return null;
  const subscription = await browserSubscription(reg);
  const json = subscription?.toJSON();
  if (!json?.endpoint || !json.keys?.p256dh || !json.keys.auth) return null;
  let timeZone = 'UTC';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    /* keep UTC */
  }
  cancelSync();
  const controller = new AbortController();
  syncAbort = controller;
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('/api/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        time: clocks.weekday,
        weekendTime: clocks.weekend,
        timeZone,
        lang: notice.lang,
        updatedAt,
      }),
      signal: controller.signal,
    });
    return response.ok ? json.endpoint : null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
    if (syncAbort === controller) syncAbort = null;
  }
}

async function removeServerPush(knownEndpoint: string, updatedAt: number, generation: number | null): Promise<void> {
  const reg = await registration();
  const subscription = await reg?.pushManager?.getSubscription();
  const endpoint = subscription?.endpoint || knownEndpoint;
  if (endpoint) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      await fetch('/api/reminder', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, updatedAt }),
        signal: controller.signal,
      });
    } catch {
      /* the phone can still unsubscribe locally */
    } finally {
      window.clearTimeout(timeout);
    }
  }
  if (generation !== null && generation !== armGeneration) return;
  try {
    await subscription?.unsubscribe();
  } catch {
    /* already gone */
  }
}

async function arm(clocks: ReminderClocks, notice: ReminderNotice): Promise<void> {
  const generation = ++armGeneration;
  const updatedAt = Date.now();
  clearTimer();
  let endpoint: string | null = null;
  try {
    endpoint = await syncServerPush(clocks, notice, updatedAt);
  } catch {
    endpoint = null;
  }
  if (generation !== armGeneration) return;
  if (endpoint) {
    markServerPush(true, endpoint);
    clearTimer();
    await clearScheduled();
    emitReminder();
    return;
  }
  markServerPush(false, '');
  await removeServerPush(readReminder().endpoint, updatedAt + 1, generation);
  if (generation !== armGeneration) return;
  try {
    if (await armBackground(clocks, notice, generation)) {
      emitReminder();
      return;
    }
  } catch {
    /* this browser ignored a future trigger */
  }
  if (generation !== armGeneration) return;
  await clearScheduled();
  if (generation !== armGeneration) return;
  armTimer(clocks, notice);
  emitReminder();
}

export async function maintainReminder(notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!saved.enabled) {
    clearTimer();
    return;
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    writeReminder({ enabled: false, time: saved.time, weekendTime: saved.weekendTime, serverPush: false, endpoint: '' });
    clearTimer();
    await clearScheduled();
    await removeServerPush(saved.endpoint, Date.now(), null);
    emitReminder();
    return;
  }
  await arm(clocksOf(saved), notice);
}

export async function enableReminder(
  time: string,
  weekendTime: string,
  notice: ReminderNotice,
): Promise<'on' | 'denied' | 'unsupported' | 'invalid'> {
  if (!parseReminderTime(time) || !parseReminderTime(weekendTime)) return 'invalid';
  if (typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function') {
    return 'unsupported';
  }
  let permission = Notification.permission;
  if (permission !== 'granted') permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';
  const clocks = { weekday: time, weekend: weekendTime };
  writeReminder({ enabled: true, time, weekendTime, serverPush: false, endpoint: '' });
  await arm(clocks, notice);
  return 'on';
}

export async function updateReminderClocks(time: string, weekendTime: string, notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!parseReminderTime(time) || !parseReminderTime(weekendTime)) return;
  writeReminder({
    enabled: saved.enabled,
    time,
    weekendTime,
    serverPush: saved.enabled ? saved.serverPush : false,
    endpoint: saved.endpoint,
  });
  if (saved.enabled) await arm({ weekday: time, weekend: weekendTime }, notice);
}

export async function disableReminder(): Promise<void> {
  armGeneration += 1;
  cancelSync();
  const saved = readReminder();
  const updatedAt = Date.now();
  writeReminder({ enabled: false, time: saved.time, weekendTime: saved.weekendTime, serverPush: false, endpoint: '' });
  clearTimer();
  await clearScheduled();
  await removeServerPush(saved.endpoint, updatedAt, null);
  emitReminder();
}
