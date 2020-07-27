# Terminology

## General

### Node

Refers to a HTML DOM Element or JSON node of any type and complexity. 

### Box

A box refers to a DOM or JSON node that contains data of a single item, where an item for example is a cinema, movie, or showtime. Typically there are many boxes in some kind of a list or collection.

Examples: `cinemaBox`, `movieBox`, `versionBox`, `dateBox`, `showtimeBox`

### Container

A container refers to a DOM or JSON node that contains boxes at an arbitrary child level. 

For instance a `showtimesContainer` refers to a node that has `showtimeBox` nodes in it's subtree. A `showtimesContainer` can be a `movieBox`, a `versionBox` or a `dateBox`.  

## Config

### Selector
  
A selector is used to select / address a DOM or JSON node. It is set as [jQuery Selector](https://api.jquery.com/category/selectors/) string.

Examples: `cinemaBoxSelector`, `cinemaNameSelector`, `movieBoxSelector`, `movieTitleSelector`
    
### Attribute

An attribute defines from which HTML attribue of a DOM node a given value is picket. Usuall defaults to the DOM node's text. 

Examples: `cinemaNameAttribute`, `movieTitleAttribute`

### Mapper
    
A mapper is a function that can optionally be configure for post-processing the previously selector value.
It occasionally may also do parsing work, but only within the scope of a pre-selected node. 

For instance a `movieTitleTransformer` may clean age limit certifications from a movie title string, that was selected by `movieTitleSelector` & `movieTitleAttribute`.

### Parser

A parser is a function that get's called with previous fetched data for custom parsing of the given data. Usually it overrides or extends default behaviour of the ulitmate crawler. 

Example: `showtimesResponseParser` *(replaces default parsing of the showtimes page's html)*


