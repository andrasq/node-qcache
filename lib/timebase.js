/**
 * Adaptive timestamp source, uses Date.now() or a timer thread
 * depending on the level of usage.
 *
 * Copyright (C) 2015 Andras Radics
 * Licensed under the Apache License, Version 2.0
 *
 * A millisecond timer thread in node v0.10.29 consumes 4% cpu,
 * which at 6m calls / sec is the equivalent of 240 Date.now() calls / ms.
 * I.e., the default interval threads are very expnsive.
 *
 * The adaptive timebase is a source of millisecond timestamps.  When
 * lots of timestamps are required, it switches to interval timer mode
 * and relies on a timer thread to update the value.  When usage drops,
 * it quickly reverts to separate timestamps mode.
 */

module.exports = getTimestampAdaptive;

function getTimestampBasic( ) {
    return Date.now();
}


var _timestamp;         // current time
var _timer;             // interval timer, when running
var _load;              // num same-ms calls exponentially decaying "load avg"

function getTimestampAdaptive( ) {
    if (_timer) {
        _load += 1;
        return _timestamp;
    }
    else {
        var ts = Date.now();
        if (ts === _timestamp) {
            _load += 1;
            if (!_timer && _load > 200) {
                var timer = function(){
                    _timestamp = Date.now();
                    _load >>= 1;
                    if (_load <= 50) {
                        clearInterval(_timer);
                    }
                };
                _timer = setInterval(timer, 1, 0);
            }
        }
        else {
            _load >>= 1;
        }
        return _timestamp = ts;
    }
}
