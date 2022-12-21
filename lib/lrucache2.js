/*
 * LRU item cache with simple get/set/delete store semantics.
 * Items are kept on a key-value stack, most recent on top
 * (nodejs objects retain the property insertion order, so
 * the stack is implemented using an object).
 *
 * Copyright (C) 2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2022-12-18 - AR - much faster eviction
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
    this.gcDeleteLimit = this.capacity < 400 ? 20000 : this.capacity * 50;
    this.deleteCount = 0;

    this.nodemap = {};
    this.keylist = qdlist();
    // note: node-v8 2.5x faster to set by numeric key than string key
}

LruCache.prototype._insert = function _insert( node, prev, next ) {
    prev.next = next.prev = node;       // prev --> node <-- next
    node.prev = prev; node.next = next; // prev <-- node --> next
    return node;
}
LruCache.prototype._remove = function _remove( node ) {
    node.next.prev = node.prev;
    node.prev.next = node.next;
    return node;
}
LruCache.prototype.moveToTail = function moveToTail( node ) {
    return this._insert(this._remove(node), this.keylist.prev, this.keylist);
}

LruCache.prototype.set = function set( key, value ) {
    var node = this.nodemap[key];
    if (node) {
        node.value2 = value;
        this.moveToTail(node);
    }
    else {
        if (this.count >= this.capacity) node = this.keylist.head();
        if (node) {
            this._insert(node, this.keylist.prev, this.keylist);
            this.nodemap[node.value] = undefined;
            node.value = key;
            node.value2 = value;
            this.nodemap[key] = node;
            this.deleteCount += 1;
        } else {
            node = this.nodemap[key] = this.keylist.push2(key, value);
            this.count += 1;
        }
    }
}

LruCache.prototype.get = function get( key ) {
    var node = this.nodemap[key];
    if (node) {
        this.moveToTail(this._remove(node));
        return node.value2;
    } else {
        return undefined;
    }
}

LruCache.prototype.del = LruCache.prototype.delete = function delete_( key ) {
    var node = this.nodemap[key];
    if (node) {
        this._remove(node);
        this.nodemap[key] = undefined;
        this.count -= 1;
        if (++this.deleteCount >= this.gcDeleteLimit) this.gc();
    }
}

LruCache.prototype.keys = function keys( ) {
    var nodemap = this.nodemap;
    return Object.keys(nodemap).filter(function(k) { return !!nodemap[k] });
}

LruCache.prototype.gc = function gc( ) {
    var map = this.nodemap = {};
    for (var list = this.keylist, node = list.next; node !== list; node = node.next) map[node.value] = node;
    this.deleteCount = 0;
}

LruCache.prototype = toStruct(LruCache.prototype);
function toStruct(hash) { return toStruct.prototype = hash }
