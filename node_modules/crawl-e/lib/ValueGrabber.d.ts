/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { Logger } from './Logger';
import { ParsingContext } from './parsers';
export declare type Mapper<ReturnType> = (rawValue: string, context?: ParsingContext) => ReturnType;
declare type ValueGrabberFunction<ValueType> = (box: Cheerio, context: ParsingContext) => ValueType;
export interface ValueGrabberConfig<ValueType> {
    selector?: string;
    attribute?: string;
    mapper?: Mapper<ValueType>;
}
declare type ValueGrabberShortHandle = string;
export declare type ValueGrabbing<ValueType = ValueGrabberShortHandle> = ValueGrabberShortHandle | ValueGrabberConfig<ValueType> | ValueGrabberFunction<ValueType> | ValueGrabber<ValueType> | null | undefined;
export interface IValueGrabber<ValueType> {
    selector: string;
    attribute: string;
    mapper: Mapper<ValueType>;
    grab(itemBox: Cheerio, context?: ParsingContext): ValueType | ValueType[];
}
/**
 * A ValueGrabber extracts a single or list of values from Cheerio HTML node by traversing it.
 *
 * @category HTML Parsing
 */
export default class ValueGrabber<ValueType = string> implements ValueGrabberConfig<ValueType>, IValueGrabber<ValueType> {
    private logger;
    private logPrefix;
    static defaultMapper: (value: string) => string;
    selector: string;
    attribute: string;
    mapper: Mapper<ValueType>;
    /**
     * Creates a new ValueGrabber from the short handle notation.
     * @param shortHandle The short handle string
     * @param logger Logger for debugs, defaults to no logs
     * @param logPrefix The prefix string to build the debug log namespace
     * @param mapper A mapper function to map or enrich the grabbed raw value
     */
    constructor(shortHandle: string, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>);
    /**
     * Creates a new ValueGrabber from a config object.
     * @param config The config to create the ValueGrabber from
     * @param logger Logger for debugs, defaults to no logs
     * @param logPrefix The prefix string to build the debug log namespace
     * @param fallbackMapper A mapper function, which will be used if the configs does not provide one
     */
    constructor(config: ValueGrabberConfig<ValueType>, logger?: Logger, logPrefix?: string, fallbackMapper?: Mapper<ValueType>);
    /**
     * Creates a new ValueGrabber from a custom value grabbing function.
     * The function will be called with two arguments: the Cheerio Box and the current Context. It must return the grabbed value or values.
     * @param grabFn The custom value grabbing function.
     * @param logger Logger for debugs, defaults to no logs
     * @param logPrefix The prefix string to build the debug log namespace
     */
    constructor(grabFn: ValueGrabberFunction<ValueType>, logger?: Logger, logPrefix?: string);
    /**
   * Creates a new ValueGrabber from an existing ValueGrabber instance by using the same confuration.
   * @param valueGrabber An existing ValueGrabber to reuse.
   * @param logger Logger for debugs, defaults to no logs
   * @param logPrefix The prefix string to build the debug log namespace
   */
    constructor(config: ValueGrabber<ValueType>, logger?: Logger, logPrefix?: string);
    /**
     * Creates a new ValueGrabber which will always grab `null`
     * @param undefinedConfig
     */
    constructor(undefinedConfig: undefined, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>);
    /**
     * Creates a new ValueGrabber which will always grab `null`
     * @param nullConfig
     */
    constructor(nullConfig: null, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>);
    /**
     * Framework internal overload to overcome typescript errors.
     * @internal
     */
    constructor(any: any, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>);
    static parseShortHandle(handle: string): {
        selector: string;
        attribute: string;
    };
    /**
     * Grabs matching values form within a given container node and it's children nodes.
     * @param container A cheerio container or box to search a value in.
     * @param context
     * @returns the grabbed value if only one found, an array of the values when multiple found or `null` if none found.
     */
    grab(container: Cheerio, context?: ParsingContext): ValueType | ValueType[];
    /**
     * Grabs the first matching value form within a given container node and it's children nodes.
     * @param container A cheerio container or box to search a value in.
     * @param context
     * @returns the first value that was found or `null` if none
     */
    grabFirst(container: Cheerio, context?: ParsingContext): ValueType;
    /**
     * Grabs all matching values form within a given container node and it's children nodes.
     * @param container A cheerio container or box to search a value in.
     * @param context
     * @returns An array of the values that where found.
     */
    grabAll(container: Cheerio, context?: ParsingContext): ValueType[];
    private grabValue;
}
export {};
