import { expect } from 'chai'
import Mappers from './Mappers'
import { TestContext } from '../tests/helpers';

describe('Mappers', () => {
  describe('#mapHref', () => {
    let testContext = new TestContext({
      requestUrl: 'http://cinebar.foo/abc/'
    })

    context('nullably values', () => {
      [null, undefined].forEach((input) => {
        it(`returns ${input} for ${input}`, () => expect(Mappers.mapHref(input, testContext)))
      })
    })

    context('full url', () => {
      it('returns the given url', () => {
        expect(Mappers.mapHref('http://cinebar.foo/abc', testContext)).to.equal('http://cinebar.foo/abc')
      })
    })

    context('relative url', () => {
      it('add href to current path', () => {
        expect(Mappers.mapHref('hallo', testContext)).to.equal('http://cinebar.foo/abc/hallo')
      })
    })

    context('relative url with leading slash', () => {
      it('add href to at domain root', () => {
        expect(Mappers.mapHref('/hallo', testContext)).to.equal('http://cinebar.foo/hallo')
      })
    })
  })
})