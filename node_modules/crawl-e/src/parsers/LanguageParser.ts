import { ParsingContext } from './ParsingContext'
import { ItemParser } from './ItemParser'
import ValueGrabber, { ValueGrabbing } from '../ValueGrabber';
import Utils from '../Utils';
import { BaseParser } from './BaseParser';

/**
 * @category HTML Parsing
 */
export interface LanguageParsingConfig {
  language?: ValueGrabbing
  subtitles?: ValueGrabbing
}

/** @private */
const trimmingWrapper = mapper => text => mapper(text.trim())

/**
 * Parser for `language` and `subtitles`.
 * @category HTML Parsing
 */
export class LanguageParser extends BaseParser implements ItemParser<LanguageParsingConfig> {
  contextKey = 'version'

  /**
   * Parses a HTML box and language & subtitles into the given context's `version` property.
   * @param box
   * @param config 
   * @param context the context which to set the language details on 
   * @returns the parsed language details 
   */
  parse(box: Cheerio, config: LanguageParsingConfig, context: ParsingContext) {
    this.resolveValueGrabbers(config)
    let languageDetails = Utils.compactObj({
      language: (config.language as ValueGrabber).grab(box, context),
      subtitles: (config.subtitles as ValueGrabber).grab(box, context)
    })
    
    context.version = {
      ...languageDetails, 
      ...context.version
    }

    return languageDetails
  }

  /** @private */
  resolveValueGrabbers(config: LanguageParsingConfig) {    
    config.language = this.resovleValueGrabber('language', config, trimmingWrapper(Utils.mapLanguage))
    config.subtitles = this.resovleValueGrabber('subtitles', config, trimmingWrapper(Utils.mapSubtitles))
  }

}