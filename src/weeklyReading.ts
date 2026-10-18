import type { Lang } from './supportCopy';

/**
 * Shabbat Torah and haftarah readings for 5787, from the Levisson lists
 * “Sidrot 5786 (A)” and “Sidrot 5787 (B)”, checked against the three-year cycle.
 * A row is the reading of that Saturday. Optional passages are left out:
 * the second scroll on Vayeshev, and the Tekoema choices on Kedoshim.
 * Rosh Hashana points to a machzor and has no row.
 */

type Book =
  | 'genesis'
  | 'exodus'
  | 'leviticus'
  | 'numbers'
  | 'deuteronomy'
  | 'joshua'
  | 'judges'
  | 'iSamuel'
  | 'iiSamuel'
  | 'iKings'
  | 'iiKings'
  | 'isaiah'
  | 'jeremiah'
  | 'ezekiel'
  | 'hosea'
  | 'joel'
  | 'micah'
  | 'zechariah'
  | 'malachi'
  | 'job'
  | 'proverbs'
  | 'ezra'
  | 'nehemiah'
  | 'iiChronicles';

/** Book, start chapter, start verse, end chapter, end verse. */
type Ref = readonly [Book, number, number, number, number];

type PortionId =
  | 'haazinu'
  | 'sukkot'
  | 'simchatTorah'
  | 'bereshit'
  | 'noach'
  | 'lechLecha'
  | 'vayera'
  | 'chayeiSara'
  | 'toldot'
  | 'vayetze'
  | 'vayishlach'
  | 'vayeshev'
  | 'miketz'
  | 'vayigash'
  | 'vayechi'
  | 'shemot'
  | 'vaera'
  | 'bo'
  | 'beshalach'
  | 'yitro'
  | 'mishpatim'
  | 'terumah'
  | 'tetzaveh'
  | 'kiTisa'
  | 'vayakhel'
  | 'pekudei'
  | 'vayikra'
  | 'tzav'
  | 'shemini'
  | 'tazria'
  | 'metzora'
  | 'pesachChol'
  | 'acharei'
  | 'kedoshim'
  | 'emor'
  | 'behar'
  | 'bechukotai'
  | 'bamidbar'
  | 'naso'
  | 'behaalotcha'
  | 'shelach'
  | 'korach'
  | 'chukat'
  | 'balak'
  | 'pinchas'
  | 'matotMasei'
  | 'devarim'
  | 'vaetchanan'
  | 'ekev'
  | 'reeh'
  | 'shoftim'
  | 'kiTetse'
  | 'kiTavo'
  | 'nitzavimVayelech';

