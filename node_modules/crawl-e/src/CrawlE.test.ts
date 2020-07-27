import * as _ from 'underscore'
import * as moment from 'moment'
import * as deepcopy from 'deepcopy'
import CrawlE from './CrawlE'
import { expect } from 'chai'
import { RequestObject } from './RequestMaker'
import { SilentLogger } from './Logger'
import Context from './Context'
import { SubConfigs } from './Config'
import { TestLogger, TestContext } from '../tests/helpers'
import { Cinema } from './models'
import { RequestMakerMock, FailableRequestMakerMock } from '../tests/helpers/TestRequestMakers'
import { ResponseParserMock, ContextCountingTestResponseParser } from '../tests/helpers/TestResponseParsers'

const silentLogger = new SilentLogger()

const dummyCinema = {
  name: 'Musterkino',
    address: 'Musterstraße 42, 12345 Musterstadt'
}

describe('CrawlE', () => {
  
  
  describe('#crawlIsTemporarilyClosed', () => {
    const testFnTrueCase = (mapper = undefined) => {
      let testContext = new TestContext()

      const config = {
        isTemporarilyClosed: {
          url: 'http://localhost:8080/cinema-closed.html',
          grabber: {
            selector: '.main', 
            mapper
          }
        },
        cinemas: [dummyCinema]
      }
  
      let crawlE = new CrawlE(config, silentLogger)
  
  
      it('detects temp. closed', (done) => {
        crawlE.crawlIsTemporarilyClosed(testContext, (err) => {
          expect(err).to.be.null
          expect(testContext.isTemporarilyClosed).to.be.true
          done()
        })
      })
    }

    context ('closed, with boolean mapper function', () => {
      testFnTrueCase(text => /break/.test(text))
    }) 

    context ('closed, without mapper function', () => {
      testFnTrueCase()
    }) 

    context('not closed', () => {
      let testContext = new TestContext()

      const config = {
        isTemporarilyClosed: {
          url: 'http://localhost:8080/cinema-closed.html',
          grabber: {
            selector: '.fo', 
          }
        },
        cinemas: [dummyCinema]
      }
  
      let crawlE = new CrawlE(config, silentLogger)
  
  
      it('detects not temp. closed', (done) => {
        crawlE.crawlIsTemporarilyClosed(testContext, (err) => {
          expect(err).to.be.null
          expect(testContext.isTemporarilyClosed).to.be.false
          done()
        })
      })
    })

  })

  describe('#getCinemas', () => {
    let testContext = new TestContext()
    context('static cinemas', () => {
      let config = {
        cinemas: [
          {
            name: 'Zoopalast',
            address: 'Hardenberg Straße, 29a, 10623 Berlin'
          },
          {
            name: 'Cubix am Alex',
            address: ''
          }
        ]
      }
      let crawlE = new CrawlE(config, silentLogger)

      it('loads cinemas', (done) => {
        crawlE.getCinemas(testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas).to.have.lengthOf(2)
          expect(cinemas).to.deep.include({
            name: 'Zoopalast',
            address: 'Hardenberg Straße, 29a, 10623 Berlin'
          })
          done()
        })
      })

      //
    })

    context('dynamic cinemas', () => {
      let crawlE: CrawlE
      let config = {
        cinemas: {
          list: {
            url: 'http://cinemachain.com/cinemas'
          }
        }
      }

      beforeEach(() => {
        crawlE = new CrawlE(config, silentLogger)
      })

      context('failing request', () => {
        beforeEach(() => {
          crawlE.requestMaker = new RequestMakerMock('404', null)
        })

        it('calls callback with error', (done) => {
          crawlE.getCinemas(testContext, (err, cinemas) => {
            expect(err).to.equal('404')
            done()
          })
        })
      })

      context('success', () => {
        beforeEach(() => {
          crawlE.requestMaker = new RequestMakerMock(null, 'success')
          crawlE.responseParser = new ResponseParserMock({cinemas: [
            { id: '1', name: 'Cinema 1' },
            { id: '2', name: 'Cinema 2' },
            { id: '3', name: 'Cinema 3' }
          ]})
        })

        it('loads cinemas', (done) => {
          crawlE.getCinemas(testContext, (err, cinemas) => {
            expect(err).to.be.null
            expect(cinemas).to.have.lengthOf(3)
            expect(cinemas[0]).to.eql({
              id: '1',
              name: 'Cinema 1'
            })
            done()
          })
        })
      })
    })

    context('dynamic cinemas with pagination', () => {
      let crawlE: CrawlE
      let cinemas
      let pageIndexes
      let cinemaParsingCounter
      let config = {
        cinemas: {
          list: {
            url: 'http://localhost:8080/cinemas.html',
            nextPage: 'a:contains("Next Page") @href',
            box: '.cinema',
            name: 'h2',
            id: {
              selector: 'h2', 
              mapper: (value, context) => {
                cinemaParsingCounter += 1
                pageIndexes = _.union(pageIndexes, [context.indexes.page]) // save page index for testing
              }
            }
          }
        }
      }

      beforeEach((done) => {
        pageIndexes = []
        cinemaParsingCounter = 0
        let testContext = new TestContext()
        crawlE = new CrawlE(config, silentLogger)
        crawlE.getCinemas(testContext, (err, _cinemas) => {
          expect(err).to.be.null
          cinemas = _cinemas
          done()
        })
      })

      it('finds cinema on 2 pages', () => {
        expect(cinemas).to.have.lengthOf(4)
        expect(cinemas[0].name).to.equal('Cinema Foo')
        expect(cinemas[3].name).to.equal('Cinema Page2')
      })

      it('parses each cinema once', () => {
        expect(cinemaParsingCounter).to.equal(4)
      })

      it('provides page index in context', () => {
        expect(pageIndexes).to.deep.equal([0,1])
      })

    })
  })

  describe('#crawlCinemaDetails', () => {
    let testContext: Context
    let config = {
      cinemas: {
        list: {
          url: 'http://cinemachain.com/cinemas'
        }, 
        details: {
          url: 'http://cinemachain.com/cinemas/:cinema.id:'
        }
      }
    }

    let contexts = [
      {
        title: 'with mocked response handler', 
        test: (cinemaDetails, testContext, done) => {
          let crawlE = new CrawlE(config, silentLogger)
          crawlE.requestMaker = new RequestMakerMock(null, 'success')
          crawlE.responseParser = new ResponseParserMock({ cinema: cinemaDetails })
          crawlE.crawlCinemaDetails(testContext.cinema, testContext, (error, cinema) => {
            expect(error).to.be.null
            done()
          })
        }
      },
      {
        title: 'with handleCinemaDetailsResponse hook',
        test: (cinemaDetails, testContext, done) => {
          let _config = deepcopy(config)
          _config.hooks = {
            handleCinemaDetailsResponse: (response, context, callback) => {
              expect(response).to.eql({text: 'success' }) // test that the hook get's called
              callback(null, cinemaDetails)
            }
          }
          let crawlE = new CrawlE(_config, silentLogger)
          crawlE.requestMaker = new RequestMakerMock(null, 'success')
          crawlE.crawlCinemaDetails(testContext.cinema, testContext, (error, cinema) => {
            expect(error).to.be.null
            done()
          })
        }
      }, 
    ]

    contexts.forEach(ctx =>  {
      context(ctx.title, () => {
        beforeEach(() => {
          testContext = new TestContext({
            cinema: { id: '1' } as Cinema
          })
        })        

        it('adds context.cinema.name', (done) => {
          ctx.test({ name: 'Cinema Foo' }, testContext, () => {
            expect(testContext.cinema.name).to.eql('Cinema Foo')
            done()
          })
        })

        it('replaces context.cinema.name', (done) => {
          let testContext: Context = new TestContext({
            cinema: { id: '1', name: 'Example Cinema' } as Cinema
          })
          ctx.test({ name: 'Cinema Foo' }, testContext, () => {
            expect(testContext.cinema.name).to.eql('Cinema Foo')
            done()
          })
        })

        it('adds context.cinema.address', (done) => {
          ctx.test({ address: 'Musterstraße 4711, 12345 Musterstadt' }, testContext, () => {
            expect(testContext.cinema.address).to.eql('Musterstraße 4711, 12345 Musterstadt')
            done()
          })
        })

        it('adds context.cinema.phone', (done) => {
          ctx.test({ phone: '0815 - 1234 5678' }, testContext, () => {
            expect(testContext.cinema.phone).to.eql('0815 - 1234 5678')
            done()
          })
        })

        it('adds context.cinema.email', (done) => {
          ctx.test({ email: 'foo@cinebar.com' }, testContext, () => {
            expect(testContext.cinema.email).to.eql('foo@cinebar.com')
            done()
          })
        })

        it('adds context.cinema.location', (done) => {
          ctx.test({ lat: 52.51, lon: 13.37 }, testContext, () => {
            expect(testContext.cinema.lat).to.eql(52.51)
            expect(testContext.cinema.lon).to.eql(13.37)
            done()
          })
        })
      })
    })

  })

  describe('#crawl', () => {

    context('movie list', () => {
      let config: any = {
        cinemas: [dummyCinema],
        movies: {
          list: {
            url: 'http://cinema.com/current-movies'
          }
        }
      }
      
      let crawlE: CrawlE
      let requestMaker: RequestMakerMock
      let responseParserMock = new ResponseParserMock({
        movies: [
          { id: '1' },
          { id: '2' },
          { id: '3' }
        ]
      })
      
      context('without showtimes config', () => {
        before(() => {
          requestMaker = new RequestMakerMock(null, 'success')
          crawlE = new CrawlE(config, silentLogger)
          crawlE.requestMaker = requestMaker
          crawlE.responseParser = responseParserMock
        })
        
        it('makes a movies list request', (done) => {
          crawlE.crawl((err) => {

          // })
          // crawlE.getMoives({}, (err, result) => {
            expect(err).to.be.null
            expect(requestMaker.urls).to.contain('http://cinema.com/current-movies')
            expect(crawlE.results.movies).to.not.be.null
            expect(crawlE.results.movies).to.have.lengthOf(3)
            expect(crawlE.results.movies[0]).to.deep.equal({id: '1'})
            done()
          })
        })
      })
      
      context('adding showtimes config', () => {
        beforeEach(() => {
          config.movies.showtimes = {
            url: 'http://cinema.com/movies/:movie.id:'
          }
          requestMaker = new RequestMakerMock(null, 'success')
          crawlE = new CrawlE(config, silentLogger)
          crawlE.requestMaker = requestMaker
          crawlE.responseParser = responseParserMock
        })
        
        it('makes requests to each movie page', (done) => {
          crawlE.crawl((err) => {          
            expect(err).to.be.null
            expect(requestMaker.urls).to.contain('http://cinema.com/movies/1')
            expect(requestMaker.urls).to.contain('http://cinema.com/movies/2')
            expect(requestMaker.urls).to.contain('http://cinema.com/movies/3')
            done()
          })
        })

        it('calls showtimes response handler with each movie in context once', (done) => {          
          let responseParserMock = new ContextCountingTestResponseParser({
            movies: [
                { id: '1' },
                { id: '2' },
                { id: '3' }
              ]
            }, 
            context => context.movie
              ? context.movie.id 
              : 'idontcare'
          )
          crawlE.responseParser = responseParserMock
          crawlE.crawl((err) => {
            expect(err).to.be.null
            expect(responseParserMock.counters['1']).to.equal(1)
            expect(responseParserMock.counters['2']).to.equal(1)
            expect(responseParserMock.counters['3']).to.equal(1)
            done()
          })
        })
      })
    })
  })

  describe('#getShowtimes', () => {

    let cases = [{
      name: 'without urlDateCount', 
      config: {},
      dayCount: 14
    }, {
      name: 'urlDateCount: 3', 
      config: { urlDateCount: 3 },
      dayCount: 3
    }]

    cases.forEach(testcase => {
      context(`auto date list - ${testcase.name}`, () => {
        context(':date: in url template', () => {
          let crawlE: CrawlE
          let requestMaker: RequestMakerMock
          let config = {
            cinemas: [dummyCinema],
            showtimes: {
              url: 'http://cinemas.com/showtimes?date=:date:',
              urlDateFormat: 'YYYY-MM-DD',
              ...testcase.config
            }
          }

          beforeEach(() => {
            requestMaker = new RequestMakerMock(null, 'success')
            crawlE = new CrawlE(config, silentLogger)
            crawlE.requestMaker = requestMaker
          })

          it('makes one request per day', (done) => {
            crawlE.getShowtimes(new TestContext(), crawlE.config.showtimes, (err, result) => {
              expect(err).to.be.null
              expect(requestMaker.urls).to.have.lengthOf(testcase.dayCount)
              _.range(testcase.dayCount).map(d => {
                expect(requestMaker.urls).to.contain('http://cinemas.com/showtimes?date=' + moment().add(d, 'days').format('YYYY-MM-DD'))
              })
              done()
            })
          })

          it('calls iterator with each date in context once', (done) => {
            let dateFormat = 'YYYY-MM-DD'
            let responseParserMock = new ContextCountingTestResponseParser(
              {},
              context => context.date.format(dateFormat)
            )
            crawlE.responseParser = responseParserMock
            crawlE.getShowtimes(new TestContext(), crawlE.config.showtimes, (err, result) => {
              expect(err).to.be.null
              _.range(testcase.dayCount).forEach(d => {
                let dateStr = moment().add(d, 'day').format(dateFormat)
                expect(responseParserMock.counters[dateStr]).to.equal(1, `${dateStr} date should be called once`)
              })
              done()
            })
          })
        })

        context(':date: in post data string template', () => {
          let config = {
            cinemas: [dummyCinema],
            showtimes: {
              url: 'http://cinemas.com/showtimes',
              urlDateFormat: 'YYYY-MM-DD',
              postData: 'date=:date:',
              ...testcase.config
            }
          }
          let requestMaker = new RequestMakerMock(null, 'success')
          let crawlE = new CrawlE(config, silentLogger)
          crawlE.requestMaker = requestMaker

          it('makes one request per day', (done) => {
            crawlE.getShowtimes(new TestContext(), crawlE.config.showtimes, (err, result) => {
              expect(err).to.be.null
              expect(requestMaker.requests).to.have.lengthOf(testcase.dayCount)
              _.range(testcase.dayCount).map(d => {
                expect(requestMaker.requests).to.deep.include({ url: 'http://cinemas.com/showtimes', postData: `date=${moment().add(d, 'days').format('YYYY-MM-DD')}` })                
              })
              done()
            })
          })
        })

        context(':date: in post data json template', () => {
          let config = {
            cinemas: [dummyCinema],
            showtimes: {
              url: 'http://cinemas.com/showtimes',
              urlDateFormat: 'YYYY-MM-DD',
              postData: {
                date: ':date:'
              },
              ...testcase.config
            }
          }
          let requestMaker = new RequestMakerMock(null, 'success')
          let crawlE = new CrawlE(config, silentLogger)
          crawlE.requestMaker = requestMaker

          it('makes one request per day', (done) => {
            crawlE.getShowtimes(new TestContext(), crawlE.config.showtimes, (err, result) => {
              expect(err).to.be.null
              expect(requestMaker.requests).to.have.lengthOf(testcase.dayCount)
              _.range(testcase.dayCount).map(d => {
                expect(requestMaker.requests).to.deep.include({ url: 'http://cinemas.com/showtimes', postData: { date: moment().add(d, 'days').format('YYYY-MM-DD') } })
              })
              done()
            })
          })
        })
      })
    })

    
  })

  describe('#crawlShowtimesList', () => {
    let config: any = {
      cinemas: [dummyCinema]
    }
    let testContext = new TestContext()

    context('retrying on errors', () => {
      context('after 2 error', () => {
        let logger: TestLogger
        let result: { err: Error, showtimes: any }
        let requestMaker: FailableRequestMakerMock
        beforeEach((done) => {
          logger = new TestLogger()
          requestMaker = new FailableRequestMakerMock(null, 'success')
          requestMaker.shouldFailCount = 2
          let crawlE = new CrawlE(config, logger)
          crawlE.requestMaker = requestMaker
          crawlE.responseParser = new ResponseParserMock({})
          crawlE.crawlShowtimesList({ url: 'http://example.com' }, config, testContext, (err, showtimes) => {
            result = {
              err: err, 
              showtimes: showtimes
            }
            done()
          })
        })
        
        it('succeeds after 1 error', () => {
          expect(result.err).to.be.null
        })
        
        it('calls requested url 3 times', () => {
          expect(requestMaker.urls).to.have.lengthOf(3)
        })
        
        it('logs warnings for retrying attempts', () => {
          expect(logger.logs.warnings).to.include('retrying (attempt: 2) showtimes crawling from http://example.com due to error: failed')
          expect(logger.logs.warnings).to.include('retrying (attempt: 3) showtimes crawling from http://example.com due to error: failed')
        })
      })
      
      it('fails after 3 error', (done) => {
        let requestMaker = new FailableRequestMakerMock(null, 'success')
        requestMaker.shouldFailCount = 3
        let crawlE = new CrawlE(config, silentLogger)
        let logger = new TestLogger()
        crawlE.requestMaker = requestMaker
        crawlE.responseParser = new ResponseParserMock({})
        crawlE.crawlShowtimesList({ url: 'http://example.com' }, config, testContext, (err, showtimes) => {
          expect(err).to.equal(FailableRequestMakerMock.error)
          expect(requestMaker.urls).to.have.lengthOf(3)
          done()
        })
      })
    })

    context('correcting start_at on showtimes', () => {
      let crawlE = new CrawlE(config, silentLogger)
      crawlE.requestMaker = new RequestMakerMock(null, 'success')
      let createTestShowtimes = () => [
        {
          movie_title: 'Scary Foovie 2',
          start_at: '2018-03-15T20:30:00'
        },
        {
          movie_title: 'Scary Foovie 2',
          start_at: '2018-03-15T00:20:00'
        }
      ]
      
      context('preserveLateNightShows: false', () => {
        let result: {err: Error, showtimes: any}
        let testContext = new TestContext({ preserveLateNightShows: false })
        before((done) => {
          crawlE.responseParser = new ResponseParserMock({ showtimes: createTestShowtimes() })
          crawlE.crawlShowtimesList({ url: 'http://example.com' }, config, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(showtimes).to.have.lengthOf(2)
            result = {
              err: err, 
              showtimes: showtimes
            }
            done()
          })
        })

        it('moves latenight showtimes by one day', () => {
          expect(result.showtimes[1].start_at).to.equal('2018-03-16T00:20:00')
        })

        it('keeps evening showtimes on same day', () => {
          expect(result.showtimes[0].start_at).to.equal('2018-03-15T20:30:00')
        })
      })

      context('preserveLateNightShows: true', () => {
        let result: { err: Error, showtimes: any }
        let testContext = new TestContext()
        let testConfig = { preserveLateNightShows: true } as SubConfigs.Showtimes.CrawlingConfig
        before((done) => {
          crawlE.responseParser = new ResponseParserMock({ showtimes: createTestShowtimes() })
          crawlE.crawlShowtimesList({ url: 'http://example.com' }, testConfig, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(showtimes).to.have.lengthOf(2)
            result = {
              err: err,
              showtimes: showtimes
            }
            done()
          })
        })

        it('keeps all showtimes on same day', () => {
          expect(result.showtimes[0].start_at).to.equal('2018-03-15T20:30:00')
          expect(result.showtimes[1].start_at).to.equal('2018-03-15T00:20:00')
        })
      })
    })
  })

  describe('hooks', () => {
    describe('beforeCrawling hook', () => {
      it('calls hook once', (done) => {
        let counter = 0
        let config = {
          cinemas: [dummyCinema],
          showtimes: {
            url: 'http://cinemas.com/showtimes',
          },
          hooks: {
            beforeCrawling: (context, cb) => {
              counter += 1
              cb()
            }
          }
        }
        let crawlE = new CrawlE(config, silentLogger)
        crawlE.requestMaker = new RequestMakerMock(null, 'success')
        crawlE.crawl(err => {
          expect(err).to.be.null
          expect(counter).to.equal(1)
          done()
        })
      })

      it('picks up values added to the context', (done) => {
        let crawlingContext
        let config = {
          cinemas: [dummyCinema],
          showtimes: {
            url: 'http://cinemas.com/showtimes',
          },
          hooks: {
            beforeCrawling: (context, cb) => {
              context.foo = 'bar'
              cb()
            }
          }
        }
        let crawlE = new CrawlE(config, silentLogger)
        crawlE.requestMaker = new RequestMakerMock(null, 'success')
        crawlE.responseParser.handleShowtimesResponse = (response, config, context, callback) => {
          crawlingContext = context
          callback(null, [])
        }
        crawlE.crawl(err => {
          expect(err).to.be.null
          expect(crawlingContext.foo).to.equal('bar')
          done()
        })
      })
    })

    describe('beforeSave hook', () => {
      it('calls hook once', (done) => {
        let counter = 0
        let config = {
          cinemas: [dummyCinema],
          showtimes: {
            url: 'http://cinemas.com/showtimes',
          },
          hooks: {
            beforeSave: (data, context) => {
              counter += 1
              return data
            }
          }
        }
        let crawlE = new CrawlE(config, silentLogger)
        crawlE.requestMaker = new RequestMakerMock(null, 'success')
        crawlE.crawl(err => {
          expect(err).to.be.null
          expect(counter).to.equal(1)
          done()
        })
      })
    })
  })


  describe('#workOnRequestLists', () => {
    let config: any = {
      cinemas: [dummyCinema]
    }
    let logger = new TestLogger()
    let testContext = new TestContext()

    context('simple', () => {
      it('calls iterator once', (done) => {
        let crawlE = new CrawlE(config, logger)
        let listCrawlingConfig = {
          urls: ['http://cinebar.foo']
        }
        let counter = 0
        // workOnRequestLists(config: SubConfigs.Generic.ListCrawlingConfig, context, iterator: (requestObject: RequestObject, context: any, callback: Function) => void, callback) {
        crawlE.workOnRequestLists(listCrawlingConfig, testContext, (requestObject: RequestObject, context: any, callback: Function) => {
          counter += 1
          callback()
        }, (err, result) => {
          expect(err).to.be.null
          expect(counter).to.equal(1)
          done()
        })
      })
    })

    context('with :date: placeholder', () => {
      it('calls iterator multiple times', (done) => {
        let counter = 0
        let crawlE = new CrawlE(config, logger)
        let listCrawlingConfig = {
          urls: ['http://cinebar.foo/?date=:date:'],
          urlDateCount: 3
        }

        crawlE.workOnRequestLists(listCrawlingConfig, testContext, (requestObject: RequestObject, context: any, callback: Function) => {
          counter += 1
          callback()
        }, (err, result) => {
          expect(err).to.be.null
          expect(counter).to.equal(3)
          done()
        })
      })
    })

    context('static pagination', () => {
      function testPagination(listCrawlingConfig, expectedPages) {
        let pages = []
        let pageIndexes = []
        before((done) => {
          let crawlE = new CrawlE(config, logger)
          crawlE.workOnRequestLists(listCrawlingConfig, testContext, (requestObject: RequestObject, context: any, callback: Function) => {
            pages.push(context.page)
            pageIndexes.push(context.indexes.page)
            callback()
          }, (err, result) => {
            expect(err).to.be.null
            done()
          })
        })
        
        it(`calls iterator ${expectedPages.length} times`, () => {
          expect(pages).to.have.lengthOf(expectedPages.length)
        })
        
        it('has page values in context', () => {
          expect(pages).to.deep.equal(expectedPages)
        })

        it('has page index in context', () => {
          expect(pageIndexes).to.deep.equal(_.range(expectedPages.length))
        })

      }

      context(':page(0,4): in url template', () => {
        let listCrawlingConfig = {
          urls: ['http://cinebar.foo/?page=:page(0,4):'],
        }
        testPagination(listCrawlingConfig, ['0', '1', '2', '3', '4'])
      })

      context(':page([a,b,c]): in postData', () => {
        let listCrawlingConfig = {
          urls: ['http://cinebar.foo/'],
          postData: 'page=:page([a,b,c]):'
        }
        testPagination(listCrawlingConfig, ['a', 'b', 'c'])
      })
    })

  })
})
