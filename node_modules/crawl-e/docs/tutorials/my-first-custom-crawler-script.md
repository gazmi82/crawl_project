# My first Custom Crawler Script

In this tutorial you will learn

<i class="ps-icon ps-icon-checked"></i> How to work with the different components of the CRAWL·E Framework <br>
<i class="ps-icon ps-icon-checked"></i> How to build crawlers for arbitrary websites using CRAWL·E

It assumes you have basic understanding of:

<i class="ps-icon ps-icon-check-box"></i> Object Oriented Programming in JavaScript<br>
<i class="ps-icon ps-icon-check-box"></i> Asynchronous Programming in JavaScript via Callbacks


We will build a crawler script for https://old.reddit.com/top/ from scratch.  

## Before we start … first things first 

We all love APIs, just like the CRAWL·E Framework's APIs we are just learning about. 🙂 

Just like as in <u>A</u>pplication <u>P</u>rogramming <span style="font-weight: 500;"><u>I</u>nterface</span>, CRAWL·E defines a number of [Typescript Interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html) before actually implementing them. This allows to implement own custom classes and functions when needed, but that's just as a side note for now. 

More important to understand now is the naming which derives from this design pattern. Typically the framework's interface are named after the simplest name of a `Thing`. It defined the properties or attributes and methods a thing may have and should be capable of doing. The framework then comes with at least one implementation of the interfaces, which si commonly named `DefaultThing`. 

In this tutorial we will only work with the default implementations, so there is not much to worry about the interfaces. Just keep in mind that the classes are prefixed with `Default` as you'll see. 

<span class="tutorial bonus">Glance the <a href="/typedocs/globals.html">TypeDocs list of Interfaces, Classes, etc.</a></span>

*Okay with that out of our way - and into our mind … let's get started.* 



## 0. Project setup

Let's [start with a fresh repository](quickstart?id=project-setup). For the sake of the tutorial project we only need on version of the framework installed. 


1. Add `crawl-e` to `package.json`:
```json
{
  "dependencies": {
    "crawl-e": "git+ssh://git@bitbucket.org/cinepass/crawl-e.git"
  }
}
```
!> Make sure you have at least version `0.5` installed!

2. Create a new empty Javascript file called `reddit-crawler.js`


## 1. Create a Context

All components connect to a context object, which gets passed around just about everywhere. It keeps keeps track of which request are currently made, which index on iterations the script might be currently at and allows to store data in order to supply it to functions such as mappers. 

Feel free to use the context object to store any values you may need to pull of elsewhere in your script. Doing so however, it is important to understand the timing / order of your scripts execution. 



  ```javascript
  const { DefaultContext } = require('crawl-e) 

  let context = new DefaultContext() // <<< [1]
  ```

   1. Create global script context

## 2. Make a Request

First thing our script needs to do, is fetch the website we want to crawl. Therefor we use a request maker that comes with the framework. However, please note you are actually free to use any http client lib your want / need to in case the default does not suite. There are actually two 3 request makers: 

