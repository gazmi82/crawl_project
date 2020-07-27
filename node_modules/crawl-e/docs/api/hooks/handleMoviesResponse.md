# ResponseParesr Hook: {docsify-ignore-all}

**`handleMoviesResponse(response, context, callback)`**

## Description

This hook replaces the entire handling of responses for movie list pages including the parsing of such. It should only be used if now data can be parsing with the framework's default parsing functionality at all. This is the case in particular for JSON responses. 

## Parameters
{{params:
name: response, type: object, description: response from [superagent](https://github.com/visionmedia/superagent) callback
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(error,&nbsp;movies), type: function, description: n case of success the callback must be called with<br>`null` error parameter and a movies array of `Movie`.
}}

##  Movie Schema
{{schema:movie-schema}} 

## Return 

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
let config = {
  // … 
  hooks: {
    handleMoviesResponse: (response, context, callback) => {
      /* Example: 
      let data = JSON.parse(response.text)
      let movies = data.map(…)
      callback(null, movies)
      */
    }
  }
}
```
