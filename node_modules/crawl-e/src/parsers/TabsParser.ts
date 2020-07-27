import * as async from 'async'
import { CallbackFunction, debugLogFoundBoxesCount, BoxIterator } from '../ResponseParsers';
import { ParsingContext } from './ParsingContext';
import Logger from '../Logger';
import ValueGrabber, { ValueGrabbing } from '../ValueGrabber';
import TemplaterEvaluator from '../TemplaterEvaluator';
import Constants from '../Constants';
import { SubConfigs } from '../Config.types';
import Utils from '../Utils';
import MethodCallLogger from '../MethodCallLogger';
import Context, { cloneContext } from '../Context';

namespace TabsParser {

  interface ButtonsConfig extends SubConfigs.HeaderParsingConfig {
    box: string
    id: ValueGrabbing
  }
  interface CardsParsing extends SubConfigs.Generic.ListParsingConfig, SubConfigs.Showtimes.ParsingLevelConfig { }

  export interface ParsingConfig {
    buttons: ButtonsConfig
    cards?: CardsParsing
  }

  export function parseTabs(
    container: Cheerio, 
    context: ParsingContext, 
    logger: Logger, 
    config: ParsingConfig, 
    iterators: {
      buttons: BoxIterator,
      cards: BoxIterator
    },
    callback: CallbackFunction) {
      MethodCallLogger.logMethodCall()
      callback = context.trackCallstackAsync(callback)
      parseTabButtons(container, context, logger, config, iterators.buttons, (err, tabsContexts) => {
        if (err) { return callback(err) }
        parseTabCards(container, context, logger, config, tabsContexts, iterators.cards, callback)
      })
  }

  export function parseTabButtons(
    container: Cheerio,
    context: ParsingContext,
    logger: Logger,
    config: ParsingConfig,
    buttonParser: BoxIterator,
    callback: CallbackFunction) {

    MethodCallLogger.logMethodCall()
    callback = context.trackCallstackAsync(callback)
    let $ = context.cheerio

    let buttonsSelector = TemplaterEvaluator.evaluate(config.buttons.box, context)
    let buttons = config.buttons.box === Constants.BOX_SELECTOR
      ? [container]
      : container.find(buttonsSelector)

    debugLogFoundBoxesCount(logger, 'tabs:buttons', buttons.length)


    let tabsContexts = {}
    let tabIndex = 0

    Utils.mapSeries(buttons as any[], context, (buttonBox, context, cb) => {
      let cheerioBox = $(buttonBox)
      logger.debug(`tabs:buttons:box`, '%s', $.html(cheerioBox).trim())
      let tabId = new ValueGrabber(config.buttons.id, logger, `tabs:buttons:id`).grabFirst(cheerioBox, context)
      context.tabId = tabId
      context.indexes.tab = tabIndex
      tabIndex += 1
      tabsContexts[tabId] = context
      buttonParser(cheerioBox, context, cb)
    }, (err: Error, result: any) => {
        callback(err, tabsContexts)
    })
  }

  export function parseTabCards(
    container: Cheerio,
    context: ParsingContext,
    logger: Logger,
    config: ParsingConfig,
    tabsContexts: {[key:string]: Context},
    cardIterator: BoxIterator,
    callback: CallbackFunction) {
      if (!config.cards) {
        return callback(null)
      }

      let $ = context.cheerio
      let tabIds = Object.keys(tabsContexts)

      async.mapSeries(Utils.limitList(tabIds as any[]), (tabId, cb) => {
        let tabContext = tabsContexts[tabId]
        let selector = TemplaterEvaluator.evaluate(config.cards.box, tabContext)
        let cheerioBox = container.find(selector)
        logger.debug(`tabs:cards:box`, `selected (${selector}): %s`, $.html(cheerioBox).trim())
        cardIterator(cheerioBox, tabContext, cb)
      }, callback)
    }
}

export default TabsParser