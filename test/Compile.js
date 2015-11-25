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

	describe('Priority', function() {
		it('should respect directive priority', function() {
			var LINK_1 = {},
					LINK_2 = {};

			var list   = [];

			renderer.register('firstMe', function() {
				return {
					priority: 100,
					link: function() {
						list.push(LINK_1);
					}
				};
			});

			renderer.register('thenMe', function() {
				return {
					priority: 90,
					link: function() {
						list.push(LINK_2);
					}
				};
			});

			node = createNode(
				'<div then-me first-me class="a b c d"></div>'
			);

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(list[0]).toBe(LINK_1);
			expect(list[1]).toBe(LINK_2);
		});
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

		it('should redefine the terminal priority of a node and keep the last ' +
			 'set of directives on the node until the transclude() function gets ' +
			 'executed', function() {
			node = createNode(
				'<div transclude-me another-directive-here>' +
					'<div transclude-me></div>' +
				'</div>'
			);

			renderer.register('anotherDirectiveHere', function() {
				return function(scope, el) {
					el.setAttribute('compiled', 'true');
				};
			});

			renderer.register('transcludeMe', function() {
				return {
					transclude: 'element',
					priority: 1000,
					terminal: true,
					compile: function(el, attrs, $transclude) {
						return function(scope, el, attrs, ctrls, transclude) {
							transclude(function(clone) {
								el.parentNode.insertBefore(clone, el.nextSibling);
							});
						}
					}
				}
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(node.outerHTML).toEqual(
				'<div><!-- transcludeMe:  --><div transclude-me="" ' +
				'another-directive-here="" compiled="true"><!-- transcludeMe:  -->' +
				'<div transclude-me=""></div></div></div>'
			);

			renderer.clearRegistry();
		});
	});
});