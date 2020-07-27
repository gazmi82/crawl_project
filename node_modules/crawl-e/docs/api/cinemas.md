# Cinemas Config 

Cinemas can be either be set staticly as a hardcoded list or configured to be crawled dynamically. 

## Static List

For a hardcoded list of cinemas simply provide an array of cinemas as in the following example. 

### Example

```javascript
const config = {
  // …
  cinemas: [
    {
      name: 'Zoopalast Berlin',
      address: 'Hardenberg Straße 29a, 10623 Berlin',
      lat: 52.5059,
      lon: 13.3311
    }
    // …
  ]
  // …
}
```


### Cinema Schema

{{schema:cinema-schema}} 


## Dynamic Cinemas 

For larger sites cinemas should always be scraped dynamically. Therefor a `list` object provides configuration on how to retrieve all cinemas from a single or multiple pages. 

If needed details can be fetched from a dedicated page per cinema. Doing so all properties defined on both list and details level will override from the latter. Any properties fetch from the list can by used for building the details URL from a template. 

**Example:** `http://my-cinemas.com/locations/:cinema.id:`

### Config Schema

{{schema:config-schema_cinemas-dynamic,0}}

### Specialties

#### Cinema's geo location

Cinemas include their geo location appearing in all kinds of different formats on their websites. There for the framework come with a number of supported cases which get handled automatically. It is only required to point to the part holding the geo location and the framework will do it's magic. See [`parseMapsUrl`](api/utils/parseMapsUrl) utility function for more. 

**Supported cases**
- Google Maps iFrame 
- Google Maps Link 
- Bing Maps Link 
- JavaScript code snippet


In case of unsupported cases however, it is still possible to provide custom parsing. Either using [Custom Value Gabbing](/advanced/custom-value-grabbing) or with a custom mapper function. In both cases it must return an object with the following structure. 

**Location Schema**
{{params:
name: lat, type: number, description: latitude of the cinemas geo location
name: lon, type: number, description: longitude of the cinemas geo location
}}


#### City Pages

Some large cinemas chains group cinemas on a yet another higher level such as cities or states in the US. While this could be covered by configuring not just a single cinema list url but array (see `cinemas.list.urls`) the framework actually supports crawling this array from a page listing all cities automatically. 
 
### Example 

```javascript
const config = {
    // …
  cinemas: {
    cities: {
      list: {
        url: 'https://www.amctheatres.com/movie-theatres',
        box: '#tabs-tabs-pane-0 ul.LinkList li', 
        name: 'a',
        id: 'a @href'
      }
    },
    list: {
      url: 'https://www.amctheatres.com/movie-theatres/:city.id:',
      box: '.PanelList-item-center',
      name: 'h3 span',
      id: {
        selector: 'h3 a',
        attribute: 'href',
        transformer: href => href.split('/').reverse()[0]
      }
    },    
    details: {
      url: 'https://www.amctheatres.com/movie-theatres/:city.id:/:cinema.slug:',
      address: '.TheatreInfo-address span span',
      location: '.TheatreFinder-links a:nth-of-type(2)'
    }

  }
  // …
}
```

