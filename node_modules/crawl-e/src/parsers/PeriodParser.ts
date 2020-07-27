import { ItemParser } from './ItemParser'
import ValueGrabber, { IValueGrabber } from '../ValueGrabber'
import { DatesArray, DateParser, DateStringParsingConfig, AnyDate, DatesIValueGrabver } from './DateParser'
import Logger from '../Logger'
import MethodCallLogger from '../MethodCallLogger'
import { ParsingContext } from './ParsingContext'

/**
 * @category HTML Parsing
 */
export interface PeriodParsingConfig {
  datesParser?: DatesIValueGrabver
  dateFormat?: string
  dateLocale?: string
}


/**
 * @category HTML Parsing
 */
export class PeriodParser implements ItemParser<PeriodParsingConfig> {
  constructor(private logger: Logger, private dateParser: DateParser) { }

  contextKey = 'period'

  /** parses a date period from a box and adds it to the context */
  parse(box: Cheerio, config: PeriodParsingConfig, context: ParsingContext) {
    MethodCallLogger.logMethodCall()
    context.pushCallstack()

    let dateParserDebugKey = this.dateParser.debugKey
    this.dateParser.debugKey = 'period.dates'    
    let periodDates: DatesArray = new ValueGrabber(config.datesParser, this.logger, this.dateParser.debugKey).grabAll(box, context)
    context.period = []
    this.dateParser.iterateDates(periodDates, context, config as DateStringParsingConfig, (dateContext) => {
      context.period.push(dateContext.date)
    })
    this.dateParser.debugKey = dateParserDebugKey

    context.popCallstack()
    return context.period
  }
}
