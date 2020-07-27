# Crawl-E 

Showtimes crawler framework by Cinepass / internationalshowtimes.com

## Project Setup 

The framework is writting in [TypeScript](typescriptlang.org) and compiled into Node.js Javascript for usage of the library. 

[MochaJS](mochajs.org) + [ChaiJS's expect](http://chaijs.com/guide/styles/#expect) is used for unit testing. 

### Directories 

#### src 
source directory for TypeScript code

#### lib
library directory for importing the compiled framework

#### spec
JSON Schema definitions for the config. Is use to validate the config as well as for generating parts of the documentation as a single source of truth. 

#### docs 
[Docsify](https://docsify.js.org/) based documentation of the framework. 

Icons: http://build.prestashop.com/prestashop-icon-font/

**Trouble-Shooting:**

- https://github.com/docsifyjs/docsify-cli/issues/78#issuecomment-567095875

#### tests 
Contains additional tests as well as supporting files such as recorded http request via [nock](https://github.com/node-nock/nock#recording). 
Simple unit tests of the components as next to them in the `src` directory. 
