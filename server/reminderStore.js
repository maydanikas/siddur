import { reminderId } from './reminderRecord.js';

const SET_KEY = 'reminders';
const TOMBSTONE_SECONDS = 30 * 24 * 60 * 60;

function recordKey(id) {
  return `reminder:${id}`;
}

function tombstoneKey(id) {
  return `reminder-off:${id}`;
}

export function createReminderStore(redis) {
  return {
    async ids() {
      const result = await redis(['SMEMBERS', SET_KEY]);
      return Array.isArray(result) ? result : [];
    },
    async get(id) {
      const raw = await redis(['GET', recordKey(id)]);
      if (typeof raw !== 'string' || !raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        return null;
      }
    },
    async save(record) {
      const id = reminderId(record.endpoint);
      await redis(['SET', recordKey(id), JSON.stringify(record)]);
      await redis(['SADD', SET_KEY, id]);
      return id;
    },
    async remove(id) {
      await redis(['SREM', SET_KEY, id]);
      await redis(['DEL', recordKey(id)]);
    },
    async deletedAt(id) {
      const raw = await redis(['GET', tombstoneKey(id)]);
      if (raw == null || raw === '') return null;
      const value = Number(raw);
      return Number.isFinite(value) ? value : null;
    },
    async markDeleted(id, updatedAt) {
      await redis(['SET', tombstoneKey(id), String(updatedAt), 'EX', String(TOMBSTONE_SECONDS)]);
    },
  };
}
