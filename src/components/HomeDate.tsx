import { jewishDay } from '../jewishCalendar';
import type { Lang } from '../supportCopy';

const DATE_LOCALE: Record<Lang, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  nl: 'nl-NL',
  fr: 'fr-FR',
};

export default function HomeDate({ lang }: { lang: Lang }) {
  let gregorian = '';
  let hebrew = '';
  let holiday = '';
  try {
    const today = new Date();
    const day = jewishDay(today);
    gregorian = new Intl.DateTimeFormat(DATE_LOCALE[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);
    hebrew = day.hebrewDate;
    holiday = day.titles.join(' · ');
  } catch {
    return null;
  }
  if (!gregorian || !hebrew) return null;
  return (
    <div className="px-2 mb-4">
      <p className="text-[13px] text-zinc-500 leading-5">
        <span>{gregorian}</span>
        <span className="mx-1.5 text-zinc-300" aria-hidden="true">·</span>
        <span>{hebrew}</span>
      </p>
      {holiday ? <p className="mt-1 text-[15px] font-semibold leading-5 text-[#0D9488]">{holiday}</p> : null}
    </div>
  );
}
