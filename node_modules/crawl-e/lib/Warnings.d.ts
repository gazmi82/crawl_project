declare namespace Warnings {
    interface Warning {
        /** @TJS-type integer */
        code: number;
        title: string;
        /** developer hint on how to resolve the warning */
        recoveryHint?: string;
        /** payload with details */
        details?: any;
        /** function to format the issues details for printing to console */
        formatDetails?: () => string;
        /** Reason why the warning may be accepted. */
        acceptedReason?: string;
    }
    const CODES: {
        CINEMA_WIHOUT_ADDRESS: number;
        CINEMA_WITH_INVALID_SLUG: number;
        DUPLICATED_BOOKING_LINKS: number;
        WRONG_IS_BOOKING_LINK_CAPABLE: number;
        FAULTY_START_TIMES: number;
        OUTPUT_SCHEMA_VALIDATION_ERROR: number;
        SKIPPED_SHOWTIMES: number;
        NO_SHOWTIMES: number;
    };
    function print(warning: Warning, log: (msg: string) => void): void;
}
export default Warnings;
