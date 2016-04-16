require('can-util/dom/events/inserted/');
var domEvents = require('can-util/dom/events/');
var getMutationObserver = require('can-util/dom/mutationObserver/');
var domMutate = require("can-util/dom/mutate/");

QUnit = require('steal-qunit');

QUnit.module("can-util/dom/events/inserted");

var MutationObserver = getMutationObserver();
if(MutationObserver) {
	asyncTest("basic insertion with mutation observer", function () {
		var div = document.createElement("div");

		domEvents.addEventListener.call(div,"inserted", function(){
			ok(true, "called back");
			start();
		});

		document.getElementById("qunit-fixture").appendChild(div);
	});
}

asyncTest("basic insertion without mutation observer", function(){
	getMutationObserver(null);

	var div = document.createElement("div");

	domEvents.addEventListener.call(div,"inserted", function(){
		ok(true, "called back");
		getMutationObserver(MutationObserver);
		start();
	});

	domMutate.appendChild.call(document.getElementById("qunit-fixture"), div);
});
