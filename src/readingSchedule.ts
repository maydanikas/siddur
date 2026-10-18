import { HDate, HebrewCalendar, flags, months } from '@hebcal/core';
import { READING_CYCLE, type CycleColumn } from './readingCycle.ts';
import type { PortionId, Ref } from './weeklyReading.ts';

type Draft = { portion: PortionId; torah: Ref[]; haftarah: Ref[] };

const PARSHA: Record<string, PortionId> = {
  'Parashat Achrei Mot': 'acharei',
  'Parashat Achrei Mot-Kedoshim': 'achareiKedoshim',
  'Parashat Balak': 'balak',
  'Parashat Bamidbar': 'bamidbar',
  'Parashat Bechukotai': 'bechukotai',
  "Parashat Beha'alotcha": 'behaalotcha',
  'Parashat Behar': 'behar',
  'Parashat Behar-Bechukotai': 'beharBechukotai',
  'Parashat Bereshit': 'bereshit',
  'Parashat Beshalach': 'beshalach',
  'Parashat Bo': 'bo',
  'Parashat Chayei Sara': 'chayeiSara',
  'Parashat Chukat': 'chukat',
  'Parashat Chukat-Balak': 'chukatBalak',
  'Parashat Devarim': 'devarim',
  'Parashat Eikev': 'ekev',
  'Parashat Emor': 'emor',
  "Parashat Ha'azinu": 'haazinu',
  'Parashat Kedoshim': 'kedoshim',
  'Parashat Ki Tavo': 'kiTavo',
  'Parashat Ki Teitzei': 'kiTetse',
  'Parashat Ki Tisa': 'kiTisa',
  'Parashat Korach': 'korach',
  'Parashat Lech-Lecha': 'lechLecha',
  'Parashat Masei': 'masei',
  'Parashat Matot': 'matot',
  'Parashat Matot-Masei': 'matotMasei',
  'Parashat Metzora': 'metzora',
  'Parashat Miketz': 'miketz',
  'Parashat Mishpatim': 'mishpatim',
  'Parashat Nasso': 'naso',
  'Parashat Nitzavim': 'nitzavim',
  'Parashat Nitzavim-Vayeilech': 'nitzavimVayelech',
  'Parashat Noach': 'noach',
  'Parashat Pekudei': 'pekudei',
  'Parashat Pinchas': 'pinchas',
  "Parashat Re'eh": 'reeh',
  "Parashat Sh'lach": 'shelach',
  'Parashat Shemot': 'shemot',
  'Parashat Shmini': 'shemini',
  'Parashat Shoftim': 'shoftim',
  'Parashat Tazria': 'tazria',
  'Parashat Tazria-Metzora': 'tazriaMetzora',
  'Parashat Terumah': 'terumah',
  'Parashat Tetzaveh': 'tetzaveh',
  'Parashat Toldot': 'toldot',
  'Parashat Tzav': 'tzav',
  'Parashat Vaera': 'vaera',
  'Parashat Vaetchanan': 'vaetchanan',
  'Parashat Vayakhel': 'vayakhel',
  'Parashat Vayakhel-Pekudei': 'vayakhelPekudei',
  'Parashat Vayechi': 'vayechi',
  'Parashat Vayeilech': 'vayelech',
  'Parashat Vayera': 'vayera',
  'Parashat Vayeshev': 'vayeshev',
  'Parashat Vayetzei': 'vayetze',
  'Parashat Vayigash': 'vayigash',
  'Parashat Vayikra': 'vayikra',
  'Parashat Vayishlach': 'vayishlach',
  'Parashat Yitro': 'yitro',
};

const SUKKOT: Draft = {
  portion: 'sukkot',
  torah: [
    ['leviticus', 23, 1, 23, 44],
    ['deuteronomy', 28, 1, 28, 6],
  ],
  haftarah: [['iKings', 8, 2, 8, 21]],
};

const SIMCHAT_TORAH: Draft = {
  portion: 'simchatTorah',
  torah: [
    ['deuteronomy', 33, 1, 34, 12],
    ['genesis', 1, 1, 2, 3],
    ['leviticus', 23, 33, 23, 38],
  ],
  haftarah: [['joshua', 1, 1, 1, 9]],
};

