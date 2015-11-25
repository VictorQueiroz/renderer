function Compile(node, registry) {
	this.node = node;
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
			if(this.node[0].nodeName == 'TRANSCLUDE') {
				console.log(this.node[0], this.compositeLink)
			}
			this.compositeLink = new CompositeLink(this.node, this.registry);
		} else if(this.node instanceof Node === true) {
			var directives = new Scanner(this.node, this.registry).scan();

			this.compositeLink = new NodeLink(this.node, directives);
			this.compositeLink.prepare(this.registry);

			this.childLink = new Compile(this.node.childNodes, this.registry);
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