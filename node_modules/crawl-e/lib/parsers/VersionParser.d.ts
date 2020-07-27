/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import Logger from '../Logger';
import { ItemParser } from './ItemParser';
import { ParsingContext } from './ParsingContext';
import { LanguageParsingConfig } from './LanguageParser';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
/**
 * VersionParsingConfig
 * @category HTML Parsing
 */
export interface VersionParsingConfig extends LanguageParsingConfig {
    attributes?: ValueGrabbing;
    is3d?: ValueGrabbing;
    isImax?: ValueGrabbing;
}
/**
 * Parses showitmes version details such as `is3d`, `isImax` or arbitrary `attributes`.
 * @category HTML Parsing
 */
export declare class VersionParser extends BaseParser implements ItemParser<VersionParsingConfig> {
    private languageParser;
    constructor(logger: Logger);
    contextKey: string;
    /**
     * Parses version details from a HTML box and merges them into the given context's `version` property.
     * @param dateBox
     * @param parsingConfig
     * @param context
     * @returns the merged version object as in the context after the parsing
     */
    parse(box: Cheerio, parsingConfig: VersionParsingConfig, context: ParsingContext): Partial<import("../models").MovieVersion>;
    /**
     * Parses a list of attributes from a HTML box.
     *
     * Hint: It does not add attributes into the given context.
     * @param box
     * @param parsingConfig
     * @param context the current context, which may have already some attributes set
     * @returns the parsed attributes merged with attribute from the given context if any present
     */
    parseAttributesArray(box: any, parsingConfig: VersionParsingConfig, context: ParsingContext): string[];
    parseIs3dFlag(box: any, parsingConfig: VersionParsingConfig, context: ParsingContext): boolean;
    parseIsImaxFlag(box: any, parsingConfig: VersionParsingConfig, context: ParsingContext): boolean;
    private parseFlag;
}
