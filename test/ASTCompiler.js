describe('ASTCompiler', function() {
	var lexer = new Lexer(),
			ast = new AST(lexer),
			astCompiler = new ASTCompiler(ast);

	it('should assign an object', function() {
		var obj = {}
		var fn = astCompiler.compile('a.b.c.d');

		fn.assign(obj);

		expect(obj).toEqual({
			a: {
				b: {
					c: {
						d: undefined
					}
				}
			}
		});
	});
});
