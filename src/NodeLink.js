function NodeLink(node, directives) {
	this.node = node;
	this.links = {
		post: [],
		pre: []
	};	
	this.directives = directives;
}

NodeLink.prototype = {
	prepare: function() {
		var i,
				ii = this.directives.length;

		for(i = 0; i < ii; i++) {
			this.addLink(this.directives[i].compile(this.node));
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

	execute: function(scope, childLink) {
		this.invokeLinks('pre', scope, this.node);

		childLink.execute(scope);

		this.invokeLinks('post', scope, this.node);
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