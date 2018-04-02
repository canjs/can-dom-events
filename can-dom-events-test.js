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

unit.test('domEvents.addDelegateListener works', function (assert) {
	var done = assert.async();
	var grandparent = document.createElement('div');
	var parent = document.createElement('div');
	var child = document.createElement('input');

	grandparent.appendChild(parent);
	parent.appendChild(child);

	domEvents.addDelegateListener(grandparent, 'click', 'input', function handler (event) {
		domEvents.removeDelegateListener(grandparent, 'click', 'input', handler);

		assert.equal(event.type, 'click', 'should be click event');
		assert.equal(event.target, child, 'should have input as the event.target');

		done();
	});

	domEvents.dispatch(child, 'click');
});

unit.test('domEvents.removeDelegateListener works', function (assert) {
	assert.expect(2);
	var grandparent = document.createElement('div');
	var parent = document.createElement('div');
	var child = document.createElement('input');

	grandparent.appendChild(parent);
	parent.appendChild(child);

	var handler = function handler (event) {
		assert.equal(event.type, 'click', 'should be click event');
		assert.equal(event.target, child, 'should have input as the event.target');
	};

	domEvents.addDelegateListener(grandparent, 'click', 'input', handler);

	domEvents.dispatch(child, 'click');

	domEvents.removeDelegateListener(grandparent, 'click', 'input', handler);

	domEvents.dispatch(child, 'click');
});

unit.test("can call removeDelegateListener without having previously called addDelegateListener", function (assert) {
	var ul = document.createElement("ul");
	domEvents.removeDelegateListener(ul, "click", "li", function(){});
	assert.ok(true, "Calling removeDelegateListener does not throw");
});

unit.test("delegate events: focus should work using capture phase", function (assert) {
	var done = assert.async();
	var parent = document.createElement('div');
	var child = document.createElement('input');

	parent.appendChild(child);
	document.getElementById('qunit-fixture').appendChild(parent);

	domEvents.addDelegateListener(parent, "focus", "input", function handler (event) {
		domEvents.removeDelegateListener.call(parent, "focus", "input", handler);

		assert.equal(event.type, 'focus', 'should be focus event');
		assert.equal(event.target, child, 'should have input as event target');
		done();
	});

	domEvents.dispatch(child, "focus", false);
});

unit.test("delegate events: blur should work using capture phase", function (assert) {
	var done = assert.async();
	var parent = document.createElement('div');
	var child = document.createElement('input');

	parent.appendChild(child);
	document.getElementById('qunit-fixture').appendChild(parent);

	domEvents.addDelegateListener(parent, "blur", "input", function handler (event) {
		domEvents.removeDelegateListener.call(parent, "blur", "input", handler);

		assert.equal(event.type, 'blur', 'should be blur event');
		assert.equal(event.target, child, 'should have input as event target');
		done();
	});

	domEvents.dispatch(child, "blur", false);
});

unit.test('domEvents.addDelegateListener handles document correctly', function (assert) {
	var html = document.querySelector('html');
	var handler = function handler() {};

	domEvents.addDelegateListener(html, 'click', 'input', handler);
	domEvents.dispatch(html, 'click');
	domEvents.removeDelegateListener(html, 'click', 'input', handler);
	assert.ok(true, 'works');
});

require('./helpers/make-event-registry-test');
require('./helpers/add-event-compat-test');
require('./helpers/add-event-jquery-test');
require('./helpers/add-jquery-events-test');
require('./helpers/util-test');
