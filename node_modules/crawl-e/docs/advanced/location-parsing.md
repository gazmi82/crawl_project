# Advanced location parsing {docsify-ignore-all}

The framework come with a default [mapper](terminology?id=mapper functions for parsing cinema locations from google and other maps. When omitting the [`mapper`](/basics/value-grabber?id=schema) on a `location` value grabber it gets set automatically. It works by parsing a maps urls. Hence the value grabber's `selector` and `attribute` need to address such an url. 


## Cleaning grabbed string before parsing


In some case it might be necessary to polish the grabbed value before the mapping. Therefore the framework supplies the [internal mapper functions](/api/utils/parseMapsUrl) for external use as well. 

**Example:**

```javascript
const CrawlE = require('crawl-e/v{{package:version}}')

const config = {
  // …
  cinemas: {
    details: {
      location: {
        selector: '.map', 
        attribute: 'src',
        mapper: value => CrawlE.Utils.parseMapsUrl(value.replace('some-search', ''))
      }
    }
  }
}
```


## Custom Location Parsing

As needed a custom `mapper` for `location` can be implemented. 

!> Other than usually the `mapper` on `location` needs to return a location object. 

**Location Schema**

{{schema:location-schema}}


**Example:**

```javascript
const CrawlE = require('crawl-e/v{{package:version}}')

const config = {
  // …
  cinemas: {
    details: {
      location: {
        selector: 'script', // the location may be in some javascript code
        mapper: value => {
          var lat, lon 
          // parsing javascript source code, e.g. with regex …
          return {lat: lat, lon: lon}
        }
      }
    }
  }
}
```



