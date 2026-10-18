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

export async function loadSefariaPassage(ref: string): Promise<{ verses: PassageVerse[]; transliteration: string }> {
  const response = await fetch(`https://www.sefaria.org/api/texts/${ref}?commentary=0&context=0`);
  if (!response.ok) throw new Error(`Sefaria ${response.status}`);
  const payload = (await response.json()) as SefariaHebrewPayload;
  const verses = parseSefariaVerses(payload);
  if (verses.length === 0) throw new Error('Sefaria returned no verses');
  return { verses, transliteration: transliterateHebrew(passageHebrew(verses).replace(/\n/g, ' ')) };
}
