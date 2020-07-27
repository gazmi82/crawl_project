import * as superagent from 'superagent';
import { ValueGrabbing } from './ValueGrabber';
import { LanguageParsingConfig } from './parsers/LanguageParser';
import { VersionParsingConfig, MovieParsingConfig, ShowtimeItemParsingConfig, DatesArray, DateParsingConfig, AuditoriumParsingConfig, CineamParsingConfig } from './parsers';
import TableParser from './parsers/TableParser/TableParser';
import { Showtime, Cinema } from './models';
import { LevelParserHook, CallbackFunction } from './ResponseParsers';
import { RequestMakerHooks } from './RequestMaker';
import Context from './Context';
import { PeriodParsingConfig } from './parsers/PeriodParser';
import TabsParser from './parsers/TabsParser';
export declare namespace SubConfigs {
    namespace Generic {
        /**
         * Generic interface for configs defining properties for parsing any list.
         */
        interface ListParsingConfig {
            /** jQuery selector for the list's item's html boxes */
            box?: string;
            /** ValueGrabber for the item's relative url path string */
            href?: ValueGrabbing;
            /** for Pagination: ValueGrabber for the next page href or url */
            nextPage?: ValueGrabbing;
        }
        interface RequestConfig {
            /**
             * One or many urls or url tempaltes to pages displaying the list.
             */
            urls: string[];
            /**
             * date format for :date: parameter in url or post data templates.
             */
            urlDateFormat?: string;
            /** Number of days to crawler with :date: parameter in url or post data templates. */
            urlDateCount?: number;
            /**
             * Template for building post body. Either as parameters string or JSON object.
             */
            postData?: any;
        }
        /**
         * General interface for configs crawling & parsing any list.
         */
        interface ListCrawlingConfig extends ListParsingConfig, RequestConfig {
        }
        interface IsTemporarilyClosedCrawlingConfig {
            /** A single URL to crawl for the information if a cinema is closed */
            url: string;
            grabber: ValueGrabbing<boolean>;
        }
        interface DetailsCrawlingConfig {
            /** url template for detail pages */
            url: string;
            postData?: any;
        }
    }
    namespace Cinemas {
        interface List extends Generic.ListCrawlingConfig, CineamParsingConfig {
        }
        interface Details extends Generic.DetailsCrawlingConfig, CineamParsingConfig {
        }
        interface CrawlingConfig {
            list: List;
            details?: Details;
        }
    }
    namespace Movies {
        interface ItemParsing extends LanguageParsingConfig, VersionParsingConfig, MovieParsingConfig {
        }
        interface CrawlingList extends Generic.ListCrawlingConfig, ItemParsing {
        }
        interface CrawlingConfig {
            list: CrawlingList;
            showtimes: Showtimes.CrawlingConfig;
        }
        interface ListParsing extends Generic.ListParsingConfig, ItemParsing {
            dates?: Dates.ListParsing;
            auditoria?: Auditoria.ListParsing;
            showtimes?: Showtimes.ListParsing;
            versions?: Versions.ListParsing;
            table?: TableParser.ParsingConfig;
        }
    }
    namespace Showtimes {
        interface ItemParsing extends ShowtimeItemParsingConfig {
        }
        export interface ListParsing extends Generic.ListParsingConfig, ItemParsing {
            parser?: LevelParserHook<Showtime[]>;
            delimiter?: string | RegExp;
        }
        export interface ParsingLevelConfig {
            forEach?: ForEach.ListParsing;
            auditoria?: Auditoria.ListParsing;
            movies?: Movies.ListParsing;
            versions?: Versions.ListParsing;
            dates?: Dates.ListParsing;
            periods?: Periods.ListParsing;
            showtimes?: ListParsing;
            table?: TableParser.ParsingConfig;
            tabs?: TabsParser.ParsingConfig;
        }
        export interface ResponseParsingConfig extends Generic.ListParsingConfig, ParsingLevelConfig {
        }
        export interface CrawlingConfig extends Generic.ListCrawlingConfig, ParsingLevelConfig {
            preserveLateNightShows: boolean;
        }
        export {};
    }
    namespace Periods {
        interface ItemParsing extends PeriodParsingConfig {
        }
        interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig {
        }
    }
    namespace Dates {
        interface ItemParsing extends DateParsingConfig {
        }
        interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig {
            parser?: LevelParserHook<DatesArray>;
        }
        interface CrawlingList extends Generic.ListCrawlingConfig, ItemParsing {
        }
        interface CrawlingConfig {
            list: CrawlingList;
            showtimes: Showtimes.CrawlingConfig;
        }
    }
    namespace Auditoria {
        interface ItemParsing extends AuditoriumParsingConfig {
        }
        interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig {
        }
    }
    namespace Versions {
        interface ItemParsing extends VersionParsingConfig {
        }
        interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig {
        }
    }
    namespace ForEach {
        interface ListParsing extends Generic.ListParsingConfig, Showtimes.ParsingLevelConfig {
        }
    }
    /** for parsing
     * - table headerRow
     * - table headerColumn
     * - tabs buttons */
    interface HeaderParsingConfig {
        date?: ValueGrabbing;
        dates?: ValueGrabbing<string> | ValueGrabbing<Date> | ValueGrabbing<moment.Moment>;
        auditorium?: ValueGrabbing;
        time?: ValueGrabbing;
        movieTitle?: ValueGrabbing;
    }
    interface Hooks extends RequestMakerHooks {
        /** Hook to perform some preparation work, such as building cookies or crawling addiontal data. */
        beforeCrawling?: (context: Context, callback: (err: Error) => void) => void;
        /** Hook to replace the entire response handling (including parsing) of cinema list pages. */
        handleCinemasResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void;
        /** Hook to replace the entire response handling (including parsing) of cinema detail pages. */
        handleCinemaDetailsResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void;
        /** Hook to replace the entire response handling (including parsing) of movie list pages. */
        handleMoviesResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void;
        /** Hook to replace the entire response handling (including parsing) of date list pages. */
        handleDatesResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void;
        /** Hook to replace the entire response handling (including parsing) of showtimes. */
        handleShowtimesResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void;
        /** Hook to clean up output results before saving them to json file. */
        beforeSave?: (data: any, context: Context) => any;
        /** Hook to build custom filenames based on crawler.id or cinema properties. */
        buildFilename?: (cinema: Cinema, crawlerId: string, context: Context) => string;
        /** Hook to update UI with crawling progress. */
        progress?: (complete: number, total: number) => void;
    }
}
