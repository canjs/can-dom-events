'use strict';

var namespace = require('can-namespace');
var util = require('./helpers/util');
var makeEventRegistry = require('./helpers/make-event-registry');

/**
 * @module {{}} can-dom-events
 * @parent can-infrastructure
 * @description Allows you to listen to a domEvent and special domEvents as well as dispatch domEvents.
 *
 * ```js
 * var domEvents = require("can-dom-events");
 * ```
 */
var domEvents = {
    _eventRegistry: makeEventRegistry(),

    addEvent (event, eventType) {
        return this._eventRegistry.add(event, eventType);
    },

	addEventListener: function(target, eventType) {
        var hasCustomEvent = domEvents._eventRegistry.has(eventType);
        if (hasCustomEvent) {
            var event = domEvents._eventRegistry.get(eventType);
            return event.addEventListener.apply(domEvents, arguments);
        }

		var eventArgs = Array.prototype.slice.call(arguments, 1);
        return target.addEventListener.apply(target, eventArgs);
	},
    
	removeEventListener: function(target, eventType) {
        var hasCustomEvent = domEvents._eventRegistry.has(eventType);
        if (hasCustomEvent) {
            var event = domEvents._eventRegistry.get(eventType);
            return event.removeEventListener.apply(domEvents, arguments);
        }

		var eventArgs = Array.prototype.slice.call(arguments, 1);
        return target.removeEventListener.apply(target, eventArgs);
	},

	canAddEventListener: util.isDomEventTarget,

	dispatch: function(target, eventData, eventArgs, bubbles) {
        var cancelable = false;
		var event = util.createEvent(target, eventData, eventArgs, bubbles, cancelable);
		var enableForDispatch = util.forceEnabledForDispatch(target, event);
		if(enableForDispatch) {
			target.disabled = false;
		}

		var ret = target.dispatchEvent(event);
		if(enableForDispatch) {
			target.disabled = true;
		}

		return ret;
	}
};

module.exports = namespace.domEvents = domEvents;