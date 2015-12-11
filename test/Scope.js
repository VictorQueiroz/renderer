describe('Scope', function() {
	var scope;

	beforeEach(function() {
		scope = new Scope();
	});

  describe('watch()', function() {
    var listenerSpy;

    beforeEach(function() {
      listenerSpy = jasmine.createSpy();
    });

    it('should watch a property', function() {
      scope.watch('someProperty', listenerSpy);

      scope.someProperty = 'someValueHere';
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith('someValueHere', undefined);
    });

    it('should deep properties', function() {
      scope.watch('another.deep.property.here', listenerSpy);
      scope.deliverChangeRecords();

      scope.another.deep.property.here = 0;
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith(0, undefined);

      scope.another.deep.property.here += 1;
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith(1, 0);
    });
  });

  describe('clone()', function() {
    it('should create a child scope', function() {
      var child = scope.clone();

      expect(child.parentScope).toBe(scope);
    });
  });

  describe('broadcast()', function() {
    var scope,
        listenerSpy,
        deepChildScope;

    beforeEach(function() {
      scope = new Scope(),
      listenerSpy = jasmine.createSpy(),
      deepChildScope = scope;

      for(var i = 0; i < 100; i++) {
        deepChildScope = deepChildScope.clone();
      }
    });

    it('should propagate events through the parents of a scope', function() {
      scope.on('update', listenerSpy);

      for(var i = 0; i < 10; i++) {
        deepChildScope.broadcast('update', i);
        expect(listenerSpy).toHaveBeenCalledWith(i);
      }
    });
  });
});
