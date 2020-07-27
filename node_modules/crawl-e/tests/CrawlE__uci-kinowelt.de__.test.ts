import { expect } from 'chai'
import { TestNockRequestMaker, TestLogger } from './helpers'
import { ConfigError } from './../src/Errors'
import CrawlE from './../src/CrawlE'

describe('CrawlE', () => {
  describe('uci-kinowelt.de Tutorial', () => {
    let config: any = { }
    let logger = new TestLogger()
    let nockRequestMaker: TestNockRequestMaker

    describe('Step 1: Empty config', () => {
      it('throws a config error', () => {
        expect(() => new CrawlE(config, logger)).to.throw(ConfigError, "config should have required property 'cinemas'")
      })
    })

    describe('Step 2: Adding cinemas key', () => {
      before(() => {
        config.cinemas = {}
      })
      it('throws a config error', () => {
        expect(() => new CrawlE(config, logger)).to.throw(ConfigError, "config.cinemas should have required property 'list'")
      })
    })

    describe('Step 3: Adding cinemas.list key', () => {
      before(() => {
        config.cinemas.list = {}
      })
      it('throws a config error', () => {
        expect(() => new CrawlE(config, logger)).to.throw(ConfigError, "config.cinemas.list should have required property '.url'")
      })
    })

    describe('Step 4: Adding cinemas.list.url key', () => {
      before(() => {
        config.cinemas.list.url = 'http://www.uci-kinowelt.de/kinoinformation'
      })
      it('throws a config error', () => {
        expect(() => new CrawlE(config, logger)).to.not.throw() // ConfigError, 'Missing required property: url at /cinemas/list')
      })
    })

    describe('Step 5: Adding cinemas.list.box key', () => {
      let crawlE: CrawlE
      before(() => {
        nockRequestMaker = new TestNockRequestMaker('uci-kinowelt.de')
        config.cinemas.list.box = 'ul.city--list li, div.keyvisual--content'
        crawlE = new CrawlE(config, logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('finds cinemas boxes', (done) => {
        crawlE.crawl(err => {
          expect(err).to.be.null
          expect(logger.logs.debugs).to.deep.include({ prefix: 'cinemas:selection:count', msg: 'found 26 boxes' })
          expect(crawlE.results.cinemas).to.have.lengthOf(0)
          done()
        })
      })
    })

    describe('Step 6: Adding cinema id value grabbers', () => {
      let crawlE: CrawlE
      before(() => {
        nockRequestMaker = new TestNockRequestMaker('uci-kinowelt.de') // need to set s new instance as nock replays the requests only once        
        config.cinemas.list.id = {
          selector: 'a', 
          attribute: 'href', 
          mapper: id => id ? id.split('mation/')[1] : undefined
        }
        crawlE = new CrawlE(config, logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('finds cinemas boxes', (done) => {
        crawlE.crawl(err => {
          expect(err).to.be.null
          expect(crawlE.results.cinemas).to.have.lengthOf(23)
          done()
        })
      })
    })


    after(() => {
      nockRequestMaker.saveNockFile()
    })
  })
})
