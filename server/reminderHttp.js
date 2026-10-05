import { createHash, timingSafeEqual } from 'node:crypto';
import webpush from 'web-push';
import { deleteReminder, noticeFor, runDispatch, upsertReminder } from '../server/reminderDispatch.js';
import { parseDeleteBody, parseReminderBody } from '../server/reminderRecord.js';
import { redisCommand, redisConfig } from '../server/redisRest.js';
import { createReminderStore } from '../server/reminderStore.js';
import { VAPID_PUBLIC_KEY, VAPID_SUBJECT } from '../server/vapidPublic.js';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

export function secretsReady(env = process.env) {
  return Boolean(env.VAPID_PRIVATE_KEY && env.CRON_SECRET && redisConfig(env));
}

export function secretMatches(provided, expected) {
  if (typeof provided !== 'string' || !provided || typeof expected !== 'string' || !expected) return false;
  const left = createHash('sha256').update(provided).digest();
  const right = createHash('sha256').update(expected).digest();
  return timingSafeEqual(left, right);
}

export function requestSecret(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || '';
  if (typeof header === 'string' && header.startsWith('Bearer ')) return header.slice('Bearer '.length);
  const query = req.query?.secret;
  return typeof query === 'string' ? query : '';
}

function storeFromEnv() {
  return createReminderStore((command) => redisCommand(command));
}

export async function handleReminder(req, res) {
  if (!secretsReady()) return json(res, 503, { ok: false });
  const body = readBody(req);
  try {
    if (req.method === 'POST') {
      const incoming = parseReminderBody(body);
      if (!incoming) return json(res, 400, { ok: false });
      const result = await upsertReminder(storeFromEnv(), incoming);
      return json(res, 200, result);
    }
    if (req.method === 'DELETE') {
      const dropping = parseDeleteBody(body);
      if (!dropping) return json(res, 400, { ok: false });
      const result = await deleteReminder(storeFromEnv(), dropping.endpoint, dropping.updatedAt);
      return json(res, 200, result);
    }
    return json(res, 405, { ok: false });
  } catch {
    return json(res, 503, { ok: false });
  }
}

export async function handleDispatch(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return json(res, 405, { ok: false });
  if (!secretsReady()) return json(res, 503, { ok: false });
  if (!secretMatches(requestSecret(req), process.env.CRON_SECRET)) return json(res, 401, { ok: false });
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    const result = await runDispatch(storeFromEnv(), async (record) => {
      const copy = noticeFor(record.lang);
      await webpush.sendNotification(
        {
          endpoint: record.endpoint,
          keys: { p256dh: record.keys.p256dh, auth: record.keys.auth },
        },
        JSON.stringify({ title: copy.title, body: copy.body, lang: record.lang || 'en' }),
        { TTL: 12 * 60 * 60, urgency: 'high' },
      );
    });
    return json(res, 200, result);
  } catch {
    return json(res, 503, { ok: false });
  }
}
