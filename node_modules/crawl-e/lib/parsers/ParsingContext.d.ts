/// <reference types="cheerio" />
import { Moment } from 'moment';
import Context from '../Context';
/**
 * Context when parsing HTML.
 * @category Context
 */
export interface ParsingContext extends Context {
    /** The url of the HTML page that is currently parsed. */
    requestUrl?: string;
    /** The cheerio instance the the HTML was loaded with.  */
    cheerio?: CheerioStatic;
    time?: Moment;
    /** list name for debug prefix */
    listName?: string;
}
/**
 * Context when parsing table header.
 * @category Context
 */
export interface HeaderParsingContext extends ParsingContext {
    /**
     * - in case table header row: contains weekdays
     * - in the context of a longer period, e.g. 1 month
     */
    dates?: Moment[];
}
