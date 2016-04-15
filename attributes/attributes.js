var events = require("../events");
var isOfGlobalDocument = require("../../isOfGlobalDocument/");
var domData = require("../../data/");
var getMutationObserver = require("../../mutationObserver/");
var assign = require("../../../js/assign/");
var domDispatch = require("../../dispatch/");

var originalAdd = events.addEventListener,
	originalRemove = events.removeEventListener;

events.addEventListener = function(eventName){
	if(eventName === "attributes") {
		var MutationObserver = getMutationObserver();
		if( isOfGlobalDocument(this) && MutationObserver ) {
			var self = this;
			var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					var copy = assign({}, mutation);
					domDispatch.call(self, copy, [], false);
				});

			});
			observer.observe(this, {
				attributes: true,
				attributeOldValue: true
			});
			domData.set.call(this, "canAttributesObserver", observer);
		} else {
			domData.set.call(this, "canHasAttributesBindings", true);
		}
	}
	return originalAdd.apply(this, arguments);

};

events.removeEventListener = function(eventName){
	if(eventName === "attributes") {
		var MutationObserver = getMutationObserver();

		if(isOfGlobalDocument(this) && MutationObserver) {
			domData.get.call(this, "canAttributesObserver").disconnect();
			domData.clean.call(this, "canAttributesObserver");
		} else {
			domData.clean.call(this, "canHasAttributesBindings");
		}
	}
	return originalRemove.apply(this, arguments);
};
