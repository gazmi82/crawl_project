# How to separate Showtimes for multiple Cinemas on one Page

This two part tutorial teaches how to deal with cinema pages listing multiple cinemas on the same page. Some small business have two venues in the same city and place them next to each other or in some other day on the same page. 

!> This tutorial asumes you are familiar with most basics of the Framework. If not, please do the [Single Cinema Tutorial](tutorials/daskino.at.md) as well as [Movie Pages Tutorial](tutorials/kinolenzburg.ch.md) first.

There are two main ways to approach this, both of which take advantage of Node.js's extensibility. 

!> This second part is rather short and does focus on the core of what it is teach. 

## Variant B – The Auditorium D-Tour


In the [first part](tutorials/multi-cinema-pages-variant-a.md) you learned how to extend the cinemas with custom properties and then use them for filtering showtimes up-front, which means to not parse them in the first place. 

In some cases that might not be the ideal way. It may be to cumbersome or even not feasible at all. 

Another way of solving the problem is to filter showtimes by auditorium in the [`beforeSave` Hook](api/hooks/beforeSave). Therefor first include real or fake auditorium names in each showtime. 

As an example for this tutorial we will use a small swiss chain named "Kiwi Kinos". They list showtimes on a page per city, e.g.  http://kiwikinos.ch/winterthur/programmuebersicht/

The pages are structured in a list of movie boxes, which contain auditoria boxes followed by showtimes. Auditoria are named `Kiwi 5`, `Kiwi 8`, `Logo 1`, `Logo 2` and so on. The word stands for the venue and the number is for the room (the actual auditoria) within the venue. 

By using the Framework's [auditoria box parsing](api/auditoria) feature, we get showtimes `auditorium` included. 

To filter the showtimes in the [`beforeSave` Hook](api/hooks/beforeSave) we need a filter per cinema. That can be as simple as defining a regular expression for each and adding it to the statically configured cinemas, e.g.: `auditoriumFilter: /Kiwi/`.

Finally implement the hook like this. 

```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  showtimes: {
    // …
  }, 
  hooks: {
    beforeSave: (data, context) => {
      if (context.cinema.auditoriumFilter) {
        // filter showtimes
        data.showtimes = data.showtimes.filter(s => context.cinema.auditoriumFilter.test(s.auditorium))
        // clean up extra property on cinema
        delete data.cinema.auditoriumFilter
      }
      return data
    }
  }
}
```

