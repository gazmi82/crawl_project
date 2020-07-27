import TemplaterEvaluator from './TemplaterEvaluator'
import * as chai from 'chai'
import * as moment from 'moment'

const expect = chai.expect

describe('TemplaterEvaluator', () => {

  context('passing undefined template', () => {
    it('returns `undefined`', () => {
      expect(TemplaterEvaluator.evaluate(undefined, context)).to.be.undefined
    })
  })

  context('template without placeholder', () => {
    let context = null
    it('returns template url string untouched', () => {
      let template = 'http://example.com'
      let url = TemplaterEvaluator.evaluate(template, context)
      expect(url).to.eql('http://example.com')
    })

    it('returns template object untouched', () => {
      let template = {foo: 'bar'}
      let data = TemplaterEvaluator.evaluate(template, context)
      expect(data).to.eql({foo: 'bar'})
    })
  })

  context('one placeholder', () => {
    let context = { 
      cinema: { id: '4711' } 
    }
    it('inserts cinema.id from context into url string', () => {
      let template = 'http://cinemachain.com/locations/:cinema.id:'
      let url = TemplaterEvaluator.evaluate(template, context)
      expect(url).to.eql('http://cinemachain.com/locations/4711')
    })

    it('inserts cinema.id from context into json object', () => {
      let template = { id: ':cinema.id:' }
      let data = TemplaterEvaluator.evaluate(template, context)
      expect(data).to.eql({ id: '4711' })
    })
  })

  context('two placeholders different objects placeholder', () => {
    let context = {
      city: {
        slug: 'berlin'
      },
      cinema: {
        id: '4711'
      }
    }
    
    it('inserts city.slug & cinema.id from context into url string', () => {
      let template = 'http://cinemachain.com/:city.slug:/:cinema.id:'
      let url = TemplaterEvaluator.evaluate(template, context)
      expect(url).to.eql('http://cinemachain.com/berlin/4711')
    })
    
    it('inserts city.slug & cinema.id from context into same key on json object', () => {
      let template = { 
        url: 'http://cinemachain.com/:city.slug:/:cinema.id:'
      }
      let data: any = TemplaterEvaluator.evaluate(template, context)
      expect(data.url).to.eql('http://cinemachain.com/berlin/4711')
    })

    it('inserts city.slug & cinema.id from context into different keys on json object', () => {
      let template = {
        city_slug: ':city.slug:',
        cinema_id: ':cinema.id:'
      }
      let data: any = TemplaterEvaluator.evaluate(template, context)
      expect(data).to.eql({
        city_slug: 'berlin',
        cinema_id: '4711'
      })
    })
  })

  context('two placeholders same object placeholder', () => {
    let context = {
      cinema: {
        id: '4711',
        slug: 'zoopalast'
      }
    }
    
    it('inserts cinema.id & cinema.slug from context into url string', () => {
      let template = 'http://cinemachain.com/locations/:cinema.id:-:cinema.slug:'

      let url = TemplaterEvaluator.evaluate(template, context)
      expect(url).to.eql('http://cinemachain.com/locations/4711-zoopalast')
    })

    it('inserts cinema.id & cinema.slug from context into same key on json object', () => {
      let template = {
        url: 'http://cinemachain.com/locations/:cinema.id:-:cinema.slug:'
      }
      let data: any = TemplaterEvaluator.evaluate(template, context)
      expect(data.url).to.eql('http://cinemachain.com/locations/4711-zoopalast')
    })

    it('inserts cinema.id & cinema.slug from context into different keys on json object', () => {
      let template = {
        cinema_slug: ':cinema.slug:',
        cinema_id: ':cinema.id:'
      }
      let data: any = TemplaterEvaluator.evaluate(template, context)
      expect(data).to.eql({
        cinema_slug: 'zoopalast',
        cinema_id: '4711'
      })
    })
  })

  context(':date: placeholer with moment date', () => {
    let testContext
    beforeEach(() => {
      testContext = {
        date: moment(),
        dateFormat: 'YYYY-MM-DD'
      }
    })
    
    it('inserts formatted date into url string', () => {
      let template = 'http://cinemas.com/showtimes?date=:date:'
      let url = TemplaterEvaluator.evaluate(template, testContext)
      expect(url).to.eql('http://cinemas.com/showtimes?date=' + moment().format('YYYY-MM-DD'))
    })

    it('inserts formatted date into json object', () => {
      let template = { date: ':date:' }
      let data = TemplaterEvaluator.evaluate(template, testContext)
      expect(data).to.eql({ date: moment().format('YYYY-MM-DD') })
    })
  })

  context(':page: placeholder', () => {
    let testContext
    beforeEach(() => {
      testContext = {
        page: 1
      }
    })
    it('inserts current page into url string', () => {
      let template = 'http://cinemas.com/showtimes?page=:page(1,3):'
      let url = TemplaterEvaluator.evaluate(template, testContext)
      expect(url).to.eql('http://cinemas.com/showtimes?page=1')
    })

    describe('#parseStaticPages', () => {
      it('parses range', () => {
        let pages = TemplaterEvaluator.parseStaticPages(':page(0,2):')
        expect(pages).to.deep.equal(['0', '1', '2'])
      })

      let cases = [
        null,
        undefined,
        ':page(0):',
        ':page(0,):',
        ':page:'
      ]
      cases.forEach(template => {
        it(`returns null for ${template}`, () => {
          expect(TemplaterEvaluator.parseStaticPages(template)).to.be.null
          // expect(() => TemplaterEvaluator.parseStaticPages(template)).to.throw
        })
      })

      it('parse static values', () => {
        let pages = TemplaterEvaluator.parseStaticPages(':page([a,b,c]):')
        expect(pages).to.deep.equal(['a', 'b', 'c'])
      })

    })
  })
})
