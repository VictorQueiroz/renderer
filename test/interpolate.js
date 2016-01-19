describe('interpolate()', function() {
  var interpolateFn;

  it('should return undefined if no interpolation is found', function() {
    interpolateFn = interpolate('some text');

    expect(interpolateFn).toBe(undefined);
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
