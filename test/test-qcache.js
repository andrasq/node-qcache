/**
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var TtlCache = require('../').TtlCache;

module.exports = {
    setUp: function(done) {
        this.cache = new TtlCache({ttl: 10});
        this.uniqid = function() { return Math.random() * 0x1000000 | 0 };
        done();
    },

    'TtlCache': {
        'index should export TtlCache': function(t) {
            var qcache = require('../index');
            t.ok(new qcache() instanceof TtlCache);
            t.done();
        },

        'ttlcache should export TtlCache': function(t) {
            var qcache = require('../ttlcache');
            t.ok(new qcache() instanceof TtlCache);
            t.done();
        },

        'should act as factory': function(t) {
            t.ok(TtlCache() instanceof TtlCache);
            t.done();
        },

        'should export and alias properties': function(t) {
            t.equal(typeof this.cache.ttl, 'number');
            t.equal(typeof this.cache.capacity, 'number');
            t.equal(typeof this.cache.count, 'number');

            t.equal(typeof this.cache.get, 'function');
            t.equal(typeof this.cache.set, 'function');
            t.equal(typeof this.cache.delete, 'function');
            t.equal(typeof this.cache.gc, 'function');

            t.equal(this.cache.del, this.cache.delete);
            t.equal(this.cache.put, this.cache.set);
            t.done();
        },

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

        'should set and get falsy values': function(t) {
            var values = [0, "", null, false];
            for (var i in values) {
                this.cache.set("t", values[i]);
                t.strictEqual(this.cache.get("t"), values[i]);
            }
            t.done();
        },

        'set should increment count': function(t) {
            t.equal(this.cache.count, 0);
            this.cache.set('t', 1);
            t.equal(this.cache.count, 1);
            t.done();
        },

        'double set should not increment count twice': function(t) {
            this.cache.set('t', 1);
            this.cache.set('t', 2);
            t.equal(this.cache.count, 1);
            t.done();
        },

        'should impose capacity': function(t) {
            var cache = new TtlCache({capacity: 1});
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
            }, 13);
        },

        'should honor configured timeout': function(t) {
            var cache = new TtlCache({ttl: 2});
            cache.set("t", 1);
            setTimeout(function() {
                t.equal(cache.get("t"), undefined);
                t.done();
            }, 4);
        },

        'should delete value': function(t) {
            this.cache.set("t", 1);
            t.equal(this.cache.get("t"), 1);
            this.cache.delete("t");
            t.equal(this.cache.get("t"), undefined);
            t.done();
        },

        'should double delete value': function(t) {
            this.cache.set("t", 1);
            this.cache.delete("t");
            this.cache.delete("t");
            t.equal(this.cache.get("t"), undefined);
            t.done();
        },

        'delete should decrement count': function(t) {
            this.cache.set('t', 1);
            this.cache.delete('t');
            t.equal(this.cache.count, 0);
            t.done();
        },

        'double delete should not decrement count twice': function(t) {
            this.cache.set('t', 1);
            this.cache.delete('t');
            this.cache.delete('t');
            t.equal(this.cache.count, 0);
            t.done();
        },

        'delete should gc after 1024 deletions': function(t) {
            for (var i=0; i<1030; i++) this.cache.set(i, i);
            t.equal(this.cache.count, 1030);
            for (var i=1; i<1024; i++) this.cache.delete(i);
            t.equal(this.cache.count, 1030 - 1023);
            t.equal(this.cache._deleteCount, 1023);
            // 1024th deletion will gc if more deleted-to-live ratio is > 100
            this.cache.delete(0);
            t.equal(this.cache.count, 1030 - 1024);
            t.equal(this.cache._deleteCount, 0);
            t.done();
        },

        'gc should purge timed out items': function(t) {
            var cache = this.cache;
            cache.set("t1", 1);
            // NOTE: this test is timing sensitive.  Do not console.log
            // during the run, because it can add 3-5 ms and break the test
            setTimeout(function() {
                cache.set("t2", 2);
            }, 5);
            setTimeout(function() {
                var countBefore = cache.count;
                cache.gc();
                var t2value = cache.get("t2");
                var countAfter = cache.count;
                t.equal(countBefore, 2);
                t.equal(t2value, 2);
                t.equal(countAfter, 1);
                t.done();
            }, 12);
        },

        'time 200k set/get calls': function(t) {
            var t1 = Date.now();
            for (var i=0; i<200000; i++) { this.cache.set("t", 1); this.cache.get("t"); }
            var t2 = Date.now();
            // console.log("AR: 100k set/get in ms", t2-t1);
            // > 20+m/s
            t.done();
        },

        'time 20k gc calls': function(t) {
            for (var i=0; i<20; i++) this.cache.set("t"+i, 1);
            for (var i=0; i<20; i+=2) this.cache.delete("t"+i);
            var t1 = Date.now();
            for (var i=0; i<20000; i++) this.cache.gc();
            var t2 = Date.now();
            // console.log("AR: 20k set/get in ms", t2-t1);
            // 86k/s 100 items, 1.5m/s 10 items, 81/s 20k items
            t.done();
        },
    },
};
