import { useState, useEffect, useRef } from 'react';
import SplashScreen from './components/SplashScreen';

type Lang = 'ru' | 'nl' | 'en' | 'fr';
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
    he_display: "מוֹדֶה / מוֹדָה אֲנִי לְפָנֶיךָ, מֶלֶךְ חַי וְקַיָּם,\nשֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
    he_tts: "מוֹדֶה מוֹדָה אֲנִי לְפָנֶיךָ, מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
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
  he_tts: "רֵאשִׁית חָכְמָה יִרְאַת אֲדֹנָי, שֵׂכֶל טוֹב לְכָל־עֹשֵׂיהֶם, תְּהִלָּתוֹ עוֹמֶדֶת לָעַד.\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.",
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
    titleEn: "Veahavta Lereacha Kamocha",
    titleHe: "וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ",
    he_display: "הֲרֵינִי מְקַבֵּל עַל עַצְמִי מִצְוַת עֲשֵׂה שֶׁל וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ.",
    he_tts: "הֲרֵינִי מְקַבֵּל עַל עַצְמִי מִצְוַת עֲשֵׂה שֶׁל וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ.",
    translit: "Hareini mekabel al atzmi mitzvat aseh shel ve'ahavta lere'acha kamocha.",
    ru: "Вот, я принимаю на себя заповедь Торы: люби ближнего своего, как самого себя.",
    nl: "Zie, ik neem op mij het gebod van: heb je naaste lief als jezelf.",
    en: "Behold, I accept upon myself the positive commandment of: you shall love your fellow as yourself.",
    fr: "Me voici, j'accepte sur moi le commandement positif de: tu aimeras ton prochain comme toi-même."
},
{
  id: 5,
  titleEn: "Netilat Yadayim",
  titleHe: "נְטִילַת יָדַיִם",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ\nבְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָיִם.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ\nבְּמִצְוֹתָיו, וְצִוָּנוּ עַל נְטִילַת יָדָיִם.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher kidshanu bemitzvotav vetzivanu al netilat yadayim.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями Своими и повелевший нам омовение рук.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons geboden heeft over het wassen van de handen.",
  en: "Blessed are You, Lord our God, King of the universe, Who has sanctified us with His commandments and commanded us concerning washing of the hands.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous a sanctifiés par Ses commandements et nous a ordonné le lavage des mains."
},
{
  id: 6,
  titleEn: "Asher Yatzar",
  titleHe: "אֲשֶׁר יָצַר",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת־הָאָדָם\nבְּחָכְמָה, וּבָרָא בוֹ נְקָבִים נְקָבִים, חֲלוּלִים חֲלוּלִים, גָּלוּי\nוְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ, שֶׁאִם יִפָּתַח אֶחָד מֵהֶם, אוֹ\nיִסָּתֵם אֶחָד מֵהֶם, אִי אֶפְשָׁר לְהִתְקַיֵּם וְלַעֲמוֹד לְפָנֶיךָ.\nבָּרוּךְ אַתָּה יְיָ, רוֹפֵא כָל־בָּשָׂר, וּמַפְלִיא לַעֲשׂוֹת.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת־הָאָדָם\nבְּחָכְמָה, וּבָרָא בוֹ נְקָבִים נְקָבִים, חֲלוּלִים חֲלוּלִים, גָּלוּי\nוְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ, שֶׁאִם יִפָּתַח אֶחָד מֵהֶם, אוֹ\nיִסָּתֵם אֶחָד מֵהֶם, אִי אֶפְשָׁר לְהִתְקַיֵּם וְלַעֲמוֹד לְפָנֶיךָ.\nבָּרוּךְ אַתָּה יְיָ, רוֹפֵא כָל־בָּשָׂר, וּמַפְלִיא לַעֲשׂוֹת.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher yatzar et ha'adam bechochmah uvara vo nekavim nekavim chalulim chalulim, galui veyadua lifnei chisei chevodecha she'im yipate'ach echad mehem o yisatem echad mehem i efshar lehitkayem vela'amod lefanecha afilu sha'ah achat. Baruch atah Adonai, rofeh chol basar umafli la'asot.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, Который сотворил человека мудростью и создал в нем множество отверстий и полостей. Открыто и известно пред престолом славы Твоей, что если откроется одно из них или закупорится одно — невозможно существовать и стоять пред Тобой даже час. Благословен Ты, Господь, Врач всякой плоти и Творец чудес.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die de mens met wijsheid heeft gevormd en in hem vele openingen en holten heeft geschapen. Het is bekend voor Uw troon dat als één ervan open zou gaan of verstopt zou raken, het onmogelijk zou zijn te bestaan. Gezegend bent U, Eeuwige, Die alle vlees geneest en wonderlijk handelt.",
  en: "Blessed are You, Lord our God, King of the universe, Who formed man with wisdom and created within him many openings and cavities. It is revealed before Your throne that if one of them were to be opened or blocked, it would be impossible to exist. Blessed are You, Lord, Who heals all flesh and acts wondrously.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui as formé l’homme avec sagesse et as créé en lui de nombreuses ouvertures et cavités. Il est révélé devant Ton trône que si l’une d’elles s’ouvrait ou se bouchait, il serait impossible de subsister. Béni sois-Tu, Éternel, qui guéris toute chair et opères des merveilles."
},
{
  id: 7,
  titleEn: "Elohai Neshama",
  titleHe: "אֱלֹהַי נְשָׁמָה",
  he_display: "אֱלֹהַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּה בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי, וּלְהַחֲזִירָהּ בִּי לְעָתִיד לָבוֹא. כָּל־זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי, / מוֹדֶה / מוֹדָה / אֲנִי לְפָנֶיךָ, יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, רִבּוֹן כָּל־הַמַּעֲשִׂים, אֲדוֹן כָּל־הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר נְשָׁמוֹת לַמֵּתִים.",
  he_tts: "אֱלֹהַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּה בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי, וּלְהַחֲזִירָהּ בִּי לְעָתִיד לָבוֹא. כָּל־זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי, מוֹדֶה אֲנִי לְפָנֶיךָ, יְיָ אֱלֹהַי וֵאלֹהֵי אֲבוֹתַי, רִבּוֹן כָּל־הַמַּעֲשִׂים, אֲדוֹן כָּל־הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה יְיָ, הַמַּחֲזִיר נְשָׁמוֹת לַמֵּתִים.",
  translit: "Elohai, neshamah shenatata bi tehorah hi. Atah veratah, atah yetzartah, atah nefachtah bi, ve'atah meshamrah bekirbi, ve'atah atid litlah mimeni, ulehachazirah bi le'atid lavo. Kol-zman shehaneshamah bekirbi, modeh/moda ani lefanecha, Adonai Elohai velohei avotai, Ribbon kol-hama'asim, Adon kol-haneshamot. Baruch atah Adonai, hamachazir neshamot lametim.",
  ru: "Бог мой, душа, которую Ты дал мне, чиста. Ты сотворил её, Ты создал её, Ты вдохнул её в меня, и Ты хранишь её во мне, и Ты заберёшь её у меня и возвратишь мне её в грядущем. Всё время, пока душа во мне, благодарю Тебя, Господь, Бог мой и Бог отцов моих, Владыка всех творений, Господин всех душ. Благословен Ты, Господь, возвращающий души умершим.",
  nl: "Mijn God, de ziel die U in mij hebt gegeven is zuiver. U hebt haar geschapen, gevormd, in mij geblazen, U bewaart haar in mij, en U zult haar van mij nemen en in de toekomst aan mij teruggeven. Zolang de ziel in mij is, dank ik U, Eeuwige, mijn God en God van mijn voorouders. Gezegend bent U, Eeuwige, Die de zielen terugbrengt naar de doden.",
  en: "My God, the soul You placed within me is pure. You created it, You formed it, You breathed it into me, You preserve it within me, and You will take it from me and restore it to me in the time to come. As long as the soul is within me, I give thanks to You, Lord my God and God of my ancestors, Master of all works, Lord of all souls. Blessed are You, Lord, Who restores souls to the dead.",
  fr: "Mon Dieu, l’âme que Tu as mise en moi est pure. Tu l’as créée, Tu l’as formée, Tu l’as insufflée en moi, Tu la gardes en moi, Tu la reprendras de moi et me la rendras dans le futur. Tant que l’âme est en moi, je Te rends grâce, Éternel, mon Dieu et Dieu de mes pères, Maître de toutes les œuvres, Seigneur de toutes les âmes. Béni sois-Tu, Éternel, qui restitues les âmes aux morts."
},
{
  id: 8,
  titleEn: "Birchot HaTorah",
  titleHe: "בִּרְכוֹת הַתּוֹרָה",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ\nבְּמִצְוֹתָיו, וְצִוָּנוּ לַעֲסוֹק בְּדִבְרֵי תוֹרָה.\nוְהַעֲרֵב נָא יְיָ אֱלֹהֵינוּ אֶת־דִּבְרֵי תוֹרָתְךָ בְּפִינוּ, וּבְפִי עַמְּךָ\nבֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ, וְצֶאֱצָאֵי עַמְּךָ בֵּית\nיִשְׂרָאֵל, כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ, וְלוֹמְדֵי תוֹרָתְךָ לִשְׁמָהּ.\nבָּרוּךְ אַתָּה יְיָ, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל־\nהָעַמִּים, וְנָתַן לָנוּ אֶת־תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְיָ, נוֹתֵן הַתּוֹרָה.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ\nבְּמִצְוֹתָיו, וְצִוָּנוּ לַעֲסוֹק בְּדִבְרֵי תוֹרָה.\nוְהַעֲרֵב נָא יְיָ אֱלֹהֵינוּ אֶת־דִּבְרֵי תוֹרָתְךָ בְּפִינוּ, וּבְפִי עַמְּךָ\nבֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ, וְצֶאֱצָאֵי עַמְּךָ בֵּית\nיִשְׂרָאֵל, כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ, וְלוֹמְדֵי תוֹרָתְךָ לִשְׁמָהּ.\nבָּרוּךְ אַתָּה יְיָ, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל.\nבָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל־\nהָעַמִּים, וְנָתַן לָנוּ אֶת־תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְיָ, נוֹתֵן הַתּוֹרָה.",
  translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher kidshanu bemitzvotav vetzivanu la'asok bedivrei Torah. Veha'arev na Adonai Eloheinu et-divrei Toratecha befineu uvfi amcha beit Yisrael, venihyeh anachnu vetze'etza'einu, vetze'etza'ei amcha beit Yisrael, kulana yode'ei shemecha, velomdei Toratecha lishmah. Baruch atah Adonai, hamelamed Torah le'amo Yisrael. Baruch atah Adonai Eloheinu Melech ha'olam, asher bachar banu mikol-ha'amim, venatan lanu et-Torato. Baruch atah Adonai, noten haTorah.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями и повелевший нам заниматься словами Торы. Сделай же, Господь, Бог наш, приятными слова Торы Твоей в устах наших и в устах народа Твоего, дома Израиля, и будем мы и потомки наши и потомки народа Твоего, дома Израиля, все знающими Имя Твоё и изучающими Тору Твою во имя её. Благословен Ты, Господь, обучающий Торе народ Свой Израиль. Благословен Ты, Господь, Бог наш, Царь мира, избравший нас из всех народов и давший нам Тору Свою. Благословен Ты, Господь, дающий Тору.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons bevolen heeft ons bezig te houden met de woorden van de Tora. Maak alstublieft de woorden van Uw Tora zoet in onze mond en in de mond van Uw volk Israël, en laten wij en onze nakomelingen en de nakomelingen van Uw volk Israël allen Uw Naam kennen en Uw Tora leren omwille van haarzelf. Gezegend bent U, Eeuwige, Die Tora onderwijst aan Zijn volk Israël. Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons koos uit alle volken en ons Zijn Tora gaf. Gezegend bent U, Eeuwige, Gever van de Tora.",
  en: "Blessed are You, Lord our God, King of the universe, Who sanctified us with His commandments and commanded us to engage in the words of Torah. Please, Lord our God, make the words of Your Torah sweet in our mouth and in the mouth of Your people Israel, and may we and our offspring and the offspring of Your people Israel all know Your Name and study Your Torah for its own sake. Blessed are You, Lord, Who teaches Torah to His people Israel. Blessed are You, Lord our God, King of the universe, Who chose us from all peoples and gave us His Torah. Blessed are You, Lord, Giver of the Torah.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous a sanctifiés par Ses commandements et nous a ordonné de nous adonner aux paroles de la Torah. Rends agréables, Éternel notre Dieu, les paroles de Ta Torah dans notre bouche et dans celle de Ton peuple Israël, et que nous et notre descendance et la descendance de Ton peuple Israël connaissions tous Ton Nom et étudiions Ta Torah pour elle-même. Béni sois-Tu, Éternel, qui enseignes la Torah à Son peuple Israël. Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous as choisis parmi tous les peuples et nous as donné Sa Torah. Béni sois-Tu, Éternel, Donneur de la Torah."
},
{
  id: 9,
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
  id: 10,
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
  id: 11,
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
  id: 12,
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
  id: 13,
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
  id: 14,
  titleEn: "She'asani BeTzalmo",
  titleHe: "שֶׁעָשַׂנִי בְּצַלְמוֹ",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי בְּצַלְמוֹ.\n[Reform inclusive form]",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי בְּצַלְמוֹ.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asani betzalmo.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что создал меня по образу Своему.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die mij naar Zijn beeld gemaakt heeft.",
  en: "Blessed are You, Lord our God, King of the universe, Who made me in His image.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui m'a fait à Son image."
},
{
  id: 15,
  titleEn: "She'asani Yisrael",
  titleHe: "שֶׁעָשַׂנִי יִשְׂרָאֵל",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי יִשְׂרָאֵל.\n[Reform replacement for 'who did not make me a non-Jew']",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי יִשְׂרָאֵל.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asani Yisrael.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что создал меня Исраэлем.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die mij tot Israëliet gemaakt heeft.",
  en: "Blessed are You, Lord our God, King of the universe, Who made me an Israelite.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui m'a fait Israël."
},
{
  id: 16,
  titleEn: "She'asani Ben / Bat / Chorin",
  titleHe: "שֶׁעָשַׂנִי בֶּן / בַּת / חוֹרִין",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי / בֶן- / בַּת- / חוֹרִין.\n[/ ben / bat / chorin - inclusive form: son/daughter of freedom. Replaces 'who did not make me a slave']",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשַׂנִי בֶן־חוֹרִין.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asani ben/bat/chorin.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что создал меня свободным человеком.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die mij als een vrij mens gemaakt heeft.",
  en: "Blessed are You, Lord our God, King of the universe, Who made me a free person.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui m'a fait une personne libre."
},
{
  id: 17,
  titleEn: "She'asa Li Kol Tzorki",
  titleHe: "שֶׁעָשָׂה לִי כָּל צָרְכִּי",
  he_display: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִי כָּל־צָרְכִּי.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה לִי כָּל־צָרְכִּי.",
  translit: "Baruch atah Adonai Eloheinu melech ha'olam, she'asa li kol-tzorki.",
  ru: "Благословен Ты, Господь, Бог наш, Царь мира, что восполнил все нужды мои.",
  nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die voorziet in al mijn behoeften.",
  en: "Blessed are You, Lord our God, King of the universe, Who provides for all my needs.",
  fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, qui pourvoit à tous mes besoins."
},
{
  id: 18,
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
  id: 19,
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
  id: 20,
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
  id: 21,
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
  id: 22,
  titleEn: "Yehi Ratzon Milfanecha veGomel Chasadim Tovim",
  titleHe: "יְהִי רָצוֹן מִלְּפָנֶיךָ - גּוֹמֵל חֲסָדִים טוֹבִים",
  he_display: "[Inclusive form kept as in this edition: God of our fathers and our mothers]\nוִיהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ, שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ וְדַבְּקֵנוּ בְּמִצְוֹתֶיךָ, וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא, וְלֹא לִידֵי עֲבֵירָה וְעָוֹן, וְלֹא לִידֵי נִסָּיוֹן, וְלֹא לִידֵי בִזָּיוֹן, וְאַל תַּשְׁלֶט־בָּנוּ יֵצֶר הָרַע, וְהַרְחִיקֵנוּ מֵאָדָם רָע וּמֵחָבֵר רָע, וְדַבְּקֵנוּ בְּיֵצֶר הַטּוֹב וּבְמַעֲשִׂים טוֹבִים, וְכוֹף אֶת־יִצְרֵנוּ לְהִשְׁתַּעְבֶּד־לָךְ, וּתְנֵנוּ הַיּוֹם, וּבְכָל־יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל־רוֹאֵינוּ וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים. בָּרוּךְ אַתָּה יְיָ, גּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל.",
  he_tts: "וִיהִי רָצוֹן מִלְּפָנֶיךָ יְיָ אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ וְאִמּוֹתֵינוּ, שֶׁתַּרְגִּילֵנוּ בְּתוֹרָתֶךָ וְדַבְּקֵנוּ בְּמִצְוֹתֶיךָ, וְאַל תְּבִיאֵנוּ לֹא לִידֵי חֵטְא, וְלֹא לִידֵי עֲבֵירָה וְעָוֹן, וְלֹא לִידֵי נִסָּיוֹן, וְלֹא לִידֵי בִזָּיוֹן, וְאַל תַּשְׁלֶט־בָּנוּ יֵצֶר הָרַע, וְהַרְחִיקֵנוּ מֵאָדָם רָע וּמֵחָבֵר רָע, וְדַבְּקֵנוּ בְּיֵצֶר הַטּוֹב וּבְמַעֲשִׂים טוֹבִים, וְכוֹף אֶת־יִצְרֵנוּ לְהִשְׁתַּעְבֶּד־לָךְ, וּתְנֵנוּ הַיּוֹם, וּבְכָל־יוֹם לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל־רוֹאֵינוּ וְתִגְמְלֵנוּ חֲסָדִים טוֹבִים. בָּרוּךְ אַתָּה יְיָ, גּוֹמֵל חֲסָדִים טוֹבִים לְעַמּוֹ יִשְׂרָאֵל.",
  translit: "Vihi ratzon milfanecha Adonai Eloheinu velohei avoteinu ve'imoteinu, shetargilenu beToratecha vedabkenu bemitzvotecha, ve'al tevi'enu lo lidei chet, velo lidei avera va'avon, velo lidei nisayon, velo lidei vizayon, ve'al tashlet-banu yetzer hara, veharchikenu me'adam ra umechaver ra, vedabkenu beyetzer hatov uvma'asim tovim, vechof et-yitzrenu lehishta'abed-lach, utnenu hayom uvchol-yom lechen ulechesed ulerachamim be'einecha uv'einei chol-ro'einu vetigmilenu chasadim tovim. Baruch atah Adonai, gomel chasadim tovim le'amo Yisrael.",
  ru: "Да будет воля Твоя, Господь, Бог наш и Бог отцов наших и матерей наших, приучить нас к Торе Твоей и приблизить к заповедям Твоим. И не приводи нас ни к греху, ни к проступку, ни к преступлению, ни к испытанию, ни к позору, и не давай злому началу властвовать над нами, и удали нас от дурного человека и от дурного товарища, и прилепи нас к доброму началу и к добрым делам, и склони волю нашу служить Тебе, и дай нам сегодня и каждый день обрести милость и благоволение и милосердие в глазах Твоих и в глазах всех видящих нас, и воздай нам добрыми милостями. Благословен Ты, Господь, воздающий добрыми милостями народу Своему Исраэлю.",
  nl: "Moge het Uw wil zijn, Eeuwige, onze God en God van onze vaders en onze moeders, dat U ons vertrouwd maakt met Uw Tora en ons hecht aan Uw geboden. Breng ons niet tot zonde, overtreding, ongerechtigheid, beproeving of schande, en laat de kwade neiging niet over ons heersen. Verwijder ons van een slecht mens en een slechte vriend, en hecht ons aan de goede neiging en aan goede daden, en dwing onze neiging om U te dienen. En geef ons vandaag en elke dag genade, gunst en barmhartigheid in Uw ogen en in de ogen van allen die ons zien, en bewijs ons goede weldaden. Gezegend bent U, Eeuwige, Die goede weldaden bewijst aan Zijn volk Israël.",
  en: "May it be Your will, Lord our God and God of our fathers and our mothers, to accustom us to Your Torah and cleave us to Your commandments. Do not bring us to sin, transgression, iniquity, trial or disgrace, and do not let the evil inclination rule over us. Keep us far from an evil person and an evil companion, cleave us to the good inclination and to good deeds, and subdue our inclination to be subservient to You. Grant us today and every day grace, kindness and mercy in Your eyes and in the eyes of all who see us, and bestow upon us good kindnesses. Blessed are You, Lord, Who bestows good kindnesses upon His people Israel.",
  fr: "Que ce soit Ta volonté, Éternel, notre Dieu et Dieu de nos pères et de nos mères, de nous habituer à Ta Torah et de nous attacher à Tes commandements. Ne nous amène pas à la faute, à la transgression, à l'iniquité, à l'épreuve ni à la honte, et ne laisse pas le mauvais penchant dominer sur nous. Éloigne-nous de l'homme mauvais et du mauvais compagnon, attache-nous au bon penchant et aux bonnes œuvres, et soumets notre penchant à Te servir. Accorde-nous aujourd'hui et chaque jour grâce, bienveillance et miséricorde à Tes yeux et aux yeux de tous ceux qui nous voient, et comble-nous de bonnes grâces. Béni sois-Tu, Éternel, qui comble Son peuple Israël de bonnes grâces."
},
{
  id: 23,
  titleEn: "Baruch Ata HaEl HaAv HaRachaman - Melech Mehulal BaTishbachot",
  titleHe: "בָּרוּךְ אַתָּה יְיָ הָאֵל הָאָב הָרַחֲמָן - מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת",
  he_display: "[One kisses the tzitzit, lets them go and sits down]\nבָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הָאֵל הַאָב הָרַחֲמָן, הַמְהֻלָּל בְּפִי עַמּוֹ, מְשֻׁבָּח וּמְפֹאָר בִּלְשׁוֹן חֲסִידָיו וַעֲבָדָיו, וּבְשִׁירֵי דָוִד עַבְדָּךְ נְהַלֶּלְךָ יְיָ אֱלֹהֵינוּ בְּשְׁבָחוֹת וּבְזִמְרוֹת, נְגַדֵּל וּנְשַׁבֵּחַ וּנְפָאֵר וּנְזַכִּיר שְׁמָךְ וְנַמְלִיכֶךָ מִלְּבָבֵנוּ אֱלֹהֵינוּ, יָחִיד, חֵי הָעוֹלָמִים, מֶלֶךְ מְשֻׁבָּח וּמְפֹאָר עֲדֵי עַד שְׁמָךְ הַגָּדוֹל. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת.",
  he_tts: "בָּרוּךְ אַתָּה יְיָ, אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הָאֵל הַאָב הָרַחֲמָן, הַמְהֻלָּל בְּפִי עַמּוֹ, מְשֻׁבָּח וּמְפֹאָר בִּלְשׁוֹן חֲסִידָיו וַעֲבָדָיו, וּבְשִׁירֵי דָוִד עַבְדָּךְ נְהַלֶּלְךָ יְיָ אֱלֹהֵינוּ בְּשְׁבָחוֹת וּבְזִמְרוֹת, נְגַדֵּל וּנְשַׁבֵּחַ וּנְפָאֵר וּנְזַכִּיר שְׁמָךְ וְנַמְלִיכֶךָ מִלְּבָבֵנוּ אֱלֹהֵינוּ, יָחִיד, חֵי הָעוֹלָמִים, מֶלֶךְ מְשֻׁבָּח וּמְפֹאָר עֲדֵי עַד שְׁמָךְ הַגָּדוֹל. בָּרוּךְ אַתָּה יְיָ, מֶלֶךְ מְהֻלָּל בַּתִּשְׁבָּחוֹת.",
  translit: "Baruch atah Adonai, Eloheinu melech ha'olam, HaEl HaAv HaRachaman, hamehulal befi amo, meshubach umefo'ar bilshon chasidav va'avadav, uveshirei David avdecha nehallelcha Adonai Eloheinu bishvachot uvizmerot, negadel uneshabeach unefa'er unezakir shimcha venamlichecha milvavenu, Eloheinu, yachid, chei ha'olamim, melech meshubach umefo'ar adei ad shimcha hagadol. Baruch atah Adonai, Melech mehulal batishbachot.",
  ru: "[Целуют цицит, отпускают их и садятся] Благословен Ты, Господь, Бог наш, Царь мира, Бог, Отец милосердный, восхваляемый устами народа Своего, прославляемый и превозносимый языком благочестивых и рабов Своих, и песнями Давида, раба Твоего, восхвалим Тебя, Господь, Бог наш, хвалами и песнопениями, будем возвеличивать, восхвалять, прославлять, вспоминать Имя Твое и провозглашать Тебя Царем от всего сердца нашего. Бог наш, Единственный, Живой вечно, Царь восхваляемый и прославляемый во веки веков Имя Твое великое. Благословен Ты, Господь, Царь, восхваляемый в хвалениях.",
  nl: "[Men kust de tsitsit, laat ze los en gaat zitten] Gezegend bent U, Eeuwige, onze God, Koning van de wereld, de God, de Vader, de Barmhartige, Die geloofd wordt in de mond van Zijn volk, geprezen en verheerlijkt door de tong van Zijn vromen en dienaren, en met de liederen van David, Uw dienaar, zullen wij U loven, Eeuwige, onze God, met lofzangen en psalmen, wij zullen U groot maken en prijzen en verheerlijken en Uw Naam gedenken en U als Koning uitroepen uit ons hart. Onze God, Enige, Levende der werelden, Koning, geprezen en verheerlijkt tot in eeuwigheid is Uw grote Naam. Gezegend bent U, Eeuwige, Koning, geroemd in lofprijzingen.",
  en: "[One kisses the tzitzit, lets them go and sits down] Blessed are You, Lord our God, King of the universe, the God, the Father, the Merciful One, Who is praised by the mouth of His people, exalted and glorified by the tongue of His pious ones and His servants, and with the songs of David Your servant we will praise You, Lord our God, with praises and psalms, we will exalt and praise and glorify and mention Your Name and proclaim You as King from our heart. Our God, the Only One, the Life of the worlds, King praised and glorified forever is Your great Name. Blessed are You, Lord, King praised with praises.",
  fr: "[On embrasse les tzitzit, on les relâche et on s'assoit] Béni sois-Tu, Éternel, notre Dieu, Roi de l'univers, le Dieu, le Père, le Miséricordieux, loué par la bouche de Son peuple, exalté et glorifié par la langue de Ses pieux et de Ses serviteurs, et par les chants de David Ton serviteur nous Te louerons, Éternel notre Dieu, par des louanges et des psaumes, nous T'exalterons, Te louerons, Te glorifierons, évoquerons Ton Nom et Te proclamerons Roi de tout notre cœur. Notre Dieu, l'Unique, le Vivant des mondes, Roi loué et glorifié à jamais est Ton grand Nom. Béni sois-Tu, Éternel, Roi loué dans les louanges."
}

];

