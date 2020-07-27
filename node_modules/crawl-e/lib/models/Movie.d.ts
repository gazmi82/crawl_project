import { MovieVersion } from './MovieVersion';
/**
 * @category Model
 */
export interface Movie {
    /** Id of the movie used by the cinema's website */
    id?: string;
    /** The movie's localized title as displayed on the cinema's website */
    title: string;
    /** The movie's original title as displayed on the cinema's website */
    titleOriginal: string;
    /** The movie's href, relative link or absolute url in case of cinemas publishing showtimes on movie pages */
    href?: string;
    /** Map of flags for the movie's version */
    version?: MovieVersion;
}
