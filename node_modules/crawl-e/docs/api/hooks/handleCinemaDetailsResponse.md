# ResponseParesr Hook: {docsify-ignore-all}

**`handleCinemaDetailsResponse(response, context, callback)`**

## Description

This hook replaces the entire handling of responses for cinema detail pages including the parsing of such. It should only be used if now data can be parsing with the framework's default parsing functionality at all. This is the case in particular for JSON responses. 

The current cinema as of crawling the list before will provide via `context.cinema`.  

!> Any existing cinema property from list crawling and also returned from the details response will be replaced with the latter.

## Parameters

{{param:[name: response, type: object, description: response from superagent callback]}} 
{{param:[name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object]}}
{{param:[name: callback(error,&nbsp;cinema), type: function, description: In case of success the callback must be called with<br>`null` error parameter and a partial [cinema](/api/cinemas?id=cinema-schema) object.]}}

##  Cinema Schema
{{schema:cinema-schema}} 

!> Pleaes ignore the <span class="symbol tag required">required</span> tag here <span style="color: gray">(as the schema is defined in a centralized file)</span>.

## Return 

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
let config = {
  // … 
  hooks: {
    handleCinemaDetailsResponse: (response, context, callback) => {
      /* Example: 
      let data = JSON.parse(response.text)
      let cinema = {
        address: data['…']
        // …
      }
      callback(null, cinema)
      */
    }
  }
}
```
