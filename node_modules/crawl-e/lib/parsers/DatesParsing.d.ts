/**
 * This file contains functions for parsing more complex dates strings as examples show below.
 * It plugs into the dates value grabbing on showtimes parsing.
 *
 *   Sat 3/24 12:50 3:50 6:40 9:05
 *   Mon 3/26 - Wed 3/28 4:10 7:10
 *   Mon 3/26 & Tue 3/27 4:30 7:30
 *
 */
import * as moment from 'moment';
import Logger from '../Logger';
export declare namespace DatesParsing {
    interface Config {
        /** format for parsing date sub-strings */
        dateFormat: moment.MomentFormatSpecification;
        /** regular expression to find dates, will be inferred from `dateFormat` if omitted */
        dateRegexPattern?: string;
        /** locale for parsing the date with moment, defaults to `'en'` */
        dateLocale?: string;
        /** string or regex pattern to find a date range */
        rangeSeparator?: string;
        /** string or regex pattern to find a list of dates */
        compoundSeparator?: string;
    }
    /**
     * Parses individual dates, ranges of dates and compound dates from the given text.
     * @param text input text to parse
     * @param config configuarion for dates parsing
     * @returns an array of dates as momentjs objects.
     */
    function parseDates(text: string, config: Config, logger?: Logger): moment.Moment[];
}
