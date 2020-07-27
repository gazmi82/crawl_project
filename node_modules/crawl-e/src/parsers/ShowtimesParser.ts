import * as cheerio from 'cheerio'
import * as url from 'url'
import * as _ from 'underscore'
import * as moment from 'moment'

import Logger from '../Logger'
import MethodCallLogger from '../MethodCallLogger'
import Constants from '../Constants'
import TemplaterEvaluator from '../TemplaterEvaluator'
import { Movie, MovieVersion, Showtime } from '../models'
import { CallbackFunction, debugLogFoundBoxesCount } from '../ResponseParsers'
import { cloneContext } from '../Context'
import Utils from '../Utils'
import Warnings from '../Warnings'
import { SubConfigs } from '../Config'
import { ParsingContext } from './ParsingContext'
import { LanguageParsingConfig } from './LanguageParser'
import { DateParser, DateParsingConfig, DatesArray, DatesIValueGrabver } from './DateParser'
import { TimeParsingConfig, TimeParser } from './TimeParser'
import { VersionParsingConfig, VersionParser } from './VersionParser'
import { AuditoriumParsingConfig } from './AuditoriumParser'
import { IndirectMovieParsingConfig } from './MovieParser'
import ValueGrabber, { IValueGrabber, ValueGrabbing } from '../ValueGrabber'
import { BaseParser } from './BaseParser';

/** @private */
const defaultTimeFormat = 'HH:mm' // configSchema.properties.showtimes.oneOf[0].properties.showtimes.properties.timeFormat.default

/**
 * ShowtimeItemParsingConfig
 * @category HTML Parsing
 */
export interface ShowtimeItemParsingConfig extends LanguageParsingConfig, TimeParsingConfig, VersionParsingConfig, AuditoriumParsingConfig, IndirectMovieParsingConfig {
  /** Value Grabber for the date string */
  date?: ValueGrabbing
  dates?: DatesIValueGrabver
  dateFormat?: string
  dateLocale?: string
  datetimeParsing?: boolean
  datetimeFormat?: string
  datetimeLocale?: string
  preserveYear?: boolean  
  bookingLink?: ValueGrabbing
}

interface ParsingItem {
  box: Cheerio, 
  context: ParsingContext 
}

/**
 * ShowtimesParser
 * @category HTML Parsing
 */
export class ShowtimesParser extends BaseParser {
  constructor(logger: Logger, private dateParser: DateParser, private timeParser: TimeParser, private versionParser: VersionParser) { 
    super(logger)
  }
  
  parseShowtimes(showtimesContainer: Cheerio, showtimesConfig: SubConfigs.Showtimes.ListParsing, context: ParsingContext, callback: CallbackFunction) {
    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    context.movie = context.movie || {} as Movie
    context.version = context.version || {} as MovieVersion

    let $ = context.cheerio
    let results = [] 
    let showtimesBoxSelector = TemplaterEvaluator.evaluate(showtimesConfig.box, context)
    let showtimesBoxes = showtimesBoxSelector === Constants.BOX_SELECTOR
      ? [showtimesContainer]
      : showtimesContainer.find(showtimesBoxSelector).toArray().map(e => $(e))
      
    debugLogFoundBoxesCount(this.logger, `showtimes:selection`, showtimesBoxes.length)
    let thisRef = this

    if (showtimesConfig.delimiter) {
      showtimesBoxes = _.flatten(showtimesBoxes.map(box => {
        return box.html().split(showtimesConfig.delimiter).map(str => {
          let subBox = cheerio.load(str).root()
          subBox.get(0).parent = box.get(0)
          return subBox
        })
      }))
    }

    let parentContext = context
    Utils.limitList(showtimesBoxes).forEach(element => {
      let box = $(element)
      thisRef.logger.debug(`showtimes:selection:box`, '%s', $.html(element).trim())

      let parsingItems: {box: Cheerio, context: ParsingContext}[] = []

      if (showtimesConfig.dates) {
        let dateParsingConfig = this.dateParsingConfig(showtimesConfig)
        let dates = new ValueGrabber(showtimesConfig.dates, this.logger, 'showtimes:selection:dates').grabAll(box, context)
        this.dateParser.iterateDates(
          dates, 
          parentContext, 
          dateParsingConfig,
          context => parsingItems.push({ box, context })
        )
      } else {
        let context: ParsingContext = cloneContext(parentContext)
        parsingItems.push({box, context})        
      }

      results = _.union(results, thisRef.parseItems(parsingItems, showtimesConfig))
    })

    callback(null, results)
  }

