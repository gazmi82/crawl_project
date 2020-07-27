import * as _ from 'underscore'
import { SubConfigs } from '../Config'
import Logger from '../Logger'
import MethodCallLogger from '../MethodCallLogger'
import { ItemParser } from './ItemParser'
import { ParsingContext } from './ParsingContext'
import { LanguageParser, LanguageParsingConfig } from './LanguageParser'
import ValueGrabber, { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
import { Movie } from '../models';

/**
 * VersionParsingConfig
 * @category HTML Parsing
 */
export interface VersionParsingConfig extends LanguageParsingConfig {
  attributes?: ValueGrabbing
  is3d?: ValueGrabbing
  isImax?: ValueGrabbing
}

/**
 * Parses showitmes version details such as `is3d`, `isImax` or arbitrary `attributes`. 
 * @category HTML Parsing
 */
export class VersionParser extends BaseParser implements ItemParser<VersionParsingConfig> {
  private languageParser: LanguageParser
  constructor(logger: Logger) {
    super(logger)
    this.languageParser = new LanguageParser(this.logger)
  }
  
  contextKey = 'version'
  
  /**
   * Parses version details from a HTML box and merges them into the given context's `version` property.
   * @param dateBox 
   * @param parsingConfig
   * @param context
   * @returns the merged version object as in the context after the parsing
   */
  parse(box: Cheerio, parsingConfig: VersionParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    
    let version = {
      ...this.languageParser.parse(box, parsingConfig, context),
      attributes: this.parseAttributesArray(box, parsingConfig, context),
      is3d: this.parseIs3dFlag(box, parsingConfig, context),
      isImax: this.parseIsImaxFlag(box, parsingConfig, context)
    }

    context.version = {
      ...(context.movie || {} as Movie).version,
      ...context.version,
      ...version
    }
        
    context.popCallstack()
    return context.version
  }

  /**
   * Parses a list of attributes from a HTML box. 
   * 
   * Hint: It does not add attributes into the given context.
   * @param box 
   * @param parsingConfig 
   * @param context the current context, which may have already some attributes set
   * @returns the parsed attributes merged with attribute from the given context if any present
   */
  parseAttributesArray(box, parsingConfig: VersionParsingConfig, context: ParsingContext) {
    let attributes = context.version.attributes
    if (parsingConfig.attributes) {
      let valueGrabber = new ValueGrabber(parsingConfig.attributes, this.logger, this.valueGrabberLogPrefix('attributes'))
      let grabbedattributes = valueGrabber.grab(box, context)
      attributes = _.chain([grabbedattributes])
        .union(attributes)
        .flatten()
        .compact()
        .value()
    }
    return attributes
  }
  
  parseIs3dFlag(box, parsingConfig: VersionParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    let flag = this.parseFlag({ key: 'is3d', regex: /\b3D\b/i }, box, parsingConfig, context)
    context.popCallstack()
    return flag
  }
  
  parseIsImaxFlag(box, parsingConfig: VersionParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    let flag = this.parseFlag({ key: 'isImax', regex: /\bIMAX\b/i }, box, parsingConfig, context)
    context.popCallstack()
    return flag
  }
  
  private parseFlag(flag: { key: string, regex: RegExp }, box, parsingConfig: VersionParsingConfig, context: ParsingContext): boolean {
    MethodCallLogger.logMethodCall()
    
    if (parsingConfig[flag.key]) {
      let valueGrabber = new ValueGrabber(parsingConfig[flag.key], this.logger, this.valueGrabberLogPrefix(flag.key))
      let flagValue: any = valueGrabber.grab(box, context)
      if (typeof flagValue === 'boolean') {
        return flagValue
      }
      if (typeof flagValue === 'string') {
        return flag.regex.test(flagValue)
      }
    }

    if (_.has(context.version, flag.key)) {
      return context.version[flag.key]
    }

    if (context.movie && context.movie[flag.key] === true) {
      return true
    }
    
    if (context.movie) {
      return flag.regex.test(context.movie.title)
    }

    return undefined
  }

}