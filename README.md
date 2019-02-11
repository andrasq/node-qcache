qcache
======
[![Build Status](https://api.travis-ci.org/andrasq/node-qcache.svg?branch=master)](https://travis-ci.org/andrasq/node-qcache?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/andrasq/node-qcache/badge.svg?branch=master)](https://coveralls.io/github/andrasq/node-qcache?branch=master)


Some useful caches: time-to-live, least-recently-used, multi-value.

Caches implement the Store semantics of `set`, `get`, and `delete`, but unlike
Store, caches are free to discard contents according to their retention
heuristics.


Overview
--------

    const qcache = require('qcache');
    const TtlCache = qcache.TtlCache;
    const LruCache = qcache.LruCache;
    const MultiValueCache = qcache.MultiValueCache;

    var cache = new LruCache();
    cache.set('a', 1);
    cache.set('b', 2);
    var a = cache.get('a');         // => 1
    var b = cache.get('b');         // => 2


Benchmark
---------

    $ node benchmark.js

    package versions:
      qcache 0.7.1
      node-cache 4.2.0
      memory-cache 0.2.0
      lru-cache 5.1.1

    ---------------- TTL cache:
    qtimeit=0.21.0 node=8.11.1 v8=6.2.414.50 platform=linux kernel=4.9.0-0.bpo.4-amd64 up_threshold=false
    arch=ia32 mhz=4184 cpuCount=8 cpu="Intel(R) Core(TM) i7-6700K CPU @ 4.00GHz"
    timeGoal=1 opsPerTest=10000 forkTests=false
    name                           speed           rate
    lru-cache                  3,874,722 ops/sec   1937 >>>>>>>>>>
    node-cache                   678,685 ops/sec    339 >>
    qcache.TtlCache            8,532,265 ops/sec   4266 >>>>>>>>>>>>>>>>>>>>>

    ---------------- LRU cache:
    timeGoal=1 opsPerTest=10000 forkTests=false
    name                           speed           rate
    lru-cache 1% lru           1,101,544 ops/sec    551 >>>
    lru-cache 25% lru          1,263,517 ops/sec    632 >>>
    qcache.LruCache 1% lru     5,034,081 ops/sec   2517 >>>>>>>>>>>>>
    qcache.LruCache 25%        4,668,964 ops/sec   2334 >>>>>>>>>>>>


TtlCache
========

Key-value store with a time-to-live (ttl) timeout limit.

### new qcache.TtlCache( options )

        var TtlCache = qcache.TtlCache;
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

### keys( )

return the currently tracked cache keys, including keys that may be expired or been deleted.


LruCache
========

Least-recently-used replacement policy cache with a capacity limit.

As of qcache@0.7.0 the cache was reimplemented using a fast doubly-linked list,
which is not only 2-3x faster but for large datasets can be orders of magnitude faster.
The old version is still available as `qcache.LruCache1`.

### new qcache.LruCache( options )

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

### keys( )

return the currently tracked cache keys, including keys that may be expired or been deleted.


MultiValueCache
===============

The multi-value cache holds multiple values indexed by the same key in
oldest-first insertion order.  There are no ttl and capacity limits
implemented, and since delete semantics are not immediately obvious, there is
no delete yet.

### new qcache.MultiValueCache( )

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

### keys( )

return the currently tracked cache keys, including keys that may be expired or been deleted.


Change Log
----------

- 0.8.0 - `keys` method on TtlCache, LruCache, MultiValueCache, test with newer `qnit`
- 0.7.2 - faster LruCache
- 0.7.1 - LruCache much faster rewrite, fix LruCache1 count
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
