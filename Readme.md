qcache
======
[![Build Status](https://api.travis-ci.org/andrasq/node-qcache.svg?branch=master)](https://travis-ci.org/andrasq/node-qcache?branch=master)
[![Coverage Status](https://codecov.io/github/andrasq/node-qcache/coverage.svg?branch=master)](https://codecov.io/github/andrasq/node-qcache?branch=master)


Some useful caches.

Caches implement the Store semantics of `set`, `get`, and `delete`, but unlike
Store, caches are free to discard contents according to their retention
heuristics.


Installation
------------

        npm install qcache
        npm test qcache


Overview
--------

Each cache is exported both as a property of qcache, and as a separate file.

        var TtlCache = require('qcache').TtlCache;
        var LruCache = require('qcache').LruCache;
        var MultiValueCache = require('qcache').MultiValueCache;

        var TtlCache = require('qcache/ttlcache');
        var LruCache = require('qcache/lrucache');
        var MultiValueCache = require('qcache/mvcache');


TtlCache
--------

Key-value store with a time-to-live (ttl) timeout limit.

## Benchmark

    $ node benchmark.js

    node=6.2.2 arch=ia32 mhz=3500 cpu="AMD Phenom(tm) II X4 B55 Processor" up_threshold=11
    name  speed  (stats)  rate
    qcache  1,582,436 ops/sec (29 runs of 10 calls in 1.833 out of 2.368 sec, +/- 0%) 1000
    node_cache  249,289 ops/sec (5 runs of 10 calls in 2.006 out of 2.381 sec, +/- 0%) 158
    memory_cache  859,635 ops/sec (16 runs of 10 calls in 1.861 out of 2.110 sec, +/- 0%) 543
    lru_cache  467,421 ops/sec (9 runs of 10 calls in 1.925 out of 2.246 sec, +/- 0%) 295

### new TtlCache( options )

        var TtlCache = require('qcache/ttlcache');
        var cache = new TtlCache();

Options:

- `ttl` - milliseconds before the stored value expires (default 1 year)
- `capacity` - the most items to cache at any time (default 10,000)
- `currentTimestamp` - function that returns a millisecond timestamp
(default is a built-in timeout timer)

Properties:

- `ttl` - the configured ttl
- `capacity` - the configured capacity
- `count` - number of items currently stored.  Read-only; do not write this value.

### get( key )

return the value stored under key.  Missing keys and expired contents read as
undefined.  An item expires when the current timestamp exceeds the item
ttl (time-to-live) value.

### set( key, value [,ttl] ), put

store the value under key for the configured ttl milliseconds.  If the cache
has already reached its capacity, one or more of the stored values will be
discarded to make room.

If provided, the optional time-to-live `ttl` will be used instead of the cache
instance default.

### delete( key ), del

remove the value from the cache.  Removed items read as undefined.

### gc( )

remove expired elements from the cache to free the occupied storage space

LruCache
--------

Least-recently-used replacement policy cache with a capacity limit.

### new (require('qcache/lrucache'))( options )

create a new lru cache

Options:

`capacity` - max number of elements to cache at one time.  Once the cache
capacity is reached, setting a new key causes the least recently used value to
be discarded.  Uses are insertion (set) and lookup (get).

### set( key, value )

store the value under key.  This key/value becomes the most recently used.

### get( key )

get the value stored under key.  This key/value becomes the most recently used.

### delete( key )

remove the key from the cache.


MultiValueCache
---------------

The multi-value cache holds multiple values indexed by the same key in
oldest-first insertion order.  There are no ttl and capacity limits
implemented, and since delete semantics are not immediately obvious, there is
no delete yet.

### new (require('qcache/mvcache'))( )

create a new multi-value cache

### set( key, value )
### push( key, value )

store the value under key as the newest value

### get( key )
### shift( key )

return the oldest value stored under key

### unshift( key, value )

store the value under key as the oldest value.  This value will be the one
returned by the next call to get().

### pop( key )

return the newest value stored under key

### isEmpty( key )

test whether there are any values stored under key

### getLength( key )

return the count of items stored under `key`

Change Log
----------

- 0.6.1 - write LruCache unit tests, fix LruCache delete
- 0.6.0 - optional ttl param to TtlCache set()
- 0.5.0 - move lib/timebase into qtimebase-1.0.0
- 0.4.2 - ttlcache: adjust benchmark to simulate reuse
- 0.4.0 - ttlcache: speed up deletes, 100% unit test coverage, benchmark script
- 0.3.6 - timebase: track timestamps more closely; mvcache: getLength method; test with qnit
- 0.3.4 - make timebase track current time even during blocking burst fetches
- 0.3.3 - added ttl cache gc() method; consider an item that expires this ms as still live
- 0.3.2 - switch to an adaptive timebase for timestamps
- 0.3.0 - LruCache; MultiValueCache
- 0.2.0 - TtlCache


Todo
----

- lru cache unit tests
- split out qtimebase into own package
