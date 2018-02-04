(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.LocalCache = factory());
}(this, (function () { 'use strict';

var isAsyncFunction = (function (fn) {
  return {}.toString.call(fn) === '[object AsyncFunction]';
});

var isFunction = (function (fn) {
  return {}.toString.call(fn) === '[object Function]' || isAsyncFunction(fn);
});

var isPromise = (function (p) {
  return p && isFunction(p.then);
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





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};



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

var Promise$1 = function () {
    function Promise(fn) {
        classCallCheck(this, Promise);

        if (!(this instanceof Promise)) {
            throw new TypeError(this + ' is not a promise ');
        }

        if (!isFunction(fn)) {
            throw new TypeError('Promise resolver ' + fn + ' is not a function');
        }

        this['[[PromiseStatus]]'] = 'pending';
        this['[[PromiseValue]]'] = null;
        this['[[PromiseThenables]]'] = [];
        try {
            fn(promiseResolve.bind(null, this), promiseReject.bind(null, this));
        } catch (e) {
            if (this['[[PromiseStatus]]'] === 'pending') {
                promiseReject.bind(null, this)(e);
            }
        }
    }

    createClass(Promise, [{
        key: 'then',
        value: function then(resolved, rejected) {
            var promise = new Promise(function () {});
            this['[[PromiseThenables]]'].push({
                resolve: isFunction(resolved) ? resolved : null,
                reject: isFunction(rejected) ? rejected : null,
                called: false,
                promise: promise
            });
            if (this['[[PromiseStatus]]'] !== 'pending') promiseExecute(this);
            return promise;
        }
    }, {
        key: 'catch',
        value: function _catch(reject) {
            return this.then(null, reject);
        }
    }]);
    return Promise;
}();

Promise$1.resolve = function (value) {
    if (!isFunction(this)) {
        throw new TypeError('Promise.resolve is not a constructor');
    }
    /**
     * @todo
     * check if the value need to return the resolve( value )
     */
    return new Promise$1(function (resolve) {
        resolve(value);
    });
};

Promise$1.reject = function (reason) {
    if (!isFunction(this)) {
        throw new TypeError('Promise.reject is not a constructor');
    }
    return new Promise$1(function (resolve, reject) {
        reject(reason);
    });
};

Promise$1.all = function (promises) {
    var rejected = false;
    var res = [];
    return new Promise$1(function (resolve, reject) {
        var remaining = 0;
        var then = function then(p, i) {
            if (!isPromise(p)) {
                p = Promise$1.resolve(p);
            }
            p.then(function (value) {
                res[i] = value;
                if (--remaining === 0) {
                    resolve(res);
                }
            }, function (reason) {
                if (!rejected) {
                    reject(reason);
                    rejected = true;
                }
            });
        };

        var i = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = promises[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var promise = _step.value;

                then(promise, remaining = i++);
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
    });
};

Promise$1.race = function (promises) {
    var resolved = false;
    var rejected = false;

    return new Promise$1(function (resolve, reject) {
        function onresolved(value) {
            if (!resolved && !rejected) {
                resolve(value);
                resolved = true;
            }
        }

        function onrejected(reason) {
            if (!resolved && !rejected) {
                reject(reason);
                rejected = true;
            }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = promises[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var promise = _step2.value;

                if (!isPromise(promise)) {
                    promise = Promise$1.resolve(promise);
                }
                promise.then(onresolved, onrejected);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    });
};

function promiseExecute(promise) {
    var thenable, p;

    if (promise['[[PromiseStatus]]'] === 'pending') return;
    if (!promise['[[PromiseThenables]]'].length) return;

    var then = function then(p, t) {
        p.then(function (value) {
            promiseResolve(t.promise, value);
        }, function (reason) {
            promiseReject(t.promise, reason);
        });
    };

    while (promise['[[PromiseThenables]]'].length) {
        thenable = promise['[[PromiseThenables]]'].shift();

        if (thenable.called) continue;

        thenable.called = true;

        if (promise['[[PromiseStatus]]'] === 'resolved') {
            if (!thenable.resolve) {
                promiseResolve(thenable.promise, promise['[[PromiseValue]]']);
                continue;
            }
            try {
                p = thenable.resolve.call(null, promise['[[PromiseValue]]']);
            } catch (e) {
                then(Promise$1.reject(e), thenable);
                continue;
            }
            if (p && (typeof p === 'function' || (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object') && p.then) {
                then(p, thenable);
                continue;
            }
        } else {
            if (!thenable.reject) {
                promiseReject(thenable.promise, promise['[[PromiseValue]]']);
                continue;
            }
            try {
                p = thenable.reject.call(null, promise['[[PromiseValue]]']);
            } catch (e) {
                then(Promise$1.reject(e), thenable);
                continue;
            }
            if ((typeof p === 'function' || (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object') && p.then) {
                then(p, thenable);
                continue;
            }
        }
        promiseResolve(thenable.promise, p);
    }
    return promise;
}

function promiseResolve(promise, value) {
    if (!(promise instanceof Promise$1)) {
        return new Promise$1(function (resolve) {
            resolve(value);
        });
    }
    if (promise['[[PromiseStatus]]'] !== 'pending') return;
    if (value === promise) {
        /**
         * thie error should be thrown, defined ES6 standard
         * it would be thrown in Chrome but not in Firefox or Safari
         */
        throw new TypeError('Chaining cycle detected for promise #<Promise>');
    }

    if (value !== null && (typeof value === 'function' || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object')) {
        var then;

        try {
            then = value.then;
        } catch (e) {
            return promiseReject(promise, e);
        }

        if (typeof then === 'function') {
            then.call(value, promiseResolve.bind(null, promise), promiseReject.bind(null, promise));
            return;
        }
    }
    promise['[[PromiseStatus]]'] = 'resolved';
    promise['[[PromiseValue]]'] = value;
    promiseExecute(promise);
}

function promiseReject(promise, value) {
    if (!(promise instanceof Promise$1)) {
        return new Promise$1(function (resolve, reject) {
            reject(value);
        });
    }
    promise['[[PromiseStatus]]'] = 'rejected';
    promise['[[PromiseValue]]'] = value;
    promiseExecute(promise);
}

var isString = (function (str) {
  return typeof str === 'string' || str instanceof String;
});

var isRegExp = (function (reg) {
  return {}.toString.call(reg) === '[object RegExp]';
});

var EventEmitter = function () {
    function EventEmitter() {
        classCallCheck(this, EventEmitter);

        this.__listeners = {};
    }

    createClass(EventEmitter, [{
        key: 'alias',
        value: function alias(name, to) {
            this[name] = this[to].bind(this);
        }
    }, {
        key: 'on',
        value: function on(evt, handler) {
            var listeners = this.__listeners;
            listeners[evt] ? listeners[evt].push(handler) : listeners[evt] = [handler];
            return this;
        }
    }, {
        key: 'once',
        value: function once(evt, handler) {
            var _this = this;

            var _handler = function _handler() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                handler.apply(_this, args);
                _this.removeListener(evt, _handler);
            };
            return this.on(evt, _handler);
        }
    }, {
        key: 'removeListener',
        value: function removeListener(evt, handler) {
            var listeners = this.__listeners,
                handlers = listeners[evt];

            if (!handlers || !handlers.length) {
                return this;
            }

            for (var i = 0; i < handlers.length; i += 1) {
                handlers[i] === handler && (handlers[i] = null);
            }

            setTimeout(function () {
                for (var _i = 0; _i < handlers.length; _i += 1) {
                    handlers[_i] || handlers.splice(_i--, 1);
                }
            }, 0);

            return this;
        }
    }, {
        key: 'emit',
        value: function emit(evt) {
            var handlers = this.__listeners[evt];
            if (handlers) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                for (var i = 0, l = handlers.length; i < l; i += 1) {
                    var _handlers$i;

                    handlers[i] && (_handlers$i = handlers[i]).call.apply(_handlers$i, [this].concat(args));
                }
                return true;
            }
            return false;
        }
    }, {
        key: 'removeAllListeners',
        value: function removeAllListeners(rule) {
            var checker = void 0;
            if (isString(rule)) {
                checker = function checker(name) {
                    return rule === name;
                };
            } else if (isFunction(rule)) {
                checker = rule;
            } else if (isRegExp(rule)) {
                checker = function checker(name) {
                    rule.lastIndex = 0;
                    return rule.test(name);
                };
            }

            var listeners = this.__listeners;
            for (var attr in listeners) {
                if (checker(attr)) {
                    listeners[attr] = null;
                    delete listeners[attr];
                }
            }
        }
    }]);
    return EventEmitter;
}();

function isUndefined () {
    return arguments.length > 0 && typeof arguments[0] === 'undefined';
}

function config() {
    return {
        promises: [],
        results: [],
        index: 0,
        steps: [],
        busy: false,
        promise: Promise$1.resolve()
    };
}
/**
 * new Sequence( false, [] )
 * new Sequence( [] )
 */

var Sequence = function (_EventEmitter) {
    inherits(Sequence, _EventEmitter);

    function Sequence(steps) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        classCallCheck(this, Sequence);

        var _this = possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this));

        _this.__resolve = null;
        _this.running = false;
        _this.suspended = false;
        _this.suspendTimeout = null;
        _this.interval = options.interval || 0;

        Object.assign(_this, config());

        steps && _this.append(steps);

        options.autorun !== false && setTimeout(function () {
            _this.run();
        }, 0);
        return _this;
    }

    /**
     * to append new steps to the sequence
     */


    createClass(Sequence, [{
        key: 'append',
        value: function append(steps) {
            var dead = this.index >= this.steps.length;

            if (isFunction(steps)) {
                this.steps.push(steps);
            } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var step = _step.value;

                        this.steps.push(step);
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
            }
            this.running && dead && this.next(true);
        }
    }, {
        key: 'go',
        value: function go(n) {
            if (isUndefined(n)) return;
            this.index = n;
            if (this.index > this.steps.length) {
                this.index = this.steps.length;
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            Object.assign(this, config());
        }
    }, {
        key: 'next',
        value: function next() {
            var _this2 = this;

            var inner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            if (!inner && this.running) {
                console.warn('Please do not call next() while the sequence is running.');
                return Promise$1.reject(new Sequence.Error({
                    errno: 2,
                    errmsg: 'Cannot call next during the sequence is running.'
                }));
            }

            /**
             * If there is a step that is running,
             * return the promise instance of the running step.
             */
            if (this.busy || this.suspended) return this.promise;

            /**
             * If already reached the end of the sequence,
             * return a rejected promise instance with a false as its reason.
             */
            if (!this.steps[this.index]) {
                return Promise$1.reject(new Sequence.Error({
                    errno: 1,
                    errmsg: 'no more step can be executed.'
                }));
            }

            this.busy = true;

            return this.promise = this.promise.then(function () {
                var step = _this2.steps[_this2.index];
                var promise = step(_this2.results[_this2.results.length - 1], _this2.index, _this2.results);
                /**
                 * if the step function doesn't return a promise instance,
                 * create a resolved promise instance with the returned value as its value
                 */
                if (!isPromise(promise)) {
                    promise = Promise$1.resolve(promise);
                }
                return promise.then(function (value) {
                    var result = {
                        status: Sequence.SUCCEEDED,
                        index: _this2.index,
                        value: value,
                        time: +new Date()
                    };
                    _this2.results.push(result);
                    _this2.emit('success', result, _this2.index, _this2);
                    return result;
                }).catch(function (reason) {
                    var result = {
                        status: Sequence.FAILED,
                        index: _this2.index,
                        reason: reason,
                        time: +new Date()
                    };
                    _this2.results.push(result);
                    _this2.emit('failed', result, _this2.index, _this2);
                    return result;
                }).then(function (result) {
                    _this2.index++;
                    _this2.busy = false;
                    if (!_this2.steps[_this2.index]) {
                        _this2.emit('end', _this2.results, _this2);
                    } else {
                        setTimeout(function () {
                            _this2.running && _this2.next(true);
                        }, _this2.interval);
                    }
                    return result;
                });
            });
        }
    }, {
        key: 'run',
        value: function run() {
            if (this.running) return;
            this.running = true;
            this.next(true);
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.running = false;
        }
    }, {
        key: 'suspend',
        value: function suspend() {
            var _this3 = this;

            var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

            this.suspended = true;
            this.suspendTimeout && clearTimeout(this.suspendTimeout);
            this.suspendTimeout = setTimeout(function () {
                _this3.suspended = false;
                _this3.running && _this3.next(true);
            }, duration);
        }
    }]);
    return Sequence;
}(EventEmitter);

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.all = function (steps) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!steps.length) {
        return Promise$1.resolve([]);
    }
    var sequence = new Sequence(steps, { interval: interval });
    return new Promise$1(function (resolve, reject) {
        sequence.on('end', function (results) {
            resolve(results);
        });
        sequence.on('failed', function () {
            sequence.stop();
            reject(sequence.results);
        });
    });
};

Sequence.chain = function (steps) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!steps.length) {
        return Promise$1.resolve([]);
    }
    var sequence = new Sequence(steps, { interval: interval });
    return new Promise$1(function (resolve) {
        sequence.on('end', function (results) {
            resolve(results);
        });
    });
};

Sequence.any = function (steps) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (!steps.length) {
        return Promise$1.reject([]);
    }
    var sequence = new Sequence(steps, { interval: interval });
    return new Promise$1(function (resolve, reject) {
        sequence.on('success', function () {
            resolve(sequence.results);
            sequence.stop();
        });

        sequence.on('end', function () {
            reject(sequence.results);
        });
    });
};

Sequence.Error = function () {
    function _class(options) {
        classCallCheck(this, _class);

        Object.assign(this, options);
    }

    return _class;
}();

var isObject = (function (obj) {
  return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !Array.isArray(obj);
});

var isNumber = (function (n) {
    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if ({}.toString.call(n).toLowerCase() === '[object number]') {
        return true;
    }
    if (strict) return false;
    return !isNaN(parseFloat(n)) && isFinite(n) && !/\.$/.test(n);
});

var isDate = (function (date) {
  return {}.toString.call(date) === '[object Date]';
});

var md5 = (function () {
    var safe_add = function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return msw << 16 | lsw & 0xFFFF;
    };
    var bit_rol = function bit_rol(num, cnt) {
        return num << cnt | num >>> 32 - cnt;
    };
    var md5_cmn = function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    };
    var md5_ff = function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn(b & c | ~b & d, a, b, x, s, t);
    };
    var md5_gg = function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn(b & d | c & ~d, a, b, x, s, t);
    };
    var md5_hh = function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    };
    var md5_ii = function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
    };

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    var binl_md5 = function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << len % 32;
        x[(len + 64 >>> 9 << 4) + 14] = len;

        var a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for (var i = 0, l = x.length; i < l; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    };

    /*
     * Convert an array of little-endian words to a string
     */
    var binl2rstr = function binl2rstr(input) {
        var output = '';
        for (var i = 0, l = input.length * 32; i < l; i += 8) {
            output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
        }
        return output;
    };

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    var rstr2binl = function rstr2binl(input) {
        var output = Array.from({ length: input.length >> 2 }).map(function () {
            return 0;
        });
        for (var i = 0, l = input.length; i < l * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << i % 32;
        }
        return output;
    };

    var rstr_md5 = function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    };
    var str2rstr_utf8 = function str2rstr_utf8(input) {
        return window.unescape(encodeURIComponent(input));
    };
    return function (string) {
        var output = '';
        var hex_tab = '0123456789abcdef';
        var input = rstr_md5(str2rstr_utf8(string));

        for (var i = 0, l = input.length; i < l; i += 1) {
            var x = input.charCodeAt(i);
            output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
        }
        return output;
    };
})();

