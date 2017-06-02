var unit = require('steal-qunit');
var domEvents = require('./can-dom-events');

unit.module('can-dom-events');

unit.test('domEvents.addEventListener works', function (assert) {
	// We check that our handler gets called if we add it through domEvents.
	// NOTE: the event is not triggered via domEvents.dispatch to isolate this test.
	assert.expect(1);

	var input = document.createElement('input');
	var eventType = 'click';
	var handler = function () {
		assert.ok(true, 'event handler should be called');
	};

	domEvents.addEventListener(input, eventType, handler);

	var event = new Event(eventType);
	input.dispatchEvent(event);

	domEvents.removeEventListener(input, eventType, handler);
});

unit.test('domEvents.removeEventListener works', function (assert) {
	// We check that our handler gets called if we add/remove it through domEvents.
	// NOTE: the event is not triggered via domEvents.dispatch to isolate this test.
	assert.expect(1);

	var input = document.createElement('input');
	var eventType = 'click';
	var handler = function () {
		assert.ok(true, 'event handler should be called');
	};

	domEvents.addEventListener(input, eventType, handler);

	var event = new Event(eventType);
	input.dispatchEvent(event);

	domEvents.removeEventListener(input, eventType, handler);

	var event2 = new Event(eventType);
	input.dispatchEvent(event2);
});

unit.test('domEvents.dispatch works', function (assert) {
	// NOTE: dispatching should work no matter how a listener was add.
	// So we use the native addEventListener to isolate the dispatch.
	assert.expect(1);

	var input = document.createElement('input');
	var eventType = 'click';
	var handler = function () {
		assert.ok(true, 'event handler should be called');
	};

	input.addEventListener(eventType, handler);

	domEvents.dispatch(input, eventType);

	input.removeEventListener(eventType, handler);
});

require('./helpers/make-event-registry-test');
require('./helpers/add-event-compat-test');
require('./helpers/add-event-jquery-test');
require('./helpers/util-test');
