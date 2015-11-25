/**
 * Compile an entire NodeList instance, different of
 * NodeLink, which compiles only a single node and are
 * capable of execute the compile child link of the node
 */
function CompositeLink (nodeList, registry) {
	this.nodeList = nodeList;
	this.registry = registry;

	var i,
			nodeLink,
			nodeLinks = [],
			childLink,
			hasChildNodes,
			directives = [];

	for(i = 0; i < nodeList.length; i++) {
		directives = new Scanner(nodeList[i], this.registry).scan();

		hasChildNodes = nodeList[i].childNodes &&
										nodeList[i].childNodes.length > 0 &&
										nodeList[i].childNodes ||
										0;

		nodeLink = new NodeLink(nodeList[i], directives);
		nodeLink.prepare(registry);

		childLink = new Compile(hasChildNodes ? nodeList[i].childNodes : [], this.registry);

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