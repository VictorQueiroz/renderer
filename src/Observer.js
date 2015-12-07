extend(Observer, {
	UPDATE: 'update',
	DELETE: 'delete',
	ADD: 'add',

	DELIVERING: 1,
	IDLE: 2
});

function Observer(object) {
	EventEmitter.call(this);

	if(!isObject(object)) {
		this.throwError('The first parameter must be an object');
	}

	this.state = Observer.IDLE;
	this.object = object;
	this.listeners = {};

	var self = this,
			listeners = this.listeners;

	this.onChangeListener_ = function(changes) {
		var i,
				j,
				prop,
				change,
				listener,
				newValue,
				oldValue;

		for(i = 0; i < changes.length; i++) {
			change = changes[i];
			prop = change.name;
			newValue = change.object[prop];

			if(change.type == Observer.UPDATE && change.hasOwnProperty('oldValue')) {
				oldValue = change.oldValue;
			} else if(oldValue) {
				oldValue = undefined;
			}

			if(listeners.hasOwnProperty(prop) && listeners[prop].length) {
				for(j = 0; j < listeners[prop].length; j++) {
					listener = listeners[prop][j];

					listener(newValue, oldValue);
				}
			}
		}

		self.emit('update', changes);
	};

	this.observerListener_ = observe(object, this.onChangeListener_);
}

inherits(Observer, EventEmitter, {
	throwError: function(msg) {
		throw new Error(msg);
	},

	watch: function(property, listener) {
		if(!this.listeners.hasOwnProperty(property)) {
			this.listeners[property] = [];
		}

		this.listeners[property].push(listener);
		this.deliverChangeRecords();
	},

	deliverChangeRecords: function() {
		Object.deliverChangeRecords(this.observerListener_);
	}
});

function observe(object, listener) {
	Object.observe(object, listener);

	return listener;
}

function unobserve(object, listener) {
	Object.unobserve(object, listener);
}

function DeepObserver(object, parentObserver, parentProperty) {
	Observer.call(this, object);

	this.childObservers = {};

	if(parentObserver instanceof DeepObserver === true) {
		this.parentObserver = parentObserver;
	}

	if(isString(parentProperty)) {
		this.parentProperty = parentProperty;
	}

	if(this.parentObserver && !this.parentProperty) {
		this.throwError('A child observer must have a parent property');
	}

	this.on('update', function(changes) {
		var i = 0,
				ii = changes.length,
				prop,
				value,
				change;

		for(; i < ii; i++) {
			change = changes[i];
			prop = change.name;
			value = change.object[prop];

			if(change.type == Observer.DELETE || change.type == Observer.UPDATE) {
				if(isObject(change.oldValue) || isArray(value)) {
					if(this.childObservers.hasOwnProperty(prop)) {
						this.childObservers[prop].destroy();
					}
				}
			}

			if(change.type == Observer.UPDATE || change.type == Observer.ADD) {
				if(isObject(value) || isArray(value)) {
					this.createChildObserver(prop, value);
				}
			}
		}
	})
	.on('pathChanged', function(path, value, oldValue) {
		if(this.parentObserver) {
			path = path.split('.');
			path.unshift(this.parentProperty);

			this.parentObserver.emit('pathChanged', path.join('.'), value, oldValue);
		}
	});
}

inherits(DeepObserver, Observer, {
	createChildObserver: function (property, object) {
		if(this.childObservers.hasOwnProperty(property)) {
			this.childObservers[property].destroy();
		}

		var parentObserver = this;
		var childObserver = new DeepObserver(object, parentObserver, property);

		childObserver.on('update', function(changes) {
			var i = 0,
					ii = changes.length,
					path,
					value,
					change;

			for(; i < ii; i++) {
				path = [];
				change = changes[i];

				path.push(property, change.name);
				value = change.object[change.name];

				parentObserver.emit('pathChanged', path.join('.'), value, change.oldValue);
			}
		})
		.on('destroy', function() {
			delete parentObserver.childObservers[property];
		});

		this.childObservers[property] = childObserver;
	},

	watch: function (path, listener) {
		//
	},

	destroy: function() {
		unobserve(this.object, this.onChangeListener_);
		this.emit('destroy');
		this.removeAllListeners();
	},

	deliverChangeRecords: function(ignoreChilds) {
		var i = 0,
				observers = Object.keys(this.childObservers);

		for(; i < observers.length; i++) {
			this.childObservers[observers[i]].deliverChangeRecords();
		}

		Observer.prototype.deliverChangeRecords.call(this, arguments);
	}
});
