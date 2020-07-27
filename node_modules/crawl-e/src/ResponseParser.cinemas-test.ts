import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import { DefaultResponseParser } from './ResponseParsers'
import Config from './Config'
import { TestContext } from './../tests/helpers'
import Context from './Context'
import * as deepcopy from 'deepcopy'
import { Cinema } from './models'

describe('DefaultResponseParser', () => {

  describe('#handleCinemasResponse', () => {

    context('kinopolis.de', () => {
      let testResponse
      let config = new Config({
        cinemas: {
          list: {
            box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
            name: ':box',
            id: {
              attribte: 'href',
              mapper: href => href.split('/').reverse()[0]
            }
          }
        }
      })
      let parser = new DefaultResponseParser()

      beforeEach(() => {
        testResponse = {
          text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'kinopolis.de', 'index.html'))
        }
      })

      it('finds 18 cinemas', (done) => {
        parser.handleCinemasResponse(testResponse, config.cinemasConfig.list, new TestContext(), (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas).to.have.lengthOf(18)
          expect(cinemas[0]).to.eql({
            id: 'Aschaffenburg - KINOPOLIS',
            name: 'Aschaffenburg - KINOPOLIS'
          })
          done()
        })
      })
    })

    context('deep list ', () => {
      let testResponse
      let testContext: Context = new TestContext()
      const baseConfig = {
        cinemas: {
          list: {
            box: 'li > a',
            name: 'h2',
          }
        }
      }

      before(() => {
        testResponse = {
          text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'cinemas.html'))
        }
      })

      it('finds 3 cinemas', (done) => {
        let config = new Config(baseConfig)
        let parser = new DefaultResponseParser()
        parser.handleCinemasResponse(testResponse, config.cinemasConfig.list, testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas).to.have.lengthOf(3)
          expect(cinemas[0]).to.deep.equal({
            name: 'Cinema Foo',
          })
          done()
        })
      })

      it('parses href', (done) => {
        let config = deepcopy(baseConfig)
        config.cinemas.list.href = '@href'
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.handleCinemasResponse(testResponse, cfg.cinemasConfig.list, testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas[0].href).to.eql('/cinemas/1-foo')
          expect(cinemas[1].href).to.eql('/cinemas/2-bar')
          expect(cinemas[2].href).to.eql('/cinemas/3-baz')
          done()
        })
      })

      it('parses website', (done) => {
        let config = deepcopy(baseConfig)
        config.cinemas.list.website = '@href'
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.handleCinemasResponse(testResponse, cfg.cinemasConfig.list, testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas[0].website).to.eql('/cinemas/1-foo')
          expect(cinemas[1].website).to.eql('/cinemas/2-bar')
          expect(cinemas[2].website).to.eql('/cinemas/3-baz')
          done()
        })
      })

      it('parses id', (done) => {
        let config = deepcopy(baseConfig)
        config.cinemas.list.id = {
          selector: ':box',
          attribute: 'href',
          mapper: href => href.match(/\d+/)[0]
        }
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.handleCinemasResponse(testResponse, cfg.cinemasConfig.list, testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas[0].id).to.eql('1')
          expect(cinemas[1].id).to.eql('2')
          expect(cinemas[2].id).to.eql('3')
          done()
        })
      })

      it('parses slug', (done) => {
        let config = deepcopy(baseConfig)
        config.cinemas.list.slug = {
          selector: ':box',
          attribute: 'href',
          mapper: href => _.last(href.split('-'))
        }
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.handleCinemasResponse(testResponse, cfg.cinemasConfig.list, testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas[0].slug).to.eql('foo')
          expect(cinemas[1].slug).to.eql('bar')
          expect(cinemas[2].slug).to.eql('baz')
          done()
        })
      })

      it('parses address', (done) => {
        let config = deepcopy(baseConfig)
        config.cinemas.list.address = '.address'
        let cfg = new Config(config)
        let parser = new DefaultResponseParser()
        parser.handleCinemasResponse(testResponse, cfg.cinemasConfig.list, testContext, (err, cinemas) => {
          expect(err).to.be.null
          expect(cinemas[0].address).to.eql('123 6th St. Melbourne, FL 32904')
          expect(cinemas[1].address).to.eql('4 Goldfield Rd. Honolulu, HI 96815')
          expect(cinemas[2].address).to.eql('514 S. Magnolia St. Orlando, FL 32806')
          done()
        })
      })
    })
  })

  describe('#handleCinemaDetailsResponse', () => {
    let testResponse
    let testContext: Context = new TestContext({
      cinema: { id: '1' } as Cinema
    })
    const baseConfig = {
      cinemas: {
        list: {},
        details: {
          name: 'h1'
        }
      }
    }

    before(() => {
      testResponse = {
        text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'cinema_foo.html'))
      }
    })

    it('gets name', (done) => {
      let cfg = new Config(baseConfig)
      let parser = new DefaultResponseParser()
      parser.handleCinemaDetailsResponse(testResponse, cfg.cinemasConfig.details, testContext, (err, cinema) => {
        expect(err).to.be.null
        expect(cinema.name).to.eql('Cinema Foo')
        done()
      })
    })

    it('gets address', (done) => {
      let config = deepcopy(baseConfig)
      config.cinemas.details.address = '.address @ownText()'
      let cfg = new Config(config)
      let parser = new DefaultResponseParser()
      parser.handleCinemaDetailsResponse(testResponse, cfg.cinemasConfig.details, testContext, (err, cinema) => {
        expect(err).to.be.null
        expect(cinema.address).to.eql('Musterstraße 4711, 12345 Musterstadt')
        done()
      })
    })

    it('gets phone', (done) => {
      let config = deepcopy(baseConfig)
      config.cinemas.details.phone = '.phone @ownText()'
      let cfg = new Config(config)
      let parser = new DefaultResponseParser()
      parser.handleCinemaDetailsResponse(testResponse, cfg.cinemasConfig.details, testContext, (err, cinema) => {
        expect(err).to.be.null
        expect(cinema.phone).to.eql('0815 - 1234 5678')
        done()
      })
    })

    it('gets email', (done) => {
      let config = deepcopy(baseConfig)
      config.cinemas.details.email = '.email @ownText()'
      let cfg = new Config(config)
      let parser = new DefaultResponseParser()
      parser.handleCinemaDetailsResponse(testResponse, cfg.cinemasConfig.details, testContext, (err, cinema) => {
        expect(err).to.be.null
        expect(cinema.email).to.eql('foo@cinemas.com')
        done()
      })
    })

    it('gets location', (done) => {
      let config = deepcopy(baseConfig)
      config.cinemas.details.location = '.address a @href'
      let cfg = new Config(config)
      let parser = new DefaultResponseParser()
      parser.handleCinemaDetailsResponse(testResponse, cfg.cinemasConfig.details, testContext, (err, cinema) => {
        expect(err).to.be.null
        expect(cinema.lat).to.eql(52.51)
        expect(cinema.lon).to.eql(13.37)
        done()
      })
    })

    it('gets is_temporarily_closed', (done) => {
      let config = deepcopy(baseConfig)
      config.cinemas.details.isTemporarilyClosed = '.closed-box'
      let cfg = new Config(config)
      let parser = new DefaultResponseParser()
      parser.handleCinemaDetailsResponse(testResponse, cfg.cinemasConfig.details, testContext, (err, cinema) => {
        expect(err).to.be.null
        expect(testContext.isTemporarilyClosed).to.be.true
        done()
      })
    })
  })

  describe('#parseAuditoria', () => {
    let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_auditoria.html'))
    let $ = cheerio.load(testHtml)
    let auditoriaContainer = $('html')
    let config = {
      showtimes: {
        auditoria: {
          box: '.auditorium',
          auditorium: 'h2',
        }
      }
    }
    let cfg = new Config(config)
    let testContext = new TestContext({
      cheerio: $
    })

    it('finds 2 auditorium boxes', (done) => {
      let parser = new DefaultResponseParser()
      parser.parseAuditoria(auditoriaContainer, cfg.showtimes[0].auditoria, testContext, null, (err, auditoria) => {
        expect(err).to.be.null
        expect(auditoria).to.have.lengthOf(2)
        done()
      })
    })

    it('parses auditoria from the boxes', (done) => {
      let parser = new DefaultResponseParser()
      parser.parseAuditoria(auditoriaContainer, cfg.showtimes[0].auditoria, testContext, null, (err, auditoria) => {
        expect(err).to.be.null
        expect(auditoria[0]).to.equal('Saal 1')
        expect(auditoria[1]).to.equal('Saal 2')
        done()
      })
    })
  })

})

