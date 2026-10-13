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
  /** Civil Saturday. The app dates the day from the phone clock, not from sunset. */
  shabbat: boolean;
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
    shabbat: hd.getDay() === 6,
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

type MonthForms = { nom: string; gen: string };

/**
 * Month names follow the spelling of the seasonal notes.
 * The date uses the genitive in Russian, the same way the civil date says «1 октября».
 * A holiday name uses the nominative: «Рош ходеш Хешван».
 */
const HEBREW_MONTH: Record<Exclude<Lang, 'en'>, Record<string, MonthForms>> = {
  ru: {
    Nisan: { nom: 'Нисан', gen: 'Нисана' },
    Iyyar: { nom: 'Ияр', gen: 'Ияра' },
    Sivan: { nom: 'Сиван', gen: 'Сивана' },
    Tamuz: { nom: 'Таммуз', gen: 'Таммуза' },
    Av: { nom: 'Ав', gen: 'Ава' },
    Elul: { nom: 'Элул', gen: 'Элула' },
    Tishrei: { nom: 'Тишрей', gen: 'Тишрея' },
    Cheshvan: { nom: 'Хешван', gen: 'Хешвана' },
    Kislev: { nom: 'Кислев', gen: 'Кислева' },
    Tevet: { nom: 'Тевет', gen: 'Тевета' },
    "Sh'vat": { nom: 'Шват', gen: 'Швата' },
    Adar: { nom: 'Адар', gen: 'Адара' },
    'Adar I': { nom: 'Адар I', gen: 'Адара I' },
    'Adar II': { nom: 'Адар II', gen: 'Адара II' },
  },
  nl: {
    Nisan: { nom: 'Nisan', gen: 'Nisan' },
    Iyyar: { nom: 'Ijar', gen: 'Ijar' },
    Sivan: { nom: 'Sivan', gen: 'Sivan' },
    Tamuz: { nom: 'Tamoez', gen: 'Tamoez' },
    Av: { nom: 'Av', gen: 'Av' },
    Elul: { nom: 'Eloel', gen: 'Eloel' },
    Tishrei: { nom: 'Tisjri', gen: 'Tisjri' },
    Cheshvan: { nom: 'Chesjwan', gen: 'Chesjwan' },
    Kislev: { nom: 'Kislev', gen: 'Kislev' },
    Tevet: { nom: 'Tevet', gen: 'Tevet' },
    "Sh'vat": { nom: 'Sjevat', gen: 'Sjevat' },
    Adar: { nom: 'Adar', gen: 'Adar' },
    'Adar I': { nom: 'Adar I', gen: 'Adar I' },
    'Adar II': { nom: 'Adar II', gen: 'Adar II' },
  },
  fr: {
    Nisan: { nom: 'Nissan', gen: 'Nissan' },
    Iyyar: { nom: 'Iyar', gen: 'Iyar' },
    Sivan: { nom: 'Sivan', gen: 'Sivan' },
    Tamuz: { nom: 'Tamouz', gen: 'Tamouz' },
    Av: { nom: 'Av', gen: 'Av' },
    Elul: { nom: 'Eloul', gen: 'Eloul' },
    Tishrei: { nom: 'Tichri', gen: 'Tichri' },
    Cheshvan: { nom: 'Hechvan', gen: 'Hechvan' },
    Kislev: { nom: 'Kislev', gen: 'Kislev' },
    Tevet: { nom: 'Tévet', gen: 'Tévet' },
    "Sh'vat": { nom: 'Chevat', gen: 'Chevat' },
    Adar: { nom: 'Adar', gen: 'Adar' },
    'Adar I': { nom: 'Adar I', gen: 'Adar I' },
    'Adar II': { nom: 'Adar II', gen: 'Adar II' },
  },
};

/** A Hebrew month in the reader's language. English keeps the Hebcal spelling. */
export function hebrewMonthIn(englishName: string, lang: Lang, form: 'nom' | 'gen' = 'nom'): string {
  if (lang === 'en') return englishName;
  return HEBREW_MONTH[lang][englishName]?.[form] ?? englishName;
}

/** The home-screen Hebrew date, in the reader's language. English stays “1 Cheshvan 5787”. */
export function hebrewDateIn(date: Date, lang: Lang): string {
  const hd = new HDate(date);
  if (lang === 'en') return hd.toString();
  const month = hebrewMonthIn(hd.getMonthName(), lang, 'gen');
  if (month === hd.getMonthName()) return hd.toString();
  return `${hd.getDate()} ${month} ${hd.getFullYear()}`;
}
