# How to build Crawlers for a Cinema Chain 

This tutorial teaches how to build showtimes crawler for a cinema chain, using as example http://filmpalast-kino.de. Crawling showtimes for a cinema chain basically works just like for single cinemas, whith an additional step of determining the cinemas first. Hence check the [Single Cinema Tutorial](/#/tutorials/daskino.at) first. 

!> This tutorial reuqires you to be familiar with basics of this framework, such as [Terminology](basics/terminology) and  [Value Grabbers](basics/value-grabber)

## 1. Create a script file

Name it `de_de-filmpalast-kino.js` and import `CrawlE`. 

## 2. Configure the Crawling of Cinemas

Start by adding a `cinemas` object to the config, which must have `list` config and may have an optional `details` config. The first is to get all cinemas from a single web page listing all the chain's venues. For some chains _(including Filmpalast in Germany)_ it is  neccessary to open a separate page for each cinema, to get it's details such as `address`. 

### 2.1. Start `cinemas.list` config

- `list.url` defines the URL listing the cinemas.
- `list.box` is a [jQuery Selector](https://api.jquery.com/category/selectors/) for getting the [cinema boxes](basics/terminology?id=box). 
- Along with `url` and `box` go [Value Grabbers](/basics/value-grabber) for the cinema's properties available on the list page.

```javascript
let crawlE = new CrawlE({
  cinemas: {
    list: {
      url: 'http://www.filmpalast-kino.de/',
      box: 'li a'
    }
  }
})
crawlE.crawl()
```

**Run the crawler script with [debug logs](/basics/debug-logs) for cinemas enabled, e.g. by passing `-v cinemas` and check the outputs:** <br>
It will print `crawl-e:cinemas:selection:count found 14 boxes` followed by outputs of each cinema box <br>e.g. `crawl-e:cinemas:selection:box <a href="http://bautzen.filmpalast-kino.de/">Bautzen</a>`. 

### 2.2. Add Value Grabbers to `cinema.list`

For now it wont find cinemas yet and therefor print `found 0 cinemas`. This is because there are no Value Grabbers for properties in the list config. From the flat list of this example chain, it's possible to get the cinema's city, `slug` and `website`. 

Let's add Value Grabbers for this properties as following: 

```javascript
let crawlE = new CrawlE({
  cinemas: {
    list: {
      url: 'http://www.filmpalast-kino.de/',
      box: 'li a',
      website: '@href',
      slug: {
        selector: ':box',
        attribute: 'href',
        mapper: href => href.replace(/(http:\/\/)|(www)|(filmpalast-kino)|(de)|\/|\./g, '')
      }      
    }
  }
})
crawlE.crawl()
```

The `website` is simply the full `href` value in this example, other chains may use relative links though, which most likely require a mapper. 

The `slug` is extracted from the `href`. 

**Run the crawler with `-v cinemas` or `-v cinemas:result` and check the output.**

### 2.3. Getting missing Cinema Properties from Detail Pages

After getting a list of cinemas some chains (including this example) require to get more properties from detail pages. Therefore we add a `details` config next to the list config. 

The `details` config is similar to the `list`: 

- `details.url` defines the URL to open for each cinemas using the [URL Template placeholders](/basics/url-templates).
- <code style="text-decoration: line-through;">details.box</code> As the details parsing does not interate any list, there is no need for a box selector. 
- Along with `url` go [Value Grabbers](/basics/value-grabber) for the cinema's properties available on the details page.

!> Parsing the same properties again on the details page will override the value from the list on each cinema.

```javascript
let crawlE = new CrawlE({
  cinemas: {
    list: {
      // …
    },
    details: {
      url: ':cinema.website:/kontakt',
      name: '.contact-text-box p b',
      address: {
        selector: '.contact-text-box p:nth-of-type(1)',
        attribute: 'html()', 
        mapper: value => value.split('<br>').slice(1,3).join(', ').trim()
      },
      email: {        
        selector: '.contact-text-box p:nth-of-type(1)',
        mapper: value => value.match(/(E-Mail: )(.*)/)[2].trim()
      },
      location: '#contact-maps iframe @src'
    }
  }
})
crawlE.crawl()
```

The `url` uses the before crawled website of each cinema. 

The `name` is a simple value that's easy to access as defined above. 

The `address` and `email` needs to be extracted from the same formatted string. _Likewise to the `email` the `phone` number should be grabbed as well._ 

The `location` selector addresses a google maps iFrame url. Doing so the Framework will automatically handle parsing the cinema's latitude and longitude. _[Read more here.](/advanced/location-parsing)_

**Run the crawler again with -v cinemas or -v cinemas:result and check the output.**


## 3. Configure the Showtims Crawling

Now that the crawler is able to determine the cinemas of a chain, it needs to crawl the showtimes for each of them. This works just the same as for single cinemas, which is already covered by the [Single Cinema Tutorial](/#/tutorials/daskino.at). Therefore this Tutorial will skip any further explaination about [Showtimes Crawling](/api/showtimes?id=showtimes-crawling-config). 

Us the cinema's properties such as `href`, `slug` or `id` to build [URL Template placeholders](/basics/url-templates) for the showtimes crawling of each cinema. 
