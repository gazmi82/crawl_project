/** @private */
export declare const SUBTITLES_UNDETERMINED = "undetermined";
/** @private */
export declare const ORIGINAL_VERSION = "original version";
export interface LanguageVersion {
    language: string | null;
    subtitles: string[] | string | null;
}
/** @private */
declare let map: {
    [token: string]: LanguageVersion;
};
export default map;
