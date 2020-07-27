import * as moment from 'moment'
/**
 * Creates a before & after hook to mock moment.now() to the given date and reset it afterwards
 * @param mockNowDate a mock value for now()
 */
export function withMomentNowMocked(mockNowDate: Date) {
  let moment_now
  before(() => {
    moment_now = moment.now
    let anyMoment = moment as any
    anyMoment.now = () => { return mockNowDate.getTime() }
  })

  after(() => {
    let anyMoment = moment as any
    anyMoment.now = moment_now
  })
}
