/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { ParsingContext } from './ParsingContext';
/**
 * Parses a data item from box into the current Context.
 */
export interface ItemParser<ParsingConfig> {
    contextKey?: string;
    /** Parses a single value or object into the current context */
    parse: (box: Cheerio, parsingConfig: ParsingConfig, context: ParsingContext) => void;
}
