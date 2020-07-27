# Showtimes Config

The `showtimes` object appears at two levels in the configuration. The first is the *Showtimes Crawling Config* which defines how to request showtimes pages as well as an entry for parsing the html responses. A second `showtimes` config defines how to parse the actual showtimes in. It's prosition in the overall config depends on the website's structure. 

## Showtimes Crawling Config

Configuration for requesting showtimes pages and parsing them. 

### Config Schema

{{schema:config-schema_showtimes-crawling}} 

## Showtimes Parsing Config

### Config Schema

Configuration for parsing the showtimes with a context, such as movie boxes or date boxes. 

{{schema:config-schema_showtimes-parsing}} 


### Parsing Date and Time

There is quiet a number of ways to configure parsing the `start_at` timestamp of showtimes, which depends on the website's structure. If the showtimes are on a page per day or grouped in date boxes, only the `time` needs to be retrieved from the showtime box as the date will come from the context its found in. If showtimes boxes have a separate box for their `date` and `time` value, e.g. in a table, the framework offers value grabbers accordingly. Finally the showtimes may also be listed with a single string containing both date and time. In those cases a `datetime` value grabber is more appropriated. 

Each of the three value grabbers for `date`, `time` or `datetime` has to come with an accompanying parsing format <span class="footnote">[1]</span> and locale <span class="footnote">[2]</span>. All of the value grabbers can be omited if it would only get the showtime box's text value. The format however is always required. The locale is optional and helps e.g. parsing a date string that includes a weekday. 

<p class="footnotes" >
  <span class="row">
    <span class="num-col">[1]</span>
    <span>
      Date and Time strings are parsed using the [momentjs](http://momentjs.com/) module.<br>
      See here for specs on how to build the parsing formats: https://momentjs.com/docs/#/parsing/string-format/
    </span>
  </span>
  <span class="row">
    <span class="num-col">[2]</span>
    <span>
      The locale needs to be an [ISO 639](http://www.localeplanet.com/icu/iso639.html) code.
    </span>
  </small>
</p>


#### ISO8601 datetime strings

If the website already features a [ISO8601](https://www.cl.cam.ac.uk/~mgk25/iso-time.html) datetime string which can be grabbed via `datetime`, setting `datetimeParsing` to `false` will skip the parsing at all and use the datetime string directly. In that case no `datetimeFormat` is needed.

#### Late night showtimes

By default `start_at` of late night showtimes (meaning midnight or later) get incremented by one day, as websites usually display them in the context of the previous day. If this is not the case set `preserveLateNightShows` property on the showtimes crawling config to `true`, so the framework will keeps the original values.

### Parsing version attributes

Movie screenings are held in a variety of differnt experiences by showing different version of the movies (e.g. 3D or IMAX) or adding other features to the event. Each experience added to a showtime is considered an attribute it. As the list of potentional attributes is arbitrary and may change / grow over time, the framework defindes it an array of strings. When parsing pages attributes may apprear in multiple places, which need to be merged into a single array.

### Parsing `is3d` flags <small style="font-weight: 100">[DEPRECATED]</small> {docsify-ignore}

The framework automatically tests each showtimes `movie_title` if it matches `/3D/i`. 

Many websites however place this information in separate nodes. Therefore it allows to specify a `is3d` [Value Grabber](/basics/value-grabber) which should either return a string that will be checked with the same regular expression or a boolean from the Value Grabber's `mapper` in cases of custom handling. This value grabber can be set on any model's parsing config that might hold the corresponding verion flag node. 

### Parsing `isImax` flags <small style="font-weight: 100">[DEPRECATED]</small> {docsify-ignore}

The framework automatically tests each showtimes `movie_title` if it matches `/IMAX/i`. 

Many websites however place this information in separate nodes. Therefore it allows to specify a `isImax` [Value Grabber](/basics/value-grabber) which should either return a string that will be checked with the same regular expression or a boolean from the Value Grabber's `mapper` in cases of custom handling. This value grabber can be set on any model's parsing config that might hold the corresponding verion flag node. 

### Parsing Booking Links 

In case of the showtimes box being a link (`a`-tag), the framework will automatically pickup the link's `href` as the showtimes booking link. You may override this behaviour by specifying a `bookingLink` [Value Grabber](/basics/value-grabber). 

If the href value is relative link the base url from the requested showtimes page will be prepended. 

**Example:** 
- `href`: `/booking/?event_id=4711`
- showtimes url: `http://somecinema.com/showtimes?date=2018-01-18`
- `booking_link`: `http://somecinema.com/booking/?event_id=4711`.

### Parsing Languages & Subtitles

Each of the different level's boxes may have a `language` Value Grabber which allows to determine the language a movie is shown in. Use the Value Grabber `mapper` function to map the source string to a [ISO 639 language code](http://www.localeplanet.com/icu/iso639.html). If the movie is specified to be shown in orginal without telling which language the `mapper` should return `'original version'`. 

Parsing subtitle languages works similar but the `mapper`'s result needs to be an array of [ISO 639 codes](http://www.localeplanet.com/icu/iso639.html) as some cinemas may actually show movies with two subtitle languages. If it is save to know there are subtitles but not in which language the `mapper` should return `'undetermined'`. 

!> When omitting the `mapper` a default mapping function will be set instead, which handles common language version strings for both `language` and `subtitles`. <br>**Please check JSON result for proper language detection.** <span style="display: block; border-top: 1px solid lightgray; margin: 5px 0;"></span>It is also possible to use the framework's default mapper functions in an enhanced way by calling them from the configured `mapper`. [Read more here](/advanced/language-parsing.md)

### Parsing multiple Showtimes from a single string

Some websites list multiple showtimes simple in a single string, separating them by for example `,` or `<br>`. For this cases no showtimes boxes can be address. Instead the content of a showitmes [container](basics/terminology?id=container) needs to evaluated sightly different. The framework will still select showtimes [boxes](basics/terminology?id=box) first (at least one). If there is no further html nodes to select within the surrounding box, setting the showtimes parsing config's `box` to `':box` will cause the framework to treat the showtimes container as the only showtimes box. To then retrieving multiple showtimes of a single box's content, it only takes a `delimiter` in the showtimes parsing config. Each of the showtimes retrieved from splitting the combined string will be iterated on as a regular showtimes box. This means any data as of the context the showtimes container lives in as well as all showtime box's configured value grabbers are available. The `delimiter` may also be configured as regular expression for more complex cases.


### Parsing Tables

See <span class="ps-icon ps-icon-wand"></span>[Advanced / Table Parsing](advanced/table-parsing.md).