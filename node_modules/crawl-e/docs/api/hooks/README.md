
# Hooks {docsify-ignore-all}

The framework provides a number of hooks to extend or partially replace it's functionality. For you example it allow intercepting and changing responses to polish the html or handle errors.  

## Understanding Contexts 

Internally a context object is build up and passed around to provide results of previous surrounding steps. See the list below for known keys of the context. 

For example when crawling a cinema chain the context provides the current cinema while iterating. When parsing a showtimes box inside a movie box the function parsing the showtime has access to the before parsed movie through the context as well. 

When working with hooks the context may help to decide on how to parse data or handle special cases. It might also be useful or required to add data to the context within hooks. When using multiple hooks, any arbitrary keys / items can be added to the context in order to communicate between two hooks. The framework however will only check for it's known keys. 

{{schema:context-schema.json,-1}}

## List of Hooks

{{schema:config-schema_hooks.json}}