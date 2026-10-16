import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parsePlace } from './readerPlace.ts';
import { dayNeedsClock, shabbatClock, shabbatClockLine } from './shabbatTimes.ts';

const noon = (iso: string) => new Date(`${iso}T12:00:00`);
const amsterdam = { latitude: 52.3676, longitude: 4.9041 };
const zone = 'Europe/Amsterdam';

test('a normal week puts candles on Friday and havdalah on Saturday', () => {
  const friday = shabbatClock(noon('2026-10-16'), amsterdam, zone);
  const saturday = shabbatClock(noon('2026-10-17'), amsterdam, zone);
  assert.deepEqual(friday, { kind: 'candles', time: '18:25' });
  assert.deepEqual(saturday, { kind: 'havdalah', time: '19:32' });
  assert.equal(shabbatClock(noon('2026-10-15'), amsterdam, zone), null);
  assert.equal(shabbatClock(noon('2026-10-18'), amsterdam, zone), null);
  assert.equal(dayNeedsClock(noon('2026-10-16')), true);
  assert.equal(dayNeedsClock(noon('2026-10-13')), false);
});

test('a festival that continues past Saturday keeps candles on Saturday and havdalah on the last day', () => {
  const friday = shabbatClock(noon('2026-09-11'), amsterdam, zone);
  const saturday = shabbatClock(noon('2026-09-12'), amsterdam, zone);
  const sunday = shabbatClock(noon('2026-09-13'), amsterdam, zone);
  assert.deepEqual(friday, { kind: 'candles', time: '19:47' });
  assert.deepEqual(saturday, { kind: 'candles', time: '20:54' });
  assert.deepEqual(sunday, { kind: 'havdalah', time: '20:52' });
  const kippurEve = shabbatClock(noon('2026-09-20'), amsterdam, zone);
  const kippur = shabbatClock(noon('2026-09-21'), amsterdam, zone);
  assert.deepEqual(kippurEve, { kind: 'candles', time: '19:25' });
  assert.deepEqual(kippur, { kind: 'havdalah', time: '20:32' });
});

test('the clock line follows the reader language', () => {
  const candles = { kind: 'candles' as const, time: '18:25' };
  const havdalah = { kind: 'havdalah' as const, time: '19:32' };
  assert.equal(shabbatClockLine(candles, 'ru'), 'Зажигание свечей 18:25');
  assert.equal(shabbatClockLine(havdalah, 'ru'), 'Авдала 19:32');
  assert.equal(shabbatClockLine(candles, 'nl'), 'Kaarsen aansteken 18:25');
  assert.equal(shabbatClockLine(havdalah, 'nl'), 'Havdala 19:32');
  assert.equal(shabbatClockLine(candles, 'fr'), 'Allumage des bougies 18:25');
  assert.equal(shabbatClockLine(havdalah, 'fr'), 'Havdala 19:32');
  assert.equal(shabbatClockLine(candles, 'en'), 'Candle lighting 18:25');
  assert.equal(shabbatClockLine(havdalah, 'en'), 'Havdalah 19:32');
});

test('a saved place keeps coordinates and a town name in a known language', () => {
  assert.deepEqual(parsePlace('{"latitude":52.37,"longitude":4.9}'), { latitude: 52.37, longitude: 4.9 });
  assert.deepEqual(
    parsePlace('{"latitude":51.73519,"longitude":5.5266331,"name":"Хес","nameLang":"ru"}'),
    { latitude: 51.73519, longitude: 5.5266331, name: 'Хес', nameLang: 'ru' },
  );
  assert.deepEqual(parsePlace('{"latitude":51.73,"longitude":5.53,"name":"Heesch","nameLang":"de"}'), {
    latitude: 51.73,
    longitude: 5.53,
  });
  assert.equal(parsePlace(null), null);
  assert.equal(parsePlace('nope'), null);
  assert.equal(parsePlace('{"latitude":91,"longitude":0}'), null);
  assert.equal(parsePlace('{"latitude":"52","longitude":4}'), null);
});

test('a bad timezone does not throw', () => {
  assert.equal(shabbatClock(noon('2026-10-16'), amsterdam, ''), null);
});
