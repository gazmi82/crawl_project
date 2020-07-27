import Config, { SubConfigs } from './Config';
import { RequestMaker, RequestObject } from './RequestMaker';
import { DefaultResponseParser, DatePage, ResponseHandler } from './ResponseParsers';
import { Logger } from './Logger';
import Context, { Resource } from './Context';
import { Cinema, Movie, Showtime } from './models';
import { Callback } from './Types';
declare type CinemaListCallback = Callback<Cinema[]>;
declare type MovieListCallback = Callback<Movie[]>;
/**
 * The main class of the Framework. Acts as single entry point unless building custom coded crawler scripts. Then you most likely won't use the CrawlE class at all.
 *
 * @category Main
 */
declare class CrawlE {
    config: Config;
    results: {
        cinemas: any;
        movies: any;
        datePages: any;
        showtimes: any;
    };
    private _requestMaker;
    private _responseParser;
    private _logger;
    private progressTracker;
    private fileWriter;
    constructor(conf: any, logger?: Logger);
    get logger(): Logger;
    set logger(newLogger: Logger);
    get requestMaker(): RequestMaker;
    set requestMaker(newRequestMaker: RequestMaker);
    get responseParser(): DefaultResponseParser;
    set responseParser(newResponseParser: DefaultResponseParser);
    private setTimezone;
    private handleProgressUpdate;
    /**
     * The main method, which starts and performs all the crawling according to the configuration.
     * @param done completion callback, default to some console.logs
     */
    crawl(done?: (err: Error | null) => void): void;
    crawlIsTemporarilyClosed(context: Context, callback: Callback<void>): void;
    /**
     * Gets the list of cinemas - either from static configuration or via crawling it.
     * @param context
     * @param callback
     */
    getCinemas(context: Context, callback: (error: any, cinemas: any) => void): void;
    /**
     * Crawls a list of cinemas according to the configuration.
     * @param context
     * @param callback
     */
    crawlCinemas(context: Context, callback: (error: any, cinemas: any) => void): void;
    /**
     * Crawls a list of cinemas from a single page / request.
     * @param requestObject the configuration to make either a GET or POST request
     * @param context
     * @param callback
     */
    crawlCinemaList(requestObject: RequestObject, context: Context, callback: CinemaListCallback): void;
    /**
     * Get addtional cinema properties from a details page. Updates the cinema in context.
     * @param cinema
     * @param context
     * @param callback
     */
    crawlCinemaDetails(cinema: Cinema, context: Context, callback: Callback<Partial<Cinema>>): void;
    /**
     * Crawls the showtimes for a single cinema according to the configuration.
     * @param cinema
     * @param callback
     */
    crawlShowtimesForCinema(cinema: Cinema, callback: Function): void;
    workOnCinema(context: Context, callback: any): void;
    processResult(result: any, context: Context, callback: any): void;
    getMovies(context: Context, callback: MovieListCallback): void;
    crawlList<T>(requestObject: RequestObject, resource: Resource, responseHandler: ResponseHandler<T>, context: Context, callback: Callback<T>): void;
    crawlMovieList(requestObject: RequestObject, context: Context, callback: MovieListCallback): void;
    getDates(context: Context, callback: Callback<DatePage[]>): void;
    crawlDateList(requestObject: RequestObject, context: Context, callback: Callback<DatePage[]>): void;
    getShowtimes(context: Context, configs: SubConfigs.Showtimes.CrawlingConfig[], callback: Callback<Showtime[]>): void;
    crawlShowtimes(config: SubConfigs.Showtimes.CrawlingConfig, context: Context, callback: Callback<Showtime[]>): void;
    workOnRequestLists(config: SubConfigs.Generic.ListCrawlingConfig, context: any, iterator: (requestObject: RequestObject, context: any, callback: Function) => void, callback: any): void;
    iterateDates(config: SubConfigs.Generic.ListCrawlingConfig, context: any, iterator: (context: any, callback: Function) => void, callback: any): void;
    iteratePages(requestObject: RequestObject, context: any, iterator: (context: any, callback: Function) => void, callback: any): void;
    crawlShowtimesList(requestObject: RequestObject, config: SubConfigs.Showtimes.CrawlingConfig, context: any, callback: any): void;
    adjustLateNightShowtimes(showtimes: Showtime[]): void;
    responseParserFor(resource: any, defautlParserConfig: any): any;
    private buildFilename;
    private map;
    private mapSeries;
    private mapLimit;
}
export default CrawlE;
