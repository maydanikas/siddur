export type Lang = 'ru' | 'nl' | 'en' | 'fr';

export function isLang(value: string | null | undefined): value is Lang {
  return value === 'ru' || value === 'nl' || value === 'en' || value === 'fr';
}

/** Unknown / missing → English. */
export function resolveLang(value: string | null | undefined): Lang {
  return isLang(value) ? value : 'en';
}

/** Device language if supported, otherwise English. */
export function resolveSystemLang(): Lang {
  try {
    const tags = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
    for (const tag of tags) {
      const base = tag.toLowerCase().split('-')[0];
      if (isLang(base)) return base;
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
  donateNl: string;
  donateWorld: string;
  aboutLink: string;
  shareTitle: string;
};

export type ReminderCopy = {
  label: string;
  body: string;
  timeHint: string;
  enable: string;
  disable: string;
  sound: string;
  denied: string;
  unsupported: string;
  whileOpen: string;
  notifTitle: string;
  notifBody: string;
};

export const ABOUT_COPY: Record<Lang, AboutCopy> = {
  en: {
    title: 'About',
    source: 'This siddur is based on Tov Lehodot, the prayer book of a liberal Jewish community.',
    principle: 'We do not sell the Torah. We share it.',
    free: 'The siddur is free and will stay free.',
    support: 'Your support is not payment for prayers. It is help so the project can live and grow. Thank you for helping us fulfill this mitzvah.',
    button: 'Support the project',
    donateNl: 'Netherlands',
    donateWorld: 'World',
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
    donateNl: 'Нидерланды',
    donateWorld: 'Мир',
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
    donateNl: 'Nederland',
    donateWorld: 'Wereld',
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
    donateNl: 'Pays-Bas',
    donateWorld: 'Monde',
    aboutLink: 'À propos',
    shareTitle: 'Partagez l’application Shacharis',
  },
};

export const REMINDER_COPY: Record<Lang, ReminderCopy> = {
  en: {
    label: 'Reminder',
    body: 'Choose your time. The phone will remind you once a day, only if you turn it on.',
    timeHint: 'you can change it',
    enable: 'Turn on the reminder',
    disable: 'Turn off',
    sound: 'The sound is your phone’s usual notification sound. Turn it off here.',
    denied: 'Notifications are blocked in the phone settings.',
    unsupported: 'This browser cannot show reminders.',
    whileOpen: 'On this phone the reminder arrives while Shacharis is open.',
    notifTitle: 'Time for morning prayer',
    notifBody: 'Shacharis',
  },
  ru: {
    label: 'Напоминание',
    body: 'Выберите своё время. Телефон напомнит один раз в день. Только если вы сами включите.',
    timeHint: 'можно изменить',
    enable: 'Включить напоминание',
    disable: 'Выключить',
    sound: 'Звук — обычный звук уведомлений телефона. Выключается здесь же.',
    denied: 'Уведомления запрещены в настройках телефона.',
    unsupported: 'Этот браузер не показывает напоминания.',
    whileOpen: 'На этом телефоне напоминание приходит, пока Shacharis открыт.',
    notifTitle: 'Время утренней молитвы',
    notifBody: 'Shacharis',
  },
  nl: {
    label: 'Herinnering',
    body: 'Kies uw tijd. De telefoon herinnert u één keer per dag, alleen als u het zelf aanzet.',
    timeHint: 'u kunt dit wijzigen',
    enable: 'Herinnering aanzetten',
    disable: 'Uitzetten',
    sound: 'Het geluid is het gewone meldingsgeluid van uw telefoon. Uitzetten doet u hier.',
    denied: 'Meldingen zijn geblokkeerd in de telefooninstellingen.',
    unsupported: 'Deze browser kan geen herinneringen tonen.',
    whileOpen: 'Op deze telefoon komt de herinnering zolang Shacharis open is.',
    notifTitle: 'Tijd voor het ochtendgebed',
    notifBody: 'Shacharis',
  },
  fr: {
    label: 'Rappel',
    body: 'Choisissez votre heure. Le téléphone vous le rappelle une fois par jour, seulement si vous l’activez.',
    timeHint: 'vous pouvez la modifier',
    enable: 'Activer le rappel',
    disable: 'Désactiver',
    sound: 'Le son est celui des notifications du téléphone. Vous pouvez l’arrêter ici.',
    denied: 'Les notifications sont bloquées dans les réglages du téléphone.',
    unsupported: 'Ce navigateur ne peut pas afficher de rappels.',
    whileOpen: 'Sur ce téléphone, le rappel arrive tant que Shacharis est ouvert.',
    notifTitle: 'L’heure de la prière du matin',
    notifBody: 'Shacharis',
  },
};

type ControlsCopy = {
  tagline: string;
  previous: string;
  next: string;
  listen: string;
  play: string;
  pause: string;
  transliteration: string;
  translation: string;
  textSize: string;
  textSizeM: string;
  textSizeL: string;
  textSizeXl: string;
  backToList: string;
  selectPrayer: string;
  footer: string;
  dismiss: string;
  envelope: string;
  ttsNoHebrew: string;
};

export const CONTROLS_COPY: Record<Lang, ControlsCopy> = {
  en: {
    tagline: 'Shaharit • Morning Prayers',
    previous: 'Previous',
    next: 'Next',
    listen: 'Listen',
    play: 'Play',
    pause: 'Pause',
    transliteration: 'Transliteration',
    translation: 'Translation',
    textSize: 'Text size',
    textSizeM: 'Medium',
    textSizeL: 'Large',
    textSizeXl: 'Extra large',
    backToList: 'Back to prayer list',
    selectPrayer: 'Select a prayer to read, listen and translate. All {n} items in traditional order.',
    footer: 'Text displayed with niqqud. Tap a Hebrew word to hear it. Audio uses he-IL voice at 0.50x. Version 2.2, 2026',
    dismiss: 'Dismiss',
    envelope: 'A note from the project',
    ttsNoHebrew: 'This phone has no Hebrew voice. In the phone settings, choose Google Text-to-speech and download Hebrew.',
  },
  ru: {
    tagline: 'Шахарит • Утренние молитвы',
    previous: 'Назад',
    next: 'Далее',
    listen: 'Слушать',
    play: 'Воспроизвести',
    pause: 'Пауза',
    transliteration: 'Транслитерация',
    translation: 'Перевод',
    textSize: 'Размер текста',
    textSizeM: 'Обычный',
    textSizeL: 'Крупный',
    textSizeXl: 'Очень крупный',
    backToList: 'К списку молитв',
    selectPrayer: 'Выберите молитву: читать, слушать и переводить. Все {n} в традиционном порядке.',
    footer: 'Текст с никудом. Нажмите на ивритское слово, чтобы услышать его. Озвучка: голос he-IL, 0.50×. Version 2.2, 2026',
    dismiss: 'Закрыть',
    envelope: 'Записка от проекта',
    ttsNoHebrew: 'На этом телефоне нет ивритского голоса. В настройках выберите Google «Речь» и скачайте иврит.',
  },
  nl: {
    tagline: 'Sjachariet • Ochtendgebeden',
    previous: 'Vorige',
    next: 'Volgende',
    listen: 'Luisteren',
    play: 'Afspelen',
    pause: 'Pauzeren',
    transliteration: 'Transliteratie',
    translation: 'Vertaling',
    textSize: 'Tekstgrootte',
    textSizeM: 'Normaal',
    textSizeL: 'Groot',
    textSizeXl: 'Extra groot',
    backToList: 'Terug naar de lijst',
    selectPrayer: 'Kies een gebed om te lezen, te beluisteren en te vertalen. Alle {n} in traditionele volgorde.',
    footer: 'Tekst met nikud. Tik op een Hebreeuws woord om het te horen. Audio: he-IL-stem, 0.50×. Versie 2.2, 2026',
    dismiss: 'Sluiten',
    envelope: 'Een briefje van het project',
    ttsNoHebrew: 'Deze telefoon heeft geen Hebreeuwse stem. Kies in de instellingen Google Tekst-naar-spraak en download Hebreeuws.',
  },
  fr: {
    tagline: 'Chaharit • Prières du matin',
    previous: 'Précédent',
    next: 'Suivant',
    listen: 'Écouter',
    play: 'Lecture',
    pause: 'Pause',
    transliteration: 'Translittération',
    translation: 'Traduction',
    textSize: 'Taille du texte',
    textSizeM: 'Moyen',
    textSizeL: 'Grand',
    textSizeXl: 'Très grand',
    backToList: 'Retour à la liste',
    selectPrayer: 'Choisissez une prière pour lire, écouter et traduire. Les {n} dans l’ordre traditionnel.',
    footer: 'Texte avec niqqud. Touchez un mot hébreu pour l’entendre. Audio : voix he-IL, 0.50×. Version 2.2, 2026',
    dismiss: 'Fermer',
    envelope: 'Un mot du projet',
    ttsNoHebrew: 'Ce téléphone n’a pas de voix hébraïque. Dans les réglages, choisissez « Google Synthèse vocale » et téléchargez l’hébreu.',
  },
};

export function controlsCopy(lang: Lang): ControlsCopy {
  return CONTROLS_COPY[resolveLang(lang)];
}

export function aboutCopy(lang: Lang): AboutCopy {
  return ABOUT_COPY[resolveLang(lang)];
}
