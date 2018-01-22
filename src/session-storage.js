import Promise from '@lvchengbin/promise';
import Storage from './storage';

export default class SessionStorage extends Storage {
    constructor( options  = {} ) {
        super();
        this.prefix = options.prefix || '#LC-STORAGE-V-1.0#';
    }

    set( key, data ) {
        try {
            sessionStorage.setItem( this.prefix + key, JSON.stringify( data ) );
            return Promise.resolve( data );
        } catch( e ) {
            return Promise.reject( e );
        }
    }

    get( key, options = {} ) {
        let data;
        
        try {
            data = JSON.parse( sessionStorage.getItem( this.prefix + key ) );

            if( !data ) return Promise.reject();

            if( this.validate( data, options ) === false ) {
                this.delete( key );
                return Promise.reject();
            }
        } catch( e ) {
            this.delete( key );
            return Promise.reject( null );
        }

        return data === null ? Promise.reject() : Promise.resolve( data );
    }

    delete( key ) {
        sessionStorage.removeItem( this.prefix + key );  
        return Promise.resolve();
    }

    clear() {
        sessionStorage.clear();
        return Promise.resolve();
    }

    keys() {
        const keys = [];
        const prefix = this.prefix;
        const l = this.prefix.length;

        for( let key in sessionStorage ) {
            if( key.indexOf( prefix ) ) continue;
            keys.push( key.substr( l ) );
        }

        return Promise.resolve( keys );
    }

    clean() {
    }
}
