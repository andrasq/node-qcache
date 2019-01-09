/**
 * Copyright (C) 2015,2018-2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var LruCache = require('../').LruCache;

module.exports = {
    'LruCache': {
        before: function(done) {
            LruCache = require('../').LruCache;
            done();
        },

        setUp: function(done) {
            this.cache = new LruCache();
            this.uniqid = function() { return Math.random() * 0x1000000 | 0 };
            done();
        },

        'index should export LruCache': function(t) {
            var qcache = require('../index');
            t.equal(LruCache, qcache.LruCache);
            t.notEqual(qcache.LruCache1, qcache.LruCache2);
            t.done();
        },

        'constructor': {
            'should return instance of LruCache': function(t) {
                var cache = LruCache();
                t.ok(cache instanceof LruCache);
                t.done();
            },

            'should set capacity': function(t) {
                var cache = new LruCache({ capacity: 1234 });
                t.equal(cache.capacity, 1234);
                t.done();
            },

            'should accept max as meaning capacity': function(t) {
                var cache = new LruCache({ max: 1234 });
                t.equal(cache.capacity, 1234);
                t.done();
            },

            'should export expected properties': function(t) {
                var cache = new LruCache({ capacity: 1234 });
                cache.set('a', 1);
                cache.set('b', 2);
                t.equal(cache.capacity, 1234);
                t.equal(cache.count, 2);
                t.done();
            },
        },

        'set': {
            'should store value': function(t) {
                this.cache.set('a', 1);
                t.equal(this.cache.get('a'), 1);
                t.done();
            },

            'should displace oldest value': function(t) {
                var cache = new LruCache({ capacity: 3 });
                cache.set('a', 1);
                cache.set('b', 2);
                cache.set('c', 3);
                cache.set('a', 11);
                cache.set('d', 4);
                if (cache.keyvals) t.equal(Object.keys(cache.keyvals).length, 3);       // v1
                if (cache.nodemap) t.equal(Object.keys(cache.nodemap).length, 3);       // v2
                t.equal(cache.get('b'), undefined);
                t.equal(cache.get('a'), 11);
                t.equal(cache.get('c'), 3);
                t.equal(cache.get('d'), 4);
                t.done();
            },
        },

        'get': {
            'should return undefined if not found': function(t) {
                var cache = new LruCache();
                cache.set('a', 1);
                t.strictEqual(cache.get('a'), 1);
                t.strictEqual(cache.get('b'), undefined);
                t.done();
            },

            'should refresh value': function(t) {
                var cache = new LruCache({ capacity: 2 });
                cache.set('a', 1);
                cache.set('b', 2);
                cache.get('a');
                cache.set('c', 3);
                t.equal(cache.get('a'), 1);
                t.equal(cache.get('b'), undefined);
                t.equal(cache.get('c'), 3);
                t.done();
            },
        },

        'delete': {
            'should allow non-existent keys': function(t) {
                this.cache.delete('a');
                t.equal(this.cache.get('a'), undefined);
                t.done();
            },

            'should unset the value': function(t) {
                this.cache.set('a', 1);
                this.cache.set('b', 2);
                this.cache.delete('a');
                t.equal(this.cache.get('a'), undefined);
                t.equal(this.cache.get('b'), 2);
                t.done();
            },
        },

        'should track count': function(t) {
            var cache = new LruCache();
            t.equal(cache.count, 0);
            cache.delete('a');
            t.equal(cache.count, 0);

            cache.set('a', 1);
            t.equal(cache.count, 1);
            cache.set('b', 2);
            t.equal(cache.count, 2);

            cache.set('a', 11);
            t.equal(cache.count, 2);

            cache.delete('c');
            t.equal(cache.count, 2);

            cache.delete('a');
            t.equal(cache.count, 1);
            cache.delete('b');
            t.equal(cache.count, 0);
            cache.delete('c');
            t.equal(cache.count, 0);

            t.done();
        },
    },

    'LruCache v1': {
        before: function(done) {
            LruCache = require('../').LruCache1;
            done();
        },
    }
};

// duplicate all the same tests for v1 as well
for (var k in module.exports['LruCache']) {
    if (k === 'before') continue;
console.log(k);
    if (/should export LruCache/.test(k)) continue;
    module.exports['LruCache v1'][k] = module.exports['LruCache'][k];
}