const PORTION: Record<PortionId, Record<Lang, string>> = {
  haazinu: { ru: 'Аазину', nl: 'Haäzinoe', en: 'Haazinu', fr: 'Haazinou' },
  sukkot: { ru: 'Суккот', nl: 'Soekot', en: 'Sukkot', fr: 'Soukkot' },
  simchatTorah: { ru: 'Симхат Тора', nl: 'Simchat Tora', en: 'Simchat Torah', fr: 'Simhat Torah' },
  bereshit: { ru: 'Берешит', nl: 'Berésjit', en: 'Bereshit', fr: 'Béréchit' },
  noach: { ru: 'Ноах', nl: 'Noach', en: 'Noach', fr: "Noa'h" },
  lechLecha: { ru: 'Лех-леха', nl: 'Lèch-Lecha', en: 'Lech-Lecha', fr: 'Lekh-Lekha' },
  vayera: { ru: 'Ваера', nl: 'Wajéra', en: 'Vayera', fr: 'Vayéra' },
  chayeiSara: { ru: 'Хаей Сара', nl: 'Chajé Sara', en: 'Chayei Sara', fr: 'Hayé Sara' },
  toldot: { ru: 'Толдот', nl: 'Toldot', en: 'Toldot', fr: 'Toldot' },
  vayetze: { ru: 'Ваеце', nl: 'Wajétsé', en: 'Vayetze', fr: 'Vayétsé' },
  vayishlach: { ru: 'Ваишлах', nl: 'Wajisjlach', en: 'Vayishlach', fr: "Vayichla'h" },
  vayeshev: { ru: 'Ваешев', nl: 'Wajésjèv', en: 'Vayeshev', fr: 'Vayéchev' },
  miketz: { ru: 'Микец', nl: 'Mikéts', en: 'Miketz', fr: 'Mikets' },
  vayigash: { ru: 'Ваигаш', nl: 'Wajigasj', en: 'Vayigash', fr: 'Vayigach' },
  vayechi: { ru: 'Ваехи', nl: 'Wajechi', en: 'Vayechi', fr: "Vaye'hi" },
  shemot: { ru: 'Шмот', nl: 'Sjemot', en: 'Shemot', fr: 'Chemot' },
  vaera: { ru: 'Ваэра', nl: 'Waéra', en: 'Vaera', fr: 'Vaéra' },
  bo: { ru: 'Бо', nl: 'Bo', en: 'Bo', fr: 'Bo' },
  beshalach: { ru: 'Бешалах', nl: 'Besjallach', en: 'Beshalach', fr: "Bechala'h" },
  yitro: { ru: 'Итро', nl: 'Jitro', en: 'Yitro', fr: 'Yitro' },
  mishpatim: { ru: 'Мишпатим', nl: 'Misjpatim', en: 'Mishpatim', fr: 'Michpatim' },
  terumah: { ru: 'Трума', nl: 'Teroema', en: 'Terumah', fr: 'Terouma' },
  tetzaveh: { ru: 'Тецаве', nl: 'Tetsawè', en: 'Tetzaveh', fr: 'Tetsavé' },
  kiTisa: { ru: 'Ки тиса', nl: 'Ki Tiesa', en: 'Ki Tisa', fr: 'Ki Tissa' },
  vayakhel: { ru: 'Ваякхель', nl: 'Wajakhél', en: 'Vayakhel', fr: 'Vayakhel' },
  pekudei: { ru: 'Пекудей', nl: 'Pekoedé', en: 'Pekudei', fr: 'Pekoudé' },
  vayikra: { ru: 'Ваикра', nl: 'Wajikra', en: 'Vayikra', fr: 'Vayikra' },
  tzav: { ru: 'Цав', nl: 'Tsav', en: 'Tzav', fr: 'Tsav' },
  shemini: { ru: 'Шмини', nl: 'Sjemini', en: 'Shemini', fr: 'Chemini' },
  tazria: { ru: 'Тазриа', nl: 'Tazria', en: 'Tazria', fr: 'Tazria' },
  metzora: { ru: 'Мецора', nl: 'Metsora', en: 'Metzora', fr: 'Metsora' },
  pesachChol: {
    ru: 'Песах, хол ха-моэд',
    nl: 'Chol HaMoëed Pesach',
    en: 'Chol HaMoed Pesach',
    fr: "Hol HaMoed de Pessa'h",
  },
  acharei: { ru: 'Ахарей мот', nl: 'Acharé-mot', en: 'Acharei Mot', fr: "A'haré mot" },
  kedoshim: { ru: 'Кдошим', nl: 'Kedosjim', en: 'Kedoshim', fr: 'Kedochim' },
  emor: { ru: 'Эмор', nl: 'Èmor', en: 'Emor', fr: 'Emor' },
  behar: { ru: 'Беар', nl: 'Behar', en: 'Behar', fr: 'Behar' },
  bechukotai: { ru: 'Бехукотай', nl: 'Bechoekotai', en: 'Bechukotai', fr: "Be'houkotaï" },
  bamidbar: { ru: 'Бемидбар', nl: 'Bemidbar', en: 'Bamidbar', fr: 'Bamidbar' },
  naso: { ru: 'Насо', nl: 'Naso', en: 'Naso', fr: 'Nasso' },
  behaalotcha: { ru: 'Беаалотха', nl: 'Behaälotecha', en: "Beha'alotcha", fr: 'Behaalotkha' },
  shelach: { ru: 'Шлах-леха', nl: 'Sjelach-Lecha', en: 'Shelach-Lecha', fr: "Chela'h-Lekha" },
  korach: { ru: 'Корах', nl: 'Korach', en: 'Korach', fr: "Kora'h" },
  chukat: { ru: 'Хукат', nl: 'Choekat', en: 'Chukat', fr: 'Houkat' },
  balak: { ru: 'Балак', nl: 'Balak', en: 'Balak', fr: 'Balak' },
  pinchas: { ru: 'Пинхас', nl: 'Pinchas', en: 'Pinchas', fr: "Pin'has" },
  matotMasei: { ru: 'Матот-Масей', nl: 'Mattot-Masé', en: 'Matot-Masei', fr: 'Matot-Massé' },
  devarim: { ru: 'Дварим', nl: 'Dewarim', en: 'Devarim', fr: 'Devarim' },
  vaetchanan: { ru: 'Ваэтханан', nl: 'Waëtchanan', en: 'Vaetchanan', fr: "Vaet'hanan" },
  ekev: { ru: 'Экев', nl: 'Ekev', en: 'Ekev', fr: 'Ekev' },
  reeh: { ru: 'Реэ', nl: 'Reë', en: "Re'eh", fr: 'Reé' },
  shoftim: { ru: 'Шофтим', nl: 'Sjoftim', en: 'Shoftim', fr: 'Choftim' },
  kiTetse: { ru: 'Ки теце', nl: 'Ki Tétsé', en: 'Ki Tetze', fr: 'Ki Tetsé' },
  kiTavo: { ru: 'Ки таво', nl: 'Ki Tawo', en: 'Ki Tavo', fr: 'Ki Tavo' },
  nitzavimVayelech: {
    ru: 'Ницавим-Ваелех',
    nl: 'Nitsawim-Wajelech',
    en: 'Nitzavim-Vayelech',
    fr: 'Nitsavim-Vayélekh',
  },
};

