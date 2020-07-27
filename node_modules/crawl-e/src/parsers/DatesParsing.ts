/**
 * This file contains functions for parsing more complex dates strings as examples show below. 
 * It plugs into the dates value grabbing on showtimes parsing. 
 * 
 *   Sat 3/24 12:50 3:50 6:40 9:05 
 *   Mon 3/26 - Wed 3/28 4:10 7:10
 *   Mon 3/26 & Tue 3/27 4:30 7:30
 * 
 */

import * as _ from 'underscore'
import * as moment from 'moment'
import * as colors from 'colors'
import Logger, { DefaultLogger } from '../Logger'
import { styleString, styleMoment } from './DateParser';

export namespace DatesParsing {

  export interface Config {
    /** format for parsing date sub-strings */
    dateFormat: moment.MomentFormatSpecification
    
    /** regular expression to find dates, will be inferred from `dateFormat` if omitted */
    dateRegexPattern?: string

    /** locale for parsing the date with moment, defaults to `'en'` */
    dateLocale?: string

    /** string or regex pattern to find a date range */
    rangeSeparator?: string

    /** string or regex pattern to find a list of dates */
    compoundSeparator?: string
  }

  /** builds a regular expression for giving date format to find matching sub-strings. */
  function dateFormatToRegexPattern(format: moment.MomentFormatSpecification, locale = 'en'): string {
    format = `${format}`

    const monthRegex = /M+/
    const monthFormat = format.match(monthRegex)[0]
    let monthPattern = ''
    if (monthFormat) {
      if (monthFormat.length === 1) { monthPattern += '0?' }
      monthPattern += `(${_.range(0,12).map(i => moment(0).add(i, 'months').locale(locale).format(monthFormat)).join('|')})`
    }
    
    return format
    .replace(/\./, '\\.')
    .replace(/[DY]/g, '\\d')
    .replace(monthRegex, monthPattern)
  }

  /** 
   * Parses individual dates, ranges of dates and compound dates from the given text.
   * @param text input text to parse
   * @param config configuarion for dates parsing
   * @returns an array of dates as momentjs objects.
   */
  export function parseDates(text: string, config: Config, logger: Logger = new DefaultLogger()): moment.Moment[] {
    let result: moment.Moment[] = []
    let dateLocale = config.dateLocale || 'en'
    let dateRegexPattern = config.dateRegexPattern || dateFormatToRegexPattern(config.dateFormat, dateLocale)
    let dateRegex = new RegExp(dateRegexPattern)
    logger.debug(`dates:parsing`, `using dateRege ${dateRegex}`)
    let rangeRegex = new RegExp(`(${dateRegexPattern}).*${config.rangeSeparator}[^\\d]*(${dateRegexPattern})`)
    let compoundRegex = new RegExp(`(${dateRegexPattern}).*(${config.compoundSeparator}[^\\d]*(${dateRegexPattern}))+`)


    function parseDateStr(dateStr, scope) {
      let date = moment(dateStr, config.dateFormat, dateLocale)
      logger.debug(`dates:parsing:${scope}`, 
        'dateStr:', styleString(dateStr), 
        'format:', styleString(config.dateFormat), 
        'locale:', styleString(dateLocale), 
        colors.bold(' => '), styleMoment(date, 'YYYY-MM-DD'))
      return date
    }

    logger.debug(`dates:parsing`, 'text:', text)      
    if (rangeRegex.test(text)) {
      let range = text.match(rangeRegex)
      range = range
        .slice(1, range.length)
        .filter(s => dateRegex.test(s))

      logger.debug(`dates:parsing`, 'found range:', range.join(' → '))
      let fromDate = parseDateStr(range[0], 'range:dateFrom')
      let toDate = parseDateStr(range[1], 'range:dateTo')

      let dates: moment.Moment[] = []
      let date = fromDate
      while (date.unix() <= toDate.unix()) {
        dates.push(date)
        date = moment(date).add(1, 'day')
      }
      result = dates
    } else if (compoundRegex.test(text)) {
      let dateStrings = text.split(new RegExp(config.compoundSeparator, 'g')).map(t => t.match(dateRegex)[0])
      logger.debug(`dates:parsing`, 'found compound:', dateStrings.join(' & '))
      result = dateStrings.map(str => parseDateStr(str, 'compound-list'))
    } else if (dateRegex.test(text)) {
      let dateString = text.match(dateRegex)[0]
      logger.debug(`dates:parsing`, 'found individual:', dateString)
      result = [parseDateStr(dateString, 'individual')]
    } else {
      logger.debug(`dates:parsing`, 'found no dates')        
    }
    logger.debug(`dates:parsing`, 'result:', result.map(r => r.format('YYYY-MM-DD')))
    return result
  }
}


