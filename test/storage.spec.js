import Sequence from '@lvchengbin/sequence';

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
            it( 'set', done => {
                const storage = new Storage( 'test-1' );
                Sequence.all( [
                    () => {
                        return storage.set( 'key', 'data', options ).catch( e => {
                            console.log( 'Set error: ', e );
                        } );
                    },
                    () => {
                        return storage.get( 'key' ).catch( e => {
                            console.log( 'Get error: ', e );
                        } );
                    }
                ] ).then( results => {
                    expect( results[ 1 ].value.data ).toEqual( 'data' );
                    done();
                } );
            } );

            it( 'delete', done => {
                const storage = new Storage( 'test-2' );

                Sequence.all( [
                    () => {
                        return storage.set( 'key', 'data', options ).catch( e => {
                            console.log( 'Set error: ', e );
                        } );
                    },
                    () => {
                        return storage.delete( 'key' ).catch( e => {
                            console.log( 'Delete error: ', e );
                        } );
                    },
                    () => {
                        return storage.get( 'key' ).catch( () => {
                            done();
                        } );
                    }
                ] );
            } );

            it( 'keys', done => {
                const storage = new Storage( 'test-3' );
                Sequence.all( [
                    () => storage.set( 'key1', 'value' ),
                    () => storage.set( 'key2', 'value' ),
                    () => {
                        return storage.keys().then( keys => {
                            expect( keys ).toEqual( [ 'key1', 'key2' ] );
                            done();
                        } );
                    }
                ] );
            } );

            it( 'clear', done => {
                const storage = new Storage( 'test-4' );
                Sequence.all( [
                    () => storage.set( 'key1', 'data', options ),
                    () => storage.set( 'key2', 'data', options ),
                    () => {
                        return storage.clear().catch( e => {
                            console.log( 'Clear error: ', e );
                        } );
                    },
                    () => {
                        return storage.keys().then( keys => {
                            expect( keys ).toEqual( [] );
                            done();
                        } ).catch( e => {
                            console.log( 'Get keys error: ', e );
                        } );
                    }
                ] );
            } );
        } );

        it( 'validating lifetime', done => {
            const options = {
                lifetime : 50,
                priority : 6
            };

            const storage = new Storage( 'test-5' );

            Sequence.all( [
                () => {
                    return storage.set( 'key', 'data', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    return storage.get( 'key' ).catch( () => {
                        done();
                    } );
                }
            ], 50 );
        } );

        it( 'validating cookie', done => {
            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true
            };

            const storage = new Storage( 'test-6' );

            Sequence.all( [

                () => {
                    return storage.set( 'key', 'data', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    document.cookie = 'x=' + +new Date;
                    return storage.get( 'key' ).catch( () => {
                        done();
                    } );
                }
            ] );
        } );

        it( 'validating md5', done => {

            const options = {
                lifetime : 50,
                priority : 6,
                cookie : true,
                md5 : true
            };

            const storage = new Storage( 'test-7' );

            Sequence.all( [
                () => {
                    return storage.set( 'key2', 'data', options ).catch( e => {
                        console.log( 'Set error: ', e );
                    } );
                },
                () => {
                    return storage.get( 'key', { md5 : 'xxxx' } ).catch( () => {
                        done();
                    } );
                }
            ] );
        } );
    };

    for( let storage in storages ) {
        test( storage, storages[ storage ] );
    }
} );
