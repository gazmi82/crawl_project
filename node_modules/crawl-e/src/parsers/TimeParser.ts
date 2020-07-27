import * as moment from 'moment'
import * as colors from 'colors'

import { ParsingContext } from './ParsingContext'
import Logger from '../Logger'
import MethodCallLogger from '../MethodCallLogger'
import { ItemParser } from './ItemParser'
import { ValueGrabbing } from '../ValueGrabber'
import { styleString, styleMoment } from './DateParser'
import { BaseParser } from './BaseParser';

/**
 * Configuration for grabbing a formatted time stirng & parsing it into moment. 
 * @category HTML Parsing
 */
export interface TimeParsingConfig {
  /** Value Grabber for the time string */
  time?: ValueGrabbing
  timeFormat?: moment.MomentFormatSpecification
  timeLocale?: string
}

/**
 * Parser for parsing formatted time strings. 
 * @category HTML Parsing
 */
export class TimeParser extends BaseParser implements ItemParser<TimeParsingConfig> {
  contextKey = 'time'

  /**
   * Parses a single time from a HTML box and adds it as moment object to the given context's `time` property.
   * @param dateBox the HTML box to grab the time string from
   * @param timeParsingConfig config for grabbing the time string and parsing it
   * @param context the context which to set the `time` property on 
   * @returns the parsed time as moment object
   */
  parse(box: Cheerio, timeParsingConfig: TimeParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    // strict time parsing helps filtering showtimes boxes which don't actually contain showtimes, e.g. empty cells in tables.
    // this might be moved into the config to allow non-strict time parsing
    let useStrictTimeParsing = true
    let timeStr = this.resovleValueGrabber('time', timeParsingConfig).grab(box, context)
    let time = moment(timeStr, timeParsingConfig.timeFormat, timeParsingConfig.timeLocale, useStrictTimeParsing)
    this.logger.debug(`showtimes:selection:time:parsing`, 'timeStr:', styleString(timeStr), 'format:', styleString(timeParsingConfig.timeFormat), 'locale:', styleString(timeParsingConfig.timeLocale), colors.bold(' => '), styleMoment(time, 'HH:mm:ss'))
    context.time = time
    context.popCallstack()
    return time
  }

}
