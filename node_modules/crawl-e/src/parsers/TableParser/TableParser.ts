import * as cheerio from 'cheerio'
import * as CheerioTableParser from 'cheerio-tableparser'
import * as _ from 'underscore'
import * as async from 'async'
import * as AsciiTable from 'ascii-table'
import { CallbackFunction } from '../../ResponseParsers'
import { cloneContext } from '../../Context'
import { SubConfigs } from '../../Config'
import { ParsingContext } from '../ParsingContext'
import TableBoundaries from './TableBoundaries';
import Logger from '../../Logger';


/** @private */
function shortenForLog(str: string) {
  return str
    .trim()
    .replace(/\n/, ' \\n')
    .replace(/\s+/g, ' ')
    .trim()
}

namespace TableParser {
  export interface CellReference {
    /** 
     * cell's row index
     * @TJS-type integer 
     */
    row: number
    /**
     * cell's row index
     * @TJS-type integer 
     */
    col: number
  }
  
  /**
   * @param html The html of the cell's content
   * @param context
   * @param ref address of the cell 
   */
  export type CellIterator<Result> = (cell: Cheerio, context: ParsingContext, callback?: async.ErrorCallback<{}>) => Result

  namespace Params {
    export interface CellParsers {
      headerRow: CellIterator<void>
      headerCol: CellIterator<void>
      content: CellIterator<void>
      contentCellFilter?: CellIterator<boolean>
    }
    export interface HeaderOffsets {
      column: number
      row: number
    }
  }

  export interface ParsingConfig {
    selector: string
    headerRow: any
    headerColumn?: any
    cells: {
      rowLimit?: number
      columnLimit?: number
      filter?: CellIterator<boolean>
      showtimes: SubConfigs.Showtimes.ListParsing
    }
  }

  export function emptyCellFilter(cell: Cheerio, context: ParsingContext) {
    let text = cell.text().trim()
    if (text === '&nbsp;') { return false }
    return text.replace(/[^a-zA-Z0-9]/g, '').length > 0
  }

  /**
   * Helper function to iterate through tables.
   * @param container
   * @param context 
   * @param cellParsers
   * @param headerOfSets
   * @param callback 
   */
  export function parseTable(container: Cheerio, parsingContext: ParsingContext, logger: Logger, cellParsers: Params.CellParsers, tableParsingConfig: ParsingConfig, callback: CallbackFunction) {
    let formatCellRef = (ref: CellReference) => `${ref.row}:${ref.col}`
    let $ = cheerio.load(parsingContext.cheerio.html(container))
    CheerioTableParser($)
    let cells: any = {} 
    let tableSize: CellReference = { col: 0, row: 0 }
    let data = $('table').parsetable({ dupCols: true, dupRows: true, textMode: false }, (ref, cell) => {
      tableSize.col = Math.max(tableSize.col, ref.col + 1)
      tableSize.row = Math.max(tableSize.row, ref.row + 1)
      cells[formatCellRef(ref)] = cell
    })

    let boundaries = setupBoundaries(tableParsingConfig, tableSize)
    let debugTable = $('table').parsetable({ dupCols: true, dupRows: true, textMode: true }, null)
    logAsciiTable(debugTable, boundaries, logger)

    let colContexts = []
    let rowContexts = []


    // 1. parse the header row
    // 2. if present parse header col
    // 3. parse content cells

    // 1. first iteration of data is on column and will set colContexts 
    async.forEachOfSeries(data, (column: string[], colIndex: number, colCallback) => {
      // 2. first iteration on each columns row will set rowContexts 
      // 3. any other iterations on rows will then have colContext and rowContext already set
      async.forEachOfSeries(column, (cellData: string, rowIndex: number, cellCallback) => {
        let context: ParsingContext = cloneContext(parsingContext)

        let ref: CellReference = { col: colIndex, row: rowIndex }
        let cell = cells[formatCellRef(ref)]

        context.indexes.table = ref

        if (!boundaries.contains(ref)) { // skip offset or out of limit cells 
          logger.debug(`table:out-of-bounds`, '%o: skipped out of bounds cell', ref, 'content:', shortenForLog(cell.html()))
          return cellCallback()
        }

        let iterator = rowIndex === boundaries.rows.offset
          ? cellParsers.headerRow
          : (cellParsers.headerCol && colIndex === boundaries.columns.offset)
            ? cellParsers.headerCol
            : cellParsers.content

        let isContentCell = iterator === cellParsers.content
        let isTopLeftCell = rowIndex === boundaries.rows.offset && colIndex === boundaries.columns.offset
       
        let skipCell = cellParsers.headerCol && isTopLeftCell

        if (cell === undefined) {
          skipCell = true
        }


        if (!skipCell 
          && isContentCell 
          && cellParsers.contentCellFilter 
          && cellParsers.contentCellFilter(cell, context) === false
        ) { 
          skipCell = true
        }

        if (skipCell) {
          logger.debug(`table:content-cell`, '%o: skipped empty cell', ref, 'content:', cell && shortenForLog(cell.html()))
          return cellCallback()
        }
        
        if (isContentCell) { 
          _.assign(context, rowContexts[rowIndex], colContexts[colIndex]) 
          context.indexes.table = ref
        }


        let asyncIterator = iterator.length < 3 ? async.asyncify(iterator) : iterator
        asyncIterator(cell, context, (err: Error) => {
          if (iterator === cellParsers.headerRow) { colContexts[colIndex] = cloneContext(context) }
          if (iterator === cellParsers.headerCol) { rowContexts[rowIndex] = cloneContext(context) }
          cellCallback(err)
        })

      }, colCallback)
    }, callback)
  }

  function setupBoundaries(tableParsingConfig: ParsingConfig, tableSize: CellReference, ) {
    let boundaries = new TableBoundaries(tableParsingConfig)

    if (boundaries.rows.limit < 0) {
      boundaries.rows.limit = tableSize.row + boundaries.rows.limit - boundaries.rows.offset
    } else {
      boundaries.rows.limit += 1
    }

    if (boundaries.columns.limit < 0) {
      boundaries.columns.limit = tableSize.row + boundaries.columns.limit - boundaries.columns.offset
    } else {
      boundaries.columns.limit += tableParsingConfig.headerColumn ? 1 : 0
    }

    return boundaries
  }

  function logAsciiTable(debugTable: any, boundaries: TableBoundaries, logger: Logger) {
    let table = new AsciiTable()
    let colCount = Math.min(debugTable.length, boundaries.maxCol + 1)
    let rowCount = Math.min((debugTable[0] || []).length, boundaries.maxRow + 1)

    for (let rowIndex = boundaries.rows.offset; rowIndex < rowCount; rowIndex++) {
      let row = []
      for (let colIndex = boundaries.columns.offset; colIndex < colCount; colIndex++) {
        let ref: CellReference = { row: rowIndex, col: colIndex }
        let shoudIncludeCell = boundaries.contains(ref)
          || rowIndex === boundaries.rows.offset
          || colIndex === boundaries.columns.offset
        if (shoudIncludeCell) {
          let cellContent = debugTable[colIndex][rowIndex]
          cellContent = cellContent || `${cellContent}`
          cellContent = shortenForLog(cellContent).slice(0, 25)
          if (cellContent === '') cellContent = ' '
          row.push(cellContent)
        } else {
          row.push('---')
        }
      }
      rowIndex === boundaries.rows.offset
        ? table.setHeading(...row)
        : table.addRow(...row)
    }

    if (rowCount + colCount > 0) {
      logger.debug('table:ascii', table.toString())
    }
  }
}

export default TableParser
