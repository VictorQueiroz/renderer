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

    it('should watch complex expressions', function() {
      scope.watch('isUserActive && callMeExpression() && users[index]', listenerSpy);
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith(undefined, undefined);

      scope.isUserActive = true;

      scope.callMeExpression = function() {
        return true;
      };

      scope.users = [ 'First user', 'Second user' ];
      scope.index = 0;
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith('First user', undefined);

      scope.index++;
      scope.deliverChangeRecords();

      expect(listenerSpy).toHaveBeenCalledWith('Second user', 'First user');
    });
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

  describe('apply()', function() {
    var listenerSpy;

    beforeEach(function() {
      listenerSpy = jasmine.createSpy();
    });

    it('should apply functions and execute a function before deliver changes', function() {
      scope.watch('property', listenerSpy);
      scope.apply(function() {
        expect(scope.phase).toEqual('apply');
      });

      expect(scope.phase).toEqual(null);
      expect(listenerSpy).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should not allow a phase to happen if another phase is happening already', function() {
      expect(function() {
        scope.apply(function() {
          scope.apply();
        });
      }).toThrow();
    });
  });

  describe('postDigest()', function() {
    it('should execute the post digest functions after finish the digest', function() {
      var postDigestSpy;

      for(var i = 0; i < 10; i++) {
        postDigestSpy = jasmine.createSpy();
        scope.postDigest(postDigestSpy);

        scope.apply();

        expect(postDigestSpy).toHaveBeenCalledWith();
      }
    });
  });
});
