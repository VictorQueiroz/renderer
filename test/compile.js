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
        directives,
        attributes;

    beforeEach(function() {
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

      expect(compileSpy).toHaveBeenCalledWith(node, attributes);
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

        expect(postLinkSpy).toHaveBeenCalledWith(scope, node, attributes);
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
