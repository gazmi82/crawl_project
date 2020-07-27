# Movies 

## Parsing Config

Configuration for parsing movies inside any context providing in [movies container](basics/terminology?id=container), which typically the top level on a showtimes page. Moive boxes howevery, may also be found on a deeper level in cases such as grouping showtimes by dates first. 

### Config Schema

{{schema:config-schema_movies-parsing}} 


## Crawling Date Pages

In cases of cinemas listing showtimes on movie page additional requests of such pages are required. Therefore add a `movies` config at the config's top level, which speficies a `url` along with Value Grabbers for the movies properties to get all movies first. The showtimes crawling config then goes inside this `movie` config adding a movie to the context of crawling showtimes. To build showtimes urls use placeholders such as `:movie.id:` in the `showtimes.url` tempalte. 

### Movie Page Crawling Schema

{{schema:config-schema_movies-crawling}} 
