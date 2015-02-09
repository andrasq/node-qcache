qcache
======

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

### new (require('qcache/ttlcache'))( options )

Options:

`ttl` - milliseconds before the stored value expires (default 1 year)

`capacity` - the most items to cache at any time (default 10,000)

`currentTimestamp` - function that returns a millisecond timestamp
(default is a built-in timeout timer)

Properties:

- `ttl` : the configured ttl
- `capacity` : the configured capacity
- `count` : number of items currently stored.  Read-only; do not write this value.

### get( key )

return the value stored under key.  Missing keys and expired contents
read as undefined.

### set( key, value )

store the value under key for the configured ttl milliseconds.  If the cache
has already reached its capacity, one or more of the stored values will be
discarded to make room.

### delete( key )

remove the value from the cache


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


Change Log
----------

0.3.0
- LruCache
- MultiValueCache

0.2.0
- TtlCache


Todo
----

- lru cache unit tests
