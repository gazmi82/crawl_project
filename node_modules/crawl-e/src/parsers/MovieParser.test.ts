import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import * as deepcopy from 'deepcopy'
import { SilentLogger } from './../Logger'

import { VersionParser } from './VersionParser'
import { MovieParser } from './MovieParser'
import { TestContext, versionFlags, is3dMapper } from '../../tests/helpers'


describe('MovieParser', () => {
  const logger = new SilentLogger()
  const versionParser = new VersionParser(logger)
  const parser = new MovieParser(logger, versionParser)

  describe('#parse', () => {
    let movieBox
    let testContext
    let moviesConfig = {
      box: '.movie',
      title: 'h2'
    }

    beforeEach(() => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_movies.html'))
      let $ = cheerio.load(testHtml)
      movieBox = $('.movie').first()
      testContext = new TestContext({
        cheerio: $
      })
    })


    versionFlags.forEach(flag => {
      describe(`${flag.label} flag`, () => {
        context('parsing movie title', () => {
          it(`picks false when movie titles does not contain '${flag.label}'`, () => {
            parser.parse(movieBox, deepcopy(moviesConfig), testContext)
            expect(testContext.version[flag.key]).to.be.false
          })

          it(`picks true when movie titles contains '${flag.label}' as word`, () => {
            let config = deepcopy(deepcopy(moviesConfig))
            config.title = `.alt_title.${flag.label.toLowerCase()}`
            parser.parse(movieBox, config, testContext)
            expect(testContext.version[flag.key]).to.be.true
          })

          if(flag.label === 'IMAX') {
            it(`picks false when movie titles contains '${flag.label}' in word`, () => {
              let config = deepcopy(deepcopy(moviesConfig))
              config.title = `.alt_title_2.imax`
              parser.parse(movieBox, config, testContext)
              expect(testContext.version.isImax).to.be.false
            })
          }

        })

        context(`via ${flag.key} Value Grabber`, () => {
          function parseMovieForFlagValueGrabber(flagValueGrabberConfig) {
            let config = deepcopy(moviesConfig)
            config[flag.key] = flagValueGrabberConfig
            parser.parse(movieBox, config, testContext)
            return testContext.version[flag.key]
          }

          context(`finding '${flag.label}' string`, () => {
            let selector = `.version-${flag.label.toLowerCase()}`
            it('picks true (parsing grabbed string)', () => {
              let flagValue = parseMovieForFlagValueGrabber(selector)
              expect(flagValue).to.be.true
            })

            it('picks true (getting boolean from value grabber)', () => {
              let flagValue = parseMovieForFlagValueGrabber({ selector: selector, mapper: flag.mapper })
              expect(flagValue).to.be.true
            })
          })

          if (flag.label === '3D') {
            context(`finding '2D' string`, () => {
              let selector = '.version-2d'
              it('picks false (parsing grabbed string)', () => {
                let is3d = parseMovieForFlagValueGrabber(selector)
                expect(is3d).to.be.false
              })
              it('picks false (getting boolean from value grabber)', () => {
                let is3d = parseMovieForFlagValueGrabber({ selector: selector, mapper: is3dMapper })
                expect(is3d).to.be.false
              })
            })
          }
        })
      })
    })

    it('sets version flags to context and movie object', () => {
      parser.parse(movieBox, deepcopy(moviesConfig), testContext)
      expect(testContext.movie.version).to.deep.equal(testContext.version)
    })
  })
})