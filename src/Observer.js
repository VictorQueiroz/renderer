function Observer(object) {
	this.object = object;
	this.watchers = [];
}

Observer.prototype = {
	deliverChangeRecords: function() {
    var last,
        value,
        object = this.object,
        length,
        watcher,
        watchers = this.watchers;

    length = watchers.length;

		while(length--) {
      watcher = watchers[length];

      if((value = watcher.get(object)) !== (last = watcher.last) && !isEqual(value, last)) {
        watcher.last = clone(value);
        watcher.fn(value, last);
      }
    }
	},

	watch: function(path, listener) {
		var object = this.object,
        watcher = {
          last: undefined,
          path: path,
          get: function(object) {
            return get(object, path);
          },
          fn: listener
        };

    var value = watcher.get();
    watcher.fn(value, clone(watcher.last));
    watcher.last = clone(value);

    this.watchers.unshift(watcher);
	}
};
