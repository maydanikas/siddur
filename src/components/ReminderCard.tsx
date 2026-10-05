import { useEffect, useRef, useState } from 'react';
import { trackReminderOn } from '../analytics';
import { REMINDER_COPY, resolveLang, type Lang } from '../supportCopy';
import {
  canScheduleInBackground,
  disableReminder,
  enableReminder,
  readReminder,
  reminderNotice,
  updateReminderClocks,
} from '../reminder';

export default function ReminderCard({ lang, onSeen }: { lang: Lang; onSeen: () => void }) {
  const copy = REMINDER_COPY[resolveLang(lang)];
  const seenRef = useRef(onSeen);
  seenRef.current = onSeen;
  const cardRef = useRef<HTMLElement>(null);
  const saved = readReminder();
  const [time, setTime] = useState(saved.time);
  const [weekendTime, setWeekendTime] = useState(saved.weekendTime);
  const [enabled, setEnabled] = useState(saved.enabled);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<'denied' | 'unsupported' | null>(null);
  const supported = typeof Notification !== 'undefined';

  useEffect(() => {
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      seenRef.current();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) seenRef.current();
      },
      { threshold: [0.5] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const current = readReminder();
    if (current.enabled && (typeof Notification === 'undefined' || Notification.permission !== 'granted')) {
      setEnabled(false);
    }
  }, []);

  const notice = reminderNotice(lang);
  const extra =
    problem === 'denied'
      ? copy.denied
      : !supported || problem === 'unsupported'
        ? copy.unsupported
        : enabled && !canScheduleInBackground()
          ? copy.whileOpen
          : null;

  const onClocks = (nextTime: string, nextWeekend: string) => {
    if (!nextTime || !nextWeekend) return;
    setTime(nextTime);
    setWeekendTime(nextWeekend);
    if (enabled) void updateReminderClocks(nextTime, nextWeekend, notice);
  };

  const onToggle = async () => {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    try {
      if (enabled) {
        await disableReminder();
        setEnabled(false);
        return;
      }
      const result = await enableReminder(time, weekendTime, notice);
      if (result === 'on') {
        setEnabled(true);
        trackReminderOn(time, weekendTime);
        return;
      }
      if (result === 'denied' || result === 'unsupported') setProblem(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section ref={cardRef} className="mt-8 rounded-2xl border border-zinc-200 p-4" aria-labelledby="reminder-label">
      <p id="reminder-label" className="text-[13px] font-semibold text-[#0D9488]">
        {copy.label}
      </p>
      <p className="mt-2 text-[15px] leading-7 text-zinc-800">{copy.body}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="rounded-xl border border-zinc-200 px-2 py-3">
          <span className="block text-center text-[13px] font-medium text-zinc-600">{copy.weekday}</span>
          <input
            type="time"
            value={time}
            aria-label={copy.weekday}
            onChange={(event) => onClocks(event.target.value, weekendTime)}
            className="mt-1 block w-full bg-transparent text-center text-[22px] font-semibold tracking-tight text-zinc-900 outline-none"
          />
        </label>
        <label className="rounded-xl border border-zinc-200 px-2 py-3">
          <span className="block text-center text-[13px] font-medium text-zinc-600">{copy.weekend}</span>
          <input
            type="time"
            value={weekendTime}
            aria-label={copy.weekend}
            onChange={(event) => onClocks(time, event.target.value)}
            className="mt-1 block w-full bg-transparent text-center text-[22px] font-semibold tracking-tight text-zinc-900 outline-none"
          />
        </label>
      </div>
      <p className="mt-1 text-center text-[11px] text-zinc-400">{copy.timeHint}</p>
      {supported && (
        <button
          type="button"
          onClick={() => void onToggle()}
          disabled={busy}
          aria-pressed={enabled}
          className="mt-4 h-12 w-full rounded-full border border-[#0D9488] bg-white text-[15px] font-semibold text-[#0D9488] disabled:opacity-60"
        >
          {enabled ? copy.disable : copy.enable}
        </button>
      )}
      <p className="mt-2 text-[11px] leading-4 text-zinc-500">
        {supported ? copy.sound : copy.unsupported}
        {extra && supported ? ` ${extra}` : ''}
      </p>
    </section>
  );
}
