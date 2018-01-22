import Sequence from '@lvchengbin/sequence';
import is from '@lvchengbin/is';

import md5 from './md5';

export default class Storage {
    constructor( name ) {
        if( !name ) {
            throw new TypeError( `Expect a name for the storage, but a(n) ${name} is given.` );
        }

        this.name = `#LC-STORAGE-V-1.0#${name}#`;

        const abstracts = [ 'set', 'get', 'delete', 'clear', 'keys' ];

        for( let method of abstracts ) {

            if( !is.function( this[ method ] ) ) {
                throw new TypeError( `The method "${method}" must be declared in every class extends from Cache` );
            }
        }
    }

    format( data, options = {} ) {
        const input = {
            data,
            priority : options.priority === undefined ? 50 : options.priority,
            ctime : +new Date,
            lifetime : options.lifetime || 0
        };

        if( options.md5 ) {
            input.md5 = md5( JSON.stringify( data ) )
        }

        if( options.cookie ) {
            input.cookie = md5( document.cookie );
        }

        return input;
    }

    validate( data, options = {} ) {
        if( data.lifetime ) {
            console.log( +new Date, data.ctime, data.lifetime, new Date - data.ctime );
            if( new Date - data.ctime >= data.lifetime ) {
                return false;
            }
        }

        if( data.cookie ) {
            if( data.cookie !== md5( document.cookie ) ) {
                return false;
            }
        }

        if( data.md5 && options.md5 ) {
            if( data.md5 !== options.md5 ) {
                return false;
            }
            if( md5( data.data ) !== options.md5 ) {
                return false;
            }
        }

        return true;
    }

    clean() {
        return this.keys().then( keys => {
            const steps = []

            for( let key of keys ) {
                steps.push( () => this.get( key ) );
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
}
