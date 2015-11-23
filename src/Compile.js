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

	execute: function(type, scope) {
		if(!type) type = 'post';

		if(type == 'pre') {
			this.invokeLinks(type, scope, this.node);
		} else if (type == 'post') {
			this.invokeLinks(type, scope, this.node);
		}
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

function Compile(node, registry) {
	this.node = node;
	this.registry = registry;
	this.prepare();
}

Compile.prototype = {
	prepare: function() {
		var nodeList = this.node.childNodes;
		var i,
				nodeLink,
				nodeLinks = [],
				childNodes,
				childNodeLink;

		for(i = 0; i < nodeList.length; i++) {
			directives = new Scanner(nodeList[i], this.registry).scan();

			nodeLink = new NodeLink(nodeList[i], directives);
			nodeLink.prepare();

			childNodes = nodeList[i].childNodes;
			if(childNodes && childNodes.length > 0) {
				childNodeLink = new Compile(childNodes, this.registry);
			} else {
				childNodeLink = null;
			}

			nodeLinks.push(nodeLink, childNodeLink);
		}

		this.nodeLinks = nodeLinks;
	},

	execute: function(scope) {
		var nodeLinks = this.nodeLinks;
		var i,
				ii = nodeLinks.length,
				nodeLink,
				childNodeLink;

		for(i = 0; i < ii; i++) {
			nodeLink = nodeLinks[i];
			nodeLink.execute('pre', scope);

			if(childNodeLink = nodeLinks[++i]) {
				childNodeLink.execute(scope);
			}

			nodeLink.execute('post', scope);
		}
	}
};