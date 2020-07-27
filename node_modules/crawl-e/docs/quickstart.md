# Quickstart

To get started please read [Terminology](#/basics/terminology), followed by the other articles in the *Getting started* section. It's important to get a good understanding of the frameworks Terminology and Compontents as they are use through out the docs. 

## Project setup 

To prevent crawlers from breaking due to changes made to the framework later on in production, it should be tied to a specific version as following. This requires a slightly more complex dependency configuration and only works with [yarn](https://yarnpkg.com) as of now. 


!> **It is required to have an SSH key setup within your Bitbucket account:**<br> 1. Ensure you have an SSH key on your locale machine:<br>&nbsp; → https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html <br> 2. Add the key to your account:<br>&nbsp; → https://bitbucket.org/account/user/YOUR-USERNAME/ssh-keys/

1. Add `crawl-e` to `package.json`:
```json
{
  "dependencies": {
    "crawl-e/v{{package:version}}": "git+ssh://git@bitbucket.org/cinepass/crawl-e.git#v{{package:version}}"
  }
}
```

<p class="footnotes" style="color: gray; margin-left: 24px;" >
In case you do not have a SSH key setup on Bitbucket yet, you may use the following dependency temporary. Please note however, while while this helps for testing the framework quicker, we will require a proper setup for working with use.  
`"crawl-e/v{{package:version}}": "http://www.bitbucket.org/cinepass/crawl-e.git#v{{package:version}}"`
</p>

2. Run `yarn install`

3. Import in crawler script:
```javascript
const CrawlE = require('crawl-e/v{{package:version}}')
```
4. Init `CrawlE` with a configuration and call `crawl()`. 
```javascript
let crawlE = new CrawlE({
  // …
})
crawlE.crawl()
```

5. Run the crawler script.
  
  With an empty config provided it should exit with prining ConfigError.
  
  
> **Continue with the tutorials.**
