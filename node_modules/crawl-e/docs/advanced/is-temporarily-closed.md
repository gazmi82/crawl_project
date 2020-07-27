# Temporarily Closed Parsing

As cinemas might be closed temporarily the will not have showtimes. In order to distinguish having no showtimes on purpose vs. due to a crawler script not working any more, the framework support explicit crawling / checking whether a cinema or chain is closed. 

There are three ways of doing so. Each builds on top of the `isTemporarilyClosed` flag of the [Context](/api/hooks/?id=understanding-contex). If the flag is set to `true` right before saving the output file, the framework will set add the according `is_temporarily_closed: true` property to the cinema. 

## Crawling it per Script / global

The easiest way to implemented the check on a per script basis, via the `isTemporarilyClosed` crawling configuration. 
When present, the framework will request the single configured url and parse it using the provided value grabber. 

If value grabber returns a truthy result, all cinemas will be consider temporarily closed. 

This gives basically two common ways of implementing the value grabber: Either by checking for the presents of a particular HTML node or by parsing the text for certain messages. 

!> Crawling the is temporarily closed information happens as first step before crawling any cinemas and therefor affects all cinemas in a script unless treated other wise (see below).

**Config Schema**

{{schema:config-schema_is-temporarily-closed-crawling}} 

**Example**

```javascript
const config = {
  // … 
  cinemas: [{ /* … */ }],
  isTemporarilyClosed: {
    url: 'http://somecinema.com/index.html',
    grabber: {
      selector: '.foo-sel',
      mapper: text => /summer break/i.test(text)
    }
  }
}
```


## Crawling it per Cinema

The second way is mostly relevant for crawling of dynamic cinema list. A chain might have some selected venues temporarily closed. 

Therefore the framework offers the `isTemporarilyClosed` Value Grabber on the cinema details parsing configuration. The result of the value grabber is processed in the same way as for the global script approach. 

**Example**

```javascript 
const config = {
    // …
  cinemas: {
    list: { /* … */ },    
    details: {
      url: ':cinema.href:',
      isTemporarilyClosed: {
        selector: '.foo-sel',
        mapper: text => /renovation/i.test(text)
      }
      // …
    }
  }
  // …
}
```


## Custom via Hooks 

Last but not least, you may simply flip the `context.isTemporarilyClosed` flag to `true` in one of the many hooks the framework has. 

!> You may even choose to set it back to false via the [`beforeSave` hook](/api/hooks/beforeSave) in case the framework happen to pick it wrong, to handle edge cases.  



