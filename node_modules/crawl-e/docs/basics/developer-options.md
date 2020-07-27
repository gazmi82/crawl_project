# Developer Options

The framework provides some developer options to support you. Run any crawler script with the CLI parameter `-h` to see the docs. 

## Limits Iterations

In case of large list of cinemas, movies or showitmes you may only care about a single iteration for focusing on getting the items details. Passing `-l 1` as CLI parameter limit all iterations to the first item. 

## Cache Dir 

The framework provides the options to cache all request being made for crawling a full website. It's implemented using the [`nock`](https://github.com/node-nock/nock) module. 

For exampale add `--cache-dir cache` as CLI parameter. Or in short `-c` does also enable the caching option and uses `cache` as default folder.

!> Please note that once the nock files is saved to the cache directory it will only reproduce requests from taht file. When extending a crawler to do more request, the cached file needs to be re-created. Therefore simply delete the existing nock file.
