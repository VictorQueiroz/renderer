function Attributes(node) {
	this.$$node = node;
	this.$$observers = {};
}

Attributes.prototype = {
	$set: function(name, value) {
		this[name] = value;

		var attrName = this.$$normalize(name);

		if(this.$$node instanceof Node === true) {
			this.$$node.setAttribute(attrName, value);
		}

		this.$$fire(name);
	},

	$$fire: function(name) {
		if(this.$$observers.hasOwnProperty(name)) {
			var i = 0,
					ii = this.$$observers[name].length;
			if(ii > 0) {
				for(; i < ii; i++) {
					this.$$observers[name][i](this[name]);
				}
				this.$$observers[name].$$called++;
			}
		}
	},

	$$normalize: function(str) {
		return kebabCase(str);
	},

	$observe: function(name, listener) {
		var attrs = this;

		if(!this.$$observers.hasOwnProperty(name)) {
			this.$$observers[name] = [];
			this.$$observers[name].$$called = 0;
		}

		this.$$observers[name].push(listener);

		setTimeout(function() {
			if(attrs.$$observers[name].$$called < 1 &&
				 attrs.hasOwnProperty(name) &&
				 !isUndefined(attrs[name])) {
				attrs.$$fire(name);
			}
		});

		return function() {
			return attrs.$$removeObserver(name, listener);
		};
	},

	$$removeObserver: function(name, listener) {
		if(this.$$observers.hasOwnProperty(name)) {
			var i = 0,
					ii = this.$$observers[name].length;

			for(; i < ii; i++) {
				if(this.$$observers[name][i] == listener) {
					this.$$observers[name].splice(i, 1);
				}
			}

			return true;
		}

		return false;
	}
};
