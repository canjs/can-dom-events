/*
	This module conforms to the can-util 3.x custom event
	overriding behavior. This module is a compatibility
    layer for using new custom events.
*/

var util = require('./util');
var addDomContext = util.addDomContext;
var removeDomContext = util.removeDomContext;

function isDomEvents (obj) {
	return !!(obj && obj.addEventListener && obj.removeEventListener);
}

function isNewEvents (obj) {
    return typeof obj.addEvent === 'function';
}

module.exports = function addEvent (domEvents, customEvent, customEventType) {
	if (!isDomEvents(domEvents)) {
		throw new Error ('addEvent() must be passed domEvents');
	}

    if (isNewEvents(domEvents)) {
        return domEvents.addEvent(customEvent, customEventType);
    }

    customEventType = customEventType || customEvent.defaultEventType;

    var newEvents = {
        addEventListener () {
            var data = removeDomContext(this, arguments);
            return domEvents.addEventListener.apply(data.context, data.args);
        },
        removeEventListener () {
            var data = removeDomContext(this, arguments);
            return domEvents.removeEventListener.apply(data.context, data.args);
        },
        canAddEventListener () {
            var data = removeDomContext(this, arguments);
            return domEvents.canAddEventListener.apply(data.context, data.args);
        },
        dispatch () {
            var data = removeDomContext(this, arguments);
            return domEvents.dispatch.apply(data.context, data.args);
        }
    };

	var isOverriding = true;
	var oldAddEventListener = domEvents.addEventListener;
	var addEventListener = domEvents.addEventListener = function (eventName) {
		if (isOverriding && eventName === customEventType) {
            var args = addDomContext(this, arguments);
			customEvent.addEventListener.apply(newEvents, args);
		}
		return oldAddEventListener.apply(this, arguments);
	};

	var oldRemoveEventListener = domEvents.removeEventListener;
	var removeEventListener = domEvents.removeEventListener = function (eventName) {
		if (isOverriding && eventName === customEventType) {
            var args = addDomContext(this, arguments);
			customEvent.removeEventListener.apply(newEvents, args);
		}
		return oldRemoveEventListener.apply(this, arguments);
	};

	return function removeOverride () {
		isOverriding = false;
		if (domEvents.addEventListener === addEventListener) {
			domEvents.addEventListener = oldAddEventListener;
		}
		if (domEvents.removeEventListener === removeEventListener) {
			domEvents.removeEventListener = oldRemoveEventListener;
		}
	};
};