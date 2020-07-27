/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import { CallbackFunction, BoxIterator } from '../ResponseParsers';
import { ParsingContext } from './ParsingContext';
import Logger from '../Logger';
import { ValueGrabbing } from '../ValueGrabber';
import { SubConfigs } from '../Config.types';
import Context from '../Context';
declare namespace TabsParser {
    interface ButtonsConfig extends SubConfigs.HeaderParsingConfig {
        box: string;
        id: ValueGrabbing;
    }
    interface CardsParsing extends SubConfigs.Generic.ListParsingConfig, SubConfigs.Showtimes.ParsingLevelConfig {
    }
    export interface ParsingConfig {
        buttons: ButtonsConfig;
        cards?: CardsParsing;
    }
    export function parseTabs(container: Cheerio, context: ParsingContext, logger: Logger, config: ParsingConfig, iterators: {
        buttons: BoxIterator;
        cards: BoxIterator;
    }, callback: CallbackFunction): void;
    export function parseTabButtons(container: Cheerio, context: ParsingContext, logger: Logger, config: ParsingConfig, buttonParser: BoxIterator, callback: CallbackFunction): void;
    export function parseTabCards(container: Cheerio, context: ParsingContext, logger: Logger, config: ParsingConfig, tabsContexts: {
        [key: string]: Context;
    }, cardIterator: BoxIterator, callback: CallbackFunction): void;
    export {};
}
export default TabsParser;
