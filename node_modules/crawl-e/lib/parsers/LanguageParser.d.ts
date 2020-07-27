/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { ParsingContext } from './ParsingContext';
import { ItemParser } from './ItemParser';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
/**
 * @category HTML Parsing
 */
export interface LanguageParsingConfig {
    language?: ValueGrabbing;
    subtitles?: ValueGrabbing;
}
/**
 * Parser for `language` and `subtitles`.
 * @category HTML Parsing
 */
export declare class LanguageParser extends BaseParser implements ItemParser<LanguageParsingConfig> {
    contextKey: string;
    /**
     * Parses a HTML box and language & subtitles into the given context's `version` property.
     * @param box
     * @param config
     * @param context the context which to set the language details on
     * @returns the parsed language details
     */
    parse(box: Cheerio, config: LanguageParsingConfig, context: ParsingContext): Pick<any, string | number | symbol>;
    /** @private */
    resolveValueGrabbers(config: LanguageParsingConfig): void;
}
