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

	/**
	 * @function can-dom-events.addEvent addEvent
	 * @signature `domEvents.addEvent( event [, eventType ] )`
	 * @param {EventDefinition} event The custom event definition.
	 * @param {String} eventType The event type to associated with the custom event.
	 * @return {function} removeEvent The callback to remove the custom event from the registry.
	 *
	 * Add a custom event to the global event registry.
	 */
	addEvent (event, eventType) {
		return this._eventRegistry.add(event, eventType);
	},

	/**
	 * @function can-dom-events.addEventListener addEventListener
	 * @signature `domEvents.addEventListener( target, eventType, ...eventArgs )
	 * @param {Window | Document | HTMLElement} target The object to which to add the listener.
	 * @param {String} eventType The event type with which to register.
	 * @param {*} eventArgs The arguments which configure the associated event's behavior.
	 *
	 * Add an event listener for eventType to the target.
	 */
	addEventListener: function(target, eventType) {
        var hasCustomEvent = domEvents._eventRegistry.has(eventType);
        if (hasCustomEvent) {
            var event = domEvents._eventRegistry.get(eventType);
            return event.addEventListener.apply(domEvents, arguments);
        }

		var eventArgs = Array.prototype.slice.call(arguments, 1);
        return target.addEventListener.apply(target, eventArgs);
	},
    
	/**
	 * @function can-dom-events.removeEventListener removeEventListener
	 * @signature `domEvents.removeEventListener( target, eventType, ...eventArgs )
	 * @param {Window | Document | HTMLElement} target The object to which to add the listener.
	 * @param {String} eventType The event type with which to unregister.
	 * @param {*} eventArgs The arguments which configure the associated event's behavior.
	 *
	 * Remove an event listener for eventType to the target.
	 */
	removeEventListener: function(target, eventType) {
		var hasCustomEvent = domEvents._eventRegistry.has(eventType);
		if (hasCustomEvent) {
			var event = domEvents._eventRegistry.get(eventType);
			return event.removeEventListener.apply(domEvents, arguments);
		}

		var eventArgs = Array.prototype.slice.call(arguments, 1);
		return target.removeEventListener.apply(target, eventArgs);
	},

	/**
	 * @function can-dom-events.dispatch dispatch
	 * @signature `domEvents.dispatch( target, eventData, eventArgs [, bubbles ][, cancelable ] )`
	 * @param {Window | Document | HTMLElement} target The object to which to add the listener.
	 * @param {Object | String} eventData The data to be assigned to the event. If it is a string, that will be the event type.
	 * @param {Boolean} bubbles Whether the event should bubble; defaults to true.
	 * @param {Boolean} cancelable Whether the event can be cancelled; defaults to false.
	 * @returns {Boolean} notCancelled Whether the event dispatched without being cancelled.
	 *
	 * Create and dispatch a configured event on the target.
	 */
	dispatch: function(target, eventData, bubbles, cancelable) {
		var event = util.createEvent(target, eventData, bubbles, cancelable);
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
