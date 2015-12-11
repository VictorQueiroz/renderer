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

  describe('destroy()', function() {
    var scope,
        childScope;

    beforeEach(function() {
      scope = new Scope();
      childScope = scope.clone();
    });

    it('should destroy a scope and eliminate all the records of the scope on its parents', function() {
      for(var i = 0; i < 10; i++) {
        scope.clone();
      }

      expect(scope.childScopes.length).toBe(11);
      expect(scope.childScopes[0]).toBe(childScope);

      childScope.destroy();

      expect(scope.childScopes.length).toBe(10);

      for(var i = 0; i < scope.childScopes.length; i++) {
        expect(scope.childScopes[i]).not.toBe(childScope);
      }
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
