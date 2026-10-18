import { transliterateHebrew } from './transliterate.ts';

export type PassageVerse = { chapter: number; verse: number; hebrew: string };

export type SefariaHebrewPayload = {
  he?: unknown;
  sections?: number[];
  toSections?: number[];
};

const KETIV = /<span class="mam-kq-k">[\s\S]*?<\/span>/g;
const TAG = /<[^>]+>/g;
const ENTITY = /&(#x[0-9a-fA-F]+|#\d+|[a-z]+);/g;
const MARKS = /[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3-\u05C6]/g;

const NAMED_ENTITY: Record<string, string> = {
  thinsp: ' ',
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
};

/** Qere, without ketiv, cantillation, or markup. Nikud stays. */
export function cleanMasoreticHtml(html: string): string {
  return html
    .replace(KETIV, '')
    .replace(TAG, '')
    .replace(ENTITY, (all, entity: string) => {
      if (entity[0] !== '#') return NAMED_ENTITY[entity] ?? all;
      const code = entity[1] === 'x' || entity[1] === 'X' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    })
    .replace(/[[\]()]/g, '')
    .replace(MARKS, '')
    .replace(/\{[פס]\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pushVerses(out: PassageVerse[], verses: unknown[], chapter: number, verseStart: number) {
  verses.forEach((verse, index) => {
    if (typeof verse !== 'string') return;
    const hebrew = cleanMasoreticHtml(verse);
    if (hebrew) out.push({ chapter, verse: verseStart + index, hebrew });
  });
}

/** Verses of one Sefaria range, including a range that crosses a chapter. */
export function parseSefariaVerses(payload: SefariaHebrewPayload): PassageVerse[] {
  const chapter = payload.sections?.[0] ?? 1;
  const verse = payload.sections?.[1] ?? 1;
  const he = payload.he;
  const out: PassageVerse[] = [];
  if (typeof he === 'string') {
    pushVerses(out, [he], chapter, verse);
    return out;
  }
  if (!Array.isArray(he) || he.length === 0) return [];
  if (typeof he[0] === 'string') {
    pushVerses(out, he, chapter, verse);
    return out;
  }
  he.forEach((chapterVerses, offset) => {
    if (!Array.isArray(chapterVerses)) return;
    pushVerses(out, chapterVerses, chapter + offset, offset === 0 ? verse : 1);
  });
  return out;
}

export function passageHebrew(verses: PassageVerse[]): string {
  return verses.map((verse) => verse.hebrew).join('\n');
}

export type ReadingTranslationLang = 'en' | 'fr';

export type PassageTranslation = { text: string; credit: string };

const TRANSLATION_VERSION: Record<ReadingTranslationLang, { title: string; marker: string; credit: string }> = {
  en: {
    title: 'The Holy Scriptures: A New Translation (JPS 1917)',
    marker: '1917',
    credit: 'The Holy Scriptures: A New Translation (JPS 1917) · Public Domain',
  },
  fr: {
    title: 'Bible du Rabbinat 1899 [fr]',
    marker: 'Rabbinat',
    credit: 'Bible du Rabbinat 1899 · Public Domain',
  },
};

export function cleanTranslationText(value: string): string {
  return value
    .replace(TAG, '')
    .replace(ENTITY, (all, entity: string) => {
      if (entity[0] !== '#') return NAMED_ENTITY[entity] ?? all;
      const code = entity[1] === 'x' || entity[1] === 'X' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

export function translationVerses(value: unknown): string {
  if (typeof value === 'string') return cleanTranslationText(value);
  if (!Array.isArray(value)) return '';
  return value
    .map((part) => translationVerses(part))
    .filter(Boolean)
    .join('\n');
}

async function loadTranslation(ref: string, lang: ReadingTranslationLang, signal: AbortSignal): Promise<PassageTranslation | null> {
  const version = TRANSLATION_VERSION[lang];
  const response = await fetch(
    `https://www.sefaria.org/api/texts/${ref}?commentary=0&context=0&ven=${encodeURIComponent(version.title)}`,
    { signal },
  );
  if (!response.ok) return null;
  const payload = (await response.json()) as { text?: unknown; versionTitle?: string };
  if (!payload.versionTitle?.includes(version.marker)) return null;
  const text = translationVerses(payload.text);
  return text ? { text, credit: version.credit } : null;
}

export async function loadSefariaPassage(
  ref: string,
  signal?: AbortSignal,
): Promise<{ verses: PassageVerse[]; transliteration: string; translations: Partial<Record<ReadingTranslationLang, PassageTranslation>> }> {
  const response = await fetch(`https://www.sefaria.org/api/texts/${ref}?commentary=0&context=0`, { signal });
  if (!response.ok) throw new Error(`Sefaria ${response.status}`);
  const payload = (await response.json()) as SefariaHebrewPayload;
  const verses = parseSefariaVerses(payload);
  if (verses.length === 0) throw new Error('Sefaria returned no verses');
  const [en, fr] = await Promise.all([
    loadTranslation(ref, 'en', signal ?? new AbortController().signal).catch(() => null),
    loadTranslation(ref, 'fr', signal ?? new AbortController().signal).catch(() => null),
  ]);
  const translations: Partial<Record<ReadingTranslationLang, PassageTranslation>> = {};
  if (en) translations.en = en;
  if (fr) translations.fr = fr;
  return { verses, transliteration: transliterateHebrew(passageHebrew(verses).replace(/\n/g, ' ')), translations };
}
