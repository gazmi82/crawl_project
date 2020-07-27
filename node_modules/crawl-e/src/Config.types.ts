import * as superagent from 'superagent'
import ValueGrabber, { IValueGrabber, ValueGrabbing, ValueGrabberConfig } from './ValueGrabber'
import { LanguageParsingConfig } from './parsers/LanguageParser'
import { VersionParsingConfig, MovieParsingConfig, ShowtimeItemParsingConfig, DatesArray, DateParsingConfig, AuditoriumParsingConfig, CineamParsingConfig } from './parsers'
import TableParser from './parsers/TableParser/TableParser'
import { Showtime, Cinema } from './models'
import { LevelParserHook, CallbackFunction } from './ResponseParsers'
import { RequestMakerHooks } from './RequestMaker'
import Context from './Context'
import { PeriodParsingConfig } from './parsers/PeriodParser';
import TabsParser from './parsers/TabsParser';

export namespace SubConfigs {
  export namespace Generic {
    /**
     * Generic interface for configs defining properties for parsing any list. 
     */
    export interface ListParsingConfig {
      /** jQuery selector for the list's item's html boxes */
      box?: string

      /** ValueGrabber for the item's relative url path string */
      href?: ValueGrabbing

      /** for Pagination: ValueGrabber for the next page href or url */
      nextPage?: ValueGrabbing
    }

    export interface RequestConfig {
      /**
       * One or many urls or url tempaltes to pages displaying the list.
       */
      urls: string[]

      /**
       * date format for :date: parameter in url or post data templates.
       */
      urlDateFormat?: string

      /** Number of days to crawler with :date: parameter in url or post data templates. */
      urlDateCount?: number

      /**
       * Template for building post body. Either as parameters string or JSON object.
       */
      postData?: any
    }

    /**
     * General interface for configs crawling & parsing any list. 
     */
    export interface ListCrawlingConfig extends ListParsingConfig, RequestConfig { }

    export interface IsTemporarilyClosedCrawlingConfig {
      /** A single URL to crawl for the information if a cinema is closed */
      url: string
      grabber: ValueGrabbing<boolean>
    }

    export interface DetailsCrawlingConfig {
      /** url template for detail pages */
      url: string
      postData?: any
    }
  }

  export namespace Cinemas {
    
    export interface List extends Generic.ListCrawlingConfig, CineamParsingConfig { }
    export interface Details extends Generic.DetailsCrawlingConfig, CineamParsingConfig { }

    export interface CrawlingConfig {
      list: List
      details?: Details
    }
  }



  export namespace Movies {
    export interface ItemParsing extends LanguageParsingConfig, VersionParsingConfig, MovieParsingConfig { }
    export interface CrawlingList extends Generic.ListCrawlingConfig, ItemParsing { }

    export interface CrawlingConfig {
      list: CrawlingList
      showtimes: Showtimes.CrawlingConfig
    }

    export interface ListParsing extends Generic.ListParsingConfig, ItemParsing {
      dates?: Dates.ListParsing
      auditoria?: Auditoria.ListParsing
      showtimes?: Showtimes.ListParsing
      versions?: Versions.ListParsing
      table?: TableParser.ParsingConfig
    }
  }



  export namespace Showtimes {

    interface ItemParsing extends ShowtimeItemParsingConfig { }

    export interface ListParsing extends Generic.ListParsingConfig, ItemParsing {
      parser?: LevelParserHook<Showtime[]>
      delimiter?: string | RegExp
    }

    export interface ParsingLevelConfig {
      forEach?: ForEach.ListParsing
      auditoria?: Auditoria.ListParsing
      movies?: Movies.ListParsing
      versions?: Versions.ListParsing
      dates?: Dates.ListParsing
      periods?: Periods.ListParsing
      showtimes?: ListParsing
      table?: TableParser.ParsingConfig
      tabs?: TabsParser.ParsingConfig
    }

    export interface ResponseParsingConfig extends Generic.ListParsingConfig, ParsingLevelConfig { }

    export interface CrawlingConfig extends Generic.ListCrawlingConfig, ParsingLevelConfig {
      preserveLateNightShows: boolean      
    }
  }

  export namespace Periods {
    export interface ItemParsing extends PeriodParsingConfig { }
    export interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig { }
  }

  export namespace Dates {
    export interface ItemParsing extends DateParsingConfig { }
    export interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig {
      parser?: LevelParserHook<DatesArray>
    }
    export interface CrawlingList extends Generic.ListCrawlingConfig, ItemParsing { }
    export interface CrawlingConfig {
      list: CrawlingList
      showtimes: Showtimes.CrawlingConfig
    }
  }

  export namespace Auditoria {
    export interface ItemParsing extends AuditoriumParsingConfig { }
    export interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig { }
  }

  export namespace Versions {
    export interface ItemParsing extends VersionParsingConfig { }
    export interface ListParsing extends Generic.ListParsingConfig, ItemParsing, Showtimes.ParsingLevelConfig { }
  }

  export namespace ForEach {
    export interface ListParsing extends Generic.ListParsingConfig, Showtimes.ParsingLevelConfig { }
  }

  /** for parsing 
   * - table headerRow 
   * - table headerColumn
   * - tabs buttons */
  export interface HeaderParsingConfig {
    date?: ValueGrabbing
    dates?: ValueGrabbing<string> | ValueGrabbing<Date> | ValueGrabbing<moment.Moment>
    auditorium?: ValueGrabbing
    time?: ValueGrabbing
    movieTitle?: ValueGrabbing
  }

  export interface Hooks extends RequestMakerHooks {
    /** Hook to perform some preparation work, such as building cookies or crawling addiontal data. */
    beforeCrawling?: (context: Context, callback: (err: Error) => void) => void
    /** Hook to replace the entire response handling (including parsing) of cinema list pages. */
    handleCinemasResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void
    /** Hook to replace the entire response handling (including parsing) of cinema detail pages. */
    handleCinemaDetailsResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void
    /** Hook to replace the entire response handling (including parsing) of movie list pages. */
    handleMoviesResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void
    /** Hook to replace the entire response handling (including parsing) of date list pages. */
    handleDatesResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void
    /** Hook to replace the entire response handling (including parsing) of showtimes. */
    handleShowtimesResponse?: (response: superagent.Response, context: Context, callback: CallbackFunction) => void
    /** Hook to clean up output results before saving them to json file. */
    beforeSave?: (data: any, context: Context) => any
    /** Hook to build custom filenames based on crawler.id or cinema properties. */
    buildFilename?: (cinema: Cinema, crawlerId: string, context: Context) => string
    /** Hook to update UI with crawling progress. */
    progress?: (complete: number, total: number) => void
  }
}