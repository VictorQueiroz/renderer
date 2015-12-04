describe('Watcher', function() {
	var watcher;

	beforeEach(function() {
		watcher = new Watcher();
	});

	describe('watch()', function() {
		it('should watch a property', function() {
			var listenerSpy = jasmine.createSpy();

			watcher.$watch('somePropertyHere', listenerSpy);
			watcher.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(undefined);

			watcher.somePropertyHere = [];
			watcher.deliverChangeRecords();
			expect(listenerSpy).toHaveBeenCalledWith([]);

			watcher.somePropertyHere = null;
			watcher.deliverChangeRecords();
			expect(listenerSpy).toHaveBeenCalledWith(null);

			watcher.somePropertyHere = [];
			watcher.deliverChangeRecords();
			expect(listenerSpy).toHaveBeenCalledWith([]);
		});
	});

	describe('$watchCollection()', function() {
		it('should watch an object', function() {
			var listenerSpy = jasmine.createSpy();

			watcher.someDeep = {
				objectRightHere: null
			};
			watcher.deliverChangeRecords();

			watcher.$watchCollection('someDeep.objectRightHere', listenerSpy);
			watcher.deliverChangeRecords();

			watcher.someDeep.objectRightHere = {};
			watcher.deliverChangeRecords();

			watcher.someDeep.objectRightHere = {
				someChangeHere: {}
			};
			watcher.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith({});
			expect(listenerSpy).toHaveBeenCalledWith({
				someChangeHere: {}
			});

			watcher.someDeep = {
				objectRightHere: null
			};
			watcher.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(null);

			watcher.someDeep.objectRightHere = {somethingChanged: 1};
			watcher.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith({
				somethingChanged: 1
			});
		});
	});
});
