export type Lang = 'ru' | 'nl' | 'en' | 'fr';

const SUPPORTED_LANGS: Lang[] = ['ru', 'nl', 'en', 'fr'];

/** UI copy (About) follows the device language. Prayer translation (`shacharis_lang`) is separate. */
export function resolveSystemLang(): Lang {
  try {
    const tags = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
    for (const tag of tags) {
      const base = tag.toLowerCase().split('-')[0] as Lang;
      if (SUPPORTED_LANGS.includes(base)) return base;
    }
  } catch {
    /* private mode / non-browser */
  }
  return 'en';
}

type AboutCopy = {
  title: string;
  source: string;
  principle: string;
  free: string;
  support: string;
  button: string;
  aboutLink: string;
  shareTitle: string;
};

export const ABOUT_COPY: Record<Lang, AboutCopy> = {
  en: {
    title: 'About',
    source: 'This siddur is based on Tov Lehodot, the prayer book of a liberal Jewish community.',
    principle: 'We do not sell the Torah. We share it.',
    free: 'The siddur is free and will stay free.',
    support: 'Your support is not payment for prayers. It is help so the project can live and grow. Thank you for helping us fulfill this mitzvah.',
    button: 'Support the project',
    aboutLink: 'About',
    shareTitle: 'Share the Shacharis app',
  },
  ru: {
    title: 'О приложении',
    source: 'Этот сидур основан на молитвеннике Tov Lehodot либеральной еврейской общины.',
    principle: 'Мы не продаём Тору. Мы делимся ею.',
    free: 'Сидур бесплатный и таким останется.',
    support: 'Ваша поддержка — это не плата за молитвы, это помощь в том, чтобы проект жил и развивался. Спасибо, что помогаете нам исполнять эту заповедь.',
    button: 'Поддержать проект',
    aboutLink: 'О проекте',
    shareTitle: 'Поделитесь приложением Shacharis',
  },
  nl: {
    title: 'Over deze app',
    source: 'Dit siddur is gebaseerd op Tov Lehodot, het gebedenboek van een liberale Joodse gemeenschap.',
    principle: 'Wij verkopen de Tora niet. Wij delen haar.',
    free: 'Het siddur is gratis en blijft gratis.',
    support: 'Uw steun is geen betaling voor gebeden. Het is hulp zodat het project kan leven en groeien. Dank dat u ons helpt deze mitswa te vervullen.',
    button: 'Steun het project',
    aboutLink: 'Over',
    shareTitle: 'Deel de Shacharis-app',
  },
  fr: {
    title: 'À propos',
    source: 'Ce siddour s’appuie sur Tov Lehodot, le livre de prières d’une communauté juive libérale.',
    principle: 'Nous ne vendons pas la Torah. Nous la partageons.',
    free: 'Le siddour est libre et le restera.',
    support: 'Votre soutien n’est pas un paiement pour les prières. C’est une aide pour que le projet vive et se développe. Merci de nous aider à accomplir cette mitsva.',
    button: 'Soutenir le projet',
    aboutLink: 'À propos',
    shareTitle: 'Partagez l’application Shacharis',
  },
};
