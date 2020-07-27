import * as chai from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'

import TableParser from './TableParser'
import { TestContext } from '../../../tests/helpers'
import { ParsingContext } from '../ParsingContext';
import { SilentLogger } from '../../Logger';

const expect = chai.expect

describe('TableParser', () => {
  let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_tables.html'))
  let logger = new SilentLogger()

  describe('#emptyCellFilter', () => {
    let emptyCases = ['', '-', '&nbsp;', ' ']
    emptyCases.forEach(text => {
      it(`returns false for '${text}'`, () => {
        let cell = { text: () => text } as Cheerio
        let parsingContext = { } as ParsingContext
        expect(TableParser.emptyCellFilter(cell, parsingContext)).to.be.false
      })
    })

    let nonEmptyCases = ['15:00']
    nonEmptyCases.forEach(text => {
      it(`returns true for '${text}'`, () => {
        let cell = { text: () => text } as Cheerio
        let parsingContext = {} as ParsingContext
        expect(TableParser.emptyCellFilter(cell, parsingContext)).to.be.true
      })
    })

  })

  describe('#parseTable', () => {
    let $ = cheerio.load(testHtml)
    let testContext = new TestContext({
      cheerio: $
    })

    let headerRowCells
    let headerColCells
    let content
    
    let headerRowCellParser = (cell, ref) => {
      headerRowCells.push(cell.text())
    }
    
    let headerColCellParser = (cell, ref) => {
      headerColCells.push(cell.text())
    }
    
    let contentCellParser = (cell, ref) => {
      content.push(cell.text())
    }
    
    beforeEach(() => {
      headerRowCells = []
      headerColCells = []
      content = []
    })
    
    function parseTable(selector: string, parsers: any, done: Function) {
      TableParser.parseTable(
        $(selector), 
        testContext, 
        logger,
        parsers,
        {} as TableParser.ParsingConfig,
        (err, result) => {
          expect(err).to.be.null
          done()
        })
    }

    it('skips empty cells', (done) => {
      let contentCellRefs: TableParser.CellReference[] = []
      let contentCellParser = (cell, ref: TableParser.CellReference) => {
        contentCellRefs.push(ref)
      }

      parseTable('table#dates_movies', {
        headerRow: () => { },
        headerCol: () => { },
        content: contentCellParser,
        contentCellFilter: TableParser.emptyCellFilter
      }, () => {
        expect(contentCellRefs).to.have.lengthOf(3)
        expect(contentCellRefs).to.not.deep.include({ row: 2, col: 1 })        
        done()        
      })
    })

    it('skips missing cells if colspan is wrong', (done) => {
      let contentCellRefs: TableParser.CellReference[] = []
      let contentCellParser = (cell, ref: TableParser.CellReference) => {
        contentCellRefs.push(ref)
      }
      
      parseTable('table#colspan-wrong', {
        headerRow: () => { },
        headerCol: () => { },
        content: contentCellParser,
        contentCellFilter: TableParser.emptyCellFilter
      }, () => {
        // has no expects but still tests that the table parses without crash       
        done()
      })
    })
      
    context('only header row', () => {
      beforeEach((done) => {
        parseTable('table#dates', {
          headerRow: headerRowCellParser,
          headerCol: null,
          content: contentCellParser
        }, done)
      })
      
      it('parses 3 header row cells', () => {
        expect(headerRowCells).to.have.length(3)
        expect(headerRowCells[0]).to.equal('01.02.2018')
        expect(headerRowCells[1]).to.equal('02.02.2018')
        expect(headerRowCells[2]).to.equal('03.02.2018')
      })
      
      it('parses no header column cells', () => {
        expect(headerColCells).to.have.length(0)
      })
      
      it('parses 3 content cells', () => {
        expect(content).to.have.length(3)
      })

      it('adds dates from header row to context in content cells', (done) => {
        let _headerRowCellParser = (cell, context) => {
          context.date = cell.html() // for simlicity just use the cell's string            
        }

        let _cellParser = (cell, context) => {
          let dates = [ '01.02.2018', '02.02.2018', '03.02.2018' ]
          expect(context.date).to.equal(dates[context.indexes.table.col])
        }

        parseTable('table#dates', {
          headerRow: _headerRowCellParser,
          headerCol: null,
          content: _cellParser
        }, done)
      })
    })
    
    context('header row & column', () => {
      beforeEach((done) => {
        parseTable('table#dates_movies', {
          headerRow: headerRowCellParser,
          headerCol: headerColCellParser,
          content: contentCellParser
        }, done)
      })
      
      it('parses 2 header row cells', () => {
        expect(headerRowCells).to.have.length(2)
        expect(headerRowCells[0]).to.equal('01.03.2018')
        expect(headerRowCells[1]).to.equal('02.03.2018')
      })
      
      it('parses 2 header column cell', () => {
        expect(headerColCells).to.have.length(2)
        expect(headerColCells[0].trim()).to.equal('Scary Foovie 2')
        expect(headerColCells[1].trim()).to.equal('Star Wars')
      })
      
      it('parses 4 content cells', () => {
        expect(content).to.have.length(4)
      })

      it('adds dates from header row to context in content cells', (done) => {
        let cellParsers = {
          headerRow: (cell, context) => {
            context.date = cell.html() // for simlicity just use the cell's string            
          },           
          headerCol: (cell, context) => { },
          content: (cell, context) => {
            let dates = ['01.03.2018', '02.03.2018']
            expect(context.date).to.equal(dates[context.indexes.table.col - 1])
          }
        }
        parseTable('table#dates_movies', cellParsers, done)
      })

      it('adds movie from header column to context in content cells', (done) => {
        let cellParsers = {
          headerRow: (cell, context) => { },
          headerCol: (cell, context) => {
            context.movie = { title: cell.html().trim() }
          },
          content: (cell, context) => {            
            let movies = ['Scary Foovie 2', 'Star Wars']
            expect(context.movie).to.deep.equal({ title: movies[context.indexes.table.row - 1] })
          }
        }

        parseTable('table#dates_movies', cellParsers, done)
      })

      it('adds auditorium from header column to context in content cells', (done) => {
        let cellParsers = {
          headerRow: (cell, context) => { },
          headerCol: (cell, context) => {
            context.auditorium = cell.html().trim()
          },
          content: (cell, context) => {
            let auditoria = ['Kino 1', 'Kino 2']
            expect(context.auditorium).to.deep.equal(auditoria[context.indexes.table.row - 1])
          }
        }
        parseTable('table#dates_auditoria', cellParsers, done)
      })

      context('with colspan', () => {
        it('call cell parser for spanned cells multiple time', (done) => {
          let counter = 0
          let cellParsers = {
            headerRow: (cell, context) => {
              let cellRef = context.indexes.table              
              if (cellRef.row === 0 && cellRef.col < 2) {
                counter++
              }              
            },
            headerCol: (cell, context) => { },
            content: (cell, context) => { }
          }
          parseTable('table#colspan', cellParsers, () => {
            expect(counter).to.equal(1) // actually only once as { row: 0, col: 0 } is skipped due to offset
            done()
          })
        })
      })

    })
  }) // #parseTable

})
