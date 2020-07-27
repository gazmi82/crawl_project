# ResponseParesr Hook: {docsify-ignore-all}

**`handleDatesResponse(response, context, callback)`**

## Description

This hook replaces the entire handling of responses for date list pages including the parsing of such. It should only be used if now data can be parsing with the framework's default parsing functionality at all. This is the case in particular for JSON responses. 

## Parameters
{{params:
name: response, type: object, description: response from [superagent](https://github.com/visionmedia/superagent) callback
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(error,&nbsp;datePages), type: function, description: In case of success the callback must be called with<br>`null` error parameter and a datePages array of `DatePage`.
}}

### Date Page Schema 
{{schema:datepage-schema}}

## Return 

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
let config = {
  // … 
  hooks: {
    handleDatesResponse: (response, context, callback) => {
      // Example: 
      let data = JSON.parse(response.text)
      let datePages = data.map(item => ({
        date: moment(item.foo, 'DateFormat'),
        href: item.bar
      }))
      callback(null, datePages)
    }
  }
}
```
