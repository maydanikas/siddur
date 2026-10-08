import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { inflateSync } from 'node:zlib';
import { runDispatch, upsertReminder } from './reminderDispatch.js';
import { isReminderDueNow, isValidTimeZone, localParts, previousMinute } from './reminderDue.js';
import { secretMatches } from './reminderHttp.js';
import { isStaleUpdate, nextRecord, parseReminderBody } from './reminderRecord.js';
import { redisConfig } from './redisRest.js';
import { VAPID_PUBLIC_KEY } from './vapidPublic.js';

const zone = 'Europe/Amsterdam';

function pngHasTransparentPixel(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idats = [];
  while (offset + 8 <= buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') break;
    offset += 12 + len;
  }
  assert.equal(colorType, 6);
  const raw = inflateSync(Buffer.concat(idats));
  const stride = width * 4;
  let i = 0;
  let prev = Buffer.alloc(stride);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[i++];
    const row = Buffer.from(raw.subarray(i, i + stride));
    i += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? row[x - 4] : 0;
      const up = prev[x];
      const ul = x >= 4 ? prev[x - 4] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      else if (filter === 2) row[x] = (row[x] + up) & 255;
      else if (filter === 3) row[x] = (row[x] + ((left + up) >> 1)) & 255;
      else if (filter === 4) row[x] = (row[x] + paeth(left, up, ul)) & 255;
    }
    for (let x = 3; x < stride; x += 4) if (row[x] === 0) return true;
    prev = row;
  }
  return false;
}

