# How to build a single cinema crawler

This tutorial teaches how to build showtimes crawler for a simple website listing showtimes for a single cinema using as example http://www.kino-gmunden.at/.

First setup the project as described in [here](/quickstart?id=project-setup) and read the [Terminology basics](basics/terminology).

## 1. Create a script file

Name it `at_at-kino-gmunden.js` and import `CrawlE`.


## 2. Configure the cinema

Since the crawler covers only one cinemas it's not worth putting in any development effort into crawling it's data. Instead simply hard code it as following:

```javascript
let crawlE = new CrawlE({
  cinemas: [
    {
      name: 'Kino Gmunden',
      address: 'Theatergasse 7, 4810 Gmunden',
      website: 'http://www.kino-gmunden.at/',
      phone: '0676 / 88 794 505'
    }
  ]
})
crawlE.crawl()
```

Running the script should print a log message: `found 1 cinemas`.

?> Running the script with either addional environment variable `DEBUG=*` or appending `-v` prints the configured cinema. [Learn about debug logs](/basics/debug-logs).

## 3. Configure the showtimes crawling

### Showtimes URL Template

The example cinema lists showtimes daily. This means one request per date is required. To achieve this use the [`date` paramerer](basics/url-templates?id=date-parameter) in the URL template along with a date format.


Add a `showtimes` object on the same level as `cinemas` and set the url template and it's date format for the pages listing showtimes.

```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  showtimes: {
    url: 'http://www.kino-gmunden.at/?page_id=55&dt=:date:&page=-1',
    urlDateFormat: 'DD-MM-YYYY'
  }
}
crawlE.crawl()
```

Running the crawler script, it should now log requests to the showtimes urls of the next 14 days one by one.

### Parsing Movies

For parsing the showtimes the configuration is structured according to the source website. In case of this example website is structured using a HTML sections which has data for each movie. So we start by grabbing those sections.

First add only the `box` selector (as below) and check the script logs messages like `CrawlE:selection:movies:count found 7 boxes` for each day. Then add a selector for the title and check the `movies:result` logs.

```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  showtimes: {
    url: 'http://www.kino-gmunden.at/?page_id=55&dt=:date:&page=-1',
    urlDateFormat: 'DD-MM-YYYY',
    movies: {
      box: '.overview',
      title: 'h1',
    }
  }
})
crawlE.crawl()
```

### Parsing Showtimes

Next for getting the showtimes the framework will search for showtime boxes within a showtimes container. In case of this example each movie box also is a showtimes container. Reflecting this website's structure in the configuration add a 2nd `showtimes` config inside the `movies` config. It always needs a `box` selector. Thanks to the simlicity of this example no further configuration other than the datetimeFormat is required. The framework automatically uses the showtimes box's text as time string unless configured elsewise. The date of the is pulled from the context of iterating over them as described above. Both these values get combined into each showtime's `start_at` property.

```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  showtimes: {
    url: 'http://www.kino-gmunden.at/?page_id=55&dt=:date:&page=-1',
    urlDateFormat: 'DD-MM-YYYY',
    movies: {
      box: '.overview',
      title: 'h1',
      showtimes: {
        box: '.time',
        datetimeFormat: 'DD-MM-YYYY - HH:mm'
      }
    }
  }
})
crawlE.crawl()
```

Run the script again and check the outputs.