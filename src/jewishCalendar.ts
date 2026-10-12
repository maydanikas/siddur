import { HebrewCalendar, HDate, flags, months } from '@hebcal/core';
import type { Lang } from './supportCopy';

const HOLIDAY =
  flags.CHAG |
  flags.ROSH_CHODESH |
  flags.CHOL_HAMOED |
  flags.MAJOR_FAST |
  flags.MINOR_FAST |
  flags.MINOR_HOLIDAY |
  flags.MODERN_HOLIDAY |
  flags.EREV;

export type YaalehVeyavo = 'roshChodesh' | 'pesach' | 'sukkot' | null;

/** Dates for the insertions already written in the Amidah, and the home-screen line. */
export type JewishDay = {
  hebrewDate: string;
  gregorian: string;
  inIsrael: boolean;
  yamimNoraim: boolean;
  mashivHaruach: boolean;
  roshChodesh: boolean;
  cholHamoedPesach: boolean;
  cholHamoedSukkot: boolean;
  yaalehVeyavo: YaalehVeyavo;
  titles: string[];
};

function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** From Simchat Torah until Pesach, matching the winter line in Gevurot. */
function mashivHaruach(hd: HDate, inIsrael: boolean): boolean {
  const month = hd.getMonth();
  const day = hd.getDate();
  const simchatTorah = inIsrael ? 22 : 23;
  if (month === months.TISHREI) return day >= simchatTorah;
  if (month === months.NISAN) return day < 15;
  return month > months.TISHREI;
}

export function jewishDay(date = new Date(), inIsrael = false): JewishDay {
  const hd = new HDate(date);
  const events = HebrewCalendar.calendar({
    start: date,
    end: date,
    il: inIsrael,
    sedrot: false,
  });
  const roshChodesh = events.some((event) => (event.getFlags() & flags.ROSH_CHODESH) !== 0);
  const cholHamoed = events.some((event) => (event.getFlags() & flags.CHOL_HAMOED) !== 0);
  const cholHamoedPesach = cholHamoed && hd.getMonth() === months.NISAN;
  const cholHamoedSukkot = cholHamoed && hd.getMonth() === months.TISHREI;
  let yaalehVeyavo: YaalehVeyavo = null;
  if (cholHamoedPesach) yaalehVeyavo = 'pesach';
  else if (cholHamoedSukkot) yaalehVeyavo = 'sukkot';
  else if (roshChodesh) yaalehVeyavo = 'roshChodesh';
  const titles = events
    .filter((event) => (event.getFlags() & HOLIDAY) !== 0)
    .map((event) => event.getDesc());
  return {
    hebrewDate: hd.toString(),
    gregorian: localIso(date),
    inIsrael,
    yamimNoraim: hd.getMonth() === months.TISHREI && hd.getDate() <= 10,
    mashivHaruach: mashivHaruach(hd, inIsrael),
    roshChodesh,
    cholHamoedPesach,
    cholHamoedSukkot,
    yaalehVeyavo,
    titles,
  };
}

let observed: JewishDay | null = null;

export function readJewishDay(date = new Date(), inIsrael = false): JewishDay {
  observed = jewishDay(date, inIsrael);
  return observed;
}

export function currentJewishDay(): JewishDay | null {
  return observed;
}

/**
 * Month names follow the spelling of the seasonal notes.
 * Russian is genitive, the same way the civil date says «1 октября».
 */
const HEBREW_MONTH: Record<Exclude<Lang, 'en'>, Record<string, string>> = {
  ru: {
    Nisan: 'Нисана',
    Iyyar: 'Ияра',
    Sivan: 'Сивана',
    Tamuz: 'Таммуза',
    Av: 'Ава',
    Elul: 'Элула',
    Tishrei: 'Тишрея',
    Cheshvan: 'Хешвана',
    Kislev: 'Кислева',
    Tevet: 'Тевета',
    "Sh'vat": 'Швата',
    Adar: 'Адара',
    'Adar I': 'Адара I',
    'Adar II': 'Адара II',
  },
  nl: {
    Nisan: 'Nisan',
    Iyyar: 'Ijar',
    Sivan: 'Sivan',
    Tamuz: 'Tamoez',
    Av: 'Av',
    Elul: 'Eloel',
    Tishrei: 'Tisjri',
    Cheshvan: 'Chesjwan',
    Kislev: 'Kislev',
    Tevet: 'Tevet',
    "Sh'vat": 'Sjevat',
    Adar: 'Adar',
    'Adar I': 'Adar I',
    'Adar II': 'Adar II',
  },
  fr: {
    Nisan: 'Nissan',
    Iyyar: 'Iyar',
    Sivan: 'Sivan',
    Tamuz: 'Tamouz',
    Av: 'Av',
    Elul: 'Eloul',
    Tishrei: 'Tichri',
    Cheshvan: 'Hechvan',
    Kislev: 'Kislev',
    Tevet: 'Tévet',
    "Sh'vat": 'Chevat',
    Adar: 'Adar',
    'Adar I': 'Adar I',
    'Adar II': 'Adar II',
  },
};

/** The home-screen Hebrew date, in the reader's language. English stays “1 Cheshvan 5787”. */
export function hebrewDateIn(date: Date, lang: Lang): string {
  const hd = new HDate(date);
  if (lang === 'en') return hd.toString();
  const month = HEBREW_MONTH[lang][hd.getMonthName()];
  if (!month) return hd.toString();
  return `${hd.getDate()} ${month} ${hd.getFullYear()}`;
}
