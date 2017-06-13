/*can-dom-events@0.0.1#dist/cjs/can-dom-events*/
'use strict';
var namespace = require('can-namespace');
var util = require('./helpers/util.js');
var makeEventRegistry = require('./helpers/make-event-registry.js');
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