import type { Lang } from './supportCopy';

type ReadingCopy = {
  loading: string;
  error: string;
  next: string;
  home: string;
  draftCredit: string;
};

export const READING_COPY: Record<Lang, ReadingCopy> = {
  en: {
    loading: 'Loading the passage',
    error: 'The passage could not be loaded',
    next: 'Next passage',
    home: 'Back to the home screen',
    draftCredit: 'Draft for reading aloud. Not a published translation.',
  },
  ru: {
    loading: 'Загружаю отрывок',
    error: 'Не удалось загрузить отрывок',
    next: 'Следующий отрывок',
    home: 'На главный экран',
    draftCredit: 'Черновик для чтения вслух. Это не изданный перевод.',
  },
  nl: {
    loading: 'Het stuk wordt geladen',
    error: 'Het stuk kon niet worden geladen',
    next: 'Volgend stuk',
    home: 'Terug naar het beginscherm',
    draftCredit: 'Klad om voor te lezen. Geen uitgegeven vertaling.',
  },
  fr: {
    loading: 'Chargement du passage',
    error: 'Le passage n’a pas pu être chargé',
    next: 'Passage suivant',
    home: 'Retour à l’écran d’accueil',
    draftCredit: 'Brouillon pour la lecture à voix haute. Ce n’est pas une traduction publiée.',
  },
};
