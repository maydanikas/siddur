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

const sameClock = { weekday: '07:00', weekend: '07:00' };

test('the next reminder is later today, or tomorrow once that minute has started', () => {
  const morning = new Date(2026, 9, 5, 5, 30, 0, 0);
  const today = new Date(2026, 9, 5, 7, 0, 0, 0);
  assert.equal(nextReminderTime(sameClock, morning), today.getTime());

  const exactly = new Date(2026, 9, 5, 7, 0, 0, 0);
  const tomorrow = new Date(2026, 9, 6, 7, 0, 0, 0);
  assert.equal(nextReminderTime(sameClock, exactly), tomorrow.getTime());
});

test('saturday and sunday use the weekend clock, monday returns to weekdays', () => {
  const clocks = { weekday: '07:00', weekend: '09:30' };
  const fridayEvening = new Date(2026, 9, 9, 18, 0, 0, 0);
  assert.equal(nextReminderTime(clocks, fridayEvening), new Date(2026, 9, 10, 9, 30, 0, 0).getTime());

  const saturdayMorning = new Date(2026, 9, 10, 9, 30, 0, 0);
  assert.equal(nextReminderTime(clocks, saturdayMorning), new Date(2026, 9, 11, 9, 30, 0, 0).getTime());

  const sundayAfter = new Date(2026, 9, 11, 10, 0, 0, 0);
  assert.equal(nextReminderTime(clocks, sundayAfter), new Date(2026, 9, 12, 7, 0, 0, 0).getTime());

  assert.deepEqual(upcomingReminderTimes(clocks, 3, fridayEvening), [
    new Date(2026, 9, 10, 9, 30, 0, 0).getTime(),
    new Date(2026, 9, 11, 9, 30, 0, 0).getTime(),
    new Date(2026, 9, 12, 7, 0, 0, 0).getTime(),
  ]);
});

test('upcoming days stay on the chosen minute across a month boundary', () => {
  const from = new Date(2026, 0, 31, 8, 0, 0, 0);
  const times = upcomingReminderTimes(sameClock, 2, from);
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
