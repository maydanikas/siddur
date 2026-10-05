import { createHash } from 'node:crypto';
import { isClock, isValidTimeZone } from './reminderDue.js';

const LANGS = new Set(['ru', 'nl', 'en', 'fr']);

export function reminderId(endpoint) {
  return createHash('sha256').update(endpoint).digest('hex');
}

export function parseReminderBody(body) {
  if (!body || typeof body !== 'object') return null;
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
  const keys = body.keys;
  if (!endpoint.startsWith('https://') || endpoint.length > 4096) return null;
  if (!keys || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string') return null;
  if (keys.p256dh.length < 1 || keys.p256dh.length > 200) return null;
  if (keys.auth.length < 1 || keys.auth.length > 200) return null;
  if (!isClock(body.time) || !isClock(body.weekendTime)) return null;
  if (!isValidTimeZone(body.timeZone)) return null;
  if (typeof body.updatedAt !== 'number' || !Number.isFinite(body.updatedAt)) return null;
  return {
    endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
    time: body.time,
    weekendTime: body.weekendTime,
    timeZone: body.timeZone,
    lang: LANGS.has(body.lang) ? body.lang : 'en',
    updatedAt: body.updatedAt,
  };
}

export function parseDeleteBody(body) {
  if (!body || typeof body !== 'object') return null;
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
  if (!endpoint.startsWith('https://') || endpoint.length > 4096) return null;
  const updatedAt = typeof body.updatedAt === 'number' && Number.isFinite(body.updatedAt) ? body.updatedAt : null;
  return { endpoint, updatedAt };
}

export function isStaleUpdate(existing, incoming) {
  if (!existing || typeof existing.updatedAt !== 'number') return false;
  return incoming.updatedAt < existing.updatedAt;
}

/** Keep lastSent only when both clocks are unchanged, so a new minute today can still fire. */
export function nextRecord(existing, incoming) {
  const sameTimes = Boolean(
    existing && existing.time === incoming.time && existing.weekendTime === incoming.weekendTime,
  );
  return {
    endpoint: incoming.endpoint,
    keys: incoming.keys,
    time: incoming.time,
    weekendTime: incoming.weekendTime,
    timeZone: incoming.timeZone,
    lang: incoming.lang,
    updatedAt: incoming.updatedAt,
    lastSent: sameTimes && typeof existing.lastSent === 'string' ? existing.lastSent : null,
  };
}
