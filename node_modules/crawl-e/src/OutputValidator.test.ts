import OutputValidator from './OutputValidator'
import { TestContext } from '../tests/helpers'
const expect = require('chai').expect



describe('OutputValidator', () => {

  describe('#OutputValidator.validate', () => {

    const testContext = new TestContext()

    it('finds nothing if all is fine (1)', () => {
      var data = {
        crawler: {
          id: 'test',
          is_booking_link_capable: true
        },
        cinema: {
          name: 'Musterkino',
          address: 'Musterstrasse 1, 12345 Musterstadt'
        },
        showtimes: [
          {
            'movie_title': 'Phantastische Tierwesen und wo sie zu finden sind',
            'booking_link': 'https://booking.cineplex.de/#/site/11/performance/37029000023RKBWGMB/mode/sale/',
            'start_at': '2016-12-04T12:30:00'
          },
          {
            'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
            'booking_link': 'https://booking.cineplex.de/#/site/11/performance/13029000023RKBWGMB/mode/sale/',
            'start_at': '2017-02-15T19:15:00'
          }
        ]
      }

      expect(OutputValidator.validate(data, testContext, testContext)).to.be.empty
    })

    it('finds nothing if all is fine (2)', () => {
      var data = {
        crawler: {
          id: 'test',
          is_booking_link_capable: false
        },
        cinema: {
          name: 'Musterkino',
          address: 'Musterstrasse 1, 12345 Musterstadt'
        },
        showtimes: [
          {
            'movie_title': 'Pettersson und Findus - Das schönste Weihnachten überhaupt',
            'start_at': '2016-12-07T15:00:00',
            'is_3d': false
          },
          {
            'movie_title': "Bridget Jones' Baby",
            'start_at': '2016-12-06T17:00:00',
            'is_3d': false
          }
        ]
      }

      expect(OutputValidator.validate(data, testContext)).to.be.empty
    })

    context('cinema', () => {
      const dummyShowtime = {
        'movie_title': 'Scary Foovie 2',
        'start_at': '2016-12-07T15:00:00',
        'is_3d': false
      }

      it('finds cinema.address missing', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          }, 
          cinema: {
            name: 'Musterkino', 
          },
          showtimes: [dummyShowtime]
        }
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(3)
      })

      it('finds cinema.slug with underscore', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            slug: 'muster_kino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [dummyShowtime]
        }
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(8)
      })
    })

    context('showtimes', () => {      


      it('finds empty showtimes array', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [ ]
        }
        
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(7)      
      })

      it('skips empty showtimes array if context.isTemporarilyClosed = true', () => {
        let testContext = new TestContext()
        testContext.isTemporarilyClosed = true
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [ ]
        }
        
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.be.empty
      })
      
      it('finds duplicated booking links', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: true
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              'movie_title': 'Phantastische Tierwesen und wo sie zu finden sind',
              'booking_link': 'https://booking.cineplex.de/#/site/11/performance/37029000023RKBWGMB/mode/sale/',
              'start_at': '2016-12-04T12:30:00'
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'booking_link': 'https://booking.cineplex.de/#/site/11/performance/13029000023RKBWGMB/mode/sale/',
              'start_at': '2017-02-15T19:15:00'
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'booking_link': 'https://booking.cineplex.de/#/site/11/performance/13029000023RKBWGMB/mode/sale/',
              'start_at': '2017-02-16T19:15:00'
              
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'booking_link': 'https://booking.cineplex.de/#/site/11/performance/13029000023RKBWGMB/mode/sale/',
              'start_at': '2017-02-17T19:15:00'
            }
          ]
        }
        
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(1)
        expect(warnings[0].details.bookingLinks.length).to.equal(1)
        expect(warnings[0].details.bookingLinks[0]).to.equal('https://booking.cineplex.de/#/site/11/performance/13029000023RKBWGMB/mode/sale/')
      })

      it('finds invalid booking links', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: true
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              'movie_title': 'Scary Foovie 2',
              'booking_link': 'javascript:void(0);',
              'start_at': '2016-12-04T12:30:00'
            }
          ]
        }

        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(5)        
      })
      
      it('finds all showtimes being at midnight', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              'movie_title': 'Phantastische Tierwesen und wo sie zu finden sind',
              'start_at': '2016-12-04T00:00:00'
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'start_at': '2017-02-15T00:00:00'
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'start_at': '2017-02-16T00:00:00'

            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'start_at': '2017-02-17T00:00:00'
            }
          ]
        }

        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(4)        
      })

      it('finds wrong `is_booking_link_capable` (expecting true)', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              'movie_title': 'Phantastische Tierwesen und wo sie zu finden sind',
              'booking_link': 'https://booking.cineplex.de/#/site/11/performance/37029000023RKBWGMB/mode/sale/',
              'start_at': '2016-12-04T12:30:00'
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'booking_link': 'https://booking.cineplex.de/#/site/11/performance/13029000023RKBWGMB/mode/sale/',
              'start_at': '2017-02-15T19:15:00'
            }
          ]
        }
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(2)
        expect(warnings[0].recoveryHint).to.contain('is_booking_link_capable: true')
      })

      it('finds wrong `is_booking_link_capable` (expecting false)', () => {
        var data = {
          crawler: {
            id: 'test',
            is_booking_link_capable: true
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              'movie_title': 'Phantastische Tierwesen und wo sie zu finden sind',
              'start_at': '2016-12-04T12:30:00'
            },
            {
              'movie_title': 'Fifty Shades of Grey - Gefährliche Liebe',
              'start_at': '2017-02-15T19:15:00'
            }
          ]
        }
        var warnings = OutputValidator.validate(data, testContext)
        expect(warnings).to.have.length(1)
        expect(warnings[0].code).to.equal(2)
        expect(warnings[0].recoveryHint).to.contain('is_booking_link_capable: false')
      })
      
      context('language validation', () => {
        let createOutputData = (language) => ({
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              movie_title: 'Phantastische Tierwesen und wo sie zu finden sind',
              start_at: '2016-12-04T12:30:00',
              language: language
            }
          ]
        })
        
        let testIsoCodes = ['en', 'de', 'de-DE', 'zh-Hans', 'zh-Hans-HK']
        testIsoCodes.forEach(testCode => {
          it(`passes on valid ISO 639 codes (${testCode})`, () => {
            expect(OutputValidator.validate(createOutputData(testCode))).to.be.empty
          })
        })
        
        it(`passes on 'original version'`, () => {
          expect(OutputValidator.validate(createOutputData('original version'))).to.be.empty
        })
        
        let invalidLanguageExamples = ['deutsch', 'OmU', 'english original']
        invalidLanguageExamples.forEach(example => {
          it(`finds invalid values (${example})`, () => {
            var data = createOutputData(example)
            var warnings = OutputValidator.validate(data, testContext)
            expect(warnings).to.have.length(1)
            expect(warnings[0].code).to.equal(5) // expect validation error against output schema due to regex on language
          })
        })
        
      }) // context language validation
      
      
      context('subtitles validation', () => {
        let createOutputData = (subtitles) => ({
          crawler: {
            id: 'test',
            is_booking_link_capable: false
          },
          cinema: {
            name: 'Musterkino',
            address: 'Musterstrasse 1, 12345 Musterstadt'
          },
          showtimes: [
            {
              movie_title: 'Phantastische Tierwesen und wo sie zu finden sind',
              start_at: '2016-12-04T12:30:00',
              subtitles: subtitles
            }
          ]
        })
        
        let validExamples = ['en', 'de', 'de-DE', 'zh-Hans', 'zh-Hans-HK', 'de,fr', 'de-CH,fr-CH']
        validExamples.forEach(example => {
          it(`passes on valid ISO 639 codes (${example})`, () => {
            expect(OutputValidator.validate(createOutputData(example))).to.be.empty
          })
        })
        
        it(`passes on 'undetermined'`, () => {
          expect(OutputValidator.validate(createOutputData('undetermined'))).to.be.empty
        })
        
        let invalidLanguageExamples = ['deutsch', 'OmU', 'english original', 'mit Untertitel', 'de fr']
        invalidLanguageExamples.forEach(example => {
          it(`finds invalid values (${example})`, () => {
            var data = createOutputData(example)
            var warnings = OutputValidator.validate(data, testContext)
            expect(warnings).to.have.length(1)
            expect(warnings[0].code).to.equal(5) // expect validation error against output schema due to regex on language
          })
        })
        
      }) // context subtitles validation
    })

  })
})
  