import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shabbatOfWeek, weeklyReadingDates, weeklyReadingLine } from './weeklyReading.ts';

const noon = (iso: string) => new Date(`${iso}T12:00:00`);

test('every stored reading falls on a Saturday and the dates do not repeat', () => {
  const seen = new Set<string>();
  for (const iso of weeklyReadingDates) {
    assert.equal(noon(iso).getDay(), 6, iso);
    assert.equal(seen.has(iso), false, iso);
    seen.add(iso);
  }
  assert.equal(weeklyReadingDates.length > 50, true);
});

test('Sunday through Friday show the coming Saturday, and Saturday shows itself', () => {
  assert.equal(shabbatOfWeek(noon('2026-10-18')), '2026-10-24');
  assert.equal(shabbatOfWeek(noon('2026-10-16')), '2026-10-17');
  assert.equal(shabbatOfWeek(noon('2026-10-17')), '2026-10-17');
  const friday = weeklyReadingLine(noon('2026-10-16'), 'ru');
  const saturday = weeklyReadingLine(noon('2026-10-17'), 'ru');
  assert.equal(friday, saturday);
  assert.equal(friday.startsWith('Ноах · '), true);
});

test('the week of 18 October 2026 is Lech-Lecha in the reader language', () => {
  assert.equal(
    weeklyReadingLine(noon('2026-10-18'), 'ru'),
    'Лех-леха · Берешит 14:1–15:21 · Йехошуа 24:1–26',
  );
  assert.equal(
    weeklyReadingLine(noon('2026-10-18'), 'nl'),
    'Lèch-Lecha · Berésjit 14:1–15:21 · Jehosjoea 24:1–26',
  );
  assert.equal(
    weeklyReadingLine(noon('2026-10-18'), 'en'),
    'Lech-Lecha · Genesis 14:1–15:21 · Joshua 24:1–26',
  );
  assert.equal(
    weeklyReadingLine(noon('2026-10-24'), 'fr'),
    'Lekh-Lekha · Beréchit 14:1–15:21 · Josué 24:1–26',
  );
});

test('a gap in the reading stays a gap', () => {
  const line = weeklyReadingLine(noon('2026-12-26'), 'en');
  assert.equal(line.includes('Genesis 49:1–33 · Genesis 50:22–26'), true);
  assert.equal(line.includes('50:1'), false);
});

test('a Shabbat outside the Levisson year has no line', () => {
  assert.equal(weeklyReadingLine(noon('2026-09-12'), 'ru'), '');
  assert.equal(weeklyReadingLine(noon('2027-10-02'), 'ru'), '');
  assert.equal(weeklyReadingLine(noon('2026-08-01'), 'nl'), '');
});

test('special Shabbat readings follow the year sheet', () => {
  assert.equal(
    weeklyReadingLine(noon('2027-03-20'), 'nl'),
    'Wajikra · Wajikra 3:1–4:26 · Dewarim 25:17–19 · I Sjmoeël 15:2–34',
  );
  const miketz = weeklyReadingLine(noon('2026-12-12'), 'en');
  assert.equal(miketz.includes('I Kings 7:40–50'), true);
  assert.equal(miketz.includes('Isaiah'), false);
  assert.equal(weeklyReadingLine(noon('2027-05-08'), 'ru'), 'Кдошим · Ваикра 19:1–37');
});
