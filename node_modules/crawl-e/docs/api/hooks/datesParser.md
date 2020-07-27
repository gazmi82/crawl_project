# ResponseParesr Hook: {docsify-ignore-all}

**`*.dates.parser(datesContainer, context [, callback])`**

## Description

This hooks replaces the framework's function for parsing dates containers for custom parsing. For example a website may have movie boxes that can be parsed without issues, but the dates inside of them are formatted in a unique way. According to the configuration framework will call the hook for each parent level's box providing already determined data via the context.  

**Regardless of async or sync variant this hook must return an array of dates in one of the following types:**
- date string
- [momentjs](http://momentjs.com/) object
- [JavaScript Date](https://www.w3schools.com/jsref/jsref_obj_date.asp) object

For the variant of date strings, a `dateFormat` (and optionally `dateLocale`) needs to be provided at the same level as the parser. 


## Parameters
{{params:
name: datesContainer, type: object, description: [cheerio element](https://github.com/cheeriojs/cheerio) for the container holding the dates
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(error, &nbsp;dates), optional: true, type: function, description: When supplying a callback this hook will be called asynchronously. In case of success the callback must be called with a `null` error parameter and a dates array.
}}

## Return 

When called synchronously (by omitting the callback argument), it must return an array of dates.

## Template / Example

```javascript
let config = {
  // … 
  showtimes: {
    dates: {
      parser: (datesContainer, context) => {
        // Example: 
        let dates = datesContainer.find('p').text().match(/\d{4}-\d{2}-\d{2}/g)
        return dates
      }
      dateForamt: 'YYYY-MM-DD', // only required as parser returns string array in this example
      showtimes: {
        // …
      }
    }   
  }
}
```


