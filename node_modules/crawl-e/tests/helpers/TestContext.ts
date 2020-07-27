import Context from "../../src/Context";
import * as _ from 'underscore'

export class TestContext implements Context {
  indexes = {}
  currentTask: string = 'Running Tests'
  isTemporarilyClosed = false

  constructor(data: any = {}) {
    _.mapObject(data, (value, key) => {
      this[key] = value
    })
  }

  addWarning(w) { /* warnings do not matter for these tests */ }

  // callstack is not covered yet 
  pushCallstack() {  }
  popCallstack() { }
  trackCallstackAsync(callack) { return callack }
}

