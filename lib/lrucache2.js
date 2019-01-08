/*
 * LRU item cache with simple get/set/delete store semantics.
 * Items are kept on a key-value stack, most recent on top
 * (nodejs objects retain the property insertion order, so
 * the stack is implemented using an object).
 *
 * Copyright (C) 2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2019-01-05 - AR.
 * 2015-01-30 - AR - Original version.
 */

'use strict';

var qdlist = require('qdlist');

module.exports = LruCache;


function LruCache( options ) {
    if (!this || this === global) return new LruCache(options);
    options = options || {};
    this.capacity = options.max || options.capacity || Infinity;
    this.count = 0;

    this.nodemap = {};
    this.keylist = qdlist();
    // note: node-v8 2.5x faster to set by numeric key than string key
}

LruCache.prototype.set = function set( key, value ) {
    var node = this.nodemap[key];
    if (node) {
        node.value2 = value;
        this.keylist.moveToTail(node);
    }
    else {
        if (this.count >= this.capacity) this.delete(this.keylist.head().value);
        node = this.nodemap[key] = this.keylist.push2(key, value);
        //node.value2 = value;
        this.count += 1;
    }
}

LruCache.prototype.get = function get( key ) {
    var node = this.nodemap[key];
    if (node) {
        this.keylist.moveToTail(node);
        return node.value2;
    } else {
        return undefined;
    }
}

LruCache.prototype.del = LruCache.prototype.delete = function delete_( key ) {
    var node = this.nodemap[key];
    if (node) {
        this.keylist.unlink(node);
        delete this.nodemap[key];
        this.count -= 1;
    }
}
