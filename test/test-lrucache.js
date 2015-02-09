/**
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

var LruCache = require('../lrucache');

module.exports = {
    setUp: function(done) {
        this.cache = new LruCache();
        this.uniqid = function() { return Math.random() * 0x1000000 | 0 };
        done();
    },

    LruCache: {
        'index should export LruCache': function(t) {
            var qcache = require('../index');
            t.equal(LruCache, qcache.LruCache);
            t.done();
        },
    },
};
