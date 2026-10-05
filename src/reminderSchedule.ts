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

export type ReminderClocks = { weekday: string; weekend: string };

/** Saturday and Sunday use the weekend clock. */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function occurrenceOn(day: Date, clocks: ReminderClocks): number | null {
  const parsed = parseReminderTime(isWeekend(day) ? clocks.weekend : clocks.weekday);
  if (!parsed) return null;
  const at = new Date(day);
  at.setHours(parsed.hours, parsed.minutes, 0, 0);
  return at.getTime();
}

/** Next local occurrence strictly after `from`, using the weekend clock on Saturday and Sunday. */
export function nextReminderTime(clocks: ReminderClocks, from = new Date()): number | null {
  if (!parseReminderTime(clocks.weekday) || !parseReminderTime(clocks.weekend)) return null;
  for (let i = 0; i < 8; i++) {
    const day = new Date(from);
    day.setDate(from.getDate() + i);
    const at = occurrenceOn(day, clocks);
    if (at != null && at > from.getTime()) return at;
  }
  return null;
}

/** The next `count` local occurrences, each on that day's clock. */
export function upcomingReminderTimes(clocks: ReminderClocks, count: number, from = new Date()): number[] {
  const first = nextReminderTime(clocks, from);
  if (first == null || count < 1) return [];
  const start = new Date(first);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const at = occurrenceOn(day, clocks);
    if (at != null) out.push(at);
  }
  return out;
}

export function isReminderDue(targetMs: number, now: number): boolean {
  const late = now - targetMs;
  return late >= -1500 && late <= REMINDER_LATE_MS;
}
