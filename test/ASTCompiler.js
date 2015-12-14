describe('ASTCompiler', function() {
	var lexer,
			ast,
			astCompiler,
			obj;

	beforeEach(function() {
		lexer = new Lexer(),
		ast = new AST(lexer),
		obj = {},
		astCompiler = new ASTCompiler(ast);
	});

	describe('AssignmentExpression', function() {
		it('should assign an object', function() {
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

	describe('UnaryExpression', function() {
		it('should compare literals', function() {
			expect(astCompiler.compile('1 > +2')(obj)).toBeFalsy();
			expect(astCompiler.compile('1 < +2')(obj)).toBeTruthy();
			expect(astCompiler.compile('+1 === +1')(obj)).toBeTruthy();
			expect(astCompiler.compile('(+1 === +1) && (+1 < +2)')(obj)).toBeTruthy();
		});
	});

	describe('BinaryExpression', function() {
		it('should sum literals', function() {
			expect(astCompiler.compile('1 + 2')(obj)).toEqual(3);
		});

		it('should sum variables', function(){
			obj.v = 1;
			obj.f = 2;
			obj.e = 4;

			expect(astCompiler.compile('v + f + e')(obj)).toEqual(obj.v + obj.f + obj.e);
		});

		it('should multiply variables', function(){
			obj.v = 1;
			obj.f = 2;
			obj.e = 4;

			expect(astCompiler.compile('v + f + e')(obj)).toEqual(obj.v + obj.f + obj.e);
		});

		it('should multiply literals', function() {
			expect(astCompiler.compile('1 * 2 * 4')(obj)).toEqual(1 * 4 * 2);
		});
	});

	describe('Bitwise operators', function() {
		var flags;

		beforeEach(function() {
			flags = {};

			for(var i = 1; i <= 32; i++) {
				flags['FLAG_' + i] = 1 << (i - 1)
			}

			obj.value = 0;
			obj.flags = flags;
		});

		it('should assign and remove a bitwise value to a context variable', function() {
			expect(obj.value).toEqual(0);

			var key;

			for(var i = 1; i <= 32; i++) {
				key = 'FLAG_' + i;

				expect(astCompiler.compile('value |= flags.FLAG_' + i)(obj)).toBe(0 | flags[key]);
				expect(astCompiler.compile('value ^= flags.FLAG_' + i)(obj)).toBe((0 | flags[key]) ^ flags[key]);
				expect(obj.value).toBe(0);
			}
		});

		it('should check if a value exists inside in a value', function() {
			expect(obj.value).toEqual(0);
			expect(astCompiler.compile('value & flags.FLAG_1')(obj)).toEqual(0);

			astCompiler.compile('value |= flags.FLAG_1')(obj);
			expect(astCompiler.compile('value & flags.FLAG_1')(obj)).toEqual(obj.flags.FLAG_1);
		});
	});
});
