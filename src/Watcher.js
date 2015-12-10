function Watcher () {
	EventEmitter.call(this);

	this.observer = new Observer(this);
}

inherits(Watcher, EventEmitter, {
	deliverChangeRecords: function() {
		this.observer.deliverChangeRecords();
	},

	watch: function(exp, listener) {
		var objectPath = exp.split('.');

		objectPath = objectPath.slice(0, -1);

		if(objectPath.length && (objectPath = objectPath.join('.'))) {
			if(!has(this, objectPath)) {
				set(this, objectPath, {});
			}
		}

		var firstListener = false;

		if(!this.observer.watchers.hasOwnProperty(exp)) {
			firstListener = true;
		}

		this.observer.watch(exp, listener);

		if(firstListener) {
			this.observer.fire(exp);
		}
	},

	watchGroup: function(exps, listener) {
		var watcher = this;

		forEach(exps, function(exp) {
			watcher.watch(exp, listener);
		});
	}
});
