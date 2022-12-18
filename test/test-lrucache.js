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

            'should store same value': function(t) {
                this.cache.set('a', 1);
                this.cache.set('a', 11);
                t.equal(this.cache.get('a'), 11);
                t.deepEqual(this.cache.keys(), ['a']);
                t.done();
            },

            'should displace oldest value': function(t) {
                var cache = new LruCache({ capacity: 3 });
                cache.set('a', 1);
                cache.set('b', 2);
                cache.set('c', 3);
                cache.set('a', 11);
                cache.set('d', 4);
                function definedKeys(obj) { return Object.keys(obj).filter(function(k) { return !!obj[k] }) }
                if (cache.keyvals) t.equal(definedKeys(cache.keyvals).length, 3);       // v1
                if (cache.nodemap) t.equal(definedKeys(cache.nodemap).length, 3);       // v2
                t.equal(cache.get('b'), undefined);
                t.equal(cache.get('a'), 11);
                t.equal(cache.get('c'), 3);
                t.equal(cache.get('d'), 4);
                t.done();
            },

            'should call delete when displacing': function(t) {
                if (this.cache.nodemap) {
                    this.cache.capacity = 1;
                    this.cache.set('a', 1);
                    var spy = t.spyOnce(this.cache, 'delete');
                    this.cache.set('b', 2);
                    t.ok(spy.called);
                    t.equal(spy.args[0][0], 'a');
                }
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

        'keys': {
            'should return cache keys': function(t) {
                this.cache.set('a', 1);
                this.cache.set('c', 3);
                this.cache.delete('c');
                this.cache.set('b', 2);
                t.deepEqual(this.cache.keys(), ['a', 'b']);
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

        'gc': {
            'should purge undefined objects from map': function(t) {
                var cache = this.cache;
                cache.set('a', 1);
                cache.set('b', 2);
                cache.delete('a');
                cache.delete('b');
                if (cache.nodemap) {
                    t.deepStrictEqual(cache.nodemap, { a: undefined, b: undefined });
                    cache.set('c', 3);
                    cache.gc();
                    cache.delete('c');
                    t.deepStrictEqual(cache.nodemap, { c: undefined });
                }
                t.done();
            },

            'should be triggered automatically on delete': function(t) {
                this.cache.set('a', 1);
                this.cache.deleteCount = this.cache.gcDeleteLimit + 1;
                this.cache.delete('a');
                if (this.cache.nodemap) {
                    t.deepStrictEqual(this.cache.nodemap, { }); // gc was run
                }
                t.done();
            },
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
    if (/should export LruCache/.test(k)) continue;
    module.exports['LruCache v1'][k] = module.exports['LruCache'][k];
}
