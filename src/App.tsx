import { useState, useEffect, useRef } from 'react';

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
    titleHe: "מוֹדֶה אֲנִי",
    he_display: "מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
    he_tts: "מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם, שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה, רַבָּה אֱמוּנָתֶךָ.",
    translit: "Modeh ani lefanecha Melech chai vekayam, shehechezarta bi nishmati bechemlah, rabbah emunatecha.",
    ru: "Благодарю Тебя, Царь живой и вечный, за то, что Ты по милости Своей возвратил мне душу мою. Велика вера в Тебя.",
    nl: "Ik dank U, levende en eeuwige Koning, dat U in genade mijn ziel in mij hebt teruggegeven. Groot is Uw trouw.",
    en: "I give thanks before You, Living and Eternal King, for You have mercifully restored my soul within me. Great is Your faithfulness.",
    fr: "Je Te rends grâce devant Toi, Roi vivant et éternel, car Tu m’as rendu mon âme avec miséricorde. Grande est Ta fidélité."
  },
  {
    id: 2,
    titleEn: "Reishis Chochma",
    titleHe: "רֵאשִׁית חָכְמָה",
    he_display: "רֵאשִׁית חָכְמָה יִרְאַת יְהוָה, שֵׂכֶל טוֹב לְכָל עֹשֵׂיהֶם, תְּהִלָּתוֹ עֹמֶדֶת לָעַד. בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.",
    he_tts: "רֵאשִׁית חָכְמָה יִרְאַת אֲדֹנָי, שֵׂכֶל טוֹב לְכָל עֹשֵׂיהֶם, תְּהִלָּתוֹ עֹמֶדֶת לָעַד. בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.",
    translit: "Reishit chochmah yir'at Adonai, sechel tov lechol oseihem, tehillato omedet la'ad. Baruch shem kevod malchuto le'olam va'ed.",
    ru: "Начало мудрости — трепет пред Господом; разум добрый у всех исполняющих их, хвала Его пребывает вовек. Благословенно славное имя Царства Его во веки веков.",
    nl: "Het begin van wijsheid is ontzag voor de Eeuwige, goed inzicht hebben allen die ze volbrengen, Zijn lof houdt stand voor eeuwig. Gezegend is de Naam van Zijn koninklijke glorie voor altijd.",
    en: "The beginning of wisdom is fear of the Lord, good understanding have all who do them, His praise endures forever. Blessed be the Name of His glorious kingdom forever and ever.",
    fr: "Le commencement de la sagesse est la crainte de l’Éternel, le bon sens est pour tous ceux qui les accomplissent, Sa louange subsiste à jamais. Béni soit le Nom de Son règne glorieux à tout jamais."
  },
  {
    id: 3,
    titleEn: "Torah Tziva",
    titleHe: "תּוֹרָה צִוָּה",
    he_display: "תּוֹרָה צִוָּה לָנוּ מֹשֶׁה מוֹרָשָׁה קְהִלַּת יַעֲקֹב.",
    he_tts: "תּוֹרָה צִוָּה לָנוּ מֹשֶׁה מוֹרָשָׁה קְהִלַּת יַעֲקֹב.",
    translit: "Torah tzivah lanu Moshe, morashah kehillat Ya'akov.",
    ru: "Тору заповедал нам Моше — наследие общины Яакова.",
    nl: "De Tora heeft Mosje ons geboden, een erfdeel van de gemeente van Jaäkov.",
    en: "The Torah Moshe commanded us is the heritage of the congregation of Yaakov.",
    fr: "La Torah que Moché nous a ordonnée est l’héritage de la communauté de Yaakov."
  },
  {
    id: 4,
    titleEn: "Veahavta Lreacha Kamocha",
    titleHe: "וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ",
    he_display: "הֲרֵינִי מְקַבֵּל עַל עַצְמִי מִצְוַת עֲשֵׂה שֶׁל וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ.",
    he_tts: "הֲרֵינִי מְקַבֵּל עַל עַצְמִי מִצְוַת עֲשֵׂה שֶׁל וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ.",
    translit: "Hareini mekabel al atzmi mitzvas aseh shel ve'ahavta lere'acha kamocha.",
    ru: "Вот, я принимаю на себя заповедь Торы: люби ближнего своего, как самого себя.",
    nl: "Zie, ik neem op mij het gebod van: heb je naaste lief als jezelf.",
    en: "Behold, I accept upon myself the positive commandment of: you shall love your fellow as yourself.",
    fr: "Me voici, j'accepte sur moi le commandement positif de: tu aimeras ton prochain comme toi-même."
  },
  {
    id: 5,
    titleEn: "Netilas Yadayim",
    titleHe: "נְטִילַת יָדַיִם",
    he_display: "בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל נְטִילַת יָדָיִם.",
    he_tts: "בָּרוּךְ אַתָּה אֲדֹנָי אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל נְטִילַת יָדָיִם.",
    translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher kidshanu bemitzvotav vetzivanu al netilat yadayim.",
    ru: "Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями Своими и повелевший нам омовение рук.",
    nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons geboden heeft over het wassen van de handen.",
    en: "Blessed are You, Lord our God, King of the universe, Who has sanctified us with His commandments and commanded us concerning washing of the hands.",
    fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous a sanctifiés par Ses commandements et nous a ordonné le lavage des mains."
  },
  {
    id: 6,
    titleEn: "Asher Yatzar",
    titleHe: "אֲשֶׁר יָצַר",
    he_display: "בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת הָאָדָם בְּחָכְמָה וּבָרָא בוֹ נְקָבִים נְקָבִים חֲלוּלִים חֲלוּלִים, גָּלוּי וְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ שֶׁאִם יִפָּתֵחַ אֶחָד מֵהֶם אוֹ יִסָּתֵם אֶחָד מֵהֶם אִי אֶפְשָׁר לְהִתְקַיֵּם וְלַעֲמֹד לְפָנֶיךָ אֲפִלּוּ שָׁעָה אֶחָת. בָּרוּךְ אַתָּה יְהוָה, רוֹפֵא כָל בָּשָׂר וּמַפְלִיא לַעֲשׂוֹת.",
    he_tts: "בָּרוּךְ אַתָּה אֲדֹנָי אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר יָצַר אֶת הָאָדָם בְּחָכְמָה וּבָרָא בוֹ נְקָבִים נְקָבִים חֲלוּלִים חֲלוּלִים, גָּלוּי וְיָדוּעַ לִפְנֵי כִסֵּא כְבוֹדֶךָ שֶׁאִם יִפָּתֵחַ אֶחָד מֵהֶם אוֹ יִסָּתֵם אֶחָד מֵהֶם אִי אֶפְשָׁר לְהִתְקַיֵּם וְלַעֲמֹד לְפָנֶיךָ אֲפִלּוּ שָׁעָה אֶחָת. בָּרוּךְ אַתָּה אֲדֹנָי, רוֹפֵא כָל בָּשָׂר וּמַפְלִיא לַעֲשׂוֹת.",
    translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher yatzar et ha'adam bechochmah uvara vo nekavim nekavim chalulim chalulim, galui veyadua lifnei chisei chevodecha she'im yipate'ach echad mehem o yisatem echad mehem i efshar lehitkayem vela'amod lefanecha afilu sha'ah achat. Baruch atah Adonai, rofeh chol basar umafli la'asot.",
    ru: "Благословен Ты, Господь, Бог наш, Царь мира, Который сотворил человека мудростью и создал в нем множество отверстий и полостей. Открыто и известно пред престолом славы Твоей, что если откроется одно из них или закупорится одно — невозможно существовать и стоять пред Тобой даже час. Благословен Ты, Господь, Врач всякой плоти и Творец чудес.",
    nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die de mens met wijsheid heeft gevormd en in hem vele openingen en holten heeft geschapen. Het is bekend voor Uw troon dat als één ervan open zou gaan of verstopt zou raken, het onmogelijk zou zijn te bestaan. Gezegend bent U, Eeuwige, Die alle vlees geneest en wonderlijk handelt.",
    en: "Blessed are You, Lord our God, King of the universe, Who formed man with wisdom and created within him many openings and cavities. It is revealed before Your throne that if one of them were to be opened or blocked, it would be impossible to exist. Blessed are You, Lord, Who heals all flesh and acts wondrously.",
    fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui as formé l’homme avec sagesse et as créé en lui de nombreuses ouvertures et cavités. Il est révélé devant Ton trône que si l’une d’elles s’ouvrait ou se bouchait, il serait impossible de subsister. Béni sois-Tu, Éternel, qui guéris toute chair et opères des merveilles."
  },
  {
    id: 7,
    titleEn: "Elokai Neshama",
    titleHe: "אֱלֹקַי נְשָׁמָה",
    he_display: "אֱלֹקַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּהּ בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי וּלְהַחֲזִירָהּ בִּי לֶעָתִיד לָבוֹא. כָּל זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי מוֹדֶה אֲנִי לְפָנֶיךָ, יְהוָה אֱלֹקַי וֵאלֹקֵי אֲבוֹתַי, רִבּוֹן כָּל הַמַּעֲשִׂים, אֲדוֹן כָּל הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה יְהוָה, הַמַּחֲזִיר נְשָׁמוֹת לִפְגָרִים מֵתִים.",
    he_tts: "אֱלֹקַי, נְשָׁמָה שֶׁנָּתַתָּ בִּי טְהוֹרָה הִיא. אַתָּה בְרָאתָהּ, אַתָּה יְצַרְתָּהּ, אַתָּה נְפַחְתָּהּ בִּי, וְאַתָּה מְשַׁמְּרָהּ בְּקִרְבִּי, וְאַתָּה עָתִיד לִטְּלָהּ מִמֶּנִּי וּלְהַחֲזִירָהּ בִּי לֶעָתִיד לָבוֹא. כָּל זְמַן שֶׁהַנְּשָׁמָה בְּקִרְבִּי מוֹדֶה אֲנִי לְפָנֶיךָ, אֲדֹנָי אֱלֹקַי וֵאלֹקֵי אֲבוֹתַי, רִבּוֹן כָּל הַמַּעֲשִׂים, אֲדוֹן כָּל הַנְּשָׁמוֹת. בָּרוּךְ אַתָּה אֲדֹנָי, הַמַּחֲזִיר נְשָׁמוֹת לִפְגָרִים מֵתִים.",
    translit: "Elokai, neshamah shenatata bi tehorah hi. Atah veratah, atah yetzartah, atah nefachtah bi, ve'atah meshamrah bekirbi, ve'atah atid litlah mimeni ulehachazirah bi le'atid lavo. Kol zeman shehaneshamah bekirbi modeh ani lefanecha, Adonai Elokai velohei avotai, Ribbon kol hama'asim, Adon kol haneshamot. Baruch atah Adonai, hamachazir neshamot lifgarim metim.",
    ru: "Бог мой, душа, которую Ты дал мне, чиста. Ты сотворил её, Ты создал её, Ты вдохнул её в меня, и Ты хранишь её во мне, и Ты заберёшь её у меня и возвратишь мне её в грядущем. Всё время, пока душа во мне, благодарю Тебя, Господь, Бог мой и Бог отцов моих, Владыка всех творений, Господин всех душ. Благословен Ты, Господь, возвращающий души в мёртвые тела.",
    nl: "Mijn God, de ziel die U in mij hebt gegeven is zuiver. U hebt haar geschapen, gevormd, in mij geblazen, U bewaart haar in mij, en U zult haar van mij nemen en in de toekomst aan mij teruggeven. Zolang de ziel in mij is, dank ik U, Eeuwige, mijn God en God van mijn voorouders. Gezegend bent U, Eeuwige, Die zielen terugbrengt in dode lichamen.",
    en: "My God, the soul You placed within me is pure. You created it, You formed it, You breathed it into me, You preserve it within me, and You will take it from me and restore it to me in the time to come. As long as the soul is within me, I give thanks to You, Lord my God and God of my ancestors, Master of all works, Lord of all souls. Blessed are You, Lord, Who restores souls to lifeless bodies.",
    fr: "Mon Dieu, l’âme que Tu as mise en moi est pure. Tu l’as créée, Tu l’as formée, Tu l’as insufflée en moi, Tu la gardes en moi, Tu la reprendras de moi et me la rendras dans le futur. Tant que l’âme est en moi, je Te rends grâce, Éternel, mon Dieu et Dieu de mes pères, Maître de toutes les œuvres, Seigneur de toutes les âmes. Béni sois-Tu, Éternel, qui restitues les âmes aux corps inanimés."
  },
  {
    id: 8,
    titleEn: "Birchos HaTorah",
    titleHe: "בִּרְכוֹת הַתּוֹרָה",
    he_display: "בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל דִּבְרֵי תוֹרָה.\nוְהַעֲרֵב נָא יְהוָה אֱלֹהֵינוּ אֶת דִּבְרֵי תוֹרָתְךָ בְּפִינוּ וּבְפִי עַמְּךָ בֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ וְצֶאֱצָאֵי עַמְּךָ בֵּית יִשְׂרָאֵל כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ וְלוֹמְדֵי תוֹרָתֶךָ לִשְׁמָהּ. בָּרוּךְ אַתָּה יְהוָה, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל.\nבָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל הָעַמִּים וְנָתַן לָנוּ אֶת תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְהוָה, נוֹתֵן הַתּוֹרָה.",
    he_tts: "בָּרוּךְ אַתָּה אֲדֹנָי אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ עַל דִּבְרֵי תוֹרָה. וְהַעֲרֵב נָא אֲדֹנָי אֱלֹהֵינוּ אֶת דִּבְרֵי תוֹרָתְךָ בְּפִינוּ וּבְפִי עַמְּךָ בֵּית יִשְׂרָאֵל, וְנִהְיֶה אֲנַחְנוּ וְצֶאֱצָאֵינוּ וְצֶאֱצָאֵי עַמְּךָ בֵּית יִשְׂרָאֵל כֻּלָּנוּ יוֹדְעֵי שְׁמֶךָ וְלוֹמְדֵי תוֹרָתֶךָ לִשְׁמָהּ. בָּרוּךְ אַתָּה אֲדֹנָי, הַמְלַמֵּד תּוֹרָה לְעַמּוֹ יִשְׂרָאֵל. בָּרוּךְ אַתָּה אֲדֹנָי אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל הָעַמִּים וְנָתַן לָנוּ אֶת תּוֹרָתוֹ. בָּרוּךְ אַתָּה אֲדֹנָי, נוֹתֵן הַתּוֹרָה.",
    translit: "Baruch atah Adonai Eloheinu Melech ha'olam, asher kidshanu bemitzvotav vetzivanu al divrei Torah. Veha'arev na Adonai Eloheinu et divrei Toratecha befineu uvfi amcha beit Yisrael, venihyeh anachnu vetze'etza'einu kulana yode'ei shemecha velomdei Toratecha lishmah. Baruch atah Adonai, hamelamed Torah le'amo Yisrael. Baruch atah Adonai Eloheinu Melech ha'olam, asher bachar banu mikol ha'amim venatan lanu et Torato. Baruch atah Adonai, noten haTorah.",
    ru: "Благословен Ты, Господь, Бог наш, Царь мира, освятивший нас заповедями и повелевший нам слова Торы. Сделай же, Господь, Бог наш, приятными слова Торы Твоей в устах наших и в устах народа Твоего, дома Израиля, и будем мы и потомки наши все знающими Имя Твоё и изучающими Тору Твою во имя её. Благословен Ты, Господь, обучающий Торе народ Свой Израиль. Благословен Ты, Господь, Бог наш, Царь мира, избравший нас из всех народов и давший нам Тору Свою. Благословен Ты, Господь, дающий Тору.",
    nl: "Gezegend bent U, Eeuwige, onze God, Koning van de wereld, Die ons geheiligd heeft met Zijn geboden en ons geboden heeft over de woorden van de Tora. Maak alstublieft de woorden van Uw Tora zoet in onze mond en in de mond van Uw volk Israël. Gezegend bent U, Eeuwige, Die Tora onderwijst aan Zijn volk Israël. Gezegend bent U, Eeuwige, Die ons koos uit alle volken en ons Zijn Tora gaf. Gezegend bent U, Eeuwige, Gever van de Tora.",
    en: "Blessed are You, Lord our God, King of the universe, Who sanctified us with His commandments and commanded us to engross ourselves in the words of Torah. Please, Lord our God, make the words of Your Torah sweet in our mouth and in the mouth of Your people Israel, and may we and our offspring all know Your Name and study Your Torah for its own sake. Blessed are You, Lord, Who teaches Torah to His people Israel. Blessed are You, Lord our God, King of the universe, Who chose us from all peoples and gave us His Torah. Blessed are You, Lord, Giver of the Torah.",
    fr: "Béni sois-Tu, Éternel, notre Dieu, Roi de l’univers, qui nous a sanctifiés par Ses commandements et nous a ordonné les paroles de la Torah. Rends agréables, Éternel notre Dieu, les paroles de Ta Torah dans notre bouche et dans celle de Ton peuple Israël, et que nous et notre descendance connaissions tous Ton Nom et étudiions Ta Torah pour elle-même. Béni sois-Tu, Éternel, qui enseignes la Torah à Son peuple Israël. Béni sois-Tu, Éternel, qui nous a choisis parmi tous les peuples et nous a donné Sa Torah. Béni sois-Tu, Éternel, Donneur de la Torah."
  },
  {
    id: 9,
    titleEn: "Yivarechecha",
    titleHe: "יְבָרֶכְךָ",
    he_display: "יְבָרֶכְךָ יְהוָה וְיִשְׁמְרֶךָ.\nיָאֵר יְהוָה פָּנָיו אֵלֶיךָ וִיחֻנֶּךָּ.\nיִשָּׂא יְהוָה פָּנָיו אֵלֶיךָ וְיָשֵׂם לְךָ שָׁלוֹם.",
    he_tts: "יְבָרֶכְךָ אֲדֹנָי וְיִשְׁמְרֶךָ. יָאֵר אֲדֹנָי פָּנָיו אֵלֶיךָ וִיחֻנֶּךָּ. יִשָּׂא אֲדֹנָי פָּנָיו אֵלֶיךָ וְיָשֵׂם לְךָ שָׁלוֹם.",
    translit: "Yevarechecha Adonai veyishmerecha. Ya'er Adonai panav elecha vichunecha. Yisa Adonai panav elecha veyasem lecha shalom.",
    ru: "Да благословит тебя Господь и сохранит тебя. Да озарит Господь лицо Своё для тебя и помилует тебя. Да обратит Господь лицо Своё к тебе и даст тебе мир.",
    nl: "Moge de Eeuwige je zegenen en je behoeden. Moge de Eeuwige Zijn aangezicht naar je doen lichten en je genadig zijn. Moge de Eeuwige Zijn aangezicht naar je verheffen en je vrede geven.",
    en: "May the Lord bless you and keep you. May the Lord make His face shine upon you and be gracious to you. May the Lord lift up His face to you and grant you peace.",
    fr: "Que l’Éternel te bénisse et te garde. Que l’Éternel fasse briller Sa face sur toi et t’accorde Sa grâce. Que l’Éternel lève Sa face vers toi et te donne la paix."
  },
  {
    id: 10,
    titleEn: "Eilu Devarim",
    titleHe: "אֵלּוּ דְבָרִים",
    he_display: "אֵלּוּ דְבָרִים שֶׁאֵין לָהֶם שִׁעוּר: הַפֵּאָה, וְהַבִּכּוּרִים, וְהָרֵאָיוֹן, וּגְמִילוּת חֲסָדִים, וְתַלְמוּד תּוֹרָה.\nאֵלּוּ דְבָרִים שֶׁאָדָם אוֹכֵל פֵּרוֹתֵיהֶם בָּעוֹלָם הַזֶּה וְהַקֶּרֶן קַיֶּמֶת לוֹ לָעוֹלָם הַבָּא: כִּבּוּד אָב וָאֵם, וּגְמִילוּת חֲסָדִים, וְהַשְׁכָּמַת בֵּית הַמִּדְרָשׁ שַׁחֲרִית וְעַרְבִית, וְהַכְנָסַת אוֹרְחִים, וּבִקּוּר חוֹלִים, וְהַכְנָסַת כַּלָּה, וּלְוָיַת הַמֵּת, וְעִיּוּן תְּפִלָּה, וַהֲבָאַת שָׁלוֹם בֵּין אָדָם לַחֲבֵרוֹ, וְתַלְמוּד תּוֹרָה כְּנֶגֶד כֻּלָּם.",
    he_tts: "אֵלּוּ דְבָרִים שֶׁאֵין לָהֶם שִׁעוּר: הַפֵּאָה, וְהַבִּכּוּרִים, וְהָרֵאָיוֹן, וּגְמִילוּת חֲסָדִים, וְתַלְמוּד תּוֹרָה. אֵלּוּ דְבָרִים שֶׁאָדָם אוֹכֵל פֵּרוֹתֵיהֶם בָּעוֹלָם הַזֶּה וְהַקֶּרֶן קַיֶּמֶת לוֹ לָעוֹלָם הַבָּא: כִּבּוּד אָב וָאֵם, וּגְמִילוּת חֲסָדִים, וְהַשְׁכָּמַת בֵּית הַמִּדְרָשׁ שַׁחֲרִית וְעַרְבִית, וְהַכְנָסַת אוֹרְחִים, וּבִקּוּר חוֹלִים, וְהַכְנָסַת כַּלָּה, וּלְוָיַת הַמֵּת, וְעִיּוּן תְּפִלָּה, וַהֲבָאַת שָׁלוֹם בֵּין אָדָם לַחֲבֵרוֹ, וְתַלְמוּד תּוֹרָה כְּנֶגֶד כֻּלָּם.",
    translit: "Eilu devarim she'ein lahem shiur: hape'ah, vehabikurim, vehare'ayon, ugmilut chasadim, vetalmud Torah. Eilu devarim she'adam ochel peroteihem ba'olam hazeh vehakeren kayemet lo la'olam haba: kibud av va'em, ugmilut chasadim, vehashkamat beit hamidrash shacharit ve'arvit, vehachnasat orchim, uvikur cholim, vehachnasat kalah, ulvayat hamet, ve'iyun tefillah, vahava'at shalom bein adam lachavero, vetalmud Torah keneged kulam.",
    ru: "Вот заповеди, не имеющие меры: край поля, первины, паломничество, добрые дела и изучение Торы. Вот заповеди, плоды которых человек вкушает в этом мире, а основа остаётся на мир грядущий: почитание отца и матери, добрые дела, ранний приход в дом учения утром и вечером, гостеприимство, посещение больных, помощь невесте, проводы умершего, сосредоточенность в молитве, примирение людей между собой — а изучение Торы равноценно всему.",
    nl: "Dit zijn de dingen zonder vaste maat: de hoek van het veld, de eerstelingen, de verschijning, weldadigheid en Tora-studie. Dit zijn dingen waarvan een mens de vruchten eet in deze wereld terwijl de hoofdsom blijft voor de Toekomende Wereld: eerbied voor vader en moeder, weldadigheid, vroeg naar het leerhuis gaan, gasten ontvangen, zieken bezoeken, een bruid verheugen, een dode begeleiden, concentratie in gebed, vrede stichten tussen mensen — en Tora-studie weegt op tegen alles.",
    en: "These are the things that have no prescribed measure: the corner of the field, the first fruits, the pilgrimage offering, acts of kindness, and Torah study. These are things whose fruits a person enjoys in this world while the principal remains for the World to Come: honoring father and mother, acts of kindness, early attendance at the house of study morning and evening, hospitality, visiting the sick, rejoicing a bride, escorting the dead, concentration in prayer, making peace between people — and Torah study is equal to them all.",
    fr: "Voici les choses qui n’ont pas de mesure: le coin du champ, les prémices, le pèlerinage, les actes de bonté et l’étude de la Torah. Voici celles dont l’homme savoure les fruits en ce monde tandis que le capital lui reste pour le monde à venir: honorer père et mère, actes de bonté, se rendre tôt à la maison d’étude matin et soir, accueillir les invités, visiter les malades, réjouir la mariée, accompagner le mort, concentration dans la prière, amener la paix entre les hommes — et l’étude de la Torah équivaut à tout."
  },
 {
    id: 11,
    titleEn: "Shema",
    titleHe: "שְׁמַע",
    he_display: `אֵל מֶלֶךְ נֶאֱמָן:\nשְׁמַע יִשְׂרָאֵל יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָד:\nבָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד:`,
    he_tts: `אֵל מֶלֶךְ נֶאֱמָן. שְׁמַע יִשְׂרָאֵל אֲדֹנָי אֱלֹהֵינוּ אֲדֹנָי אֶחָד. בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.`,
    translit: "El Melech Ne'eman: Shema Yisrael Adonai Eloheinu Adonai Echad. Baruch shem kevod malchuto le'olam va'ed.",
    ru: "Бог — Царь верный. Слушай, Израиль: Господь — Бог наш, Господь один. Благословенно славное имя царства Его во веки веков.",
    nl: "God is een betrouwbare Koning. Hoor, Israël: de Eeuwige is onze God, de Eeuwige is Eén. Gezegend is de Naam van Zijn heerlijke koninkrijk voor eeuwig en altijd.",
    en: "God is a faithful King. Hear, O Israel: The Lord is our God, the Lord is One. Blessed be the Name of His glorious kingdom for ever and ever.",
    fr: "Dieu est un Roi fidèle. Écoute, Israël: l’Éternel est notre Dieu, l’Éternel est Un. Béni soit le Nom de Son règne glorieux pour toujours et à jamais."
  },
  {
    id: 12,
    titleEn: "Ve'ahavta",
    titleHe: "וְאָהַבְתָּ",
    he_display: "וְאָהַבְתָּ אֵת יְהוָה אֱלֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.",
    he_tts: "וְאָהַבְתָּ אֵת אֲדֹנָי אֱלֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזֻזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.",
    translit: "Ve'ahavta et Adonai Elohecha bechol levavcha uvchol nafshecha uvchol me'odecha. Vehayu hadevarim ha'eileh asher Anochi metzavcha hayom al levavecha. Veshinantam levanecha vedibarta bam beshivtecha beveitecha uvlechtecha vaderech uvshochbecha uvkumecha. Ukshartam le'ot al yadecha vehayu letotafot bein einecha. Uchtavtam al mezuzot beitecha uvish'arecha.",
    ru: "И люби Господа, Бога твоего, всем сердцем твоим и всею душою твоею и всеми силами твоими. И будут слова эти, которые Я заповедую тебе сегодня, в сердце твоём. И повторяй их сыновьям твоим и говори о них, сидя в доме твоём и идя дорогою, и ложась и вставая. И повяжи их как знак на руку твою, и будут они украшением над глазами твоими. И напиши их на косяках дома твоего и на воротах твоих.",
    nl: "En je zult de Eeuwige, je God, liefhebben met heel je hart, heel je ziel en heel je vermogen. Deze woorden die Ik je vandaag gebied, zullen op je hart zijn. Prent ze je kinderen in en spreek erover als je in je huis zit en als je onderweg bent, als je neerligt en opstaat. Bind ze als een teken op je hand en ze zullen als voorhoofdsband tussen je ogen zijn. Schrijf ze op de deurposten van je huis en op je poorten.",
    en: "You shall love the Lord your God with all your heart, with all your soul, and with all your might. And these words which I command you today shall be upon your heart. You shall teach them thoroughly to your children and speak of them while you sit in your house, while you walk on the way, when you lie down and when you rise. You shall bind them as a sign upon your hand, and they shall be as frontlets between your eyes. You shall write them upon the doorposts of your house and upon your gates.",
    fr: "Tu aimeras l’Éternel, ton Dieu, de tout ton cœur, de toute ton âme et de toute ta force. Ces paroles que Je te commande aujourd’hui seront sur ton cœur. Tu les inculqueras à tes enfants et tu en parleras quand tu seras assis dans ta maison, quand tu marcheras en chemin, quand tu te coucheras et quand tu te lèveras. Tu les lieras comme un signe sur ta main et elles seront comme des fronteaux entre tes yeux. Tu les écriras sur les poteaux de ta maison et sur tes portes."
  },
  {
    id: 13,
    titleEn: "Vehaya Im Shamoa",
    titleHe: "וְהָיָה אִם שָׁמֹעַ",
    he_display: "וְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ אֶל מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם, לְאַהֲבָה אֶת יְהוָה אֱלֹהֵיכֶם וּלְעָבְדוֹ בְּכָל לְבַבְכֶם וּבְכָל נַפְשְׁכֶם. וְנָתַתִּי מְטַר אַרְצְכֶם בְּעִתּוֹ יוֹרֶה וּמַלְקוֹשׁ, וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ וְאָכַלְתָּ וְשָׂבָעְתָּ. הִשָּׁמְרוּ לָכֶם פֶּן יִפְתֶּה לְבַבְכֶם וְסַרְתֶּם וַעֲבַדְתֶּם אֱלֹהִים אֲחֵרִים וְהִשְׁתַּחֲוִיתֶם לָהֶם. וְחָרָה אַף יְהוָה בָּכֶם וְעָצַר אֶת הַשָּׁמַיִם וְלֹא יִהְיֶה מָטָר וְהָאֲדָמָה לֹא תִתֵּן אֶת יְבוּלָהּ וַאֲבַדְתֶּם מְהֵרָה מֵעַל הָאָרֶץ הַטֹּבָה אֲשֶׁר יְהוָה נֹתֵן לָכֶם. וְשַׂמְתֶּם אֶת דְּבָרַי אֵלֶּה עַל לְבַבְכֶם וְעַל נַפְשְׁכֶם וּקְשַׁרְתֶּם אֹתָם לְאוֹת עַל יֶדְכֶם וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֵיכֶם. וְלִמַּדְתֶּם אֹתָם אֶת בְּנֵיכֶם לְדַבֵּר בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּכְתַבְתָּם עַל מְזוּזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ. לְמַעַן יִרְבּוּ יְמֵיכֶם וִימֵי בְנֵיכֶם עַל הָאֲדָמָה אֲשֶׁר נִשְׁבַּע יְהוָה לַאֲבֹתֵיכֶם לָתֵת לָהֶם כִּימֵי הַשָּׁמַיִם עַל הָאָרֶץ.",
    he_tts: "וְהָיָה אִם שָׁמֹעַ תִּשְׁמְעוּ אֶל מִצְוֹתַי אֲשֶׁר אָנֹכִי מְצַוֶּה אֶתְכֶם הַיּוֹם, לְאַהֲבָה אֶת אֲדֹנָי אֱלֹהֵיכֶם וּלְעָבְדוֹ בְּכָל לְבַבְכֶם וּבְכָל נַפְשְׁכֶם. וְנָתַתִּי מְטַר אַרְצְכֶם בְּעִתּוֹ יוֹרֶה וּמַלְקוֹשׁ, וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ וְיִצְהָרֶךָ. וְנָתַתִּי עֵשֶׂב בְּשָׂדְךָ לִבְהֶמְתֶּךָ וְאָכַלְתָּ וְשָׂבָעְתָּ. הִשָּׁמְרוּ לָכֶם פֶּן יִפְתֶּה לְבַבְכֶם וְסַרְתֶּם וַעֲבַדְתֶּם אֱלֹהִים אֲחֵרִים וְהִשְׁתַּחֲוִיתֶם לָהֶם. וְחָרָה אַף אֲדֹנָי בָּכֶם וְעָצַר אֶת הַשָּׁמַיִם וְלֹא יִהְיֶה מָטָר וְהָאֲדָמָה לֹא תִתֵּן אֶת יְבוּלָהּ וַאֲבַדְתֶּם מְהֵרָה מֵעַל הָאָרֶץ הַטֹּבָה אֲשֶׁר אֲדֹנָי נֹתֵן לָכֶם. וְשַׂמְתֶּם אֶת דְּבָרַי אֵלֶּה עַל לְבַבְכֶם וְעַל נַפְשְׁכֶם וּקְשַׁרְתֶּם אֹתָם לְאוֹת עַל יֶדְכֶם וְהָיוּ לְטוֹטָפֹת בֵּין עֵינֵיכֶם. וְלִמַּדְתֶּם אֹתָם אֶת בְּנֵיכֶם לְדַבֵּר בָּם בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּכְתַבְתָּם עַל מְזוּזוֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ. לְמַעַן יִרְבּוּ יְמֵיכֶם וִימֵי בְנֵיכֶם עַל הָאֲדָמָה אֲשֶׁר נִשְׁבַּע אֲדֹנָי לַאֲבֹתֵיכֶם לָתֵת לָהֶם כִּימֵי הַשָּׁמַיִם עַל הָאָרֶץ.",
    translit: "Vehaya im shamoa tishme'u el mitzvotai asher anochi metzaveh etchem hayom, le'ahavah et Adonai Eloheichem ule'avdo bechol levavchem uvchol nafshechem. Venatati metar artzechem be'ito yoreh umalkosh, ve'asafta deganecha vetiroshcha veyitzharecha. Venatati eisev besadecha livhemtecha ve'achalta vesavata. Hishamru lachem pen yifteh levavchem vesartem va'avadtem elohim acherim vehishtachavitem lahem. Vechara af Adonai bachem ve'atzar et hashamayim velo yihyeh matar veha'adamah lo titen et yevulah va'avadtem meherah me'al ha'aretz hatovah asher Adonai noten lachem. Vesamtem et devarai eileh al levavchem ve'al nafshechem ukshartem otam le'ot al yedchem vehayu letotafot bein eineichem. Velimadtem otam et beneichem ledaber bam beshivtecha beveitecha uvlechtecha vaderech uvshochbecha uvkumecha. Uchtavtam al mezuzot beitecha uvish'arecha. Lema'an yirbu yemeichem vimei veneichem al ha'adamah asher nishba Adonai la'avoteichem latet lahem kimei hashamayim al ha'aretz.",
    ru: "И будет, если вы будете слушать заповеди Мои, которые Я заповедую вам сегодня, любя Господа, Бога вашего, и служа Ему всем сердцем вашим и всею душою вашею, то дам Я дождь земле вашей вовремя, ранний и поздний, и соберёшь хлеб твой, и вино твоё, и масло твоё. И дам траву на поле твоём для скота твоего, и будешь есть и насыщаться. Берегитесь, чтобы не обольстилось сердце ваше, и вы не уклонились и не стали служить иным богам и поклоняться им. И воспылает гнев Господа на вас, и заключит небеса, и не будет дождя, и земля не даст урожая, и вы скоро исчезнете с доброй земли, которую Господь даёт вам. И возложите слова Мои эти на сердце ваше и на душу вашу, и повяжите их как знак на руку вашу, и будут они украшением между глазами вашими. И учите им сыновей ваших, говоря о них, когда сидишь в доме твоём и когда идёшь дорогою, и когда ложишься и когда встаёшь. И напиши их на косяках дома твоего и на воротах твоих. Дабы продлились дни ваши и дни детей ваших на земле, о которой клялся Господь отцам вашим дать им, как дни неба над землёй.",
    nl: "En het zal zijn, als jullie aandachtig luisteren naar Mijn geboden die Ik jullie vandaag gebied, om de Eeuwige, je God, lief te hebben en Hem te dienen met heel je hart en heel je ziel, dan zal Ik regen geven voor je land op zijn tijd, vroege regen en late regen, en je zult je graan, je most en je olie inzamelen. En Ik zal gras geven in je veld voor je vee, en je zult eten en verzadigd worden. Wacht je ervoor dat je hart niet verleid wordt en je afwijkt en andere goden dient. Dan zal de toorn van de Eeuwige tegen jullie ontbranden en Hij zal de hemel sluiten en er zal geen regen zijn en de aarde zal haar opbrengst niet geven en jullie zullen snel verloren gaan. Leg deze woorden van Mij op je hart en op je ziel en bind ze als teken op je hand. Leer ze aan je kinderen, spreek erover in je huis en onderweg, als je neerligt en opstaat. Schrijf ze op de deurposten van je huis en op je poorten. Opdat je dagen en de dagen van je kinderen talrijk zullen zijn op het land dat de Eeuwige aan je voorvaders gezworen heeft te geven, zoals de dagen van de hemel boven de aarde.",
    en: "And it shall come to pass that if you hearken diligently to My commandments which I command you today, to love the Lord your God and to serve Him with all your heart and all your soul, then I will give rain for your land in its season, the early rain and the late rain, that you may gather in your grain, your wine, and your oil. And I will give grass in your fields for your cattle, and you shall eat and be satisfied. Beware lest your heart be deceived and you turn aside and serve other gods and worship them. Then the anger of the Lord will blaze against you, and He will close the heavens and there will be no rain, and the ground will not give its produce, and you will quickly perish from the good land which the Lord gives you. You shall place these words of Mine upon your heart and upon your soul, and bind them as a sign upon your hand and they shall be as frontlets between your eyes. You shall teach them to your children to speak of them when you sit in your house and when you walk on the way, when you lie down and when you rise. You shall write them upon the doorposts of your house and upon your gates. So that your days and the days of your children may be prolonged upon the land which the Lord swore to your ancestors to give them, as long as the heavens are above the earth.",
    fr: "Et il arrivera, si vous écoutez attentivement Mes commandements que Je vous ordonne aujourd’hui, d’aimer l’Éternel votre Dieu et de Le servir de tout votre cœur et de toute votre âme, alors Je donnerai la pluie de votre terre en son temps, la pluie précoce et la tardive, et tu recueilleras ton blé, ton moût et ton huile. Et Je donnerai de l’herbe dans ton champ pour ton bétail, et tu mangeras et seras rassasié. Gardez-vous que votre cœur ne se séduise, que vous ne vous détourniez et ne serviez d’autres dieux. Alors la colère de l’Éternel s’enflammera contre vous, Il fermera les cieux et il n’y aura plus de pluie, la terre ne donnera plus son produit et vous disparaîtrez vite de la bonne terre que l’Éternel vous donne. Vous placerez ces paroles Miennes sur votre cœur et sur votre âme, vous les lierez comme un signe sur votre main et elles seront comme des fronteaux entre vos yeux. Vous les enseignerez à vos enfants, en en parlant quand tu es assis dans ta maison et quand tu marches en chemin, quand tu te couches et quand tu te lèves. Tu les écriras sur les poteaux de ta maison et sur tes portes. Afin que vos jours et les jours de vos enfants se multiplient sur la terre que l’Éternel a juré à vos pères de leur donner, comme les jours des cieux au-dessus de la terre."
  },
  {
    id: 14,
    titleEn: "Kaddish deRabbanan",
    titleHe: "קַדִּישׁ דְּרַבָּנָן",
    he_display: "יתגדל ויתקדש שמה רבא, בעלמא די-ברא כרעותה, וימליך מלכותה בחייכון וביומיכון ובחיי דכל-בית ישראל, בעגלא ובזמן קריב, ואמרו אמן.\n\nיהא שמה רבא מברך לעלם ולעלמי עלמיא.\n\nיתברך וישתבח ויתפאר ויתרומם ויתנשא ויתהדר ויתעלה ויתהלל שמה דקדשא, בריך הוא, לעלא (ולעלא) מן כל-ברכתא ושירתא תשבחתא ונחמתא דאמירן בעלמא, ואמרו אמן.\n\nעל ישראל ועל רבנן, ועל תלמידיהון ועל כל-תלמידי תלמידיהון, ועל כל-מאן דעסקין באוריתא, די באתרא הדין ודי בכל-אתר ואתר, יהא להון ולכון שלמא רבא, חנא וחסדא ורחמין, וחיין אריכין, ומזוני רויחי, ופורקנא, מן קדם אבוהון די בשמיא, ואמרו אמן.\n\nיהא שלמא רבא מן שמיא וחיים עלינו ועל כל-ישראל, ואמרו אמן.\n\nעשה שלום במרומיו הוא יעשה שלום עלינו ועל-כל-ישראל ועל-כל-בני-אדם, ואמרו אמן.",
    he_tts: "יתגדל ויתקדש שמה רבא, בעלמא די-ברא כרעותה, וימליך מלכותה בחייכון וביומיכון ובחיי דכל-בית ישראל, בעגלא ובזמן קריב, ואמרו אמן. יהא שמה רבא מברך לעלם ולעלמי עלמיא. יתברך וישתבח ויתפאר ויתרומם ויתנשא ויתהדר ויתעלה ויתהלל שמה דקדשא, בריך הוא, לעלא (ולעלא) מן כל-ברכתא ושירתא תשבחתא ונחמתא דאמירן בעלמא, ואמרו אמן. על ישראל ועל רבנן, ועל תלמידיהון ועל כל-תלמידי תלמידיהון, ועל כל-מאן דעסקין באוריתא, די באתרא הדין ודי בכל-אתר ואתר, יהא להון ולכון שלמא רבא, חנא וחסדא ורחמין, וחיין אריכין, ומזוני רויחי, ופורקנא, מן קדם אבוהון די בשמיא, ואמרו אמן. יהא שלמא רבא מן שמיא וחיים עלינו ועל כל-ישראל, ואמרו אמן. עשה שלום במרומיו הוא יעשה שלום עלינו ועל-כל-ישראל ועל-כל-בני-אדם, ואמרו אמן.",
    translit: "Yitgadal veyitkadash shemeh rabba, be'alma di vera chir'uteh, veyamlich malchuteh bechayeichon uvyomeichon uvchayei dechol beit Yisrael, be'agala uvizman kariv, ve'imru Amen. Yehei shemeh rabba mevarach le'alam ul'almei almaya. Yitbarach veyishtabach veyitpa'ar veyitromam veyitnaseh veyithadar veyit'aleh veyithalal shemeh dekudsha, berich hu, le'eila ule'eila min kol birchata veshirata tushbechata venechamata da'amiran be'alma, ve'imru Amen. Al Yisrael ve'al rabbanan, ve'al talmideihon ve'al kol talmidei talmideihon, ve'al kol man de'askin be'oraita, di ve'atra hadin vedi bechol atar ve'atar, yehei lehon ulechon shelama rabba, china vechisda verachamin, vechayin arichin, umezonei revichei, ufurecana, min kodam Avuhon di vishmaya, ve'imru Amen. Yehei shelama rabba min shemaya vechayim aleinu ve'al kol Yisrael, ve'imru Amen. Oseh shalom bimromav hu ya'aseh shalom aleinu ve'al kol Yisrael ve'al kol benei adam, ve'imru Amen.",
    ru: "Да возвеличится и освятится Его великое Имя в мире, который Он сотворил по воле Своей, и да установит Царство Своё при жизни вашей и во дни ваши и при жизни всего дома Израиля, вскорости и в ближайшее время, и скажем: Амен. Да будет великое Имя Его благословенно вечно и во веки веков. Да будет благословенно, восхваляемо, прославляемо, возносимо, возвышаемо, почитаемо, превозносимо и восхваляемо Имя Святого, благословен Он, выше всех благословений и песнопений, славословий и утешений, произносимых в мире, и скажем: Амен. Над Израилем и над мудрецами, и над учениками их, и над всеми учениками учеников их, и над всеми занимающимися Торой, здесь и во всяком месте, да будет им и вам великий мир, милость, любовь и милосердие, долгая жизнь, обильное пропитание и избавление от Отца их Небесного, и скажем: Амен. Да будет великий мир с небес и жизнь для нас и для всего Израиля, и скажем: Амен. Делающий мир в высотах Своих, Он сделает мир нам и всему Израилю и всему человечеству, и скажем: Амен.",
    nl: "Moge Zijn grote Naam verheven en geheiligd worden in de wereld die Hij naar Zijn wil schiep, en moge Hij Zijn koninkrijk vestigen tijdens jullie leven en tijdens jullie dagen en tijdens het leven van heel het huis van Israël, snel en spoedig, en zegt: Amen. Moge Zijn grote Naam gezegend zijn voor eeuwig en eeuwig. Moge gezegend, geprezen, verheerlijkt, verheven, verhoogd, geëerd, opgetild en geloofd worden de Naam van de Heilige, gezegend is Hij, boven elke zegen en lofzang, lofprijzing en troost die in de wereld wordt uitgesproken, en zegt: Amen. Over Israël en over de rabbijnen, over hun leerlingen en over alle leerlingen van hun leerlingen, en over allen die zich met Tora bezighouden, op deze plaats en op elke plaats, moge er voor hen en voor jullie grote vrede zijn, genade, gunst en barmhartigheid, lang leven, ruim onderhoud en verlossing van hun Vader in de hemel, en zegt: Amen. Moge er grote vrede uit de hemel en leven over ons en over heel Israël komen, en zegt: Amen. Hij Die vrede maakt in Zijn hoogten, Hij zal vrede maken over ons en over heel Israël en over alle mensen, en zegt: Amen.",
    en: "May His great Name be exalted and sanctified in the world which He created according to His will, and may He establish His kingdom in your lifetime and in your days and in the lifetime of all the House of Israel, speedily and soon, and say Amen. May His great Name be blessed forever and to all eternity. Blessed and praised, glorified and exalted, extolled and honored, adored and lauded be the Name of the Holy One, blessed be He, beyond all blessings and hymns, praises and consolations that are uttered in the world, and say Amen. Upon Israel and upon the rabbis and upon their disciples and upon all disciples of their disciples, and upon all who engage in Torah, here and everywhere, may there be for them and for you abundant peace, grace and lovingkindness and mercy, long life, ample sustenance and deliverance from their Father in heaven, and say Amen. May there be abundant peace from heaven and life upon us and upon all Israel, and say Amen. He Who makes peace in His heights, may He make peace upon us and upon all Israel and upon all mankind, and say Amen.",
    fr: "Que Son grand Nom soit exalté et sanctifié dans le monde qu’Il a créé selon Sa volonté, et qu’Il fasse régner Son règne de votre vivant et de vos jours et du vivant de toute la maison d’Israël, rapidement et bientôt, et dites: Amen. Que Son grand Nom soit béni à jamais et aux siècles des siècles. Béni, loué, glorifié, exalté, élevé, honoré, sublime et célébré soit le Nom du Saint, béni soit-Il, au-delà de toutes les bénédictions, cantiques, louanges et consolations qui se disent dans le monde, et dites: Amen. Sur Israël et sur les maîtres, sur leurs disciples et sur tous les disciples de leurs disciples, et sur tous ceux qui s’occupent de la Torah, en ce lieu et en tout lieu, qu’il y ait pour eux et pour vous une grande paix, grâce, bonté et miséricorde, longue vie, nourriture abondante et délivrance de la part de leur Père qui est aux cieux, et dites: Amen. Qu’il y ait une grande paix du ciel et la vie sur nous et sur tout Israël, et dites: Amen. Celui qui fait la paix dans Ses hauteurs, qu’Il fasse la paix sur nous et sur tout Israël et sur tous les êtres humains, et dites: Amen."
  }
];