var Storage = function () {
    function Storage(name) {
        classCallCheck(this, Storage);

        if (!name) {
            throw new TypeError('Expect a name for the storage, but a(n) ' + name + ' is given.');
        }

        this.name = '#LC-STORAGE-V-1.0#' + name + '#';

        var abstracts = ['set', 'get', 'delete', 'clear', 'keys'];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = abstracts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var method = _step.value;


                if (!isFunction(this[method])) {
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
    }

    createClass(Storage, [{
        key: 'format',
        value: function format(data) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var string = true;
            if (!isString(data)) {
                string = false;
                data = JSON.stringify(data);
            }

            var input = {
                data: data,
                type: options.type || 'localcache',
                mime: options.mime || 'text/plain',
                string: string,
                priority: options.priority === undefined ? 50 : options.priority,
                ctime: options.ctime || +new Date(),
                lifetime: options.lifetime || 0
            };

            if (options.extra) {
                input.extra = JSON.stringify(options.extra);
            }

            if (options.md5) {
                input.md5 = md5(data);
            }

            if (options.cookie) {
                input.cookie = md5(document.cookie);
            }

            return input;
        }
    }, {
        key: 'validate',
        value: function validate(data) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var result = true;

            if (data.lifetime) {
                if (new Date() - data.ctime >= data.lifetime) {
                    result = false;
                }
            }

            if (data.cookie) {
                if (data.cookie !== md5(document.cookie)) {
                    result = false;
                }
            }

            if (data.md5 && options.md5) {
                if (data.md5 !== options.md5) {
                    result = false;
                }
                if (md5(data.data) !== options.md5) {
                    result = false;
                }
            }

            if (options.validate) {
                return options.validate(data, result);
            }

            return result;
        }
    }, {
        key: 'clean',
        value: function clean(check) {
            var _this = this;

            return this.keys().then(function (keys) {
                var steps = [];

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    var _loop = function _loop() {
                        var key = _step2.value;

                        steps.push(function () {
                            return _this.get(key).then(function (data) {
                                if (check(data, key) === true) {
                                    return _this.delete(key);
                                }
                            });
                        });
                    };

                    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        _loop();
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                return Sequence.chain(steps).then(function (results) {
                    var removed = [];

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = results[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var result = _step3.value;


                            if (result.status === Sequence.FAILED) {
                                removed.push(keys[result.index]);
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }

                    return removed;
                });
            });
        }
    }, {
        key: 'output',
        value: function output(data, storage) {

            if (!storage) {
                console.error('Storage type is required.');
            }

            if (!data.string) {
                data.data = JSON.parse(data.data);
            }

            if (data.extra) {
                data.extra = JSON.parse(data.extra);
            }

            data.storage = storage;

            return data;
        }
    }]);
    return Storage;
}();

