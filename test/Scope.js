describe('Scope', function() {
	var scope;

	beforeEach(function() {
		scope = new Scope();
	});

  describe('watch()', function() {
    it('should watch a property', function() {
      var listenerSpy = jasmine.createSpy();
      scope.watch('someProperty', listenerSpy);

      scope.someProperty = 'someValueHere';
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith('someValueHere', undefined);
    });

    it('should deep properties', function() {
      var watcherSpy = jasmine.createSpy();

      scope.watch('another.deep.property.here', watcherSpy);
      scope.deliverChangeRecords();

      scope.another.deep.property.here = 0;
      scope.deliverChangeRecords();

      expect(watcherSpy).toHaveBeenCalledWith(0, undefined);

      scope.another.deep.property.here += 1;
      scope.deliverChangeRecords();

      expect(watcherSpy).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('clone()', function() {
    it('should create a child scope', function() {
      var child = scope.clone();

      expect(child.parentScope).toBe(scope);
    });
  });
});
