import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import * as moment from 'moment'
import { DefaultResponseParser } from './ResponseParsers'
import Config from './Config'
import { TestContext } from './../tests/helpers'
import Context from './Context'

describe('DefaultResponseParser', () => {

  describe('#handleDatesResponse', () => {
    let testResponse
    let parser: DefaultResponseParser
    let testContext: Context = new TestContext()
    let dates

    beforeEach((done) => {
      testResponse = {
        text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'dates.html'))
      }      
      const config = new Config({
        dates: {
          list: {
            box: '.dates a',
            date: ':box',
            dateFormat: 'DD',
            href: ':box @href'
          }
        }
      })
      parser = new DefaultResponseParser()
      parser.handleDatesResponse(testResponse, config.dates.list, testContext, (err, _dates) => {
        expect(err).to.be.null
        dates = _dates
        done()
      })
    })

    it('finds 4 dates', () => {
      expect(dates).to.have.lengthOf(4)
    })

    it('finds date & href object', () => {
      let date = dates[0]
      expect(date).to.have.property('date')
      expect(date).to.have.property('href')
    })

    it('finds corrent date', () => {
      expect(dates[0].date.unix()).to.equal(moment(19, 'DD').unix())
    })

    it('finds corrent href', () => {
      expect(dates[0].href).to.equal('index.php?page=kalender&datum=1534629600')
    })

  })


  describe('#parseDates', () => {
    let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_dates.html'))
    let $ = cheerio.load(testHtml)
    let testContext = new TestContext({
      cheerio: $
    })
    let datesContainer = $('html')

    function testFindingBoxes(datesParsingConfig) {
      it('finds 2 date boxes', (done) => {
        let parser = new DefaultResponseParser()
        parser.parseDates(datesContainer, datesParsingConfig, testContext, null, (err, dates) => {
          expect(err).to.be.null
          expect(dates).to.have.lengthOf(2)
          done()
        })
      })
    }

    function testParsingDates(datesParsingConfig) {
      it('parses dates from the boxes', (done) => {
        let parser = new DefaultResponseParser()
        parser.parseDates(datesContainer, datesParsingConfig, testContext, null, (err, dates) => {
          expect(err).to.be.null
          expect(dates[0].unix()).to.equal(moment('2018-01-18').unix())
          expect(dates[1].unix()).to.equal(moment('2018-01-19').unix())
          done()
        })
      })
    }

    context('normal', () => {
      let datesParsingConfig = {
        box: '.day',
        date: '.date',
        dateFormat: 'YYYY-MM-DD'
      }
      testFindingBoxes(datesParsingConfig)
      testParsingDates(datesParsingConfig)
    })

    context('dates with german weekday abbreviation', () => {
      context('omitting locale', () => {
        let datesParsingConfig = {
          box: '.day',
          date: '.date-de',
          dateFormat: 'dd DD.MM.YYYY'
        }
        testFindingBoxes(datesParsingConfig)

        it('parses invalid dates from the boxes', (done) => {
          let parser = new DefaultResponseParser()
          parser.parseDates(datesContainer, datesParsingConfig, testContext, null, (err, dates) => {
            expect(err).to.be.null
            expect(dates[0].format()).to.equal('Invalid date')
            expect(dates[1].unix()).to.equal(moment('2018-01-19').unix()) // actually it still finds one showtime because Fr is the egal in 'de' and 'en' 
            done()
          })
        })
      })

      context('setting dateLocale', () => {
        let datesParsingConfig = {
          box: '.day',
          date: '.date-de',
          dateFormat: 'dd DD.MM.YYYY',
          dateLocale: 'de'
        }
        testFindingBoxes(datesParsingConfig)
        testParsingDates(datesParsingConfig)
      })

      context('setting wrong dateLocale', () => {
        let datesParsingConfig = {
          box: '.day',
          date: '.date-de',
          dateFormat: 'dd DD.MM.YYYY',
          dateLocale: 'br'
        }
        testFindingBoxes(datesParsingConfig)
        it('parses invalid dates from the boxes', (done) => {
          let parser = new DefaultResponseParser()
          parser.parseDates(datesContainer, datesParsingConfig, testContext, null, (err, dates) => {
            expect(err).to.be.null
            expect(dates[0].format()).to.equal('Invalid date')
            expect(dates[1].format()).to.equal('Invalid date')
            done()
          })
        })
      })
    })

    context('`Today` & `Tomorrow` strings', () => {
      let moment_now
      before(() => {
        moment_now = moment.now
        let anyMoment = moment as any
        anyMoment.now = () => { return Date.parse('2018-01-18') }
      })
      after(() => {
        let anyMoment = moment as any
        anyMoment.now = moment_now
      })

      let locales = ['de', 'en', 'es']
      locales.forEach(locale => {
        context(locale, () => {
          let datesParsingConfig = {
            box: '.day',
            date: `.date-${locale}-today-tmr`,
            dateFormat: 'dd DD.MM.YYYY'
          }
          testFindingBoxes(datesParsingConfig)
          testParsingDates(datesParsingConfig)
        })
      })
    })
  })

})

