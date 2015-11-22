describe('renderer', function() {
	it('should register a directive', function() {
		renderer.register('appVersion', function() {
			return {
				template: '{{ appVersion }}',
				scope: {},
				link: function (scope, element, attrs) {
					scope.appVersion = '1.0.0';
				}
			}
		});

		expect(directiveRegistry.hasOwnProperty('appVersion')).toBeTruthy();
	});

	it('should get a directive', function() {
		var instances = renderer.getDirectives('appVersion');

		expect(instances.length).toBe(1);

		expect(renderer.getDirectives('appVersion')).toBe(instances);
	});

	it('should clear the registry', function() {
		expect(Object.keys(directiveRegistry).length).toBe(1);

		renderer.clearRegistry();

		expect(Object.keys(directiveRegistry).length).toBe(0);
	});
});