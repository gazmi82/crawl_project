# ResponseParesr Hook: {docsify-ignore-all}

**`*.table.cells.filter(cell, context)`**

## Description

This hooks replaces the framework's function for filtering content cells on table parsing. By default empty cells are excluded from parsing. 

The current cell's index / reference can be access via `context.indexes.table`.

## Parameters

{{params:
name: cell, type: object, description: [cheerio element](https://github.com/cheeriojs/cheerio) box of a cell
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
}}

**Table Cell Reference Schema**
{{schema:table-cell-reference-schema}}

## Return 

Must return `true` for each cell to include for parsing and `false` for skipping. 
 
## Template

```javascript
let config = {
  // … 
  showtimes: {
    // …
    table: {
      // …
      cells: {
        filter: (cell, context) => {
          // filter every second row
          return context.indexes.row % 2 === 0
        }
      }
    }
  }
}
```