- `DefaultRequestMaker` - recommended 
- `CachedRequestMaker` - add in-memory caching for multiple request within a single script execution
- `RequestMakerWithNockCaching` - adds file-system caching of request using the [nock](https://github.com/nock/nock) package to speed up the development

We will go with the default one for this tutorial. 




<pre v-pre data-lang="javascript" data-line="4-11"><code class="lang-javascript">
  const { DefaultContext, DefaultRequestMaker } = require('crawl-e)

  let context = new DefaultContext()
  let requestMaker = new DefaultRequestMaker() // <<< [1]

  requestMaker.get('https://old.reddit.com/top/', context, (err, res) => { // <<< [2]
    if (err) { 
      console.error(`Oh noo, sth. wen't wrong: ${err}`)
    }
    console.log('Happy', res.status, '🙂')
  })
</code></pre>

  - [1] Create a request maker. 
  - [2] Make load the URL we want to crawl. Pass it the context and a nice callback function. 
  - Run the script: 
    ```bash
    $ node reddit-crawler.js
    Happy 200 🙂
    ```



Let's add a logger to it so we know which requests are made.


<pre v-pre data-lang="javascript" data-line="4,6"><code class="lang-javascript">
  const { DefaultContext, DefaultRequestMaker, Logger } = require('crawl-e)

  let context = new DefaultContext()
  let logger = new Logger() // <<< [1]
  let requestMaker = new DefaultRequestMaker() 
  requestMaker.logger = logger // <<< [2]

  requestMaker.get('https://old.reddit.com/top/', context, (err, res) => {
    if (err) { 
      console.error(`Oh noo, sth. wen't wrong: ${err}`)
    }
    console.log('Happy', res.status, '🙂')
  })
</code></pre>

  - [1] We can use a single Logger in all of our script or create dedicated ones. 
  - [2] Set the `logger` on our `requestMaker` instance
  - Run the script again: 
    ```bash
    $ node reddit-crawler.js
    requesting https://old.reddit.com/top/ …
    Happy 200 🙂
    ```

## 3. Parsing the Response 

### 3.1. Parsing Lists

Now that we have a working request, the next step is to parse the HTML and extract the data of interest. Therefore we have to implement a custom response parser class, which we base on the framework's `BaseHtmlParser`. 

  - Create a new file named `RedditResponseParser.js`

  ```javascript 
    // RedditResponseParser.js
    
    const { BaseHtmlParser } = require('crawl-e')

    class RedditResponseParser extends BaseHtmlParser {
      parsePostsList(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)  // <<< [1]
        this.parseList( // <<< [2]
          container, 
          parsingContext, 
          'posts', // <<< [3]
          { box: 'div.thing' }, // <<< [4]
          (box, context, cb) => { // <<< [5]
            /* no implementation yet */
            cb(null, '*')
          }, 
          callback // <<< [6]
        )
      }
    }

    module.exports = RedditResponseParser
  ```
  - We implement a single method as a starting point. 
    - [1] We use BaseHtmlParser.prepareHtmlParsing() to parse the the `res.text` into a html root container and a corresponding `ParsingContext`.
    - [2] Then we call BaseHtmlParser.parseList() on the html container in the `ParsingContext`. 
    - [3] The list name `'posts'` is used to build the namespace for the debug logs, e.g. to allow checking for `DEBUG=crawl-e:posts:selection:count` when running the script.
    - [4] A `ListParsingConfig` defines who to find the boxes. 
    - [5] For parsing each box we put a dummy implementation for now. 
    - [6] Lastly we pass the methods callback to be called with the data from `parseList`.


Now we are ready to use our first custom build response parser: 






<pre v-pre data-lang="javascript" data-line="11-12,21-25"><code class="lang-javascript">
  // reddit-crawler.js

  const { DefaultContext, DefaultLogger, DefaultRequestMaker } = require('crawl-e')
  const RedditResponseParser = require('./RedditResponseParser')

  let context = new DefaultContext()
  let logger = new DefaultLogger()
  let requestMaker = new DefaultRequestMaker()
  requestMaker.logger = logger

  let responseParser = new RedditResponseParser() // <<< [1]
  responseParser.logger = logger // <<< [1]

  requestMaker.get('https://old.reddit.com/top/', context, (err, res) => {
    if (err) { 
      console.error(`Oh noo, sth. wen't wrong: ${err}`)
      return 
    }
    console.log('Happy', res.status, '🙂')

    responseParser.parsePostsList(res, context, (err, posts) => {  // <<< [2]
      // skipping error handling, as we know there no errors in this script, since we are not calling anything async yet
      console.log('POSTS:')
      console.log(posts)
    })
  })
</code></pre>

  - [1] We create a repesonse parser instance and set the logger to enable the debug logs. 
  - [2] We call our custom method for parsing the list of posts. 
  - Run the script again: 
    ```bash
    $ DEBUG=*count* node reddit-crawler.js
    requesting https://old.reddit.com/top/ …
    Happy 200 🙂
      crawl-e:posts:selection:count found 25 boxes +0ms
    {
      POSTS: 
      [
        '*', '*', '*', '*', '*', '*',
        '*', '*', '*', '*', '*', '*',
        '*', '*', '*', '*', '*', '*',
        '*', '*', '*', '*', '*', '*',
        '*'
      ]
    }
    ```
    

### 3.2. Parsing the Boxes

Next, let's actually parse the posts' data.  To extract the various data points from the HTML we use the frameworks `ValueGrabber` class. 

First we define `ValuesGrabber`s for each of the properties. To do so we have a number of options, such as initializing a new `ValueGrabber` from [Short Handle](/basics/value-grabber?id=short-handle) templates, [Configuration Objects](/basics/value-grabber?id=schema) or [Custom Grabbing functions](/advanced/custom-value-grabbing). Please note, that they all will be called in the context of a post box. 

We want to extract the following properties:
- title
- imageUrl
- score 
- author with name and profile url



  <pre v-pre data-lang="javascript" data-line="9-27,38,44-51"><code class="lang-javascript">
    // RedditResponseParser.js
    
    const { BaseHtmlParser, ValueGrabber } = require('crawl-e')

    class RedditResponseParser extends BaseHtmlParser {
      constructor() {
        super()

        // setup ValueGrabbers  // <<< [1]

        this.postTitleGrabber = new ValueGrabber('a.title')  // <<< [1.1]

        this.postImageUrlGraber = new ValueGrabber('a.thumbnail img @src')  // <<< [1.1]

        this.postScoreGrabber = new ValueGrabber({  // <<< [1.2]
          selector: 'div.score.unvoted',
          attribute: 'title',
          mapper: parseInt
        })

        this.postAuthorGrabber = new ValueGrabber((box, context) => {  // <<< [1.3]
          let authorTag = box.find('a.author')
          return {
            name: authorTag.text(),
            profileUrl: authorTag.attr('href')
          }
        })
      }

      parsePostsList(response, context, callback) {
        let { container, parsingContext } = this.prepareHtmlParsing(response.text, context)
        this.parseList(
          container, 
          parsingContext, 
          'posts', 
          { box: 'div.thing' }, 
          (box, context, cb) => {
            cb(null, this.parsePostBox(box, context)) // <<< [3]
          }, 
          callback
        )
      }

      parsePostBox (box, context) { // <<< [2]
        return {
          title: this.postTitleGrabber.grabFirst(box, context),
          imageUrl: this.postImageUrlGraber.grabFirst(box, context),
          score: this.postScoreGrabber.grabFirst(box, context),
          author: this.postAuthorGrabber.grabFirst(box, context)
        }
      }
    }


    module.exports = RedditResponseParser
  </code></pre>

- [1] Creating the ValueGrabbers
  - [1.1] with [Short Handle](/basics/value-grabber?id=short-handle) templates
  - [1.2] with [Configuration Objects](/basics/value-grabber?id=schema) including a mapper function
  - [1.3] with [Custom Grabbing functions](/advanced/custom-value-grabbing)
- [2] Next we create another method to parse the box of a single post. 
- [3] Lastly we call this new method when iterating / parsing the list of posts.



  - Run the script again: 
    ```bash
    $ DEBUG=*value* node reddit-crawler.js
    requesting https://old.reddit.com/top/ …
    Happy 200 🙂
    {
      POSTS: 
      [
        {
          title: "Wife of officer charged with murder of George Floyd announces she's divorcing him",
          imageUrl: null,
          score: 124814,
          author: {
            name: 'iSleepUpsideDown',
            profileUrl: 'https://old.reddit.com/user/iSleepUpsideDown'
          }
        },
        {
          title: 'News Reporter in Denver has his camera shot by Police',
          imageUrl: '//a.thumbs.redditmedia.com/M4A5on-xKpEYtNikI5oTNOuokyVC3QjyPJmKy29tPZ0.jpg',
          score: 112662,
          author: {
            name: 'scuczu',
            profileUrl: 'https://old.reddit.com/user/scuczu'
          }
        },
        // ...
      ]
    }
    ```

Notice there are not debug outputs for the value grabbing yet. This is because we have created the value grabbers in the most simply way. Let's pass them each our logger as well as an individual debug namespace. 

  <pre v-pre data-lang="javascript" data-line="11,13,19,27"><code class="lang-javascript">
    // RedditResponseParser.js
    
    const { BaseHtmlParser, ValueGrabber } = require('crawl-e')

    class RedditResponseParser extends BaseHtmlParser {
      constructor() {
        super()

        // setup ValueGrabbers 
        
        this.postTitleGrabber = new ValueGrabber('a.title', this.logger, 'post:title')

        this.postImageUrlGraber = new ValueGrabber('a.thumbnail img @src', this.logger, 'post:imageUrl')

        this.postScoreGrabber = new ValueGrabber({
          selector: 'div.score.unvoted',
          attribute: 'title',
          mapper: parseInt
        }, this.logger, 'post:score')

        this.postAuthorGrabber = new ValueGrabber((box, context) => {
          let authorTag = box.find('a.author')
          return {
            name: authorTag.text(),
            profileUrl: authorTag.attr('href')
          }
        }, this.logger, 'post:author')
      }

      /* ... */
    }

      module.exports = RedditResponseParser
  </code></pre>

  - Run the script again and watch for the debug outputs: 
    ```bash
    $ DEBUG=*value* node reddit-crawler.js
    requesting https://old.reddit.com/top/ …
    Happy 200 🙂
      crawl-e:post:title:value grabbing text(): Wife of officer charged with murder of George Floyd announces she's divorcing him +0ms
      crawl-e:post:title:value mapped: Wife of officer charged with murder of George Floyd announces she's divorcing him +0ms
      crawl-e:post:score:value grabbing attribute title: 124938 +0ms
      crawl-e:post:score:value mapped: 124938 +0ms
      crawl-e:post:author:value custom grabbed: {
      name: 'iSleepUpsideDown',
      profileUrl: 'https://old.reddit.com/user/iSleepUpsideDown'
    } +0ms
    ...
    ```

## 4. Saving the result to file

The last step for this tutorial is  to save the crawled data into a JSON output file. Luckily our swiss crawling knife has a tool for this too: the `JsonFileWriter`. By default it automatically creates the output directory and determines an output filename from the script name. 


  <pre v-pre data-lang="javascript" data-line="12-13,28-34"><code class="lang-javascript">

    const { DefaultContext, DefaultLogger, DefaultRequestMaker, JsonFileWriter } = require('crawl-e')
    const RedditResponseParser = require('./RedditResponseParser')

    let context = new DefaultContext()
    let logger = new DefaultLogger()
    let requestMaker = new DefaultRequestMaker()
    requestMaker.logger = logger

    let responseParser = new RedditResponseParser()
    responseParser.logger = logger

    let outputWriter = new JsonFileWriter() // <<< [1]
    outputWriter.logger = logger // <<< [2]


    requestMaker.get('https://old.reddit.com/top/', context, (err, res) => {
      if (err) { 
        console.error(`Oh noo, sth. wen't wrong: ${err}`)
        return 
      }
      console.log('Happy', res.status, '🙂')

      responseParser.parsePostsList(res, context, (err, posts) => {
        // skipping error handling, as we know there no errors in this script, since we are not calling anything async yet
        console.log(`found ${posts.length} posts`)
        console.log(posts.map(p => ` - ${p.title}`).join('\n'))
        
        outputWriter.saveFile(posts, context, (err) => { // <<< [3]
          if (err) { 
            console.error(`Oh noo, sth. wen't wrong: ${err}`)
            return 
          }
          console.log('All Done', '👏')    
        })
      })
    })
  </code></pre>

  - [1] Create a Writer instance. It takes an optional argument for the output directory, which defaults to `'output'`. If the directory is not existing upon running our script, it will be created. 
  <br><span class="tutorial bonus">Try  `new JsonFileWriter('some/deep/path')`. </span>
  - [2] Again we set a out global logger, to get the logs when the files was saved. 
  - [3] Finally save the output file and handle the callback.
  - Run the script: 
    ```bash
    $ node reddit-crawler.js
    requesting https://old.reddit.com/top/ …
    Happy 200 🙂
    found 27 posts
    ...
    Saving file: …/crawl-e-test-project/output/reddit-crawler.json // <<< [3]
    All Done 👏
    ```
  - Check the output file. 
    ```bash
    $ head output/reddit-crawler.json
    {
      "crawler": {
        "id": "reddit-crawler",
        "crawl-e": {
          "version": "0.5.0-dev"
        }
      },
      "data": [
        {
          "title": "Wife of officer charged with murder of George Floyd announces she's divorcing him",
    ``` 
    The JsonFileWriter always adds a `crawler` metainfo object to the output file. As we are the posts directly as array, it will be placed under a `data` key. When passing an object to `savevFile` the `crawler` metainfo will be injected into it. 
    <br><span class="tutorial bonus">Try calling `outputWriter.saveFile({posts}, …`</span>


## 🎉 All Done 👏 {docsify-ignore}