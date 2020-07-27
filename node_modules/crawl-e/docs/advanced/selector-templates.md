# Selector Templates 

Similar to [URL Templates](basics/url-templates), [Box](basics/terminology?id=box) selectors may also contain placeholders addressing placesholders addressing values from the [Context](http://crawl-e.internal.cinepass.de/#/api/hooks/?id=understanding-contexts). Placeholders are wrapped in colons and address object's properties via dot-notation.

**Examples**

Some small independent cinemas actually have two locations listing their showtimes on the same page. Therefore it can be helpful to filter showtimes by the cinema's name, id, slug or even a complete custom property defined just for this job. 

- Using the cinema's name in a box selcotor: 
  
  `box: 'div:contains(":cinema.name:")'`

- Using the a custom property: 
  
  `box: ':cinema.showtimesSelector:'`
