import * as moment from 'moment'
import * as colors from 'colors'
import * as async from 'async'
import * as _ from 'underscore'

import Constants from '../Constants'
import { ParsingContext } from './ParsingContext'
import MethodCallLogger from '../MethodCallLogger'
import { ItemParser } from './ItemParser'
import { ValueGrabbing } from '../ValueGrabber'
import { cloneContext } from '../Context'
import Utils from '../Utils';
import { BaseParser } from './BaseParser';

/** @private */
export const styleString = str => str 
  ? colors.underline.green(str)
  : colors.inverse.red('null')

/** @private */
export const styleMoment = (m: moment.Moment, format: string) => {
  let color = m.isValid() ? colors.green : colors.red
  return colors.bold(color(m.format(format)))
}

export type AnyDate = string | moment.Moment | Date
export type DatesArray = string[] | moment.Moment[] | Date[]
type DistributeValueGrabbing<U> = U extends any ? ValueGrabbing<U> : never;
export type DatesValueGrabbing = DistributeValueGrabbing<AnyDate>
export type DatesIValueGrabver = DistributeValueGrabbing<AnyDate>

/**
 * @category HTML Parsing
 */
export interface DateStringParsingConfig {
  dateFormat: moment.MomentFormatSpecification
  dateLocale?: string
  preserveYear?: boolean
}

/**
 * @category HTML Parsing
 */
export interface DateParsingConfig extends DateStringParsingConfig {
  date: ValueGrabbing
}

/**
 * DateParser
 * @category HTML Parsing
 */
export class DateParser extends BaseParser implements ItemParser<DateParsingConfig> {
  debugKey = 'dates:selection:date:parsing'  
  contextKey = 'date'
  logPrefix = 'date'

  /**
   * Parses a single date from a HTML box and adds it as moment object to the given context's `date` property.
   * @param dateBox the HTML box to grab the date string from
   * @param dateParsingConfig config for grabbing the date string and parsing it
   * @param context the context which to set the `date` property on 
   * @returns the parsed date as moment object
   */
  parse(dateBox: Cheerio, dateParsingConfig: DateParsingConfig, context: ParsingContext) {    
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    let dateStr = this.resovleValueGrabber('date', dateParsingConfig).grabFirst(dateBox, context)
    let date = this.parseDateStr(dateStr, dateParsingConfig, context) 
    context.popCallstack()
    return date
  }

