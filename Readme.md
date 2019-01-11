qcache
======
[![Build Status](https://api.travis-ci.org/andrasq/node-qcache.svg?branch=master)](https://travis-ci.org/andrasq/node-qcache?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/andrasq/node-qcache/badge.svg?branch=master)](https://coveralls.io/github/andrasq/node-qcache?branch=master)


Some useful caches: time-to-live, least-recently-used, multi-value.

Caches implement the Store semantics of `set`, `get`, and `delete`, but unlike
Store, caches are free to discard contents according to their retention
heuristics.


Installation
------------

        npm install qcache
        npm test qcache


Overview
--------

        var TtlCache = require('qcache').TtlCache;
        var LruCache = require('qcache').LruCache;
        var MultiValueCache = require('qcache').MultiValueCache;

        var cache = new LruCache();
        cache.set('a', 1);
        cache.set('b', 2);
        var a = cache.get('a');         // => 1
        var b = cache.get('b');         // => 2

Benchmark
---------

    $ node benchmark.js

    package versions:
      qcache 0.7.0
      node-cache 4.2.0
      memory-cache 0.2.0
      lru-cache 5.1.1

    ---------------- TTL cache:
    qtimeit=0.21.0 node=8.11.1 v8=6.2.414.50 platform=linux kernel=4.9.0-0.bpo.4-amd64 up_threshold=false
    arch=ia32 mhz=4186 cpuCount=8 cpu="Intel(R) Core(TM) i7-6700K CPU @ 4.00GHz"
    name                           speed           rate
    lru-cache                  3,867,374 ops/sec   1934 >>>>>>>>>>
    node-cache                   883,862 ops/sec    442 >>
    memory-cache               2,537,581 ops/sec   1269 >>>>>>
    qcache.TtlCache            8,744,054 ops/sec   4372 >>>>>>>>>>>>>>>>>>>>>>
    qcache.LruCache capped     5,053,493 ops/sec   2527 >>>>>>>>>>>>>

    ---------------- LRU cache:
    name                           speed           rate
    lru-cache 1% lru           1,090,209 ops/sec    545 >>>
    lru-cache 25% lru          1,247,800 ops/sec    624 >>>
    qcache.LruCache 1% lru     5,011,800 ops/sec   2506 >>>>>>>>>>>>>
    qcache.LruCache 25%        4,659,632 ops/sec   2330 >>>>>>>>>>>>


TtlCache
========

Key-value store with a time-to-live (ttl) timeout limit.

### new TtlCache( options )

        var TtlCache = require('qcache').TtlCache;
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
- `max` - same as capacity

### get( key )

return the value stored under key.  Missing keys and expired contents read as
`undefined`.  An item expires when the current timestamp exceeds the item
ttl (time-to-live) value.

### set( key, value [,ttl] ), put

store the value under key for the configured ttl milliseconds.  If the cache
has already reached its capacity, one or more of the stored values will be
discarded to make room.

If provided, the optional time-to-live `ttl` will be used instead of the cache
instance configured default.

### delete( key ), del

remove the value from the cache.  Removed items read as undefined.

### gc( )

remove expired elements from the cache to free the occupied storage space

LruCache
========

Least-recently-used replacement policy cache with a capacity limit.

As of qcache@0.7.0 the cache was reimplemented using a fast doubly-linked list,
which is not only 2-3x faster but for large datasets can be orders of magnitude faster.
The old version is still available as `require('qcache').LruCache1`.

### new (require('qcache').LruCache)( options )

create a new lru cache

Options:

`capacity` - max number of elements to cache at one time.  Once the cache
capacity is reached, setting a new key causes the least recently used value to
be discarded.  Default is `Infinity`, unlimited number of entries.

Properties:

- `capacity` - the configured capacity
- `count` - the number of items in the cache

### set( key, value )

store the value under key.  This key/value becomes the most recently used.
If this value would exceed the configured cache `capacity`, the oldest (least recently
accessed) value is displaced from the cache..

### get( key )

get the value stored under key.  This key/value becomes the most recently used.
Missing keys and displaced values read as `undefined`.

### delete( key ), del

remove the key from the cache.


MultiValueCache
===============

The multi-value cache holds multiple values indexed by the same key in
oldest-first insertion order.  There are no ttl and capacity limits
implemented, and since delete semantics are not immediately obvious, there is
no delete yet.

### new (require('qcache').MultiValueCache)( )

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

- 0.7.0 - LruCache much faster rewrite, fix LruCache1 count
- 0.6.2 - improve lrucache tests
- 0.6.1 - write LruCache unit tests, fix LruCache1 delete; 100% test coverage
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
