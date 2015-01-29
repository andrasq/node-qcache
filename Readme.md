qcache
======

Some useful caches.

Caches implement the Store semantics of `set`, `get`, and `delete`, but unlike
Store, caches are free to discard contents according to their retention
heuristics.


TtlCache
--------

key-value store with a time-to-live (ttl) timeout

### new qcache.TtlCache( options )

options:

- `ttl` : milliseconds before the stored value expires (default 1 year)
- `capacity` : the most items to cache at any time (default 10,000)
- `currentTimestamp` : function that returns a millisecond timestamp
  (default is a built-in timeout timer)

properties:

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


Todo
----

- lru cache
