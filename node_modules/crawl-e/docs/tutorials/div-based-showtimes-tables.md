# How to parse showtimes from `<div>`-based tables

Since there are [good reasons](https://www.google.com/search?q=html+table+vs+div) to use use `<div>`s over `<table>`s many cinema website's developers choose to do so for formatting showtimes. 

The framework though, only supports to parse tables from actual html `<table>`s. However, that does not mean there is no way of parsing `<div>` based tables as well, as you will learn in this tutorial. 

In order to use the [tables parsing feature](api/showtimes?id=showtimes-parsing-config), we can utilize the [`afterRequest` hook](api/hooks/afterRequest) to do a simple but powerful manipulation to the html. All it takes is to turn each `<div>` based table into an actual html `<table>`.

<br> <!-- add some extra space -->

[Kiwi Kinos](http://www.kiwikinos.ch/) in Switzerland for example lists showtimes in table made of divs. 

Developing this crawler start as usual by configuring the cinemas and showtimes url, e.g. http://www.kiwikinos.ch/winterthur/programmuebersicht/. 

As you can see showtimes are grouped in movie boxes in this example. The showtimes tables structure we are after is wrapped in yet anohter container inside the movie boxes, which can be address with the `.div.progmain` selector. To get the desired `<table>` the following `<div>`s need to be changed as following: 

**Table:** 

`<div class="progmain_shift" … >` → `<table class="progmain_shift" … >`

**Rows:**

`<div class="progdays">`  → `<tr class="progdays">` 

`<div class="progline">`  → `<tr class="progline">`

**Cells:**

`<div class="progitem">`  → `<td class="progitem">`

<br> <!-- add some extra space -->

Keep in mind that also the closing `</div>` tags need to be replaced to not break the HTML. Hence we use [cheerio](https://github.com/cheeriojs/cheerio) to implement it rather then trying to mess with regex for instance.

Implementing the HTML manipulation requires a bit of coding and looks like this: 

```javascript
const config = {
  cinemas: [ /* … not relevant for the sake of this tutorial … */ ],
  showtimes: { /* … see below … */ },

  hooks: {
    afterRequest: (request, context, err, response, callback) => {
      let $ = cheerio.load(response.text)

      let replaceTags = (node, selector, newTag) => {
        $(node).find(selector).each((i, item) => {
          $(item).replaceWith($($.html(item).replace(new RegExp(item.tagName, 'g'), newTag)))
        })
      }

      let showtimesContainers = $('div.progmain')
      showtimesContainers.each((index, container) => {
        replaceTags(container, '.progitem', 'td')
        replaceTags(container, '.progline,.progdays', 'tr')
        replaceTags(container, '.progmain_shift', 'table')
      })

      response.text = $.html()

      callback(err, response, context)
    }
  }
}
// …
```

<br> <!-- add some extra space -->

Now that the `afterRequest` translated all of the showtimes `<div>` table into actualy `<table>`s, they can be parsed as following in the case of this example. 


```javascript
const config = {
  cinemas: [ /* … not relevant for the sake of this tutorial … */ ],

  showtimes: {
    url: 'http://www.kiwikinos.ch/winterthur/programmuebersicht/',
    movies: {
      box: '.filmoverview article',
      title: 'header',
      table: {
        selector: '.progmain_shift',
        headerRow: {
          date: {
            dateFormat: 'dd DD.MM.'
          }
        },
        cells: {
          showtimes: {
            box: 'a',
            timeFormat: 'HH:mm'
          }
        }
      }
    }
  },

  hooks: { /* … see above … */ }
}
// …
```