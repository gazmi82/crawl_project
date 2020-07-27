# How to crawl movie pages

This tutorial teaches how to build showtimes crawler for a website that list showtimes on a dedicated page per movie. We will use the https://www.kinolenzburg.ch/ as example for this tutorial. 

!> This tutorial asumes you are familiar with most basics of the Framework. If not, please do the [Single Cinema Tutorial](tutorials/daskino.at.md) first.

## 1. Create a script file

Name it `ch_ch-kinolenzburg.js`, import `CrawlE` and configure the statis cinema.

```javascript
let crawlE = new CrawlE({
  cinemas: [
    {
      name: 'Kino Lenzburg',
      address: 'Bleicherain 8, 5600 Lenzburg',
      website: 'https://www.kinolenzburg.ch/programm/',
      phone: '062 891 25 28'
    }
  ]
})
crawlE.crawl()
```

## 2. Configure a Movies Crawling Config

Typically a configuration for crawling showtimes starts with a [Showtimes Crawling Config](api/showtimes?id=showtimes-crawling-config), `showtimes` entry on the config's root level. For cinemas listing showtimes per movie however, it is required to first get a list of all movie pages and then open each of them to retrieve the showtimes per movie. Therefor the configs must starts with [Movies Crawling Config](api/movies?id=movie-pages), so `movies` entry instead of `showtimes`. 

Crawling movies works similar to dymamically crawling cinemas on chains.  Start by creaing a `movies` config with `list.url` as below.


```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  movies: {
    list: {
      url: 'https://www.kinolenzburg.ch/programm/'
    }
  }
})
crawlE.crawl()
```

**Running the crawler script, it should now log requests the movie list url.**

## 3. Configure parsing of the movies

Next to `url` a list config needs a `box` selector or making out the movies. Along with it configure ValueGrabbers for the movie's properties avaiable on the list level. You find a full list of parsable movie properties [in the API reference](api/movies).

In case of this example the config may look like this: 


```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  movies: {
    list: {
      url: 'https://www.kinolenzburg.ch/programm/',
      box: '.movie-item',
      title: 'a @title',
      href: 'a @href'
    }
  }
})
crawlE.crawl()
```

**Running the crawler with `-v movies` you will now see the movie data.**

## 4. Configure URL for Showtimes Crawling

Now that the crawler knows about the movies, we can proceed with showtimes crawling. The [Showtimes Crawling Config](api/showtimes?id=showtimes-crawling-config) now goes into the movies config, next to the `list`. The framework will run the showtimes crawling for each movie making it available for the showtimes [URL Template](basics/url-templates) and elsewhere.  It can resolve any of the movies properties, however it's most likely to use `:movie.href:` or `:movie.id`. 

```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  movies: {
    list: {
      // …
    },
    showtimes: {
      url: 'https://www.kinolenzburg.ch/:movie.href:'
    }
  }
})
crawlE.crawl()
```

**Running the script after adding the** `movies.showtimes.url` **you will now see logs or requesting the movie pages.**

## 5. Add the Showtimes Parsing Config 

Finally as always the script needs to know how to parse the showtimes from each of the movie pages. The Showtimes Crawling & Parsing Config works just like anywhere else. The only difference it that it runs in the context of a movie. Therefor usually no additional movie handling at this point anymore <span class="footnote">[1]</span>. For the parsing you can start with any entity such as `dates`, `auditoria`, `showtimes` or even `movies` <span class="footnote">(see [1])</span>. In this example the showtimes are listed in conviniente boxes featuring all required properties. Hence we place the [Showtimes Parsing Config](api/showtimes?id=showtimes-parsing-config) directly into the [Showtimes Crawling Config](api/showtimes?id=showtimes-crawling-config). 


```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  movies: {
    list: {
      // …
    },
    showtimes: {
      url: 'https://www.kinolenzburg.ch/:movie.href:'
      showtimes: {
        box: '.timetable table tr',
        date: '.date',
        dateFormat: 'DD. MMMM',
        dateLocale: 'de',
        time: '.time'
      }
    }
  }
})
crawlE.crawl()
```

**Running the final script you see find showtimes in the output file.**


 <p class="footnotes" >
  <span class="row">
    <span class="num-col">[1]</span>
    <span>
      In some cases the movie title may not be given on the page listing movies, but only on the movie page. For example a cinema may only list movie poster images at start. If so it is required to also add a movie parsing layer inside `config.movies.showtimes`. You can treat the whole movie page's html as one movie box. 
    </span>
  </span>
</p>