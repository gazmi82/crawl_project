"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var CheerioTableParser = require("cheerio-tableparser");
var _ = require("underscore");
var async = require("async");
var AsciiTable = require("ascii-table");
var Context_1 = require("../../Context");
var TableBoundaries_1 = require("./TableBoundaries");
/** @private */
function shortenForLog(str) {
    return str
        .trim()
        .replace(/\n/, ' \\n')
        .replace(/\s+/g, ' ')
        .trim();
}
var TableParser;
(function (TableParser) {
    function emptyCellFilter(cell, context) {
        var text = cell.text().trim();
        if (text === '&nbsp;') {
            return false;
        }
        return text.replace(/[^a-zA-Z0-9]/g, '').length > 0;
    }
    TableParser.emptyCellFilter = emptyCellFilter;
    /**
     * Helper function to iterate through tables.
     * @param container
     * @param context
     * @param cellParsers
     * @param headerOfSets
     * @param callback
     */
    function parseTable(container, parsingContext, logger, cellParsers, tableParsingConfig, callback) {
        var formatCellRef = function (ref) { return ref.row + ":" + ref.col; };
        var $ = cheerio.load(parsingContext.cheerio.html(container));
        CheerioTableParser($);
        var cells = {};
        var tableSize = { col: 0, row: 0 };
        var data = $('table').parsetable({ dupCols: true, dupRows: true, textMode: false }, function (ref, cell) {
            tableSize.col = Math.max(tableSize.col, ref.col + 1);
            tableSize.row = Math.max(tableSize.row, ref.row + 1);
            cells[formatCellRef(ref)] = cell;
        });
        var boundaries = setupBoundaries(tableParsingConfig, tableSize);
        var debugTable = $('table').parsetable({ dupCols: true, dupRows: true, textMode: true }, null);
        logAsciiTable(debugTable, boundaries, logger);
        var colContexts = [];
        var rowContexts = [];
        // 1. parse the header row
        // 2. if present parse header col
        // 3. parse content cells
        // 1. first iteration of data is on column and will set colContexts 
        async.forEachOfSeries(data, function (column, colIndex, colCallback) {
            // 2. first iteration on each columns row will set rowContexts 
            // 3. any other iterations on rows will then have colContext and rowContext already set
            async.forEachOfSeries(column, function (cellData, rowIndex, cellCallback) {
                var context = Context_1.cloneContext(parsingContext);
                var ref = { col: colIndex, row: rowIndex };
                var cell = cells[formatCellRef(ref)];
                context.indexes.table = ref;
                if (!boundaries.contains(ref)) { // skip offset or out of limit cells 
                    logger.debug("table:out-of-bounds", '%o: skipped out of bounds cell', ref, 'content:', shortenForLog(cell.html()));
                    return cellCallback();
                }
                var iterator = rowIndex === boundaries.rows.offset
                    ? cellParsers.headerRow
                    : (cellParsers.headerCol && colIndex === boundaries.columns.offset)
                        ? cellParsers.headerCol
                        : cellParsers.content;
                var isContentCell = iterator === cellParsers.content;
                var isTopLeftCell = rowIndex === boundaries.rows.offset && colIndex === boundaries.columns.offset;
                var skipCell = cellParsers.headerCol && isTopLeftCell;
                if (cell === undefined) {
                    skipCell = true;
                }
                if (!skipCell
                    && isContentCell
                    && cellParsers.contentCellFilter
                    && cellParsers.contentCellFilter(cell, context) === false) {
                    skipCell = true;
                }
                if (skipCell) {
                    logger.debug("table:content-cell", '%o: skipped empty cell', ref, 'content:', cell && shortenForLog(cell.html()));
                    return cellCallback();
                }
                if (isContentCell) {
                    _.assign(context, rowContexts[rowIndex], colContexts[colIndex]);
                    context.indexes.table = ref;
                }
                var asyncIterator = iterator.length < 3 ? async.asyncify(iterator) : iterator;
                asyncIterator(cell, context, function (err) {
                    if (iterator === cellParsers.headerRow) {
                        colContexts[colIndex] = Context_1.cloneContext(context);
                    }
                    if (iterator === cellParsers.headerCol) {
                        rowContexts[rowIndex] = Context_1.cloneContext(context);
                    }
                    cellCallback(err);
                });
            }, colCallback);
        }, callback);
    }
    TableParser.parseTable = parseTable;
    function setupBoundaries(tableParsingConfig, tableSize) {
        var boundaries = new TableBoundaries_1.default(tableParsingConfig);
        if (boundaries.rows.limit < 0) {
            boundaries.rows.limit = tableSize.row + boundaries.rows.limit - boundaries.rows.offset;
        }
        else {
            boundaries.rows.limit += 1;
        }
        if (boundaries.columns.limit < 0) {
            boundaries.columns.limit = tableSize.row + boundaries.columns.limit - boundaries.columns.offset;
        }
        else {
            boundaries.columns.limit += tableParsingConfig.headerColumn ? 1 : 0;
        }
        return boundaries;
    }
    function logAsciiTable(debugTable, boundaries, logger) {
        var table = new AsciiTable();
        var colCount = Math.min(debugTable.length, boundaries.maxCol + 1);
        var rowCount = Math.min((debugTable[0] || []).length, boundaries.maxRow + 1);
        for (var rowIndex = boundaries.rows.offset; rowIndex < rowCount; rowIndex++) {
            var row = [];
            for (var colIndex = boundaries.columns.offset; colIndex < colCount; colIndex++) {
                var ref = { row: rowIndex, col: colIndex };
                var shoudIncludeCell = boundaries.contains(ref)
                    || rowIndex === boundaries.rows.offset
                    || colIndex === boundaries.columns.offset;
                if (shoudIncludeCell) {
                    var cellContent = debugTable[colIndex][rowIndex];
                    cellContent = cellContent || "" + cellContent;
                    cellContent = shortenForLog(cellContent).slice(0, 25);
                    if (cellContent === '')
                        cellContent = ' ';
                    row.push(cellContent);
                }
                else {
                    row.push('---');
                }
            }
            rowIndex === boundaries.rows.offset
                ? table.setHeading.apply(table, row) : table.addRow.apply(table, row);
        }
        if (rowCount + colCount > 0) {
            logger.debug('table:ascii', table.toString());
        }
    }
})(TableParser || (TableParser = {}));
exports.default = TableParser;
