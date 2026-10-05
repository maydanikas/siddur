const CLOCK = /^(\d{2}):(\d{2})$/;

export function isClock(value) {
  const match = CLOCK.exec(value);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59;
}

export function isValidTimeZone(timeZone) {
  if (typeof timeZone !== 'string' || timeZone.length < 1 || timeZone.length > 100) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function previousMinute(hhmm) {
  const match = CLOCK.exec(hhmm);
  if (!match) return null;
  const total = Number(match[1]) * 60 + Number(match[2]);
  const prev = (total + 24 * 60 - 1) % (24 * 60);
  return `${String(Math.floor(prev / 60)).padStart(2, '0')}:${String(prev % 60).padStart(2, '0')}`;
}

/** Wall clock in an IANA zone. hourCycle h23 can report midnight as 24. */
export function localParts(now, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const bag = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== 'literal') bag[part.type] = part.value;
  }
  const hour = bag.hour === '24' ? '00' : String(bag.hour).padStart(2, '0');
  const minute = String(bag.minute).padStart(2, '0');
  return {
    hhmm: `${hour}:${minute}`,
    date: `${bag.year}-${bag.month}-${bag.day}`,
    weekend: bag.weekday === 'Sat' || bag.weekday === 'Sun',
  };
}

/**
 * Due when the local minute is the chosen clock, or the minute just after it,
 * and this local date has not already been sent.
 * Saturday and Sunday use the weekend clock.
 */
export function isReminderDueNow(record, now) {
  if (!record || !isClock(record.time) || !isClock(record.weekendTime)) return null;
  let parts;
  try {
    parts = localParts(now, record.timeZone);
  } catch {
    return null;
  }
  const target = parts.weekend ? record.weekendTime : record.time;
  if (parts.hhmm !== target && previousMinute(parts.hhmm) !== target) return null;
  if (record.lastSent === parts.date) return null;
  return { date: parts.date };
}
