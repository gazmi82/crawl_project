import { Logger } from './../../src/Logger'
import * as util from 'util'
const colors = require('colors')

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1, 
  WARNN: 2, 
  ERROR: 3, 
  OFF: 9
}

function removeAnsiColor(str) {
  return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
}

export class TestLogger implements Logger {
  logs = {
    debugs: [],
    infos: [],
    warnings: [],
    errors: []
  }

  constructor(private logLevel = LOG_LEVELS.OFF) { }

  reset() {
    this.logs = {
      debugs: [],
      infos: [],
      warnings: [],
      errors: []
    }
  }

  debug (name: string, message?: any, ...optionalParams: any[]) {
    if (this.logLevel <= LOG_LEVELS.DEBUG) {
      console.log(colors.gray('TestLogger', '[D]', name, util.format(message, ...optionalParams)))
    }
    this.logs.debugs.push({ prefix: name, msg: util.format(message, ...optionalParams) })
  }

  info (message?: any, ...optionalParams: any[]) {
    if (this.logLevel <= LOG_LEVELS.INFO) {
      console.log(colors.gray('TestLogger'), colors.cyan('[I]', message), ...optionalParams)
    }
    this.logs.infos.push(removeAnsiColor(util.format(message, ...optionalParams)))
  }

  warn(message?: any, ...optionalParams: any[]) {
    if (this.logLevel <= LOG_LEVELS.WARNN) {
      console.log(colors.gray('TestLogger'), colors.yellow('[W]', message), ...optionalParams)
    }
    this.logs.warnings.push(removeAnsiColor(util.format(message, ...optionalParams)))
  }

  error(message?: any, ...optionalParams: any[]) {
    if (this.logLevel <= LOG_LEVELS.ERROR) {
      console.log(colors.gray('TestLogger'), colors.red('[E]', message), ...optionalParams)
    }
    this.logs.errors.push(removeAnsiColor(util.format(message, ...optionalParams)))
  }

  static LOG_LEVELS = LOG_LEVELS
}