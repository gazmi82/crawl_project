# Parsing Tables

Website structuring their showtimes in tables require a special / different approach from the hierarchical box iterations. Tables should have a header row, which e.g. contains a day's date per column. It may also have a header column, which e.g. holds movie title per row. 

!> If a table does not have a header row or it's header row does not contain any necessary data, no table parsing is required. These tables can be parsed using the standard box iteration setup instead where each of the tables row most likey is a showtimes box. 

Below is a list of websites using tables to structure their showtimes in different ways. 

Configuring the framework to parse a table starts by adding `table` entry at the level of the table's occurence on the showtimes website - e.g. inside a movie box or directly on the showtimes page. 

The `table` config requires a `selector` specifying which table to parse, a `headerRow` config, optionally a `headerColumn` config and finally a `cells` config. Tables tend to have some empty cells, which are filtered by the framework before parsing per default. This filter can be replaced with custom logic as explained [here](/api/hooks/tableCellsFilter). 
See the Schema below on which parsing configurations are supported. 

!> To check if a table is parsed correctly the framework as a debug log printing an ascii representation. Run the script with `-v table:ascii`.

In some cases the table may have leading columns or rows. Therfore `headerRow` and and `headerColumn` can be configured with an `offset`, which shifts the beginning of the table parsed area. For excluding trailing rows or columns from parsing corresponding limits can be set on `cells` level. 


## Schema

{{schema:config-schema_showtimes-table-parsing.json,-1}}


## Example for tables with dates inside movie boxes

**Example URL:** http://www.kinobruck.at/Filmprogramm.htm 

```javascript
let config = {
  cinemas: { /* ... */ },
  showtimes: {
    url: 'http://somecinema.com/showtimes',
    movies: {
      box: '…',
      table: {
        headerRow: {
          date: ':box'
          dateFormat: 'DD.MM.YYYY'
        },
        cells: {
          showtimes: {
            box: ':box',
            timeFormat: 'HH:mm'
          }
        }
      }
    }
  }
}
```

#### Example for tables with dates and movies

**Example URL:** http://www.kinobruck.at/Filmprogramm.htm 

```javascript
let config = {
  cinemas: { /* ... */ },
  showtimes: {
    url: 'http://somecinema.com/showtimes',
    table: {
      headerRow: {
        date: ':box',
        dateFormat: 'DD.MM.YYYY'
      },
      headerColumn: {
        movieTitle: ':box'
      },
      cells: {
        showtimes: {
          box: 'a',
          timeFormat: 'HH:mm'
        }
      }
    }
  }
}
```


#### Examples 

| Cinema Showtimes Link                                   | Header Row | Hedaer Column | Cells |
| --------------------------------------------------------|:----------:|:-------------:|:-----:|
|http://www.cinecenter.at/programm                        | days       | -             | times |
|http://www.kinobruck.at/Filmprogramm.htm                 | days       | movies        | times |
|http://www.maxoom.at/spielplan.html                      | times      | dates         | movie |
|http://www.echucaparamount.com/session-times             | days       | movies        | times |
|http://www.atcinemas.com.au                              | days       | -             | times |
|http://www.kino-thun.ch/filme/104571/criminal-squad      | days       | cinema        | times |
|http://www.kiwikinos.ch/winterthur/film/wonder2017/      | days       | -             | times |
|http://www.palazzo.ch/Kino/Kino_aktuell.htm              | days       | -             | times |
|http://www.kinoschaumburg.de/index.php?inc=stadthagen    | days       | -             | times |
|http://www.metrocinema.co.nz                             | days       | -             | times |
|http://upstatefilms.org/now-playing-in-woodstock         | days       | -             | times |