/**
 * qcache -- basic caches
 *
 * Copyright (C) 2015-2016 Andras Radics
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

var getTimestamp = global.currentTimestamp || require('./timebase.js');

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
    this.getTimestamp = options.currentTimestamp || getTimestamp;
}
TtlCache.prototype = {
    getTimestamp: null,

    get:
    function get( name ) {
        var item = this._store[name];
        if (item && item.t >= this.getTimestamp()) return item.v;
        else delete this._store[name];
    },

    set:
    function set( name, value ) {
        // TODO: not an lru cache, discards all when capacity exceeded
        if (this.count >= this.capacity) { this._store = {}; this.count = 0; }
        if (this._store[name] === undefined) this.count += 1;
        this._store[name] = {t: this.getTimestamp() + this.ttl, v: value};
        // NOTE: node-v0.10.29 does not run the timer on every ms!
        // NOTE: sometimes the qcache timestamp is stale, and returns old values
    },

    delete:
    function delete_( name ) {
        if (this._store[name] !== undefined) this.count -= 1;
        delete this._store[name];
    },

    gc:
    function gc( ) {
        var ts = this.getTimestamp();
        var n = 0, live = {};
        for (var i in this._store) {
            if (this._store[i].t >= ts) {
                live[i] = this._store[i];
                n += 1;
            }
        }
        this._store = live;
        this.count = n;
    },
};

// aliases
TtlCache.prototype.put = TtlCache.prototype.set;
TtlCache.prototype.del = TtlCache.prototype.delete;

// speed up access
TtlCache.prototype = TtlCache.prototype;
