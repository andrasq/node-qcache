/**
 * Copyright (C) 2015-2016,2018-2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

// npm install lru-cache node-cache memory-cache

var qtimeit = require('qtimeit');
var qcache = require('./');
var node_cache = require('node-cache');
var memory_cache = require('memory-cache');
var lru_cache = require('lru-cache');

console.log("package versions:");
console.log("  qcache %s", require('qcache/package.json').version);
console.log("  node-cache %s", require('node-cache/package.json').version);
console.log("  memory-cache %s", require('memory-cache/package.json').version);
console.log("  lru-cache %s", require('lru-cache/package.json').version);

var nloops = 20;
var nitems = 500;
var nreuse = 4;
var keys = []; for (var i=0; i<nitems; i++) keys[i] = 'key-' + i;
var x;

//qtimeit(100000, function() { x = keys[i] });
// 39m/s

qtimeit.bench.opsPerTest = nloops * nitems;
qtimeit.bench.timeGoal = 1;
qtimeit.bench.showRunDetails = false;
qtimeit.bench.baselineAvg = 2000000;
qtimeit.bench.visualize = true;
for (var repeat=0; repeat<5; repeat++) {

console.log("");
console.log("---------------- Pure cache:");
qtimeit.bench({
    'lru-cache': function() {
        //c = lru_cache({ max: 999999999, maxAge: 999999 });
        c = lru_cache();
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    'node-cache': function() {
        c = new node_cache();
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    'memory-cache': function() {
        // global cache, not separate objects ?!
        c = memory_cache;
        c.set = c.put;
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    'qcache.TtlCache': function() {
        c = new qcache.TtlCache({ capacity: 999999999, ttl: 999999 });
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    'qcache.LruCache1 v1': function() {
        c = new qcache.LruCache1({ capacity: 999999999, ttl: 999999 });
        c.del = c.delete;
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    'qcache.LruCache2 v2': function() {
        c = new qcache.LruCache2({ capacity: 999999999, ttl: 999999 });
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },
});

console.log("");
console.log("---------------- LRU cache:");
qtimeit.bench({
    'lru-cache 1% lru': function() {
        c = lru_cache({ max: nitems * 100/101, maxAge: 999999 });
        testCache(c);
    },

    'qcache.LruCache v1 1% lru': function() {
        c = new qcache.LruCache1({ capacity: nitems * 100/101 });
        c.del = c.delete;
        testCache(c);
    },

    'qcache.LruCache v2 1% lru2': function() {
        c = new qcache.LruCache2({ capacity: nitems * 100/101 });
        testCache(c);
    },

    'lru-cache 25% lru': function() {
        c = lru_cache({ max: nitems * .80, maxAge: 999999 });
        testCache(c);
    },

    'qcache.LruCache v1 25% lru': function() {
        c = new qcache.LruCache1({ capacity: nitems * .80 });
        c.del = c.delete;
        testCache(c);
    },

    'qcache.LruCache v2 25% lru2': function() {
        c = new qcache.LruCache2({ capacity: nitems * .80 });
        testCache(c);
    },
});

}

// note: the cache benchmarks run faster if each loop can be optimized separately,
// but the lru benchmarks do not appear sensitive and can be folded.
function testCache( c ) {
    for (var j=0; j<nloops; j++) {
        for (var i=0; i<nitems; i++) c.set(keys[i], i);
        for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
        for (var i=0; i<nitems; i++) c.del(keys[i]);
    }
}
