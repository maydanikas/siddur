/** The same spoken form the prayer player uses: the Name is read as Adonai. */
const DIVINE_NAME_FOR_TTS = /יְהוָה|יְהֹוָה|יהוה|יְיָ/g;

export const SPEECH_RATE = 0.5;

export function prepareTtsText(text: string): string {
  return text.replace(DIVINE_NAME_FOR_TTS, 'אֲדֹנָי');
}

export type SpeechPhrase = { text: string; wordStart: number; wordCount: number };

/** Short pieces of one reading, with the word index where each piece begins. */
export function readingSpeechPhrases(text: string, maxChars = 180): SpeechPhrase[] {
  const words = prepareTtsText(text).split(/\s+/).filter(Boolean);
  const phrases: SpeechPhrase[] = [];
  let chunk: string[] = [];
  let wordStart = 0;
  const flush = () => {
    if (chunk.length === 0) return;
    phrases.push({ text: chunk.join(' '), wordStart, wordCount: chunk.length });
    wordStart += chunk.length;
    chunk = [];
  };
  for (const word of words) {
    const next = chunk.length === 0 ? word : `${chunk.join(' ')} ${word}`;
    if (chunk.length > 0 && next.length > maxChars) flush();
    chunk.push(word);
  }
  flush();
  return phrases;
}

export function charIndexToWordIndex(text: string, charIndex: number): number {
  const words = text.split(/\s+/).filter(Boolean);
  let pos = 0;
  for (let i = 0; i < words.length; i++) {
    const start = text.indexOf(words[i], pos);
    if (start === -1) continue;
    const end = start + words[i].length;
    if (charIndex >= start && charIndex < end) return i;
    pos = end;
  }
  return Math.max(0, words.length - 1);
}

const PHRASE_CHAR_SECONDS = 0.085;

/**
 * Highlight clock for one phrase on Android, before and after the measured correction.
 * The prayer player does not divide this by the 0.50 speech rate: Android Hebrew does not
 * keep that rate, and dividing it leaves the highlight far behind the voice.
 */
export function androidPhraseSeconds(text: string, scale = 1): number {
  return Math.max(1, text.length * PHRASE_CHAR_SECONDS) * scale;
}

/** Whole-passage clock the prayer player uses on Android. */
export function androidPassageSeconds(text: string): number {
  const len = prepareTtsText(text).length;
  const stretch = Math.min(0.003, Math.max(0, len - 300) * 0.000004);
  return Math.max(4, Math.ceil(len * (PHRASE_CHAR_SECONDS + stretch)));
}

/** The next phrase's highlight speed, from how long the previous phrase actually took. */
export function nextHighlightScale(
  scale: number,
  measured: number,
  phraseText: string,
  actualSec: number,
): { scale: number; measured: number } {
  const base = Math.max(1, phraseText.length * PHRASE_CHAR_SECONDS);
  const ratio = Math.min(1.6, Math.max(0.6, actualSec / base));
  return {
    scale: measured === 0 ? ratio : scale * 0.55 + ratio * 0.45,
    measured: measured + 1,
  };
}

/** Which word of this phrase is due at `elapsedSec`, by word length. */
export function wordIndexAtElapsed(text: string, elapsedSec: number, durationSec: number): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const weights = words.map((word) => Math.max(1, word.length));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const target = Math.max(0, Math.min(durationSec, elapsedSec)) / Math.max(durationSec, 0.001) * total;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (target < cumulative) return i;
  }
  return words.length - 1;
}
