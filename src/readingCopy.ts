import type { Lang } from './supportCopy';

type ReadingCopy = {
  loading: string;
  error: string;
  next: string;
  haftarah: string;
  home: string;
  translationCredit: string;
};

export const READING_COPY: Record<Lang, ReadingCopy> = {
  en: {
    loading: 'Loading the passage',
    error: 'The passage could not be loaded',
    next: 'Next',
    haftarah: 'Haftarah',
    home: 'Back to the home screen',
    translationCredit: 'AI translation from the Masoretic Hebrew text · CC0 1.0 — No Rights Reserved',
  },
  ru: {
    loading: 'Загружаю отрывок',
    error: 'Не удалось загрузить отрывок',
    next: 'Далее',
    haftarah: 'Гафтара',
    home: 'На главный экран',
    translationCredit: 'ИИ-перевод с масоретского текста на иврите · CC0 1.0 — No Rights Reserved',
  },
  nl: {
    loading: 'Het stuk wordt geladen',
    error: 'Het stuk kon niet worden geladen',
    next: 'Volgende',
    haftarah: 'Haftara',
    home: 'Terug naar het beginscherm',
    translationCredit: 'AI-vertaling uit de Hebreeuwse masoretische tekst · CC0 1.0 — No Rights Reserved',
  },
  fr: {
    loading: 'Chargement du passage',
    error: 'Le passage n’a pas pu être chargé',
    next: 'Suivant',
    haftarah: 'Haftara',
    home: 'Retour à l’écran d’accueil',
    translationCredit: 'Traduction par IA du texte massorétique hébreu · CC0 1.0 — No Rights Reserved',
  },
};
