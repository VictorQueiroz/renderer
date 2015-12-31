describe('renderer', function() {
  var registerTestDirective = function() {
    renderer.register('appVersion', function() {
      return {
        template: '{{ appVersion }}',
        scope: {},
        link: function (scope, element, attrs) {
          scope.appVersion = '1.0.0';
        }
      }
    });
  };

  afterEach(function() {
    renderer.clearRegistry();
  });

	it('should register a directive', function() {
		registerTestDirective();

		expect(directiveRegistry.hasOwnProperty('appVersion')).toBeTruthy();
	});

	it('should get a directive', function() {
    registerTestDirective();

		var instances = renderer.getDirectives('appVersion');

		expect(instances.length).toBe(1);

		expect(renderer.getDirectives('appVersion')).toBe(instances);
	});

	it('should clear the registry', function() {
    registerTestDirective();

		expect(Object.keys(directiveRegistry).length).toBe(2);

		renderer.clearRegistry();

		expect(Object.keys(directiveRegistry).length).toBe(1);
	});

  describe('bootstrap()', function() {
    var i,
        rootScope,
        rootElement,
        afterCompileSpy,
        beforeCompileSpy;

    afterEach(function() {
      for(i = 0; i < renderer.afterCompileQueue.length; i++) {
        renderer.afterCompileQueue.splice(i, 1);
      }

      for(i = 0; i < renderer.beforeCompileQueue.length; i++) {
        renderer.beforeCompileQueue.splice(i, 1);
      }

      for(i = 0; i < instances.length; i++) {
        instances.splice(i, 1);
      }
    });

    beforeEach(function() {
      afterCompileSpy = jasmine.createSpy();
      beforeCompileSpy = jasmine.createSpy();

      renderer.beforeCompile(function($rootScope, $rootElement) {
        rootScope = $rootScope;
        rootElement = $rootElement;
      });
    });

    it('should execute functions before/after compile on bootstrap', function() {
      renderer.beforeCompile(beforeCompileSpy);
      renderer.afterCompile(afterCompileSpy);

      renderer.bootstrap(document.createElement('div'));

      expect(beforeCompileSpy).toHaveBeenCalledWith(rootScope, rootElement);
      expect(afterCompileSpy).toHaveBeenCalledWith(rootScope, rootElement);
    });

    it('should put the arguments applied in bootstrap function in queue functions before/after bootstrap', function() {
      renderer.beforeCompile(beforeCompileSpy);

      renderer.bootstrap(document.createElement('div'), 1, 2, 3, 4);

      expect(beforeCompileSpy).toHaveBeenCalledWith(rootScope, document.createElement('div'), 1, 2, 3, 4);
    });

    it('should return the bootstrapped app instance', function() {
      var instance = renderer.bootstrap(document.createElement('div'));

      expect(instances.indexOf(instance)).toBe(0);
    });

    describe('destroy()', function() {
      var queueFunctionSpy;

      beforeEach(function(){
        queueFunctionSpy = jasmine.createSpy();
      });

      it('should remove the running instance of the bootstrapped application from instances list when the destroy()', function() {
        var instance = renderer.bootstrap(document.createElement('div'));

        expect(instances.indexOf(instance)).toBe(0);

        instance.destroy();

        expect(instances.indexOf(instance)).toBe(-1);
      });

      it('should execute the destroy queue when destroy a bootstrapped instance', function() {
        renderer.onDestroyRunningApp(queueFunctionSpy);

        var instance = renderer.bootstrap(document.createElement('div'));
        instance.destroy();

        expect(queueFunctionSpy).toHaveBeenCalledWith(instance);
      });
    });
  });
});
