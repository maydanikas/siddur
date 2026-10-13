import { useEffect, useState } from 'react';

/** Local calendar day, the same clock the phone shows. */
export function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Milliseconds from `now` until the next local midnight. */
export function msUntilNextLocalMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(0, next.getTime() - now.getTime());
}

type Timer = ReturnType<typeof setTimeout>;

export type PhoneDayHost = {
  now(): Date;
  setTimeout(fn: () => void, ms: number): Timer;
  clearTimeout(id: Timer): void;
  setInterval(fn: () => void, ms: number): Timer;
  clearInterval(id: Timer): void;
  listen(refresh: () => void): () => void;
};

const CHECK_EVERY_MS = 60_000;
const AFTER_MIDNIGHT_MS = 250;

function browserHost(): PhoneDayHost {
  return {
    now: () => new Date(),
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => window.clearTimeout(id),
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    clearInterval: (id) => window.clearInterval(id),
    listen(refresh) {
      const onVisible = () => {
        if (document.visibilityState === 'visible') refresh();
      };
      document.addEventListener('visibilitychange', onVisible);
      window.addEventListener('pageshow', refresh);
      window.addEventListener('focus', refresh);
      return () => {
        document.removeEventListener('visibilitychange', onVisible);
        window.removeEventListener('pageshow', refresh);
        window.removeEventListener('focus', refresh);
      };
    },
  };
}

/**
 * Calls `onChange` when the phone's local date changes: at midnight,
 * when the app comes back to the screen, and once a minute as a backstop
 * for a timer the phone froze overnight.
 */
export function watchPhoneDay(onChange: (today: Date) => void, host: PhoneDayHost = browserHost()): () => void {
  let key = localDayKey(host.now());
  let midnight: Timer | null = null;
  const refresh = () => {
    const now = host.now();
    const nextKey = localDayKey(now);
    if (nextKey === key) return;
    key = nextKey;
    onChange(now);
  };
  const arm = () => {
    if (midnight !== null) host.clearTimeout(midnight);
    midnight = host.setTimeout(() => {
      refresh();
      arm();
    }, msUntilNextLocalMidnight(host.now()) + AFTER_MIDNIGHT_MS);
  };
  const pulse = host.setInterval(refresh, CHECK_EVERY_MS);
  const stopListening = host.listen(refresh);
  arm();
  return () => {
    if (midnight !== null) host.clearTimeout(midnight);
    host.clearInterval(pulse);
    stopListening();
  };
}

/** The phone's current date, refreshed when that date changes. */
export function usePhoneDay(): Date {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => watchPhoneDay(setToday), []);
  return today;
}
