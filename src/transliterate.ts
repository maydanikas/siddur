/**
 * A reading-aid transliteration of vocalized Hebrew.
 * The divine name is written Adonai. This is not a translation.
 */

type Glyph = { letter: string; points: string };

const LETTER = /[\u05D0-\u05EA]/;
const VOWEL = /[\u05B0-\u05BB]/;

function glyphsOf(word: string): Glyph[] {
  const glyphs: Glyph[] = [];
  for (const ch of word) {
    if (LETTER.test(ch)) glyphs.push({ letter: ch, points: '' });
    else if (glyphs.length > 0) glyphs[glyphs.length - 1].points += ch;
  }
  return glyphs;
}

function hasVowel(points: string): boolean {
  return VOWEL.test(points);
}

function shevaOnly(points: string): boolean {
  return points.replace(/[^\u05B0-\u05BB]/g, '') === '\u05B0';
}

function vocalSheva(index: number, glyphs: Glyph[]): boolean {
  if (index === 0) return true;
  if (glyphs[index].points.includes('\u05BC')) return true;
  return glyphs[index - 1].points.includes('\u05B0');
}

function qamats(index: number, glyphs: Glyph[]): string {
  const next = glyphs[index + 1];
  if (!next) return 'a';
  if (shevaOnly(next.points) && !vocalSheva(index + 1, glyphs)) return 'o';
  return 'a';
}

function vowelOf(glyph: Glyph, index: number, glyphs: Glyph[]): string {
  const points = glyph.points;
  if (glyph.letter === 'ו' && points.includes('\u05BC') && !/[\u05B1-\u05BB]/.test(points)) return 'u';
  if (points.includes('\u05B1')) return 'e';
  if (points.includes('\u05B2')) return 'a';
  if (points.includes('\u05B3')) return 'o';
  if (points.includes('\u05B4')) return 'i';
  if (points.includes('\u05B5')) return 'e';
  if (points.includes('\u05B6')) return 'e';
  if (points.includes('\u05B7')) return 'a';
  if (points.includes('\u05B8')) return qamats(index, glyphs);
  if (points.includes('\u05B9') || points.includes('\u05BA')) return 'o';
  if (points.includes('\u05BB')) return 'u';
  if (points.includes('\u05B0')) return vocalSheva(index, glyphs) ? 'e' : '';
  return '';
}

function consonantOf(glyph: Glyph, index: number, glyphs: Glyph[]): string {
  const dagesh = glyph.points.includes('\u05BC');
  if (glyph.letter === 'ו') {
    if (glyph.points.includes('\u05B9') || glyph.points.includes('\u05BA')) return '';
    if (dagesh && !/[\u05B1-\u05BB]/.test(glyph.points)) return '';
    const prev = glyphs[index - 1];
    if (prev && (prev.points.includes('\u05B9') || prev.points.includes('\u05BA')) && !hasVowel(glyph.points)) return '';
    return 'v';
  }
  if (glyph.letter === 'י') {
    const prev = glyphs[index - 1];
    if (prev && (prev.points.includes('\u05B4') || prev.points.includes('\u05B5')) && !hasVowel(glyph.points)) return '';
    return 'y';
  }
  switch (glyph.letter) {
    case 'א':
    case 'ע':
      return '';
    case 'ב':
      return dagesh ? 'b' : 'v';
    case 'ג':
      return 'g';
    case 'ד':
      return 'd';
    case 'ה':
      return 'h';
    case 'ז':
      return 'z';
    case 'ח':
      return 'ch';
    case 'ט':
      return 't';
    case 'כ':
    case 'ך':
      return dagesh ? 'k' : 'ch';
    case 'ל':
      return 'l';
    case 'מ':
    case 'ם':
      return 'm';
    case 'נ':
    case 'ן':
      return 'n';
    case 'ס':
      return 's';
    case 'פ':
    case 'ף':
      return dagesh ? 'p' : 'f';
    case 'צ':
    case 'ץ':
      return 'tz';
    case 'ק':
      return 'k';
    case 'ר':
      return 'r';
    case 'ש':
      return glyph.points.includes('\u05C2') ? 's' : 'sh';
    case 'ת':
      return 't';
    default:
      return '';
  }
}

function transliterateGlyphs(glyphs: Glyph[]): string {
  let text = '';
  let lastWasVowel = false;
  glyphs.forEach((glyph, index) => {
    const vow = vowelOf(glyph, index, glyphs);
    if ((glyph.letter === 'א' || glyph.letter === 'ע') && vow && lastWasVowel) text += "'";
    text += consonantOf(glyph, index, glyphs) + vow;
    lastWasVowel = vow.length > 0;
  });
  return text;
}

function transliterateWord(word: string): string {
  const glyphs = glyphsOf(word);
  if (glyphs.length === 0) return '';
  const letters = glyphs.map((glyph) => glyph.letter).join('');
  if (letters === 'כל' && glyphs[0].points.includes('\u05B8')) return 'kol';
  if (letters === 'יהוה' || letters === 'יי') return 'Adonai';
  if (letters.endsWith('יהוה') && letters.length > 4) {
    const prefix = transliterateGlyphs(glyphs.slice(0, -4));
    const glue = /[aeiou]$/.test(prefix) ? "'" : '';
    return `${prefix}${glue}Adonai`;
  }
  return transliterateGlyphs(glyphs);
}

/** Latin reading aid for one vocalized Hebrew passage. */
export function transliterateHebrew(hebrew: string): string {
  const words = hebrew
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.split('\u05BE').map(transliterateWord).filter(Boolean).join('-'));
  const line = words.filter(Boolean).join(' ');
  return line.replace(/[a-z]/, (letter) => letter.toUpperCase());
}
