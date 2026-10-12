import type { JewishDay, YaalehVeyavo } from './jewishCalendar';

export type SeasonedPrayer = {
  id: number;
  he_display: string;
  he_tts: string;
  translit: string;
  ru: string;
  nl: string;
  en: string;
  fr: string;
};

const SEASONAL_IDS = new Set([44, 45, 46, 48, 49, 50]);

const YAALEH_INDEX: Record<Exclude<YaalehVeyavo, null>, 0 | 1 | 2> = {
  roshChodesh: 0,
  pesach: 1,
  sukkot: 2,
};

const HE_YAALEH_TTS = 'בְּיוֹם רֹאשׁ הַחֹדֶשׁ הַזֶּה. חַג הַמַּצּוֹת הַזֶּה. חַג הַסֻּכּוֹת הַזֶּה.';
const HE_YAALEH_ONE = [
  'בְּיוֹם רֹאשׁ הַחֹדֶשׁ הַזֶּה.',
  'חַג הַמַּצּוֹת הַזֶּה.',
  'חַג הַסֻּכּוֹת הַזֶּה.',
];
const LAT_YAALEH = 'beyom Rosh HaChodesh haze. Chag HaMatzot haze. Chag HaSukkot haze.';
const LAT_YAALEH_ONE = ['beyom Rosh HaChodesh haze.', 'Chag HaMatzot haze.', 'Chag HaSukkot haze.'];

const NOTE = '[.]';

type NoteLang = 'ru' | 'nl' | 'en' | 'fr';

const PERIOD_NOTE: Record<string, Record<NoteLang, string>> = {
  winter: {
    ru: '[читается с Симхат Тора по канун Песаха]',
    en: '[Read from Simchat Torah through the eve of Pesach]',
    nl: '[Gelezen van Simchat Tora tot en met de vooravond van Pesach]',
    fr: '[Lu de Simhat Torah à la veille de Pessa\'h]',
  },
  noraim: {
    ru: '[читается с Рош ха-Шана по Йом Кипур]',
    en: '[Read from Rosh HaShana through Yom Kippur]',
    nl: '[Gelezen van Rosj Hasjana tot en met Jom Kipoer]',
    fr: '[Lu de Roch Hachana jusqu\'à Kippour inclus]',
  },
  roshChodesh: {
    ru: '[читается в Рош ходеш]',
    en: '[Read on Rosh Chodesh]',
    nl: '[Gelezen op Rosj Chodesj]',
    fr: '[Lu à Roch Hodech]',
  },
  pesach: {
    ru: '[читается в хол ха-моэд Песаха]',
    en: '[Read on Chol HaMoed Pesach]',
    nl: '[Gelezen op Chol HaMoëed Pesach]',
    fr: '[Lu à Hol HaMoed de Pessa\'h]',
  },
  sukkot: {
    ru: '[читается в хол ха-моэд Суккот]',
    en: '[Read on Chol HaMoed Sukkot]',
    nl: '[Gelezen op Chol HaMoëed Soekot]',
    fr: '[Lu à Hol HaMoed de Soukkot]',
  },
};

function periodNote(kind: BracketKind, day: JewishDay, lang: NoteLang): string {
  if (kind === 'winter') return PERIOD_NOTE.winter[lang];
  if (kind === 'noraim' || kind === 'replace') return PERIOD_NOTE.noraim[lang];
  if (kind === 'yaaleh' && day.yaalehVeyavo) return PERIOD_NOTE[day.yaalehVeyavo][lang];
  return '';
}

const EL_HAKADOSH = 'בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.';
const MELECH_HAKADOSH = 'בָּרוּךְ אַתָּה יְיָ, הַמֶּלֶךְ הַקָּדוֹשׁ.';
const HAMVARECH = 'בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת-עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם.';
const OSEH_SHALOM = 'בָּרוּךְ אַתָּה יְיָ, עוֹשֵׂה הַשָּׁלוֹם.';

function isInstructionLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('[') && trimmed.endsWith(']');
}

type BracketKind = 'keep' | 'winter' | 'noraim' | 'yaaleh' | 'replace';

