import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HebrewCalendar } from '@hebcal/core';
import { shabbatOfWeek, weeklyReadingDates, weeklyReadingLine, weeklyReadingParts, weeklyReadingPassages } from './weeklyReading.ts';

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

test('Rosh Hashana and Yom Kippur have no reading line', () => {
  assert.equal(weeklyReadingLine(noon('2026-09-12'), 'ru'), '');
  assert.equal(weeklyReadingLine(noon('2027-10-02'), 'ru'), '');
  assert.equal(weeklyReadingLine(noon('2028-09-30'), 'en'), '');
});

test('1 August 2026 already follows column A', () => {
  assert.equal(
    weeklyReadingLine(noon('2026-08-01'), 'nl'),
    'Ekev · Dewarim 7:12–9:3 · Jesjajahoe 49:14–51:3',
  );
});

test('columns A, B, and C continue after the 5787 sheet', () => {
  assert.equal(
    weeklyReadingLine(noon('2027-10-30'), 'en'),
    'Bereshit · Genesis 4:19–6:8 · I Samuel 20:18–42',
  );
  assert.equal(
    weeklyReadingLine(noon('2028-11-04'), 'en'),
    'Vayera · Genesis 18:1–19:29 · II Kings 4:1–37',
  );
  assert.equal(
    weeklyReadingLine(noon('2028-10-21'), 'en'),
    'Noach · Genesis 6:9–8:5 · Genesis 1:14–19 · Isaiah 66:10–23',
  );
  assert.equal(
    weeklyReadingLine(noon('2029-10-13'), 'en'),
    'Noach · Genesis 8:6–9:29 · Jeremiah 31:23–36',
  );
  assert.equal(
    weeklyReadingLine(noon('2028-09-23'), 'en'),
    "Haazinu · Deuteronomy 32:1–52 · Hosea 14:2–10 · Micah 7:18–20",
  );
});

test('every Saturday through 2031 still has a reading, apart from the machzor', () => {
  const cursor = new Date(2027, 9, 30, 12);
  const end = new Date(2031, 9, 31, 12);
  while (cursor <= end) {
    if (cursor.getDay() === 6) {
      const descriptions = HebrewCalendar.calendar({ start: cursor, end: cursor, il: true }).map((event) => event.getDesc());
      const machzor = descriptions.some((desc) => desc === 'Yom Kippur' || /^Rosh Hashana( II| \d+)/.test(desc));
      const line = weeklyReadingLine(cursor, 'en');
      if (machzor) assert.equal(line, '', cursor.toDateString());
      else assert.equal(line.includes(' · '), true, cursor.toDateString());
    }
    cursor.setDate(cursor.getDate() + 1);
  }
});

test('every stored span has its own Sefaria range address', () => {
  for (const iso of weeklyReadingDates) {
    const parts = weeklyReadingParts(noon(iso), 'en');
    assert.equal(parts[0].href, undefined, iso);
    assert.equal(parts.length > 1, true, iso);
    for (const part of parts.slice(1)) {
      assert.match(
        part.href ?? '',
        /^https:\/\/www\.sefaria\.org\/[A-Za-z_]+\.\d+\.\d+-(?:\d+\.)?\d+$/,
        `${iso} ${part.text}`,
      );
    }
  }
});

test('each cited span links to that Sefaria range', () => {
  const lech = weeklyReadingParts(noon('2026-10-18'), 'ru');
  assert.equal(lech[0].href, undefined);
  assert.deepEqual(lech.slice(1).map((part) => part.href), [
    'https://www.sefaria.org/Genesis.14.1-15.21',
    'https://www.sefaria.org/Joshua.24.1-26',
  ]);
  assert.deepEqual(
    weeklyReadingPassages(noon('2026-10-18'), 'ru').map((passage) => passage.ref),
    ['Genesis.14.1-15.21', 'Joshua.24.1-26'],
  );

  const vayechi = weeklyReadingParts(noon('2026-12-26'), 'en').map((part) => part.href);
  assert.equal(vayechi.includes('https://www.sefaria.org/Genesis.49.1-33'), true);
  assert.equal(vayechi.includes('https://www.sefaria.org/Genesis.50.22-26'), true);
  assert.equal(vayechi.some((href) => href?.includes('49.1-50')), false);

  const zachor = weeklyReadingParts(noon('2027-03-20'), 'nl').map((part) => part.href);
  assert.deepEqual(zachor, [
    undefined,
    'https://www.sefaria.org/Leviticus.3.1-4.26',
    'https://www.sefaria.org/Deuteronomy.25.17-19',
    'https://www.sefaria.org/I_Samuel.15.2-34',
  ]);

  const kedoshim = weeklyReadingParts(noon('2027-05-08'), 'ru');
  assert.deepEqual(kedoshim.map((part) => part.href), [
    undefined,
    'https://www.sefaria.org/Leviticus.19.1-37',
  ]);
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
