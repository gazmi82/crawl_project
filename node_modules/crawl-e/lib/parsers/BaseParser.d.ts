/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { ParsingContext } from './ParsingContext';
import Logger from '../Logger';
import ValueGrabber, { Mapper } from '../ValueGrabber';
/**
 * Base class to implement a Parser for extracting data from boxes.
 * It may parse single values or object data.
 *
 * @category HTML Parsing
 */
export declare abstract class BaseParser {
    protected logger: Logger;
    logPrefix: string;
    contextKey: string;
    parsingConfig: any;
    constructor(logger: Logger);
    /**
     * Parses a single / first value from the given box.
     * @param key
     * @param box
     * @param context
     * @returns the value that was grabbed & evtl. mapped using the ValueGrabbing's mapper.
     * @protected
     */
    grabProperty(key: any, box: Cheerio, context: ParsingContext): string;
    /**
     * Find or created a ValueGrabber form the parsingConfig at the given key, which must container a `ValueGrabbing`
     * @param key
     * @param parsingConfig
     * @param mapper
     * @protected
     */
    resovleValueGrabber<ValueType = string>(key: any, parsingConfig: any, mapper?: Mapper<ValueType>): ValueGrabber<ValueType>;
    /** @private */
    valueGrabberLogPrefix(key: string): string;
}
