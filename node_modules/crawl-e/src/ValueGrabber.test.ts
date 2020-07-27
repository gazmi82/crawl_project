import ValueGrabber from './ValueGrabber'
import * as chai from 'chai'
import * as cheerio from 'cheerio'
import { ParsingContext } from './parsers'
import { SilentLogger } from './Logger'
import { TestContext, TestLogger } from '../tests/helpers'

const expect = chai.expect

describe('ValueGrabber', () => {

  describe('#init', () => {
    let simpleCheerioBox
    beforeEach(() => {
      simpleCheerioBox = cheerio.load(`<div class="box">whatever</div>`)('.box').first()
    })

    context('short forms', () => {
      it('resolves simple selector', () => {
        let grabber = new ValueGrabber('foo')
        expect(grabber.selector).to.equal('foo')
        expect(grabber.attribute).to.equal(null)
      })
      it('resolves selector and attribute combined', () => {
        let grabber = new ValueGrabber('foo @bar')
        expect(grabber.selector).to.equal('foo')
        expect(grabber.attribute).to.equal('bar')
      })

      it('resolves attribute only', () => {
        let grabber = new ValueGrabber('@bar')
        expect(grabber.selector).to.equal(null)
        expect(grabber.attribute).to.equal('bar')
      })

      it('resolves :box selector', () => {
        let grabber = new ValueGrabber(':box')
        expect(grabber.selector).to.equal(null)
        expect(grabber.attribute).to.equal(null)
      })
    })

    context('resolves objects', () => {
      it('returns valid object unchanged', () => {
        let grabber = new ValueGrabber({
          selector: 'a',
          attribute: 'href',
          mapper: foo => foo + 'bar'
        })
        expect(grabber.selector).to.equal('a')
        expect(grabber.attribute).to.equal('href')
        expect(grabber.mapper).to.be.a('function')
      })

      it('adds missing attribute key', () => {
        let grabber = new ValueGrabber({
          selector: 'a'
        })
        expect(grabber.attribute).to.equal(null)
      })

      it('resolves :box selector', () => {
        let grabber = new ValueGrabber({
          selector: ':box'
        })
        expect(grabber.selector).to.equal(null)
        expect(grabber.attribute).to.equal(null)
      })

      it('adds missing selector key', () => {
        let grabber = new ValueGrabber({
          attribute: 'href'
        })
        expect(grabber.selector).to.equal(null)
      })
    })
    
    context('resolves custon grabbing functions', () => {
      context('which returns a string', () => {
        let grabber: ValueGrabber
        before(() => {
          let grabFn = (box, context) => 'value'
          grabber = new ValueGrabber(grabFn)
        })
        
        it('returns instance with patched grab method', () => {
          expect(grabber).to.be.instanceOf(ValueGrabber)
        })
  
        describe('#grab()', () => {
          it('returns dummy value', () => {
            expect(grabber.grab(simpleCheerioBox)).to.equal('value')
          })
        })
  
        describe('#grabFirst()', () => {
          it('returns dummy value', () => {
            expect(grabber.grabFirst(simpleCheerioBox)).to.equal('value')
          })
        })
  
        describe('#grabAll()', () => {
          it('returns dummy value array', () => {
            expect(grabber.grabAll(simpleCheerioBox)).to.deep.equal(['value'])
          })
        })
      })

      context('which returns null', () => {
        let grabber: ValueGrabber
        before(() => {
          let grabFn = (box, context) => null
          grabber = new ValueGrabber(grabFn)
        })
        
        it('returns instance with patched grab method', () => {
          expect(grabber).to.be.instanceOf(ValueGrabber)
        })
  
        describe('#grab()', () => {
          it('returns null', () => {
            expect(grabber.grab(simpleCheerioBox)).to.be.null
          })
        })
  
        describe('#grabFirst()', () => {
          it('returns null', () => {
            expect(grabber.grabFirst(simpleCheerioBox)).to.be.null
          })
        })
  
        describe('#grabAll()', () => {
          it('returns [null]', () => {
            expect(grabber.grabAll(simpleCheerioBox)).to.deep.equal([null])
          })
        })
      })


      context('which returns an array', () => {
        let grabber: ValueGrabber<string[]>
        before(() => {
          let grabFn = (box, context) => ['a', 'b', 'c']
          grabber = new ValueGrabber(grabFn)
        })
        
        it('returns instance with patched grab method', () => {
          expect(grabber).to.be.instanceOf(ValueGrabber)
        })
  
        describe('#grab()', () => {
          it('returns the sample array', () => {
            expect(grabber.grab(simpleCheerioBox)).to.deep.equal(['a', 'b', 'c'])
          })
        })
  
        describe('#grabFirst()', () => {
          it('returns the sample array\'s first element', () => {
            expect(grabber.grabFirst(simpleCheerioBox)).to.equal('a')
          })
        })
  
        describe('#grabAll()', () => {
          it('returns the sample array', () => {
            expect(grabber.grabAll(simpleCheerioBox)).to.deep.equal(['a', 'b', 'c'])
          })
        })
      })

    })

    context('from ValueGrabber', () => {
      it('returns same instance', () => {
        let grabber1 = new ValueGrabber('.foo-sel')
        let grabber2 = new ValueGrabber(grabber1)
        expect(grabber1 == grabber2).to.be.ok
      })
    })

    const testCases = [undefined, null]
    testCases.forEach(undefinedOrNull => {
      context(`from ${undefinedOrNull}`, () => {
        let grabber: ValueGrabber
        let cheerioBox: Cheerio
        before(() => {
          grabber = new ValueGrabber(undefinedOrNull)
          cheerioBox = cheerio.load(`<div class="box">whatever</div>`)('.box').first()
        })
  
        it('creates a ValueGrabber', () => {          
          expect(grabber).to.be.instanceOf(ValueGrabber)
        })
  
        describe('#grab()', () => {
          it('returns null', () => {
            expect(grabber.grab(cheerioBox)).to.be.null
          })
        })

        describe('#grabFirst()', () => {
          it('returns null', () => {
            expect(grabber.grabFirst(cheerioBox)).to.be.null
          })
        })

        describe('#grabAll()', () => {
          it('returns [null]', () => {
            expect(grabber.grabAll(cheerioBox)).to.deep.equal([null])
          })
        })
      }) 
    })

    
  })

  describe('#grab', () => {
    context('box with name & id a tag', () => {
      let cheerioBox: Cheerio

      before(() => {
        cheerioBox = cheerio.load(`<div class="box">
        <a href="#123">Some title  </a>
      </div>`)('.box').first()
      })

      it('returns name from link text (trimming whitespace)', () => {
        let grabber = new ValueGrabber('a', new SilentLogger(), '',  value => value.trim())
        expect(grabber.grab(cheerioBox)).to.equal('Some title')
      })

      it('passes name link text untrimmed to the mapper', () => {
        let mapperInput
        let grabber = new ValueGrabber({
          selector: 'a',
          mapper: title => {
            mapperInput = title
            return title
          }
        })
        let grabbedValue = grabber.grab(cheerioBox)
        expect(mapperInput).to.equal('Some title  ')
      })

      it('returns id from link href', () => {
        let grabber = new ValueGrabber({
          selector: 'a',
          attribute: 'href',
          mapper: href => href.replace('#', '')
        })
        expect(grabber.grab(cheerioBox)).to.equal('123')
      })

      context('selecting non-existing box', () => {
        let grabber: ValueGrabber
        let logger: TestLogger
        before(() => {
          logger = new TestLogger(TestLogger.LOG_LEVELS.INFO)
          grabber = new ValueGrabber('foo', logger)
        })
        it('grabs null', () => {
          expect(grabber.grab(cheerioBox)).to.be.null
        })
        it('logs box not found', () => {
          expect(logger.logs.debugs).to.deep.include({ prefix: ':box', msg: 'selected (foo): <box not found>'})
        })
      })

    })

    context('box with value as direct text', () => {
      let cheerioBox: Cheerio

      before(() => {
        cheerioBox = cheerio.load(`<div class="box">Some title</div>`)('.box').first()
      })

      it('returns name from the box itself', () => {
        let grabber = new ValueGrabber(':box')
        expect(grabber.grab(cheerioBox)).to.equal('Some title')
      })

    })

    context('box with empty string as direct text', () => {
      let cheerioBox: Cheerio

      before(() => {
        cheerioBox = cheerio.load(`<div class="box"></div>`)('.box').first()
      })

      it('returns emptry string from the box itself', () => {
        let grabber = new ValueGrabber(':box')
        expect(grabber.grab(cheerioBox)).to.equal('')
      })

      it('calls custom mapper function with empty string', () => {
        let callCounter = 0
        let mapperInput = null
        let grabber = new ValueGrabber({
          selector: ':box',
          mapper: v => {
            callCounter++
            mapperInput = v
            return v
          }
        })        
        grabber.grab(cheerioBox)
        expect(callCounter).to.equal(1)
        expect(mapperInput).to.equal('')
      })

    })

    context('box with value in data-attribute', () => {
      let cheerioBox: Cheerio

      before(() => {
        cheerioBox = cheerio.load(`<div class="box" data-title="Some title"></div>`)('.box').first()
      })

      it('returns name from self', () => {
        let grabber = new ValueGrabber('@data-title')
        expect(grabber.grab(cheerioBox)).to.equal('Some title')
      })

    })

    context('grabbing an non-existing selector', () => {
      let cheerioBox: Cheerio

      before(() => {
        cheerioBox = cheerio.load(`<div class="box" data-title="Some title"><span>some text</span></div>`)('.box').first()
      })

      it('returns `null`', () => {
        let grabber = new ValueGrabber('foo')
        expect(grabber.grab(cheerioBox)).to.be.null
      })
    })

    context('grabbing an non-existing attribute', () => {
      let cheerioBox: Cheerio

      before(() => {
        cheerioBox = cheerio.load(`<div class="box" data-title="Some title"></div>`)('.box').first()
      })

      it('returns `null`', () => {
        let grabber = new ValueGrabber('@data-foo')
        expect(grabber.grab(cheerioBox)).to.be.null
      })
    })

    context('grabbing ownText() (excluding chidren nodes)', () => {
      it('returns `English`', () => {
        let cheerioBox = cheerio.load(`<p><span>Language:</span>English</p>`)('p').first()
        let grabber = new ValueGrabber('@ownText()')
        expect(grabber.grab(cheerioBox)).to.equal('English')
      })      
    })

    context('grabbing html() attribute', () => {
      let $ = cheerio.load(`<div><p><span class="label">Language:</span><span class="value">English</span></p></div>`)
      let cheerioBox = $('div').first()
      let context =  {cheerio: $ } as ParsingContext
      
      it('returns sub-html with selector', () => {
        let grabber = new ValueGrabber('p @html()')
        expect(grabber.grab(cheerioBox, context)).to.equal('<p><span class="label">Language:</span><span class="value">English</span></p>')
      })

      it('returns full box html without selector', () => {
        let cheerioBox = cheerio.load(`<div><p><span class="label">Language:</span><span class="value">English</span></p></div>`)('div').first()
        let grabber = new ValueGrabber('@html()')
        expect(grabber.grab(cheerioBox, context)).to.equal('<div><p><span class="label">Language:</span><span class="value">English</span></p></div>')
      })
    })

    context('non-string mapped values', () => {
      it('returns null from mapper (without crashing)', () => {
        let cheerioBox = cheerio.load(`<div class="box">Some title</div>`)('.box').first()
        let grabber = new ValueGrabber({
          selector: ':box', 
          mapper: v => null
        })
        expect(grabber.grab(cheerioBox)).to.be.null
      })

      it('returns Date from mapper (without crashing)', () => {
        let cheerioBox = cheerio.load(`<div class="box">Some title</div>`)('.box').first()
        let grabber = new ValueGrabber({
          selector: ':box',
          mapper: v => new Date()
        })
        expect(grabber.grab(cheerioBox)).to.be.instanceOf(Date)
      })
    })

    context('whitespace handling', () => {
      let cheerioBox: Cheerio
      
      it('replaces non default whitespaces with spaces', () => {
        // spaces in string are actually not normal spaces
        let cheerioBox = cheerio.load(`<div class="box">Montag, 30. April 2018</div>`)('.box').first()
        let grabber = new ValueGrabber(':box')        
        expect(grabber.grab(cheerioBox)).to.equal('Montag, 30. April 2018')
      })

      it('replaces multiple spaces by a single space', () => {
        // spaces in string are actually not normal spaces
        let cheerioBox = cheerio.load(`<div class="box">Foo  Bar</div>`)('.box').first()
        let grabber = new ValueGrabber(':box')
        expect(grabber.grab(cheerioBox)).to.equal('Foo Bar')
      })

      it('replaces line breaks by a single space', () => {
        // spaces in string are actually not normal spaces
        let cheerioBox = cheerio.load(`<div class="box">Foo\nBar</div>`)('.box').first()
        let grabber = new ValueGrabber(':box')
        expect(grabber.grab(cheerioBox)).to.equal('Foo Bar')
      })
    })

    context('custom grab function', () => {
      let cheerioBox: Cheerio
      let grabber: ValueGrabber
      let callCounter = 0
      let customGrab = (box, context) => {
        callCounter++
        return 'foobar'
      }
      beforeEach(() => {
        cheerioBox = cheerio.load(`<div class="box">Some title</div>`)('.box').first()
        grabber = new ValueGrabber(customGrab)
      })

      it ('calls custom grab function', () => {
        callCounter = 0
        grabber.grab(cheerioBox)
        expect(callCounter).to.equal(1)
      })

      it('returns value from custom function', () => {
        let value = grabber.grab(cheerioBox)
        expect(value).to.equal('foobar')
      })
    })

    context('selecting multiple nodes', () => {
      let cheerioBox: Cheerio
      let $
      let testContext
      before(() => {
        $ = cheerio.load(`<div class="box">
          <span class="foo">Foo</span>
          <span class="bar">Bar</span>
        </div>`)
        cheerioBox = $('.box').first()
        testContext = new TestContext({ cheerio: $ })
      })

      function testMultiSelection(selector: string, expectedValues: string[]) {
        it('returns array of values ', () => {
          let grabber = new ValueGrabber(selector, new SilentLogger())
          let values = grabber.grab(cheerioBox, testContext)
          expect(values).to.be.an('array')
          expect(values).to.deep.equal(expectedValues)
        })

        it('calls mapper on each values', () => {
          let mapperCount = 0
          let mapperInputs = []
          let grabber = new ValueGrabber(selector, new SilentLogger(), '', value => {
            mapperCount += 1
            mapperInputs.push(value.trim().replace(/\s{2,}/g, ' '))
          })
          grabber.grab(cheerioBox, testContext)
          expect(mapperCount).to.equal(2)
          expect(mapperInputs).to.deep.equal(expectedValues)
        })
      }

      context('single selector addressing multiple nodes', () => {
        testMultiSelection('span', ['Foo', 'Bar'])
      })

      context('list selector', () => {
        testMultiSelection('.foo,.bar', ['Foo', 'Bar'])
      })

      context('mixing :box with jQuery selector', () => {
        testMultiSelection(':box,.bar', ['Foo Bar', 'Bar'])
      })

      context('mixing :box with jQuery selector (reverse order)', () => {
        testMultiSelection('.bar,:box', ['Bar', 'Foo Bar'])
      })

    })

    context('selecting multiple, nested nodes', () => {
      let cheerioBox: Cheerio
      let $
      let testContext
      before(() => {
        $ = cheerio.load(`<div class="box">
          <span class="foo">
            Foo
            <span class="bar">Bar</span>
          </span>
        </div>`)
        cheerioBox = $('.box').first()
        testContext = new TestContext({ cheerio: $ })
      })
      
      context('grabbing ownText() on parent and child at together', () => {
        it('returns array of values', () => {
          let grabber = new ValueGrabber({
            selector: '.foo,.foo .bar',
            attribute: 'ownText()'
          }, new SilentLogger())
          let values = grabber.grab(cheerioBox, testContext)
          expect(values).to.deep.equal(['Foo', 'Bar'])
        })
      })
    })

    context('selector with placeholder', () => {
      let cheerioBox: Cheerio
      let $
      let value
      let logger: TestLogger

      before(() => {
        $ = cheerio.load(`<div class="box"><span id="123">some value</a> </div>`)
        cheerioBox = $('.box').first()
        logger = new TestLogger()
        let testContext = new TestContext({
          cheerio: $,
          cinema: { id: '123' }
        })
        let grabber = new ValueGrabber('#:cinema.id:', logger)
        value = grabber.grab(cheerioBox, testContext)
      })
      
      it('resolves placeholder', () => {
        let logEntry = logger.logs.debugs.filter(m => m.prefix == ':box')[0]
        expect(logEntry.msg).to.not.contain('#:cinema.id:')
        expect(logEntry.msg).to.contain('#123')
      })

      it('grabs value', () => {
        expect(value).to.equal('some value')
      })
    })

  }) // end of #grab

})
