var createNode = function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div;
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
		expect(scanner.scan().length).toBe(1);

		renderer.clearRegistry();
	});
});