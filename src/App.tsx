import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import AboutScreen from './components/AboutScreen';
import SupportEnvelope from './components/SupportEnvelope';
import { shouldShowSupportEnvelope, snoozeSupportEnvelope } from './support';
import { ABOUT_COPY, controlsCopy, resolveLang, resolveSystemLang, type Lang } from './supportCopy';

type BelowHe = 'translation' | 'translit';
type TypeSize = 'm' | 'l' | 'xl';

function resolveBelowHe(value: string | null | undefined): BelowHe {
  return value === 'translit' ? 'translit' : 'translation';
}

function resolveTypeSize(value: string | null | undefined): TypeSize {
  if (value === 'l' || value === 'xl') return value;
  return 'm';
}

const TYPE_SCALE: Record<TypeSize, { he: number; instruction: number; translit: number; translation: number }> = {
  m: { he: 26, instruction: 15, translit: 14, translation: 15 },
  l: { he: 32, instruction: 17, translit: 17, translation: 18 },
  xl: { he: 40, instruction: 20, translit: 21, translation: 22 },
};

type Prayer = {
  id: number;
  titleEn: string;
  titleHe: string;
  he_display: string;
  he_tts: string;
  translit: string;
  ru: string;
  nl: string;
  en: string;
  fr: string;
};

const prayers: Prayer[] = [
  {
    id: 1,
    titleEn: "Modeh Ani",
    titleHe: "מוֹדֶה / מוֹדָה אֲנִי",
    he_display: "מוֹדֶה / מוֹדָה אֲנִי לְפָנֶיךָ, מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
    he_tts: "מוֹדֶה אֲנִי לְפָנֶיךָ, מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
    translit: "Modeh / Modah ani lefanecha Melech chai vekayam, shehechezarta bi nishmati bechemlah, rabbah emunatecha.",
    ru: "Благодарю Тебя, Царь живой и вечный, за то, что Ты по милости Своей возвратил мне душу мою. Велика вера в Тебя.",
    nl: "Ik dank U, levende en eeuwige Koning, dat U in genade mijn ziel in mij hebt teruggegeven. Groot is Uw trouw.",
    en: "I give thanks before You, Living and Eternal King, for You have mercifully restored my soul within me. Great is Your faithfulness.",
    fr: "Je Te rends grâce devant Toi, Roi vivant et éternel, car Tu m’as rendu mon âme avec miséricorde. Grande est Ta fidélité."
},
{
  id: 2,
  titleEn: "Reishit Chochma",
  titleHe: "רֵאשִׁית חָכְמָה",
  he_display: "רֵאשִׁית חָכְמָה יִרְאַת יְיָ, שֵׂכֶל טוֹב לְכָל־עֹשֵׂיהֶם, תְּהִלָּתוֹ עוֹמֶדֶת לָעַד.\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.",
  he_tts: "רֵאשִׁית חָכְמָה יִרְאַת אֲדֹנָי, שֵׂכֶל טוֹב לְכֹל־עֹשֵׂיהֶם, תְּהִלָּתוֹ עוֹמֶדֶת לָעַד.\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.",
  translit: "Reishit chochmah yir'at Adonai, sechel tov lechol oseihem, tehillato omedet la'ad. Baruch shem kevod malchuto le'olam va'ed.",
  ru: "Начало мудрости — трепет пред Господом; разум добрый у всех исполняющих их, хвала Его пребывает вовек. Благословенно славное имя Царства Его во веки веков.",
  nl: "Het begin van wijsheid is ontzag voor de Eeuwige, goed inzicht hebben allen die ze volbrengen, Zijn lof houdt stand voor eeuwig. Gezegend is de Naam van Zijn koninklijke glorie voor altijd.",
  en: "The beginning of wisdom is fear of the Lord, good understanding have all who do them, His praise endures forever. Blessed be the Name of His glorious kingdom forever and ever.",
  fr: "Le commencement de la sagesse est la crainte de l’Éternel, le bon sens est pour tous ceux qui les accomplissent, Sa louange subsiste à jamais. Béni soit le Nom de Son règne glorieux à tout jamais."
},
{
  id: 3,
  titleEn: "Torah Tziva",
  titleHe: "תּוֹרָה צִוָּה",
  he_display: "תּוֹרָה צִוָּה לָנוּ מֹשֶׁה, מוֹרָשָׁה קְהִלַּת יַעֲקֹב.",
  he_tts: "תּוֹרָה צִוָּה לָנוּ מֹשֶׁה, מוֹרָשָׁה קְהִלַּת יַעֲקֹב.",
  translit: "Torah tzivah lanu Moshe, morashah kehillat Ya'akov.",
  ru: "Тору заповедал нам Моше — наследие общины Яакова.",
  nl: "De Tora heeft Mosje ons geboden, een erfdeel van de gemeente van Jaäkov.",
  en: "The Torah Moshe commanded us is the heritage of the congregation of Yaakov.",
  fr: "La Torah que Moché nous a ordonnée est l’héritage de la communauté de Yaakov."
},
{
  id: 4,
  titleEn: "Netilat Yadayim",
  titleHe: "נְטִילַת יָדַיִם",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָיִם.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ\nבְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָיִם.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher kidshanu bemitzvotav vetzivanu al netilat yadayim.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями Своими и повелевший нам омовение рук.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons geboden heeft over het wassen van de handen.",
  en: "Blessed are You, Lord our God, King of the universe, Who has sanctified us with His commandments and commanded us concerning washing of the hands.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous a sanctifiés par Ses commandements et nous a ordonné le lavage des mains."
},
{
  id: 5,
  titleEn: "Asher Yatzar",
  titleHe: "אֲשֶׁר יָצַר",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת־הָאָדָם בְּחָכְמָה, וּבָרָא בוֹ נְקָבִים נְקָבִים, חֲלוּלִים חֲלוּלִים, גָּלוּי וְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ, שֶׁאִם יִפָּתַח אֶחָד מֵהֶם, אוֹ יִסָּתֵם אֶחָד מֵהֶם, אִי אֶפְשָׁר לְהִתְקַיֵּם וְלַעֲמוֹד לְפָנֶיךָ.\nבָּרוּךְ אַתָּה יְיָ, רוֹפֵא כָל־בָּשָׂר, וּמַפְלִיא לַעֲשׂוֹת.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת־הָאָדָם\nבְּחָכְמָה, וּבָרָא בוֹ נְקָבִים נְקָבִים, חֲלוּלִים חֲלוּלִים, גָּלוּי\nוְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ, שֶׁאִם יִפָּתַח אֶחָד מֵהֶם, אוֹ\nיִסָּתֵם אֶחָד מֵהֶם, אִי אֶפְשָׁר לְהִתְקַיֵּם וְלַעֲמוֹד לְפָנֶיךָ.\nבָּרוּךְ אַתָּה יְיָ, רוֹפֵא כֹל־בָּשָׂר, וּמַפְלִיא לַעֲשׂוֹת.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher yatzar et ha'adam bechochmah uvara vo nekavim nekavim chalulim chalulim, galui veyadua lifnei chisei chevodecha she'im yipate'ach echad mehem o yisatem echad mehem i efshar lehitkayem vela'amod lefanecha afilu sha'ah achat. Baruch atah Adonai, rofeh chol basar umafli la'asot.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, Который сотворил человека мудростью и создал в нем множество отверстий и полостей. Открыто и известно пред престолом славы Твоей, что если откроется одно из них или закупорится одно — невозможно существовать и стоять пред Тобой даже час. Благословен Ты, Господь, Врач всякой плоти и Творец чудес.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die de mens met wijsheid heeft gevormd en in hem vele openingen en holten heeft geschapen. Het is bekend voor Uw troon dat als één ervan open zou gaan of verstopt zou raken, het onmogelijk zou zijn te bestaan. Gezegend bent U, Eeuwige, Die alle vlees geneest en wonderlijk handelt.",
  en: "Blessed are You, Lord our God, King of the universe, Who formed man with wisdom and created within him many openings and cavities. It is revealed before Your throne that if one of them were to be opened or blocked, it would be impossible to exist. Blessed are You, Lord, Who heals all flesh and acts wondrously.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui as formé l’homme avec sagesse et as créé en lui de nombreuses ouvertures et cavités. Il est révélé devant Ton trône que si l’une d’elles s’ouvrait ou se bouchait, il serait impossible de subsister. Béni sois-Tu, Éternel, qui guéris toute chair et opères des merveilles."
},
{
  id: 6,
  titleEn: "Elohai Neshama",
  titleHe: "אֱלֹהַי נְשָׁמָה",
  he_display: "אֱלֹהַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּה בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי, וּלְהַחֲזִירָהּ בִּי לְעָתִיד לָבוֹא. כָּל־זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי, / מוֹדֶה / מוֹדָה / אֲנִי לְפָנֶיךָ, יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, רִבּוֹן כָּל־הַמַּעֲשִׂים, אֲדוֹן כָּל־הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר נְשָׁמוֹת לַמֵּתִים.",
  he_tts: "אֱלֹהַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּה בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי, וּלְהַחֲזִירָהּ בִּי לְעָתִיד לָבוֹא. כֹּל־זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי, מוֹדֶה אֲנִי לְפָנֶיךָ, יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, רִבּוֹן כֹּל־הַמַּעֲשִׂים, אֲדוֹן כֹּל־הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר נְשָׁמוֹת לַמֵּתִים.",
  translit: "Elohai, neshamah shenatata bi tehorah hi. Atah veratah, atah yetzartah, atah nefachtah bi, ve'atah meshamrah bekirbi, ve'atah atid litlah mimeni, ulehachazirah bi le'atid lavo. Kol-zman shehaneshamah bekirbi, modeh/moda ani lefanecha, Adonai Elohai velohei avotai, Ribbon kol-hama'asim, Adon kol-haneshamot. Baruch atah Adonai, hamachazir neshamot lametim.",
  ru: "Бог мой, душа, которую Ты дал мне, чиста. Ты сотворил её, Ты создал её, Ты вдохнул её в меня, и Ты хранишь её во мне, и Ты заберёшь её у меня и возвратишь мне её в грядущем. Всё время, пока душа во мне, благодарю Тебя, Господь, Бог мой и Бог отцов моих, Владыка всех творений, Господин всех душ. Благословен Ты, Господь, возвращающий души умершим.",
  nl: "Mijn God, de ziel die U in mij hebt gegeven is zuiver. U hebt haar geschapen, gevormd, in mij geblazen, U bewaart haar in mij, en U zult haar van mij nemen en in de toekomst aan mij teruggeven. Zolang de ziel in mij is, dank ik U, Eeuwige, mijn God en God van mijn voorouders. Gezegend bent U, Eeuwige, Die de zielen terugbrengt naar de doden.",
  en: "My God, the soul You placed within me is pure. You created it, You formed it, You breathed it into me, You preserve it within me, and You will take it from me and restore it to me in the time to come. As long as the soul is within me, I give thanks to You, Lord my God and God of my ancestors, Master of all works, Lord of all souls. Blessed are You, Lord, Who restores souls to the dead.",
  fr: "Mon Dieu, l’âme que Tu as mise en moi est pure. Tu l’as créée, Tu l’as formée, Tu l’as insufflée en moi, Tu la gardes en moi, Tu la reprendras de moi et me la rendras dans le futur. Tant que l’âme est en moi, je Te rends grâce, Éternel, mon Dieu et Dieu de mes pères, Maître de toutes les œuvres, Seigneur de toutes les âmes. Béni sois-Tu, Éternel, qui restitues les âmes aux morts."
},
{
  id: 7,
  titleEn: "Birchot HaTorah",
  titleHe: "בִּרְכוֹת הַתּוֹרָה",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לַעֲסוֹק בְּדִבְרֵי תוֹרָה.\nוְהַעֲרֵב נָא יְיָ אֱלֹהֵינוּ אֶת־דִּבְרֵי תוֹרָתְךָ בְּפִינוּ, וּבְפִי עַמְּךָ בֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ, וְצֶאֱצָאֵי עַמְּךָ בֵּית יִשְׂרָאֵל, כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ, וְלוֹמְדֵי תוֹרָתְךָ לִשְׁמָהּ.\nבָּרוּךְ אַתָּה יְיָ, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל־הָעַמִּים, וְנָתַן לָנוּ אֶת־תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְיָ, נוֹתֵן הַתּוֹרָה.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ\nבְּמִצְוֹתָיו, וְצִוָּנוּ לַעֲסוֹק בְּדִבְרֵי תוֹרָה.\nוְהַעֲרֵב נָא יְיָ אֱלֹהֵינוּ אֶת־דִּבְרֵי תוֹרָתְךָ בְּפִינוּ, וּבְפִי עַמְּךָ\nבֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ, וְצֶאֱצָאֵי עַמְּךָ בֵּית\nיִשְׂרָאֵל, כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ, וְלוֹמְדֵי תוֹרָתְךָ לִשְׁמָהּ.\nבָּרוּךְ אַתָּה יְיָ, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכֹּל־\nהָעַמִּים, וְנָתַן לָנוּ אֶת־תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְיָ, נוֹתֵן הַתּוֹרָה.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher kidshanu bemitzvotav vetzivanu la'asok bedivrei Torah. Veha'arev na Adonai Eloheinu et-divrei Toratecha befineu uvfi amcha beit Yisrael, venihyeh anachnu vetze'etza'einu, vetze'etza'ei amcha beit Yisrael, kulana yode'ei shemecha, velomdei Toratecha lishmah. Baruch atah Adonai, hamelamed Torah le'amo Yisrael. Baruch atah Adonai Eloheinu Melech ha'olam, asher bachar banu mikol-ha'amim, venatan lanu et-Torato. Baruch atah Adonai, noten haTorah.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями и повелевший нам заниматься словами Торы. Сделай же, Господь, Бог наш, приятными слова Торы Твоей в устах наших и в устах народа Твоего, дома Израиля, и будем мы и потомки наши и потомки народа Твоего, дома Израиля, все знающими Имя Твоё и изучающими Тору Твою во имя её. Благословен Ты, Господь, обучающий Торе народ Свой Израиль. Благословен Ты, Господь, Бог наш, Царь мира, избравший нас из всех народов и давший нам Тору Свою. Благословен Ты, Господь, дающий Тору.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons bevolen heeft ons bezig te houden met de woorden van de Tora. Maak alstublieft de woorden van Uw Tora zoet in onze mond en in de mond van Uw volk Israël, en laten wij en onze nakomelingen en de nakomelingen van Uw volk Israël allen Uw Naam kennen en Uw Tora leren omwille van haarzelf. Gezegend bent U, Eeuwige, Die Tora onderwijst aan Zijn volk Israël. Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons koos uit alle volken en ons Zijn Tora gaf. Gezegend bent U, Eeuwige, Gever van de Tora.",
  en: "Blessed are You, Lord our God, King of the universe, Who sanctified us with His commandments and commanded us to engage in the words of Torah. Please, Lord our God, make the words of Your Torah sweet in our mouth and in the mouth of Your people Israel, and may we and our offspring and the offspring of Your people Israel all know Your Name and study Your Torah for its own sake. Blessed are You, Lord, Who teaches Torah to His people Israel. Blessed are You, Lord our God, King of the universe, Who chose us from all peoples and gave us His Torah. Blessed are You, Lord, Giver of the Torah.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous a sanctifiés par Ses commandements et nous a ordonné de nous adonner aux paroles de la Torah. Rends agréables, Éternel notre Dieu, les paroles de Ta Torah dans notre bouche et dans celle de Ton peuple Israël, et que nous et notre descendance et la descendance de Ton peuple Israël connaissions tous Ton Nom et étudiions Ta Torah pour elle-même. Béni sois-Tu, Éternel, qui enseignes la Torah à Son peuple Israël. Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous as choisis parmi tous les peuples et nous as donné Sa Torah. Béni sois-Tu, Éternel, Donneur de la Torah."
},
{
  id: 8,
  titleEn: "Barchi Nafshi",
  titleHe: "בָּרְכִי נַפְשִׁי",
  he_display: "[The morning blessings]\nבָּרְכִי נַפְשִׁי אֶת־יְיָ, יְיָ אֱלֹהַי גָּדַלְתָּ מְּאֹד, הוֹד וְהָדָר לָבָשְׁתָּ. עֹטֶה אוֹר כַּשַּׂלְמָה, נוֹטֶה שָׁמַיִם כַּיְרִיעָה.",
  he_tts: "בָּרְכִי נַפְשִׁי אֶת־יְיָ, יְיָ אֱלֹהַי גָּדַלְתָּ מְּאֹד, הוֹד וְהָדָר לָבָשְׁתָּ. עֹטֶה אוֹר כַּשַּׂלְמָה, נוֹטֶה שָׁמַיִם כַּיְרִיעָה.",
  translit: "Barchi nafshi et-Adonai, Adonai Elohai gadalta me'od, hod vehadar lavashta. Oteh or kasalmal, noteh shamayim kayeri'ah.",
  ru: "[Утренние благословения] Благослови, душа моя, Господа. Господь, Бог мой, Ты весьма велик, в величие и славу Ты облачен. Ты окутываешься светом, как плащом, простираешь небеса, как завесу.",
  nl: "[De ochtendlofzeggingen] Loof, mijn ziel, de Eeuwige. Eeuwige, mijn God, U bent zeer groot, met glorie en majesteit bent U bekleed. U hult Zich in licht als in een mantel, U spant de hemel uit als een tentdoek.",
  en: "[The morning blessings] Bless the Lord, O my soul. Lord, my God, You are greatly exalted, You are clothed in glory and majesty. You wrap Yourself in light as in a garment, You stretch out the heavens like a curtain.",
  fr: "[Les bénédictions du matin] Bénis l'Éternel, ô mon âme. Éternel, mon Dieu, Tu es infiniment grand, Tu es revêtu de gloire et de majesté. Tu T'enveloppes de lumière comme d'un manteau, Tu déploies les cieux comme une tenture."
},
{
  id: 9,
  titleEn: "Hineni Mit'atef BeTallit Shel Tzitzit",
  titleHe: "הִנְנִי מִתְעַטֵּף בְּטַלִּית שֶׁל צִיצִית",
  he_display: "[Before wrapping oneself in the tallit one may say:]\nהִנְנִי / מִתְעַטֵּף / מִתְעַטֶּפֶת / בְּטַלִּית שֶׁל צִיצִית כְּדֵי לְקַיֵּם מִצְוַת בּוֹרְאִי, כַּכָּתוּב בַּתּוֹרָה: וְעָשׂוּ לָהֶם צִיצִת עַל כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם.",
  he_tts: "הִנְנִי מִתְעַטֵּף בְּטַלִּית שֶׁל צִיצִית כְּדֵי לְקַיֵּם מִצְוַת בּוֹרְאִי, כַּכָּתוּב בַּתּוֹרָה: וְעָשׂוּ לָהֶם צִיצִת עַל כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם.",
  translit: "Hineni mit'atef/mit'atefet betalit shel tzitzit kedei lekayem mitzvat Bor'i, kakatuv baTorah: ve'asu lahem tzitzit al kanfei vigdeihem ledorotam.",
  ru: "[Перед тем как облачиться в талит, можно сказать:] Вот я облачаюсь в талит с цицит, чтобы исполнить заповедь Творца моего, как написано в Торе: «И сделают себе цицит на углах одежд своих в поколениях своих».",
  nl: "[Voor het omslaan van de tallit kan men zeggen:] Zie, ik omhul mij met een tallit met tzitzit om het gebod van mijn Schepper te vervullen, zoals in de Tora geschreven staat: Zij zullen voor zichzelf tzitzit maken aan de hoeken van hun kleding voor hun generaties.",
  en: "[Before wrapping oneself in the tallit one may say:] Here I am wrapping myself in a tallit with tzitzit in order to fulfill the commandment of my Creator, as it is written in the Torah: And they shall make for themselves tzitzit on the corners of their garments for their generations.",
  fr: "[Avant de s'envelopper dans le tallit, on peut dire :] Me voici, je m'enveloppe dans un tallit à tzitzit afin d'accomplir le commandement de mon Créateur, comme il est écrit dans la Torah : Ils se feront des tzitzit aux coins de leurs vêtements pour leurs générations."
},
{
  id: 10,
  titleEn: "Lehit'atef BaTzitzit",
  titleHe: "לְהִתְעַטֵּף בַּצִּיצִת",
  he_display: "[One wraps the tallit around, over the head, and says:]\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לְהִתְעַטֵּף בַּצִּיצִת.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו, וְצִוָּנוּ לְהִתְעַטֵּף בַּצִּיצִת.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam asher kidshanu bemitzvotav vetzivanu lehit'atef batzitzit.",
  ru: "[Накидывают талит на голову и говорят:] Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями Своими и повелевший нам облачаться в цицит.",
  nl: "[Men slaat de tallit om, over het hoofd, en zegt:] Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons geboden heeft ons te omhullen met de tzitzit.",
  en: "[One wraps the tallit around, over the head, and says:] Blessed are You, Lord our God, King of the universe, Who sanctified us with His commandments and commanded us to wrap ourselves in tzitzit.",
  fr: "[On s'enveloppe du tallit par-dessus la tête et on dit :] Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui nous as sanctifiés par Ses commandements et nous as ordonné de nous envelopper de tzitzit."
},
{
  id: 11,
  titleEn: "Ma Yakar Chasdecha",
  titleHe: "מַה יָּקָר חַסְדְּךָ",
  he_display: "[When draping the tallit over the shoulders one may say:]\nמַה יָּקָר חַסְדְּךָ, אֱלֹהִים, וּבְנֵי אָדָם בְּצֵל כְּנָפֶיךָ יֶחֱסָיוּן. יִרְוְיֻן מִדֶּשֶׁן בֵּיתֶךָ, וְנַחַל עֲדָנֶיךָ תַשְׁקֵם. כִּי עִמְּךָ מְקוֹר חַיִּים, בְּאוֹרְךָ נִרְאֶה אוֹר. מְשֹׁךְ חַסְדְּךָ לְיֹדְעֶיךָ, וְצִדְקָתְךָ לְיִשְׁרֵי לֵב.",
  he_tts: "מַה יָּקָר חַסְדְּךָ, אֱלֹהִים, וּבְנֵי אָדָם בְּצֵל כְּנָפֶיךָ יֶחֱסָיוּן. יִרְוְיֻן מִדֶּשֶׁן בֵּיתֶךָ, וְנַחַל עֲדָנֶיךָ תַשְׁקֵם. כִּי עִמְּךָ מְקוֹר חַיִּים, בְּאוֹרְךָ נִרְאֶה אוֹר. מְשֹׁךְ חַסְדְּךָ לְיֹדְעֶיךָ, וְצִדְקָתְךָ לְיִשְׁרֵי לֵב.",
  translit: "Ma yakar chasdecha, Elohim, uvnei adam betzel kenafecha yechesayun. Yirveyun mideshen beitecha, venachal adanecha tashkem. Ki imcha mekor chayim, be'orcha nir'eh or. Meshokh chasdecha leyode'echa, vetzidkatecha leyishrei lev.",
  ru: "[Накидывая талит на плечи, можно сказать:] Как драгоценна милость Твоя, Боже, и сыны человеческие укрываются в тени крыл Твоих. Насыщаются они от изобилия дома Твоего, и из потока наслаждений Твоих Ты поишь их. Ибо у Тебя источник жизни, в свете Твоем мы видим свет. Продли милость Твою к знающим Тебя и справедливость Твою к прямодушным.",
  nl: "[Bij het leggen van de tallit over de schouders kan men zeggen:] Hoe kostbaar is Uw goedertierenheid, o God, en mensenkinderen schuilen in de schaduw van Uw vleugels. Zij worden verzadigd met de overvloed van Uw huis, en U laat hen drinken uit de rivier van Uw genietingen. Want bij U is de bron van het leven, in Uw licht zien wij licht. Strek Uw goedertierenheid uit tot wie U kennen, en Uw gerechtigheid tot de oprechten van hart.",
  en: "[When draping the tallit over the shoulders one may say:] How precious is Your loving-kindness, O God, and the children of men take refuge in the shadow of Your wings. They shall be abundantly satisfied with the fullness of Your house, and You shall make them drink of the river of Your pleasures. For with You is the fountain of life, in Your light we see light. Extend Your loving-kindness to those who know You, and Your righteousness to the upright in heart.",
  fr: "[En posant le tallit sur les épaules, on peut dire :] Combien précieuse est Ta bonté, ô Dieu, et les fils de l'homme s'abritent à l'ombre de Tes ailes. Ils se rassasient de l'abondance de Ta maison, et Tu les abreuves au fleuve de Tes délices. Car auprès de Toi est la source de vie, par Ta lumière nous voyons la lumière. Étends Ta bonté à ceux qui Te connaissent, et Ta justice à ceux qui ont le cœur droit."
},
{
  id: 12,
  titleEn: "Asher Natan LaSechvi Vina",
  titleHe: "אֲשֶׁר נָתַן לַשֶּׂכְוִי בִינָה",
  he_display: "[Morning Blessings - Thanks for the new day]\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לַשֶּׂכְוִי בִּינָה, לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לַשֶּׂכְוִי בִּינָה, לְהַבְחִין בֵּין יוֹם וּבֵין לָיְלָה.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, asher natan lasechvi vina, lehavchin bein yom uvein laila.",
  ru: "[Утренние благословения - Благодарность за новый день] Благословен Ты, Господь, Бог наш, Царь мира, давший сердцу разум отличать день от ночи.",
  nl: "[Ochtendzegeningen - Dank voor de nieuwe dag] Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die het hart verstand gaf om onderscheid te maken tussen dag en nacht.",
  en: "[Morning Blessings - Thanks for the new day] Blessed are You, Lord our God, King of the universe, Who gave the heart understanding to distinguish between day and night.",
  fr: "[Bénédictions du matin - Merci pour le jour nouveau] Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui as donné au cœur l'intelligence de distinguer entre le jour et la nuit."
},
{
  id: 13,
  titleEn: "She'asani BeTzalmo",
  titleHe: "שֶׁעָשַׂנִי בְּצַלְמוֹ",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי בְּצַלְמוֹ.\n[Reform inclusive form]",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי בְּצַלְמוֹ.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asani betzalmo.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что создал меня по образу Своему. [Реформистская инклюзивная форма]",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die mij naar Zijn beeld gemaakt heeft. [Reformatorische inclusieve vorm]",
  en: "Blessed are You, Lord our God, King of the universe, Who made me in His image. [Reform inclusive form]",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui m'a fait à Son image. [Forme inclusive réformée]"
},
{
  id: 14,
  titleEn: "She'asani Yisrael",
  titleHe: "שֶׁעָשַׂנִי יִשְׂרָאֵל",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי יִשְׂרָאֵל.\n[Reform replacement for 'who did not make me a non-Jew']",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי יִשְׂרָאֵל.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asani Yisrael.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что создал меня Исраэлем. [Реформистская замена формулы «что не сделал меня неевреем»]",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die mij tot Israëliet gemaakt heeft. [Reformatorische vervanging van 'die mij niet tot niet-Jood heeft gemaakt']",
  en: "Blessed are You, Lord our God, King of the universe, Who made me an Israelite. [Reform replacement for 'who did not make me a non-Jew']",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui m'a fait Israël. [Remplacement réformé de « qui ne m'a pas fait non-juif »]"
},
{
  id: 15,
  titleEn: "She'asani Ben / Bat / Chorin",
  titleHe: "שֶׁעָשַׂנִי בֶּן / בַּת / חוֹרִין",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי / בֶן- / בַּת- / חוֹרִין.\n[/ ben / bat / chorin - inclusive form: son/daughter of freedom. Replaces 'who did not make me a slave']",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי בֶן־חוֹרִין.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asani ben/bat/chorin.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что создал меня свободным человеком. [Инклюзивная форма — сын / дочь / свободный. Заменяет «что не сделал меня рабом»]",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die mij als een vrij mens gemaakt heeft. [Inclusieve vorm — zoon / dochter / vrije. Vervangt 'die mij niet tot slaaf heeft gemaakt']",
  en: "Blessed are You, Lord our God, King of the universe, Who made me a free person. [/ ben / bat / chorin — inclusive form: son/daughter of freedom. Replaces 'who did not make me a slave']",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui m'a fait une personne libre. [Forme inclusive — fils / fille / libre. Remplace « qui ne m'a pas fait esclave »]"
},
{
  id: 16,
  titleEn: "She'asa Li Kol Tzorki",
  titleHe: "שֶׁעָשָׂה לִי כָּל צָרְכִּי",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִי כָּל־צָרְכִּי.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִי כֹּל־צָרְכִּי.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asa li kol-tzorki.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что восполнил все нужды мои.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die voorziet in al mijn behoeften.",
  en: "Blessed are You, Lord our God, King of the universe, Who provides for all my needs.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui pourvoit à tous mes besoins."
},
{
  id: 17,
  titleEn: "Ozer Yisrael BiGvura",
  titleHe: "אוֹזֵר יִשְׂרָאֵל בִּגְבוּרָה",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אוֹזֵר יִשְׂרָאֵל בִּגְבוּרָה.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אוֹזֵר יִשְׂרָאֵל בִּגְבוּרָה.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, ozer Yisrael bigvura.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, препоясывающий Исраэль могуществом.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die Israël omgordt met kracht.",
  en: "Blessed are You, Lord our God, King of the universe, Who girds Israel with might.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui ceint Israël de vaillance."
},
{
  id: 18,
  titleEn: "Oter Yisrael BeTif'ara",
  titleHe: "עוֹטֵר יִשְׂרָאֵל בְּתִפְאָרָה",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, עוֹטֵר יִשְׂרָאֵל בְּתִפְאָרָה.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, עוֹטֵר יִשְׂרָאֵל בְּתִפְאָרָה.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, oter Yisrael betif'ara.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, венчающий Исраэль великолепием.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die Israël kroont met luister.",
  en: "Blessed are You, Lord our God, King of the universe, Who crowns Israel with glory.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui couronne Israël de splendeur."
},
{
  id: 19,
  titleEn: "HaNoten LaYa'ef Koach",
  titleHe: "הַנּוֹתֵן לַיָּעֵף כֹּחַ",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַנּוֹתֵן לַיָּעֵף כֹּחַ.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַנּוֹתֵן לַיָּעֵף כֹּחַ.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, hanoten laya'ef koach.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, дающий усталому силу.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die kracht geeft aan de vermoeide.",
  en: "Blessed are You, Lord our God, King of the universe, Who gives strength to the weary.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui donne de la force à celui qui est fatigué."
},
{
  id: 20,
  titleEn: "HaMa'avir Shena Me'Einai",
  titleHe: "הַמַּעֲבִיר שֵׁנָה מֵעֵינַי",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּעֲבִיר שֵׁנָה מֵעֵינַי וּתְנוּמָה מֵעַפְעַפָּי.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּעֲבִיר שֵׁנָה מֵעֵינַי וּתְנוּמָה מֵעַפְעַפָּי.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, hama'avir shena me'einai utnuma me'af'apai.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, удаляющий сон с глаз моих и дремоту с век моих.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die de slaap van mijn ogen wegneemt en de sluimering van mijn oogleden.",
  en: "Blessed are You, Lord our God, King of the universe, Who removes sleep from my eyes and slumber from my eyelids.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui enlève le sommeil de mes yeux et l'assoupissement de mes paupières."
},
{
  id: 21,
  titleEn: "Yehi Ratzon Milfanecha veGomel Chasadim Tovim",
  titleHe: "יְהִי רָצוֹן מִלְּפָנֶיךָ - גּוֹמֵל חֲסָדִים טוֹבִים",
  he_display: "[Inclusive form kept as in this edition: God of our fathers and our mothers]\nוִיהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ, שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ וְדַבְּקֵנוּ בְּמִצְוֹתֶיךָ, וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא, וְלֹא לִידֵי עֲבֵירָה וְעָוֹן, וְלֹא לִידֵי נִסָּיוֹן, וְלֹא לִידֵי בִזָּיוֹן, וְאַל תַּשְׁלֶט־בָּנוּ יֵצֶר הָרַע, וְהַרְחִיקֵנוּ מֵאָדָם רָע וּמֵחָבֵר רָע, וְדַבְּקֵנוּ בְּיֵצֶר הַטּוֹב וּבְמַעֲשִׂים טוֹבִים, וְכוֹף אֶת־יִצְרֵנוּ לְהִשְׁתַּעְבֶּד־לָךְ, וּתְנֵנוּ הַיּוֹם, וּבְכָל־יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל־רוֹאֵינוּ וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים. בָּרוּךְ אַתָּה יְיָ, גּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל.",
  he_tts: "וִיהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ, שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ וְדַבְּקֵנוּ בְּמִצְוֹתֶיךָ, וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא, וְלֹא לִידֵי עֲבֵירָה וְעָוֹן, וְלֹא לִידֵי נִסָּיוֹן, וְלֹא לִידֵי בִזָּיוֹן, וְאַל תַּשְׁלֶט־בָּנוּ יֵצֶר הָרַע, וְהַרְחִיקֵנוּ מֵאָדָם רָע וּמֵחָבֵר רָע, וְדַבְּקֵנוּ בְּיֵצֶר הַטּוֹב וּבְמַעֲשִׂים טוֹבִים, וְכוֹף אֶת־יִצְרֵנוּ לְהִשְׁתַּעְבֶּד־לָךְ, וּתְנֵנוּ הַיּוֹם, וּבְכֹל־יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כֹל־רוֹאֵינוּ וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים. בָּרוּךְ אַתָּה יְיָ, גּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל.",
  translit: "Vihi ratzon milfanecha Adonai Eloheinu velohei avoteinu ve'imoteinu, shetargilenu beToratecha vedabkenu bemitzvotecha, ve'al tevi'enu lo lidei chet, velo lidei avera va'avon, velo lidei nisayon, velo lidei vizayon, ve'al tashlet-banu yetzer hara, veharchikenu me'adam ra umechaver ra, vedabkenu beyetzer hatov uvma'asim tovim, vechof et-yitzrenu lehishta'abed-lach, utnenu hayom uvchol-yom lechen ulechesed ulerachamim be'einecha uv'einei chol-ro'einu vetigmilenu chasadim tovim. Baruch atah Adonai, gomel chasadim tovim le'amo Yisrael.",
  ru: "[Инклюзивная форма этого издания — Бог отцов наших и матерей наших] Да будет воля Твоя, Господь, Бог наш и Бог отцов наших и матерей наших, приучить нас к Торе Твоей и приблизить к заповедям Твоим. И не приводи нас ни к греху, ни к проступку, ни к преступлению, ни к испытанию, ни к позору, и не давай злому началу властвовать над нами, и удали нас от дурного человека и от дурного товарища, и прилепи нас к доброму началу и к добрым делам, и склони волю нашу служить Тебе, и дай нам сегодня и каждый день обрести милость и благоволение и милосердие в глазах Твоих и в глазах всех видящих нас, и воздай нам добрыми милостями. Благословен Ты, Господь, воздающий добрыми милостями народу Своему Исраэлю.",
  nl: "[Inclusieve vorm in deze uitgave — God van onze vaders en onze moeders] Moge het Uw wil zijn, Eeuwige, onze God en God van onze vaders en onze moeders, dat U ons vertrouwd maakt met Uw Tora en ons hecht aan Uw geboden. Breng ons niet tot zonde, overtreding, ongerechtigheid, beproeving of schande, en laat de kwade neiging niet over ons heersen. Verwijder ons van een slecht mens en een slechte vriend, en hecht ons aan de goede neiging en aan goede daden, en dwing onze neiging om U te dienen. En geef ons vandaag en elke dag genade, gunst en barmhartigheid in Uw ogen en in de ogen van allen die ons zien, en bewijs ons goede weldaden. Gezegend bent U, Eeuwige, Die goede weldaden bewijst aan Zijn volk Israël.",
  en: "[Inclusive form kept as in this edition — God of our fathers and our mothers] May it be Your will, Lord our God and God of our fathers and our mothers, to accustom us to Your Torah and cleave us to Your commandments. Do not bring us to sin, transgression, iniquity, trial or disgrace, and do not let the evil inclination rule over us. Keep us far from an evil person and an evil companion, cleave us to the good inclination and to good deeds, and subdue our inclination to be subservient to You. Grant us today and every day grace, kindness and mercy in Your eyes and in the eyes of all who see us, and bestow upon us good kindnesses. Blessed are You, Lord, Who bestows good kindnesses upon His people Israel.",
  fr: "[Forme inclusive conservée dans cette édition — Dieu de nos pères et de nos mères] Que ce soit Ta volonté, Éternel, notre Dieu et Dieu de nos pères et de nos mères, de nous habituer à Ta Torah et de nous attacher à Tes commandements. Ne nous amène pas à la faute, à la transgression, à l'iniquité, à l'épreuve ni à la honte, et ne laisse pas le mauvais penchant dominer sur nous. Éloigne-nous de l'homme mauvais et du mauvais compagnon, attache-nous au bon penchant et aux bonnes œuvres, et soumets notre penchant à Te servir. Accorde-nous aujourd'hui et chaque jour grâce, bienveillance et miséricorde à Tes yeux et aux yeux de tous ceux qui nous voient, et comble-nous de bonnes grâces. Béni sois-Tu, Éternel, qui comble Son peuple Israël de bonnes grâces."
},
{
  id: 22,
  titleEn: "Baruch Ata HaEl HaAv HaRachaman - Melech Mehulal BaTishbachot",
  titleHe: "בָּרוּךְ אַתָּה יְיָ הָאֵל הָאָב הָרַחֲמָן - מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת",
  he_display: "[One kisses the tzitzit, lets them go and sits down]\nבָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הָאֵל הַאָב הָרַחֲמָן, הַמְהֻלָּל בְּפִי עַמּוֹ, מְשֻׁבָּח וּמְפֹאָר בִּלְשׁוֹן חֲסִידָיו וַעֲבָדָיו, וּבְשִׁירֵי דָוִד עַבְדָּךְ נְהַלֶּלְךָ יְיָ אֱלֹהֵינוּ בְּשְׁבָחוֹת וּבְזִמְרוֹת, נְגַדֵּל וּנְשַׁבֵּחַ וּנְפָאֵר וּנְזַכִּיר שְׁמָךְ וְנַמְלִיכֶךָ מִלְּבָבֵנוּ אֱלֹהֵינוּ, יָחִיד, חֵי הָעוֹלָמִים, מֶלֶךְ מְשֻׁבָּח וּמְפֹאָר עֲדֵי עַד שְׁמָךְ הַגָּדוֹל. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הָאֵל הַאָב הָרַחֲמָן, הַמְהֻלָּל בְּפִי עַמּוֹ, מְשֻׁבָּח וּמְפֹאָר בִּלְשׁוֹן חֲסִידָיו וַעֲבָדָיו, וּבְשִׁירֵי דָוִד עַבְדָּךְ נְהַלֶּלְךָ יְיָ אֱלֹהֵינוּ בְּשְׁבָחוֹת וּבְזִמְרוֹת, נְגַדֵּל וּנְשַׁבֵּחַ וּנְפָאֵר וּנְזַכִּיר שְׁמָךְ וְנַמְלִיכֶךָ מִלְּבָבֵנוּ אֱלֹהֵינוּ, יָחִיד, חֵי הָעוֹלָמִים, מֶלֶךְ מְשֻׁבָּח וּמְפֹאָר עֲדֵי עַד שְׁמָךְ הַגָּדוֹל. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת.",
  translit: "Baruch atah Adonai, Eloheinu melech ha'olam, HaEl HaAv HaRachaman, hamehulal befi amo, meshubach umefo'ar bilshon chasidav va'avadav, uveshirei David avdecha nehallelcha Adonai Eloheinu bishvachot uvizmerot, negadel uneshabeach unefa'er unezakir shimcha venamlichecha milvavenu, Eloheinu, yachid, chei ha'olamim, melech meshubach umefo'ar adei ad shimcha hagadol. Baruch atah Adonai, Melech mehulal batishbachot.",
  ru: "[Целуют цицит, отпускают их и садятся] Благословен Ты, Господь, Бог наш, Царь мира, Бог, Отец милосердный, восхваляемый устами народа Своего, прославляемый и превозносимый языком благочестивых и рабов Своих, и песнями Давида, раба Твоего, восхвалим Тебя, Господь, Бог наш, хвалами и песнопениями, будем возвеличивать, восхвалять, прославлять, вспоминать Имя Твое и провозглашать Тебя Царем от всего сердца нашего. Бог наш, Единственный, Живой вечно, Царь восхваляемый и прославляемый во веки веков Имя Твое великое. Благословен Ты, Господь, Царь, восхваляемый в хвалениях.",
  nl: "[Men kust de tsitsit, laat ze los en gaat zitten] Gezegend bent U, Eeuwige, onze God, Koning van de wereld, de God, de Vader, de Barmhartige, Die geloofd wordt in de mond van Zijn volk, geprezen en verheerlijkt door de tong van Zijn vromen en dienaren, en met de liederen van David, Uw dienaar, zullen wij U loven, Eeuwige, onze God, met lofzangen en psalmen, wij zullen U groot maken en prijzen en verheerlijken en Uw Naam gedenken en U als Koning uitroepen uit ons hart. Onze God, Enige, Levende der werelden, Koning, geprezen en verheerlijkt tot in eeuwigheid is Uw grote Naam. Gezegend bent U, Eeuwige, Koning, geroemd in lofprijzingen.",
  en: "[One kisses the tzitzit, lets them go and sits down] Blessed are You, Lord our God, King of the universe, the God, the Father, the Merciful One, Who is praised by the mouth of His people, exalted and glorified by the tongue of His pious ones and His servants, and with the songs of David Your servant we will praise You, Lord our God, with praises and psalms, we will exalt and praise and glorify and mention Your Name and proclaim You as King from our heart. Our God, the Only One, the Life of the worlds, King praised and glorified forever is Your great Name. Blessed are You, Lord, King praised with praises.",
  fr: "[On embrasse les tzitzit, on les relâche et on s'assoit] Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, le Dieu, le Père, le Miséricordieux, loué par la bouche de Son peuple, exalté et glorifié par la langue de Ses pieux et de Ses serviteurs, et par les chants de David Ton serviteur nous Te louerons, Éternel notre Dieu, par des louanges et des psaumes, nous T'exalterons, Te louerons, Te glorifierons, évoquerons Ton Nom et Te proclamerons Roi de tout notre cœur. Notre Dieu, l'Unique, le Vivant des mondes, Roi loué et glorifié à jamais est Ton grand Nom. Béni sois-Tu, Éternel, Roi loué dans les louanges."
},
{
  id: 23,
  titleEn: "Baruch SheAmar VeHaya HaOlam",
  titleHe: "בָּרוּךְ שֶׁאָמַר וְהָיָה הָעוֹלָם",
  he_display: "[Beginning of Psukei DeZimra]\nבָּרוּךְ שֶׁאָמַר וְהָיָה הָעוֹלָם, בָּרוּךְ הוּא.\nבָּרוּךְ עֹשֶׂה בְרֵאשִׁית, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ אוֹמֵר וְעֹשֶׂה, בָּרוּךְ הוּא.\nבָּרוּךְ גֹּזֵר וּמְקַיֵּם, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ מְרַחֵם עַל הָאָרֶץ, בָּרוּךְ הוּא.\nבָּרוּךְ מְרַחֵם עַל הַבְּרִיּוֹת, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ מְשַׁלֵּם שָׂכָר טוֹב לִירֵאָיו, בָּרוּךְ הוּא.\nבָּרוּךְ חַי לָעַד וְקַיָּם לְנֵצַח, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ פּוֹדֶה וּמַצִּיל, בָּרוּךְ הוּא וּבָרוּךְ שְׁמוֹ.",
  he_tts: "בָּרוּךְ שֶׁאָמַר וְהָיָה הָעוֹלָם, בָּרוּךְ הוּא.\nבָּרוּךְ עֹשֶׂה בְרֵאשִׁית, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ אוֹמֵר וְעֹשֶׂה, בָּרוּךְ הוּא.\nבָּרוּךְ גֹּזֵר וּמְקַיֵּם, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ מְרַחֵם עַל הָאָרֶץ, בָּרוּךְ הוּא.\nבָּרוּךְ מְרַחֵם עַל הַבְּרִיּוֹת, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ מְשַׁלֵּם שָׂכָר טוֹב לִירֵאָיו, בָּרוּךְ הוּא.\nבָּרוּךְ חַי לָעַד וְקַיָּם לְנֵצַח, בָּרוּךְ שְׁמוֹ.\nבָּרוּךְ פּוֹדֶה וּמַצִּיל, בָּרוּךְ הוּא וּבָרוּךְ שְׁמוֹ.",
  translit: "Baruch she'amar vehaya ha'olam, baruch Hu.\nBaruch oseh bereshit, baruch shemo.\nBaruch omer ve'oseh, baruch Hu.\nBaruch gozer umekayem, baruch shemo.\nBaruch merachem al ha'aretz, baruch Hu.\nBaruch merachem al haberiyot, baruch shemo.\nBaruch meshalem sachar tov lire'av, baruch Hu.\nBaruch chai la'ad vekayam lanetzach, baruch shemo.\nBaruch podeh umatzil, baruch Hu uvaruch shemo.",
  ru: "[Начало Псукей де-Зимра]\nБлагословен Тот, Кто сказал и возник мир, благословен Он.\nБлагословен Творящий в начале, благословенно Имя Его.\nБлагословен Говорящий и Делающий, благословен Он.\nБлагословен Определяющий и Исполняющий, благословенно Имя Его.\nБлагословен Милующий землю, благословен Он.\nБлагословен Милующий творения, благословенно Имя Его.\nБлагословен Воздающий доброй наградой боящимся Его, благословен Он.\nБлагословен Живущий вечно и Существующий вечно, благословенно Имя Его.\nБлагословен Спасающий и Избавляющий, благословен Он и благословенно Имя Его.",
  nl: "[Begin van Psukei DeZimra]\nGezegend is Hij Die sprak en de wereld ontstond, gezegend is Hij.\nGezegend is Hij Die in den beginne schiep, gezegend is Zijn Naam.\nGezegend is Hij Die spreekt en doet, gezegend is Hij.\nGezegend is Hij Die beschikt en volbrengt, gezegend is Zijn Naam.\nGezegend is Hij Die Zich ontfermt over de aarde, gezegend is Hij.\nGezegend is Hij Die Zich ontfermt over de schepselen, gezegend is Zijn Naam.\nGezegend is Hij Die een goede beloning geeft aan wie Hem vrezen, gezegend is Hij.\nGezegend is Hij Die eeuwig leeft en eeuwig bestaat, gezegend is Zijn Naam.\nGezegend is Hij Die bevrijdt en redt, gezegend is Hij en gezegend is Zijn Naam.",
  en: "[Beginning of Psukei DeZimra]\nBlessed is He Who spoke and the world came to be, blessed is He.\nBlessed is He Who creates in the beginning, blessed is His Name.\nBlessed is He Who says and does, blessed is He.\nBlessed is He Who decrees and fulfills, blessed is His Name.\nBlessed is He Who has mercy upon the earth, blessed is He.\nBlessed is He Who has mercy upon the creatures, blessed is His Name.\nBlessed is He Who gives good reward to those who fear Him, blessed is He.\nBlessed is He Who lives forever and endures to eternity, blessed is His Name.\nBlessed is He Who redeems and saves, blessed is He and blessed is His Name.",
  fr: "[Début de Psukei DeZimra]\nBéni est Celui qui a parlé et le monde fut, béni est-Il.\nBéni est Celui qui crée au commencement, béni est Son Nom.\nBéni est Celui qui dit et fait, béni est-Il.\nBéni est Celui qui décrète et accomplit, béni est Son Nom.\nBéni est Celui qui a pitié de la terre, béni est-Il.\nBéni est Celui qui a pitié des créatures, béni est Son Nom.\nBéni est Celui qui donne une bonne récompense à ceux qui Le craignent, béni est-Il.\nBéni est Celui qui vit éternellement et subsiste à jamais, béni est Son Nom.\nBéni est Celui qui rachète et délivre, béni est-Il et béni est Son Nom."
},
{
  id: 24,
  titleEn: "Yom Rishon",
  titleHe: "יוֹם רִאשׁוֹן - בְּרֵאשִׁית א׳:א׳-ה׳",
  he_display: "[First day, Genesis 1:1-5 and Psalm 24 - Shir Shel Yom]\nבְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ. וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ, וְחֹשֶׁךְ עַל-פְּנֵי תְהוֹם; וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל-פְּנֵי הַמָּיִם. וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר, וַיְהִי-אוֹר. וַיַּרְא אֱלֹהִים אֶת-הָאוֹר כִּי-טוֹב, וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ. וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹמָם, וְלַחֹשֶׁךְ קָרָא לָיְלָה; וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם אֶחָד.",
  he_tts: "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ. וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ, וְחֹשֶׁךְ עַל-פְּנֵי תְהוֹם; וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל-פְּנֵי הַמָּיִם. וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר, וַיְהִי-אוֹר. וַיַּרְא אֱלֹהִים אֶת-הָאוֹר כִּי-טוֹב, וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ. וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹמָם, וְלַחֹשֶׁךְ קָרָא לָיְלָה; וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם אֶחָד.",
  translit: "Bereshit bara Elohim et hashamayim ve'et ha'aretz. Veha'aretz hayta tohu vavohu vechoshech al-penei tehom, veruach Elohim merachefet al-penei hamayim. Vayomer Elohim yehi or vayehi-or. Vayar Elohim et-ha'or ki-tov vayavdel Elohim bein ha'or uvein hachoshech. Vayikra Elohim la'or yomam velachoshech kara laila, vayehi-erev vayehi-voker yom echad.",
  ru: "[Первый день, Берешит 1:1-5 и Псалом 24 - Песнь дня] В начале сотворил Бог небо и землю. Земля же была безвидна и пуста, и тьма над бездною, и Дух Божий носился над водою. И сказал Бог: да будет свет. И стал свет. И увидел Бог свет, что он хорош, и отделил Бог свет от тьмы. И назвал Бог свет днем, а тьму назвал ночью. И был вечер, и было утро: день один.",
  nl: "[Eerste dag, Genesis 1:1-5 en Psalm 24 - Lied van de dag] In het begin schiep God de hemel en de aarde. De aarde was woest en leeg, en duisternis lag over de afgrond, en de geest van God zweefde over de wateren. God zei: Er zij licht, en er was licht. God zag het licht dat het goed was, en God scheidde het licht van de duisternis. God noemde het licht dag en de duisternis noemde Hij nacht. Het werd avond en het werd ochtend, dag één.",
  en: "[First day, Genesis 1:1-5 and Psalm 24 - Daily Psalm] In the beginning God created the heavens and the earth. The earth was without form and void, and darkness was upon the face of the deep, and the spirit of God hovered over the waters. God said: Let there be light, and there was light. God saw the light that it was good, and God separated between the light and the darkness. God called the light Day and the darkness He called Night. And there was evening and there was morning, one day.",
  fr: "[Premier jour, Genèse 1:1-5 et Psaume 24 - Chant du jour] Au commencement Dieu créa le ciel et la terre. La terre était tohu-bohu, les ténèbres sur la face de l'abîme, et l'esprit de Dieu planait sur les eaux. Dieu dit: Que la lumière soit, et la lumière fut. Dieu vit que la lumière était bonne, et Dieu sépara la lumière des ténèbres. Dieu appela la lumière jour, et les ténèbres Il appela nuit. Il fut soir, il fut matin, jour un."
},
{
  id: 25,
  titleEn: "Yom Sheni",
  titleHe: "יוֹם שֵׁנִי - בְּרֵאשִׁית א׳:ו׳-ח׳",
  he_display: "[Second day, Psalm 48, Genesis 1:6-8]\nוַיֹּאמֶר אֱלֹהִים יְהִי רָקִיעַ בְּתוֹךְ הַמַּיִם, וִיהִי מַבְדִּיל בֵּין מַיִם לָמָיִם. וַיַּעַשׂ אֱלֹהִים אֶת-הָרָקִיעַ, וַיַּבְדֵּל בֵּין הַמַּיִם אֲשֶׁר מִתַּחַת לָרָקִיעַ וּבֵין הַמַּיִם אֲשֶׁר מֵעַל לָרָקִיעַ, וַיְהִי-כֵן. וַיִּקְרָא אֱלֹהִים לָרָקִיעַ שָׁמַיִם, וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם שֵׁנִי.",
  he_tts: "וַיֹּאמֶר אֱלֹהִים יְהִי רָקִיעַ בְּתוֹךְ הַמַּיִם, וִיהִי מַבְדִּיל בֵּין מַיִם לָמָיִם. וַיַּעַשׂ אֱלֹהִים אֶת-הָרָקִיעַ, וַיַּבְדֵּל בֵּין הַמַּיִם אֲשֶׁר מִתַּחַת לָרָקִיעַ וּבֵין הַמַּיִם אֲשֶׁר מֵעַל לָרָקִיעַ, וַיְהִי-כֵן. וַיִּקְרָא אֱלֹהִים לָרָקִיעַ שָׁמַיִם, וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם שֵׁנִי.",
  translit: "Vayomer Elohim yehi rakia betoch hamayim vihi mavdil bein mayim lamayim. Vaya'as Elohim et-harakia vayavdel bein hamayim asher mitachat larakia uvein hamayim asher me'al larakia vayehi-chen. Vayikra Elohim larakia shamayim vayehi-erev vayehi-voker yom sheni.",
  ru: "[Второй день, Псалом 48, Берешит 1:6-8] И сказал Бог: да будет твердь посреди воды и да отделяет она воду от воды. И создал Бог твердь и отделил воду, которая под твердью, от воды, которая над твердью. И стало так. И назвал Бог твердь небом. И был вечер и было утро: день второй.",
  nl: "[Tweede dag, Psalm 48, Genesis 1:6-8] God zei: Er zij een uitspansel te midden van de wateren dat scheiding maakt tussen wateren. God maakte het uitspansel en scheidde de wateren onder het uitspansel van de wateren boven het uitspansel, en het was zo. God noemde het uitspansel hemel. Het werd avond en ochtend, tweede dag.",
  en: "[Second day, Psalm 48, Genesis 1:6-8] God said: Let there be a firmament in the midst of the waters and let it divide between water and water. God made the firmament and divided between the waters beneath the firmament and the waters above the firmament, and it was so. God called the firmament Heaven. And there was evening and morning, a second day.",
  fr: "[Deuxième jour, Psaume 48, Genèse 1:6-8] Dieu dit: Qu'il y ait un firmament au milieu des eaux et qu'il sépare les eaux d'avec les eaux. Dieu fit le firmament et sépara les eaux sous le firmament des eaux au-dessus du firmament, et il en fut ainsi. Dieu appela le firmament ciel. Il fut soir et matin, deuxième jour."
},
{
  id: 26,
  titleEn: "Yom Shlishi",
  titleHe: "יוֹם שְׁלִישִׁי - בְּרֵאשִׁית א׳:ט׳-י״ג",
  he_display: "[Third day, Psalm 82, Genesis 1:9-13]\nוַיֹּאמֶר אֱלֹהִים יִקָּווּ הַמַּיִם מִתַּחַת הַשָּׁמַיִם אֶל-מְקוֹם אֶחָד וְתֵרָאֶה הַיַּבָּשָׁה, וַיְהִי-כֵן. וַיִּקְרָא אֱלֹהִים לַיַּבָּשָׁה אֶרֶץ וּלְמִקְוֵה הַמַּיִם קָרָא יַמִּים, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיֹּאמֶר אֱלֹהִים תַּדְשֵׁא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע עֵץ פְּרִי עֹשֶׂה פְּרִי לְמִינוֹ אֲשֶׁר זַרְעוֹ-בוֹ עַל-הָאָרֶץ, וַיְהִי-כֵן. וַתּוֹצִיא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע לְמִינֵהוּ וְעֵץ עֹשֶׂה-פְּרִי אֲשֶׁר זַרְעוֹ-בוֹ לְמִינֵהוּ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם שְׁלִישִׁי.",
  he_tts: "וַיֹּאמֶר אֱלֹהִים יִקָּווּ הַמַּיִם מִתַּחַת הַשָּׁמַיִם אֶל-מְקוֹם אֶחָד וְתֵרָאֶה הַיַּבָּשָׁה, וַיְהִי-כֵן. וַיִּקְרָא אֱלֹהִים לַיַּבָּשָׁה אֶרֶץ וּלְמִקְוֵה הַמַּיִם קָרָא יַמִּים, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיֹּאמֶר אֱלֹהִים תַּדְשֵׁא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע עֵץ פְּרִי עֹשֶׂה פְּרִי לְמִינוֹ אֲשֶׁר זַרְעוֹ-בוֹ עַל-הָאָרֶץ, וַיְהִי-כֵן. וַתּוֹצִיא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע לְמִינֵהוּ וְעֵץ עֹשֶׂה-פְּרִי אֲשֶׁר זַרְעוֹ-בוֹ לְמִינֵהוּ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם שְׁלִישִׁי.",
  translit: "Vayomer Elohim yikavu hamayim mitachat hashamayim el-makom echad veteraeh hayabasha vayehi-chen. Vayikra Elohim layabasha eretz ulemikveh hamayim kara yamim vayar Elohim ki-tov. Vayomer Elohim tadshe ha'aretz deshe esev mazria zera etz peri ose peri lemino asher zar'o-vo al-ha'aretz vayehi-chen. Vatote ha'aretz deshe esev mazria zera leminehu ve'etz ose-peri asher zar'o-vo leminehu vayar Elohim ki-tov. Vayehi-erev vayehi-voker yom shlishi.",
  ru: "[Третий день, Псалом 82, Берешит 1:9-13] И сказал Бог: да соберется вода под небом в одно место и да явится суша. И стало так. И назвал Бог сушу землею, а собрание вод назвал морями. И увидел Бог, что это хорошо. И сказал Бог: да произрастит земля зелень, траву сеющую семя, дерево плодовитое. И было так. И выпустила земля зелень. И увидел Бог, что это хорошо. И был вечер и утро: день третий.",
  nl: "[Derde dag, Psalm 82, Genesis 1:9-13] God zei: De wateren onder de hemel worden verzameld naar één plaats en het droge verschijne, en het was zo. God noemde het droge aarde en de verzameling van wateren noemde Hij zeeën, en God zag dat het goed was. God zei: De aarde brenge jong groen voort, zaaddragend gewas en vruchtbomen. Het werd avond en ochtend, derde dag.",
  en: "[Third day, Psalm 82, Genesis 1:9-13] God said: Let the waters under the heavens be gathered to one place and let dry land appear, and it was so. God called the dry land Earth and the gathering of waters He called Seas, and God saw that it was good. God said: Let the earth sprout vegetation, seed-bearing plants and fruit trees. And there was evening and morning, a third day.",
  fr: "[Troisième jour, Psaume 82, Genèse 1:9-13] Dieu dit: Que les eaux sous le ciel se rassemblent en un lieu et que le sec paraisse, et il en fut ainsi. Dieu appela le sec terre et l'amas des eaux Il appela mers, et Dieu vit que cela était bon. Dieu dit: Que la terre fasse pousser de la verdure. Il fut soir et matin, troisième jour."
},
{
  id: 27,
  titleEn: "Yom Revii",
  titleHe: "יוֹם רְבִיעִי - בְּרֵאשִׁית א׳:י״ד-י״ט",
  he_display: "[Fourth day, Genesis 1:14-19]\nוַיֹּאמֶר אֱלֹהִים יְהִי מְאֹרֹת בִּרְקִיעַ הַשָּׁמַיִם, לְהַבְדִּיל בֵּין הַיּוֹם וּבֵין הַלָּיְלָה; וְהָיוּ לְאֹתֹת וּלְמוֹעֲדִים, וּלְיָמִים וְשָׁנִים. וְהָיוּ לִמְאוֹרֹת בִּרְקִיעַ הַשָּׁמַיִם, לְהָאִיר עַל-הָאָרֶץ, וַיְהִי-כֵן. וַיַּעַשׂ אֱלֹהִים אֶת-שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים: אֶת-הַמָּאוֹר הַגָּדוֹל לְמֶמְשֶׁלֶת הַיּוֹם, וְאֶת-הַמְּאוֹר הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה, וְאֵת הַכּוֹכָבִים. וַיִּתֵּן אֹתָם אֱלֹהִים בִּרְקִיעַ הַשָּׁמַיִם, לְהָאִיר עַל-הָאָרֶץ. וְלִמְשֹׁל בַּיּוֹם וּבַלַּיְלָה, וּלְהַבְדִּיל בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם רְבִיעִי.",
  he_tts: "וַיֹּאמֶר אֱלֹהִים יְהִי מְאֹרֹת בִּרְקִיעַ הַשָּׁמַיִם, לְהַבְדִּיל בֵּין הַיּוֹם וּבֵין הַלָּיְלָה; וְהָיוּ לְאֹתֹת וּלְמוֹעֲדִים, וּלְיָמִים וְשָׁנִים. וְהָיוּ לִמְאוֹרֹת בִּרְקִיעַ הַשָּׁמַיִם, לְהָאִיר עַל-הָאָרֶץ, וַיְהִי-כֵן. וַיַּעַשׂ אֱלֹהִים אֶת-שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים: אֶת-הַמָּאוֹר הַגָּדוֹל לְמֶמְשֶׁלֶת הַיּוֹם, וְאֶת-הַמְּאוֹר הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה, וְאֵת הַכּוֹכָבִים. וַיִּתֵּן אֹתָם אֱלֹהִים בִּרְקִיעַ הַשָּׁמַיִם, לְהָאִיר עַל-הָאָרֶץ. וְלִמְשֹׁל בַּיּוֹם וּבַלַּיְלָה, וּלְהַבְדִּיל בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם רְבִיעִי.",
  translit: "Vayomer Elohim yehi me'orot birkia hashamayim lehavdil bein hayom uvein halaila vehayu le'otot ulemoadim uleyamim veshanim. Vehayu lime'orot birkia hashamayim leha'ir al-ha'aretz vayehi-chen. Vaya'as Elohim et-shnei hame'orot hagedolim: et-hamaor hagadol lememshelet hayom ve'et-hamaor hakaton lememshelet halaila ve'et hakochavim. Vayiten otam Elohim birkia hashamayim leha'ir al-ha'aretz...",
  ru: "[Четвертый день, Берешит 1:14-19] И сказал Бог: да будут светила на тверди небесной для отделения дня от ночи, и да будут они знамениями и для времен, и для дней и годов. И да будут они светильниками на тверди небесной, чтобы светить на землю. И стало так. И создал Бог два великих светила: большое светило для владения днем и малое для владения ночью, и звезды. И поставил их Бог на тверди небесной, чтобы светить на землю и владеть днем и ночью и отделять свет от тьмы. И увидел Бог, что это хорошо. И был вечер и утро: день четвертый.",
  nl: "[Vierde dag, Genesis 1:14-19] God zei: Er zijn lichten aan het hemelgewelf om scheiding te maken tussen dag en nacht, zij zijn tot tekens en tot feesttijden, dagen en jaren. Zij zijn tot lichten aan het hemelgewelf om de aarde te verlichten, en het was zo. God maakte de twee grote lichten, het grote licht om over de dag te heersen en het kleine licht om over de nacht te heersen, en de sterren. Het werd avond en ochtend, vierde dag.",
  en: "[Fourth day, Genesis 1:14-19] God said: Let there be luminaries in the firmament of heaven to divide between day and night, and they shall be for signs and for seasons and for days and years. And they shall be for luminaries in the firmament to give light upon the earth, and it was so. God made the two great luminaries, the great luminary to rule by day and the small luminary to rule by night, and the stars. Evening and morning, fourth day.",
  fr: "[Quatrième jour, Genèse 1:14-19] Dieu dit: Qu'il y ait des luminaires au firmament du ciel pour séparer le jour de la nuit, qu'ils servent de signes pour les fêtes, les jours et les années. Dieu fit les deux grands luminaires, le grand luminaire pour régner le jour et le petit pour la nuit, et les étoiles. Soir et matin, quatrième jour."
},
{
  id: 28,
  titleEn: "Yom Chamishi",
  titleHe: "יוֹם חֲמִישִׁי - בְּרֵאשִׁית א׳:כ׳-כ״ג",
  he_display: "[Fifth day, Genesis 1:20-23]\nוַיֹּאמֶר אֱלֹהִים יִשְׁרְצוּ הַמַּיִם שֶׁרֶץ נֶפֶשׁ חַיָּה, וְעוֹף יְעוֹפֵף עַל-הָאָרֶץ עַל-פְּנֵי רְקִיעַ הַשָּׁמָיִם. וַיִּבְרָא אֱלֹהִים אֶת-הַתַּנִּינִם הַגְּדֹלִים, וְאֵת כָּל-נֶפֶשׁ הַחַיָּה הָרֹמֶשֶׂת אֲשֶׁר שָׁרְצוּ הַמַּיִם לְמִינֵהֶם, וְאֵת כָּל-עוֹף כָּנָף לְמִינֵהוּ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיְבָרֶךְ אֹתָם אֱלֹהִים לֵאמֹר, פְּרוּ וּרְבוּ וּמִלְאוּ אֶת-הַמַּיִם בַּיַּמִּים, וְהָעוֹף יִרֶב בָּאָרֶץ. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם חֲמִישִׁי.",
  he_tts: "וַיֹּאמֶר אֱלֹהִים יִשְׁרְצוּ הַמַּיִם שֶׁרֶץ נֶפֶשׁ חַיָּה, וְעוֹף יְעוֹפֵף עַל-הָאָרֶץ עַל-פְּנֵי רְקִיעַ הַשָּׁמָיִם. וַיִּבְרָא אֱלֹהִים אֶת-הַתַּנִּינִם הַגְּדֹלִים, וְאֵת כֹּל-נֶפֶשׁ הַחַיָּה הָרֹמֶשֶׂת אֲשֶׁר שָׁרְצוּ הַמַּיִם לְמִינֵהֶם, וְאֵת כֹּל-עוֹף כָּנָף לְמִינֵהוּ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיְבָרֶךְ אֹתָם אֱלֹהִים לֵאמֹר, פְּרוּ וּרְבוּ וּמִלְאוּ אֶת-הַמַּיִם בַּיַּמִּים, וְהָעוֹף יִרֶב בָּאָרֶץ. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם חֲמִישִׁי.",
  translit: "Vayomer Elohim yishretzu hamayim sheretz nefesh chaya ve'of ye'ofef al-ha'aretz al-penei rekia hashamayim. Vayivra Elohim et-hatanninim hagedolim ve'et kol-nefesh hachaya haromeset asher shartzu hamayim leminehem ve'et kol-of kanaf leminehu vayar Elohim ki-tov. Vayevarech otam Elohim lemor peru urvu umil'u et-hamayim bayamim veha'of yirev ba'aretz. Vayehi-erev vayehi-voker yom chamishi.",
  ru: "[Пятый день, Берешит 1:20-23] И сказал Бог: да воскишат воды кишащими живыми существами и птицы да полетят над землею по тверди небесной. И сотворил Бог больших морских чудовищ и всякую живую душу ползающую, которыми воскишели воды, по роду их, и всякую птицу пернатую по роду ее. И увидел Бог, что это хорошо. И благословил их Бог, говоря: плодитесь и размножайтесь и наполняйте воды в морях, и птицы да размножаются на земле. И был вечер и утро: день пятый.",
  nl: "[Vijfde dag, Genesis 1:20-23] God zei: De wateren wemelen van levende wezens en vogels vliegen over de aarde langs het hemelgewelf. God schiep de grote zeedieren en alle levende wezens die krioelen, waarmee de wateren wemelen, naar hun soort, en alle gevleugelde vogels naar hun soort, en God zag dat het goed was. God zegende hen: Weest vruchtbaar en talrijk en vervult de wateren in de zeeën, en de vogels worden talrijk op aarde. Avond en ochtend, vijfde dag.",
  en: "[Fifth day, Genesis 1:20-23] God said: Let the waters swarm with swarming living creatures and let fowl fly above the earth upon the face of the firmament of heaven. God created the great sea-monsters and every living creature that creeps with which the waters swarmed after its kind and every winged fowl after its kind, and God saw that it was good. God blessed them saying: Be fruitful and multiply and fill the waters in the seas, and let fowl multiply on the earth. Evening and morning, fifth day.",
  fr: "[Cinquième jour, Genèse 1:20-23] Dieu dit: Que les eaux foisonnent d'êtres vivants et que l'oiseau vole au-dessus de la terre face au firmament du ciel. Dieu créa les grands monstres marins et tout être vivant qui rampe dont les eaux foisonnent selon son espèce et tout oiseau ailé selon son espèce, et Dieu vit que c'était bon. Dieu les bénit en disant: Soyez féconds et multipliez-vous et remplissez les eaux des mers, et que l'oiseau se multiplie sur la terre. Soir et matin, cinquième jour."
},
{
  id: 29,
  titleEn: "Yom HaShishi",
  titleHe: "יוֹם הַשִּׁשִּׁי - בְּרֵאשִׁית א׳:כ״ד-ל״א",
  he_display: "[Sixth day, Genesis 1:24-31]\nוַיֹּאמֶר אֱלֹהִים תּוֹצִיא הָאָרֶץ נֶפֶשׁ חַיָּה לְמִינָהּ בְּהֵמָה וְרֶמֶשׂ וְחַיְתוֹ-אֶרֶץ לְמִינָהּ, וַיְהִי-כֵן. וַיַּעַשׂ אֱלֹהִים אֶת-חַיַּת הָאָרֶץ לְמִינָהּ וְאֶת-הַבְּהֵמָה לְמִינָהּ וְאֵת כָּל-רֶמֶשׂ הָאֲדָמָה לְמִינֵהוּ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיֹּאמֶר אֱלֹהִים נַעֲשֶׂה אָדָם בְּצַלְמֵנוּ כִּדְמוּתֵנוּ, וְיִרְדּוּ בִדְגַת הַיָּם וּבְעוֹף הַשָּׁמַיִם וּבַבְּהֵמָה וּבְכָל-הָאָרֶץ וּבְכָל-הָרֶמֶשׂ הָרֹמֵשׂ עַל-הָאָרֶץ. וַיִּבְרָא אֱלֹהִים אֶת-הָאָדָם בְּצַלְמוֹ, בְּצֶלֶם אֱלֹהִים בָּרָא אֹתוֹ; זָכָר וּנְקֵבָה בָּרָא אֹתָם. וַיְבָרֶךְ אֹתָם אֱלֹהִים, וַיֹּאמֶר לָהֶם אֱלֹהִים פְּרוּ וּרְבוּ וּמִלְאוּ אֶת-הָאָרֶץ וְכִבְשֻׁהָ, וּרְדוּ בִּדְגַת הַיָּם וּבְעוֹף הַשָּׁמַיִם וּבְכָל-חַיָּה הָרֹמֶשֶׂת עַל-הָאָרֶץ. וַיֹּאמֶר אֱלֹהִים הִנֵּה נָתַתִּי לָכֶם אֶת-כָּל-עֵשֶׂב זֹרֵעַ זֶרַע אֲשֶׁר עַל-פְּנֵי כָל-הָאָרֶץ וְאֶת-כָּל-הָעֵץ אֲשֶׁר-בּוֹ פְרִי-עֵץ זֹרֵעַ זָרַע, לָכֶם יִהְיֶה לְאָכְלָה. וּלְכָל-חַיַּת הָאָרֶץ וּלְכָל-עוֹף הַשָּׁמַיִם וּלְכֹל רוֹמֵשׂ עַל-הָאָרֶץ אֲשֶׁר-בּוֹ נֶפֶשׁ חַיָּה, אֶת-כָּל-יֶרֶק עֵשֶׂב לְאָכְלָה, וַיְהִי-כֵן. וַיַּרְא אֱלֹהִים אֶת-כָּל-אֲשֶׁר עָשָׂה, וְהִנֵּה-טוֹב מְאֹד. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם הַשִּׁשִּׁי.",
  he_tts: "וַיֹּאמֶר אֱלֹהִים תּוֹצִיא הָאָרֶץ נֶפֶשׁ חַיָּה לְמִינָהּ בְּהֵמָה וְרֶמֶשׂ וְחַיְתוֹ-אֶרֶץ לְמִינָהּ, וַיְהִי-כֵן. וַיַּעַשׂ אֱלֹהִים אֶת-חַיַּת הָאָרֶץ לְמִינָהּ וְאֶת-הַבְּהֵמָה לְמִינָהּ וְאֵת כֹּל-רֶמֶשׂ הָאֲדָמָה לְמִינֵהוּ, וַיַּרְא אֱלֹהִים כִּי-טוֹב. וַיֹּאמֶר אֱלֹהִים נַעֲשֶׂה אָדָם בְּצַלְמֵנוּ כִּדְמוּתֵנוּ, וְיִרְדּוּ בִדְגַת הַיָּם וּבְעוֹף הַשָּׁמַיִם וּבַבְּהֵמָה וּבְכֹל-הָאָרֶץ וּבְכֹל-הָרֶמֶשׂ הָרֹמֵשׂ עַל-הָאָרֶץ. וַיִּבְרָא אֱלֹהִים אֶת-הָאָדָם בְּצַלְמוֹ, בְּצֶלֶם אֱלֹהִים בָּרָא אֹתוֹ; זָכָר וּנְקֵבָה בָּרָא אֹתָם. וַיְבָרֶךְ אֹתָם אֱלֹהִים, וַיֹּאמֶר לָהֶם אֱלֹהִים פְּרוּ וּרְבוּ וּמִלְאוּ אֶת-הָאָרֶץ וְכִבְשֻׁהָ, וּרְדוּ בִּדְגַת הַיָּם וּבְעוֹף הַשָּׁמַיִם וּבְכֹל-חַיָּה הָרֹמֶשֶׂת עַל-הָאָרֶץ. וַיֹּאמֶר אֱלֹהִים הִנֵּה נָתַתִּי לָכֶם אֶת-כֹּל-עֵשֶׂב זֹרֵעַ זֶרַע אֲשֶׁר עַל-פְּנֵי כֹל-הָאָרֶץ וְאֶת-כֹּל-הָעֵץ אֲשֶׁר-בּוֹ פְרִי-עֵץ זֹרֵעַ זָרַע, לָכֶם יִהְיֶה לְאָכְלָה. וּלְכֹל-חַיַּת הָאָרֶץ וּלְכֹל-עוֹף הַשָּׁמַיִם וּלְכֹל רוֹמֵשׂ עַל-הָאָרֶץ אֲשֶׁר-בּוֹ נֶפֶשׁ חַיָּה, אֶת-כֹּל-יֶרֶק עֵשֶׂב לְאָכְלָה, וַיְהִי-כֵן. וַיַּרְא אֱלֹהִים אֶת-כֹּל-אֲשֶׁר עָשָׂה, וְהִנֵּה-טוֹב מְאֹד. וַיְהִי-עֶרֶב וַיְהִי-בֹקֶר יוֹם הַשִּׁשִּׁי.",
  translit: "Vayomer Elohim totzi ha'aretz nefesh chaya leminah behema varemes vechayto-eretz leminah vayehi-chen. Vaya'as Elohim et-chayat ha'aretz leminah ve'et-habehema leminah ve'et kol-remes ha'adama leminehu vayar Elohim ki-tov. Vayomer Elohim na'ase adam betzalmenu kidmutenu veyirdu bidgat hayam uve'of hashamayim uvabehema uvechol-ha'aretz uvechol-haremes haromes al-ha'aretz. Vayivra Elohim et-ha'adam betzalmo betzelem Elohim bara oto zachar unkeva bara otam...",
  ru: "[Шестой день, Берешит 1:24-31] И сказал Бог: да произведет земля живых существ по роду их, скот и гадов и зверей земных. И стало так. И создал Бог зверей земных по роду их и скот по роду его и всех гадов земных по роду их. И увидел Бог, что это хорошо. И сказал Бог: сотворим человека по образу Нашему, по подобию Нашему, и да владычествуют они над рыбами морскими и птицами небесными и скотом и всею землею. И сотворил Бог человека по образу Своему, по образу Божию сотворил его; мужчину и женщину сотворил их. И благословил их Бог и сказал им Бог: плодитесь и размножайтесь и наполняйте землю и обладайте ею. И был вечер и утро: день шестой.",
  nl: "[Zesde dag, Genesis 1:24-31] God zei: De aarde brenge levende wezens voort naar hun soort, vee, kruipend gedierte en wild gedierte naar zijn soort, en het was zo. God maakte het wild gedierte naar zijn soort, het vee naar zijn soort en al het kruipend gedierte naar zijn soort, en God zag dat het goed was. God zei: Laat Ons mensen maken naar Ons beeld, naar Onze gelijkenis, en laten zij heersen over de vissen van de zee en de vogels van de hemel en het vee en de gehele aarde. God schiep de mens naar Zijn beeld, naar Gods beeld schiep Hij hem, mannelijk en vrouwelijk schiep Hij hen. Avond en ochtend, zesde dag.",
  en: "[Sixth day, Genesis 1:24-31] God said: Let the earth bring forth living creatures after its kind, cattle and creeping things and beasts of the earth after its kind, and it was so. God made the beasts of the earth after its kind and cattle after its kind and everything that creeps upon the earth after its kind, and God saw that it was good. God said: Let Us make man in Our image, after Our likeness, and let them have dominion over the fish of the sea and the fowl of the air and the cattle and all the earth. God created man in His image, in the image of God He created him, male and female He created them. Evening and morning, sixth day.",
  fr: "[Sixième jour, Genèse 1:24-31] Dieu dit: Que la terre produise des êtres vivants selon leur espèce, bétail, reptiles et bêtes de la terre selon leur espèce, et il en fut ainsi. Dieu fit les bêtes de la terre selon leur espèce, le bétail selon son espèce et tout ce qui rampe sur la terre selon son espèce, et Dieu vit que c'était bon. Dieu dit: Faisons l'homme à Notre image, selon Notre ressemblance, et qu'il domine sur les poissons de la mer, les oiseaux du ciel, le bétail et toute la terre. Dieu créa l'homme à Son image, à l'image de Dieu Il le créa, mâle et femelle Il les créa. Soir et matin, sixième jour."
},
{
  id: 30,
  titleEn: "Mizmor Shir LeYom HaShabbat",
  titleHe: "מִזְמוֹר שִׁיר לְיוֹם הַשַּׁבָּת - תְּהִלִּים צ״ב",
  he_display: "[Psalm 92 - Shabbat - Shir Shel Yom]\nמִזְמוֹר שִׁיר לְיוֹם הַשַּׁבָּת. טוֹב לְהוֹדוֹת לַיהוָה, וּלְזַמֵּר לְשִׁמְךָ עֶלְיוֹן. לְהַגִּיד בַּבֹּקֶר חַסְדֶּךָ, וֶאֱמוּנָתְךָ בַּלֵּילוֹת. עֲלֵי-עָשׂוֹר וַעֲלֵי-נָבֶל, עֲלֵי הִגָּיוֹן בְּכִנּוֹר. כִּי שִׂמַּחְתַּנִי יְהוָה בְּפָעֳלֶךָ, בְּמַעֲשֵׂי יָדֶיךָ אֲרַנֵּן. מַה-גָּדְלוּ מַעֲשֶׂיךָ יְהוָה, מְאֹד עָמְקוּ מַחְשְׁבֹתֶיךָ. אִישׁ-בַּעַר לֹא יֵדַע, וּכְסִיל לֹא-יָבִין אֶת-זֹאת. בִּפְרֹחַ רְשָׁעִים כְּמוֹ עֵשֶׂב, וַיָּצִיצוּ כָּל-פֹּעֲלֵי אָוֶן, לְהִשָּׁמְדָם עֲדֵי-עַד. וְאַתָּה מָרוֹם לְעֹלָם יְהוָה. כִּי הִנֵּה אֹיְבֶיךָ יְהוָה, כִּי-הִנֵּה אֹיְבֶיךָ יֹאבֵדוּ, יִתְפָּרְדוּ כָּל-פֹּעֲלֵי אָוֶן. וַתָּרֶם כִּרְאֵים קַרְנִי, בַּלֹּתִי בְּשֶׁמֶן רַעֲנָן. וַתַּבֵּט עֵינִי בְּשׁוּרָי, בַּקָּמִים עָלַי מְרֵעִים תִּשְׁמַעְנָה אָזְנָי. צַדִּיק כַּתָּמָר יִפְרָח, כְּאֶרֶז בַּלְּבָנוֹן יִשְׂגֶּה. שְׁתוּלִים בְּבֵית יְהוָה, בְּחַצְרוֹת אֱלֹהֵינוּ יַפְרִיחוּ. עוֹד יְנוּבוּן בְּשֵׂיבָה, דְּשֵׁנִים וְרַעֲנַנִּים יִהְיוּ. לְהַגִּיד כִּי-יָשָׁר יְהוָה, צוּרִי וְלֹא-עַוְלָתָה בּוֹ.",
  he_tts: "מִזְמוֹר שִׁיר לְיוֹם הַשַּׁבָּת. טוֹב לְהוֹדוֹת לַיהוָה, וּלְזַמֵּר לְשִׁמְךָ עֶלְיוֹן. לְהַגִּיד בַּבֹּקֶר חַסְדֶּךָ, וֶאֱמוּנָתְךָ בַּלֵּילוֹת. עֲלֵי-עָשׂוֹר וַעֲלֵי-נָבֶל, עֲלֵי הִגָּיוֹן בְּכִנּוֹר. כִּי שִׂמַּחְתַּנִי יְהוָה בְּפָעֳלֶךָ, בְּמַעֲשֵׂי יָדֶיךָ אֲרַנֵּן. מַה-גָּדְלוּ מַעֲשֶׂיךָ יְהוָה, מְאֹד עָמְקוּ מַחְשְׁבֹתֶיךָ. אִישׁ-בַּעַר לֹא יֵדַע, וּכְסִיל לֹא-יָבִין אֶת-זֹאת. בִּפְרֹחַ רְשָׁעִים כְּמוֹ עֵשֶׂב, וַיָּצִיצוּ כֹּל-פֹּעֲלֵי אָוֶן, לְהִשָּׁמְדָם עֲדֵי-עַד. וְאַתָּה מָרוֹם לְעֹלָם יְהוָה. כִּי הִנֵּה אֹיְבֶיךָ יְהוָה, כִּי-הִנֵּה אֹיְבֶיךָ יֹאבֵדוּ, יִתְפָּרְדוּ כֹּל-פֹּעֲלֵי אָוֶן. וַתָּרֶם כִּרְאֵים קַרְנִי, בַּלֹּתִי בְּשֶׁמֶן רַעֲנָן. וַתַּבֵּט עֵינִי בְּשׁוּרָי, בַּקָּמִים עָלַי מְרֵעִים תִּשְׁמַעְנָה אָזְנָי. צַדִּיק כַּתָּמָר יִפְרָח, כְּאֶרֶז בַּלְּבָנוֹן יִשְׂגֶּה. שְׁתוּלִים בְּבֵית יְהוָה, בְּחַצְרוֹת אֱלֹהֵינוּ יַפְרִיחוּ. עוֹד יְנוּבוּן בְּשֵׂיבָה, דְּשֵׁנִים וְרַעֲנַנִּים יִהְיוּ. לְהַגִּיד כִּי-יָשָׁר יְהוָה, צוּרִי וְלֹא-עַוְלָתָה בּוֹ.",
  translit: "Mizmor shir leyom haShabbat. Tov lehodot la'Adonai ulezamer leshimcha Elyon. Lehagid baboker chasdecha ve'emunatecha baleilot. Alei-asor va'alei-navel alei higayon bechinor. Ki simachtani Adonai befa'olecha bema'asei yadecha aranen...",
  ru: "[Псалом 92 - Шаббат - Песнь дня] Псалом, песнь на день субботний. Благо славить Господа и петь имени Твоему, Всевышний, возвещать утром милость Твою и верность Твою по ночам, на десятиструнном и на арфе, с мелодией на гуслях. Ибо Ты возвеселил меня, Господи, деянием Твоим, о делах рук Твоих ликую. Как велики дела Твои, Господи, глубоки помыслы Твои. Человек невежественный не знает, и глупец не понимает сего. Когда цветут нечестивые как трава и процветают делающие беззаконие - для истребления их навеки. А Ты высок вовеки, Господи. Ибо вот враги Твои, Господи, вот враги Твои гибнут, рассеиваются все творящие беззаконие. Ты вознес рог мой как рог буйвола, я умащен свежим елеем. И видит око мое врагов моих, о злодеях, восстающих на меня, слышат уши мои. Праведник как пальма процветет, как кедр в Ливане возвысится. Насажденные в доме Господнем, во дворах Бога нашего процветут. Еще и в старости плодовиты будут, сочны и свежи, чтобы возвещать, что праведен Господь, твердыня моя, и нет неправды в Нем.",
  nl: "[Psalm 92 - Shabbat - Lied van de dag] Een psalm, een lied voor de dag van de Shabbat. Het is goed de Eeuwige te loven en Uw Naam te bezingen, Allerhoogste, om in de ochtend Uw goedertierenheid te verkondigen en Uw trouw in de nachten, op de tiensnarige en op de harp, met een lied op de lier. Want U hebt mij verblijd, Eeuwige, met Uw daden, over de werken van Uw handen juich ik. Hoe groot zijn Uw werken, Eeuwige, zeer diep zijn Uw gedachten. Een onverstandig man weet het niet, een dwaas begrijpt dit niet. Als goddelozen bloeien als gras en alle onrechtplegers groeien, is het om voor eeuwig verdelgd te worden. Maar U bent verheven voor altijd, Eeuwige. Want zie, Uw vijanden, Eeuwige, Uw vijanden zullen vergaan, alle onrechtplegers verstrooid. U verhoogt mijn hoorn als van een wilde os, ik ben overgoten met verse olie. Mijn oog ziet neer op mijn belagers, mijn oren horen over boosdoeners die tegen mij opstaan. De rechtvaardige bloeit als een palmboom, als een ceder in de Libanon groeit hij op. Geplant in het huis van de Eeuwige, bloeien zij in de voorhoven van onze God. Nog in de ouderdom dragen zij vrucht, sappig en fris zijn zij, om te verkondigen dat de Eeuwige rechtvaardig is, mijn Rots, en geen onrecht is in Hem.",
  en: "[Psalm 92 - Shabbat - Daily Psalm] A psalm, a song for the Sabbath day. It is good to give thanks to the Lord and to sing to Your Name, Most High, to declare Your loving-kindness in the morning and Your faithfulness at night, upon a ten-stringed instrument and upon the harp, with a song upon the lyre. For You have made me rejoice, Lord, with Your work, at the works of Your hands I shall sing. How great are Your works, Lord, how very deep are Your thoughts. A brutish man does not know, a fool does not understand this. When the wicked spring up like grass and all evildoers blossom, it is to be destroyed forever. But You are exalted forever, Lord. For behold Your enemies, Lord, behold Your enemies shall perish, all evildoers shall be scattered. You have exalted my horn like that of a wild ox, I am anointed with fresh oil. My eye has seen my watchful foes, my ears hear the wicked who rise against me. The righteous shall flourish like the palm tree, he shall grow like a cedar in Lebanon. Planted in the house of the Lord, they shall flourish in the courts of our God. They shall still bear fruit in old age, they shall be full of sap and freshness, to declare that the Lord is upright, my Rock, and there is no unrighteousness in Him.",
  fr: "[Psaume 92 - Shabbat - Chant du jour] Psaume, cantique pour le jour du Shabbat. Il est bon de louer l'Éternel et de chanter Ton Nom, Très-Haut, d'annoncer le matin Ta bonté et Ta fidélité la nuit, sur l'instrument à dix cordes et sur le luth, au son de la harpe. Car Tu m'as réjoui, Éternel, par Tes œuvres, je chante les ouvrages de Tes mains. Que Tes œuvres sont grandes, Éternel, que Tes pensées sont profondes. L'homme stupide ne sait pas, l'insensé ne comprend pas cela. Quand les méchants fleurissent comme l'herbe et que tous les ouvriers d'iniquité s'épanouissent, c'est pour être anéantis à jamais. Mais Toi, Tu es élevé pour toujours, Éternel. Car voici Tes ennemis, Éternel, voici Tes ennemis périront, tous les ouvriers d'iniquité seront dispersés. Tu élèves ma corne comme celle du buffle, je suis oint d'huile fraîche. Mon œil voit mes ennemis, mes oreilles entendent les méchants qui s'élèvent contre moi. Le juste fleurira comme le palmier, il grandira comme le cèdre au Liban. Plantés dans la maison de l'Éternel, ils fleuriront dans les parvis de notre Dieu. Encore dans la vieillesse ils porteront des fruits, ils seront pleins de sève et verdoyants, pour annoncer que l'Éternel est droit, mon Rocher, et qu'il n'y a pas d'injustice en Lui."
},
{
  id: 31,
  titleEn: "Tehillim 150 - Hallelu El BeKodsho",
  titleHe: "תְּהִלִּים ק״נ - הַלְלוּ־אֵל בְּקָדְשׁוֹ",
  he_display: "[Men beëindigt het zeggen van de tehillim met psalm 150 hieronder - One concludes the saying of tehillim with psalm 150 below]\nהַלְלוּיָהּ (קנ)\nהַלְלוּ־אֵל בְּקָדְשׁוֹ, הַלְלוּהוּ בִּרְקִיעַ עֻזּוֹ.\nהַלְלוּהוּ בִגְבוּרֹתָיו, הַלְלוּהוּ כְּרֹב גֻּדְלוֹ.\nהַלְלוּהוּ בְּתֵקַע שׁוֹפָר, הַלְלוּהוּ בְּנֵבֶל וְכִנּוֹר.\nהַלְלוּהוּ בְּתֹף וּמָחוֹל, הַלְלוּהוּ בְּמִנִּים וְעוּגָב.\nהַלְלוּהוּ בְּצִלְצְלֵי־שָׁמַע, הַלְלוּהוּ בְּצִלְצְלֵי תְרוּעָה.\nכֹּל הַנְּשָׁמָה תְּהַלֵּל יָהּ.\nהַלְלוּ־יָהּ.",
  he_tts: "הַלְלוּיָהּ\nהַלְלוּ־אֵל בְּקָדְשׁוֹ,\nהַלְלוּהוּ בִּרְקִיעַ עֻזּוֹ.\nהַלְלוּהוּ בִגְבוּרֹתָיו,\nהַלְלוּהוּ כְּרֹב גֻּדְלוֹ.\nהַלְלוּהוּ בְּתֵקַע שׁוֹפָר,\nהַלְלוּהוּ בְּנֵבֶל וְכִנּוֹר.\nהַלְלוּהוּ בְּתֹף וּמָחוֹל,\nהַלְלוּהוּ בְּמִנִּים וְעוּגָב.\nהַלְלוּהוּ בְּצִלְצְלֵי־שָׁמַע,\nהַלְלוּהוּ בְּצִלְצְלֵי תְרוּעָה.\nכֹּל הַנְּשָׁמָה תְּהַלֵּל יָהּ. הַלְלוּ־יָהּ.",
  translit: "Halleluyah (Kuf-Nun)\nHallelu-El bekodsho,\nhalleluhu birkia uzzo.\nHalleluhu bigvurotav,\nhalleluhu kerov gudlo.\nHalleluhu beteika shofar,\nhalleluhu benevel vechinor.\nHalleluhu betof umachol,\nhalleluhu beminnim ve'ugav.\nHalleluhu betziltzelei-shama,\nhalleluhu betziltzelei terua.\nKol haneshama tehallel Yah. Hallelu-Yah.",
  ru: "[Заканчивают чтение Тегилим псалмом 150 ниже - Заключительный псалом Псукей де-Зимра]\nАллилуйя (150)\nХвалите Бога во святилище Его,\nхвалите Его на тверди силы Его.\nХвалите Его за могущество Его,\nхвалите Его по множеству величия Его.\nХвалите Его звуком шофара,\nхвалите Его на арфе и лире.\nХвалите Его тимпаном и танцем,\nхвалите Его струнами и свирелью.\nХвалите Его на звучных кимвалах,\nхвалите Его на кимвалах громогласных.\nВсе дышащее да хвалит Господа. Аллилуйя.",
  nl: "[Men beëindigt het zeggen van de tehillim met psalm 150 hieronder - Laatste Psalm van Pesukei DeZimra]\nHallelu-Jah (150)\nLooft God in Zijn heiligdom,\nlooft Hem in het uitspansel van Zijn macht.\nLooft Hem om Zijn machtige daden,\nlooft Hem naar de overvloed van Zijn grootheid.\nLooft Hem met het geschal van de sjofar,\nlooft Hem met harp en lier.\nLooft Hem met tamboerijn en dans,\nlooft Hem met snaren en fluit.\nLooft Hem met luid klinkende cimbalen,\nlooft Hem met schallende cimbalen.\nAlles wat adem heeft love God. Hallelu-Jah.",
  en: "[One concludes the saying of tehillim with psalm 150 below - Final Psalm of Pesukei DeZimra]\nHallelujah (150)\nPraise God in His sanctuary,\npraise Him in the firmament of His might.\nPraise Him for His mighty acts,\npraise Him according to His abundant greatness.\nPraise Him with the blast of the shofar,\npraise Him with harp and lyre.\nPraise Him with drum and dance,\npraise Him with strings and flute.\nPraise Him with sounding cymbals,\npraise Him with resounding cymbals.\nLet every soul praise God. Hallelujah.",
  fr: "[On conclut la récitation des tehillim par le psaume 150 ci-dessous - Psaume final de Pesukei DeZimra]\nAlléluia (150)\nLouez Dieu dans Son sanctuaire,\nlouez-Le dans le firmament de Sa puissance.\nLouez-Le pour Ses hauts faits,\nlouez-Le selon l'immensité de Sa grandeur.\nLouez-Le au son du chofar,\nlouez-Le avec la harpe et la lyre.\nLouez-Le avec le tambourin et la danse,\nlouez-Le avec les cordes et la flûte.\nLouez-Le avec les cymbales retentissantes,\nlouez-Le avec les cymbales éclatantes.\nQue tout ce qui respire loue Dieu. Alléluia."
},
{
  id: 32,
  titleEn: "Baruch Adonai LeOlam",
  titleHe: "בָּרוּךְ יְיָ לְעוֹלָם",
  he_display: "[Verses of redemption that conclude Pesukei DeZimra in Ashkenaz tradition]\nבָּרוּךְ יְיָ לְעוֹלָם, אָמֵן וְאָמֵן. בָּרוּךְ יְיָ מִצִּיּוֹן, שֹׁכֵן יְרוּשָׁלִָם, הַלְלוּ-יָהּ. בָּרוּךְ יְיָ אֱלֹהִים אֱלֹהֵי יִשְׂרָאֵל, עֹשֵׂה נִפְלָאוֹת לְבַדּוֹ. וּבָרוּךְ שֵׁם כְּבוֹדוֹ לְעוֹלָם, וְיִמָּלֵא כְבוֹדוֹ אֶת-כָּל-הָאָרֶץ, אָמֵן וְאָמֵן.",
  he_tts: "בָּרוּךְ יְיָ לְעוֹלָם, אָמֵן וְאָמֵן. בָּרוּךְ יְיָ מִצִּיּוֹן, שֹׁכֵן יְרוּשָׁלִָם, הַלְלוּ-יָהּ. בָּרוּךְ יְיָ אֱלֹהִים אֱלֹהֵי יִשְׂרָאֵל, עֹשֵׂה נִפְלָאוֹת לְבַדּוֹ. וּבָרוּךְ שֵׁם כְּבוֹדוֹ לְעוֹלָם, וְיִמָּלֵא כְבוֹדוֹ אֶת-כֹּל-הָאָרֶץ, אָמֵן וְאָמֵן.",
  translit: "Baruch Adonai le'olam, amen ve'amen. Baruch Adonai miTziyyon, shochen Yerushalayim, hallelu-Yah. Baruch Adonai Elohim Elohei Yisrael, ose niflaot levado. Uvaruch shem kevodo le'olam, veyimmale chevodo et-kol-ha'aretz, amen ve'amen.",
  ru: "[Стихи искупления, завершающие Псукей де-Зимра в ашкеназской традиции] Благословен Господь вовеки, амен и амен. Благословен Господь из Сиона, обитающий в Иерусалиме, аллилуйя. Благословен Господь Бог, Бог Израиля, творящий чудеса один. И благословенно славное имя Его вовек, и наполнится славою Его вся земля, амен и амен.",
  nl: "[Verzen van verlossing die Pesukei DeZimra afsluiten in Asjkenazische traditie] Gezegend is de Eeuwige voor altijd, amen en amen. Gezegend is de Eeuwige uit Sion, Die woont in Jeruzalem, hallelu-Jah. Gezegend is de Eeuwige God, de God van Israël, Die alleen wonderen doet. En gezegend is Zijn heerlijke Naam voor altijd, en de hele aarde worde vervuld van Zijn heerlijkheid, amen en amen.",
  en: "[Verses of redemption that conclude Pesukei DeZimra in Ashkenaz tradition] Blessed is the Lord forever, amen and amen. Blessed is the Lord out of Zion, Who dwells in Jerusalem, hallelujah. Blessed is the Lord God, the God of Israel, Who alone does wondrous things. And blessed be His glorious Name forever, and let the whole earth be filled with His glory, amen and amen.",
  fr: "[Versets de rédemption qui concluent Pesukei DeZimra dans la tradition ashkénaze] Béni est l'Éternel à jamais, amen et amen. Béni est l'Éternel depuis Sion, qui réside à Jérusalem, alléluia. Béni est l'Éternel Dieu, Dieu d'Israël, qui seul fait des merveilles. Et béni soit Son Nom glorieux à jamais, et que toute la terre soit remplie de Sa gloire, amen et amen."
},
{
  id: 33,
  titleEn: "Vayosha Adonai BaYom HaHu",
  titleHe: "וַיּוֹשַׁע יְיָ בַּיּוֹם הַהוּא",
  he_display: "[Transition from Pesukei DeZimra to Shirat HaYam - Exodus 14:30-31]\nוַיּוֹשַׁע יְיָ בַּיּוֹם הַהוּא אֶת-יִשְׂרָאֵל מִיַּד מִצְרָיִם, וַיַּרְא יִשְׂרָאֵל אֶת-מִצְרַיִם מֵת עַל-שְׂפַת הַיָּם. וַיַּרְא יִשְׂרָאֵל אֶת-הַיָּד הַגְּדֹלָה אֲשֶׁר עָשָׂה יְיָ בְּמִצְרַיִם, וַיִּירְאוּ הָעָם אֶת-יְיָ, וַיַּאֲמִינוּ בַּיהוָה וּבְמֹשֶׁה עַבְדּוֹ.",
  he_tts: "וַיּוֹשַׁע יְיָ בַּיּוֹם הַהוּא אֶת-יִשְׂרָאֵל מִיַּד מִצְרַיִם, וַיַּרְא יִשְׂרָאֵל אֶת-מִצְרַיִם מֵת עַל-שְׂפַת הַיָּם. וַיַּרְא יִשְׂרָאֵל אֶת-הַיָּד הַגְּדֹלָה אֲשֶׁר עָשָׂה יְיָ בְּמִצְרַיִם, וַיִּירְאוּ הָעָם אֶת-יְיָ, וַיַּאֲמִינוּ בַּיהוָה וּבְמֹשֶׁה עַבְדּוֹ.",
  translit: "Vayosha Adonai bayom hahu et-Yisrael miyad Mitzrayim, vayar Yisrael et-Mitzrayim met al-sefat hayam. Vayar Yisrael et-hayad hagedola asher asa Adonai beMitzrayim, vayir'u ha'am et-Adonai, vaya'aminu baAdonai uvMoshe avdo.",
  ru: "[Переход от Псукей де-Зимра к Шират ха-Ям - Шмот 14:30-31] И спас Господь в тот день Израиль от руки египтян, и увидел Израиль египтян мертвыми на берегу моря. И увидел Израиль великую руку, которую простер Господь над египтянами, и устрашился народ Господа и поверил в Господа и в Моше, раба Его.",
  nl: "[Overgang van Pesukei DeZimra naar Shirat HaYam - Exodus 14:30-31] Zo verloste de Eeuwige op die dag Israël uit de hand van de Egyptenaren, en Israël zag de Egyptenaren dood aan de oever van de zee. En Israël zag de grote hand die de Eeuwige tegen Egypte had gedaan, en het volk vreesde de Eeuwige en geloofde in de Eeuwige en in Mosje, Zijn dienaar.",
  en: "[Transition from Pesukei DeZimra to Shirat HaYam - Exodus 14:30-31] Thus the Lord saved Israel on that day from the hand of Egypt, and Israel saw the Egyptians dead upon the seashore. And Israel saw the great power which the Lord had shown against Egypt, and the people feared the Lord, and they believed in the Lord and in Moshe His servant.",
  fr: "[Transition de Pesukei DeZimra à Shirat HaYam - Exode 14:30-31] Ainsi l'Éternel sauva Israël ce jour-là de la main des Égyptiens, et Israël vit les Égyptiens morts sur le rivage de la mer. Et Israël vit la grande puissance que l'Éternel avait déployée contre l'Égypte, et le peuple craignit l'Éternel et crut en l'Éternel et en Moïse Son serviteur."
},
{
  id: 34,
  titleEn: "Yishtabach Shimcha LaAd Malkenu",
  titleHe: "יִשְׁתַּבַּח שִׁמְךָ לָעַד",
  he_display: "[Closing blessing of Psukei DeZimra]\nיִשְׁתַּבַּח שִׁמְךָ לָעַד מַלְכֵּנוּ, הָאֵל הַמֶּלֶךְ הַגָּדוֹל וְהַקָּדוֹשׁ בַּשָּׁמַיִם וּבָאָרֶץ. כִּי לְךָ נָאֶה, יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שִׁיר וּשְׁבָחָה, הַלֵּל וְזִמְרָה, עֹז וּמֶמְשָׁלָה, נֶצַח, גֹּדֶל וּגְבוּרָה, תְּהִלָּה וְתִפְאֶרֶת, קְדֻשָּׁה וּמַלְכוּת, בְּרָכוֹת וְהוֹדָאוֹת מֵעַתָּה וְעַד עוֹלָם. בָּרוּךְ אַתָּה יְיָ, אֵל מֶלֶךְ גָּדוֹל בַּשְּׁבָחוֹת, אֵל הַהוֹדָאוֹת, אֲדוֹן הַנִּפְלָאוֹת, הַבּוֹחֵר בְּשִׁירֵי זִמְרָה, מֶלֶךְ, אֵל, חֵי הָעוֹלָמִים.",
  he_tts: "יִשְׁתַּבַּח שִׁמְךָ לָעַד מַלְכֵּנוּ, הָאֵל הַמֶּלֶךְ הַגָּדוֹל וְהַקָּדוֹשׁ בַּשָּׁמַיִם וּבָאָרֶץ. כִּי לְךָ נָאֶה, יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שִׁיר וּשְׁבָחָה, הַלֵּל וְזִמְרָה, עֹז וּמֶמְשָׁלָה, נֶצַח, גֹּדֶל וּגְבוּרָה, תְּהִלָּה וְתִפְאֶרֶת, קְדֻשָּׁה וּמַלְכוּת, בְּרָכוֹת וְהוֹדָאוֹת מֵעַתָּה וְעַד עוֹלָם. בָּרוּךְ אַתָּה יְיָ, אֵל מֶלֶךְ גָּדוֹל בַּשְּׁבָחוֹת, אֵל הַהוֹדָאוֹת, אֲדוֹן הַנִּפְלָאוֹת, הַבּוֹחֵר בְּשִׁירֵי זִמְרָה, מֶלֶךְ, אֵל, חֵי הָעוֹלָמִים.",
  translit: "Yishtabach shimcha la'ad Malkenu, HaEl HaMelech hagadol vehakadosh bashamayim uva'aretz. Ki lecha na'eh, Adonai Eloheinu ve'Elohei avoteinu, shir ushbacha, hallel vezimra, oz umemshala, netzach, godel ugvura, tehilla vetif'eret, kedusha umalchut, brachot vehoda'ot me'ata ve'ad olam. Baruch atah Adonai, El Melech gadol bashvachot, El hahoda'ot, Adon hanifla'ot, habocher beshirei zimra, Melech, El, chei ha'olamim.",
  ru: "[Заключительное благословение Псукей де-Зимра] Да будет восхваляемо Имя Твое вовеки, Царь наш, Бог, Царь великий и святой на небесах и на земле. Ибо Тебе подобает, Господь, Бог наш и Бог отцов наших, песнь и хвала, славословие и напев, сила и власть, вечность, величие и могущество, прославление и великолепие, святость и царствие, благословения и благодарения отныне и вовеки. Благословен Ты, Господь, Бог, Царь великий в хвалениях, Бог благодарений, Владыка чудес, избирающий песни прославления, Царь, Бог, Живой вечно.",
  nl: "[Slotzegening van Psukei DeZimra] Geprezen zij Uw Naam voor altijd, onze Koning, de God, de grote en heilige Koning in hemel en op aarde. Want U komt toe, Eeuwige, onze God en God van onze vaderen, lied en lof, Halleel en gezang, macht en heerschappij, eeuwigheid, grootheid en kracht, lofprijzing en glorie, heiligheid en koningschap, zegeningen en dankzeggingen van nu tot in eeuwigheid. Gezegend bent U, Eeuwige, God, grote Koning in lofprijzingen, God van dankzeggingen, Heer der wonderen, Die behagen schept in liederen en gezangen, Koning, God, Levende der werelden.",
  en: "[Closing blessing of Psukei DeZimra] Praised be Your Name forever, our King, the God, the great and holy King in heaven and on earth. For to You it is fitting, Lord our God and God of our fathers, song and praise, hallel and psalms, power and dominion, eternity, greatness and might, glory and splendor, holiness and kingship, blessings and thanksgivings from now and forever. Blessed are You, Lord, God, great King in praises, God of thanksgivings, Lord of wonders, Who chooses songs of praise, King, God, Life of the worlds.",
  fr: "[Bénédiction finale de Psukei DeZimra] Que Ton Nom soit loué à jamais, notre Roi, le Dieu, le Roi grand et saint dans les cieux et sur la terre. Car à Toi conviennent, Éternel, notre Dieu et Dieu de nos pères, chant et louange, hallel et cantique, force et domination, éternité, grandeur et puissance, gloire et splendeur, sainteté et royauté, bénédictions et actions de grâce dès maintenant et à jamais. Béni sois-Tu, Éternel, Dieu, grand Roi dans les louanges, Dieu des actions de grâce, Maître des merveilles, qui choisis les chants de louange, Roi, Dieu, Vivant des mondes."
},
{
  id: 35,
  titleEn: "Chatsi Kaddish - Yitgadal VeYitkadash",
  titleHe: "חֲצִי קַדִּישׁ",
  he_display: "[Half Kaddish - transition to Shma. Requires Minyan - Chazzan]\nיִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכָל-בֵּית יִשְׂרָאֵל בַּעֲגָלָא וּבִזְמַן קָרִיב, וְאִמְרוּ אָמֵן.\nיְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.\nיִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא, בְּרִיךְ הוּא, לְעֵלָּא מִן-כָּל-בִּרְכָתָא וְשִׁירָתָא תֻּשְׁבְּחָתָא וְנֶחֱמָתָא דַּאֲמִירָן בְּעָלְמָא, וְאִמְרוּ אָמֵן.",
  he_tts: "יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ, וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכֹל-בֵּית יִשְׂרָאֵל בַּעֲגָלָא וּבִזְמַן קָרִיב, וְאִמְרוּ אָמֵן.\nיְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא.\nיִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא, בְּרִיךְ הוּא, לְעֵלָּא מִן-כֹּל-בִּרְכָתָא וְשִׁירָתָא תֻּשְׁבְּחָתָא וְנֶחֱמָתָא דַּאֲמִירָן בְּעָלְמָא, וְאִמְרוּ אָמֵן.",
  translit: "Yitgadal veyitkadash shemeh rabba. Be'alma di vera chir'uteh, veyamlich malchuteh bechayeichon uvyomeichon uvchayei dechol-beit Yisrael ba'agala uvizman kariv, ve'imru amen.\nYehe shemeh rabba mevarach le'alam ule'almei almaya.\nYitbarach veyishtabach veyitpa'ar veyitromam veyitnase veyit'hadar veyit'aleh veyit'halal shemeh dekudsha, berich Hu, le'ela min-kol-birchata veshirata tushbechata venechemata da'amiran be'alma, ve'imru amen.",
  ru: "[Полукадиш - переход к Шма. Требуется миньян - Хазан]\nДа возвеличится и освятится великое Имя Его. В мире, который сотворил Он по воле Своей, и да воцарит царствие Его при жизни вашей и в дни ваши и при жизни всего дома Израиля, в скором времени, и скажите амен.\nДа будет великое Имя Его благословенно вовеки и во веки веков.\nДа будет благословенно и восхваляемо, и прославляемо, и превозносимо, и возвышаемо, и почитаемо, и возвеличиваемо, и воспеваемо Имя Святого, благословен Он, выше всех благословений и песнопений, хвалений и утешений, произносимых в мире, и скажите амен.",
  nl: "[Half Kaddisj - overgang naar Sjema. Minjan vereist - Chazzan]\nMoge Zijn grote Naam verheven en geheiligd worden. In de wereld die Hij naar Zijn wil geschapen heeft, moge Hij Zijn koningschap doen heersen in jullie leven en in jullie dagen en in het leven van heel het huis Israël, spoedig en weldra, en zegt amen.\nMoge Zijn grote Naam gezegend zijn voor eeuwig en tot in alle eeuwigheden.\nMoge gezegend en geprezen en verheerlijkt en verheven en verhoogd en geëerd en verheven en geloofd worden de Naam van de Heilige, gezegend is Hij, ver boven alle zegeningen en liederen, lofprijzingen en troostwoorden die in de wereld uitgesproken worden, en zegt amen.",
  en: "[Half Kaddish - transition to Shma. Requires Minyan - Chazzan]\nMay His great Name be magnified and sanctified. In the world which He created according to His will, may He establish His kingdom in your lifetime and in your days and in the lifetime of all the House of Israel, speedily and soon, and say amen.\nMay His great Name be blessed forever and to all eternity.\nBlessed and praised and glorified and exalted and elevated and honored and uplifted and lauded be the Name of the Holy One, blessed is He, beyond all blessings and songs, praises and consolations that are spoken in the world, and say amen.",
  fr: "[Demi Kaddich - transition vers le Chema. Minyan requis - Chazzan]\nQue Son grand Nom soit magnifié et sanctifié. Dans le monde qu'Il a créé selon Sa volonté, qu'Il établisse Son règne de votre vivant et en vos jours et du vivant de toute la maison d'Israël, rapidement et bientôt, et dites amen.\nQue Son grand Nom soit béni à jamais et pour l'éternité des éternités.\nBéni et loué et glorifié et exalté et élevé et honoré et haut élevé et célébré soit le Nom du Saint, béni soit-Il, au-dessus de toutes les bénédictions et cantiques, louanges et consolations qui se disent dans le monde, et dites amen."
},
{
  id: 36,
  titleEn: "Yotzer Or Uvore Choshech",
  titleHe: "יוֹצֵר אוֹר - בְּרָכָה רִאשׁוֹנָה לִקְרִיאַת שְׁמַע",
  he_display: "בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, יוֹצֵר אוֹר, וּבוֹרֵא חֹשֶׁךְ, עֹשֶׂה שָׁלוֹם וּבוֹרֵא אֶת-הַכֹּל. הַמֵּאִיר לָאָרֶץ וְלַדָּרִים עָלֶיהָ בְּרַחֲמִים, וּבְטוּבוֹ מְחַדֵּשׁ בְּכָל-יוֹם תָּמִיד מַעֲשֵׂה בְרֵאשִׁית. מַה-רַבּוּ מַעֲשֶׂיךָ יְיָ, כֻּלָּם בְּחָכְמָה עָשִׂיתָ, מָלְאָה הָאָרֶץ קִנְיָנֶךָ. הַמֶּלֶךְ הַמְּרוֹמָם לְבַדּוֹ מֵאָז, הַמְשֻׁבָּח וְהַמְפֹאָר וְהַמִּתְנַשֵּׂא מִימוֹת עוֹלָם. אֱלֹהֵי עוֹלָם, בְּרַחֲמֶיךָ הָרַבִּים רַחֵם עָלֵינוּ, אֲדוֹן עֻזֵּנוּ צוּר מִשְׂגַּבֵּנוּ, מָגֵן יִשְׁעֵנוּ מִשְׂגָּב בַּעֲדֵנוּ.\nאֵל בָּרוּךְ גְּדוֹל דֵּעָה, הֵכִין וּפָעַל זָהֳרֵי חַמָּה, טוֹב יָצַר כָּבוֹד לִשְׁמוֹ, מְאוֹרוֹת נָתַן סְבִיבוֹת עֻזּוֹ, פִּנּוֹת צְבָאָיו קְדוֹשִׁים, רוֹמְמֵי שַׁדַּי, תָּמִיד מְסַפְּרִים כְּבוֹד אֵל וְקַדְשׁוֹ. תִּתְבָּרַךְ יְיָ אֱלֹהֵינוּ עַל שֶׁבַח מַעֲשֵׂה יָדֶיךָ, וְעַל מְאוֹרֵי אוֹר שֶׁעָשִׂיתָ יְפָאֲרוּךָ סֶלָה.\nכָּאָמוּר לְעֹשֵׂה אוֹרִים גְּדוֹלִים, כִּי לְעוֹלָם חַסְדּוֹ.\nאוֹר חָדָשׁ עַל-צִיּוֹן תָּאִיר וְנִזְכֶּה כֻלָּנוּ מְהֵרָה לְאוֹרוֹ.\nבָּרוּךְ אַתָּה יְיָ יוֹצֵר הַמְּאוֹרוֹת.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, יוֹצֵר אוֹר, וּבוֹרֵא חֹשֶׁךְ, עֹשֶׂה שָׁלוֹם וּבוֹרֵא אֶת-הַכֹּל. הַמֵּאִיר לָאָרֶץ וְלַדָּרִים עָלֶיהָ בְּרַחֲמִים, וּבְטוּבוֹ מְחַדֵּשׁ בְּכֹל-יוֹם תָּמִיד מַעֲשֵׂה בְרֵאשִׁית. מַה-רַבּוּ מַעֲשֶׂיךָ יְיָ, כֻּלָּם בְּחָכְמָה עָשִׂיתָ, מָלְאָה הָאָרֶץ קִנְיָנֶךָ. הַמֶּלֶךְ הַמְּרוֹמָם לְבַדּוֹ מֵאָז, הַמְשֻׁבָּח וְהַמְפֹאָר וְהַמִּתְנַשֵּׂא מִימוֹת עוֹלָם. אֱלֹהֵי עוֹלָם, בְּרַחֲמֶיךָ הָרַבִּים רַחֵם עָלֵינוּ, אֲדוֹן עֻזֵּנוּ צוּר מִשְׂגַּבֵּנוּ, מָגֵן יִשְׁעֵנוּ מִשְׂגָּב בַּעֲדֵנוּ. אֵל בָּרוּךְ גְּדוֹל דֵּעָה, הֵכִין וּפָעַל זָהֳרֵי חַמָּה, טוֹב יָצַר כָּבוֹד לִשְׁמוֹ, מְאוֹרוֹת נָתַן סְבִיבוֹת עֻזּוֹ, פִּנּוֹת צְבָאָיו קְדוֹשִׁים, רוֹמְמֵי שַׁדַּי, תָּמִיד מְסַפְּרִים כְּבוֹד אֵל וְקַדְשׁוֹ. תִּתְבָּרַךְ יְיָ אֱלֹהֵינוּ עַל שֶׁבַח מַעֲשֵׂה יָדֶיךָ, וְעַל מְאוֹרֵי אוֹר שֶׁעָשִׂיתָ יְפָאֲרוּךָ סֶלָה. כָּאָמוּר לְעֹשֵׂה אוֹרִים גְּדוֹלִים, כִּי לְעוֹלָם חַסְדּוֹ. אוֹר חָדָשׁ עַל-צִיּוֹן תָּאִיר וְנִזְכֶּה כֻלָּנוּ מְהֵרָה לְאוֹרוֹ. בָּרוּךְ אַתָּה יְיָ יוֹצֵר הַמְּאוֹרוֹת.",
  translit: "Baruch atah Adonai, Eloheinu melech ha'olam, yotzer or uvore choshech, oseh shalom uvore et-hakol. Hame'ir la'aretz veladarim aleha berachamim, uvetuvo mechadesh bechol-yom tamid ma'aseh bereshit. Ma-rabu ma'asecha Adonai, kulam bechochma asita, mal'ah ha'aretz kinyanecha. HaMelech hameromam levado me'az, hamshubach vehamefo'ar vehamitnase mimot olam. Elohei olam, berachamecha harabim rachem aleinu, Adon uzenu Tzur misgavenu, magen yish'enu misgav ba'adenu. El baruch gedol de'a, hechin ufa'al zoharei chama, tov yatzar kavod lishmo, me'orot natan sevivut uzo, pinot tzeva'av kedoshim, romemei Shaddai, tamid mesaprim kevod El ukedusho. Titbarach Adonai Eloheinu al shevach ma'aseh yadecha, ve'al me'orei or she'asita yefa'arucha sela. Ka'amur le'oseh orim gedolim, ki le'olam chasdo. Or chadash al-Tziyyon ta'ir venizkeh chulanu mehera le'oro. Baruch atah Adonai yotzer hame'orot.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, Творящий свет и Сотворяющий тьму, Делающий мир и Сотворяющий все. Освещающий землю и живущих на ней по милосердию и по благости Своей обновляющий каждый день, всегда, творение начала. Как многочисленны дела Твои, Господи, все премудростью Ты сотворил, полна земля достоянием Твоим. Царь, Вознесенный Единый издревле, Восхваляемый и Прославляемый и Превозносимый от вечных времен. Бог вечный, по милосердию великому Твоему смилуйся над нами, Владыка силы нашей, Твердыня оплота нашего, Щит спасения нашего, Оплот за нас. Бог благословенный, великий ведением, уготовил и сотворил сияние солнца, благо сотворил славу Имени Своему, светила поставил вокруг могущества Своего, воинства святые, возносящие Всемогущего, всегда рассказывают о славе Бога и святости Его. Да будешь благословен, Господи, Бог наш, за хвалу деяний рук Твоих и за светила света, что сотворил Ты, да прославят Тебя вовек. Как сказано: Творящему светила великие, ибо вовеки милость Его. Свет новый над Сионом озари и удостоимся все мы вскоре света Его. Благословен Ты, Господь, Творец светил.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Schepper van licht en Schepper van duisternis, Die vrede maakt en alles schept. Die de aarde en wie erop wonen verlicht met barmhartigheid, en in Zijn goedheid elke dag voortdurend het werk van het begin vernieuwt. Hoe talrijk zijn Uw werken, Eeuwige, U hebt ze alle met wijsheid gemaakt, vol is de aarde van Uw bezittingen. De Koning, Die alleen van oudsher verheven is, Die geprezen en verheerlijkt en verhoogd wordt sinds eeuwige tijden. God der wereld, ontferm U in Uw grote barmhartigheid over ons, Heer van onze kracht, Rots van onze vesting, Schild van ons heil, Burcht voor ons. Gezegende God, groot van kennis, heeft de zonnestralen bereid en gemaakt, ten goede schiep Hij eer voor Zijn Naam, lichten plaatste Hij rondom Zijn macht, de heilige scharen van Zijn legers, verheffers van de Almachtige, vertellen voortdurend van Gods eer en Zijn heiligheid. Gezegend bent U, Eeuwige, onze God, voor de lof van het werk van Uw handen, en voor de lichtende lichten die U gemaakt hebt, zullen zij U loven, sela. Zoals gezegd: Die grote lichten maakt, want eeuwig is Zijn goedertierenheid. Een nieuw licht over Sion zult U doen schijnen en mogen wij allen spoedig van Zijn licht genieten. Gezegend bent U, Eeuwige, Schepper van de lichtende lichten.",
  en: "Blessed are You, Lord our God, King of the universe, Who forms light and creates darkness, makes peace and creates all. Who illuminates the earth and those who dwell upon it with mercy, and in His goodness renews every day continually the work of creation. How numerous are Your works, Lord, You made them all in wisdom, the earth is full of Your possessions. The King Who alone was exalted from of old, Who is praised and glorified and elevated from ancient times. God of eternity, in Your abundant mercy have mercy upon us, Lord of our might, Rock of our stronghold, Shield of our salvation, Stronghold for us. Blessed God, great in knowledge, prepared and made the rays of the sun, goodly He created glory for His Name, luminaries He set around His might, the holy ones, the angles of His hosts, exalters of the Almighty, continually tell of the glory of God and His holiness. Blessed be You, Lord our God, for the praise of Your handiwork, and for the luminaries of light You made, they shall glorify You forever. As it is said: To Him Who makes great lights, for His mercy endures forever. May You shine a new light upon Zion and may we all soon merit its light. Blessed are You, Lord, Creator of the luminaries.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui formes la lumière et crées les ténèbres, fais la paix et crées tout. Qui illumine la terre et ses habitants avec miséricorde, et dans Sa bonté renouvelle chaque jour continuellement l'œuvre de la création. Que Tes œuvres sont nombreuses, Éternel, Tu les as toutes faites avec sagesse, la terre est pleine de Tes possessions. Le Roi qui seul est élevé depuis toujours, loué et glorifié et exalté depuis les temps anciens. Dieu d'éternité, dans Ton abondante miséricorde aie pitié de nous, Seigneur de notre force, Rocher de notre forteresse, Bouclier de notre salut, Rempart pour nous. Dieu béni, grand en connaissance, a préparé et fait les rayons du soleil, Il a bien créé la gloire pour Son Nom, des luminaires Il a placés autour de Sa puissance, les cohortes saintes de Ses armées, exaltant le Tout-Puissant, racontent sans cesse la gloire de Dieu et Sa sainteté. Sois béni, Éternel, notre Dieu, pour la louange de l'œuvre de Tes mains, et pour les luminaires de lumière que Tu as faits, qu'ils Te glorifient à jamais. Comme il est dit: À Celui qui fait les grandes lumières, car éternelle est Sa bonté. Une lumière nouvelle sur Sion Tu feras briller et puissions-nous tous bientôt mériter Sa lumière. Béni sois-Tu, Éternel, Créateur des luminaires."
},
{
  id: 37,
  titleEn: "Ahava Raba Ahavtanu",
  titleHe: "אַהֲבָה רַבָּה",
  he_display: "[Second Beracha.]\nאַהֲבָה רַבָּה אֲהַבְתָּנוּ, יְיָ אֱלֹהֵינוּ, חֶמְלָה גְדוֹלָה וִיתֵרָה חָמַלְתָּ עָלֵינוּ. אָבִינוּ מַלְכֵּנוּ, בַּעֲבוּר אֲבוֹתֵינוּ שֶׁבָּטְחוּ בְךָ, וַתְּלַמְּדֵם חֻקֵּי חַיִּים, כֵּן תְּחָנֵּנוּ וּתְלַמְּדֵנוּ.\nאָבִינוּ, הָאָב הָרַחֲמָן, הַמְרַחֵם, רַחֵם עָלֵינוּ, וְתֵן בְּלִבֵּנוּ לְהָבִין וּלְהַשְׂכִּיל, לִשְׁמֹעַ, לִלְמֹד וּלְלַמֵּד, לִשְׁמֹר וְלַעֲשׂוֹת וּלְקַיֵּם אֶת-כָּל-דִּבְרֵי תַלְמוּד תּוֹרָתֶךָ בְּאַהֲבָה.\nוְהָאֵר עֵינֵינוּ בְּתוֹרָתֶךָ, וְדַבֵּק לִבֵּנוּ בְּמִצְוֹתֶיךָ, וְיַחֵד לְבָבֵנוּ לְאַהֲבָה וּלְיִרְאָה אֶת-שְׁמֶךָ, וְלֹא נֵבוֹשׁ וְלֹא נִכָּלֵם וְלֹא נִכָּשֵׁל לְעוֹלָם וָעֶד. כִּי בְשֵׁם קָדְשְׁךָ הַגָּדוֹל וְהַנּוֹרָא בָּטַחְנוּ, נָגִילָה וְנִשְׂמְחָה בִּישׁוּעָתֶךָ.\n[One takes the four tzitzit in the left hand]\nוַהֲבִיאֵנוּ לְשָׁלוֹם מֵאַרְבַּע כַּנְפוֹת הָאָרֶץ, וְתוֹלִיכֵנוּ קוֹמְמִיּוּת לְאַרְצֵנוּ, כִּי אֵל פּוֹעֵל יְשׁוּעוֹת אָתָּה, וּבָנוּ בָחַרְתָּ מִכָּל-עַם וְלָשׁוֹן, וְקֵרַבְתָּנוּ לְשִׁמְךָ הַגָּדוֹל סֶלָה בֶּאֱמֶת, לְהוֹדוֹת לְךָ וּלְיַחֶדְךָ בְּאַהֲבָה. בָּרוּךְ אַתָּה יְיָ, הַבּוֹחֵר בְּעַמּוֹ יִשְׂרָאֵל בְּאַהֲבָה.",
  he_tts: "אַהֲבָה רַבָּה אֲהַבְתָּנוּ, יְיָ אֱלֹהֵינוּ, חֶמְלָה גְדוֹלָה וִיתֵרָה חָמַלְתָּ עָלֵינוּ. אָבִינוּ מַלְכֵּנוּ, בַּעֲבוּר אֲבוֹתֵינוּ שֶׁבָּטְחוּ בְךָ, וַתְּלַמְּדֵם חֻקֵּי חַיִּים, כֵּן תְּחָנֵּנוּ וּתְלַמְּדֵנוּ. אָבִינוּ, הָאָב הָרַחֲמָן, הַמְרַחֵם, רַחֵם עָלֵינוּ, וְתֵן בְּלִבֵּנוּ לְהָבִין וּלְהַשְׂכִּיל, לִשְׁמֹעַ, לִלְמֹד וּלְלַמֵּד, לִשְׁמֹר וְלַעֲשׂוֹת וּלְקַיֵּם אֶת-כֹּל-דִּבְרֵי תַלְמוּד תּוֹרָתֶךָ בְּאַהֲבָה. וְהָאֵר עֵינֵינוּ בְּתוֹרָתֶךָ, וְדַבֵּק לִבֵּנוּ בְּמִצְוֹתֶיךָ, וְיַחֵד לְבָבֵנוּ לְאַהֲבָה וּלְיִרְאָה אֶת-שְׁמֶךָ, וְלֹא נֵבוֹשׁ וְלֹא נִכָּלֵם וְלֹא נִכָּשֵׁל לְעוֹלָם וָעֶד. כִּי בְשֵׁם קָדְשְׁךָ הַגָּדוֹל וְהַנּוֹרָא בָּטַחְנוּ, נָגִילָה וְנִשְׂמְחָה בִּישׁוּעָתֶךָ. וַהֲבִיאֵנוּ לְשָׁלוֹם מֵאַרְבַּע כַּנְפוֹת הָאָרֶץ, וְתוֹלִיכֵנוּ קוֹמְמִיּוּת לְאַרְצֵנוּ, כִּי אֵל פּוֹעֵל יְשׁוּעוֹת אָתָּה, וּבָנוּ בָחַרְתָּ מִכֹּל-עַם וְלָשׁוֹן, וְקֵרַבְתָּנוּ לְשִׁמְךָ הַגָּדוֹל סֶלָה בֶּאֱמֶת, לְהוֹדוֹת לְךָ וּלְיַחֶדְךָ בְּאַהֲבָה. בָּרוּךְ אַתָּה יְיָ, הַבּוֹחֵר בְּעַמּוֹ יִשְׂרָאֵל בְּאַהֲבָה.",
  translit: "Ahava rabba ahavtanu, Adonai Eloheinu, chemla gedola vitera chamalta aleinu. Avinu Malkenu, ba'avur avoteinu shebatchu vecha, vatelamdem chukei chayim, ken techonenu utelamdenu. Avinu, HaAv HaRachaman, haMerachem, rachem aleinu, veten belibenu lehavin ulhaskil, lishmoa, lilmod ul'lamed, lishmor vela'asot ulkayem et-kol-divrei talmud Toratecha be'ahava.\nVeha'er eineinu beToratecha, vedabek libenu bemitzvotecha, veyached levavenu le'ahava uleyir'ah et-shmecha, velo nevosh velo nikolem velo nikashel le'olam va'ed. Ki veshem kodshecha hagadol vehanora batachnu, nagila venismecha bishuatecha.\nVahavi'enu leshalom me'arba kanfot ha'aretz, vetolichenu komemiyut le'artzenu, ki El po'el yeshuot atah, uvanu vacharta mikol-am velashon, vekeravtanu leshimcha hagadol sela be'emet, lehodot lecha uleyachedcha be'ahava. Baruch atah Adonai, habocher be'amo Yisrael be'ahava.",
  ru: "[Вторая браха]\nВеликою любовью возлюбил Ты нас, Господь, Бог наш, великой и безмерной жалостью сжалился Ты над нами. Отец наш, Царь наш, ради отцов наших, уповавших на Тебя, и Ты обучал их законам жизни, так смилуйся над нами и обучи нас. Отец наш, Отец милосердный, Милующий, смилуйся над нами и вложи в сердце наше понимать и разуметь, слушать, учить и обучать, хранить и исполнять и осуществлять все слова учения Торы Твоей с любовью.\nИ просвети очи наши Торой Твоей, и прилепи сердце наше к заповедям Твоим, и объедини сердце наше для любви и трепета пред Именем Твоим, и не устыдимся и не посрамимся и не преткнемся во веки веков. Ибо на святое Имя Твое великое и грозное уповали мы, возрадуемся и возвеселимся в спасении Твоем.\n[Здесь берут четыре цицит в левую руку]\nИ приведи нас с миром от четырех концов земли и веди нас прямо в страну нашу, ибо Ты Бог, творящий спасение, и нас избрал Ты из всякого народа и языка, и приблизил нас к великому Имени Твоему вовек истинно, чтобы благодарить Тебя и провозглашать единство Твое с любовью. Благословен Ты, Господь, Избирающий народ Свой Израиль с любовью.",
  nl: "[Tweede Beracha]\nMet grote liefde hebt U ons liefgehad, Eeuwige, onze God, met groot en overvloedig erbarmen hebt U Zich over ons ontfermd. Onze Vader, onze Koning, omwille van onze vaderen die op U vertrouwden en U hun levenswetten leerde, wees ook ons genadig en leer ons. Onze Vader, barmhartige Vader, Erbarmer, ontferm U over ons en geef in ons hart te begrijpen en te doorgronden, te horen, te leren en te onderwijzen, te bewaken en te doen en te volbrengen alle woorden van de studie van Uw Tora met liefde.\nVerlicht onze ogen met Uw Tora, hecht ons hart aan Uw geboden, verenig ons hart om Uw Naam lief te hebben en te vrezen, opdat wij niet beschaamd worden en niet te schande en niet struikelen voor eeuwig. Want op Uw grote, heilige en ontzagwekkende Naam hebben wij vertrouwd, wij zullen juichen en ons verheugen in Uw heil.\n[Men neemt de vier tsitsit in de linkerhand]\nBreng ons in vrede van de vier hoeken der aarde en leid ons fier naar ons land, want U bent een God Die redding bewerkt, en ons hebt U gekozen uit alle volken en talen, en U hebt ons nabij Uw grote Naam gebracht, sela, in waarheid, om U te danken en U in liefde als Eén te belijden. Gezegend bent U, Eeuwige, Die Zijn volk Israël kiest in liefde.",
  en: "[Second Beracha]\nWith great love You have loved us, Lord our God, with great and abundant mercy You have had mercy upon us. Our Father, our King, for the sake of our fathers who trusted in You and You taught them statutes of life, so be gracious to us and teach us. Our Father, merciful Father, Merciful One, have mercy upon us and put in our heart to understand and to be wise, to hear, to learn and to teach, to keep and to do and to fulfill all the words of the study of Your Torah with love.\nEnlighten our eyes with Your Torah, cleave our heart to Your commandments, unite our heart to love and to fear Your Name, and we shall not be ashamed nor confounded nor stumble forever. For in Your great, holy and awesome Name we trusted, we shall rejoice and be glad in Your salvation.\n[One takes the four tzitzit in the left hand]\nBring us in peace from the four corners of the earth and lead us upright to our land, for You are a God Who works salvation, and us You have chosen from all peoples and tongues, and You have brought us close to Your great Name forever in truth, to thank You and to proclaim Your unity with love. Blessed are You, Lord, Who chooses His people Israel with love.",
  fr: "[Deuxième Beracha]\nD'un grand amour Tu nous as aimés, Éternel, notre Dieu, d'une grande et immense miséricorde Tu as eu pitié de nous. Notre Père, notre Roi, à cause de nos pères qui ont mis leur confiance en Toi et Tu leur as enseigné les lois de vie, ainsi fais-nous grâce et enseigne-nous. Notre Père, Père miséricordieux, Miséricordieux, aie pitié de nous et mets en notre cœur de comprendre et de discerner, d'écouter, d'apprendre et d'enseigner, de garder et de faire et d'accomplir toutes les paroles de l'étude de Ta Torah avec amour.\nÉclaire nos yeux par Ta Torah, attache notre cœur à Tes commandements, unifie notre cœur pour aimer et craindre Ton Nom, et que nous ne soyons pas honteux ni confus ni trébuchants à jamais. Car en Ton grand Nom saint et redoutable nous avons mis notre confiance, nous jubilerons et nous réjouirons en Ton salut.\n[On prend les quatre tsitsit dans la main gauche]\nAmène-nous en paix des quatre coins de la terre et conduis-nous fièrement vers notre terre, car Tu es un Dieu qui opère des délivrances, et nous Tu nous as choisis parmi tous les peuples et langues, et Tu nous as rapprochés de Ton grand Nom sela en vérité, pour Te remercier et proclamer Ton unité avec amour. Béni sois-Tu, Éternel, qui choisis Son peuple Israël avec amour."
},
{
  id: 38,
  titleEn: "Shema Yisrael + Veahavta",
  titleHe: "שְׁמַע יִשְׂרָאֵל - הָאַלִינֵאָה הָרִאשׁוֹנָה",
  he_display: "[DE EERSTE ALINEA VAN HET SJEMA]\nשְׁמַע יִשְׂרָאֵל, יְיָ אֱלֹהֵינוּ, יְיָ אֶחָד.\n\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.\n\nוְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ בְּכָל-לְבָבְךָ וּבְכָל-נַפְשְׁךָ וּבְכָל-מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל-לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ.\nוּקְשַׁרְתָּם לְאוֹת עַל-יָדֶךָ וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ.\nוּכְתַבְתָּם עַל-מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.",
  he_tts: "שְׁמַע יִשְׂרָאֵל, יְיָ אֱלֹהֵינוּ, יְיָ אֶחָד.\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.\nוְאָהַבְתָּ אֵת יְיָ אֱלֹהֶיךָ בְּכֹל-לְבָבְךָ וּבְכֹל-נַפְשְׁךָ וּבְכֹל-מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל-לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל-יָדֶךָ וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל-מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.",
  translit: "Shema Yisrael, Adonai Eloheinu, Adonai Echad.\n\nBaruch shem kevod malchuto le'olam va'ed.\n\nVe'ahavta et Adonai Elohecha bechol-levavcha uvchol-nafshecha uvchol-me'odecha. Vehayu hadevarim ha'eleh asher Anochi metzavecha hayom al-levavecha. Veshinantam levanecha vedibarta bam beshivtecha beveitecha uvlechtecha vaderech uvshochbecha uvkumecha. Ukshartam le'ot al-yadecha vehayu letotafot bein einecha. Uchavtam al-mezuzot beitecha uvish'arecha.",
  ru: "[ПЕРВЫЙ АБЗАЦ ШМА]\nСлушай, Израиль, Господь Бог наш, Господь один.\n\nБлагословенно славное имя царствия Его во веки веков.\n\nИ возлюби Господа Бога твоего всем сердцем твоим и всею душою твоею и всем достоянием твоим. И будут слова эти, которые Я заповедую тебе сегодня, в сердце твоем. И повторяй их детям твоим и говори о них сидя в доме твоем и идя дорогою и ложась и вставая. И навяжи их в знак на руку твою и будут они повязкою между глазами твоими. И напиши их на косяках дома твоего и на вратах твоих.",
  nl: "[DE EERSTE ALINEA VAN HET SJEMA]\nHoor Israël, de Eeuwige is onze God, de Eeuwige is Eén.\n\nGezegend is de Naam van Zijn heerlijk koninkrijk voor eeuwig en altijd.\n\nGij zult de Eeuwige, uw God, liefhebben met geheel uw hart en met geheel uw ziel en met geheel uw vermogen. En deze woorden die ik u heden gebied zullen op uw hart zijn. En gij zult ze uw kinderen inscherpen en gij zult erover spreken als gij in uw huis zit en als gij op de weg gaat en als gij u neerlegt en als gij opstaat. En gij zult ze tot een teken op uw hand binden en zij zullen tot tefillien tussen uw ogen zijn. En gij zult ze schrijven op de deurposten van uw huis en aan uw poorten.",
  en: "[THE FIRST PARAGRAPH OF THE SHEMA]\nHear, O Israel, the Lord our God, the Lord is One.\n\nBlessed be the Name of His glorious kingdom forever and ever.\n\nYou shall love the Lord your God with all your heart and with all your soul and with all your might. And these words which I command you this day shall be upon your heart. And you shall teach them diligently to your children and speak of them when you sit in your house and when you walk by the way and when you lie down and when you rise up. And you shall bind them for a sign upon your hand and they shall be for frontlets between your eyes. And you shall write them upon the doorposts of your house and upon your gates.",
  fr: "[PREMIER ALINÉA DU CHEMA]\nÉcoute, Israël, l'Éternel notre Dieu, l'Éternel est Un.\n\nBéni soit le Nom de Son règne glorieux pour toujours et à jamais.\n\nTu aimeras l'Éternel ton Dieu de tout ton cœur, de toute ton âme et de toute ta force. Et ces paroles que Je te commande aujourd'hui seront sur ton cœur. Tu les inculqueras à tes enfants et tu en parleras quand tu seras assis dans ta maison et quand tu marcheras en chemin et quand tu te coucheras et quand tu te lèveras. Tu les attacheras comme signe sur ta main et elles seront comme fronteaux entre tes yeux. Tu les écriras sur les poteaux de ta maison et sur tes portes."
},
{
  id: 39,
  titleEn: "Shema - Second Paragraph - VeHaya Im Shamoa",
  titleHe: "וְהָיָה אִם-שָׁמֹעַ",
  he_display: "וְהָיָה אִם-שָׁמֹעַ תִּשְׁמְעוּ אֶל-מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם לְאַהֲבָה אֶת-יְיָ אֱלֹהֵיכֶם וּלְעָבְדוֹ בְּכָל-לְבַבְכֶם וּבְכָל-נַפְשְׁכֶם. וְנָתַתִּי מְטַר-אַרְצְכֶם בְּעִתּוֹ יוֹרֶה וּמַלְקוֹשׁ וְאָסַפְתָּ דְּגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ וְאָכַלְתָּ וְשָׂבָעְתָּ. הִשָּׁמְרוּ לָכֶם פֶּן-יִפְתֶּה לְבַבְכֶם וְסַרְתֶּם וַעֲבַדְתֶּם אֱלֹהִים אֲחֵרִים וְהִשְׁתַּחֲוִיתֶם לָהֶם. וְחָרָה אַף-יְיָ בָּכֶם וְעָצַר אֶת-הַשָּׁמַיִם וְלֹא-יִהְיֶה מָטָר וְהָאֲדָמָה לֹא תִתֵּן אֶת-יְבוּלָהּ וַאֲבַדְתֶּם מְהֵרָה מֵעַל הָאָרֶץ הַטֹּבָה אֲשֶׁר יְיָ נֹתֵן לָכֶם.\nוְשַׂמְתֶּם אֶת-דִּבְרַי אֵלֶּה עַל-לְבַבְכֶם וְעַל-נַפְשְׁכֶם וּקְשַׁרְתֶּם אֹתָם לְאוֹת עַל-יֶדְכֶם וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֵיכֶם. וְלִמַּדְתֶּם אֹתָם אֶת-בְּנֵיכֶם לְדַבֵּר בָּם בְּשִׁבְתְּךָ בְּבֵיתְךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּכְתַבְתָּם עַל-מְזוּזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ. לְמַעַן יִרְבּוּ יְמֵיכֶם וִימֵי בְנֵיכֶם עַל הָאֲדָמָה אֲשֶׁר נִשְׁבַּע יְיָ לַאֲבֹתֵיכֶם לָתֵת לָהֶם כִּימֵי הַשָּׁמַיִם עַל-הָאָרֶץ.",
  he_tts: "וְהָיָה אִם-שָׁמֹעַ תִּשְׁמְעוּ אֶל-מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם לְאַהֲבָה אֶת-יְיָ אֱלֹהֵיכֶם וּלְעָבְדוֹ בְּכֹל-לְבַבְכֶם וּבְכֹל-נַפְשְׁכֶם. וְנָתַתִּי מְטַר-אַרְצְכֶם בְּעִתּוֹ יוֹרֶה וּמַלְקוֹשׁ וְאָסַפְתָּ דְּגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ וְאָכַלְתָּ וְשָׂבָעְתָּ. הִשָּׁמְרוּ לָכֶם פֶּן-יִפְתֶּה לְבַבְכֶם וְסַרְתֶּם וַעֲבַדְתֶּם אֱלֹהִים אֲחֵרִים וְהִשְׁתַּחֲוִיתֶם לָהֶם. וְחָרָה אַף-יְיָ בָּכֶם וְעָצַר אֶת-הַשָּׁמַיִם וְלֹא-יִהְיֶה מָטָר וְהָאֲדָמָה לֹא תִתֵּן אֶת-יְבוּלָהּ וַאֲבַדְתֶּם מְהֵרָה מֵעַל הָאָרֶץ הַטֹּבָה אֲשֶׁר יְיָ נֹתֵן לָכֶם. וְשַׂמְתֶּם אֶת-דִּבְרַי אֵלֶּה עַל-לְבַבְכֶם וְעַל-נַפְשְׁכֶם וּקְשַׁרְתֶּם אֹתָם לְאוֹת עַל-יֶדְכֶם וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֵיכֶם. וְלִמַּדְתֶּם אֹתָם אֶת-בְּנֵיכֶם לְדַבֵּר בָּם בְּשִׁבְתְּךָ בְּבֵיתְךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּכְתַבְתָּם עַל-מְזוּזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ. לְמַעַן יִרְבּוּ יְמֵיכֶם וִימֵי בְנֵיכֶם עַל הָאֲדָמָה אֲשֶׁר נִשְׁבַּע יְיָ לַאֲבֹתֵיכֶם לָתֵת לָהֶם כִּימֵי הַשָּׁמַיִם עַל-הָאָרֶץ.",
  translit: "Vehaya im-shamoa tishme'u el-mitzvotai asher Anochi metzaveh etchem hayom le'ahava et-Adonai Eloheichem ule'ovdo bechol-levavchem uvchol-nafshechem. Venatati metar-artzechem be'ito yoreh umalkosh ve'asafta deganecha vetiroshcha veyitzharecha. Venatati esev besadecha livhemtecha ve'achalta vesavata. Hishamru lachem pen-yifteh levavchem vesartem va'avadtem Elohim acherim vehishtachavitem lahem. Vechara af-Adonai bachem ve'atzar et-hashamayim velo-yihyeh matar veha'adama lo titen et-yevulah va'avadtem mehera me'al ha'aretz hatova asher Adonai noten lachem. Vesamtem et-devarai elleh al-levavchem ve'al-nafshechem ukshartem otam le'ot al-yedchem vehayu letotafot bein eineichem. Velimadtem otam et-beneichem ledaber bam beshivtecha beveitecha uvlechtecha vaderech uvshochbecha uvkumecha. Uchtavtam al-mezuzot beitecha uvish'arecha. Lema'an yirbu yemeichem vimei veneichem al ha'adama asher nishba Adonai la'avoteichem latet lahem kimei hashamayim al-ha'aretz.",
  ru: "И будет, если послушаетесь заповедей Моих, которые Я заповедую вам сегодня, любя Господа Бога вашего и служа Ему всем сердцем вашим и всею душою вашею, то дам Я дождь земле вашей в срок его, ранний и поздний, и соберешь ты хлеб твой и вино твое и масло твое. И дам траву на поле твоем для скота твоего, и будешь есть и насытишься. Берегитесь, чтобы не обольстилось сердце ваше и не совратились вы и не служили богам иным и не кланялись им. И воспылает гнев Господа на вас, и затворит Он небеса, и не будет дождя, и земля не даст урожая своего, и исчезнете вы скоро с доброй земли, которую Господь дает вам. И возложите слова эти Мои на сердце ваше и на душу вашу и навяжите их в знак на руку вашу, и будут они повязкою между глазами вашими. И учите им сыновей ваших, говоря о них сидя в доме твоем и идя дорогою и ложась и вставая. И напиши их на косяках дома твоего и на вратах твоих. Дабы умножились дни ваши и дни сыновей ваших на земле, которую клялся Господь отцам вашим дать им, как дни неба над землею.",
  nl: "En het zal geschieden, indien gij aandachtig luistert naar Mijn geboden die Ik u heden gebied, om de Eeuwige, uw God, lief te hebben en Hem te dienen met geheel uw hart en met geheel uw ziel, dan zal Ik de regen van uw land geven op zijn tijd, vroege regen en late regen, en gij zult uw koren en uw most en uw olie inzamelen. En Ik zal gras op uw veld geven voor uw vee, en gij zult eten en verzadigd worden. Wacht u ervoor dat uw hart niet verleid wordt en gij afwijkt en andere goden dient en u voor hen neerbuigt. Dan zal de toorn van de Eeuwige tegen u ontbranden en Hij zal de hemel sluiten en er zal geen regen zijn en de aarde zal haar opbrengst niet geven en gij zult spoedig verdwijnen van het goede land dat de Eeuwige u geeft. Legt deze Mijn woorden op uw hart en op uw ziel en bindt ze tot een teken op uw hand en zij zullen tot tefillien tussen uw ogen zijn. En leert ze uw kinderen door erover te spreken als gij in uw huis zit en als gij op de weg gaat en als gij u neerlegt en als gij opstaat. En schrijft ze op de deurposten van uw huis en aan uw poorten. Opdat uw dagen en de dagen van uw kinderen talrijk worden op de grond die de Eeuwige aan uw vaderen gezworen heeft hun te geven, als de dagen van de hemel boven de aarde.",
  en: "And it shall come to pass, if you diligently hearken to My commandments which I command you this day, to love the Lord your God and to serve Him with all your heart and with all your soul, then I will give rain for your land in its season, the early rain and the late rain, and you shall gather in your grain and your wine and your oil. And I will give grass in your field for your cattle, and you shall eat and be satisfied. Beware lest your heart be deceived and you turn aside and serve other gods and worship them. Then the anger of the Lord will be kindled against you and He will shut up the heavens and there will be no rain and the earth will not give its produce and you shall perish quickly from the good land which the Lord gives you. And you shall put these My words upon your heart and upon your soul and bind them for a sign upon your hand and they shall be for frontlets between your eyes. And you shall teach them to your children to speak of them when you sit in your house and when you walk by the way and when you lie down and when you rise up. And you shall write them upon the doorposts of your house and upon your gates. That your days and the days of your children may be multiplied upon the land which the Lord swore to your fathers to give them, as the days of the heavens above the earth.",
  fr: "Et il arrivera, si vous écoutez attentivement Mes commandements que Je vous commande aujourd'hui, d'aimer l'Éternel votre Dieu et de Le servir de tout votre cœur et de toute votre âme, alors Je donnerai la pluie de votre terre en son temps, pluie d'automne et pluie de printemps, et tu recueilleras ton blé et ton vin et ton huile. Et Je donnerai de l'herbe dans ton champ pour ton bétail, et tu mangeras et seras rassasié. Gardez-vous que votre cœur ne soit séduit et que vous ne vous détourniez et ne serviez d'autres dieux et ne vous prosterniez devant eux. Alors la colère de l'Éternel s'enflammera contre vous et Il fermera les cieux et il n'y aura pas de pluie et la terre ne donnera pas son produit et vous périrez vite de dessus la bonne terre que l'Éternel vous donne. Et vous mettrez ces Mes paroles sur votre cœur et sur votre âme et vous les lierez comme signe sur votre main et elles seront comme fronteaux entre vos yeux. Et vous les enseignerez à vos enfants pour en parler quand tu seras assis dans ta maison et quand tu marcheras en chemin et quand tu te coucheras et quand tu te lèveras. Et tu les écriras sur les poteaux de ta maison et sur tes portes. Afin que se multiplient vos jours et les jours de vos enfants sur la terre que l'Éternel a juré à vos pères de leur donner, comme les jours des cieux au-dessus de la terre."
},
{
  id: 40,
  titleEn: "Vayomer Adonai El Moshe - Wajomer",
  titleHe: "וַיֹּאמֶר - הָאַלִינֵאָה הַשְּׁלִישִׁית",
  he_display: "[One takes the four tzitzit in the right hand. When mentioning tzitzit one kisses them. At the sign ° one kisses them and lets them go]\nוַיֹּאמֶר יְיָ אֶל-מֹשֶׁה לֵּאמֹר: דַּבֵּר אֶל-בְּנֵי יִשְׂרָאֵל וְאָמַרְתָּ אֲלֵהֶם וְעָשׂוּ לָהֶם צִיצִת עַל-כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם וְנָתְנוּ עַל-צִיצִת הַכָּנָף פְּתִיל תְּכֵלֶת. וְהָיָה לָכֶם לְצִיצִת וּרְאִיתֶם אֹתוֹ וּזְכַרְתֶּם אֶת-כָּל-מִצְוֹת יְיָ וַעֲשִׂיתֶם אֹתָם וְלֹא תָתוּרוּ אַחֲרֵי לְבַבְכֶם וְאַחֲרֵי עֵינֵיכֶם אֲשֶׁר-אַתֶּם זֹנִים אַחֲרֵיהֶם. ○ לְמַעַן תִּזְכְּרוּ וַעֲשִׂיתֶם אֶת-כָּל-מִצְוֹתַי וִהְיִיתֶם קְדֹשִׁים לֵאלֹהֵיכֶם. אֲנִי יְיָ אֱלֹהֵיכֶם אֲשֶׁר הוֹצֵאתִי אֶתְכֶם מֵאֶרֶץ מִצְרַיִם לִהְיוֹת לָכֶם לֵאלֹהִים אֲנִי יְיָ אֱלֹהֵיכֶם.°",
  he_tts: "וַיֹּאמֶר יְיָ אֶל-מֹשֶׁה לֵּאמֹר: דַּבֵּר אֶל-בְּנֵי יִשְׂרָאֵל וְאָמַרְתָּ אֲלֵהֶם וְעָשׂוּ לָהֶם צִיצִת עַל-כַּנְפֵי בִגְדֵיהֶם לְדֹרֹתָם וְנָתְנוּ עַל-צִיצִת הַכָּנָף פְּתִיל תְּכֵלֶת. וְהָיָה לָכֶם לְצִיצִת וּרְאִיתֶם אֹתוֹ וּזְכַרְתֶּם אֶת-כֹּל-מִצְוֹת יְיָ וַעֲשִׂיתֶם אֹתָם וְלֹא תָתוּרוּ אַחֲרֵי לְבַבְכֶם וְאַחֲרֵי עֵינֵיכֶם אֲשֶׁר-אַתֶּם זֹנִים אַחֲרֵיהֶם. לְמַעַן תִּזְכְּרוּ וַעֲשִׂיתֶם אֶת-כֹּל-מִצְוֹתַי וִהְיִיתֶם קְדֹשִׁים לֵאלֹהֵיכֶם. אֲנִי יְיָ אֱלֹהֵיכֶם אֲשֶׁר הוֹצֵאתִי אֶתְכֶם מֵאֶרֶץ מִצְרַיִם לִהְיוֹת לָכֶם לֵאלֹהִים אֲנִי יְיָ אֱלֹהֵיכֶם.",
  translit: "Vayomer Adonai el-Moshe lemor: Daber el-benei Yisrael ve'amarta alehem ve'asu lahem tzitzit al-kanfei vigdeihem ledorotam venatnu al-tzitzit hakanaf petil techelet. Vehaya lachem letzitzit ure'item oto uzechartem et-kol-mitzvot Adonai va'asitem otam velo taturu acharei levavchem ve'acharei eineichem asher-atem zonim achareihem. Lema'an tizkeru va'asitem et-kol-mitzvotai viheyitem kedoshim le'Eloheichem. Ani Adonai Eloheichem asher hotzeti etchem me'eretz Mitzrayim lihyot lachem le'Elohim Ani Adonai Eloheichem.",
  ru: "[Берут четыре цицит в правую руку. При упоминании цицит целуют их. При знаке ° целуют их и отпускают - Третий абзац Шма]\nИ сказал Господь Моше, говоря: говори сынам Израиля и скажи им, чтобы сделали себе кисти на краях одежд своих в поколениях их, и дадут они на кисть края нить голубую. И будет вам кистью, и увидите ее и вспомните все заповеди Господа и исполните их и не блуждайте вслед сердца вашего и вслед очей ваших, за которыми вы блудите. Дабы помнили вы и исполняли все заповеди Мои и были святы Богу вашему. Я Господь Бог ваш, Который вывел вас из земли Египетской, чтобы быть вам Богом, Я Господь Бог ваш.",
  nl: "[Men neemt de vier tsitsit in de rechterhand. Bij het noemen van de tsitsit kust men ze. Bij het teken ° kust men ze en laat ze los - Derde alinea van Sjema]\nEn de Eeuwige sprak tot Mosje, zeggende: Spreek tot de kinderen Israëls en zeg tot hen dat zij zich tsitsit maken aan de hoeken van hun kleding voor hun geslachten, en zij zullen aan de tsitsit van de hoek een draad van blauw hechten. En het zal u tot tsitsit zijn en gij zult ernaar zien en gij zult al de geboden van de Eeuwige gedenken en ze doen en gij zult niet afdwalen achter uw hart en achter uw ogen waar gij achteraan hoereert. Opdat gij zult gedenken en doen al Mijn geboden en heilig zult zijn voor uw God. Ik ben de Eeuwige, uw God, Die u uit het land Egypte heb gevoerd om u tot God te zijn, Ik ben de Eeuwige, uw God.°",
  en: "[One takes the four tzitzit in the right hand. When mentioning tzitzit one kisses them. At the sign ° one kisses them and lets them go - Third Paragraph of Shema]\nAnd the Lord spoke to Moses, saying: Speak to the children of Israel and say to them that they shall make themselves tzitzit upon the corners of their garments throughout their generations, and they shall put upon the tzitzit of the corner a thread of blue. And it shall be for you as tzitzit and you shall see it and remember all the commandments of the Lord and do them and you shall not stray after your heart and after your eyes after which you go astray. That you may remember and do all My commandments and be holy to your God. I am the Lord your God Who brought you out of the land of Egypt to be for you as God, I am the Lord your God.°",
  fr: "[On prend les quatre tsitsit dans la main droite. En mentionnant les tsitsit on les embrasse. Au signe ° on les embrasse et on les relâche - Troisième alinéa du Chema]\nEt l'Éternel parla à Moché en disant: Parle aux enfants d'Israël et dis-leur qu'ils se fassent des tsitsit aux coins de leurs vêtements pour leurs générations, et ils mettront sur la tsitsit du coin un fil d'azur. Et ce sera pour vous comme tsitsit et vous le verrez et vous vous souviendrez de tous les commandements de l'Éternel et vous les ferez et vous ne vous égarerez pas après votre cœur et après vos yeux après lesquels vous vous prostituez. Afin que vous vous souveniez et fassiez tous Mes commandements et que vous soyez saints pour votre Dieu. Je suis l'Éternel votre Dieu qui vous ai fait sortir du pays d'Égypte pour être votre Dieu, Je suis l'Éternel votre Dieu.°"
},
{
  id: 41,
  include_in_home: true,
  titleEn: "Emet VeYatziv",
  titleHe: "אֱמֶת וְיַצִּיב",
  he_display: "אֱמֶת וְיַצִּיב וְקַיָּם הַדָּבָר הַזֶּה עָלֵינוּ לְעוֹלָם וָעֶד.\nאֱמֶת, אֱלֹהֵי עוֹלָם מַלְכֵּנוּ, צוּר יַעֲקֹב מָגֵן יִשְׁעֵנוּ, לְדֹר וָדֹר הוּא קַיָּם, וּשְׁמוֹ קַיָּם, וְכִסְאוֹ נָכוֹן, וּמַלְכוּתוֹ וֶאֱמוּנָתוֹ לָעַד קַיֶּמֶת. וּדְבָרָיו חַיִּים וְקַיָּמִים, נֶאֱמָנִים וְנֶחֱמָדִים לָעַד וּלְעוֹלְמֵי עוֹלָמִים, עַל אֲבוֹתֵינוּ וְעָלֵינוּ, עַל בָּנֵינוּ וְעַל דּוֹרוֹתֵינוּ, וְעַל כָּל-דּוֹרוֹת זֶרַע יִשְׂרָאֵל עֲבָדֶיךָ.\nעֶזְרַת אֲבוֹתֵינוּ אַתָּה הוּא מֵעוֹלָם, מָגֵן וּמוֹשִׁיעַ לִבְנֵיהֶם אַחֲרֵיהֶם בְּכָל-דּוֹר וָדֹר. בְּרוּם עוֹלָם מוֹשָׁבֶךָ, וּמִשְׁפָּטֶךָ, וְצִדְקָתְךָ עַד אַפְסֵי אָרֶץ. אַשְׁרֵי אִישׁ שֶׁיִּשְׁמַע לְמִצְוֹתֶיךָ, וְתוֹרָתְךָ וּדְבָרְךָ יָשִׂים עַל לִבּוֹ. אֱמֶת, אַתָּה הוּא רִאשׁוֹן וְאַתָּה הוּא אַחֲרוֹן וּמִבַּלְעָדֶיךָ אֵין לָנוּ מֶלֶךְ גּוֹאֵל וּמוֹשִׁיעַ.\nמִמִּצְרַיִם גְּאַלְתָּנוּ יְיָ אֱלֹהֵינוּ, וּמִבֵּית עֲבָדִים פְּדִיתָנוּ.\n○ בְּדוֹרוֹתֵינוּ הָאַחֲרוֹנִים הִנְחִיתוּ אוֹיְבֶיךָ מַכָּה קָשָׁה בְּעַמֶּךָ, כְּפִי שֶׁלֹּא נִרְאֲתָה מֵעוֹלָם. אַךְ, בְּתוֹךְ אֲפֵלַת שְׁנוֹת הַשּׁוֹאָה, שָׂרַד עַמְּךָ יִשְׂרָאֵל, בִּידֵי מְתֵי מְעַט, שְׁאֵרִית הַפְּלֵיטָה, עֲנִיִּים וְכוֹאֲבִים נָתַתָּ עֹז, וַיִּכֹּנוּ חַיִּים חֲדָשִׁים.\nאַתָּה הֶחֱיִיתָנוּ וְקִיַּמְתָּנוּ לִרְאוֹת אֶת-הַנֵּס בַּזְּמַן הַזֶּה, אֶת-פְּזוּרֵינוּ מִבֵּין הַגּוֹיִם קָרַבְתָּ, וּנְפוֹצוֹתֵינוּ מִיַּרְכְּתֵי-אֶרֶץ כִּנַּסְתָּ, וְשָׁבוּ בָנִים לִגְבוּלָם. עַל זֹאת שִׁבְּחוּ אֲהוּבִים וְרוֹמְמוּ אֵל, וְנָתְנוּ יְדִידִים תְּהִלּוֹת לָאֵל עֶלְיוֹן, בָּרוּךְ הוּא וּמְבֹרָךְ.",
  he_tts: "אֱמֶת וְיַצִּיב וְקַיָּם הַדָּבָר הַזֶּה עָלֵינוּ לְעוֹלָם וָעֶד. אֱמֶת, אֱלֹהֵי עוֹלָם מַלְכֵּנוּ, צוּר יַעֲקֹב מָגֵן יִשְׁעֵנוּ, לְדֹר וָדֹר הוּא קַיָּם, וּשְׁמוֹ קַיָּם, וְכִסְאוֹ נָכוֹן, וּמַלְכוּתוֹ וֶאֱמוּנָתוֹ לָעַד קַיֶּמֶת. וּדְבָרָיו חַיִּים וְקַיָּמִים, נֶאֱמָנִים וְנֶחֱמָדִים לָעַד וּלְעוֹלְמֵי עוֹלָמִים, עַל אֲבוֹתֵינוּ וְעָלֵינוּ, עַל בָּנֵינוּ וְעַל דּוֹרוֹתֵינוּ, וְעַל כֹּל-דּוֹרוֹת זֶרַע יִשְׂרָאֵל עֲבָדֶיךָ. עֶזְרַת אֲבוֹתֵינוּ אַתָּה הוּא מֵעוֹלָם, מָגֵן וּמוֹשִׁיעַ לִבְנֵיהֶם אַחֲרֵיהֶם בְּכֹל-דּוֹר וָדֹר. בְּרוּם עוֹלָם מוֹשָׁבֶךָ, וּמִשְׁפָּטֶךָ, וְצִדְקָתְךָ עַד אַפְסֵי אָרֶץ. אַשְׁרֵי אִישׁ שֶׁיִּשְׁמַע לְמִצְוֹתֶיךָ, וְתוֹרָתְךָ וּדְבָרְךָ יָשִׂים עַל לִבּוֹ. אֱמֶת, אַתָּה הוּא רִאשׁוֹן וְאַתָּה הוּא אַחֲרוֹן וּמִבַּלְעָדֶיךָ אֵין לָנוּ מֶלֶךְ גּוֹאֵל וּמוֹשִׁיעַ. מִמִּצְרַיִם גְּאַלְתָּנוּ יְיָ אֱלֹהֵינוּ, וּמִבֵּית עֲבָדִים פְּדִיתָנוּ. בְּדוֹרוֹתֵינוּ הָאַחֲרוֹנִים הִנְחִיתוּ אוֹיְבֶיךָ מַכָּה קָשָׁה בְּעַמֶּךָ, כְּפִי שֶׁלֹּא נִרְאֲתָה מֵעוֹלָם. אַךְ, בְּתוֹךְ אֲפֵלַת שְׁנוֹת הַשּׁוֹאָה, שָׂרַד עַמְּךָ יִשְׂרָאֵל, בִּידֵי מְתֵי מְעַט, שְׁאֵרִית הַפְּלֵיטָה, עֲנִיִּים וְכוֹאֲבִים נָתַתָּ עֹז, וַיִּכֹּנוּ חַיִּים חֲדָשִׁים. אַתָּה הֶחֱיִיתָנוּ וְקִיַּמְתָּנוּ לִרְאוֹת אֶת-הַנֵּס בַּזְּמַן הַזֶּה, אֶת-פְּזוּרֵינוּ מִבֵּין הַגּוֹיִם קָרַבְתָּ, וּנְפוֹצוֹתֵינוּ מִיַּרְכְּתֵי-אֶרֶץ כִּנַּסְתָּ, וְשָׁבוּ בָנִים לִגְבוּלָם. עַל זֹאת שִׁבְּחוּ אֲהוּבִים וְרוֹמְמוּ אֵל, וְנָתְנוּ יְדִידִים תְּהִלּוֹת לָאֵל עֶלְיוֹן, בָּרוּךְ הוּא וּמְבֹרָךְ.",
  translit: "Emet veyatziv vekayam hadavar haze aleinu le'olam va'ed. Emet, Elohei olam Malkenu, Tzur Ya'akov Magen yish'enu, ledor vador Hu kayam, ushmo kayam, vechiso nachon, umalchuto ve'emunato la'ad kayemet. Udvarav chayim vekayamim, ne'emanim venechmadim la'ad ule'olmei olamim, al avoteinu ve'aleinu, al baneinu ve'al doroteinu, ve'al kol-dorot zera Yisrael avadecha. Ezrat avoteinu atah Hu me'olam, magen umoshia livneihem achareihem bechol-dor vador. Berum olam moshav'cha, umishpatecha, vetzidkatecha ad afsei aretz. Ashrei ish sheyishma lemitzvotecha, veToratecha udevarcha yasim al libo. Emet, atah Hu rishon ve'atah Hu acharon umibal'adecha ein lanu Melech Go'el uMoshia. Mimitzrayim ge'altanu Adonai Eloheinu, umibeit avadim peditanu. Bedoroteinu ha'acharonim hinchitu oivecha maka kasha be'amecha, kefi shelo nir'ata me'olam. Ach, betoch afelat shenot haShoah, sarad amcha Yisrael, biyedei metei me'at, she'erit hapeleta, aniyim vecho'avim natata oz, vayikonu chayim chadashim. Atah hecheyitanu vekiyamtanu lir'ot et-hanes bazman haze, et-pezureinu mibein hagoyim karavta, unevotzoteinu miyarketei-eretz kinas'ta, veshavu vanim ligvulam. Al zot shibchu ahuvim veromemu El, venatnu yedidim tehillot la'El Elyon, baruch Hu umevorach.",
  ru: "Истинно и верно и прочно это слово для нас во веки веков. Истинно, Бог вечный, Царь наш, Твердыня Яакова, Щит спасения нашего, из поколения в поколение Он существует, и Имя Его существует, и престол Его верен, и царствие Его и вера Его вовеки существуют. И слова Его живы и прочны, верны и приятны вовеки и во веки веков, для отцов наших и для нас, для сынов наших и для поколений наших и для всех поколений семени Израиля, рабов Твоих. Помощью отцов наших Ты был издревле, щитом и спасителем сынов их после них в каждом поколении. На высоте мира обитель Твоя, и суд Твой, и справедливость Твоя до краев земли. Счастлив человек, слушающий заповеди Твои и Тору Твою и слово Твое полагающий на сердце свое. Истинно, Ты Первый и Ты Последний и кроме Тебя нет у нас Царя, Избавителя и Спасителя. Из Египта избавил Ты нас, Господь Бог наш, и из дома рабства выкупил Ты нас. В поколениях наших последних обрушили враги Твои удар тяжкий на народ Твой, какого не видано было вовек. Но среди мрака лет Катастрофы выжил народ Твой Израиль, руками немногих, остатком спасшихся, бедным и страждущим дал Ты силу, и устроили они жизни новые. Ты оживил нас и сохранил нас видеть чудо в это время, рассеянных наших среди народов приблизил Ты, и разбросанных наших с краев земли собрал Ты, и вернулись сыны к границам своим. За это восхвалили возлюбленные и превознесли Бога, и дали друзья хваления Богу Всевышнему, благословен Он и благословляем.",
  nl: "Waar en vast en waarachtig is dit woord voor ons voor eeuwig en altijd. Waarachtig, God der wereld onze Koning, Rots van Jakob, Schild van onze redding, van geslacht tot geslacht bestaat Hij, en Zijn Naam bestaat, en Zijn troon staat vast, en Zijn koningschap en Zijn trouw bestaan voor eeuwig. En Zijn woorden zijn levend en blijvend, betrouwbaar en lieflijk voor altijd en tot in alle eeuwigheden, voor onze vaderen en voor ons, voor onze kinderen en voor onze geslachten, en voor alle geslachten van het zaad van Israël, Uw dienaren. Hulp van onze vaderen bent U van oudsher, Schild en Redder voor hun kinderen na hen in elk geslacht. In de hoogte der wereld is Uw woonplaats, en Uw recht en Uw gerechtigheid tot aan de einden der aarde. Gelukkig is de mens die naar Uw geboden luistert en Uw Tora en Uw woord op zijn hart legt. Waarachtig, U bent de Eerste en U bent de Laatste en buiten U hebben wij geen Koning, Verlosser en Redder. Uit Egypte hebt U ons verlost, Eeuwige onze God, en uit het slavenhuis hebt U ons vrijgekocht. In onze laatste generaties hebben Uw vijanden een harde slag toegebracht aan Uw volk, zoals nooit tevoren gezien. Maar te midden van de duisternis van de jaren van de Sjoa, overleefde Uw volk Israël, door handen van weinigen, het restant der overlevenden, aan armen en lijdenden gaf U kracht, en zij bouwden nieuwe levens. U hebt ons levend gehouden en ons in stand gehouden om het wonder in deze tijd te zien, onze verspreiden onder de volken hebt U nabij gebracht, en onze verstrooiden van de uithoeken der aarde hebt U verzameld, en zonen keerden terug naar hun grenzen. Daarom hebben geliefden gezongen en God verheven, en hebben vrienden lofprijzingen gegeven aan God de Allerhoogste, gezegend is Hij en gezegend.",
  en: "True and firm and established is this word for us forever and ever. True, God of eternity our King, Rock of Jacob, Shield of our salvation, from generation to generation He endures, and His Name endures, and His throne is established, and His kingdom and His faithfulness forever endure. And His words are living and enduring, faithful and pleasant forever and to all eternity, for our fathers and for us, for our children and for our generations, and for all generations of the seed of Israel Your servants. Help of our fathers You have been from of old, Shield and Savior for their children after them in every generation. In the height of the world is Your dwelling, and Your justice and Your righteousness to the ends of the earth. Happy is the man who hearkens to Your commandments and Your Torah and Your word puts upon his heart. True, You are First and You are Last and besides You we have no King, Redeemer and Savior. From Egypt You redeemed us, Lord our God, and from the house of bondage You ransomed us. In our last generations Your enemies inflicted a hard blow upon Your people, such as never seen before. Yet, within the darkness of the years of the Shoah, Your people Israel survived, by the hands of a few, the remnant of survivors, to the poor and suffering You gave strength, and they established new lives. You kept us alive and sustained us to see the miracle at this time, our dispersed among the nations You brought near, and our scattered from the ends of earth You gathered, and sons returned to their borders. Therefore beloved ones sang and exalted God, and friends gave praises to God Most High, blessed is He and blessed.",
  fr: "Vrai et ferme et établi est cette parole pour nous pour toujours et à jamais. Vrai, Dieu d'éternité notre Roi, Rocher de Jacob, Bouclier de notre salut, de génération en génération Il subsiste, et Son Nom subsiste, et Son trône est stable, et Son royaume et Sa fidélité subsistent à jamais. Et Ses paroles sont vivantes et durables, fidèles et agréables pour toujours et à jamais, pour nos pères et pour nous, pour nos enfants et pour nos générations, et pour toutes les générations de la semence d'Israël Tes serviteurs. Secours de nos pères Tu as été de tout temps, Bouclier et Sauveur pour leurs enfants après eux en chaque génération. Au plus haut du monde est Ta demeure, et Ta justice et Ta droiture jusqu'aux confins de la terre. Heureux l'homme qui écoute Tes commandements et Ta Torah et Ta parole met sur son cœur. Vrai, Tu es Premier et Tu es Dernier et hors Toi nous n'avons pas de Roi, Rédempteur et Sauveur. D'Égypte Tu nous as rachetés, Éternel notre Dieu, et de la maison d'esclavage Tu nous as libérés. Dans nos dernières générations Tes ennemis ont infligé un coup dur à Ton peuple, comme jamais vu auparavant. Pourtant, au cœur de l'obscurité des années de la Shoah, Ton peuple Israël a survécu, par les mains de peu, le reste des survivants, aux pauvres et souffrants Tu as donné force, et ils ont fondé des vies nouvelles. Tu nous as maintenus en vie et soutenus pour voir le miracle en ce temps, nos dispersés parmi les nations Tu as rapprochés, et nos éparpillés des extrémités de la terre Tu as rassemblés, et les fils sont revenus à leurs frontières. C'est pourquoi les bien-aimés ont chanté et exalté Dieu, et les amis ont donné des louanges au Dieu Très-Haut, béni soit-Il et béni."
},
{
  id: 42,
  titleEn: "Geulah - Mi Chamocha and Gaal Yisrael",
  titleHe: "גְּאֻלָּה - מִי כָמֹכָה וְגָאַל יִשְׂרָאֵל",
  he_display: "○ כְּמֹשֶׁה וּבְנֵי יִשְׂרָאֵל לְךָ עָנוּ שִׁירָה בְּשִׂמְחָה רַבָּה וְאָמְרוּ כֻלָּם: מִי כָמֹכָה בָּאֵלִם יְיָ, מִי כָּמֹכָה נֶאְדָּר בַּקֹּדֶשׁ, נוֹרָא תְּהִלֹּת עֹשֵׂה פֶלֶא.\nשִׁירָה חֲדָשָׁה שִׁבְּחוּ גְאוּלִים לְשִׁמְךָ עַל שְׂפַת הַיָּם, יַחַד כֻּלָּם הוֹדוּ וְהִמְלִיכוּ וְאָמְרוּ: יְיָ יִמְלֹךְ לְעוֹלָם וָעֶד.\nצוּר יִשְׂרָאֵל, קוּמָה בְּעֶזְרַת יִשְׂרָאֵל, וּפְדֵה כִנְאֻמְךָ יְהוּדָה וְיִשְׂרָאֵל. גְּאָלֵנוּ יְיָ צְבָאוֹת שְׁמוֹ, קְדוֹשׁ יִשְׂרָאֵל.\nבָּרוּךְ אַתָּה יְיָ גָּאַל יִשְׂרָאֵל.",
  he_tts: "כְּמֹשֶׁה וּבְנֵי יִשְׂרָאֵל לְךָ עָנוּ שִׁירָה בְּשִׂמְחָה רַבָּה וְאָמְרוּ כֻלָּם: מִי כָמֹכָה בָּאֵלִם יְיָ, מִי כָּמֹכָה נֶאְדָּר בַּקֹּדֶשׁ, נוֹרָא תְּהִלֹּת עֹשֵׂה פֶלֶא. שִׁירָה חֲדָשָׁה שִׁבְּחוּ גְאוּלִים לְשִׁמְךָ עַל שְׂפַת הַיָּם, יַחַד כֻּלָּם הוֹדוּ וְהִמְלִיכוּ וְאָמְרוּ: יְיָ יִמְלֹךְ לְעוֹלָם וָעֶד. צוּר יִשְׂרָאֵל, קוּמָה בְּעֶזְרַת יִשְׂרָאֵל, וּפְדֵה כִנְאֻמְךָ יְהוּדָה וְיִשְׂרָאֵל. גְּאָלֵנוּ יְיָ צְבָאוֹת שְׁמוֹ, קְדוֹשׁ יִשְׂרָאֵל. בָּרוּךְ אַתָּה יְיָ גָּאַל יִשְׂרָאֵל.",
  translit: "Kemosheh uvenei Yisrael lecha anu shira besimcha rabba ve'amru chulam: Mi chamocha ba'elim Adonai, mi kamocha nedar bakodesh, nora tehilot oseh fele. Shira chadasha shibchu ge'ulim leshimcha al sefat hayam, yachad kulam hodu vehimlichu ve'amru: Adonai yimloch le'olam va'ed. Tzur Yisrael, kuma be'ezrat Yisrael, ufdeh chin'umcha Yehuda veYisrael. Go'alenu Adonai Tzeva'ot shemo, Kedosh Yisrael. Baruch atah Adonai Ga'al Yisrael.",
  ru: "Как Моше и сыны Израиля Тебе пели песнь с радостью великой и сказали все: Кто как Ты среди богов, Господи, Кто как Ты, величественный святостью, грозный хвалами, творящий чудеса. Песнью новою восхвалили избавленные Имя Твое у берега моря, вместе все благодарили и воцарили и сказали: Господь будет царствовать вовеки. Твердыня Израиля, встань на помощь Израилю и избавь по слову Твоему Иудею и Израиль. Избавитель наш Господь воинств имя Его, Святой Израилев. Благословен Ты, Господь, Избавивший Израиль.",
  nl: "Zoals Mosje en de kinderen Israëls U een lied zongen met grote vreugde en allen zeiden: Wie is als U onder de goden, Eeuwige, Wie is als U, verheerlijkt in heiligheid, ontzagwekkend in lofprijzingen, Doener van wonderen. Met een nieuw lied loofden verlosten Uw Naam aan de oever van de zee, tezamen dankten allen en huldigden U als Koning en zeiden: De Eeuwige zal heersen voor eeuwig en altijd. Rots van Israël, sta op tot hulp van Israël en verlos naar Uw woord Jehoeda en Israël. Onze Verlosser, Eeuwige der legerscharen is Zijn Naam, Heilige van Israël. Gezegend bent U, Eeuwige, Verlosser van Israël.",
  en: "As Moses and the children of Israel sang a song to You with great joy and all said: Who is like You among the mighty, Lord, Who is like You, glorious in holiness, awesome in praises, doing wonders. With a new song the redeemed praised Your Name at the seashore, together all thanked and proclaimed You King and said: The Lord shall reign forever and ever. Rock of Israel, arise to the help of Israel and redeem as You promised Judah and Israel. Our Redeemer, Lord of Hosts is His Name, Holy One of Israel. Blessed are You, Lord, Who redeemed Israel.",
  fr: "Comme Moïse et les enfants d'Israël T'ont chanté un cantique avec grande joie et tous ont dit: Qui est comme Toi parmi les puissants, Éternel, Qui est comme Toi, magnifique en sainteté, redoutable en louanges, opérant des prodiges. D'un chant nouveau les rachetés ont loué Ton Nom au bord de la mer, ensemble tous ont remercié et T'ont proclamé Roi et ont dit: L'Éternel régnera à jamais. Rocher d'Israël, lève-Toi au secours d'Israël et rachète selon Ta parole Juda et Israël. Notre Rédempteur, Éternel des armées est Son Nom, Saint d'Israël. Béni sois-Tu, Éternel, qui as racheté Israël."
},
{
  id: 43,
  include_in_home: true,
  no_interruption: true,
  said_softly: true,
  titleEn: "Adonai Sefatai Tiftach - Opening of Amida",
  titleHe: "פְּתִיחַת הָעֲמִידָה",
  he_display: "[DE AMIDA - Said softly without interruption from Geoela]\nאֲדֹנָי שְׂפָתַי תִּפְתָּח וּפִי יַגִּיד תְּהִלָּתֶךָ.",
  he_tts: "אֲדֹנָי שְׂפָתַי תִּפְתָּח וּפִי יַגִּיד תְּהִלָּתֶךָ.",
  translit: "Adonai sefatai tiftach ufi yagid tehilatecha.",
  ru: "Господь, уста мои открой и рот мой возвестит хвалу Твою. [Говорится тихо без перерыва от Геулы]",
  nl: "Eeuwige, open mijn lippen en mijn mond zal Uw lof verkondigen. [Zacht gezegd zonder onderbreking vanaf Geoela]",
  en: "Lord, open my lips and my mouth shall declare Your praise. [Said softly without interruption from Geulah]",
  fr: "Seigneur, ouvre mes lèvres et ma bouche annoncera Ta louange. [Dit à voix basse sans interruption depuis la Guéoula]"
},
{
  id: 44,
  include_in_home: true,
  titleEn: "Avot Ve'Imahot - Elokei Avoteinu Ve'Imotenu - Egalitarian 1b",
  titleHe: "אָבוֹת וְאִמָּהוֹת - אֱלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ",
  he_display: "[Avot Ve'Imahot - Egalitarian version with Patriarchs and Matriarchs]\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, אֱלֹהֵי שָׂרָה, אֱלֹהֵי רִבְקָה, אֱלֹהֵי רָחֵל וֵאלֹהֵי לֵאָה, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת וְאִמָּהוֹת, וּמֵבִיא גּוֹאֵל לִבְנֵי בְנֵיהֶם לְמַעַן שְׁמוֹ בְּאַהֲבָה.\n[Seasonal insertion - between Rosh HaShana and Yom Kippur - inside this bracha:]\nזָכְרֵנוּ לְחַיִּים, מֶלֶךְ חָפֵץ בַּחַיִּים, וְכָתְבֵנוּ בְּסֵפֶר הַחַיִּים, לְמַעַנְךָ אֱלֹהִים חַיִּים.\nמֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְיָ, מָגֵן אַבְרָהָם וּפוֹקֵד שָׂרָה.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק, וֵאלֹהֵי יַעֲקֹב, אֱלֹהֵי שָׂרָה, אֱלֹהֵי רִבְקָה, אֱלֹהֵי רָחֵל וֵאלֹהֵי לֵאָה, הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא, אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים, וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת וְאִמָּהוֹת, וּמֵבִיא גּוֹאֵל לִבְנֵי בְנֵיהֶם לְמַעַן שְׁמוֹ בְּאַהֲבָה. זָכְרֵנוּ לְחַיִּים, מֶלֶךְ חָפֵץ בַּחַיִּים, וְכָתְבֵנוּ בְּסֵפֶר הַחַיִּים, לְמַעַנְךָ אֱלֹהִים חַיִּים. מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן. בָּרוּךְ אַתָּה יְיָ, מָגֵן אַבְרָהָם וּפוֹקֵד שָׂרָה.",
  translit: "Baruch atah Adonai Eloheinu ve'Elohei avoteinu, Elohei Avraham, Elohei Yitzchak, ve'Elohei Ya'akov, Elohei Sara, Elohei Rivka, Elohei Rachel ve'Elohei Le'a, Ha'El hagadol hagibor vehanora, El Elyon, gomel chasadim tovim, vekoneh hakol, vezocher chasdei avot ve'imahot, umevi go'el livnei veneihem lema'an shemo be'ahava. Zochrenu lechayim, Melech chafetz bachayim, vechotvenu besefer hachayim, lema'ancha Elohim chayim. Melech ozer umoshia umagen. Baruch atah Adonai, Magen Avraham ufoked Sara.",
  ru: "[Авот ве-Имаот — эгалитарная версия с патриархами и матриархами] Благословен Ты, Господь Бог наш и Бог отцов наших, Бог Авраама, Бог Ицхака и Бог Яакова, Бог Сары, Бог Ривки, Бог Рахели и Бог Леи, Бог великий, могучий и грозный, Бог Всевышний, творящий добрые милости, и приобретающий всё, и помнящий милости отцов и матерей, и приводящий избавителя сынам сынов их ради Имени Своего с любовью. [Вставка между Рош а-Шана и Йом Кипур — внутри этой брахи:] Вспомни нас для жизни, Царь, желающий жизни, и запиши нас в Книгу Жизни, ради Тебя, Бог живой. Царь помогающий и спасающий и Щит. Благословен Ты, Господь, Щит Авраама и Вспоминающий Сару.",
  nl: "[Avot Ve'Imahot - Egalitaire versie met voorvaders en voormoeders] Gezegend bent U, Eeuwige onze God en God van onze vaderen, God van Abraham, God van Jitschak en God van Jakob, God van Sara, God van Rivka, God van Rachel en God van Lea, de grote, machtige en ontzagwekkende God, Opperste God, Die goede gunsten bewijst, en Alles verwerft, en Die de gunsten van vaders en moeders gedenkt, en Die een Verlosser brengt aan de kinderen van hun kinderen omwille van Zijn Naam met liefde. [Seizoensinvoeging tussen Rosj Hasjana en Jom Kipoer — binnen deze beracha:] Gedenk ons ten leven, Koning Die behagen heeft in het leven, en schrijf ons in het Boek des Levens, omwille van U, levende God. Koning, Helper en Redder en Schild. Gezegend bent U, Eeuwige, Schild van Abraham en Die Sara gedenkt.",
  en: "[Avot Ve'Imahot - Egalitarian version with Patriarchs and Matriarchs] Blessed are You, Lord our God and God of our fathers, God of Abraham, God of Isaac and God of Jacob, God of Sarah, God of Rebecca, God of Rachel and God of Leah, the great, mighty and awesome God, Most High God, Who bestows good kindnesses, and acquires all, and remembers the kindnesses of fathers and mothers, and brings a Redeemer to their children's children for the sake of His Name with love. [Seasonal insertion between Rosh HaShana and Yom Kippur - inside this bracha:] Remember us for life, King Who desires life, and inscribe us in the Book of Life, for Your sake, living God. King, Helper and Savior and Shield. Blessed are You, Lord, Shield of Abraham and Who remembers Sarah.",
  fr: "[Avot Ve'Imahot - Version égalitaire avec Patriarches et Matriarches] Béni sois-Tu, Éternel notre Dieu et Dieu de nos pères, Dieu d'Abraham, Dieu d'Isaac et Dieu de Jacob, Dieu de Sarah, Dieu de Rivka, Dieu de Rachel et Dieu de Léa, le Dieu grand, puissant et redoutable, Dieu Très-Haut, Qui accorde de bonnes bontés, et acquiert tout, et Se souvient des bontés des pères et des mères, et amène un Rédempteur aux enfants de leurs enfants pour Son Nom avec amour. [Insertion saisonnière entre Roch Hachana et Kippour — à l'intérieur de cette bénédiction :] Souviens-Toi de nous pour la vie, Roi qui désires la vie, et inscris-nous dans le Livre de la Vie, pour Toi, Dieu vivant. Roi, Aide et Sauveur et Bouclier. Béni sois-Tu, Éternel, Bouclier d'Abraham et Qui Se souvient de Sarah."
},
{
  id: 45,
  include_in_home: true,
  seasonal_winter: true,
  seasonal_yamim_noraim: true,
  titleEn: "Gevurot - Atah Gibor",
  titleHe: "גְּבוּרוֹת - אַתָּה גִּבּוֹר",
  he_display: "[2. GEWOEROT]\nאַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ.\n[Seasonal 1 - Winter - Tussen Simchat Tora en Pesach - Insert after first line:]\nמַשִּׁיב הָרוּחַ וּמוֹרִיד הַגָּשֶׁם.\nמְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר, מִי כָמוֹךָ בַּעַל גְּבוּרוֹת וּמִי דוֹמֶה לָךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה.\n[Seasonal 2 - Yamim Noraim - Tussen Rosh HaShana en Yom Kippur - Insert here:]\nמִי כָמוֹךָ אַב הָרַחֲמִים, זוֹכֵר יְצוּרָיו לְחַיִּים בְּרַחֲמִים.\nוְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים.\nבָּרוּךְ אַתָּה יְיָ, מְחַיֵּה הַמֵּתִים.",
  he_tts: "אַתָּה גִּבּוֹר לְעוֹלָם אֲדֹנָי, מְחַיֵּה מֵתִים אַתָּה, רַב לְהוֹשִׁיעַ. מַשִּׁיב הָרוּחַ וּמוֹרִיד הַגָּשֶׁם. מְכַלְכֵּל חַיִּים בְּחֶסֶד, מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים, סוֹמֵךְ נוֹפְלִים, וְרוֹפֵא חוֹלִים, וּמַתִּיר אֲסוּרִים, וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר, מִי כָמוֹךָ בַּעַל גְּבוּרוֹת וּמִי דוֹמֶה לָךְ, מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה. מִי כָמוֹךָ אַב הָרַחֲמִים, זוֹכֵר יְצוּרָיו לְחַיִּים בְּרַחֲמִים. וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים. בָּרוּךְ אַתָּה יְיָ, מְחַיֵּה הַמֵּתִים.",
  translit: "Atah gibor le'olam Adonai, mechayeh metim atah, rav lehoshia. Mashiv haruach umorid hagashem. Mechalkel chayim bechesed, mechayeh metim berachamim rabim, somech noflim, verofeh cholim, umatir asurim, umekayem emunato lishenei afar, mi chamocha ba'al gevurot umi domeh lach, Melech memit umechayeh umatzmiach yeshua. Mi chamocha Av harachamim, zocher yetzurav lechayim berachamim. Vene'eman atah lehachayot metim. Baruch atah Adonai, mechayeh hametim.",
  ru: "[2. Гевурот] Ты могуч вовеки, Господь, оживляющий мертвых Ты, велик в спасении. [Зимняя вставка между Симхат Тора и Песах: Заставляющий дуть ветер и низводящий дождь.] Питающий живых милостью, оживляющий мертвых милосердием великим, поддерживающий падающих, и исцеляющий больных, и освобождающий узников, и исполняющий верность Свою спящим в прахе, кто как Ты, Владыка могуществ и кто подобен Тебе, Царь умерщвляющий и оживляющий и взращивающий спасение. [Вставка в Ямим Нораим между Рош а-Шана и Йом Кипур: Кто как Ты, Отец милосердия, помнящий творения Свои для жизни в милосердии. И верен Ты в оживлении мертвых.] Благословен Ты, Господь, оживляющий мертвых.",
  nl: "[2. Gewoerot] U bent machtig in eeuwigheid, Eeuwige, Die doden levend maakt, groot in verlossing. [Winter invoeging tussen Simchat Tora en Pesach: Die de wind doet waaien en de regen doet neerdalen.] Die levenden voedt met liefde, doden levend maakt met grote barmhartigheid, Die vallenden ondersteunt, en zieken geneest, en gevangenen bevrijdt, en Zijn trouw handhaaft aan hen die in het stof slapen, wie is als U, Meester van machten en wie is U gelijk, Koning Die doodt en levend maakt en heil doet ontspruiten. [Invoeging Yamim Noraim tussen Rosj Hasjana en Jom Kipoer: Wie is als U, Vader der barmhartigheid, Die Zijn schepselen gedenkt ten leven in barmhartigheid. En betrouwbaar bent U om doden te doen herleven.] Gezegend bent U, Eeuwige, Die de doden levend maakt.",
  en: "[2. Gevurot] You are mighty forever, Lord, You revive the dead, great in salvation. [Winter insertion between Simchat Torah and Pesach: Who causes the wind to blow and the rain to fall.] Who sustains the living with kindness, revives the dead with great mercy, supports the falling, heals the sick, releases the bound, and keeps His faith to those who sleep in the dust, who is like You, Master of mighty deeds and who is comparable to You, King Who causes death and restores life and causes salvation to sprout. [Yamim Noraim insertion between Rosh HaShana and Yom Kippur: Who is like You, Father of mercy, Who remembers His creatures for life in mercy. And faithful are You to revive the dead.] Blessed are You, Lord, Who revives the dead.",
  fr: "[2. Guevourot] Tu es puissant à jamais, Seigneur, Toi qui fais revivre les morts, grand pour sauver. [Insertion d'hiver entre Sim'hat Torah et Pessa'h: Qui fais souffler le vent et tomber la pluie.] Qui nourris les vivants avec bonté, fais revivre les morts avec grande miséricorde, soutiens les tombants, guéris les malades, libères les captifs, et gardes Ta fidélité à ceux qui dorment dans la poussière, qui est comme Toi, Maître des puissances et qui Te ressemble, Roi qui fais mourir et vivre et fais germer le salut. [Insertion Yamim Noraim entre Roch Hachana et Kippour: Qui est comme Toi, Père de miséricorde, Qui Se souvient de Ses créatures pour la vie avec miséricorde. Et fidèle Tu es pour faire revivre les morts.] Béni sois-Tu, Éternel, Qui fais revivre les morts."
},
{
  id: 46,
  include_in_home: true,
  titleEn: "Kedushat Hashem - Atah Kadosh - Silent Amida",
  titleHe: "קְדֻשַּׁת הַשֵּׁם - אַתָּה קָדוֹשׁ",
  he_display: "[3. KEDOESJAT HASJEM - For silent private Amida - Do NOT use chazzan Kedusha]\nאַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכָל-יוֹם יְהַלְּלוּךָ, סֶלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ.\n[Seasonal replacement - Tussen Rosj Hasjana en Jom Kipoer - Replace last words:]\nבָּרוּךְ אַתָּה יְיָ, הַמֶּלֶךְ הַקָּדוֹשׁ.",
  he_tts: "אַתָּה קָדוֹשׁ וְשִׁמְךָ קָדוֹשׁ, וּקְדוֹשִׁים בְּכֹל-יוֹם יְהַלְּלוּךָ, סֶלָה. בָּרוּךְ אַתָּה יְיָ, הָאֵל הַקָּדוֹשׁ. בָּרוּךְ אַתָּה יְיָ, הַמֶּלֶךְ הַקָּדוֹשׁ.",
  translit: "Atah kadosh veshimcha kadosh, ukedoshim bechol-yom yehalelucha, sela. Baruch atah Adonai, Ha'El hakadosh. Baruch atah Adonai, HaMelech hakadosh.",
  ru: "[Для тихой частной Амиды — не использовать Кедушу хаззана со следующей страницы] Ты свят и Имя Твое свято, и святые каждый день восхваляют Тебя, села. Благословен Ты, Господь, Бог святой. [Сезонная замена между Рош а-Шана и Йом Кипур: Благословен Ты, Господь, Царь святой.]",
  nl: "[Voor stille privé Amida — niet de Kedoesja van de chazzan gebruiken van de volgende pagina] U bent heilig en Uw Naam is heilig, en heiligen loven U elke dag, sela. Gezegend bent U, Eeuwige, de heilige God. [Seizoensvervanging tussen Rosj Hasjana en Jom Kipoer: Gezegend bent U, Eeuwige, de heilige Koning.]",
  en: "[For silent private Amida — do not use chazzan Kedusha from next page] You are holy and Your Name is holy, and holy ones praise You every day, selah. Blessed are You, Lord, the holy God. [Seasonal replacement between Rosh HaShana and Yom Kippur: Blessed are You, Lord, the holy King.]",
  fr: "[Pour la Amida silencieuse privée — ne pas utiliser la Kedoucha du hazzan de la page suivante] Tu es saint et Ton Nom est saint, et des saints Te louent chaque jour, sela. Béni sois-Tu, Éternel, le Dieu saint. [Remplacement saisonnier entre Roch Hachana et Kippour: Béni sois-Tu, Éternel, le Roi saint.]"
},
{
  id: 47,
  include_in_home: true,
  replaces: "4-16",
  titleEn: "Hawinenu - The Shortened Amida",
  titleHe: "הֲבִינֵנוּ - עמידה קצרה - מחליף ברכות 4-16",
  he_display: "הֲבִינֵנוּ יְיָ אֱלֹהֵינוּ, וְרַצֵּה בִתְשׁוּבָתֵנוּ, סְלַח לָנוּ גּוֹאֲלֵנוּ וְרַפֵּא חֳלָיֵינוּ, בָּרֵךְ שְׁנָתֵנוּ בְּטַלְלֵי בְרָכָה, כִּי מְפַזְּרִים אַתָּה תְקַבֵּץ וְהַתּוֹעִים עָלֶיךָ לִשְׁפּוֹט וְהָרְשָׁעָה תְּכַנִּיעַ.\nוְיִשְׂמְחוּ כָל-חוֹסֵי בָךְ בְּבִנְיַן עִירְךָ וּבִישׁוּעָתֶךָ, טֶרֶם נִקְרָא אַתָּה תַעֲנֶה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.",
  he_tts: "הֲבִינֵנוּ יְיָ אֱלֹהֵינוּ, וְרַצֵּה בִתְשׁוּבָתֵנוּ, סְלַח לָנוּ גּוֹאֲלֵנוּ וְרַפֵּא חֳלָיֵינוּ, בָּרֵךְ שְׁנָתֵנוּ בְּטַלְלֵי בְרָכָה, כִּי מְפַזְּרִים אַתָּה תְקַבֵּץ וְהַתּוֹעִים עָלֶיךָ לִשְׁפּוֹט וְהָרְשָׁעָה תְּכַנִּיעַ. וְיִשְׂמְחוּ כֹל-חוֹסֵי בָךְ בְּבִנְיַן עִירְךָ וּבִישׁוּעָתֶךָ, טֶרֶם נִקְרָא אַתָּה תַעֲנֶה. בָּרוּךְ אַתָּה יְיָ, שׁוֹמֵעַ תְּפִלָּה.",
  translit: "Havinenu Adonai Eloheinu, veratzeh bitshuvatenu, selach lanu go'alenu verapeh cholayeinu, barech shenatenu betalelei veracha, ki mefazarim atah tekabetz vehato'im alecha lishpot veharish'a techania. Veyismechu chol-chosei vach bevinyan ircha uvishu'atecha, terem nikra atah ta'aneh. Baruch atah Adonai, shome'a tefila.",
  ru: "Дай нам разум, Господь Бог наш, и прими раскаяние наше, прости нас, Избавитель наш, и исцели болезни наши, благослови год наш росами благословения, ибо рассеянных Ты соберешь и заблудших Тебе судить и злодейство покоришь. И возрадуются все уповающие на Тебя в построении города Твоего и в спасении Твоем, прежде чем воззовем — Ты ответишь. Благословен Ты, Господь, слышащий молитву. [Заменяет все средние брахот 4-16 от Даат до Шомеа Тфила когда нет времени]",
  nl: "Geef ons inzicht, Eeuwige onze God, en heb behagen in onze terugkeer, vergeef ons onze Verlosser en genees onze ziekten, zegen ons jaar met dauwen van zegen, want de verspreiden zult U verzamelen en de dwalenden zult U beoordelen en het kwaad zult U doen buigen. En laten allen die op U vertrouwen zich verheugen in de opbouw van Uw stad en in Uw verlossing, nog voor wij roepen zult U antwoorden. Gezegend bent U, Eeuwige, Die het gebed verhoort. [Vervangt alle middelste berachot 4-16 van Kennis tot Verhoorder van gebed bij tijdsdruk]",
  en: "Give us understanding, Lord our God, and be pleased with our repentance, forgive us our Redeemer and heal our illnesses, bless our year with dews of blessing, for the scattered You will gather and the erring You will judge and wickedness You will subdue. And let all who take refuge in You rejoice in the building of Your city and in Your salvation, even before we call You will answer. Blessed are You, Lord, Who hears prayer. [Replaces all middle berachot 4-16 from Knowledge to Hear Prayer when pressed for time]",
  fr: "Fais-nous comprendre, Éternel notre Dieu, et agrée notre repentir, pardonne-nous notre Rédempteur et guéris nos maladies, bénis notre année de rosées de bénédiction, car les dispersés Tu rassembleras et les égarés Tu jugeras et la méchanceté Tu soumettras. Et que se réjouissent tous ceux qui s'abritent en Toi dans la construction de Ta ville et dans Ton salut, avant même que nous appelions Tu répondras. Béni sois-Tu, Éternel, Qui entends la prière. [Remplace toutes les bénédictions moyennes 4-16 de Connaissance à Exauceur de prière en cas de manque de temps]"
},
{
  id: 48,
  include_in_home: true,
  titleEn: "Avoda - Retse",
  titleHe: "עֲבוֹדָה - רְצֵה",
  he_display: "רְצֵה יְיָ אֱלֹהֵינוּ, בְּעַמְּךָ יִשְׂרָאֵל, וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן, וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ. וְשָׁכוֹן בְּצִיּוֹן וְיַעַבְדוּךָ עֲבָדֶיךָ בִּירוּשָׁלָיִם.\n[Seasonal insertion - Rosh Chodesh / Chol HaMoed - Yaale VeYavo:]\nאֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, יַעֲלֶה וְיָבֹא, וְיַגִּיעַ, וְיֵרָאֶה וְיֵרָצֶה וְיִשָּׁמַע, וְיִפָּקֵד וְיִזָּכֵר זִכְרוֹנֵנוּ וּפִקְדוֹנֵנוּ, וְזִכְרוֹן אֲבוֹתֵינוּ, וְזִכְרוֹן מָשִׁיחַ בֶּן דָּוִד עַבְדֶּךָ, וְזִכְרוֹן יְרוּשָׁלַיִם עִיר קָדְשֶׁךָ, וְזִכְרוֹן כָּל-עַמְּךָ בֵּית יִשְׂרָאֵל לְפָנֶיךָ, לִפְלֵיטָה וּלְטוֹבָה, לְחֵן וּלְחֶסֶד וּלְרַחֲמִים, לְחַיִּים וּלְשָׁלוֹם, בְּיוֹם רֹאשׁ הַחֹדֶשׁ הַזֶּה. / חַג הַמַּצּוֹת הַזֶּה. / חַג הַסֻּכּוֹת הַזֶּה.\nזָכְרֵנוּ יְיָ אֱלֹהֵינוּ, בּוֹ לְטוֹבָה (אָמֵן), וּפָקְדֵנוּ בוֹ לִבְרָכָה (אָמֵן), וְהוֹשִׁיעֵנוּ בוֹ לְחַיִּים (אָמֵן), וּבִדְבַר יְשׁוּעָה וְרַחֲמִים, חוּס וְחָנֵּנוּ, וְרַחֵם עָלֵינוּ וְהוֹשִׁיעֵנוּ, כִּי אֵלֶיךָ עֵינֵינוּ, כִּי אֵל מֶלֶךְ חַנּוּן וְרַחוּם אָתָּה.\n○ וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר שְׁכִינָתוֹ וְעַמּוֹ לְצִיּוֹן.",
  he_tts: "רְצֵה יְיָ אֱלֹהֵינוּ, בְּעַמְּךָ יִשְׂרָאֵל, וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן, וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ. וְשָׁכוֹן בְּצִיּוֹן וְיַעַבְדוּךָ עֲבָדֶיךָ בִּירוּשָׁלָיִם. אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, יַעֲלֶה וְיָבֹא, וְיַגִּיעַ, וְיֵרָאֶה וְיֵרָצֶה וְיִשָּׁמַע, וְיִפָּקֵד וְיִזָּכֵר זִכְרוֹנֵנוּ וּפִקְדוֹנֵנוּ, וְזִכְרוֹן אֲבוֹתֵינוּ, וְזִכְרוֹן מָשִׁיחַ בֶּן דָּוִד עַבְדֶּךָ, וְזִכְרוֹן יְרוּשָׁלַיִם עִיר קָדְשֶׁךָ, וְזִכְרוֹן כֹּל-עַמְּךָ בֵּית יִשְׂרָאֵל לְפָנֶיךָ, לִפְלֵיטָה וּלְטוֹבָה, לְחֵן וּלְחֶסֶד וּלְרַחֲמִים, לְחַיִּים וּלְשָׁלוֹם, בְּיוֹם רֹאשׁ הַחֹדֶשׁ הַזֶּה. חַג הַמַּצּוֹת הַזֶּה. חַג הַסֻּכּוֹת הַזֶּה. זָכְרֵנוּ יְיָ אֱלֹהֵינוּ, בּוֹ לְטוֹבָה, וּפָקְדֵנוּ בוֹ לִבְרָכָה, וְהוֹשִׁיעֵנוּ בוֹ לְחַיִּים, וּבִדְבַר יְשׁוּעָה וְרַחֲמִים, חוּס וְחָנֵּנוּ, וְרַחֵם עָלֵינוּ וְהוֹשִׁיעֵנוּ, כִּי אֵלֶיךָ עֵינֵינוּ, כִּי אֵל מֶלֶךְ חַנּוּן וְרַחוּם אָתָּה. וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר שְׁכִינָתוֹ וְעַמּוֹ לְצִיּוֹן.",
  translit: "Retse Adonai Eloheinu, be'amecha Yisrael, utefilatam be'ahava tekabel beratzon, utehi leratzon tamid avodat Yisrael amecha. Veshachon beTziyon veya'avducha avadecha biYerushalayim. Eloheinu ve'Elohei avoteinu, ya'aleh veyavo, veyagia, veyera'eh veyeratzeh veyishame'a, veyipaked veyizacher zichronenu ufikdonenu, vezichron avoteinu, vezichron Mashiach ben David avdecha, vezichron Yerushalayim ir kodshecha, vezichron kol-amcha beit Yisrael lefanecha, lifleita uletova, lechen ulechesed ulerachamim, lechayim uleshalom, beyom Rosh HaChodesh haze. Chag HaMatzot haze. Chag HaSukkot haze. Zochrenu Adonai Eloheinu, bo letova, ufakdenu vo livracha, vehoshi'enu vo lechayim, uvidvar yeshua verachamim, chus vechanenu, verachem aleinu vehoshi'enu, ki elecha eineinu, ki El Melech chanun verachum atah. Vetechezenah eineinu beshuvcha leTziyon berachamim. Baruch atah Adonai, hamachazir Shechinato ve'amo leTziyon.",
  ru: "Благоволи, Господь Бог наш, к народу Твоему Израилю, и молитву их с любовью прими с благоволением, и да будет всегда благоволением служение Израиля, народа Твоего. И обитай в Сионе и будут служить Тебе рабы Твои в Иерусалиме. [Вставка Яале веЯво на Рош Ходеш / Холь аМоэд: Бог наш и Бог отцов наших, да поднимется и придет, и достигнет, и будет увидено и будет благоволено и услышано, и вспомянуто и отмечено воспоминание наше и память наша, и воспоминание отцов наших, и воспоминание Машиаха сына Давида раба Твоего, и воспоминание Иерусалима города святости Твоей, и воспоминание всего народа Твоего дома Израиля пред Тобою, для избавления и к добру, для милости и для милосердия и для жалости, для жизни и для мира, в день Рош Ходеш этого / праздника Мацот этого / праздника Суккот этого. Вспомни нас, Господь Бог наш, в нем к добру, и вспомни нас в нем к благословению, и спаси нас в нем к жизни, и словом спасения и милосердия, пощади и помилуй нас, и смилуйся над нами и спаси нас, ибо к Тебе глаза наши, ибо Бог Царь милостивый и милосердный Ты.] И да увидят глаза наши в возвращении Твоем в Сион с милосердием. Благословен Ты, Господь, возвращающий Шхину Свою и народ Свой в Сион.",
  nl: "Heb behagen, Eeuwige onze God, in Uw volk Israël, en neem hun gebed met liefde aan met welgevallen, en moge altijd welgevallig zijn de dienst van Israël, Uw volk. En woon in Tsion en Uw dienaren zullen U dienen in Jeroesjalajiem. [Invoeging Ja'aleh Wejavo op Rosj Chodesj / Chol HaMoëed: Onze God en God van onze vaderen, moge opstijgen en komen, en bereiken, en gezien worden en welgevallig zijn en gehoord worden, en gedacht worden en in herinnering komen onze herinnering en onze bestemming, en de herinnering van onze vaderen, en de herinnering van Masjiach ben David Uw dienaar, en de herinnering van Jeroesjalajiem Uw heilige stad, en de herinnering van heel Uw volk het huis van Israël voor U, tot ontkoming en ten goede, tot gunst en tot liefde en tot barmhartigheid, tot leven en tot vrede, op de dag van deze Rosj HaChodesj / dit Chag HaMatzot / dit Chag HaSoekot. Gedenk ons, Eeuwige onze God, daarin ten goede, en denk aan ons daarin ten zegen, en verlos ons daarin ten leven, en met een woord van verlossing en barmhartigheid, spaar en begenadig ons, en heb medelijden met ons en verlos ons, want op U zijn onze ogen gericht, want een God, Koning genadig en barmhartig bent U.] En laten onze ogen aanschouwen Uw terugkeer naar Tsion met barmhartigheid. Gezegend bent U, Eeuwige, Die Zijn Sjechiena en Zijn volk terugbrengt naar Tsion.",
  en: "Be pleased, Lord our God, with Your people Israel, and receive their prayer with love with favor, and may always be favorable the service of Israel Your people. And dwell in Zion and Your servants will serve You in Jerusalem. [Yaaleh VeYavo insertion on Rosh Chodesh / Chol HaMoed: Our God and God of our fathers, may there ascend and come, and arrive, and be seen and be favored and be heard, and be remembered and recalled our memory and our fate, and the memory of our fathers, and the memory of Mashiach son of David Your servant, and the memory of Jerusalem Your holy city, and the memory of all Your people the house of Israel before You, for deliverance and for good, for grace and for kindness and for mercy, for life and for peace, on this day of Rosh Chodesh / this Chag HaMatzot / this Chag HaSukkot. Remember us, Lord our God, on it for good, and remember us on it for blessing, and save us on it for life, and with a word of salvation and mercy, spare and be gracious to us, and have mercy on us and save us, for to You our eyes are turned, for a God, King gracious and merciful are You.] And may our eyes behold Your return to Zion with mercy. Blessed are You, Lord, Who restores His Shechinah and His people to Zion.",
  fr: "Prends plaisir, Éternel notre Dieu, en Ton peuple Israël, et reçois leur prière avec amour avec faveur, et que soit toujours favorable le service d'Israël Ton peuple. Et réside à Sion et Tes serviteurs Te serviront à Jérusalem. [Insertion Yaalé VéYavo à Roch Hodech / Hol HaMoed: Notre Dieu et Dieu de nos pères, que monte et vienne, et arrive, et soit vu et soit agréé et soit entendu, et soit rappelé et souvenu notre souvenir et notre sort, et le souvenir de nos pères, et le souvenir de Machia'h fils de David Ton serviteur, et le souvenir de Jérusalem Ta ville sainte, et le souvenir de tout Ton peuple la maison d'Israël devant Toi, pour délivrance et pour le bien, pour grâce et pour bonté et pour miséricorde, pour vie et pour paix, en ce jour de Roch Hodech / cette fête des Matsot / cette fête des Soukkot. Souviens-Toi de nous, Éternel notre Dieu, en ce jour pour le bien, et souviens-Toi de nous en ce jour pour bénédiction, et sauve-nous en ce jour pour la vie, et par une parole de salut et de miséricorde, épargne et fais-nous grâce, et aie pitié de nous et sauve-nous, car vers Toi nos yeux, car un Dieu Roi clément et miséricordieux Tu es.] Et que nos yeux voient Ton retour à Sion avec miséricorde. Béni sois-Tu, Éternel, Qui ramène Sa Chekhina et Son peuple à Sion."
},
{
  id: 49,
  include_in_home: true,
  titleEn: "Hodaa - Modim",
  titleHe: "הוֹדָאָה - מוֹדִים",
  he_display: "מוֹדִים אֲנַחְנוּ לָךְ שָׁאַתָּה הוּא יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ לְעוֹלָם וָעֶד, צוּר חַיֵּינוּ, מָגֵן יִשְׁעֵנוּ אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְךָ וּנְסַפֵּר תְּהִלָּתֶךָ, עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ, וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ, וְעַל נִסֶּיךָ שֶׁבְּכָל-יוֹם עִמָּנוּ, וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכָל-עֵת, עֶרֶב וָבֹקֶר וְצָהֳרַיִם. ○ הַטּוֹב כִּי לֹא כָלוּ רַחֲמֶיךָ, וְהַמְרַחֵם כִּי לֹא תַמּוּ חֲסָדֶיךָ, מֵעוֹלָם קִוִּינוּ לָךְ.\n• וְעַל-כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד.\n[Between Rosh HaShana and Yom Kippur add:]\nוּכְתוֹב לְחַיִּים טוֹבִים כָּל-בְּנֵי בְרִיתֶךָ וְכֹל הַחַיִּים יוֹדוּךָ סֶּלָה, וִיהַלְלוּ אֶת-שִׁמְךָ בֶּאֱמֶת, הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. בָּרוּךְ אַתָּה יְיָ, הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת.",
  he_tts: "מוֹדִים אֲנַחְנוּ לָךְ שָׁאַתָּה הוּא יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ לְעוֹלָם וָעֶד, צוּר חַיֵּינוּ, מָגֵן יִשְׁעֵנוּ אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְךָ וּנְסַפֵּר תְּהִלָּתֶךָ, עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ, וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ, וְעַל נִסֶּיךָ שֶׁבְּכֹל-יוֹם עִמָּנוּ, וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכֹל-עֵת, עֶרֶב וָבֹקֶר וְצָהֳרַיִם. הַטּוֹב כִּי לֹא כָלוּ רַחֲמֶיךָ, וְהַמְרַחֵם כִּי לֹא תַמּוּ חֲסָדֶיךָ, מֵעוֹלָם קִוִּינוּ לָךְ. וְעַל-כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד. וּכְתוֹב לְחַיִּים טוֹבִים כֹּל-בְּנֵי בְרִיתֶךָ. וְכֹל הַחַיִּים יוֹדוּךָ סֶּלָה, וִיהַלְלוּ אֶת-שִׁמְךָ בֶּאֱמֶת, הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. בָּרוּךְ אַתָּה יְיָ, הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת.",
  translit: "Modim anachnu lach sha'atah Hu Adonai Eloheinu ve'Elohei avoteinu ve'imoteinu le'olam va'ed, Tzur chayeinu, Magen yish'enu atah Hu ledor vador. Nodeh lecha unesaper tehilatecha, al chayeinu hamesurim beyadecha, ve'al nishmoteinu hapekudot lach, ve'al nisecha shebechol-yom imanu, ve'al nifle'otecha vetovotecha shebechol-et, erev vavoker vetzahorayim. Hatov ki lo chalu rachamecha, vehamerachem ki lo tamu chasadecha, me'olam kivinu lach. Ve'al-kulam yitbarach veyitromam shimcha Malkenu tamid le'olam va'ed. Uchtov lechayim tovim kol-benei veritecha. Vechol hachayim yoducha sela, vihalelu et-shimcha be'emet, Ha'El yeshu'atenu ve'ezratenu sela. Baruch atah Adonai, hatov shimcha ulecha na'eh lehodot.",
  ru: "Благодарим мы Тебя, что Ты Господь Бог наш и Бог отцов наших и матерей наших во веки веков, Твердыня жизни нашей, Щит спасения нашего Ты из поколения в поколение. Будем благодарить Тебя и рассказывать хвалу Твою, за жизни наши, врученные в руку Твою, и за души наши, вверенные Тебе, и за чудеса Твои, что каждый день с нами, и за дивные дела Твои и блага Твои, что во всякое время, вечером и утром и днем. ○ Добрый, ибо не истощились милосердия Твои, и Милосердный, ибо не закончились милости Твои, издревле надеялись мы на Тебя. И за всё да будет благословенно и превознесено имя Твое, Царь наш, всегда во веки веков. [Между Рош а-Шана и Йом Кипур добавляют: И запиши для жизни доброй всех сынов завета Твоего] И все живые будут благодарить Тебя, села, и восхвалять имя Твое поистине, Бог спасения нашего и помощи нашей, села. Благословен Ты, Господь, Добр имя Твое и Тебе подобает благодарить.",
  nl: "Wij danken U, dat U Eeuwige onze God en God van onze vaderen en onze moeders bent voor eeuwig en altijd, Rots van ons leven, Schild van onze redding bent U van geslacht tot geslacht. Wij zullen U danken en Uw lof vertellen, voor onze levens die in Uw hand zijn gelegd, en voor onze zielen die aan U zijn toevertrouwd, en voor Uw wonderen die elke dag bij ons zijn, en voor Uw wonderdaden en Uw weldaden die er zijn te allen tijde, avond en ochtend en middag. ○ De Goede, want niet op zijn Uw barmhartigheden, en de Barmhartige, want niet op zijn Uw gunsten, van oudsher hoopten wij op U. En voor alles moge gezegend en verheven worden Uw Naam, onze Koning, altijd voor eeuwig en altijd. [Tussen Rosj Hasjana en Jom Kipoer voegt men toe: En schrijf ten goede leven al de kinderen van Uw verbond] En alle levenden zullen U danken, sela, en Uw Naam loven in waarheid, God van onze redding en onze hulp, sela. Gezegend bent U, Eeuwige, Goed is Uw Naam en U betaamt het te danken.",
  en: "We give thanks to You that You are Lord our God and God of our fathers and our mothers forever and ever, Rock of our lives, Shield of our salvation are You from generation to generation. We will thank You and recount Your praise, for our lives which are entrusted in Your hand, and for our souls which are committed to You, and for Your miracles which are every day with us, and for Your wonders and Your goodnesses which are at all times, evening and morning and noon. ○ The Good One, for Your mercies have not ended, and the Merciful One, for Your kindnesses have not ceased, from of old we hoped for You. And for all, may Your Name be blessed and exalted, our King, always forever and ever. [Between Rosh HaShana and Yom Kippur add: And inscribe for good life all children of Your covenant] And all the living shall thank You, selah, and praise Your Name in truth, God of our salvation and our help, selah. Blessed are You, Lord, Good is Your Name and to You it is fitting to give thanks.",
  fr: "Nous Te rendons grâce que Tu es Éternel notre Dieu et Dieu de nos pères et de nos mères pour toujours et à jamais, Rocher de nos vies, Bouclier de notre salut Tu es de génération en génération. Nous Te remercierons et raconterons Ta louange, pour nos vies remises entre Tes mains, et pour nos âmes confiées à Toi, et pour Tes miracles qui sont chaque jour avec nous, et pour Tes prodiges et Tes bienfaits qui sont en tout temps, soir et matin et midi. ○ Le Bon, car Tes miséricordes ne se sont pas épuisées, et le Miséricordieux, car Tes bontés ne se sont pas achevées, depuis toujours nous avons espéré en Toi. Et pour tout, que Ton Nom soit béni et exalté, notre Roi, toujours pour toujours et à jamais. [Entre Roch Hachana et Kippour on ajoute: Et inscris pour une bonne vie tous les enfants de Ton alliance] Et tous les vivants Te rendront grâce, sela, et loueront Ton Nom en vérité, Dieu de notre salut et de notre aide, sela. Béni sois-Tu, Éternel, Bon est Ton Nom et à Toi il sied de rendre grâce."
},
{
  id: 50,
  include_in_home: true,
  titleEn: "Birkat HaShalom - Sim Shalom - For Shacharit",
  titleHe: "בִּרְכַּת הַשָּׁלוֹם - שִׂים שָׁלוֹם - לשחרית",
  he_display: "[Sim Shalom - For Shacharit lechol with Hawinenu]\nשִׂים שָׁלוֹם טוֹבָה וּבְרָכָה, חֵן וָחֶסֶד וְרַחֲמִים, עָלֵינוּ וְעַל כָּל-יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ, אָבִינוּ, כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ, כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ, יְיָ אֱלֹהֵינוּ, תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד, וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם, וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת-עַמְּךָ יִשְׂרָאֵל בְּכָל-עֵת וּבְכָל-שָׁעָה בִּשְׁלוֹמֶךָ.\n[Seasonal insertion - Tussen Rosj Hasjana en Jom Kipoer - Insert before final bracha:]\nבְּסֵפֶר חַיִּים, בְּרָכָה וְשָׁלוֹם וּפַרְנָסָה טוֹבָה, נִזָּכֵר וְנִכָּתֵב לְפָנֶיךָ, אֲנַחְנוּ וְכָל-עַמְּךָ בֵּית יִשְׂרָאֵל, לְחַיִּים טוֹבִים וּלְשָׁלוֹם.\nבָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת-עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם.\n[Alternative seasonal closing: בָּרוּךְ אַתָּה יְיָ, עוֹשֵׂה הַשָּׁלוֹם.]",
  he_tts: "שִׂים שָׁלוֹם טוֹבָה וּבְרָכָה, חֵן וָחֶסֶד וְרַחֲמִים, עָלֵינוּ וְעַל כֹּל-יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ, אָבִינוּ, כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ, כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ, יְיָ אֱלֹהֵינוּ, תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד, וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם, וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת-עַמְּךָ יִשְׂרָאֵל בְּכֹל-עֵת וּבְכֹל-שָׁעָה בִּשְׁלוֹמֶךָ. בְּסֵפֶר חַיִּים, בְּרָכָה וְשָׁלוֹם וּפַרְנָסָה טוֹבָה, נִזָּכֵר וְנִכָּתֵב לְפָנֶיךָ, אֲנַחְנוּ וְכֹל-עַמְּךָ בֵּית יִשְׂרָאֵל, לְחַיִּים טוֹבִים וּלְשָׁלוֹם. בָּרוּךְ אַתָּה יְיָ, הַמְבָרֵךְ אֶת-עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם. בָּרוּךְ אַתָּה יְיָ, עוֹשֵׂה הַשָּׁלוֹם.",
  translit: "Sim shalom tova uveracha, chen vachesed verachamim, aleinu ve'al kol-Yisrael amecha. Barchenu, Avinu, kulanu ke'echad be'or panecha, ki ve'or panecha natata lanu, Adonai Eloheinu, Torat chayim ve'ahavat chesed, utzdaka uveracha verachamim vechayim veshalom, vetov be'einecha levarech et-amcha Yisrael bechol-et uvechol-sha'a bishlomecha. Besefer chayim, beracha veshalom ufarnasa tova, nizacher venikatev lefanecha, anachnu vechol-amcha beit Yisrael, lechayim tovim uleshalom. Baruch atah Adonai, hamvarech et-amo Yisrael bashalom. Baruch atah Adonai, oseh hashalom.",
  ru: "[Сим шалом — для будничного Шахарит вместе с Хавинену] Установи мир, благо и благословение, милость и милосердие и жалость, на нас и на весь Израиль народ Твой. Благослови нас, Отец наш, всех нас как одного светом лика Твоего, ибо светом лика Твоего дал Ты нам, Господь Бог наш, Тору жизни и любовь милости, и справедливость и благословение и милосердие и жизнь и мир, и благо в глазах Твоих благословить народ Твой Израиль во всякое время и во всякий час миром Твоим. [Вставка между Рош а-Шана и Йом Кипур: В Книге жизни, благословения и мира и пропитания доброго будем вспомянуты и записаны пред Тобою, мы и весь народ Твой дом Израиля, к жизни доброй и к миру.] Благословен Ты, Господь, благословляющий народ Свой Израиль миром. [Альтернативное сезонное окончание: Благословен Ты, Господь, творящий мир.]",
  nl: "[Sim Shalom — voor Sjachariet doordeweeks met Hawinenu] Stel vrede, goedheid en zegen, gunst en liefde en barmhartigheid, op ons en op heel Israël Uw volk. Zegen ons, onze Vader, allen tezamen met het licht van Uw aangezicht, want met het licht van Uw aangezicht gaf U ons, Eeuwige onze God, Tora van leven en liefdevolle goedheid, en gerechtigheid en zegen en barmhartigheid en leven en vrede, en goed is het in Uw ogen om Uw volk Israël te zegenen te allen tijde en te allen ure met Uw vrede. [Seizoensinvoeging Tussen Rosj Hasjana en Jom Kipoer: In het Boek van leven, zegen en vrede en goed levensonderhoud, mogen wij herdacht en ingeschreven worden voor U, wij en heel Uw volk het huis van Israël, voor een goed leven en voor vrede.] Gezegend bent U, Eeuwige, Die Zijn volk Israël zegent met vrede. [Alternatieve seizoenssluiting: Gezegend bent U, Eeuwige, Die vrede sticht.]",
  en: "[Sim Shalom - For Shacharit lechol with Hawinenu] Grant peace, goodness and blessing, grace and kindness and mercy, upon us and upon all Israel Your people. Bless us, our Father, all of us as one with the light of Your face, for with the light of Your face You gave us, Lord our God, Torah of life and love of kindness, and righteousness and blessing and mercy and life and peace, and may it be good in Your eyes to bless Your people Israel at all times and at every hour with Your peace. [Seasonal insertion Between Rosh HaShana and Yom Kippur: In the Book of life, blessing and peace and good sustenance, may we be remembered and inscribed before You, we and all Your people the house of Israel, for good life and for peace.] Blessed are You, Lord, Who blesses His people Israel with peace. [Alternative seasonal closing: Blessed are You, Lord, Who makes peace.]",
  fr: "[Sim Shalom — pour Chaharit en semaine avec Hawinénou] Accorde paix, bonté et bénédiction, grâce et bonté et miséricorde, sur nous et sur tout Israël Ton peuple. Bénis-nous, notre Père, tous ensemble à la lumière de Ta face, car à la lumière de Ta face Tu nous as donné, Éternel notre Dieu, Torah de vie et amour de bonté, et justice et bénédiction et miséricorde et vie et paix, et qu'il soit bon à Tes yeux de bénir Ton peuple Israël en tout temps et à toute heure de Ta paix. [Insertion saisonnière Entre Roch Hachana et Kippour: Dans le Livre de vie, bénédiction et paix et bonne subsistance, puissions-nous être rappelés et inscrits devant Toi, nous et tout Ton peuple la maison d'Israël, pour une bonne vie et pour la paix.] Béni sois-Tu, Éternel, Qui bénit Son peuple Israël par la paix. [Clôture saisonnière alternative: Béni sois-Tu, Éternel, Qui fais la paix.]"
},
{
  id: 51,
  include_in_home: true,
  version: "reform_inclusive",
  skip_traditional_version_I: true,
  titleEn: "Alenu - Eerste Alinea- Inclusive",
  titleHe: "עָלֵינוּ - נוסח ליברלי בלי גויי הארצות",
  he_display: "[II - LJG Reform version]\nעָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁבָּחַר-בָּנוּ לְיַחֵד אֶת-שְׁמוֹ וְקֵרְבָנוּ לְעָבְדָתוֹ, וַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים הַקָּדוֹשׁ בָּרוּךְ הוּא, ○ שֶׁהוּא נוֹטֶה שָׁמַיִם וְיוֹסֵד אָרֶץ, וּמוֹשַׁב יְקָרוֹ בַּשָּׁמַיִם מִמַּעַל, וּשְׁכִינַת עֻזּוֹ בְּגָבְהֵי מְרוֹמִים. הוּא אֱלֹהֵינוּ, אֵין עוֹד. אֱמֶת מַלְכֵּנוּ, אֶפֶס זוּלָתוֹ, כַּכָּתוּב בְּתוֹרָתוֹ: וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ, כִּי יְיָ הוּא הָאֱלֹהִים בַּשָּׁמַיִם מִמַּעַל וְעַל הָאָרֶץ מִתַּחַת, אֵין עוֹד.",
  he_tts: "עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁבָּחַר-בָּנוּ לְיַחֵד אֶת-שְׁמוֹ וְקֵרְבָנוּ לְעָבְדָתוֹ, וַאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים הַקָּדוֹשׁ בָּרוּךְ הוּא, שֶׁהוּא נוֹטֶה שָׁמַיִם וְיוֹסֵד אָרֶץ, וּמוֹשַׁב יְקָרוֹ בַּשָּׁמַיִם מִמַּעַל, וּשְׁכִינַת עֻזּוֹ בְּגָבְהֵי מְרוֹמִים. הוּא אֱלֹהֵינוּ, אֵין עוֹד. אֱמֶת מַלְכֵּנוּ, אֶפֶס זוּלָתוֹ, כַּכָּתוּב בְּתוֹרָתוֹ: וְיָדַעְתָּ הַיּוֹם וַהֲשֵׁבֹתָ אֶל לְבָבֶךָ, כִּי יְיָ הוּא הָאֱלֹהִים בַּשָּׁמַיִם מִמַּעַל וְעַל הָאָרֶץ מִתַּחַת, אֵין עוֹד.",
  translit: "Aleinu leshabe'ach la'adon hakol, latet gedula leyotzer bereshit, shebachar-banu leyached et-shemo vekervanu le'avdato, va'anachnu kor'im umishtachavim umodim lifnei Melech malchei hamlachim HaKadosh baruch Hu, shehu noteh shamayim veyosed aretz, umoshav yekaro bashamayim mima'al, ushechinat uzo begavhei meromim. Hu Eloheinu, ein od. Emet Malkenu, efes zulato, kakatuv beTorato: veyadata hayom vahashavota el levavecha, ki Adonai Hu HaElohim bashamayim mima'al ve'al ha'aretz mitachat, ein od.",
  ru: "[II — реформистская версия LJG] На нас — восхвалять Господина всего, воздать величие Творцу начала, что избрал нас единить Имя Его и приблизил нас к служению Ему, а мы преклоняемся и падаем ниц и благодарим пред Царем царей царей Святым, благословен Он, что Он простирает небеса и основывает землю, и обитель величия Его в небесах свыше, и Шхина мощи Его в высотах высот. Он Бог наш, нет иного. Истинно Царь наш, нет ничего кроме Него, как написано в Торе Его: И познай сегодня и верни к сердцу твоему, что Господь Он Бог на небесах свыше и на земле внизу, нет иного. ",
  nl: "[II - LJG Reform versie] Op ons rust de plicht te loven de Heer van alles, grootheid te geven aan de Schepper van het begin, Die ons koos om Zijn Naam te verenigen en ons nabij bracht tot Zijn dienst, en wij knielen en buigen ons neer en danken voor de Koning der koningen der koningen de Heilige, gezegend is Hij, Die de hemelen uitspant en de aarde grondvest, en de zetel van Zijn heerlijkheid is in de hemelen daarboven, en de woonplaats van Zijn macht in de hoogten der hoogten. Hij is onze God, er is geen ander. Waarachtig onze Koning, er is niets buiten Hem, zoals geschreven staat in Zijn Tora: En gij zult heden weten en tot uw hart wederbrengen, dat de Eeuwige Hij is God in de hemel daarboven en op de aarde beneden, er is geen ander. ",
  en: "[II - LJG Reform version] It is upon us to praise the Lord of all, to give greatness to the Creator of beginning, Who chose us to unify His Name and brought us near to His service, and we kneel and bow and give thanks before the King of kings of kings the Holy One, blessed is He, Who stretches out heavens and founds earth, and the seat of His glory is in the heavens above, and the dwelling of His might is in the highest heights. He is our God, there is no other. True is our King, there is nothing besides Him, as it is written in His Torah: And you shall know today and bring back to your heart, that the Lord He is God in the heavens above and upon the earth below, there is no other. ",
  fr: "[II - Version réformée LJG] C'est à nous de louer le Seigneur de tout, de donner grandeur au Créateur du commencement, Qui nous a choisis pour unifier Son Nom et nous a rapprochés de Son service, et nous nous agenouillons et nous prosternons et rendons grâce devant le Roi des rois des rois le Saint, béni soit-Il, Qui étend les cieux et fonde la terre, et le siège de Sa gloire est dans les cieux en haut, et la demeure de Sa puissance dans les hauteurs des hauteurs. Il est notre Dieu, il n'y en a pas d'autre. Vrai est notre Roi, rien en dehors de Lui, comme il est écrit dans Sa Torah: Et tu sauras aujourd'hui et tu ramèneras à ton cœur, que l'Éternel Lui est Dieu dans les cieux en haut et sur la terre en bas, il n'y en a pas d'autre. "
},
{
  id: 52,
  include_in_home: true,
  titleEn: "Alenu - Second Paragraph - Al Ken Nekave",
  titleHe: "עַל-כֵּן נְקַוֶּה - אלינו שנייה",
  he_display: "עַל-כֵּן נְקַוֶּה לְךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזָּךְ, לְהַעֲבִיר גִּלּוּלִים מִן הָאָרֶץ וְהָאֱלִילִים כָּרוֹת יִכָּרֵתוּן, לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי, וְכָל-בְּנֵי בָשָׂר יִקְרְאוּ בְשִׁמְךָ, לְהַפְנוֹת אֵלֶיךָ כָּל-רִשְׁעֵי אָרֶץ. יַכִּירוּ וְיֵדְעוּ כָּל-יוֹשְׁבֵי תֵבֵל, כִּי לְךָ תִּכְרַע כָּל-בֶּרֶךְ, תִּשָּׁבַע כָּל-לָשׁוֹן. לְפָנֶיךָ יְיָ אֱלֹהֵינוּ יִכְרְעוּ וְיִפֹּלוּ, וְלִכְבוֹד שִׁמְךָ יְקָר יִתֵּנוּ, וִיקַבְּלוּ כֻלָּם אֶת-עֹל מַלְכוּתֶךָ, וְתִמְלֹךְ עֲלֵיהֶם מְהֵרָה לְעוֹלָם וָעֶד, כִּי הַמַּלְכוּת שֶׁלְּךָ הִיא וּלְעוֹלְמֵי עַד תִּמְלֹךְ בְּכָבוֹד, כַּכָּתוּב בְּתוֹרָתֶךָ: יְיָ יִמְלֹךְ לְעוֹלָם וָעֶד.\n○ וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כָּל-הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד, וּשְׁמוֹ אֶחָד.",
  he_tts: "עַל-כֵּן נְקַוֶּה לְךָ יְיָ אֱלֹהֵינוּ, לִרְאוֹת מְהֵרָה בְּתִפְאֶרֶת עֻזָּךְ, לְהַעֲבִיר גִּלּוּלִים מִן הָאָרֶץ וְהָאֱלִילִים כָּרוֹת יִכָּרֵתוּן, לְתַקֵּן עוֹלָם בְּמַלְכוּת שַׁדַּי, וְכֹל-בְּנֵי בָשָׂר יִקְרְאוּ בְשִׁמְךָ, לְהַפְנוֹת אֵלֶיךָ כֹּל-רִשְׁעֵי אָרֶץ. יַכִּירוּ וְיֵדְעוּ כֹּל-יוֹשְׁבֵי תֵבֵל, כִּי לְךָ תִּכְרַע כֹּל-בֶּרֶךְ, תִּשָּׁבַע כֹּל-לָשׁוֹן. לְפָנֶיךָ יְיָ אֱלֹהֵינוּ יִכְרְעוּ וְיִפֹּלוּ, וְלִכְבוֹד שִׁמְךָ יְקָר יִתֵּנוּ, וִיקַבְּלוּ כֻלָּם אֶת-עֹל מַלְכוּתֶךָ, וְתִמְלֹךְ עֲלֵיהֶם מְהֵרָה לְעוֹלָם וָעֶד, כִּי הַמַּלְכוּת שֶׁלְּךָ הִיא וּלְעוֹלְמֵי עַד תִּמְלֹךְ בְּכָבוֹד, כַּכָּתוּב בְּתוֹרָתֶךָ: יְיָ יִמְלֹךְ לְעוֹלָם וָעֶד. וְנֶאֱמַר: וְהָיָה יְיָ לְמֶלֶךְ עַל כֹּל-הָאָרֶץ, בַּיּוֹם הַהוּא יִהְיֶה יְיָ אֶחָד, וּשְׁמוֹ אֶחָד.",
  translit: "Al-ken nekaveh lecha Adonai Eloheinu, lir'ot mehera betiferet uzecha, leha'avir gilulim min ha'aretz veha'elilim karot yikaretun, letaken olam bemalchut Shaddai, vechol-benei vasar yikre'u veshimcha, lehafnot elecha kol-rish'ei aretz. Yakiru veyede'u kol-yoshvei tevel, ki lecha tichra kol-berech, tishava kol-lashon. Lefanecha Adonai Eloheinu yichre'u veyipolu, velichvod shimcha yekar yitenu, vikabelu chulam et-ol malchutecha, vetimloch aleihem mehera le'olam va'ed, ki hamalchut shelcha hi ule'olmei ad timloch bechavod, kakatuv beToratecha: Adonai yimloch le'olam va'ed. Vene'emar: vehaya Adonai lemelech al kol-ha'aretz, bayom hahu yihyeh Adonai echad, ushemo echad.",
  ru: "Поэтому надеемся на Тебя, Господь Бог наш, увидеть скоро великолепие мощи Твоей, удалить идолов с земли и истуканы совсем истребятся, исправить мир в царстве Всемогущего, и все сыны плоти призовут Имя Твое, обратить к Тебе всех злодеев земли. Познают и узнают все жители вселенной, что Тебе преклонится всякое колено, поклянется всякий язык. Пред Тобою, Господь Бог наш, преклонятся и падут, и славе имени Твоего честь воздадут, и примут все иго царствия Твоего, и воцаришься над ними скоро вовеки веков, ибо царство Твое и во веки веков будешь царствовать в славе, как написано в Торе Твоей: Господь будет царствовать во веки веков. ○ И сказано: И будет Господь Царем над всею землею, в день тот будет Господь один, и имя Его одно.",
  nl: "Daarom hopen wij op U, Eeuwige onze God, om spoedig te zien de luister van Uw macht, om afgoden van de aarde te verwijderen en de afgodsbeelden geheel uitgeroeid zullen worden, om de wereld te herstellen in het koningschap van de Almachtige, en alle mensenkinderen zullen Uw Naam aanroepen, om tot U te doen keren alle slechten der aarde. Laten erkennen en weten alle bewoners der wereld, dat voor U elke knie zich buigt, elke tong zweert. Voor U, Eeuwige onze God, zullen zij knielen en neervallen, en aan de eer van Uw Naam heerlijkheid geven, en zij allen zullen het juk van Uw koningschap aanvaarden, en heers over hen spoedig voor eeuwig en altijd, want het koningschap is van U en tot in alle eeuwigheden zult U heersen in heerlijkheid, zoals geschreven staat in Uw Tora: De Eeuwige zal heersen voor eeuwig en altijd. ○ En er wordt gezegd: En de Eeuwige zal Koning zijn over heel de aarde, op die dag zal de Eeuwige Eén zijn, en Zijn Naam één.",
  en: "Therefore we hope in You, Lord our God, to see soon the glory of Your might, to remove idols from the earth and the false gods utterly cut off, to perfect the world in the kingdom of the Almighty, and all flesh will call upon Your Name, to turn to You all the wicked of the earth. Let all inhabitants of the world recognize and know that to You every knee shall bend, every tongue shall swear. Before You, Lord our God, they shall kneel and fall, and to the glory of Your Name give honor, and they shall all accept the yoke of Your kingdom, and reign over them soon forever and ever, for the kingdom is Yours and forever and ever You shall reign in glory, as it is written in Your Torah: The Lord shall reign forever and ever. ○ And it is said: And the Lord shall be King over all the earth, on that day the Lord shall be One, and His Name One.",
  fr: "C'est pourquoi nous espérons en Toi, Éternel notre Dieu, pour voir bientôt la splendeur de Ta puissance, pour faire disparaître les idoles de la terre et les faux dieux entièrement retranchés, pour parfaire le monde dans le royaume du Tout-Puissant, et tous les fils de chair invoqueront Ton Nom, pour faire revenir vers Toi tous les méchants de la terre. Que reconnaissent et sachent tous les habitants du monde, que devant Toi tout genou fléchira, toute langue jurera. Devant Toi, Éternel notre Dieu, ils s'agenouilleront et tomberont, et à la gloire de Ton Nom donneront honneur, et ils accepteront tous le joug de Ton royaume, et règne sur eux bientôt pour toujours et à jamais, car le royaume est à Toi et pour les éternités Tu régneras dans la gloire, comme il est écrit dans Ta Torah: L'Éternel régnera pour toujours et à jamais. ○ Et il est dit: Et l'Éternel sera Roi sur toute la terre, en ce jour l'Éternel sera Un, et Son Nom Un."
}

];

