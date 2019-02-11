/**
 * LRU item cache with simple get/set/delete store semantics.
 * Items are kept on a key-value stack, most recent on top
 * (nodejs objects retain the property insertion order, so
 * the stack is implemented using an object).
 *
 * Copyright (C) 2015,2018-2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

/* global module, global */

module.exports = LruCache;

function LruCache( options ) {
    if (this === global || !this) return new LruCache(options);
    options = options || {};
    this.capacity = options.max || options.capacity || Infinity;
    this.keyvals = {};          // key-value pairs in oldest-first order
    this.count = 0;             // number of keys currently cached
}

LruCache.prototype = {
    set:
    function set( key, value ) {
        var keyvals = this.keyvals;
        if (keyvals[key] === undefined) {
            this.count += 1;
            if (this.count > this.capacity) {
                // delete (displace) the oldest item to make room in the cache
                // TODO: for k in is slow... any other way to get the first key?
                // FIXME: Object.keys and `key in obj` both sort numeric keys into
                // numerically increasing order, and numbers before strings.
                // I.e., cannot rely on `for k in` to find first key.
                for (var k in keyvals) {
                    delete keyvals[k];
                    this.count -= 1;
                    break;
                }
            }
        }
        delete keyvals[key];
        keyvals[key] = value;
    },

    get:
    function get( key ) {
        var value = this.keyvals[key];
        if (value !== undefined) {
            delete this.keyvals[key];
            this.keyvals[key] = value;
        }
        return value;
    },

    delete:
    function delete_( key ) {
        if (this.keyvals[key] !== undefined) {
            this.count -= 1;
            delete this.keyvals[key];
        }
    },

    del: 'set below',

    keys:
    function keys( ) {
        return Object.keys(this.keyvals);
    },
};

LruCache.prototype.del = LruCache.prototype.delete;


/**

TODO:

- delete is very slow for large hashes, be careful! (cf shifting large arrays)
- for ... in is slow, avoid if possible (5-10m keys/s before starting to loop)
- ? store values in array, store array index in key store
  periodically recompact the array by copying out the live values

**/
