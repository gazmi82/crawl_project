# Versions parsing config

Configuration for parsing versions inside any context providing in [version container](basics/terminology?id=container). 

!> While generally box parsing configs can be combined in arbitrary combinations, version boxes are assumed to only be found at any level inside movies. 

**Examples** 
- `showtimes page` > `movies` > **`versions`** > `showtimes`
- `movie page` > **`versions`** > `showtimes`

## Config Schema

{{schema:config-schema_versions-parsing}} 