import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import * as moment from 'moment'
import Config from '../Config'
import { SilentLogger } from './../Logger'

import { VersionParser } from './VersionParser'
import { ShowtimesParser } from './ShowtimesParser'
import { DateParser } from './DateParser'
import { TimeParser } from './TimeParser'

import { TestContext, versionFlags, languageMap, TestLogger } from '../../tests/helpers'
import { kinoGmundenAtConfig } from '../../tests/data/kino-gmunden.at/config'

describe('ShowtimesParser', () => {
  const logger = new SilentLogger()
  const parser = new ShowtimesParser(logger, new DateParser(logger), new TimeParser(logger), new VersionParser(logger))

  describe('#parseShowtimes', () => {
    let testHtml
    let movieBoxes
    let testContext

    beforeEach(() => {
      testHtml = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_movies.html'))
      let $ = cheerio.load(testHtml)
      movieBoxes = $('.movie')
      testContext = new TestContext({
        cheerio: $,
        movie: {
          title: 'Scary Foovie 2'
        },
      })
    })

    it('finds plain showtimes without booking links', (done) => {
      let showtimesParsingConfig: any = {
        box: 'ul.plain li',
        datetime: '@ownText()',
        datetimeFormat: 'DD.MM.YYYY - HH:mm',
      }
      parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
        expect(err).to.be.null
        expect(showtimes).to.have.length(2)
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
        done()
      })
    })

    context('plain showtimes with german weekday abbreviation', () => {
      let showtimesParsingConfig
      beforeEach(() => {
        showtimesParsingConfig = {
          box: 'ul.plain-de li',
          datetimeFormat: 'dd DD.MM.YYYY - HH:mm'
        }
      })

      function testWithLocale(showtimesParsingConfig, done) {
        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
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
          done()
        })
      }

      it('finds only some times without setting locale', (done) => {
        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(1) // actually it still finds one showtime because Fr is the egal in 'de' and 'en' 
          done()
        })
      })

      it('finds times when setting dateLocale & timeLocale', (done) => {
        showtimesParsingConfig.dateLocale = 'de'
        showtimesParsingConfig.timeLocale = 'de'
        testWithLocale(showtimesParsingConfig, done)
      })

      it('finds times when setting datetimeLocale', (done) => {
        delete showtimesParsingConfig.dateLocale
        delete showtimesParsingConfig.timeLocale
        showtimesParsingConfig.datetimeLocale = 'de'
        testWithLocale(showtimesParsingConfig, done)
      })

      it('finds no times setting wrong locale', (done) => {
        delete showtimesParsingConfig.dateLocale
        delete showtimesParsingConfig.timeLocale
        showtimesParsingConfig.datetimeLocale = 'br'        
        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(0)
          done()
        })
      })

    })

    describe('parsing of booking links', () => {

      function testFullBookingLinks(showtimesParsingConfig) {
      it('finds showtimes with full booking links', (done) => {
        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-18T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4711'
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-19T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4712'
            },
          ])
          done()
        })
      })
      }
      
      context('using a tags as box', () => {
        let showtimesParsingConfig = {
          box: 'ul.with–full-links li a',
          datetimeFormat: 'DD.MM.YYYY - HH:mm'
        }
        testFullBookingLinks(showtimesParsingConfig)
      })
      
      context('using li tags as box + bookingLink ValueGrabber', () => {
        let showtimesParsingConfig = {
          box: 'ul.with–full-links li',
          datetime: 'a',
          datetimeFormat: 'DD.MM.YYYY - HH:mm',
          bookingLink: 'a @href'
        }
        testFullBookingLinks(showtimesParsingConfig)
      })
      
      it('finds showtimes with relative booking links adding base url from request (with leading slash)', (done) => {
        let showtimesParsingConfig = {
          box: `ul.with–relative-links li a`, 
          datetimeFormat: 'DD.MM.YYYY - HH:mm'
        }

        testContext.requestUrl = 'http://mycinema.com/showtimes'

        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-18T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4711'
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-19T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4712'
            },
          ])
          done()
        })
      })

      it('finds showtimes with relative booking links adding base url from request (no leading slash, on sub-page with trailing slash)', (done) => {
        let showtimesParsingConfig = { 
          box: `ul.with–relative-links_no-leading-slash li a` ,
          datetimeFormat: 'DD.MM.YYYY - HH:mm'
        }

        testContext.requestUrl = 'http://mycinema.com/showtimes/'

        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-18T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/showtimes/booking?event_id=4711'
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-19T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/showtimes/booking?event_id=4712'
            },
          ])
          done()
        })
      })

      // the slash is important for url resolving
      it('finds showtimes with relative booking links adding base url from request (no leading slash, on sub-page without trailing slash)', (done) => {
        let showtimesParsingConfig = {
          box: `ul.with–relative-links_no-leading-slash li a`,
          datetimeFormat: 'DD.MM.YYYY - HH:mm'
        }

        testContext.requestUrl = 'http://mycinema.com/showtimes'

        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-18T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4711'
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-19T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4712'
            },
          ])
          done()
        })
      })

      it('finds showtimes with relative booking links adding base url from request (no leading slash, on root-page)', (done) => {
        let showtimesParsingConfig = {
          box: `ul.with–relative-links_no-leading-slash li a`,
          datetimeFormat: 'DD.MM.YYYY - HH:mm'
        } 

        testContext.requestUrl = 'http://mycinema.com'

        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-18T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4711'
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-19T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4712'
            },
          ])
          done()
        })

      })

      it('finds showtimes with full booking but no protocol links adding protocol as of url from request', (done) => {
        let showtimesParsingConfig = {
          box: `ul.with–full-links_no-protocol li a`,
          datetimeFormat: 'DD.MM.YYYY - HH:mm'
        }

        testContext.requestUrl = 'http://mycinema.com/showtimes'

        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-18T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4711'
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-01-19T20:30:00',
              is_3d: false,
              booking_link: 'http://mycinema.com/booking?event_id=4712'
            },
          ])
          done()
        })
      })
    })

    it('detects 3D from context.movie.title', (done) => {
      let showtimesParsingConfig = {
        box: 'ul.with–relative-links li a',
        datetimeFormat: 'DD.MM.YYYY - HH:mm'
      }

      testContext.movie = {
        title: 'Scary Foovie 2 in 3D'
      }

      parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
        expect(err).to.be.null
        expect(showtimes).to.have.length(2)
        expect(showtimes[0].is_3d).to.be.true
        expect(showtimes[1].is_3d).to.be.true
        done()
      })
    })

    it('detects IMAX from movie titles', (done) => {
      let showtimesParsingConfig = { 
        box: 'ul.with–relative-links li a',
        datetimeFormat: 'DD.MM.YYYY - HH:mm'
      }

      testContext.movie = {
        title: 'Scary Foovie 2 in IMAX'
      }

      parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
        expect(err).to.be.null
        expect(showtimes).to.have.length(2)
        expect(showtimes[0].is_imax).to.be.true
        expect(showtimes[1].is_imax).to.be.true
        done()
      })
    })


    context('version attributes', () => {
      let showtimesParsingConfig: any
      beforeEach(() => {
        showtimesParsingConfig = {
          box: 'ul.plain li',
          datetime: '@ownText()',
          datetimeFormat: 'DD.MM.YYYY - HH:mm',
        }
      })

      context(`without attributes in context`, () => {
        it('parses version attributes from showtimes', (done) => {
          showtimesParsingConfig.attributes = '.version-3d-on-showitme'
          parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
            expect(showtimes[0].attributes).to.deep.equal(['3D'])
            done()
          })
        })
      })

      context(`with context.version.attributes = ['foo', 'bar']`, () => {
        it('picks up version attributes from context', (done) => {
          testContext.version = {
            attributes: ['foo', 'bar']
          }
          parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
            expect(showtimes[0].attributes).to.deep.equal(['foo', 'bar'])
            done()
          })
        })
      })

      context(`with context.version.attributes = []`, () => {
        it('does not include empty array in showtimes', (done) => {
          testContext.version = {
            attributes: []
          }
          parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
            expect(showtimes[0].attributes).to.be.undefined
            expect(showtimes[0]).to.not.have.property('attributes')
            done()
          })
        })
      })
    })


    it('picks the auditorium from showtime boxes', (done) => {
      let showtimesParsingConfig = {
        box: 'ul.with–full-links li',
        datetime: 'a',
        datetimeFormat: 'DD.MM.YYYY - HH:mm',
        auditorium: '.auditorium'
      }

      parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
        expect(err).to.be.null
        expect(showtimes).to.have.length(2)
        expect(showtimes[0].auditorium).to.equal('Cinema 1')
        done()
      })
    })

    context('all data in showtimes box', () => {
      let testContext
      let showtmiesContainer

      beforeEach(() => {
        let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_everything_in_box.html'))
        let $ = cheerio.load(testHtml)
        showtmiesContainer = $('html')
        testContext = new TestContext({ cheerio: $ })
      })

      it('picks the movie title from showtime boxes', (done) => {
        let showtimesParsingConfig = {
          box: 'ul.showtimes li',
          datetime: 'time @datetime',
          datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
          movieTitle: '.title'
        }

        parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-02-02T18:30:00',
            is_3d: false
          })
          expect(showtimes[1]).to.eql({
            movie_title: 'Star Wars',
            start_at: '2018-02-03T19:30:00',
            is_3d: false
          })
          done()
        })
      })

      it('picks the movie original title from showtime boxes', (done) => {
        let showtimesParsingConfig = {
          box: 'ul.showtimes li',
          datetime: 'time @datetime',
          datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
          movieTitle: '.title',
          movieTitleOriginal: '.title-original'
        }

        parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            movie_title_original: 'Scary Foovie 2 (original)',
            start_at: '2018-02-02T18:30:00',
            is_3d: false
          })
          expect(showtimes[1]).to.eql({
            movie_title: 'Star Wars',
            movie_title_original: 'Star Wars 2',
            start_at: '2018-02-03T19:30:00',
            is_3d: false
          })
          done()
        })
      })

      it('picks the language from showtime boxes', (done) => {
        let showtimesParsingConfig = {
          box: 'ul.showtimes li',
          datetime: 'time @datetime',
          datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
          movieTitle: '.title',
          language: {
            selector: '.language',
            mapper: langStr => languageMap[langStr]
          }
        }

        parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-02-02T18:30:00',
            language: 'en',
            is_3d: false
          })
          done()
        })
      })

      it('picks the subtitle from showtime boxes (subtitles.mapper returning array)', (done) => {
        let showtimesParsingConfig = {
          box: 'ul.showtimes li',
          datetime: 'time @datetime',
          datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
          movieTitle: '.title',
          subtitles: {
            selector: '.subtitle',
            mapper: str => [languageMap[str]]
          }
        }

        parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-02-02T18:30:00',
            subtitles: 'de',
            is_3d: false
          })
          done()
        })
      })

      // while the docs specify that the mapper of subtiles should return an array
      // it's quiet likely devs will make it return a string with the single subtitle lang
      it('picks the subtitle from showtime boxes (subtitles.mapper returning string)', (done) => {
        let showtimesParsingConfig = {
          box: 'ul.showtimes li',
          datetime: 'time @datetime',
          datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
          movieTitle: '.title',
          subtitles: {
            selector: '.subtitle',
            mapper: str => languageMap[str]
          }
        }

        parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes[0]).to.eql({
            movie_title: 'Scary Foovie 2',
            start_at: '2018-02-02T18:30:00',
            subtitles: 'de',
            is_3d: false
          })
          done()
        })
      })




      versionFlags.forEach(flag => {
        describe(`${flag.label} flag`, () => {
          function testFlagPicking(flagValueGrabberConfig, cb) {
            let showtimesParsingConfig = {
              box: 'ul.showtimes li',
              datetime: 'time @datetime',
              datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
              movieTitle: '.title',
              [flag.key]: flagValueGrabberConfig
            }
                    
            parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
              expect(err).to.be.null
              expect(showtimes).to.have.length(2)
              cb(showtimes[0][`is_${flag.label.toLowerCase()}`])
            })
          }

          context(`finding '${flag.label}' string`, () => {
            it('picks true (parsing string from value grabber)', (done) => {
              testFlagPicking(`.version-${flag.label.toLowerCase()}`, flagValue => {
                expect(flagValue).to.be.true
                done()
              })
            })
            it('picks true (getting boolean from value grabber)', (done) => {
              testFlagPicking({ selector: `.version-${flag.label.toLowerCase()}`, mapper: flag.mapper }, flagValue => {
                expect(flagValue).to.be.true
                done()
              })
            })
          })

          function testFalseCases(selector) {
            it('picks false (parsing string from value grabber)', (done) => {
              testFlagPicking(selector, flagValue => {
                expect(flagValue).to.be.oneOf([false, undefined])
                done()
              })
            })
            it('picks false (getting boolean from value grabber)', (done) => {
              testFlagPicking({ selector: selector, mapper: flag.mapper }, flagValue => {
                expect(flagValue).to.be.oneOf([false, undefined])
                done()
              })
            })
          }

          if (flag.label === '3D') {
            context(`finding '2D' string`, () => {
              testFalseCases('.version-2d')
            })
          }

          context('finding no string (wrong selector)', () => {
            testFalseCases('foo-sel')
          })

        })
      })

      context('`Today` & `Tomorrow` strings', () => {
        let moment_now
        before(() => {
          moment_now = moment.now
          let anyMoment = moment as any
          anyMoment.now = () => { return Date.parse('2018-02-02') }
        })
        after(() => {
          let anyMoment = moment as any
          anyMoment.now = moment_now
        })

        let locales = ['de'] // , 'en', 'es']
        locales.forEach(locale => {
          context(locale, () => {
            it('finds all showitmes', (done) => {
              let showtimesParsingConfig = {
                box: 'ul.showtimes li',
                movieTitle: '.title',
                date: `.date-${locale}-today-tmr`,
                dateFormat: 'YYYY-MM-DD',
                time: 'time strong',
                timeFormat: 'HH.mm'
              }
              
              parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, showtimes) => {
                expect(err).to.be.null
                expect(showtimes).to.have.length(2)
                expect(showtimes[0]).to.eql({
                  movie_title: 'Scary Foovie 2',
                  start_at: '2018-02-02T18:30:00',
                  is_3d: false
                })
                expect(showtimes[1]).to.eql({
                  movie_title: 'Star Wars',
                  start_at: '2018-02-03T19:30:00',
                  is_3d: false
                })
                done()
              })
            })
          })
        })
      })

      context('multiple dates values grabber', () => {
        let showtimesParsingConfig 

        beforeEach(() => {
          showtimesParsingConfig = {
            box: 'ul.showtimes li:first-of-type',
            time: 'time @datetime',
            timeFormat: 'YYYY-MM-DD HH:mm:ss',
            movieTitle: '.title',
          }
        })

        context('configuring wrong value grabbers', () => {
          function testParseThrowsError (cfg, errorMsg) {
            let parse = () => {
              parser.parseShowtimes(showtmiesContainer, cfg, testContext, (err, showtimes) => {
                expect(err).to.be.null                
              })
            }
            expect(parse).to.throw(errorMsg)
          }

          // this test might not make sense anymore as the value grabber now always returns an arra
          it.skip('throws error when dates value grabber returns a string', () => {
            showtimesParsingConfig['dates'] = (box) => 'foobar'
            testParseThrowsError(showtimesParsingConfig, 'dates value grabber must return an array of string, but was "foobar"')
          })

          it('throws error when dates value grabber returns an array of integer', () => {
            showtimesParsingConfig['dates'] = (box) => [1, 2, 3]
            testParseThrowsError(showtimesParsingConfig, 'dates value grabber must return an array of string, but found 1 (Number) at index 0')
          })

          it('throws error when dates value grabber returns null', () => {
            showtimesParsingConfig['dates'] = (box) => null
            testParseThrowsError(showtimesParsingConfig, 'dates value grabber must return an array of string, but found null at index 0')
          })

          it('throws error when dates value grabber returns undefined', () => {
            showtimesParsingConfig['dates'] = (box) => undefined
            testParseThrowsError(showtimesParsingConfig, 'dates value grabber must return an array of string, but found undefined at index 0')
          })
        })
        
        context('configuring correct value grabber returning 2 dates', () => {
          let testCases = [
            { title: 'as strings', dates: ['2018-08-10', '2018-08-11'] },
            { title: 'as Date objects', dates: [new Date(2018, 7, 10), new Date(2018, 7, 11)] },
            { title: 'as Moment objects', dates: [moment('2018-08-10'), moment('2018-08-11')] }
          ]

          testCases.forEach(testCase => {
            context(testCase.title, () => {
              let showtimes
              
              beforeEach((done) => {
                showtimesParsingConfig.dateFormat = 'YYYY-MM-DD'
                showtimesParsingConfig['dates'] = (box) => {
                  return testCase.dates
                }
                parser.parseShowtimes(showtmiesContainer, showtimesParsingConfig, testContext, (err, r) => {
                  expect(err).to.be.null
                  showtimes = r
                  done()
                })
              })
              
              it('finds 2 dates', () => {
                expect(showtimes).to.have.length(2)
              })
              
              it('showtimes have dates as of value grabber', () => {
                expect(showtimes).to.deep.include({
                  movie_title: 'Scary Foovie 2',
                  start_at: '2018-08-10T18:30:00',
                  is_3d: false
                })
                expect(showtimes).to.deep.include({
                  movie_title: 'Scary Foovie 2',
                  start_at: '2018-08-11T18:30:00',
                  is_3d: false
                })
              })
            })
          })
        })  
      })

    })

    it('copies showtimes.start_at from datetime selector', (done) => {
      
      let showtimesParsingConfig = {
        box: 'ul.with–full-links li',
        datetime: '@datetime',
        datetimeParsing: false
      }

      parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
        expect(err).to.be.null
        expect(showtimes).to.have.length(2)
        expect(showtimes[0].start_at).to.equal('2018-01-18T20:30:00+01:00')
        expect(showtimes[1].start_at).to.equal('some-date-with-time-string')
        done()
      })
    })

    context('multiple showtimes from same box', () => {
      let showtimesParsingConfig
      beforeEach(() => {
        showtimesParsingConfig = {
          box: '.delimiter',
          delimiter: '<br>',
          datetimeFormat: 'DD.MM.YYYY - HH:mm',
        }
      })

      it('parses multiple showtimes from same box', (done) => {
        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          expect(showtimes).to.have.length(2)
          expect(showtimes).to.deep.equal([
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-02-01T20:30:00',
              is_3d: false
            },
            {
              movie_title: 'Scary Foovie 2',
              start_at: '2018-02-02T20:30:00',
              is_3d: false
            },
          ])
          done()
        })
      })

      it('keeps showtimes sub-boxes connected to main DOM', (done) => {
        showtimesParsingConfig.auditorium = (box) => {
          expect(box.parent().length).to.be.greaterThan(0)
          return ''
        }
        parser.parseShowtimes(movieBoxes.first(), showtimesParsingConfig, testContext, (err, showtimes) => {
          expect(err).to.be.null
          done()
        })
      })
    })

    context('example: kino-gmunden.at', () => {
      let testHtml
      let showtimes

      before(() => {
        testHtml = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'kino-gmunden.at', 'kinoprogramm.html'))
      })

      beforeEach((done) => {
        let $ = cheerio.load(testHtml)
        let movieBoxes = $('.overview')
        let testContext = new TestContext({
          cheerio: $,
          movie: {
            title: 'Test Movie 2'
          },
          date: moment('2018-01-15')
        })

        parser.parseShowtimes(movieBoxes.first(), kinoGmundenAtConfig.showtimes[0].movies.showtimes, testContext, (err, result) => {
          expect(err).to.be.null
          showtimes = result
          done()
        })
      })

      it('finds one showtime', () => {
        expect(showtimes).to.have.lengthOf(1)
      })

      it('usesd movie title from context', () => {
        expect(showtimes[0].movie_title).to.eql('Test Movie 2')
      })

      it('gets full start_at from from parsing', () => {
        expect(showtimes[0].start_at).to.eql('2018-01-15T20:30:00')
      })

      it('is_3d defaults to false', () => {
        expect(showtimes[0].is_3d).to.be.false
      })

    })
  })

  
})