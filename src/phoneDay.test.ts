import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localDayKey, msUntilNextLocalMidnight, watchPhoneDay, type PhoneDayHost } from './phoneDay.ts';

test('the local day key follows the phone calendar, not UTC', () => {
  const evening = new Date(2026, 9, 12, 23, 30, 0);
  assert.equal(localDayKey(evening), '2026-10-12');
  assert.equal(msUntilNextLocalMidnight(evening), 30 * 60 * 1000);
  assert.equal(localDayKey(new Date(2026, 9, 13, 0, 0, 1)), '2026-10-13');
});

test('the date refreshes at midnight and when the app is opened again', () => {
  let now = new Date(2026, 9, 12, 23, 59, 0);
  const seen: string[] = [];
  let midnight: (() => void) | null = null;
  let pulse: (() => void) | null = null;
  let onFocus: (() => void) | null = null;
  const host: PhoneDayHost = {
    now: () => now,
    setTimeout: (fn) => {
      midnight = fn;
      return 1;
    },
    clearTimeout: () => {
      midnight = null;
    },
    setInterval: (fn) => {
      pulse = fn;
      return 2;
    },
    clearInterval: () => {
      pulse = null;
    },
    listen: (refresh) => {
      onFocus = refresh;
      return () => {
        onFocus = null;
      };
    },
  };
  const stop = watchPhoneDay((date) => seen.push(localDayKey(date)), host);

  now = new Date(2026, 9, 12, 23, 59, 30);
  pulse?.();
  onFocus?.();
  assert.deepEqual(seen, []);

  now = new Date(2026, 9, 13, 0, 0, 1);
  midnight?.();
  assert.deepEqual(seen, ['2026-10-13']);

  now = new Date(2026, 9, 14, 8, 0, 0);
  onFocus?.();
  assert.deepEqual(seen, ['2026-10-13', '2026-10-14']);

  stop();
  onFocus?.();
  assert.deepEqual(seen, ['2026-10-13', '2026-10-14']);
});
