# Dates 

## Parsing config



Configuration for parsing dates inside any context providing in [dates container](basics/terminology?id=container). 

**Examples** 
- `showtimes page` > `movies` > **`dates`** > `showtimes`
- `showtimes page` > **`dates`** > `movies` > `showtimes`
- `movie page` > **`dates`** > `showtimes`

### Parsing Config Schema

{{schema:config-schema_dates-parsing}} 


## Crawling Date Pages

Some cinemas publish showtimes on a page per date. The framework will request those pages one by one. There are two ways of determining those urls. 

- simple iteration of dates using the [`:date:` url placeholder](basics/url-templates?id=date-parameter)
- dynamic crawling of dates as a preparing step

!> Either way, the current date will be available in the [Context](/api/hooks/?id=understanding-contexts) for later use in hooks or internally. 

For the latter case, add a `dates` config at the config's top level, which speficies a `url` along with Value Grabbers and parsing config to get all dates first. The showtimes crawling config then goes inside this `dates` config. To build showtimes urls use the `:dateHref:` placeholder in the `showtimes.url` tempalte. 

### Dates Crawling Config Schema

{{schema:config-schema_dates-crawling}} 

