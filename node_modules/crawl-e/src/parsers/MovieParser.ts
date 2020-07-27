import { Movie } from '../models'

import Logger from '../Logger'
import MethodCallLogger from '../MethodCallLogger'
import Utils from '../Utils'
import { ItemParser } from './ItemParser'
import { ParsingContext } from './ParsingContext'
import { VersionParser, VersionParsingConfig } from './VersionParser'
import ValueGrabber, { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';

/**
 * MovieParsingConifg  with alternative value grabbers when parsing outside a movie context.
 * @category HTML Parsing
 */
export interface IndirectMovieParsingConfig {
  movieTitle?: ValueGrabbing
  movieTitleOriginal?: ValueGrabbing
}

/**
 * @category HTML Parsing
 */
export interface MovieParsingConfig extends IndirectMovieParsingConfig, VersionParsingConfig {
  id: ValueGrabbing
  href?: ValueGrabbing
  title: ValueGrabbing
  titleOriginal?: ValueGrabbing
}

/**
 * @category HTML Parsing
 */
export class MovieParser extends BaseParser implements ItemParser<MovieParsingConfig | IndirectMovieParsingConfig> {
  constructor(logger: Logger, private versionParser: VersionParser) { 
    super(logger)
  }

  contextKey = 'movie'

  parse(movieBox: Cheerio, parsingConfig: MovieParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()
    parsingConfig.title = parsingConfig.movieTitle || parsingConfig.title
    parsingConfig.titleOriginal = parsingConfig.movieTitleOriginal || parsingConfig.titleOriginal
    this.parsingConfig = parsingConfig
    context.movie = {} as Movie
    context.movie.id =  this.grabProperty('id', movieBox, context)
    context.movie.title = this.grabProperty('title', movieBox, context)
    context.movie.titleOriginal = this.grabProperty('titleOriginal', movieBox, context)
    context.movie.href = this.grabProperty('href', movieBox, context)
    context.movie = Utils.compactObj(context.movie)

    context.movie.version = this.versionParser.parse(movieBox, parsingConfig, context)

    this.logger.debug(`movies:result`, context.movie)
    context.popCallstack()
    return context.movie
  }

}