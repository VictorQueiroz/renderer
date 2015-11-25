function search(node, callback) {
	if(node instanceof Node === true) {
		while(node) {
			callback(node);
			
			if(node.childNodes instanceof NodeList === true) {
				search(node.childNodes, callback);
			}

			node = node.nextSibling;
		}
	} else if (node instanceof NodeList === true) {
		var i;
		for(i = 0; i < node.length; i++) {
			search(node[i], callback);
		}
	}
}

describe('Compile', function() {
	var node,
			scope;

	beforeEach(function() {
		scope = new Scope();
	});

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
		compile.execute(scope);

		search(node, function(node) {
			expect(node.classList.contains('div-directive')).toBeTruthy();
		});

		renderer.clearRegistry();
	});

	describe('Transclusion', function() {
		it('should render content transclude directives', function() {
			node = document.createElement('span');
			node.appendChild(createNode(
				'<div>' +
					'<div></div>' +
				'</div>'
			));

			renderer.register('div', function() {
				return {
					transclude: true,
					compile: function(el, attrs, $transclude) {
						return function(scope, el, attrs, ctrls, transclude) {
							transclude(function(clone) {
								el.parentNode.insertBefore(clone, el);
							});
						}
					}
				}
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(node.outerHTML).toBe(
				'<span><div></div><div></div><div></div></span>'
			);

			renderer.clearRegistry();
		});

		it('should pass the transclude function to child directives', function() {
			node = createNode(
				'Welcome, this content has been ' +
				'rewrapped with success! =)'
			);

			renderer.register('div', function() {
				return {
					transclude: true,
					template: '<wrap>' +
						'<span transclude></span>' +
					'</wrap>'
				}
			});
			renderer.register('transclude', function() {
				return {
					link: function(scope, el, attrs, ctrls, transclude) {
						transclude(function(clone) {
							el.appendChild(clone);
						});
					}
				}
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(node.outerHTML).toEqual(
				'<div><wrap><span transclude="">' +
				'Welcome, this content has been rewrapped ' +
				'with success! =)</span></wrap></div>'
			);

			renderer.clearRegistry();
		});

		xit('should transclude the entire directive element', function() {
			node = document.createElement('span');
			node.appendChild(createNode(
				'<div>' +
					'<div></div>' +
				'</div>'
			).appendChild(createNode()));

			renderer.register('div', function() {
				return {
					transclude: 'element',
					compile: function(el, attrs, $transclude) {
						return function(scope, el, attrs, ctrls, transclude) {
							transclude(function(clone) {
								el.parentNode.insertBefore(clone, el);
							});
						}
					}
				}
			});

			renderer.clearRegistry();
		});
	});
});