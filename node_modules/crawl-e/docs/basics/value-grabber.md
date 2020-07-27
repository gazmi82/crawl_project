# Value Grabber 

A Value Grabber parses the value of a single entity's property from it's [Box](basics/terminology?id=box) 
<br>using a [Selector](basics/terminology?id=selector), an [Attribute](basics/terminology?id=attribute) and an optional [Mapper](basics/terminology?id=mapper). 


## How it works

1. The framework will first select a [Node](basics/terminology?id=node) using the Value Grabber's selector. 

2. The most simple case is then to use that node's text as the resulting value. In case of the value sitting in an node's attribute (e.g. and link tag's `href`) it can be retrieved from it instead by specifying accordingly.

3. Lastly the retrieved value may need some processing such as replacing or appending a string. Therefor a Mapper function can be provided. The mapper defaults to trimming the grabbed value. 


## Schema

{{schema:value-grabber-extensive-schema}} 

The `mapper` function takes one or two arguments. First is the grabbed 
<span style="white-space:nowrap"><span class="symbol string"></span>&nbsp;<span><code>value</code></span></span>. 
Optionally the second 
<span style="white-space:nowrap"><span class="symbol object"></span>&nbsp;<span><code>[context](/api/hooks/?id=understanding-contexts)</code></span></span>
argument can be handy to access data such as the current requested URL or which cinema is being worked on. 


## Short Handle 

In most cases the ValueGrabber will just need the `selector` and eventually an `attribute`, **but no `mapper` function**. In those cases the framework offers a short cut, which is setting the `selector` and optionally `attribute` combined as a single string. 

The short handle string is parsed from this format: `${selector}[ @${attribute}]`. 

!> Please note the space before `@`.

Please note: In case of requiring a Mapper to process the value, the short handle can not be used. 


### Examples {docsify-ignore}

```javascript
// extensive
title: {
  selector: 'h2'
}
// same as
title: 'h2'
``` 

```javascript
// extensive
bookingLink: {
  selector: '.time a'
  attribute: 'href'
}
// short
bookingLink: '.time a @href'
```

```javascript
// extensive
bookingLink: {
  selector: '.time a'
  attribute: 'href'
  mapper: href => 'http://exmple.com/ + href
}
// short version not possible
```

## Special Keywords

### `:box` Selector 

Set `selector: ':box'` for picking a value of the given box itself

### `ownText()` Attribute

Setting `attribute: 'ownText()'` will read the `text()` of the selected node while excluding any children nodes texts. 


**Example**
Given a box of `<p><span>Language:</span>English</p>`. 
- grabbing `:box` results in `Language:English`
- grabbing `:box @ownText()` results in `English`

### `html()` Attribute
Setting `attribute: 'html()'` will return the selected Node's HTML (including the node itself). *This is most likely only useful in combination with a `mapper` to parse the HTML.*

## Custom Grabbing
For some special cases the Value Grabber's capabilities may not be sufficient. 
<br>See <span class="ps-icon ps-icon-wand"></span>[Advanced / Custom Value Grabbing](advanced/custom-value-grabbing.md).