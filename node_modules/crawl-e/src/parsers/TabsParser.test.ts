import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import TabsParser from './TabsParser'
import { TestContext, TestLogger } from '../../tests/helpers'
import Context from '../Context';

function createConfig (withCardsConfig = false): TabsParser.Config {
  let config = {
    buttons: {
      box: 'ul.buttons li',
      id: {
        selector: 'a',
        attribute: 'href',
        mapper: href => href.replace('#', '')
      }
    }
  }

  if (withCardsConfig) {
    config['cards'] = {
      box: '#:tabId:'
    }
  }

  return config
}

function emptyBoxIterator (box, context, cb) { cb() }
let emptyBoxIterators = {
  buttons: emptyBoxIterator, 
  cards: emptyBoxIterator
}

describe('TabsParser', () => {

  const logger = new TestLogger()

  describe('#parseTabs', () => {
    let testContext: Context
    let container

    beforeEach(() => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_date_tabs.html'))
      let $ = cheerio.load(testHtml)
      testContext = new TestContext({
        cheerio: $
      })
      container = $('#tabs')
    })

    function testCallingIterators(key, withCardsConfig) {
      describe(`calling ${key} iterator`, () => {
        let callCounter = 0
        let tabIds = []
        let tabIndexes = []
        let testIterator = (box, context, cb) => {
          callCounter++
          tabIds.push(context.tabId)
          tabIndexes.push(context.indexes.tab)
          cb()
        }
        before((done) => {
          let config = createConfig(withCardsConfig)
          let iterators = {
            buttons: key === 'buttons' ? testIterator : emptyBoxIterator,
            cards: key === 'cards' ? testIterator : emptyBoxIterator
          }

          TabsParser.parseTabs(container, testContext, logger, config, iterators, (err) => {
            expect(err).to.be.null
            done()
          })
        })

        it('calls 3x', () => {
          expect(callCounter).to.equal(3)
        })

        it(`calls ${key} iterator with tabId in context`, () => {
          expect(tabIds).to.have.length(3)
          expect(tabIds).to.deep.equal(['tab-1', 'tab-2', 'tab-3'])
        })

        it(`calls ${key} iterator with context.indexes.tab`, () => {
          expect(tabIndexes).to.have.length(3)
          expect(tabIndexes).to.deep.equal([0, 1, 2])
        })
      })
    }

    describe('parsing the buttons', () => {
      let cases = [false, true]
      cases.forEach(withCardsConfig =>  {
        context(`${withCardsConfig ? 'with' : 'without'} cards config`, () => {
          it('finds 3 tab buttons', (done) => {
            let config = createConfig(withCardsConfig)
            let logger = new TestLogger()
            TabsParser.parseTabs(container, testContext, logger, config, emptyBoxIterators, (err) => {
              expect(err).to.be.null
              expect(logger.logs.debugs).to.deep.include({ prefix: 'tabs:buttons:count', msg: 'found 3 boxes' })
              done()
            })
          })

          it('parses tabIds', (done) => {
            let tabIds = []
            let config: any = createConfig()
            config.buttons.id.mapper = (href) => {
              tabIds.push(href)
              return href.replace('#', '')
            }
            TabsParser.parseTabs(container, testContext, logger, config, emptyBoxIterators, (err) => {
              expect(err).to.be.null
              expect(tabIds).to.have.length(3)
              expect(tabIds).to.deep.equal(['#tab-1', '#tab-2', '#tab-3'])
              done()
            })
          })

          testCallingIterators('buttons', withCardsConfig)      
        })
      })
      

    }) // end of parsing the buttons


    describe('parsing the cards', () => {
      testCallingIterators('cards', true)

      it('returns results from cards iterator', (done) => {
        let config = createConfig(true)
        let iterators = {
          buttons: emptyBoxIterator,
          cards: (box, context, cb) => {
            cb(null, 'foobar')
          }
        }

        TabsParser.parseTabs(container, testContext, logger, config, iterators, (err, results) => {
          expect(err).to.be.null
          expect(results).to.have.length(3)
          expect(results).to.deep.equal(['foobar', 'foobar', 'foobar'])
          done()
        })
      })
    })
  })
})