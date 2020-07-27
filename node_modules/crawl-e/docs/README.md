# CRAWL·E 

> Movie Showtimes Crawler Framework by CINEPASS / [iShowtimes](http://internationalshowtimes.com).

Version: **{{package:version}}**

Last Update: **{{package:lastModified}}**

## 💪 Get Started 

- Read the Basics to learn about [Terminology](basics/terminology) and concepts of the framework. 
- [Setup your project ](quickstart?id=project-setup) 

## ⚠️ Known Issues

- Table Parsing does not work if tables contain further tables inside their cells. 

## 🛠 Change Log

**v0.5.0 *| 2020-07-22***

- Opening up then Framework to allow building custom arbitrary crawler scripts  
  - <i class="ps-icon ps-icon-book"></i> [My first Custom Crawler Script](/tutorials/my-first-custom-crawler-script.md) 
  - <i class="ps-icon ps-icon-lab"></i> <a href="/typedocs">Type Docs</a>
- Added Support for Jira Issue List → `config.crawler.jira_issues`
- Added [Detecting Temporarily Closed Cinemas](advanced/is-temporarily-closed.md)
- Improved [`Utils.parseDates()`](api/utils/parseDates)

**v0.4.0 *| 2019-04-10***

- Added [Pagination support](/advanced/pagination)
- [Table Parsing](/advanced/table-parsing) 
  - Add debug logging of Ascii-Tables
  - Add option to limit number of rows or columns to parse
- Added new parsing of version attributes
- Added ability to debug log only counts of selected boxes
- Added [Tabs Parsing](/advanced/tabs-parsing)

**v0.3.0 *| 2018-11-29***

- Added live demos for [Utility Functions](/api/utils/)
- Added automatic detection of day after tomorrow
- Added automatic correction of dates when parsing next year's dates in formats without year
- Some color improvements for printing logs
- New Utility Functions:
  - [`matchLanguage()`](/api/utils/languageMappers?id=matchLanguage)
  - [`matchSubtitles()`](/api/utils/languageMappers?id=matchSubtitles)

**v0.2.0 *| 2018-08-22***

- [Simplified Table Parsing Config](/api/showtimes?id=parsing-tables)
- [Table Cell Filter](/api/hooks/tableCellsFilter)
- Added current cell reference to [Context](/api/hooks/?id=understanding-contexts)
- [forEach iteration level](/api/forEach)
- [Custom Dates Parser Hook](/api/hooks/datesParser)
- [parseDate Utils function](/api/utils/parseDates)
- [Period Parsing](/advanced/period-parsing)
- Added language parsing to [versions level](/api/versions) 
- Added dynamic parsing of [date pages](/api/dates?id=crawling-date-pages)
- [Accepted Warnings](/advanced/accepted-warnings)
- Replaced [Custom Showtimes Parser Hook](/api/hooks/showtimesParser)
- Improved rendering of API reference 

**v0.1.0 *| 2018-04-18***

- *only the wise and old might still remember what was possible in such early days*

**v0.0.0 *| 2017-12-20***

- *once started with a first commit ... it was yet a long journey ahead*