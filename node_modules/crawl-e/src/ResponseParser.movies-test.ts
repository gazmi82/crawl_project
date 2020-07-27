import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import * as _ from 'underscore'
import { DefaultResponseParser } from './ResponseParsers'
import Config from './Config'
import { TestLogger, TestContext, languageMap } from './../tests/helpers'
import Context from './Context'

describe('DefaultResponseParser', () => {

  describe('#handleMoviesResponse', () => {
    let testResponse
    let parser: DefaultResponseParser
    let testContext: Context = new TestContext()
    let config: Config

    beforeEach(() => {
      testResponse = {
        text: fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'movies.html'))
      }
      config = new Config({
        movies: {
          list: {
            box: '.movie',
            id: {
              selector: 'a',
              attribute: 'href',
              mapper: href => href.split('/').reverse()[0]
            },
            title: 'h2'
          }
        }
      })
      parser = new DefaultResponseParser()
    })

    it('finds movies 3', (done) => {
      parser.handleMoviesResponse(testResponse, config.movies.list, testContext, (err, movies) => {
        expect(err).to.be.null
        expect(movies).to.have.lengthOf(3)
        delete movies[0].version
        expect(movies[0]).to.deep.equal({
          id: '1',
          title: 'Scary Foovie 2'
        })
        done()
      })
    })
  })

  describe('#parseVersions', () => {
    let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_versions.html'))
    let $ = cheerio.load(testHtml)
    let versionsContainer = $('html')
    let config = {
      showtimes: {
        movies: {
          box: '.movie',
          title: 'h2',
          versions: {
            box: '.showtimes',
            is3d: 'h3',
            isImax: '.imax'
          }
        }
      }
    }
    let cfg = new Config(config)

    let testContext = new TestContext({
      cheerio: $
    })

    it('finds 2 version boxes', (done) => {
      let parser = new DefaultResponseParser(cfg)
      parser.logger = new TestLogger()
      parser.parseVersions(versionsContainer, cfg.showtimes[0].movies.versions, testContext, null, (err, versions) => {
        expect(err).to.be.null
        expect(versions).to.have.lengthOf(2)
        done()
      })
    })

    it('parses versions from the boxes', (done) => {
      let parser = new DefaultResponseParser(cfg)
      parser.parseVersions(versionsContainer, cfg.showtimes[0].movies.versions, testContext, null, (err, versions) => {
        expect(err).to.be.null
        expect(versions[0].is3d).to.be.false
        expect(versions[0].isImax).to.be.undefined // undefined because the test html does not have the node at all
        expect(versions[1].is3d).to.be.true
        expect(versions[1].isImax).to.be.true
        done()
      })
    })
  })

})

