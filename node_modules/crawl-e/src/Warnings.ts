import { Logger } from './Logger'

namespace Warnings {
  export interface Warning {
    /** @TJS-type integer */
    code: number
  
    title: string
  
    /** developer hint on how to resolve the warning */
    recoveryHint?: string
  
    /** payload with details */
    details?: any

    /** function to format the issues details for printing to console */
    formatDetails?: () => string 

    /** Reason why the warning may be accepted. */
    acceptedReason?: string
  }

  export const CODES = {
    CINEMA_WIHOUT_ADDRESS: 3,
    CINEMA_WITH_INVALID_SLUG: 8,
    DUPLICATED_BOOKING_LINKS: 1,
    WRONG_IS_BOOKING_LINK_CAPABLE: 2,
    FAULTY_START_TIMES: 4,
    OUTPUT_SCHEMA_VALIDATION_ERROR: 5, 
    SKIPPED_SHOWTIMES: 6,
    NO_SHOWTIMES: 7,

  }

  export function print(warning: Warning, log: (msg: string) => void) {
    let appendLineBreak = false
    let msg = `[${warning.code}] ${warning.title}`
    if (warning.recoveryHint) {
      msg += '\n\n 👉  ' + warning.recoveryHint
      appendLineBreak = true
    }
    if (warning.formatDetails) {
      msg += '\n\n ' + warning.formatDetails()
      appendLineBreak = true
    }

    if (warning.acceptedReason) {
      msg += '\n  ✔ ignored because: ' + warning.acceptedReason
      appendLineBreak = true
    }

    if (appendLineBreak) {
      msg += '\n'
    }

    log(msg)
  }
}

export default Warnings