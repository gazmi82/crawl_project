/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import * as moment from 'moment';
import { ParsingContext } from './ParsingContext';
import { ItemParser } from './ItemParser';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
/**
 * Configuration for grabbing a formatted time stirng & parsing it into moment.
 * @category HTML Parsing
 */
export interface TimeParsingConfig {
    /** Value Grabber for the time string */
    time?: ValueGrabbing;
    timeFormat?: moment.MomentFormatSpecification;
    timeLocale?: string;
}
/**
 * Parser for parsing formatted time strings.
 * @category HTML Parsing
 */
export declare class TimeParser extends BaseParser implements ItemParser<TimeParsingConfig> {
    contextKey: string;
    /**
     * Parses a single time from a HTML box and adds it as moment object to the given context's `time` property.
     * @param dateBox the HTML box to grab the time string from
     * @param timeParsingConfig config for grabbing the time string and parsing it
     * @param context the context which to set the `time` property on
     * @returns the parsed time as moment object
     */
    parse(box: Cheerio, timeParsingConfig: TimeParsingConfig, context: ParsingContext): moment.Moment;
}
