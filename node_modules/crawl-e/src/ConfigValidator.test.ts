import ConfigValidator from './ConfigValidator'
import configSchema from './config-schema'
import { ConfigError } from './Errors'
import { expect } from 'chai'
import { TestLogger } from './../tests/helpers'

describe('ConfigValiditor', () => {
  context('test schema', () => {
    let testSchema = {
      '$schema': 'http://json-schema.org/draft-04/schema',
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'identifier as of the crawled website'
        }, 
        item: {
          type: 'object', 
          properties: {
            foo: {
              type: 'string'
            }
          }
        }
      }
    }
    let validator = new ConfigValidator(testSchema)
    let config = {
      foo: 'bar'
    }

    it('detects missing config', () => {
      expect(() => validator.validate(undefined)).to.throw (ConfigError, 'Missing Config (got undefined)')
      expect(() => validator.validate(null)).to.throw(ConfigError, 'Missing Config (got null)')
    })

    it('finds wrong value types', () => {
      expect(() => validator.validate({ id: 123 })).to.throw(ConfigError, 'config.id should be string')
    })


    context('unknwon keys', ()=> {
      let logger: TestLogger
      beforeEach(() => {
        logger = new TestLogger()
        validator.logger = logger
      })

      it('warns about one keys', () => {
        validator.logger = logger
        validator.validate({ id: '123', foo: 'bar' })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: foo')
      })

      it('warns about multiple keys', () => {
        validator.logger = logger
        validator.validate({ id: '123', foo: 'bar', bar: 123 })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: foo')
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: bar')
      })

      it('warns unknown keys at deeper levels', () => {
        validator.logger = logger
        validator.validate({ id: '123', item: { foo: 'bar', bar: 123 } })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: item.bar')        
      })
    })
  })

  context('config schema', () => {
    let validator = new ConfigValidator(configSchema)

    context('empty config', () => {
      it('finds missing cinemas key', () => {
        expect(() => validator.validate({})).to.throw(ConfigError, "config should have required property 'cinemas'")
      })
    })

    context('static cinemas', () => {

      it('finds no errors on a valid config ', () => {
        let config = {
          cinemas: [
            {
              name: 'Zoopalast',
              address: 'Hardenberg Straße, 29a, 10623 Berlin'
            },
            {
              name: 'Cubix am Alex',
              address: ''
            }
          ]
        }
        expect(() => validator.validate(config)).to.not.throw()
      })
  
      it('finds missing address', () => {
        let config = {
          cinemas: [
            {
              name: 'Zoopalast',
              address: 'Hardenberg Straße, 29a, 10623 Berlin'
            },
            {
              name: 'Cubix am Alex',
              // address: ''
            }
          ]
        }
        expect(() => validator.validate(config)).to.throw(ConfigError, "config.cinemas[1] should have required property 'address'")
      })

    }) // end of static cinemas


    describe('dynamic cinemas', () => {

      it('finds missing list key in cinemas', () => {
        expect(() => validator.validate({
          cinemas: {}
        })).to.throw(ConfigError, "config.cinemas should have required property 'list'")
      })

      it('finds missing url / urls key in cinemas.list', () => {
        expect(() => validator.validate({
          cinemas: { list: {} }
        })).to.throw(ConfigError, "config.cinemas.list should have required property '.url'")
      })

      it('finds no errors on list with url and box', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no error on list with urls', () => {
        let config = {
          cinemas: {
            list: {
              urls: ['http://www.kinopolis.de/']              
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no errors on list with url, box and id value grabber short handle', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
              id: 'a @href'
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no errors on list with url, box and id value grabber extensive', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
              id: {
                selector: 'a', 
                attribute: '@href', 
                mapper: id => id
              }
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no errors on list with url, box and id value grabber extensive having a null selector', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
              id: {
                selector: null,
                attribute: '@href',
                mapper: id => id
              }
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no errors on list with url, box and id value grabber extensive having a null attribute', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
              id: {
                selector: 'p',
                attribute: null,
                mapper: id => id
              }
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no errors on list with url, box and id value grabber extensive having a null mapper', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
              id: {
                selector: 'a',
                attribute: '@href',
                mapper: null
              }
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no errors on list with url, box and id value grabber extensive having no mapper', () => {
        let config = {
          cinemas: {
            list: {
              url: 'http://www.kinopolis.de/',
              box: '.logo-nav ol li a[href!="//www.gloria-palast.de"]',
              id: {
                selector: 'a',
                attribute: '@href'
              }
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })
    })

    describe('unknown key warnings', () => {
      let logger: TestLogger
      beforeEach(() => {
        logger = new TestLogger()
        validator.logger = logger
      })

      it('warns about unknown one key in single showtimes crawling config', () => {
        validator.validate({ 
          cinemas: [], // dummy cinema entry
          showtimes: { 
            url: '', // make it direct as single showtimes config
            foo: 'bar' // unknown key expected to get caught
          } 
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.foo')
      })

      it('warns about unknown two key in single showtimes crawling config', () => {
        validator.validate({
          cinemas: [], // dummy cinema entry
          showtimes: {
            url: '', // make it direct as single showtimes config
            foo: 'bar', // unknown key expected to get caught
            bar: null
          }
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.foo')
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.bar')
      })

      it('warns about unknown one deep nested key in single showtimes crawling config', () => {
        validator.validate({
          cinemas: [], // dummy cinema entry
          showtimes: {
            url: '', // make it direct as single showtimes config
            movies: {
              box: '', 
              showtimes: {
                box: '',
                foo: 'bar' // unknown key expected to get caught
              }
            }
          }
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.movies.showtimes.foo')
      })


      it('warns about one unknown key in showtimes crawling configs array', () => {
        validator.validate({
          cinemas: [], // dummy cinema entry
          showtimes: [{
            url: '', // make it direct as single showtimes config
            foo: 'bar' // unknown key expected to get caught
          }]
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.0.foo')
      })

      it('warns about one deep nested unknown key in showtimes crawling configs array', () => {
        validator.validate({
          cinemas: [], // dummy cinema entry
          showtimes: [{
            url: '', // make it direct as single showtimes config
            movies: {
              box: '', 
              showtimes: {
                box: '', 
                foo: 'bar' // unknown key expected to get caught
              }
            }
          }]
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.0.movies.showtimes.foo')
      })

      it('warns about two unknown key in showtimes crawling configs array', () => {
        validator.validate({
          cinemas: [], // dummy cinema entry
          showtimes: [
            {
              url: '', // make it direct as single showtimes config
              foo: 'bar' // unknown key expected to get caught
            }, 
            {
              url: '', // make it direct as single showtimes config
              bar: null // unknown key expected to get caught
            }
          ]
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.0.foo')
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: showtimes.1.bar')
      })

      it('warns about unknown key in hooks', () => {
        validator.validate({
          cinemas: [], // dummy cinema entry
          hooks: {
            makeFoo: () => {}
          }
        })
        expect(logger.logs.warnings).to.contain('Found unknown key in crawler config: hooks.makeFoo')
      })

    })

    describe('movies crawling config', () => {
      let dummyCinema = {
        name: 'Zoopalast',
        address: 'Hardenberg Straße, 29a, 10623 Berlin'
      }

      it('finds missing list key in movies', () => {
        expect(() => validator.validate({
          cinemas: [dummyCinema],
          movies: {}
        })).to.throw(ConfigError, "config.movies should have required property 'list'")
      })

      it('finds missing url / urls key in movies.list', () => {
        expect(() => validator.validate({
          cinemas: [dummyCinema],
          movies: { list: {} }
        })).to.throw(ConfigError, "config.movies.list should have required property '.url'")
      })

      it('finds no errors on list with url and box', () => {
        let config = {
          cinemas: [dummyCinema],
          movies: {
            list: {
              url: 'http://www.examplecinema.com/movies',
              box: '.foo-sel',
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })

      it('finds no error on list with urls', () => {
        let config = {
          cinemas: [dummyCinema],
          movies: {
            list: {
              urls: ['http://www.examplecinema.com/movies']
            }
          }
        }
        expect(() => validator.validate(config)).to.not.throw()
      })
    })

    describe('showtimes crawling config', () => {
      let cinemas = [{
        name: 'Zoopalast',
        address: 'Hardenberg Straße, 29a, 10623 Berlin'
      }]
      context('with forEach', () => {
        it('finds no errors ', () => {
          let config = {
            cinemas,
            showtimes: {
              url: 'http://cinebar.com',
              forEach: {
                box: '.foo-sel'
              }
            }
          }
          expect(() => validator.validate(config)).to.not.throw()
        })
      })      
    })
  })




  // it('it finds unknown keys', () => {
  //   expect(() => validator.validate(config)).to.throw(new ConfigError('unknown key foo'))
  // })
})
