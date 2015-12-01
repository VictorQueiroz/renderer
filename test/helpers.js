describe('Helpers', function() {
	it('should translate to kebab case', function() {
		expect(kebabCase('rdSomeCoolDirectiveHere')).toEqual(
			'rd-some-cool-directive-here'
		);
	});
});
