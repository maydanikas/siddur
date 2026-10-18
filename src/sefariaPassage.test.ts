import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanMasoreticHtml, parseSefariaVerses, translationVerses } from './sefariaPassage.ts';
import { transliterateHebrew } from './transliterate.ts';

test('ketiv is dropped and the vocalized qere stays', () => {
  const html = 'מֶלֶךְ <span class="mam-kq"><span class="mam-kq-k">(צביים)</span> <span class="mam-kq-q">[צְבוֹיִ֔ם]</span></span>';
  const clean = cleanMasoreticHtml(html);
  assert.equal(clean.includes('צביים'), false);
  assert.equal(clean.includes('צְבוֹיִם'), true);
  assert.equal(clean.includes('['), false);
});

test('paseq markup does not stay in the verse', () => {
  const html = 'אַחַ֣ר&thinsp;<b>׀</b> הַדְּבָרִ֣ים הָאֵ֗לֶּה הָיָ֤ה דְבַר־יְהֹוָה֙ אֶל־אַבְרָ֔ם';
  const clean = cleanMasoreticHtml(html);
  assert.equal(clean.includes('<'), false);
  assert.equal(clean.includes('׀'), false);
  assert.equal(clean.includes('יְהֹוָה'), true);
  assert.equal(transliterateHebrew(clean), 'Achar hadevarim ha\'eleh hayah devar-Adonai el-avram');
});

test('a public-domain translation keeps verse breaks and drops markup', () => {
  assert.equal(translationVerses(['<i>And</i> it came', ['to pass.']]), 'And it came\nto pass.');
  assert.equal(translationVerses(''), '');
});

test('a range that crosses a chapter keeps both verse numbers', () => {
  const verses = parseSefariaVerses({
    he: [['א', 'ב'], ['ג']],
    sections: [14, 20],
    toSections: [15, 2],
  });
  assert.deepEqual(verses.map((verse) => [verse.chapter, verse.verse]), [[14, 20], [14, 21], [15, 1]]);
});

test('the reading aid follows the vowels and reads the Name as Adonai', () => {
  assert.equal(
    transliterateHebrew('בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ'),
    "Bereshit bara elohim et hashamayim ve'et ha'aretz",
  );
  assert.equal(transliterateHebrew('בָּרוּךְ אַתָּה'), 'Baruch atah');
  assert.equal(transliterateHebrew('כָּל־הָאָרֶץ'), "Kol-ha'aretz");
});