const TOTAL_PRAYERS = prayers[prayers.length - 1].id;

/** Shir Shel Yom: ids 24–30 (Sun–Sat). List keeps all seven; Next/Previous skip to today, then to 31. */
const SHIR_SHEL_YOM_START_ID = 24;
const SHIR_SHEL_YOM_END_ID = 30;
const BEFORE_SHIR_SHEL_YOM_ID = 23;
const AFTER_SHIR_SHEL_YOM_ID = 31;

const prayerIndexById = (id: number) => prayers.findIndex((p) => p.id === id);

const isShirShelYomId = (id: number) =>
  id >= SHIR_SHEL_YOM_START_ID && id <= SHIR_SHEL_YOM_END_ID;

const todayShirShelYomIndex = () =>
  prayerIndexById(SHIR_SHEL_YOM_START_ID + new Date().getDay());

const nextPrayerIndex = (idx: number): number | null => {
  if (idx >= prayers.length - 1) return null;
  const id = prayers[idx].id;
  if (id === BEFORE_SHIR_SHEL_YOM_ID) return todayShirShelYomIndex();
  if (isShirShelYomId(id)) return prayerIndexById(AFTER_SHIR_SHEL_YOM_ID);
  return idx + 1;
};

const prevPrayerIndex = (idx: number): number | null => {
  if (idx <= 0) return null;
  const id = prayers[idx].id;
  if (id === AFTER_SHIR_SHEL_YOM_ID) return todayShirShelYomIndex();
  if (isShirShelYomId(id)) return prayerIndexById(BEFORE_SHIR_SHEL_YOM_ID);
  return idx - 1;
};

