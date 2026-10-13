import type { Lang } from './supportCopy';
import { hebrewMonthIn } from './jewishCalendar.ts';

type Phrase = Record<Exclude<Lang, 'en'>, string>;

/** Names already used in the seasonal notes, plus the other days the calendar can show. */
const NAME: Record<string, Phrase> = {
  "Asara B'Tevet": { ru: 'Асара бе-Тевет', nl: 'Asara be-Tevet', fr: 'Assara be-Tévet' },
  'Chag HaBanot': { ru: 'Хаг ха-Банот', nl: 'Chag HaBanot', fr: 'Hag HaBanot' },
  'Lag BaOmer': { ru: 'Лаг ба-Омер', nl: 'Lag ba-Omer', fr: 'Lag ba-Omer' },
  'Leil Selichot': { ru: 'Лейл слихот', nl: 'Leil Selichot', fr: 'Leil Selihot' },
  Pesach: { ru: 'Песах', nl: 'Pesach', fr: "Pessa'h" },
  'Pesach Sheni': { ru: 'Песах шени', nl: 'Pesach Sjeni', fr: "Pessa'h chéni" },
  Purim: { ru: 'Пурим', nl: 'Poerim', fr: 'Pourim' },
  'Purim Katan': { ru: 'Пурим катан', nl: 'Poerim Katan', fr: 'Pourim katan' },
  'Purim Meshulash': { ru: 'Пурим мешулаш', nl: 'Poerim Mesjoelasj', fr: 'Pourim mechoulach' },
  'Rosh Hashana': { ru: 'Рош ха-Шана', nl: 'Rosj Hasjana', fr: 'Roch Hachana' },
  'Rosh Hashana LaBehemot': { ru: 'Рош ха-Шана ла-бехемот', nl: 'Rosj Hasjana la-behemot', fr: 'Roch Hachana la-behemot' },
  Shavuot: { ru: 'Шавуот', nl: 'Sjavoeot', fr: 'Chavouot' },
  'Shmini Atzeret': { ru: 'Шмини ацерет', nl: 'Sjmini Atseret', fr: 'Chemini Atseret' },
  'Shushan Purim': { ru: 'Шушан Пурим', nl: 'Sjoesjan Poerim', fr: 'Chouchane Pourim' },
  'Shushan Purim Katan': { ru: 'Шушан Пурим катан', nl: 'Sjoesjan Poerim Katan', fr: 'Chouchane Pourim katan' },
  Sigd: { ru: 'Сигд', nl: 'Sigd', fr: 'Sigd' },
  'Simchat Torah': { ru: 'Симхат Тора', nl: 'Simchat Tora', fr: 'Simhat Torah' },
  Sukkot: { ru: 'Суккот', nl: 'Soekot', fr: 'Soukkot' },
  "Ta'anit Bechorot": { ru: 'Таанит бехорот', nl: 'Taanit Bechorot', fr: "Ta'anit bechorot" },
  "Ta'anit Esther": { ru: 'Таанит Эстер', nl: 'Taanit Ester', fr: "Ta'anit Esther" },
  "Tish'a B'Av": { ru: 'Тиша бе-Ав', nl: 'Tisja be-Av', fr: "Tich'a be-Av" },
  "Tu B'Av": { ru: 'Ту бе-Ав', nl: 'Toe be-Av', fr: 'Tou be-Av' },
  'Tu BiShvat': { ru: 'Ту би-Шват', nl: 'Toe bi-Sjevat', fr: 'Tou bi-Chevat' },
  'Tzom Gedaliah': { ru: 'Цом Гедалья', nl: 'Tsom Gedalja', fr: 'Tsom Guedalia' },
  'Tzom Tammuz': { ru: 'Цом Таммуз', nl: 'Tsom Tamoez', fr: 'Tsom Tamouz' },
  'Yom HaAliyah': { ru: 'Йом ха-Алия', nl: 'Jom HaAlija', fr: 'Yom HaAliya' },
  "Yom HaAtzma'ut": { ru: 'Йом ха-Ацмаут', nl: 'Jom HaAtsmaoet', fr: 'Yom HaAtsmaout' },
  'Yom HaShoah': { ru: 'Йом ха-Шоа', nl: 'Jom HaSjoa', fr: 'Yom HaChoah' },
  'Yom HaZikaron': { ru: 'Йом ха-Зикарон', nl: 'Jom HaZikaron', fr: 'Yom HaZikaron' },
  'Yom Kippur': { ru: 'Йом Кипур', nl: 'Jom Kipoer', fr: 'Kippour' },
  'Yom Yerushalayim': { ru: 'Йом Йерушалаим', nl: 'Jom Jeroesjalajim', fr: 'Yom Yerouchalayim' },
  'Swords of Iron War Memorial Day': {
    ru: 'День памяти войны «Железные мечи»',
    nl: 'Herdenkingsdag van de IJzeren Zwaarden',
    fr: 'Jour de mémoire de la guerre des Épées de fer',
  },
};