var Memory = function (_Storage) {
    inherits(Memory, _Storage);

    function Memory(name) {
        classCallCheck(this, Memory);

        var _this = possibleConstructorReturn(this, (Memory.__proto__ || Object.getPrototypeOf(Memory)).call(this, name));

        _this.data = {};
        return _this;
    }

    createClass(Memory, [{
        key: 'set',
        value: function set$$1(key, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            data = this.format(data, options);
            this.data[key] = data;
            return Promise$1.resolve(data);
        }
    }, {
        key: 'get',
        value: function get$$1(key) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var data = this.data[key];

            if (!data) return Promise$1.reject();

            if (this.validate(data, options) === false) {
                options.autodelete !== false && this.delete(key);
                return Promise$1.reject();
            }

            return Promise$1.resolve(this.output(data, 'page'));
        }
    }, {
        key: 'delete',
        value: function _delete(key) {
            this.data[key] = null;
            delete this.data[key];
            return Promise$1.resolve();
        }
    }, {
        key: 'keys',
        value: function keys() {
            return Promise$1.resolve(Object.keys(this.data));
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.data = {};
            return Promise$1.resolve();
        }
    }]);
    return Memory;
}(Storage);

var SessionStorage = function (_Storage) {
    inherits(SessionStorage, _Storage);

    function SessionStorage(name) {
        classCallCheck(this, SessionStorage);
        return possibleConstructorReturn(this, (SessionStorage.__proto__ || Object.getPrototypeOf(SessionStorage)).call(this, name));
    }

    createClass(SessionStorage, [{
        key: 'set',
        value: function set$$1(key, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            data = this.format(data, options);
            try {
                sessionStorage.setItem(this.name + key, JSON.stringify(data));
                return Promise$1.resolve(data);
            } catch (e) {
                return Promise$1.reject(e);
            }
        }
    }, {
        key: 'get',
        value: function get$$1(key) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var data = void 0;

            try {
                data = JSON.parse(sessionStorage.getItem(this.name + key));

                if (!data) return Promise$1.reject();

                if (this.validate(data, options) === false) {
                    options.autodelete !== false && this.delete(key);
                    return Promise$1.reject();
                }
            } catch (e) {
                this.delete(key);
                return Promise$1.reject();
            }
            return Promise$1.resolve(this.output(data, 'session'));
        }
    }, {
        key: 'delete',
        value: function _delete(key) {
            sessionStorage.removeItem(this.name + key);
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
            var name = this.name;
            var l = this.name.length;

            for (var key in sessionStorage) {
                if (key.indexOf(name)) continue;
                keys.push(key.substr(l));
            }

            return Promise$1.resolve(keys);
        }
    }]);
    return SessionStorage;
}(Storage);

