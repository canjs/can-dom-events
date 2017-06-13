/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-dom-events@0.0.1#helpers/util*/
define('can-dom-events/helpers/util', function (require, exports, module) {
    'use strict';
    var getCurrentDocument = require('can-util/dom/document/document');
    var isBrowserWindow = require('can-util/js/is-browser-window/is-browser-window');
    function getTargetDocument(target) {
        return target.ownerDocument || getCurrentDocument();
    }
    function createEvent(target, eventData, bubbles, cancelable) {
        var doc = getTargetDocument(target);
        var event = doc.createEvent('HTMLEvents');
        var eventType;
        if (typeof eventData === 'string') {
            eventType = eventData;
        } else {
            eventType = event.type;
            for (var prop in eventData) {
                if (event[prop] === undefined) {
                    event[prop] = event[prop];
                }
            }
        }
        if (bubbles === undefined) {
            bubbles = true;
        }
        event.initEvent(eventType, bubbles, cancelable);
        return event;
    }
    function isDomEventTarget(obj) {
        if (!(obj && obj.nodeName)) {
            return obj === window;
        }
        var nodeType = obj.nodeType;
        return nodeType === Node.DOCUMENT_NODE || nodeType === Node.ELEMENT_NODE;
    }
    function addDomContext(context, args) {
        if (isDomEventTarget(context)) {
            args = Array.prototype.slice.call(args, 0);
            args.unshift(context);
        }
        return args;
    }
    function removeDomContext(context, args) {
        if (!isDomEventTarget(context)) {
            args = Array.prototype.slice.call(args, 0);
            context = args.shift();
        }
        return {
            context: context,
            args: args
        };
    }
    var fixSyntheticEventsOnDisabled = false;
    (function () {
        if (!isBrowserWindow()) {
            return;
        }
        var testEventName = 'fix_synthetic_events_on_disabled_test';
        var input = document.createElement('input');
        input.disabled = true;
        var timer = setTimeout(function () {
            fixSyntheticEventsOnDisabled = true;
        }, 50);
        var onTest = function onTest() {
            clearTimeout(timer);
            input.removeEventListener(testEventName, onTest);
        };
        input.addEventListener(testEventName, onTest);
        try {
            var event = document.create('HTMLEvents');
            event.initEvent(testEventName, false);
            input.dispatchEvent(event);
        } catch (e) {
            onTest();
            fixSyntheticEventsOnDisabled = true;
        }
    }());
    function isDispatchingOnDisabled(element, event) {
        var eventType = event.type;
        var isInsertedOrRemoved = eventType === 'inserted' || eventType === 'removed';
        var isDisabled = !!element.disabled;
        return isInsertedOrRemoved && isDisabled;
    }
    function forceEnabledForDispatch(element, event) {
        return fixSyntheticEventsOnDisabled && isDispatchingOnDisabled(element, event);
    }
    module.exports = {
        createEvent: createEvent,
        addDomContext: addDomContext,
        removeDomContext: removeDomContext,
        isDomEventTarget: isDomEventTarget,
        getTargetDocument: getTargetDocument,
        forceEnabledForDispatch: forceEnabledForDispatch
    };
});
/*can-dom-events@0.0.1#helpers/make-event-registry*/
define('can-dom-events/helpers/make-event-registry', function (require, exports, module) {
    'use strict';
    function EventRegistry() {
        this._registry = {};
    }
    module.exports = function makeEventRegistry() {
        return new EventRegistry();
    };
    EventRegistry.prototype.has = function (eventType) {
        return !!this._registry[eventType];
    };
    EventRegistry.prototype.get = function (eventType) {
        return this._registry[eventType];
    };
    EventRegistry.prototype.add = function (event, eventType) {
        if (arguments.length === 1) {
            return this.add(event, event.defaultEventType);
        }
        if (typeof eventType !== 'string') {
            throw new TypeError('Event type must be a string, not ' + eventType);
        }
        if (!event) {
            throw new Error('An event must be provided');
        }
        if (typeof event.addEventListener !== 'function') {
            throw new TypeError('Event addEventListener must be a function');
        }
        if (typeof event.removeEventListener !== 'function') {
            throw new TypeError('Event removeEventListener must be a function');
        }
        var existingEvent = this._registry[eventType];
        if (existingEvent) {
            throw new Error('Event "' + eventType + '" is already registered');
        }
        this._registry[eventType] = event;
        var self = this;
        return function remove() {
            self._registry[eventType] = undefined;
        };
    };
});
/*can-dom-events@0.0.1#can-dom-events*/
define('can-dom-events', function (require, exports, module) {
    (function (global) {
        'use strict';
        var namespace = require('can-namespace');
        var util = require('can-dom-events/helpers/util');
        var makeEventRegistry = require('can-dom-events/helpers/make-event-registry');
        var domEvents = {
            _eventRegistry: makeEventRegistry(),
            addEvent: function (event, eventType) {
                return this._eventRegistry.add(event, eventType);
            },
            addEventListener: function (target, eventType) {
                var hasCustomEvent = domEvents._eventRegistry.has(eventType);
                if (hasCustomEvent) {
                    var event = domEvents._eventRegistry.get(eventType);
                    return event.addEventListener.apply(domEvents, arguments);
                }
                var eventArgs = Array.prototype.slice.call(arguments, 1);
                return target.addEventListener.apply(target, eventArgs);
            },
            removeEventListener: function (target, eventType) {
                var hasCustomEvent = domEvents._eventRegistry.has(eventType);
                if (hasCustomEvent) {
                    var event = domEvents._eventRegistry.get(eventType);
                    return event.removeEventListener.apply(domEvents, arguments);
                }
                var eventArgs = Array.prototype.slice.call(arguments, 1);
                return target.removeEventListener.apply(target, eventArgs);
            },
            dispatch: function (target, eventData, bubbles, cancelable) {
                var event = util.createEvent(target, eventData, bubbles, cancelable);
                var enableForDispatch = util.forceEnabledForDispatch(target, event);
                if (enableForDispatch) {
                    target.disabled = false;
                }
                var ret = target.dispatchEvent(event);
                if (enableForDispatch) {
                    target.disabled = true;
                }
                return ret;
            }
        };
        module.exports = namespace.domEvents = domEvents;
    }(function () {
        return this;
    }()));
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();