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
			childNodes,
			directives = [];

	for(i = 0; i < nodeList.length; i++) {
		directives = new Scanner(nodeList[i], this.registry).scan();

		childNodes = nodeList[i].childNodes &&
								nodeList[i].childNodes.length > 0 &&
								nodeList[i].childNodes ||
								[];

		childLink = new Compile(childNodes, this.registry);

		nodeLink = new NodeLink(nodeList[i], directives);
		nodeLink.prepare();

		nodeLinks.push(nodeLink, childLink);
	}

	this.nodeLinks = nodeLinks;
}

CompositeLink.prototype = {
	execute: function(scope) {
		var i, ii = this.nodeLinks.length;

		for(i = 0; i < ii; i++) {
			this.nodeLinks[i].execute(scope, this.nodeLinks[++i]);
		}
	}
};