function isAssignable(ast) {
	return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
}

function ifDefined(v, d) {
	return typeof v !== 'undefined' ? v : d;
}

function ASTCompiler(astBuilder) {
	this.grammar = new Grammar('fn');
	this.astBuilder = astBuilder;
}

ASTCompiler.prototype = {
	assignableAST: function (ast) {
		if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
			return {type: AST.AssignmentExpression, left: ast.body[0].expression, right: {type: AST.NGValueParameter}, operator: '='};
		}
	},

	compile: function (expression, expensiveChecks) {
		var ast = this.astBuilder.ast(expression);
		var extra = '';
		var assignable;

		if((assignable = this.assignableAST(ast))) {
			this.grammar.setCurrent('assign');

			var result = this.nextId();
			this.recurse(assignable, result, undefined, undefined, true);
			this.grammar.return_(result);

			extra += 'fn.assign=' + this.generateFunction('assign', 's,v,l') + ';';
		}

		this.grammar.setCurrent('fn');
		this.recurse(ast);

		var fnString = 'var fn = ' + this.generateFunction('fn', 's,l') + ';' +
		extra +
		'return fn;';

    /* jshint -W054 */
		var fn = (new Function(
			'plus',
			'isUndefined',
			'ifDefined',
			fnString
		))(
			this.sum,
			isUndefined,
			ifDefined
		);
    /* jshint +W054 */

		this.clear();

		return fn;
	},

	sum: function(a, b) {
		var args = toArray(arguments);

		return sum.call(this, args);
	},

	clear: function(name) {
		this.grammar.clear(name);
	},

	/**
	 *
	 */
	lazyRecurse: function() {
		var self = this;
		var args = arguments;

		return function() {
			self.recurse.apply(self, args);
		};
	},

	generateFunction: function(name, params) {
		return this.grammar.generateFunction(name, params);
	},

	nextId: function() {
		return this.grammar.nextId.apply(this.grammar, arguments);
	},

	id: function(id) {
		return this.grammar.id(id);
	},

	exec: function(fn) {
		var args = toArray(arguments).slice(1);
		fn.apply(this, args);

		return this;
	},

	recurse: function (ast, id, data, recursion, create) {
		id = id || this.nextId();
		recursion = recursion || noop;

		switch(ast.type) {
		case AST.Program:
			this.parseProgram(ast);
			break;
		case AST.Literal:
			this.parseLiteral(ast, id, recursion);
			break;
		case AST.BinaryExpression:
			this.parseBinaryExpression(ast, id, recursion, create);
			break;
		case AST.LogicalExpression:
			this.parseLogicalExpression(ast, id, recursion, create);
			break;
		case AST.UnaryExpression:
			this.parseUnaryExpression(ast, id, recursion, create);
			break;
		case AST.Identifier:
			this.parseIdentifier(ast, id, data, recursion, create);
			break;
		case AST.MemberExpression:
			this.parseMemberExpression(ast, id, data, recursion, create);
			break;
		case AST.AssignmentExpression:
			this.parseAssignmentExpression(ast, id, recursion);
			break;
		case AST.ConditionalExpression:
			this.parseConditionalExpression(ast, id, recursion);
			break;
		case AST.CallExpression:
			this.parseCallExpression(ast, id, recursion);
			break;
		case AST.ObjectExpression:
			this.parseObjectExpression(ast, id, recursion);
			break;
		case AST.TemplateLiteral:
			this.parseTemplateLiteral(ast, id, recursion);
			break;
		case AST.ArrayExpression:
			this.parseArrayExpression(ast, id, recursion);
			break;
		case AST.ThisExpression:
			this.parseThisExpression(ast, id, recursion);
			break;
		case AST.NGValueParameter:
			this.grammar.assign(id, 'v');
			recursion('v');
			break;
		default:
			throw new Error('no statement for ' + ast.type);
		}

		return id;
	},

	parseUnaryExpression: function(ast, id, recursion) {
		var right,
				expression;

		this.recurse(ast.argument, undefined, undefined, function(expr) {
			right = expr;
		});

		expression = ast.operator + '(' + this.grammar.ifDefined(right, 0) + ')';
		this.grammar.assign(id, expression);
		recursion(expression);
	},

	parseThisExpression: function(ast, id, recursion) {
		this.grammar.assign(id, 's');
		recursion('s');
	},

	parseArrayExpression: function(ast, id, recursion) {
		var elements = ast.elements;
		var i, element, array = [];

		this.grammar.assign(id, 'new Array(' + elements.length + ')');

		for(i = 0; i < elements.length; i++) {
			element = this.recurse(elements[i]);
			this.grammar.assign(id + '[' + i + ']', element);
		}

		recursion(id);
	},

	parseTemplateLiteral: function(ast, id, recursion) {
		var template = [];
		var expressions = [];
		var i, expression, quasi;

		for(i = 0; i < ast.expressions.length; i++) {
			expression = ast.expressions[i];
			expressions.push(this.recurse(expression));
		}

		for(i = 0; i < ast.quasis.length; i++) {
			quasi = ast.quasis[i];

			if(quasi.tail && !isNumber(quasi.cooked.value) && isEmpty(quasi.cooked.value)) {
				break;
			}

			template.push(this.grammar.getAsString(this.grammar.escape(quasi.cooked.value)));

			if(expressions.length) {
				expression = expressions.shift();
				expression = this.grammar.join(
					this.grammar.join(
						this.grammar.execute('isNumber', expression),
						this.grammar.execute('String', expression),
						'&&'
					),
					expression,
					'||'
				);

				template.push(this.grammar.block(this.grammar.join(expression, this.grammar.getAsString(), '||')));
			}
		}

		this.grammar.assign(id, template.join('+'));

		recursion(id);
	},

	parseObjectExpression: function(ast, id, recursion) {
		var args = [];
		var self = this;
		var expression;

		forEach(ast.properties, function(property) {
			self.recurse(property.value, self.nextId(), undefined, function(expr) {
				args.push(self.grammar.escape(property.key.type === AST.Identifier ? property.key.name : property.key.value) + ':' + expr);
			});
		});

		expression = '{' + args.join(',') + '}';

		this.grammar.assign(id, expression);

		recursion(expression);
	},

	parseCallExpression: function(ast, id, recursion) {
		var self = this;
		var right, left, expression;
		var args = [];
		var grammar = this.grammar;

		right = this.nextId();
		left = ast.callee;

		this.recurse(ast.callee, right, undefined, function() {
			grammar.ifNotNull(right, function() {
				forEach(ast.arguments, function(expr) {
					self.recurse(expr, self.nextId(), function(argument) {
						args.push(argument);
					});
				});

				if(left.name) {
					expression = this.member('s', left.name, left.computed) + this.block(args.join(','));
				} else {
					expression = this.execute(right, args);
				}

				this.assign(id, expression);
			}, function() {
				this.assign(id, 'undefined');
			});
			recursion(id);
		});
	},

	parseConditionalExpression: function(ast, id, recursion) {
		this.recurse(ast.test, id);
		this.grammar.if_(id, this.lazyRecurse(ast.alternate, id), this.lazyRecurse(ast.consequent, id));
		recursion(id);
	},

	parseBinaryExpression: function (ast, id, recursion, create) {
		var right = this.nextId();
		var left = this.nextId();
		var expression;

		this.recurse(ast.left, left, undefined, function(expr) { left = expr; }, create);
		this.recurse(ast.right, right, undefined, function(expr) { right = expr; }, create);

		if(ast.operator === '+') {
			expression = this.grammar.plus(left, right);
		} else if (ast.operator === '-') {
			expression = this.grammar.ifDefined(left, 0) + ast.operator + this.grammar.ifDefined(right, 0);
		} else {
			expression = this.grammar.block(left) + ast.operator + this.grammar.block(right);
		}

		this.grammar.assign(id, expression);

		this.exec(recursion, expression);
	},

	parseAssignmentExpression: function(ast, id, recursion) {
		var self = this;
		var right = this.nextId();
		var grammar = this.grammar;
		var expression;

		if(!isAssignable(ast.left)) {
			throw $parseMinErr('lval', 'Trying to assign a value to a non l-value');
		}

		var left = {};

		this.recurse(ast.left, undefined, left, function(a) {
			grammar.ifNotNull('s', function() {
				self.recurse(ast.right, right);

				expression = this.member(left.context, left.name, left.computed) + ast.operator + right;

				this.assign(id, expression);

				self.exec(recursion, id || expression);
			});
		}, 1);
	},

	parseIdentifier: function(ast, id, data, recursion, create) {
		if(data) {
			data.context = 's';
			data.computed = false;
			data.name = ast.name;
		}

		this.grammar.ifNot(this.grammar.getHasOwnProperty('l', ast.name), function() {
			this.if_('s', function() {
				// create
				if(create) {
					this.ifNot(
						this.getHasOwnProperty('s', ast.name),
						this.lazyAssign(this.member('s', ast.name), '{}')
					);
				}

				this.assign(id, this.member('s', ast.name));
			});
		}, function(){
			this.if_(
				this.getHasOwnProperty('l', ast.name),
				this.lazyAssign(id, this.member('l', ast.name))
			);
		});
		this.exec(recursion, id);
	},

	parseLogicalExpression: function(ast, id, recursion, create) {
		var grammar = this.grammar;

		this.recurse(ast.left, id, undefined, undefined, create);

		grammar[ast.operator === '&&' ? 'if_' : 'ifNot'](id, this.lazyRecurse(ast.right, id));

		this.exec(recursion, id);
	},

	parseMemberExpression: function(ast, id, data, recursion, create) {
		var self = this;
		var grammar = this.grammar;
		var expression;

		var left = data && (data.context = this.nextId()) || this.nextId(),
				right;

		this.recurse(ast.object, left, undefined, function(a) {
			var grammar = this.grammar;
			grammar.ifNotNull(left, function() {
				if(ast.computed) {
					right = this.nextId();

					self.recurse(ast.property, right);

					if(create) {
						this.ifNot(
							this.computedMember(left, right),
							this.lazyAssign(this.computedMember(left, right), '{}')
						);
					}

					expression = this.computedMember(left, right);
					this.assign(id, expression);

					if(data) {
						data.computed = true;
						data.name = right;
					}
				} else {
					if(create) {
						this.ifNot(
							this.join(left, left + '.hasOwnProperty("' + ast.property.name + '")', '&&'),
							this.lazyAssign(this.nonComputedMember(left, ast.property.name), '{}')
						);
					}

					expression = grammar.nonComputedMember(left, ast.property.name);

					this.assign(id, expression);

					if(data) {
						data.computed = false;
						data.name = ast.property.name;
					}
				}
			}, function() {
				this.assign(id, 'undefined');
			});
			this.exec(recursion, id);
		}, !!create);
	},

	parseLiteral: function(ast, id, recursion) {
		var value = clone(ast.value);

		this.grammar.assign(id, value);

		this.exec(recursion, value);
	},

	/**
	 * If we have received a program type expression
	 * this method will apply the `recurse` method in
	 * in each expression of each body present on a AST
	 * when he have reached the end of all the bodies
	 * it will return the last expression.
	 *
	 * ```
	 * (a === true ? (b * a) : null) && (b)
	 * ```
	 */
	parseProgram: function(ast, recurse) {
		var right;
		var grammar = this.grammar;

		recurse = recurse || bind(this.recurse, this);

		forEach(ast.body, function(exp, pos) {
			recurse(exp.expression, undefined, undefined, function(expr) { right = expr; });

			if(pos !== ast.body.length - 1) {
				grammar.current().body.push(right, ';');
			} else {
				grammar.return_(right);
			}
		});
	}
};
