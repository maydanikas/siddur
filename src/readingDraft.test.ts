import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DRAFT_VERSE_COUNT, draftLine } from './readingDraft.ts';

test('the prepared draft holds both packets and leaves the next portion empty', () => {
  assert.equal(DRAFT_VERSE_COUNT, 1767);
  assert.equal(draftLine('Deuteronomy.32.1-52', 32, 1)?.ru.startsWith('Внимайте, небеса'), true);
  assert.equal(draftLine('Deuteronomy.32.1-52', 32, 1)?.nl.startsWith('Luister, hemel'), true);
  assert.equal(draftLine('Deuteronomy.32.1-52', 32, 49)?.ru.includes('напротив Йерихо'), true);
  assert.equal(draftLine('Deuteronomy.32.1-52', 32, 52)?.nl.endsWith('niet binnengaan.’'), true);
  assert.equal(draftLine('II_Samuel.22.1-51', 22, 51)?.ru.endsWith('навеки».'), true);
  assert.equal(draftLine('II_Samuel.22.1-51', 22, 51)?.nl.endsWith('voor altijd.’'), true);
  const first = draftLine('Genesis.14.1-15.21', 14, 1);
  assert.equal(first?.ru.startsWith('В дни Амрафеля'), true);
  assert.equal(first?.nl.startsWith('In de dagen van Amrafel'), true);
  assert.equal(first?.note, '');
  const bush = draftLine('Exodus.3.1-4.17', 3, 2);
  assert.equal(bush?.ru.startsWith('Посланник Господа'), true);
  assert.equal(bush?.nl.startsWith('De bode van de Eeuwige'), true);
  const name = draftLine('Exodus.3.1-4.17', 3, 14);
  assert.equal(name?.ru.includes('Я буду тем, кем буду'), true);
  assert.equal(name?.nl.includes('Ik zal zijn die Ik zijn zal'), true);
  const plea = draftLine('Exodus.3.1-4.17', 4, 10);
  assert.equal(plea?.ru.includes('Владыка'), true);
  assert.equal(plea?.nl.includes('Heer'), true);
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
  const sea = draftLine('Exodus.14.26-16.10', 15, 4);
  assert.equal(sea?.ru.includes('Тростниковом море'), true);
  assert.equal(sea?.nl.includes('de Rietzee'), true);
  const half = draftLine('Exodus.30.11-16', 30, 13);
  assert.equal(half?.ru.includes('половину шекеля'), true);
  assert.equal(half?.nl.includes('een halve sikkel'), true);
});

test('Bereshit in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Genesis.3.1-4.18', 3, 1)?.nl.startsWith('De slang was slimmer'), true);
  assert.equal(draftLine('Genesis.3.1-4.18', 4, 18)?.nl.endsWith('verwekte Lemech.'), true);
  assert.equal(draftLine('Genesis.3.1-4.18', 3, 1)?.ru.startsWith('Змей был хитрее'), true);
  assert.equal(draftLine('Job.38.1-18', 38, 18)?.ru.endsWith('знаешь всё это».'), true);
  assert.equal(draftLine('Job.38.1-18', 38, 18)?.nl.endsWith('als je dit alles weet.’'), true);
  assert.equal(draftLine('Job.38.1-19', 38, 19), null);
});

test('Pekudei in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Exodus.39.15-43', 39, 15)?.ru.startsWith('На нагруднике сделали цепочки'), true);
  assert.equal(draftLine('Exodus.39.15-43', 39, 15)?.nl.startsWith('Op het borstschild'), true);
  assert.equal(draftLine('Exodus.40.34-38', 40, 38)?.ru.endsWith('всех их переходов.'), true);
  assert.equal(draftLine('I_Kings.7.40-50', 7, 40)?.ru.startsWith('Хирам изготовил котлы'), true);
  assert.equal(draftLine('I_Kings.7.40-50', 7, 50)?.nl.endsWith('grote zaal van het Huis.'), true);
});

test('Noach in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Genesis.8.6-9.29', 8, 6)?.ru.startsWith('По прошествии сорока дней'), true);
  assert.equal(draftLine('Genesis.8.6-9.29', 8, 6)?.nl.startsWith('Na veertig dagen'), true);
  assert.equal(draftLine('Genesis.8.6-9.29', 9, 29)?.ru.endsWith('а затем умер.'), true);
  assert.equal(draftLine('Genesis.8.6-9.29', 9, 29)?.nl.endsWith('daarna stierf hij.'), true);
  assert.equal(draftLine('Jeremiah.31.23-36', 31, 23)?.ru.startsWith('Так говорит Господь Воинств'), true);
  assert.equal(draftLine('Jeremiah.31.23-36', 31, 36)?.nl.includes('nageslacht van Israël'), true);
  assert.equal(draftLine('Jeremiah.31.23-36', 31, 22), null);
});

