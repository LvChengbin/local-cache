# LocalCache

## Start

To install the package with npm.

```js
$ npm i @lvchengbin/localcache
```
Then you can use the package in nodejs with `require`:

```js
const LocalCache = require( '@lvchengbin/localcache' );
```

As well, you can use it as a ES6 module:

```js
import LocalCache from '@lvchengbin/localcache';
```
We also provide files for using in browsers directly with `<script>` tag, you can get it here [localcache.js](https://raw.githubusercontent.com/LvChengbin/localcache/master/dist/local-cache.js), and if you want to use it in browsers not supporting ES5 syntax, please use [localcache.bc.js](https://raw.githubusercontent.com/LvChengbin/localcache/master/dist/local-cache.bc.js).

## Usage

Just a simple example first:

```js
const localcache = new LocalCache( 'local-data' );

localcache.set( 'key', 'value', {
    page : {
        lifetime : 5000,
        md5 : true,
        priority : 10
    }
} );

```
