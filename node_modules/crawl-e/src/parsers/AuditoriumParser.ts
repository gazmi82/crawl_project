import { ParsingContext } from './ParsingContext'
import { ItemParser } from './ItemParser'
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';

/**
 * @category HTML Parsing
 */
export interface AuditoriumParsingConfig {
  auditorium?: ValueGrabbing
}

/**
 * @category HTML Parsing
 */
export class AuditoriumParser extends BaseParser implements ItemParser<AuditoriumParsingConfig> {
  contextKey = 'auditorium'
  logPrefix = 'auditoria'

  /** parses a single auditorium title from a box and adds it to the context */
  parse(auditoriumBox: Cheerio, auditoriumConfig: AuditoriumParsingConfig, context: ParsingContext) {
    context.auditorium = this.resovleValueGrabber('auditorium', auditoriumConfig).grabFirst(auditoriumBox, context)
  }

}