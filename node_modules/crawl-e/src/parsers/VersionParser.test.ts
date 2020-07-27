import { expect } from 'chai'
import * as fs from 'fs'
import * as path from 'path'
import * as cheerio from 'cheerio'
import { SilentLogger } from './../Logger'
import { TestContext } from '../../tests/helpers'
import Context from '../Context'
import { VersionParser } from './VersionParser'
import { ValueGrabbing } from '../ValueGrabber'


describe('VersionParser', () => {
  const parser = new VersionParser(new SilentLogger())

  describe('#parse', () => {
    let $
    let testContext: Context
    let versionBoxes    

    beforeEach(() => {
      let testHtml: any = fs.readFileSync(path.join(path.resolve(), 'tests', 'data', 'showtimes_by_versions.html'))
      $ = cheerio.load(testHtml)
      versionBoxes = $('.showtimes')      
    })


    context('direct grabbers: is3D, isImax, language, subtitles', () => {
      function parse(box, givenContext: any = {}) {
        testContext = new TestContext({ cheerio: $, ...givenContext })
        parser.parse(box, {
          is3d: 'h3',
          isImax: '.imax',
          language: '.language',
          subtitles: '.subtitles'
        }, testContext)
      }

      context('1st box', () => {
        beforeEach(() => {
          parse(versionBoxes.first())
        })

        it(`finds 3D flag to be false`, () => {
          expect(testContext.version.is3d).to.be.false
        })

        it(`finds IMAX flag to be undefined`, () => {
          expect(testContext.version.isImax).to.be.undefined // undefined because the test html does not have the node at all
        })

        it(`finds language to be 'de'`, () => {
          expect(testContext.version.language).to.equal('de')
        })

        it(`finds subtitles to be undefined`, () => {
          expect(testContext.version.subtitles).to.be.undefined
        })
      })

      context('1st box, with context.version.subtitles', () => {
        it('picks subtitles from context.version', () => {
          parse(versionBoxes.first(), { version: { subtitles: 'foo' }})
          expect(testContext.version.subtitles).to.equal('foo')
        })
      })

      context('1st box, with context.movie.version.subtitles', () => {
        it('picks subtitles from context.movie.version', () => {
          parse(versionBoxes.first(), { movie: { version: { subtitles: 'foo' } }})
          expect(testContext.version.subtitles).to.equal('foo')
        })
      })

      context('1st box, with context.version.subtitles and empty context.movie.version', () => {
        it('picks subtitles from context.movie.version', () => {
          parse(versionBoxes.first(), { 
            movie: { version: {} }, 
            version: { subtitles: 'foo' } 
          })
          expect(testContext.version.subtitles).to.equal('foo')
        })
      })

      const testSecondBoxTests = (givenContext = undefined) => () => {
        beforeEach(() => {
          parse(versionBoxes.last(), givenContext)
        })

        it(`finds 3D flag to be true`, () => {
          expect(testContext.version.is3d).to.be.true
        })

        it(`finds IMAX flag to be true`, () => {
          expect(testContext.version.isImax).to.be.true
        })

        it(`finds language to be english`, () => {
          expect(testContext.version.language).to.equal('en')
        })

        it(`finds subtitles to be german`, () => {
          expect(testContext.version.subtitles).to.deep.equal(['de'])
        })
      }

      context('2nd box, no context.version', testSecondBoxTests())
      context('2nd box, with context.version.is3d = false', testSecondBoxTests({ version: { is3d: false }}))
      context('2nd box, with context.movie.version.is3d = false', testSecondBoxTests({ movie: { version: { is3d: false } }}))
    })


    context('attributes value grabbing', () => {

      function testattributesGrabbingOnEmptyContext(parseAttributes) {
        it('finds no attributes if value grabbing box not found', () => {
          parseAttributes('.i-am-not-here')
          expect(testContext.version.attributes).to.be.an('array').of.length(0)
        })

        it('finds 3D flag', () => {
          parseAttributes('h3.version')
          expect(testContext.version.attributes).to.deep.equal(['3D'])
        })

        it('combines attributes from multiple tags to an array', () => {
          parseAttributes('.version.test-selector-2')
          expect(testContext.version.attributes).to.deep.equal(['3D', 'IMAX'])
        })

        it('keeps attributes string with space as single value', () => {
          parseAttributes('.versions')
          expect(testContext.version.attributes).to.deep.equal(['D-Box fancy'])
        })

        it('works with returning list of attributes from mapper', () => {
          parseAttributes({
            selector: '.versions',
            mapper: str => str.split(' ')
          })
          expect(testContext.version.attributes).to.deep.equal(['D-Box', 'fancy'])
        })
      }

      context('2nd box, no context.version', () => {
        function parseAttributes(attributes: ValueGrabbing) {
          parser.parse(versionBoxes.last(), {
            attributes: attributes
          }, testContext)
        }

        beforeEach(() => {
          testContext = new TestContext({ cheerio: $ })        
        })

        testattributesGrabbingOnEmptyContext(parseAttributes)
      })

      context('2nd box, no context.version.attributes = []', () => {
        function parseAttributes(attributes: ValueGrabbing) {
          parser.parse(versionBoxes.last(), {
            attributes: attributes
          }, testContext)
        }

        beforeEach(() => {
          testContext = new TestContext({
            cheerio: $,
            version: { attributes: [] }
          })
        })

        testattributesGrabbingOnEmptyContext(parseAttributes)
      })

      context(`2nd box, with context.version.attributes = ['ABC']`, () => {
        function parseAttributes(attributes: ValueGrabbing) {
          parser.parse(versionBoxes.last(), {
            attributes: attributes
          }, testContext)
        }

        beforeEach(() => {
          testContext = new TestContext({ 
            cheerio: $,
            version: { attributes: ['ABC'] }
          })
        })

        it('keeps existing attributes when not grabbing', () => {
          parseAttributes(null)
          expect(testContext.version.attributes).to.deep.equal(['ABC'])
        })

        it('merges grabbed single flag with existing', () => {
          parseAttributes('h3.version')
          expect(testContext.version.attributes).to.contain('ABC')
          expect(testContext.version.attributes).to.contain('3D')
        })

        // // ToDo: CRAWLE-173
        // it.skip('combines attributes from multiple tags to an array', () => {
        //   parseAttributes('.version.test-selector-2')
        //   expect(testContext.version.attributes).to.deep.equal(['3D', 'IMAX'])
        // })

        it('merges grabbed list of attributes into existing array', () => {
          parseAttributes('.versions')
          expect(testContext.version.attributes).to.contain('D-Box fancy')
          expect(testContext.version.attributes).to.contain('ABC')
        })
      })
    })

  })

})