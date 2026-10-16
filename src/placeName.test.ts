import assert from 'node:assert/strict';
import { test } from 'node:test';
import { placeNameFromGeocode, sameTown } from './placeName.ts';

function geocode(entries: Array<[string, string]>, locality = '', city = '') {
  return {
    locality,
    city,
    localityInfo: {
      administrative: entries.map(([name, description]) => ({ name, description })),
    },
  };
}

test('Heesch is the village, not the municipality around it', () => {
  const heesch = geocode([
    ['Нидерланды', 'государство в Западной Европе'],
    ['Северный Брабант', 'провинция на юге Нидерландов'],
    ['Бернхезе', 'община Нидерландов'],
    ['Хес', 'населённый пункт в Нидерландах'],
  ], 'Хес', 'Бернхезе');
  assert.equal(placeNameFromGeocode(heesch), 'Хес');
  const dutch = geocode([
    ['Nederland', 'land binnen het Koninkrijk der Nederlanden'],
    ['Noord-Brabant', 'provincie van Nederland'],
    ['Bernheze', 'gemeente in Noord-Brabant, Nederland'],
    ['Heesch', 'dorp in de Brabantse gemeente Bernheze, Nederland'],
  ], 'Heesch', 'Bernheze');
  assert.equal(placeNameFromGeocode(dutch), 'Heesch');
});

test('a neighbourhood resolves to the city', () => {
  assert.equal(placeNameFromGeocode(geocode([
    ['Северная Голландия', 'провинция в Нидерландах'],
    ['Амстердам', 'община в Нидерландах'],
    ['Амстердам', 'город, столица Нидерландов'],
  ], 'Центр Амстердама', 'Амстердам')), 'Амстердам');
  assert.equal(placeNameFromGeocode(geocode([
    ['Москва', 'cтолица и крупнейший город России'],
    ['Тверской район', 'муниципальный округ города Москвы'],
  ], 'Тверской район', 'Москва')), 'Москва');
  assert.equal(placeNameFromGeocode(geocode([
    ['Париж', 'столица Франции'],
    ['Сен-Мери', 'административный квартал IV округа Парижа'],
  ], 'Сен-Мери', 'Париж')), 'Париж');
});

test('a missing payload has no name', () => {
  assert.equal(placeNameFromGeocode(null), null);
  assert.equal(placeNameFromGeocode({}), null);
  assert.equal(placeNameFromGeocode({ locality: '  Oss  ', city: 'Oss' }), 'Oss');
});

test('a short move stays in the same town', () => {
  const heesch = { latitude: 51.73519, longitude: 5.5266331 };
  assert.equal(sameTown(heesch, { latitude: 51.736, longitude: 5.528 }), true);
  assert.equal(sameTown(heesch, { latitude: 52.37, longitude: 4.9 }), false);
});