const PESACH_CHOL: Draft = {
  portion: 'pesachChol',
  torah: [
    ['exodus', 34, 1, 34, 26],
    ['deuteronomy', 10, 12, 10, 19],
  ],
  haftarah: [['ezekiel', 37, 1, 37, 14]],
};

const PESACH_FIRST: Draft = {
  portion: 'pesach',
  torah: [
    ['exodus', 12, 29, 12, 51],
    ['deuteronomy', 8, 10, 8, 18],
  ],
  haftarah: [
    ['iiKings', 23, 1, 23, 9],
    ['iiKings', 23, 21, 23, 23],
  ],
};

const PESACH_SEVENTH: Draft = {
  portion: 'pesach',
  torah: [
    ['exodus', 14, 5, 15, 19],
    ['deuteronomy', 4, 32, 4, 39],
  ],
  haftarah: [
    ['isaiah', 11, 1, 11, 10],
    ['isaiah', 12, 1, 12, 6],
  ],
};

const SHAVUOT: Draft = {
  portion: 'shavuot',
  torah: [
    ['deuteronomy', 5, 1, 5, 28],
    ['deuteronomy', 16, 9, 16, 12],
  ],
  haftarah: [['jeremiah', 31, 29, 31, 36]],
};

const ROSH_CHODESH_SCROLL: Ref = ['genesis', 1, 14, 1, 19];
const SHEKALIM_SCROLL: Ref = ['exodus', 30, 11, 30, 16];
const ZACHOR_SCROLL: Ref = ['deuteronomy', 25, 17, 25, 19];
const HACHODESH_SCROLL: Ref = ['exodus', 12, 1, 12, 20];
const SHUVA_HAFTARAH: Ref[] = [
  ['hosea', 14, 2, 14, 10],
  ['micah', 7, 18, 7, 20],
];

function localDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function columnFor(saturday: Date, portion: string): CycleColumn {
  const hebrew = new HDate(saturday);
  const year = portion === 'haazinu' ? hebrew.getFullYear() - 1 : hebrew.getFullYear();
  const index = ((year - 5786) % 3 + 3) % 3;
  return (['A', 'B', 'C'] as const)[index];
}

function sameRef(left: Ref, right: Ref): boolean {
  return left.every((part, index) => part === right[index]);
}

function withoutScroll(torah: Ref[], scroll: Ref): Ref[] {
  return torah.filter((span) => !sameRef(span, scroll));
}

function chanukahDay(saturday: Date): number {
  const hebrew = new HDate(saturday);
  const year = hebrew.getFullYear();
  const month = hebrew.getMonth();
  if (month === months.KISLEV && hebrew.getDate() >= 25) return hebrew.getDate() - 24;
  if (month !== months.TEVET || hebrew.getDate() > 6) return 0;
  const kislevDays = new HDate(1, months.TEVET, year).abs() - new HDate(1, months.KISLEV, year).abs();
  return hebrew.getDate() + kislevDays - 24;
}

function onOrAfter17Tammuz(saturday: Date): boolean {
  const hebrew = new HDate(saturday);
  return hebrew.abs() >= new HDate(17, months.TAMUZ, hebrew.getFullYear()).abs();
}

function nextDayIsRoshChodesh(saturday: Date): boolean {
  const next = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate() + 1, 12);
  return HebrewCalendar.calendar({ start: next, end: next, il: true }).some(
    (event) => (event.getFlags() & flags.ROSH_CHODESH) !== 0,
  );
}

function cloneSlice(portion: PortionId, column: CycleColumn): Draft | null {
  const slice = READING_CYCLE[portion]?.[column];
  if (!slice) return null;
  return {
    portion,
    torah: slice.torah.map((span) => [...span]),
    haftarah: slice.haftarah.map((span) => [...span]),
  };
}

function copyDraft(draft: Draft): Draft {
  return {
    portion: draft.portion,
    torah: draft.torah.map((span) => [...span]),
    haftarah: draft.haftarah.map((span) => [...span]),
  };
}

function festivalReading(descriptions: string[]): Draft | null {
  if (descriptions.some((desc) => desc.startsWith('Sukkot'))) return copyDraft(SUKKOT);
  if (descriptions.some((desc) => desc === 'Shmini Atzeret')) return copyDraft(SIMCHAT_TORAH);
  if (descriptions.some((desc) => desc === 'Pesach VII')) return copyDraft(PESACH_SEVENTH);
  if (descriptions.some((desc) => desc === 'Pesach I')) return copyDraft(PESACH_FIRST);
  if (descriptions.some((desc) => desc.startsWith('Pesach') && desc.includes("CH''M"))) return copyDraft(PESACH_CHOL);
  if (descriptions.some((desc) => desc === 'Shavuot')) return copyDraft(SHAVUOT);
  return null;
}

