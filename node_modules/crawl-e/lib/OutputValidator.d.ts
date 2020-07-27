import Warnings from './Warnings';
import { Cinema, CinemaShowtimesCrawlerMetainfo, Showtime, OutputData } from './models';
import Context from './Context';
export interface CinemaShowtimesOutputData extends OutputData {
    crawler: CinemaShowtimesCrawlerMetainfo;
    cinema: Cinema;
    showtimes: Showtime[];
}
export default class OutputValidator {
    /** Validates output data for cinema showtimes crawling */
    static validate(data: CinemaShowtimesOutputData, context: Context): Warnings.Warning[];
}
