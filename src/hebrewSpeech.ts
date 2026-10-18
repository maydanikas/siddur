/** The same spoken form the prayer player uses: the Name is read as Adonai. */
const DIVINE_NAME_FOR_TTS = /יְהוָה|יְהֹוָה|יהוה|יְיָ/g;

export const SPEECH_RATE = 0.5;

export function prepareTtsText(text: string): string {
  return text.replace(DIVINE_NAME_FOR_TTS, 'אֲדֹנָי');
}

export type SpeechPhrase = { text: string; wordStart: number; wordCount: number };

/** The mark on the word that is being spoken. Prayers and readings both use it. */
export const SPOKEN_WORD_CLASS = 'bg-teal-200/90 ring-1 ring-teal-400/70';

export const IDLE_WORD_CLASS = 'cursor-pointer hover:bg-teal-50/80 active:bg-teal-100';

/**
 * A computer can speak a whole prayer in one utterance. Anything longer than the
 * longest prayer, and every Android playback, is split into the same phrases.
 */
export const SINGLE_UTTERANCE_CHARS = 1500;

export function usesPhrasePlayback(text: string, android: boolean): boolean {
  return android || prepareTtsText(text).length > SINGLE_UTTERANCE_CHARS;
}

/** Sentences, then pieces short enough that Android does not drop them. */
export function speechPhrases(text: string, maxChars = 180): SpeechPhrase[] {
  const words = prepareTtsText(text).split(/\s+/).filter(Boolean);
  const sentences: SpeechPhrase[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk: string[] = [];
    const wordStart = i;
    while (i < words.length) {
      chunk.push(words[i]);
      i++;
      if (/[.!?]$/.test(chunk[chunk.length - 1])) break;
    }
    if (chunk.length > 0) sentences.push({ text: chunk.join(' '), wordStart, wordCount: chunk.length });
  }

  const limited: SpeechPhrase[] = [];
  for (const phrase of sentences) {
    if (phrase.text.length <= maxChars) {
      limited.push(phrase);
      continue;
    }
    const phraseWords = phrase.text.split(/\s+/).filter(Boolean);
    let chunk: string[] = [];
    let wordStart = phrase.wordStart;
    const flush = () => {
      if (chunk.length === 0) return;
      limited.push({ text: chunk.join(' '), wordStart, wordCount: chunk.length });
      wordStart += chunk.length;
      chunk = [];
    };
    for (const word of phraseWords) {
      const next = chunk.length === 0 ? word : `${chunk.join(' ')} ${word}`;
      if (chunk.length > 0 && next.length > maxChars) flush();
      chunk.push(word);
    }
    flush();
  }
  return limited;
}

export function speechDurationSeconds(text: string, android: boolean, rate = SPEECH_RATE): number {
  if (!android) {
    return Math.max(4, Math.ceil((prepareTtsText(text).length * PHRASE_CHAR_SECONDS) / rate));
  }
  return androidPassageSeconds(text);
}

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
