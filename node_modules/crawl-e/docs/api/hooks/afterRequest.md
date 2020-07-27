# RequestMaker Hook: {docsify-ignore-all}

**`afterRequest(request, context, err, response, callback)`**


## Description

This hooks allows to make any arbitrary changes to the response and it's corresponding error. It is useful when html contains bugs or any issues that needs fixes to make it work with [cheerio](https://github.com/cheeriojs/cheerio) to work properly.


## Parameters
{{params:
name: request, type: object, description: [superagent](https://github.com/visionmedia/superagent) request object
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: err, type: object, description: error from superagent callback
name: response, type: object, description: response from superagent callback
name: callback(err, response, context), type: function, description: Callback which must be called with updated err, response and context.
}}

## Return 

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
let config = {
	// … 
	hooks: {
		afterRequest: (request, context, err, response, callback) => {
			// e.g. check error 
			/*
			if (err.status === 404) {
				…
			}
			*/

			// e.g. fix html 
			/*
			response.text = …
			*/

			// e.g. add sth. to the context
			/*
			context.foo = response.headers['foo'] 
			*/

			callback(err, response, context)
		}
	}
}
```