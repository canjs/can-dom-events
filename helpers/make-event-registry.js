'use strict';

/*
	Event registries can be used in a variety
	of contexts. This is a generic event registry.
*/

function EventRegistry () {
	this._registry = {};
}

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
	return function remove () {
		self._registry[eventType] = undefined;
	};
};

module.exports = function makeEventRegistry () {
	return new EventRegistry();
};
