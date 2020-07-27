import { Cinema } from '../models';
import { ParsingContext } from './ParsingContext';
import { ValueGrabbing } from '../ValueGrabber';
import { BaseParser } from './BaseParser';
import { GeoLocation } from '../models/GeoLocation';
/**
 * @category HTML Parsing
 */
export interface CineamParsingConfig {
    id?: ValueGrabbing;
    name: ValueGrabbing;
    href?: ValueGrabbing;
    slug?: ValueGrabbing;
    address?: ValueGrabbing;
    phone?: ValueGrabbing;
    email?: ValueGrabbing;
    website?: ValueGrabbing;
    location?: ValueGrabbing<GeoLocation>;
    isTemporarilyClosed?: ValueGrabbing<boolean>;
}
/**
 * @category HTML Parsing
 */
export declare class CinemaParser extends BaseParser {
    logPrefix: string;
    parsingConfig: CineamParsingConfig;
    /**
     * Parses a single cinema from a box
     * @returns a cinema object with it's parsed properties
     */
    parseCinema(cinemaBox: any, cinemaParsingConfig: CineamParsingConfig, context: ParsingContext): Partial<Cinema>;
}
