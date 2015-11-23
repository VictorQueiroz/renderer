function Compile(node, registry) {
	this.node = node;
	this.registry = registry;
	this.prepare();
}

Compile.prototype = {
	prepare: function() {
		if(this.node instanceof Node === true) {
			var directives = new Scanner(this.node, this.registry).scan();
			this.compositeLink = new NodeLink(this.node, directives);
			this.compositeLink.prepare();

			this.childLink = new Compile(this.node.childNodes, this.registry);
		} else if (this.node instanceof NodeList === true ||
							isArray(this.node) === true) {
			this.compositeLink = new CompositeLink(this.node, this.registry);
		}
	},

	execute: function(scope) {
		this.compositeLink.execute(scope, this.childLink);
	}
};