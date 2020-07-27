/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import * as superagent from 'superagent';
import { SubConfigs } from './Config';
import { Logger } from './Logger';
import Context from './Context';
import { Cinema, Movie } from './models';
import { Callback, ListParsingCallback } from './Types';
import { AuditoriumParser, CinemaParser, DateParser, ItemParser, MovieParser, ParsingContext, TimeParser, VersionParser, ShowtimesParser } from './parsers';
import { Moment } from 'moment';
import { PeriodParser } from './parsers/PeriodParser';
export declare type CallbackFunction = (err?: Error, result?: any) => void;
export declare type BoxIterator = (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => void;
export declare type ResponseHandler<T> = (response: superagent.Response, context: Context, callback: Callback<T>) => void;
declare type LevelParserHookSync<T> = (container: Cheerio, context: ParsingContext) => T;
declare type LevelParserHookASync<T> = (container: Cheerio, context: ParsingContext, callback: Callback<T>) => void;
export declare type LevelParserHook<T> = LevelParserHookSync<T> | LevelParserHookASync<T>;
export interface DatePage {
    /** The pages date as [momentjs](http://momentjs.com/) object */
    date: Moment;
    /** The date's href, which should contain a path string relative to the webiste's base url. */
    href: string;
}
/** @private */
export declare function debugLogFoundBoxesCount(logger: Logger, scope: string, count: number): void;
/**
 * Base ResponseParser, which supports
 * - loading the HTML and creating a ParsingContext
 * - parsing of lists
 */
export declare abstract class BaseHtmlParser {
    private _logger;
    constructor();
    get logger(): Logger;
    set logger(newLogger: Logger);
    /**
      * Detects arbitrary lists at iterates over it's boxes asyncroniously.
      * @param container The base container which is the entrypoint
      * @param listName The name of the list, used for debug logs
      * @param listConfig The config for parsing the list
      * @param boxIterator A callback function which will be called for each box found in the list
      * @param callback The completion callback which will be called with final parsed data objects and opionally a url for the next page to crawl
      */
    parseList<T>(container: Cheerio, context: ParsingContext, listName: string, listConfig: SubConfigs.Generic.ListParsingConfig, boxIterator: (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => void, callback: ListParsingCallback<T>): void;
    /**
     * Loads the html text of a response into a cheerio container and creates a corresponding parsing context.
     * @param response
     * @param context
     */
    prepareHtmlParsing(html: string, context: Context): {
        container: Cheerio;
        parsingContext: ParsingContext;
    };
}
export declare class DefaultResponseParser extends BaseHtmlParser {
    cinemaParser: CinemaParser;
    auditoriumParser: AuditoriumParser;
    dateParser: DateParser;
    timeParser: TimeParser;
    versionParser: VersionParser;
    movieParser: MovieParser;
    showtimesParser: ShowtimesParser;
    periodParser: PeriodParser;
    constructor();
    /**
     * Handles the repsonse of a cinemas parsing a list of cinemas
     */
    handleCinemasResponse(response: superagent.Response, listConfig: SubConfigs.Cinemas.List, context: Context, callback: ListParsingCallback<Cinema>): void;
    /**
     * Handle the response of a single cinema's details page. Parses details and provides a partial cinema object via callback.
     */
    handleCinemaDetailsResponse(response: superagent.Response, detailsParsingConfig: SubConfigs.Cinemas.Details, context: Context, callback: Callback<Partial<Cinema>>): void;
    handleMoviesResponse(response: superagent.Response, listConfig: SubConfigs.Movies.ListParsing, context: Context, callback: ListParsingCallback<Movie>): void;
    handleDatesResponse(response: superagent.Response, config: SubConfigs.Dates.ListParsing, context: Context, callback: ListParsingCallback<DatePage>): void;
    handleShowtimesResponse(response: superagent.Response, config: SubConfigs.Showtimes.ResponseParsingConfig, context: Context, callback: CallbackFunction): void;
    private boxIterator;
    private parseHeaderBox;
    private resultsFlattenCallback;
    /** Parses and iterates a level of items such as movies, version, auditoria */
    parseLevel<T>(levelName: string, container: Cheerio, parsingConfig: any, itemParser: ItemParser<T>, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction): void;
    parseMovies(moviesContainer: Cheerio, moviesConfig: SubConfigs.Movies.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction): void;
    parseDates(datesContainer: Cheerio, datesConfig: SubConfigs.Dates.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction): void;
    parseAuditoria(auditoriaContainer: Cheerio, auditoriaConfig: SubConfigs.Auditoria.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction): void;
    parseVersions(versionsContainer: Cheerio, versionsConfig: SubConfigs.Versions.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction): void;
    parsePeriods(periodsContainer: Cheerio, periodsConfig: SubConfigs.Periods.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction): void;
}
export {};
