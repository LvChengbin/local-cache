import Sequence from '@lvchengbin/sequence';
import isObject from '@lvchengbin/is/src/object';
import Memory from './memory';
import SessionStorage from './session-storage';
import Persistent from './persistent';

/**
 * please don't change the order of items in this array.
 */
const supportedModes = [
    'page',
    'session',
    'persistent'
];

class LocalCache {
    constructor( name ) {
        this.page = new Memory( name );
        this.session = new SessionStorage( name );
        this.persistent = new Persistent( name );
    }
    set( key, data, options ) {

        const steps = [];

        for( let mode of supportedModes ) {
            if( !options[ mode ] ) continue;

            let opts = options[ mode ];

            if( opts === false ) continue;

            if( !isObject( opts ) ) {
                opts = {};
            }
            
            steps.push( () => this[ mode ].set( key, data, opts ) );
        }

        if( !steps.length ) {
            throw new TypeError( `You must specify at least one mode in [${supportedModes.join(', ')}]` );
        }

        return Sequence.all( steps ).then( () => data );
    }

    get( key, modes, options = {} ) {
        modes || ( modes = supportedModes );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${supportedModes.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].get( key, options ) );
        }

        return Sequence.any( steps ).then( results => {
            return results[ results.length - 1 ].value;
        } );
    }

    delete( key, modes ) {
        modes || ( modes = supportedModes );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${supportedModes.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].delete( key ) );
        }

        return Sequence.all( steps );
    }

    clear( modes ) {
        modes || ( modes = supportedModes );

        const steps = [];

        for( let mode of modes ) {
            if( !this[ mode ] ) {
                throw new TypeError( `Unexcepted mode "${mode}", excepted one of: ${supportedModes.join( ', ' )}` );
            }
            steps.push( () => this[ mode ].clear() );
        }

        return Sequence.all( steps );
    }

    clean() {
        const steps = [];
        for( let mode of supportedModes ) {
            steps.push( () => this[ mode ].clean() );
        }
        return Promise.all( steps );
    }

}

export default LocalCache;
