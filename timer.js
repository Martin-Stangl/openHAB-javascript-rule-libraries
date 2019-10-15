'use strict';	

(function(context) {
    'use strict';	

    var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF");
    load(OPENHAB_CONF+'/automation/lib/javascript/core/utils.js');
    
    load(__DIR__+'/logger.js');    
    var log = Logger(__FILE__.split('/').pop());       

    context.setTimerLogger = function setTimerLogger (Logger) {             
        log = Logger;
        log.trace(Error("Function called."));
    }

    context.TimerFactory = function TimerFactory (fn, millis, arg) {             
        try {
            log.trace(Error("Function called."));                  
            return Object.create(Object.prototype, {
                fn: { value: fn },                
                millis: { value: millis },
                arg: { value: arg },                               

                _timer: { value: null, writable: true },
                _active: { value: false, writable: true },

                start: { value: function start () {
                    try { 
                        log.trace(Error("Function called."));                  
                        this.reset();
                    } catch (err) {
                        log.error(err);
                    }
                }},

                stop: { value: function stop () {
                    try {
                        log.trace(Error("Function called."));                
                        if (this._timer !== null) {
                            log.trace(Error("Active timer " + this._timer + " exists."));                  
                            this._timer.cancel();
                            this._timer.purge();
                            log.debug(Error("Timer " + this._timer + " stopped."));                            
                            this._timer = null;
                        }
                        this._active = false; 
                    } catch (err) {
                        log.error(err);
                    }
                }},

                reset: { value: function reset () {
                    try {
                        log.trace(Error("Function called."));                  
                        this.stop();
                        this._timer = setTimeout(this.fn, this.millis, this.arg);  
                        log.debug(Error("Timer " + this._timer + " started with function = " + this.fn + ", milliseconds = " + this.millis + ", arguments = " + this.arg));                            
                        this._active = true;  
                    } catch (err) {
                        log.error(err);
                    }
                }},

                isActive: { value: function isActive () {                    
                    log.trace(Error("Function called."));                  
                    return this._active;
                }}

            })
        } catch (err) {
            log.error(err);
        }
    }

})(this);