const BOOK: Record<Book, Record<Lang, string>> = {
  genesis: { ru: 'Берешит', nl: 'Berésjit', en: 'Genesis', fr: 'Beréchit' },
  exodus: { ru: 'Шмот', nl: 'Sjemot', en: 'Exodus', fr: 'Chemot' },
  leviticus: { ru: 'Ваикра', nl: 'Wajikra', en: 'Leviticus', fr: 'Vayikra' },
  numbers: { ru: 'Бемидбар', nl: 'Bemidbar', en: 'Numbers', fr: 'Bamidbar' },
  deuteronomy: { ru: 'Дварим', nl: 'Dewarim', en: 'Deuteronomy', fr: 'Devarim' },
  joshua: { ru: 'Йехошуа', nl: 'Jehosjoea', en: 'Joshua', fr: 'Josué' },
  judges: { ru: 'Шофтим', nl: 'Sjoftim', en: 'Judges', fr: 'Juges' },
  iSamuel: { ru: 'I Шмуэль', nl: 'I Sjmoeël', en: 'I Samuel', fr: 'I Samuel' },
  iiSamuel: { ru: 'II Шмуэль', nl: 'II Sjmoeël', en: 'II Samuel', fr: 'II Samuel' },
  iKings: { ru: 'I Мелахим', nl: 'I Koningen', en: 'I Kings', fr: 'I Rois' },
  iiKings: { ru: 'II Мелахим', nl: 'II Koningen', en: 'II Kings', fr: 'II Rois' },
  isaiah: { ru: 'Йешаягу', nl: 'Jesjajahoe', en: 'Isaiah', fr: 'Isaïe' },
  jeremiah: { ru: 'Ирмеягу', nl: 'Jirmejahoe', en: 'Jeremiah', fr: 'Jérémie' },
  ezekiel: { ru: 'Йехезкель', nl: 'Jechezkeel', en: 'Ezekiel', fr: 'Ézéchiel' },
  hosea: { ru: 'Ошеа', nl: 'Hosjea', en: 'Hosea', fr: 'Osée' },
  joel: { ru: 'Йоэль', nl: 'Joël', en: 'Joel', fr: 'Joël' },
  micah: { ru: 'Миха', nl: 'Micha', en: 'Micah', fr: 'Michée' },
  zechariah: { ru: 'Зехарья', nl: 'Zecharja', en: 'Zechariah', fr: 'Zacharie' },
  malachi: { ru: 'Малахи', nl: 'Malachi', en: 'Malachi', fr: 'Malachie' },
  job: { ru: 'Иов', nl: 'Job', en: 'Job', fr: 'Job' },
  proverbs: { ru: 'Мишлей', nl: 'Misjlé', en: 'Proverbs', fr: 'Proverbes' },
  ezra: { ru: 'Эзра', nl: 'Ezra', en: 'Ezra', fr: 'Esdras' },
  nehemiah: { ru: 'Нехемья', nl: 'Nechemja', en: 'Nehemiah', fr: 'Néhémie' },
  iiChronicles: { ru: 'II Диврей га-ямим', nl: 'II Kronieken', en: 'II Chronicles', fr: 'II Chroniques' },
};

