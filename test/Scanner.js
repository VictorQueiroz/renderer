var createNode = function(html) {
	var div = document.createElement('div');
	div.innerHTML = html;
	return div;
};

describe('Scanner', function() {
	var scanner;
	var node = createNode(
		'<div ts-attribute-directive></div>'
	);

	afterEach(function() {
		renderer.clearRegistry();
	});

	it('should find attributes directives', function() {
		renderer.register('tsAttributeDirective', function() {
			return {
				compile: function(node) {
					console.log('compile!', node);

					return function(scope, node) {
						console.log('post link', node);
					};
				}
			};
		});

		scanner = new Scanner(node.childNodes[0], directiveRegistry);
		expect(scanner.scan().length).toBe(1);

		var compile = new Compile(node, directiveRegistry);
		compile.execute();
	});
});