type DisplayBlock = { type: 'instruction' | 'hebrew'; content: string };

type WordSpan = {
  text: string;
  speak: string;
  speakable: boolean;
  ttsIndex: number | null;
};

type HebrewWordBlock = { type: 'hebrew'; lines: WordSpan[][] };
type InstructionWordBlock = { type: 'instruction'; content: string };
type LayoutBlock = HebrewWordBlock | InstructionWordBlock;

function isInstructionLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('[') && trimmed.endsWith(']');
}

function toInstructionOnlyBracket(bracket: string): string {
  const inner = bracket.slice(1, -1);
  const match = inner.match(/^(.+?:)\s+(.+)$/s);
  if (match && match[2].trim().length > 30) {
    return `[${match[1]}]`;
  }
  return bracket;
}

function extractBracketInstructions(text: string): string[] {
  const raw = text.match(/\[[^\]]+\]/g) ?? [];
  return raw.map(toInstructionOnlyBracket);
}

function parseHeDisplay(text: string): DisplayBlock[] {
  const blocks: DisplayBlock[] = [];

  for (const line of text.split('\n')) {
    if (!line.trim()) continue;

    const type: DisplayBlock['type'] = isInstructionLine(line) ? 'instruction' : 'hebrew';
    const last = blocks[blocks.length - 1];

    if (last?.type === type) {
      last.content += `\n${line}`;
    } else {
      blocks.push({ type, content: line });
    }
  }

  return blocks;
}

