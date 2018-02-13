(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.LocalCache = factory());
}(this, (function () { 'use strict';

var isAsyncFunction = fn => ( {} ).toString.call( fn ) === '[object AsyncFunction]';

var isFunction = fn => ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction( fn );

var isPromise = p => p && isFunction( p.then );

const Promise$1 = class {
    constructor( fn ) {
        if( !( this instanceof Promise$1 ) ) {
            throw new TypeError( this + ' is not a promise ' );
        }

        if( !isFunction( fn ) ) {
            throw new TypeError( 'Promise resolver ' + fn + ' is not a function' );
        }

        this[ '[[PromiseStatus]]' ] = 'pending';
        this[ '[[PromiseValue]]' ]= null;
        this[ '[[PromiseThenables]]' ] = [];
        try {
            fn( promiseResolve.bind( null, this ), promiseReject.bind( null, this ) );
        } catch( e ) {
            if( this[ '[[PromiseStatus]]' ] === 'pending' ) {
                promiseReject.bind( null, this )( e );
            }
        }
    }

    then( resolved, rejected ) {
        const promise = new Promise$1( () => {} );
        this[ '[[PromiseThenables]]' ].push( {
            resolve : isFunction( resolved ) ? resolved : null,
            reject : isFunction( rejected ) ? rejected : null,
            called : false,
            promise
        } );
        if( this[ '[[PromiseStatus]]' ] !== 'pending' ) promiseExecute( this );
        return promise;
    }

    catch( reject ) {
        return this.then( null, reject );
    }
};

Promise$1.resolve = function( value ) {
    if( !isFunction( this ) ) {
        throw new TypeError( 'Promise.resolve is not a constructor' );
    }
    /**
     * @todo
     * check if the value need to return the resolve( value )
     */
    return new Promise$1( resolve => {
        resolve( value );
    } );
};

Promise$1.reject = function( reason ) {
    if( !isFunction( this ) ) {
        throw new TypeError( 'Promise.reject is not a constructor' );
    }
    return new Promise$1( ( resolve, reject ) => {
        reject( reason );
    } );
};

Promise$1.all = function( promises ) {
    let rejected = false;
    const res = [];
    return new Promise$1( ( resolve, reject ) => {
        let remaining = 0;
        const then = ( p, i ) => {
            if( !isPromise( p ) ) {
                p = Promise$1.resolve( p );
            }
            p.then( value => {
                res[ i ] = value;
                if( --remaining === 0 ) {
                    resolve( res );
                }
            }, reason => {
                if( !rejected ) {
                    reject( reason );
                    rejected = true;
                }
            } );
        };

        let i = 0;
        for( let promise of promises ) {
            remaining++;
            then( promise, i++ );
        }
        if( !i ) {
            resolve( res );
        }
    } );
};

Promise$1.race = function( promises ) {
    let resolved = false;
    let rejected = false;

    return new Promise$1( ( resolve, reject ) => {
        function onresolved( value ) {
            if( !resolved && !rejected ) {
                resolve( value );
                resolved = true;
            }
        }

        function onrejected( reason ) {
            if( !resolved && !rejected ) {
                reject( reason );
                rejected = true;
            }
        }

        for( let promise of promises ) {
            if( !isPromise( promise ) ) {
                promise = Promise$1.resolve( promise );
            }
            promise.then( onresolved, onrejected );
        }
    } );
};

function promiseExecute( promise ) {
    var thenable,
        p;

    if( promise[ '[[PromiseStatus]]' ] === 'pending' ) return;
    if( !promise[ '[[PromiseThenables]]' ].length ) return;

    const then = ( p, t ) => {
        p.then( value => {
            promiseResolve( t.promise, value );
        }, reason => {
            promiseReject( t.promise, reason );
        } );
    };

    while( promise[ '[[PromiseThenables]]' ].length ) {
        thenable = promise[ '[[PromiseThenables]]' ].shift();

        if( thenable.called ) continue;

        thenable.called = true;

        if( promise[ '[[PromiseStatus]]' ] === 'resolved' ) {
            if( !thenable.resolve ) {
                promiseResolve( thenable.promise, promise[ '[[PromiseValue]]' ] );
                continue;
            }
            try {
                p = thenable.resolve.call( null, promise[ '[[PromiseValue]]' ] );
            } catch( e ) {
                then( Promise$1.reject( e ), thenable );
                continue;
            }
            if( p && ( typeof p === 'function' || typeof p === 'object' ) && p.then ) {
                then( p, thenable );
                continue;
            }
        } else {
            if( !thenable.reject ) {
                promiseReject( thenable.promise, promise[ '[[PromiseValue]]' ] ); 
                continue;
            }
            try {
                p = thenable.reject.call( null, promise[ '[[PromiseValue]]' ] );
            } catch( e ) {
                then( Promise$1.reject( e ), thenable );
                continue;
            }
            if( ( typeof p === 'function' || typeof p === 'object' ) && p.then ) {
                then( p, thenable );
                continue;
            }
        }
        promiseResolve( thenable.promise, p );
    }
    return promise;
}

function promiseResolve( promise, value ) {
    if( !( promise instanceof Promise$1 ) ) {
        return new Promise$1( resolve => {
            resolve( value );
        } );
    }
    if( promise[ '[[PromiseStatus]]' ] !== 'pending' ) return;
    if( value === promise ) {
        /**
         * thie error should be thrown, defined ES6 standard
         * it would be thrown in Chrome but not in Firefox or Safari
         */
        throw new TypeError( 'Chaining cycle detected for promise #<Promise>' );
    }

    if( value !== null && ( typeof value === 'function' || typeof value === 'object' ) ) {
        var then;

        try {
            then = value.then;
        } catch( e ) {
            return promiseReject( promise, e );
        }

        if( typeof then === 'function' ) {
            then.call( value, 
                promiseResolve.bind( null, promise ),
                promiseReject.bind( null, promise )
            );
            return;
        }
    }
    promise[ '[[PromiseStatus]]' ] = 'resolved';
    promise[ '[[PromiseValue]]' ] = value;
    promiseExecute( promise );
}

function promiseReject( promise, value ) {
    if( !( promise instanceof Promise$1 ) ) {
        return new Promise$1( ( resolve, reject ) => {
            reject( value );
        } );
    }
    promise[ '[[PromiseStatus]]' ] = 'rejected';
    promise[ '[[PromiseValue]]' ] = value;
    promiseExecute( promise );
}

var isString = str => typeof str === 'string' || str instanceof String;

var isRegExp = reg => ({}).toString.call( reg ) === '[object RegExp]';

class EventEmitter {
    constructor() {
        this.__listeners = {};
    }

    alias( name, to ) {
        this[ name ] = this[ to ].bind( this );
    }

    on( evt, handler ) {
        const listeners = this.__listeners;
        listeners[ evt ] ? listeners[ evt ].push( handler ) : ( listeners[ evt ] = [ handler ] );
        return this;
    }

    once( evt, handler ) {
        const _handler = ( ...args ) => {
            handler.apply( this, args );
            this.removeListener( evt, _handler );
        };
        return this.on( evt, _handler );
    }

    removeListener( evt, handler ) {
        var listeners = this.__listeners,
            handlers = listeners[ evt ];

        if( !handlers || ! handlers.length ) {
            return this;
        }

        for( let i = 0; i < handlers.length; i += 1 ) {
            handlers[ i ] === handler && ( handlers[ i ] = null );
        }

        setTimeout( () => {
            for( let i = 0; i < handlers.length; i += 1 ) {
                handlers[ i ] || handlers.splice( i--, 1 );
            }
        }, 0 );

        return this;
    }

    emit( evt, ...args ) {
        const handlers = this.__listeners[ evt ];
        if( handlers ) {
            for( let i = 0, l = handlers.length; i < l; i += 1 ) {
                handlers[ i ] && handlers[ i ].call( this, ...args );
            }
            return true;
        }
        return false;
    }

    removeAllListeners( rule ) {
        let checker;
        if( isString( rule ) ) {
            checker = name => rule === name;
        } else if( isFunction( rule ) ) {
            checker = rule;
        } else if( isRegExp( rule ) ) {
            checker = name => {
                rule.lastIndex = 0;
                return rule.test( name );
            };
        }

        const listeners = this.__listeners;
        for( let attr in listeners ) {
            if( checker( attr ) ) {
                listeners[ attr ] = null;
                delete listeners[ attr ];
            }
        }
    }
}

function isUndefined() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

function config() {
    return {
        promises : [],
        results : [],
        index : 0,
        steps : [],
        busy : false,
        promise : Promise$1.resolve()
    };
}
/**
 * new Sequence( false, [] )
 * new Sequence( [] )
 */

class Sequence extends EventEmitter {
    constructor( steps, options = {} ) {
        super();

        this.__resolve = null;
        this.running = false;
        this.suspended = false;
        this.suspendTimeout = null;
        this.interval = options.interval || 0;

        Object.assign( this, config() );

        steps && this.append( steps );

        options.autorun !== false && setTimeout( () => {
            this.run();
        }, 0 );
    }

    /**
     * to append new steps to the sequence
     */
    append( steps ) {
        const dead = this.index >= this.steps.length;

        if( isFunction( steps ) ) {
            this.steps.push( steps );
        } else {
            for( let step of steps ) {
                this.steps.push( step );
            }
        }
        this.running && dead && this.next( true );
    }

    go( n ) {
        if( isUndefined( n ) ) return;
        this.index = n;
        if( this.index > this.steps.length ) {
            this.index = this.steps.length;
        }
    }

    clear() {
        Object.assign( this, config() );
    }

    next( inner = false ) {
        if( !inner && this.running ) {
            console.warn( 'Please do not call next() while the sequence is running.' );
            return Promise$1.reject( new Sequence.Error( {
                errno : 2,
                errmsg : 'Cannot call next during the sequence is running.'
            } ) );
        }

        /**
         * If there is a step that is running,
         * return the promise instance of the running step.
         */
        if( this.busy || this.suspended ) return this.promise;

        /**
         * If already reached the end of the sequence,
         * return a rejected promise instance with a false as its reason.
         */
        if( !this.steps[ this.index ] ) {
            return Promise$1.reject( new Sequence.Error( {
                errno : 1,
                errmsg : 'no more step can be executed.'
            } ) );
        }

        this.busy = true;
        
        return this.promise = this.promise.then( () => {
            const step = this.steps[ this.index ];
            let promise = step(
                this.results[ this.results.length - 1 ],
                this.index,
                this.results
            );
            /**
             * if the step function doesn't return a promise instance,
             * create a resolved promise instance with the returned value as its value
             */
            if( !isPromise( promise ) ) {
                promise = Promise$1.resolve( promise );
            }
            return promise.then( value => {
                const result = {
                    status : Sequence.SUCCEEDED,
                    index : this.index,
                    value,
                    time : +new Date
                };
                this.results.push( result );
                this.emit( 'success', result, this.index, this );
                return result;
            } ).catch( reason => {
                const result = {
                    status : Sequence.FAILED,
                    index : this.index,
                    reason,
                    time : +new Date
                };
                this.results.push( result );
                this.emit( 'failed', result, this.index, this );
                return result;
            } ).then( result => {
                this.index++;
                this.busy = false;
                if( !this.steps[ this.index ] ) {
                    this.emit( 'end', this.results, this );
                } else {
                    setTimeout( () => {
                        this.running && this.next( true ); 
                    }, this.interval );
                }
                return result;
            } );
        } );
    }

    run() {
        if( this.running ) return;
        this.running = true;
        this.next( true );
    }

    stop() {
        this.running = false;
    }

    suspend( duration = 1000 ) {
        this.suspended = true;
        this.suspendTimeout && clearTimeout( this.suspendTimeout );
        this.suspendTimeout = setTimeout( () => {
            this.suspended = false;
            this.running && this.next( true );
        }, duration );
    }
}

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.all = ( steps, interval = 0 ) => {
    if( !steps.length ) {
        return Promise$1.resolve( [] );
    }
    const sequence = new Sequence( steps, { interval } );
    return new Promise$1( ( resolve, reject ) => {
        sequence.on( 'end', results => {
            resolve( results );
        } );
        sequence.on( 'failed', () => {
            sequence.stop();
            reject( sequence.results );
        } );
    } );
};

Sequence.chain = ( steps, interval = 0 ) => {
    if( !steps.length ) {
        return Promise$1.resolve( [] );
    }
    const sequence = new Sequence( steps, { interval } );
    return new Promise$1( resolve => {
        sequence.on( 'end', results => {
            resolve( results );
        } );
    } );
};

Sequence.any = ( steps, interval = 0 ) => {
    if( !steps.length ) {
        return Promise$1.reject( [] );
    }
    const sequence = new Sequence( steps, { interval } );
    return new Promise$1( ( resolve, reject ) => {
        sequence.on( 'success', () => {
            resolve( sequence.results );
            sequence.stop();
        } );

        sequence.on( 'end', () => {
            reject( sequence.results );
        } );
    } );
};

Sequence.Error = class {
    constructor( options ) {
        Object.assign( this, options );
    }
};

var isObject = obj => obj && typeof obj === 'object' && !Array.isArray( obj );

var isNumber = ( n, strict = false ) => {
    if( ({}).toString.call( n ).toLowerCase() === '[object number]' ) {
        return true;
    }
    if( strict ) return false;
    return !isNaN( parseFloat( n ) ) && isFinite( n )  && !/\.$/.test( n );
};

var isDate = date => ({}).toString.call( date ) === '[object Date]';

var md5 = ( () => {
    const safe_add = (x, y) => {
        const lsw = (x & 0xFFFF) + (y & 0xFFFF);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    };
    const bit_rol = ( num, cnt ) => ( num << cnt ) | ( num >>> ( 32 - cnt ) );
    const md5_cmn = ( q, a, b, x, s, t ) => safe_add( bit_rol( safe_add( safe_add( a, q ), safe_add( x, t ) ), s ), b );
    const md5_ff = ( a, b, c, d, x, s, t ) => md5_cmn( (b & c) | ( ( ~b ) & d ), a, b, x, s, t );
    const md5_gg = ( a, b, c, d, x, s, t ) => md5_cmn( (b & d) | ( c & ( ~d ) ), a, b, x, s, t );
    const md5_hh = ( a, b, c, d, x, s, t ) => md5_cmn( b ^ c ^ d, a, b, x, s, t );
    const md5_ii = ( a, b, c, d, x, s, t ) => md5_cmn( c ^ ( b | ( ~d ) ), a, b, x, s, t );

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    const binl_md5 = ( x, len ) => {
        /* append padding */
        x[ len >> 5 ] |= 0x80 << (len % 32);
        x[ ( ( ( len + 64 ) >>> 9 ) << 4) + 14 ] = len;

        var a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for( let i = 0, l = x.length; i < l; i += 16 ) {
            let olda = a;
            let oldb = b;
            let oldc = c;
            let oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [ a, b, c, d ];
    };

    /*
     * Convert an array of little-endian words to a string
     */
    const binl2rstr = input => {
        var output = '';
        for( let i = 0, l = input.length * 32; i < l; i += 8 ) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    };

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    const rstr2binl = input => {
        const output = Array.from( { length : input.length >> 2 } ).map( () => 0 );
        for( let i = 0, l = input.length; i < l * 8; i += 8 ) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    };

    const rstr_md5 = s => binl2rstr( binl_md5( rstr2binl(s), s.length * 8 ) );
    const str2rstr_utf8 = input => window.unescape( encodeURIComponent( input ) );
    return string => {
        var output = '';
        const hex_tab = '0123456789abcdef';
        const input = rstr_md5( str2rstr_utf8( string ) );

        for( let i = 0, l = input.length; i < l; i += 1 ) {
            const x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
        }
        return output;
    };
} )();

class Storage {
    constructor( name ) {
        if( !name ) {
            throw new TypeError( `Expect a name for the storage, but a(n) ${name} is given.` );
        }

        this.name = `#LC-STORAGE-V-1.0#${name}#`;

        const abstracts = [ 'set', 'get', 'delete', 'clear', 'keys' ];

        for( let method of abstracts ) {

            if( !isFunction( this[ method ] ) ) {
                throw new TypeError( `The method "${method}" must be declared in every class extends from Cache` );
            }
        }
    }

    format( data, options = {} ) {
        let string = true;
        if( !isString( data ) ) {
            string = false;
            data = JSON.stringify( data );
        }

        const input = {
            data,
            type : options.type || 'localcache',
            mime : options.mime || 'text/plain',
            string,
            priority : options.priority === undefined ? 50 : options.priority,
            ctime : options.ctime || +new Date,
            lifetime : options.lifetime || 0
        };

        if( options.extra ) {
            input.extra = JSON.stringify( options.extra );
        }

        if( options.md5 ) {
            input.md5 = md5( data );
        }

        if( options.cookie ) {
            input.cookie = md5( document.cookie );
        }

        return input;
    }

    validate( data, options = {} ) {
        let result = true;

        if( data.lifetime ) {
            if( new Date - data.ctime >= data.lifetime ) {
                result = false;
            }
        } 
        
        if( data.cookie ) {
            if( data.cookie !== md5( document.cookie ) ) {
                result = false;
            }
        } 
        
        if( data.md5 && options.md5 ) {
            if( data.md5 !== options.md5 ) {
                result = false;
            }
            if( md5( data.data ) !== options.md5 ) {
                result = false;
            }
        }

        if( options.validate ) {
            return options.validate( data, result );
        }

        return result;
    }

    clean( check ) {
        return this.keys().then( keys => {
            const steps = [];

            for( let key of keys ) {
                steps.push( () => {
                    return this.get( key ).then( data => {
                        if( check( data, key ) === true ) {
                            return this.delete( key );
                        }
                    } )
                } );
            }

            return Sequence.chain( steps ).then( results => {
                const removed = [];

                for( let result of results ) {

                    if( result.status === Sequence.FAILED ) {
                        removed.push( keys[ result.index ] );
                    }
                }

                return removed;
            } );
        } );
    }

    output( data, storage ) {

        if( !storage ) {
            console.error( 'Storage type is required.' );
        }

        if( !data.string ) {
            data.data = JSON.parse( data.data );
        }

        if( data.extra ) {
            data.extra = JSON.parse( data.extra );
        }

        data.storage = storage;

        return data;
    }
}

class Memory extends Storage {
    constructor( name ) {
        super( name );
        this.data = {};
    }

    set( key, data, options = {} ) {
        data = this.format( data, options );
        this.data[ key ] = data;
        return Promise$1.resolve( data );
    }

    get( key, options = {} ) {
        const data = this.data[ key ];

        if( !data ) return Promise$1.reject();

        if( this.validate( data, options ) === false ) {
            options.autodelete !== false && this.delete( key );
            return Promise$1.reject();
        }

        return Promise$1.resolve( this.output( data, 'page' ) );
    }

    delete( key ) {
        this.data[ key ] = null;
        delete this.data[ key ];
        return Promise$1.resolve();
    }

    keys() {
        return Promise$1.resolve( Object.keys( this.data ) );
    }

    clear() {
        this.data = {};
        return Promise$1.resolve();
    }
}

class SessionStorage extends Storage {
    constructor( name ) {
        super( name );
    }

    set( key, data, options = {} ) {
        data = this.format( data, options );
        try {
            sessionStorage.setItem( this.name + key, JSON.stringify( data ) );
            return Promise$1.resolve( data );
        } catch( e ) {
            return Promise$1.reject( e );
        }
    }

    get( key, options = {} ) {
        let data;
        
        try {
            data = JSON.parse( sessionStorage.getItem( this.name + key ) );

            if( !data ) return Promise$1.reject();

            if( this.validate( data, options ) === false ) {
                options.autodelete !== false && this.delete( key );
                return Promise$1.reject();
            }
        } catch( e ) {
            this.delete( key );
            return Promise$1.reject();
        }
        return Promise$1.resolve( this.output( data, 'session' ) );
    }

    delete( key ) {
        sessionStorage.removeItem( this.name + key );  
        return Promise$1.resolve();
    }

    clear() {
        sessionStorage.clear();
        return Promise$1.resolve();
    }

    keys() {
        const keys = [];
        const name = this.name;
        const l = this.name.length;

        for( let key in sessionStorage ) {
            if( key.indexOf( name ) ) continue;
            keys.push( key.substr( l ) );
        }

        return Promise$1.resolve( keys );
    }
}

class IDB extends Storage {
    constructor( name ) {
        super( name );

        this.idb = null;

        this.ready = this.open().then( () => {
            this.idb.onerror = e => {
                console.warn( 'IDB Error', e );
            };
            return this.idb;
        } );

    }

    open() {

        const request = window.indexedDB.open( this.name );

        return new Promise( ( resolve, reject ) => {

            request.onsuccess = e => {
                this.idb = e.target.result;
                resolve( e );
            };

            request.onerror = e => {
                reject( e );
            };

            request.onupgradeneeded = e => {
                this.onupgradeneeded( e );
            };
        } );
    }

    onupgradeneeded( e ) {
        const os = e.target.result.createObjectStore( 'storage', {
            keyPath : 'key'
        } );

        os.createIndex( 'key', 'key', { unique : true } );
        os.createIndex( 'data', 'data', { unique : false } );
        os.createIndex( 'type', 'type', { unique : false } );
        os.createIndex( 'string', 'string', { unique : false } );
        os.createIndex( 'ctime', 'ctime', { unique : false } );
        os.createIndex( 'md5', 'md5', { unique : false } );
        os.createIndex( 'lifetime', 'lifetime', { unique : false } );
        os.createIndex( 'cookie', 'cookie', { unique : false } );
        os.createIndex( 'priority', 'priority', { unique : false } );
        os.createIndex( 'extra', 'extra', { unique : false } );
        os.createIndex( 'mime', 'mime', { unique : false } );
    }

    store( write = false ) {
        return this.idb.transaction( [ 'storage' ], write ? 'readwrite' : 'readonly' ).objectStore( 'storage' );
    }

    set( key, data, options = {} ) {

        data = this.format( data, options );

        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                // don't manipulate the origin data
                const request = store.put( Object.assign( { key }, data ) );

                request.onsuccess = () => {
                    resolve( data );
                };

                request.onerror = e => {
                    reject( e );
                };
            } );
        } );
    }

    delete( key ) {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                const request = store.delete( key );

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = e => {
                    reject( e );
                };
            } );
        } );
    }

    get( key, options = {} ) {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store();
                const request = store.get( key );

                request.onsuccess = () => {
                    const data = request.result;
                    if( !data ) {
                        return reject();
                    }

                    if( this.validate( data, options ) === false ) {
                        options.autodelete !== false && this.delete( key ); 
                        return reject();
                    }
                    delete data.key;
                    resolve( this.output( data, 'persistent' ) );
                };

                request.onerror = e => {
                    reject( e );
                };
                
            } );
        } );
    }

    clear() {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store( true );
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = e => {
                    reject( e );
                };
            } );
        } );
    }

    keys() {
        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const store = this.store();

                if( store.getAllKeys ) {
                    const request = store.getAllKeys();

                    request.onsuccess = () => {
                        resolve( request.result );
                    };

                    request.onerror = () => {
                        reject();
                    };
                } else {
                    try {
                        const request = store.openCursor();
                        const keys = [];

                        request.onsuccess = () => {
                            const cursor = request.result;

                            if( !cursor ) {
                                resolve( keys );
                                return;
                            }

                            keys.push( cursor.key );
                            cursor.continue();
                        };
                    } catch( e ) {
                        reject( e );
                    }
                }
            } );
        } );
    }
}

