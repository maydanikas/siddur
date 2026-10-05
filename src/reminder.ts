import { REMINDER_COPY, resolveLang, type Lang } from './supportCopy';
import {
  isReminderDue,
  nextReminderTime,
  parseReminderTime,
  upcomingReminderTimes,
} from './reminderSchedule';

export const REMINDER_STORAGE_KEY = 'shacharis_reminder';
export const REMINDER_INTRO_SEEN_KEY = 'shacharis_reminder_intro_seen';

const REMINDER_TAG = 'shacharis-reminder';
const SCHEDULED_DAYS = 7;

export type SavedReminder = { enabled: boolean; time: string };

export type ReminderNotice = { title: string; body: string; lang: string };

type TimerHandle = ReturnType<typeof setTimeout>;

let timer: TimerHandle | null = null;

export function reminderNotice(lang: Lang | string): ReminderNotice {
  const active = resolveLang(lang);
  const copy = REMINDER_COPY[active];
  return { title: copy.notifTitle, body: copy.notifBody, lang: active };
}

export function readReminder(): SavedReminder {
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return { enabled: false, time: '07:00' };
    const parsed = JSON.parse(raw) as Partial<SavedReminder>;
    const time = typeof parsed.time === 'string' && parseReminderTime(parsed.time) ? parsed.time : '07:00';
    return { enabled: parsed.enabled === true, time };
  } catch {
    return { enabled: false, time: '07:00' };
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

async function showNow(notice: ReminderNotice): Promise<void> {
  const options: NotificationOptions = {
    body: notice.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: REMINDER_TAG,
    lang: notice.lang,
    data: { url: '/' },
    vibrate: [180, 80, 180],
  };
  const reg = await registration();
  if (reg) {
    await reg.showNotification(notice.title, options);
    return;
  }
  new Notification(notice.title, options);
}

async function armBackground(time: string, notice: ReminderNotice): Promise<boolean> {
  if (!canScheduleInBackground()) return false;
  const reg = await registration();
  const Trigger = (globalThis as { TimestampTrigger?: new (timestamp: number) => unknown }).TimestampTrigger;
  if (!reg || !Trigger) return false;
  await clearScheduled();
  const times = upcomingReminderTimes(time, SCHEDULED_DAYS);
  for (let i = 0; i < times.length; i++) {
    await reg.showNotification(notice.title, {
      body: notice.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `${REMINDER_TAG}-${i}`,
      lang: notice.lang,
      data: { url: '/' },
      vibrate: [180, 80, 180],
      showTrigger: new Trigger(times[i]),
    } as NotificationOptions);
  }
  return true;
}

function armTimer(time: string, notice: ReminderNotice): void {
  clearTimer();
  const target = nextReminderTime(time);
  if (target == null) return;
  const delay = Math.max(0, target - Date.now());
  timer = setTimeout(() => {
    timer = null;
    void onTimer(time, target, notice);
  }, delay);
}

async function onTimer(time: string, target: number, notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!saved.enabled || saved.time !== time) return;
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && isReminderDue(target, Date.now())) {
    try {
      await showNow(notice);
    } catch {
      /* the phone refused the notification */
    }
  }
  const latest = readReminder();
  if (latest.enabled) armTimer(latest.time, notice);
}

async function arm(time: string, notice: ReminderNotice): Promise<void> {
  clearTimer();
  try {
    if (await armBackground(time, notice)) return;
  } catch {
    /* this browser ignored a future trigger */
  }
  await clearScheduled();
  armTimer(time, notice);
}

export async function maintainReminder(notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!saved.enabled) {
    clearTimer();
    return;
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    writeReminder({ enabled: false, time: saved.time });
    clearTimer();
    await clearScheduled();
    return;
  }
  await arm(saved.time, notice);
}

export async function enableReminder(
  time: string,
  notice: ReminderNotice,
): Promise<'on' | 'denied' | 'unsupported' | 'invalid'> {
  if (!parseReminderTime(time)) return 'invalid';
  if (typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function') {
    return 'unsupported';
  }
  let permission = Notification.permission;
  if (permission !== 'granted') permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';
  writeReminder({ enabled: true, time });
  await arm(time, notice);
  return 'on';
}

export async function updateReminderTime(time: string, notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!parseReminderTime(time)) return;
  writeReminder({ enabled: saved.enabled, time });
  if (saved.enabled) await arm(time, notice);
}

export async function disableReminder(): Promise<void> {
  const saved = readReminder();
  writeReminder({ enabled: false, time: saved.time });
  clearTimer();
  await clearScheduled();
}
