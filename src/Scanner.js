/**
 * Scanner all the present directives
 * in a dom element
 */
function Scanner(node, registry, maxPriority) {
	this.node = node;
	this.registry = registry;
	this.attributes = new Attributes(this.node),
	this.directives = [];
	this.maxPriority = maxPriority;
}

Scanner.prototype = {
	scan: function() {
		if(this.directives.length) {
			this.directives = [];
		}

		var node = this.node;

		var attributes = node.attributes;
		var name,
				i,
				j,
				jj,
				ii = attributes && attributes.length || 0,
				classes;

		this.add(this.normalize(node.nodeName), 'E');

		for(i = 0; i < ii; i++) {
			if(attributes[i].name == 'class') {
				classes = attributes[i].value.split(' ');
				jj = classes.length;

				for(j = 0; j < jj; j++) {
					this.add(this.normalize(classes[j]), 'C');
				}
			}

			name = this.normalize(attributes[i].name);

			this.interpolate(name, attributes[i].value);
			this.attributes[name] = attributes[i].value;
			this.add(name, 'A');
		}

		/**
     * Sorting function for bound directives.
     */
    this.directives.sort(function (a, b) {
      var diff = b.priority - a.priority;
      if (diff !== 0) return diff;
      if (a.name !== b.name) return (a.name < b.name) ? -1 : 1;
      return a.index - b.index;
    });

		return this.directives;
	},

	interpolate: function(name, value) {
		this.directives.push({
			priority: 100,
			compile: function() {
				return {
					pre: function(scope, element, attrs) {
						var interpolate = new Interpolate(value);

						if(interpolate.exps.length === 0) return;

						scope.watchGroup(interpolate.exps, function() {
							attrs.$set(name, interpolate.compile(scope));
						});
					}
				};
			}
		});
	},

	add: function(name, restrict) {
		var directives = this.registry.$$get(name);
		var maxPriority = this.maxPriority;

		if(!directives) {
			return null;
		}

		var i,
				ii = directives.length,
				directive;

		for(i = 0; i < ii; i++) {
			directive = directives[i];

			if(directive.restrict.indexOf(restrict) === -1 ||
				(isDefined(maxPriority) && !(directive.priority > maxPriority))) {
				this.clearPriority();
				continue;
			}

			this.directives.push(directive);
		}
	},

	normalize: function(name) {
		return camelCase(name);
	},

	clearPriority: function() {
		delete this.maxPriority;
	}
};
