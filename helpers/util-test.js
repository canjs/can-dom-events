var unit = require('steal-qunit');
var util = require('./util');

unit.module('util');

unit.test('util.isDomEventTarget works', function (assert) {
    // Our definition of what can be addEventListener-ed to
    // is more strict than EventTarget. 
    // It must be a DOM Node, Document, or window.
    var element = document.createElement('div');
    assert.equal(util.isDomEventTarget(element), true, 'Elements work');

    assert.equal(util.isDomEventTarget(document), true, 'Documents work');

    assert.equal(util.isDomEventTarget(window), true, 'Window works');

    assert.equal(util.isDomEventTarget(8), false, 'Numbers should not work');
    assert.equal(util.isDomEventTarget("foo"), false, 'Strings should not work');
    assert.equal(util.isDomEventTarget({a: 1}), false, 'Plain objects should not work');

    var textNode = document.createTextNode('boi');
    assert.equal(util.isDomEventTarget(textNode), false, 'Text nodes should not work');
});