test('the notification badge is a transparent shin, and the phone shows the name Shacharis', () => {
  const sw = readFileSync(new URL('../public/reminder-sw.js', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../src/reminder.ts', import.meta.url), 'utf8');
  const manifest = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
  assert.match(sw, /badge: '\/icon-badge\.png'/);
  assert.match(client, /badge: '\/icon-badge\.png'/);
  assert.match(manifest, /short_name: 'Shacharis'/);
  const png = readFileSync(new URL('../public/icon-badge.png', import.meta.url));
  assert.equal(pngHasTransparentPixel(png), true);
});

test('the public key committed for the phone matches the server', () => {
  const source = readFileSync(new URL('../src/vapidPublic.ts', import.meta.url), 'utf8');
  assert.match(source, new RegExp(VAPID_PUBLIC_KEY));
});

test('monday morning uses the weekday clock, with one extra minute of grace', () => {
  const record = { time: '07:00', weekendTime: '09:30', timeZone: zone, lastSent: null };
  const at = new Date('2026-10-05T05:00:00.000Z');
  assert.equal(localParts(at, zone).hhmm, '07:00');
  assert.equal(localParts(at, zone).weekend, false);
  assert.equal(isReminderDueNow(record, at)?.date, '2026-10-05');
  assert.equal(isReminderDueNow(record, new Date('2026-10-05T05:01:00.000Z'))?.date, '2026-10-05');
  assert.equal(isReminderDueNow(record, new Date('2026-10-05T05:02:00.000Z')), null);
});

test('a reminder already sent today does not fire again in the grace minute', () => {
  const record = { time: '07:00', weekendTime: '09:30', timeZone: zone, lastSent: '2026-10-05' };
  assert.equal(isReminderDueNow(record, new Date('2026-10-05T05:01:00.000Z')), null);
});

test('saturday and sunday use the weekend clock', () => {
  const record = { time: '07:00', weekendTime: '09:30', timeZone: zone, lastSent: null };
  assert.equal(isReminderDueNow(record, new Date('2026-10-10T05:00:00.000Z')), null);
  assert.equal(isReminderDueNow(record, new Date('2026-10-10T07:30:00.000Z'))?.date, '2026-10-10');
  assert.equal(localParts(new Date('2026-10-11T07:30:00.000Z'), zone).weekend, true);
  assert.equal(isReminderDueNow(record, new Date('2026-10-11T07:30:00.000Z'))?.date, '2026-10-11');
});

test('midnight is 00, not 24', () => {
  const parts = localParts(new Date('2026-10-05T22:00:00.000Z'), zone);
  assert.equal(parts.hhmm, '00:00');
  assert.equal(parts.date, '2026-10-06');
  assert.equal(previousMinute('00:00'), '23:59');
});

test('rejects a zone that is not a real place', () => {
  assert.equal(isValidTimeZone('Europe/Amsterdam'), true);
  assert.equal(isValidTimeZone('Not/AZone'), false);
  assert.equal(isValidTimeZone(''), false);
});

test('changing the clock clears lastSent and an older save does not win', () => {
  const existing = {
    endpoint: 'https://push.example/1',
    keys: { p256dh: 'p', auth: 'a' },
    time: '07:00',
    weekendTime: '09:00',
    timeZone: zone,
    lang: 'ru',
    updatedAt: 10,
    lastSent: '2026-10-05',
  };
  const same = nextRecord(existing, { ...existing, updatedAt: 11 });
  assert.equal(same.lastSent, '2026-10-05');
  const moved = nextRecord(existing, { ...existing, time: '08:00', updatedAt: 12 });
  assert.equal(moved.lastSent, null);
  assert.equal(isStaleUpdate(existing, { ...existing, updatedAt: 9 }), true);
  assert.equal(isStaleUpdate(existing, { ...existing, updatedAt: 10 }), false);
});

test('a reminder body must be a browser push subscription', () => {
  const good = parseReminderBody({
    endpoint: 'https://push.example/abc',
    keys: { p256dh: 'key', auth: 'auth' },
    time: '07:00',
    weekendTime: '09:00',
    timeZone: zone,
    lang: 'de',
    updatedAt: 1,
  });
  assert.equal(good.lang, 'en');
  assert.equal(parseReminderBody({ ...good, endpoint: 'http://push.example/abc' }), null);
  assert.equal(parseReminderBody({ ...good, time: '7:00' }), null);
  assert.equal(parseReminderBody({ ...good, timeZone: 'Mars/Base' }), null);
});

test('redis config uses an https REST url and ignores a rediss url', () => {
  assert.equal(redisConfig({ STORAGE_URL: 'rediss://example', STORAGE_TOKEN: 't' }), null);
  assert.deepEqual(
    redisConfig({
      STORAGE_KV_REST_API_URL: 'https://example.upstash.io',
      STORAGE_KV_REST_API_TOKEN: 't',
      STORAGE_URL: 'rediss://example',
    }),
    { url: 'https://example.upstash.io', token: 't' },
  );
  assert.deepEqual(redisConfig({ STORAGE_FOO_URL: 'https://example.upstash.io', STORAGE_FOO_TOKEN: 'tok' }), {
    url: 'https://example.upstash.io',
    token: 'tok',
  });
});

test('dispatch marks a successful send and drops a subscription the push service forgot', async () => {
  const records = new Map();
  const id = 'phone-1';
  records.set(id, {
    endpoint: 'https://push.example/1',
    keys: { p256dh: 'p', auth: 'a' },
    time: '07:00',
    weekendTime: '09:00',
    timeZone: zone,
    lang: 'ru',
    updatedAt: 1,
    lastSent: null,
  });
  const store = {
    async ids() {
      return [...records.keys()];
    },
    async get(key) {
      return records.get(key) ?? null;
    },
    async save(record) {
      records.set(id, record);
    },
    async remove(key) {
      records.delete(key);
    },
  };
  const sent = [];
  const result = await runDispatch(store, async (record) => {
    sent.push(record.lang);
  }, new Date('2026-10-05T05:00:00.000Z'));
  assert.deepEqual(result, { ok: true, sent: 1 });
  assert.deepEqual(sent, ['ru']);
  assert.equal(records.get(id).lastSent, '2026-10-05');

  const again = await runDispatch(store, async () => {
    throw new Error('should not send twice');
  }, new Date('2026-10-05T05:01:00.000Z'));
  assert.equal(again.sent, 0);

  records.set(id, { ...records.get(id), lastSent: null, time: '07:02' });
  const gone = await runDispatch(store, async () => {
    const error = new Error('gone');
    error.statusCode = 410;
    throw error;
  }, new Date('2026-10-05T05:02:00.000Z'));
  assert.equal(gone.sent, 0);
  assert.equal(records.has(id), false);
});

test('a failed send is retried on the next minute', async () => {
  const record = {
    endpoint: 'https://push.example/2',
    keys: { p256dh: 'p', auth: 'a' },
    time: '07:00',
    weekendTime: '09:00',
    timeZone: zone,
    lang: 'en',
    updatedAt: 1,
    lastSent: null,
  };
  const store = {
    async ids() {
      return ['id'];
    },
    async get() {
      return record;
    },
    async save(next) {
      Object.assign(record, next);
    },
    async remove() {
      throw new Error('should stay');
    },
  };
  const first = await runDispatch(store, async () => {
    const error = new Error('temporary');
    error.statusCode = 500;
    throw error;
  }, new Date('2026-10-05T05:00:00.000Z'));
  assert.equal(first.sent, 0);
  assert.equal(record.lastSent, null);
  const second = await runDispatch(store, async () => {}, new Date('2026-10-05T05:01:00.000Z'));
  assert.equal(second.sent, 1);
  assert.equal(record.lastSent, '2026-10-05');
});

test('an older clock change does not overwrite a newer one', async () => {
  let saved = null;
  const store = {
    async get() {
      return saved;
    },
    async save(record) {
      saved = record;
    },
    async deletedAt() {
      return null;
    },
  };
  const base = {
    endpoint: 'https://push.example/3',
    keys: { p256dh: 'p', auth: 'a' },
    time: '08:00',
    weekendTime: '09:00',
    timeZone: zone,
    lang: 'nl',
    updatedAt: 20,
  };
  await upsertReminder(store, base);
  await upsertReminder(store, { ...base, time: '07:00', updatedAt: 10 });
  assert.equal(saved.time, '08:00');
});

test('turning the reminder off blocks a late save of the old subscription', async () => {
  const { deleteReminder } = await import('./reminderDispatch.js');
  let saved = null;
  let tombstone = null;
  const store = {
    async get() {
      return saved;
    },
    async save(record) {
      saved = record;
    },
    async remove() {
      saved = null;
    },
    async deletedAt() {
      return tombstone;
    },
    async markDeleted(_id, updatedAt) {
      tombstone = updatedAt;
    },
  };
  const base = {
    endpoint: 'https://push.example/4',
    keys: { p256dh: 'p', auth: 'a' },
    time: '07:00',
    weekendTime: '09:00',
    timeZone: zone,
    lang: 'ru',
    updatedAt: 10,
  };
  await upsertReminder(store, base);
  await deleteReminder(store, base.endpoint, 20);
  assert.equal(saved, null);
  await upsertReminder(store, base);
  assert.equal(saved, null);
  await upsertReminder(store, { ...base, updatedAt: 30 });
  assert.equal(saved.updatedAt, 30);
});

test('the cron secret comparison does not accept a prefix of the secret', () => {
  assert.equal(secretMatches('short-prefix', 'short-prefix-and-the-rest'), false);
  assert.equal(secretMatches('same-secret', 'same-secret'), true);
  assert.equal(secretMatches('', 'same-secret'), false);
});
