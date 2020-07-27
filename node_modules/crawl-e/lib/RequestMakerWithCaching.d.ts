import { DefaultRequestMaker } from './RequestMaker';
import Config from './Config';
/**
 * A request make that add caching via the [nock](https://github.com/nock/nock) module to speed up the crawling execution time during development.
 */
declare class RequestMakerWithNockCaching extends DefaultRequestMaker {
    private cacheDir;
    nockFile: any;
    constructor(config: Config, cacheDir: string);
    willStartCrawling(): void;
    didFinishCrawling(): void;
}
export default RequestMakerWithNockCaching;
