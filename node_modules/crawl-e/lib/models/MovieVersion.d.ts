/**
 * @category Model
 */
export interface MovieVersion {
    /** Flag whether the movie's showtimes are in 3D */
    is3d?: boolean;
    /** Flag whether the movie's showtimes are in IMAX */
    isImax?: boolean;
    /** Arbitrary list of the movie's version attributes */
    attributes?: string[];
    /** The movie's / it's showtimes spoking language. */
    language?: string;
    /** The movie's / it's showtimes subtitle languages. */
    subtitles?: string[];
}
