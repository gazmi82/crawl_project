# `parseDates` Utilty function {docsify-ignore-all}
```typescript
/** 
 * Parses individual dates, ranges of dates and compound dates from the given text.
 * @param text input text to parse
 * @param config configuarion for dates parsing ( see below )
 * @returns an array of dates as momentjs objects
 */
function parseDates(text: string, config: Config): moment.Moment[]
```

**Config Schema:**
{{schema:dates-parsing-config.json}}

{{demo:parseDates}}
