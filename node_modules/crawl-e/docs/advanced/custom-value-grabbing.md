# Custom Value Grabbing

A [Value Grabber](/basics/value-grabber) parses the value of a single entity's property from it's [Box](basics/terminology?id=box). 

The Frameworks default implemntation uses [cheerio](https://github.com/cheeriojs/cheerio) functionality, which is a powerful html markup parser. 

The `ValueGrabber` already get an item's box passed as cheerio element from it the framework `ResponseParser`. By overriding the default grabbing it is possible to take advantage of [cheerio's](https://github.com/cheeriojs/cheerio) full parsing capabilities. 

!> **Only use custom value grabbing if you fail to define a default value grabbing.**<br>&bull; If you find yourself looking to grab value from outside a box's scope, please check the box selection first. <br>&bull; Also double check about using the `ValueGrabber`'s [special keywords](basics/value-grabber?id=special-keywords). 



## Parameters

The cusotm grabber function takes one or two arguments. First is the box to grab from. Optionally the second context argument can be handy to access data such as the current requested URL or which cinema is being worked on.

<p class="api-reference-row"><span><span class="symbol object"></span></span><span><code>box</code></span><span><span class="devider"></span></span><span><span>[cheerio element](https://github.com/cheeriojs/cheerio) for the box container holding the item<br></span></span></p>

<p class="api-reference-row"><span><span class="symbol object"></span></span><span><code>context</code></span><span><span class="devider"></span></span><span><span>[Context](/api/hooks/?id=understanding-contexts) object<br></span></span></p>



## Example {docsify-ignore}

For example the page listing events of the [Zoopalast Berlin](https://www.zoopalast-berlin.de/events/alle-vorstellungen) cinema has alternating rows of dates and showtimes at the same level. So it's no possible to select boxes that would bundle the showtimes with their belonging date. To work around the config first selected the boxes containing the showtimes for daten even though they do not include the dates values. Then custom value grabbing solves the issues levaraging [cheerio's `prev()` function](https://github.com/cheeriojs/cheerio#prevselector) to reach the value in the dates box's child node.

```javascript
let config = {
  cinemas: { /* ... */ },
  showtimes: { 
    url: 'https://www.zoopalast-berlin.de/events/alle-vorstellungen/',
    movies: {
      box: '.tx-spmovies-pi1-listrow',
      title: '.tx-spmovies-pi1-title h2',
      dates: {
        box: '.MovieDates',

        //  Custom Value Grabbing
        date: box => box.prev().text().match(/\d{1,2}\.\d{1,2}\.\d{1,2}/)[0],  

        dateFormat: 'DD.MM.YY',
        auditoria: {
          box: ':box',
          auditorium: '.screen @ownText()',
          showtimes: {
            box: '.time a'
          }
        }, 
      }
    }
  }
}
```