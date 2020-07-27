import { expect } from 'chai'
import * as moment from 'moment'
import * as _ from 'underscore'
import { DateParser } from '../../lib/parsers/DateParser';
import { TestLogger, TestContext, withMomentNowMocked } from '../../tests/helpers'

describe('DateParser', () => {
  describe('#parseDateStr', () => {

    let testLogger = new TestLogger()
    let testContext = new TestContext()
    let parser

    beforeEach(() => {
      parser = new DateParser(testLogger)
    })

    context('pure dateString', () => {

      it('parses date with correct dateFormat including year', () => {
        let date = parser.parseDateStr('01.02.2018', { dateFormat: 'DD.MM.YYYY' }, testContext)
        expect(date.format('X')).to.equal(moment('2018-02-01').format('X'))
      })

      it('parses today strings (de)', () => {
        let date = parser.parseDateStr('heute', { dateFormat: 'DD.MM.YYYY' }, testContext)
        expect(date.format('YYYY-MM-DD')).to.equal(moment().format('YYYY-MM-DD'))
      })

      it('parses today strings (nl)', () => {
        let date = parser.parseDateStr('vandaag', { dateFormat: 'DD.MM.YYYY' }, testContext)
        expect(date.format('YYYY-MM-DD')).to.equal(moment().format('YYYY-MM-DD'))
      })

      it('parses tomorrow strings', () => {
        let date = parser.parseDateStr('morgen', { dateFormat: 'DD.MM.YYYY' }, testContext)
        expect(date.format('YYYY-MM-DD')).to.equal(moment().add(1, 'day').format('YYYY-MM-DD'))
      })

      it('parses day after tomorrow strings', () => {
        let date = parser.parseDateStr('übermorgen', { dateFormat: 'DD.MM.YYYY' }, testContext)
        expect(date.format('YYYY-MM-DD')).to.equal(moment().add(2, 'days').format('YYYY-MM-DD'))
      })

      context('real world examples', () => {
        withMomentNowMocked(new Date('2019-01-01'))

        it('parses date example: 11 juni', () => {
          let date = parser.parseDateStr('11 juni', { dateFormat: 'DD MMMM', dateLocale: 'nl' }, testContext)
          expect(date.format('YYYY-MM-DD')).to.equal(moment('11.06.', 'DD.MM.').format('YYYY-MM-DD'))
        })
        
        it('parses date example: MAANDAG 29 JULI', () => {
          let date = parser.parseDateStr('MAANDAG 29 JULI', { dateFormat: 'dddd D MMMM', dateLocale: 'nl-be' }, testContext)
          expect(date.format('YYYY-MM-DD')).to.equal(moment('29.07.', 'DD.MM.').format('YYYY-MM-DD'))
        })
        
        it('parses date example: ma 08.07', () => {
          let date = parser.parseDateStr('ma 08.07', { dateFormat: 'dd DD.MM', dateLocale: 'nl-be' }, testContext)
          expect(date.format('YYYY-MM-DD')).to.equal(moment('08.07.', 'DD.MM.').format('YYYY-MM-DD'))
        })
      })

      context('dateForamt without year', () => {
        function runTests(preserveYear) {

          let years = {
            last: { value: 2017, label: 'last' },
            current: { value: 2018, label: 'current' },
            next: { value: 2019, label: 'next' }
          }

          if (preserveYear) {
            years.last = years.current
            years.next = years.current
          }

          function testDateHasYear (dateStr, expectedYear) {
            it(`parses '${dateStr}' with year ${expectedYear.value} (${expectedYear.label} year)`, () => {
              let date = parser.parseDateStr(dateStr, { dateFormat: 'DD.MM.', preserveYear: preserveYear }, testContext)
              expect(date.year()).to.equal(expectedYear.value)
            })          
          }

          // keys: today test dates
          // values: function performing tests      
          let tests = {
            '2018-01-05': () => { // beginning of year
              testDateHasYear('01.06.', years.current)
              testDateHasYear('01.07.', years.current) 
              testDateHasYear('12.08.', years.current)
              testDateHasYear('12.11.', years.last) // should go back 2 month
              testDateHasYear('12.12.', years.last)
              testDateHasYear('01.01.', years.current)
              testDateHasYear('01.05.', years.current) // today
            }, 
            '2018-07-01': () => { // middle of year
              testDateHasYear('01.06.', years.current)
              testDateHasYear('01.07.', years.current) // today
              testDateHasYear('12.08.', years.current)
              testDateHasYear('12.12.', years.current)
              testDateHasYear('01.01.', years.next)
              testDateHasYear('01.05.', years.next)
            }, 
            '2018-12-08': () => { // end of year
              testDateHasYear('01.06.', years.next)
              testDateHasYear('01.07.', years.next) 
              testDateHasYear('12.08.', years.next)
              testDateHasYear('12.12.', years.current) // today
              testDateHasYear('01.01.', years.next)
              testDateHasYear('01.05.', years.next)
            }
          }

          _.mapObject(tests, (checks, testDate) => {
            context(`setting today to ${testDate} `, () => {
              // faking the current time so that we can test the cases of past and future dates without year
              let moment_now
              before(() => {
                moment_now = moment.now
                let anyMoment = moment as any
                anyMoment.now = () => { return Date.parse(testDate) }
              })
              after(() => {
                let anyMoment = moment as any
                anyMoment.now = moment_now
              })
              checks()          
            })
          })
        }

        context('preserveYear: false', () => {
          runTests(false)
        })

        context('preserveYear: true', () => {
          runTests(true)
        })
      })

    })


    context('datetimeString', () => {
      it('parses today strings (de)', () => {
        let date = parser.parseDateStr('heute 20:00', { dateFormat: 'DD.MM.YYYY HH:mm' }, testContext)
        expect(date.format('YYYY-MM-DD')).to.equal(moment().format('YYYY-MM-DD'))
      })
    })


  })
})
