'use strict';	

(function(context) {
    'use strict';	

    var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF");
    load(OPENHAB_CONF+'/automation/lib/javascript/core/actions.js');
    load(OPENHAB_CONF+'/automation/lib/javascript/core/utils.js');      

    context.OFF = 0;
    context.ERROR = 200;
    context.WARN = 300;
    context.INFO = 400;
    context.DEBUG = 500;

    context.Logger = function(name, notificationLevel, config) {
        // Set default config for config params not provided.
        if (config === undefined) config = {};
        if (config.ERROR === undefined) config.ERROR = {};
        if (config.WARN  === undefined) config.WARN  = {};
        if (config.INFO  === undefined) config.INFO  = {};
        if (config.DEBUG === undefined) config.DEBUG = {};
        if (config.ERROR.prefix === undefined) config.ERROR.prefix = "short";
        if (config.WARN.prefix  === undefined) config.WARN.prefix  = "none";
        if (config.INFO.prefix  === undefined) config.INFO.prefix  = "none";
        if (config.DEBUG.prefix === undefined) config.DEBUG.prefix = "short";       
        
        try {
            return Object.create(Object.prototype, {
                _notificationLevel: { value: notificationLevel === undefined ? OFF : notificationLevel },
                _config: { value: config },                
                _name: { value: name === undefined ? __FILE__.split(__DIR__).pop() : name },

                error: { value: function error (msg) {
                    try {
                        logError(this._getLogMessage(msg));
                        if (this._notificationLevel >= ERROR) {
                            this._sendNotification(this._getLogMessage(msg, this._config.ERROR.prefix, "ERROR"), "fire", "ERROR");
                        }
                    } catch (err) {
                        logError(this._getLogMessage(err));
                    }
                }},

                warn: { value: function warn (msg) {
                    try {
                        logWarn(this._getLogMessage(msg));
                        if (this._notificationLevel >= WARN) {
                            this._sendNotification(this._getLogMessage(msg, this._config.WARN.prefix, "WARN"), "error", "WARN");                            
                        }
                    } catch (err) {
                        logError(this._getLogMessage(err));
                    }
                }},

                info: { value: function info (msg) {
                    try {
                        logInfo(this._getLogMessage(msg));
                        if (this._notificationLevel >= INFO) {
                            this._sendNotification(this._getLogMessage(msg, this._config.INFO.prefix, "INFO"), "lightbulb", "INFO");                            
                        }
                    } catch (err) {
                        logError(this._getLogMessage(err));
                    }
                }},

                debug: { value: function debug (msg) {
                    try {
                        logDebug(this._getLogMessage(msg));
                        if (this._notificationLevel >= DEBUG) {
                            this._sendNotification(this._getLogMessage(msg, this._config.DEBUG.prefix, "DEBUG"), "text", "DEBUG");                            
                        }
                    } catch (err) {
                        logError(this._getLogMessage(err));
                    }
                }},

                trace: { value: function trace (msg) {
                    try {                        
                        logTrace(this._getLogMessage(msg));                        
                    } catch (err) {                        
                        logError(this._getLogMessage(err));                        
                    }
                }},

                _getCaller: { value: function _getCaller (stack) {
                    try {                        
                        var caller = stack.split('\n')[1].split(' ')[1];
                        return caller == "value" ? "" : caller;
                    } catch (err) {
                        return null;
                    }
                }},

                _getLogMessage: { value: function _getLogMessage (msg, prefix, levelString) {                                        
                    if (prefix === undefined) prefix = "log";                                                            
                    if (prefix == "none") {
                        return msg.message;
                    }
                    var level = "";
                    if (prefix != "log") {
                        level = "[" + levelString + "] ";
                    }
                    if (prefix == "level") {
                        return (level + msg.message);
                    }
                    var caller = this._getCaller(msg.stack);
                    var callerText;
                    switch (caller) {
                        case null:
                            callerText = "";
                            break;
                        case "":
                            callerText = prefix == "short" ? "" : ", anonymous function";
                            break;
                        default:
                            callerText = ", function " + caller;
                    }
                    var message = msg.message == "" ? "" : "] " + msg.message;                    
                    return (level + "[" + this._name+ ": " + (prefix == "short" ? msg.fileName.split('/').pop() : msg.fileName) + ", line " + msg.lineNumber + callerText + message);
                }},
                
                _sendNotification: { value: function _sendNotification (message, icon, levelString) {                                                                                
                    if (this._config[levelString].recipients !== undefined) {
                        this._config[levelString].recipients.forEach(function(mail){                            
                            NotificationAction.sendNotification(mail, message, icon, levelString);                            
                        })
                        if (this._config[levelString].recipients.length > 0) {
                            this.trace(Error("Notification sent to " + this._config[levelString].recipients.join(", ") + ". Message: \"" + message + "\""));
                        }                         
                    } else {                        
                        NotificationAction.sendBroadcastNotification(message, icon, levelString);
                        this.trace(Error("Broadcast notification sent. Message: \"" + message + "\""));
                    }                    
                }}

            })
        } catch (err) {
            logError(err.fileName + ", line " + err.lineNumber + ": " + err.message);
        }
    }    

})(this);