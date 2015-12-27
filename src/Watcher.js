function Watcher () {
	EventEmitter.call(this);

	this.observer = new Observer(this);
}

inherits(Watcher, EventEmitter, {
	deliverChangeRecords: function() {
		this.observer.deliverChangeRecords();
	},

	watch: function(exp, listener) {
		var firstListener = false;

		if(!this.observer.watchers.hasOwnProperty(exp)) {
			firstListener = true;
		}

		this.observer.watch(exp, bind(listener, this));

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
