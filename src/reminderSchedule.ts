/** How long after the chosen minute a delayed timer may still notify. */
export const REMINDER_LATE_MS = 15 * 60 * 1000;

export function parseReminderTime(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

/** Next local occurrence of HH:MM strictly after `from`. */
export function nextReminderTime(time: string, from = new Date()): number | null {
  const parsed = parseReminderTime(time);
  if (!parsed) return null;
  const next = new Date(from);
  next.setHours(parsed.hours, parsed.minutes, 0, 0);
  if (next.getTime() <= from.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime();
}

/** The next `count` local occurrences, starting with the soonest one still ahead. */
export function upcomingReminderTimes(time: string, count: number, from = new Date()): number[] {
  const parsed = parseReminderTime(time);
  if (!parsed || count < 1) return [];
  const start = new Date(from);
  const todayAt = new Date(from);
  todayAt.setHours(parsed.hours, parsed.minutes, 0, 0);
  if (todayAt.getTime() <= from.getTime()) start.setDate(start.getDate() + 1);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    day.setHours(parsed.hours, parsed.minutes, 0, 0);
    out.push(day.getTime());
  }
  return out;
}

export function isReminderDue(targetMs: number, now: number): boolean {
  const late = now - targetMs;
  return late >= -1500 && late <= REMINDER_LATE_MS;
}
