function NodeLink(node, directives, attributes) {
	this.node = node;
	this.links = {
		post: [],
		pre: []
	};

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
				directive;

		for(i = 0; i < ii; i++) {
			directive = this.directives[i];

			if (this.terminalPriority > directive.priority) {
        break; // prevent further processing of directives
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
				this.node.innerHTML = directive.template;
				this.hasTemplate = true;
			}

			this.addLink(directive.compile(this.node, null, this.transcludeFn));

			if(directive.terminal) {
				this.terminal = true;
				this.terminalPriority = Math.max(this.terminalPriority, directive.priority);
			}
		}
	},

	invokeLinks: function(type) {
		var args = toArray(arguments).slice(1);
		var links = this.links[type];
		var i, ii = links.length;

		for(i = 0; i < ii; i++) {
			links[i].apply(null, args);
		}
	},

	execute: function(scope, childLink, transcludeFn) {
		if(this.transclude) {
			this.transcludeFn = this.transclude.getTranscludeCallback(scope);
		} else if (!this.transcludeFn && isFunction(transcludeFn)) {
			this.transcludeFn = transcludeFn;
		}

		this.invokeLinks('pre', scope, this.node, null, null, this.transcludeFn);

		childLink.execute(scope, this.transcludeFn);

		this.invokeLinks('post', scope, this.node, null, null, this.transcludeFn);
	},

	addLink: function(link) {
		var links = this.links;

		if(isObject(link)) {
			forEach(link, function(value, key) {
				if(links.hasOwnProperty(key)) {
					links[key].push(value);
				}
			});
		} else if(isFunction(link)) {
			links.post.push(link);
		}
	}
};