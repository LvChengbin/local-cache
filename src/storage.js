import is from '@lvchengbin/is';

import md5 from './md5';

export default class Storage {
    constructor() {
        const abstracts = [ 'set', 'get', 'delete', 'clear', 'keys', 'clean' ];

        for( let method of abstracts ) {

            if( !is.function( this[ method ] ) ) {
                throw new TypeError( `The method "${method}" must be declared in every class extends from Cache` );
            }
        }
    }

    validate( data, options = {} ) {
        if( data.lifetime ) {
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
        }

        return true;
    }
}
