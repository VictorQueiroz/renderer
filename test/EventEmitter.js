describe('EventEmitter', function() {
	var em, listenerSpy;

	beforeEach(function() {
		em = new EventEmitter();
		listenerSpy = jasmine.createSpy();
	});

	it('should register event listeners', function() {
		em.on('change', listenerSpy);
		expect(Object.keys(em._events)).toEqual(['change']);
	});

	it('should emit events', function() {
		em.on('change', listenerSpy);

		for(var i = 10; i >= 0; i--) {
			em.emit('change', i);
			expect(listenerSpy).toHaveBeenCalledWith(i);
		}
	});
});