# RequestMaker Hook: {docsify-ignore-all}

**`configureRequest(request, context)`**

## Description

This hooks allows for additional configuration of the [superagent](https://github.com/visionmedia/superagent) request before sending it. Check the superagent docs for more details. 

## Parameters
{{params:
name: request, type: object, description: [superagent](https://github.com/visionmedia/superagent) request object
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
}}

## Return 

Must return a new request object.

## Template

```javascript
let config = {
	// … 
	hooks: {
		configureRequest: (request, context) => {
			// update request, e.g.
			// request = request.set('Some-Header', 'foobar')
			// request = request.use(somePlugin)
			// request = request.charset('windows-1252')			
			return request
		}
	}
}
```
