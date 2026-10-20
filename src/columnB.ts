import { draftStarts } from './readingDraft.ts';
import type { Lang } from './supportCopy';
import { weeklyReadingDates, weeklyReadingParts, weeklyReadingPassages } from './weeklyReading.ts';

export type ColumnBWeek = {
  iso: string;
  portion: string;
  refs: string[];
  ready: boolean;
};

export const COLUMN_B_COPY: Record<
  Lang,
  { kicker: string; title: string; note: string; ready: string; pending: string; list: string; progress: (ready: number, total: number) => string }
> = {
  ru: {
    kicker: 'Предпросмотр',
    title: 'Год Б',
    note: 'Готовые переводы открываются в той же рамке, что и на карточке чтения.',
    ready: 'готово',
    pending: 'ещё нет',
    list: 'К списку',
    progress: (ready, total) => `${ready} готово из ${total}`,
  },
  nl: {
    kicker: 'Voorbeeld',
    title: 'Jaar B',
    note: 'Afgewerkte vertalingen openen in hetzelfde kader als de leeskaart.',
    ready: 'klaar',
    pending: 'nog niet',
    list: 'Naar de lijst',
    progress: (ready, total) => `${ready} van ${total} klaar`,
  },
  en: {
    kicker: 'Preview',
    title: 'Year B',
    note: 'Finished translations open in the same frame as the reading card.',
    ready: 'ready',
    pending: 'not yet',
    list: 'Back to the list',
    progress: (ready, total) => `${ready} of ${total} ready`,
  },
  fr: {
    kicker: 'Aperçu',
    title: 'Année B',
    note: 'Les traductions terminées s’ouvrent dans le même cadre que la carte de lecture.',
    ready: 'prêt',
    pending: 'pas encore',
    list: 'Vers la liste',
    progress: (ready, total) => `${ready} sur ${total} prêts`,
  },
};

/** Local noon on the Saturday written in the sheet, so the week does not slip a day. */
export function columnBSaturday(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/** Every Shabbat on the 5787 sheet, in order. Ready means every span already has a draft line. */
export function columnBWeeks(lang: Lang): ColumnBWeek[] {
  return weeklyReadingDates.map((iso) => {
    const date = columnBSaturday(iso);
    const parts = weeklyReadingParts(date, lang);
    const passages = weeklyReadingPassages(date, lang);
    return {
      iso,
      portion: parts[0]?.text ?? '',
      refs: parts.slice(1).map((part) => part.text),
      ready: passages.length > 0 && passages.every((passage) => draftStarts(passage.ref)),
    };
  });
}