const ref = (book: Book, c1: number, v1: number, c2 = c1, v2 = v1): Ref => [book, c1, v1, c2, v2];

type Row = { date: string; portion: PortionId; torah: Ref[]; haftarah?: Ref[] };

const READINGS: Row[] = [
  { date: '2026-09-19', portion: 'haazinu', torah: [ref('deuteronomy', 32, 1, 32, 52)], haftarah: [ref('iiSamuel', 22, 1, 22, 51)] },
  {
    date: '2026-09-26',
    portion: 'sukkot',
    torah: [ref('leviticus', 23, 1, 23, 44), ref('deuteronomy', 28, 1, 28, 6)],
    haftarah: [ref('iKings', 8, 2, 8, 21)],
  },
  {
    date: '2026-10-03',
    portion: 'simchatTorah',
    torah: [ref('deuteronomy', 33, 1, 34, 12), ref('genesis', 1, 1, 2, 3), ref('leviticus', 23, 33, 23, 38)],
    haftarah: [ref('joshua', 1, 1, 1, 9)],
  },
  { date: '2026-10-10', portion: 'bereshit', torah: [ref('genesis', 3, 1, 4, 18)], haftarah: [ref('job', 38, 1, 38, 18)] },
  { date: '2026-10-17', portion: 'noach', torah: [ref('genesis', 8, 6, 9, 29)], haftarah: [ref('jeremiah', 31, 23, 31, 36)] },
  { date: '2026-10-24', portion: 'lechLecha', torah: [ref('genesis', 14, 1, 15, 21)], haftarah: [ref('joshua', 24, 1, 24, 26)] },
  { date: '2026-10-31', portion: 'vayera', torah: [ref('genesis', 19, 30, 21, 21)], haftarah: [ref('iSamuel', 1, 1, 1, 20)] },
  { date: '2026-11-07', portion: 'chayeiSara', torah: [ref('genesis', 24, 15, 24, 52)], haftarah: [ref('proverbs', 31, 10, 31, 31)] },
  { date: '2026-11-14', portion: 'toldot', torah: [ref('genesis', 26, 13, 27, 27)], haftarah: [ref('iKings', 1, 32, 1, 53)] },
  { date: '2026-11-21', portion: 'vayetze', torah: [ref('genesis', 30, 1, 30, 43)], haftarah: [ref('iKings', 3, 3, 3, 15)] },
  { date: '2026-11-28', portion: 'vayishlach', torah: [ref('genesis', 34, 1, 35, 15)], haftarah: [ref('joshua', 9, 1, 9, 20)] },
  { date: '2026-12-05', portion: 'vayeshev', torah: [ref('genesis', 38, 1, 38, 30)], haftarah: [ref('zechariah', 2, 14, 4, 7)] },
  {
    date: '2026-12-12',
    portion: 'miketz',
    torah: [ref('genesis', 41, 53, 43, 10), ref('numbers', 7, 54, 7, 59)],
    haftarah: [ref('iKings', 7, 40, 7, 50)],
  },
  { date: '2026-12-19', portion: 'vayigash', torah: [ref('genesis', 45, 28, 46, 34)], haftarah: [ref('iiSamuel', 18, 24, 19, 9)] },
  {
    date: '2026-12-26',
    portion: 'vayechi',
    torah: [ref('genesis', 49, 1, 49, 33), ref('genesis', 50, 22, 50, 26)],
    haftarah: [ref('isaiah', 38, 9, 38, 20)],
  },
  { date: '2027-01-02', portion: 'shemot', torah: [ref('exodus', 3, 1, 4, 17)], haftarah: [ref('iSamuel', 3, 1, 3, 21)] },
  {
    date: '2027-01-09',
    portion: 'vaera',
    torah: [ref('exodus', 7, 14, 8, 28), ref('genesis', 1, 14, 1, 19)],
    haftarah: [ref('isaiah', 66, 10, 66, 23)],
  },
  { date: '2027-01-16', portion: 'bo', torah: [ref('exodus', 11, 4, 12, 28)], haftarah: [ref('ezra', 6, 19, 7, 10)] },
  { date: '2027-01-23', portion: 'beshalach', torah: [ref('exodus', 14, 26, 16, 10)], haftarah: [ref('nehemiah', 9, 5, 9, 23)] },
  { date: '2027-01-30', portion: 'yitro', torah: [ref('exodus', 19, 1, 20, 14)], haftarah: [ref('isaiah', 43, 1, 43, 20)] },
  { date: '2027-02-06', portion: 'mishpatim', torah: [ref('exodus', 22, 4, 23, 19)], haftarah: [ref('iSamuel', 20, 18, 20, 42)] },
  { date: '2027-02-13', portion: 'terumah', torah: [ref('exodus', 26, 1, 26, 30)], haftarah: [ref('iKings', 8, 1, 8, 21)] },
  { date: '2027-02-20', portion: 'tetzaveh', torah: [ref('exodus', 28, 31, 29, 18)], haftarah: [ref('isaiah', 61, 1, 61, 9)] },
  { date: '2027-02-27', portion: 'kiTisa', torah: [ref('exodus', 31, 18, 33, 11)], haftarah: [ref('iKings', 18, 20, 18, 39)] },
  {
    date: '2027-03-06',
    portion: 'vayakhel',
    torah: [ref('exodus', 36, 8, 37, 9), ref('exodus', 30, 11, 30, 16)],
    haftarah: [ref('iiKings', 12, 1, 12, 17)],
  },
  {
    date: '2027-03-13',
    portion: 'pekudei',
    torah: [ref('exodus', 39, 15, 39, 43), ref('exodus', 40, 34, 40, 38)],
    haftarah: [ref('iKings', 7, 40, 7, 50)],
  },
  {
    date: '2027-03-20',
    portion: 'vayikra',
    torah: [ref('leviticus', 3, 1, 4, 26), ref('deuteronomy', 25, 17, 25, 19)],
    haftarah: [ref('iSamuel', 15, 2, 15, 34)],
  },
  { date: '2027-03-27', portion: 'tzav', torah: [ref('leviticus', 7, 11, 7, 38)], haftarah: [ref('ezekiel', 36, 16, 36, 36)] },
  {
    date: '2027-04-03',
    portion: 'shemini',
    torah: [ref('leviticus', 9, 22, 11, 12), ref('exodus', 12, 1, 12, 20)],
    haftarah: [ref('ezra', 7, 1, 7, 28)],
  },
  { date: '2027-04-10', portion: 'tazria', torah: [ref('leviticus', 13, 9, 13, 39)], haftarah: [ref('iiChronicles', 26, 1, 26, 23)] },
  { date: '2027-04-17', portion: 'metzora', torah: [ref('leviticus', 14, 33, 14, 57)], haftarah: [ref('malachi', 3, 4, 3, 24)] },
  {
    date: '2027-04-24',
    portion: 'pesachChol',
    torah: [ref('exodus', 34, 1, 34, 26), ref('deuteronomy', 10, 12, 10, 19)],
    haftarah: [ref('ezekiel', 37, 1, 37, 14)],
  },
  { date: '2027-05-01', portion: 'acharei', torah: [ref('leviticus', 16, 20, 17, 16)], haftarah: [ref('isaiah', 59, 1, 59, 21)] },
  { date: '2027-05-08', portion: 'kedoshim', torah: [ref('leviticus', 19, 1, 19, 37)] },
  { date: '2027-05-15', portion: 'emor', torah: [ref('leviticus', 22, 17, 23, 22)], haftarah: [ref('iiChronicles', 30, 1, 30, 21)] },
  { date: '2027-05-22', portion: 'behar', torah: [ref('leviticus', 25, 13, 25, 43)], haftarah: [ref('nehemiah', 5, 1, 5, 13)] },
  {
    date: '2027-05-29',
    portion: 'bechukotai',
    torah: [ref('leviticus', 26, 27, 27, 21), ref('leviticus', 27, 29, 27, 34)],
    haftarah: [ref('micah', 3, 5, 4, 5)],
  },
  { date: '2027-06-05', portion: 'bamidbar', torah: [ref('numbers', 2, 1, 3, 13)], haftarah: [ref('iSamuel', 20, 18, 20, 42)] },
  { date: '2027-06-12', portion: 'naso', torah: [ref('numbers', 5, 11, 6, 27)], haftarah: [ref('judges', 16, 4, 16, 31)] },
  { date: '2027-06-19', portion: 'behaalotcha', torah: [ref('numbers', 9, 15, 10, 34)], haftarah: [ref('joel', 2, 15, 3, 5)] },
  { date: '2027-06-26', portion: 'shelach', torah: [ref('numbers', 14, 11, 14, 45)], haftarah: [ref('joshua', 14, 1, 14, 15)] },
  { date: '2027-07-03', portion: 'korach', torah: [ref('numbers', 17, 1, 17, 28)], haftarah: [ref('ezekiel', 37, 15, 37, 28)] },
  { date: '2027-07-10', portion: 'chukat', torah: [ref('numbers', 20, 7, 21, 9)], haftarah: [ref('judges', 11, 29, 12, 7)] },
  {
    date: '2027-07-17',
    portion: 'balak',
    torah: [ref('numbers', 22, 36, 23, 30)],
    haftarah: [ref('nehemiah', 12, 27, 12, 30), ref('nehemiah', 13, 1, 13, 22)],
  },
  { date: '2027-07-24', portion: 'pinchas', torah: [ref('numbers', 26, 52, 28, 15)], haftarah: [ref('jeremiah', 1, 1, 2, 3)] },
  {
    date: '2027-07-31',
    portion: 'matotMasei',
    torah: [ref('numbers', 32, 1, 32, 42), ref('numbers', 33, 1, 33, 56), ref('numbers', 36, 5, 36, 13)],
    haftarah: [ref('jeremiah', 2, 4, 2, 28), ref('jeremiah', 3, 4, 3, 4), ref('jeremiah', 4, 1, 4, 2)],
  },
  { date: '2027-08-07', portion: 'devarim', torah: [ref('deuteronomy', 1, 39, 2, 30)], haftarah: [ref('isaiah', 1, 1, 1, 27)] },
  { date: '2027-08-14', portion: 'vaetchanan', torah: [ref('deuteronomy', 4, 41, 5, 30)], haftarah: [ref('isaiah', 40, 1, 40, 26)] },
  { date: '2027-08-21', portion: 'ekev', torah: [ref('deuteronomy', 9, 4, 10, 11)], haftarah: [ref('isaiah', 49, 14, 51, 3)] },
  { date: '2027-08-28', portion: 'reeh', torah: [ref('deuteronomy', 13, 2, 14, 29)], haftarah: [ref('isaiah', 54, 11, 55, 5)] },
  { date: '2027-09-04', portion: 'shoftim', torah: [ref('deuteronomy', 18, 9, 19, 21)], haftarah: [ref('isaiah', 51, 12, 52, 12)] },
  { date: '2027-09-11', portion: 'kiTetse', torah: [ref('deuteronomy', 23, 10, 24, 13)], haftarah: [ref('isaiah', 54, 1, 54, 10)] },
  { date: '2027-09-18', portion: 'kiTavo', torah: [ref('deuteronomy', 27, 1, 28, 14)], haftarah: [ref('isaiah', 60, 1, 60, 22)] },
  {
    date: '2027-09-25',
    portion: 'nitzavimVayelech',
    torah: [ref('deuteronomy', 30, 1, 31, 13)],
    haftarah: [ref('isaiah', 61, 10, 63, 9)],
  },
  {
    date: '2027-10-09',
    portion: 'haazinu',
    torah: [ref('deuteronomy', 32, 1, 32, 52)],
    haftarah: [ref('hosea', 14, 2, 14, 10), ref('micah', 7, 18, 7, 20)],
  },
  {
    date: '2027-10-16',
    portion: 'sukkot',
    torah: [ref('leviticus', 23, 1, 23, 44), ref('deuteronomy', 28, 1, 28, 6)],
    haftarah: [ref('iKings', 8, 2, 8, 21)],
  },
  {
    date: '2027-10-23',
    portion: 'simchatTorah',
    torah: [ref('deuteronomy', 33, 1, 34, 12), ref('genesis', 1, 1, 2, 3), ref('leviticus', 23, 33, 23, 38)],
    haftarah: [ref('joshua', 1, 1, 1, 9)],
  },
];

