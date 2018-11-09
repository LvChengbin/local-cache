# LocalCache

[![Greenkeeper badge](https://badges.greenkeeper.io/LvChengbin/localcache.svg)](https://greenkeeper.io/)

A library used for caching data in different levels easily in browsers by specifying validation rules such as lifetime, md5, etc.

<!-- vim-markdown-toc GFM -->

* [Start](#start)
* [Usage](#usage)
    * [Storing and getting data.](#storing-and-getting-data)
    * [Storage modes](#storage-modes)
    * [Data storing in LocalCache](#data-storing-in-localcache)
    * [Validating data](#validating-data)
* [API](#api)
    * [LocalCache( name )](#localcache-name-)
    * [set( key, data, options )](#set-key-data-options-)
    * [get( key, modes, options )](#get-key-modes-options-)
    * [delete( key, modes )](#delete-key-modes-)
    * [clear( modes )](#clear-modes-)
    * [clean( options )](#clean-options-)

<!-- vim-markdown-toc -->

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
We also provide files for using in browsers directly with `<script>` tag, you can get it here [localcache.js](https://raw.githubusercontent.com/LvChengbin/localcache/master/dist/localcache.js), and if you want to use it in browsers not supporting ES5 syntax, please use [localcache.bc.js](https://raw.githubusercontent.com/LvChengbin/localcache/master/dist/localcache.bc.js).

## Usage

### Storing and getting data.

```js
const localcache = new LocalCache( 'local-data' );

localcache.set( 'name', 'localcache', {
    page : true,
    persistent : {
        lifetime : 3600000,
        cookie : true,
        md5 : true
    }
} );
```

With the code above, a `LocalCache` instance with a name `local-data` was created, and a string "localcache" with a key "name" was saved in both `page` and `persistent` storage.

Then, try getting data saved in `page` storage:

```js
localcache.get( 'name', [ 'page' ] ).then( value => {
    console.log( value ); // localcache
} );
```

Or getting data from `persistent` storage:

```js
localcache.get( 'name', [ 'persistent' ] ).then( value => {
    console.log( value ); // localcache
} );
```

And you can also get data from multiple storages with specifying multiple storages in an array like `[ 'page', 'persistent' ]`, and the data will be retrieved in the storages in the array in sequence, if the data has been found in one storage the seeking process would stop, for example, in this case, we can find the data out from `page` storage, so there is no need to seek the `persistent` storage any more. The code will be like this:

```js
localcache.get( 'name', [ 'page', 'persistent' ] ).then( value => {
    console.log( value ); //
} );
```

### Storage modes

`LocalCache` provides three levels storage mode, `page`, `session` and `persistent`, you can get the list with `LocalCache.STORAGES`. Obviously, you can understand the meaning from their names, and you can specify one ore multiple storage for caching your data. Here is some detail information for these three storage mode:


 - **page**

    The `page` mode storage just means storing data only for current page, and data will be store in memory. 
 
 - **session**

    The `session` mode storage means that the data will be valid in current session, so the data will be stored in `sessionStorage`.

 - **persistent**

    The `persistent` mode storage means that the data will be stored persistently, generally, it will be stored in `indexedDB`, but for clients which don't support `indexedDB`, such as IE9, Android browser < 4.3, the data will be stored into `localStorage` instead.

### Data storing in LocalCache

When you call `LocalCache.get` method, the data you get is not the original data you stored to `LocalCache` use `LocalCache.set` method, it is an object contains multiple properties, and you can use them if you need.
Here is the full list of properties in the `data` that you get:

 - data

    The original data you stored in `LocalCache`.

 - type `String`

    The type of the data that you gave while setting it.

 - string `Boolean`

    For denoting if the data is a string.

 - ctime `Number`

    The creation time of the data.

 - md5 `String`

    The `md5` value of the data if you set `md5` to `true` while setting data.

 - lifetime `Number`

    The lifetime of the data if it was specified.

 - cookie `String`

    The md5 value of the cookie generated while creating the data.

 - priority `Number`

    The priority of the data.

 - extra

    The extra data of the data, you can add extra data while calling `LocalCache.set` method.

### Validating data

In the example above, because while saving data in `persistent` storage, in the code, a `lifetime` was set to the data, and aslo `md5` and `cookie`. That means the data will be checked with these three ways while getting it with the `key` from `persistent` storage. But for `page` storage, no check will need while getting data. 

So `lifetime`, `md5` and `cookie` are the three ways for checking data, they can be used for every storage mode while setting data, and when you want to get data from storages, the data would be checked before being returned, if the data cannot pass the check, it will not be returned and it will be deleted by default, and you can set `autodelete: false` to prevent the deletion. Here is the details of them:

 - **lifetime**

    Denoting the lifetime of the data, it should be a number for denoting the lifetime in millisecond. If its value is `0` or `false`, means there's no need to check lifetime while getting data.

    ```js
    const localcache = new LocalCache( 'local-cache' );

    localcache.set( 'key', 'value', { 
        persistent : {
            lifetime : 1000
        }
    } );

    // assume that 1 second later

    localcache.get( 'key' ).catch( () => {
        // this function will execute because you cannot get "key" from storage
    } );
    ```

 - **md5**

   If you set `md5` to true while setting data, it meas that while getting data, the `md5` value should be checked. So `LocalCache` will help you to calculate the md5 value and you have to specify a `md5` while getting data.

   ```js
    const localcache = new LocalCache( 'local-cache' );

    localcache.set( 'key', 'value', { 
        persistent : {
            md5 : true
        }
    } );

    localcache.get( 'key', {
        md5 : '2063c1608d6e0baf80249c42e2be5804'
    } ).then( data => {
        // get the data
    } );
   ```

   \* Notice that, if the data you set is not a string, it will be convert to string by using `JSON.stringify` and then to calculate the md5 value to the string.

 - **cookie**

    Sometimes, we want to cache the responsed data from server, and reuse it at the next time if we need to rend another request to the server with all same queries. But sometimes, changed cookies would make the response change. Setting `cookie` to `true`, then `LocalCache` will help you to check if there were some cookies changed from the data was set on.

    ```js
    const localcache = new LocalCache( 'local-cache' );

    localcache.set( 'key', 'value', { 
        persistent : {
            cookie : true
        }
    } );

    document.cookie = 'newcookie=1';

    localcache.get( 'key' ).catch( () => {
        // this function will execute because you cannot get "key" from storage
    } );
    ```

 - **Custom Function**

    You can specify a `validate` function for checking data and it will execute after checking other ways you added. To return a `false` means the data doesn't pass the check and its unavailable. The validate function will get two arguments:

    - data
        the data object storing in `LocalCache`.

    - result
        the check result of other checking ways.

    ```js
    const localcache = new LocalCache( 'local-cache' );

    localcache.set( 'key', 'value', { 
        persistent : {
            lifetime : 1000,
            md5 : true
        }
    } );

    localcache.get( 'key', {
        md5 : '2063c1608d6e0baf80249c42e2be5804',
        validate( data, result ) {
            if( !result ) {
                // the data didn't pass the lifetime and md5 check.
                return false;
            }
            if( new Date - data.ctime > 100 ) {
                return false;
            }
        }
    } ).catch( () => {
        // this function will execute because you cannot get "key" from storage
    } );
    ```

## API

### LocalCache( name )

To create a new `LocalCache` instance with "name". The name should be a string and will be used as a part of each key in `localStorage` and `sessionStorage` or a part of database name in `indexedDB`.

```js
new LocalCache( 'a-name-that-you-like' );
```

### set( key, data, options )

To set data into `LocalCache`. In `options`, you can specify the [Storage modes](#storage-modes) you want to use with [Storage options](#storage-options).

Make sure that the data you want to cache can be serilized with `JSON.stringify` if it's not a `String`.

In the argument `options`, you can set some other items except storage modes.

 - **type** `String`

    To give a "type" of the data, you can use it to [clean](#clean-options-) storages.

 - **extra** `String` `Object` `Array`

    The extra data will be stored together with the data after being `JSON.stringify`.

```js
const localcache = new LocalCache( 'local-cache' );

localcache.set( 'key', 'value', {
    page : true,
    persistent : {
        lifetime : 86400000,
        md5 : true,
    },
    type : 'api-response',
    extra : {}
} );

localcache.set( 'key2', { name : 'lx', age : 20 }, {
    page : {
        lifetime : 60000 
    }
} );
```

 - **key**

### get( key, modes, options )

To get available data from `LocalCache`. You can specify multiple storage modes, and data will be sought in the storage modes you specified one by one until got the available data.

And you can add some options, such as:

 - **md5** `String`

    The md5 value for checking data.

- **autodelete** `Boolean`

    Denoting if to delete the data or not if the data isn't available. Only set it to false if you are really sure that you don't want to delete the useless data.

```js
const localcache = new LocalCache( 'local-cache' );
localcache.get( 'key', [ 'page', 'persistent' ] ).then( data => {
    // got data
} ).catch( () => {
    // no available data
} );
```

And you can also store the data to a higher storage:

```js
const localcache = new LocalCache( 'local-cache' );
localcache.get( 'key', [ 'page', 'persistent' ], {
    // if the data was found in session storage or persistent storage, it will be stored into page storage.
    page : true,
    // if the data was found in persistent storage, it will be stored into session storage.
    session : {
        lifetime : 60
    }
} ).then( data => {
    // got data
} ).catch( () => {
    // no available data
} );
```

**Return value**:

- An already resolved `Promise` if has found out available data from one of the specified storages.

- An rejected `Promise` if couldn't found available data from specified storages.

### delete( key, modes )

To delete data with its "key" in specified storage modes.

```js
const localcache = new LocalCache( 'local-cache' );
localcache.delete( 'key', [ 'page', 'session' ] );
```

**Return value**: a `Promise`.

### clear( modes )

To remove all data in one or multiple storages. If the argument is empty, all data in all storages mode will be removed.

**Return value**: a `Promise`.

```js
const localcache = new LocalCache( 'local-cache' );
localcache.clear( [ 'page', 'session', 'persistent' ] );
```

### clean( options )

To clean unavailable data storing in `LocalCache`. By calling this function, `LocalCache` will ask every storage to check all the data.

By default, only data cannot pass the `lifetime` and `cookie` check will be deleted, but you can add some other conditions to judge if a data should be deleted.

**Return value**: a `Promise`.

 - **priority** `Integer`

    Denoting all data which priority is lower than the number will be removed.

    ```js
    new LocalCache( 'local-cache' ).clean( {
        priority : 10
    } );
    ```

 - **length** `Integer` `Array`

    If the value as an integer, all data longer than the length would be removed, and if the value is an array, data which length is between the first item and the second item of `length` will be removed.

    ```js
    const localcache = new LocalCache( 'local-cache' );
    
    localcache.clean( {
        length : 1000
    } );

    localcache.clean( {
        length : [ 0, 500 ]
    } );
    ```

 - **ctime** `Array` `Integer` `Date`

    If the value is an timestamp or a Date instance, all data created before the time will be removed, and if the value is an array, all date whose creation time between the first and second item of the array will be removed.
    
    ```js
    const localcache = new LocalCache( 'local-cache' );
    
    // remove all data created one day ago.
    localcache.clean( {
        ctime : new Date - 86400000
    } );

    // remove all data created before 2018-01-01
    localcache.clean( {
        ctime : new Date( '2018-01-01' )
    } );

    // remove all data created in last 24 hours.
    localcache.clean( {
        length : [ new Date - 86400000, new Date ]
    } );
    ```

 - **type** `Array` `String`

    Denoting to delete one or multiple types of data. 

    ```js
    const localcache = new LocalCache( 'local-cache' );
    
    localcache.clean( {
        type : 'type1'
    } );

    localcache.clean( {
        type : [ 'type1', 'type2' ]
    } );
    ```



 - **remove** `Function`

    A function which will execute if the data wouldn't be removed by other conditions. To return a `true` means to remove the data.

    ```js
    const localcache = LocalCache( 'local-cache' );

    localcache.clean( {
        remove( data, key ) {
            if( key === 'a special key' ) {
                return true;
            }
        }
    } );
    ```
