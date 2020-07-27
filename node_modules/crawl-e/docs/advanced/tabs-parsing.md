# Parsing Tabs

Tabs are commonly used to structure showtimes grouped by dates or versions. The HTML structure consists of a list of tabs or buttons that have corresponding ids to content containers. By clicking on a tab, only the container with the corresponding tab id will become visible. The framework refers to the content containers of each tabs as cards.

Configuring the framework to parse a tabs starts by adding `tabs` entry at the level of the tabs occurence on the showtimes website - e.g. inside a movie box or directly on the showtimes page. 


As off the html structure of tabs the `tabs` config requires to parts. 

First the `buttons` subconfig to find all tabs. It has a special [Value Grabber](/basics/value-grabber) to get an identifier which connects each tab's button with it's card. From each tab button the framework can parse additional data, such as the date from the title. 

Secondly the `cards`subconfig defines which containers to parse for each tab. Data parsing from the buttons will be available via the context. The identifier grabbed from the buttons lives in `context.tab.id` and also available as [`:tabId:` placeholder](/advanced/selector-templates) for the card's box [selector](basics/terminology?id=selector). 

To continue parsing the `cards` configs takes another parsing config for the correspoding type of data. 



## Schema

{{schema:config-schema_tabs-parsing.json,-2}}



## Example
```javascript
const config = {
  // …
  showtimes: {
    url: '…',
    tabs: {
      buttons: {
        box: '.tab-button',
        id: {
          selector: 'a',
          attribute: 'href',
          mapper: href => href.replace('#', '')
        },
        date: ':box',
        dateFormat: '…',
      },
      cards: {
        box: '#:tabId:',
        showtimes: {
          // … 
        }
      }
    }
  }
}
```