const BY_DATE = new Map(READINGS.map((row) => [row.date, row]));

function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The Saturday of the week that contains this local date. Saturday stays itself. */
export function shabbatOfWeek(date: Date): string {
  const saturday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  saturday.setDate(saturday.getDate() + (6 - saturday.getDay()));
  return localIso(saturday);
}

const SEFARIA_BOOK: Record<Book, string> = {
  genesis: 'Genesis',
  exodus: 'Exodus',
  leviticus: 'Leviticus',
  numbers: 'Numbers',
  deuteronomy: 'Deuteronomy',
  joshua: 'Joshua',
  judges: 'Judges',
  iSamuel: 'I_Samuel',
  iiSamuel: 'II_Samuel',
  iKings: 'I_Kings',
  iiKings: 'II_Kings',
  isaiah: 'Isaiah',
  jeremiah: 'Jeremiah',
  ezekiel: 'Ezekiel',
  hosea: 'Hosea',
  joel: 'Joel',
  micah: 'Micah',
  zechariah: 'Zechariah',
  malachi: 'Malachi',
  job: 'Job',
  proverbs: 'Proverbs',
  ezra: 'Ezra',
  nehemiah: 'Nehemiah',
  iiChronicles: 'II_Chronicles',
};

function formatRef(span: Ref, lang: Lang): string {
  const [book, c1, v1, c2, v2] = span;
  const end = c1 === c2 ? String(v2) : `${c2}:${v2}`;
  return `${BOOK[book][lang]} ${c1}:${v1}–${end}`;
}

