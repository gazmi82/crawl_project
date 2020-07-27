# Parsing for a dates period / range

Some cinema publish in a way of specifying a program period, such as the current playweek, at the top of the page and quoting showtimes to be every days at a certain time. 

To parse such showtimes the framework provides two features to be used in combination. 

## 1. Parsing the Period

The special `periods` parsing level allows to parse a single or multiple periods on a page. The latter required boxes of periods to be selected, which defaults to the HTML body. The core is the `datesParser` [Value Grabber](/basics/value-grabber) for parsing a list of dates covering the period. 

Other than usually this Value Grabber must return an array of dates in one of the following types:

- date string
- [momentjs](http://momentjs.com/) object
- [JavaScript Date](https://www.w3schools.com/jsref/jsref_obj_date.asp) object

For the variant of date strings, a `dateFormat` (and optionally `dateLocale`) needs to be provided at the same level as the parser. 

The framework will make the list of dates as [momentjs](http://momentjs.com/) objects available via the [Context](/api/hooks/?id=understanding-contexts) for later use at any point. 

?> For the implemenation the [`parseDates`](/api/utils/parseDates) utility function should come in handy in most cases. 

## 2. Working with the Period 

Once parsed the list of dates is made avaiable in the [Context](/api/hooks/?id=understanding-contexts). In the case of showtimes quoted to be shown *every day* the [`dates parser`](/api/hooks/datesParser) can be used to detect `"every day"` and return the dates from context as shown in the example below. 

Another case is a page having a play period of 1 week from Thursday to the next Wednesday and a tables for showtimes just displaying the weekdays at the header row. In such cases weekdays (or even table column index) can be mapped to the index of the period's dates. 


## Examples
```javascript
let config = {
  // … 
  showtimes: {
    period: {
      box: 'body',
      datesParser: {
        selector: 'h2:first', 
        mapper: text => CrawlE.Utils.parseDates(text, {
          dateFormat: 'DD.MM.YYYY',
          rangeSeparator: 'bis'
        })
      },
      dates: {
        parser: (datesContainer, context) => {
          let text = datesContainer.find('p').text()
          if (/every day/.test(text)) {
            return context.period
          }
          // else parse otherwise        
          return []
        }
        showtimes: {
          // …
        }
      }   
    }    
  }
}
```


