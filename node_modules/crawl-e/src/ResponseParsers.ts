import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import * as async from 'async'
import * as superagent from 'superagent'

import { SubConfigs } from './Config'
import { Logger, SilentLogger, LoggerProxy } from './Logger'
import Context, { cloneContext } from './Context'
import MethodCallLogger from './MethodCallLogger'
import { Cinema, Movie } from './models'
import TableParser from './parsers/TableParser/TableParser'
import Constants from './Constants'
import TemplaterEvaluator from './TemplaterEvaluator'
import Utils from './Utils'
import { Callback, ListParsingCallback } from './Types'
import { 
  AuditoriumParser, 
  CinemaParser, 
  DateParser, 
  ItemParser,
  MovieParser,
  ParsingContext, 
  TimeParser, 
  VersionParser, 
  ShowtimesParser,
  HeaderParsingContext,
  DatesArray,
  DateParsingConfig,
  MovieParsingConfig,
  VersionParsingConfig,
  DateStringParsingConfig
} from './parsers'
import { Moment } from 'moment';
import { PeriodParser } from './parsers/PeriodParser';
import ValueGrabber from './ValueGrabber';
import Mappers from './Mappers';
import TabsParser from './parsers/TabsParser';


export type CallbackFunction = (err?: Error, result?: any) => void
export type BoxIterator = (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => void
export type ResponseHandler<T> = (response: superagent.Response, context: Context, callback: Callback<T>) => void
type LevelParserHookSync<T> = (container: Cheerio, context: ParsingContext) => T
type LevelParserHookASync<T> = (container: Cheerio, context: ParsingContext, callback: Callback<T>) => void
export type LevelParserHook<T> = LevelParserHookSync<T> | LevelParserHookASync<T>

export interface DatePage {
  /** The pages date as [momentjs](http://momentjs.com/) object */
  date: Moment
  /** The date's href, which should contain a path string relative to the webiste's base url. */
  href: string
}

/** @private */
export function debugLogFoundBoxesCount(logger: Logger, scope: string, count: number) {
  logger.debug(`${scope}:count`, `found ${count} box${count === 1 ? '' : 'es'}`)
}

/**
 * Base ResponseParser, which supports 
 * - loading the HTML and creating a ParsingContext 
 * - parsing of lists 
 */
export abstract class BaseHtmlParser {
  private _logger: LoggerProxy

  constructor() {
    this._logger = new LoggerProxy(new SilentLogger())
  }

  get logger(): Logger {
    return this._logger
  }

  set logger(newLogger: Logger) {
    this._logger.logger = newLogger
  }

 /**
   * Detects arbitrary lists at iterates over it's boxes asyncroniously.
   * @param container The base container which is the entrypoint
   * @param listName The name of the list, used for debug logs 
   * @param listConfig The config for parsing the list
   * @param boxIterator A callback function which will be called for each box found in the list
   * @param callback The completion callback which will be called with final parsed data objects and opionally a url for the next page to crawl
   */
  parseList<T>(container: Cheerio, context: ParsingContext, listName: string, listConfig: SubConfigs.Generic.ListParsingConfig, boxIterator: (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => void, callback: ListParsingCallback<T>) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let $ = context.cheerio
    let boxSelector = TemplaterEvaluator.evaluate(listConfig.box, context)

    let boxes = boxSelector === Constants.BOX_SELECTOR
      ? [container]
      : container.find(boxSelector).toArray()

    debugLogFoundBoxesCount(this.logger, `${listName}:selection`, boxes.length)

    async.mapSeries(Utils.limitList(boxes as any[]), (box, cb) => {
      let cheerioBox = $(box)
      this.logger.debug(`${listName}:selection:box`, '%s', $.html(cheerioBox).trim())
      boxIterator(cheerioBox, cloneContext(context), cb)
    }, (err: Error, items: T[]) => {
      items = _.select(items, item => (typeof item === 'string') || _.chain(Utils.compactObj(item)).keys().any().value())

      let nextPageUrl: string 
      if (listConfig.nextPage) {
        let nextPageUrlGrabber = new ValueGrabber(listConfig.nextPage, this.logger, 'next-page', Mappers.mapHref)
        nextPageUrl = nextPageUrlGrabber.grabFirst(container, context)
      }
      callback(err, items, nextPageUrl)
    })
  }
  
  /**
   * Loads the html text of a response into a cheerio container and creates a corresponding parsing context. 
   * @param response 
   * @param context 
   */
  prepareHtmlParsing(html: string, context: Context) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    let $ = cheerio.load(html)
    let parsingContext: ParsingContext = context
    parsingContext.cheerio = $
    context.popCallstack()
    return {
      container: $('html'),
      parsingContext: parsingContext
    }
  }
}

