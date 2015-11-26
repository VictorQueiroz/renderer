function NodeLink(node, directives, attributes, context) {
	this.node = node;
	this.links = {
		post: [],
		pre: []
	};

	this.context = context || {};
	this.attributes = attributes;
	this.directives = directives;
	this.transclude = null;
	this.terminalPriority = -Number.MAX_VALUE;
}

NodeLink.prototype = {
	prepare: function(registry) {
		var i,
				ii = this.directives.length,
				options,
				context = this.context,
				directive;

		for(i = 0; i < ii; i++) {
			directive = this.directives[i];

			if (this.terminalPriority > directive.priority) {
        break; // prevent further processing of directives
      }

      if(!directive.templateUrl && directive.controller) {
      	// The list of all the
      	// directives controllers.
      	context.controllers = context.controllers || {};
      	context.controllers[directive.name] = directive;
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

			this.addLink(directive.compile(this.node, null, this.transcludeFn), directive);

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
        $element = $element.parent();
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

	invokeLinks: function(type) {
		var args = toArray(arguments).slice(1);
		var links = this.links[type];
		var i, ii = links.length;

		for(i = 0; i < ii; i++) {
			if(args[3] == null) {
				args[3] = this.getControllers(links[i].directiveName, this.node, links[i].require, this.controllers);
			}

			links[i].apply(null, args);
		}
	},

	instantiate: function(directive, Controller) {
		return new Controller();
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
				controller = this.instantiate(directive, directive.controller);
			} else {
				continue;
			}

			controllers[directive.name] = controller;

			elementData(node, '$' + directive.name + 'Controller', controllers[directive.name]);
		}

		return controllers;
	},

	execute: function(scope, childLink, transcludeFn) {
		if(this.transclude) {
			this.transcludeFn = this.transclude.getTranscludeCallback(scope);
		} else if (!this.transcludeFn && isFunction(transcludeFn)) {
			this.transcludeFn = transcludeFn;
		}

		if(this.context.controllers) {
			this.controllers = this.setupControllers(scope, this.node, this.attributes, transcludeFn);
		}

		this.invokeLinks('pre', scope, this.node, null, null, this.transcludeFn);

		childLink.execute(scope, this.transcludeFn);

		this.invokeLinks('post', scope, this.node, null, null, this.transcludeFn);
	},

	addLink: function(link, directive) {
		var links = this.links;

		if(isObject(link)) {
			forEach(link, function(value, key) {
				extend(value, {
					directiveName: directive.name,
					require: directive.require
				});

				if(links.hasOwnProperty(key)) {
					links[key].push(value);
				}
			});
		} else if(isFunction(link)) {
			extend(link, {
				directiveName: directive.name,
				require: directive.require
			});

			links.post.push(link);
		}
	}
};