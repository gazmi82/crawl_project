import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import { DefaultResponseParser } from './ResponseParsers'
import Config from './Config'
import { TestLogger, TestContext } from '../tests/helpers'

describe('DefaultResponseParser', () => {
  context('html tables', () => {    
    let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_tables.html'))
    let testResponse: any = { text: testHtml }

    describe('#handleShowtimesResponse', () => {
      context('only header row (dates)', () => {

        let logger: TestLogger
        
        beforeEach(() => {
          logger = new TestLogger()
        })

        function testTableParsing(showtimesParsingConfig: any, testContext, done) {
          let testResponse: any = { text: testHtml }
          let parser = new DefaultResponseParser()
          parser.logger = logger

          parser.handleShowtimesResponse(testResponse, showtimesParsingConfig, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(logger.logs.warnings).to.be.empty
            expect(showtimes).to.be.instanceOf(Array)
            expect(showtimes).to.have.lengthOf(4)
            expect(showtimes).to.deep.equal([
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-02-01T20:15:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-02-02T20:15:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-02-03T17:30:00',
                is_3d: false
              },
              {
                movie_title: 'Scary Foovie 2',
                start_at: '2018-02-03T20:15:00',
                is_3d: false
              },
            ])
            done()
          })
        }

        context('giving movie from context object', () => {
          let showtimesParsingConfig = {
            table: {
              selector: 'table#dates',
              headerRow: {
                date: ':box',
                dateFormat: 'DD.MM.YYYY'
              },
              cells: {
                showtimes: {
                  box: 'span', 
                  timeFormat: 'HH:mm'
                }
              }
            }
          }         
          
          let testContext = new TestContext({
            movie: {
              title: 'Scary Foovie 2'
            }
          })
         
          it('parses 4 showtimes', (done) => {          
            testTableParsing(showtimesParsingConfig, testContext, done)
          })
        })

        context('inside movie box', () => {
          let showtimesParsingConfig = {
            movies: {
              box: '.movie:nth-of-type(1)',
              title: 'h2',
              table: {
                selector: 'table',
                headerRow: {
                  date: ':box',
                  dateFormat: 'DD.MM.YYYY'
                },
                cells: {
                  showtimes: {
                    box: 'span',
                    timeFormat: 'HH:mm'
                  }                  
                }
              }
            }
          }
          
          let testContext = new TestContext()

          it('parses 4 showtimes', (done) => {
            testTableParsing(showtimesParsingConfig, testContext, done)
          })
        })
      })

      context('header row (dates) & column (movies)', () => {
        let createConfig = (filter = null) => {
          let config = {            
            table: {
              selector: 'table#dates_movies',
              headerRow: {
                date: ':box',
                dateFormat: 'DD.MM.YYYY'
              },
              headerColumn: {
                movieTitle: ':box'
              },
              cells: {
                showtimes: {
                  box: 'span',
                  timeFormat: 'HH:mm'
                }
              }
            }
          }
          if (filter) { 
            config.table.cells['filter'] = filter
          }
          return config
        }
        
        let cfg = createConfig()
        let logger: TestLogger
        let testContext = new TestContext()

        beforeEach(() => {
          logger = new TestLogger()
        })

        it('parses 4 showtimes', (done) => {
          let parser = new DefaultResponseParser()
          parser.logger = logger

          parser.handleShowtimesResponse(testResponse, cfg, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(logger.logs.warnings).to.be.empty
            expect(showtimes).to.be.instanceOf(Array)
            expect(showtimes).to.have.lengthOf(4)
            expect(showtimes).to.deep.include({
                movie_title: 'Scary Foovie 2',
                start_at: '2018-03-01T20:15:00',
                is_3d: false
              })
            expect(showtimes).to.deep.include({
                movie_title: 'Scary Foovie 2',
                start_at: '2018-03-02T17:30:00',
                is_3d: false
              })
            expect(showtimes).to.deep.include({
                movie_title: 'Scary Foovie 2',
                start_at: '2018-03-02T20:15:00',
                is_3d: false
              })
            expect(showtimes).to.deep.include({
              movie_title: 'Star Wars',
              start_at: '2018-03-02T22:30:00',
              is_3d: false
            })
            done()
          })
        })

        context('with filter excluding all', () => {
          let cellFilter = (cell, ref, context) => {
            return false
          }
          let cfg = createConfig(cellFilter)
          let logger: TestLogger
          let testContext = new TestContext()

          beforeEach(() => {
            logger = new TestLogger()
          })

          it('parses 0 showtimes', (done) => {
            let parser = new DefaultResponseParser()
            parser.logger = logger

            parser.handleShowtimesResponse(testResponse, cfg, testContext, (err, showtimes) => {
              expect(err).to.be.null
              expect(logger.logs.warnings).to.be.empty
              expect(showtimes).to.be.instanceOf(Array)
              expect(showtimes).to.have.lengthOf(0)             
              done()
            })
          })
        })

        context('with filter excluding 1st row', () => {
          let cellFilter = (cell, context) => {
            return context.indexes.table.row !== 1
          }
          let cfg = createConfig(cellFilter)
          let logger: TestLogger
          let testContext = new TestContext()

          beforeEach(() => {
            logger = new TestLogger()
          })

          it('parses 1 showtimes', (done) => {
            let parser = new DefaultResponseParser()
            parser.logger = logger

            parser.handleShowtimesResponse(testResponse, cfg, testContext, (err, showtimes) => {
              expect(err).to.be.null
              expect(logger.logs.warnings).to.be.empty
              expect(showtimes).to.be.instanceOf(Array)
              expect(showtimes).to.have.lengthOf(1)
              done()
            })
          })
        })
      })


      context('header row (dates) & column (auditorium)', () => {
        let cfg = {
          table: {
            selector: 'table#dates_auditoria',
            headerRow: {
              date: ':box',
              dateFormat: 'DD.MM.YYYY'
            },
            headerColumn: {
              auditorium: ':box'
            },
            cells: {
              showtimes: {
                box: 'span',
                timeFormat: 'HH:mm'
              }
            }
          }
        }
        let logger: TestLogger
        let testContext = new TestContext({
          movie: { title: 'Scary Foovie 2' }
        })

        beforeEach(() => {
          logger = new TestLogger()
        })

        it('parses 4 showtimes', (done) => {
          let parser = new DefaultResponseParser()
          parser.logger = logger

          parser.handleShowtimesResponse(testResponse, cfg, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(logger.logs.warnings).to.be.empty
            expect(showtimes).to.be.instanceOf(Array)
            expect(showtimes).to.have.lengthOf(4)            
            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-03-01T20:15:00',
              is_3d: false,
              auditorium: 'Kino 1'
            })
            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-03-02T17:30:00',
              is_3d: false,
              auditorium: 'Kino 1'
            })
            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-03-02T20:15:00',
              is_3d: false,
              auditorium: 'Kino 1'
            })
            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-03-02T22:30:00',
              is_3d: false,
              auditorium: 'Kino 2'
            })
            done()
          })
        })
      })


      context('header row (times) & column (dates)', () => {
        let cfg = {
          table: {
            selector: 'table#times_dates',
            headerRow: {
              time: ':box',
              timeFormat: 'HH:mm'
            },
            headerColumn: {
              date: ':box',
              dateFormat: 'DD.MM.YYYY'
            },
            cells: {
              showtimes: {
                box: 'i',
                movieTitle: ':box'
              }
            }
          }
        }

        let logger: TestLogger
        let testContext = new TestContext()

        beforeEach(() => {
          logger = new TestLogger()
        })

        it('parses 3 showtimes', (done) => {
          let parser = new DefaultResponseParser()
          parser.logger = logger

          parser.handleShowtimesResponse(testResponse, cfg, testContext, (err, showtimes) => {
            expect(err).to.be.null
            expect(logger.logs.warnings).to.be.empty
            expect(showtimes).to.be.instanceOf(Array)
            expect(showtimes).to.have.lengthOf(3)
            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-04-01T20:15:00',
              is_3d: false
            })

            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-04-02T17:30:00',
              is_3d: false
            })
            expect(showtimes).to.deep.include({
              movie_title: 'Scary Foovie 2',
              start_at: '2018-04-02T20:15:00',
              is_3d: false
            })
            done()
          })
        })
      })
    })
  }) // context
})
