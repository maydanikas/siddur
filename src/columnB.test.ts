import assert from 'node:assert/strict';
import { test } from 'node:test';
import { columnBWeeks } from './columnB.ts';

test('the year B preview marks a Shabbat ready only when every span has a draft', () => {
  const ready = new Map(columnBWeeks('ru').map((week) => [week.iso, week.ready]));
  assert.equal(ready.get('2026-10-24'), true);
  assert.equal(ready.get('2026-12-26'), true);
  assert.equal(ready.get('2027-01-02'), true);
  assert.equal(ready.get('2027-03-06'), true);
  assert.equal(ready.get('2026-10-10'), true);
  assert.equal(ready.get('2026-10-17'), false);
  assert.equal(ready.get('2027-03-13'), false);
  const lech = columnBWeeks('ru').find((week) => week.iso === '2026-10-24');
  assert.equal(lech?.portion, 'Лех-леха');
  assert.equal(lech?.refs.length, 2);
});
