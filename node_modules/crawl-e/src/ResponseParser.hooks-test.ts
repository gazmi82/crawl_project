import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as _ from 'underscore'
import * as moment from 'moment'
import { DefaultResponseParser } from './ResponseParsers'
import Config from './Config'
import { TestLogger, TestContext } from './../tests/helpers'
import { DatesParsing } from './parsers'
import Context from './Context';


describe('DefaultResponseParser', () => {
  // patch current day to the date of nock recording the requests
  let moment_now
  before(() => {
    moment_now = moment.now
    let anyMoment = moment as any
    anyMoment.now = () => { return Date.parse('2018-01-16') }
  })
  after(() => {
    let anyMoment = moment as any
    anyMoment.now = moment_now
  })

  describe('hooks', () => {
    let logger
    let showtimes

    function executeResponseParser(config, testResponse, done, testContext: Context = new TestContext()) {
      let cfg = new Config(config)
      let parser = new DefaultResponseParser(cfg)
      parser.logger = logger
      parser.handleShowtimesResponse(testResponse, cfg.showtimes[0], testContext, (err, _showtimes) => {
        expect(err).to.be.null
        showtimes = _showtimes
        done()
      })
    }

    context('*.dates.parser', () => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_with_66_dates.html'))
      let testResponse: any = { text: testHtml }
      let config: any

      let parser = (container) => {
        let text = container.find('p:nth-of-type(2)').text()
        return DatesParsing.parseDates(text, {
          dateFormat: 'M/DD',
          rangeSeparator: '-',
          compoundSeparator: '&'
        })
      }

      beforeEach(() => {
        logger = new TestLogger()
        config = {
          showtimes: {
            url: '',
            movies: {
              box: '.movie',
              title: '.title',
            }
          }
        }
      })

      context('without next level parsing config', () => {

        beforeEach(() => {
          config.showtimes.movies.dates = {
            parser: parser
          }
        })

        it('should not crash', (done) => {
          expect(() => { executeResponseParser(config, testResponse, () => { }) }).to.not.throw()
          done()
        })

        it('parses 0 showtimes', (done) => {
          executeResponseParser(config, testResponse, () => {
            expect(showtimes).to.have.lengthOf(0)
            done()
          })
        })

      })

      context('with showtimes as next level parsing config', () => {

        let showtimesParsingConfig = () => ({
          box: 'p:nth-of-type(2)',
            delimiter: ' ',
              time: {
            selector: ':box',
              mapper: str => {
                let regex = /\d{0,1}:\d{2}/
                return regex.test(str)
                  ? str.match(regex)[0]
                  : undefined
              }
          },
          timeFormat: 'h:mm'
        })

        let checkShowtimes = () => {
          it('parses 6 showtimes', () => {
            expect(showtimes).to.have.lengthOf(6)
          })

          it('parses all showtimes of 2nd p row', () => {
            ['26', '27', '28'].forEach(day => {
              ['04', '07'].forEach(hour => {
                expect(showtimes).to.deep.include({
                  movie_title: 'Scary Foovie 2',
                  start_at: `2018-03-${day}T${hour}:10:00`,
                  is_3d: false
                })
              })
            })
          })
        }

        context('sync - no context param', () => {
          beforeEach((done) => {
            config.showtimes.movies.dates = {
              parser: parser,
              showtimes: showtimesParsingConfig()
            }
            executeResponseParser(config, testResponse, done)
          })
          checkShowtimes()          
        })

        context('sync - with context param', () => {
          beforeEach((done) => {
            config.showtimes.movies.dates = {
              parser: (container, context) => parser(container),
              showtimes: showtimesParsingConfig()
            }
            executeResponseParser(config, testResponse, done)
          })
          checkShowtimes()
        })

        context('async', () => {
          beforeEach((done) => {
            config.showtimes.movies.dates = {
              parser: (container, config, callback) => {
                let dates = parser(container)
                callback(null, dates)
              },
              showtimes: showtimesParsingConfig()
            }
            executeResponseParser(config, testResponse, done)
          })
          checkShowtimes()
        })
        
      })
    })

    context('*.showtimes.parser', () => {
      let dummyShowtime = {
        movie_title: 'Scray Foovie', 
        start_at: '2011-11-11T11:11:00'        
      }
      let testResponse: any = { text: 'Lorem Ipsum is simply dummy text.' }
      let config: any
      let parser = (container) => {
        return [dummyShowtime]
      }

      beforeEach(() => {
        logger = new TestLogger()
        config = { showtimes: { url: '', showtimes: { } } }
      })

      let checkShowtimes = () => {
        it('parses 1 showtime', () => {
          expect(showtimes).to.have.lengthOf(1)
          expect(showtimes[0]).to.eql(dummyShowtime)
        })        
      }

      context('sync - no context param', () => {
        beforeEach((done) => {
          config.showtimes.showtimes.parser = parser
          executeResponseParser(config, testResponse, done)
        })
        checkShowtimes()
      })

      context('sync - with context param', () => {
        beforeEach((done) => {
          config.showtimes.showtimes.parser = (container, context) => parser(container)
          executeResponseParser(config, testResponse, done)
        })

        checkShowtimes()

        it('calls parsers with context', (done) => {
          let calledContexxt
          let testContext = new TestContext()
          config = { showtimes: { url: '', showtimes: {} } }
          config.showtimes.showtimes.parser = (container, context) => calledContexxt = context
          executeResponseParser(config, testResponse, () => {
            expect(calledContexxt).to.be.instanceOf(TestContext)
            expect(calledContexxt).to.equal(testContext)
            expect(calledContexxt === testContext).to.be.true
            done()
          }, testContext)
        })
        
      })

      context('async', () => {
        beforeEach((done) => {
          config.showtimes.showtimes.parser = (container, config, callback) => {
            callback(null, parser(container))
          }
          executeResponseParser(config, testResponse, done)
        })
        checkShowtimes()
      })
    })
    
  }) // end of hooks

}) 