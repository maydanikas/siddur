import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import {
  SUPPORT_CYCLE_MS,
  SUPPORT_FIRST_SEEN_KEY,
  SUPPORT_NOTIFIED_KEY,
  SUPPORT_SNOOZE_KEY,
  markSupportNotified,
  shouldNotifySupport,
  shouldShowSupportEnvelope,
  snoozeSupportEnvelope,
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
    },
  });
});

afterEach(() => {
  memory.clear();
});

const day0 = Date.UTC(2026, 0, 1, 12, 0, 0);
const day10 = day0 + 10 * 24 * 60 * 60 * 1000;
const day31 = day0 + 31 * 24 * 60 * 60 * 1000;
const day40 = day0 + 40 * 24 * 60 * 60 * 1000;
const day70 = day40 + SUPPORT_CYCLE_MS;

test('the first launch is remembered, and the ask waits a full month', () => {
  assert.equal(shouldShowSupportEnvelope(day0), false);
  assert.equal(Number(memory.get(SUPPORT_FIRST_SEEN_KEY)), day0);
  assert.equal(supportDueAt(day0), day0 + SUPPORT_CYCLE_MS);
  assert.equal(shouldShowSupportEnvelope(day10), false);
  assert.equal(shouldShowSupportEnvelope(day31), true);
});

test('opening About does not snooze — donate or dismiss (X) does', () => {
  memory.set(SUPPORT_FIRST_SEEN_KEY, String(day0));
  assert.equal(shouldShowSupportEnvelope(day31), true);

  // Visiting About alone must not write SUPPORT_SNOOZE_KEY.
  assert.equal(memory.has(SUPPORT_SNOOZE_KEY), false);
  assert.equal(shouldShowSupportEnvelope(day40), true);

  // Same path as donate click or envelope X.
  snoozeSupportEnvelope(day40);
  assert.equal(shouldShowSupportEnvelope(day40), false);
  assert.equal(shouldShowSupportEnvelope(day40 + SUPPORT_CYCLE_MS - 1), false);
  assert.equal(shouldShowSupportEnvelope(day40 + SUPPORT_CYCLE_MS), true);
});

test('the system notification fires once per due window', () => {
  memory.set(SUPPORT_FIRST_SEEN_KEY, String(day0));
  assert.equal(shouldNotifySupport(day10), false);
  assert.equal(shouldNotifySupport(day31), true);

  markSupportNotified(day31);
  assert.equal(Number(memory.get(SUPPORT_NOTIFIED_KEY)), day31);
  assert.equal(shouldNotifySupport(day40), false);

  snoozeSupportEnvelope(day40);
  assert.equal(shouldNotifySupport(day40), false);
  assert.equal(shouldNotifySupport(day70 - 1), false);
  assert.equal(shouldNotifySupport(day70), true);
});
