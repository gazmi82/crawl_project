/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { Movie } from '../models';
import Logger from '../Logger';
import { ItemParser } from './ItemParser';
import { ParsingContext } from './ParsingContext';
import { VersionParser, VersionParsingConfig } from './VersionParser';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
/**
 * MovieParsingConifg  with alternative value grabbers when parsing outside a movie context.
 * @category HTML Parsing
 */
export interface IndirectMovieParsingConfig {
    movieTitle?: ValueGrabbing;
    movieTitleOriginal?: ValueGrabbing;
}
/**
 * @category HTML Parsing
 */
export interface MovieParsingConfig extends IndirectMovieParsingConfig, VersionParsingConfig {
    id: ValueGrabbing;
    href?: ValueGrabbing;
    title: ValueGrabbing;
    titleOriginal?: ValueGrabbing;
}
/**
 * @category HTML Parsing
 */
export declare class MovieParser extends BaseParser implements ItemParser<MovieParsingConfig | IndirectMovieParsingConfig> {
    private versionParser;
    constructor(logger: Logger, versionParser: VersionParser);
    contextKey: string;
    parse(movieBox: Cheerio, parsingConfig: MovieParsingConfig, context: ParsingContext): Partial<Movie>;
}
