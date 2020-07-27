# Post Requests 

To send POST requests instead of GET all it needs it so provide a `postData` entry next to the request's `url`. 

`postData` may be either an JSON object or a string, where both can by configured with the same placeholder parameters as the [url templates](/basics/url-templates). 

## Example

```javascript
const config = {
  // … 
  showtimes: {
    url: 'http://somecinema.com/api/showtimes'
    urlDateFormat: 'YYYY-MM-DD',
    postData: {
      date: ':date:'
    }
  }
}
```
