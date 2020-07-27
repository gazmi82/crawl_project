import * as ObjectPath from 'object-path'
import TableParser from './TableParser'
import cliParams from './../../cli-params'

export interface SelectionBoundary {
  offset: number
  limit?: number
}

/**
 * Defined the boundaries for subset of an HTML table. 
 * 
 * @category HTML Parsing
 */
export default class TableBoundaries {
  public rows: SelectionBoundary
  public columns: SelectionBoundary
  constructor(config?: TableParser.ParsingConfig) {
    this.rows = {
      offset: ObjectPath.get(config, 'headerRow.offset') || 0,
      limit: this.buildLimit(ObjectPath.get(config, 'cells.rowLimit'))
    }
    this.columns = {
      offset: ObjectPath.get(config, 'headerColumn.offset') || 0,
      limit: this.buildLimit(ObjectPath.get(config, 'cells.columnLimit'))
    }
  }

  private buildLimit(configLimit): number | undefined {
    if (cliParams.limit != undefined && configLimit != undefined) {
      return Math.min(cliParams.limit, configLimit)
    }
    return cliParams.limit || configLimit
  }

  get rowLimit() {
    return this.rows.limit || Infinity
  }

  get maxRow() {
    return this.rows.offset + this.rowLimit - 1
  }
  
  get colLimit() {
    return this.columns.limit || Infinity
  }

  get maxCol() {
    return this.columns.offset + this.colLimit -1
  }

  contains(cellRef: TableParser.CellReference, shift?: TableParser.CellReference): boolean {
    shift = shift || { row: 0, col: 0 }
    cellRef = {
      row: cellRef.row + shift.row,
      col: cellRef.col + shift.col
    }
    if (cellRef.row < this.rows.offset || cellRef.row > this.maxRow) {
      return false
    }
    if (cellRef.col < this.columns.offset || cellRef.col > this.maxCol) {
      return false
    }
    return true
  }

}

