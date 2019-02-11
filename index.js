/**
 * Copyright (C) 2015,2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */

var qcache = require('./lib/qcache');

// TODO: deprecate top-level default class
module.exports = function(opt) { return new qcache.TtlCache(opt) };

// TODO: deprecate TimeoutCache alias
module.exports.TimeoutCache = qcache.TimeoutCache;

module.exports.TtlCache = require('./lib/qcache').TtlCache;
module.exports.LruCache1 = require('./lib/lrucache');
module.exports.LruCache2 = require('./lib/lrucache2');
module.exports.LruCache = module.exports.LruCache2;
module.exports.MultiValueCache = require('./lib/mvcache');
module.exports.MvcCache = module.exports.MultiValueCache;
