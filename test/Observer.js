describe('Observer', function() {
	var object,
			observer;

	beforeEach(function() {
		object = {};
		observer = new Observer(object);
	});

	it('should watch properties', function() {
		var listenerSpy = jasmine.createSpy();

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
});

describe('DeepObserver', function() {
	var object,
			observer;

	beforeEach(function() {
		object = {};
		observer = new DeepObserver(object);
	});

	it('should watch deep objects forever', function() {
		var observerSpy = jasmine.createSpy();

		observer.on('pathChanged', observerSpy);

		object.a = 1;
		object.b = {};

		observer.deliverChangeRecords();

		object.b.a = 1;
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.a', 1, undefined);

		object.b.c = 2;
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.c', 2, undefined);

		object.b.c = 3;
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.c', 3, 2);

		object.b.d = {};
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.d', {}, undefined);

		object.b.d.a = 1;
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.d.a', 1, undefined);

		object.b.d.b = {};
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.d.b', {}, undefined);

		object.b.d.b.a = 1;
		observer.deliverChangeRecords();

		expect(observerSpy).toHaveBeenCalledWith('b.d.b.a', 1, undefined);

		expect(observer.childObservers.hasOwnProperty('b')).toBeTruthy();

		delete object.b;
		observer.deliverChangeRecords();

		expect(observer.childObservers.hasOwnProperty('b')).toBeFalsy();
	});
});
