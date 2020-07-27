import Config, { SubConfigs } from './Config'
import * as chai from 'chai'
import * as ObjectPath from 'object-path'

const expect = chai.expect

// puts the given * parsing config inside a deeper level config as of the parentKeyPath
// e.g. wrapConfig('showtimes.dates.movies.showtimes', {time: 'foo-sel'}) => { showtimes: { dates: { movies: { showtimes: { time: 'foo-sel }}}}}
function wrapConfig(parentKeyPath, config) {
  parentKeyPath.split('.').reverse().forEach((key) => {
    config = { [key]: config }
  })
  return config
}

describe('Config', () => {
  describe('#init', () => {
    describe('resolves single urls in list configs to urls array', () => {
      it('cinemas.list.url', () => {
        let config = new Config({
          cinemas: {
            list: {
              url: 'http://example.com'
            }
          }})
        expect(config.cinemasConfig.list.urls).to.eql(['http://example.com'])          
      })        
      
      it('showtimes.url', () => {
        let config = new Config({
          showtimes: {
            url: 'http://example.com/showtimes'
          }
        })
        expect(config.showtimes[0].urls).to.eql(['http://example.com/showtimes'])
      })
    
      it('movies.list.url', () => {
        let config = new Config({
          movies: {
            list: {
              url: 'http://example.com/movies'
            }
          }
        })
        expect(config.movies.list.urls).to.eql(['http://example.com/movies'])
      })

      it('movies.showtimes.url', () => {
        let config = new Config({
          movies: {
            list: {
              url: 'http://example.com/movies'
            },
            showtimes: {
              url: 'http://example.com/movies/:movie.id:'
            }
          }
        })
        expect(config.movies.showtimes.urls).to.eql(['http://example.com/movies/:movie.id:'])
      })

    })

    describe('setting defaut box selectors', () => {

      describe('periods parsing config', () => {

        function createTestConfig(parentKeyPath, auditoria) {
          let config = new Config(wrapConfig(parentKeyPath, auditoria))
          parentKeyPath = parentKeyPath.replace(/^showtimes/, `showtimes.0`)
          let levelCfg: SubConfigs.Periods.ListParsing = ObjectPath.get(config, parentKeyPath)
          expect(levelCfg).to.not.be.undefined
          return levelCfg
        }

        let testCases = [  // list of parentKeyPathes 
          'showtimes.periods',
          'showtimes.movies.periods',
          'showtimes.movies.dates.periods',
          'showtimes.movies.versions.periods',
          'showtimes.dates.periods',
          'showtimes.dates.movies.periods',
          'showtimes.dates.movies.versions.periods',
          'showtimes.versions.periods'
        ]

        testCases.forEach(parentKeyPath => {
          describe(`${parentKeyPath}`, () => {

            it(`${parentKeyPath}.box - defaults to body`, () => {
              let periodsaCfg = createTestConfig(parentKeyPath, { })
              expect(periodsaCfg.box).to.equal('body')
            })

            it(`${parentKeyPath}.box - picks value from config`, () => {
              let periodsaCfg = createTestConfig(parentKeyPath, { box: '.foo-sel' })
              expect(periodsaCfg.box).to.equal('.foo-sel')
            })

          })
        })
      })

    })
    
    context('crawler.id', () => {
      it('uses crawler id from config', () => {
        let config = new Config({ 
          crawler: { id: 'foobar' },
          cinemas: { list: { url: 'http://example.com' } } 
        })
        expect(config.crawler.id).to.equal('foobar')
      })
      
      it('adds crawler id from script', () => {
        let config = new Config({ cinemas: { list: { url: 'http://example.com' } } })
        expect(config.crawler.id).to.equal('mocha')
      })
    })
    
    context('crawler.is_booking_link_capable', () => {
      it('defaults to `false`', () => {
        let config = new Config({
          cinemas: { list: { url: 'http://example.com' } }
        })
        expect(config.crawler.is_booking_link_capable).to.be.false
      })
      it('picks up value from config', () => {
        let config = new Config({
          crawler: { is_booking_link_capable: true },
          cinemas: { list: { url: 'http://example.com' } }
        })
        expect(config.crawler.is_booking_link_capable).to.be.true
      })
      it('detects booking link capability from showtimes box type', () => {
        let config = new Config({
          cinemas: { list: { url: 'http://example.com' } },
          showtimes: {
            url: '',
            movies: {
              box: 'div',
              showtimes: {
                box: 'a'
              }
            }
          }
        })
        expect(config.crawler.is_booking_link_capable).to.be.true
      })
      it('detects `true` booking link capability from showtimes bookingLink value grabber is set', () => {
        let config = new Config({
          cinemas: { list: { url: 'http://example.com' } },
          showtimes: {
            url: '',
            movies: {
              box: 'div',
              showtimes: {
                box: '.showtime',
                bookingLink: 'a @href'
              }
            }
          }
        })
        expect(config.crawler.is_booking_link_capable).to.be.true
      })
      it('override false value from crawler.is_booking_link_capable even if detected booking link capability from showtimes box type', () => {
        let config = new Config({
          crawler: { is_booking_link_capable: false },
          cinemas: { list: { url: 'http://example.com' } },
          showtimes: {
            url: '',
            movies: {
              box: 'div',
              showtimes: {
                box: 'a'
              }
            }
          }
        })
        expect(config.crawler.is_booking_link_capable).to.be.false
      })

      it('is false when config contains no indicators', () => {
        const config = new Config({
          cinemas: [
            {
              slug: 'cinemasilplaz',
              name: 'Cinema Sil Plaz',
              address: 'Via Centrala 2, 7130 Ilanz',
              website: 'http://www.cinemasilplaz.ch/'
            }
          ],
          showtimes: {
            url: 'https://www.cinemasilplaz.ch/program/',
            movies: {
              box: '.row.occubox:contains("CINEMA")',
              title: 'h2 p',
              showtimes: {
                box: 'box-sel',
                datetime: 'foo-sel',
                datetimeFormat: 'DD.MM.YYYY, HH:mm'
              }
            }
          }
        })
        expect(config.crawler.is_booking_link_capable).to.be.false
      })
    })

    context('crawler.jira_issues', () => {
      it('picks up value from config', () => {
        let config = new Config({
          crawler: { jira_issues: ['FOO', 'BAR'] },
          cinemas: { list: { url: 'http://example.com' } }
        })
        expect(config.crawler.jira_issues).to.deep.equal(['FOO', 'BAR'])
      })
    })
    

    context('general values', () => {
      context('proxyUri', () => {
        it('defaults to `undefined`', () => {
          let config = new Config({})
          expect(config.proxyUri).to.be.undefined
        })
        
        it('picks up value from config', () => {
          let config = new Config({
            proxyUri: 'http://127.0.0.1:1234/'
          })
          expect(config.proxyUri).to.eql('http://127.0.0.1:1234/')
        })
      })
      
      context('useRandomUserAgent', () => {
        it('defaults to `true`', () => {
          let config = new Config({})
          expect(config.useRandomUserAgent).to.be.true
        })
        
        it('picks up `false` from config', () => {
          let config = new Config({
            useRandomUserAgent: false
          })
          expect(config.useRandomUserAgent).to.be.false
        })
      })
      
      context('concurrency', () => {
        it('defaults to `10`', () => {
          let config = new Config({})
          expect(config.concurrency).to.equal(10)
        })
        
        it('picks up `100` from config', () => {
          let config = new Config({
            concurrency: 100
          })
          expect(config.concurrency).to.equal(100)
        })
      })

      context('timezone', () => {
        it('defaults to `undefined`', () => {
          let config = new Config({})
          expect(config.timezone).to.be.undefined
        })

        it('picks up `Australia/Sydney` from config', () => {
          let config = new Config({
            timezone: 'Australia/Sydney'
          })
          expect(config.timezone).to.equal('Australia/Sydney')
        })
      })
    })

    context('isTemporarilyClosed', () => {
      let config = new Config({ 
        isTemporarilyClosed: {
          url: 'http://localhost:8080/cinema-closed.html',
          grabber: 'body',
        },
        cinemas: { list: { url: 'http://example.com' } } 
      })
      it ('parses the config', () => {
        expect(config.isTemporarilyClosed).to.not.be.undefined
        expect(config.isTemporarilyClosed.url).to.equal('http://localhost:8080/cinema-closed.html')
        expect(config.isTemporarilyClosed.grabber).to.equal('body')      
      })
    })
  })
})
