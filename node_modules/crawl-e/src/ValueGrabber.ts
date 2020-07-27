import { Logger, SilentLogger } from './Logger'
import Constants from './Constants'
import { ParsingContext } from './parsers'
import TemplaterEvaluator from './TemplaterEvaluator';

export type Mapper<ReturnType> = (rawValue: string, context?: ParsingContext) => ReturnType
type ValueGrabberFunction<ValueType> = (box: Cheerio, context: ParsingContext) => ValueType

export interface ValueGrabberConfig<ValueType> {
  selector?: string
  attribute?: string
  mapper?: Mapper<ValueType>
}


type ValueGrabberShortHandle = string
export type ValueGrabbing<ValueType = ValueGrabberShortHandle> = ValueGrabberShortHandle | ValueGrabberConfig<ValueType> | ValueGrabberFunction<ValueType> | ValueGrabber<ValueType> | null | undefined

export interface IValueGrabber<ValueType> {
  selector: string
  attribute: string
  mapper: Mapper<ValueType>
  grab(itemBox: Cheerio, context?: ParsingContext): ValueType | ValueType[]
}


/**
 * A ValueGrabber extracts a single or list of values from Cheerio HTML node by traversing it. 
 * 
 * @category HTML Parsing
 */
export default class ValueGrabber<ValueType = string> implements ValueGrabberConfig<ValueType>, IValueGrabber<ValueType> {
  static defaultMapper = (value: string) => value.trim()
  
  selector: string
  attribute: string
  mapper: Mapper<ValueType>

  /**
   * Creates a new ValueGrabber from the short handle notation. 
   * @param shortHandle The short handle string 
   * @param logger Logger for debugs, defaults to no logs
   * @param logPrefix The prefix string to build the debug log namespace 
   * @param mapper A mapper function to map or enrich the grabbed raw value
   */
  constructor(shortHandle: string, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>)
  
  /**
   * Creates a new ValueGrabber from a config object. 
   * @param config The config to create the ValueGrabber from
   * @param logger Logger for debugs, defaults to no logs
   * @param logPrefix The prefix string to build the debug log namespace 
   * @param fallbackMapper A mapper function, which will be used if the configs does not provide one
   */
  constructor(config: ValueGrabberConfig<ValueType>, logger?: Logger, logPrefix?: string, fallbackMapper?: Mapper<ValueType>)

  /**
   * Creates a new ValueGrabber from a custom value grabbing function. 
   * The function will be called with two arguments: the Cheerio Box and the current Context. It must return the grabbed value or values.   
   * @param grabFn The custom value grabbing function. 
   * @param logger Logger for debugs, defaults to no logs
   * @param logPrefix The prefix string to build the debug log namespace 
   */
  constructor(grabFn: ValueGrabberFunction<ValueType>, logger?: Logger, logPrefix?: string)

    /**
   * Creates a new ValueGrabber from an existing ValueGrabber instance by using the same confuration.
   * @param valueGrabber An existing ValueGrabber to reuse. 
   * @param logger Logger for debugs, defaults to no logs
   * @param logPrefix The prefix string to build the debug log namespace 
   */
  constructor(config: ValueGrabber<ValueType>, logger?: Logger, logPrefix?: string)
  
  /**
   * Creates a new ValueGrabber which will always grab `null` 
   * @param undefinedConfig 
   */
  constructor(undefinedConfig: undefined, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>)

  /**
   * Creates a new ValueGrabber which will always grab `null` 
   * @param nullConfig 
   */
  constructor(nullConfig: null, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>)
  
  /**
   * Framework internal overload to overcome typescript errors.
   * @internal
   */
  constructor(any: any, logger?: Logger, logPrefix?: string, mapper?: Mapper<ValueType>)

