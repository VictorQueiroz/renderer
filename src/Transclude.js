function Transclude(node, options) {
	this.node = node;
	
	if(isObject(options)) {
		extend(this, options);
	}

	this.compileOptions = {};

	if(isNumber(this.terminalPriority)) {
		this.compileOptions.maxPriority = this.terminalPriority;
	}

	var i,
			ii;

	if(this.type == 'element') {
		var name = this.directive.name;
		var attrs = this.attributes;

		var parent = this.node.parentNode;
		var comment = document.createComment(' ' + name + ': ' + attrs[name] + ' ');

		if(parent) {
			parent.replaceChild(comment, this.node);
		}

		this.clone = this.node;
		this.comment = comment;
	} else {
		ii = this.node.childNodes.length;
		var fragment = document.createDocumentFragment();

		for(i = 0; i < ii; i++) {
			fragment.appendChild(this.node.childNodes[i]);
		}

		this.clone = fragment;
	}
}

Transclude.prototype = {
	getTranscludeCallback: function(defaultScope) {
		var clone = this.clone;
		var registry = this.registry;
		var compileOptions = this.compileOptions;

		return function(scope, caller) {
			if(isFunction(scope)) {
				caller = scope;
				scope = defaultScope.$new();
			}

			var cloned = clone.cloneNode(1);
			var compile = new Compile(cloned, registry, compileOptions);

			caller(cloned);

			compile.execute(scope);
		};
	}
};