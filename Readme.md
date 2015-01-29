qcache
======

Some useful caches.


QCache
------

canonical key-value store.  No different than using a hash.

### new qcache.QCache( )

        hash = {}

### get( key )

        hash[key]

### set( key, value )

        hash[key] = value

### delete( key )

        delete hash[key]


TimeoutCache
------------

key-value store with a millisecond time-to-live (ttl) timeout

### new qcache.TimeoutCache( options )

options:

- `ttl` : milliseconds before contents expire

### get( key )

return the value stored under key.  Missing keys and expired contents
read as undefined.

### set( key, value )

store the value under key for the configured ttl milliseconds

### delete( key )

remove the key from the cache


Todo
----

- unit tests