let Persistent = Storage;

if( window.indexedDB ) {
    Persistent = IDB;
}

var Persistent$1 = Persistent;

/**
 * please don't change the order of items in this array.
 */
class LocalCache {
    constructor( name ) {
        if( !name ) {
            throw new TypeError( 'Expect a name for your storage' );
        }

        this.page = new Memory( name );
        this.session = new SessionStorage( name );
        this.persistent = new Persistent$1( name );

        this.clean();
    }
    set( key, data, options ) {

        const steps = [];

        for( let mode of LocalCache.STORAGES ) {
            if( !options[ mode ] ) continue;

            let opts = options[ mode ];

            if( opts === false ) continue;

            if( !isObject( opts ) ) {
                opts = {};
            }

            if( !isUndefined( options.type ) ) {
                opts.type = options.type;
            }

            if( !isUndefined( options.extra ) ) {
                opts.extra = options.extra;
            }

            if( !isUndefined( options.mime ) ) {
                opts.mime = options.mime;
            }
            
            steps.push( () => this[ mode ].set( key, data, opts ) );
        }

        if( !steps.length ) {
            throw new TypeError( `You must specify at least one storage mode in [${LocalCache.STORAGES.join(', ')}]` );
        }

        return Sequence.all( steps ).then( () => data );
    }

