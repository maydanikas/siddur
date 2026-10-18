import type { Lang } from './supportCopy';

type ReadingCopy = {
  loading: string;
  error: string;
  next: string;
  home: string;
};

export const READING_COPY: Record<Lang, ReadingCopy> = {
  en: {
    loading: 'Loading the passage',
    error: 'The passage could not be loaded',
    next: 'Next passage',
    home: 'Back to the home screen',
  },
  ru: {
    loading: 'Загружаю отрывок',
    error: 'Не удалось загрузить отрывок',
    next: 'Следующий отрывок',
    home: 'На главный экран',
  },
  nl: {
    loading: 'Het stuk wordt geladen',
    error: 'Het stuk kon niet worden geladen',
    next: 'Volgend stuk',
    home: 'Terug naar het beginscherm',
  },
  fr: {
    loading: 'Chargement du passage',
    error: 'Le passage n’a pas pu être chargé',
    next: 'Passage suivant',
    home: 'Retour à l’écran d’accueil',
  },
};
