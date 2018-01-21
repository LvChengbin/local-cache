import is from '@lvchengbin/is';

export default class Storage {
    constructor() {
        const abstracts = [ 'set', 'get', 'delete', 'clear', 'keys' ];

        for( let method of abstracts ) {

            if( !is.function( this[ method ] ) ) {
                throw new TypeError( `The method "${method}" must be declared in every class extends from Cache` );
            }
        }
    }
}
