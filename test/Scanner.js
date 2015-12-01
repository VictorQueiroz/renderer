var createNode = function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div;
};

var getNodeAttributesLength = function(node, length, deep) {
	var i = 0;

	length = length || 0;

	for(; i < node.childNodes.length; i++) {
		if(node.nodeType != Node.ELEMENT_NODE) {
			continue;
		}

		length += node.childNodes[i].attributes.length;

		if(deep) {
			length += getNodeAttributesLength(node.childNodes[i], length, deep);
		}
	}

	if(node.nextSibling && deep) {
		length += getNodeAttributesLength(node.nextSibling, length, deep);
	}

	return length;
};

describe('Scanner', function() {
	var scanner;
	var node = createNode(
		'<div ts-attribute-directive>' +
			'<div ts-attribute-directive></div>' +
		'</div>'
	);

	it('should find attributes directives', function() {
		renderer.register('tsAttributeDirective', function() {
			return noop;
		});

		scanner = new Scanner(node.childNodes[0], directiveRegistry);
		expect(scanner.scan().length).toBe(1 + getNodeAttributesLength(node, 0, false));

		renderer.clearRegistry();
	});
});
