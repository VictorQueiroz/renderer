var createNode = function(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div;
};

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

  describe('transclude', function() {
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
        expect(node.innerHTML).toEqual('<!-- repeat -->');
      });
    });
  });

  describe('scan()', function() {
    var node,
        directives,
        attributes;

    beforeEach(function() {
      node = document.createElement('my-component'),
      directives = [],
      attributes = new Attributes();
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
