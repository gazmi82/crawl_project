# How to separate Showtimes for multiple Cinemas on one Page

This two part tutorial teaches how to deal with cinema pages listing multiple cinemas on the same page. Some small business have two venues in the same city and place them next to each other or in some other day on the same page. 

!> This tutorial asumes you are familiar with most basics of the Framework. If not, please do the [Single Cinema Tutorial](tutorials/daskino.at.md) as well as [Movie Pages Tutorial](tutorials/kinolenzburg.ch.md) first.

There are two main ways to approach this, both of which take advantage of Node.js's extensibility.  

?> Please do not forget to read about the [second variant](tutorials/multi-cinema-pages-variant-b.md). 

## Variant A - Filtering upfront

For the first approach we look at http://www.kinolenzburg.ch/ as an example. Checking the [info page](https://www.kinolenzburg.ch/infos/) you can see, they have two venues (*Urban* and *Löwen*), both in the city of Lenzburg, Switzerland. 

### 1. Indentify Properties to filter Showtimes by

Taking a closer look at the cinemas showtime listings, you notice that they are using movie pages, which include the showtimes. Comparing some movies, some list showtimes for the *Urban* venue (indicated by a green `U`) and some for the other venue. In theory they may also mix. 

So it's required to filter showtimes by venue. Further inspecting the indicating HTML node you can see they are either of css class `urban` or `loewen`. So lets add this to strings to each of the cinemas static data. Therefor it's possible to use any arbitrary key that is not reserved by the Framework otherwise, e.g. `showtimesSelector`

The cinemas' config may look like this: 

```javascript
let crawlE = new CrawlE({
  cinemas: [
    {
      id: '1',
      name: 'Kino Lenzburg - Urban',
      address: 'Bleicherain 8, 5600 Lenzburg',
      showtimesSelector: 'urban'
    }, 
    {
      id: '2',
      name: 'Kino Lenzburg - Löwen',
      address: 'Leuengasse 14, 5600 Lenzburg',
      showtimesSelector: 'loewen'
    }
  ]
})
crawlE.crawl()
```

### 2. Filter Showtimes 

Now that we know how to filter the showtimes, the config needs to use those values. The Framework provides the ability to use [Selector Templates](advanced/selector-templates), which are similar to [URL Templates](basics/url-templates). This is where the `showtimesSelector` property comes in. Using it for the showtimes box selectors brings in the magic of filtering. 

On the movie pages each showtime can be addressed with this selector `.timetable table tr`. To add the filter use additional [jQuery Selector](https://api.jquery.com/category/selectors/) functionality combined with Selector Templating. In this examples the table row should include a `span` HTML node with the CSS class indicating cinema. The class shall match the current cinema.  

So the `….showtimes.box` selector becomes `.timetable table tr:has(span.:cinema.showtimesSelector:)`.

Let's pull in the movies and showtimes crawling config as of from the [Movie Pages Tutorial](tutorials/kinolenzburg.ch.md):

```javascript
let crawlE = new CrawlE({
  cinemas: [
    {
      id: '1',
      name: 'Kino Lenzburg - Urban',
      address: 'Bleicherain 8, 5600 Lenzburg',
      showtimesSelector: 'urban'
    }, 
    {
      id: '2',
      name: 'Kino Lenzburg - Löwen',
      address: 'Leuengasse 14, 5600 Lenzburg',
      showtimesSelector: 'loewen'
    }
  ],

  movies: {
    list: {
      url: 'https://www.kinolenzburg.ch/programm/',
      box: '.movie-item',
      title: 'a @title',
      href: 'a @href'
    },
    showtimes: {
      url: 'https://www.kinolenzburg.ch/:movie.href:',
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

**Note, as there are now two cinemas statically configured, the Framework will run the movies and showtimes crawling twice.**

**Compare the results of running the scripts with and without adding** `:has(span.:cinema.showtimesSelector:)` **to the showtimes box selector.**

The output will warn about, which can be ignored. 
  ```
  ⚠️  Found unknown key in crawler config: cinemas.0.showtimesSelector
  ⚠️  Found unknown key in crawler config: cinemas.1.showtimesSelector
  ```

### 3. Clean up Cinemas 

Finally some clean up can be applied to the cinemas. Therefor the [`beforeSave` Hook](api/hooks/beforeSave) allows to manipulate the output data before saving it. Since `showtimesSelector` is only a helper for the showtimes filtering it makes no sense to include it in the output file. Hence it should be removed like this: 

```javascript
let crawlE = new CrawlE({
  cinemas: [
    // …
  ],
  movies: {
    // …
  }, 
  hooks: {
    beforeSave: (data, context) => {
      delete data.cinema.showtimesSelector
      return data
    }
  }
}
```

**Run the script again and check the output file.**

### 4. Final Notes 

This tutorial added an extra property for the sake of filtering showtimes. Well, actually more for the sake of explaining the ability to work with arbitrary extra properties on cinemas. <span class="footnote">[1]</span>

At the point of the tutorial you should have noticed, that the output files are ending with `_1.json` and `_2.json`. As explained [here](basics/output-files) this comes from the cinemas' ids. For the system to process the output files it does not really matter if they are named by numbers or slugs. However, slugs are more human friendly. 

At the same time the value we use to filter the showtimes actually make perfect slugs as well. So these steps can be taken to further simplify the script for this example:  

- rename the key `showtimesSelector` on cinema to `slug`
- update the `showtimes.box` selector template
- remove the `id` keys on both cinemas as they are no longer needed
- remove the `beforeSave` hook <span class="footnote">[2]</span>

 
<p class="footnotes" >
  <span class="row">
    <span class="num-col">[1]</span>
    <span>
      This also works on dynamically crawled cinemas. 
    </span>
  </span>
  <span class="row">
    <span class="num-col">[2]</span>
    <span>
      Since `slug` is a regular property of `cinema` and we dropped `showtimesSelector` it's no longer needed.
    </span>
  </span>
</p>


<br><br><br>

?> Please do not forget to read about the [second variant](tutorials/multi-cinema-pages-variant-b.md). 

<br><br>