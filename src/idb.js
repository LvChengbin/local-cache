import Storage from './storage';

export default class IDB extends Storage {
    constructor( database, version = 1 ) {
        super();
        if( !database ) {
            database = 'LC-STORAGE-V-1.0';
        }

        this.idb = null;

        this.ready = this.open( database, version ).then( () => {
            this.idb.onerror = e => {
                console.warn( 'IDB Error', e );
            };
            return this.idb;
        } );

    }

    open( database, version ) {

        const request = window.indexedDB.open( database, version );

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
        os.createIndex( 'ctime', 'ctime', { unique : false } );
        os.createIndex( 'md5', 'md5', { unique : false } );
        os.createIndex( 'lifetime', 'lifetime', { unique : false } );
        os.createIndex( 'cookie', 'cookie', { unique : false } );
        os.createIndex( 'priority', 'priority', { unique : false } );
        os.createIndex( 'expire', 'expire', { unique : false } );
    }

    store( write = false ) {
        return this.idb.transaction( [ 'storage' ], write ? 'readwrite' : 'readonly' ).objectStore( 'storage' );
    }

    set( key, data ) {

        return this.ready.then( () => {
            return new Promise( ( resolve, reject ) => {
                const objectStore = this.store( true );
                // don't manipulate the origin data
                const request = objectStore.put( Object.assign( { key }, data ) );

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
                const objectStore = this.store( true );
                const request = objectStore.delete( key );

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
                const objectStore = this.store();
                const request = objectStore.get( key );

                request.onsuccess = () => {
                    const data = request.result;
                    if( !data ) {
                        return reject();
                    }

                    if( this.validate( data, options ) === false ) {
                        this.delete( key ); 
                        return Promise.reject();
                    }
                    delete data.key;
                    resolve( data );
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
                const objectStore = this.store( true );
                const request = objectStore.clear();

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
                const objectStore = this.store();
                const request = objectStore.getAllKeys();

                request.onsuccess = () => {
                    resolve( request.result );
                };

                request.onerror = () => {
                    reject();
                };
            } );
        } );
    }

    clean() {
    }

}
