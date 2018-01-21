(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@lvchengbin/sequence'), require('@lvchengbin/promise'), require('@lvchengbin/event-emitter')) :
	typeof define === 'function' && define.amd ? define(['@lvchengbin/sequence', '@lvchengbin/promise', '@lvchengbin/event-emitter'], factory) :
	(global.LocalCache = factory(global.sequence,global.Promise$1,global.EventEmitter));
}(this, (function (sequence,Promise$1,EventEmitter) { 'use strict';

sequence = sequence && sequence.hasOwnProperty('default') ? sequence['default'] : sequence;
Promise$1 = Promise$1 && Promise$1.hasOwnProperty('default') ? Promise$1['default'] : Promise$1;
EventEmitter = EventEmitter && EventEmitter.hasOwnProperty('default') ? EventEmitter['default'] : EventEmitter;

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

return Storage;

})));
