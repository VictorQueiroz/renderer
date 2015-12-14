var EMPTY = '';

function Scope(parent) {
	Watcher.call(this);

	if(parent) {
		this.parentScope = parent;
	}

  this.childScopes = [];
  this.topLevelScope = Scope.getTopLevelScope(this);
}

inherits(Scope, Watcher, {
  watch: function(exp, listener) {
    if(Scope.isComplexExpression(exp)) {
      var finder = Scope.extractExpressions(exp),
      identifiers = finder.identifiers,
      exps = finder.allExps.map(function(exp) {
        return exp.join('.');
      });

      var oldValue;

      return this.watchGroup(exps.concat(identifiers), function() {
        var value = this.eval(exp);

        listener.call(this, value, oldValue);

        oldValue = clone(value);
      });
    } else {
      return Watcher.prototype.watch.call(this, exp, listener);
    }
  },

  eval: function(exp) {
    return isFunction(exp) ? exp(this) : renderer.parse(exp)(this);
  },

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

    var childScopeIndex = this.childScopes.length;

		this.childScopes[childScopeIndex] = child;

    child.on('destroy', function() {
      this.parentScope.childScopes.splice(childScopeIndex, 1);
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

  apply: function(fn) {
    var topLevelScope = this.topLevelScope;

    try {
      Scope.beginPhase(topLevelScope, 'apply');

      try {
        return this.eval(fn);
      } finally {
        Scope.clearPhase(topLevelScope);
      }
    } catch (e) {
      throw e;
    } finally {
      try {
        this.deliverChangeRecords();
      } catch(e) {
        throw e;
      }
    }

    return this;
  },

  destroy: function() {
    this.emit('destroy');
  }
}, {
  extractExpressions: function(exps) {
    var lexer = new Lexer(),
        astBuilder = new AST(lexer),
        astFinder = new ASTFinder(astBuilder);

    return astFinder.find(exps) && astFinder;
  },

  isComplexExpression: function(exp) {
    var i,
        token,
        tokens = this.complexTokens.split(EMPTY);

    for(i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i];

      if(exp.indexOf(token) > -1) {
        return true;
      }
    }

    return false;
  },

  createChildScopeClass: function(parent) {
    function ChildScope() {
      Scope.call(this, parent);
    }

    ChildScope.prototype = parent;

    return ChildScope;
  },

  beginPhase: function(scope, phase) {
    if(scope.phase) {
      this.throwError('{0} already in progress', scope.phase);
    } else {
      scope.phase = phase;
    }
  },

  clearPhase: function(scope) {
    scope.phase = null;
  },

  getTopLevelScope: function(scope) {
    var topLevelScope = scope;

    while(topLevelScope && topLevelScope.parentScope) {
      topLevelScope = topLevelScope.parentScope;
    }

    return topLevelScope;
  },

  complexTokens: '[]()&!`/*+-='
});
