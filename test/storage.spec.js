import Memory from '../src/memory';
import LocalStorage from '../src/local-storage';
import SessionStorage from '../src/session-storage';
import IDB from '../src/idb';

const storages = {
    Memory,
    LocalStorage,
    SessionStorage,
    IDB
};

describe( 'Storage', () => {

    const test = ( name, Storage ) => {

        describe( name, () => {
            const input = {
                data : 'data',
                ctime : +new Date,
                md5 : '328dsjfashfsjafokjf',
                lifetime : 2000,
                cookie : 'dsjkfajlkfjdaskfjaslfs',
                priority : 6
            };
            it( 'set', async done => {
                const storage = new Storage();
                await storage.set( 'key', input ).catch( e => {
                    console.log( 'Set error: ', e );
                } );
                const data = await storage.get( 'key' ).catch( e => {
                    console.log( 'Get error: ', e );
                } );

                expect( data ).toEqual( input );
                done();
            } );

            it( 'delete', async done => {
                const storage = new Storage();
                await storage.set( 'key', input ).catch( e => {
                    console.log( 'Set error: ', e );
                } );
                await storage.delete( 'key' ).catch( e => {
                    console.log( 'Delete error: ', e );
                } );
                storage.get( 'key' ).catch( () => {
                    done();
                } );
            } );

            it( 'keys', async done => {
                const storage = new Storage();
                await storage.set( 'key1', 'value' );
                await storage.set( 'key2', 'value' );
                storage.keys().then( keys => {
                    expect( keys ).toEqual( [ 'key1', 'key2' ] );
                    done();
                } );
            } );

            it( 'clear', async done => {
                const storage = new Storage();
                await storage.set( 'key1', input );
                await storage.set( 'key2', input );
                await storage.clear().catch( e => {
                    console.log( 'Clear error: ', e );
                } );
                storage.keys().then( keys => {
                    expect( keys ).toEqual( [] );
                    done();
                } ).catch( e => {
                    console.log( 'Get keys error: ', e );
                } );
            } );
        } );
    };

    for( let storage in storages ) {
        test( storage, storages[ storage ] );
    }
} );
