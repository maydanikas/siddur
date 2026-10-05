import { REMINDER_COPY, resolveLang, type Lang } from './supportCopy';
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

export type SavedReminder = { enabled: boolean; time: string; weekendTime: string };

const DEFAULT_WEEKDAY = '07:00';
const DEFAULT_WEEKEND = '09:00';

function clocksOf(saved: SavedReminder): ReminderClocks {
  return { weekday: saved.time, weekend: saved.weekendTime };
}

export type ReminderNotice = { title: string; body: string; lang: string };

type TimerHandle = ReturnType<typeof setTimeout>;

let timer: TimerHandle | null = null;

export function reminderNotice(lang: Lang | string): ReminderNotice {
  const active = resolveLang(lang);
  const copy = REMINDER_COPY[active];
  return { title: copy.notifTitle, body: copy.notifBody, lang: active };
}

export function readReminder(): SavedReminder {
  const blank = { enabled: false, time: DEFAULT_WEEKDAY, weekendTime: DEFAULT_WEEKEND };
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return blank;
    const parsed = JSON.parse(raw) as Partial<SavedReminder>;
    const time = typeof parsed.time === 'string' && parseReminderTime(parsed.time) ? parsed.time : DEFAULT_WEEKDAY;
    const weekendTime = typeof parsed.weekendTime === 'string' && parseReminderTime(parsed.weekendTime)
      ? parsed.weekendTime
      : time;
    return { enabled: parsed.enabled === true, time, weekendTime };
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

async function armBackground(clocks: ReminderClocks, notice: ReminderNotice): Promise<boolean> {
  if (!canScheduleInBackground()) return false;
  const reg = await registration();
  const Trigger = (globalThis as { TimestampTrigger?: new (timestamp: number) => unknown }).TimestampTrigger;
  if (!reg || !Trigger) return false;
  await clearScheduled();
  const times = upcomingReminderTimes(clocks, SCHEDULED_DAYS);
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

async function arm(clocks: ReminderClocks, notice: ReminderNotice): Promise<void> {
  clearTimer();
  try {
    if (await armBackground(clocks, notice)) return;
  } catch {
    /* this browser ignored a future trigger */
  }
  await clearScheduled();
  armTimer(clocks, notice);
}

export async function maintainReminder(notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!saved.enabled) {
    clearTimer();
    return;
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    writeReminder({ enabled: false, time: saved.time, weekendTime: saved.weekendTime });
    clearTimer();
    await clearScheduled();
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
  writeReminder({ enabled: true, time, weekendTime });
  await arm(clocks, notice);
  return 'on';
}

export async function updateReminderClocks(time: string, weekendTime: string, notice: ReminderNotice): Promise<void> {
  const saved = readReminder();
  if (!parseReminderTime(time) || !parseReminderTime(weekendTime)) return;
  writeReminder({ enabled: saved.enabled, time, weekendTime });
  if (saved.enabled) await arm({ weekday: time, weekend: weekendTime }, notice);
}

export async function disableReminder(): Promise<void> {
  const saved = readReminder();
  writeReminder({ enabled: false, time: saved.time, weekendTime: saved.weekendTime });
  clearTimer();
  await clearScheduled();
}
