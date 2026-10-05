import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isReminderDue,
  nextReminderTime,
  parseReminderTime,
  REMINDER_LATE_MS,
  upcomingReminderTimes,
} from './reminderSchedule.ts';

test('parses a clock time and rejects an impossible one', () => {
  assert.deepEqual(parseReminderTime('07:00'), { hours: 7, minutes: 0 });
  assert.equal(parseReminderTime('7:00'), null);
  assert.equal(parseReminderTime('24:00'), null);
});

test('the next reminder is later today, or tomorrow once that minute has started', () => {
  const morning = new Date(2026, 9, 5, 5, 30, 0, 0);
  const today = new Date(2026, 9, 5, 7, 0, 0, 0);
  assert.equal(nextReminderTime('07:00', morning), today.getTime());

  const exactly = new Date(2026, 9, 5, 7, 0, 0, 0);
  const tomorrow = new Date(2026, 9, 6, 7, 0, 0, 0);
  assert.equal(nextReminderTime('07:00', exactly), tomorrow.getTime());
});

test('upcoming days stay on the chosen minute across a month boundary', () => {
  const from = new Date(2026, 0, 31, 8, 0, 0, 0);
  const times = upcomingReminderTimes('07:00', 2, from);
  assert.deepEqual(times, [
    new Date(2026, 1, 1, 7, 0, 0, 0).getTime(),
    new Date(2026, 1, 2, 7, 0, 0, 0).getTime(),
  ]);
});

test('a delayed timer still counts for fifteen minutes and then waits for tomorrow', () => {
  const target = new Date(2026, 9, 5, 7, 0, 0, 0).getTime();
  assert.equal(isReminderDue(target, target + REMINDER_LATE_MS), true);
  assert.equal(isReminderDue(target, target + REMINDER_LATE_MS + 1), false);
  assert.equal(isReminderDue(target, target - 5000), false);
});
