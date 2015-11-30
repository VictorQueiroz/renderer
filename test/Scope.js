describe('Scope', function() {
	var scope;

	beforeEach(function() {
		scope = new Scope();
	});

	describe('watchCollection()', function() {
		it('should watch a collection', function() {
			var collectionWatcherSpy = jasmine.createSpy();

			scope.$watchCollection('some.deep.object.you.should.watch', collectionWatcherSpy);

			var array = [];
			scope.some.deep.object.you.should.watch = array;
			array.push(1,2,3,4,5,6);

			scope.deliverChangeRecords();

			expect(collectionWatcherSpy).toHaveBeenCalledWith([1,2,3,4,5,6]);
		});

		it('should keep watching an object, even if the path get redefined', function() {
			var collectionWatcherSpy = jasmine.createSpy();
			var objectList = [];

			scope.hereIs = {
				someDeep: {
					objectList: objectList
				}
			};

			scope.$watchCollection('hereIs.someDeep.objectList', collectionWatcherSpy);
			objectList.push(1, 2, 3, 4);

			scope.deliverChangeRecords();

			expect(collectionWatcherSpy).toHaveBeenCalledWith([1,2,3,4]);

			scope.hereIs.someDeep.objectList = objectList = {};
			scope.deliverChangeRecords();

			expect(collectionWatcherSpy).toHaveBeenCalledWith({});

			objectList.somePropertyHere = 0;
			scope.deliverChangeRecords();

			expect(collectionWatcherSpy).toHaveBeenCalledWith({somePropertyHere: 0});

			objectList = objectList.someObjectHere = {};
			scope.deliverChangeRecords();

			expect(collectionWatcherSpy).toHaveBeenCalledWith({
				somePropertyHere: 0,
				someObjectHere: {}
			});

			objectList.hereIsMoreOneProperty = 1;
			scope.deliverChangeRecords();

			expect(collectionWatcherSpy).toHaveBeenCalledWith({
				somePropertyHere: 0,
				someObjectHere: {
					hereIsMoreOneProperty: 1
				}
			});
		});
	});

	describe('watchObject()', function() {
		it('should detect deep changes of properties', function() {
			var objectWatcherSpy = jasmine.createSpy();
			var array = [1,2,3,4,5];

			scope.here = {
				is: {
					some: {
						object: array
					}
				}
			};

			scope.watchObject('here.is.some.object', objectWatcherSpy);

			var n;

			for(var i = 0; i < 60; i++) {
				n = array.length + 1;

				array.push(n);
				scope.deliverChangeRecords();

				expect(objectWatcherSpy).toHaveBeenCalledWith('is.some.object.' + (array.length - 1));
				expect(objectWatcherSpy).toHaveBeenCalledWith('is.some.object.length');
			}
		});
	});

  describe('watch()', function() {
    it('should watch a property', function() {
      var listenerSpy = jasmine.createSpy();
      scope.$watch('someProperty', listenerSpy);

      scope.someProperty = 'someValueHere';
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith('someValueHere');
    });

    it('should deep properties', function() {
      var watcherSpy = jasmine.createSpy();

      scope.$watch('another.deep.property.here', watcherSpy);
      scope.deliverChangeRecords();

      expect(watcherSpy).toHaveBeenCalledWith(undefined);

      scope.another.deep.property.here = 0;
      scope.deliverChangeRecords();

      expect(watcherSpy).toHaveBeenCalledWith(0);

      scope.another.deep.property.here += 1;
      scope.deliverChangeRecords();

      expect(watcherSpy).toHaveBeenCalledWith(1);
    });
  });
});
