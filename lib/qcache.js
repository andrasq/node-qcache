/**
 * qcache -- basic caches
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2015-01-28 - AR.
 */

'use strict';

module.exports = {
    // FIXME: export the class directly, not by name
    TtlCache: TtlCache,
    // alias
    TimeoutCache: TtlCache,
};

if (global.currentTimestamp) {
    // if available, use the qtimers timestamp
    var getTimestamp = currentTimestamp;
}
else {
    var _timestamp = Date.now();
    var _ncalls = 0;
    var getTimestamp = function() { return _timestamp; }
    var tmr = setInterval(function() { _timestamp = Date.now(); }, 1);
    tmr.unref();
}

/**
 * name-value store with timeout
 */
function TtlCache( options ) {
    if (this === global || !this) return new TtlCache(options);
    options = options || {};
    this.capacity = options.capacity || 10000;
    this.ttl = options.ttl || 31622400000;      // 1 year
    this.count = 0;
    this._store = {};
    this.currentTimestamp = options.currentTimestamp || getTimestamp;
}
TtlCache.prototype = {
    currentTimestamp: null,

    get:
    function get( name ) {
        var item = this._store[name];
        if (item && item.t > this.currentTimestamp()) return item.v;
        else delete this._store[name];
    },

    set:
    function set( name, value ) {
        // TODO: not an lru cache, discards all when capacity exceeded
        if (this.count >= this.capacity) { this._store = {}; this.count = 0; }
        if (this._store[name] === undefined) this.count += 1;
        this._store[name] = {t: this.currentTimestamp() + this.ttl, v: value};
        // NOTE: node-v0.10.29 does not run the timer on every ms!
        // NOTE: sometimes the qcache timestamp is stale, and returns old values
    },

    delete:
    function delete_( name ) {
        if (this._store[name] !== undefined) this.count -= 1;
        delete this._store[name];
    },
};
