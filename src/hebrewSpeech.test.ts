import assert from 'node:assert/strict';
import { test } from 'node:test';
import { charIndexToWordIndex, readingSpeechPhrases, wordIndexAtElapsed } from './hebrewSpeech.ts';

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

test('replacing the Name keeps one word, so the highlight stays on that word', () => {
  const phrases = readingSpeechPhrases('וַיֹּאמֶר יְהוָה אֶל־אַבְרָם', 180);
  assert.equal(phrases.length, 1);
  assert.equal(phrases[0].wordCount, 3);
  assert.equal(phrases[0].wordStart, 0);
  assert.match(phrases[0].text, /^וַיֹּאמֶר אֲדֹנָי /);
  assert.equal(charIndexToWordIndex(phrases[0].text, phrases[0].text.indexOf('אֲדֹנָי')), 1);
});