test('Vayikra / Shabbat Zakhor has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Leviticus.3.1-4.26', 3, 1)?.ru.startsWith('Если его приношение'), true);
  assert.equal(draftLine('Leviticus.3.1-4.26', 3, 1)?.nl.startsWith('Als zijn offer een vredeoffer'), true);
  assert.equal(draftLine('Leviticus.3.1-4.26', 4, 26)?.ru.endsWith('ему будет прощено.'), true);
  assert.equal(draftLine('Leviticus.3.1-4.26', 4, 26)?.nl.endsWith('vergeving worden geschonken.'), true);
  assert.equal(draftLine('Deuteronomy.25.17-19', 25, 17)?.ru.startsWith('Помни, что сделал тебе Амалек'), true);
  assert.equal(draftLine('Deuteronomy.25.17-19', 25, 19)?.nl.endsWith('Vergeet het niet!'), true);
  assert.equal(draftLine('I_Samuel.15.2-34', 15, 2)?.ru.startsWith('Так говорит Господь Цеваот'), true);
  assert.equal(draftLine('I_Samuel.15.2-34', 15, 34)?.nl.endsWith('Gibea-Saul.'), true);
  assert.equal(draftLine('I_Samuel.15.2-34', 15, 1), null);
});

test('Tzav in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Leviticus.7.11-38', 7, 11)?.ru.startsWith('Вот установление о мирной жертве'), true);
  assert.equal(draftLine('Leviticus.7.11-38', 7, 11)?.nl.startsWith('Dit zijn de voorschriften'), true);
  assert.equal(draftLine('Leviticus.7.11-38', 7, 38)?.ru.includes('Синайской пустыне'), true);
  assert.equal(draftLine('Leviticus.7.11-38', 7, 38)?.nl.includes('woestijn Sinaï'), true);
  assert.equal(draftLine('Ezekiel.36.16-36', 36, 16)?.ru.startsWith('Слово Господа было ко мне'), true);
  assert.equal(draftLine('Ezekiel.36.16-36', 36, 36)?.nl.includes('heb gesproken en zal het doen'), true);
  assert.equal(draftLine('Ezekiel.36.16-36', 36, 15), null);
});

test('Shemini in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Leviticus.9.22-11.12', 9, 22)?.ru.startsWith('Аарон поднял руки'), true);
  assert.equal(draftLine('Leviticus.9.22-11.12', 11, 12)?.nl.includes('geen vinnen en schubben'), true);
  assert.equal(draftLine('Exodus.12.1-20', 12, 1)?.ru.includes('земле Египетской'), true);
  assert.equal(draftLine('Exodus.12.1-20', 12, 20)?.nl.includes('ongezuurd brood'), true);
  assert.equal(draftLine('Ezra.7.1-28', 7, 1)?.ru.startsWith('После этих событий, во время правления'), true);
  assert.equal(draftLine('Ezra.7.1-28', 7, 28)?.nl.includes('verzamelde leiders uit Israël'), true);
  assert.equal(draftLine('Leviticus.9.22-11.12', 9, 21), null);
});

test('Tazria in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Leviticus.13.9-39', 13, 9)?.ru.startsWith('Если у человека появится поражение кожи'), true);
  assert.equal(draftLine('Leviticus.13.9-39', 13, 9)?.nl.startsWith('Wanneer iemand een huidaandoening'), true);
  assert.equal(draftLine('Leviticus.13.9-39', 13, 39)?.ru.endsWith('Человек чист.'), true);
  assert.equal(draftLine('Leviticus.13.9-39', 13, 39)?.nl.includes('onschuldige huiduitslag'), true);
  assert.equal(draftLine('II_Chronicles.26.1-23', 26, 1)?.ru.startsWith('Весь народ Йеуды взял Узиягу'), true);
  assert.equal(draftLine('II_Chronicles.26.1-23', 26, 23)?.nl.includes('Jotam volgde hem op'), true);
  assert.equal(draftLine('II_Chronicles.26.1-23', 26, 24), null);
});

test('Metzora in column B has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Leviticus.14.33-57', 14, 33)?.ru.startsWith('Господь обратился к Моше'), true);
  assert.equal(draftLine('Leviticus.14.33-57', 14, 57)?.nl.includes('tsara\'at'), true);
  assert.equal(draftLine('Malachi.3.4-24', 3, 4)?.ru.startsWith('Тогда приношения Йеуды'), true);
  assert.equal(draftLine('Malachi.3.4-24', 3, 24)?.nl.includes('hart van de vaders'), true);
  assert.equal(draftLine('Malachi.3.4-24', 3, 3), null);
});

test('Pesach chol Exodus 34 draft has Andrii’s Russian and Dutch', () => {
  assert.equal(draftLine('Exodus.34.1-26', 34, 1)?.ru.startsWith('Господь сказал Моше'), true);
  assert.equal(draftLine('Exodus.34.1-26', 34, 1)?.nl.includes('Mosjee'), true);
  assert.equal(draftLine('Exodus.34.1-26', 34, 26)?.ru.includes('козлёнка в молоке'), true);
  assert.equal(draftLine('Exodus.34.1-26', 34, 26)?.nl.includes('geitenbokje'), true);
  assert.equal(draftLine('Exodus.34.1-26', 34, 27), null);
});
