/**
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var qcache = require('../index.js');

module.exports = {
    setUp: function(done) {
        this.cache = new qcache.TtlCache({ttl: 5});
        this.uniqid = function() { return Math.random() * 0x1000000 | 0 };
        done();
    },

    'should parse package.json': function(t) {
        var json = require('../package.json');
        t.done();
    },

    'TtlCache': {
        'unset value should return undefined': function(t) {
            t.equal(this.cache.get("notset"), undefined);
            t.done();
        },

        'should set key': function(t) {
            this.cache.set("t", 1);
            t.ok(this.cache._store["t"]);
            t.done();
        },

        'should set and get same value': function(t) {
            var v = this.uniqid();
            this.cache.set("t", v);
            t.equal(this.cache.get("t"), v);
            t.done();
        },

        'should impose capacity': function(t) {
            var cache = new qcache.TtlCache({capacity: 1});
            cache.set("v1", 1);
            cache.set("v2", 2);
            t.equal(cache.get("v1"), undefined);
            t.equal(cache.get("v2"), 2);
            t.done();
        },

        'should impose timeout': function(t) {
            var cache = this.cache;
            t.expect(2);
            this.cache.set("t", 1);
            setTimeout(function() {
                t.equal(cache.get("t"), 1);
            }, 2);
            setTimeout(function() {
                t.equal(cache.get("t"), undefined);
                t.done();
            }, 6);
        },

        'should honor configured timeout': function(t) {
            var cache = new qcache.TtlCache({ttl: 2});
            cache.set("t", 1);
            setTimeout(function() {
                t.equal(cache.get("t"), undefined);
                t.done();
            }, 3);
        },

        'should delete value': function(t) {
            this.cache.set("t", 1);
            t.equal(this.cache.get("t"), 1);
            this.cache.delete("t");
            t.equal(this.cache.get("t"), undefined);
            t.done();
        },

        'test 200k set/get calls': function(t) {
            var t1 = Date.now();
            for (var i=0; i<200000; i++) { this.cache.set("t", 1); this.cache.get("t"); }
            var t2 = Date.now();
            // console.log("AR: 100k set/get in ms", t2-t1);
            // > 20+m/s
            t.done();
        },
    },
};