function bracketKind(inner: string): BracketKind {
  const s = inner.toLowerCase();
  if (/alternative seasonal|альтернативн|alternatieve seizoen|clôture saisonnière|seasonal replacement|сезонная замена|seizoensvervanging|remplacement saisonnier|replace last words/.test(s)) {
    return 'replace';
  }
  if (/yaale|яале|ja'aleh|yaalé|rosh chodesh|rosj chodesj|rosj hachodesj|roch hodech|chol hamoed|хол|холь/.test(s)) {
    return 'yaaleh';
  }
  if ((/winter|зимн|hiver|simchat|sim'hat|симхат|песах|pesach|pessa/.test(s)) && (/insert|вставк|invoeg|insertion/.test(s))) {
    return 'winter';
  }
  if (/rosh hashan|rosj hasjan|roch hachan|рош а-шана|рош ха-шана|yamim noraim|ямим нораим|yom kippur|jom kipoer|йом кипур|kippour/.test(s)) {
    return 'noraim';
  }
  return 'keep';
}

function shows(kind: BracketKind, day: JewishDay): boolean {
  if (kind === 'winter') return day.mashivHaruach;
  if (kind === 'noraim') return day.yamimNoraim;
  if (kind === 'yaaleh') return day.yaalehVeyavo !== null;
  return false;
}

function innerAfterColon(bracket: string): string {
  const inner = bracket.slice(1, -1);
  const match = inner.match(/^[^:]+:\s*([\s\S]*)$/);
  return (match?.[1] ?? inner).trim();
}

/** The slash list is one occasion. Keep the phrase that belongs to today. */
function pickYaalehClause(text: string, index: 0 | 1 | 2): string {
  const slash = text.indexOf(' / ');
  if (slash < 0) return text;
  const second = text.indexOf(' / ', slash + 3);
  if (second < 0) return text;
  const comma = text.lastIndexOf(',', slash);
  const start = comma >= 0 ? comma + 1 : 0;
  const period = text.indexOf('.', second);
  const end = period >= 0 ? period : text.length;
  const choices = [
    text.slice(start, slash).trim(),
    text.slice(slash + 3, second).trim(),
    text.slice(second + 3, end).trim(),
  ];
  const chosen = choices[index];
  let suffix = period >= 0 ? text.slice(period) : '';
  if (chosen.endsWith('.') && suffix.startsWith('.')) suffix = suffix.slice(1);
  const gap = start > 0 && text[start - 1] === ',' ? ' ' : '';
  return `${text.slice(0, start)}${gap}${chosen}${suffix}`;
}

function omitBetween(text: string, start: string, endExclusive: string): string {
  const at = text.indexOf(start);
  if (at < 0) return text;
  const end = text.indexOf(endExclusive, at + start.length);
  if (end < 0) return text;
  return text.slice(0, at) + text.slice(end);
}

function omitSentence(text: string, sentence: string): string {
  return text.split(sentence).join('');
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([.,])/g, '$1')
    .trim();
}

function displayFor(id: number, text: string, day: JewishDay): string {
  const out: string[] = [];
  let skip = 0;
  let trimUchtov = false;
  let noteNext = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (skip > 0 && !isInstructionLine(line)) {
      skip -= 1;
      continue;
    }
    if (isInstructionLine(line)) {
      const kind = bracketKind(line.slice(1, -1));
      if (kind === 'keep') {
        out.push(line);
        continue;
      }
      if (kind === 'replace') {
        if (/replace last words/i.test(line)) skip = 1;
        continue;
      }
      if (!shows(kind, day) && id === 49 && kind === 'noraim') {
        trimUchtov = true;
        continue;
      }
      if (!shows(kind, day)) {
        skip = kind === 'yaaleh' ? 2 : 1;
        continue;
      }
      noteNext = true;
      continue;
    }
    let next = line;
    if (trimUchtov) {
      trimUchtov = false;
      const at = next.indexOf('וְכֹל הַחַיִּים');
      if (at >= 0) next = next.slice(at);
    }
    if (id === 46 && day.yamimNoraim) {
      next = next.replace('הָאֵל הַקָּדוֹשׁ', 'הַמֶּלֶךְ הַקָּדוֹשׁ');
      const blessingAt = next.lastIndexOf('בָּרוּךְ אַתָּה');
      if (blessingAt > 0) {
        out.push(next.slice(0, blessingAt).trim());
        out.push(NOTE);
        out.push(next.slice(blessingAt).trim());
        continue;
      }
    }
    if (id === 48 && day.yaalehVeyavo) next = pickYaalehClause(next, YAALEH_INDEX[day.yaalehVeyavo]);
    if (id === 50 && day.yamimNoraim && next.includes('הַמְבָרֵךְ')) next = OSEH_SHALOM;
    if (noteNext) {
      out.push(NOTE);
      noteNext = false;
    }
    out.push(next);
  }
  return out.join('\n');
}

