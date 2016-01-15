describe('interpolate()', function() {
  var interpolateFn;

  it('should return the interpolation object when there are no bindings and textOnly is undefined', function() {
    interpolateFn = interpolate('some text');

    expect(interpolateFn.exp).toBe('some text');
    expect(interpolateFn.expressions).toEqual([]);
  });
});