/**
 * The Levisson reading for a Saturday that is not already in the year sheet.
 * Column A, B, or C follows the Hebrew year, starting over at Bereshit.
 * Haazinu still belongs to the year that is ending.
 * Rosh Hashana and Yom Kippur have no row.
 */
export function readingFromCycle(iso: string): Draft | null {
  const saturday = localDate(iso);
  const events = HebrewCalendar.calendar({ start: saturday, end: saturday, il: true, sedrot: true });
  const descriptions = events.map((event) => event.getDesc());
  if (descriptions.some((desc) => desc === 'Yom Kippur' || /^Rosh Hashana( II| \d+)/.test(desc))) return null;
  const festival = festivalReading(descriptions);
  if (festival) return festival;
  const parsha = descriptions.find((desc) => desc.startsWith('Parashat '));
  const portion = parsha ? PARSHA[parsha] : undefined;
  if (!portion) return null;
  const draft = cloneSlice(portion, columnFor(saturday, portion));
  if (!draft) return null;

  const roshChodesh = events.some((event) => (event.getFlags() & flags.ROSH_CHODESH) !== 0);
  const shekalim = descriptions.includes('Shabbat Shekalim');
  const zachor = descriptions.includes('Shabbat Zachor');
  const parah = descriptions.includes('Shabbat Parah');
  const hachodesh = descriptions.includes('Shabbat HaChodesh');
  const hagadol = descriptions.includes('Shabbat HaGadol');
  const shuva = descriptions.includes('Shabbat Shuva');
  const chanukah = descriptions.some((desc) => desc.startsWith('Chanukah'));
  const specialHaftarah = shekalim || zachor || parah || hachodesh || hagadol || chanukah || shuva;

  if (portion === 'pinchas' && onOrAfter17Tammuz(saturday)) {
    draft.haftarah = [['jeremiah', 1, 1, 2, 3]];
  }
  if (!roshChodesh && !specialHaftarah && nextDayIsRoshChodesh(saturday)) {
    draft.haftarah = [['iSamuel', 20, 18, 20, 42]];
  }
  if (roshChodesh && !shekalim && !zachor && !parah && !hachodesh && !chanukah) {
    draft.torah = [...draft.torah, ROSH_CHODESH_SCROLL];
    draft.haftarah = [['isaiah', 66, 10, 66, 23]];
  }
  if (hagadol) draft.haftarah = [['malachi', 3, 4, 3, 24]];
  if (hachodesh) {
    draft.torah = [...withoutScroll(draft.torah, ROSH_CHODESH_SCROLL), HACHODESH_SCROLL];
    if (roshChodesh) draft.torah = [...draft.torah, ROSH_CHODESH_SCROLL];
    draft.haftarah = [['ezra', 7, 1, 7, 28]];
  }
  if (parah) {
    draft.torah = withoutScroll(draft.torah, ROSH_CHODESH_SCROLL);
    draft.haftarah = [['ezekiel', 36, 16, 36, 36]];
  }
  if (zachor) {
    draft.torah = [...withoutScroll(draft.torah, ROSH_CHODESH_SCROLL), ZACHOR_SCROLL];
    draft.haftarah = [['iSamuel', 15, 2, 15, 34]];
  }
  if (shekalim) {
    const base = withoutScroll(draft.torah, ROSH_CHODESH_SCROLL);
    draft.torah = roshChodesh ? [...base, ROSH_CHODESH_SCROLL, SHEKALIM_SCROLL] : [...base, SHEKALIM_SCROLL];
    draft.haftarah = [['iiKings', 12, 1, 12, 17]];
  }
  if (chanukah) {
    draft.torah = withoutScroll(draft.torah, ROSH_CHODESH_SCROLL);
    draft.haftarah = chanukahDay(saturday) >= 8 ? [['iKings', 7, 40, 7, 50]] : [['zechariah', 2, 14, 4, 7]];
  }
  if (portion === 'haazinu' && shuva) draft.haftarah = SHUVA_HAFTARAH;
  return draft;
}