  private parseItems(items: ParsingItem[], showtimesConfig: SubConfigs.Showtimes.ListParsing): Showtime[] {
    let showtimes = []
    items.forEach(item => {
      let showtime = this.parseShowtime(item.box, showtimesConfig, item.context)
      // filter empty showtime 
      if (_.chain(showtime).values().compact().any().value()) {
        showtimes.push(Utils.compactObj(showtime))
      }
    })      
    return showtimes
  }


  private parseShowtime(box: Cheerio, showtimesConfig: SubConfigs.Showtimes.ListParsing, context: ParsingContext) {
    this.resolveFallbacksAndDefaults(showtimesConfig)
    this.parsingConfig = showtimesConfig
    let time
    let datetime
    if (!showtimesConfig.datetimeParsing) {      
      datetime = this.grabProperty('date', box, context)
    }
    else {
      if (!context.date) {
        let dateParsingConfig = this.dateParsingConfig(showtimesConfig)
        this.dateParser.parse(box, dateParsingConfig, context)
      }
      datetime = context.date
    }

    if (moment.isMoment(datetime) && !datetime.isValid()) {
      this.logger.debug(`showtimes:selection`, `skipping showtime due to invalid date`)
      context.addWarning({
        code: Warnings.CODES.SKIPPED_SHOWTIMES,
        title: `Skipped showtimes due to invalid date.`,
        recoveryHint: `Run again with -v date:parsing to check debug outputs for more information.`
      })
      return
    }

    if (context.time) {
      time = context.time
    }
    else if (showtimesConfig.datetimeParsing) {
      let timeParsingConfig: TimeParsingConfig = {
        time: showtimesConfig.time,
        timeFormat: showtimesConfig.timeFormat || showtimesConfig.datetimeFormat || defaultTimeFormat,
        timeLocale: showtimesConfig.timeLocale || showtimesConfig.datetimeLocale
      }
      time = this.timeParser.parse(box, timeParsingConfig, context)
      if (!time.isValid()) {
        this.logger.debug(`showtimes:selection`, `skipping showtime due to invalid time`)
        context.addWarning({
          code: Warnings.CODES.SKIPPED_SHOWTIMES,
          title: `Skipped showtimes due to invalid time.`,
          recoveryHint: `Run again with -v time:parsing to check debug outputs for more information.`
        })
        return
      }
    }

    if (time) {
      datetime.set({
        hour: time.get('hour'),
        minute: time.get('minute'),
        second: time.get('second')
      })
      datetime = datetime.format('YYYY-MM-DDTHH:mm:ss')
    }

    let bookingLink = this.grabProperty('bookingLink', box, context)
    if (bookingLink && context.requestUrl) {
      bookingLink = url.resolve(context.requestUrl, bookingLink)
      let host = url.parse(bookingLink).host
      bookingLink = bookingLink.replace(new RegExp(`${host}\/${host}`), host)
    }
    
    context.movie.title = context.movie.title || this.grabProperty('movieTitle', box, context)
    context.movie.titleOriginal = context.movie.titleOriginal || this.grabProperty('movieTitleOriginal', box, context)
    let subtitles = context.version.subtitles || this.grabProperty('subtitles', box, context)
    if (subtitles && subtitles instanceof Array) {
      subtitles = _.compact(subtitles).join(',')
    }

    this.versionParser.parse(box, showtimesConfig, context)

    return {
      movie_title: context.movie.title,
      movie_title_original: context.movie.titleOriginal,
      start_at: datetime,
      is_3d: context.version.is3d === true,
      is_imax: context.version.isImax === true ? true : undefined,
      attributes: (context.version.attributes && context.version.attributes.length) ? context.version.attributes : undefined,
      booking_link: bookingLink,
      auditorium: context.auditorium || this.grabProperty('auditorium', box, context),
      language: context.version.language || this.grabProperty('language', box, context),
      subtitles: subtitles
    }
  }

  private dateParsingConfig(showtimesConfig: SubConfigs.Showtimes.ListParsing): DateParsingConfig {
    return {
      date: showtimesConfig.date,
      dateFormat: showtimesConfig.datetimeFormat || showtimesConfig.dateFormat,
      dateLocale: showtimesConfig.datetimeLocale || showtimesConfig.dateLocale,
      preserveYear: showtimesConfig.preserveYear
    }
  }

  private resolveFallbacksAndDefaults(config: SubConfigs.Showtimes.ListParsing) {
    config.time = config.time || config['datetime'] || Constants.BOX_SELECTOR
    config.date = config.date || config['datetime'] || Constants.BOX_SELECTOR
    config.bookingLink = config.bookingLink || (Utils.isLinkTagSelector(config.box) ? ':box@href' : null)
    if (config.datetimeParsing === undefined) {
      config.datetimeParsing = true
    }
  }
}