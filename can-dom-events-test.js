// There were no tests for domEvents directly
var unit = require('steal-qunit');
var domEvents = require('./can-dom-events');

unit.module('can-dom-events');

unit.test('can-dom-events should exist', function (assert) {
    assert.ok(domEvents);
});