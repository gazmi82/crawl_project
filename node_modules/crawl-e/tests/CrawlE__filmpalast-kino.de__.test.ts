import CrawlE from './../src/CrawlE'
import { expect } from 'chai'
import { ConfigError } from './../src/Errors'
import { TestNockRequestMaker, TestLogger } from './helpers'
import * as deepcopy from 'deepcopy'

describe('CrawlE', () => {
  describe('filmpalast-kino.de Tutorial', () => {
    let config: any = {}
    let crawlE: CrawlE
    let logger = new TestLogger()
    let nockRequestMaker: TestNockRequestMaker

    beforeEach(() => { // switch to before() for recording requests (first run)
      nockRequestMaker = new TestNockRequestMaker('filmpalast-kino.de') // need to set s new instance as nock replays the requests only once        
    })

    function checkAllCinemasHaveProperty(key) {
      crawlE.results.cinemas.forEach((cinema, index) => {
        expect(cinema[key] === undefined).to.equal(false, `expect cinema at index ${index} to have ${key},\ncinema: ${JSON.stringify(cinema, null, 2)}\n`)
      })
    }

    describe('Step 1: Empty config', () => {
      it('throws a config error', () => {
        expect(() => new CrawlE(deepcopy(config), logger)).to.throw(ConfigError, "config should have required property 'cinemas'")
      })      
    })

    describe('Step 2.1: Adding cinemas list config', () => {
      it('finds 14 cinema boxes', (done) => {
        config.cinemas = {
          list: {
            url: 'http://www.filmpalast-kino.de/',
            box: 'li a'
          }
        }
        let logger = new TestLogger()
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.debugs).to.deep.include({ prefix: 'cinemas:selection:count', msg: 'found 14 boxes'})
          expect(logger.logs.infos).to.contain('found 0 cinemas')
          done()
        })
      })
    })

    describe('Step 2.2: Adding value grabbers to cinema list config', () => {
      let logger = new TestLogger()
      before((done) => {
        config.cinemas.list.website = '@href'
        config.cinemas.list.slug = {
          selector: ':box',
          attribute: 'href',
          mapper: href => href.replace(/(http:\/\/)|(www)|(filmpalast-kino)|(de)|\/|\./g, '')
        }
        
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.crawl((err) => {
          expect(err).to.be.null
          done()
        })
      })

      it('finds 14 cinemas', () => {
        expect(logger.logs.infos).to.contain('found 14 cinemas')
        expect(crawlE.results.cinemas).to.have.lengthOf(14)
      })


      it(`gets cinema's slugs`, () => {
        expect(crawlE.results.cinemas[0].slug).to.equal('bautzen')
        checkAllCinemasHaveProperty('slug')
      })

      it(`gets cinema's websites`, () => {
        expect(crawlE.results.cinemas[0].website).to.equal('http://bautzen.filmpalast-kino.de/')
        checkAllCinemasHaveProperty('website')
      })
    })

    describe('Step 2.3: Adding details config', () => {
      let logger = new TestLogger()
      before((done) =>  {
        config.cinemas.details = {
          url: ':cinema.website:/kontakt',
          name: '.contact-text-box p b',
          address: {
            selector: '.contact-text-box p:nth-of-type(1)',
            attribute: 'html()',
            mapper: value => value.split('<br>').slice(1, 3).join(', ').trim()
          },
          email: {
            selector: '.contact-text-box p:nth-of-type(1)',
            mapper: value => value.match(/(E-Mail: )(.*)/)[2].trim()
          },
          location: '#contact-maps iframe @src'
        }

        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.crawl((err) => {
          expect(err).to.be.null
          done()
        })
      })

      it('still has 14 cinemas', () => {
        expect(crawlE.results.cinemas).to.have.lengthOf(14)
      })

      it(`adds cinema's names`, () => {
        expect(crawlE.results.cinemas[0].name).to.equal('Filmpalast Bautzen')
          
      })

      it(`adds cinema's address`, () => {
        expect(crawlE.results.cinemas[0].address).to.equal('Tuchmacherstr. 37, 02625 Bautzen')
        checkAllCinemasHaveProperty('address')
      })

      it(`adds cinema's email`, () => {
        expect(crawlE.results.cinemas[0].email).to.equal('bautzen@filmpalast-kino.de')
        checkAllCinemasHaveProperty('email')
      })

      it(`adds cinema's location`, () => {
        expect(crawlE.results.cinemas[0].lat).to.equal(51.182248)
        expect(crawlE.results.cinemas[0].lon).to.equal(14.433804)
        // checkAllCinemasHaveProperty('lat')
        // checkAllCinemasHaveProperty('lon')
      })

    })

    after(() => {
      nockRequestMaker.saveNockFile()
    })
  })
})
