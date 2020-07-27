# General Hook: {docsify-ignore-all}

**`buildFilename(cinema, crawlerId, context)`**

## Description

This hooks allows to override the default pattern for building output filenames. It must return an alternative filename including file extension, which should be `.json`. 

## Parameters

{{params:
name: cinema, type: object, description: [Cinema](/api/cinemas?id=cinema-schema) object
name: crawlerId, type: string, description: the crawler's id
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
}}

##  Cinema Schema
{{schema:cinema-schema}} 

## Return 

Must return a the output filename for the given cinema including `.json` file extension.

## Template

```javascript
/* Example:
const urlToFilename = require('some-helper-function')
*/
let config = {
	// … 
	hooks: {
		buildFilename: (cinema, crawlerId) => {
			/* Example: 
			return urlToFilename(cinema.website) + '.json'
			*/
		}
	}
}
```
