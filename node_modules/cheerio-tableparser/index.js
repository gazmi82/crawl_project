/*!
 * cheerio-tableparser
 * https://github.com/misterparser/cheerio-tableparser
 * https://www.npmjs.com/package/cheerio-tableparser
 *
 * Copyright (c) 2011 Francis Chong
 * Copyright (c) 2016 Mister Parser
 * Licensed under the MIT licenses.
 *
 */
module.exports = function ($) {
  $.prototype.parsetable = function (options, cellIterator) {
    if (options === undefined) options = {}
    if (options.dupCols === undefined) options.dupCols = false
    if (options.dupRows === undefined) options.dupRows = false
    if (options.textMode === undefined) options.textMode = false

    var columns = []
    var currX = 0
    var currY = 0

    $('tr', this).each(function (rowIdx, row) {
      currY = 0
      $('td, th', row).each(function (colIdx, col) {
        var cell = $(col)
        var rowspan = parseInt(cell.attr('rowspan') || '1')
        var colspan = parseInt(cell.attr('colspan') || '1')
        var content = options.textMode === true
          ? cell.text().trim() || ''
          : cell.html() || ''

        var x = 0
        var y = 0
        for (x = 0; x < rowspan; x++) {
          for (y = 0; y < colspan; y++) {
            if (columns[currY + y] === undefined) {
              columns[currY + y] = []
            }

            while (columns[currY + y][currX + x] !== undefined) {
              currY += 1
              if (columns[currY + y] === undefined) {
                columns[currY + y] = []
              }
            }

            if ((x === 0 || options.dupRows) && (y === 0 || options.dupCols)) {
              columns[currY + y][currX + x] = content
              if (cellIterator) {
                cellIterator({ row: currX + x, col: currY + y }, cell)
              }
            } else {
              columns[currY + y][currX + x] = ''
            }
          }
        }
        currY += 1
      })
      currX += 1
    })

    return columns
  }
}