const DIVINE_NAME_FOR_TTS = /יְהוָה|יְהֹוָה|יהוה|יְיָ/g;

function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

function normalizeWord(text: string): string {
  return stripNikud(text.replace(DIVINE_NAME_FOR_TTS, 'אֲדֹנָי')).replace(/[^\u0590-\u05FF]/g, '');
}

function prepareTtsText(text: string): string {
  return text.replace(DIVINE_NAME_FOR_TTS, 'אֲדֹנָי');
}

function tokenizeTts(heTts: string): string[] {
  return prepareTtsText(heTts).split(/\s+/).filter(Boolean);
}

function tokenizeDisplayLine(line: string): WordSpan[] {
  const spans: WordSpan[] = [];
  const parts = line.split(/(\s+)/);

  for (const part of parts) {
    if (!part) continue;

    if (/^\s+$/.test(part)) {
      spans.push({ text: part, speak: '', speakable: false, ttsIndex: null });
      continue;
    }

    const hebrew = part.replace(/[^\u0590-\u05FF]/g, '');
    spans.push({
      text: part,
      speak: hebrew ? prepareTtsText(hebrew) : part,
      speakable: hebrew.length > 0,
      ttsIndex: null,
    });
  }

  return spans;
}

function alignSpeakableWords(displayWords: WordSpan[], ttsWords: string[]): void {
  let ti = 0;

  for (let i = 0; i < displayWords.length; i++) {
    const word = displayWords[i];
    const norm = normalizeWord(word.speak);

    if (ti >= ttsWords.length) {
      word.ttsIndex = null;
      continue;
    }

    const tNorm = normalizeWord(ttsWords[ti]);

    if (norm === tNorm) {
      word.ttsIndex = ti;
      word.speak = ttsWords[ti];
      ti++;
      continue;
    }

    let matchedAt = -1;
    for (let j = i + 1; j < Math.min(i + 12, displayWords.length); j++) {
      if (normalizeWord(displayWords[j].speak) === tNorm) {
        matchedAt = j;
        break;
      }
    }

    if (matchedAt >= 0) {
      for (let k = i; k < matchedAt; k++) {
        displayWords[k].ttsIndex = ti;
      }
      displayWords[matchedAt].ttsIndex = ti;
      displayWords[matchedAt].speak = ttsWords[ti];
      ti++;
      i = matchedAt;
      continue;
    }

    if (ti + 1 < ttsWords.length && norm === normalizeWord(ttsWords[ti + 1])) {
      ti++;
    }

    word.ttsIndex = ti;
    word.speak = ttsWords[ti] ?? word.speak;
    ti++;
  }
}

