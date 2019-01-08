/**
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var qcache = require('./qcache');

// TODO: deprecate top-level default class
module.exports = function(opt) { return new qcache.TtlCache(opt) };

// TODO: deprecate TimeoutCache alias
module.exports.TimeoutCache = qcache.TimeoutCache;

module.exports.TtlCache = require('./ttlcache');
module.exports.LruCache1 = require('./lib/lrucache');
module.exports.LruCache2 = require('./lrucache');
module.exports.LruCache = module.exports.LruCache2;
module.exports.MultiValueCache = require('./mvcache');
module.exports.MvcCache = module.exports.MultiValueCache;
