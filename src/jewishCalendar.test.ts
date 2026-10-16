import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HebrewCalendar, flags } from '@hebcal/core';
import { holidayName, holidayNameKnown, homeHolidayLine } from './holidayName.ts';
import { currentJewishDay, hebrewDateIn, jewishDay, readJewishDay } from './jewishCalendar.ts';

const noon = (iso: string) => new Date(`${iso}T12:00:00`);

test('the ten days from Rosh Hashana through Yom Kippur are Yamim Noraim', () => {
  const rosh = jewishDay(noon('2026-09-12'));
  const kippur = jewishDay(noon('2026-09-21'));
  const after = jewishDay(noon('2026-09-22'));
  assert.equal(rosh.hebrewDate, '1 Tishrei 5787');
  assert.equal(rosh.yamimNoraim, true);
  assert.equal(rosh.yaalehVeyavo, null);
  assert.equal(kippur.yamimNoraim, true);
  assert.equal(kippur.titles.includes('Yom Kippur'), true);
  assert.equal(after.yamimNoraim, false);
});

test('the winter rain line starts on Shmini Atzeret and runs until the day before Pesach', () => {
  assert.equal(jewishDay(noon('2026-10-02')).mashivHaruach, false);
  const atzeret = jewishDay(noon('2026-10-03'));
  assert.equal(atzeret.titles.includes('Shmini Atzeret'), true);
  assert.equal(atzeret.titles.includes('Simchat Torah'), false);
  assert.equal(homeHolidayLine(atzeret.titles, atzeret.shabbat, 'ru'), 'Шаббат, Симхат Тора');
  assert.equal(homeHolidayLine(atzeret.titles, atzeret.shabbat, 'nl'), 'Sjabbat, Simchat Tora');
  assert.equal(homeHolidayLine(atzeret.titles, atzeret.shabbat, 'fr'), 'Chabbat, Simhat Torah');
  assert.equal(homeHolidayLine(atzeret.titles, atzeret.shabbat, 'en'), 'Shabbat, Simchat Torah');
  assert.equal(atzeret.mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-10-04')).titles.includes('Simchat Torah'), false);
  assert.equal(jewishDay(noon('2026-10-04')).mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-01-15')).mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-04-01')).mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-04-02')).mashivHaruach, false);
});

test('the diaspora calendar would keep Simchat Torah on the next day', () => {
  assert.equal(jewishDay(noon('2026-10-03'), false).mashivHaruach, false);
  assert.equal(jewishDay(noon('2026-10-04'), false).titles.includes('Simchat Torah'), true);
});

test('Yaaleh VeYavo follows Rosh Chodesh and the two intermediate festivals', () => {
  const month = jewishDay(noon('2026-03-19'));
  assert.equal(month.roshChodesh, true);
  assert.equal(month.yaalehVeyavo, 'roshChodesh');
  const pesach = jewishDay(noon('2026-04-04'));
  assert.equal(pesach.cholHamoedPesach, true);
  assert.equal(pesach.yaalehVeyavo, 'pesach');
  assert.equal(jewishDay(noon('2026-04-02')).yaalehVeyavo, null);
  const sukkot = jewishDay(noon('2026-09-28'));
  assert.equal(sukkot.cholHamoedSukkot, true);
  assert.equal(sukkot.yaalehVeyavo, 'sukkot');
  assert.equal(jewishDay(noon('2026-10-02')).yaalehVeyavo, 'sukkot');
  assert.equal(jewishDay(noon('2026-09-27')).titles.includes("Sukkot II (CH''M)"), true);
  assert.equal(jewishDay(noon('2026-09-27')).yaalehVeyavo, 'sukkot');
  assert.equal(jewishDay(noon('2026-04-03')).titles.includes("Pesach II (CH''M)"), true);
  assert.equal(jewishDay(noon('2026-04-09')).titles.includes('Pesach VIII'), false);
});

test('the home screen can show both dates and the name of the day', () => {
  const day = jewishDay(noon('2026-10-12'));
  assert.equal(day.gregorian, '2026-10-12');
  assert.equal(day.hebrewDate, '1 Cheshvan 5787');
  assert.equal(day.titles.includes('Rosh Chodesh Cheshvan'), true);
  assert.equal(jewishDay(noon('2026-01-15')).titles.length, 0);
});

