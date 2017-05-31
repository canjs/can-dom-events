'use strict';

var namespace = require('can-namespace');
var _document = require("can-util/dom/document/document");
var isBrowserWindow = require("can-util/js/is-browser-window/is-browser-window");
var isPlainObject = require("can-util/js/is-plain-object/is-plain-object");
var fixSyntheticEventsOnDisabled = false;

function isDispatchingOnDisabled(element, ev) {
	var isInsertedOrRemoved = isPlainObject(ev) ? (ev.type === 'inserted' || ev.type === 'removed') : (ev === 'inserted' || ev === 'removed');
	var isDisabled = !!element.disabled;
	return isInsertedOrRemoved && isDisabled;
}
/**
 * @module {{}} can-dom-events
 * @parent can-infrastructure
 * @description Allows you to listen to a domEvent and special domEvents as well as dispatch domEvents.
 *
 * ```js
 * var domEvents = require("can-dom-events");
 * ```
 */
module.exports = namespace.domEvents = {
	addEventListener: function(){
		this.addEventListener.apply(this, arguments);
	},
	removeEventListener: function(){
		this.removeEventListener.apply(this, arguments);
	},
	canAddEventListener: function(){
		return (this.nodeName && (this.nodeType === 1 || this.nodeType === 9)) || this === window;
	},
	dispatch: function(event, args, bubbles){
		var ret;
		var dispatchingOnDisabled = fixSyntheticEventsOnDisabled && isDispatchingOnDisabled(this, event);

		var doc = this.ownerDocument || _document();
		var ev = doc.createEvent('HTMLEvents');
		var isString = typeof event === "string";

		// removed / inserted events should not bubble
		ev.initEvent(isString ? event : event.type, bubbles === undefined ? true : bubbles, false);

		if(!isString) {
			for (var prop in event) {
				if (ev[prop] === undefined) {
					ev[prop] = event[prop];
				}
			}
		}
		ev.args = args;
		if(dispatchingOnDisabled) {
			this.disabled = false;
		}
		ret = this.dispatchEvent(ev);
		if(dispatchingOnDisabled) {
			this.disabled = true;
		}
		return ret;
	}
};

// In FireFox, dispatching a synthetic event on a disabled element throws an error.
// Other browsers, like IE 10 do not dispatch synthetic events on disabled elements at all.
// This determines if we have to work around that when dispatching events.
// https://bugzilla.mozilla.org/show_bug.cgi?id=329509
(function() {
	if(!isBrowserWindow()) {
		return;
	}

	var testEventName = 'fix_synthetic_events_on_disabled_test';
	var input = document.createElement("input");
	input.disabled = true;
	var timer = setTimeout(function() {
		fixSyntheticEventsOnDisabled = true;
	}, 50);
	var onTest = function onTest (){
		clearTimeout(timer);
		module.exports.removeEventListener.call(input, testEventName, onTest);
	};
	module.exports.addEventListener.call(input, testEventName, onTest);
	try {
		module.exports.dispatch.call(input, testEventName, [], false);
	} catch(e) {
		onTest();
		fixSyntheticEventsOnDisabled = true;
	}
})();
