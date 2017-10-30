'use strict';

var namespace = require('can-namespace');
var util = require('./helpers/util');
var makeEventRegistry = require('./helpers/make-event-registry');

/**
 * @module {{}} can-dom-events
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 * @description Dispatch and listen to DOM Events.
 * @group can-dom-events.static 0 static
 * @group can-dom-events.helpers 1 helpers
 * @group can-dom-events.types 2 types
 * @signature `domEvents`
 *
 * @body
 *
 * ```js
 * var domEvents = require("can-dom-events");
 * var input = document.createElement('input');
 *
 * function onChange(event) {
 * 	console.log('Input value changed to:', event.target.value);
 * }
 *
 * domEvents.addEventListener(input, 'change', onChange);
 *
 * domEvents.dispatch(input, 'change'); // calls onChange
 *
 * domEvents.removeEventListener(input, 'change', onChange);
 * ```
 */
var domEvents = {
	_eventRegistry: makeEventRegistry(),

	/**
	* @function can-dom-events.addEvent addEvent
	*
	* Add a custom event to the global event registry.
	*
	* @signature `addEvent( event [, eventType ] )`
	* @parent can-dom-events.static
	* @param {EventDefinition} event The custom event definition.
	* @param {String} eventType The event type to associated with the custom event.
	* @return {function} The callback to remove the custom event from the registry.
	*/
	addEvent: function(event, eventType) {
		return this._eventRegistry.add(event, eventType);
	},

	/**
	* @function can-dom-events.addEventListener addEventListener
	*
	* Add an event listener for eventType to the target.
	*
	* @signature `addEventListener( target, eventType, ...eventArgs )`
	* @parent can-dom-events.static
	* @param {DomEventTarget} target The object to which to add the listener.
	* @param {String} eventType The event type with which to register.
	* @param {*} eventArgs The arguments which configure the associated event's behavior.
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
	*
	* Remove an event listener for eventType to the target.
	*
	* @signature `removeEventListener( target, eventType, ...eventArgs )`
	* @parent can-dom-events.static
	* @param {DomEventTarget} target The object to which to add the listener.
	* @param {String} eventType The event type with which to unregister.
	* @param {*} eventArgs The arguments which configure the associated event's behavior.
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
	*
	* Create and dispatch a configured event on the target.
	*
	* @signature `dispatch( target, eventData [, bubbles ][, cancelable ] )`
	* @parent can-dom-events.static
	* @param {DomEventTarget} target The object to which to add the listener.
	* @param {Object | String} eventData The data to be assigned to the event. If it is a string, that will be the event type.
	* @param {Boolean} bubbles Whether the event should bubble; defaults to true.
	* @param {Boolean} cancelable Whether the event can be cancelled; defaults to false.
	* @return {Boolean} notCancelled Whether the event dispatched without being cancelled.
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

/**
 * @typedef {Object} can-dom-events.EventDefinition EventDefinition
 * @description Definition of a custom event that may be added to an event registry.
 * @parent can-dom-events.types
 * @type {Object}
 *     @option {String} [defaultEventType]
 *     The default event type of the event.
 *
 *     @option {function} [addEventListener]
 *     The function to add the listener to the target.
 *         @param {DomEventTarget} target The target to which to add the listener.
 *         @param {String} eventType The event type which should be used to register the listener.
 *         @param {*} eventArgs The arguments should to configure the listener behavior.
 *
 *     @option {function} [removeEventListener]
 *     The function to remove the listener from the target.
 *         @param {DomEventTarget} target The target to which to add the listener.
 *         @param {String} eventType The event type which should be used to register the listener.
 *         @param {*} eventArgs The arguments should to configure the listener behavior.
 */

 /**
 * @typedef {Object} can-dom-events.DomEventTarget DomEventTarget
 * @description
 * An object which can have DOM Events registered on it.
 * This is a Window, Document, or HTMLElement.
 * @parent can-dom-events.types
 * @signature `Window|Document|HTMLElement`
 * @type {Window}
 * @type {Document}
 * @type {HTMLElement}
 */

module.exports = namespace.domEvents = domEvents;
