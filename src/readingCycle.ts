export type CycleColumn = 'A' | 'B' | 'C';

/**
 * Levisson three-year cycle, Amsterdam 1985, updated 7 February 2014.
 * Each column is the outer reading: aliyot joined where the verses are continuous,
 * and left apart where the cycle skips. Optional alternatives are omitted.
 * Shabbat Shuva replaces the Haazinu haftarah; that rule lives in the schedule.
 */
export const READING_CYCLE = {
  bereshit: {
    A: { torah: [['genesis', 1, 1, 2, 25]], haftarah: [['isaiah', 42, 5, 42, 22], ['isaiah', 61, 10, 61, 10], ['isaiah', 62, 5, 62, 5]] },
    B: { torah: [['genesis', 3, 1, 4, 18]], haftarah: [['job', 38, 1, 38, 18]] },
    C: { torah: [['genesis', 4, 19, 6, 8]], haftarah: [['psalms', 104, 1, 104, 35]] },
  },
  noach: {
    A: { torah: [['genesis', 6, 9, 8, 5]], haftarah: [['isaiah', 54, 1, 55, 5]] },
    B: { torah: [['genesis', 8, 6, 9, 29]], haftarah: [['jeremiah', 31, 23, 31, 36]] },
    C: { torah: [['genesis', 10, 1, 11, 31]], haftarah: [['zephaniah', 3, 8, 3, 20]] },
  },
  lechLecha: {
    A: { torah: [['genesis', 12, 1, 13, 18]], haftarah: [['isaiah', 40, 27, 41, 16]] },
    B: { torah: [['genesis', 14, 1, 15, 21]], haftarah: [['joshua', 24, 1, 24, 26]] },
    C: { torah: [['genesis', 16, 1, 17, 27]], haftarah: [['joshua', 5, 1, 5, 15]] },
  },
  vayera: {
    A: { torah: [['genesis', 18, 1, 19, 29]], haftarah: [['iiKings', 4, 1, 4, 37]] },
    B: { torah: [['genesis', 19, 30, 21, 21]], haftarah: [['iSamuel', 1, 1, 1, 20]] },
    C: { torah: [['genesis', 21, 22, 22, 24]], haftarah: [['jeremiah', 19, 1, 19, 13], ['jeremiah', 20, 7, 20, 13]] },
  },
  chayeiSara: {
    A: { torah: [['genesis', 23, 1, 24, 14]], haftarah: [['iKings', 1, 1, 1, 31]] },
    B: { torah: [['genesis', 24, 15, 24, 52]], haftarah: [['proverbs', 31, 10, 31, 31]] },
    C: { torah: [['genesis', 24, 53, 25, 18]], haftarah: [['ruth', 1, 1, 1, 22]] },
  },
  toldot: {
    A: { torah: [['genesis', 25, 19, 26, 12]], haftarah: [['malachi', 1, 1, 2, 7]] },
    B: { torah: [['genesis', 26, 13, 27, 27]], haftarah: [['iKings', 1, 32, 1, 53]] },
    C: { torah: [['genesis', 27, 28, 28, 9]], haftarah: [['proverbs', 4, 1, 4, 27]] },
  },
  vayetze: {
    A: { torah: [['genesis', 28, 10, 29, 35]], haftarah: [['hosea', 11, 7, 13, 5]] },
    B: { torah: [['genesis', 30, 1, 30, 43]], haftarah: [['iKings', 3, 3, 3, 15]] },
    C: { torah: [['genesis', 31, 1, 32, 3]], haftarah: [['jeremiah', 30, 10, 30, 22]] },
  },
  vayishlach: {
    A: { torah: [['genesis', 32, 4, 33, 20]], haftarah: [['obadiah', 1, 1, 1, 21]] },
    B: { torah: [['genesis', 34, 1, 35, 15]], haftarah: [['joshua', 9, 1, 9, 20]] },
    C: { torah: [['genesis', 35, 16, 36, 43]], haftarah: [['jeremiah', 29, 1, 29, 14]] },
  },
  vayeshev: {
    A: { torah: [['genesis', 37, 1, 37, 36]], haftarah: [['amos', 2, 6, 3, 8]] },
    B: { torah: [['genesis', 38, 1, 38, 30]], haftarah: [['ruth', 4, 9, 4, 22]] },
    C: { torah: [['genesis', 39, 1, 40, 23]], haftarah: [['daniel', 2, 1, 2, 23]] },
  },
  miketz: {
    A: { torah: [['genesis', 41, 1, 41, 52]], haftarah: [['iKings', 3, 15, 4, 1]] },
    B: { torah: [['genesis', 41, 53, 43, 10]], haftarah: [['isaiah', 19, 16, 19, 25]] },
    C: { torah: [['genesis', 43, 11, 44, 17]], haftarah: [['job', 22, 1, 22, 22]] },
  },
  vayigash: {
    A: { torah: [['genesis', 44, 18, 45, 27]], haftarah: [['ezekiel', 37, 15, 37, 28]] },
    B: { torah: [['genesis', 45, 28, 46, 34]], haftarah: [['iiSamuel', 18, 24, 19, 9]] },
    C: { torah: [['genesis', 47, 1, 47, 27]], haftarah: [['job', 5, 3, 5, 27]] },
  },
  vayechi: {
    A: { torah: [['genesis', 47, 28, 48, 22], ['genesis', 50, 22, 50, 26]], haftarah: [['iKings', 2, 1, 2, 12]] },
    B: { torah: [['genesis', 49, 1, 49, 33], ['genesis', 50, 22, 50, 26]], haftarah: [['isaiah', 38, 9, 38, 20]] },
    C: { torah: [['genesis', 50, 1, 50, 26]], haftarah: [['iChronicles', 28, 1, 28, 10], ['iChronicles', 29, 10, 29, 20]] },
  },
  shemot: {
    A: { torah: [['exodus', 1, 1, 2, 25]], haftarah: [['isaiah', 27, 6, 28, 13], ['isaiah', 29, 22, 29, 23]] },
    B: { torah: [['exodus', 3, 1, 4, 17]], haftarah: [['iSamuel', 3, 1, 3, 21]] },
    C: { torah: [['exodus', 4, 18, 6, 1]], haftarah: [['iKings', 12, 1, 12, 15]] },
  },
  vaera: {
    A: { torah: [['exodus', 6, 2, 7, 13]], haftarah: [['ezekiel', 28, 25, 29, 21]] },
    B: { torah: [['exodus', 7, 14, 8, 28]], haftarah: [['ezekiel', 31, 1, 31, 18]] },
    C: { torah: [['exodus', 9, 1, 9, 35]], haftarah: [['iSamuel', 6, 1, 6, 16]] },
  },
  bo: {
    A: { torah: [['exodus', 10, 1, 11, 3]], haftarah: [['jeremiah', 46, 13, 46, 28]] },
    B: { torah: [['exodus', 11, 4, 12, 28]], haftarah: [['ezra', 6, 19, 7, 10]] },
    C: { torah: [['exodus', 12, 29, 13, 16]], haftarah: [['iiChronicles', 35, 1, 35, 19]] },
  },
  beshalach: {
    A: { torah: [['exodus', 13, 17, 14, 25]], haftarah: [['judges', 4, 4, 4, 24]] },
    B: { torah: [['exodus', 14, 26, 16, 10]], haftarah: [['nehemiah', 9, 5, 9, 23]] },
    C: { torah: [['exodus', 16, 11, 17, 16]], haftarah: [['iiKings', 4, 38, 4, 44]] },
  },
  yitro: {
    A: { torah: [['exodus', 18, 1, 18, 27]], haftarah: [['isaiah', 6, 1, 6, 13]] },
    B: { torah: [['exodus', 19, 1, 20, 14]], haftarah: [['isaiah', 43, 1, 43, 20]] },
    C: { torah: [['exodus', 19, 10, 20, 23]], haftarah: [['nehemiah', 8, 1, 8, 12]] },
  },
  mishpatim: {
    A: { torah: [['exodus', 21, 1, 22, 3]], haftarah: [['jeremiah', 34, 8, 34, 22], ['jeremiah', 33, 25, 33, 26]] },
    B: { torah: [['exodus', 22, 4, 23, 19]], haftarah: [['amos', 5, 4, 5, 24]] },
    C: { torah: [['exodus', 23, 20, 24, 18]], haftarah: [['psalms', 15, 1, 15, 5]] },
  },
  terumah: {
    A: { torah: [['exodus', 25, 1, 25, 40]], haftarah: [['iKings', 5, 26, 6, 13]] },
    B: { torah: [['exodus', 26, 1, 26, 30]], haftarah: [['iKings', 8, 1, 8, 21]] },
    C: { torah: [['exodus', 26, 31, 27, 19]], haftarah: [['iChronicles', 22, 1, 22, 13]] },
  },
  tetzaveh: {
    A: { torah: [['exodus', 27, 20, 28, 30]], haftarah: [['ezekiel', 43, 10, 43, 27]] },
    B: { torah: [['exodus', 28, 31, 29, 18]], haftarah: [['isaiah', 61, 1, 61, 9]] },
    C: { torah: [['exodus', 29, 19, 30, 10]], haftarah: [['isaiah', 65, 8, 65, 25]] },
  },
  kiTisa: {
    A: { torah: [['exodus', 30, 11, 31, 17]], haftarah: [['iiChronicles', 2, 1, 3, 2]] },
    B: { torah: [['exodus', 31, 18, 33, 11]], haftarah: [['iKings', 18, 20, 18, 39]] },
    C: { torah: [['exodus', 33, 12, 34, 35]], haftarah: [['joel', 3, 1, 3, 5], ['joel', 4, 18, 4, 21]] },
  },
  vayakhel: {
    A: { torah: [['exodus', 35, 1, 36, 7]], haftarah: [['iKings', 7, 40, 7, 50]] },
    B: { torah: [['exodus', 36, 8, 37, 9]], haftarah: [['iiChronicles', 4, 19, 5, 10]] },
    C: { torah: [['exodus', 37, 10, 38, 20]], haftarah: [['zechariah', 8, 9, 8, 23]] },
  },
  pekudei: {
    A: { torah: [['exodus', 38, 21, 39, 14], ['exodus', 40, 34, 40, 38]], haftarah: [['iKings', 7, 51, 8, 21]] },
    B: { torah: [['exodus', 39, 15, 39, 43], ['exodus', 40, 34, 40, 38]], haftarah: [['iKings', 8, 22, 8, 36]] },
    C: { torah: [['exodus', 40, 1, 40, 38]], haftarah: [['iKings', 8, 22, 8, 22]] },
  },
  vayakhelPekudei: {
    A: { torah: [['exodus', 35, 1, 36, 38], ['exodus', 40, 34, 40, 38]], haftarah: [['iKings', 7, 51, 8, 21]] },
    B: { torah: [['exodus', 37, 1, 39, 1], ['exodus', 40, 34, 40, 38]], haftarah: [['iKings', 8, 22, 8, 36]] },
    C: { torah: [['exodus', 39, 2, 40, 38]], haftarah: [['zechariah', 8, 9, 8, 23]] },
  },
  vayikra: {
    A: { torah: [['leviticus', 1, 1, 2, 16]], haftarah: [['isaiah', 43, 21, 44, 23]] },
    B: { torah: [['leviticus', 3, 1, 4, 26]], haftarah: [['hosea', 5, 1, 6, 6]] },
    C: { torah: [['leviticus', 4, 27, 5, 26]], haftarah: [['malachi', 2, 1, 3, 4]] },
  },
  tzav: {
    A: { torah: [['leviticus', 6, 1, 7, 10]], haftarah: [['jeremiah', 7, 21, 8, 3], ['jeremiah', 9, 22, 9, 23]] },
    B: { torah: [['leviticus', 7, 11, 7, 38]], haftarah: [['haggai', 2, 1, 2, 23]] },
    C: { torah: [['leviticus', 8, 1, 8, 36]], haftarah: [['psalms', 132, 1, 132, 18]] },
  },
  shemini: {
    A: { torah: [['leviticus', 9, 1, 10, 11]], haftarah: [['iiSamuel', 6, 1, 6, 19]] },
    B: { torah: [['leviticus', 9, 22, 11, 12]], haftarah: [['iiSamuel', 7, 1, 7, 17]] },
    C: { torah: [['leviticus', 11, 1, 11, 47]], haftarah: [['ecclesiastes', 6, 1, 7, 2]] },
  },
  tazria: {
    A: { torah: [['leviticus', 12, 1, 13, 23]], haftarah: [['iiKings', 4, 42, 5, 19]] },
    B: { torah: [['leviticus', 13, 9, 13, 39]], haftarah: [['iiChronicles', 26, 1, 26, 23]] },
    C: { torah: [['leviticus', 13, 24, 13, 59]], haftarah: [['job', 1, 13, 3, 1]] },
  },
  metzora: {
    A: { torah: [['leviticus', 14, 1, 14, 32]], haftarah: [['iiKings', 7, 3, 7, 20]] },
    B: { torah: [['leviticus', 14, 33, 14, 57]], haftarah: [['iiKings', 7, 3, 7, 20]] },
    C: { torah: [['leviticus', 15, 1, 15, 33]], haftarah: [['job', 13, 1, 14, 6]] },
  },
  tazriaMetzora: {
    A: { torah: [['leviticus', 12, 1, 13, 39]], haftarah: [['iiKings', 7, 3, 7, 20]] },
    B: { torah: [['leviticus', 13, 40, 14, 32]], haftarah: [['iiChronicles', 26, 1, 26, 23]] },
    C: { torah: [['leviticus', 14, 33, 15, 33]], haftarah: [['job', 1, 13, 3, 1]] },
  },
  acharei: {
    A: { torah: [['leviticus', 16, 1, 16, 34]], haftarah: [['amos', 9, 7, 9, 15]] },
    B: { torah: [['leviticus', 16, 20, 17, 16]], haftarah: [['isaiah', 59, 1, 59, 21]] },
    C: { torah: [['leviticus', 18, 1, 18, 30]], haftarah: [['ezekiel', 22, 1, 22, 19]] },
  },
  kedoshim: {
    A: { torah: [['leviticus', 19, 1, 19, 37]], haftarah: [['ezekiel', 20, 2, 20, 20]] },
    B: { torah: [['leviticus', 19, 1, 19, 37]], haftarah: [['isaiah', 5, 1, 5, 21]] },
    C: { torah: [['leviticus', 20, 1, 20, 27]], haftarah: [['iSamuel', 28, 3, 28, 25]] },
  },
  achareiKedoshim: {
    A: { torah: [['leviticus', 16, 1, 17, 16]], haftarah: [['amos', 9, 7, 9, 15]] },
    B: { torah: [['leviticus', 18, 1, 19, 18]], haftarah: [['isaiah', 5, 1, 5, 21]] },
    C: { torah: [['leviticus', 19, 19, 20, 27]], haftarah: [['iSamuel', 28, 3, 28, 25]] },
  },
  emor: {
    A: { torah: [['leviticus', 21, 1, 22, 16]], haftarah: [['ezekiel', 44, 15, 44, 31]] },
    B: { torah: [['leviticus', 22, 17, 23, 22]], haftarah: [['iiChronicles', 30, 1, 30, 21]] },
    C: { torah: [['leviticus', 23, 23, 24, 23]], haftarah: [['nehemiah', 8, 13, 9, 5]] },
  },
  behar: {
    A: { torah: [['leviticus', 25, 1, 25, 28]], haftarah: [['jeremiah', 32, 6, 32, 27]] },
    B: { torah: [['leviticus', 25, 13, 25, 43]], haftarah: [['nehemiah', 5, 1, 5, 13]] },
    C: { torah: [['leviticus', 25, 29, 26, 2]], haftarah: [['iiChronicles', 36, 11, 36, 23]] },
  },
  bechukotai: {
    A: { torah: [['leviticus', 26, 3, 26, 46], ['leviticus', 27, 29, 27, 34]], haftarah: [['jeremiah', 16, 19, 17, 14]] },
    B: { torah: [['leviticus', 26, 27, 27, 21], ['leviticus', 27, 29, 27, 34]], haftarah: [['micah', 3, 5, 4, 5]] },
    C: { torah: [['leviticus', 27, 1, 27, 34]], haftarah: [['isaiah', 24, 1, 24, 23]] },
  },
  beharBechukotai: {
    A: { torah: [['leviticus', 25, 1, 25, 46], ['leviticus', 27, 29, 27, 34]], haftarah: [['jeremiah', 16, 19, 17, 14]] },
    B: { torah: [['leviticus', 25, 47, 26, 46], ['leviticus', 27, 29, 27, 34]], haftarah: [['micah', 3, 5, 4, 5]] },
    C: { torah: [['leviticus', 27, 1, 27, 34]], haftarah: [['iiChronicles', 36, 11, 36, 23]] },
  },
  bamidbar: {
    A: { torah: [['numbers', 1, 1, 1, 54]], haftarah: [['hosea', 2, 1, 2, 22]] },
    B: { torah: [['numbers', 2, 1, 3, 13]], haftarah: [['iChronicles', 15, 1, 15, 15], ['iChronicles', 15, 26, 16, 4]] },
    C: { torah: [['numbers', 3, 14, 4, 20]], haftarah: [['nehemiah', 12, 27, 12, 47]] },
  },
  naso: {
    A: { torah: [['numbers', 4, 21, 5, 10]], haftarah: [['judges', 13, 2, 13, 25]] },
    B: { torah: [['numbers', 5, 11, 6, 27]], haftarah: [['judges', 16, 4, 16, 31]] },
    C: { torah: [['numbers', 7, 1, 7, 89]], haftarah: [['iiChronicles', 6, 1, 6, 17]] },
  },
  behaalotcha: {
    A: { torah: [['numbers', 8, 1, 9, 14]], haftarah: [['zechariah', 2, 14, 4, 7]] },
    B: { torah: [['numbers', 9, 15, 10, 34]], haftarah: [['joel', 2, 15, 3, 5]] },
    C: { torah: [['numbers', 10, 35, 12, 16]], haftarah: [['psalms', 78, 1, 78, 35]] },
  },
  shelach: {
    A: { torah: [['numbers', 13, 1, 14, 10]], haftarah: [['joshua', 2, 1, 2, 24]] },
    B: { torah: [['numbers', 14, 11, 14, 45]], haftarah: [['joshua', 14, 1, 14, 15]] },
    C: { torah: [['numbers', 15, 1, 15, 41]], haftarah: [['ecclesiastes', 4, 4, 5, 7]] },
  },
  korach: {
    A: { torah: [['numbers', 16, 1, 16, 35]], haftarah: [['iSamuel', 11, 14, 12, 22]] },
    B: { torah: [['numbers', 17, 1, 17, 28]], haftarah: [['ezekiel', 37, 15, 37, 28]] },
    C: { torah: [['numbers', 18, 1, 18, 32]], haftarah: [['psalms', 49, 1, 49, 21]] },
  },
  chukat: {
    A: { torah: [['numbers', 19, 1, 20, 6]], haftarah: [['judges', 11, 1, 11, 33]] },
    B: { torah: [['numbers', 20, 7, 21, 9]], haftarah: [['judges', 11, 29, 12, 7]] },
    C: { torah: [['numbers', 21, 4, 22, 1]], haftarah: [['joshua', 13, 1, 13, 14]] },
  },
  balak: {
    A: { torah: [['numbers', 22, 2, 22, 35]], haftarah: [['micah', 5, 6, 6, 8]] },
    B: { torah: [['numbers', 22, 36, 23, 30]], haftarah: [['nehemiah', 12, 27, 12, 30], ['nehemiah', 13, 1, 13, 22]] },
    C: { torah: [['numbers', 23, 27, 25, 9]], haftarah: [['psalms', 106, 1, 106, 48]] },
  },
  chukatBalak: {
    A: { torah: [['numbers', 19, 1, 21, 3]], haftarah: [['micah', 5, 6, 6, 8]] },
    B: { torah: [['numbers', 21, 4, 22, 35]], haftarah: [['nehemiah', 12, 27, 12, 30], ['nehemiah', 13, 1, 13, 22]] },
    C: { torah: [['numbers', 22, 36, 25, 9]], haftarah: [['psalms', 106, 1, 106, 48]] },
  },
  pinchas: {
    A: { torah: [['numbers', 25, 10, 26, 51]], haftarah: [['iKings', 18, 46, 19, 21]] },
    B: { torah: [['numbers', 26, 52, 28, 15]], haftarah: [['joshua', 17, 1, 17, 6], ['joshua', 17, 14, 18, 7]] },
    C: { torah: [['numbers', 28, 16, 30, 1]], haftarah: [['joshua', 22, 7, 22, 34]] },
  },
  matot: {
    A: { torah: [['numbers', 30, 2, 31, 24]], haftarah: [['jeremiah', 1, 1, 2, 3]] },
    B: { torah: [['numbers', 31, 21, 31, 54]], haftarah: [['jeremiah', 1, 1, 2, 3]] },
    C: { torah: [['numbers', 32, 1, 32, 42]], haftarah: [['jeremiah', 1, 1, 2, 3]] },
  },
  masei: {
    A: { torah: [['numbers', 33, 1, 33, 56], ['numbers', 36, 5, 36, 13]], haftarah: [['jeremiah', 2, 4, 2, 28], ['jeremiah', 3, 4, 3, 4], ['jeremiah', 4, 1, 4, 2]] },
    B: { torah: [['numbers', 34, 1, 35, 8], ['numbers', 36, 5, 36, 13]], haftarah: [['jeremiah', 2, 4, 2, 28], ['jeremiah', 3, 4, 3, 4], ['jeremiah', 4, 1, 4, 2]] },
    C: { torah: [['numbers', 35, 9, 36, 13]], haftarah: [['jeremiah', 2, 4, 2, 28], ['jeremiah', 3, 4, 3, 4], ['jeremiah', 4, 1, 4, 2]] },
  },
  matotMasei: {
    A: { torah: [['numbers', 30, 2, 31, 54], ['numbers', 36, 5, 36, 13]], haftarah: [['jeremiah', 2, 4, 2, 28], ['jeremiah', 3, 4, 3, 4], ['jeremiah', 4, 1, 4, 2]] },
    B: { torah: [['numbers', 32, 1, 33, 56], ['numbers', 36, 5, 36, 13]], haftarah: [['jeremiah', 2, 4, 2, 28], ['jeremiah', 3, 4, 3, 4], ['jeremiah', 4, 1, 4, 2]] },
    C: { torah: [['numbers', 34, 1, 36, 13]], haftarah: [['jeremiah', 2, 4, 2, 28], ['jeremiah', 3, 4, 3, 4], ['jeremiah', 4, 1, 4, 2]] },
  },
  devarim: {
    A: { torah: [['deuteronomy', 1, 1, 1, 38]], haftarah: [['isaiah', 1, 1, 1, 27]] },
    B: { torah: [['deuteronomy', 1, 39, 2, 30]], haftarah: [['isaiah', 1, 1, 1, 27]] },
    C: { torah: [['deuteronomy', 2, 31, 3, 22]], haftarah: [['isaiah', 1, 1, 1, 27]] },
  },
  vaetchanan: {
    A: { torah: [['deuteronomy', 3, 23, 4, 40]], haftarah: [['isaiah', 40, 1, 40, 26]] },
    B: { torah: [['deuteronomy', 4, 41, 5, 30]], haftarah: [['isaiah', 40, 1, 40, 26]] },
    C: { torah: [['deuteronomy', 6, 1, 7, 11]], haftarah: [['isaiah', 40, 1, 40, 26]] },
  },
  ekev: {
    A: { torah: [['deuteronomy', 7, 12, 9, 3]], haftarah: [['isaiah', 49, 14, 51, 3]] },
    B: { torah: [['deuteronomy', 9, 4, 10, 11]], haftarah: [['isaiah', 49, 14, 51, 3]] },
    C: { torah: [['deuteronomy', 10, 12, 11, 25]], haftarah: [['isaiah', 49, 14, 51, 3]] },
  },
  reeh: {
    A: { torah: [['deuteronomy', 11, 26, 13, 1]], haftarah: [['isaiah', 54, 11, 55, 5]] },
    B: { torah: [['deuteronomy', 13, 2, 14, 29]], haftarah: [['isaiah', 54, 11, 55, 5]] },
    C: { torah: [['deuteronomy', 15, 1, 16, 17]], haftarah: [['isaiah', 54, 11, 55, 5]] },
  },
  shoftim: {
    A: { torah: [['deuteronomy', 16, 18, 18, 8]], haftarah: [['isaiah', 51, 12, 52, 12]] },
    B: { torah: [['deuteronomy', 18, 9, 19, 21]], haftarah: [['isaiah', 51, 12, 52, 12]] },
    C: { torah: [['deuteronomy', 20, 1, 21, 9]], haftarah: [['isaiah', 51, 12, 52, 12]] },
  },
  kiTetse: {
    A: { torah: [['deuteronomy', 21, 10, 23, 9]], haftarah: [['isaiah', 54, 1, 54, 10]] },
    B: { torah: [['deuteronomy', 23, 10, 24, 13]], haftarah: [['isaiah', 54, 1, 54, 10]] },
    C: { torah: [['deuteronomy', 24, 14, 25, 19]], haftarah: [['isaiah', 54, 1, 54, 10]] },
  },
  kiTavo: {
    A: { torah: [['deuteronomy', 26, 1, 27, 10]], haftarah: [['isaiah', 60, 1, 60, 22]] },
    B: { torah: [['deuteronomy', 27, 1, 28, 14]], haftarah: [['isaiah', 60, 1, 60, 22]] },
    C: { torah: [['deuteronomy', 28, 1, 29, 8]], haftarah: [['isaiah', 60, 1, 60, 22]] },
  },
  nitzavim: {
    A: { torah: [['deuteronomy', 29, 9, 30, 20]], haftarah: [['isaiah', 61, 10, 63, 9]] },
    B: { torah: [['deuteronomy', 29, 9, 30, 20]], haftarah: [['isaiah', 61, 10, 63, 9]] },
    C: { torah: [['deuteronomy', 29, 9, 30, 20]], haftarah: [['isaiah', 61, 10, 63, 9]] },
  },
  vayelech: {
    A: { torah: [['deuteronomy', 31, 1, 31, 30]], haftarah: [['hosea', 14, 2, 14, 10], ['micah', 7, 18, 7, 20]] },
    B: { torah: [['deuteronomy', 31, 1, 31, 30]], haftarah: [['hosea', 14, 2, 14, 10], ['micah', 7, 18, 7, 20]] },
    C: { torah: [['deuteronomy', 31, 1, 31, 30]], haftarah: [['hosea', 14, 2, 14, 10], ['micah', 7, 18, 7, 20]] },
  },
  nitzavimVayelech: {
    A: { torah: [['deuteronomy', 29, 9, 30, 20], ['deuteronomy', 31, 25, 31, 30]], haftarah: [['isaiah', 61, 10, 63, 9]] },
    B: { torah: [['deuteronomy', 30, 1, 31, 13]], haftarah: [['isaiah', 61, 10, 63, 9]] },
    C: { torah: [['deuteronomy', 31, 1, 31, 30]], haftarah: [['isaiah', 61, 10, 63, 9]] },
  },
  haazinu: {
    A: { torah: [['deuteronomy', 32, 1, 32, 52]], haftarah: [['iiSamuel', 22, 1, 22, 51]] },
    B: { torah: [['deuteronomy', 32, 1, 32, 52]], haftarah: [['psalms', 18, 1, 18, 51]] },
    C: { torah: [['deuteronomy', 32, 1, 32, 52]], haftarah: [['iiSamuel', 22, 1, 22, 51]] },
  },
} as const;

export type CyclePortion = keyof typeof READING_CYCLE;
