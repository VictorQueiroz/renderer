describe('Scope', function() {
	var scope;

	beforeEach(function() {
		scope = new Scope();
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
