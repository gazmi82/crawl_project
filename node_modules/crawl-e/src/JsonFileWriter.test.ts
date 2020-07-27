import { JsonFileWriter } from './JsonFileWriter'
import { expect } from 'chai'

describe('JsonFileWriter', () => {
  let writer = new JsonFileWriter('test_output')
  describe('#setCrawlerMetainfo()', () => {

    const testCrawlerKey = (outputData) => {
      expect(outputData).to.haveOwnProperty('crawler')
      expect(outputData.crawler).to.be.an('object')
    }
    const testCrawlerId = (outputData, expectedCrawlerId = 'mocha') => {
      expect(outputData.crawler.id).to.equal(expectedCrawlerId)
    }
    const testVersionKey = (outputData) => {
      expect(outputData.crawler['crawl-e'].version).to.be.a('string')
      expect(outputData.crawler['crawl-e'].version).to.match(/^\d+\.\d+\.\d+(-\w*)?$/)
    }

    context('passing an array', () => {
      let outputData  
      before(() => {
        outputData = writer.setCrawlerMetainfo([1, 2] as any)
      })
      it('wraps array in `data` key', () => {
        expect(outputData).to.deep.include({data: [1,2]})
      })

      it('adds crawler object', () => testCrawlerKey(outputData))
      it('adds crawler.id', () => testCrawlerId(outputData))
      it('adds crawler[crawl-e].version', () => testVersionKey(outputData))
    })

    context('passing {foo: `bar`}', () => {
      let outputData  
      before(() => {
        outputData = writer.setCrawlerMetainfo({foo: 'bar'} as any)
      })

      it('adds crawler object', () => testCrawlerKey(outputData))
      it('adds crawler.id', () => testCrawlerId(outputData))
      it('adds crawler[crawl-e].version', () => testVersionKey(outputData))
      it('keeps data', () => expect(outputData.foo).to.equal('bar'))
    })

    context('passing output data with empty metainfo', () => {
      let outputData  
      before(() => {
        outputData = writer.setCrawlerMetainfo({crawler: {}} as any)
      })

      it('keeps crawler object', () => testCrawlerKey(outputData))
      it('adds crawler.id', () => testCrawlerId(outputData))
      it('adds crawler[crawl-e].version', () => testVersionKey(outputData))
    })

    context('passing output data with crawler.id only', () => {
      let outputData  
      before(() => {
        outputData = writer.setCrawlerMetainfo({crawler: { id: 'my-crawler'}} as any)
      })

      it('keeps crawler object', () => testCrawlerKey(outputData))
      it('keeps crawler.id', () => testCrawlerId(outputData, 'my-crawler'))
      it('adds crawler[crawl-e].version', () => testVersionKey(outputData))
    })

    context('passing output data with crawler.foo `bar`', () => {
      let outputData  
      before(() => {
        outputData = writer.setCrawlerMetainfo({crawler: { foo: 'bar'}} as any)
      })

      it('keeps crawler object', () => testCrawlerKey(outputData))
      it('keeps crawler.foo', () => expect(outputData.crawler.foo).to.equal('bar'))
      it('adds crawler[crawl-e].version', () => testVersionKey(outputData))
    })

  })
})