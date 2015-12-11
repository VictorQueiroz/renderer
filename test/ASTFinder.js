describe('ASTFinder', function() {
  var ast,
      lexer,
      astFinder;

  beforeEach(function() {
    lexer = new Lexer();
    ast = new AST(lexer);
    astFinder = new ASTFinder(ast);
  });

  it('should find expressions in simple computed expressions', function() {
    expect(astFinder.find('a.b.c[d[e.f.g[h]]]')).toEqual([
      ['d'],
      ['e', 'f', 'g'],
      ['h']
    ]);

    expect(astFinder.find('isUserActive && callMeExpression() && users[index]') && astFinder.identifiers).toEqual([
      'isUserActive',
      'users',
      'index'
    ]);
  });
});
