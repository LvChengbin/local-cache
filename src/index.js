import Sequence from '@lvchengbin/sequence';
import md5 from './md5';
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

const LocalCache = {
    page : new Memory(),
    session : new SessionStorage(),
    persistent : new Persistent(),
    set( key, data, options ) {

        const steps = [];

        for( let mode of supportedModes ) {
            const opts = options[ mode ];
            if( !options[ mode ] ) continue;

            const input = {
                data,
                priority : opts.priority === undefined ? 50 : opts.priority,
                ctime : +new Date,
                lifetime : opts.lifetime || 0
            };

            if( opts.md5 ) {
                // to calculate the md5 value of data string.
                input.md5 = md5( JSON.stringify( data ) );
            }

            if( opts.cookie ) {
                input.cookie = md5( document.cookie );
            }

            steps.push( () => this[ mode ].set( key, input ) );
        }

        if( !steps.length ) {
            throw new TypeError( `You must specify at least one mode in [${supportedModes.join(', ')}]` );
        }

        return Sequence.all( steps ).then( () => data );
    },

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
    },

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
    },

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
    },

    clean() {
        const steps = [];
        for( let mode of supportedModes ) {
            steps.push( () => this[ mode ].clean() );
        }
        return Promise.all( steps );
    }

};

export default LocalCache;