test('the Hebrew date is written in the reader’s language', () => {
  const cheshvan = noon('2026-10-12');
  assert.equal(hebrewDateIn(cheshvan, 'en'), '1 Cheshvan 5787');
  assert.equal(hebrewDateIn(cheshvan, 'ru'), '1 Хешвана 5787');
  assert.equal(hebrewDateIn(cheshvan, 'nl'), '1 Chesjwan 5787');
  assert.equal(hebrewDateIn(cheshvan, 'fr'), '1 Hechvan 5787');
  assert.equal(hebrewDateIn(noon('2026-09-12'), 'ru'), '1 Тишрея 5787');
  assert.equal(hebrewDateIn(noon('2026-04-02'), 'fr'), '15 Nissan 5786');
  assert.equal(hebrewDateIn(noon('2026-01-15'), 'nl'), '26 Tevet 5786');
  assert.equal(hebrewDateIn(noon('2027-01-09'), 'ru'), '1 Швата 5787');
  assert.equal(hebrewDateIn(noon('2024-02-10'), 'fr'), '1 Adar I 5784');
  assert.equal(hebrewDateIn(noon('2024-03-11'), 'nl'), '1 Adar II 5784');
});

test('Shabbat is always named, and a holiday on that day follows a comma', () => {
  const ordinary = jewishDay(noon('2026-10-17'));
  assert.equal(ordinary.shabbat, true);
  assert.equal(ordinary.titles.length, 0);
  assert.equal(homeHolidayLine(ordinary.titles, ordinary.shabbat, 'ru'), 'Шаббат');
  assert.equal(homeHolidayLine(ordinary.titles, ordinary.shabbat, 'nl'), 'Sjabbat');
  assert.equal(homeHolidayLine(ordinary.titles, ordinary.shabbat, 'fr'), 'Chabbat');
  assert.equal(homeHolidayLine(ordinary.titles, ordinary.shabbat, 'en'), 'Shabbat');
  assert.equal(jewishDay(noon('2026-10-16')).shabbat, false);
  const rosh = jewishDay(noon('2026-09-12'));
  assert.equal(rosh.shabbat, true);
  assert.equal(homeHolidayLine(rosh.titles, rosh.shabbat, 'ru'), 'Шаббат, Рош ха-Шана 5787');
  assert.equal(homeHolidayLine(rosh.titles, rosh.shabbat, 'en'), 'Shabbat, Rosh Hashana 5787');
  const sukkot = jewishDay(noon('2026-09-26'));
  assert.equal(homeHolidayLine(sukkot.titles, sukkot.shabbat, 'fr'), "Chabbat, Soukkot I");
  const sunday = jewishDay(noon('2026-10-25'));
  assert.equal(sunday.yomRishon, true);
  assert.equal(sunday.shabbat, false);
  assert.equal(homeHolidayLine(sunday.titles, sunday.shabbat, 'ru', sunday.yomRishon), 'Йом Ришон');
  assert.equal(homeHolidayLine(sunday.titles, sunday.shabbat, 'nl', sunday.yomRishon), 'Jom Risjon');
  assert.equal(homeHolidayLine(sunday.titles, sunday.shabbat, 'fr', sunday.yomRishon), 'Yom Richon');
  assert.equal(homeHolidayLine(sunday.titles, sunday.shabbat, 'en', sunday.yomRishon), 'Yom Rishon');
  const roshSunday = jewishDay(noon('2026-09-13'));
  assert.equal(homeHolidayLine(roshSunday.titles, roshSunday.shabbat, 'ru', roshSunday.yomRishon), 'Йом Ришон, Рош ха-Шана II');
  assert.equal(jewishDay(noon('2026-10-13')).yomRishon, false);
  const secondSukkot = jewishDay(noon('2026-09-27'));
  assert.equal(homeHolidayLine(secondSukkot.titles, secondSukkot.shabbat, 'ru', secondSukkot.yomRishon), 'Йом Ришон, Суккот II (хол ха-моэд)');
  const shavuot = jewishDay(noon('2026-05-22'));
  assert.equal(shavuot.titles.includes('Shavuot'), true);
  assert.equal(jewishDay(noon('2026-05-23')).titles.length, 0);
  const afterAtzeret = jewishDay(noon('2026-10-04'));
  assert.equal(afterAtzeret.titles.includes('Simchat Torah'), false);
  assert.equal(homeHolidayLine(afterAtzeret.titles, afterAtzeret.shabbat, 'ru', afterAtzeret.yomRishon).includes('Симхат Тора'), false);
});

