import assert from 'node:assert/strict';
import { test } from 'node:test';
import { currentJewishDay, jewishDay, readJewishDay } from './jewishCalendar.ts';

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

test('the winter rain line runs from Simchat Torah until the day before Pesach', () => {
  assert.equal(jewishDay(noon('2026-10-03')).mashivHaruach, false);
  const simchat = jewishDay(noon('2026-10-04'));
  assert.equal(simchat.titles.includes('Simchat Torah'), true);
  assert.equal(simchat.mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-01-15')).mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-04-01')).mashivHaruach, true);
  assert.equal(jewishDay(noon('2026-04-02')).mashivHaruach, false);
});

test('in Israel the winter line starts on Shmini Atzeret, the same day as Simchat Torah', () => {
  assert.equal(jewishDay(noon('2026-10-03'), true).mashivHaruach, true);
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
});

test('the home screen can show both dates and the name of the day', () => {
  const day = jewishDay(noon('2026-10-12'));
  assert.equal(day.gregorian, '2026-10-12');
  assert.equal(day.hebrewDate, '1 Cheshvan 5787');
  assert.equal(day.titles.includes('Rosh Chodesh Cheshvan'), true);
  assert.equal(jewishDay(noon('2026-01-15')).titles.length, 0);
});

test('reading a day keeps it for later without showing it', () => {
  const day = readJewishDay(noon('2026-09-12'));
  assert.equal(currentJewishDay(), day);
});
