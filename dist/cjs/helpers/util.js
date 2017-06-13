/*can-dom-events@0.0.2#helpers/util*/
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