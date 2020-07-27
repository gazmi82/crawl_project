# Parsing websites with multiple showtimes structures

Some cinema's websites use a different layout for publishing their showtimes depending on the context. For example they may have a current playweek in one layout and further upcoming weeks in another. Or they list showtimes for events differently. 

While throughout the docs the [showtimes crawling config](/api/showtimes?id=showtimes-crawling-config) is explained in singular, configured as a single object, it can acutally be configured as array of such. 


## Example 

The [Zoo Palast Berlin](http://www.zoopalast-berlin.de) cinema for example uses two slightly different layouts for listing regular showtimes and events. 

Note how the config defines not a single showtimes crawling config object, but an array of two showtimes crawling configs. Each config is tailored for a specific URL and it's HTML structure.

```javascript
const config = {
  cinemas: { /* ... */ },
  showtimes: [
    { // normal showtimes 
      url: 'http://www.zoopalast-berlin.de/programm/wochenprogramm',
      movies: {
        box: '.tx-spmovies-pi1-listrow',
        title: '.tx-spmovies-pi1-title h2',
        table: {
          { /* ... */ },
        }
      }
    }, 
    { // events 
      url: 'https://www.zoopalast-berlin.de/events/alle-vorstellungen/',
      movies: {
        box: '.tx-spmovies-pi1-listrow',
        title: '.tx-spmovies-pi1-title h2',
        dates: {
          { /* ... */ },
        }
      }
    }
  ]
}
```