    get( key, modes, options = {} ) {

        if( isObject( modes ) ) {
            modes = LocalCache.STORAGES;
            options = modes;
        }

        modes || ( modes = LocalCache.STORAGES );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted storage mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].get( key, options ) );
        }

        return Sequence.any( steps ).then( results => {
            const result = results[ results.length - 1 ];
            const value = result.value;

            let store = false;

            for( const item of LocalCache.STORAGES ) {
                if( options[ item ] && item !== value.storage ) {
                    store = true;
                }
            }

            if( !store ) return value;

            const opts = Object.assign( value, options, {
                [ value.storage ] : false
            } );

            return this.set( key, value.data, opts ).then( () => value );
        } );
    }

    delete( key, modes ) {
        modes || ( modes = LocalCache.STORAGES );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].delete( key ) );
        }
        return Sequence.all( steps );
    }

    clear( modes ) {
        modes || ( modes = LocalCache.STORAGES );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${LocalCache.STORAGES.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].clear() );
        }

        return Sequence.all( steps );
    }

    clean( options = {} ) {
        const check = ( data, key ) => {
            let remove = false;

            const { priority, length, ctime, type } = options;

            if( !isUndefined( priority ) ) {
                if( data.priority < priority ) {
                    remove = true;
                }
            }

            if( !remove && !isUndefined( length ) ) {
                const content = data.data;
                if( isNumber( length ) ) {
                    if( content.length >= length ) {
                        remove = true;
                    }
                } else if( Array.isArray( length ) ) {
                    if( content.length >= length[ 0 ] && content.length <= length[ 1 ] ) {
                        remove = true;
                    }
                }
            }

            if( !remove && !isUndefined( ctime ) ) {
                if( isDate( ctime ) || isNumber( ctime ) ) {
                    if( data.ctime < +ctime ) {
                        remove = true;
                    }
                } else if( Array.isArray( ctime ) ) {
                    if( data.ctime > ctime[ 0 ] && data.ctime < ctime[ 1 ] ) {
                        remove = true;
                    }
                }
            }

            if( !remove ) {
                if( Array.isArray( type ) ) {
                    if( type.indexOf( data.type ) > -1 ) {
                        remove = true;
                    }
                } else if( type == data.type ) {
                    remove = true;
                }
            }

            if( !remove && isFunction( options.remove ) ) {
                if( options.remove( data, key ) === true ) {
                    remove = true;
                }
            }

            return remove;
        };

        const steps = [];

        for( let mode of LocalCache.STORAGES ) {
            steps.push( this[ mode ].clean( check ) );
        }
        return Promise.all( steps );
    }
}

LocalCache.STORAGES = [ 'page', 'session', 'persistent' ];

return LocalCache;

})));
