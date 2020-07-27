# `forEach` control flow config

Configuration for iterating over an arbitrary list of boxes. There is no parsing of data involved with this config level. It single purpose is to add extra iteration around some level. 

**Examples** 
- `showtimes page` > `movies` > **`forEach`** > `table`
- `showtimes page` > `movies` > **`forEach`** > `dates` > `showtimes`

## Config Schema

{{schema:config-schema_forEach-parsing}} 