  constructor(input: ValueGrabberShortHandle | ValueGrabberConfig<ValueType> | ValueGrabberFunction<ValueType> | undefined | null, private logger: Logger = new SilentLogger(), private logPrefix: string = '', fallbackMapper: Mapper<ValueType> = undefined) {  
    if (input instanceof ValueGrabber) { return input }
    let grabber
    
    if (!input) {
      grabber = {}
      this.grabAll = (itemBox: Cheerio, context: ParsingContext = null) => [null]
    } else if (input.constructor === Function) {
      this.grabAll = (itemBox: Cheerio, context: ParsingContext = null) => {
        let grab = input as ValueGrabberFunction<ValueType>
        let value = grab(itemBox, context)
        this.logger.debug(`${this.logPrefix}:value`, `custom grabbed:`, value)
        return Array.isArray(value) ? value : [value]
      }
      return
    } else if (input.constructor === String) {
      grabber = ValueGrabber.parseShortHandle(input as string)
    } else {
      grabber = input
    }
    this.selector = [undefined, Constants.BOX_SELECTOR].indexOf(grabber.selector) > -1
      ? null
      : grabber.selector
    this.attribute = grabber.attribute || null
    this.mapper = grabber.mapper || fallbackMapper || ValueGrabber.defaultMapper
  }

  static parseShortHandle (handle: string) {
    let parts = handle.split(' @')
    if (parts.length === 1 && handle.indexOf('@') > -1) {
      return {
        selector: null,
        attribute: handle.split('@').reverse()[0]
      }
    }
    return {
      selector: parts[0],
      attribute: parts[1] || null
    }
  }
  
  /**
   * Grabs matching values form within a given container node and it's children nodes. 
   * @param container A cheerio container or box to search a value in.
   * @param context 
   * @returns the grabbed value if only one found, an array of the values when multiple found or `null` if none found. 
   */
  grab(container: Cheerio, context: ParsingContext = null): ValueType | ValueType[] {
    const values = this.grabAll(container, context)    
    switch (values.length) {
      case 0: return null
      case 1: return values[0]
      default: return values
    }
  }

  /**
   * Grabs the first matching value form within a given container node and it's children nodes. 
   * @param container A cheerio container or box to search a value in.
   * @param context 
   * @returns the first value that was found or `null` if none
   */
  grabFirst(container: Cheerio, context: ParsingContext = null): ValueType  {
    return this.grabAll(container, context)[0] || null
  }

  /**
   * Grabs all matching values form within a given container node and it's children nodes. 
   * @param container A cheerio container or box to search a value in.
   * @param context 
   * @returns An array of the values that where found. 
   */
  grabAll(container: Cheerio, context: ParsingContext = null): ValueType[] {
    let values: ValueType[] = []

    let selector = this.selector || Constants.BOX_SELECTOR
    selector.split(',').forEach(subSelector => {
      subSelector = TemplaterEvaluator.evaluate(subSelector, context)
      let valueBox = subSelector === Constants.BOX_SELECTOR
        ? container
        : container.find(subSelector)

      if (context && this.logger) {
        this.logger.debug(`${this.logPrefix}:box`, `selected (${subSelector}): %s`, context.cheerio.html(valueBox).trim())
      }

      switch (valueBox.length) {
        case 0:
          this.logger.debug(`${this.logPrefix}:box`, `selected (${this.selector || Constants.BOX_SELECTOR}): <box not found>`)          
          break;
        case 1:
          values.push(this.grabValue(valueBox, context))
          break;
        default:
          valueBox.each((index, elem) => {
            values.push(this.grabValue(context.cheerio(elem), context))
          })
        break;
      }
    })    

    return values
  }

  private grabValue(box: Cheerio, context: ParsingContext): ValueType {
    let rawValue: string
    switch (this.attribute) {
      case null: rawValue = box.text(); break;
      case 'html()': rawValue = context.cheerio.html(box); break;
      case 'ownText()': rawValue = box.contents().filter((index, element) => element.type === 'text').text(); break;
      default: rawValue = box.attr(this.attribute); break;
    }

    let grabbing = this.attribute ? `attribute ${this.attribute}` : `text()`
    this.logger.debug(`${this.logPrefix}:value`, `grabbing ${grabbing}:`, rawValue)

    let result: ValueType
    if (rawValue !== undefined && this.mapper) {
      let mappedValue = this.mapper(rawValue, context)
      this.logger.debug(`${this.logPrefix}:value`, `mapped:`, mappedValue)
      result = mappedValue
    } else {
      result = rawValue as any as ValueType
    }
  
    if (typeof result === 'string') {
      return result.replace(/\s+/g, ' ') as any as ValueType
    }

    return result || null
  }
}
