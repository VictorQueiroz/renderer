describe('Observer', function() {
	var observer, object, changedPath;
	var assert = {
		equal: function(a, b) {
			return expect(a).toBe(b);
		}
	}

	it('should watch an simple object', function() {
		object = {};

		observer = new Observer(object);
		observer.on('changedProperty', function(path) {
			changedPath = path;
		});
		
		object.someObject = { 2000: 'someValue' };
		observer.deliverChangeRecords();

		assert.equal('someObject', changedPath);
	});

	it('should start to observe new object property added to the object', function(done) {
		var times = 0;

		object 		= {};
		observer 	= new Observer(object);
		observer.on('updated', function() {
			times++;
		});

		object.someObject = {};
		observer.deliverChangeRecords();

		assert.equal(1, times);

		object.someObject.anotherObject = {};
		observer.deliverChangeRecords();

		assert.equal(2, times);

		object.someObject.anotherObject.someKey = 100;
		observer.deliverChangeRecords();

		assert.equal(3, times);

		done();
	});

	it('should detect destroy of properties and keep waiting for them to be redefined', function(done) {
		var times = 0;

		object 		= {};
		observer 	= new Observer(object);

		observer.on('updated', function() {
			times++;
		});

		object.someObject = {
			objectOne: {
				objectTwo: {
					futureObject: 1000
				}
			}
		};

		setTimeout(function() {
			assert.equal(1, times);

			delete object.someObject.objectOne;

			setTimeout(function() {
				assert.equal(2, times);

				object.someObject.objectOne = { someValue: 1000 };

				setTimeout(function() {
					assert.equal(3, times);

					delete object.someObject;

					setTimeout(function() {
						assert.equal(4, times);

						object.someObject = {
							someValue: 1000,
							someSecondValue: 400
						};

						setTimeout(function() {
							assert.equal(5, times);

							done();
						});
					});
				});
			});
		});
	});

	it('should automatically watch a complex object', function(done) {
		var times = 0;

		object = {};

		observer = new Observer(object);
		observer.on('updated', function() {
			times++;
		});

		object.someObject = {someObjectValue: 1};

		setTimeout(function() {
			assert.equal(1, Object.keys(observer.childObservers).length);

			object.someObject.someObjectValue = {
				value: 200
			};
			
			setTimeout(function() {
				assert.equal(2, times);

				object.someObject.someObjectValue.someAnotherValue = 0;
				
				setTimeout(function() {
					assert.equal(3, times);

					object.someObject.someObjectValue.anotherValue = 0;

					setTimeout(function() {
						assert.equal(4, times);

						delete object.someObject.someObjectValue;

						setTimeout(function() {
							assert.equal(5, times);

							done();
						});
					});
				});
			});
		});
	});
});