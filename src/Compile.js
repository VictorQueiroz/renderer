function Compile(node, registry, options) {
	this.node = node;
	this.options = options || {};
	this.registry = registry;
	this.prepare();
}

Compile.prototype = {
	prepare: function() {
		if(this.node instanceof DocumentFragment === true) {
			this.node = this.node.childNodes;
		}

		if ((this.node instanceof NodeList === true ||
				isArray(this.node) === true) && this.node.length > 0) {
			this.compositeLink = new CompositeLink(this.node, this.registry, this.options);
		} else if(this.node instanceof Node === true) {
			var scanner = new Scanner(this.node, this.registry, this.options.maxPriority);

			var directives = scanner.scan();
			var attributes = scanner.attributes;

			this.compositeLink = new NodeLink(this.node, directives, attributes);
			this.compositeLink.prepare(this.registry);

			this.childLink = new Compile(this.node.childNodes, this.registry, extend(clone(this.options), {
				// We need to clear the 'maxPriority' here, for we don't
				// want to skip directives that shouldn't be skipped, since
				// the 'maxPriority' is defined before to prevent that the same
				// node directive gets recompiled twice.
				maxPriority: undefined
			}));
		}
	},

	execute: function(scope, transcludeFn) {
		if(this.compositeLink) {
			this.compositeLink.execute(scope, this.childLink, transcludeFn);
		} else if(this.childLink) {
			this.childLink.execute(scope, transcludeFn);
		}
	}
};