const TOTAL_PRAYERS = prayers[prayers.length - 1].id;

type DisplayBlock = { type: 'instruction' | 'hebrew'; content: string };

function isInstructionLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('[') && trimmed.endsWith(']');
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

function HebrewDisplay({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {parseHeDisplay(text).map((block, index) =>
        block.type === 'instruction' ? (
          <p
            key={index}
            dir="ltr"
            className="ui-sans text-[15px] leading-6 text-zinc-500 italic text-left"
          >
            {block.content}
          </p>
        ) : (
          <p
            key={index}
            dir="rtl"
            lang="he"
            className="he-serif text-[26px] sm:text-[28px] leading-[1.75] text-zinc-900 text-right whitespace-pre-wrap break-words"
          >
            {block.content}
          </p>
        )
      )}
    </div>
  );
}

const DIVINE_NAME_FOR_TTS = /יְהוָה|יְהֹוָה|יהוה|יְיָ/g;

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showTranslit, setShowTranslit] = useState(false);
const [lang, setLang] = useState<Lang>(() => {
  try {
    const saved = localStorage.getItem('shacharis_lang') as Lang | null;
    return saved || 'en';
  } catch {
    return 'en';
  }
});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  const [showSplash, setShowSplash] = useState(true);

  const intervalRef = useRef<number | null>(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      if (selected < prayers.length - 1) goToPrayer(selected + 1);
      return;
    }

    if (edge === 'left' && dx > SWIPE_MIN_PX) {
      if (selected > 0) goToPrayer(selected - 1);
      else goToPrayer(null);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setProgress(0);
    setCurrentSec(0);
    setDurationSec(0);
    pausedAccumRef.current = 0;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }, [selected]);

  useEffect(() => {
  localStorage.setItem('shacharis_lang', lang);
}, [lang]);

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
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }

    if (synth.paused && utteranceRef.current) {
      synth.resume();
      setIsPlaying(true);
      startRef.current = Date.now() - pausedAccumRef.current * 1000;
      intervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startRef.current) / 1000;
        setCurrentSec(Math.min(elapsed, durationSec));
        setProgress(Math.min((elapsed / durationSec) * 100, 100));
      }, 120);
      return;
    }

    const prayer = prayers[selected];
    const ttsText = prayer.he_tts.replace(DIVINE_NAME_FOR_TTS, 'אֲדֹנָי');

    synth.cancel();
    const utter = new SpeechSynthesisUtterance(ttsText);
    utter.rate = 0.50;
    utter.pitch = 1;
    utter.lang = 'he-IL';

    const voices = synth.getVoices();
    const heVoice = voices.find(v => v.lang.toLowerCase().includes('he'));
    if (heVoice) utter.voice = heVoice;

    const estDuration = Math.max(4, Math.ceil(ttsText.length * 0.085));
    setDurationSec(estDuration);
    setCurrentSec(0);
    setProgress(0);
    startRef.current = Date.now();
    pausedAccumRef.current = 0;

    utter.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      setCurrentSec(estDuration);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      pausedAccumRef.current = 0;
    };
    utter.onerror = () => {
      setIsPlaying(false);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };

    utteranceRef.current = utter;
    synth.speak(utter);
    setIsPlaying(true);

    if (intervalRef.current) window.clearInterval(intervalRef.current);
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
  };

  const currentPrayer = selected !== null ? prayers[selected] : null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased selection:bg-teal-100">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .he-serif { font-family: "Frank Ruhl Libre", serif; }
        .ui-sans { font-family: Inter, system-ui, sans-serif; }
      `}</style>

      <div className="max-w-[720px] mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 pt-8 pb-5 ui-sans">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#0D9488] flex items-center justify-center text-white font-semibold text-[15px]">ש</div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight leading-none">Shacharis</h1>
              <p className="text-[13px] text-zinc-500 mt-1 font-medium">Shaharit • Morning Prayers</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col min-h-0">
          {selected !== null && currentPrayer ? (
            <div
              className="flex-1 flex flex-col min-h-0"
              onTouchStart={handlePrayerTouchStart}
              onTouchEnd={handlePrayerTouchEnd}
            >
              <div className="px-4 pt-2 pb-3 ui-sans sticky top-0 bg-white/90 backdrop-blur z-10 border-b border-zinc-50">
                <button
                  onClick={() => goToPrayer(null)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 py-1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M15 18l-6-6 6-6"/></svg>
                  Back to list
                </button>
              </div>

              <div className="flex-1 overflow-auto px-5 pb-[168px]">
                <div className="pt-3 pb-6 border-b border-zinc-100">
                  <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#0D9488] font-semibold uppercase ui-sans">
                    <span>{String(currentPrayer.id).padStart(2, '0')} / {String(TOTAL_PRAYERS).padStart(2, '0')}</span>
                    <span className="h-1 w-1 rounded-full bg-[#0D9488]/40"></span>
                    <span>{currentPrayer.titleEn}</span>
                  </div>
                  <h2 className="mt-3 text-[22px] font-semibold ui-sans leading-tight">{currentPrayer.titleEn}</h2>
                  <div className="he-serif text-[15px] text-zinc-500 mt-1" dir="rtl">{currentPrayer.titleHe}</div>
                </div>

                <div className="mt-7">
                  <HebrewDisplay text={currentPrayer.he_display} />
                </div>

                <div className="mt-8 ui-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold tracking-wide uppercase text-zinc-700">Transliteration</span>
                    <button
                      onClick={() => setShowTranslit(!showTranslit)}
                      className={`relative inline-flex h-[26px] w-[44px] items-center rounded-full transition-colors ${showTranslit ? 'bg-[#0D9488]' : 'bg-zinc-200'}`}
                      aria-pressed={showTranslit}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${showTranslit ? 'translate-x-[20px]' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {showTranslit && (
                    <div className="mt-3 rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-[14px] leading-6 text-zinc-700 italic">
                      {currentPrayer.translit}
                    </div>
                  )}
                </div>

                <div className="mt-8 ui-sans">
                  <div className="text-[13px] font-semibold tracking-wide uppercase text-zinc-700 mb-3">Translation</div>
                  <div className="flex gap-2 flex-wrap">
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
                  <div className="mt-4 rounded-2xl bg-white border border-zinc-200 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <p className="text-[15px] leading-7 text-zinc-800 whitespace-pre-wrap">
                      {lang === 'ru' && currentPrayer.ru}
                      {lang === 'nl' && currentPrayer.nl}
                      {lang === 'en' && currentPrayer.en}
                      {lang === 'fr' && currentPrayer.fr}
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex gap-3 ui-sans">
                  <button
                    onClick={() => selected !== null && selected > 0 && goToPrayer(selected - 1)}
                    disabled={selected === 0}
                    className={`flex-1 h-11 rounded-full font-medium text-[14px] border transition-all ${
                      selected === 0 ? 'border-zinc-200 text-zinc-400 bg-zinc-50' : 'bg-white border-[#0D9488] text-[#0D9488] hover:bg-teal-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => selected < prayers.length - 1 && goToPrayer(selected + 1)}
                    disabled={selected === prayers.length - 1}
                    className={`flex-1 h-11 rounded-full font-medium text-[14px] transition-all ${
                      selected === prayers.length - 1 ? 'bg-zinc-100 text-zinc-400' : 'bg-[#0D9488] text-white hover:bg-teal-700 shadow-sm'
                    }`}
                  >
                    Next
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
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="4" height="14" rx="1"/><rect x="13" y="5" width="4" height="14" rx="1"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-[2px]"><path d="M7 5.5c0-1.2 1.3-1.9 2.3-1.1l9 7c.8.6.8 1.8 0 2.4l-9 7c-1 .7-2.3 0-2.3-1.2v-14z"/></svg>
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold leading-none">Listen</div>
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

          {selected === null && (
            <div className="px-4 pt-2 pb-10 ui-sans">
              <div className="px-2 mb-4">
                <p className="text-[13px] text-zinc-500 leading-5">Select a prayer to read, listen and translate. All {TOTAL_PRAYERS} items in traditional order.</p>
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
                Text displayed with niqqud. Audio uses he-IL voice at 0.50x. Divine Name spoken as Adonai.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
