/**
 * Scanner all the present directives
 * in a dom element
 */
function Scanner(node, registry) {
	this.node = node;
	this.registry = registry;
	this.directives = [];
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
				ii = attributes && attributes.length || 0;

		this.add(this.normalize(node.nodeName), 'E');

		for(i = 0; i < ii; i++) {
			name = this.normalize(attributes[i].name);

			this.add(name, 'A');
		}

		return this.directives;
	},

	add: function(name, restrict) {
		var directives = this.registry.$$get(name);

		if(!directives) {
			return null;
		}

		var i,
				ii = directives.length,
				directive;

		for(i = 0; i < ii; i++) {
			directive = directives[i];

			if(directive.restrict.indexOf(restrict) === -1) {
				continue;
			}

			this.directives.push(directive);
		}
	},

	normalize: function(name) {
		return camelCase(name);
	}
};