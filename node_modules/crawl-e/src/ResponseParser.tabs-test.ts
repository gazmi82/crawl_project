import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as deepcopy from 'deepcopy'
import { DefaultResponseParser } from './ResponseParsers'
import { TestLogger, TestContext } from '../tests/helpers'
import Context from './Context';

describe('DefaultResponseParser', () => {
  context('html tabs', () => {    
    let logger: TestLogger
    let testContext: Context
    let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_date_tabs.html'))
    let testResponse: any = { text: testHtml }
    let parser: DefaultResponseParser

    let showtimesParsingConfig = {
      tabs: {
        buttons: {
          box: 'ul.buttons li',
          date: 'a',
          dateFormat: 'DD.MM.YYYY',
          id: {
            selector: 'a',
            attribute: 'href',
            mapper: href => href.replace('#', '')
          }
        },
        cards: {
          box: '#:tabId:', 
          movies: {
            box: '.movie', 
            title: '.title', 
            showtimes: {
              box: '.showtime'
            }
          }
        }      
      }
    }

    beforeEach(() => {
      logger = new TestLogger()
      parser = new DefaultResponseParser()
      parser.logger = logger
      testContext = new TestContext()

    })

    describe('#handleShowtimesResponse', () => {         
      function testItEmptyParsing(config) {
        it('does not crash and parses 0 showtimes', (done) => {
          parser.handleShowtimesResponse(testResponse, config, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(logger.logs.warnings).to.not.be.empty
            expect(showtimes).to.be.instanceOf(Array)
            expect(showtimes).to.have.lengthOf(0)
            done()
          })
        })
      }

      context('configuring only buttons part first', () => {
        let config = deepcopy(showtimesParsingConfig)
        delete config.tabs.cards
        testItEmptyParsing(config)
      })
     
      context('configuring cards without next level', () => {
        let config = deepcopy(showtimesParsingConfig)
        delete config.tabs.cards.movies
        testItEmptyParsing(config)
      })

      context('configuring cards with showtimes parsing config', () => {
        it('parses 3 showtimes', (done) => {        
          let config = showtimesParsingConfig as any
          parser.handleShowtimesResponse(testResponse, config, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(logger.logs.warnings).to.be.empty
            expect(showtimes).to.be.instanceOf(Array)
            expect(showtimes).to.have.lengthOf(3)
            expect(showtimes).to.deep.equal([
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2019-04-09T17:30:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2019-04-09T20:30:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2019-04-10T20:30:00',
                is_3d: false
              }            
            ])
            done()
          })
        })
      })

    }) // #handleShowtimesResponse
  }) // context
})
