function EventEmitter() {
	this._events = {};
}

EventEmitter.prototype = {
	on: function(name, listener) {
		if(!this._events.hasOwnProperty(name)) {
			this._events[name] = [];
		}

		this._events[name].push(listener);

		return this;
	},

	off: function(name, listener) {
		var listeners = this._events[name];
		var i;

		for(i = 0; i < listeners.length; i++) {
			if(listeners[i] == listener) {
				listeners.splice(i, 1);
			}
		}

		return this;
	},

	emit: function(name) {
		var args = toArray(arguments).slice(1);
		var i,
				listeners;

		if(this._events.hasOwnProperty(name)) {
			listeners = this._events[name];

			for(i = 0; i < listeners.length; i++) {
				listeners[i].apply(this, args);
			}
		}

		if(listeners && listeners.length > 0) {
			return true;
		}

		return false;
	}
};