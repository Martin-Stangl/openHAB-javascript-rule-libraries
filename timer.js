'use strict';	

(function(context) {
    'use strict';	

    var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF");
    load(OPENHAB_CONF+'/automation/lib/javascript/core/utils.js');
    
    load(__DIR__+'/log.js');
    var log = Logger();       

    context.setTimerLogger = function setTimerLogger (Logger) {             
        log = Logger;
        log.trace("Function called with arguments {}", JSON.stringify(arguments));
    }

    context.TimerFactory = function TimerFactory (fn, millis, arg) {             
        try {
            log.trace("Function called with arguments {}", JSON.stringify(arguments));                 

            var _timer = undefined;
 
            return Object.create(Object.prototype, {
                fn: { value: fn },                
                millis: { value: millis },
                arg: { value: arg },                               


                start: { value: function start () {
                    try { 
                        log.trace("Function called with arguments {}", JSON.stringify(arguments));                 
                        this.reset();
                    } catch (err) {
                        log.error(err);
                    }
                }},

                stop: { value: function stop () {
                    try {
                        log.trace("Function called with arguments {}", JSON.stringify(arguments));               
                        if (_timer !== undefined) {
                            log.trace("Active timer {} exists.", _timer);                  
                            _timer.cancel();
                            _timer.purge();
                            log.debug("Timer {} stopped.", _timer);                            
                            _timer = undefined;
                        }
                    } catch (err) {
                        log.error(err);
                    }
                }},

                reset: { value: function reset () {
                    try {
                        log.trace("Function called with arguments {}", JSON.stringify(arguments));                 
                        this.stop();
                        _timer = setTimeout(this.fn, this.millis, this.arg);  
                        log.debug("Timer {} started with function = {}, milliseconds = {}, arguments = {}", _timer, this.fn, this.millis, JSON.stringify(this.arg));                            
                    } catch (err) {
                        log.error(err);
                    }
                }},

                isActive: { value: function isActive () {                    
                    log.trace("Function called with arguments {}", JSON.stringify(arguments));                 
                    return _timer !== undefined;
                }}

            })
        } catch (err) {
            log.error(err);
        }
    }

})(this);
