# ResponseParesr Hook: {docsify-ignore-all}

**`*.showtimes.parser(showtimesContainer, context [, callback])`**

## Description

This hooks replaces the framework's function for parsing showtimes containers for custom parsing. For example a website may have movie boxes that can be parsed without issues, but the showtimes inside of them are formatted in a unique way. When configuring the showtimes config properly the framework will call the hook for each movie box providing the movie via the context.  

## Parameters

{{params:
name: showtimesContainer, type: object, description: [cheerio element](https://github.com/cheeriojs/cheerio) for the container holding the showtimes
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(error, &nbsp;showtimes), optional: true, type: function, description: When supplying a callback this hook will be called asynchronously. In case of success the callback must be called with a `null` error parameter and a showtimes array.
}}

## Return 

When called synchronously (by omitting the callback argument), it must return an array of [showtimes](/basics/output-files?id=showtime).  

## Template / Example

```javascript
let config = {
  // … 
  showtimes: {
    url: '…', 
    showtimes: {
      parser: (showtimesContainer, context) => {
        // Example: 
        let formattedShowtimes = showtimesContainer.find('p').html()
        let lines = formattedShowtimes. …

        let showtimes = lines.map(str => {
          // some more parsing …
          return {
            movie_title: context.movie.title,
            start_at: date.format('YYYY-MM-DD') + 'T' + time.format('HH:mm:ss'),
            is_3d: …
          }
        })

        return showtimes
      }
    }
  }
}
```
