# Advanced language & subtitles parsing {docsify-ignore-all}

The framework come with a default [mapper](terminology?id=mapper functions for parsing language and subtitles. When omitting the [`mapper`](/basics/value-grabber?id=schema) on `language` or `subtitles` value grabber they will be set automatically. 

However, in some case it might be necessary to polish the grabbed value before the mapping or provide some additional handling of extra language strings. Therefore the framework supplies the [internal mapper functions](/api/utils/languageMappers) for external use as well. 

## Example: Clean string before mapping

```javascript
const CrawlE = require('crawl-e/v{{package:version}}')

const config = {
  // …
  showtimes: {
    language: {
      selector: '.lang', 
      mapper: lang => CrawlE.Utils.mapLanguage(lang.replace('Sprache: ', ''))
    }
  }
}
```

## Example: Add more cases 

```javascript
const CrawlE = require('crawl-e/v{{package:version}}')

let extraLanguageMap = {
  'holländisch': 'nl',
  'Khoisan': 'khi'
}

const config = {
  // …
  showtimes: {
    language: {
      selector: '.lang', 
      mapper: lang => CrawlE.Utils.mapLanguage(lang) || extraLanguageMap[lang]
    }
  }
}
```



