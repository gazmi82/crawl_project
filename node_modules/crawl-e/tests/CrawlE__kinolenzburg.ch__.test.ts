import CrawlE from './../src/CrawlE'
import { expect } from 'chai'
import { TestNockRequestMaker, TestLogger } from './helpers'
import * as deepcopy from 'deepcopy'
import * as moment from 'moment'

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

  describe('kinolenzburg.ch Tutorial', () => {
    let config: any = {}
    let crawlE: CrawlE
    let logger = new TestLogger()
    let nockRequestMaker: TestNockRequestMaker

    before(() => { // switch to before() for recording requests (first run)
      nockRequestMaker = new TestNockRequestMaker('kinolenzburg.ch') // need to set s new instance as nock replays the requests once        
    })

    describe('Step 1: Adding static cinema', () => {
      before(() => {
        logger = new TestLogger()
        config.cinemas = [
          {
            name: 'Kino Lenzburg',
            address: 'Bleicherain 8, 5600 Lenzburg',
            website: 'https://www.kinolenzburg.ch/',
            phone: '062 891 25 28'
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

    describe('Step 2: Adding movies.list.url ', () => {
      before(() => {
        logger = new TestLogger()
        config.movies = {
          list: {
            url: 'https://www.kinolenzburg.ch/programm'
          }
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('requests the movie urls', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.infos).to.include('requesting https://www.kinolenzburg.ch/programm …')
          done()
        })
      })
    })

    describe('Step 3: Adding movies.list.* ', () => {
      before(() => {
        logger = new TestLogger()
        config.movies = {
          list: {
            url: 'https://www.kinolenzburg.ch/programm',
            box: '.movie-item',
            title: 'a @title',
            href: 'a @href'
          }
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('finds 6 movies', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.debugs).to.deep.include({ prefix: `movies:selection:count`, msg: 'found 6 boxes' })
          expect(crawlE.results.movies[1].title).to.equal('Deadpool 2')
          done()
        })
      })
    })

    describe('Step 4: Adding URL for showtimes crawling config', () => {
      before(() => {
        logger = new TestLogger()
        config.movies.showtimes = {
          url: 'https://www.kinolenzburg.ch/:movie.href:'
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('opens 6 movie pages', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(logger.logs.infos.filter(log => log.indexOf('requesting https://www.kinolenzburg.ch/film') !== -1)).to.have.lengthOf(6)          
          done()
        })
      })
    })

    describe('Step 5: Adding config for showtimes parsing', () => {
      before(() => {
        logger = new TestLogger()
        config.movies.showtimes.showtimes = {
          box: '.timetable table tr',
          date: '.date',
          dateFormat: 'DD. MMMM',
          dateLocale: 'de',
          time: '.time'
        }
        crawlE = new CrawlE(deepcopy(config), logger)
        crawlE.logger = logger
        crawlE.requestMaker = nockRequestMaker
      })

      it('finds showtimes', (done) => {
        crawlE.crawl((err) => {
          expect(err).to.be.null
          expect(crawlE.results.showtimes).to.not.be.empty
          done()
        })
      })
    })
   
    after(() => {
      nockRequestMaker.saveNockFile()
    })

  })

})
