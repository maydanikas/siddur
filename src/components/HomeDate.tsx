import { homeHolidayLine } from '../holidayName';
import { hebrewDateIn, jewishDay } from '../jewishCalendar';
import { useReaderPlace } from '../readerPlace';
import { dayNeedsClock, shabbatClock, shabbatClockLine } from '../shabbatTimes';
import type { Lang } from '../supportCopy';
import { weeklyReadingParts, type WeeklyReadingPart } from '../weeklyReading';

const DATE_LOCALE: Record<Lang, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  nl: 'nl-NL',
  fr: 'fr-FR',
};

export default function HomeDate({
  lang,
  today = new Date(),
  onOpenReading,
}: {
  lang: Lang;
  today?: Date;
  onOpenReading?: (index: number) => void;
}) {
  let needed = false;
  try {
    needed = dayNeedsClock(today);
  } catch {
    needed = false;
  }
  const place = useReaderPlace(needed, lang);
  let gregorian = '';
  let hebrew = '';
  let holiday = '';
  let reading: WeeklyReadingPart[] = [];
  let clockLine = '';
  try {
    const day = jewishDay(today);
    gregorian = new Intl.DateTimeFormat(DATE_LOCALE[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);
    hebrew = hebrewDateIn(today, lang);
    holiday = homeHolidayLine(day.titles, day.shabbat, lang, day.yomRishon);
    reading = weeklyReadingParts(today, lang);
    if (place) {
      const clock = shabbatClock(today, place);
      if (clock) clockLine = shabbatClockLine(clock, lang);
    }
  } catch {
    return null;
  }
  if (!gregorian || !hebrew) return null;
  return (
    <div className="rounded-2xl border border-[#0D9488] bg-[#f3faf9] px-4 py-3">
      <p className="text-[13px] leading-5 text-zinc-500">
        <span>{gregorian}</span>
        <span className="mx-1.5 text-[#0D9488]/45" aria-hidden="true">·</span>
        <span className="text-zinc-700">{hebrew}</span>
      </p>
      {holiday ? (
        <p className="mt-1 text-[15px] font-semibold leading-5 tracking-tight text-[#0D9488]">{holiday}</p>
      ) : null}
      {reading.length > 0 ? (
        <p className="mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[13px] font-medium leading-5 text-[#0D9488]">
          {reading.map((part, i) => {
            const passageIndex = part.href ? reading.slice(0, i).filter((item) => item.href).length : -1;
            return (
              <span key={`${i}-${part.text}`} className="whitespace-nowrap">
                {i > 0 ? <span className="mr-1.5">·</span> : null}
                {part.href ? (
                  <button
                    type="button"
                    onClick={() => onOpenReading?.(passageIndex)}
                    className="underline decoration-[#0D9488]/40 underline-offset-2"
                  >
                    {part.text}
                  </button>
                ) : (
                  part.text
                )}
              </span>
            );
          })}
        </p>
      ) : null}
      {clockLine ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] font-semibold leading-5 tracking-tight text-[#0D9488]">
          <span className="tabular-nums">{clockLine}</span>
          {place?.name && place.nameLang === lang ? (
            <span className="inline-flex items-center gap-1 font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.2" fill="currentColor" />
              </svg>
              <span>{place.name}</span>
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
