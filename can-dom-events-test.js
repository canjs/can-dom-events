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

unit.test('domEvents.canAddEventListener works', function (assert) {
    // Our definition of what can be addEventListener-ed to
    // is more strict than EventTarget. 
    // It must be a DOM Node, Document, or window.
    var element = document.createElement('div');
    assert.equal(domEvents.canAddEventListener(element), true, 'Elements work');

    assert.equal(domEvents.canAddEventListener(document), true, 'Documents work');

    assert.equal(domEvents.canAddEventListener(window), true, 'Window works');

    assert.equal(domEvents.canAddEventListener(8), false, 'Numbers should not work');
    assert.equal(domEvents.canAddEventListener("foo"), false, 'Strings should not work');
    assert.equal(domEvents.canAddEventListener({a: 1}), false, 'Plain objects should not work');

    var textNode = document.createTextNode('boi');
    assert.equal(domEvents.canAddEventListener(textNode), false, 'Text nodes should not work');
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