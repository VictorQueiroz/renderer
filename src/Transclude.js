function Transclude(node, options) {
	this.node = node;
	
	if(isObject(options)) {
		extend(this, options);
	}

	this.compileOptions = {};

	if(isNumber(this.terminalPriority)) {
		this.compileOptions.maxPriority = this.terminalPriority;
	}

	var i;

	if(this.type == 'element') {
		var name = this.directive.name;
		var attrs = this.attributes;

		var parent = this.node.parentNode;
		var comment = document.createComment(' ' + name + ': ' + attrs[name] + ' ');

		if(!this.clone) {
			this.clone = this.node.cloneNode(1);
		}

		if(parent) {
			parent.replaceChild(comment, this.node);
		}

		this.comment = comment;
	} else {
		var fragment = document.createDocumentFragment();
		var childNodes = [];

		for(i = 0; i < this.node.childNodes.length; i++) {
			childNodes[i] = this.node.childNodes[i];
		}

		for(i = 0; i < childNodes.length; i++) {
			fragment.appendChild(childNodes[i]);
		}

		this.clone = fragment;
	}

	if(isObject(this.type)) {
		var key,
				keys = Object.keys(this.type),
				slots = {},
				optional,
				slotName,
				slotNames = {},
				filledSlots = {};

		for(i = 0; i < keys.length; i++) {
			key = keys[i];
			slotName = this.type[key];

			optional = (slotName.charAt(0) === '?');
			slotName = optional ? slotName.substring(1) : slotName;

			slotNames[key] = slotName;
			slots[slotName] = document.createDocumentFragment();
			// filledSlots contains `true` for all slots that are either optional or have been
			// filled. This is used to check that we have not missed any required slots
			filledSlots[slotName] = optional;
		}

		// Add the matching elements into their slot
		for(i = 0; i < this.clone.childNodes.length; i++) {
			slotName = slotNames[camelCase(this.clone.childNodes[i].nodeName)];

			if(slotName) {
				filledSlots[slotName] = true;
				slots[slotName].appendChild(this.clone.childNodes[i].cloneNode(1));
			}
		}

		this.slots = slots;
	}
}

Transclude.prototype = {
	getTranscludeCallback: function(defaultScope) {
		var self = this;
		var slots = this.slots;
		var registry = this.registry;
		var compileOptions = this.compileOptions;

		return function(scope, caller, slot) {
			if(isFunction(scope)) {
				caller = scope;
				scope = defaultScope.$new();
			}

			var clone = isString(slot) ? slots[slot] : self.clone;
			var cloned = clone.cloneNode(1);

			var compile = new Compile(cloned, registry, compileOptions);

			caller(cloned);

			compile.execute(scope);
		};
	}
};