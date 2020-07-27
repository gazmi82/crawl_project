import { RequestMaker, DefaultRequestMaker, RequestCallback, RequestObject } from '../../src/RequestMaker'
import Config from '../../src/Config'
import Context from '../../src/Context'
import { SilentLogger } from '../../src/Logger'


export class RequestMakerMock implements RequestMaker {
  logger = new SilentLogger()
  requests = []
  constructor(private error: string | null, private responseText: any) { }

  get urls() {
    return this.requests.map(r => r.url)
  }

  post = (new DefaultRequestMaker(new Config({}))).post
  get = (new DefaultRequestMaker(new Config({}))).get

  send(requestObj: RequestObject, context: Context, callback: RequestCallback) {
    this.countRequest(requestObj)
    let response: any = { text: this.responseText }
    setTimeout(() => { // simulate a bit of delay for making the requests
      callback(this.error, response, context)
    }, 10)
  }

  countRequest(requestObj) {
    this.requests.push(requestObj)
  }
}

export class FailableRequestMakerMock extends RequestMakerMock {
  static error = new Error('failed')
  shouldFailCount = 0
  send(requestObj: RequestObject, context: Context, callback: RequestCallback) {
    if (this.shouldFailCount > 0) {
      this.shouldFailCount -= 1
      this.countRequest(requestObj)
      callback(FailableRequestMakerMock.error, null, context)
    } else {
      super.send(requestObj, context, callback)
    }
  }
}