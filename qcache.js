/**
 * qcache -- basic caches
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * 2015-01-28 - AR.
 */

module.exports = {
    QCache: QCache,
    TimeoutCache: TimeoutCache,
};

/**
 * simple name-value store
 * This is no different than just using a hash.
 */
function QCache( options ) {
    this._store = {};
}
QCache.prototype = {
    get: function get( name ) {
        return this._store[name];
    },

    set: function( name, value ) {
        this._store[name] = value;
    },

    delete: function( name ) {
        delete this._store[name];
    },
};

if (global.currentTimestamp) {
    // if available, use the qtimers timestamp
    var getTimestamp = currentTimestamp;
}
else {
    var _timestamp = Date.now();
    var _ncalls = 0;
    var getTimestamp = function() { return _timestamp; }
    tmr = setInterval(function() { _timestamp = Date.now(); }, 1);
    tmr.unref();
}

/**
 * name-value store with timeout
 */
function TimeoutCache( options ) {
    options = options || {};
    this._ttl = options.ttl || 999999999;
    this._store = {};
    this.currentTimestamp = options.currentTimestamp || getTimestamp;
}
TimeoutCache.prototype = {
    currentTimestamp: null,

    get: function get( name ) {
        var item = this._store[name];
        if (item) {
            if (item.t > this.currentTimestamp()) return item.v;
            else delete this._store[name];
        }
    },

    set: function set( name, value ) {
        this._store[name] = {t: this.currentTimestamp() + this._ttl, v: value};
    },

    delete: function delete_( name ) {
        delete this._store[name];
    },
};


// quicktest:
/**

// 5% faster with qtimers
timers = require('qtimers')
// ...but slower with currentTimestamp (because it call-counts and reloads at 1k?)
// ... and 1% faster if currentTimestamp just returns the timestamp w/o call counting
// ...but 5% faster to use our own timer and not the identical currentTimestamp ?!
//getTimestamp = timers.currentTimestamp;

//c = new TimeoutCache({ttl: 10, currentTimestamp: currentTimestamp});
c = new TimeoutCache({ttl: 10});
c.set("foo", 123);
console.log(getTimestamp(), c);

setTimeout(function(){
    console.log(getTimestamp(), c);
    console.log(c.get("foo"));
    console.log(getTimestamp(), c);
}, 10);

t1 = Date.now();
nloops = 10000000;
(function loop() {
    for (i=0; i<1000; i++) { c.set("foo", 1); c.get("foo"); }
    nloops -= 1000;
    if (nloops > 0) {
        setImmediate(loop);
    }
    else {
        console.log("AR: 10m get/set ms", Date.now() - t1);
        // 21m/s set/get, 2m set/get/delete with timestamp thread
        // 2.27m/s set/get with Date.now() on every call
        // 2.1m/s if updating ncalls
    }
})();

/**/
