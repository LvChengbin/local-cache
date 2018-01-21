'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sequence = _interopDefault(require('@lvchengbin/sequence'));
var Promise$1 = _interopDefault(require('@lvchengbin/promise'));
var EventEmitter = _interopDefault(require('@lvchengbin/event-emitter'));

/**
 * IE 9 doesn't support IndexedDB and there was no vendor prefix added to IndexedDB object from IE10
 * Mozilla removed the prefix from version 16.
 * Chrome removed the prefix from version 24.
 */

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE : 'readwrite' };
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

if( window.indexedDB ) {
    
}

const supportedModes = [
    'page',
    'session',
    'persistent'
];

const Storage = {
    set( key, value, options ) {



    },

    get( key, modes, options = {} ) {
        modes || ( modes = supportedModes );

        
    },

    delete( key, modes ) {
        modes || ( modes = supportedModes );
    },

    clear( models ) {
        modes || ( modes = supportedModes );
    }

};

module.exports = Storage;
