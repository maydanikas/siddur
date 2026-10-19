import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DRAFT_VERSE_COUNT, draftLine } from './readingDraft.ts';

test('the first packet holds every prepared verse and leaves the next portion empty', () => {
  assert.equal(DRAFT_VERSE_COUNT, 617);
  const first = draftLine('Genesis.14.1-15.21', 14, 1);
  assert.equal(first?.ru.startsWith('В дни Амрафеля'), true);
  assert.equal(first?.nl.startsWith('In de dagen van Amrafel'), true);
  assert.equal(first?.note, '');
  assert.equal(draftLine('Exodus.3.1-4.17', 3, 1), null);
  assert.equal(draftLine('Amos.2.6-3.8', 2, 6), null);
});

test('a gap stays two spans, and a verse outside either span has no draft', () => {
  assert.notEqual(draftLine('Genesis.49.1-33', 49, 1), null);
  assert.notEqual(draftLine('Genesis.49.1-33', 49, 33), null);
  assert.equal(draftLine('Genesis.50.22-26', 50, 1), null);
  assert.notEqual(draftLine('Genesis.50.22-26', 50, 22), null);
  assert.notEqual(draftLine('Genesis.50.22-26', 50, 26), null);
});

test('the draft follows the Hebrew where the published translations add a word', () => {
  const dish = draftLine('Numbers.7.54-7.59', 7, 55);
  assert.equal(dish?.ru.includes('вес его сто тридцать,'), true);
  assert.equal(dish?.ru.includes('сто тридцать шекел'), false);
  assert.equal(dish?.note.includes('шекель'), true);
  assert.equal(draftLine('Genesis.16.1-16.16', 16, 1), null);
  const blessing = draftLine('Genesis.49.1-33', 49, 10);
  assert.equal(blessing?.ru.includes('пока не придёт Шило'), true);
  assert.equal(blessing?.nl.includes('totdat Sjilo komt'), true);
  assert.equal(blessing?.note.includes('Pacifique'), true);
});

test('the Chanukah scroll and the haftarah use their own books', () => {
  assert.equal(draftLine('Numbers.7.54-7.59', 7, 53), null);
  assert.notEqual(draftLine('Numbers.7.54-7.59', 7, 54), null);
  assert.notEqual(draftLine('Numbers.7.54-7.59', 7, 59), null);
  assert.equal(draftLine('Numbers.7.54-7.59', 7, 60), null);
  assert.equal(draftLine('I_Kings.7.40-50', 7, 39), null);
  assert.notEqual(draftLine('I_Kings.7.40-50', 7, 40), null);
  assert.notEqual(draftLine('I_Kings.7.40-50', 7, 50), null);
  assert.equal(draftLine('I_Kings.7.40-50', 7, 51), null);
  assert.equal(draftLine('Zechariah.2.14-4.7', 3, 2)?.ru.includes('обвинител'), true);
  assert.equal(draftLine('Isaiah.38.9-38.20', 38, 11)?.ru.includes('Господа, Господа'), true);
});
