function ASTFinder(astBuilder) {
	this.astBuilder = astBuilder;
	this.id = 0;
}

ASTFinder.prototype = {
	nextId: function() {
		return ++this.id;
	},

	find: function(exp) {
		var computeds, expressions, objects;
		var ast = this.astBuilder.ast(exp);

		this.objects      = objects = {};
		this.computeds    = computeds = {};
		this.expressions  = expressions = {};

		this.recurse(ast);

		forEach(this.expressions, function(exps, id) {
			if(!computeds[id] || !exps.length) {
				delete computeds[id];
				delete expressions[id];
			}
		});

		this.exps = map(this.expressions, function(exps, key) {
			var expression = exps.join('.');
			var exp = {
				property: true,
				exp: expression
			};

			if(objects[key] && objects[key].join('.') === expression) {
				exp.property = false;
			}

			return exp;
		});

		return (this.allExps = values(this.expressions));
	},

	parseProgram: function(ast) {
		var self = this;

		forEach(ast.body, function(statement) {
			self.recurse(statement.expression);
		});
	},

	parseMemberExpression: function(ast, id, recursion) {
		var property;
		var expressions = this.expressions[id];

		if(ast.hasOwnProperty('object') && ast.object.name) {
			this.objects[id].push(ast.object.name);
		}

		this.recurse(ast.object, id, function() {
			if(ast.computed) {
				property = this.nextId();
				this.computeds[property] = true;

				this.recurse(ast.property, property);
			} else {
				expressions.push(ast.property.name);
			}

			recursion(id);
		});
	},

	parseBinaryExpression: function(ast, id, recursion) {
		var left = this.nextId();
		var right = this.nextId();
		var computeds = this.computeds;

		this.recurse(ast.left, left, function() {
			this.recurse(ast.right, right);

			forEach(this.expressions, function(value, key) {
				if(key == right || key == left) {
					computeds[key] = true;
				}
			});

			recursion(id);
		});
	},

	parseLogicalExpression: function(ast, id, recursion) {
		this.recurse(ast.left);
		this.recurse(ast.right);
	},

	parseIdentifier: function(ast, id, recursion) {
		this.expressions[id].push(ast.name);
		recursion(id);
	},

	parseTemplateLiteral: function(ast, id, recursion) {
		var self = this;
		var exprId;

		forEach(ast.expressions, function(expr) {
			exprId = self.nextId();
			self.computeds[exprId] = true;
			self.recurse(expr, exprId);
		});

		recursion(id);
	},

	parseArrayExpression: function(ast, id, recursion) {
		console.log(ast);
	},

	recurse: function(ast, id, recursion) {
		id          = id || this.nextId();
		recursion   = recursion && recursion.bind(this) || noop;

		if(!this.expressions.hasOwnProperty(id)) {
			this.expressions[id] = [];
		}
		if(!this.objects.hasOwnProperty(id)) {
			this.objects[id] = [];
		}

		switch(ast.type) {
		case AST.CallExpression:
		case AST.ArrayExpression:
		case AST.Literal:
			recursion(id);
			break;
		case AST.TemplateLiteral:
			this.parseTemplateLiteral(ast, id, recursion);
			break;
		case AST.LogicalExpression:
			this.parseLogicalExpression(ast, id, recursion);
			break;
		case AST.BinaryExpression:
			this.parseBinaryExpression(ast, id, recursion);
			break;
		case AST.MemberExpression:
			this.parseMemberExpression(ast, id, recursion);
			break;
		case AST.Program:
			this.parseProgram(ast);
			break;
		case AST.Identifier:
			this.parseIdentifier(ast, id, recursion);
			break;
		default:
			throw new Error('there is no statement for ' + ast.type);
			break;
		}
	}
};
