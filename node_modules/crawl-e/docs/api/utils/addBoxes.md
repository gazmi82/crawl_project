# `addBoxes` Utilty function {docsify-ignore-all}


## Description
```typescript
/**
 * Transforms a HTML structure wrapping sections of a flat list's nodes into boxes. 
 * @param html 
 * @param containerSelector jQuery selector for the container node(s) of the list
 * @param nodeSelector jQuery selector for the nodes to start a box at
 * @param boxTag full html tag snipped including attributes to wrap boxes in - e.g. `<div class="movie"></div>`
 * @returns changed HTML structure
 */
function addBoxes(html: string, containerSelector: string, nodeSelector: string, boxTag: string): string
```

## Example

```javascript    
let config = {
  // … 
  hooks: {
    afterRequest: (request, context, err, response, callback) => {
      response.text = CrawlE.Utils.addBoxes(response.text, 'div', '.movie-list', '<div class="movieBox"></div>')
      callback(err, response, context)
    }
  }
}
```

<div class="">
<h3>Before</h3>
  <div class="flex-row">
    <div style="flex: 1"> 
      <h4>Look</h4>
      <div class="layout-examples">
<div id="before" class="movie-list container">
  <p class="movie title">Scary Movie</p>
  <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
  <p class="date">02.10.2019</p>
  <p class="time">19:15</p>
  <p class="movie title">Star Wars</p>
  <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
  <p class="date">02.10.2019</p>
  <p class="time">20:15</p>
</div>
      </div >
    </div>
    <div style="flex: 1; width: 40%;">
      <h4>HTML</h4>
      <pre><code id="html-before"></code></pre>      
    </div>

  </div>

  <h3>After</h3>
  <div class="flex-row">
    <div style="flex: 1">
      <h4>Look</h4>
<div id="after" class="movie-list layout-examples">
  <div class="movieBox container">
    <p class="movie title">Scary Movie</p>
    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book</p>
    <p class="date">02.10.2019</p>
    <p class="time">19:15</p>
  </div>
  <div class="movieBox container">
    <p class="movie title">Star Wars</p>
    <p>Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book</p>
    <p class="date">02.10.2019</p>
    <p class="time">20:15</p>
  </div>
</div>
    </div>
    <div style="flex: 1; width: 40%;">
      <h4>HTML</h4  >
      <pre><code id="html-after" class="language-html"></code></pre>
    </div>

  </div>
 </div>

 <script language="javascript" type="text/javascript">
  function copyHtml(selector) {
    let html = document.querySelector(`#${selector}`).outerHTML
    html = html
            .replace(` id="${selector}"`, '')
            .replace(` class="container"`, '')
            .replace(/ container/g, '')
            .replace(` class="layout-examples"`, '')
            .replace(/ layout-examples/g, '')            
    html = Prism.highlight(html, Prism.languages.html, 'html')
    document.querySelector(`#html-${selector}`).innerHTML = html
  }
  copyHtml('before')
  copyHtml('after')
</script>