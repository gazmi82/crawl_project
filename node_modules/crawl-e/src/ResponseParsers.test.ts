import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as moment from 'moment'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import { DefaultResponseParser } from './ResponseParsers'
import Config from './Config'
import { TestLogger, TestContext, languageMap } from './../tests/helpers'
import Context from './Context'
import { kinoGmundenAtConfig } from '../tests/data/kino-gmunden.at/config'


describe('DefaultResponseParser', () => {

  context('kino-gmunden.at', () => {
    let testHtml
    let parser = new DefaultResponseParser(kinoGmundenAtConfig)      
    
    before(() => {
      testHtml = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'kino-gmunden.at', 'kinoprogramm.html'))
    })

    describe('#parseMovieList', () => {
      it('finds movies', (done) => {
        let $ = cheerio.load(testHtml)
        let container = $('html')
        let testContext = new TestContext({
          cheerio: $,          
        })

        let movies = []
        parser.parseMovies(container, kinoGmundenAtConfig.showtimes[0].movies, testContext, (box, testContext, cb) => {
          movies.push(testContext.movie)
          cb(null, null)
        }, (err, results) => {
          expect(err).to.be.null
          expect(movies).to.have.lengthOf(2)
          movies.forEach(m => delete m.version)
          expect(movies).to.deep.include({ title: 'Greatest Showman' })
          expect(movies).to.deep.include({ title: 'OmU: Murder on the Orient Express' })
          done()
        })
      })
    })
    
  })

  describe('#handleShowtimesResponse', () => {

    context('movies > showtimes', () => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_movies.html'))
      let testResponse: any = { text: testHtml }
      let config: any
      let logger
      let testContext: Context

      beforeEach(() => {
        config = {
          showtimes: {
            movies: {
              box: '.movie',
              title: '.title',
              showtimes: {
                box: 'ul.plain li',
                datetime: '@ownText()',
                datetimeFormat: 'DD.MM.YYYY - HH:mm',
              }
            }
          }
        }
        logger = new TestLogger()
        testContext = new TestContext()
      })

      it('picks language from movie box', (done) => {
        config.showtimes.movies.language = {
          selector: '.language',
            mapper: lang => languageMap[lang]
        }

        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T20:30:00',
            language: 'en',
            is_3d: false
          })
          done()
        })
      })

      it('picks subtitles from movie box', (done) => {
        config.showtimes.movies.subtitles = {
          selector: '.subtitles',
          mapper: input => input.split(',').map(subtitle => languageMap[subtitle])
        }
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T20:30:00',
            subtitles: 'de,fr',
            is_3d: false
          })
          done()
        })
      })

      it('picks original title from movie box', (done) => {
        config.showtimes.movies.titleOriginal = '.title-original'
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            movie_title_original: 'Scary Foovie 2 (original)',
            start_at: '2018-01-18T20:30:00',
            is_3d: false
          })
          done()
        })
      })

      it('picks 3D flag from movie box', (done) => {
        config.showtimes.movies.is3d = '.version-3d'

        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(2)
          expect(showtimes[0].is_3d).to.be.true
          done()
        })
      })


    })

    context('dates > movies > showtimes', () => {
      let testResponse: any = {
        text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_dates.html'))
      }
      let config = {
        showtimes: {
          dates: {
            box: '.day',
            date: '.date',
            dateFormat: 'YYYY-MM-DD',
            movies: {
              box: '.movie',
              title: '.title',
              showtimes: {
                box: 'li', 
                timeFormat: 'HH:mm'
              }
            }
          }
        }
      }
      let cfg = new Config(config)

      it('finds all showtimes', (done) => {
        let parser = new DefaultResponseParser()
        let logger = new TestLogger()        
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], new TestContext(), (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(3)
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T17:30:00',
            is_3d: false
          })
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T20:30:00',
            is_3d: false
          })
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-19T20:30:00',
            is_3d: false
          })
          done()
        })
      })
    })

    context('auditoria > movies > showtimes', () => {
      let testResponse: any = {
        text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_auditoria.html'))
      }
      let config = {
        showtimes: {
          auditoria: {
            box: '.auditorium',
            auditorium: 'h2',
            movies: {
              box: '.movie',
              title: 'h3',
              showtimes: {
                box: 'li',
                datetimeParsing: false
              }
            }
          }
        }
      }
      let cfg = new Config(config)

      it('finds all showtimes', (done) => {
        let parser = new DefaultResponseParser()
        let logger = new TestLogger(TestLogger.LOG_LEVELS.INFO)
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], new TestContext(), (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(3)
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T17:30:00',
            is_3d: false,
            auditorium: 'Saal 1'
          })
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T20:30:00',
            is_3d: false,
            auditorium: 'Saal 1'
          })
          expect(showtimes).to.deep.include({
            movie_title: 'Star Wars',
            start_at: '2018-01-18T20:30:00',
            is_3d: false,
            auditorium: 'Saal 2'
          })
          done()
        })
      })
    })

    context('movies > versions > showtimes', () => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_versions.html'))
      let testResponse: any = { text: testHtml }
      let config: any
      let logger

      beforeEach(() => {
        config = {
          showtimes: {
            movies: {
              box: '.movie',
              title: 'h2',
              versions: {
                box: '.showtimes',
                is3d: 'h3',
                showtimes: {
                  box: 'li',
                  datetimeFormat: 'DD.MM.YYYY - HH:mm'
                }
              }
            }
          }
        }
        logger = new TestLogger(TestLogger.LOG_LEVELS.OFF)
      })

      it('picks 3D flag from showtimes box', (done) => {
        config.showtimes.movies.is3d = '.version-3d'

        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], new TestContext(), (err, showtimes) => {
          expect(err).to.be.null
          expect(logger.logs.warnings).to.be.empty
          expect(showtimes).to.have.lengthOf(4)
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T20:30:00',
            is_3d: false
          })
          expect(showtimes).to.deep.include({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-01-18T22:45:00',
            is_3d: true
          })
          done()
        })
      })
    })

    context('movies > forEach > showtimes', () => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_versions.html'))
      let testResponse: any = { text: testHtml }
      let config: any
      let logger: TestLogger

      let showtimes

      beforeEach((done) => {
        config = {
          showtimes: {
            movies: {
              box: '.movie',
              title: 'h2',
              forEach: {
                box: '.showtimes',
                showtimes: {
                  box: 'li',
                  datetimeFormat: 'DD.MM.YYYY - HH:mm'
                }
              }
            }
          }
        }
        logger = new TestLogger(TestLogger.LOG_LEVELS.OFF)

        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.logger = logger
        parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], new TestContext(), (err, s) => {
          expect(err).to.be.null
          showtimes = s
          done()
        })
      })
      
      it('logs finding of 2 forEach boxes', () => {
        expect(logger.logs.debugs).to.deep.include({ prefix: `forEach:selection:count`, msg: 'found 2 boxes' })
      })

      it('finds 4 showtimes', () => {
        expect(showtimes).to.have.lengthOf(4)        
      })

      it('includes movie titles', () => {
        expect(showtimes[0].movie_title).to.equal('Scary Foovie 2')
      })
    })

    context('date period', () => {
      let baseConfig
      let testResponse: any = { text: '<html/>' }
      let testContext: Context
      let logger: TestLogger
      beforeEach(() => {
        logger = new TestLogger(TestLogger.LOG_LEVELS.OFF)
        testContext = new TestContext()
        baseConfig = {
          showtimes: {
            periods: { }
          }
        }
      })

      // this is duplicate with ShowtimesParser.test
      context('configuring correct value grabber returning 2 dates', () => {
        let testCases = [
          { title: 'as strings', dates: ['2018-08-10', '2018-08-11'] },
          { title: 'as Date objects', dates: [new Date(2018, 7, 10), new Date(2018, 7, 11)] },
          { title: 'as Moment objects', dates: [moment('2018-08-10'), moment('2018-08-11')] }
        ]

        testCases.forEach(testCase => {
          context(testCase.title, () => {
            let period 
            beforeEach((done) => {
              baseConfig.showtimes.periods.dateFormat = 'YYYY-MM-DD'
              baseConfig.showtimes.periods.datesParser = (box) => {
                return testCase.dates
              }
              baseConfig.showtimes.periods.dates = {
                parser: (container, ctx) => {
                  period = ctx.period
                  return []
                }
              }
              const config = new Config(baseConfig)
              testContext = new TestContext()
              let parser = new DefaultResponseParser()
              parser.logger = logger
              parser.handleShowtimesResponse(testResponse, config.showtimes[0], testContext, (err, showtimes) => {
                expect(err).to.be.null
                done()
              })
            })

            it('finds 2 dates in context', () => {
              expect(period).to.have.length(2)
            })

            it('showtimes have dates as of value grabber', () => {
              let unixDates = period.map(d => d.unix())
              expect(unixDates).to.deep.include(moment('2018-08-10').unix())
              expect(unixDates).to.deep.include(moment('2018-08-11').unix())
            })
          })
        })
      })
    })

    describe('resolving box selector templates', () => {
      let testResponse: any

      beforeEach(() => {
        let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_cinemas.html'))
        testResponse = { text: testHtml }
      })

      context('no placeholders - (reference check)', () => {
        let config = {
          showtimes: {
            movies: {
              box: '.movie',
              title: '.title',
              showtimes: {
                box: '.showtimes ul li',
                datetimeFormat: 'DD.MM.YYYY - HH:mm'
              }
            }
          }
        }

        it('finds all 4 showtimes', () => {
          let cfg = new Config(config)
          let parser = new DefaultResponseParser()
          parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], new TestContext(), (err, showtimes) => {
            expect(err).to.be.null
            expect(showtimes).to.have.lengthOf(4)
          })
        })
      })

      context('placeholder in movies.box', () => {
        let config = {
          showtimes: {
            movies: {
              box: '#:cinema.boxSelector: .movie',
              title: '.title',
              showtimes: {
                box: '.showtimes ul li',
                datetimeFormat: 'DD.MM.YYYY - HH:mm'
              }
            }
          }
        }

        let textContext = new TestContext({
          cinema: {
            boxSelector: 'cinema-a'
          }
        })

        it('finds only the 2 cinema A showtimes', () => {
          let cfg = new Config(config)
          let parser = new DefaultResponseParser()
          parser.logger = new TestLogger()
          parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], textContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(showtimes).to.have.lengthOf(2)
            expect(showtimes).to.deep.equal([
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-01-18T20:30:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-01-19T20:30:00',
                is_3d: false
              },
            ])  
          })
        })
      })

      context('placeholder in showtimes.box', () => {
        let config = {
          showtimes: {
            movies: {
              box: '.movie',
              title: '.title',
              showtimes: {
                box: '.showtimes-cinema-:cinema.id: ul li',
                datetimeFormat: 'DD.MM.YYYY - HH:mm'
              }
            }
          }
        }

        let textContext = new TestContext({
          cinema: {
            id: 'b'
          }
        })

        it('finds only the 2 cinema B showtimes', () => {
          let cfg = new Config(config)
          let parser = new DefaultResponseParser()
          parser.logger = new TestLogger()
          parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], textContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(showtimes).to.have.lengthOf(2)
            expect(showtimes).to.deep.equal([
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-01-18T19:10:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-01-19T19:10:00',
                is_3d: false
              },
            ])
          })
        })
        
      })

    })
  })  
})

