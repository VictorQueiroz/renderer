describe('Attributes', function() {
	var node = document.createElement('div'),
			attrs;

	beforeEach(function() {
		attrs = new Attributes(node);
	});

	it('should set an node attribute as kebabCase()', function(){
		attrs.$set('someCoolAttribute', 'here-we-get-some-value-haha');

		expect(attrs.someCoolAttribute).toEqual(
			'here-we-get-some-value-haha'
		);
		expect(node.getAttribute(kebabCase('someCoolAttribute'))).toEqual(
			'here-we-get-some-value-haha'
		);
	});

	it('should set an observer', function(done) {
		attrs.$set('someCoolAttribute', 'here-we-get-some-value-haha');

		var someCoolAttributeSpy = jasmine.createSpy();
		attrs.$observe('someCoolAttribute', someCoolAttributeSpy);

		expect(attrs.$$observers.someCoolAttribute.length).toBe(1);

		setTimeout(function() {
			expect(someCoolAttributeSpy).toHaveBeenCalledWith('here-we-get-some-value-haha');

			expect(attrs.$$observers.someCoolAttribute.$$called).toBe(1);

			var anotherSpy = jasmine.createSpy();
			attrs.$observe('someCoolAttribute', anotherSpy);

			setTimeout(function() {
				expect(anotherSpy).not.toHaveBeenCalled();

				setTimeout(done);
			});
		});
	});
});
