import * as debug from 'debug'
import * as util from 'util'
import * as colors from 'colors'
import * as _ from 'underscore'
import Constants from './Constants';

/**
 * The Logger interface allows to implement a custom Logger. 
 */
interface Logger {
  /**
   * Logs debug level messages.
   * @param namespace The context or scope of the debug message
   * @param message The main message to be logged
   * @param optionalParams Addtional details to be logged
   */
  debug: (namespace: string, message?: any, ...optionalParams: any[]) => void
  /**
   * Logs info level messages.
   * @param message The main message to be logged
   * @param optionalParams Addtional details to be logged
   */
  info: (message?: any, ...optionalParams: any[]) => void
  /**
   * Logs warning level messages.
   * @param message The main message to be logged
   * @param optionalParams Addtional details to be logged
   */
  warn: (message?: any, ...optionalParams: any[]) => void
  /**
   * Logs error level messages.
   * @param message The main message to be logged
   * @param optionalParams Addtional details to be logged
   */
  error: (message?: any, ...optionalParams: any[]) => void
}

/** @private */
const LOG_STYLES = {
  emoji: {
    warn: '⚠️ ',
    error: '❗️ '
  },
  short: {
    warn: 'W:',
    error: 'E:'
  },
  long: {
    warn: 'WARNING:',
    error: 'ERROR:'
  }
}

/**
 * Default Logger class. Logs as following: 
 * - debug →   the [debug](https://github.com/visionmedia/debug) package. See [Debug Logs](http://crawl-e.internal.cinepass.de/#/basics/debug-logs) in the framework documentation. 
 * - info →    `console.log()` in default color
 * - warning → `console.log()` in yellow color
 * - error →   `console.log()` in red color
 */
class DefaultLogger implements Logger {
  logStyle = LOG_STYLES.emoji

  /**
   * Logs a message via the debug module 
   * @param debugPrefix prefix for the debug module
   * @param msg 
   */
  debug (debugPrefix: string | null, ...msg: any[]) {
    debugPrefix = _.compact([Constants.MAIN_DEBUG_PREFIX, debugPrefix]).join(':')
    debug(debugPrefix)(...msg)
  }
  
  info(message?: any, ...optionalParams: any[]) {
    console.info(util.format(message, ...optionalParams))
  }

  warn (message?: any, ...optionalParams: any[]) {
    console.warn(colors.yellow(this.logStyle.warn), colors.yellow(util.format(message, ...optionalParams)))
  }

  error (message?: any, ...optionalParams: any[]) {
    console.error(colors.red(this.logStyle.error), colors.red(util.format(message, ...optionalParams)))
  }
}

/**
 * Placeholder Logger implemenation that actually logs nothing. 
 */
class SilentLogger implements Logger {
  debug(debugPrefix: string | null, msg: any) { }
  info(message?: any, ...optionalParams: any[]) { }
  warn(message?: any, ...optionalParams: any[]) {  }
  error(message?: any, ...optionalParams: any[]) { }
}

/**
 * Object to bridges a reference to a logger, so that the underlying logger can be changed anywhere for all usages. 
 */
class LoggerProxy implements Logger {
  public logger: Logger
  constructor(logger: Logger) {
    this.logger = logger || new SilentLogger()
  }
  debug(name: string, message?: any, ...optionalParams: any[]) {
    this.logger.debug(name, message, ...optionalParams)
  }
  info(message?: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams)
  }
  warn(message?: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams)
  }
  error(message?: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams)
  }
}

export default Logger

export {
  Logger,
  DefaultLogger,
  SilentLogger,
  LoggerProxy
}
