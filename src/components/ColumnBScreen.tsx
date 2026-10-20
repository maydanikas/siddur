import { COLUMN_B_COPY, columnBWeeks } from '../columnB';
import type { Lang } from '../supportCopy';

const DATE_LOCALE: Record<Lang, string> = { ru: 'ru-RU', nl: 'nl-NL', en: 'en-GB', fr: 'fr-FR' };

function formatSaturday(iso: string, lang: Lang): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, 12).toLocaleDateString(DATE_LOCALE[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ColumnBScreen({ lang, onOpen }: { lang: Lang; onOpen: (iso: string) => void }) {
  const copy = COLUMN_B_COPY[lang];
  const weeks = columnBWeeks(lang);
  const readyCount = weeks.filter((week) => week.ready).length;

  return (
    <div className="px-4 pt-2 pb-10 ui-sans">
      <div className="px-2 mb-4">
        <p className="text-[11px] tracking-widest text-[#0D9488] font-semibold uppercase">{copy.kicker}</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-zinc-900">{copy.title}</h2>
        <p className="mt-2 text-[13px] leading-5 text-zinc-500">{copy.note}</p>
        <p className="mt-2 text-[13px] font-medium text-zinc-600">{copy.progress(readyCount, weeks.length)}</p>
      </div>
      <div className="space-y-2.5">
        {weeks.map((week) => (
          <button
            key={week.iso}
            type="button"
            onClick={() => onOpen(week.iso)}
            className="w-full text-left bg-white border border-zinc-200 rounded-2xl px-4 py-4 flex items-start justify-between gap-3 hover:border-[#0D9488]/40 hover:shadow-sm transition-all"
          >
            <div className="min-w-0">
              <p className="text-[12px] text-zinc-400">{formatSaturday(week.iso, lang)}</p>
              <p className="mt-1 font-medium text-[15px] leading-tight text-zinc-900">{week.portion}</p>
              <p className="mt-1 text-[13px] leading-5 text-zinc-500">{week.refs.join(' · ')}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                week.ready ? 'bg-teal-50 text-[#0D9488]' : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {week.ready ? copy.ready : copy.pending}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
