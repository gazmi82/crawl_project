/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import Logger from '../Logger';
import { CallbackFunction } from '../ResponseParsers';
import { SubConfigs } from '../Config';
import { ParsingContext } from './ParsingContext';
import { LanguageParsingConfig } from './LanguageParser';
import { DateParser, DatesIValueGrabver } from './DateParser';
import { TimeParsingConfig, TimeParser } from './TimeParser';
import { VersionParsingConfig, VersionParser } from './VersionParser';
import { AuditoriumParsingConfig } from './AuditoriumParser';
import { IndirectMovieParsingConfig } from './MovieParser';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
/**
 * ShowtimeItemParsingConfig
 * @category HTML Parsing
 */
export interface ShowtimeItemParsingConfig extends LanguageParsingConfig, TimeParsingConfig, VersionParsingConfig, AuditoriumParsingConfig, IndirectMovieParsingConfig {
    /** Value Grabber for the date string */
    date?: ValueGrabbing;
    dates?: DatesIValueGrabver;
    dateFormat?: string;
    dateLocale?: string;
    datetimeParsing?: boolean;
    datetimeFormat?: string;
    datetimeLocale?: string;
    preserveYear?: boolean;
    bookingLink?: ValueGrabbing;
}
/**
 * ShowtimesParser
 * @category HTML Parsing
 */
export declare class ShowtimesParser extends BaseParser {
    private dateParser;
    private timeParser;
    private versionParser;
    constructor(logger: Logger, dateParser: DateParser, timeParser: TimeParser, versionParser: VersionParser);
    parseShowtimes(showtimesContainer: Cheerio, showtimesConfig: SubConfigs.Showtimes.ListParsing, context: ParsingContext, callback: CallbackFunction): void;
    private parseItems;
    private parseShowtime;
    private dateParsingConfig;
    private resolveFallbacksAndDefaults;
}