function buildHebrewWordLayout(heDisplay: string, heTts: string): LayoutBlock[] {
  const ttsWords = tokenizeTts(heTts);
  const speakableWords: WordSpan[] = [];
  const layout: LayoutBlock[] = [];

  for (const block of parseHeDisplay(heDisplay)) {
    if (block.type === 'instruction') {
      layout.push({ type: 'instruction', content: block.content });
      continue;
    }

    const lines: WordSpan[][] = [];
    for (const line of block.content.split('\n')) {
      if (!line.trim()) continue;
      const words = tokenizeDisplayLine(line);
      lines.push(words);
      for (const word of words) {
        if (word.speakable) speakableWords.push(word);
      }
    }

    layout.push({ type: 'hebrew', lines });
  }

  alignSpeakableWords(speakableWords, ttsWords);
  return layout;
}

function charIndexToWordIndex(text: string, charIndex: number): number {
  const words = text.split(/\s+/).filter(Boolean);
  let pos = 0;

  for (let i = 0; i < words.length; i++) {
    const start = text.indexOf(words[i], pos);
    if (start === -1) continue;
    const end = start + words[i].length;
    if (charIndex >= start && charIndex < end) return i;
    pos = end;
  }

  return Math.max(0, words.length - 1);
}

const SPEECH_RATE = 0.5;
const CHAR_SECONDS_AT_RATE = 0.085;

