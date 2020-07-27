import Constants from './Constants';
import * as debug from 'debug'
import * as util from 'util'
import Context from './Context';

let _debbuPrefix = `${Constants.MAIN_DEBUG_PREFIX}:callstack`
let _logMethodCallDebug = debug(_debbuPrefix)

namespace MethodCallLogger {
  export function currentMethodName(offset: number = 0) {
    var err = new Error();
    let methodName = err.stack.split('\n')[3 + offset].match(/(at )([\w|.]+)/)[2]
    return methodName
  }

  export function logMethodCall(...optionalParams: any[]) {
    _logMethodCallDebug(util.format(currentMethodName(), ...optionalParams))
  }
}

export default MethodCallLogger