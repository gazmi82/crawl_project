# General Hook: {docsify-ignore-all}

**`beforeCrawling(context, callback)`**

## Description

This hooks allows to prepare anything before starting the crawling. As it is executed asynchronously it also allows making requests.

Any results of preparation work can be saved into the provided [`context`](/api/hooks/?id=understanding-contexts) object and accessed in other hooks later on, as the [Context](/api/hooks/?id=understanding-contexts) gets passed arround during the crawler execution.


## Parameters
{{params:
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
name: callback(err), type: function, description: In case of success the callback must be called with a `null` error parameter. <br>If crucial perpartion work failed, the callback should be given an error to cancel the crawling at all.
}}

## Examples Use Cases

- Building cookies and set them into the context to access them later it in other hooks such as [`configureRequest`](/api/hooks/configureRequest)
- Crawling special data from pages or the covered website upfront
- Requesting data from other Rest-APIs upfront


## Return

*Since this hook is an asynchronous function it does not return anything.*

## Template

```javascript
const config = {
	// …
	hooks: {
		beforeCrawling: (context, callback) => {
      // asyncTask((err, result) => {
      //   context.foo = result.bar
      //   callback(err)
      // })
		}
	}
}
```
