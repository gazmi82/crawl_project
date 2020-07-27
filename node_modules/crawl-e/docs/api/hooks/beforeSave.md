# General Hook: {docsify-ignore-all}

**`beforeSave(data, context)`**

## Description

This hooks allows to clean up the result data before saving it to the output json file.

## Parameters
{{params:
name: data, type: object, description: output json object
name: context, type: object, description: [Context](/api/hooks/?id=understanding-contexts) object
}}

## Return 

Must return a new output json object.

## Template

```javascript
let config = {
	// … 
	hooks: {
		beforeSave: (data, context) => {
			// e.g. filter showtimes by auditorium in cases of websites listing showtimes for multiple cinemas 
			return data
		}
	}
}
```
