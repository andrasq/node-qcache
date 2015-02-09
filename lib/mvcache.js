/**
 * multi-valued mru/lru (most/least recently used) cache
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2015-01-18 - AR.
 */

'use strict';

module.exports = MultiValueCache;

function MultiValueCache( ) {
    this._lists = {};
    this._deleted = {};
    this._deletedCount = 0;
}

MultiValueCache.prototype = {

    _lists: null,

    isEmpty:
    function isEmpty( name ) {
        return !this._lists[name] || !this._lists[name].length;
    },

    push:
    function push( name, value ) {
        var list = this._lists[name] || (this._lists[name] = new Array());
        list.push(value);
    },

    pop:
    function pop( name, oldest ) {
        var ret, list = this._lists[name];
        if (list) {
            ret = oldest ? list.shift() : list.pop();
            if (!list.length) this._delayedDelete(name);
            return ret;
        }
        return undefined;
    },

    unshift:
    function unshift( name, value ) {
        var list = this._lists[name] || (this._lists[name] = new Array());
        list.unshift(value);
    },

    shift:
    function shift( name ) {
        return this.pop(name, true);
    },

    set:
    function set( name, value ) {
        return this.push(name, value);
    },

    get:
    function get( name ) {
        return this.pop(name, true);
    },

    remove:
    function remove( name, item ) {
        var idx, list = this._lists[name];
        if (list && (idx = list.indexOf(item)) >= 0) {
            list.splice(idx, 1);
        }
    },

    _deleted: null,
    _deletedCount: 0,
    _delayedDelete:
    function _delayedDelete( name ) {
        // NOTE: a simplistic delete is 87% of the runtime! (11 vs 83 ms)
        //if (list.length < 1) delete this._lists[name];
        //return;

        // delay the delete, to avoid on/off/on oscillation (17ms)
        var lists = this._lists;
        lists[name] = 0;                // faster to test/set 0 than undefined
        if (!this._deleted[name]) {
            this._deleted[name] = true;

            if (++this._deletedCount >= 40) {
                for (name in this._deleted) {
                    if (lists[name] === 0) delete lists[name];
                }
                this._deleted = {};
                this._deletedCount = 0;
            }
        }
    },
};
