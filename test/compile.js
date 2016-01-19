function dom() {
  return toArray(arguments).join('');
}

function createNode () {
  var args = toArray(arguments),
      div = document.createElement('div'),
      content = new Array(args.length);

  for(var i = 0; i < args.length; i++) {
    content[i] = args[i];
  }

  div.innerHTML = content.join('');

  return div;
}

describe('compile()', function() {
  var node,
      clear,
      register,
      noop_directive;

  beforeEach(function() {
    noop_directive = function(i) {
      return function() {
        var name = 'noop_directive_' + i;

        return {name: name, compile: noop};
      };
    };

    register = function() {
      return renderer.register.apply(renderer, arguments);
    };
  });

  afterEach(function() {
    for(var name in registry) {
      if(name == '$$get' || typeof registry[name] == 'function') {
        continue;
      }

      delete registry[name];
    }
  });

  it('should compile only the directives with priority bellow "maxPriority"', function() {
    var scope = new Scope(),
        divSpy = jasmine.createSpy(),
        spyDirective1 = jasmine.createSpy(),
        spyDirective2 = jasmine.createSpy();

    node = createNode('<div do-not-compile-1 do-not-compile-2></div>');

    register('doNotCompile1', function() {
      return {
        compile: function() {
          return spyDirective1;
        },
        priority: 100
      };
    });

    register('doNotCompile2', function() {
      return {
        compile: function() {
          return spyDirective2;
        },
        priority: 100
      };
    });

    register('div', function() {
      return {
        compile: function() {
          return divSpy;
        },
        priority: 99
      };
    });

    compile(node, undefined, 100)(scope);

    expect(divSpy).toHaveBeenCalled();
    expect(spyDirective1).not.toHaveBeenCalled();
    expect(spyDirective2).not.toHaveBeenCalled();
  });

  describe('Controller', function() {
    var node,
        scope,
        controllerSpy;

    beforeEach(function() {
      scope = new Scope(),
      controllerSpy = jasmine.createSpy();
    });

    it('should instantiate a directive controller', function() {
      function DirectiveController(scope, element, attrs, transcludeFn) {
        controllerSpy();
      }

      DirectiveController.prototype = {
        constructor: DirectiveController
      };

      register('controller', function() {
        return {
          type: 'A',
          controller: DirectiveController
        };
      });

      node = createNode('<div controller></div>');

      compile(node)(scope);

      expect(controllerSpy).toHaveBeenCalled();
    });

    it('should import parent controllers through "require" directive option', function() {
      var dropdown,
          liSpy = jasmine.createSpy();

      function DropdownController() {
        dropdown = this;
      }

      node = createNode('<dropdown></dropdown>');

      register('dropdown', function() {
        return {
          template: '<li>Option</li>',
          controller: DropdownController
        };
      });

      register('li', function() {
        return {
          require: '?^dropdown',
          link: function(scope, element, attrs, dropdown) {
            liSpy(dropdown);
          }
        };
      });

      compile(node)(scope);

      expect(liSpy).toHaveBeenCalledWith(dropdown);
    });
  });

  describe('Type', function() {
    var node,
        scope = new Scope(),
        postLinkFn;

    beforeEach(function() {
      postLinkFn = jasmine.createSpy();
    });

    it('should match directives by attributes', function() {
      register('matchAttrDirective', function() {
        return {
          type: 'A',
          template: '<span>Compiled directive!</span>',
          compile: function() {
            return postLinkFn;
          }
        }
      });

      node = createNode(
        '<div match-attr-directive></div>',
        '<match-attr-directive></match-attr-directive>'
      );

      compile(node)(scope);

      expect(postLinkFn).toHaveBeenCalled();
      expect(node.innerHTML).toEqual(dom(
        '<div match-attr-directive="">',
          '<span>Compiled directive!</span>',
        '</div>',
        '<match-attr-directive></match-attr-directive>'
      ));
    });

    it('should match directives by classes', function() {
      register('dropdown', function() {
        return {
          type: 'C',
          compile: function() {
            return postLinkFn;
          }
        }
      });

      node = createNode(
        '<ul class="dropdown"></div>'
      );

      compile(node)(scope);

      expect(postLinkFn).toHaveBeenCalled();
    });
  });

  describe('data()', function() {
    var node;

    beforeEach(function() {
      if(node) clearData(node);
      node = createNode('');
    });

    it('should append data to a node element', function() {
      var appCtrl = noop;

      data(node, '$appCtrl', appCtrl)

      expect(data(node, '$appCtrl')).toBe(appCtrl);
    });

    it('should return the entire element cache', function() {
      var appCtrl = noop;
      data(node, '$appCtrl', appCtrl);

      expect(data(node)).toEqual({$appCtrl: appCtrl});
    });
  });

  describe('addDirective()', function() {
    var directives;

    beforeEach(function() {
      directives = [];
    });

    it('should add a directive with a maximum priority limit', function() {
      function postLinkFn () {}

      register('repeat', function() {
        return {priority: 1000, compile: noop};
      });

      register('repeat', function() {
        return {
          priority: 400,
          compile: function() {
            return postLinkFn;
          }
        };
      });

      addDirective('repeat', 'A', directives, 1000);

      expect(directives[0].compile()).toBe(postLinkFn);
    });

    it('should add a specific type of directive', function() {
      function postLinkFn () {}

      register('usersList', function() {
        return {compile: noop, type: 'A'};
      });

      register('usersList', function() {
        return {compile: function() { return postLinkFn; }, type: 'E'};
      });

      addDirective('usersList', 'A', directives);

      expect(directives.length).toBe(1);
      expect(directives[0].name).toBe('usersList');
      expect(directives[0].compile).toBe(noop);

      addDirective('usersList', 'E', directives);

      expect(directives.length).toBe(2);
      expect(directives[1].name).toBe('usersList');
      expect(directives[1].compile()).toBe(postLinkFn);
    });
  });

  describe('transcludeFn()', function() {
    var scope;

    beforeEach(function() {
      scope = new Scope();
    });

    it('should inherit a transclude function from the actual node or a parent one', function() {
      node = createNode('<transclude><span></span><div></div></transclude>');

      register('transclude', function() {
        return {
          transclude: true,
          template: '<transclude-me><wrap-me></wrap-me></transclude-me>'
        };
      });

      register('transcludeMe', function() {
        return {
          transclude: true,
          template: '<wrap-me></wrap-me>'
        };
      });

      register('wrapMe', function() {
        return {
          link: function(scope, element, attrs, ctrl, transclude) {
            transclude(function cloneAttachFn (clones) {
              var fragment = document.createDocumentFragment();

              for(var i = 0; i < clones.length; i++) {
                fragment.appendChild(clones[i]);
              }

              element.appendChild(fragment);
            });
          }
        };
      });

      compile(node)(scope);

      expect(node.innerHTML).toEqual(dom(
        '<transclude>',
          '<transclude-me>',
            '<wrap-me>',
              '<wrap-me>',
                '<span></span>',
                '<div></div>',
              '</wrap-me>',
            '</wrap-me>',
          '</transclude-me>',
        '</transclude>'
      ));
    });

    describe('content', function() {
      var childNodes,
          postLinkSpy,

          node,
          scope = new Scope();

      beforeEach(function() {
        node = document.createElement('transclude-directive');

        for(var i = 0; i < 4; i++) {
          node.appendChild(document.createElement('button'));
        }

        childNodes = [];
        childNodes.push(node);

        postLinkSpy = jasmine.createSpy();
      });

      it('should carry a transclude function to the child node links if a parent generate one', function() {
        register('transcludeDirective', function() {
          return {
            template: '<transclude-content></transclude-content>',
            transclude: true
          };
        });

        register('transcludeContent', function() {
          return {
            compile: function(element, attrs, transclude) {
              expect(typeof transclude).toBe('function');

              return function(scope, element, attrs, ctrl, transclude) {
                expect(typeof transclude).toBe('function');
                expect(transclude.name).toBe('scopeBoundTranscludeFn');

                postLinkSpy();
              };
            }
          };
        });

        compileNodes(childNodes)(scope, childNodes);

        expect(postLinkSpy).toHaveBeenCalled();
      });

      it('should compile all the contents directives properly', function() {
        var buttonCompileSpy = jasmine.createSpy(),
            buttonPreSpy = jasmine.createSpy(),
            buttonPostSpy = jasmine.createSpy();

        register('transcludeDirective', function() {
          return {
            template: '<transclude-content></transclude-content>',
            transclude: true
          };
        });

        register('transcludeContent', function() {
          return {
            link: function(scope, element, attrs, ctrl, transclude) {
              transclude(function(clones) {
                var fragment = document.createDocumentFragment();

                for(var i = 0; i < clones.length; i++) {
                  fragment.appendChild(clones[i]);
                }

                element.appendChild(fragment);
              });
            }
          };
        });

        register('button', function() {
          var i = 0;

          return {
            template: 'Testing button ',
            compile: function(element) {
              buttonCompileSpy();

              element.innerHTML += i++;

              return {pre: buttonPreSpy, post: buttonPostSpy};
            }
          };
        });

        compileNodes(childNodes)(scope, childNodes);

        expect(node.outerHTML).toEqual(
          '<transclude-directive>' +
            '<transclude-content>' +
              '<button>Testing button 0</button>' +
              '<button>Testing button 1</button>' +
              '<button>Testing button 2</button>' +
              '<button>Testing button 3</button>' +
            '</transclude-content>' +
          '</transclude-directive>'
        );
        expect(buttonCompileSpy).toHaveBeenCalled();
        expect(buttonPreSpy).toHaveBeenCalled();
        expect(buttonPostSpy).toHaveBeenCalled();
      });

      it('should transclude slots based on the element tag name', function() {
        register('ndTransclude', function() {
          return function(scope, element, attrs, ctrl, transclude) {
            transclude(appendCloneNodeFn, attrs.ndTransclude);

            function appendCloneNodeFn(clones) {
              var fragment = document.createDocumentFragment();

              for(var i = 0; i < clones.length; i++) {
                fragment.appendChild(clones[i]);
              }

              element.appendChild(fragment);
            }
          };
        });

        var titlePostLinkFn = jasmine.createSpy(),
            contentPostLinkFn = jasmine.createSpy();

        forEach({
          'title': titlePostLinkFn,
          'content': contentPostLinkFn
        }, function(fn, name) {
          register(name, function() {
            return {
              type: 'EAC',
              compile: function() {
                return fn;
              }
            }
          });
        });

        register('widget', function() {
          return {
            template: dom(
              '<div class="widget-title" nd-transclude="titleSlot"></div>',
              '<div class="widget-body" nd-transclude="contentSlot"></div>'
            ),
            transclude: {
              title: 'titleSlot',
              content: 'contentSlot'
            }
          };
        });

        node = createNode(
          '<div>',
            '<widget>',
              '<title>Last posts</title>',
              '<content>',
                'Here we have the widget content.',
              '</content>',
            '</widget>',
          '</div>'
        );

        compile(node)(scope);

        expect(node.querySelector('widget').outerHTML).toEqual(dom(
          '<widget>',
            '<div class="widget-title" nd-transclude="titleSlot">',
              '<title>Last posts</title>',
            '</div>',
            '<div class="widget-body" nd-transclude="contentSlot">',
              '<content>',
                'Here we have the widget content.',
              '</content>',
            '</div>',
          '</widget>'
        ));

        expect(titlePostLinkFn).toHaveBeenCalled();
        expect(contentPostLinkFn).toHaveBeenCalled();
      });
    });

    describe('element', function() {
      var node,
          scope = new Scope(),
          postLinkSpy;

      beforeEach(function() {
        postLinkSpy = jasmine.createSpy('postLinkSpy');
      });

      it('should replace the element with a comment', function() {
        node = createNode('<repeat></repeat>');

        register('repeat', function() {
          return {
            transclude: 'element',
            priority: 1000,
            terminal: true,
            compile: function() {
              return postLinkSpy;
            }
          };
        });

        compile(node)(scope);

        expect(postLinkSpy).toHaveBeenCalled();
        expect(node.innerHTML).toEqual('<!-- repeat: undefined -->');
      });

      it('should only compile other directives when transcludeFn() function gets executed', function() {
        node = createNode(
          '<div nd-class="some-class-here" repeat>',
            '<div repeat length="4"></div>',
          '</div>'
        );

        register('repeat', function() {
          return {
            transclude: 'element',
            priority: 1000,
            terminal: true,
            type: 'A',
            link: function(scope, element, attrs, ctrl, transclude) {
              var j = 0,
                  length = parseInt(attrs.length || 1);

              for(var i = 0; i < length; i++) {
                transclude(function(clones) {
                  var fragment = document.createDocumentFragment();

                  for(var i = 0; i < clones.length; i++) {
                    if(clones[i].nodeType == Node.ELEMENT_NODE) {
                      clones[i].setAttribute('length', j++);
                    }

                    fragment.appendChild(clones[i]);
                  }

                  element.parentNode.insertBefore(fragment, element.nextSibling);
                });
              }
            }
          };
        });

        register('ndClass', function() {
          return {
            link: function(scope, element, attrs) {
              element.classList.add(attrs.ndClass);
            }
          };
        });

        compile(node)(scope);

        expect(node.innerHTML).toEqual(dom(
          '<!-- repeat:  -->',
          '<div nd-class="some-class-here" repeat="" length="0" class="some-class-here">',
            '<!-- repeat:  -->',
            '<div repeat="" length="3"></div>',
            '<div repeat="" length="2"></div>',
            '<div repeat="" length="1"></div>',
            '<div repeat="" length="0"></div>',
          '</div>'
        ));
      });
    });
  });

  describe('scan()', function() {
    var node,
        scope,
        directives,
        attributes;

    beforeEach(function() {
      node = document.createElement('my-component'),
      scope = new Scope(),
      directives = [],
      attributes = new Attributes(node);
    });

    it('should match directives by the tag name', function() {
      for(var i = 0; i < 10; i++) {
        register('myComponent', noop_directive(i));
      }

      scan(node, directives, attributes);

      for(var i = 0; i < 10; i++) {
        expect(directives[i].name).toEqual('noop_directive_' + i);
        expect(directives[i].compile).toEqual(noop);
      }
    });

    it('should store the node attributes in the "attributes" argument', function() {
      node.setAttribute('component-data', '{ users: appCtrl.users }');

      scan(node, directives, attributes);

      expect(attributes.componentData).toBe('{ users: appCtrl.users }');
    });

    it('should sort directives by priority', function() {
      var $register = function(priority) {
        register('myComponent', function() {
          return {priority: priority, compile: noop};
        });
      };

      for(var i = 0; i < 10; i++) {
        $register(i);
      }

      scan(node, directives, attributes);

      for(var i = directives.length - 1, j = 0; i >= 0; i--) {
        expect(directives[j++].priority).toBe(i);
      }
    });

    it('should get directives bellow the maximum priority allowed if one is defined', function() {
      var normalLinkSpy = jasmine.createSpy('normal'),
          priorityLinkSpy = jasmine.createSpy('priority');

      register('myComponent', function() {
        return {
          link: priorityLinkSpy
        };
      });

      register('myComponent', function() {
        return {
          priority: 100,
          link: normalLinkSpy
        };
      });

      register('myComponent', function() {
        return {
          link: normalLinkSpy,
          priority: 100
        };
      });

      scan(node, directives, attributes, 100);

      expect(directives.length).toBe(1);

      directives[0].link();
      expect(priorityLinkSpy).toHaveBeenCalled();
      expect(normalLinkSpy).not.toHaveBeenCalled();
    });

    it('should match multi element directives', function() {
      register('component', function() {
        return {
          multiElement: true
        };
      });

      node = createNode('<div component-start="attribute value here"></div><div component-end></div>').childNodes[0];

      scan(node, directives, attributes, undefined);

      expect(attributes.component).toBe('attribute value here');
      expect(directives[0].multiElement).toEqual(true);
      expect(directives[0]).toEqual({
        $$start: 'component-start',
        $$end: 'component-end'
      });
    });

    it('should ignore attributes with no expressions to be interpolated', function() {
      scan(node, directives, attributes);
      expect(directives.length).toBe(0);
    });

    it('should add directive for interpolated attributes', function() {
      node.setAttribute('data-name', '{{ user.name }}');
      scan(node, directives, attributes);
      expect(directives.length).toBe(1);

      scope.user = {name: 'John Cena'};

      apply(directives, node, attributes)(scope);
      expect(node.getAttribute('data-name')).toEqual('John Cena');
    });

    it('should resolve interpolated attributes at priority "100" before the post linking', function() {
      var postLinkSpy = jasmine.createSpy();

      node.setAttribute('name', '{{ user.name }}');
      scope.user = { name: 'Patrick Random' };

      directives.unshift({
        priority: 200,
        compile: function(element, attrs) {
          return {
            pre: function(scope, element, attrs) {
              expect(attrs.name).toEqual('{{ user.name }}');
            },

            post: postLinkSpy
          };
        }
      });

      directives.push({
        compile: function() {
          return {
            pre: function(scope, element, attrs) {
              expect(attrs.name).toEqual('Patrick Random');
            },

            post: function(scope, element, attrs) {
              expect(attrs.name).toEqual('Patrick Random');
            }
          };
        },
        priority: 0
      });

      scan(node, directives, attributes);
      expect(directives[1].priority).toBe(100);

      apply(directives, node, attributes)(scope);
      expect(postLinkSpy).toHaveBeenCalled();
    });

    it('should add directive for text type nodes', function() {
      var textNode = document.createTextNode('Wrap my value {{value}}');

      node = createNode('');
      node.appendChild(textNode);
      node.appendChild(document.createElement('span'));

      scope.value = '"here" ';

      scan(textNode, directives, attributes);
      apply(directives, textNode, attributes)(scope, textNode);

      expect(node.innerHTML).toEqual(
        'Wrap my value "here" <span></span>'
      );
    });
  });

  describe('compileNodes()' ,function() {
    var node,
        scope;

    beforeEach(function() {
      node = createNode(''),
      scope = new Scope();

      for(var i = 0; i < 20; i++) {
        node.appendChild(document.createElement('my-single-component'));
      }
    });

    it('should return "null" if no directives is found', function() {
      expect(compileNodes(node.childNodes)).toBeNull();

      register('mySingleComponent', noop_directive);
      expect(compileNodes(node.childNodes).name).toBe('compositeLinkFn');
    });

    it('should execute all the node list node linking functions', function() {
      var postLinkSpy = jasmine.createSpy(),
          preLinkSpy = jasmine.createSpy();

      register('mySingleComponent', function() {
        return {
          compile: function(element) {
            element.setAttribute('compiled', 'true');

            return {pre: preLinkSpy, post: postLinkSpy};
          }
        }
      });

      compileNodes(node.childNodes)(scope, node.childNodes);

      var nodes = node.querySelectorAll('my-single-component');

      for(var i = 0; i < nodes.length; i++) {
        expect(nodes[i].getAttribute('compiled')).toEqual('true');
      }

      expect(preLinkSpy).toHaveBeenCalled();
      expect(postLinkSpy).toHaveBeenCalled();
    });

    it('should compile elements added at "compile" time normally', function() {
      var postLinkSpy = jasmine.createSpy();

      register('mySingleComponent', function() {
        return {
          compile: function(element) {
            element.parentNode.insertBefore(document.createElement('div'), element.nextSibling);

            return postLinkSpy;
          }
        }
      });

      register('div', function() {
        return {
          link: function(scope, element) {
            element.setAttribute('div-compiled', 'true');
          }
        };
      });

      compileNodes(node.childNodes)(scope, node.childNodes);

      var nodes = node.querySelectorAll('my-single-component');

      for(var i = 0; i < nodes.length; i++) {
        expect(nodes[i].nextSibling.getAttribute('div-compiled')).toEqual('true');
      }

      expect(postLinkSpy).toHaveBeenCalled();
    });
  });

  describe('groupScan()', function() {
    var node;

    it('should throw an error if a non closed directive group is found', function() {
      node = createNode(
        '<div></div>',
        '<div directive-start></div>',
        '<div>'
      );

      expect(function() { groupScan(node.childNodes[1], 'directive-start', 'directive-end'); }).toThrow();
    });

    it('should get the entire group of elements from the "start" to the "end"', function() {
      node = createNode(
        '<div attr-start></div>',
        '<div></div>',
        '<div attr-end></div>'
      );

      var nodes = node.childNodes;
      expect(groupScan(nodes[0], 'attr-start', 'attr-end')).toEqual([
        nodes[0],
        nodes[1],
        nodes[2]
      ]);
    });
  });

  describe('apply()', function() {
    var node,
        scope,
        directives,
        attributes;

    beforeEach(function() {
      scope = new Scope(),
      directives = [],
      attributes = new Attributes();
    });

    it('should execute the compile function', function() {
      var compileSpy = jasmine.createSpy();
      register('div', function() {
        return {compile: compileSpy};
      });

      node = createNode();
      scan(node, directives);
      apply(directives, node, attributes);

      expect(compileSpy).toHaveBeenCalledWith(node, attributes, undefined);
    });

    it('should not compile directives with priority bellow terminal priority defined by a "terminal" directive', function() {
      node = createNode('<div><special-directive></special-directive></div>');

      var specialDirectiveSpy = jasmine.createSpy('specialDirective'),
          terminalCompileSpy = jasmine.createSpy('divTerminal'),
          compileSpy = jasmine.createSpy('normalCompile');

      register('specialDirective', function() { return {compile: specialDirectiveSpy} });
      register('div', function() { return {priority: 1000, terminal: true, compile: terminalCompileSpy}; });
      register('div', function() { return {priority: 999, compile: compileSpy}; });

      compileNodes(node.childNodes)(scope, node.childNodes);

      expect(compileSpy).not.toHaveBeenCalled();
      expect(terminalCompileSpy).toHaveBeenCalled();
      expect(specialDirectiveSpy).not.toHaveBeenCalled();
    });

    var postLinkSpy;

    it('should compile multi element directives', function() {
      postLinkSpy = jasmine.createSpy();

      node = createNode(
        '<div component-start></div>',
        '<div></div>',
        '<div component-end></div>'
      );

      for(var i = 0; i < 8; i++) {
        node.appendChild(document.createElement('div'));
      }

      node = node.childNodes[0];

      register('component', function() {
        return {
          multiElement: true,
          compile: function() {
            return function(scope, element) {
              postLinkSpy(element);
            };
          }
        }
      });

      scan(node, directives, attributes, undefined);

      apply(directives, node, attributes)(scope, node);

      var lastElement = node,
          groupElements = [];

      for(var depth = 0; depth < 3; depth++) {
        groupElements[depth] = lastElement;
        lastElement = lastElement.nextSibling;
      }

      expect(postLinkSpy).toHaveBeenCalledWith(groupElements);
      expect(groupElements).toEqual(groupScan(node, 'component-start', 'component-end'));
    });

    describe('nodeLinkFn()', function() {
      var node,
          scope,
          preLinkSpy,
          nodeLinkFn,
          postLinkSpy,
          childLinkFn;

      beforeEach(function() {
        node = createNode('<div></div>'),
        scope = new Scope(),
        directives = [],
        preLinkSpy = jasmine.createSpy(),
        postLinkSpy = jasmine.createSpy();

        register('div', function() {
          return {compile: function() {
            return {
              post: postLinkSpy,
              pre: preLinkSpy
            }
          }};
        });

        childLinkFn = jasmine.createSpy();
      });

      it('should execute all the post/pre linking functions', function() {
        scan(node, directives);

        nodeLinkFn = apply(directives, node, attributes);
        nodeLinkFn(scope, node);

        expect(postLinkSpy).toHaveBeenCalled();
      });

      it('should execute a child link function if provide one', function() {
        scan(node, directives);

        nodeLinkFn = apply(directives, node, attributes);
        nodeLinkFn(scope, node, childLinkFn);

        expect(childLinkFn).toHaveBeenCalled();
      });
    });
  });
});
