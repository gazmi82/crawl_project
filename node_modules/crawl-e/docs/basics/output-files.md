# Output Files

The framework saves the crawled results into json files (one per cinema). It places the files in a folder named `output` (which will be create automatically if not present yet). The files are named after the crawler scripts files name appending either the cinemas id or slug if present. 

For crawlers covering only a single staticly configured cinema, no id nor slug should be present, so that the output filename simply matches the script name. 


## Output Schema

{{schema:output-schema.json}}

### Showtime

{{schema:output-schema_showtime.json}}
