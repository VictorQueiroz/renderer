describe('Directive', function() {
	var directive;

	it('should instantiate a directive', function() {
		expect(new Directive() instanceof Directive).toBeTruthy();
	});

	it('should have the directive name', function() {
		directive = new Directive('rendererDirective');

		expect(directive.name).toBe('rendererDirective');
	});
});