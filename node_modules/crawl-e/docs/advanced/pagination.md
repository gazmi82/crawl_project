# Pagination 

The framework support two methods of pagination. 

## Static pages 

Using the `:page(…):` placeholder a fixed list of pages can be crawled via [URL templates](/basics/url-templates). The pages to crawl are specified in a javascript function call fashon. 

#### Numeric Range {docsify-ignore}

In parenthese provide a range of integers from first to last page. 

**Example Config**

```javascript
const config = {
  cinemas: {
    // …
  }, 
  showtimes: {
    url: 'http://my-cinema.com/showtimes?page=:page(0,2):'
  }
}
```

**Example Urls**

- http://my-cinema.com/showtimes?page=0
- http://my-cinema.com/showtimes?page=1
- http://my-cinema.com/showtimes?page=2


#### Static Values {docsify-ignore}

It is also possible to defined a static list of pages, but passing a comma separated list of values wrapped in brackets.

**Example Config**

```javascript
const config = {
  cinemas: {
    // …
  }, 
  showtimes: {
    url: 'http://my-cinema.com/movies/:page([now-playing,upcoming]):',
  }
}
```

**Example Urls**

- http://my-cinema.com/movies/now-playing
- http://my-cinema.com/movies/upcoming


## Dynamic Pagination

Dynamic Pagination works by grabbing a url for the next page. The will be parsed from a current list's page. The framework will open next page until none if found anymore. The index of the current pages crawled of a list is accessable via the [Context](/api/hooks/?id=understanding-contexts). 

**Example Config**

```javascript
const config = {
  cinemas: {
    list: {
      url: 'http://my-cinema.com/cinemas',
      nextPage: 'a:contains("Next Page") @href',
      box: '.cinema',
      name: 'h2'
    }
  }
}
```

**Example Urls**

- http://my-cinema.com/cinemas
- http://my-cinema.com/cinemas?page=1
