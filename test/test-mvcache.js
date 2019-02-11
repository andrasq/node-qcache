/**
 * Copyright (C) 2015,2018-2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var MultiValueCache = require('../').MultiValueCache;

module.exports = {
    setUp: function(done) {
        this.cache = new MultiValueCache();
        this.uniqid = function() { return Math.random() * 0x1000000 | 0 };
        done();
    },

    'MultiValueCache': {
        'index should export MultiValueCache': function(t) {
            var qcache = require('../index');
            t.equal(MultiValueCache, qcache.MultiValueCache);
            t.done();
        },

        'unset value should return undefined': function(t) {
            t.equal(this.cache.shift("notset"), undefined);
            t.done();
        },

        'new array should be isEmpty': function(t) {
            t.ok(this.cache.isEmpty());
            t.done();
        },

        'emptied array should be isEmpty': function(t) {
            this.cache.push("t", 1);
            t.ok(!this.cache.isEmpty("t"));
            this.cache.pop("t");
            t.ok(this.cache.isEmpty("t"));
            t.done();
        },

        'should return undefined if key not set': function(t) {
            this.cache.set("t1", 1);
            t.equal(this.cache.get("t2"), undefined);
            t.done();
        },

        'should set value': function(t) {
            this.cache.set("t", 1);
            t.ok(this.cache._lists["t"]);
            t.done();
        },

        'should get oldest value first': function(t) {
            this.cache.set("t", 1);
            this.cache.set("t", 2);
            t.equal(this.cache.get("t"), 1);
            t.equal(this.cache.get("t"), 2);
            t.equal(this.cache.get("t"), undefined);
            t.done();
        },

        'should push value': function(t) {
            this.cache.push("t", 1);
            t.ok(this.cache._lists["t"]);
            t.done();
        },

        'should pop newest value': function(t) {
            var v = this.uniqid();
            this.cache.push("t", this.uniqid());
            this.cache.push("t", v);
            t.equal(this.cache.pop("t"), v);
            t.done();
        },

        'shift should return oldest value': function(t) {
            var v = this.uniqid();
            this.cache.push("t", v);
            this.cache.push("t", this.uniqid());
            t.equal(this.cache.shift("t"), v);
            t.done();
        },

        'unshift should add a new oldest value': function(t) {
            var v = this.uniqid();
            this.cache.unshift("t", this.uniqid());
            this.cache.unshift("t", v);
            t.equal(this.cache.shift("t"), v);
            t.done();
        },

        'should remove value': function(t) {
            this.cache.push("t", 1);
            this.cache.push("t", 2);
            this.cache.remove("t", 1);
            t.equal(this.cache.shift("t"), 2);
            t.equal(this.cache.shift("t"), undefined);
            t.done();
        },

        'should allow remove of non-existent value': function(t) {
            this.cache.remove('t', 'nonesuch');
            t.equal(this.cache.shift('t'), undefined);
            t.done();
        },

        'should return list length': function(t) {
            this.cache.push("t", 1);
            this.cache.push("t", 2);
            t.equal(this.cache.getLength("t"), 2);
            t.equal(this.cache.getLength("x"), 0);
            t.done();
        },

        'should return list keys': function(t) {
            this.cache.push('t', 1);
            this.cache.push('t', 2);
            this.cache.push('tt', 3);
            t.deepEqual(this.cache.keys(), ['t', 'tt']);
            t.done();
        },

        'should periodically compact removed names': function(t) {
            for (var i=0; i<50; i++) {
                this.cache.push(i, i);
                this.cache.shift(i);
                if (i == 1) this.cache.push(i, i);
            }
            t.ok(this.cache._deletedCount < 50);
            t.ok(Object.keys(this.cache._deleted).length < 50);
            t.equal(this.cache.shift(1), 1);
            t.done();
        },

        'time 100k set/get calls': function(t) {
            //this.cache.push("t", 0);
            var t1 = Date.now();
            for (var i=0; i<100000; i++) { this.cache.push("t", 1); this.cache.shift("t"); }
            var t2 = Date.now();
            // console.log("AR: 100k set/get in ms", t2-t1);
            // > 20+m/s
            t.done();
        },
    },
};
