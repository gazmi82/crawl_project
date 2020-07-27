# ResponseParesr Hook: {docsify-ignore-all}

**`handleCinemasResponse(response, context, callback)`**

## Description

This hook replaces the entire handling of responses for cinema list pages including the parsing of such. It should only be used if now data can be parsing with the framework's default parsing functionality at all. This is the case in particular for JSON responses. 

## Parameters
{{params:
name: response, type: object, description: response from [superagent](https://github.com/visionmedia/superagent) callback
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(error,&nbsp;cinemas), type: function, description: In case of success the callback must be called with<br>`null` error parameter and a [cinemas](/api/cinemas?id=cinema-schema) array.
}}

##  Cinema Schema
{{schema:cinema-schema}} 

## Return 

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
let config = {
  // … 
  hooks: {
    handleCinemasResponse: (response, context, callback) => {
      /* Example: 
      let data = JSON.parse(response.text)
      let cinemas = data.map(…)
      callback(null, cinemas)
      */
    }
  }
}
```
