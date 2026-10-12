import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { jewishDay } from './jewishCalendar.ts';
import { applySeason, type SeasonedPrayer } from './seasonalText.ts';

const noon = (iso: string) => new Date(`${iso}T12:00:00`);

function field(chunk: string, name: string): string {
  const key = `${name}: "`;
  const at = chunk.indexOf(key);
  if (at < 0) throw new Error(`missing ${name}`);
  let out = '';
  for (let i = at + key.length; i < chunk.length; i++) {
    const char = chunk[i];
    if (char === '\\') {
      out += chunk[i + 1] === 'n' ? '\n' : chunk[i + 1];
      i += 1;
      continue;
    }
    if (char === '"') break;
    out += char;
  }
  return out;
}

function loadPrayer(id: number): SeasonedPrayer {
  const src = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
  const start = src.indexOf(`\n  id: ${id},`);
  const next = src.indexOf(`\n  id: ${id + 1},`, start + 1);
  const chunk = src.slice(start, next === -1 ? undefined : next);
  return {
    id,
    he_display: field(chunk, 'he_display'),
    he_tts: field(chunk, 'he_tts'),
    translit: field(chunk, 'translit'),
    ru: field(chunk, 'ru'),
    nl: field(chunk, 'nl'),
    en: field(chunk, 'en'),
    fr: field(chunk, 'fr'),
  };
}

const prayers = {
  avot: loadPrayer(44),
  gevurot: loadPrayer(45),
  kedusha: loadPrayer(46),
  retze: loadPrayer(48),
  modim: loadPrayer(49),
  shalom: loadPrayer(50),
};

function instructions(text: string): string[] {
  return text.split('\n').filter((line) => line.trim().startsWith('[') && line.trim().endsWith(']'));
}

function brackets(text: string): string[] {
  return text.match(/\[[^\]]+\]/g) ?? [];
}

test('an ordinary summer day keeps the weekday Amidah and drops every insertion', () => {
  const day = jewishDay(noon('2026-06-01'));
  const gevurot = applySeason(prayers.gevurot, day);
  const retze = applySeason(prayers.retze, day);
  const avot = applySeason(prayers.avot, day);
  const kedusha = applySeason(prayers.kedusha, day);
  const modim = applySeason(prayers.modim, day);
  const shalom = applySeason(prayers.shalom, day);

  assert.equal(gevurot.he_display.includes('מַשִּׁיב'), false);
  assert.equal(gevurot.he_display.includes('אַב הָרַחֲמִים'), false);
  assert.equal(gevurot.he_display.includes('וְנֶאֱמָן אַתָּה'), true);
  assert.equal(gevurot.en.includes('wind to blow'), false);
  assert.equal(gevurot.en.includes('And faithful are You to revive the dead.'), true);
  assert.equal(gevurot.he_tts.includes('מַשִּׁיב'), false);

  assert.equal(avot.he_display.includes('זָכְרֵנוּ לְחַיִּים'), false);
  assert.equal(avot.en.includes('Book of Life'), false);
  assert.equal(avot.he_tts.includes('זָכְרֵנוּ'), false);

  assert.equal(kedusha.he_display.includes('הָאֵל הַקָּדוֹשׁ'), true);
  assert.equal(kedusha.he_display.includes('הַמֶּלֶךְ הַקָּדוֹשׁ'), false);
  assert.equal(kedusha.he_tts.includes('הַמֶּלֶךְ'), false);

  assert.equal(retze.he_display.includes('יַעֲלֶה'), false);
  assert.equal(retze.he_display.includes('וְתֶחֱזֶינָה'), true);
  assert.equal(retze.en.includes('Yaaleh'), false);
  assert.equal(retze.he_tts.includes('יַעֲלֶה'), false);

  assert.equal(modim.he_display.includes('וּכְתוֹב'), false);
  assert.equal(modim.he_display.includes('וְכֹל הַחַיִּים'), true);
  assert.equal(modim.he_tts.includes('וּכְתוֹב'), false);

  assert.equal(shalom.he_display.includes('בְּסֵפֶר חַיִּים'), false);
  assert.equal(shalom.he_display.includes('הַמְבָרֵךְ'), true);
  assert.equal(shalom.he_display.includes('עוֹשֵׂה הַשָּׁלוֹם'), false);
});

