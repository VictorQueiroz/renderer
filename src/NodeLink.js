function NodeLink(node, directives, attributes, context) {
	this.node = node;
	this.links = {
		post: [],
		pre: []
	};

	this.scope = null;
	this.context = context || {};
	this.attributes = attributes;
	this.directives = directives || [];
	this.transclude = null;
	this.terminalPriority = -Number.MAX_VALUE;

	if(this.node.nodeType === Node.TEXT_NODE) {
		this.directives.push({
			compile: function(node) {
				return function(scope, node) {
					var interpolate = new Interpolate(node.nodeValue);

					scope.watchGroup(interpolate.exps, function() {
						node.nodeValue = interpolate.compile(scope);
					});
				};
			}
		});
	}
}

extend(NodeLink, {
	SCOPE_CHILD: 1,
	SCOPE_ISOLATED: 2
});

NodeLink.prototype = {
	constructor: NodeLink,

	/**
	 * Given a node with an directive-start it collects all of the siblings until it finds
	 * directive-end.
	 * @param node
	 * @param attrStart
	 * @param attrEnd
	 * @returns {*}
	 */
	group: function(attrStart, attrEnd) {
		var node = this.node,
				nodes = [],
				depth = 0;

		if (attrStart && node.hasAttribute && node.hasAttribute(attrStart)) {
			do {
				if (!node) {
					throw $compileMinErr('uterdir',
										"Unterminated attribute, found '{0}' but no matching '{1}' found.",
										attrStart, attrEnd);
				}
				if (node.nodeType == Node.ELEMENT_NODE) {
					if (node.hasAttribute(attrStart)) depth++;
					if (node.hasAttribute(attrEnd)) depth--;
				}
				nodes.push(node);
				node = node.nextSibling;
			} while (depth > 0);
		} else {
			nodes.push(node);
		}

		return new NodeGroup(nodes);
	},

	prepare: function(registry) {
		var i,
				ii = this.directives.length,
				options,
				context = this.context,
				attrEnd,
				attrStart,
				directive,
				scopeType;

		for(i = 0; i < ii; i++) {
			directive = this.directives[i];

			if (this.terminalPriority > directive.priority) {
				break; // prevent further processing of directives
			}

			attrStart = directive.$$start;
			attrEnd = directive.$$end;

			// collect multi elements
			if(attrStart) {
				this.node = this.group(attrStart, attrEnd);
			}

			if(directive.hasOwnProperty('scope') && directive.scope) {
				// This directive is trying to add an isolated scope.
				// Check that there is no scope of any kind already
				if(isObject(directive.scope)) {
					if(this.scope) {
						throw new Error(
							'You can\'t define a new isolated ' +
							'scope on a node that already has a ' +
							'child scope defined'
						);
					}
					scopeType = NodeLink.SCOPE_ISOLATED;
				} else if (isBoolean(directive.scope)) {
					scopeType = NodeLink.SCOPE_CHILD;
				}

				this.scope = {
					type: scopeType,
					bindings: directive.scope
				};
			}

			if(directive.controller) {
				// The list of all the
				// directives controllers.
				context.controllers = context.controllers || {};
				context.controllers[directive.name] = directive;
			}

			if(!directive.transclude && directive.template) {
				directive.transclude = true;
			}

			if(directive.transclude) {
				if(directive.transclude == 'element') {
					this.terminalPriority = directive.priority;
				}

				options = {
					type: directive.transclude,
					registry: registry,
					directive: directive,
					attributes: this.attributes,
					controllers: context.controllers,
					terminalPriority: this.terminalPriority,
				};

				this.transclude = new Transclude(this.node, options);

				if(directive.transclude == 'element' &&
					this.node !== this.transclude.comment) {
					this.node = this.transclude.comment;
				}

				this.transcludeFn = this.transclude.getTranscludeCallback();
			}

			if(directive.template) {
				if(isArray(directive.template)) {
					directive.template = directive.template.join('');
				}

				this.node.innerHTML = directive.template;
				this.hasTemplate = true;
			}

			this.addLink(directive.compile(this.node, this.attributes, this.transcludeFn), directive);

			if(directive.terminal) {
				this.terminal = true;
				this.terminalPriority = Math.max(this.terminalPriority, directive.priority);
			}
		}
	},

	REQUIRE_PREFIX_REGEXP: /^(?:(\^\^?)?(\?)?(\^\^?)?)?/,

	getControllers: function(directiveName, node, require, controllers) {
		var value;

		if (isString(require)) {
			var match = require.match(this.REQUIRE_PREFIX_REGEXP);
			var name = require.substring(match[0].length);
			var inheritType = match[1] || match[3];
			var optional = match[2] === '?';

			//If only parents then start at the parent element
			if (inheritType === '^^') {
				$element = $element.parentNode;
			//Otherwise attempt getting the controller from controllers in case
			//the element is transcluded (and has no data) and to avoid .data if possible
			} else {
				value = controllers && controllers[name];
				value = value && value.instance;
			}

			if (!value) {
				var dataName = '$' + name + 'Controller';
				value = inheritType ? elementInheritedData(node, dataName) : elementData(node, dataName);
			}

			if (!value && !optional) {
				throw new Error("Controller '" + name + "', required by " +
												"directive '" + directiveName + "', can't " +
												"be found!");
			}
		} else if (isArray(require)) {
			value = [];
			for (var i = 0, ii = require.length; i < ii; i++) {
				value[i] = this.getControllers(directiveName, node, require[i], controllers);
			}
		}

		return value || null;
	},

	instantiate: function(Controller, scope, node, attributes, transcludeFn) {
		return new Controller(scope, node, attributes, transcludeFn);
	},

	setupControllers: function(scope, node, attributes, transcludeFn) {
		var i,
				keys = Object.keys(this.context.controllers),
				directive,
				controller,
				controllers = {};

		for(i = 0; i < keys.length; i++) {
			directive = this.context.controllers[keys[i]];

			if(isFunction(directive.controller)) {
				controller = this.instantiate(directive.controller, scope, node, attributes, transcludeFn);
			} else {
				continue;
			}

			controllers[directive.name] = controller;

			elementData(node, '$' + directive.name + 'Controller', controllers[directive.name]);
		}

		return controllers;
	},

	parse: function(exp) {
		return new Parser(new Lexer()).parse(exp);
	},

	// Set up $watches for isolate scope and controller bindings. This process
	// only occurs for isolate scopes and new scopes with controllerAs.
	directiveBindings: function(scope, dest, bindings) {
		var i = 0,
				bindingsKeys = Object.keys(bindings),
				ii = bindingsKeys.length,
				mode,
				attrs = this.attributes;
		forEach(bindings, function(mode, key) {
			var attrName,
					parentGet,
					parentSet,
					lastValue;

			mode = bindings[key];

			if(mode.length > 1) {
				attrName = mode.substring(1);
				mode = mode[0];
			} else {
				attrName = key;
			}

			switch(mode) {
				case '@':
					attrs.$observe(attrName, function(value) {
						if(isString(value)) {
							dest[key] = value;
						}
					});

					if(isString(attrs[attrName])) {
						// If the attribute has been provided then we trigger an interpolation to ensure
						// the value is there for use in the link fn
						dest[key] = new Interpolate(attrs[attrName]).compile(scope);
					}
					break;
				case '=':
					if(!attrs.hasOwnProperty(attrName)) {
						break;
					}

					parentGet = this.parse(attrs[attrName]);
					parentSet = parentGet.assign;
					lastValue = dest[key] = parentGet(scope);

					var parentWatcher = function(value) {
						if(!isEqual(value, dest[key])) {
							// we are out of sync and need to copy
							if(!isEqual(value, lastValue)) {
								// parent changed and it has precedence
								dest[key] = value;
							} else {
								parentSet(scope, value = dest[key]);
							}
						}
						return (lastValue = value);
					};

					scope.watch(attrs[attrName], parentWatcher);
					dest.watch(attrName, function(value, oldValue) {
						if(!isEqual(value, scope[key])) {
							scope[key] = value;
						}
					});
					break;
			}
		}, this);
	},

	callLink: function(link, scope, transcludeFn) {
		link(
			scope,
			this.node,
			this.attributes,
			this.getControllers(
				link.directiveName,
				this.node,
				link.require,
				this.controllers
			),
			transcludeFn
		);

		return this;
	},

	execute: function(scope, childLink, transcludeFn) {
		var newScope;

		if(this.transclude) {
			this.transcludeFn = this.transclude.getTranscludeCallback(scope);
		} else if (!this.transcludeFn && isFunction(transcludeFn)) {
			this.transcludeFn = transcludeFn;
		}

		// If the link that receive the isolated scope directive does not require
		// a isolated scope, it receive the actual scope. Only the childs of the node
		// with the isolated scope will receive the isolated scope, this prevents that
		// the node attributes gets compiled with the values of the isolated scope, and
		// directives automatically created by the interpolation will be getting the
		// isolated scope itself, and not the node scope
		if(this.scope) {
			switch(this.scope.type) {
			case NodeLink.SCOPE_CHILD:
				newScope = scope.clone();
				break;
			case NodeLink.SCOPE_ISOLATED:
				newScope = scope.clone(true);
				this.directiveBindings(scope, newScope, this.scope.bindings);
				break;
			}
		} else if(!newScope) {
			newScope = scope;
		}

		if(this.context.controllers) {
			this.controllers = this.setupControllers(newScope, this.node, this.attributes, transcludeFn);
		}

		var i = 0,
				links = this.links,
				ii = links.pre.length,
				link;
		for(; i < ii; i++) {
			link = links.pre[i];

			this.callLink(
				link,
				link.newScopeType ? newScope : scope,
				this.transcludeFn
			);
		}

		childLink.execute(scope, this.transcludeFn);

		i = links.post.length - 1;
		for(; i >= 0; i--) {
			link = links.post[i];

			this.callLink(
				link,
				link.newScopeType ? newScope : scope,
				this.transcludeFn
			);
		}
	},

	addLink: function(link, directive) {
		var links = this.links;
		var directiveData = {
			directiveName: directive.name,
			require: directive.require,
			newScopeType: isDefined(directive.scope)
		};

		if(isObject(link)) {
			forEach(link, function(value, key) {
				extend(value, directiveData);

				if(links.hasOwnProperty(key)) {
					links[key].push(value);
				}
			});
		} else if(isFunction(link)) {
			extend(link, directiveData);

			links.post.push(link);
		}
	}
};
