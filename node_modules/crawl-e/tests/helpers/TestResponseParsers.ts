import { DefaultResponseParser } from '../../src/ResponseParsers'
import Context from '../../src/Context'
import { SubConfigs } from '../../src/Config'
import { Cinema } from '../../src/models'
import { Callback } from '../../src/Types'


export class ResponseParserMock extends DefaultResponseParser {
  constructor(protected results: any) {
    super()
  }
  handleCinemasResponse(response: any, config: any, context: Context, callback: (err: Error, result: any[]) => void) {
    callback(null, this.results.cinemas)
  }

  handleCinemaDetailsResponse(response: any, config: any, context: Context, callback: Callback<Cinema>) {
    callback(null, this.results.cinema as Cinema)
  }

  handleMoviesResponse(response: any, config: any, context: Context, callback: (err: Error, result: any[]) => void) {
    callback(null, this.results.movies)
  }
  handleShowtimesResponse(response: any, config: SubConfigs.Showtimes.CrawlingConfig, context: Context, callback: (err: Error, result: any[]) => void) {
    callback(null, this.results.showtimes)
  }
}

export class ContextCountingTestResponseParser extends ResponseParserMock {
  counters = {}

  constructor(results: any, private keyMapper: Function) {
    super(results)
  }

  handleMoviesResponse(response: any, config: any, context: Context, callback: (err: Error, result: any[]) => void) {
    this.incrementCounter(context)
    super.handleMoviesResponse(response, config, context, callback)
  }

  handleShowtimesResponse(response: any, config: SubConfigs.Showtimes.CrawlingConfig, context: Context, callback: (err: Error, result: any[]) => void) {
    this.incrementCounter(context)
    super.handleShowtimesResponse(response, config, context, callback)
  }

  private incrementCounter(context) {
    let counterKey = this.keyMapper(context)
    this.counters[counterKey] = (this.counters[counterKey] || 0) + 1
  }
}