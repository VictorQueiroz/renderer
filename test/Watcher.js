describe('Watcher', function() {
	var watcher;

	beforeEach(function() {
		watcher = new Watcher();
	});

	describe('watch()', function() {
		it('should watch a property', function() {
			var listenerSpy = jasmine.createSpy();

			watcher.watch('somePropertyHere', listenerSpy);
			watcher.deliverChangeRecords();

			watcher.somePropertyHere = [];
			watcher.deliverChangeRecords();
			expect(listenerSpy).toHaveBeenCalledWith([], undefined);

			watcher.somePropertyHere = null;
			watcher.deliverChangeRecords();
			expect(listenerSpy).toHaveBeenCalledWith(null, []);

			watcher.somePropertyHere = [];
			watcher.deliverChangeRecords();
			expect(listenerSpy).toHaveBeenCalledWith([], null);
		});
	});
});
