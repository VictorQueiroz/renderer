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

	it('should compile a element twice without duplicating elements', function() {
		scope.counter = 0;

		node = createNode(
			'<span>{{ someValueHere }}. And ' +
			'the counter is {{counter}}</span>'
		);

		renderer.register('div', function() {
			return function(scope, el) {
				scope.someValueHere = 'This is some value!';
				el.appendChild(document.createElement('div'));

				scope.counter += 1;
			};
		});

		var link = renderer.compile(node);

		link(scope);

		scope.deliverChangeRecords();

		expect(node.outerHTML).toEqual(
			'<div><span>This is some value!. ' +
			'And the counter is 1</span><div>' +
			'</div></div>'
		);

		link(scope);

		scope.deliverChangeRecords();

		expect(node.outerHTML).toEqual(
			'<div><span>This is some value!. ' +
			'And the counter is 2</span><div>' +
			'</div></div>'
		);

		renderer.clearRegistry();
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

	describe('Scope', function() {
		it('should keep the scope until the end of the dom tree', function() {
			node = createNode('');

			var i = 0,
					scopeSpy = jasmine.createSpy(),
					lastNode = node;
			for(;i < 10; i++) {
				lastNode.appendChild(lastNode = document.createElement('div'));
			}

			renderer.register('div', function() {
				return {
					terminal: true,
					priority: 1000,
					link: function(scope, el) {
						scopeSpy(scope);
					}
				};
			});
			renderer.compile(node)(scope);

			expect(scopeSpy).toHaveBeenCalledWith(scope);

			renderer.clearRegistry();
		});

		it('should create a new child scope if asked', function() {
			var scopeSpy = jasmine.createSpy();

			node = createNode('');
			scope.someDeepProperty = {
				but: {
					shouldBeOnChildScope: 1
				}
			}

			renderer.register('div', function() {
				return {
					scope: true,
					link: function(scope) {
						expect(scope).not.toBe(scope.$parent);
						expect(scope instanceof scope.$parent.$$ChildScope).toBeTruthy();
						expect(scope.someDeepProperty.but.shouldBeOnChildScope).toEqual(1);

						scopeSpy(scope);
					}
				}
			});

			renderer.compile(node)(scope);

			expect(scopeSpy).toHaveBeenCalled();

			renderer.clearRegistry();
		});
	});

	describe('Restrict', function() {
		it('should render class defined directives', function() {
			var links = 0;

			node = createNode(
				'<div class="change-color-directive" change-color-directive></div>'
			);

			renderer.register('changeColorDirective', function() {
				return {
					restrict: 'C',
					link: function(scope, el) {
						el.style.backgroundColor = '#fff';
						links++;
					}
				};
			});

			renderer.compile(node)(scope);

			expect(links).toEqual(1);
			expect(node.outerHTML).toEqual(
				'<div><div class="change-color-directive" ' +
				'change-color-directive="" style="background-color: ' +
				'rgb(255, 255, 255);"></div></div>'
			);

			renderer.clearRegistry();
		});

		it('should render attribute defined directives', function() {
			var links = 0;

			node = createNode(
				'<div class="change-color-directive" change-color-directive></div>'
			);

			renderer.register('changeColorDirective', function() {
				return {
					restrict: 'A',
					link: function(scope, el) {
						el.style.backgroundColor = '#fff';
						links++;
					}
				};
			});

			renderer.compile(node)(scope);

			expect(links).toEqual(1);
			expect(node.outerHTML).toEqual(
				'<div><div class="change-color-directive" ' +
				'change-color-directive="" style="background-color: ' +
				'rgb(255, 255, 255);"></div></div>'
			);

			renderer.clearRegistry();
		});

		it('should render node name defined directives', function() {
			var links = 0;

			node = createNode(
				'<change-color-directive class="change-color-directive" change-color-directive></change-color-directive>'
			);

			renderer.register('changeColorDirective', function() {
				return {
					restrict: 'E',
					link: function(scope, el) {
						el.style.backgroundColor = '#fff';
						links++;
					}
				};
			});

			renderer.compile(node)(scope);

			expect(links).toEqual(1);
			expect(node.outerHTML).toEqual(
				'<div><change-color-directive class="change-color-directive"' +
				' change-color-directive="" style="background-color: rgb(255, ' +
				'255, 255);"></change-color-directive></div>'
			);

			renderer.clearRegistry();
		});
	});

	describe('Multi Element', function() {
		it('should get all the elements and put in a group', function() {
			node = createNode(
				'<div rd-show-start="shouldShowMe"></div>' +
				'<div>' +
					'<span>{{ counter }}</span>' +
				'</div>' +
				'<div rd-show-end></div>'
			);

			scope.counter = 0;
			scope.shouldShowMe = true;

			renderer.register('rdShow', function() {
				return {
					multiElement: true,
					link: function(scope, el, attrs) {
						var method;

						scope.$watch(attrs.rdShow, function(value) {
							method = value ? 'remove' : 'add';

							el.classList[method]('hide');
							scope.counter++;
						});
					}
				};
			});
			renderer.compile(node)(scope);

			expect(node.outerHTML).toEqual(
				'<div><div rd-show-start="shouldShowMe">' +
				'</div><div><span>1</span></div><div rd-' +
				'show-end=""></div></div>'
			);

			scope.shouldShowMe = false;
			scope.deliverChangeRecords();

			expect(node.outerHTML).toEqual(
				'<div><div rd-show-start="shouldShowMe" ' +
				'class="hide"></div><div class="hide">' +
				'<span>2</span></div><div rd-show-end="" ' +
				'class="hide"></div></div>'
			);

			renderer.clearRegistry();
		});
	});

	describe('Interpolation', function() {
		it('should compile interpolation on synchronous templated directives', function() {
			node = createNode(
				'<component></component>'
			);

			scope.name = 'Laurel';

			var linkSpy = jasmine.createSpy();
			renderer.register('component', function() {
				return {
					template: 'Hey, {{name}}!',
					link: linkSpy
				};
			});

			renderer.compile(node)(scope);

			expect(linkSpy).toHaveBeenCalled();
			expect(node.outerHTML).toEqual(
				'<div><component>' +
				'Hey, Laurel!' +
				'</component></div>'
			);

			renderer.clearRegistry();
		});

		it('should compile interpolated text', function() {
			node = createNode(
				'Hi! My name is, {{ user.name }}, and ' +
				'I\'m {{ user.age }}... What about you?'
			);

			extend(scope.user = {}, {
				name: 'John Cena',
				age: 29
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(node.outerHTML).toEqual(
				'<div>Hi! My name is, John Cena, and ' +
				'I\'m 29... What about you?</div>'
			);

			scope.user.age = 90;
			scope.user.name = 'Uncle Bill';
			scope.deliverChangeRecords();

			expect(node.outerHTML).toEqual(
				'<div>Hi! My name is, Uncle Bill, and ' +
				'I\'m 90... What about you?</div>'
			);
		});

		it('should interpolate node attributes', function() {
			node = createNode(
				'<span directive="{{ directiveValueHere }}"></span>'
			);

			renderer.compile(node)(scope);

			scope.directiveValueHere = 'some-value-here';
			scope.deliverChangeRecords();

			expect(node.outerHTML).toEqual(
				'<div><span directive="' +
				'some-value-here"></span></div>'
			);

			scope.directiveValueHere = 'i-just-changed-this-value';
			scope.deliverChangeRecords();

			expect(node.outerHTML).toEqual(
				'<div><span directive="' +
				'i-just-changed-this-value"></span></div>'
			);
		});
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

			renderer.clearRegistry();
		});
	});

	describe('Template', function() {
		it('should join an array defined template', function() {
			node = createNode(
				'<span>' +
					'Some content here' +
				'</span>'
			);

			renderer.register('span', function() {
				return {
					template: [
						'<div>',
							'This is some test content',
						'</div>'
					]
				};
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(node.outerHTML).toEqual(
				'<div><span><div>This is some test content' +
				'</div></span></div>'
			);

			renderer.clearRegistry();
		});
	});

	describe('Controller', function() {
		it('should instantiate a directive controller', function() {
			node = createNode(
				'<span></span>'
			);

			var divCtrl,
					ctrlSpy = jasmine.createSpy();

			function DivCtrl () {
				this.someValueHere = {};

				divCtrl = this;
			}

			renderer.register('div', function() {
				return {
					controller: DivCtrl,
					link: function(scope, el, attrs, divCtrl) {
						ctrlSpy(divCtrl);
					}
				}
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(divCtrl instanceof DivCtrl === true).toBeTruthy();
			expect(ctrlSpy).toHaveBeenCalledWith(divCtrl);

			renderer.clearRegistry();
		});

		it('should require parent controllers from different directives', function() {
			node = createNode(
				'<span></span>'
			);

			var divCtrl,
					spanSpy = jasmine.createSpy(),
					spanCtrl

			function DivCtrl () {
				if(!divCtrl) {
					divCtrl = this;
				}
			}

			renderer.register('div', function() {
				return {
					controller: DivCtrl,
					require: 'div'
				};
			});

			renderer.register('span', function() {
				return {
					require: '?^div',
					link: function(scope, el, attrs, divCtrl) {
						spanCtrl = divCtrl;
						spanSpy(spanCtrl);
					}
				}
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(spanSpy).toHaveBeenCalledWith(divCtrl);

			renderer.clearRegistry();
		});

		it('should require same element controllers', function() {
			node = createNode(
				'<span content></span>'
			);

			var spanSpy = jasmine.createSpy(),
					spanCtrl;

			function SpanCtrl() {
				spanCtrl = this;
			}

			renderer.register('span', function() {
				return {
					controller: SpanCtrl
				};
			});

			renderer.register('content', function() {
				return {
					require: '?span',
					link: function(scope, el, attr, spanCtrl) {
						spanSpy(spanCtrl);
					}
				};
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(spanSpy).toHaveBeenCalledWith(spanCtrl);
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

		it('should render specific transcluded slots', function() {
			node = createNode(
				'<special>' +
					'<title class="a b c d">' +
						'This is the title of the app!' +
					'</title>' +
					'<content>' +
						'We wrapped this content off, wow!' +
					'</content>' +
				'</special>'
			);

			renderer.register('special', function() {
				return {
					transclude: {
						title: 'titleSlot',
						content: 'contentSlot'
					},
					template: [
						'<div>',
							'<div transclude="titleSlot"></div>',
							'<div transclude="contentSlot"></div>',
						'</div>'
					]
				}
			});

			renderer.register('class', function() {
				return function(scope, el) {
					el.setAttribute('compiled', 'true');
				};
			});

			renderer.register('title', function() {
				return {
					transclude: 'element',

					/**
					 * The transclude responsible directive must ALWAYS
					 * have the higher priority, or you will find yorself
					 * trying to compile a comment generated by the transclusor
					 * in directives which should be executed in the transcluded
					 * node
					 */
					priority: 1000,
					link: function(scope, el, attrs, ctrls, transclude) {
						transclude(function(clone) {
							el.parentNode.insertBefore(clone, el.nextSibling);
						});
					}
				};
			});

			renderer.register('transclude', function() {
				return {
					link: function(scope, el, attrs, ctrls, transclude) {
						transclude(function(clone) {
							var i;

							for(i = 0; i < el.childNodes.length; i++) {
								el.removeChild(el.childNodes[i]);
							}

							el.appendChild(clone);
						}, null, attrs.transclude);
					}
				};
			});

			var compile = new Compile(node, directiveRegistry);
			compile.execute(scope);

			expect(node.outerHTML).toEqual(
				'<div><special><div><div transclude="titleSlot">' +
				'<!-- title: undefined --><title class="a b c d" ' +
				'compiled="true">This is the title of the app!</tit' +
				'le></div><div transclude="contentSlot"><content>We ' +
				'wrapped this content off, wow!</content></div></div' +
				'></special></div>'
			);

			renderer.clearRegistry();
		});
	});
});
