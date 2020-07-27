# ResponseParesr Hook: {docsify-ignore-all}

**`handleShowtimesResponse(response, context, callback)`**

## Description

This hook replaces the entire handling of responses for showtimes pages including the parsing of such. It should only be used if now data can be parsing with the framework's default parsing functionality at all. This is the case in particular for JSON responses. 

In case of working with movie pages, the `context` will provide the before parsed movie. 

## Parameters
{{params:
name: response, type: object, description: response from [superagent](https://github.com/visionmedia/superagent) callback
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(error, showtimes), type: function, description: In case of success the callback must be called with<br>`null` error parameter and a [showtimes](/basics/output-files?id=showtime) array.
}}

## Return 

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
let config = {
  // … 
  hooks: {
    handleShowtimesResponse: (response, context, callback) => {
      /* Example: 
      let data = JSON.parse(response.text)
      let showtimes = data.map(…)
      callback(null, showtimes)
      */
    }
  }
}
```
