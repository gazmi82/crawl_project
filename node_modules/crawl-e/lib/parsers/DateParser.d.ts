/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import * as moment from 'moment';
import { ParsingContext } from './ParsingContext';
import { ItemParser } from './ItemParser';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
/** @private */
export declare const styleString: (str: any) => string;
/** @private */
export declare const styleMoment: (m: moment.Moment, format: string) => string;
export declare type AnyDate = string | moment.Moment | Date;
export declare type DatesArray = string[] | moment.Moment[] | Date[];
declare type DistributeValueGrabbing<U> = U extends any ? ValueGrabbing<U> : never;
export declare type DatesValueGrabbing = DistributeValueGrabbing<AnyDate>;
export declare type DatesIValueGrabver = DistributeValueGrabbing<AnyDate>;
/**
 * @category HTML Parsing
 */
export interface DateStringParsingConfig {
    dateFormat: moment.MomentFormatSpecification;
    dateLocale?: string;
    preserveYear?: boolean;
}
/**
 * @category HTML Parsing
 */
export interface DateParsingConfig extends DateStringParsingConfig {
    date: ValueGrabbing;
}
/**
 * DateParser
 * @category HTML Parsing
 */
export declare class DateParser extends BaseParser implements ItemParser<DateParsingConfig> {
    debugKey: string;
    contextKey: string;
    logPrefix: string;
    /**
     * Parses a single date from a HTML box and adds it as moment object to the given context's `date` property.
     * @param dateBox the HTML box to grab the date string from
     * @param dateParsingConfig config for grabbing the date string and parsing it
     * @param context the context which to set the `date` property on
     * @returns the parsed date as moment object
     */
    parse(dateBox: Cheerio, dateParsingConfig: DateParsingConfig, context: ParsingContext): moment.Moment;
    /**
     * Parses a date string and sets it as moment object into the given context's `date` property.
     * @param dateStr the formatted date stirng to parse
     * @param dateParsingConfig config for parsing the date string
     * @param context the context which to set the `date` property on
     * @returns the parsed date as moment object
     */
    parseDateStr(dateStr: string, dateParsingConfig: DateStringParsingConfig, context: ParsingContext): moment.Moment;
    /**
     * Maps any array of dates either as formatted strings, JS Date object or moment objects into a unified array of momemnt data objects.
     * @param dates
     * @param context
     * @param dateParsingConfig
     */
    mapDates(dates: DatesArray, context: ParsingContext, dateParsingConfig: DateStringParsingConfig): moment.Moment[];
    iterateDates(dates: DatesArray, parentContext: ParsingContext, dateParsingConfig: DateStringParsingConfig, iterator: (context: ParsingContext) => void): void;
    /**
     * Iterates over a list of dates, calling the iterator function with a ParsingContext configured for the current data each.
     * @param dates
     * @param parentContext
     * @param iterator
     */
    iterateMomentDates(dates: moment.Moment[], parentContext: ParsingContext, iterator: (context: ParsingContext) => void): void;
    /**
     * Iterates asynchronously over a list of dates, calling the iterator function with a ParsingContext configured for the current data each.
     * @param dates
     * @param context
     * @param iterator
     * @param cb
     */
    iterateMomentDatesAsync<T>(dates: moment.Moment[], context: ParsingContext, iterator: (context: ParsingContext, cb: Function) => void, cb: any): void;
}
export {};
