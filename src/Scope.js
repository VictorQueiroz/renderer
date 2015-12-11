function Scope(parent) {
	Watcher.call(this);

	if(parent) {
		this.parentScope = parent;
	}

	this.childScopes = [];
}

inherits(Scope, Watcher, {
	clone: function(isolate, parent) {
		var child;

		parent = parent || this;

		if(isolate) {
			child = new Scope(parent);
		} else {
			// Only create a child scope class if somebody asks for one,
			// but cache it to allow the VM to optimize lookups.
			if (!this.ChildScopeClass) {
				this.ChildScopeClass = Scope.createChildScopeClass(this);
			}

			child = new this.ChildScopeClass();
		}

    var childScopes = this.childScopes,
        lastChildScopeIndex = childScopes.length - 1,
        nextChildScopeIndex = childScopes.length + 1;

    if(childScopes.length) {
      childScopes[lastChildScopeIndex].nextSibling = child;
    }

		childScopes[nextChildScopeIndex] = child;

    child.on('destroy', function() {
      var index = childScopes.length;

      while(index--) {
        if(childScopes[index] == child) {
          childScopes.splice(index, 1);

          break;
        }
      }
    });

		return child;
	},

  broadcast: function(name, fn) {
    if(this.parentScope) {
      this.parentScope.broadcast(name, fn);
    }

    this.emit(name, fn);
  },

	deliverChangeRecords: function() {
    if(this.parentScope) {
      this.parentScope.deliverChangeRecords();
    }

    Watcher.prototype.deliverChangeRecords.call(this);

		return this;
	},

  destroy: function() {
    this.emit('destroy');
  }
}, {
  createChildScopeClass: function(parent) {
    function ChildScope() {
      Scope.call(this, parent);
    }

    ChildScope.prototype = parent;

    return ChildScope;
  }
});