test('the holiday name is written in the reader’s language', () => {
  assert.equal(holidayName('Rosh Chodesh Cheshvan', 'en'), 'Rosh Chodesh Cheshvan');
  assert.equal(holidayName('Rosh Chodesh Cheshvan', 'ru'), 'Рош ходеш Хешван');
  assert.equal(holidayName('Rosh Chodesh Cheshvan', 'nl'), 'Rosj Chodesj Chesjwan');
  assert.equal(holidayName('Rosh Chodesh Cheshvan', 'fr'), 'Roch Hodech Hechvan');
  assert.equal(holidayName('Rosh Hashana 5787', 'ru'), 'Рош ха-Шана 5787');
  assert.equal(holidayName('Yom Kippur', 'nl'), 'Jom Kipoer');
  assert.equal(holidayName('Yom Kippur', 'fr'), 'Kippour');
  assert.equal(holidayName('Simchat Torah', 'ru'), 'Симхат Тора');
  assert.equal(holidayName('Shmini Atzeret', 'ru'), 'Симхат Тора');
  assert.equal(holidayName('Shmini Atzeret', 'en'), 'Simchat Torah');
  assert.equal(holidayName("Pesach III (CH''M)", 'ru'), 'Песах III (хол ха-моэд)');
  assert.equal(holidayName("Pesach III (CH''M)", 'nl'), 'Pesach III (Chol HaMoëed)');
  assert.equal(holidayName("Pesach III (CH''M)", 'fr'), "Pessa'h III (Hol HaMoed)");
  assert.equal(holidayName('Sukkot VII (Hoshana Raba)', 'ru'), 'Суккот VII (Хошана раба)');
  assert.equal(holidayName('Erev Pesach', 'ru'), 'Канун Песаха');
  assert.equal(holidayName('Chanukah: 1 Candle', 'ru'), 'Ханука: 1 свеча');
  assert.equal(holidayName('Chanukah: 5 Candles', 'fr'), 'Hanouka: 5 bougies');
  assert.equal(holidayName("Tish'a B'Av (observed)", 'nl'), 'Tisja be-Av (verschoven)');
  assert.equal(holidayName('Rosh Chodesh Adar I', 'ru'), 'Рош ходеш Адар I');
  assert.equal(holidayName("Rosh Chodesh Sh'vat", 'fr'), 'Roch Hodech Chevat');
});

test('every holiday the calendar can show has a name in each language', () => {
  const mask =
    flags.CHAG | flags.ROSH_CHODESH | flags.CHOL_HAMOED | flags.MAJOR_FAST |
    flags.MINOR_FAST | flags.MINOR_HOLIDAY | flags.MODERN_HOLIDAY | flags.EREV;
  const titles = new Set<string>();
  for (const event of HebrewCalendar.calendar({
    start: new Date('2024-01-01T12:00:00'),
    end: new Date('2028-12-31T12:00:00'),
    il: true,
    sedrot: false,
  })) {
    if ((event.getFlags() & mask) !== 0) titles.add(event.getDesc());
  }
  assert.ok(titles.size > 70);
  for (const title of titles) {
    for (const lang of ['ru', 'nl', 'fr'] as const) {
      assert.equal(holidayNameKnown(title, lang), true, `${lang} ${title}`);
      if (lang === 'ru') assert.match(holidayName(title, lang), /[А-Яа-яЁё]/, title);
    }
  }
});

test('reading a day keeps it for later without showing it', () => {
  const day = readJewishDay(noon('2026-09-12'));
  assert.equal(currentJewishDay(), day);
});
