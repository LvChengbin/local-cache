import Sequence from '@lvchengbin/sequence';

import Memory from './memory';
import SessionStorage from './session-storage';
import Persistent from './persistent';

const supportedModes = [
    'page',
    'session',
    'persistent'
];

const Storage = {
    set( key, value, options ) {
        if( !Array.isArray( options ) ) {
            options = [ options ];
        }

        for( let option of options ) {

        }
    },

    get( key, modes, options = {} ) {
        modes || ( modes = supportedModes );

        if( options === false ) {
        }
    },

    delete( key, modes ) {
        modes || ( modes = supportedModes );
    },

    clear( modes ) {
        modes || ( modes = supportedModes );
    }

};

export default Storage;
