import { ParsingContext } from './ParsingContext'
import Logger from '../Logger'
import ValueGrabber, { Mapper } from '../ValueGrabber'

/**
 * Base class to implement a Parser for extracting data from boxes. 
 * It may parse single values or object data. 
 * 
 * @category HTML Parsing
 */
export abstract class BaseParser {
  logPrefix: string
  contextKey: string
  parsingConfig: any

  constructor(protected logger: Logger) { }

  /**
   * Parses a single / first value from the given box.
   * @param key 
   * @param box 
   * @param context 
   * @returns the value that was grabbed & evtl. mapped using the ValueGrabbing's mapper.
   * @protected
   */
  grabProperty(key, box: Cheerio, context: ParsingContext) {  
    return this.resovleValueGrabber(key, this.parsingConfig).grabFirst(box, context)
  }

  /**
   * Find or created a ValueGrabber form the parsingConfig at the given key, which must container a `ValueGrabbing`
   * @param key 
   * @param parsingConfig 
   * @param mapper 
   * @protected
   */
  resovleValueGrabber<ValueType = string>(key, parsingConfig, mapper?: Mapper<ValueType>) {
    return new ValueGrabber(parsingConfig[key], this.logger, this.valueGrabberLogPrefix(key), mapper)
  }

  /** @private */
  valueGrabberLogPrefix(key: string) {
    return [this.logPrefix || this.contextKey, 'selection', key].join(':')
  }
}