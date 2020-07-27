/// <reference types="cheerio" />
/// <reference types="cheerio-tableparser" />
import * as async from 'async';
import { CallbackFunction } from '../../ResponseParsers';
import { SubConfigs } from '../../Config';
import { ParsingContext } from '../ParsingContext';
import Logger from '../../Logger';
declare namespace TableParser {
    export interface CellReference {
        /**
         * cell's row index
         * @TJS-type integer
         */
        row: number;
        /**
         * cell's row index
         * @TJS-type integer
         */
        col: number;
    }
    /**
     * @param html The html of the cell's content
     * @param context
     * @param ref address of the cell
     */
    export type CellIterator<Result> = (cell: Cheerio, context: ParsingContext, callback?: async.ErrorCallback<{}>) => Result;
    namespace Params {
        interface CellParsers {
            headerRow: CellIterator<void>;
            headerCol: CellIterator<void>;
            content: CellIterator<void>;
            contentCellFilter?: CellIterator<boolean>;
        }
        interface HeaderOffsets {
            column: number;
            row: number;
        }
    }
    export interface ParsingConfig {
        selector: string;
        headerRow: any;
        headerColumn?: any;
        cells: {
            rowLimit?: number;
            columnLimit?: number;
            filter?: CellIterator<boolean>;
            showtimes: SubConfigs.Showtimes.ListParsing;
        };
    }
    export function emptyCellFilter(cell: Cheerio, context: ParsingContext): boolean;
    /**
     * Helper function to iterate through tables.
     * @param container
     * @param context
     * @param cellParsers
     * @param headerOfSets
     * @param callback
     */
    export function parseTable(container: Cheerio, parsingContext: ParsingContext, logger: Logger, cellParsers: Params.CellParsers, tableParsingConfig: ParsingConfig, callback: CallbackFunction): void;
    export {};
}
export default TableParser;
