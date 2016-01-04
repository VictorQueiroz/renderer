function Watcher () {
	EventEmitter.call(this);

	this.observer = new Observer(this);
}

inherits(Watcher, EventEmitter, {
	deliverChangeRecords: function() {
		this.observer.deliverChangeRecords();
	},

	watch: function(path, listener) {
		this.observer.watch(path, listener);
	},

	watchGroup: function(exps, listener) {
		var watcher = this;

		forEach(exps, function(exp) {
			watcher.watch(exp, listener);
		});
	}
});
