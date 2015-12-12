describe('Observer', function() {
	var object,
			observer,
			listenerSpy;

	beforeEach(function() {
		object = {};
		observer = new Observer(object);
		listenerSpy = jasmine.createSpy();
	});

	describe('watch()', function() {
		it('should watch object property', function() {
			observer.watch('hereIsSomeProperty', listenerSpy);

			object.hereIsSomeProperty = 0;
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(0, undefined);

			for(var i = 1; i < 10; i++) {
				object.hereIsSomeProperty = i;
				observer.deliverChangeRecords();

				expect(listenerSpy).toHaveBeenCalledWith(i, i - 1);
			}
		});

		it('should detect array indexes changes', function() {
			object.array = [
				[undefined, 0]
			];

			observer.watch('array.0.1', listenerSpy);
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(0, undefined);

			object.array[0][1]++;
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(1, 0);
		});
	});

	describe('deliverChangeRecords()', function() {
		it('should detect deep changes on properties', function() {
			observer.watch('detect.somePropertyChanges', listenerSpy);

			object.detect = {
				somePropertyChanges: 1
			};
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(1, undefined);

			object.detect.somePropertyChanges++;
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith(2, 1);

			object.detect = {
				somePropertyChanges: {
					heyBuddy: {
						howAreYou: 'I am fine!'
					}
				}
			};
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith({
				heyBuddy: {
					howAreYou: 'I am fine!'
				}
			}, 2);
		});

		it('should detect collection changes', function() {
			observer.watch('myCollection', listenerSpy);

			object.myCollection = {};
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith({}, undefined);

			object.myCollection.youGotSomePropertyNow = 1;
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith({youGotSomePropertyNow: 1}, {});
		});

		it('should only call listeners when changes occur', function() {
			object.array = [1,2,3,4];
			observer.watch('array', listenerSpy);
			observer.deliverChangeRecords();

			expect(listenerSpy).toHaveBeenCalledWith([1,2,3,4], undefined);

			observer.deliverChangeRecords();

			expect(listenerSpy).not.toHaveBeenCalledWith([1,2,3,4], [1,2,3,4]);
		});
	});
});
