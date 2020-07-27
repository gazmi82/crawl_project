import { ParsingContext } from './ParsingContext'

/**
 * Parses a data item from box into the current Context. 
 */
export interface ItemParser<ParsingConfig> {
  /* The key under which the parsed item will be save to the context after parsing */
  contextKey?: string 
  
  /** Parses a single value or object into the current context */
  parse: (box: Cheerio, parsingConfig: ParsingConfig, context: ParsingContext) => void
}
