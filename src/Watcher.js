function Watcher () {
	EventEmitter.call(this);

	this.watchers = {};
	this.observers = {};
	this.changingExpressions = [];
}
inherits(Watcher, EventEmitter, {
	eval: function(exp) {
		return get(this, exp);
	},

	watchObject: function (exp, listener) {
		var scope = this;
		var objectPath = exp.split('.')[0];

		if(!this.observers.hasOwnProperty(objectPath)) {
			this.observers[objectPath] = {
				listeners: [],
				observer: null
			};
		}

		var listeners = this.observers[objectPath].listeners;

		listeners.push(listener);

		if(listeners.length === 1 && this.observers.hasOwnProperty(objectPath)) {
			this.createObserver(objectPath);
		}

		return function () {
			scope.removeObserver(objectPath, listener);
		};
	},

	removeObserver: function(objectPath, listener) {
		if(Object.keys(this.observers).length === 0) {
			return this;
		}

		var listeners = this.observers[objectPath].listeners;
		var index = listeners.indexOf(listener);
		listeners.splice(index, 1);

		if(listeners.length === 0) {
			this.observers[objectPath].observer.destroy();
			delete this.observers[objectPath];
		}

		return this;
	},

	createObserver: function(objectPath) {
		var i,
				scope = this,
				observer = new Observer(objectPath.indexOf('.') === -1 ? this[objectPath] : get(this, objectPath));

		observer.on('updated', function() {
			scope.emit('updated');
		});

		var listeners = scope.observers[objectPath].listeners;

		observer
		.on('changedProperty', function(path) {
			for(i = 0; i < listeners.length; i++) {
				listeners[i].call(scope, path);
			}
		});

		this.observers[objectPath].observer = observer;
	},

	deliverChangeRecords: function() {
		forEach(this.observers, function(key) {
			key.observer.deliverChangeRecords();
		});

		if(isFunction(this.simpleObserver)) {
			Object.deliverChangeRecords(this.simpleObserver);
		}
	},

	createSimpleExpression: function(property) {
		var scope = this;

		if(!this.hasOwnProperty('simpleObserver')) {
			var listeners = this.simpleObserverListeners = [], i;

			this.simpleObserver = function (changes) {
				for(i = 0; i < listeners.length; i++) {
					listeners[i].call(scope, changes);
				}

				scope.emit('updated');
			};
			Object.observe(this, this.simpleObserver);
		}

		scope.simpleObserverListeners.push(function(changes) {
			forEach(changes, function(change) {
				if(change.name === property) {
					scope.expressionChanged(property);
				}
			});
		});
	},

	createWatcher: function (exp) {
		var scope = this;
		var pathToObject, watchKey, keysList = exp.split('.');
		var unwatch;

		if(keysList.length > 1) {
			pathToObject = keysList.slice(0, -1).join('.');
			watchKey = last(keysList);

			/**
			 * Set the entire object, but before the last key
			 * if there is nothing there cause we do not know
			 * what the user will put there we just know that
			 * until there, this is an object
			 */
			if(!has(this, pathToObject)) {
				set(this, pathToObject, {});
			}

			unwatch = this.$watchCollection(pathToObject, function(value) {
				this.expressionChanged(exp);
			});
		} else {
			this.createSimpleExpression(exp);
		}

		return unwatch;
	},

	expressionChanged: function(exp) {
		if(this.changingExpressions.indexOf(exp) === -1) {
			this.changingExpressions.push(exp);

			var scope = this;
			var listeners = this.watchers[exp].listeners;
			var i;

			for(i = 0; i < listeners.length; i++) {
				listeners[i].call(this, get(this, exp));
			}

			var observerListeners;

			if(this.observers.hasOwnProperty(exp)) {
				observerListeners = this.observers[exp].listeners;

				forEach(observerListeners, function(listener) {
					listener.call(scope, scope.eval(exp));
				});
			}

			this.changingExpressions.pop();
		}
	},

	complexExpressionSymbols: '[]()&;!==`;'.split(''),

	watchComplexExpression: function (exp, listener) {
		if(!this.watchers.hasOwnProperty(exp)) {
			this.watchers[exp] = { listeners: [] };
		}

		var parsed = $parse(exp, { getWatchableExps: 1 });
		var exps = parsed.watchableExps;
		var obj = parsed.object[0];

		var unwatchCollection, unwatchGroup, scope = this;
		var executing = false;

		function watchListener() {
			if(executing) {
				return;
			}

			executing = true;

			try {
				listener.call(scope, parsed(scope));
			} catch(e) {
				throw e;
			} finally {
				executing = false;
			}
		}

		unwatchGroup = this.watchGroup(exps, watchListener);
		unwatchCollection = this.$watchCollection(obj, watchListener);

		return function() {
			unwatchCollection();
			unwatchGroup();
		};
	},

	isLiteralExpression: function(exp) {
		return exp.indexOf('[') === 0;
	},

	$watchCollection: function(exp, listener) {
		var scope = this,
				unwatchCollection = noop;

		if(this.isLiteralExpression(exp)) {
			return listener.call(this, this.$eval(exp));
		}

		if(!has(this, exp)) {
			set(this, exp, {});
		}

		return this.$watch(exp, function(value) {
			unwatchCollection();

			if(isObject(value)) {
				unwatchCollection = this.watchObject(exp, function() {
					listener.call(scope, scope.eval(exp));
				});
			}

			this.expressionChanged(exp);
		});
	},

	watchGroup: function (groups, listener) {
		var scope = this;
		var unwatch;
		var callbacks = [];
		var expValues = {};

		function createWatcherListener(index) {
			var args;

			return function (value) {
				expValues[index] = value;
				args = values(expValues);

				listener.apply(scope, args);
			};
		}

		var isProperty;
		forEach(groups, function(exp, index) {
			isProperty = true;

			if(isObject(exp)) {
				isProperty = exp.property;
				exp = exp.exp;
			}

			if(!isProperty) {
				unwatch = scope.$watchCollection(exp, createWatcherListener(index));
			} else {
				unwatch = scope.$watch(exp, createWatcherListener(index));
			}

			callbacks.push(unwatch);
		});

		return function() {
			forEach(callbacks, function(destroyWatcher) {
				destroyWatcher();
			});
		};
	},

	complexExpressionsCache: {},

	isComplexExpression: function(exp) {
		if(!exp) return false;

		var symbolsCache = this.complexExpressionsCache;

		if(symbolsCache.hasOwnProperty(exp)) {
			return symbolsCache[exp];
		}

		var isComplex = some(this.complexExpressionSymbols, function(symbol) {
			return exp.indexOf(symbol) > -1;
		});

		symbolsCache[exp] = isComplex;

		return isComplex;
	},

	$watch: function(exp, listener) {
		if(isUndefined(exp)) {
			throw new Error('invalid exp');
		}

		if(this.isComplexExpression(exp)) {
			return this.watchComplexExpression(exp, listener);
		}

		var firstTime;
		if(!this.watchers.hasOwnProperty(exp)) {
			this.watchers[exp] = { listeners: [] };
			this.createWatcher(exp);
			firstTime = true;
		}

		this.watchers[exp].listeners.push(listener);

		if(firstTime) {
			this.expressionChanged(exp);
		}

		return bind(this.removeWatcher, this, exp, listener);
	},

	removeWatcher: function(exp, listener) {
		var listeners = this.watchers[exp].listeners;
		var index = listeners.indexOf(listener);

		listeners.splice(index, 1);
	}
});
