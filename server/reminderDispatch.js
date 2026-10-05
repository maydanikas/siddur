import { isReminderDueNow } from './reminderDue.js';
import { isStaleUpdate, nextRecord, reminderId } from './reminderRecord.js';

export const REMINDER_NOTICE = {
  en: { title: 'Time for morning prayer', body: 'Shacharis' },
  ru: { title: 'Время утренней молитвы', body: 'Shacharis' },
  nl: { title: 'Tijd voor het ochtendgebed', body: 'Shacharis' },
  fr: { title: 'L’heure de la prière du matin', body: 'Shacharis' },
};

export function noticeFor(lang) {
  return REMINDER_NOTICE[lang] || REMINDER_NOTICE.en;
}

export async function upsertReminder(store, incoming) {
  const id = reminderId(incoming.endpoint);
  const deletedAt = typeof store.deletedAt === 'function' ? await store.deletedAt(id) : null;
  if (typeof deletedAt === 'number' && incoming.updatedAt <= deletedAt) return { ok: true, stale: true };
  const existing = await store.get(id);
  if (isStaleUpdate(existing, incoming)) return { ok: true, stale: true };
  await store.save(nextRecord(existing, incoming));
  return { ok: true };
}

export async function deleteReminder(store, endpoint, updatedAt) {
  const id = reminderId(endpoint);
  const existing = await store.get(id);
  if (
    existing
    && typeof existing.updatedAt === 'number'
    && typeof updatedAt === 'number'
    && existing.updatedAt > updatedAt
  ) {
    return { ok: true, stale: true };
  }
  const marked = typeof store.deletedAt === 'function' ? await store.deletedAt(id) : null;
  if (typeof marked === 'number' && typeof updatedAt === 'number' && marked > updatedAt) {
    return { ok: true, stale: true };
  }
  await store.remove(id);
  if (typeof updatedAt === 'number' && typeof store.markDeleted === 'function') {
    await store.markDeleted(id, updatedAt);
  }
  return { ok: true };
}

/** Send each due reminder. A failed send stays unmarked so the next minute can retry. */
export async function runDispatch(store, send, now = new Date()) {
  const ids = await store.ids();
  let sent = 0;
  for (const id of ids) {
    const record = await store.get(id);
    if (!record) {
      await store.remove(id);
      continue;
    }
    const due = isReminderDueNow(record, now);
    if (!due) continue;
    try {
      await send(record);
      await store.save({ ...record, lastSent: due.date });
      sent += 1;
    } catch (error) {
      const status = Number(error && error.statusCode);
      if (status === 404 || status === 410) await store.remove(id);
    }
  }
  return { ok: true, sent };
}
