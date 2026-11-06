import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import {
  SUPPORT_CYCLE_MS,
  SUPPORT_FIRST_SEEN_KEY,
  SUPPORT_NOTIFIED_KEY,
  SUPPORT_SNOOZE_KEY,
  isSupportAskDue,
  markSupportNotified,
  shouldNotifySupport,
  snoozeSupportAsk,
  supportDueAt,
} from './support.ts';

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
      setItem: (key: string, value: string) => {
        memory.set(key, String(value));
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
      clear: () => memory.clear(),
      key: () => null,
      get length() {
        return memory.size;
      },
    } satisfies Storage,
  });
});

afterEach(() => {
  memory.clear();
});

const day0 = Date.UTC(2026, 0, 1, 12, 0, 0);
const day10 = day0 + 10 * 24 * 60 * 60 * 1000;
const day31 = day0 + 31 * 24 * 60 * 60 * 1000;
const day40 = day0 + 40 * 24 * 60 * 60 * 1000;

test('the first launch is remembered, and the ask waits a full month', () => {
  assert.equal(isSupportAskDue(day0), false);
  assert.equal(Number(memory.get(SUPPORT_FIRST_SEEN_KEY)), day0);
  assert.equal(supportDueAt(day0), day0 + SUPPORT_CYCLE_MS);
  assert.equal(isSupportAskDue(day10), false);
  assert.equal(isSupportAskDue(day31), true);
});

test('opening About does not snooze — a delivered notification or donate does', () => {
  memory.set(SUPPORT_FIRST_SEEN_KEY, String(day0));
  assert.equal(isSupportAskDue(day31), true);
  assert.equal(memory.has(SUPPORT_SNOOZE_KEY), false);
  assert.equal(isSupportAskDue(day40), true);

  snoozeSupportAsk(day40);
  assert.equal(isSupportAskDue(day40), false);
  assert.equal(isSupportAskDue(day40 + SUPPORT_CYCLE_MS - 1), false);
  assert.equal(isSupportAskDue(day40 + SUPPORT_CYCLE_MS), true);
});

test('the system notification fires once per due window', () => {
  memory.set(SUPPORT_FIRST_SEEN_KEY, String(day0));
  assert.equal(shouldNotifySupport(day10), false);
  assert.equal(shouldNotifySupport(day31), true);

  markSupportNotified(day31);
  snoozeSupportAsk(day31);
  assert.equal(Number(memory.get(SUPPORT_NOTIFIED_KEY)), day31);
  assert.equal(Number(memory.get(SUPPORT_SNOOZE_KEY)), day31);
  assert.equal(shouldNotifySupport(day40), false);

  const nextDue = day31 + SUPPORT_CYCLE_MS;
  assert.equal(shouldNotifySupport(nextDue - 1), false);
  assert.equal(shouldNotifySupport(nextDue), true);
});
