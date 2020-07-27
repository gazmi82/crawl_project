# `parseMapsUrl` Utilty function {docsify-ignore-all}

```typescript
/**
 * Parses a google, bing or apple maps url for latitude and longitude. 
 * @param url an url string for either of the above listed maps services
 * @returns an location object or `null` if failed to parse the given url 
 */
function parseMapsUrl(url: string) => {lat: number, lon: number} | null
```

{{demo:parseMapsUrl}}


