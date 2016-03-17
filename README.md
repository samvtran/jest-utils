# jest-utils
Useful Jest things

Mostly a dump of useful files that'll eventually get cleaned up. Files derived from other projects:
- inline-requires.js from [fbjs](https://github.com/facebook/fbjs/blob/master/scripts/babel-6/inline-requires.js) that checks if a top-level require() has already been removed before attempting to remove it ([LICENSE](https://github.com/facebook/fbjs/blob/master/LICENSE))
- unmock-alias.js derived from [babel-plugin-module-alias](https://github.com/tleunen/babel-plugin-module-alias) to make it work specifically with jest.unmock ([LICENSE](https://github.com/tleunen/babel-plugin-module-alias/blob/master/LICENSE.md))
