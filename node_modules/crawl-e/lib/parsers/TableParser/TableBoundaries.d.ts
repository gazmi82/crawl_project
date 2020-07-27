import TableParser from './TableParser';
export interface SelectionBoundary {
    offset: number;
    limit?: number;
}
/**
 * Defined the boundaries for subset of an HTML table.
 *
 * @category HTML Parsing
 */
export default class TableBoundaries {
    rows: SelectionBoundary;
    columns: SelectionBoundary;
    constructor(config?: TableParser.ParsingConfig);
    private buildLimit;
    get rowLimit(): number;
    get maxRow(): number;
    get colLimit(): number;
    get maxCol(): number;
    contains(cellRef: TableParser.CellReference, shift?: TableParser.CellReference): boolean;
}
