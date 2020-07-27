/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { ItemParser } from './ItemParser';
import { DateParser, DatesIValueGrabver } from './DateParser';
import Logger from '../Logger';
import { ParsingContext } from './ParsingContext';
/**
 * @category HTML Parsing
 */
export interface PeriodParsingConfig {
    datesParser?: DatesIValueGrabver;
    dateFormat?: string;
    dateLocale?: string;
}
/**
 * @category HTML Parsing
 */
export declare class PeriodParser implements ItemParser<PeriodParsingConfig> {
    private logger;
    private dateParser;
    constructor(logger: Logger, dateParser: DateParser);
    contextKey: string;
    /** parses a date period from a box and adds it to the context */
    parse(box: Cheerio, config: PeriodParsingConfig, context: ParsingContext): import("moment").Moment[];
}
