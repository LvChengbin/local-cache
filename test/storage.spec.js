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
            const options = {
                lifetime : 2000,
                priority : 6
            };
            it( 'set', async done => {
                const storage = new Storage( 'test-1' );
                await storage.set( 'key', 'data', options ).catch( e => {
                    console.log( 'Set error: ', e );
                } );
                const data = await storage.get( 'key' ).catch( e => {
                    console.log( 'Get error: ', e );
                } );

                expect( data.data ).toEqual( 'data' );
                done();
            } );

            it( 'delete', async done => {
                const storage = new Storage( 'test-2' );
                await storage.set( 'key', 'data', options ).catch( e => {
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
                const storage = new Storage( 'test-3' );
                await storage.set( 'key1', 'value' );
                await storage.set( 'key2', 'value' );
                storage.keys().then( keys => {
                    expect( keys ).toEqual( [ 'key1', 'key2' ] );
                    done();
                } );
            } );

            it( 'clear', async done => {
                const storage = new Storage( 'test-4' );
                await storage.set( 'key1', 'data', options );
                await storage.set( 'key2', 'data', options );
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

        it( 'validating lifetime', async done => {
            const options = {
                lifetime : 50,
                priority : 6
            };

            const storage = new Storage( 'test-5' );

            await storage.set( 'key', 'data', options ).catch( e => {
                console.log( 'Set error: ', e );
            } );

            setTimeout( () => {
                storage.get( 'key' ).catch( () => {
                    done();
                } );
            }, 51 );
        } );

        it( 'validating cookie', async done => {
            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true
            };

            const storage = new Storage( 'test-6' );

            await storage.set( 'key', 'data', options ).catch( e => {
                console.log( 'Set error: ', e );
            } );

            document.cookie = 'x=' + +new Date;

            storage.get( 'key' ).catch( () => {
                done();
            } );
        } );

        it( 'validating md5', async done => {

            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true,
                md5 : true
            };

            const storage = new Storage( 'test-7' );

            await storage.set( 'key2', 'data', options ).catch( e => {
                console.log( 'Set error: ', e );
            } );

            storage.get( 'key', { md5 : 'xxxx' } ).catch( () => {
                done();
            } );
        } );
    };

    for( let storage in storages ) {
        test( storage, storages[ storage ] );
    }
} );
