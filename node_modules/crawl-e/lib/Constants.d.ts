declare namespace Constants {
    /** global [debug](https://github.com/visionmedia/debug) namespace prefix */
    const MAIN_DEBUG_PREFIX = "crawl-e";
    /** default ouput directory path */
    const OUTPUT_DIR = "output";
    const BOX_SELECTOR = ":box";
    /** @private */
    const RETRY_OPTIONS: {
        times: number;
        interval: number;
    };
    /** a list of "today" translated into many languages, useful for checking stings */
    const TODAY_WORDS: string[];
    /** a list of "tomorrow" translated into many languages, useful for checking stings */
    const TOMORROW_WORS: string[];
    /** a list of "day after tomorrow" translated into many languages, useful for checking stings */
    const DAY_AFTER_TOMORROW_WORS: string[];
    /** a list of operating systems to no use as random useragent header as they might lead to blocking of request or getting mobile versions rather than regular desktop html */
    const OS_NAME_BLACKLIST: string[];
    /** term for marking showtime.language as original version */
    const ORIGINAL_VERSION = "original version";
    /** term for marking showtime.subtitles explicitly as "undetermined", which means we know it has subtitles, but we don't know in which language(s) */
    const SUBTITLES_UNDETERMINED = "undetermined";
}
export default Constants;
