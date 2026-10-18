import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  androidPassageSeconds,
  androidPhraseSeconds,
  charIndexToWordIndex,
  nextHighlightScale,
  readingSpeechPhrases,
  speechPhrases,
  usesPhrasePlayback,
  wordIndexAtElapsed,
} from './hebrewSpeech.ts';

test('a long reading is split without losing a word', () => {
  const words = Array.from({ length: 40 }, (_, index) => `w${index}`);
  const phrases = readingSpeechPhrases(words.join(' '), 20);
  assert.equal(phrases.map((phrase) => phrase.wordCount).reduce((sum, count) => sum + count, 0), 40);
  assert.equal(phrases[0].wordStart, 0);
  assert.equal(phrases[1].wordStart, phrases[0].wordCount);
  assert.equal(phrases.every((phrase) => phrase.text.length <= 20 || phrase.wordCount === 1), true);
});

test('a boundary inside the second word selects that word', () => {
  assert.equal(charIndexToWordIndex('aa bb ccc', 4), 1);
  assert.equal(wordIndexAtElapsed('aa bbbb', 0, 4), 0);
  assert.equal(wordIndexAtElapsed('aa bbbb', 3.9, 4), 1);
});

test('android highlight uses the prayer clock and then corrects the next phrase', () => {
  const phrase = 'א'.repeat(100);
  assert.equal(androidPhraseSeconds(phrase, 1), 8.5);
  assert.equal(androidPassageSeconds(phrase) < Math.ceil((phrase.length * 0.085) / 0.5), true);
  assert.equal(nextHighlightScale(1, 0, phrase, 4.25).scale, 0.6);
  assert.equal(nextHighlightScale(1, 0, phrase, 20).scale, 1.6);
  const corrected = nextHighlightScale(0.6, 1, phrase, 4.25);
  assert.equal(corrected.measured, 2);
  assert.equal(Math.abs(corrected.scale - 0.6) < 1e-9, true);
});

test('a prayer on a computer is one utterance, and a long passage is split like Android', () => {
  assert.equal(usesPhrasePlayback('א'.repeat(100), false), false);
  assert.equal(usesPhrasePlayback('א'.repeat(100), true), true);
  assert.equal(usesPhrasePlayback('א'.repeat(1501), false), true);
  const phrases = speechPhrases(`${'א '.repeat(80)}סוף. ${'ב '.repeat(80)}סוף`);
  assert.equal(phrases.length >= 2, true);
  assert.equal(phrases[0].text.endsWith('סוף.'), true);
  assert.equal(phrases.map((phrase) => phrase.wordCount).reduce((sum, count) => sum + count, 0), 162);
});

test('replacing the Name keeps one word, so the highlight stays on that word', () => {
  const phrases = readingSpeechPhrases('וַיֹּאמֶר יְהוָה אֶל־אַבְרָם', 180);
  assert.equal(phrases.length, 1);
  assert.equal(phrases[0].wordCount, 3);
  assert.equal(phrases[0].wordStart, 0);
  assert.match(phrases[0].text, /^וַיֹּאמֶר אֲדֹנָי /);
  assert.equal(charIndexToWordIndex(phrases[0].text, phrases[0].text.indexOf('אֲדֹנָי')), 1);
});
