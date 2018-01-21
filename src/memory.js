import Promise from '@lvchengbin/promise';
import Storage from './storage';

export default class Memory extends Storage {
    constructor() {
        super();
        this.data = {};
    }

    set( key, data ) {
        this.data[ key ] = data;
        return Promise.resolve( data );
    }

    get( key ) {
        if( !this.data.hasOwnProperty( key ) ) {
            return Promise.reject();
        }

        return Promise.resolve( this.data[ key ] );
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