export default function App() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showTranslit, setShowTranslit] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const pausedAccumRef = useRef<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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
const ttsText = prayer.he_tts.replace(/יְהוָה|יְהֹוָה|יהוה/g, 'אֲדֹנָי');

    synth.cancel();
    const utter = new SpeechSynthesisUtterance(ttsText);
    utter.rate = 0.72;
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
            <>
              <div className="px-4 pt-2 pb-3 ui-sans sticky top-0 bg-white/90 backdrop-blur z-10 border-b border-zinc-50">
                <button
                  onClick={() => {
                    setSelected(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 py-1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M15 18l-6-6 6-6"/></svg>
                  Back to list
                </button>
              </div>

              <div className="flex-1 overflow-auto px-5 pb-[168px]">
                <div className="pt-3 pb-6 border-b border-zinc-100">
                  <div className="flex items-center gap-2 text-[11px] tracking-widest text-[#0D9488] font-semibold uppercase ui-sans">
                    <span>{String(selected + 1).padStart(2, '0')} / 14</span>
                    <span className="h-1 w-1 rounded-full bg-[#0D9488]/40"></span>
                    <span>{currentPrayer.titleEn}</span>
                  </div>
                  <h2 className="mt-3 text-[22px] font-semibold ui-sans leading-tight">{currentPrayer.titleEn}</h2>
                  <div className="he-serif text-[15px] text-zinc-500 mt-1" dir="rtl">{currentPrayer.titleHe}</div>
                </div>

                <div className="mt-7">
                  <div className="he-serif text-[26px] sm:text-[28px] leading-[1.75] text-zinc-900 text-right whitespace-pre-wrap break-words" dir="rtl" lang="he">
                    {currentPrayer.he_display}
                  </div>
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
                    onClick={() => selected !== null && selected > 0 && setSelected(selected - 1)}
                    disabled={selected === 0}
                    className={`flex-1 h-11 rounded-full font-medium text-[14px] border transition-all ${
                      selected === 0 ? 'border-zinc-200 text-zinc-400 bg-zinc-50' : 'bg-white border-[#0D9488] text-[#0D9488] hover:bg-teal-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => selected !== null && selected < prayers.length - 1 && setSelected(selected + 1)}
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
                        <div className="text-[11px] text-zinc-500 mt-1 truncate">{currentPrayer.titleEn} • he-IL 0.72×</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-medium text-zinc-600 tabular-nums">{formatTime(currentSec)} / {formatTime(durationSec || 0)}</div>
                  </div>
                  <div className="mt-3 h-[6px] w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0D9488] rounded-full transition-all duration-150" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {selected === null && (
            <div className="px-4 pt-2 pb-10 ui-sans">
              <div className="px-2 mb-4">
                <p className="text-[13px] text-zinc-500 leading-5">Select a prayer to read, listen and translate. All 14 items in traditional order, last is Kaddish deRabbanan.</p>
              </div>
            <div className="space-y-2.5">
              {prayers.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left bg-white border rounded-2xl px-4 py-4 flex items-center justify-between hover:shadow-sm transition-all group ${
                    selected === idx ? 'border-[#0D9488] bg-teal-50/40 shadow-sm' : 'border-zinc-200 hover:border-[#0D9488]/40'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 ${selected === idx ? 'bg-[#0D9488] text-white' : 'bg-zinc-100 group-hover:bg-teal-50 text-zinc-600 group-hover:text-[#0D9488]'}`}>
                      {idx + 1}
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
                Text displayed with niqqud. Audio uses he-IL voice at 0.72x. Divine Name spoken as Adonai.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
