import * as moment from 'moment'
import * as deepcopy from 'deepcopy'
import { expect } from 'chai'
import { ConfigError } from './../src/Errors'
import { TestLogger, TestNockRequestMaker} from './helpers'
import CrawlE from './../src/CrawlE'




describe('CrawlE', () => {
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

  describe('daskino.at Tutorial', () => {
    let config: any = {}
    let crawlE: CrawlE
    let logger = new TestLogger()
    let nockRequestMaker: TestNockRequestMaker

    beforeEach(() => { // switch to before() for recording requests (first run)
      nockRequestMaker = new TestNockRequestMaker('daskino.at') // need to set s new instance as nock replays the requests only once        
    })

    describe('Step 1: Empty config', () => {
      it('throws a config error', () => {
        expect(() => new CrawlE(deepcopy(config), logger)).to.throw(ConfigError, "config should have required property 'cinemas'")
      })
    })

    describe('Step 2: Adding static cinema', () => {
      before(() => {
        config.cinemas = [
          {
            name: 'DAS KINO',
            address: 'Giselakai 11, A-5020 Salzburg',
            website: 'http://www.daskino.at/',
            telephone: '0662-87 31 00'
          }
        ]
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
      })

      it('picks up the static cinema', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.infos).to.include('found 1 cinemas')
          done()
        })
      })
    })

    describe('Step 3: Adding the showtimes config', () => {
      before(() => {
        config.showtimes = {
          url: 'http://www.daskino.at/programm_:date:',
          urlDateFormat: 'D_M_YYYY',
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('requests the showtimes urls', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.infos).to.include('requesting http://www.daskino.at/programm_19_1_2018 …')
          expect(logger.logs.infos).to.include('requesting http://www.daskino.at/programm_25_1_2018 …')
          done()
        })
      })
    })

    describe('Step 4: Adding the showtimes.movies config', () => {
      before(() => {
        config.showtimes.movies = {
          box: '#content .std tr',
          title: '.titel'
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('parses movies', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null          
          expect(logger.logs.debugs).to.deep.include({ prefix: `movies:selection:count`, msg: 'found 7 boxes'})
          expect(logger.logs.debugs).to.deep.include({ prefix: `movies:result`, msg: `{\n  title: 'EINE BRETONISCHE LIEBE',\n  version: { attributes: undefined, is3d: false, isImax: false }\n}` })
          done()
        })
      })
    })

    describe('Step 5: Adding the showtimes.movies.showtimes config', () => {
      before(() => {
        config.showtimes.movies.showtimes = {
          box: '.zeit',
          timeFormat: 'HH:mm'
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('parses showtimes', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.debugs).to.deep.include({ prefix: `showtimes:selection:count`, msg: 'found 1 box' })
          // console.log(crawlE.results)
          done()
        })
      })
    })

    after(() => {
      nockRequestMaker.saveNockFile()
    })

  })
})