export class DefaultResponseParser extends BaseHtmlParser {
  cinemaParser: CinemaParser
  auditoriumParser: AuditoriumParser
  dateParser: DateParser
  timeParser: TimeParser
  versionParser: VersionParser
  movieParser: MovieParser
  showtimesParser: ShowtimesParser
  periodParser: PeriodParser

  constructor() {
    super()
    this.cinemaParser = new CinemaParser(this.logger)
    this.auditoriumParser = new AuditoriumParser(this.logger)
    this.dateParser = new DateParser(this.logger)
    this.timeParser = new TimeParser(this.logger)
    this.periodParser = new PeriodParser(this.logger, this.dateParser)
    this.versionParser = new VersionParser(this.logger)
    this.movieParser = new MovieParser(this.logger, this.versionParser)
    this.showtimesParser = new ShowtimesParser(this.logger, this.dateParser, this.timeParser, this.versionParser)
  } 

  /**
   * Handles the repsonse of a cinemas parsing a list of cinemas
   */
  handleCinemasResponse(response: superagent.Response, listConfig: SubConfigs.Cinemas.List, context: Context, callback: ListParsingCallback<Cinema>) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
    parsingContext.listName = 'cinemas.list'
    this.parseList(container, context, 'cinemas', listConfig, (box, context, cb) => {
      cb(null, this.cinemaParser.parseCinema(box, listConfig, context))
    }, callback)
  }

  /**
   * Handle the response of a single cinema's details page. Parses details and provides a partial cinema object via callback.
   */
  handleCinemaDetailsResponse(response: superagent.Response, detailsParsingConfig: SubConfigs.Cinemas.Details, context: Context, callback: Callback<Partial<Cinema>>) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
    parsingContext.listName = 'cinemas.details'
    callback(null, this.cinemaParser.parseCinema(container, detailsParsingConfig, parsingContext))
  }

  handleMoviesResponse(response: superagent.Response, listConfig: SubConfigs.Movies.ListParsing, context: Context, callback: ListParsingCallback<Movie>) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
    callback = this.resultsFlattenCallback(callback)
    this.parseMovies(container, listConfig, parsingContext, null, callback)
  }

  handleDatesResponse(response: superagent.Response, config: SubConfigs.Dates.ListParsing, context: Context, callback: ListParsingCallback<DatePage>) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
    callback = this.resultsFlattenCallback(callback)

    this.parseList(container, parsingContext, 'dates', config, (box, context, cb) => {
      let date = this.dateParser.parse(box, config, context)
      let href = new ValueGrabber(config.href, this.logger, 'dates').grab(box, context)
      cb(null, { date, href })
    }, callback)
  }

  handleShowtimesResponse(response: superagent.Response, config: SubConfigs.Showtimes.ResponseParsingConfig, context: Context, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
    callback = this.resultsFlattenCallback(callback)

    // Each levels box acts as the next levels container.
    // So the response a showtimes page it the container 
    // for what ever it's first model to iterate is.
    let parser = this.boxIterator(config, parsingContext)
    if (parser) {
      parser(container, parsingContext, callback)
    } else {
      this.logger.warn('could not find parsing entry for showtimesResponse')
      callback(null, [])
    }
  } 

  private boxIterator(subConfig: SubConfigs.Showtimes.ParsingLevelConfig, context: ParsingContext): BoxIterator {
    MethodCallLogger.logMethodCall()

    if (!subConfig) {
      this.logger.warn('counld not find next level box iterator for', subConfig)
      return null
    }

    function asyncifyParserHook<T>(parser: LevelParserHook<T>): LevelParserHookASync<T> {
      return (parser.length < 3
        ? async.asyncify(parser)
        : parser) as LevelParserHookASync<T>
    }

    if (subConfig.showtimes) {
      return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
        let parseShowtimes = subConfig.showtimes.parser
          ? (container, showtimesConfig, context, callback) => {
            let parse = asyncifyParserHook(subConfig.showtimes.parser)
            parse(container, context, callback)
          }
          : this.showtimesParser.parseShowtimes.bind(this.showtimesParser)
        parseShowtimes(box, subConfig.showtimes, context, cb)        
      }
    }

    if (subConfig.periods) {
      return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
        let nextIterator = this.boxIterator(subConfig.periods, context)
        this.parsePeriods(box, subConfig.periods, context, nextIterator, cb)
      }
    }       

    if (subConfig.dates) {
      if (subConfig.dates.parser) {
        return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
          let nextIterator = this.boxIterator(subConfig.dates, context)
          let parseDates = asyncifyParserHook(subConfig.dates.parser)
          async.waterfall([
            (cb) => parseDates(box, context, cb), 
            (dates, cb) => {
              if (!nextIterator) {
                return cb(null, [])
              }
              let perDateContexts: ParsingContext[] = []
              this.dateParser.iterateDates(dates, context, subConfig.dates, context => perDateContexts.push(context))
              async.mapSeries(Utils.limitList(perDateContexts), (context, callback) => {
                nextIterator(box, context, callback)
              }, cb)
            }
          ], cb)          
        }
      } else {
        return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
          let nextIterator = this.boxIterator(subConfig.dates, context)
          this.parseDates(box, subConfig.dates, context, nextIterator, cb)
        }
      }
    }

    if (subConfig.auditoria) {
      return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
        let nextIterator = this.boxIterator(subConfig.auditoria, context)
        this.parseAuditoria(box, subConfig.auditoria, context, nextIterator, cb)
      }
    }

    if (subConfig.movies) {
      return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
        let nextIterator = this.boxIterator(subConfig.movies, context)
        this.parseMovies(box, subConfig.movies, context, nextIterator, cb)
      }
    }

    if (subConfig.versions) {
      return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
        let nextIterator = this.boxIterator(subConfig.versions, context)
        this.parseVersions(box, subConfig.versions, context, nextIterator, cb)
      }
    }

    if (subConfig.forEach) {
      return (box: Cheerio, context: ParsingContext, cb: CallbackFunction) => {
        let nextIterator = this.boxIterator(subConfig.forEach, context)
        nextIterator = nextIterator || ((box, context, cb) => cb(null))
        this.parseList(box, context, 'forEach', subConfig.forEach, nextIterator, cb)
      }
    }

    if (subConfig.table) {
      return (box: Cheerio, parsingContext: ParsingContext, cb: CallbackFunction) => {
        let context = parsingContext as HeaderParsingContext
        let showtimes = []

        let thisRef = this
        let $ = context.cheerio
        let headerCellIterator = (headerConfig: any, debugToken: string) => {
          return (cell: Cheerio, context: HeaderParsingContext) => {
            thisRef.parseHeaderBox(cell, context, headerConfig, `table:header:${debugToken}`)
          }
        }

        let headerRowIterator = headerCellIterator(subConfig.table.headerRow, 'row')
        let headerColIterator = subConfig.table.headerColumn
          ? headerCellIterator(subConfig.table.headerColumn, 'column')
          : null

        let contentCellIterator: TableParser.CellIterator<void> = (cell: Cheerio, context: HeaderParsingContext, callback?: async.ErrorCallback<{}>) => {
          this.logger.debug(`table:content-cell`, '%o: %s', context.indexes.table, $.html(cell).trim())

          let boxIterator = this.boxIterator(subConfig.table.cells, context)
          if (!boxIterator) { return callback(null) }

          if (context.dates) {
            thisRef.dateParser.iterateMomentDatesAsync(context.dates, context, (context, cb) => {
              boxIterator(cell, context, (err, cellShowtimes) => {
                showtimes = _.union(showtimes, cellShowtimes)
                cb(err)
              })
            }, callback)
          } else {
            boxIterator(cell, context, (err, cellShowtimes) => {
              showtimes = _.union(showtimes, cellShowtimes)
              callback(err)
            })
          }
        }

        let tableSelector = TemplaterEvaluator.evaluate(subConfig.table.selector, context)
        let table = subConfig.table.selector === Constants.BOX_SELECTOR
          ? box
          : box.find(tableSelector).first()

        this.logger.debug(`table`, '%s', context.cheerio(table).html())
        let contentCellFilter = (subConfig.table as TableParser.ParsingConfig).cells.filter ||  TableParser.emptyCellFilter
        TableParser.parseTable(
          table,
          context,
          this.logger,
          {
            headerRow: headerRowIterator,
            headerCol: headerColIterator,
            content: contentCellIterator, 
            contentCellFilter: contentCellFilter
          },
          subConfig.table,
          (err, res) => {
            cb(err, showtimes)
          }
        )
      }
    }

    if (subConfig.tabs) {
      return (box: Cheerio, parsingContext: ParsingContext, cb: CallbackFunction) => {
        let thisRef = this
        TabsParser.parseTabs(
          box, 
          parsingContext, 
          thisRef.logger, 
          subConfig.tabs, 
          {
            buttons: (box: Cheerio, parsingContext: ParsingContext, cb: CallbackFunction) => {
              thisRef.parseHeaderBox(box, parsingContext, subConfig.tabs.buttons, `tabs:buttons`)
              cb()
            },
            cards: this.boxIterator(subConfig.tabs.cards, parsingContext) || ((box, context, cb) => cb())
          }, 
          (err, showtimes) => cb(err, showtimes || [])
        )
      }
    }

    this.logger.warn('counld not find next level box iterator for', subConfig)
    return null
  }

  private parseHeaderBox(box: Cheerio, context: HeaderParsingContext, headerConfig: SubConfigs.HeaderParsingConfig, debugPrefix: string) {
    let $ = context.cheerio
    this.logger.debug(debugPrefix, '%o: %s', context.indexes.table, $.html(box).trim())
    if (headerConfig.auditorium) {
      this.auditoriumParser.parse(box, headerConfig, context)
    }
    if (headerConfig.date) {
      this.dateParser.parse(box, (headerConfig as DateParsingConfig), context)
    }
    if (headerConfig.dates) {
      let dates: DatesArray = new ValueGrabber(headerConfig.dates, this.logger, 'dates').grabAll(box, context)
      context.dates = this.dateParser.mapDates(dates, context, (headerConfig as DateStringParsingConfig))
    }
    if (headerConfig.time) {
      this.timeParser.parse(box, headerConfig, context)
    }
    if (headerConfig.movieTitle) {
      this.movieParser.parse(box, (headerConfig as MovieParsingConfig), context)
    }
    if (_.any(['is3d', 'isImax', 'language', 'subtitles'], key => _.has(headerConfig, key))) {
      this.versionParser.parse(box, (headerConfig as VersionParsingConfig), context)
    }              
  }

  private resultsFlattenCallback = (callback) => (err, result) => {
    if (result instanceof Array) {
      result = _.chain(result).flatten().compact().value()
    }
    callback(err, result)
  }

  /** Parses and iterates a level of items such as movies, version, auditoria */

  parseLevel<T>(levelName: string, container: Cheerio, parsingConfig: any, itemParser: ItemParser<T>, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    this.parseList(container, context, levelName, parsingConfig, (box, context, cb) => {
      itemParser.parse(box, parsingConfig, context)
      if (iterator) {
        iterator(box, context, cb)
      } else {
        cb(null, context[itemParser.contextKey])
      }
    }, callback)
  }

  parseMovies(moviesContainer: Cheerio, moviesConfig: SubConfigs.Movies.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    this.parseLevel('movies', moviesContainer, moviesConfig, this.movieParser, context, iterator, callback)
  }

  parseDates(datesContainer: Cheerio, datesConfig: SubConfigs.Dates.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    this.parseLevel('dates', datesContainer, datesConfig, this.dateParser, context, iterator, callback)
  }

  parseAuditoria(auditoriaContainer: Cheerio, auditoriaConfig: SubConfigs.Auditoria.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    this.parseLevel('auditoria', auditoriaContainer, auditoriaConfig, this.auditoriumParser, context, iterator, callback)
  }

  parseVersions(versionsContainer: Cheerio, versionsConfig: SubConfigs.Versions.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    this.parseLevel('versions', versionsContainer, versionsConfig, this.versionParser, context, iterator, callback)
  }

  parsePeriods(periodsContainer: Cheerio, periodsConfig: SubConfigs.Periods.ListParsing, context: ParsingContext, iterator: BoxIterator, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    this.parseLevel('periods', periodsContainer, periodsConfig, this.periodParser, context, iterator, callback)
  }
  
}
