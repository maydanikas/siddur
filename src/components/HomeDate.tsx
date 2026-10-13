import { homeHolidayLine } from '../holidayName';
import { hebrewDateIn, jewishDay } from '../jewishCalendar';
import type { Lang } from '../supportCopy';

const DATE_LOCALE: Record<Lang, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  nl: 'nl-NL',
  fr: 'fr-FR',
};

export default function HomeDate({ lang, today = new Date() }: { lang: Lang; today?: Date }) {
  let gregorian = '';
  let hebrew = '';
  let holiday = '';
  try {
    const day = jewishDay(today);
    gregorian = new Intl.DateTimeFormat(DATE_LOCALE[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);
    hebrew = hebrewDateIn(today, lang);
    holiday = homeHolidayLine(day.titles, day.shabbat, lang);
  } catch {
    return null;
  }
  if (!gregorian || !hebrew) return null;
  return (
    <div className="mb-4 rounded-2xl border border-[#0D9488] bg-[#f3faf9] px-4 py-3">
      <p className="text-[13px] leading-5 text-zinc-500">
        <span>{gregorian}</span>
        <span className="mx-1.5 text-[#0D9488]/45" aria-hidden="true">·</span>
        <span className="text-zinc-700">{hebrew}</span>
      </p>
      {holiday ? (
        <p className="mt-1 text-[15px] font-semibold leading-5 tracking-tight text-[#0D9488]">{holiday}</p>
      ) : null}
    </div>
  );
}
