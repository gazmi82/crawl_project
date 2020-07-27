import Warnings from './Warnings'
import * as _ from 'underscore'
import * as tv4 from 'tv4'
import { Cinema, CinemaShowtimesCrawlerMetainfo, Showtime, OutputData } from './models'
import Context from './Context'


/** @private */
const showtimeSchema = require('./../spec/output-schema_showtime.json')

export interface CinemaShowtimesOutputData extends OutputData {
  crawler: CinemaShowtimesCrawlerMetainfo
  cinema: Cinema
  showtimes: Showtime[]
}

type OutputDataValidator = (data: CinemaShowtimesOutputData, context: Context) => Warnings.Warning[]

/** @private */
const checks:(OutputDataValidator)[] = [
  // validate OutputSchema
  (data, context: Context) => {
    let outputDataSchema = {
      '$schema': 'http://json-schema.org/draft-04/schema',
      'title': 'Output JSON Schema',
      'type': 'object',
      'properties': {
        'showtimes': {
          'type': 'array',
          'items': showtimeSchema
        }
      }
    }

    if (!tv4.validate(data, outputDataSchema)) {
      class OutputSchemaValidationWarning implements Warnings.Warning {
        public code: number = Warnings.CODES.OUTPUT_SCHEMA_VALIDATION_ERROR
        public title: string = 'Output Validation Error'
        public details: any
        constructor(error: any, data: any) {
          this.details = {
            error: error,
            data: data
          }
        }
        public formatDetails() {
          return `Schema validation failed: ${this.details.error.message} at ${this.details.error.dataPath}`
        }
      }
      return [new OutputSchemaValidationWarning(tv4.error, data)]
    }
    return []
  }, 

  // check cinema.address 
  (data, context: Context) => {
    if (data.cinema.address === undefined) {
      return [{
        code: Warnings.CODES.CINEMA_WIHOUT_ADDRESS,
        title: 'cinema without address'
      }]
    }
    return []
  },

  // check cinema.slug 
  (data, context: Context) => {
    if (data.cinema.slug && data.cinema.slug.indexOf('_') > -1) {
      return [{
        code: Warnings.CODES.CINEMA_WITH_INVALID_SLUG,
        title: 'cinema.slug contains underscore'
      }]
    }
    return [] 
  }, 
  
  // check for empty showtimes 
  (data, context: Context) => {
    if (data.showtimes.length === 0 && !context.isTemporarilyClosed) {
      return [{
        code: Warnings.CODES.NO_SHOWTIMES,
        title: 'no showtimes'
      }]
    }
    return []
  },

  // check for duplicated booking links
  (data, context: Context) => {
    var warnings: Warnings.Warning[] = []
    var bookingLinksGrouped = _.chain(data.showtimes)
                               .filter((show) => !!show.booking_link)
                               .countBy((show) => show.booking_link)
                               .value()
    var duplicatedBookingLinks = _.filter(_.keys(bookingLinksGrouped), (key) => bookingLinksGrouped[key] > 1)
    if (duplicatedBookingLinks.length > 0) {
      warnings.push({
        code: Warnings.CODES.DUPLICATED_BOOKING_LINKS,
        title: 'duplicated booking links',
        details: {
          bookingLinks: duplicatedBookingLinks
        }
      })
    }
    return warnings
  },

  // check is_booking_link_capable marker
  (data, context: Context) => {
    var hasBookingLink = _.find(data.showtimes, (show: any) => show.booking_link) !== undefined
    if (data.showtimes.length > 0 && ((data.crawler.is_booking_link_capable && !hasBookingLink) || (!data.crawler.is_booking_link_capable && hasBookingLink))) {
      return [{
        code: Warnings.CODES.WRONG_IS_BOOKING_LINK_CAPABLE,
        title: 'crawler.is_booking_link_capable value appears wrong',
        recoveryHint: 'If you finished all configurations and still see this warning please add the following to the top of the config object.' +
          `\n\n  crawler: {is_booking_link_capable: ${hasBookingLink}},`
      }]
    }
    return []
  },

  // check showtimes having proper start_at time
  (data, context: Context) => {
    if (data.showtimes.length > 0 && data.showtimes.filter(showtime => showtime.start_at && showtime.start_at.match('00:00:00')).length === data.showtimes.length) {
      return [{
        code: Warnings.CODES.FAULTY_START_TIMES,
        title: `all (${data.showtimes.length}) showtimes are at 00:00:00`
      }]
    }
    return []
  }
]

export default class OutputValidator {
  /** Validates output data for cinema showtimes crawling */
  static validate(data: CinemaShowtimesOutputData, context: Context): Warnings.Warning[] {
    return _.chain(checks)
      .map<Warnings.Warning[]>((check: OutputDataValidator) => check(data, context))
      .flatten()
      .value()
  }
}
