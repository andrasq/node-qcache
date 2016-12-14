/**
 * Copyright (C) 2015-2016 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var qtimeit = require('../qtimeit');
var qcache = require('./');
var node_cache = require('node-cache');
var memory_cache = require('memory-cache');
var lru_cache = require('lru-cache');

var nloops = 100;
var nitems = 100;
var nreuse = 4;
var keys = []; for (var i=0; i<nitems; i++) keys[i] = 'key-' + i;
var x;

//qtimeit(100000, function() { x = keys[i] });
// 39m/s

qtimeit.bench.opsPerTest = nloops * nitems;
qtimeit.bench.timeGoal = 2;
for (var repeat=0; repeat<5; repeat++) qtimeit.bench({
    qcache: function() {
        c = new qcache.TtlCache({ capacity: 999999999, ttl: 999999 });
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.delete(keys[i]);
        }
    },

    node_cache: function() {
        c = new node_cache();
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    memory_cache: function() {
        // global cache, not separate objects ?!
        c = memory_cache;
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.put(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },

    lru_cache: function() {
        c = lru_cache({ max: 999999999, maxAge: 999999 });
        for (var j=0; j<nloops; j++) {
            for (var i=0; i<nitems; i++) c.set(keys[i], i);
            for (var k=0; k<nreuse; k++) for (var i=0; i<nitems; i++) x = c.get(keys[i]);
            for (var i=0; i<nitems; i++) c.del(keys[i]);
        }
    },
})
