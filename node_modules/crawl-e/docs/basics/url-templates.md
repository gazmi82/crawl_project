# URL Templates

URLs provided at various configurations are all treaded as template, which may contains placeholders that. 

A common case is crawling a list of cinemas from a hub page (e.g. `http://my-cinemas.com/`) followed by having to visit every cinemas details page for retrieving it's address and geo-location. Requesting the details pages is handled using a URL template for building the request url of each single cinema (e.g. `http://my-cinemas.com/locations/:cinema.id:`).

Placeholders are wrapped in colons and adress object's properties via dot-notation. 


**Example Config**

```javascript
const config = {
  cinemas: {
    list: {
      url: 'http://my-cinemas.com/'
    },
    details: {
      url: 'http://my-cinemas.com/locations/:cinema.id:'
    }
  }
}
```


### `:date:` parameter 

In case of cinemas listing showtimes on a html page per day, the `:date` parameter allow to iterate over a number of next days. The framework will make requests to the showtimes page for each date. The date will be formatted using the `urlDateFormat` which needs to be provided next to the url template. The number of days can be configured via `urlDateCount` which defaults to 14. 


**Example Config**

```javascript
const config = {
  cinemas: {
    // …
  }, 
  showtimes: {
    url: 'http://my-cinema.com/showtimes?date=:date:',
    urlDateFormat: 'MM/DD/YYYY'
  }
}
```

**Example Urls**

- http://my-cinema.com/showtimes?date=01/01/2018
- http://my-cinema.com/showtimes?date=01/02/2018
- http://my-cinema.com/showtimes?date=01/03/2018

…
- http://my-cinema.com/showtimes?date=01/13/2018
- http://my-cinema.com/showtimes?date=01/14/2018


### `:page(…):` parameter

This placeholder allows to crawl a static list of pages. 
<br>See <span class="ps-icon ps-icon-wand"></span>[Advanced / Pagination](advanced/pagination.md) for more.
