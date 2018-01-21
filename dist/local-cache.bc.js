(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@lvchengbin/sequence'), require('@lvchengbin/promise'), require('@lvchengbin/event-emitter')) :
	typeof define === 'function' && define.amd ? define(['@lvchengbin/sequence', '@lvchengbin/promise', '@lvchengbin/event-emitter'], factory) :
	(global.LocalCache = factory(global.sequence,global.Promise$1,global.EventEmitter));
}(this, (function (sequence,Promise$1,EventEmitter) { 'use strict';

sequence = sequence && sequence.hasOwnProperty('default') ? sequence['default'] : sequence;
Promise$1 = Promise$1 && Promise$1.hasOwnProperty('default') ? Promise$1['default'] : Promise$1;
EventEmitter = EventEmitter && EventEmitter.hasOwnProperty('default') ? EventEmitter['default'] : EventEmitter;

var isArguments = (function (obj) {
  return {}.toString.call(obj) === '[object Arguments]';
});

var isArray = (function (obj) {
  return Array.isArray(obj);
});

var isAsyncFunction = (function (fn) {
  return {}.toString.call(fn) === '[object AsyncFunction]';
});

var isFunction = (function (fn) {
  return {}.toString.call(fn) === '[object Function]' || isAsyncFunction(fn);
});

var isArrowFunction = (function (fn) {
    if (!isFunction(fn)) return false;
    return (/^(?:function)?\s*\(?[\w\s,]*\)?\s*=>/.test(fn.toString())
    );
});

var isBoolean = (function (s) {
  return typeof s === 'boolean';
});

var isDate = (function (date) {
  return {}.toString.call(date) === '[object Date]';
});

var isEmail = (function (str) {
  return (/^(([^#$%&*!+-/=?^`{|}~<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(str)
  );
});

var isString = (function (str) {
  return typeof str === 'string' || str instanceof String;
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var isObject = (function (obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
});

var isEmpty = (function (obj) {
    if (isArray(obj) || isString(obj)) {
        return !obj.length;
    }
    if (isObject(obj)) {
        return !Object.keys(obj).length;
    }
    return !obj;
});

var isError = (function (e) {
  return {}.toString.call(e) === '[object Error]';
});

var isFalse = (function (obj) {
    var generalized = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (isBoolean(obj) || !generalized) return !obj;
    if (isString(obj)) {
        return ['false', 'no', '0', '', 'nay', 'n', 'disagree'].indexOf(obj.toLowerCase()) > -1;
    }
    return !obj;
});

var isNumber = (function (n) {
    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if ({}.toString.call(n).toLowerCase() === '[object number]') {
        return true;
    }
    if (strict) return false;
    return !isNaN(n) && !/\.$/.test(n);
});

var isInteger = (function (n) {
    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


    if (isNumber(n, true)) return n % 1 === 0;

    if (strict) return false;

    if (isString(n)) {
        if (n === '-0') return true;
        return n.indexOf('.') < 0 && String(parseInt(n)) === n;
    }

    return false;
});

var isIterable = (function (obj) {
    try {
        return isFunction(obj[Symbol.iterator]);
    } catch (e) {
        return false;
    }
});

var isPromise = (function (p) {
  return p && isFunction(p.then);
});

var isRegExp = (function (reg) {
  return {}.toString.call(reg) === '[object RegExp]';
});

var isTrue = (function (obj) {
    var generalized = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (isBoolean(obj) || !generalized) return !!obj;
    if (isString(obj)) {
        return ['true', 'yes', 'ok', '1', 'yea', 'yep', 'y', 'agree'].indexOf(obj.toLowerCase()) > -1;
    }
    return !!obj;
});

function isUndefined () {
    return arguments.length > 0 && typeof arguments[0] === 'undefined';
}

var isUrl = (function (url) {
    if (!isString(url)) return false;
    if (!/^(https?|ftp):\/\//i.test(url)) return false;
    var a = document.createElement('a');
    a.href = url;
    return (/^(https?|ftp):/i.test(a.protocol)
    );
});

var is = {
    arguments: isArguments,
    array: isArray,
    arrowFunction: isArrowFunction,
    asyncFunction: isAsyncFunction,
    boolean: isBoolean,
    date: isDate,
    email: isEmail,
    empty: isEmpty,
    error: isError,
    false: isFalse,
    function: isFunction,
    integer: isInteger,
    iterable: isIterable,
    number: isNumber,
    object: isObject,
    promise: isPromise,
    regexp: isRegExp,
    string: isString,
    true: isTrue,
    undefined: isUndefined,
    url: isUrl
};

var Storage$2 = function (_EventEmitter) {
    inherits(Storage, _EventEmitter);

    function Storage() {
        classCallCheck(this, Storage);

        var _this = possibleConstructorReturn(this, (Storage.__proto__ || Object.getPrototypeOf(Storage)).call(this));

        var abstracts = ['set', 'get', 'delete', 'clear', 'keys', 'clean'];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = abstracts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var method = _step.value;


                if (!is.function(_this[method])) {
                    throw new TypeError('The method "' + method + '" must be declared in every class extends from Cache');
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return _this;
    }

    return Storage;
}(EventEmitter);

var Memory = function (_Storage) {
    inherits(Memory, _Storage);

    function Memory() {
        classCallCheck(this, Memory);

        var _this = possibleConstructorReturn(this, (Memory.__proto__ || Object.getPrototypeOf(Memory)).call(this));

        _this.data = {};
        return _this;
    }

    createClass(Memory, [{
        key: 'set',
        value: function set$$1(key, value) {
            this.data[key] = value;
            return Promise$1.resolve(value);
        }
    }, {
        key: 'get',
        value: function get$$1(key) {
            var data = this.data[key];

            if (!data) {
                return Promise$1.reject(data);
            }

            return Promise$1.reject(data);
        }
    }, {
        key: 'delete',
        value: function _delete(key) {
            this.data[key] = null;
            delete this.data[key];
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.data = {};
            return Promise$1.resolve();
        }
    }, {
        key: 'keys',
        value: function keys() {
            return Promise$1.resolve(Object.keys(this.data));
        }
    }, {
        key: 'clean',
        value: function clean() {
            var async = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            console.log(async);
        }
    }]);
    return Memory;
}(Storage$2);

var id = 0;

var SessionStorage = function (_Storage) {
    inherits(SessionStorage, _Storage);

    function SessionStorage() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, SessionStorage);

        var _this = possibleConstructorReturn(this, (SessionStorage.__proto__ || Object.getPrototypeOf(SessionStorage)).call(this));

        _this.prefix = options.prefix || '#J-STORAGE-PREFIX-' + id++ + '#';
        return _this;
    }

    createClass(SessionStorage, [{
        key: 'set',
        value: function set$$1(key, value) {
            try {
                sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
                return Promise$1.resolve(value);
            } catch (e) {
                return Promise$1.reject(e);
            }
        }
    }, {
        key: 'get',
        value: function get$$1(key) {
            var data = void 0;

            try {
                data = JSON.parse(sessionStorage.getItem(this.prefix + key));
            } catch (e) {
                this.delete(key);
                return Promise$1.reject(null);
            }

            if (data === null) {
                return Promise$1.reject(data);
            }

            return Promise$1.reject(data);
        }
    }, {
        key: 'delete',
        value: function _delete(key) {
            sessionStorage.removeItem(this.prefix + key);
            return Promise$1.resolve();
        }
    }, {
        key: 'clear',
        value: function clear() {
            sessionStorage.clear();
            return Promise$1.resolve();
        }
    }, {
        key: 'keys',
        value: function keys() {
            var keys = [];
            var prefix = this.prefix;
            var l = this.prefix.length;

            for (var key in sessionStorage) {
                if (key.indexOf(prefix)) continue;
                keys.push(key.substr(l));
            }

            return Promise$1.resolve(keys);
        }
    }, {
        key: 'clean',
        value: function clean() {
            var async = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            console.log(async);
        }
    }]);
    return SessionStorage;
}(Storage$2);

/**
 * IE 9 doesn't support IndexedDB and there was no vendor prefix added to IndexedDB object from IE10
 * Mozilla removed the prefix from version 16.
 * Chrome removed the prefix from version 24.
 */

window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: 'readwrite' };
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

var IDB = function () {
    function IDB(database, version) {
        var autoopen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        classCallCheck(this, IDB);

        this.instance = null;

        database && (this.database = database);
        version && (this.version = version);

        if (autoopen) {
            this.open(this.database, this.version);
        }
    }

    createClass(IDB, [{
        key: 'db',
        value: function db(_db) {
            if (_db) {
                this.instance = _db;
                _db.onerror = function () {};
            }
            return _db;
        }
    }, {
        key: 'open',
        value: function open(database, version) {
            var _this = this;

            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


            database || (database = this.database);
            version || (version = this.version);

            if (!database || !version) {
                throw new TypeError('the database name and version cannot be empty');
            }

            console.log(database, version);

            var request = window.indexedDB.open(database, version);

            var resolve = void 0,
                reject = void 0;

            var promise = new Promise(function (r1, r2) {
                resolve = r1;
                reject = r2;
            });

            request.onsuccess = function (e) {
                _this.db(e.target.result);
                resolve(e);
            };

            request.onerror = function (e) {
                reject(e);
                console.log('error: ', e);
            };

            if (options.oncomplete) {
                request.oncomplete = options.oncomplete;
            }

            if (options.onblocked) {
                request.onblocked = options.onblocked;
            }

            if (options.onabort) {
                request.onabort = options.onabort;
            }

            if (options.onupgradeneeded) {
                request.onupgradeneeded = options.onupgradeneeded;
            }

            return promise;
        }
    }, {
        key: 'add',
        value: function add(store, value) {}
    }, {
        key: 'delete',
        value: function _delete(store, key) {}
    }, {
        key: 'get',
        value: function get$$1(store, key) {}
    }, {
        key: 'update',
        value: function update(store) {}
    }]);
    return IDB;
}();

if (window.indexedDB) {
    
}

var supportedModes = ['page', 'session', 'persistent'];

var Storage = {
    set: function set(key, value, options) {},
    get: function get(key, modes) {
        modes || (modes = supportedModes);

        
    },
    delete: function _delete(key, modes) {
        modes || (modes = supportedModes);
    },
    clear: function clear(models) {
        modes || (modes = supportedModes);
    }
};

return Storage;

})));
