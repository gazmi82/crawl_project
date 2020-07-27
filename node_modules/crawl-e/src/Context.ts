import { Cinema, Movie, MovieVersion } from './models'
import Warnings from './Warnings'
import * as _ from 'underscore'
import { Moment } from 'moment'
import MethodCallLogger from './MethodCallLogger'
import TableParser from './parsers/TableParser/TableParser'



/**
 * An resource model that the framework may work on. 
 */
export enum Resource {
  CinemaList = 'CinemaList',
  CinemaDetails = 'CinemaDetails',
  MovieList = 'MovieList',
  MovieDetails = 'MovieDetails',
  DateList = 'DateList',
  Showtimes = 'Showtimes'
}

/**
 * Object that get's passed around to provide in various iterations
 * E.g. gives access to current crawled cinema or the date it currently iterates thouhg. 
 * 
 * @category Context
 */
export default interface Context {  
  /** The URL of the currently parsed web page */
  requestUrl?: string

  /** The resource currently worked on. Provides additional context for implementing hooks or mappers */
  resource?: Resource 

  /** The cinema showtimes are crawled for, either from static config or retrieved via cinema list crawling */
  cinema?: Partial<Cinema>

  /** The date of the showtimes (without time). Retrieved either from iterating date boxes or the date of the url request. */
  date?: Moment

  /** The date page's href, relative link or absolute url in case of cinemas publishing showtimes on dynamicly crawled date pages */
  dateHref?: string
  
  /** The title of the auditorium showtimes are shown in */
  auditorium?: string

  /** The movie a showtime is for.  */
  movie?: Partial<Movie>

 /** Map of flags for the movies version */
  version?: Partial<MovieVersion>

  /** Current indexes of iterations */
  indexes: {    
    /** Reference of the current table cell */
    table?: TableParser.CellReference

    /** On pagination, the index of the current page */
    page?: number

    /** When parsing tabs, the index of the current tab or card */
    tab?: number
  }

  /** on static pagination: the current pages value */
  page?: string

  /** When parsing tabs, the identifier of the current tab, to find the corresponding content container */
  tabId?: string

  /** List of dates covering the current program period */
  period?: Moment[]

  /** List of warnings that occurred while running */
  warnings?: Warnings.Warning[]
  addWarning?: (warning: Warnings.Warning) => void

  /** Stack trace of internal methods. Provides additional context for implementing hooks or mappers.  */
  callstack?: string[]
  /** Adds the current executed method to the callstack */
  pushCallstack: () => void
  /** Removes the last method from the callstack */
  popCallstack: () => void
  /** Adds the current asnyc executed method to the callstack and wraps the given callback so that it will pop the callstack */
  trackCallstackAsync: <T extends Function>(callback: T) => T

  /** 
   * The currently worked on task. Use for internal progress tracking. 
   * May only be used as additinoal context hooks if `requestUrl` or `resource` is not precise enough. 
   */
  currentTask: string

  /**
   * The context which this context is cloned from. 
   * Was the framework is traversing through deep nested html structures and multiple urls, 
   * the context is cloned to allow adding details to it that is not relevant in broader scopes.
   * @internal
   */
  parentContext?: Context

  /**
   * Flag that indicates if a cinema is temporarirly clsoed. 
   */
  isTemporarilyClosed: boolean
}


/** 
 * Clones a Context and sets the given context as parent of the clone. 
 * The context should always be cloned befor passing it on, to avoid side effects.
 */
export function cloneContext<T extends Context>(context: T): T {
  let childContext = _.clone(context)
  childContext.parentContext = context  
  childContext.indexes = JSON.parse(JSON.stringify(context.indexes))
  if (context.movie) {
    childContext.movie = _.clone(context.movie)
  }
  return childContext
}

/**
 * Default implementation of the Context.
 * 
 * @category Context
 */
export class DefaultContext implements Context {
  indexes = {}
  parentContext: DefaultContext = null
  warnings: Warnings.Warning[] = null
  callstack = []
  currentTask = null
  isTemporarilyClosed = false

  addWarning(warning: Warnings.Warning) {    
    this.warnings = this.warnings  || []
    if (_.find(this.warnings, w => w.code = warning.code) === undefined) {
      this.warnings.push(warning)
    }
    if (this.parentContext) {
      this.parentContext.addWarning(warning)
    }     
  }

  trackCallstackAsync<T extends Function>(callback: T) {
    this.pushCallstack(1) // offset for method name as this is another method call wrapped
    let callbackWrapper = (...args) => {
      this.popCallstack()
      callback(...args)
    }
    return callbackWrapper as any as T
  } 
  
  pushCallstack(offset: number = 0) {
    this.callstack.push(MethodCallLogger.currentMethodName(offset))
  }

  popCallstack() {
    this.callstack.pop()
  }
} 

