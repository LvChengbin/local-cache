import Sequence from '@lvchengbin/sequence';
import LocalCache from '../src/index';

describe( 'LocalCache', () => {
    const lc = new LocalCache( 'test' )

    it( 'set in page', async done => {

        Sequence.all( [
            () => {
                return lc.set( 'key', 'data', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] )
        ] ).then( results => {
            expect( results[ 1 ].value.data ).toEqual( 'data' );
            expect( results[ 2 ].value.data ).toEqual( 'data' );
            expect( results[ 3 ].value.data ).toEqual( 'data' );
            done();
        } );
    } );

    it( 'data can be update', async done => {

        Sequence.all( [
            () => {
                return lc.set( 'key', 'update', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] )
        ] ).then( results => {
            expect( results[ 1 ].value.data ).toEqual( 'update' );
            expect( results[ 2 ].value.data ).toEqual( 'update' );
            expect( results[ 3 ].value.data ).toEqual( 'update' );
            done();
        } );
    } );

    it( 'delete part of the data', async done => {

        Sequence.chain( [
            () => {
                return lc.set( 'key', 'update', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.delete( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] ),
            () => lc.get( 'key', [ 'page', 'persistent' ] )
        ] ).then( results => {
            expect( results[ 2 ].status ).toEqual( Sequence.FAILED );
            expect( results[ 3 ].value.data ).toEqual( 'update' );
            expect( results[ 4 ].value.data ).toEqual( 'update' );
            expect( results[ 5 ].value.data ).toEqual( 'update' );
            done();
        } );
    } );

    it( 'to clear all the data', async done => {

        Sequence.chain( [
            () => {
                return lc.set( 'key', 'update', {
                    page : true,
                    session : true,
                    persistent : true
                } );
            },
            () => lc.clear( [ 'page', 'session', 'persistent' ] ),
            () => lc.get( 'key', [ 'page' ] ),
            () => lc.get( 'key', [ 'session' ] ),
            () => lc.get( 'key', [ 'persistent' ] ),
            () => lc.get( 'key', [ 'page', 'persistent' ] )
        ] ).then( results => {
            expect( results[ 2 ].status ).toEqual( Sequence.FAILED );
            expect( results[ 3 ].status ).toEqual( Sequence.FAILED );
            expect( results[ 4 ].status ).toEqual( Sequence.FAILED );
            expect( results[ 5 ].status ).toEqual( Sequence.FAILED );
            done();
        } );
    } );

    it( 'set data with valid conditions', async done => {
        Sequence.chain( [
            () => {
                return lc.set( 'key', 'update', {
                    page : {
                        lifetime : 15
                    },
                    persistent : {
                        lifetime : 45
                    }
                } );
            },
            () => lc.get( 'key', [ 'page' ] ), // 15ms Y
            () => lc.get( 'key', [ 'persistent' ] ), // 30ms Y
            () => {
                return new Promise( resolve => {
                    setTimeout( () => {
                        resolve( lc.get( 'key', [ 'page' ] ) );
                    }, 15 );
                } );
            },
            () => lc.get( 'key', [ 'persistent' ] ),
            () => {
                return new Promise( resolve => {
                    setTimeout( () => {
                        resolve( lc.get( 'key', [ 'persistent' ] ) );
                    }, 15 );
                } );
            },
        ] ).then( results => {
            expect( results[ 1 ].status ).toEqual( Sequence.SUCCEEDED );
            expect( results[ 2 ].status ).toEqual( Sequence.SUCCEEDED );
            expect( results[ 3 ].status ).toEqual( Sequence.FAILED );
            expect( results[ 4 ].status ).toEqual( Sequence.SUCCEEDED );
            expect( results[ 5 ].status ).toEqual( Sequence.FAILED );
            done();
        } );

    } );

} );
