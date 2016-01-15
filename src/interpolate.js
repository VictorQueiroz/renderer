function interpolate(text) {
  var expressions = [];

  return extend(function parse(scope) {
    return text;
  }, {
    expressions: expressions
  });
}
