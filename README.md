# openHAB-javascript-rule-libraries
Some helpful libraries for implementing openHAB rules using jsr223 javascript.
- [**logger.js**](#loggerjs): A logger to create high quality log entries in the [openhab.log](https://www.openhab.org/docs/administration/logging.html) and to send [notifications](https://www.openhab.org/docs/configuration/actions.html#cloud-notification-actions) to your smartphone and tablet ([Android APP](https://www.openhab.org/docs/apps/android.html)/[iOS App](https://www.openhab.org/docs/apps/ios.html)) via an [openHAB Cloud instance](https://github.com/openhab/openhab-cloud), e.g. [myopenHAB.org](https://myopenhab.org/).
- [**timer.js**](#timerjs): A robust timer. Works basically like setTimeout() but also takes care of the timer lifecycle.

### How to use
1. The libraries are based on the [openHAB Helper Libraries](https://openhab-scripters.github.io/openhab-helper-libraries/index.html). So first you have to install them. The [openHAB Helper Libraries' install instructions](https://openhab-scripters.github.io/openhab-helper-libraries/Getting%20Started/Installation.html) also contain instructions on how to get the [openHAB Next-Generation Rule Engine](https://www.openhab.org/docs/configuration/rules-ng.html#next-generation-rule-engine) up and running.
2. Download the .js files from this repository and put them into the `automation/lib/javascript/community` folder.
3. Include the library of your choicce in your .js rule file using the load() command. For e.g.:
```
var OPENHAB_CONF = Java.type("java.lang.System").getenv("OPENHAB_CONF");
load(OPENHAB_CONF+'/automation/lib/javascript/community/logger.js');
```
4. You find detail usage instructions for each library below.

## logger.js
logger.js tries to add useful information to your log message, like the logger name as well as the file, the line and the function, in which the message was triggered. Additionally, it can send these log messages to your smartphone or tablet.

### Simplest usage
logger.js tries to figure out a sensible default configuration, so you do not need to provide any parameters when initializing it.
By default, logger.js will log to openhab.log and not send any push notifications.
```
var log = Logger();
log.error(Error("My error message"));
log.warn(Error("My warn message"));
log.info(Error("My info message"));
log.debug(Error("My debug message"));
log.trace(Error("My trace message"));
```
The message always has to be provided as an Error object, as this gives us some additional information about where the message was triggered.

The resulting log entries look like this:
```
14:44:34.458 [TRACE] [jsr223.javascript                    ] - |[<eval>: file:/C:/WORKSP~1/Projects/openHAB/openhab/conf/automation/lib/javascript/community/Martin-Stangl/timer.js, line 39, function example] My trace message|
```

Tipp: As the Logger also outputs the function name, it is helpful to not use anonymous functions. So for e.g. use `function example ()` instead of `function ()`, which defines a function called example.

### Providing a name (context, scope)
The `<eval>` in the above example is a result of the Logger trying to figure out a name for itself by determining the name of the scipt file it was initialized in. So it should be something like `gardenLightRules.js`. Unfortunately, due to the way how the Next-Generation Rule Engine loads the scripts, the file information gets lost and we get `<eval>` instead. (For scripts loaded in with load(), it works fine.)

Therefore it is usually a good idea to provide the Logger a name, when initializing it:
```
var log = Logger("Garden lights");
log.trace(Error("My trace message"));
```

The resulting log entries look like this:
```
14:44:34.458 [TRACE] [jsr223.javascript                    ] - |[Garden lights: file:/C:/WORKSP~1/Projects/openHAB/openhab/conf/automation/lib/javascript/community/Martin-Stangl/timer.js, line 39, function example] My trace message|
```

### Enabling notifications
To have logger.js also send push notifications, you first need to configure a working [openHAB Cloud Connector](https://www.openhab.org/addons/integrations/openhabcloud/).
Then, when initializing the Logger, you have to tell it, which message levels to send out as notifications:
```
var log = Logger("Garden lights", DEBUG);
log.error(Error("My error message"));
log.warn(Error("My warn message"));
log.info(Error("My info message"));
log.debug(Error("My debug message"));
log.trace(Error("My trace message"));
```

- OFF: No messages are sent as notifications.
- ERROR: Error messages are sent as notifications.
- WARN: Error and warn messages are sent as notifications.
- INFO: Error, warn and info messages are sent as notifications. 
- DEBUG: Error, warn, info and debug messages are sent as notifications.

Trace messages cannot be sent as notifications. 

### Configuring notification format
The prefix for the notification message can be selected from the following choices:
- long: `[INFO] [Garden lights: file:/C:/WORKSP~1/Projects/openHAB/openhab/conf/automation/lib/javascript/community/Martin-Stangl/timer.js, line 37, function example] My info message`
- short: `[INFO] [Garden lights: timer.js, line 37, function example] My info message`
- level: `[INFO] My info message`
- none: `My info message`

Defaults are:
- ERROR: short
- WARN: none
- INFO: none
- DEBUG: short

The prefix can be configured when initializing the Logger:
```
var log = Logger("Garden lights", DEBUG, {
        "ERROR": {"prefix": "short"},
        "WARN":  {"prefix": "leel"},
        "INFO":  {"prefix": "none"},
        "DEBUG": {"prefix": "long"}
    });
```

### Configuring notification recipients
By default, notifications are sent out as a broadcast, meaning all persons with devices registered in the cloud instance receive the notifications. But it is possible to provide specific recipients when initializing the Logger by providing their cloud instance IDs (e-mail address):
```
var log = Logger("Garden lights", DEBUG, {
        "ERROR": {"recipients": ["me@mydomain.example", "mygeek@mydomain.example"]},    // default prefix, 2 recipients
        "WARN":  {"prefix": "short"},                                                   // prefix short, broadcast (to all recipients)
        "INFO":  {"recipients": []]},                                                   // no recipient (no notification is sent)
        "DEBUG": {"prefix": "long", "recipients": ["mygeek@mydomain.example"]}          // prefix long, 1 recipient
    });
```

## timer.js
Timer.js provides an easy to use countdown timer, which executes a function once zero is reached. A common usage scenario is to turn a light off if no motion was detected for some time.
Timer.js uses logger.js, so logger.js has to be available in the same folder as timer.js.

### Timer usage
#### Timer initialization
First, a timer needs to be initialized. 
Parameters are identical to setTimeout(), so basically an undefined number of parameters is allowed (minimum two):
- First parameter: Function to be executed, when the timer reaches zero.
- Second parameter: Timeout in milliseconds. 
- All other parameters: Will be passed to the function provided as the first parameter.

Example, without additional parameters for the function:
```
var idleTimer = TimerFactory(function timerEnd () {        
        sendCommand("ItemGardenLight_Switch, "OFF");        
    }, 
    5*60*1000);  // 5 Minutes
```

Tipp: Usually a timer is initialized outside a rule (`JSRule()`) and not within a rule, as initializing within a rule creates a new timer very time while the old timer continues to execute in the background. Also multiple rules can be invovled in handling one timer, like one to start/reset a timer and one to stop it.

#### Starting the timer
``` 
idleTimer.start();
``` 

Starts the countdown of a timer. 
If the timer is already running, it stops the timer first and then starts to count down from the beginning. Basically, `start()` is an alias for `reset()`.

#### Stopping the timer
``` 
idleTimer.stop();
``` 

Stops the countdown of a timer. 
If the timer is not running, it simply does nothing.

#### Resetting the timer
``` 
idleTimer.reset();
``` 

Resets the countdown of a running timer. The timer continues to count down after the reset.
If the timer was not counting down, it is started.

#### Checking timer status
``` 
idleTimer.isActive();
``` 

Returns `true`, if the timer is running (counting down), otherwhise `false`.

### Timer Logger configuration
By default, timer.js initializes its own Logger using logger.js.
If you want to configure the Logger for timer.js or have timer.js use the same Logger you already have initialzed, you can provide the Logger using `setTimerLogger(Logger)`. This should be done ideally immediately after timer.js was loaded and before the first Timer is initialized.