/** The Sefaria page for this exact range. A gap stays two addresses, not one wider range. */
export function sefariaUrl(span: Ref): string {
  const [book, c1, v1, c2, v2] = span;
  const end = c1 === c2 ? String(v2) : `${c2}.${v2}`;
  return `https://www.sefaria.org/${SEFARIA_BOOK[book]}.${c1}.${v1}-${end}`;
}

export type WeeklyReadingPart = { text: string; href?: string };

/** Name, then each Torah span, then each haftarah span. Empty when this week has no listed reading. */
export function weeklyReadingParts(date: Date, lang: Lang): WeeklyReadingPart[] {
  const row = BY_DATE.get(shabbatOfWeek(date));
  if (!row) return [];
  const parts: WeeklyReadingPart[] = [{ text: PORTION[row.portion][lang] }];
  for (const span of [...row.torah, ...(row.haftarah ?? [])]) {
    parts.push({ text: formatRef(span, lang), href: sefariaUrl(span) });
  }
  return parts;
}

/** The home-screen line for this week's Shabbat reading, or an empty string. */
export function weeklyReadingLine(date: Date, lang: Lang): string {
  return weeklyReadingParts(date, lang).map((part) => part.text).join(' · ');
}

export const weeklyReadingDates = READINGS.map((row) => row.date);
