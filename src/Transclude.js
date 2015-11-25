function Transclude(node, options) {
	this.node = node;
	
	if(isObject(options)) {
		extend(this, options);
	}

	if(this.type == 'element') {
		//
	} else {
		var i,
				ii = this.node.childNodes.length,
				fragment = document.createDocumentFragment();
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

		return function(scope, caller) {
			if(isFunction(scope)) {
				caller = scope;
				scope = defaultScope.$new();
			}

			var cloned = clone.cloneNode(1);
			var compile = new Compile(cloned, registry);

			caller(cloned);

			compile.execute(scope);
		};
	}
};