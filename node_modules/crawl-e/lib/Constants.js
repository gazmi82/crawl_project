"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constants;
(function (Constants) {
    /** global [debug](https://github.com/visionmedia/debug) namespace prefix */
    Constants.MAIN_DEBUG_PREFIX = 'crawl-e';
    /** default ouput directory path */
    Constants.OUTPUT_DIR = 'output';
    Constants.BOX_SELECTOR = ':box';
    /** @private */
    Constants.RETRY_OPTIONS = {
        times: 3,
        interval: 500 // milliseconds
    };
    /** a list of "today" translated into many languages, useful for checking stings */
    Constants.TODAY_WORDS = ['avui', 'اليوم', 'Today', 'Бугун', 'Sot', 'Сегодня', 'Hoje', 'hoy', 'heute', 'vandaag', 'Idag', 'bugün', 'danas', 'আজ', 'Aujourd’hui', 'Днес', 'Hari', 'Сёння', 'leo', 'Oggi', 'Σήμερα', 'dnes', 'Täna,', 'tänään', 'आज', 'آج', 'Í', 'დღეს', 'ma', 'היום', 'امروز', 'í', '今日', 'Бүгүн', 'ថ្ងៃនេះ', '오늘', 'Бүгін', 'ມື້ນີ້ເວລາ', 'අද', 'இன்று', 'Šiandien', 'Haut', 'Šodien', 'azi', 'Денес', 'ယနေ.', 'Illum', 'މިއަދު', 'Vandag', 'Dziś', 'danes', 'Namuhla', 'วันนี้', 'Имрӯз', 'Сьогодні', 'Hôm'];
    /** a list of "tomorrow" translated into many languages, useful for checking stings */
    Constants.TOMORROW_WORS = ['demà', 'غدًا', 'Tomorrow', 'Эртага', 'Nesër', 'Завтра', 'Amanhã', 'mañana', 'morgen', 'Imorgon', 'sabah', 'sutra', 'আগামীকাল', 'Demain', 'Утре', 'Esok', 'Заўтра', 'kesho', 'Domani', 'Αύριο', 'yarın', 'zítra', 'zajtra', 'Homme,', 'huomenna', 'कल', 'کل', 'Í', 'ხვალ', 'holnap', 'Besok', 'מחר', 'فردا', 'á', '明日', 'Эртең', 'ស្អែក', '내일', 'Ертең', 'ມື້ອື່ນເວລາ', 'හෙට', 'நாளை', 'Rytoj', 'Muer', 'Rīt', 'mâine', 'မနက်ဖြန်', 'Għada', 'މާދަމާ', 'Môre', 'भोलि', 'Jutro', 'jutri', 'Kusasa', 'พรุ่งนี้', 'Пагоҳ', 'Ngày'];
    /** a list of "day after tomorrow" translated into many languages, useful for checking stings */
    Constants.DAY_AFTER_TOMORROW_WORS = ['Oormôre', 'পরশু দিন', 'pozítří', 'overmorgen', 'ülehomme', 'ylihuomenna', 'après-demain', 'übermorgen', 'μεθαύριο', 'aprè demen', 'दिन के बाद कल', 'nag kis', 'holnapután', 'daginn eftir morgundaginn', 'lusa', 'dopodomani', 'parīt', 'روز بعد از فردا', 'pojutrze', 'poimâine', 'послезавтра', 'прекосутра', 'prekosutra', 'pozajtra', 'pojutrišnjem', 'післязавтра'];
    /** a list of operating systems to no use as random useragent header as they might lead to blocking of request or getting mobile versions rather than regular desktop html */
    Constants.OS_NAME_BLACKLIST = [
        'Jigsaw',
        'portalmmm',
        'Kindle',
        'IEMobile',
        'Lynx',
        'PalmSource',
        'Windows CE',
        'DoCoMo',
        'Mobi',
        'Java',
        'WebCopier',
        'libwww',
        'X11',
        'Mediapartners',
        'ReqwirelessWeb',
        'Vodafone',
        'Opera Mini',
        'Avant Browser',
        'Googlebot-Mobile',
        'Android',
        'Windows Phone',
        'Windows Phone OS',
        'PalmOS',
        'Symbian',
        'iOS',
        'RIM Tablet OS',
        'BlackBerry',
        'webOS',
        'MeeGo',
        'Nintendo',
        'PLAYSTATION',
        'PlayStation'
    ];
    /** term for marking showtime.language as original version */
    Constants.ORIGINAL_VERSION = 'original version';
    /** term for marking showtime.subtitles explicitly as "undetermined", which means we know it has subtitles, but we don't know in which language(s) */
    Constants.SUBTITLES_UNDETERMINED = 'undetermined';
})(Constants || (Constants = {}));
exports.default = Constants;
