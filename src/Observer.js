function Observer(object) {
	this.object = object;
	this.watchers = {};
}

Observer.prototype = {
	deliverChangeRecords: function() {
		var i,
				ii,
				path,
				keys = Object.keys(this.watchers),
				value,
				watcher,
				oldValue;

		for(i = 0, ii = keys.length; i < ii; i++) {
			path = keys[i];
			value = get(this.object, path);
			watcher = this.watchers[path]
			oldValue = watcher.oldValue;

			if(isObject(value) && !isEqual(value, oldValue)) {
				this.fire(path);
			} else if (value !== oldValue) {
				this.fire(path);
			}

			watcher.oldValue = clone(value);
		}
	},

	watch: function(path, listener) {
		var watcher,
				listeners;

		if(!this.watchers.hasOwnProperty(path)) {
			this.watchers[path] = watcher = {
				path: path,
				oldValue: undefined,
				listeners: []
			};
		} else {
			watcher = this.watchers[path];
		}

		listeners = watcher.listeners;
		listeners.push(listener);
	},

	fire: function(path) {
		var i,
				ii,
				watcher = this.watchers[path],
				listeners = watcher.listeners;

		for(i = 0, ii = listeners.length; i < ii; i++) {
			listeners[i](get(this.object, watcher.path), watcher.oldValue);
		}

		return this;
	}
};
