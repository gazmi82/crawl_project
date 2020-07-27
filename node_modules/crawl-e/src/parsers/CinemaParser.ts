import { Cinema } from '../models'
import { ParsingContext } from './ParsingContext'
import MethodCallLogger from '../MethodCallLogger'
import Utils from '../Utils'
import ValueGrabber, { ValueGrabbing } from '../ValueGrabber'
import { BaseParser } from './BaseParser'
import { GeoLocation } from '../models/GeoLocation'

/**
 * @category HTML Parsing
 */
export interface CineamParsingConfig {
  id?: ValueGrabbing
  name: ValueGrabbing
  href?: ValueGrabbing
  slug?: ValueGrabbing
  address?: ValueGrabbing
  phone?: ValueGrabbing
  email?: ValueGrabbing
  website?: ValueGrabbing
  location?: ValueGrabbing<GeoLocation>
  isTemporarilyClosed?: ValueGrabbing<boolean>
}

/**
 * @category HTML Parsing
 */
export class CinemaParser extends BaseParser {

  logPrefix = `cinemas`

  parsingConfig: CineamParsingConfig

  /** 
   * Parses a single cinema from a box
   * @returns a cinema object with it's parsed properties
   */
  parseCinema(cinemaBox, cinemaParsingConfig: CineamParsingConfig, context: ParsingContext): Partial<Cinema> {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    this.logPrefix = context.listName
    this.parsingConfig = cinemaParsingConfig
    if (cinemaParsingConfig.isTemporarilyClosed) {      
      context.isTemporarilyClosed = !!this.grabProperty('isTemporarilyClosed', cinemaBox, context)
    }
    let locationGrabber = new ValueGrabber(cinemaParsingConfig.location, this.logger, this.valueGrabberLogPrefix('location'), Utils.parseMapsUrl)
    let location: Partial<GeoLocation> = locationGrabber.grabFirst(cinemaBox, context) || {}
    let cinema = Utils.compactObj({
      id: this.grabProperty('id', cinemaBox, context),
      name: this.grabProperty('name', cinemaBox, context),
      slug: this.grabProperty('slug', cinemaBox, context),
      address: this.grabProperty('address', cinemaBox, context),
      phone: this.grabProperty('phone', cinemaBox, context),
      email: this.grabProperty('email', cinemaBox, context),
      lat: location.lat,
      lon: location.lon,
      href: this.grabProperty('href', cinemaBox, context),
      website: this.grabProperty('website', cinemaBox, context)
    })
    this.logger.debug(`${context.listName || 'cinemas'}:result`, cinema)
    context.popCallstack()
    return cinema
  }

}