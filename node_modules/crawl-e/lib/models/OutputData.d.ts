import { BaseCrawlerMetainfo } from './CrawlerMetainfo';
import { Cinema } from './Cinema';
import { Showtime } from './Showtime';
/**
 * @category Model
 */
export interface OutputData {
    crawler: BaseCrawlerMetainfo;
}
export interface CinemaShowtimesCrawlerOutputData extends OutputData {
    cinema: Cinema;
    showtimes: Showtime[];
}