var IDB = function (_Storage) {
    inherits(IDB, _Storage);

    function IDB(name) {
        classCallCheck(this, IDB);

        var _this = possibleConstructorReturn(this, (IDB.__proto__ || Object.getPrototypeOf(IDB)).call(this, name));

        _this.idb = null;

        _this.ready = _this.open().then(function () {
            _this.idb.onerror = function (e) {
                console.warn('IDB Error', e);
            };
            return _this.idb;
        });

        return _this;
    }

    createClass(IDB, [{
        key: 'open',
        value: function open() {
            var _this2 = this;

            var request = window.indexedDB.open(this.name);

            return new Promise(function (resolve, reject) {

                request.onsuccess = function (e) {
                    _this2.idb = e.target.result;
                    resolve(e);
                };

                request.onerror = function (e) {
                    reject(e);
                };

                request.onupgradeneeded = function (e) {
                    _this2.onupgradeneeded(e);
                };
            });
        }
    }, {
        key: 'onupgradeneeded',
        value: function onupgradeneeded(e) {
            var os = e.target.result.createObjectStore('storage', {
                keyPath: 'key'
            });

            os.createIndex('key', 'key', { unique: true });
            os.createIndex('data', 'data', { unique: false });
            os.createIndex('type', 'type', { unique: false });
            os.createIndex('string', 'string', { unique: false });
            os.createIndex('ctime', 'ctime', { unique: false });
            os.createIndex('md5', 'md5', { unique: false });
            os.createIndex('lifetime', 'lifetime', { unique: false });
            os.createIndex('cookie', 'cookie', { unique: false });
            os.createIndex('priority', 'priority', { unique: false });
            os.createIndex('extra', 'extra', { unique: false });
            os.createIndex('mime', 'mime', { unique: false });
        }
    }, {
        key: 'store',
        value: function store() {
            var write = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            return this.idb.transaction(['storage'], write ? 'readwrite' : 'readonly').objectStore('storage');
        }
    }, {
        key: 'set',
        value: function set$$1(key, data) {
            var _this3 = this;

            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


            data = this.format(data, options);

            return this.ready.then(function () {
                return new Promise(function (resolve, reject) {
                    var store = _this3.store(true);
                    // don't manipulate the origin data
                    var request = store.put(Object.assign({ key: key }, data));

                    request.onsuccess = function () {
                        resolve(data);
                    };

                    request.onerror = function (e) {
                        reject(e);
                    };
                });
            });
        }
    }, {
        key: 'delete',
        value: function _delete(key) {
            var _this4 = this;

            return this.ready.then(function () {
                return new Promise(function (resolve, reject) {
                    var store = _this4.store(true);
                    var request = store.delete(key);

                    request.onsuccess = function () {
                        resolve();
                    };

                    request.onerror = function (e) {
                        reject(e);
                    };
                });
            });
        }
    }, {
        key: 'get',
        value: function get$$1(key) {
            var _this5 = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.ready.then(function () {
                return new Promise(function (resolve, reject) {
                    var store = _this5.store();
                    var request = store.get(key);

                    request.onsuccess = function () {
                        var data = request.result;
                        if (!data) {
                            return reject();
                        }

                        if (_this5.validate(data, options) === false) {
                            options.autodelete !== false && _this5.delete(key);
                            return reject();
                        }
                        delete data.key;
                        resolve(_this5.output(data, 'persistent'));
                    };

                    request.onerror = function (e) {
                        reject(e);
                    };
                });
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _this6 = this;

            return this.ready.then(function () {
                return new Promise(function (resolve, reject) {
                    var store = _this6.store(true);
                    var request = store.clear();

                    request.onsuccess = function () {
                        resolve();
                    };

                    request.onerror = function (e) {
                        reject(e);
                    };
                });
            });
        }
    }, {
        key: 'keys',
        value: function keys() {
            var _this7 = this;

            return this.ready.then(function () {
                return new Promise(function (resolve, reject) {
                    var store = _this7.store();

                    if (store.getAllKeys) {
                        var request = store.getAllKeys();

                        request.onsuccess = function () {
                            resolve(request.result);
                        };

                        request.onerror = function () {
                            reject();
                        };
                    } else {
                        try {
                            var _request = store.openCursor();
                            var keys = [];

                            _request.onsuccess = function () {
                                var cursor = _request.result;

                                if (!cursor) {
                                    resolve(keys);
                                    return;
                                }

                                keys.push(cursor.key);
                                cursor.continue();
                            };
                        } catch (e) {
                            reject(e);
                        }
                    }
                });
            });
        }
    }]);
    return IDB;
}(Storage);

var Persistent = Storage;

if (window.indexedDB) {
    Persistent = IDB;
}

var Persistent$1 = Persistent;

/**
 * please don't change the order of items in this array.
 */

var LocalCache = function () {
    function LocalCache(name) {
        classCallCheck(this, LocalCache);

        if (!name) {
            throw new TypeError('Expect a name for your storage');
        }

        this.page = new Memory(name);
        this.session = new SessionStorage(name);
        this.persistent = new Persistent$1(name);

        this.clean();
    }

    createClass(LocalCache, [{
        key: 'set',
        value: function set$$1(key, data, options) {
            var _this = this;

            var steps = [];

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var mode = _step.value;

                    if (!options[mode]) return 'continue';

                    var opts = options[mode];

                    if (opts === false) return 'continue';

                    if (!isObject(opts)) {
                        opts = {};
                    }

                    if (!isUndefined(options.type)) {
                        opts.type = options.type;
                    }

                    if (!isUndefined(options.extra)) {
                        opts.extra = options.extra;
                    }

                    if (!isUndefined(options.mime)) {
                        opts.mime = options.mime;
                    }

                    steps.push(function () {
                        return _this[mode].set(key, data, opts);
                    });
                };

                for (var _iterator = LocalCache.STORAGES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _ret = _loop();

                    if (_ret === 'continue') continue;
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

            if (!steps.length) {
                throw new TypeError('You must specify at least one storage mode in [' + LocalCache.STORAGES.join(', ') + ']');
            }

            return Sequence.all(steps).then(function () {
                return data;
            });
        }
    }, {
        key: 'get',
        value: function get$$1(key, modes) {
            var _this2 = this;

            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            modes || (modes = LocalCache.STORAGES);

            var steps = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                var _loop2 = function _loop2() {
                    var mode = _step2.value;

                    if (!_this2[mode]) {
                        throw new TypeError('Unexcepted storage mode "' + mode + '", excepted one of: ' + LocalCache.STORAGES.join(', '));
                    }
                    steps.push(function () {
                        return _this2[mode].get(key, options);
                    });
                };

                for (var _iterator2 = modes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    _loop2();
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return Sequence.any(steps).then(function (results) {
                var result = results[results.length - 1];
                var value = result.value;

                if (!options.store) return value;

                var opts = Object.assign(value, options.store, defineProperty({}, value.storage, false));

                return _this2.set(key, value.data, opts).then(function () {
                    return value;
                });
            });
        }
    }, {
        key: 'delete',
        value: function _delete(key, modes) {
            var _this3 = this;

            modes || (modes = LocalCache.STORAGES);

            var steps = [];

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                var _loop3 = function _loop3() {
                    var mode = _step3.value;

                    if (!_this3[mode]) {
                        throw new TypeError('Unexcepted mode "' + mode + '", excepted one of: ' + LocalCache.STORAGES.join(', '));
                    }
                    steps.push(function () {
                        return _this3[mode].delete(key);
                    });
                };

                for (var _iterator3 = modes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    _loop3();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return Sequence.all(steps);
        }
    }, {
        key: 'clear',
        value: function clear(modes) {
            var _this4 = this;

            modes || (modes = LocalCache.STORAGES);

            var steps = [];

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                var _loop4 = function _loop4() {
                    var mode = _step4.value;

                    if (!_this4[mode]) {
                        throw new TypeError('Unexcepted mode "' + mode + '", excepted one of: ' + LocalCache.STORAGES.join(', '));
                    }
                    steps.push(function () {
                        return _this4[mode].clear();
                    });
                };

                for (var _iterator4 = modes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    _loop4();
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            return Sequence.all(steps);
        }
    }, {
        key: 'clean',
        value: function clean() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var check = function check(data, key) {
                var remove = false;

                var priority = options.priority,
                    length = options.length,
                    ctime = options.ctime,
                    type = options.type;


                if (!isUndefined(priority)) {
                    if (data.priority < priority) {
                        remove = true;
                    }
                }

                if (!remove && !isUndefined(length)) {
                    var content = data.data;
                    if (isNumber(length)) {
                        if (content.length >= length) {
                            remove = true;
                        }
                    } else if (Array.isArray(length)) {
                        if (content.length >= length[0] && content.length <= length[1]) {
                            remove = true;
                        }
                    }
                }

                if (!remove && !isUndefined(ctime)) {
                    if (isDate(ctime) || isNumber(ctime)) {
                        if (data.ctime < +ctime) {
                            remove = true;
                        }
                    } else if (Array.isArray(ctime)) {
                        if (data.ctime > ctime[0] && data.ctime < ctime[1]) {
                            remove = true;
                        }
                    }
                }

                if (!remove) {
                    if (Array.isArray(type)) {
                        if (type.indexOf(data.type) > -1) {
                            remove = true;
                        }
                    } else if (type == data.type) {
                        remove = true;
                    }
                }

                if (!remove && isFunction(options.remove)) {
                    if (options.remove(data, key) === true) {
                        remove = true;
                    }
                }

                return remove;
            };

            var steps = [];

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = LocalCache.STORAGES[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _mode = _step5.value;

                    steps.push(this[_mode].clean(check));
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return Promise.all(steps);
        }
    }]);
    return LocalCache;
}();

LocalCache.STORAGES = ['page', 'session', 'persistent'];

return LocalCache;

})));
