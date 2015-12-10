function Scope(parent) {
	Watcher.call(this);

	if(parent) {
		this.parentScope = parent;
	}

	this.childScopes = [];
}

inherits(Scope, Watcher, {
	$$createChildScopeClass: function() {
		var parent = this;

		function ChildScope() {
			Scope.call(this, parent);
		}

		ChildScope.prototype = parent;

		return ChildScope;
	},

	$new: function(isolate, parent) {
		var child;

		parent = parent || this;

		if(isolate) {
			child = new Scope(parent);
		} else {
			// Only create a child scope class if somebody asks for one,
			// but cache it to allow the VM to optimize lookups.
			if (!this.$$ChildScope) {
				this.$$ChildScope = this.$$createChildScopeClass();
			}

			child = new this.$$ChildScope();
		}

		return child;
	},

	deliverChangeRecords: function() {
		Watcher.prototype.deliverChangeRecords.call(this);

		if(this.$parent) {
			this.$parent.deliverChangeRecords();
		}

		return this;
	}
});
