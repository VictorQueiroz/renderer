/**
 * Compile an entire NodeList instance, different of
 * NodeLink, which compiles only a single node and are
 * capable of execute the compile child link of the node
 */
function CompositeLink (nodeList, registry, options) {
	this.options = options;
	this.nodeList = nodeList;
	this.registry = registry;

	var i,
			scanner,
			nodeLink,
			nodeLinks = [],
			childLink,
			hasChildNodes,
			attributes,
			directives = [];

	for(i = 0; i < nodeList.length; i++) {
		scanner = new Scanner(nodeList[i], this.registry, i === 0 ? this.options.maxPriority : undefined);

		directives = scanner.scan();
		attributes = scanner.attributes;

		nodeLink = new NodeLink(nodeList[i], directives, attributes);
		nodeLink.prepare(registry);

		hasChildNodes = nodeList[i].childNodes &&
										nodeList[i].childNodes.length > 0 &&
										nodeList[i].childNodes ||
										0;

		childLink = new Compile(hasChildNodes ? nodeList[i].childNodes : [], this.registry, this.options);

		nodeLinks.push(nodeLink, childLink);
	}

	this.nodeLinks = nodeLinks;
}

CompositeLink.prototype = {
	execute: function(scope, childLink, transcludeFn) {
		var i, ii = this.nodeLinks.length;

		for(i = 0; i < ii; i++) {
			this.nodeLinks[i].execute(scope, this.nodeLinks[++i], transcludeFn);
		}
	}
};
