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

	addEventListener: function() {
        var args = util.addDomContext(this, arguments);
        var eventType = args[1];
        var hasCustomEvent = domEvents._eventRegistry.has(eventType);
        if (hasCustomEvent) {
            var eventDefinition = domEvents._eventRegistry.get(eventType);
            return eventDefinition.addEventListener.apply(domEvents, args);
        }

        var target = args[0];
		var eventArgs = Array.prototype.slice.call(args, 1);
        return target.addEventListener.apply(target, eventArgs);
	},
    
	removeEventListener: function() {
        var args = util.addDomContext(this, arguments);
        var eventType = args[1];
        var hasCustomEvent = domEvents._eventRegistry.has(eventType);
        if (hasCustomEvent) {
            var eventDefinition = domEvents._eventRegistry.get(eventType);
            return eventDefinition.removeEventListener.apply(domEvents, args);
        }

		var target = args[0];
		var eventArgs = Array.prototype.slice.call(args, 1);
        return target.removeEventListener.apply(target, eventArgs);
	},

	canAddEventListener: function() {
        var target = util.addDomContext(this, arguments)[0];
		return util.isDomEventTarget(target);
	},

	dispatch: function() {
        var args = util.addDomContext(this, arguments);
        var target = args[0];
        var eventData = args[1];
        var eventArgs = args[2];
        var bubbles = args[3];
        var cancelable = false;

		var event = util.createEvent(this, eventData, eventArgs, bubbles, cancelable);
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