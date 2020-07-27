/**
 * Definition for staticly configured cinemas.
 *
 * @category Model
 */
export interface Cinema {
    /** Identifier as of the crawled website */
    id?: string;
    /** Name or title of the cinemas as it appears on the source website */
    name: string;
    /** slug identifier for creation of the cinema's output file */
    slug?: string;
    /** The cinema's href, relative link or absolute url in case of cinemas publishing showtimes on movie pages */
    href?: string;
    /** The full address as of the cinema */
    address: string | null;
    /** latitude of the cinemas geo location */
    lat?: number;
    /** longitude of the cinemas geo location */
    lon?: number;
    /** Telephone number is a human-readable format */
    phone?: string;
    /** eMail address of the cinema */
    email?: string;
    /** URL to the cinema's website */
    website?: string;
    /** Indicates whether the cinema is temporarirly clsoed */
    is_temporarily_closed?: boolean;
}
