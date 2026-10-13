import { CandleLightingEvent, HavdalahEvent, HebrewCalendar, Location, flags } from '@hebcal/core';
import type { Lang } from './supportCopy';

/**
 * Candle lighting and havdalah belong to the civil day on which they happen.
 * A normal week: candles on Friday evening, havdalah on Saturday evening.
 * When a festival runs through Saturday night, that evening is candles again
 * and havdalah moves to the day the festival ends.
 * Shabbat and Yom Rishon stay the names of Saturday and Sunday. The clock is not attached to those names.
 * Diaspora custom: 18 minutes before sunset, havdalah at tzeit (8.5°).
 */

export type Place = {
  latitude: number;
  longitude: number;
};

export type ShabbatClock = {
  kind: 'candles' | 'havdalah';
  /** 24-hour time in the phone's timezone, for example "18:25". */
  time: string;
};

const CLOCK_FLAG = flags.LIGHT_CANDLES | flags.LIGHT_CANDLES_TZEIS | flags.YOM_TOV_ENDS;

const CLOCK_LABEL: Record<ShabbatClock['kind'], Record<Lang, string>> = {
  candles: {
    en: 'Candle lighting',
    ru: 'Зажигание свечей',
    nl: 'Kaarsen aansteken',
    fr: 'Allumage des bougies',
  },
  havdalah: {
    en: 'Havdalah',
    ru: 'Авдала',
    nl: 'Havdala',
    fr: 'Havdala',
  },
};

function phoneTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

/** Friday, Saturday, or a festival evening that has candles or havdalah. */
export function dayNeedsClock(date: Date): boolean {
  const weekday = date.getDay();
  if (weekday === 5 || weekday === 6) return true;
  const events = HebrewCalendar.calendar({ start: date, end: date, il: false, sedrot: false });
  return events.some((event) => (event.getFlags() & CLOCK_FLAG) !== 0);
}

/**
 * The evening time for this civil day, at the phone's place.
 * Returns nothing on a day with neither candles nor havdalah.
 */
export function shabbatClock(date: Date, place: Place, timeZone = phoneTimeZone()): ShabbatClock | null {
  if (!dayNeedsClock(date) || !timeZone) return null;
  try {
    const location = new Location(place.latitude, place.longitude, false, timeZone);
    const events = HebrewCalendar.calendar({
      start: date,
      end: date,
      il: false,
      sedrot: false,
      location,
      candlelighting: true,
    });
    const havdalah = events.find((event) => event instanceof HavdalahEvent);
    const candles = events.find((event) => event instanceof CandleLightingEvent);
    const timed = havdalah ?? candles;
    if (!timed || !timed.eventTimeStr) return null;
    return {
      kind: timed instanceof HavdalahEvent ? 'havdalah' : 'candles',
      time: timed.eventTimeStr,
    };
  } catch {
    return null;
  }
}

export function shabbatClockLine(clock: ShabbatClock, lang: Lang): string {
  return `${CLOCK_LABEL[clock.kind][lang]} ${clock.time}`;
}
