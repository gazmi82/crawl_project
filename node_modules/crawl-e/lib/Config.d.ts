import { Logger } from './Logger';
import { SubConfigs } from './Config.types';
import { DefaultRequestMakerConfig } from './RequestMaker';
/**
 * Default Config implementation.
 * @category Main
 */
declare class Config implements DefaultRequestMakerConfig {
    crawler?: any;
    /**
     * Number of concurrent requests.
     * @TJS-type integer
     */
    concurrency?: number;
    proxyUri?: string;
    useRandomUserAgent: boolean;
    /** timezone to use for crawling */
    timezone?: string;
    acceptedWarnings: {
        [key: number]: string;
    };
    isTemporarilyClosed?: SubConfigs.Generic.IsTemporarilyClosedCrawlingConfig;
    cinemas?: [object];
    cinemasConfig?: SubConfigs.Cinemas.CrawlingConfig;
    showtimes: SubConfigs.Showtimes.CrawlingConfig[];
    movies?: SubConfigs.Movies.CrawlingConfig;
    dates?: SubConfigs.Dates.CrawlingConfig;
    hooks: SubConfigs.Hooks;
    constructor(config: any, logger?: Logger);
    /**
     * Generates a list of all possible keypath combiniations
     * that could be configured for box & showtimes parsing
     * relative to the given parentKeyPath.
     *
     * see corresponding mocha test checking all sorts of combinations
     */
    private generateParsingConfigKeyPaths;
    private resolveTableConfig;
    private setCrawlerConfig;
    private parseShowtimesParsingConfig;
}
export default Config;
export { SubConfigs };
