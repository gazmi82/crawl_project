# Debug Logs

In addtion to default log outputs the framework uses the [`debug`](https://github.com/visionmedia/debug) module which allow a very fine granular selection of printing debug message. 

All `debug` messages are prefixed with `crawl-e` followed by a namespace pattern as described below. To get all debug message set `DEBUG=crawl-e*` as environment variable for running a script or pass `-v` (which does the same internally). _`-v` may also passed a filter (e.g. `movies` or `date`) which is the same as  `DEBUG=crawl-e*$filter*`._

  Examples: 
  - `DEBUG=crawl-e* node scripts/my-crawler.js`
  - `node scripts/my-crawler.js -v`

For getting only specific outputs set a different `DEBUG` query string. 

## Namespaces 


### Model Names

Lowercase, plural model or list names allow filtering only debug outputs regarding their selection from HTML parsing or results. 

### Selection

In the context of all model the `…:selection:…` logs help understanding and debugging which elemets from the HTML get selected by box and value grabber selectors. 

When setting `-v movies:selection*` all movie related HTML parsing results get logged. 

To get only the number of boxes picked run with `-v count`


#### Boxes

`…:selection:box` logs the full html of a selected box. This is helpful to check if the selector is correct or identify where the item's properties are contains in a that box. 

#### Properties

For debugging the selecton of an items properties 2-3 entries are logger. First the box holding the property's value (which might be the item's box or a child of it), prefix with `…:selection:<property>:box`. Second the value grabbed from the configured attribute or the boxe's `text()`, prefixed with `…:selection:<property>:value`. And optionally a third entry displaying the value returned from the properties value grabber's `mapper` function, with the same prefix again. 


### Results

All crawled results get logged in the namespace of it's model. For example `crawl-e:movies:result` is the prefix for crawled movies. 

### Callstack (<span class="ps-icon ps-icon-wand" style="font-size: 0.8em;"></span>advanced)

Running a crawler with `-v callstack` prints log entry for each of the framework's methods being called. This might be helpful to debug unexpected behaviour such as the framework stopping unexpectedly.


## Example logs

!> Run any crawler script with `-v` to get an idea of the variety of different log methods the framework offers. 

### List of log prefixes (not complete) 

- `crawl-e:callstack`
- `crawl-e:movies:result`
- `crawl-e:movies:selection`
- `crawl-e:movies:selection:count`
- `crawl-e:movies:selection:box`
- `crawl-e:movies:selection:title:box`
- `crawl-e:movies:selection:title:value`
- `crawl-e:request:user-agent`
- `crawl-e:result:showtimes:date`
- `crawl-e:result:showtimes:datetime`
- `crawl-e:result:showtimes:time`
- `crawl-e:selection:showtimes`
- `crawl-e:selection:showtimes:count`
- `crawl-e:selection:showtimes:date`
- `crawl-e:selection:showtimes:time`
- `crawl-e:showtimes:result`
- `crawl-e:showtimes:selection:date:box`
- `crawl-e:showtimes:selection:date:value`
- `crawl-e:showtimes:selection:time:box`
- `crawl-e:showtimes:selection:time:value`