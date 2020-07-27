import TableBoundaries from './TableBoundaries'
import TableParser from './TableParser'
import { expect } from 'chai'

let boundaries

function testDoesContain(ref: TableParser.CellReference) {
  it(`returns true for ${JSON.stringify(ref)}`, () => expect(boundaries.contains(ref)).to.be.true)
}

function testDoesNotContain(ref: TableParser.CellReference) {
  it(`returns false for ${JSON.stringify(ref)}`, () => expect(boundaries.contains(ref)).to.be.false)
}

describe('TableBoundaries', () => {

  context('no limits', () => {
    before(() => {
      boundaries = new TableBoundaries()
    })
    
    describe('#rowLimit', () => {
      it('is infinity', () => expect(boundaries.rowLimit).to.equal(Infinity))
    })
    
    describe('#maxRow', () => {
      it('is infinity', () => expect(boundaries.maxRow).to.equal(Infinity))
    })

    describe('#colLimit', () => {
      it('is infinity', () => expect(boundaries.colLimit).to.equal(Infinity))
    })

    describe('#maxCol', () => {
      it('is infinity', () => expect(boundaries.maxCol).to.equal(Infinity))
    })

    describe('#contains', () => {
      testDoesContain({ row:  0, col:  0 })
      testDoesContain({ row: 10, col:  0 })
      testDoesContain({ row:  0, col: 10 })
      testDoesContain({ row: 10, col: 10 })
    })
  })

  context('with row offset', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.rows.offset = 1
    })

    describe('#contains', () => {
      testDoesNotContain({ row:  0, col:  0 })
      testDoesContain({ row: 10, col:  0 })
      testDoesNotContain({ row:  0, col: 10 })
      testDoesContain({ row: 10, col: 10 })
    })
  })

  context('with column offset', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.columns.offset = 1
    })
    describe('#contains', () => {
      testDoesNotContain({ row:  0, col:  0 })
      testDoesNotContain({ row: 10, col:  0 })
      testDoesContain({ row:  0, col: 10 })
      testDoesContain({ row: 10, col: 10 })
    })
  })

  context('with row & column offset', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.rows.offset = 1
      boundaries.columns.offset = 1
    })
    describe('#contains', () => {
      testDoesNotContain({ row:  0, col:  0 })
      testDoesNotContain({ row: 10, col:  0 })
      testDoesNotContain({ row:  0, col: 10 })
      testDoesContain({ row: 10, col: 10 })
    })
  })

  context('with row limit = 10', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.rows.limit = 10
    })

    describe('#contains', () => {
      testDoesContain({ row: 0, col: 0 })
      testDoesContain({ row: 9, col: 0 })
      testDoesNotContain({ row: 10, col: 0 })
    })
  })

  context('with column limit', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.columns.limit = 5
    })
    describe('#contains', () => {
      testDoesContain({ row: 0, col: 0 })
      testDoesContain({ row: 10, col: 0 })
      testDoesNotContain({ row: 0, col: 10 })
      testDoesNotContain({ row: 10, col: 10 })
    })
  })

  context('with row & column limit = 5', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.rows.limit = 5
      boundaries.columns.limit = 5
    })

    describe('#rowLimit', () => {
      it('returns limit', () => expect(boundaries.rowLimit).to.equal(5))
    })
    
    describe('#maxRow', () => {
      it('return 4', () => expect(boundaries.maxRow).to.equal(4))
    })

    describe('#colLimit', () => {
      it('returns limit', () => expect(boundaries.colLimit).to.equal(5))
    })

    describe('#maxCol', () => {
      it('return 4', () => expect(boundaries.maxCol).to.equal(4))
    })

    describe('#contains', () => {
      testDoesContain({ row: 0, col: 0 })
      testDoesNotContain({ row: 10, col: 0 })
      testDoesNotContain({ row: 0, col: 10 })
      testDoesNotContain({ row: 10, col: 10 })
    })
  })

  context('with row offset = 7 and limit = 5', () => {
    before(() => {
      boundaries = new TableBoundaries()
      boundaries.rows.offset = 7
      boundaries.rows.limit = 5
    })
    describe('#contains', () => {
      testDoesNotContain({ row: 0, col: 0 })
      testDoesNotContain({ row: 6, col: 0 })
      testDoesContain({ row: 7, col: 0 })
      testDoesContain({ row: 10, col: 0 })
      testDoesContain({ row: 11, col: 0 })
      testDoesNotContain({ row: 12, col: 0 })
    })
  })

})