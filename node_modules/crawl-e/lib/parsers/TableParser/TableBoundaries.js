"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ObjectPath = require("object-path");
var cli_params_1 = require("./../../cli-params");
/**
 * Defined the boundaries for subset of an HTML table.
 *
 * @category HTML Parsing
 */
var TableBoundaries = /** @class */ (function () {
    function TableBoundaries(config) {
        this.rows = {
            offset: ObjectPath.get(config, 'headerRow.offset') || 0,
            limit: this.buildLimit(ObjectPath.get(config, 'cells.rowLimit'))
        };
        this.columns = {
            offset: ObjectPath.get(config, 'headerColumn.offset') || 0,
            limit: this.buildLimit(ObjectPath.get(config, 'cells.columnLimit'))
        };
    }
    TableBoundaries.prototype.buildLimit = function (configLimit) {
        if (cli_params_1.default.limit != undefined && configLimit != undefined) {
            return Math.min(cli_params_1.default.limit, configLimit);
        }
        return cli_params_1.default.limit || configLimit;
    };
    Object.defineProperty(TableBoundaries.prototype, "rowLimit", {
        get: function () {
            return this.rows.limit || Infinity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBoundaries.prototype, "maxRow", {
        get: function () {
            return this.rows.offset + this.rowLimit - 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBoundaries.prototype, "colLimit", {
        get: function () {
            return this.columns.limit || Infinity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TableBoundaries.prototype, "maxCol", {
        get: function () {
            return this.columns.offset + this.colLimit - 1;
        },
        enumerable: false,
        configurable: true
    });
    TableBoundaries.prototype.contains = function (cellRef, shift) {
        shift = shift || { row: 0, col: 0 };
        cellRef = {
            row: cellRef.row + shift.row,
            col: cellRef.col + shift.col
        };
        if (cellRef.row < this.rows.offset || cellRef.row > this.maxRow) {
            return false;
        }
        if (cellRef.col < this.columns.offset || cellRef.col > this.maxCol) {
            return false;
        }
        return true;
    };
    return TableBoundaries;
}());
exports.default = TableBoundaries;
