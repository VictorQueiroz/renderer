describe('Compile', function() {
	var node;

	it('should recursively compile node directives', function() {
		node = createNode(
			'<div>' +
				'<div></div>' +
			'</div>'
		);

		renderer.register('div', function() {
			return {
				compile: function() {
					return function(scope, el) {
						el.classList.add('div-directive');
					};
				}
			};
		});

		var compile = new Compile(node, directiveRegistry);
		compile.execute();

		function search(node) {
			if(node instanceof Node === true) {
				while(node) {
					expect(node.classList.contains('div-directive')).toBeTruthy();
					
					if(node.childNodes instanceof NodeList === true) {
						search(node.childNodes);
					}

					node = node.nextSibling;
				}
			} else if (node instanceof NodeList === true) {
				var i;
				for(i = 0; i < node.length; i++) {
					search(node[i]);
				}
			}
		}

		search(node);

		renderer.clearRegistry();
	});
});