test('Rosh Hashana shows the ten-day lines and the holy King', () => {
  const day = jewishDay(noon('2026-09-12'));
  const avot = applySeason(prayers.avot, day);
  const gevurot = applySeason(prayers.gevurot, day);
  const kedusha = applySeason(prayers.kedusha, day);
  const modim = applySeason(prayers.modim, day);
  const shalom = applySeason(prayers.shalom, day);

  assert.equal(day.yamimNoraim, true);
  assert.equal(avot.he_display.includes('זָכְרֵנוּ לְחַיִּים'), true);
  assert.equal(avot.he_display.includes('['), true);
  assert.equal(avot.en.includes('Remember us for life'), true);
  assert.equal(avot.en.includes('Seasonal insertion'), false);

  assert.equal(gevurot.he_display.includes('מַשִּׁיב'), false);
  assert.equal(gevurot.he_display.includes('אַב הָרַחֲמִים'), true);
  assert.equal(gevurot.en.includes('Father of mercy'), true);
  assert.equal(gevurot.en.includes('And faithful are You'), true);

  assert.equal(kedusha.he_display.includes('הַמֶּלֶךְ הַקָּדוֹשׁ'), true);
  assert.equal(kedusha.he_display.includes('הָאֵל הַקָּדוֹשׁ'), false);
  assert.equal(kedusha.en.includes('the holy King'), true);
  assert.equal(kedusha.en.includes('the holy God'), false);
  assert.equal(kedusha.he_tts.split('בָּרוּךְ אַתָּה').length, 2);

  assert.equal(modim.he_display.includes('וּכְתוֹב'), true);
  assert.equal(modim.en.includes('inscribe for good life'), true);

  assert.equal(shalom.he_display.includes('בְּסֵפֶר חַיִּים'), true);
  assert.equal(shalom.he_display.includes('עוֹשֵׂה הַשָּׁלוֹם'), true);
  assert.equal(shalom.he_display.includes('הַמְבָרֵךְ'), false);
  assert.equal(shalom.en.includes('Book of life'), true);
  assert.equal(shalom.en.includes('Who makes peace'), true);
  assert.equal(shalom.en.includes('Who blesses His people'), false);
});

test('Rosh Chodesh Cheshvan keeps the winter line and one Yaaleh phrase', () => {
  const day = jewishDay(noon('2026-10-12'));
  const gevurot = applySeason(prayers.gevurot, day);
  const retze = applySeason(prayers.retze, day);

  assert.equal(day.mashivHaruach, true);
  assert.equal(day.yaalehVeyavo, 'roshChodesh');
  assert.equal(gevurot.he_display.includes('מַשִּׁיב הָרוּחַ'), true);
  assert.equal(gevurot.he_display.includes('['), true);
  assert.equal(gevurot.en.includes('wind to blow'), true);
  assert.equal(gevurot.en.includes('Winter insertion'), false);
  assert.equal(gevurot.he_tts.includes('מַשִּׁיב'), true);

  assert.equal(retze.he_display.includes('רֹאשׁ הַחֹדֶשׁ'), true);
  assert.equal(retze.he_display.includes('חַג הַמַּצּוֹת'), false);
  assert.equal(retze.he_display.includes('חַג הַסֻּכּוֹת'), false);
  assert.equal(retze.he_display.includes(' / '), false);
  assert.equal(retze.en.includes('Rosh Chodesh'), true);
  assert.equal(retze.en.includes('Chag HaMatzot'), false);
  assert.equal(retze.translit.includes('Rosh HaChodesh'), true);
  assert.equal(retze.translit.includes('Chag HaMatzot'), false);
  assert.equal(retze.he_tts.includes('חַג הַמַּצּוֹת'), false);
});

test('the intermediate days keep only their own festival phrase', () => {
  const pesach = applySeason(prayers.retze, jewishDay(noon('2026-04-04')));
  const sukkot = applySeason(prayers.retze, jewishDay(noon('2026-09-28')));
  assert.equal(pesach.he_display.includes('חַג הַמַּצּוֹת'), true);
  assert.equal(pesach.he_display.includes('רֹאשׁ הַחֹדֶשׁ'), false);
  assert.equal(pesach.en.includes('Chag HaMatzot'), true);
  assert.equal(pesach.en.includes('Rosh Chodesh'), false);
  assert.equal(sukkot.he_display.includes('חַג הַסֻּכּוֹת'), true);
  assert.equal(sukkot.he_display.includes('חַג הַמַּצּוֹת'), false);
  assert.equal(sukkot.ru.includes('Суккот'), true);
  assert.equal(sukkot.ru.includes('Мацот'), false);
});

test('seasonal notes disappear together in Hebrew and in every translation', () => {
  for (const iso of ['2026-06-01', '2026-09-12', '2026-10-12', '2026-04-04', '2026-01-15']) {
    const day = jewishDay(noon(iso));
    for (const prayer of Object.values(prayers)) {
      const shown = applySeason(prayer, day);
      const notes = instructions(shown.he_display).length;
      for (const lang of ['en', 'ru', 'nl', 'fr'] as const) {
        assert.equal(brackets(shown[lang]).length, notes, `${prayer.id} ${lang} ${iso}`);
      }
    }
  }
});
