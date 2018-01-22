import Promise from '@lvchengbin/promise';
import Storage from './storage';

export default class Memory extends Storage {
    constructor( name ) {
        super( name );
        this.data = {};
    }

    set( key, data, options = {} ) {
        data = this.format( data, options );
        this.data[ key ] = data;
        return Promise.resolve( data );
    }

    get( key, options = {} ) {
        const data = this.data[ key ];

        if( !data ) return Promise.reject();

        if( this.validate( data, options ) === false ) {
            this.delete( key );
            return Promise.reject();
        }

        return Promise.resolve( data );
    }

    delete( key ) {
        this.data[ key ] = null;
        delete this.data[ key ];
        return Promise.resolve();
    }

    keys() {
        return Promise.resolve( Object.keys( this.data ) );
    }

    clear() {
        this.data = {};
        return Promise.resolve();
    }
}