function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function estimateSpeechDuration(text: string, rate: number): number {
  if (!isAndroidDevice()) {
    return Math.max(4, Math.ceil((text.length * CHAR_SECONDS_AT_RATE) / rate));
  }

  const len = text.length;
  const stretch = Math.min(0.003, Math.max(0, len - 300) * 0.000004);
  return Math.max(4, Math.ceil(len * (CHAR_SECONDS_AT_RATE + stretch)));
}

function buildWordEndTimes(ttsText: string, totalDuration: number): number[] {
  const words = tokenizeTts(ttsText);
  if (words.length === 0) return [];

  const weights = words.map((word) => Math.max(1, word.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cumulative = 0;

  return weights.map((weight) => {
    cumulative += (weight / totalWeight) * totalDuration;
    return cumulative;
  });
}

function wordIndexAtElapsed(endTimes: number[], elapsedSec: number): number {
  for (let i = 0; i < endTimes.length; i++) {
    if (elapsedSec < endTimes[i]) return i;
  }
  return Math.max(0, endTimes.length - 1);
}

type TtsPhrase = {
  text: string;
  wordStart: number;
  wordCount: number;
};

function splitTtsIntoSentences(heTts: string): TtsPhrase[] {
  const words = tokenizeTts(heTts);
  const sentences: TtsPhrase[] = [];
  let i = 0;

  while (i < words.length) {
    const chunk: string[] = [];
    const wordStart = i;

    while (i < words.length) {
      chunk.push(words[i]);
      i++;
      if (/[.!?]$/.test(chunk[chunk.length - 1])) break;
    }

    if (chunk.length > 0) {
      sentences.push({
        text: chunk.join(' '),
        wordStart,
        wordCount: chunk.length,
      });
    }
  }

  return sentences;
}

function estimatePhraseDuration(text: string): number {
  return Math.max(1, text.length * CHAR_SECONDS_AT_RATE);
}

type AndroidPlayState = {
  phrases: TtsPhrase[];
  phraseIndex: number;
  estDuration: number;
  totalWords: number;
  cancelled: boolean;
  durationScale: number;
  phrasesMeasured: number;
  currentPhraseStartTime: number;
};

function updateDurationScale(
  state: AndroidPlayState,
  phraseText: string,
  actualSec: number,
): void {
  const baseEstimate = estimatePhraseDuration(phraseText);
  if (baseEstimate <= 0) return;

  const ratio = Math.min(1.6, Math.max(0.6, actualSec / baseEstimate));
  state.durationScale =
    state.phrasesMeasured === 0 ? ratio : state.durationScale * 0.55 + ratio * 0.45;
  state.phrasesMeasured += 1;
}

function HebrewDisplay({
  heDisplay,
  heTts,
  localizedTranslation,
  activeTtsIndex,
  onWordClick,
  typeSize,
}: {
  heDisplay: string;
  heTts: string;
  localizedTranslation: string;
  activeTtsIndex: number | null;
  onWordClick: (speakText: string) => void;
  typeSize: TypeSize;
}) {
  const scale = TYPE_SCALE[typeSize];
  const localizedInstructions = extractBracketInstructions(localizedTranslation);
  const layout = useMemo(() => buildHebrewWordLayout(heDisplay, heTts), [heDisplay, heTts]);
  const ttsWords = useMemo(() => tokenizeTts(heTts), [heTts]);
  const activeSpoken =
    activeTtsIndex !== null && activeTtsIndex < ttsWords.length
      ? normalizeWord(ttsWords[activeTtsIndex])
      : null;
  let instructionIndex = 0;

  return (
    <div className="space-y-4">
      {layout.map((block, index) => {
        if (block.type === 'instruction') {
          const content = block.content
            .split('\n')
            .map((line) => {
              if (!isInstructionLine(line)) return line;
              const localized = localizedInstructions[instructionIndex];
              instructionIndex += 1;
              return localized ?? line;
            })
            .join('\n');

          return (
            <p
              key={index}
              dir="ltr"
              className="ui-sans leading-6 text-zinc-500 italic text-left"
              style={{ fontSize: scale.instruction }}
            >
              {content}
            </p>
          );
        }

        return (
          <p
            key={index}
            dir="rtl"
            lang="he"
            className="he-serif leading-[1.75] text-zinc-900 text-right break-words"
            style={{ fontSize: scale.he }}
          >
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {line.map((word, wordIndex) =>
                  word.speakable ? (
                    <span
                      key={wordIndex}
                      role="button"
                      tabIndex={0}
                      onClick={() => onWordClick(word.speak)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onWordClick(word.speak);
                        }
                      }}
                      className={`rounded-sm transition-colors ${
                        activeSpoken !== null &&
                        word.ttsIndex === activeTtsIndex &&
                        normalizeWord(word.speak) === activeSpoken
                          ? 'bg-teal-200/90 ring-1 ring-teal-400/70'
                          : 'cursor-pointer hover:bg-teal-50/80 active:bg-teal-100'
                      }`}
                    >
                      {word.text}
                    </span>
                  ) : (
                    <span key={wordIndex}>{word.text}</span>
                  ),
                )}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [belowHe, setBelowHe] = useState<BelowHe>(() => {
    try {
      return resolveBelowHe(localStorage.getItem('shacharis_below_he'));
    } catch {
      return 'translation';
    }
  });
  const [typeSize, setTypeSize] = useState<TypeSize>(() => {
    try {
      return resolveTypeSize(localStorage.getItem('shacharis_type_size'));
    } catch {
      return 'm';
    }
  });
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('shacharis_lang');
      if (saved === null) return resolveSystemLang();
      return resolveLang(saved);
    } catch {
      return resolveSystemLang();
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [activeTtsIndex, setActiveTtsIndex] = useState<number | null>(null);

  const [showSplash, setShowSplash] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(() => shouldShowSupportEnvelope());
  const mainRef = useRef<HTMLElement>(null);
  const prayerScrollRef = useRef<HTMLDivElement>(null);

  const scrollShellToTop = () => {
    window.scrollTo({ top: 0 });
    mainRef.current?.scrollTo({ top: 0 });
    prayerScrollRef.current?.scrollTo({ top: 0 });
  };

  const refreshEnvelope = () => {
    setShowEnvelope(shouldShowSupportEnvelope());
  };

  const closeAbout = () => {
    setShowAbout(false);
    refreshEnvelope();
  };

  const openAbout = () => {
    setShowAbout(true);
    snoozeSupportEnvelope();
    setShowEnvelope(false);
    scrollShellToTop();
  };

  const dismissEnvelope = () => {
    snoozeSupportEnvelope();
    setShowEnvelope(false);
  };

  const intervalRef = useRef<number | null>(null);
  const wordHighlightRef = useRef<number | null>(null);
  const androidPlayRef = useRef<AndroidPlayState | null>(null);
  const startRef = useRef<number>(0);
  const pausedAccumRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const swipeRef = useRef<{ startX: number; startY: number; edge: 'left' | 'right' | null }>({
    startX: 0,
    startY: 0,
    edge: null,
  });

  const EDGE_ZONE_PX = 48;
  const SWIPE_MIN_PX = 60;
  const SWIPE_MAX_VERTICAL_PX = 80;

  const goToPrayer = (idx: number | null) => {
    setSelected(idx);
    if (idx === null) refreshEnvelope();
    scrollShellToTop();
  };

  const goHome = () => {
    setShowAbout(false);
    goToPrayer(null);
  };

  const clearTimers = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (wordHighlightRef.current) window.clearInterval(wordHighlightRef.current);
    intervalRef.current = null;
    wordHighlightRef.current = null;
  };

  const configureHebrewUtterance = useCallback((utter: SpeechSynthesisUtterance) => {
    utter.rate = SPEECH_RATE;
    utter.pitch = 1;
    utter.lang = 'he-IL';

    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find((v) => v.lang.toLowerCase().includes('he'));
    if (heVoice) utter.voice = heVoice;
  }, []);

  const stopAudio = useCallback(() => {
    if (androidPlayRef.current) androidPlayRef.current.cancelled = true;
    androidPlayRef.current = null;
    window.speechSynthesis?.cancel();
    clearTimers();
    setIsPlaying(false);
    setActiveTtsIndex(null);
    utteranceRef.current = null;
  }, []);

  const speakWord = useCallback(
    (text: string) => {
      const synth = window.speechSynthesis;
      stopAudio();
      setProgress(0);
      setCurrentSec(0);
      setDurationSec(0);
      pausedAccumRef.current = 0;

      const utter = new SpeechSynthesisUtterance(prepareTtsText(text));
      configureHebrewUtterance(utter);
      synth.speak(utter);
    },
    [configureHebrewUtterance, stopAudio],
  );

  const startWordHighlightFallback = useCallback((ttsText: string, estDuration: number) => {
    const endTimes = buildWordEndTimes(ttsText, estDuration);
    if (endTimes.length === 0) return;

    if (wordHighlightRef.current) window.clearInterval(wordHighlightRef.current);
    wordHighlightRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      setActiveTtsIndex(wordIndexAtElapsed(endTimes, elapsed));
    }, 80);
  }, []);

  const startProgressInterval = useCallback((estDuration: number) => {
    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      if (elapsed >= estDuration) {
        setCurrentSec(estDuration);
        setProgress(100);
      } else {
        setCurrentSec(elapsed);
        setProgress((elapsed / estDuration) * 100);
      }
    }, 120);
  }, []);

  const finishPlayback = useCallback((estDuration: number) => {
    setIsPlaying(false);
    setProgress(100);
    setCurrentSec(estDuration);
    setActiveTtsIndex(null);
    clearTimers();
    androidPlayRef.current = null;
    utteranceRef.current = null;
    pausedAccumRef.current = 0;
  }, []);

  const startPhraseWordHighlight = useCallback(
    (phraseText: string, wordStart: number, phraseStartTime: number, durationScale: number) => {
      const duration = estimatePhraseDuration(phraseText) * durationScale;
      const endTimes = buildWordEndTimes(phraseText, duration);
      if (endTimes.length === 0) return;

      if (wordHighlightRef.current) window.clearInterval(wordHighlightRef.current);
      wordHighlightRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - phraseStartTime) / 1000;
        const localIdx = wordIndexAtElapsed(endTimes, elapsed);
        setActiveTtsIndex(wordStart + localIdx);
      }, 60);
    },
    [],
  );

  const handlePrayerTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const width = window.innerWidth;

    if (x <= EDGE_ZONE_PX) {
      swipeRef.current = { startX: x, startY: touch.clientY, edge: 'left' };
    } else if (x >= width - EDGE_ZONE_PX) {
      swipeRef.current = { startX: x, startY: touch.clientY, edge: 'right' };
    } else {
      swipeRef.current = { startX: 0, startY: 0, edge: null };
    }
  };

  const handlePrayerTouchEnd = (e: React.TouchEvent) => {
    if (selected === null) return;

    const { edge, startX, startY } = swipeRef.current;
    swipeRef.current = { startX: 0, startY: 0, edge: null };
    if (!edge) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = Math.abs(touch.clientY - startY);
    if (dy > SWIPE_MAX_VERTICAL_PX) return;

    if (edge === 'right' && dx < -SWIPE_MIN_PX) {
      const next = nextPrayerIndex(selected);
      if (next !== null) goToPrayer(next);
      return;
    }

    if (edge === 'left' && dx > SWIPE_MIN_PX) {
      const prev = prevPrayerIndex(selected);
      goToPrayer(prev);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      clearTimers();
    };
  }, []);

  useEffect(() => {
    stopAudio();
    setProgress(0);
    setCurrentSec(0);
    setDurationSec(0);
    pausedAccumRef.current = 0;
  }, [selected, stopAudio]);

  useEffect(() => {
    localStorage.setItem('shacharis_lang', resolveLang(lang));
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('shacharis_below_he', belowHe);
  }, [belowHe]);

  useEffect(() => {
    localStorage.setItem('shacharis_type_size', typeSize);
  }, [typeSize]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (selected === null) return;
    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      pausedAccumRef.current = (Date.now() - startRef.current) / 1000;
      clearTimers();
      return;
    }

    if (synth.paused && (utteranceRef.current || androidPlayRef.current)) {
      synth.resume();
      setIsPlaying(true);
      startRef.current = Date.now() - pausedAccumRef.current * 1000;
      startProgressInterval(durationSec);
      const androidState = androidPlayRef.current;
      if (androidState) {
        const phrase = androidState.phrases[androidState.phraseIndex];
        if (phrase) {
          startPhraseWordHighlight(
            phrase.text,
            phrase.wordStart,
            androidState.currentPhraseStartTime || Date.now(),
            androidState.durationScale,
          );
        }
      } else {
        startWordHighlightFallback(prayers[selected].he_tts, durationSec);
      }
      return;
    }

    const prayer = prayers[selected];
    const ttsText = prepareTtsText(prayer.he_tts);
    const estDuration = estimateSpeechDuration(ttsText, SPEECH_RATE);

    synth.cancel();
    clearTimers();
    setDurationSec(estDuration);
    setCurrentSec(0);
    setProgress(0);
    setActiveTtsIndex(0);
    pausedAccumRef.current = 0;
    startRef.current = 0;

    if (isAndroidDevice()) {
      const words = tokenizeTts(prayer.he_tts);
      const phrases = splitTtsIntoSentences(prayer.he_tts);
      androidPlayRef.current = {
        phrases,
        phraseIndex: 0,
        estDuration,
        totalWords: words.length,
        cancelled: false,
        durationScale: 1,
        phrasesMeasured: 0,
        currentPhraseStartTime: 0,
      };

      const speakAndroidPhrase = (phraseIndex: number) => {
        const state = androidPlayRef.current;
        if (!state || state.cancelled || phraseIndex >= state.phrases.length) {
          finishPlayback(estDuration);
          return;
        }

        state.phraseIndex = phraseIndex;
        const phrase = state.phrases[phraseIndex];
        const utter = new SpeechSynthesisUtterance(phrase.text);
        configureHebrewUtterance(utter);
        utteranceRef.current = utter;

        utter.onstart = () => {
          const phraseStartTime = Date.now();
          state.currentPhraseStartTime = phraseStartTime;
          if (phraseIndex === 0) {
            startRef.current = phraseStartTime;
            startProgressInterval(estDuration);
          }
          setActiveTtsIndex(phrase.wordStart);
          startPhraseWordHighlight(
            phrase.text,
            phrase.wordStart,
            phraseStartTime,
            state.durationScale,
          );
          setProgress((phrase.wordStart / state.totalWords) * 100);
          setCurrentSec((phrase.wordStart / state.totalWords) * estDuration);
        };

        utter.onboundary = (event) => {
          if (event.charIndex === undefined) return;
          if (wordHighlightRef.current) {
            window.clearInterval(wordHighlightRef.current);
            wordHighlightRef.current = null;
          }
          const localIdx = charIndexToWordIndex(phrase.text, event.charIndex);
          setActiveTtsIndex(phrase.wordStart + localIdx);
        };

        utter.onend = () => {
          if (state.cancelled) return;
          if (wordHighlightRef.current) {
            window.clearInterval(wordHighlightRef.current);
            wordHighlightRef.current = null;
          }

          const actualSec = (Date.now() - state.currentPhraseStartTime) / 1000;
          updateDurationScale(state, phrase.text, actualSec);

          const wordsDone = phrase.wordStart + phrase.wordCount;
          setActiveTtsIndex(wordsDone - 1);
          setProgress((wordsDone / state.totalWords) * 100);
          setCurrentSec((wordsDone / state.totalWords) * estDuration);
          speakAndroidPhrase(phraseIndex + 1);
        };

        utter.onerror = () => finishPlayback(estDuration);
        synth.speak(utter);
      };

      speakAndroidPhrase(0);
      setIsPlaying(true);
      return;
    }

    const utter = new SpeechSynthesisUtterance(ttsText);
    configureHebrewUtterance(utter);

    utter.onstart = () => {
      startRef.current = Date.now();
      setActiveTtsIndex(0);
      startWordHighlightFallback(prayer.he_tts, estDuration);
      startProgressInterval(estDuration);
    };

    utter.onboundary = (event) => {
      if (event.name !== 'word' || event.charIndex === undefined) return;
      if (wordHighlightRef.current) {
        window.clearInterval(wordHighlightRef.current);
        wordHighlightRef.current = null;
      }
      setActiveTtsIndex(charIndexToWordIndex(ttsText, event.charIndex));
    };

    utter.onend = () => finishPlayback(estDuration);
    utter.onerror = () => {
      setIsPlaying(false);
      setActiveTtsIndex(null);
      clearTimers();
    };

    utteranceRef.current = utter;
    synth.speak(utter);
    setIsPlaying(true);
  };

  const currentPrayer = selected !== null ? prayers[selected] : null;
  const ui = controlsCopy(lang);

  return (
      <div className="h-full bg-white text-zinc-900 antialiased selection:bg-teal-100">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .he-serif { font-family: "Frank Ruhl Libre", serif; }
        .ui-sans { font-family: Inter, system-ui, sans-serif; }
      `}</style>

      <div className="max-w-[720px] mx-auto h-full overflow-hidden flex flex-col">
        {/* Header stays outside the scroller so the i-button does not jump */}
        <header className="px-6 pt-8 pb-5 ui-sans shrink-0 z-10 bg-white">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goHome}
              aria-label={ui.backToList}
              className="flex items-center gap-3 min-w-0 text-left appearance-none bg-transparent p-0 m-0 border-0 font-[inherit] text-inherit"
            >
              <div className="h-9 w-9 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-semibold text-[15px]">ש</div>
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight leading-none">Shacharis</h1>
                <p className="text-[13px] text-zinc-500 mt-1 font-medium">{ui.tagline}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={showAbout ? closeAbout : openAbout}
              aria-label={ABOUT_COPY[lang].aboutLink}
              aria-pressed={showAbout}
              className="group shrink-0 h-9 w-9 flex items-center justify-center appearance-none bg-transparent p-0 m-0 border-0"
            >
              <span className={`h-7 w-7 rounded-full border flex items-center justify-center text-[13px] italic font-serif leading-none group-active:bg-zinc-50 ${
                showAbout ? 'border-zinc-400 text-zinc-600' : 'border-zinc-300 text-zinc-400'
              }`}>
                i
              </span>
            </button>
          </div>
        </header>

        <main
          ref={mainRef}
          className={`flex-1 flex flex-col min-h-0 ${
            selected !== null && !showAbout ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          {showAbout ? (
            <AboutScreen lang={lang} />
          ) : selected !== null && currentPrayer ? (
            <div
              className="flex-1 flex flex-col min-h-0"
              onTouchStart={handlePrayerTouchStart}
              onTouchEnd={handlePrayerTouchEnd}
            >
              <div ref={prayerScrollRef} className="flex-1 overflow-auto px-5 pb-[168px]">
                <div className="pt-1 pb-4 border-b border-zinc-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 text-[11px] tracking-widest text-[#0D9488] font-semibold uppercase ui-sans">
                      <span>{String(currentPrayer.id).padStart(2, '0')} / {String(TOTAL_PRAYERS).padStart(2, '0')}</span>
                      <span className="h-1 w-1 rounded-full bg-[#0D9488]/40 shrink-0"></span>
                      <span className="truncate">{currentPrayer.titleEn}</span>
                    </div>
                    <div
                      className="flex items-end gap-0.5 shrink-0 ui-sans"
                      role="radiogroup"
                      aria-label={ui.textSize}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      {([
                        { id: 'm' as const, px: 12, name: ui.textSizeM },
                        { id: 'l' as const, px: 15, name: ui.textSizeL },
                        { id: 'xl' as const, px: 18, name: ui.textSizeXl },
                      ]).map(({ id, px, name }) => {
                        const active = typeSize === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={name}
                            onClick={() => setTypeSize(id)}
                            className={`h-8 w-8 flex items-center justify-center rounded-md font-semibold leading-none transition-all ${
                              active ? 'bg-[#0D9488] text-white' : 'text-zinc-500 hover:bg-zinc-100'
                            }`}
                            style={{ fontSize: px }}
                          >
                            A
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <h2 className="he-serif mt-1 text-[15px] font-normal leading-snug text-zinc-500" dir="rtl">
                    {currentPrayer.titleHe}
                  </h2>
                </div>

                <div className="mt-6">
                  <HebrewDisplay
                    heDisplay={currentPrayer.he_display}
                    heTts={currentPrayer.he_tts}
                    localizedTranslation={currentPrayer[lang]}
                    activeTtsIndex={activeTtsIndex}
                    onWordClick={speakWord}
                    typeSize={typeSize}
                  />
                </div>

                <div className="mt-8 ui-sans">
                  <div
                    className="flex p-1 rounded-full bg-zinc-100"
                    role="tablist"
                    aria-label={`${ui.translation} / ${ui.transliteration}`}
                  >
                    {([
                      { mode: 'translation' as const, label: ui.translation },
                      { mode: 'translit' as const, label: ui.transliteration },
                    ]).map(({ mode, label }) => {
                      const active = belowHe === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setBelowHe(mode)}
                          className={`flex-1 h-10 rounded-full text-[13px] font-semibold transition-all ${
                            active ? 'bg-[#0D9488] text-white shadow-sm' : 'text-zinc-600'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {(['RU','NL','EN','FR'] as const).map((code) => {
                      const lower = code.toLowerCase() as Lang;
                      const active = lang === lower;
                      return (
                        <button
                          key={code}
                          onClick={() => setLang(lower)}
                          className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                            active ? 'bg-[#0D9488] text-white shadow-sm' : 'border border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 bg-white'
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                  {belowHe === 'translit' ? (
                    <div
                      className="mt-4 rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-zinc-700 italic whitespace-pre-wrap"
                      style={{ fontSize: TYPE_SCALE[typeSize].translit, lineHeight: 1.6 }}
                    >
                      {currentPrayer.translit}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-white border border-zinc-200 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                      <p
                        className="text-zinc-800 whitespace-pre-wrap"
                        style={{ fontSize: TYPE_SCALE[typeSize].translation, lineHeight: 1.7 }}
                      >
                        {currentPrayer[lang]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex gap-3 ui-sans">
                  <button
                    onClick={() => {
                      if (selected === null) return;
                      const prev = prevPrayerIndex(selected);
                      goToPrayer(prev);
                    }}
                    disabled={selected === null || prevPrayerIndex(selected) === null}
                    className={`flex-1 h-11 rounded-full font-medium text-[14px] border transition-all ${
                      selected === null || prevPrayerIndex(selected) === null
                        ? 'border-zinc-200 text-zinc-400 bg-zinc-50'
                        : 'bg-white border-[#0D9488] text-[#0D9488] hover:bg-teal-50'
                    }`}
                  >
                    {ui.previous}
                  </button>
                  <button
                    onClick={() => {
                      if (selected === null) return;
                      const next = nextPrayerIndex(selected);
                      if (next !== null) goToPrayer(next);
                    }}
                    disabled={selected === null || nextPrayerIndex(selected) === null}
                    className={`flex-1 h-11 rounded-full font-medium text-[14px] transition-all ${
                      selected === null || nextPrayerIndex(selected) === null
                        ? 'bg-zinc-100 text-zinc-400'
                        : 'bg-[#0D9488] text-white hover:bg-teal-700 shadow-sm'
                    }`}
                  >
                    {ui.next}
                  </button>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] ui-sans z-20">
                <div className="max-w-[720px] mx-auto px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={handlePlayPause}
                        className="h-11 w-11 rounded-full bg-[#0D9488] text-white flex items-center justify-center hover:bg-teal-700 active:scale-95 transition shadow-sm shrink-0"
                        aria-label={isPlaying ? ui.pause : ui.play}
                      >
                        {isPlaying ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="4" height="14" rx="1"/><rect x="13" y="5" width="4" height="14" rx="1"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-[2px]"><path d="M7 5.5c0-1.2 1.3-1.9 2.3-1.1l9 7c.8.6.8 1.8 0 2.4l-9 7c-1 .7-2.3 0-2.3-1.2v-14z"/></svg>
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-none">{ui.listen}</div>
                        <div className="text-[11px] text-zinc-500 mt-1 truncate">{currentPrayer.titleEn} • he-IL 0.50×</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-zinc-600 tabular-nums">{formatTime(currentSec)} / {formatTime(durationSec || 0)}</div>
                  </div>
                  <div className="mt-3 h-[6px] w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D9488] rounded-full transition-all duration-150" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {selected === null && !showAbout && (
            <div className="px-4 pt-2 pb-10 ui-sans">
              <div className="px-2 mb-4">
                <p className="text-[13px] text-zinc-500 leading-5">{ui.selectPrayer.replace('{n}', String(TOTAL_PRAYERS))}</p>
              </div>
            <div className="space-y-2.5">
              {prayers.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => goToPrayer(idx)}
                  className={`w-full text-left bg-white border rounded-2xl px-4 py-4 flex items-center justify-between hover:shadow-sm transition-all group ${
                    selected === idx ? 'border-[#0D9488] bg-teal-50/40 shadow-sm' : 'border-zinc-200 hover:border-[#0D9488]/40'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 ${selected === idx ? 'bg-[#0D9488] text-white' : 'bg-zinc-100 group-hover:bg-teal-50 text-zinc-600 group-hover:text-[#0D9488]'}`}>
                      {p.id}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[15px] leading-tight truncate">{p.titleEn}</div>
                      <div className="he-serif text-right text-[13px] text-zinc-500 mt-1" dir="rtl">{p.titleHe}</div>
                    </div>
                  </div>
                  <div className={`shrink-0 ml-3 ${selected === idx ? 'text-[#0D9488]' : 'text-zinc-300 group-hover:text-[#0D9488]'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </button>
              ))}
            </div>
              <div className="mt-8 px-2 text-[11px] text-zinc-400 leading-4">
                {ui.footer}
              </div>
              {showEnvelope && !showSplash && (
                <SupportEnvelope
                  onOpen={openAbout}
                  onDismiss={dismissEnvelope}
                  dismissLabel={ui.dismiss}
                  noteLabel={ui.envelope}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
 
