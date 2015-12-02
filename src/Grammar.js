function Grammar(fn) {
	this.state = {};
	this.nextId_ = 0;
	this.current_ = fn || 'fn';

	this.setCurrent(this.current_);
}

Grammar.prototype = {
	nextId: function (skip, init) {
		var id = 'v' + (this.nextId_++);

		if(!skip) {
			this.current().vars.push(id + (init ? ('=' + init) : ''));
		}

		return id;
	},

	assign: function(id, value) {
		if(!id) return;
		this.current().body.push(id, '=', value, ';');
		return id;
	},

	setCurrent: function(name) {
		if(!this.state.hasOwnProperty(name)) {
			this.createSection(name);
		}

		this.current_ = name;
		return this;
	},

	createSection: function(name) {
		this.state[name] = { body: [], vars: [], own: {}, nextId: 0 };

		return this;
	},

	body: function(section) {
		return this.state[section].body.join('');
	},

	current: function() {
		return this.state[this.current_];
	},

	varsPrefix: function(section) {
		return this.state[section].vars.length ? 'var ' + this.state[section].vars.join(',') + ';' : '';
	},

	exec: function (fn) {
		var args = toArray(arguments).slice(1);

		fn.apply(this, args);

		return this;
	},

	nonComputedMember: function(left, right) {
		return left + '.' + right;
	},

	computedMember: function(left, right) {
		return left + '[' + right + ']';
	},

	member: function(left, right, computed) {
		if (computed) return this.computedMember(left, right);
		return this.nonComputedMember(left, right);
	},

	not: function(expression) {
		return '!' + this.block(expression);
	},

	notNull: function(expression) {
		return expression + '!=null';
	},

	ifNot: function (expression, alternate, consequent) {
		return this.if_(this.not(expression), alternate, consequent);
	},

	ifNotNull: function(expression, alternate, consequent) {
		this.if_(this.notNull(expression), alternate, consequent);

		return this;
	},

	ifIsDefined: function(variable, alternate, consequent){
		return this.if_(
			this.join(
				this.notNull(variable),
				'&&'
			),

			alternate,
			consequent
		);
	},

	if_: function(test, alternate, consequent) {
		var body = this.current().body;

		body.push('if(', test, '){');

		this.exec(alternate, test);

		body.push('}');

		if(consequent) {
			body.push('else{');

			this.exec(consequent, test);

			body.push('}');
		}
	},

	return_: function(id) {
		this.current().body.push('return ', id, ';');
	},

	escape: function(string) {
		return escape(string);
	},

	join: function() {
		var args = toArray(arguments);
		var del = args.slice(-1)[0];

		return args.slice(0, args.length - 1).join(del);
	},

	getHasOwnProperty: function(element, property) {
		var key = element + '.' + property;
		var own = this.current().own;

		// we check for `property` at `element` and we store
		// the result variable on the current state
		if(!own.hasOwnProperty(key)) {
			own[key] = this.nextId(false, this.join(
				element,

				this.block(
					this.member(
						element,
						this.execute('hasOwnProperty', '"' + this.escape(property) + '"')
					)
				),

				'&&'
			));
		}

		return own[key];
	},

	block: function (exp, stCh, enCh) {
		stCh = stCh || '(';
		enCh = enCh || ')';

		return stCh + exp + enCh;
	},

	execute: function(name) {
		var args = toArray(arguments).slice(1);

		if(args.length === 1 && isArray(args[0])) {
			args = args[0];
		}

		return name + this.block(args.join(','));
	},

	plus: function(left, right) {
		return this.execute('plus', left, right);
	},

	ifDefined: function(id, defaultValue) {
		return this.execute('ifDefined', id, this.escape(defaultValue));
	},

	ifIsUndefined: function(id) {
		return this.execute('isUndefined', id);
	},

	generateFunction: function(name, params) {
		if(!params) params = '';
		return 'function(' + params + '){' +
			this.varsPrefix(name) +
			this.body(name) +
		'}';
	},

	id: function(id, skip, init) {
		return id || this.nextId(skip, init);
	},

	lazyAssign: function(id, value) {
		var self = this;
		return function() {
			self.assign(id, value);
		};
	},

	push: function() {
		var args = toArray(arguments);
		var body = this.current().body;

		return body.push.apply(body, args);
	},

	getAsString: function(value) {
		return '"' + (value || '') + '"';
	},

	clear: function(name) {
		var grammar = this;

		if(!name) {
			forEach(this.state, function(state, name) {
				grammar.clear(name);
			});
			return this;
		}

		if(this.state.hasOwnProperty(name)) {
			delete this.state[name];
		}

		this.setCurrent(name);
	}
};