  /**
   * Parses a date string and sets it as moment object into the given context's `date` property. 
   * @param dateStr the formatted date stirng to parse
   * @param dateParsingConfig config for parsing the date string
   * @param context the context which to set the `date` property on 
   * @returns the parsed date as moment object
   */
  parseDateStr(dateStr: string, dateParsingConfig: DateStringParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    let date: moment.Moment
    function testMatchAnyWords(dateStr: string | undefined, words: string[]) {
      if (typeof dateStr  !== 'string') { return false }
      if (words.indexOf(dateStr.trim()) !== -1) { return true }
      let regex = new RegExp(
        '\\b(' + words
          .map(w => `(${w})`)
          .join('|') + ')\\b',
        'gi'
      )
      return regex.test(dateStr.trim())
    }

    date = moment(dateStr, dateParsingConfig.dateFormat, dateParsingConfig.dateLocale, true)
    let isDateFormatWithoutYear = !/y/i.test(JSON.stringify(dateParsingConfig.dateFormat))
    if (date.isValid() && isDateFormatWithoutYear && !dateParsingConfig.preserveYear) {
      // in case of guessing the year, we will use the closest date to the day 4 month from now, so that:
      // - any date appearing up to 2 month ago shall be treated as past date
      // - all dates appearing up to 10 month from now shall be treated as future dates
      let refDate = moment().add(4, 'months')
      let potentialDates = [
        date.clone().subtract(1, 'year'),
        date,
        date.clone().add(1, 'year')
      ]
      date = _.chain(potentialDates)
        .sortBy(d => Math.abs(refDate.diff(d)))
        .first()
        .value()
    }
    
    if (!date.isValid() && testMatchAnyWords(dateStr, Constants.DAY_AFTER_TOMORROW_WORS)) {
      date = moment().add(2, 'days').set('hour', 0)
      this.logger.debug(this.debugKey, 'dateStr:', styleString(dateStr), '-> matched regex for day after tomorrow', colors.bold(' => '), styleMoment(date, 'YYYY-MM-DD'))
    } else if (!date.isValid() && testMatchAnyWords(dateStr, Constants.TOMORROW_WORS)) {
      date = moment().add(1, 'day').set('hour', 0)
      this.logger.debug(this.debugKey, 'dateStr:', styleString(dateStr), '-> matched tomorrow regex', colors.bold(' => '), styleMoment(date, 'YYYY-MM-DD'))
    } else if (!date.isValid() && testMatchAnyWords(dateStr, Constants.TODAY_WORDS)) {
      date = moment().set('hour', 0)
      this.logger.debug(this.debugKey, 'dateStr:', styleString(dateStr), '-> matched today regex', colors.bold(' => '), styleMoment(date, 'YYYY-MM-DD'))
    } else {
      this.logger.debug(this.debugKey, 'dateStr:', styleString(dateStr), 'format:', styleString(dateParsingConfig.dateFormat), 'locale:', styleString(dateParsingConfig.dateLocale), colors.bold(' => '), styleMoment(date, 'YYYY-MM-DD'))      
    }
    context.date = date
    context.popCallstack()
    return date
  }

  /**
   * Maps any array of dates either as formatted strings, JS Date object or moment objects into a unified array of momemnt data objects. 
   * @param dates 
   * @param context 
   * @param dateParsingConfig 
   */
  mapDates(dates: DatesArray, context: ParsingContext, dateParsingConfig: DateStringParsingConfig): moment.Moment[] {
    if (!Array.isArray(dates)) {
      throw new Error(`dates value grabber must return an array of string, but was ${JSON.stringify(dates)}`)
    }

    return (dates as any[]).map((date, index) => {
      if (!date) {
        throw new Error(`dates value grabber must return an array of string, but found ${date} at index ${index}`)
      }

      switch (date.constructor.name) {
        case 'String': return this.parseDateStr(date, dateParsingConfig, context)
        case 'Date': return moment(date)
        case 'Moment': return date
        default:
          throw new Error(`dates value grabber must return an array of string, but found ${date} (${(date as any).constructor.name}) at index ${index}`)
      }
    })
  }

  iterateDates(dates: DatesArray, parentContext: ParsingContext, dateParsingConfig: DateStringParsingConfig, iterator: (context: ParsingContext) => void) {
    let momentDates = this.mapDates(dates, parentContext, dateParsingConfig)
    this.iterateMomentDates(momentDates, parentContext, iterator)
  }

  /**
   * Iterates over a list of dates, calling the iterator function with a ParsingContext configured for the current data each. 
   * @param dates 
   * @param parentContext 
   * @param iterator 
   */
  iterateMomentDates(dates: moment.Moment[], parentContext: ParsingContext, iterator: (context: ParsingContext) => void) {
    dates.forEach(date => {
      let context: ParsingContext = cloneContext(parentContext)
      context.date = date
      iterator(context)
    })
  }

  /**
   * Iterates asynchronously over a list of dates, calling the iterator function with a ParsingContext configured for the current data each. 
   * @param dates 
   * @param context 
   * @param iterator 
   * @param cb 
   */
  iterateMomentDatesAsync<T>(dates: moment.Moment[], context: ParsingContext, iterator: (context: ParsingContext, cb: Function) => void, cb: any) {
    Utils.mapSeries(dates, context, (date, context, cb) => {
      context.date = date
      iterator(context, cb)
    }, cb)
  }
}


