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

		expect(registry.hasOwnProperty('appVersion')).toBeTruthy();
	});

	it('should get a directive', function() {
    registerTestDirective();

		var instances = renderer.getDirectives('appVersion');

		expect(instances.length).toBe(1);

		expect(renderer.getDirectives('appVersion')).toBe(instances);
	});

	it('should clear the registry', function() {
    registerTestDirective();

		expect(Object.keys(registry).length).toBe(2);

		renderer.clearRegistry();

		expect(Object.keys(registry).length).toBe(1);
	});
});
