describe('interpolate()', function() {
  var interpolateFn;

  it('should return the interpolation object when there are no bindings and textOnly is undefined', function() {
    interpolateFn = interpolate('some text');

    expect(interpolateFn.exp).toBe('some text');
    expect(interpolateFn.expressions).toEqual([]);
  });

  it('should match expressions between {{ and }}', function() {
    interpolateFn = interpolate('some text and {{ exp }}');

    expect(interpolateFn.expressions).toEqual(['exp']);
  });

  it('should compile expressions', function() {
    var locals = {expHere: fn};

    function fn () {
      return 'cool value';
    }

    interpolateFn = interpolate('some text and some {{ expHere() }}');

    expect(interpolateFn(locals)).toEqual('some text and some cool value');
  });

  it('should accept another interpolation symbols', function() {
    var interpolateFn = interpolate('interpolate this -> [[ value ]]', {startSymbol: '[[', endSymbol: ']]'}),
        value = '"value here"';

    expect(interpolateFn({value: value})).toEqual('interpolate this -> "value here"');
  });
});