function spokenHebrew(id: number, text: string, day: JewishDay): string {
  let next = text;
  if (!day.yamimNoraim) {
    next = omitBetween(next, 'זָכְרֵנוּ לְחַיִּים', 'מֶלֶךְ עוֹזֵר');
    next = omitBetween(next, 'מִי כָמוֹךָ אַב הָרַחֲמִים', 'וְנֶאֱמָן');
    next = omitSentence(next, `${MELECH_HAKADOSH} `).split(MELECH_HAKADOSH).join('');
    next = omitBetween(next, 'וּכְתוֹב לְחַיִּים', 'וְכֹל הַחַיִּים');
    next = omitBetween(next, 'בְּסֵפֶר חַיִּים', 'בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ');
    next = omitSentence(next, `${OSEH_SHALOM} `).split(OSEH_SHALOM).join('');
  } else {
    next = omitSentence(next, `${EL_HAKADOSH} `).split(EL_HAKADOSH).join('');
    next = omitSentence(next, `${HAMVARECH} `).split(HAMVARECH).join('');
  }
  if (!day.mashivHaruach) next = omitSentence(next, 'מַשִּׁיב הָרוּחַ וּמוֹרִיד הַגָּשֶׁם. ');
  if (id === 48 || next.includes('יַעֲלֶה')) {
    if (!day.yaalehVeyavo) {
      next = omitBetween(next, 'אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, יַעֲלֶה', 'וְתֶחֱזֶינָה');
    } else {
      next = next.replace(HE_YAALEH_TTS, HE_YAALEH_ONE[YAALEH_INDEX[day.yaalehVeyavo]]);
    }
  }
  return tidy(next);
}

function spokenTranslit(text: string, day: JewishDay): string {
  let next = text;
  if (!day.yamimNoraim) {
    next = omitBetween(next, 'Zochrenu lechayim', 'Melech ozer');
    next = omitBetween(next, 'Mi chamocha Av harachamim', "Vene'eman");
    next = omitSentence(next, "Baruch atah Adonai, HaMelech hakadosh.");
    next = omitBetween(next, 'Uchtov lechayim', 'Vechol hachayim');
    next = omitBetween(next, 'Besefer chayim', 'Baruch atah Adonai, hamvarech');
    next = omitSentence(next, 'Baruch atah Adonai, oseh hashalom.');
  } else {
    next = omitSentence(next, "Baruch atah Adonai, Ha'El hakadosh.");
    next = omitSentence(next, 'Baruch atah Adonai, hamvarech et-amo Yisrael bashalom.');
  }
  if (!day.mashivHaruach) next = omitSentence(next, 'Mashiv haruach umorid hagashem. ');
  if (next.includes("ya'aleh")) {
    if (!day.yaalehVeyavo) {
      next = omitBetween(next, "Eloheinu ve'Elohei avoteinu, ya'aleh", 'Vetechezenah');
    } else {
      next = next.replace(LAT_YAALEH, LAT_YAALEH_ONE[YAALEH_INDEX[day.yaalehVeyavo]]);
    }
  }
  return tidy(next);
}

function applyReplacementMarkers(text: string): string {
  return text.replace(/[^.!?\n]*[.!?]\s*\u0000([\s\S]*?)\u0001/g, '$1');
}

function translationFor(text: string, day: JewishDay, lang: NoteLang, id: number): string {
  const replaced = text.replace(/\[[^\]]+\]/g, (bracket) => {
    const kind = bracketKind(bracket.slice(1, -1));
    if (kind === 'keep') return bracket;
    const note = periodNote(kind, day, lang);
    if (kind === 'replace') {
      if (!day.yamimNoraim) return '';
      const closing = innerAfterColon(bracket);
      return id === 50 ? `\u0000${closing}\u0001` : `\u0000${note} ${closing}\u0001`;
    }
    if (!shows(kind, day)) return '';
    const inner = kind === 'yaaleh' && day.yaalehVeyavo
      ? pickYaalehClause(innerAfterColon(bracket), YAALEH_INDEX[day.yaalehVeyavo])
      : innerAfterColon(bracket);
    return `${note} ${inner}`;
  });
  return tidy(applyReplacementMarkers(replaced));
}

export function applySeason<T extends SeasonedPrayer>(prayer: T, day: JewishDay): T {
  if (!SEASONAL_IDS.has(prayer.id)) return prayer;
  return {
    ...prayer,
    he_display: displayFor(prayer.id, prayer.he_display, day),
    he_tts: spokenHebrew(prayer.id, prayer.he_tts, day),
    translit: spokenTranslit(prayer.translit, day),
    ru: translationFor(prayer.ru, day, 'ru', prayer.id),
    nl: translationFor(prayer.nl, day, 'nl', prayer.id),
    en: translationFor(prayer.en, day, 'en', prayer.id),
    fr: translationFor(prayer.fr, day, 'fr', prayer.id),
  };
}
