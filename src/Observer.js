function Observer(object, parentObserver, property) {
	EventEmitter.call(this);

	var observer = this;

	this.object = object;

	if(isArray(parentObserver) && (parentObserver instanceof Observer === false)) {
		this.ignoredKeys = parentObserver;
		parentObserver = null;
	} else {
		this.ignoredKeys = [];
	}

	if(parentObserver) {
		this.parentObserver = parentObserver;
	}
	if(property) {
		this.property = property;
	}

	this.cachedPath 					= this.getPath();
	this.childObservers 			= {};

	this
	.on('updated', function() {
		this.deliverChangeRecords();
	})
	.on('changed', function(changes) {
		var i = 0,
				change,
				changedValue,
				childObserver,
				changedProperty;

		for(; i < changes.length; i++) {
			change 						= changes[i];
			changedProperty 	= change.name;
			changedValue 			= change.object[changedProperty];

			switch(change.type) {
				case 'add':
					if(isObject(changedValue)) {
						this.createChildObserver(changedProperty, changedValue);
					}
					break;
				case 'update':
				case 'delete':
					if(isObject(change.oldValue) && (childObserver = this.getChildObserver(change.name))) {
						childObserver.destroy();
					}
					if(isObject(changedValue)) {
						this.createChildObserver(changedProperty, changedValue);
					}
					break;
			}

			if(change.hasOwnProperty('name')) {
				this.deliverChangedProperty(change);
			}
		}

		this.emit('updated');
	})
	.on('childChanged', function(property, c) {
		this.emit('updated');
	});

	this.listener = function(changes) {
		observer.emit('changed', changes);
	};

	Object.observe(this.object, this.listener);

	this.walkInto(this.object);
}

inherits(Observer, EventEmitter, {
	getPath: function() {
		var path = [];
		var parentObserver = this.parentObserver;

		while(parentObserver) {
			if(parentObserver.hasOwnProperty('property')) {
				path.push(parentObserver.property);
			}

			parentObserver = parentObserver.hasOwnProperty('parentObserver') ? parentObserver.parentObserver : null;
		}

		if(this.property) {
			path.unshift(this.property);
		}

		return path.join('.');
	},

	deliverChangedProperty: function(change) {
		var property = change.name;
		var path = this.cachedPath.split('.').filter(function(key) {
			return key.match(/\S/);
		});

		path.unshift(property);
		path.reverse();

		path = path.join('.');

		this.emit('changedProperty', path, change.object[change.name]);
	},

	deliverChangeRecords: function(property) {
		var childObserver, i, childObserverProperty, keys = Object.keys(this.childObservers);

		for(i = 0; i < keys.length; i++) {
			childObserverProperty = keys[i];

			// prevent from removed observers
			if(this.childObservers.hasOwnProperty(childObserverProperty)) {
				childObserver = this.childObservers[childObserverProperty];
				childObserver.deliverChangeRecords();
			}
		}

		Object.deliverChangeRecords(this.listener);

		return this;
	},

	getChildObserver: function(property) {
		return this.childObservers[property];
	},

	createChildObserver: function(property, value) {
		var parentObserver = this;

		if(this.childObservers.hasOwnProperty(property)) {
			this.childObservers[property].destroy();
		}

		var childObserver = new Observer(value, this, property);
		Object.deliverChangeRecords(this.listener);

		this.childObservers[property] = childObserver;

		childObserver
		.on('updated', function(changes) {
			parentObserver.emit('childChanged', property, changes);
		})
		.on('changedProperty', function(changedPath, data) {
			parentObserver.emit('changedProperty', changedPath, data);
		});

		return this;
	},

	destroy: function () {
		var observer = this;

		Object.unobserve(this.object, this.listener);

		forEach(this.childObservers, function(value, key) {
			observer.childObservers[key].destroy();
		});

		if(this.property) {
			delete this.parentObserver.childObservers[this.property];
		}

		this.removeAllListeners();

		return this;
	},

	objectCache: [],

	walkInto: function(object) {
		var i = 0,
				key,
				value,
				observer = this,
				objectKeys = Object.keys(object);

		objectKeys = objectKeys.filter(function(key) {
			return observer.ignoredKeys.indexOf(key) === -1;
		});

		for(; i < objectKeys.length; i++) {
			key = objectKeys[i];
			value = object[key];

			if(this.objectCache.indexOf(value) > -1) {
				continue;
			}

			this.objectCache.push(value);

			if(isObject(value) && !isFunction(value)) {
				observer.createChildObserver(key, value);
			}
		}

		return this;
	}
});