const ROSH_CHODESH: Phrase = { ru: 'Рош ходеш', nl: 'Rosj Chodesj', fr: 'Roch Hodech' };
const CHOL_HAMOED: Phrase = { ru: 'хол ха-моэд', nl: 'Chol HaMoëed', fr: 'Hol HaMoed' };
const HOSHANA: Phrase = { ru: 'Хошана раба', nl: 'Hosjana Raba', fr: 'Hochana Raba' };
const CHANUKAH: Phrase = { ru: 'Ханука', nl: 'Chanoeka', fr: 'Hanouka' };
const OBSERVED: Phrase = { ru: 'перенесён', nl: 'verschoven', fr: 'reporté' };
const EREV: Record<string, Phrase> = {
  Pesach: { ru: 'Канун Песаха', nl: 'Vooravond van Pesach', fr: "Veille de Pessa'h" },
  Purim: { ru: 'Канун Пурима', nl: 'Vooravond van Poerim', fr: 'Veille de Pourim' },
  'Rosh Hashana': { ru: 'Канун Рош ха-Шана', nl: 'Vooravond van Rosj Hasjana', fr: 'Veille de Roch Hachana' },
  Shavuot: { ru: 'Канун Шавуот', nl: 'Vooravond van Sjavoeot', fr: 'Veille de Chavouot' },
  Sukkot: { ru: 'Канун Суккот', nl: 'Vooravond van Soekot', fr: 'Veille de Soukkot' },
  "Tish'a B'Av": { ru: 'Канун Тиша бе-Ав', nl: 'Vooravond van Tisja be-Av', fr: "Veille de Tich'a be-Av" },
  'Yom Kippur': { ru: 'Канун Йом Кипура', nl: 'Vooravond van Jom Kipoer', fr: 'Veille de Kippour' },
};

function candles(count: number, lang: Exclude<Lang, 'en'>): string {
  if (lang === 'ru') {
    const word = count === 1 ? 'свеча' : count < 5 ? 'свечи' : 'свечей';
    return `${CHANUKAH.ru}: ${count} ${word}`;
  }
  if (lang === 'nl') {
    return `${CHANUKAH.nl}: ${count} ${count === 1 ? 'kaars' : 'kaarsen'}`;
  }
  return `${CHANUKAH.fr}: ${count} ${count === 1 ? 'bougie' : 'bougies'}`;
}

function renderHoliday(desc: string, lang: Exclude<Lang, 'en'>): string | null {
  const observed = desc.endsWith(' (observed)');
  const base = observed ? desc.slice(0, -' (observed)'.length) : desc;
  let name: string | null = NAME[base]?.[lang] ?? null;
  const erev = base.match(/^Erev (.+)$/);
  const roshChodesh = base.match(/^Rosh Chodesh (.+)$/);
  const roshHashana = base.match(/^Rosh Hashana (\d{4})$/);
  const chol = base.match(/^(Pesach|Sukkot) ([IV]+) \(CH''M\)$/);
  const hoshana = base.match(/^Sukkot ([IV]+) \(Hoshana Raba\)$/);
  const numbered = base.match(/^(Pesach|Sukkot|Shavuot|Rosh Hashana) ([IV]+)$/);
  const candle = base.match(/^Chanukah: (\d+) Candles?$/);
  if (erev) name = EREV[erev[1]]?.[lang] ?? null;
  else if (roshChodesh) {
    const month = hebrewMonthIn(roshChodesh[1], lang, 'nom');
    const monthKnown = hebrewMonthIn(roshChodesh[1], 'ru', 'nom') !== roshChodesh[1];
    name = monthKnown ? `${ROSH_CHODESH[lang]} ${month}` : null;
  }
  else if (roshHashana) name = `${NAME['Rosh Hashana'][lang]} ${roshHashana[1]}`;
  else if (chol) name = `${NAME[chol[1]][lang]} ${chol[2]} (${CHOL_HAMOED[lang]})`;
  else if (hoshana) name = `${NAME.Sukkot[lang]} ${hoshana[1]} (${HOSHANA[lang]})`;
  else if (numbered) name = `${NAME[numbered[1]][lang]} ${numbered[2]}`;
  else if (candle) name = candles(Number(candle[1]), lang);
  else if (base === 'Chanukah: 8th Day') {
    name = lang === 'ru' ? 'Ханука: 8-й день' : lang === 'nl' ? 'Chanoeka: 8e dag' : 'Hanouka: 8e jour';
  }
  if (!name) return null;
  return observed ? `${name} (${OBSERVED[lang]})` : name;
}

const SHABBAT: Record<Lang, string> = {
  en: 'Shabbat',
  ru: 'Шаббат',
  nl: 'Sjabbat',
  fr: 'Chabbat',
};

/** Shabbat on its own, or Shabbat and the holiday separated by a comma. */
export function homeHolidayLine(titles: string[], shabbat: boolean, lang: Lang): string {
  const holiday = titles.map((title) => holidayName(title, lang)).filter(Boolean).join(' · ');
  if (!shabbat) return holiday;
  if (!holiday) return SHABBAT[lang];
  return `${SHABBAT[lang]}, ${holiday}`;
}

/** The home-screen holiday name. English keeps the Hebcal wording. */
export function holidayName(desc: string, lang: Lang): string {
  if (lang === 'en') return desc;
  return renderHoliday(desc, lang) ?? desc;
}

/** False when a calendar title has no translation yet. */
export function holidayNameKnown(desc: string, lang: Lang): boolean {
  if (lang === 'en') return true;
  return renderHoliday(desc, lang) !== null;
}
